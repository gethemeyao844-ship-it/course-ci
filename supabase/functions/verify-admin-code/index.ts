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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

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
    const { admin_email, code } = await req.json();

    if (!admin_email || !code) {
      return jsonResponse({ error: "E-mail et code requis" }, 400);
    }

    if (!/^\d{6}$/.test(code)) {
      return jsonResponse({ error: "Le code doit être 6 chiffres" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Fetch the most recent unused, non-expired code for this email
    const now = new Date().toISOString();
    const { data: record, error: fetchErr } = await supabase
      .from("admin_verification_codes")
      .select("id, code_hash, expires_at, attempts, max_attempts, used")
      .eq("admin_email", admin_email.toLowerCase().trim())
      .eq("used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr || !record) {
      return jsonResponse({ error: "Code invalide ou expiré" }, 401);
    }

    // Check attempt limit
    if (record.attempts >= record.max_attempts) {
      await supabase
        .from("admin_verification_codes")
        .update({ used: true })
        .eq("id", record.id);

      return jsonResponse({
        error: "Trop de tentatives. Veuillez demander un nouveau code.",
      }, 429);
    }

    // Increment attempts
    await supabase
      .from("admin_verification_codes")
      .update({ attempts: record.attempts + 1 })
      .eq("id", record.id);

    // Verify the code
    const [salt, storedHash] = record.code_hash.split(":");
    if (!salt || !storedHash) {
      return jsonResponse({ error: "Erreur de configuration du code" }, 500);
    }

    const computedHash = await hashCode(code, salt);
    if (!timingSafeEqual(computedHash, storedHash)) {
      return jsonResponse({ error: "Code incorrect" }, 401);
    }

    // Mark code as used
    await supabase
      .from("admin_verification_codes")
      .update({ used: true })
      .eq("id", record.id);

    return jsonResponse({ success: true, message: "Vérification réussie" });
  } catch (err) {
    console.error("Verify admin code error:", err);
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
};
