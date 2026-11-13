import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Users, ClipboardList, Bell, FileText, LogOut, ArrowRight, LockKeyhole, Menu, X, CheckCircle2, Clock3, AlertCircle, Plus, Search, Flag, Home, UserCircle, RefreshCw } from "lucide-react";

const SUPABASE_URL = "https://kasnukztvipaxtqniktj.supabase.co";
const SUPABASE_KEY = "sb_publishable_fcvOMSaKVJGMEXgUqB7CFg_NbwaLVJ0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const otpClient = createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
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
  const [leaderSearch,setLeaderSearch] = useState("");
  const [memberSearch,setMemberSearch] = useState("");
  const [noticeRecipient,setNoticeRecipient] = useState("all");
  const [memberForm,setMemberForm] = useState({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});
  const [memberPhoto,setMemberPhoto] = useState(null);
  const [profilePhoto,setProfilePhoto] = useState(null);
  const [profilePhotoUrl,setProfilePhotoUrl] = useState("");
  const [profileSetup,setProfileSetup] = useState({full_name:"",date_of_birth:"",gender:"",blood_group:"",mobile_number:"",email_address:"",bsg_uid:"",residential_address:""});
  const [memberFormFiles,setMemberFormFiles] = useState([]);
  const [formLinks,setFormLinks] = useState([]);
  const [memberRows,setMemberRows] = useState([]);
  const [unfreezeRequests,setUnfreezeRequests] = useState([]);
  const [editingMember,setEditingMember] = useState(null);
  const [memberFormOpen,setMemberFormOpen] = useState(false);
  const [otpSession,setOtpSession] = useState(null);
  const [otpRecord,setOtpRecord] = useState(null);
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
    setUser(authUser); setProfile(p); setPage("app"); setMessage("");
    setProfileSetup({full_name:p.full_name||"",date_of_birth:p.date_of_birth||"",gender:p.gender||"",blood_group:p.blood_group||"",mobile_number:p.mobile_number||"",email_address:p.email_address||"",bsg_uid:p.bsg_uid||"",residential_address:p.residential_address||""});
    if(p.profile_photo_path){
      const {data:photoData}=await supabase.storage.from("member-photos").createSignedUrl(p.profile_photo_path,3600);
      setProfilePhotoUrl(photoData?.signedUrl||"");
    }else setProfilePhotoUrl("");
    if(p.role==="patrol_leader" && !p.profile_completed_at){setTab("profile-setup");return;}
    setTab("dashboard");
    await refreshData(p.role,authUser.id);
  }

  async function refreshData(role,userId){
    setLoading(true);
    if(role==="super_admin"){
      const [l,s,n,a,m,u]=await Promise.all([
        supabase.from("profiles").select("*").eq("role","patrol_leader").order("created_at",{ascending:false}),
        supabase.from("patrol_submissions").select("*").order("submitted_at",{ascending:false}),
        supabase.from("member_notifications").select("*").order("created_at",{ascending:false}).limit(100),
        supabase.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(100),
        supabase.from("member_records").select("*").order("created_at",{ascending:false}),
        supabase.from("member_unfreeze_requests").select("*").order("created_at",{ascending:false})
      ]);
      if(l.data)setLeaders(l.data);if(s.data)setSubmissions(s.data);if(n.data)setNotifications(n.data);if(a.data)setAudit(a.data);if(m.data)setMemberRows(m.data);if(u.data)setUnfreezeRequests(u.data);
      const err=[l,s,n,a,m,u].find(x=>x.error);if(err)setMessage(err.error.message);
    }else{
      const [s,n,m,u]=await Promise.all([
        supabase.from("patrol_submissions").select("*").eq("patrol_leader_id",userId).order("submitted_at",{ascending:false}),
        supabase.from("member_notifications").select("*").eq("recipient_user_id",userId).order("created_at",{ascending:false}),
        supabase.from("member_records").select("*").eq("patrol_leader_id",userId).order("created_at",{ascending:false}),
        supabase.from("member_unfreeze_requests").select("*").eq("patrol_leader_id",userId).order("created_at",{ascending:false})
      ]);
      if(s.data)setSubmissions(s.data);if(n.data)setNotifications(n.data);if(m.data)setMemberRows(m.data);if(u.data)setUnfreezeRequests(u.data);
      const err=[s,n,m,u].find(x=>x.error);if(err)setMessage(err.error.message);
    }
    setLoading(false);
  }

  async function savePatrolProfile(e){
    e.preventDefault();setLoading(true);setMessage("");
    if(!profilePhoto && !profile.profile_photo_path){setLoading(false);setMessage("Upload your profile photograph to continue.");return;}
    if(profilePhoto && (!["image/jpeg","image/png","image/webp"].includes(profilePhoto.type)||profilePhoto.size>5*1024*1024)){setLoading(false);setMessage("Use a JPG, PNG or WebP profile photo no larger than 5 MB.");return;}
    let photoPath=profile.profile_photo_path||null;
    if(profilePhoto){
      const ext=profilePhoto.name.split(".").pop().toLowerCase();
      const path=user.id+"/profile/"+crypto.randomUUID()+"."+ext;
      const {error:uploadError}=await supabase.storage.from("member-photos").upload(path,profilePhoto,{contentType:profilePhoto.type});
      if(uploadError){setLoading(false);setMessage("Photo upload failed: "+uploadError.message);return;}
      photoPath=path;
    }
    const updates={full_name:profileSetup.full_name.trim(),date_of_birth:profileSetup.date_of_birth,gender:profileSetup.gender,blood_group:profileSetup.blood_group||null,mobile_number:profileSetup.mobile_number.trim(),email_address:profileSetup.email_address.trim()||null,bsg_uid:profileSetup.bsg_uid.trim()||null,residential_address:profileSetup.residential_address.trim(),profile_photo_path:photoPath,profile_completed_at:profile.profile_completed_at||new Date().toISOString()};
    const {data,error}=await supabase.from("profiles").update(updates).eq("id",user.id).select("*").single();
    setLoading(false);
    if(error){setMessage("Could not save your profile: "+error.message);return;}
    setProfile(data);setMemberPhoto(null);setProfilePhoto(null);
    const {data:photoData}=await supabase.storage.from("member-photos").createSignedUrl(photoPath,3600);
    setProfilePhotoUrl(photoData?.signedUrl||"");
    setMessage("Your profile is complete. Patrol member registration is now open.");
    setTab("dashboard");
    await refreshData("patrol_leader",user.id);
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


  async function toggleMemberActive(row){const {error}=await supabase.from("member_records").update({is_active:!row.is_active,updated_at:new Date().toISOString()}).eq("id",row.id);setMessage(error?error.message:(row.is_active?"Member marked inactive.":"Member marked active."));await refreshData(profile.role,user.id);}
  async function viewMemberPhoto(row){if(!row.photo_path){setMessage("No member photo uploaded.");return;}const {data,error}=await supabase.storage.from("member-photos").createSignedUrl(row.photo_path,60);if(error){setMessage(error.message);return;}window.open(data.signedUrl,"_blank","noopener,noreferrer");}
  async function viewMemberForms(row){
    const paths=row.form_file_paths||[];
    if(!paths.length){setMessage("No membership form files uploaded.");return;}
    const results=await Promise.all(paths.map(async(path,index)=>{const {data,error}=await supabase.storage.from("member-forms").createSignedUrl(path,300);return error?{name:"File "+(index+1),error:error.message}:{name:"Membership form file "+(index+1),url:data.signedUrl};}));
    setFormLinks(results);setMessage(results.some(x=>x.error)?"Some files could not be opened.":"Private membership form files are ready to view.");
  }
  async function requestUnfreeze(row){const reason=window.prompt("Why do you need this member record unfrozen?");if(!reason?.trim())return;const {error}=await supabase.from("member_unfreeze_requests").insert({member_record_id:row.id,patrol_leader_id:user.id,reason:reason.trim()});setMessage(error?error.message:"Unfreeze request sent to Super Admin.");await refreshData(profile.role,user.id);}
  async function decideUnfreeze(row,approve){const {error}=await supabase.from("member_unfreeze_requests").update({status:approve?"approved":"rejected",reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",row.id);if(error){setMessage(error.message);return;}if(approve){await supabase.from("member_records").update({is_locked:false,final_status:"pending"}).eq("id",row.member_record_id);}await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.member_record_id,title:approve?"Unfreeze approved":"Unfreeze declined",message:approve?"You may now edit the member record and resubmit it.":"Your unfreeze request was not approved."});setMessage("Unfreeze request updated.");await refreshData(profile.role,user.id);}
  async function saveMember(e){
    e.preventDefault();setLoading(true);setMessage("");
    const currentPatrolCount=memberRows.filter(x=>x.patrol_leader_id===user.id).length;
    if(!editingMember && currentPatrolCount>=7){setLoading(false);setMessage("Your patrol already has seven registered members. Including you, the maximum patrol strength is eight.");return;}
    if(memberForm.patrol_position==="Assistant Patrol Leader"){
      const {data:existingAssistant,error:assistantError}=await supabase.from("member_records").select("id").eq("patrol_leader_id",user.id).eq("patrol_position","Assistant Patrol Leader");
      if(assistantError){setLoading(false);setMessage(assistantError.message);return;}
      if(existingAssistant?.some(x=>x.id!==editingMember?.id)){setLoading(false);setMessage("Only one Assistant Patrol Leader can be assigned in a patrol.");return;}
    }
    const existingFormPaths=editingMember?.form_file_paths||[];
    if(existingFormPaths.length+memberFormFiles.length>4){setLoading(false);setMessage("You can upload a maximum of four membership form files.");return;}
    if(!existingFormPaths.length&&!memberFormFiles.length){setLoading(false);setMessage("Upload at least one membership form file (PDF or photo).");return;}
    const allowedTypes=["application/pdf","image/jpeg","image/png","image/webp"];
    if(memberFormFiles.some(file=>!allowedTypes.includes(file.type)||file.size>10*1024*1024)){setLoading(false);setMessage("Use PDF, JPG, PNG or WebP files, each no larger than 10 MB.");return;}
    let photoPath=editingMember?.photo_path||null;
    if(memberPhoto){
      const ext=memberPhoto.name.split(".").pop().toLowerCase(),path=user.id+"/"+crypto.randomUUID()+"."+ext;
      const {error:upErr}=await supabase.storage.from("member-photos").upload(path,memberPhoto,{contentType:memberPhoto.type});
      if(upErr){setLoading(false);setMessage(upErr.message);return;}photoPath=path;
    }
    const uploadedFormPaths=[];
    for(const file of memberFormFiles){
      const ext=file.name.split(".").pop().toLowerCase(),path=user.id+"/"+crypto.randomUUID()+"."+ext;
      const {error:formUploadError}=await supabase.storage.from("member-forms").upload(path,file,{contentType:file.type});
      if(formUploadError){if(uploadedFormPaths.length)await supabase.storage.from("member-forms").remove(uploadedFormPaths);setLoading(false);setMessage("Membership form upload failed: "+formUploadError.message);return;}
      uploadedFormPaths.push(path);
    }
    const payload={...memberForm,patrol_position:memberForm.patrol_position||"Patrol Member",category:profile.category||"Scout",patrol_leader_id:user.id,photo_path:photoPath,form_file_paths:[...existingFormPaths,...uploadedFormPaths],submission_status:"draft",review_status:"pending",review_reason:"",otp_status:"not_sent",final_status:"pending",is_locked:false,updated_at:new Date().toISOString()};
    if(editingMember){
      const {error}=await supabase.from("member_records").update(payload).eq("id",editingMember.id);
      if(error){if(uploadedFormPaths.length)await supabase.storage.from("member-forms").remove(uploadedFormPaths);setLoading(false);setMessage(error.message);return;}
    }else{
      const {error}=await supabase.from("member_records").insert(payload);
      if(error){if(uploadedFormPaths.length)await supabase.storage.from("member-forms").remove(uploadedFormPaths);setLoading(false);setMessage(error.message);return;}
    }
    setLoading(false);setEditingMember(null);setMemberFormOpen(false);setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});
    setMessage("Member details and membership form files saved. Mark Completed when ready.");await refreshData(profile.role,user.id);
  }
  async function completeMember(row){
    const {error}=await supabase.from("member_records").update({submission_status:"completed",review_status:"pending",updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}setMessage("Member details submitted for Super Admin checking.");await refreshData(profile.role,user.id);
  }
  async function reviewMember(row,status){
    const reason=(memberReason[row.id]||"").trim();
    if(status==="disapproved"&&!reason){setMessage("Enter a reason for disapproval.");return;}
    const {error}=await supabase.from("member_records").update({review_status:status,review_reason:status==="disapproved"?reason:"",updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:status==="verified"?"Member details verified":"Corrections required",message:status==="verified"?"Details checked. You may now send the email OTP.":"Please correct the member record: "+reason});
    setMessage("Review saved and Patrol Leader notified.");await refreshData(profile.role,user.id);
  }
  async function markOmsUpdated(row){
    const {error}=await supabase.from("member_records").update({oms_status:"updated"}).eq("id",row.id);
    if(error){setMessage(error.message);return;}await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:"OMS updated",message:"The Super Admin has marked the OMS details as updated."});setMessage("OMS marked updated.");await refreshData(profile.role,user.id);
  }
  async function enterMemberUid(row){const uid=window.prompt("Enter the official BSG UID number for this member:");if(!uid?.trim())return;const {error}=await supabase.from("member_records").update({bsg_uid:uid.trim(),bsg_uid_known:true}).eq("id",row.id);setMessage(error?error.message:"BSG UID saved.");await refreshData(profile.role,user.id);}
  async function finalApprove(row){
    if(row.review_status!=="verified"||row.otp_status!=="verified"||row.oms_status!=="updated"){setMessage("Details, OTP and OMS must all be verified before final approval.");return;}
    const {error}=await supabase.from("member_records").update({final_status:"approved",is_locked:true}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:"Member record approved",message:"The member record is fully verified and now locked."});
    setMessage("Member record approved and locked.");await refreshData(profile.role,user.id);
  }
  async function sendMemberOtp(row){
    if(!row?.email){setMessage("This member has no registered email address.");return;}
    setOtpRecord(row);setLoading(true);setMessage("");
    const {error}=await otpClient.auth.signInWithOtp({email:row.email,options:{shouldCreateUser:true}});
    setLoading(false);if(error){setMessage(error.message);return;}
    setOtpSent(true);setOtpValue("");setTab("otp");
    setMessage("OTP sent to the member's registered email. Enter it to verify.");
  }
  async function verifyMemberOtp(e){
    e.preventDefault();if(!otpRecord)return;setLoading(true);setMessage("");
    const {error}=await otpClient.auth.verifyOtp({email:otpRecord.email,token:otpValue.trim(),type:"email"});
    if(error){setLoading(false);setMessage(error.message);return;}
    const {error:update}=await supabase.from("member_records").update({otp_status:"verified"}).eq("id",otpRecord.id);
    setLoading(false);if(update){setMessage(update.message);return;}
    setOtpSent(false);setOtpValue("");setOtpRecord(null);
    setMessage("Email OTP verified successfully.");
    await refreshData(profile.role,user.id);
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
    const recipients=leaders.filter(x=>x.is_active&&(noticeRecipient==="all"||x.user_id===noticeRecipient));
    if(!recipients.length){setLoading(false);setMessage("Create Patrol Leader accounts before sending notifications.");return;}
    const rows=recipients.map(x=>({recipient_user_id:x.user_id,title:noticeForm.title,message:noticeForm.message}));
    const {error}=await supabase.from("member_notifications").insert(rows);
    setLoading(false);if(error){setMessage(error.message);return;}
    setMessage("Notification sent successfully.");setNoticeForm({title:"",message:""});
    await refreshData("admin",user.id);
  }

  async function markRead(item){
    const {error}=await supabase.from("member_notifications").update({read_at:new Date().toISOString()}).eq("id",item.id);
    if(error){setMessage(error.message);return;}
    await refreshData(profile.role,user.id);
  }

  const isAdmin=profile?.role==="super_admin";
  const visibleMemberRows=memberRows.filter(x=>isAdmin||x.patrol_leader_id===user?.id);
  const nav=isAdmin?[
    ["dashboard","Dashboard",Home],["leaders","Patrols",Users],["members","Member Records",ClipboardList],["notifications","Notifications",Bell],["audit","Unfreeze Requests",FileText],["profile","My Profile",UserCircle]
  ]:profile?.profile_completed_at?[
    ["profile","My Profile",UserCircle],["dashboard","Dashboard",Home],["new","My Patrol",Plus],["otp","OTP Verification",ShieldCheck],["notifications","Notifications",Bell]
  ]:[["profile-setup","Complete Profile",UserCircle]];

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
      {tab==="profile-setup"&&!isAdmin&&<form className="panel data-form profile-setup-form" onSubmit={savePatrolProfile}><span className="eyebrow wide">FIRST-TIME PROFILE SETUP</span><h2 className="wide">Complete Your Patrol Leader Profile</h2><p className="wide">Complete your profile once before registering your patrol members. This screen will not appear again after you save your profile.</p><div className="wide profile-photo-preview">{profilePhoto?<p>Selected photo: {profilePhoto.name}</p>:profilePhotoUrl?<img style={{width:"120px",height:"120px",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:<div className="avatar">{(profileSetup.full_name||"P").slice(0,1)}</div>}</div><label className="wide">Upload your recent passport-size photograph *<input type="file" accept="image/jpeg,image/png,image/webp" required={!profile.profile_photo_path&&!profilePhoto} onChange={e=>setProfilePhoto(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP; maximum 5 MB. No membership form upload is required for your own profile.</small></label><label>Full Name *<input required value={profileSetup.full_name} onChange={e=>setProfileSetup({...profileSetup,full_name:e.target.value})}/></label><label>Date of Birth *<input required type="date" value={profileSetup.date_of_birth} onChange={e=>setProfileSetup({...profileSetup,date_of_birth:e.target.value})}/></label><label>Gender *<select required value={profileSetup.gender} onChange={e=>setProfileSetup({...profileSetup,gender:e.target.value})}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label><label>Blood Group<select value={profileSetup.blood_group} onChange={e=>setProfileSetup({...profileSetup,blood_group:e.target.value})}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(v=><option key={v}>{v}</option>)}</select></label><label>Mobile Number *<input required type="tel" value={profileSetup.mobile_number} onChange={e=>setProfileSetup({...profileSetup,mobile_number:e.target.value})}/></label><label>Contact Email<input type="email" value={profileSetup.email_address} onChange={e=>setProfileSetup({...profileSetup,email_address:e.target.value})}/></label><label>BSG UID (if available)<input value={profileSetup.bsg_uid} onChange={e=>setProfileSetup({...profileSetup,bsg_uid:e.target.value})}/></label><label className="wide">Residential Address *<textarea required rows="3" value={profileSetup.residential_address} onChange={e=>setProfileSetup({...profileSetup,residential_address:e.target.value})}/></label><label>Patrol Name<input value={profile.patrol_name||""} readOnly/></label><label>Section<input value={profile.category||"Scout"} readOnly/></label><p className="wide"><small>Your Patrol Name and Scout/Guide section are assigned by the Administrator. Save your profile to unlock the patrol dashboard and member registration.</small></p><button className="primary wide" disabled={loading}>{loading?"Saving Profile…":"Save Profile & Continue"}</button></form>}
      {tab==="dashboard"&&<><div className="welcome-banner"><span className="eyebrow">WELCOME BACK</span><h1>{profile.full_name}</h1><p>{isAdmin?"Manage Patrol Leader accounts, review records and monitor portal activity.":"Submit patrol records and follow your verification status."}</p></div><div className="stat-grid">{(isAdmin?[["Patrol Leaders",leaders.length,Users],["Member Records",memberRows.length,ClipboardList],["Awaiting Review",memberRows.filter(x=>x.submission_status==="completed"&&x.review_status==="pending").length,Clock3],["Approved",memberRows.filter(x=>x.final_status==="approved").length,CheckCircle2]]:[["My Members",memberRows.filter(x=>x.patrol_leader_id===user.id).length,ClipboardList],["Awaiting Review",memberRows.filter(x=>x.patrol_leader_id===user.id&&x.review_status==="pending"&&x.submission_status==="completed").length,Clock3],["Approved",memberRows.filter(x=>x.patrol_leader_id===user.id&&x.final_status==="approved").length,CheckCircle2],["Notifications",notifications.filter(x=>!x.read_at).length,Bell]]).map(([label,value,Icon])=><article className="stat-card" key={label}><Icon/><div><strong>{value}</strong><small>{label}</small></div></article>)}</div><section className="panel"><h3>Recent Member Records</h3><MemberRecords rows={memberRows.slice(0,5)} admin={isAdmin}/></section></>}
      {tab==="leaders"&&isAdmin&&<><div className="section-title"><div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h2>Create Patrol Leader Login</h2></div></div><form className="panel data-form" onSubmit={createLeader}><label>Category<select value={leaderForm.category} onChange={e=>setLeaderForm({...leaderForm,category:e.target.value})}><option value="Guide">Guides</option><option value="Scout">Scouts</option></select></label><label>BSG UID (if known)<input value={leaderForm.bsg_uid} onChange={e=>setLeaderForm({...leaderForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label><label>Full name<input required value={leaderForm.full_name} onChange={e=>setLeaderForm({...leaderForm,full_name:e.target.value})}/></label><label>Login ID<input required value={leaderForm.login_id} onChange={e=>setLeaderForm({...leaderForm,login_id:e.target.value})} placeholder="e.g. panther01"/></label><label>Patrol Name<input required value={leaderForm.patrol_name} onChange={e=>setLeaderForm({...leaderForm,patrol_name:e.target.value})}/></label><label>Mobile number<input required type="tel" value={leaderForm.mobile_number} onChange={e=>setLeaderForm({...leaderForm,mobile_number:e.target.value})}/></label><label className="wide">Temporary password<input required type="password" minLength="10" value={leaderForm.password} onChange={e=>setLeaderForm({...leaderForm,password:e.target.value})}/><small>Use a unique password of at least 10 characters. Share it privately.</small></label><button className="primary" disabled={loading}>{loading?"Creating…":"Create Patrol Login"} <Plus size={16}/></button></form><section className="panel"><h3>Registered Patrol Leaders</h3><input className="search-input" placeholder="Search by name, Login ID, BSG UID or patrol name" value={leaderSearch} onChange={e=>setLeaderSearch(e.target.value)}/><div className="section-title"><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Combined">Combined</option></select></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>BSG UID</th><th>Login ID</th><th>Patrol</th><th>Mobile</th><th>Status</th></tr></thead><tbody>{leaders.filter(x=>(memberCategory==="Combined"||x.category===memberCategory)&&[x.full_name,x.login_id,x.bsg_uid,x.patrol_name].some(v=>(v||"").toLowerCase().includes(leaderSearch.toLowerCase()))).map(x=><tr key={x.user_id}><td>{x.full_name}</td><td>{x.category||"—"}</td><td>{x.bsg_uid||"—"}</td><td>{x.login_id}</td><td>{x.patrol_name}</td><td>{x.mobile_number}</td><td><button className="outline" onClick={async()=>{const {error}=await supabase.from("profiles").update({is_active:!x.is_active}).eq("id",x.user_id);setMessage(error?error.message:(x.is_active?"Account deactivated.":"Account activated."));await refreshData("super_admin",user.id);}}>{x.is_active?"Set Inactive":"Set Active"}</button></td></tr>)}</tbody></table></div></section></>}
      {tab==="members"&&isAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">SCOUT & GUIDE MEMBER RECORDS</span><h2>Member Details Verification</h2></div><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Combined">Combined</option></select></div><input className="search-input" placeholder="Search member name, BSG UID, email or district" value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}/><MemberRecords rows={memberRows.filter(x=>(memberCategory==="Combined"||x.category===memberCategory)&&[x.first_name,x.middle_name,x.last_name,x.bsg_uid,x.email,x.district].some(v=>(v||"").toLowerCase().includes(memberSearch.toLowerCase())))} admin onPhoto={viewMemberPhoto} onForms={viewMemberForms} onToggleActive={toggleMemberActive} onEnterUid={enterMemberUid} onReview={reviewMember} onOms={markOmsUpdated} onApprove={finalApprove} reasons={memberReason} setReasons={setMemberReason}/><FormFileLinks links={formLinks}/></section>}
      {tab==="new"&&!isAdmin&&<><div className="section-title"><div><span className="eyebrow">PATROL MEMBER REGISTRATION</span><h2>{editingMember?"Edit Member Details":"My Patrol Members"}</h2></div><div><small>Patrol strength: {memberRows.filter(x=>x.patrol_leader_id===user.id).length+1}/8 (including you)</small><p className="roster-note">Maximum 8 people per patrol, including the Patrol Leader. The final student entered must be designated as Assistant Patrol Leader.</p></div><button className="primary" disabled={memberRows.filter(x=>x.patrol_leader_id===user.id).length>=7} onClick={()=>{setMemberFormOpen(true);setEditingMember(null);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);}}><Plus size={15}/> Add Member</button></div>{memberFormOpen&&<form className="panel data-form" onSubmit={saveMember}><h3 className="wide">Member Registration Form – {profile.category||"Scout"}</h3><label>Patrol Designation *<select required value={memberForm.patrol_position||"Patrol Member"} onChange={e=>setMemberForm({...memberForm,patrol_position:e.target.value})}><option value="Patrol Member">Patrol Member</option><option value="Assistant Patrol Leader">Assistant Patrol Leader</option></select><small>The last student entered in your patrol must be selected as Assistant Patrol Leader. Only one Assistant Patrol Leader is allowed.</small></label><label className="wide">Upload recent passport-size photograph in correct Scout / Guide uniform *<input type="file" required={!editingMember?.photo_path} accept="image/jpeg,image/png,image/webp" onChange={e=>setMemberPhoto(e.target.files?.[0]||null)}/></label><label className="wide">Upload completed Membership Form *<input type="file" required={!editingMember?.form_file_paths?.length} multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{const files=Array.from(e.target.files||[]);const total=(editingMember?.form_file_paths?.length||0)+files.length;if(total>4){setMemberFormFiles([]);e.target.value="";setMessage("Maximum four membership form files are allowed.");return;}setMemberFormFiles(files);setMessage("");}}/><small>Upload 1–4 files: one PDF or up to four photos/files. PDF, JPG, PNG and WebP accepted; maximum 10 MB per file. Existing files: {editingMember?.form_file_paths?.length||0}. New files selected: {memberFormFiles.length}.</small></label><label>BSG UID status<select value={memberForm.bsg_uid_known?"known":"unknown"} onChange={e=>setMemberForm({...memberForm,bsg_uid_known:e.target.value==="known",bsg_uid:e.target.value==="known"?memberForm.bsg_uid:""})}><option value="known">BSG UID Known</option><option value="unknown">Don't Know – Admin will enter</option></select></label>{memberForm.bsg_uid_known&&<label>BSG UID Number *<input required value={memberForm.bsg_uid} onChange={e=>setMemberForm({...memberForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label>}{[["first_name","First Name *","text"],["middle_name","Middle Name","text"],["last_name","Last Name *","text"],["nickname","Nickname","text"],["date_of_birth","Date of Birth *","date"],["gender","Gender *","select"],["blood_group","Blood Group","select"],["father_name","Father's Full Name *","text"],["father_occupation","Father's Occupation","text"],["mother_name","Mother's Full Name *","text"],["mother_occupation","Mother's Occupation","text"],["residential_address","Residential Address *","textarea"],["town_village","Town / Village *","text"],["district","District *","text"],["state","State *","text"],["pin_code","PIN Code *","text"],["primary_contact","Primary Contact Number *","tel"],["whatsapp_number","WhatsApp Number","tel"],["alternative_contact","Alternative Contact Number","tel"],["emergency_contact","Emergency Contact Number *","tel"],["emergency_contact_person","Emergency Contact Person & Relationship *","text"],["email","Email ID (correct email required for OTP) *","email"]].map(([key,label,type])=><label className={type==="textarea"?"wide":""} key={key}>{label}{type==="select"?<select required={key!=="middle_name"} value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}>{(key==="gender"?["","Male","Female","Other"]:["","A+","A-","B+","B-","AB+","AB-","O+","O-"]).map(v=><option value={v}>{v||"Select"}</option>)}</select>:type==="textarea"?<textarea required rows="3" value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}/>:<input required={key!=="middle_name"} type={type} value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}/>}</label>)}<p className="wide"><small>Middle Name is optional. All other fields and at least one membership form file are required. Uploaded forms are stored privately and visible only to the submitting Patrol Leader and authorised staff.</small></p><div className="form-actions wide"><button type="button" className="outline" onClick={()=>{setEditingMember(null);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);}}>Cancel</button><button className="primary" disabled={loading}>{loading?"Saving…":"Save Member Details"}</button></div></form>}<section className="panel"><h3>My Registered Patrol Members</h3><MemberRecords rows={memberRows.filter(x=>x.patrol_leader_id===user.id)} onPhoto={viewMemberPhoto} onForms={viewMemberForms} onToggleActive={toggleMemberActive} onUnfreeze={requestUnfreeze} onEdit={row=>{setEditingMember(row);setMemberFormOpen(true);setMemberFormFiles([]);setMemberForm(row);setTab("new");}} onComplete={row=>completeMember(row)} onOtp={row=>sendMemberOtp(row)} onUnfreeze={row=>requestUnfreeze(row)}/><FormFileLinks links={formLinks}/></section></>}
      {tab==="otp"&&!isAdmin&&<section className="panel"><h3>Email OTP Verification</h3>{otpSent?<form className="data-form" onSubmit={verifyMemberOtp}><p className="wide">Enter the 6-digit code sent to the member’s registered email address.</p><label className="wide">Email OTP<input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="Enter 6-digit OTP" value={otpValue} onChange={e=>setOtpValue(e.target.value.replace(/\D/g,"").slice(0,6))}/></label><button className="primary" disabled={loading}>Verify OTP</button></form>:<MemberRecords rows={memberRows.filter(x=>x.patrol_leader_id===user.id&&x.review_status==="verified"&&x.otp_status!=="verified")} onOtp={row=>sendMemberOtp(row)}/>}</section>}
      {tab==="submissions"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">{isAdmin?"ADMIN REVIEW":"YOUR RECORDS"}</span><h2>{isAdmin?"All Submissions":"My Submissions"}</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_changes">Needs Changes</option><option value="completed">Completed</option></select></div><SubmissionList rows={submissions.filter(x=>filter==="all"||x.status===filter)} isAdmin={isAdmin} onStatus={updateStatus}/></section>}
      {tab==="notifications"&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">PORTAL MESSAGES</span><h2>Notifications</h2></div></div>{notifications.map(x=><article className="notification-item" key={x.id}><Bell size={18}/><div><b>{x.title}</b><p>{x.message}</p><small>{dateLabel(x.created_at)}</small></div>{!isAdmin&&!x.read_at&&<button className="outline" onClick={()=>markRead(x)}>Mark read</button>}</article>)}{!notifications.length&&<p className="empty">No notifications yet.</p>}</section>{isAdmin&&<form className="panel data-form" onSubmit={sendNotification}><h3 className="wide">Send Notification to Patrol Leaders</h3><label className="wide">Send to<select value={noticeRecipient} onChange={e=>setNoticeRecipient(e.target.value)}><option value="all">All active Patrol Leaders</option>{leaders.filter(x=>x.is_active).map(x=><option key={x.user_id} value={x.user_id}>{x.full_name} ({x.login_id})</option>)}</select></label><label className="wide">Title<input required value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})}/></label><label className="wide">Message<textarea required rows="3" value={noticeForm.message} onChange={e=>setNoticeForm({...noticeForm,message:e.target.value})}/></label><button className="primary" disabled={loading}>Send Notification <Bell size={16}/></button></form>}</>}
      {tab==="audit"&&isAdmin&&<section className="panel"><h2>Unfreeze Requests</h2>{unfreezeRequests.filter(x=>x.status==="pending").map(x=><article className="notification-item" key={x.id}><div><b>Member record: {x.member_record_id}</b><p>{x.reason}</p><small>{dateLabel(x.created_at)}</small></div><button className="outline" onClick={()=>decideUnfreeze(x,true)}>Approve</button><button className="outline" onClick={()=>decideUnfreeze(x,false)}>Reject</button></article>)}{!unfreezeRequests.some(x=>x.status==="pending")&&<p className="empty">No pending unfreeze requests.</p>}</section>}
      {tab==="profile"&&<><section className="panel profile"><div className="avatar">{profilePhotoUrl?<img style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:(profile.full_name||"U").slice(0,1)}</div><h2>{profile.full_name}</h2><p>{profile.role==="super_admin"?"Administrator":"Patrol Leader"}</p><dl><dt>Login ID</dt><dd>{profile.login_id}</dd><dt>Patrol</dt><dd>{profile.patrol_name||"—"}</dd><dt>Email</dt><dd>{profile.email_address||user.email||"—"}</dd><dt>Mobile</dt><dd>{profile.mobile_number||"—"}</dd><dt>Date of Birth</dt><dd>{profile.date_of_birth||"—"}</dd><dt>Gender</dt><dd>{profile.gender||"—"}</dd><dt>Blood Group</dt><dd>{profile.blood_group||"—"}</dd><dt>Address</dt><dd>{profile.residential_address||"—"}</dd><dt>Account status</dt><dd>{profile.is_active?"Active":"Inactive"}</dd></dl></section><form className="panel data-form" onSubmit={changePassword}><h3 className="wide">{isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Admin Password":"Change Password"}</h3>{!(isAdmin&&user?.user_metadata?.password_initialized!==true)&&<label className="wide">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Enter current password"/></label>}<label>New password<input required type="password" autoComplete="new-password" minLength="10" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 10 characters"/></label><label>Confirm new password<input required type="password" autoComplete="new-password" minLength="10" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter new password"/></label><button className="primary" disabled={loading}>{loading?"Saving…":isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Password":"Update Password"}</button></form></>}
    </main><footer className="app-footer">{DIVISION} · OYMS SANKALP 4.0</footer></section></div>;

  return <div className="auth-page"><div className="auth-card"><h2>Loading portal…</h2></div></div>;
}

function FormFileLinks({links}){
  if(!links.length)return null;
  return <section className="panel"><h3>Membership Form Files</h3><div className="review-actions">{links.map((item,index)=>item.url?<a key={index} className="outline" href={item.url} target="_blank" rel="noreferrer">{item.name}</a>:<small key={index}>{item.name}: {item.error}</small>)}</div></section>;
}

function SubmissionList({rows,isAdmin,onStatus}){
  if(!rows.length)return <p className="empty">No submissions found.</p>;
  return <div className="submission-list">{rows.map(x=><article className="submission-item" key={x.id}><div className="submission-icon"><FileText/></div><div className="submission-main"><b>{x.title}</b><small>{x.category} · {dateLabel(x.submitted_at)}</small><p>{typeof x.details==="string"?x.details:JSON.stringify(x.details||{})}</p><span className={"status status-"+x.status}>{statusLabel(x.status)}</span></div>{isAdmin&&<div className="review-actions"><button onClick={()=>onStatus(x,"verified")}>Verify</button><button onClick={()=>onStatus(x,"needs_changes")}>Needs Changes</button><button onClick={()=>onStatus(x,"completed")}>Complete</button></div>}</article>)}</div>;
}


function MemberRecords({rows,admin=false,onEdit,onComplete,onOtp,onUnfreeze,onReview,onOms,onApprove,onEnterUid,onPhoto,onForms,onToggleActive,reasons={},setReasons}){
 if(!rows.length)return <p className="empty">No member records found.</p>;
 return <div className="table-wrap"><table><thead><tr><th>Member</th><th>Category</th><th>Patrol Designation</th><th>BSG UID</th><th>Form</th><th>Email OTP</th><th>Details Review</th><th>OMS</th><th>Final</th><th>Active</th><th>Action</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.first_name} {r.middle_name} {r.last_name}</b><small className="cell-sub">{r.email}<br/>DOB: {r.date_of_birth} · {r.gender}<br/>Father: {r.father_name} · Mother: {r.mother_name}<br/>{r.residential_address}, {r.town_village}, {r.district}, {r.state} – {r.pin_code}<br/>Primary: {r.primary_contact} · WhatsApp: {r.whatsapp_number||"—"}<br/>Emergency: {r.emergency_contact} · {r.emergency_contact_person}</small></td><td>{r.category}</td><td>{r.patrol_position||"Patrol Member"}</td><td>{r.bsg_uid_known?(r.bsg_uid||"Admin to enter"):"Not known"}</td><td>{r.submission_status}</td><td>{r.otp_status}</td><td>{r.review_status}{r.review_reason&&<small className="cell-sub">{r.review_reason}</small>}</td><td>{r.oms_status}</td><td>{r.final_status}{r.is_locked?" · Locked":""}</td><td>{r.is_active===false?"Inactive":"Active"}</td><td><div className="review-actions">{onToggleActive&&<button onClick={()=>onToggleActive(r)}>{r.is_active===false?"Set Active":"Set Inactive"}</button>}{onPhoto&&r.photo_path&&<button onClick={()=>onPhoto(r)}>View Photo</button>}{onForms&&(r.form_file_paths||[]).length>0&&<button onClick={()=>onForms(r)}>View Form ({r.form_file_paths.length})</button>}{admin&&!r.bsg_uid_known&&<button onClick={()=>onEnterUid(r)}>Enter BSG UID</button>}{admin&&r.submission_status==="completed"&&r.review_status!=="verified"&&<><input placeholder="Reason if disapproved" value={reasons[r.id]||""} onChange={e=>setReasons({...reasons,[r.id]:e.target.value})}/><button onClick={()=>onReview(r,"verified")}>Verify Details</button><button onClick={()=>onReview(r,"disapproved")}>Disapprove</button></>}{admin&&r.review_status==="verified"&&r.oms_status!=="updated"&&<button onClick={()=>onOms(r)}>OMS Updated</button>}{admin&&r.review_status==="verified"&&r.otp_status==="verified"&&r.oms_status==="updated"&&r.final_status!=="approved"&&<button onClick={()=>onApprove(r)}>Approve & Lock</button>}{!admin&&!r.is_locked&&<>{onEdit&&<button onClick={()=>onEdit(r)}>Edit</button>}{onComplete&&r.submission_status==="draft"&&<button onClick={()=>onComplete(r)}>Completed</button>}{onOtp&&r.review_status==="verified"&&r.otp_status!=="verified"&&<button onClick={()=>onOtp(r)}>Send OTP</button>}</>}{!admin&&r.is_locked&&onUnfreeze&&<button onClick={()=>onUnfreeze(r)}>Request Unfreeze</button>}</div></td></tr>)}</tbody></table></div>;
}
