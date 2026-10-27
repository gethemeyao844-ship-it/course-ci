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

// Generate a random 6-digit code
function generateCode(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => (b % 10).toString()).join("");
}

// Hash the code with a salt for storage (never store plaintext)
async function hashCode(code: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(code),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 50000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export default async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { admin_email } = await req.json();

    if (!admin_email) {
      return jsonResponse({ error: "E-mail requis" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Rate limit: max 3 codes per email per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("admin_verification_codes")
      .select("*", { count: "exact", head: true })
      .eq("admin_email", admin_email.toLowerCase().trim())
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      return jsonResponse({
        error: "Trop de demandes. Veuillez patienter 10 minutes avant de réessayer.",
      }, 429);
    }

    // Invalidate all previous unused codes for this email
    await supabase
      .from("admin_verification_codes")
      .update({ used: true })
      .eq("admin_email", admin_email.toLowerCase().trim())
      .eq("used", false);

    // Generate a new code
    const code = generateCode();
    const salt = crypto.randomUUID();
    const codeHash = `${salt}:${await hashCode(code, salt)}`;

    // Store the hashed code (valid for 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertErr } = await supabase
      .from("admin_verification_codes")
      .insert({
        admin_email: admin_email.toLowerCase().trim(),
        code_hash: codeHash,
        expires_at: expiresAt,
        max_attempts: 3,
      });

    if (insertErr) {
      console.error("Failed to store verification code:", insertErr);
      return jsonResponse({ error: "Erreur lors de la génération du code" }, 500);
    }

    // Send the code via email using Supabase's built-in email service
    // We use the auth admin API to send a custom email
    // NOTE: Supabase doesn't have a direct "send custom email" API.
    // For production, configure an SMTP provider or use Resend/SendGrid.
    // For now, we log the code server-side (NOT in frontend) and return success.
    // The admin must configure RESEND_API_KEY or SMTP settings for actual email delivery.

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmailRecipient = admin_email.toLowerCase().trim();

    if (resendApiKey) {
      // Send via Resend API
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Course CI <noreply@course.ci>",
          to: [adminEmailRecipient],
          subject: "Code de vérification administrateur - Course CI",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #083358;">Course CI - Vérification administrateur</h2>
              <p>Voici votre code de vérification temporaire :</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; text-align: center; padding: 16px; background: #fff7ed; border-radius: 12px; margin: 16px 0;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">
                Ce code est valable 10 minutes et à usage unique.
                Ne le partagez avec personne.
              </p>
              <p style="color: #999; font-size: 12px;">
                Si vous n'avez pas demandé ce code, ignorez cet e-mail.
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email:", await emailResponse.text());
        return jsonResponse({
          error: "L'envoi de l'e-mail a échoué. Vérifiez la configuration du service d'e-mail.",
        }, 500);
      }

      return jsonResponse({ success: true, message: "Code envoyé par e-mail" });
    } else {
      // No email provider configured — return the code in the response
      // BUT mark it clearly as test mode. This is NOT secure for production.
      console.log(`Admin verification code for ${adminEmailRecipient}: ${code}`);

      return jsonResponse({
        success: true,
        message: "Service d'e-mail non configuré. Le code a été généré mais l'envoi n'a pas pu être effectué.",
        test_mode: true,
        dev_code: code, // Only returned because no email provider is configured
        warning: "Configurez RESEND_API_KEY pour activer l'envoi réel par e-mail. En production, ce code ne doit jamais être renvoyé au client.",
      });
    }
  } catch (err) {
    console.error("Send verification code error:", err);
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
};
