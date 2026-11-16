import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return respond({ error: "Server configuration is incomplete." }, 500);
  const client = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return respond({ error: "Sign in as Super Admin first." }, 401);
    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData.user) return respond({ error: "Your session is invalid." }, 401);

    const actorId = authData.user.id;
    const { data: actor } = await client.from("profiles")
      .select("role,is_active").eq("id", actorId).maybeSingle();
    if (!actor || actor.role !== "super_admin" || !actor.is_active)
      return respond({ error: "Only the active Super Admin can create Admin accounts." }, 403);

    const body = await req.json();
    const fullName = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      return respond({ error: "Enter the Admin's full name and a valid email address." }, 400);

    const invite = await client.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, portal: "oyms_sankalp_4", invited_role: "admin" },
      redirectTo: "https://pmskvofmk.github.io/BSG-OYMS-40-KV-OF-MEDAK/"
    });
    if (invite.error || !invite.data.user)
      return respond({ error: invite.error?.message || "Could not send the Admin invitation." }, 400);

    const invited = invite.data.user;
    const { error: profileError } = await client.from("profiles").insert({
      id: invited.id,
      user_id: invited.id,
      full_name: fullName,
      email,
      email_address: email,
      role: "admin",
      is_active: true,
      created_by: actorId
    });
    if (profileError) {
      await client.auth.admin.deleteUser(invited.id);
      return respond({ error: profileError.message }, 400);
    }

    await client.from("audit_logs").insert({
      action: "Created Admin account by email invitation",
      entity_table: "profiles",
      record_id: invited.id,
      actor_id: actorId
    });
    return respond({ success: true, message: "Admin invitation sent. The Admin must open the email and set a password." });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unexpected account creation error." }, 400);
  }
});
