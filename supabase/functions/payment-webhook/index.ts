import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// CinetPay webhook handler.
// CinetPay sends a POST to notify_url with transaction status.
// We verify the transaction by calling CinetPay's status check API,
// then update the database. This is the ONLY way a transaction becomes 'succeeded'.
// Browser redirects are NEVER trusted as proof of payment.

export default async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { transaction_id, status, payment_method } = body;

    if (!transaction_id) {
      return jsonResponse({ error: "Missing transaction_id" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Fetch the transaction (by reference) — idempotency check
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .select("id, reference, status, amount_fcfa, purpose, purpose_id, user_id")
      .eq("reference", transaction_id)
      .maybeSingle();

    if (txErr || !tx) {
      return jsonResponse({ error: "Transaction not found" }, 404);
    }

    // Idempotency: if already succeeded, don't process again
    if (tx.status === "succeeded") {
      return jsonResponse({ success: true, message: "Already processed" });
    }

    // Verify with CinetPay API (NEVER trust the webhook payload alone)
    const apiKey = Deno.env.get("CINETPAY_API_KEY");
    const siteId = Deno.env.get("CINETPAY_SITE_ID");

    if (!apiKey || !siteId) {
      console.error("CinetPay credentials not configured for webhook verification");
      return jsonResponse({ error: "Payment provider not configured" }, 500);
    }

    // CinetPay status check: POST https://api-checkout.cinetpay.com/v2/payment/check
    const statusResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transaction_id,
      }),
    });

    if (!statusResponse.ok) {
      console.error("CinetPay status check failed:", await statusResponse.text());
      return jsonResponse({ error: "Status verification failed" }, 502);
    }

    const statusData = await statusResponse.json();
    const verifiedStatus = statusData.data?.status || statusData.status;
    const verifiedAmount = statusData.data?.amount || statusData.amount;
    const paymentMethod = statusData.data?.payment_method || statusData.payment_method || payment_method;

    // Verify amount matches (prevent amount manipulation attacks)
    if (verifiedAmount && Number(verifiedAmount) !== tx.amount_fcfa) {
      console.error(`Amount mismatch: expected ${tx.amount_fcfa}, got ${verifiedAmount}`);
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          failure_reason: "Amount mismatch",
          provider_response: statusData,
        })
        .eq("reference", transaction_id);

      return jsonResponse({ error: "Amount verification failed" }, 400);
    }

    // Map CinetPay status to our status
    // CinetPay statuses: "pending", "success", "failed", "cancelled", "refunded"
    let newStatus: string;
    switch (verifiedStatus) {
      case "success":
      case "succeeded":
        newStatus = "succeeded";
        break;
      case "failed":
        newStatus = "failed";
        break;
      case "cancelled":
        newStatus = "cancelled";
        break;
      case "refunded":
        newStatus = "refunded";
        break;
      default:
        newStatus = "processing";
    }

    // Update the transaction
    const { error: updateErr } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        provider_reference: statusData.data?.transaction_id || null,
        provider_response: statusData,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", transaction_id);

    if (updateErr) {
      console.error("Failed to update transaction:", updateErr);
      return jsonResponse({ error: "Database update failed" }, 500);
    }

    // If payment succeeded, activate the related resource
    if (newStatus === "succeeded") {
      if (tx.purpose === "subscription" && tx.purpose_id) {
        // Activate the merchant subscription
        const { data: sub, error: subErr } = await supabase
          .from("merchant_subscriptions")
          .select("id, plan_id, shop_id, merchant_id, amount_fcfa")
          .eq("id", tx.purpose_id)
          .maybeSingle();

        if (!subErr && sub) {
          // Fetch the plan to get duration
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("duration_hours, name, plan_type")
            .eq("id", sub.plan_id)
            .maybeSingle();

          const now = new Date();
          const expiresAt = plan
            ? new Date(now.getTime() + plan.duration_hours * 3600 * 1000)
            : new Date(now.getTime() + 24 * 3600 * 1000); // default 24h

          await supabase
            .from("merchant_subscriptions")
            .update({
              payment_status: "active",
              activated_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
              payment_reference: transaction_id,
            })
            .eq("id", sub.id);

          // Activate the shop
          await supabase
            .from("shops")
            .update({ is_active: true })
            .eq("id", sub.shop_id);
        }
      } else if (tx.purpose === "order" && tx.purpose_id) {
        // Confirm the order — this would update the order status
        // The order confirmation logic lives in the app's order management
        console.log(`Order ${tx.purpose_id} payment confirmed for transaction ${transaction_id}`);
      }
    }

    return jsonResponse({ success: true, status: newStatus });
  } catch (err) {
    console.error("Webhook error:", err);
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
};
