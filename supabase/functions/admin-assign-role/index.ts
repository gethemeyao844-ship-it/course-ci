import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AssignRoleRequest {
  target_user_id: string;
  role: "client" | "driver" | "merchant" | "admin";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const callerRole = userData.user.app_metadata?.role;
    if (callerRole !== "admin") {
      return jsonResponse({ error: "Forbidden: admin only" }, 403);
    }

    const body: AssignRoleRequest = await req.json();
    const { target_user_id, role } = body;

    if (!target_user_id || !role) {
      return jsonResponse({ error: "Missing target_user_id or role" }, 400);
    }

    if (!["client", "driver", "merchant", "admin"].includes(role)) {
      return jsonResponse({ error: "Invalid role" }, 400);
    }

    if (target_user_id === userData.user.id) {
      return jsonResponse({ error: "Cannot modify own role" }, 400);
    }

    const { error: updateErr } = await supabase.auth.admin.updateUserById(
      target_user_id,
      { app_metadata: { role } }
    );

    if (updateErr) {
      return jsonResponse({ error: updateErr.message }, 500);
    }

    await supabase.from("admin_audit_log").insert({
      admin_id: userData.user.id,
      action: "assign_role",
      target_type: "user",
      target_id: target_user_id,
      details: { role },
    });

    return jsonResponse({ success: true, target_user_id, role });
  } catch (err) {
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};
