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
    const contactEmail = String(body.email || "").trim().toLowerCase();
    const startDate = String(body.start_date || "").trim();
    const renewalDate = String(body.renewal_date || "").trim();
    const loginId = String(body.login_id || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!fullName || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^[a-z0-9._-]{3,30}$/.test(loginId) || password.length < 12)
      return respond({ error: "Enter Admin name, start date, Login ID and password (12+ characters)." }, 400);

    const { data: existingAdmin } = await client.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
    if (existingAdmin) return respond({ error: "Only one Admin account is allowed. Reactivate the existing account from Admin Accounts instead of creating another." }, 409);
    const { data: existingLogin } = await client.from("profiles").select("id").eq("login_id", loginId).maybeSingle();
    if (existingLogin) return respond({ error: "That Login ID is already in use." }, 409);
    const internalEmail = loginId + "@oyms.local";
    const created = await client.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, portal: "oyms_sankalp_4", password_initialized: false }
    });
    if (created.error || !created.data.user)
      return respond({ error: created.error?.message || "Could not create the Admin account." }, 400);
    const invited = created.data.user;
    const { error: profileError } = await client.from("profiles").insert({
      id: invited.id, user_id: invited.id, full_name: fullName,
      email: internalEmail, email_address: contactEmail, start_date: startDate, renewal_date: renewalDate,
      login_id: loginId, role: "admin", is_active: true,
      must_change_password: true, created_by: actorId
    });
    if (profileError) {
      await client.auth.admin.deleteUser(invited.id);
      return respond({ error: profileError.message }, 400);
    }

    await client.from("audit_logs").insert({
      action: "Created Admin account with Login ID and initial password",
      entity_table: "profiles",
      record_id: invited.id,
      actor_id: actorId
    });
    return respond({ success: true, message: "Admin account created. Change the initial password after first login." });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unexpected account creation error." }, 400);
  }
});
