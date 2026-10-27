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

// Simple, constant-time string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// PBKDF2-like hash using Web Crypto API (available in Deno)
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
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
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse({ error: "Email et mot de passe requis" }, 400);
    }

    if (password.length < 11) {
      return jsonResponse({
        error: "Le mot de passe administrateur doit faire au moins 11 caractères",
      }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Look up admin credentials (service role bypasses RLS)
    const { data: cred, error: credErr } = await supabase
      .from("admin_credentials")
      .select("id, email, password_hash, is_active")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (credErr || !cred) {
      return jsonResponse({ error: "Identifiants administrateurs invalides" }, 401);
    }

    // The stored hash includes the salt as a prefix: "salt:hash"
    const [salt, storedHash] = cred.password_hash.split(":");
    if (!salt || !storedHash) {
      return jsonResponse({ error: "Erreur de configuration administrateur" }, 500);
    }

    const computedHash = await hashPassword(password, salt);
    if (!timingSafeEqual(computedHash, storedHash)) {
      return jsonResponse({ error: "Identifiants administrateurs invalides" }, 401);
    }

    // Log the successful admin login attempt
    await supabase.from("admin_audit_log").insert({
      admin_id: cred.id,
      action: "admin_login",
      target_type: "admin_credential",
      target_id: cred.id,
      details: { email: cred.email, timestamp: new Date().toISOString() },
    });

    return jsonResponse({
      success: true,
      admin_id: cred.id,
      email: cred.email,
    });
  } catch (err) {
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
};
