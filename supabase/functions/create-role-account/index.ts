// Supabase Edge Function: create-role-account
// Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY as function secrets.
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
  const { data: caller, error: profileError } = await admin.from("profiles").select("*").eq("id", authData.user.id).single();
  if (profileError || !caller) return reply({ error: "No authorised OYMS profile" }, 403);

  try {
    const body = await req.json();
    const targetRole = String(body.role || "");
    const fullName = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!fullName || !email) return reply({ error: "Full name and email are required." }, 400);
    if (!["unit_leader", "patrol_leader", "assistant_patrol_leader", "member"].includes(targetRole)) return reply({ error: "This account role cannot be created here." }, 400);

    const schoolId = caller.school_id;
    let unitId = body.unit_id || caller.unit_id || null;
    let patrolId = body.patrol_id || caller.patrol_id || null;
    if (!schoolId) return reply({ error: "Your account is not linked to a registered Vidyalaya." }, 403);

    if (targetRole === "unit_leader") {
      if (caller.role !== "school_admin") return reply({ error: "Only the School / Group Admin can create Unit Leader accounts." }, 403);
      const { data: unit } = await admin.from("units").select("id,school_id").eq("id", unitId).single();
      if (!unit || unit.school_id !== schoolId) return reply({ error: "Select a valid unit belonging to your Vidyalaya." }, 400);
    } else if (targetRole === "patrol_leader" || targetRole === "assistant_patrol_leader") {
      if (caller.role !== "unit_leader") return reply({ error: "Only the Unit Leader can create Patrol Leader and Assistant Patrol Leader accounts." }, 403);
      const { data: patrol } = await admin.from("patrols").select("id,school_id,unit_id").eq("id", patrolId).single();
      if (!patrol || patrol.school_id !== schoolId || patrol.unit_id !== caller.unit_id) return reply({ error: "Select a patrol assigned to your unit." }, 400);
      unitId = patrol.unit_id;
    } else {
      if (!["school_admin", "unit_leader", "patrol_leader", "assistant_patrol_leader"].includes(caller.role)) return reply({ error: "You are not authorised to add members." }, 403);
      if (caller.role === "unit_leader") {
        unitId = caller.unit_id;
        const { data: patrol } = patrolId ? await admin.from("patrols").select("id,unit_id,school_id").eq("id", patrolId).single() : { data: null };
        if (patrolId && (!patrol || patrol.unit_id !== unitId || patrol.school_id !== schoolId)) return reply({ error: "Choose a patrol in your assigned unit." }, 400);
      } else if (caller.role === "patrol_leader" || caller.role === "assistant_patrol_leader") {
        patrolId = caller.patrol_id;
        const { data: patrol } = await admin.from("patrols").select("id,unit_id,school_id").eq("id", patrolId).single();
        if (!patrol || patrol.school_id !== schoolId) return reply({ error: "Your patrol assignment is not valid." }, 403);
        unitId = patrol.unit_id;
      }
      const { count } = await admin.from("members").select("id", { count: "exact", head: true }).eq("patrol_id", patrolId);
      if (patrolId && (count || 0) >= 8) return reply({ error: "This patrol is full. Maximum capacity is eight members." }, 409);
    }

    const invite = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, oyms_role: targetRole, school_id: schoolId },
      redirectTo: "https://kushalkvofmk.github.io/BSG-OYMS-40-KV-OF-MEDAK/"
    });
    if (invite.error || !invite.data.user) return reply({ error: invite.error?.message || "Could not send the account invitation." }, 400);
    const invitedUser = invite.data.user;

    if (targetRole === "member") {
      const member = body.member || {};
      const row = {
        school_id: schoolId, unit_id: unitId, patrol_id: patrolId,
        full_name: fullName, category: member.category || "Scout",
        father_name: member.father_name || "", mother_name: member.mother_name || "",
        parents_names: [member.father_name, member.mother_name].filter(Boolean).join(" / "),
        dob: member.dob || null, address: member.address || "", pin_code: member.pin_code || "",
        unit_address: member.unit_address || "", mobile: member.mobile || "", email,
        joining_date: member.joining_date || null, investiture_date: member.investiture_date || null,
        leaving_date: member.leaving_date || null, troop_company: member.troop_company || "",
        role_in_unit: member.role_in_unit || "Member",
        bsg_uid: String(member.bsg_uid || "").trim() || null,
        unit: member.category || "Scout", verification_status: "pending",
        status: "active", account_status: "invited"
      };
      const { data: savedMember, error: memberError } = await admin.from("members").insert(row).select().single();
      if (memberError) { await admin.auth.admin.deleteUser(invitedUser.id); return reply({ error: memberError.message }, 400); }
      const { error: profileInsertError } = await admin.from("profiles").upsert({
        id: invitedUser.id, full_name: fullName, email, role: "member",
        school_id: schoolId, unit_id: unitId, patrol_id: patrolId,
        member_id: savedMember.id, created_by: authData.user.id
      });
      if (profileInsertError) { await admin.from("members").delete().eq("id", savedMember.id); await admin.auth.admin.deleteUser(invitedUser.id); return reply({ error: profileInsertError.message }, 400); }
      return reply({ ok: true, user_id: invitedUser.id, member_id: savedMember.id, message: "Member login invitation sent by email." });
    }

    const profile = { id: invitedUser.id, full_name: fullName, email, role: targetRole, school_id: schoolId, unit_id: unitId, patrol_id: patrolId, created_by: authData.user.id };
    const { error: profileInsertError } = await admin.from("profiles").upsert(profile);
    if (profileInsertError) { await admin.auth.admin.deleteUser(invitedUser.id); return reply({ error: profileInsertError.message }, 400); }

    if (targetRole === "unit_leader") {
      await admin.from("units").update({ leader_id: invitedUser.id, leader_name: fullName }).eq("id", unitId);
    } else if (targetRole === "patrol_leader") {
      await admin.from("patrols").update({ leader_id: invitedUser.id, leader_name: fullName }).eq("id", patrolId);
    } else if (targetRole === "assistant_patrol_leader") {
      await admin.from("patrols").update({ assistant_leader_id: invitedUser.id, assistant_leader: fullName }).eq("id", patrolId);
    }
    return reply({ ok: true, user_id: invitedUser.id, message: label(targetRole) + " login invitation sent by email." });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Unexpected account creation error." }, 500);
  }
});

function label(role: string) {
  return role === "unit_leader" ? "Unit Leader" : role === "patrol_leader" ? "Patrol Leader" : "Assistant Patrol Leader";
}
