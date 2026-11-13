import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Users, ClipboardList, Bell, FileText, LogOut, ArrowRight, LockKeyhole, Menu, X, CheckCircle2, Clock3, AlertCircle, Plus, Search, Flag, Home, UserCircle, RefreshCw } from "lucide-react";

const supabase = createClient("https://kasnukztvipaxtqniktj.supabase.co", "sb_publishable_fcvOMSaKVJGMEXgUqB7CFg_NbwaLVJ0");
const ADMIN_EMAIL = "kushalkvofmkbsgindiaoyms@gmail.com";
const PORTAL = "oyms_sankalp_4";
const SCHOOL = "PM SHRI Kendriya Vidyalaya, Ordnance Factory, Medak";
const DIVISION = "KVS Hyderabad Division";
const statusLabel = (s) => ({pending:"Pending",verified:"Verified",needs_changes:"Needs Changes",completed:"Completed"}[s] || s);
const dateLabel = (d) => d ? new Date(d).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}) : "—";

export default function Portal(){
  const [page,setPage] = useState("welcome");
  const [loginType,setLoginType] = useState("");
  const [loginId,setLoginId] = useState("");
  const [password,setPassword] = useState("");
  const [user,setUser] = useState(null);
  const [profile,setProfile] = useState(null);
  const [tab,setTab] = useState("dashboard");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");
  const [leaders,setLeaders] = useState([]);
  const [submissions,setSubmissions] = useState([]);
  const [notifications,setNotifications] = useState([]);
  const [audit,setAudit] = useState([]);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [leaderForm,setLeaderForm] = useState({login_id:"",full_name:"",patrol_name:"",mobile_number:"",password:"",category:"Scout",bsg_uid:""});
  const [recordForm,setRecordForm] = useState({title:"",category:"General",details:""});
  const [noticeForm,setNoticeForm] = useState({title:"",message:""});
  const [filter,setFilter] = useState("all");
  const [currentPassword,setCurrentPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [memberCategory,setMemberCategory] = useState("Scout");
  const [memberForm,setMemberForm] = useState({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",bsg_uid_known:false,bsg_uid:""});
  const [memberPhoto,setMemberPhoto] = useState(null);
  const [memberRows,setMemberRows] = useState([]);
  const [memberReason,setMemberReason] = useState({});
  const [otpMember,setOtpMember] = useState(null);
  const [otpValue,setOtpValue] = useState("");
  const [otpSent,setOtpSent] = useState(false);

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{ if(data.session?.user) enterPortal(data.session.user); }); },[]);

  async function enterPortal(authUser){
    const {data:p,error} = await supabase.from("profiles").select("*").eq("id",authUser.id).maybeSingle();
    if(error || !p || !p.is_active || !["super_admin","patrol_leader"].includes(p.role)){
      await supabase.auth.signOut();
      setMessage("This account is not authorised for OYMS Sankalp 4.0.");
      return;
    }
    if(p.role==="super_admin" && (authUser.email||"").toLowerCase()!==ADMIN_EMAIL){
      await supabase.auth.signOut();
      setMessage("Use the registered Admin email address.");
      return;
    }
    if(p.role==="patrol_leader" && !(authUser.email||"").toLowerCase().endsWith("@oyms.local")){
      await supabase.auth.signOut();
      setMessage("This account is not a registered Patrol Leader account.");
      return;
    }
    setUser(authUser); setProfile(p); setPage("app"); setTab("dashboard"); setMessage("");
    await refreshData(p.role,authUser.id);
  }

  async function refreshData(role,userId){
    setLoading(true);
    if(role==="super_admin"){
      const [l,s,n,a] = await Promise.all([
        supabase.from("profiles").select("*").eq("role","patrol_leader").order("created_at",{ascending:false}),
        supabase.from("patrol_submissions").select("*").order("submitted_at",{ascending:false}),
        supabase.from("portal_notifications").select("*").order("created_at",{ascending:false}).limit(100),
        supabase.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(100)
      ]);
      if(l.data)setLeaders(l.data); if(s.data)setSubmissions(s.data); if(n.data)setNotifications(n.data);
      const {data:mr,error:me}=await supabase.from("member_records").select("*").eq("patrol_leader_id",userId).order("created_at",{ascending:false}); if(mr)setMemberRows(mr); if(me)setMessage(me.message); if(a.data)setAudit(a.data);
      const {data:mr,error:me}=await supabase.from("member_records").select("*").order("created_at",{ascending:false}); if(mr)setMemberRows(mr); if(me)setMessage(me.message);
      const err=[l,s,n,a].find(x=>x.error); if(err)setMessage(err.error.message);
    } else {
      const [s,n] = await Promise.all([
        supabase.from("patrol_submissions").select("*").eq("patrol_leader_id",userId).order("submitted_at",{ascending:false}),
        supabase.from("portal_notifications").select("*").eq("recipient_user_id",userId).order("created_at",{ascending:false})
      ]);
      if(s.data)setSubmissions(s.data); if(n.data)setNotifications(n.data);
      const err=[s,n].find(x=>x.error); if(err)setMessage(err.error.message);
    }
    setLoading(false);
  }

  async function requestAdminActivation(){
    setLoading(true);setMessage("");
    const {error}=await supabase.auth.signInWithOtp({email:ADMIN_EMAIL,options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+window.location.pathname}});
    setLoading(false);
    setMessage(error?error.message:"A secure sign-in link has been sent to the administrator email. Open it on this device to activate the Admin account.");
  }

  async function changePassword(e){
    e.preventDefault();
    const isInitialAdminPassword = isAdmin && user?.user_metadata?.password_initialized !== true;
    if(!isInitialAdminPassword){
      if(!currentPassword){setMessage("Enter your current password.");return;}
      const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:currentPassword});
      if(verifyError){setMessage("Current password is incorrect.");return;}
    }
    if(newPassword.length<10){setMessage("Choose a password with at least 10 characters.");return;}
    if(newPassword!==confirmPassword){setMessage("New password and confirmation do not match.");return;}
    setLoading(true);
    const {error}=await supabase.auth.updateUser({password:newPassword,data:{password_initialized:true}});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    setCurrentPassword("");setNewPassword("");setConfirmPassword("");
    const {data:sessionData}=await supabase.auth.getUser();
    if(sessionData?.user)setUser(sessionData.user);
    setMessage("Password saved successfully.");
  }

  async function signIn(e){
    e.preventDefault(); setLoading(true); setMessage("");
    const identity = loginType==="admin" ? loginId.trim().toLowerCase() : loginId.trim().toLowerCase()+"@oyms.local";
    if(loginType==="admin" && identity!==ADMIN_EMAIL){setLoading(false);setMessage("Enter the registered Admin email address.");return;}
    const {data,error}=await supabase.auth.signInWithPassword({email:identity,password});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    await enterPortal(data.user);
  }

  async function signOut(){await supabase.auth.signOut();setUser(null);setProfile(null);setPage("welcome");setLoginType("");setPassword("");setLoginId("");setMessage("");}

  async function createLeader(e){
    e.preventDefault(); setLoading(true); setMessage("");
    const {data,error}=await supabase.functions.invoke("create-patrol-account",{body:leaderForm});
    setLoading(false);
    if(error || data?.error){setMessage(data?.error || error.message);return;}
    setMessage("Patrol Leader account created successfully. Share the Login ID securely with the leader.");
    setLeaderForm({login_id:"",full_name:"",patrol_name:"",mobile_number:"",password:"",category:"Scout",bsg_uid:""});
    await refreshData("super_admin",user.id);
  }

  async function submitRecord(e){
    e.preventDefault();setLoading(true);setMessage("");
    let details={}; try{details=JSON.parse(recordForm.details || "{}");}catch{details={notes:recordForm.details};}
    const {error}=await supabase.from("patrol_submissions").insert({patrol_leader_id:user.id,title:recordForm.title,category:recordForm.category,details,status:"pending"});
    setLoading(false);if(error){setMessage(error.message);return;}
    setMessage("Record submitted for administrator verification.");
    setRecordForm({title:"",category:"General",details:""});
    await refreshData("patrol_leader",user.id);
  }

  async function updateStatus(row,status){
    setLoading(true);
    const {error}=await supabase.from("patrol_submissions").update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",row.id);
    setLoading(false);if(error){setMessage(error.message);return;}
    setMessage("Submission status updated.");await refreshData("admin",user.id);
  }

  async function sendNotification(e){
    e.preventDefault();setLoading(true);setMessage("");
    const recipients=leaders.filter(x=>x.is_active);
    if(!recipients.length){setLoading(false);setMessage("Create Patrol Leader accounts before sending notifications.");return;}
    const rows=recipients.map(x=>({recipient_user_id:x.user_id,title:noticeForm.title,message:noticeForm.message}));
    const {error}=await supabase.from("portal_notifications").insert(rows);
    setLoading(false);if(error){setMessage(error.message);return;}
    setMessage("Notification sent to all active Patrol Leaders.");setNoticeForm({title:"",message:""});
    await refreshData("admin",user.id);
  }

  async function markRead(item){
    const {error}=await supabase.from("portal_notifications").update({read_at:new Date().toISOString()}).eq("id",item.id);
    if(error){setMessage(error.message);return;}
    await refreshData(profile.role,user.id);
  }

  const isAdmin=profile?.role==="super_admin";
  const visibleMemberRows=memberRows.filter(x=>isAdmin||x.patrol_leader_id===user?.id);
  const nav=isAdmin?[
    ["dashboard","Dashboard",Home],["leaders","Patrols",Users],["members","Member Records",ClipboardList],["notifications","Notifications",Bell],["audit","Unfreeze Requests",FileText],["profile","My Profile",UserCircle]
  ]:[
    ["profile","My Profile",UserCircle],["dashboard","Dashboard",Home],["new","My Patrol",Plus],["otp","OTP Verification",ShieldCheck],["notifications","Notifications",Bell]
  ];

  if(page==="welcome") return <div className="welcome-page">
    <div className="top-ribbon"><span>भारत स्काउट्स एवं गाइड्स · BHARAT SCOUTS & GUIDES</span><span>OFFICIAL SCHOOL UNIT PORTAL</span></div>
    <header className="welcome-header"><div className="crest">BSG</div><div><b>BHARAT SCOUTS & GUIDES</b><h1>OYMS SANKALP 4.0</h1><p>{SCHOOL}</p><small>{DIVISION} · EDDUMAILARAM, TELANGANA</small></div><div className="header-mark">2026–27<br/><small>YOUTH MANAGEMENT</small></div></header>
    <main className="welcome-content"><section className="hero"><div className="hero-copy"><span className="eyebrow">ONLINE YOUTH MANAGEMENT SYSTEM</span><h2>Welcome to<br/><strong>OYMS Sankalp 4.0</strong></h2><p>A unified digital workspace for Scout & Guide patrol records, submissions, verification and unit coordination.</p><button className="primary large" onClick={()=>{setPage("choose");setMessage("");}}>LOGIN <ArrowRight size={18}/></button></div><div className="hero-art"><div className="hero-circle"><Flag size={72}/><span>BE PREPARED</span></div><div className="hero-tag">SERVICE · LEADERSHIP · UNITY</div></div></section>
    <section className="feature-row"><article><ShieldCheck/><b>Secure Access</b><small>Separate administrator and patrol leader sign-in</small></article><article><ClipboardList/><b>Digital Records</b><small>Submit and track patrol activity records</small></article><article><CheckCircle2/><b>Verification</b><small>Review status and administrator feedback</small></article></section>
    <footer className="welcome-footer">{SCHOOL} · {DIVISION}<span>OYMS SANKALP 4.0 · 2026–27</span></footer></main>
  </div>;

  if(page==="choose") return <div className="auth-page"><button className="back" onClick={()=>{setPage("welcome");setMessage("");}}>← Back to Welcome</button><div className="auth-card choose-card"><div className="mini-crest">BSG</div><span className="eyebrow">AUTHORISED PORTAL ACCESS</span><h2>Select Login Type</h2><p>Choose the account type issued to you.</p><button className="role-choice admin-choice" onClick={()=>{setLoginType("admin");setLoginId(ADMIN_EMAIL);setPage("login");setMessage("");}}><span className="choice-icon"><ShieldCheck/></span><span><b>Admin Login</b><small>Administrator access and portal management</small></span><ArrowRight/></button><button className="role-choice patrol-choice" onClick={()=>{setLoginType("patrol");setLoginId("");setPage("login");setMessage("");}}><span className="choice-icon"><Flag/></span><span><b>Patrol Login</b><small>Patrol Leader records and submissions</small></span><ArrowRight/></button><div className="security-line"><LockKeyhole size={15}/> Only authorised accounts can access the portal.</div></div></div>;

  if(page==="login") return <div className="auth-page"><button className="back" onClick={()=>{setPage("choose");setMessage("");}}>← Back to Login Selection</button><div className="auth-card"><div className="mini-crest">{loginType==="admin"?"ADMIN":"BSG"}</div><span className="eyebrow">{loginType==="admin"?"ADMINISTRATOR ACCESS":"PATROL LEADER ACCESS"}</span><h2>{loginType==="admin"?"Admin Login":"Patrol Login"}</h2><p>{loginType==="admin"?"Sign in with the registered administrator email and password.":"Sign in using the Login ID and password created by your Administrator."}</p>
    <form onSubmit={signIn} className="auth-form"><label>{loginType==="admin"?"Admin Email":"Patrol Login ID"}<input required type={loginType==="admin"?"email":"text"} autoComplete="username" value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder={loginType==="admin"?"Administrator email":"Enter your Login ID"}/></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label><button className="primary block" disabled={loading}>{loading?"Signing in…":"LOGIN SECURELY"} <ArrowRight size={17}/></button></form>
    {loginType==="admin"&&<><button className="link-button" onClick={async()=>{if(!loginId.trim()){setMessage("Enter your admin email first.");return;}setLoading(true);const {error}=await supabase.auth.resetPasswordForEmail(loginId.trim().toLowerCase());setLoading(false);setMessage(error?error.message:"If this email has an OYMS account, a password reset link has been sent.");}}>Forgot password?</button><button className="link-button" onClick={requestAdminActivation} disabled={loading}>First-time Admin? Send secure activation link</button></>}
    {message&&<div className="notice-message"><AlertCircle size={16}/>{message}</div>}<div className="security-line"><LockKeyhole size={15}/> Your role is checked by the secure database after sign-in.</div></div></div>;

  if(page==="app" && user && profile) return <div className="app-layout">
    <aside className={"sidebar "+(mobileMenu?"show":"")}><div className="side-brand"><div className="mini-crest">BSG</div><div><b>OYMS SANKALP 4.0</b><small>{isAdmin?"ADMINISTRATOR":"PATROL LEADER"}</small></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div><nav>{nav.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setMobileMenu(false);}}><Icon size={17}/>{label}</button>)}</nav><div className="side-bottom"><b>{profile.full_name}</b><small>{profile.login_id} · {profile.patrol_name||"Admin"}</small><button onClick={signOut}><LogOut size={16}/> Sign out</button></div></aside>
    <section className="app-main"><header className="app-top"><button className="menu-button" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div><b>{nav.find(x=>x[0]===tab)?.[1]||"Dashboard"}</b><small>{SCHOOL}</small></div><button className="refresh" onClick={()=>refreshData(profile.role,user.id)}><RefreshCw size={17}/></button></header>
    <main className="app-content">{message&&<div className="notice-message"><AlertCircle size={16}/>{message}<button onClick={()=>setMessage("")}>×</button></div>}
      {tab==="dashboard"&&<><div className="welcome-banner"><span className="eyebrow">WELCOME BACK</span><h1>{profile.full_name}</h1><p>{isAdmin?"Manage Patrol Leader accounts, review records and monitor portal activity.":"Submit patrol records and follow your verification status."}</p></div><div className="stat-grid">{(isAdmin?[["Patrol Leaders",leaders.length,Users],["Total Submissions",submissions.length,ClipboardList],["Pending",submissions.filter(x=>x.status==="pending").length,Clock3],["Verified",submissions.filter(x=>x.status==="verified").length,CheckCircle2]]:[["My Submissions",submissions.length,ClipboardList],["Pending",submissions.filter(x=>x.status==="pending").length,Clock3],["Verified",submissions.filter(x=>x.status==="verified").length,CheckCircle2],["Notifications",notifications.filter(x=>!x.read_at).length,Bell]]).map(([label,value,Icon])=><article className="stat-card" key={label}><Icon/><div><strong>{value}</strong><small>{label}</small></div></article>)}</div><section className="panel"><h3>Recent Submissions</h3><SubmissionList rows={submissions.slice(0,5)} isAdmin={isAdmin} onStatus={updateStatus}/></section></>}
      {tab==="leaders"&&isAdmin&&<><div className="section-title"><div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h2>Create Patrol Leader Login</h2></div></div><form className="panel data-form" onSubmit={createLeader}><label>Category<select value={leaderForm.category} onChange={e=>setLeaderForm({...leaderForm,category:e.target.value})}><option value="Guide">Guides</option><option value="Scout">Scouts</option></select></label><label>BSG UID (if known)<input value={leaderForm.bsg_uid} onChange={e=>setLeaderForm({...leaderForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label><label>Full name<input required value={leaderForm.full_name} onChange={e=>setLeaderForm({...leaderForm,full_name:e.target.value})}/></label><label>Login ID<input required value={leaderForm.login_id} onChange={e=>setLeaderForm({...leaderForm,login_id:e.target.value})} placeholder="e.g. panther01"/></label><label>Patrol Name<input required value={leaderForm.patrol_name} onChange={e=>setLeaderForm({...leaderForm,patrol_name:e.target.value})}/></label><label>Mobile number<input required type="tel" value={leaderForm.mobile_number} onChange={e=>setLeaderForm({...leaderForm,mobile_number:e.target.value})}/></label><label className="wide">Temporary password<input required type="password" minLength="10" value={leaderForm.password} onChange={e=>setLeaderForm({...leaderForm,password:e.target.value})}/><small>Use a unique password of at least 10 characters. Share it privately.</small></label><button className="primary" disabled={loading}>{loading?"Creating…":"Create Patrol Login"} <Plus size={16}/></button></form><section className="panel"><h3>Registered Patrol Leaders</h3><div className="section-title"><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Scout">Scouts</option><option value="Guide">Guides</option><option value="Combined">Combined</option></select></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>BSG UID</th><th>Login ID</th><th>Patrol</th><th>Mobile</th><th>Status</th></tr></thead><tbody>{leaders.filter(x=>memberCategory==="Combined"||x.category===memberCategory).map(x=><tr key={x.user_id}><td>{x.full_name}</td><td>{x.category||"—"}</td><td>{x.bsg_uid||"—"}</td><td>{x.login_id}</td><td>{x.patrol_name}</td><td>{x.mobile_number}</td><td>{x.is_active?"Active":"Inactive"}</td></tr>)}</tbody></table></div></section></>}
      {tab==="new"&&!isAdmin&&<><div className="section-title"><div><span className="eyebrow">PATROL RECORD ENTRY</span><h2>Submit a New Record</h2></div></div><form className="panel data-form" onSubmit={submitRecord}><label className="wide">Record title<input required value={recordForm.title} onChange={e=>setRecordForm({...recordForm,title:e.target.value})} placeholder="Enter activity or record title"/></label><label>Category<select value={recordForm.category} onChange={e=>setRecordForm({...recordForm,category:e.target.value})}>{["General","Attendance","Activity","Training","Camp","Community Service","Progression","Other"].map(x=><option>{x}</option>)}</select></label><label className="wide">Details<textarea rows="6" value={recordForm.details} onChange={e=>setRecordForm({...recordForm,details:e.target.value})} placeholder="Enter record details. You may use JSON or plain text."/></label><button className="primary" disabled={loading}>Submit for Verification <ArrowRight size={16}/></button></form></>}
      {tab==="submissions"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">{isAdmin?"ADMIN REVIEW":"YOUR RECORDS"}</span><h2>{isAdmin?"All Submissions":"My Submissions"}</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_changes">Needs Changes</option><option value="completed">Completed</option></select></div><SubmissionList rows={submissions.filter(x=>filter==="all"||x.status===filter)} isAdmin={isAdmin} onStatus={updateStatus}/></section>}
      {tab==="notifications"&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">PORTAL MESSAGES</span><h2>Notifications</h2></div></div>{notifications.map(x=><article className="notification-item" key={x.id}><Bell size={18}/><div><b>{x.title}</b><p>{x.message}</p><small>{dateLabel(x.created_at)}</small></div>{!isAdmin&&!x.read_at&&<button className="outline" onClick={()=>markRead(x)}>Mark read</button>}</article>)}{!notifications.length&&<p className="empty">No notifications yet.</p>}</section>{isAdmin&&<form className="panel data-form" onSubmit={sendNotification}><h3 className="wide">Send message to all active Patrol Leaders</h3><label className="wide">Title<input required value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})}/></label><label className="wide">Message<textarea required rows="3" value={noticeForm.message} onChange={e=>setNoticeForm({...noticeForm,message:e.target.value})}/></label><button className="primary" disabled={loading}>Send Notification <Bell size={16}/></button></form>}</>}
      {tab==="audit"&&isAdmin&&<section className="panel"><h2>Activity Log</h2><div className="table-wrap"><table><thead><tr><th>Action</th><th>Table</th><th>Record ID</th><th>Date</th></tr></thead><tbody>{audit.map(x=><tr key={x.id}><td>{x.action}</td><td>{x.entity_table}</td><td>{x.record_id||"—"}</td><td>{dateLabel(x.created_at)}</td></tr>)}</tbody></table></div></section>}
      {tab==="profile"&&<><section className="panel profile"><div className="avatar">{(profile.full_name||"U").slice(0,1)}</div><h2>{profile.full_name}</h2><p>{profile.role==="super_admin"?"Administrator":"Patrol Leader"}</p><dl><dt>Login ID</dt><dd>{profile.login_id}</dd><dt>Patrol</dt><dd>{profile.patrol_name||"—"}</dd><dt>Email</dt><dd>{profile.email_address||user.email||"—"}</dd><dt>Mobile</dt><dd>{profile.mobile_number||"—"}</dd><dt>Account status</dt><dd>{profile.is_active?"Active":"Inactive"}</dd></dl></section><form className="panel data-form" onSubmit={changePassword}><h3 className="wide">{isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Admin Password":"Change Password"}</h3>{!(isAdmin&&user?.user_metadata?.password_initialized!==true)&&<label className="wide">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Enter current password"/></label>}<label>New password<input required type="password" autoComplete="new-password" minLength="10" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 10 characters"/></label><label>Confirm new password<input required type="password" autoComplete="new-password" minLength="10" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter new password"/></label><button className="primary" disabled={loading}>{loading?"Saving…":isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Password":"Update Password"}</button></form></>}
    </main><footer className="app-footer">{DIVISION} · OYMS SANKALP 4.0</footer></section></div>;

  return <div className="auth-page"><div className="auth-card"><h2>Loading portal…</h2></div></div>;
}

function SubmissionList({rows,isAdmin,onStatus}){
  if(!rows.length)return <p className="empty">No submissions found.</p>;
  return <div className="submission-list">{rows.map(x=><article className="submission-item" key={x.id}><div className="submission-icon"><FileText/></div><div className="submission-main"><b>{x.title}</b><small>{x.category} · {dateLabel(x.submitted_at)}</small><p>{typeof x.details==="string"?x.details:JSON.stringify(x.details||{})}</p><span className={"status status-"+x.status}>{statusLabel(x.status)}</span></div>{isAdmin&&<div className="review-actions"><button onClick={()=>onStatus(x,"verified")}>Verify</button><button onClick={()=>onStatus(x,"needs_changes")}>Needs Changes</button><button onClick={()=>onStatus(x,"completed")}>Complete</button></div>}</article>)}</div>;
}
