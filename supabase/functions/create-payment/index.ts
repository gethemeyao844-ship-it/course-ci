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

// CinetPay API: https://docs.cinetpay.com
// Creates a payment transaction via CinetPay and returns the payment URL.
// The frontend redirects the user to this URL to complete payment.
// CinetPay will call the notify_url (webhook) to confirm payment status.

interface CreatePaymentRequest {
  transaction_id: string;
  amount_fcfa: number;
  purpose: "order" | "subscription" | "delivery_fee" | "promotion";
  purpose_id?: string;
  payment_method_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  return_url: string;
}

export default async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return jsonResponse({ error: "Session invalide" }, 401);
    }

    const body: CreatePaymentRequest = await req.json();

    // Validate required fields
    if (!body.transaction_id || !body.amount_fcfa || !body.payment_method_id) {
      return jsonResponse({ error: "Paramètres manquants" }, 400);
    }

    if (body.amount_fcfa <= 0) {
      return jsonResponse({ error: "Le montant doit être positif" }, 400);
    }

    // Verify the payment method is enabled
    const { data: method, error: methodErr } = await supabase
      .from("payment_methods")
      .select("id, name, channel, is_enabled")
      .eq("id", body.payment_method_id)
      .maybeSingle();

    if (methodErr || !method) {
      return jsonResponse({ error: "Moyen de paiement invalide" }, 400);
    }

    if (!method.is_enabled) {
      return jsonResponse({ error: "Ce moyen de paiement n'est pas disponible" }, 400);
    }

    // Check CinetPay credentials are configured
    const merchantId = Deno.env.get("CINETPAY_MERCHANT_ID");
    const apiKey = Deno.env.get("CINETPAY_API_KEY");
    const siteId = Deno.env.get("CINETPAY_SITE_ID");

    if (!merchantId || !apiKey || !siteId) {
      // Test mode: return a test-mode response (NOT a fake success)
      return jsonResponse({
        error: "Paiement non configuré",
        mode: "test",
        message: "Les clés API CinetPay ne sont pas encore configurées. Contactez l'administrateur pour activer les paiements.",
        transaction_id: body.transaction_id,
        amount: body.amount_fcfa,
        test_mode: true,
      }, 503);
    }

    // Create the transaction record in the database
    const { error: txErr } = await supabase.from("transactions").insert({
      reference: body.transaction_id,
      user_id: userData.user.id,
      payment_method_id: body.payment_method_id,
      purpose: body.purpose,
      purpose_id: body.purpose_id || null,
      amount_fcfa: body.amount_fcfa,
      status: "pending",
    });

    if (txErr) {
      // Check for duplicate reference (idempotency)
      if (txErr.code === "23505") {
        return jsonResponse({ error: "Transaction déjà créée" }, 409);
      }
      return jsonResponse({ error: "Erreur lors de la création de la transaction" }, 500);
    }

    // Build CinetPay payment initialization request
    // CinetPay v2 API: POST https://api-checkout.cinetpay.com/v2/payment
    const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`;

    const cinetpayPayload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: body.transaction_id,
      amount: body.amount_fcfa,
      currency: "XOF",
      description: `Course CI - ${body.purpose}`,
      customer_name: body.customer_name,
      customer_surname: body.customer_name,
      customer_email: body.customer_email || "",
      customer_phone_number: body.customer_phone,
      customer_address: "Côte d'Ivoire",
      customer_country: "CI",
      customer_city: "Abidjan",
      customer_state: "Abidjan",
      customer_zip_code: "00000",
      notify_url: notifyUrl,
      return_url: body.return_url,
      channels: method.channel || "ALL",
      metadata: JSON.stringify({
        purpose: body.purpose,
        purpose_id: body.purpose_id,
        user_id: userData.user.id,
      }),
    };

    const cinetpayResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cinetpayPayload),
    });

    if (!cinetpayResponse.ok) {
      const errText = await cinetpayResponse.text();
      console.error("CinetPay error:", errText);

      // Update transaction to failed
      await supabase
        .from("transactions")
        .update({ status: "failed", failure_reason: "CinetPay initialization failed" })
        .eq("reference", body.transaction_id);

      return jsonResponse({
        error: "Erreur lors de l'initialisation du paiement",
        details: "Le prestataire de paiement n'a pas pu traiter la demande.",
      }, 502);
    }

    const cinetpayData = await cinetpayResponse.json();

    // Update transaction to processing
    await supabase
      .from("transactions")
      .update({ status: "processing", provider_reference: cinetpayData.transaction_id || null })
      .eq("reference", body.transaction_id);

    return jsonResponse({
      success: true,
      payment_url: cinetpayData.payment_url || cinetpayData.data?.payment_url,
      transaction_id: body.transaction_id,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
};
