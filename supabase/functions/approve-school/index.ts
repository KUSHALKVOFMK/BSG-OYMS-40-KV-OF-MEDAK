// Supabase Edge Function: approve-school
// Super Admin approval converts an OTP-verified Vidyalaya application into a School Admin account.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization");
  if (!auth) return reply({ error: "Authentication required" }, 401);
  const callerClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, service);
  const { data: authData, error: authError } = await callerClient.auth.getUser();
  if (authError || !authData.user) return reply({ error: "Invalid session" }, 401);
  const { data: caller } = await admin.from("profiles").select("role").eq("id", authData.user.id).single();
  if (caller?.role !== "super_admin") return reply({ error: "Only the Super Admin can approve Vidyalaya registrations." }, 403);

  try {
    const { application_id, decision, review_notes = "" } = await req.json();
    const { data: app, error: appError } = await admin.from("school_applications").select("*").eq("id", application_id).single();
    if (appError || !app) return reply({ error: "Vidyalaya application not found." }, 404);
    if (app.status !== "pending" || !app.email_verified) return reply({ error: "Only pending applications with verified email can be reviewed." }, 409);

    if (decision === "reject") {
      await admin.from("school_applications").update({ status: "rejected", review_notes, reviewed_by: authData.user.id, reviewed_at: new Date().toISOString() }).eq("id", app.id);
      return reply({ ok: true, message: "Vidyalaya application rejected." });
    }
    if (decision !== "approve") return reply({ error: "Decision must be approve or reject." }, 400);

    const { data: school, error: schoolError } = await admin.from("schools").insert({
      school_name: app.school_name, affiliation_number: app.affiliation_number,
      division: app.division, school_address: app.school_address,
      principal_name: app.principal_name, contact_person: app.contact_person,
      email: app.email, mobile: app.mobile
    }).select().single();
    if (schoolError) return reply({ error: schoolError.message }, 400);

    const { error: profileError } = await admin.from("profiles").upsert({
      id: app.applicant_user_id, full_name: app.contact_person, email: app.email,
      role: "school_admin", school_id: school.id
    });
    if (profileError) { await admin.from("schools").delete().eq("id", school.id); return reply({ error: profileError.message }, 400); }

    const { data: scoutUnit, error: scoutError } = await admin.from("units").insert({ school_id: school.id, name: "Scout Unit", category: "Scout" }).select().single();
    const { data: guideUnit, error: guideError } = await admin.from("units").insert({ school_id: school.id, name: "Guide Company", category: "Guide" }).select().single();
    if (scoutError || guideError) return reply({ error: scoutError?.message || guideError?.message || "Could not create default units." }, 500);
    const patrolRows = [
      { school_id: school.id, unit_id: scoutUnit.id, name: "Panther", unit: "Scout", capacity: 8 },
      { school_id: school.id, unit_id: scoutUnit.id, name: "Eagle", unit: "Scout", capacity: 8 },
      { school_id: school.id, unit_id: scoutUnit.id, name: "Fox", unit: "Scout", capacity: 8 },
      { school_id: school.id, unit_id: guideUnit.id, name: "Tiger", unit: "Guide", capacity: 8 },
      { school_id: school.id, unit_id: guideUnit.id, name: "Lion", unit: "Guide", capacity: 8 }
    ];
    const { error: patrolError } = await admin.from("patrols").insert(patrolRows);
    if (patrolError) return reply({ error: patrolError.message }, 500);
    await admin.from("school_applications").update({
      status: "approved", school_id: school.id, reviewed_by: authData.user.id,
      reviewed_at: new Date().toISOString(), review_notes
    }).eq("id", app.id);
    return reply({ ok: true, school_id: school.id, admin_user_id: app.applicant_user_id, message: "Vidyalaya approved. The verified applicant now has School / Group Admin access. They can sign in using email OTP and create Unit Leader accounts." });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Unexpected approval error." }, 500);
  }
});
