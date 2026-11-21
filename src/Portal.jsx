import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Users, ClipboardList, Bell, FileText, LogOut, ArrowRight, LockKeyhole, Menu, X, CheckCircle2, Clock3, AlertCircle, Plus, Search, Flag, Home, UserCircle, RefreshCw, Megaphone, Archive, Trash2, CalendarDays } from "lucide-react";

const SUPABASE_URL = "https://kasnukztvipaxtqniktj.supabase.co";
const SUPABASE_KEY = "sb_publishable_fcvOMSaKVJGMEXgUqB7CFg_NbwaLVJ0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_EMAIL = "kushalkvofmkbsgindiaoyms@gmail.com";
const PORTAL = "oyms_sankalp_4";
const SCHOOL = "PM SHRI Kendriya Vidyalaya, Ordnance Factory, Medak";
const DIVISION = "KVS Hyderabad Division";
const isValidEmailFormat = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((value||"").trim());
const statusLabel = (s) => ({pending:"Pending",verified:"Verified",needs_changes:"Needs Changes",completed:"Completed"}[s] || s);
const dateLabel = (d) => d ? new Date(d).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}) : "—";
const isArchiveDue = (departedAt) => { if(!departedAt) return false; const due=new Date(departedAt); due.setMonth(due.getMonth()+1); return due.getTime()<=Date.now(); };
const categoryKey = (value) => { const v=String(value||"").trim().toLowerCase(); if(v.includes("scout")) return "Scouts"; if(v.includes("guide")) return "Guides"; if(v.includes("bulbul")) return "Bulbuls"; if(v.includes("cub")) return "Cubs"; return ""; };
const isTemporaryLaunchDay = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()) === "2026-11-17";

export default function Portal(){
  const [page,setPage] = useState("welcome");
  const [welcomeSlide,setWelcomeSlide] = useState(0);
  const [notificationPopup,setNotificationPopup] = useState(false);
  const [publicNotices,setPublicNotices] = useState([]);
  const [homepageSlides,setHomepageSlides] = useState([]);
  const [portalHeader,setPortalHeader] = useState("");
  const [headerFile,setHeaderFile] = useState(null);
  const [slideImageError,setSlideImageError] = useState(false);
  const liveHomepageSlides=homepageSlides.filter(x=>!x.expires_at||new Date(x.expires_at).getTime()>Date.now());
  const [slideFile,setSlideFile] = useState(null);
  const [slideTitle,setSlideTitle] = useState("");
  const [slideSubtitle,setSlideSubtitle] = useState("");
  const [slideEndAt,setSlideEndAt] = useState("");
  const [campaignMonth,setCampaignMonth] = useState(new Date().toISOString().slice(0,7)+"-01");
  const [campaignDeadline,setCampaignDeadline] = useState(new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-30");
  const [launchTitle,setLaunchTitle] = useState("");
  const [launchDescription,setLaunchDescription] = useState("");
  const [launchSchedule,setLaunchSchedule] = useState(new Date().toISOString().slice(0,10));
  const [launchExpiry,setLaunchExpiry] = useState("");
  const [launchMedia,setLaunchMedia] = useState(null);
  const [launchAnnouncements,setLaunchAnnouncements] = useState([]);
  const [activeAnnouncement,setActiveAnnouncement] = useState(null);
  const [announcementOpen,setAnnouncementOpen] = useState(false);
  const [confettiOn,setConfettiOn] = useState(false);
  const [launchCountdownOpen,setLaunchCountdownOpen] = useState(false);
  const [launchCountdownValue,setLaunchCountdownValue] = useState(10);
  const [publicNoticeForm,setPublicNoticeForm] = useState({title:"",body:""});
  const [loginType,setLoginType] = useState("");
  const [showStaffLogin,setShowStaffLogin] = useState(false);
  const [loginId,setLoginId] = useState("");
  const [password,setPassword] = useState("");
  const [user,setUser] = useState(null);
  const [profile,setProfile] = useState(null);
  const [tab,setTab] = useState("dashboard");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");
  const [leaders,setLeaders] = useState([]);
  const [adminAccounts,setAdminAccounts] = useState([]);
  const [adminForm,setAdminForm] = useState({full_name:"",email:"",start_date:new Date().toISOString().slice(0,10),renewal_date:"",login_id:"kvofmedak",password:""});
  const [submissions,setSubmissions] = useState([]);
  const [notifications,setNotifications] = useState([]);
  const [notificationArchiveOpen,setNotificationArchiveOpen] = useState(false);
  const [audit,setAudit] = useState([]);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [leaderForm,setLeaderForm] = useState({login_id:"",full_name:"",patrol_name:"",mobile_number:"",password:"",category:"Scout",bsg_uid:""});
  const [showLeaderPassword,setShowLeaderPassword] = useState(false);
  const [createdLeaderCredentials,setCreatedLeaderCredentials] = useState(null);
  const [recordForm,setRecordForm] = useState({title:"",category:"General",details:""});
  const [noticeForm,setNoticeForm] = useState({title:"",message:""});
  const [filter,setFilter] = useState("all");
  const [currentPassword,setCurrentPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [memberCategory,setMemberCategory] = useState("Scout");
  const [leaderSearch,setLeaderSearch] = useState("");
  const [memberSearch,setMemberSearch] = useState("");
  const [verificationSearch,setVerificationSearch] = useState("");
  const [memberVerificationView,setMemberVerificationView] = useState("dashboard");
  const [omsVerificationView,setOmsVerificationView] = useState("update");
  const [dataSearch,setDataSearch] = useState("");
  const [dataCategory,setDataCategory] = useState("all");
  const [dataPatrol,setDataPatrol] = useState("all");
  const [noticeRecipient,setNoticeRecipient] = useState("all");
  const [memberForm,setMemberForm] = useState({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",aadhaar_number:"",urn_number:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});
  const [memberPhoto,setMemberPhoto] = useState(null);
  const [profilePhoto,setProfilePhoto] = useState(null);
  const [profilePhotoUrl,setProfilePhotoUrl] = useState("");
  const [profileEditing,setProfileEditing] = useState(false);
  const [profileSetup,setProfileSetup] = useState({full_name:"",date_of_birth:"",gender:"",blood_group:"",mobile_number:"",email_address:"",bsg_uid:"",residential_address:""});
  const [memberFormFiles,setMemberFormFiles] = useState([]);
  const [formLinks,setFormLinks] = useState([]);
  const [memberRows,setMemberRows] = useState([]);
  const [membershipChecks,setMembershipChecks] = useState([]);
  const [membershipCampaign,setMembershipCampaign] = useState(null);
  const [unfreezeRequests,setUnfreezeRequests] = useState([]);
  const [superUnfreezeRequests,setSuperUnfreezeRequests] = useState([]);
  const [editingMember,setEditingMember] = useState(null);
  const [memberFormOpen,setMemberFormOpen] = useState(false);
  const [memberReason,setMemberReason] = useState({});
  const [uidDrafts,setUidDrafts] = useState({});
  const [adminEditingMember,setAdminEditingMember] = useState(null);
  const [adminMemberDraft,setAdminMemberDraft] = useState({});
  const [adminMemberSaving,setAdminMemberSaving] = useState(false);
  const [oyms2IdsOpen,setOyms2IdsOpen] = useState(false);
  const [oyms2ChildId,setOyms2ChildId] = useState("");
  const [oyms2LoginId,setOyms2LoginId] = useState("");
  const [oyms2Password,setOyms2Password] = useState("");

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{ if(data.session?.user) enterPortal(data.session.user); }); },[]);
  useEffect(()=>{try{localStorage.removeItem("oyms4_remember_login");localStorage.removeItem("oyms4_saved_login_id");}catch{}},[]);
  useEffect(()=>{ if(page!=="welcome") return; const timer=setInterval(()=>setWelcomeSlide(v=>liveHomepageSlides.length>1?(v+1)%liveHomepageSlides.length:v),7000); return ()=>clearInterval(timer); },[page,liveHomepageSlides.length]);
  useEffect(()=>{ loadPublicNotices(); },[]);
  useEffect(()=>{ loadHomepageSlides(); const refreshSlides=()=>loadHomepageSlides(); window.addEventListener("focus",refreshSlides); const refreshTimer=setInterval(refreshSlides,45000); return ()=>{window.removeEventListener("focus",refreshSlides);clearInterval(refreshTimer);}; },[]);
  useEffect(()=>{if(profile?.role==="super_admin"&&tab==="launch")loadLaunchAnnouncements();},[profile?.role,tab]);
  useEffect(()=>{if(page!=="app"||!user?.id||!profile?.role)return;const sync=()=>{if(document.visibilityState==="visible")refreshData(profile.role,user.id,true);};const timer=setInterval(sync,10000);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",sync);return()=>{clearInterval(timer);window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",sync);};},[page,user?.id,profile?.role]);
  function startTemporaryPortalLaunch(){
    if(!isSuperAdmin)return;
    setMobileMenu(false);setPage("welcome");setWelcomeSlide(0);setLaunchCountdownValue(10);setLaunchCountdownOpen(true);
    let remaining=10;
    const interval=window.setInterval(()=>{remaining-=1;setLaunchCountdownValue(remaining);if(remaining<=0)window.clearInterval(interval);},1000);
    window.setTimeout(()=>{setLaunchCountdownOpen(false);setConfettiOn(true);window.setTimeout(()=>setConfettiOn(false),6000);},10000);
  }
  async function loadPublicNotices(){const {data,error}=await supabase.from("notices").select("*").eq("is_published",true).order("published_on",{ascending:false}).limit(6);if(!error&&data)setPublicNotices(data);}
  async function loadHomepageSlides(){const {data:headerRow}=await supabase.from("homepage_slides").select("image_path,created_at").eq("title","__PORTAL_HEADER__").eq("is_active",true).order("created_at",{ascending:false}).limit(1).maybeSingle();if(headerRow?.image_path){const {data:headerAsset}=supabase.storage.from("homepage-slides").getPublicUrl(headerRow.image_path);setPortalHeader(headerAsset?.publicUrl||"");}else setPortalHeader("");const {data,error}=await supabase.from("homepage_slides").select("id,title,subtitle,image_path,sort_order,is_active,expires_at,created_at").neq("title","__PORTAL_HEADER__").eq("is_active",true).order("sort_order",{ascending:true}).order("created_at",{ascending:true});if(error){console.error("Homepage slides could not be loaded:",error);setHomepageSlides([]);setMessage("The homepage slides could not be loaded. Please refresh the page or contact the Super Admin.");return;}const rows=(data||[]).filter(x=>x.image_path).map(x=>{const {data:asset}=supabase.storage.from("homepage-slides").getPublicUrl(x.image_path);return {...x,image_url:asset?.publicUrl?asset.publicUrl+(asset.publicUrl.includes("?")?"&":"?")+"v="+encodeURIComponent(x.created_at||x.id):""};}).filter(x=>x.image_url);setHomepageSlides(rows);setWelcomeSlide(current=>Math.min(current,Math.max(0,rows.length-1)));setSlideImageError(false);if(!rows.length)console.warn("No active homepage slide records with image paths were returned.");}
  async function enterPortal(authUser){
    const {data:p,error} = await supabase.from("profiles").select("*").eq("id",authUser.id).maybeSingle();
    if(error || !p || !p.is_active || !["super_admin","admin","patrol_leader"].includes(p.role)){
      await supabase.auth.signOut();
      setMessage("This account is not authorised for OYMS Sankalp 4.0.");
      return;
    }
    if(p.role==="super_admin" && (authUser.email||"").toLowerCase()!==ADMIN_EMAIL){
      await supabase.auth.signOut();
      setMessage("Use the registered Super Admin email address.");
      return;
    }
    if(p.role==="patrol_leader" && !(authUser.email||"").toLowerCase().endsWith("@oyms.local")){
      await supabase.auth.signOut();
      setMessage("This account is not a registered Patrol Leader account.");
      return;
    }
    setUser(authUser); setProfile(p); setPage("app"); setMessage("");
    setProfileSetup({full_name:p.full_name||"",date_of_birth:p.date_of_birth||"",gender:p.gender||"",blood_group:p.blood_group||"",mobile_number:p.mobile_number||"",email_address:p.email_address||"local_cubs_oyms@gmail.com",bsg_uid:p.bsg_uid||"",residential_address:p.residential_address||""});
    if(p.profile_photo_path){
      const {data:photoData}=await supabase.storage.from("member-photos").createSignedUrl(p.profile_photo_path,3600);
      setProfilePhotoUrl(photoData?.signedUrl||"");
    }else setProfilePhotoUrl("");
    if(p.role==="patrol_leader" && !p.profile_completed_at){setTab("profile-setup");return;}
    if(p.role==="patrol_leader" && p.must_change_password){setTab("profile");setMessage("For account security, change your temporary password before opening your dashboard.");return;}
    await checkFirstLoginAnnouncement(authUser.id);
    if(["admin","super_admin"].includes(p.role) && authUser.user_metadata?.password_initialized!==true){setTab("profile");setMessage("Welcome. Set your password to finish activating your account.");return;}
    setTab("dashboard");
    await refreshData(p.role,authUser.id);
  }

  async function loadLaunchAnnouncements(){
    const {data,error}=await supabase.from("portal_announcements").select("*").order("created_at",{ascending:false}).limit(30);
    if(error){setMessage(error.message);return;}
    setLaunchAnnouncements((data||[]).map(x=>({...x,media_url:x.media_path?supabase.storage.from("portal-announcements").getPublicUrl(x.media_path).data.publicUrl:null})));
  }
  async function checkFirstLoginAnnouncement(userId){
    const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const {data:items,error}=await supabase.from("portal_announcements").select("*").eq("is_published",true).lte("starts_on",today).or("expires_on.is.null,expires_on.gte."+today).order("starts_on",{ascending:false}).limit(30);
    if(error||!items?.length)return;
    const ids=items.map(x=>x.id);
    const {data:seen}=await supabase.from("portal_announcement_views").select("announcement_id").eq("user_id",userId).in("announcement_id",ids);
    const viewed=new Set((seen||[]).map(x=>x.announcement_id));
    const next=items.find(x=>!viewed.has(x.id));
    if(next){await openAnnouncement({...next,media_url:next.media_path?supabase.storage.from("portal-announcements").getPublicUrl(next.media_path).data.publicUrl:null});}
  }
  async function publishLaunchAnnouncement(e){
    e.preventDefault();if(!launchTitle.trim()||!launchDescription.trim()||!launchSchedule||!launchExpiry||launchExpiry<launchSchedule){setMessage("Enter a valid Start Date and an Expiry Date on or after it.");return;}
    if(launchMedia&&(!["image/jpeg","image/png","image/webp","video/mp4","video/webm"].includes(launchMedia.type)||launchMedia.size>50*1024*1024)){setMessage("Choose JPG, PNG, WebP, MP4 or WebM media up to 50 MB.");return;}
    setLoading(true);setMessage("");let mediaPath=null,mediaType=null;
    if(launchMedia){
      const ext=(launchMedia.name.split(".").pop()||"bin").toLowerCase();mediaPath="updates/"+crypto.randomUUID()+"."+ext;mediaType=launchMedia.type.startsWith("video/")?"video":"image";
      const {error:upErr}=await supabase.storage.from("portal-announcements").upload(mediaPath,launchMedia,{contentType:launchMedia.type});
      if(upErr){setLoading(false);setMessage("Media upload failed: "+upErr.message);return;}
    }
    const startAt=new Date(launchSchedule+"T00:00:00+05:30").toISOString();
    const {error}=await supabase.from("portal_announcements").insert({title:launchTitle.trim(),description:launchDescription.trim(),media_path:mediaPath,media_type:mediaType,starts_on:launchSchedule,expires_on:launchExpiry,scheduled_at:startAt,is_published:true,created_by:user.id});
    if(error){if(mediaPath)await supabase.storage.from("portal-announcements").remove([mediaPath]);setLoading(false);setMessage("Launch update could not be saved: "+error.message);return;}
    setLaunchTitle("");setLaunchDescription("");setLaunchSchedule(new Date().toISOString().slice(0,10));setLaunchExpiry("");setLaunchMedia(null);setLoading(false);setMessage("Launch update scheduled and saved.");await loadLaunchAnnouncements();
  }
  async function deleteLaunchAnnouncement(item){
    if(!window.confirm("Delete this launch update?"))return;
    const {error}=await supabase.from("portal_announcements").delete().eq("id",item.id);
    if(error){setMessage(error.message);return;}
    if(item.media_path)await supabase.storage.from("portal-announcements").remove([item.media_path]);
    setMessage("Launch update deleted.");await loadLaunchAnnouncements();
  }
  async function openAnnouncement(item){
    setActiveAnnouncement(item);setAnnouncementOpen(true);
    await supabase.from("portal_announcement_views").upsert({announcement_id:item.id,user_id:user.id},{onConflict:"announcement_id,user_id",ignoreDuplicates:true});
  }
  function closeAnnouncement(){setAnnouncementOpen(false);setActiveAnnouncement(null);setConfettiOn(true);window.setTimeout(()=>setConfettiOn(false),5000);}
  async function saveOyms2Login(row, loginId, status){
    if(!isAdmin)return;
    const cleanId=String(loginId||"").trim();
    if(status==="can_login"&&!cleanId){setMessage("Enter the member's OYMS 2.0 Login ID before marking Can Login.");return;}
    setLoading(true);
    const {error}=await supabase.from("member_records").update({oyms2_login_id:cleanId||null,oyms2_login_status:status}).eq("id",row.id);
    setLoading(false);
    if(error){setMessage("Could not update member login status: "+error.message);return;}
    setMemberRows(rows=>rows.map(x=>x.id===row.id?{...x,oyms2_login_id:cleanId||null,oyms2_login_status:status}:x));
    setMessage("OYMS 2.0 login status saved.");
  }
  async function createOyms2MemberLogin(){
    if(!isAdmin)return;
    const row=visibleMemberRows.find(r=>r.id===oyms2ChildId);
    const loginId=String(oyms2LoginId||"").trim().toLowerCase();
    if(!row){setMessage("Please select a child.");return;}
    if(!/^[a-z0-9._-]{3,30}$/.test(loginId)){setMessage("Login ID must be 3–30 letters, numbers, dots, underscores or hyphens.");return;}
    if(String(oyms2Password||"").length<12){setMessage("Temporary password must contain at least 12 characters.");return;}
    setLoading(true);setMessage("");
    const {data,error}=await supabase.functions.invoke("create-oyms2-member-account",{body:{member_record_id:row.id,login_id:loginId,password:oyms2Password}});
    setLoading(false);
    if(error||!data?.success){setMessage(data?.error||error?.message||"Could not create the OYMS 2.0 account.");return;}
    setMemberRows(rows=>rows.map(r=>r.id===row.id?{...r,oyms2_login_id:loginId,oyms2_login_status:"can_login"}:r));
    setOyms2IdsOpen(false);setOyms2ChildId("");setOyms2LoginId("");setOyms2Password("");
    setMessage("Working OYMS 2.0 member account created for "+[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")+". Status changed to Can Login. Give the child the Login ID and temporary password securely; it is not stored or included in CSV.");
  }
  function exportOyms2MemberLogins(rows){
    const data=[["Member Name","Category","Patrol","BSG UID","OYMS 2.0 Login ID","Login Status"],...rows.map(r=>[[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" "),r.category||"",leaders.find(x=>x.user_id===r.patrol_leader_id)?.patrol_name||"",r.bsg_uid||"",r.oyms2_login_id||"",r.oyms2_login_status==="can_login"?"Can Login":"Still in Progress"])];
    const csv=data.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\\r\\n");
    const blob=new Blob(["\\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="OYMS-2.0-Member-Login-Status.csv";a.click();URL.revokeObjectURL(url);
  }
  async function refreshData(role,userId,silent=false){
    if(!silent)setLoading(true);
    if(role==="super_admin"){
      const [admins,requests]=await Promise.all([
        supabase.from("profiles").select("id,full_name,email,email_address,login_id,start_date,renewal_date,is_active,created_at").eq("role","admin").order("created_at",{ascending:false}),
        supabase.from("member_unfreeze_requests").select("id,reason,status,created_at,admin_note,admin_forwarded_at").eq("status","forwarded_to_super_admin").order("admin_forwarded_at",{ascending:false})
      ]);
      if(admins.data)setAdminAccounts(admins.data);if(requests.data)setSuperUnfreezeRequests(requests.data);
      if(admins.error)setMessage(admins.error.message);if(requests.error)setMessage(requests.error.message);
    }
    if(role==="admin"){
      const [l,s,n,a,m,u,h]=await Promise.all([
        supabase.from("profiles").select("*").eq("role","patrol_leader").order("created_at",{ascending:false}),
        supabase.from("patrol_submissions").select("*").order("submitted_at",{ascending:false}),
        supabase.from("member_notifications").select("*").order("created_at",{ascending:false}).limit(100),
        supabase.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(100),
        supabase.from("member_records").select("*").order("created_at",{ascending:false}),
        supabase.from("member_unfreeze_requests").select("*").order("created_at",{ascending:false}),
        supabase.from("member_membership_checks").select("*").order("checked_at",{ascending:false}).limit(500)
      ]);
      if(l.data)setLeaders(l.data);if(s.data)setSubmissions(s.data);if(n.data)setNotifications(n.data);if(a.data)setAudit(a.data);if(m.data)setMemberRows(m.data);if(u.data)setUnfreezeRequests(u.data);if(h.data)setMembershipChecks(h.data);
      const err=[l,s,n,a,m,u,h].find(x=>x.error);if(err)setMessage(err.error.message);
    }else if(role==="patrol_leader"){
      const [s,n,m,u,h]=await Promise.all([
        supabase.from("patrol_submissions").select("*").eq("patrol_leader_id",userId).order("submitted_at",{ascending:false}),
        supabase.from("member_notifications").select("*").eq("recipient_user_id",userId).order("created_at",{ascending:false}),
        supabase.from("member_records").select("*").eq("patrol_leader_id",userId).eq("is_departed",false).order("created_at",{ascending:false}),
        supabase.from("member_unfreeze_requests").select("*").eq("patrol_leader_id",userId).order("created_at",{ascending:false}),
        supabase.from("member_membership_checks").select("*").eq("patrol_leader_id",userId).order("checked_at",{ascending:false}).limit(500)
      ]);
      if(s.data)setSubmissions(s.data);if(n.data)setNotifications(n.data);if(m.data)setMemberRows(m.data);if(u.data)setUnfreezeRequests(u.data);if(h.data)setMembershipChecks(h.data);
      const err=[s,n,m,u,h].find(x=>x.error);if(err)setMessage(err.error.message);
    }
    const campaignMonthStart=new Date().toISOString().slice(0,7)+"-01";
    const {data:campaign}=await supabase.from("membership_verification_campaigns").select("*").eq("month_start",campaignMonthStart).maybeSingle();
    setMembershipCampaign(campaign||null);
    if(!silent)setLoading(false);
  }

  function exportMemberRows(format,rows=visibleMemberRows){
    const fields=[
      ["Member Name",r=>[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" ")],
      ["Category",r=>r.category||""],["Patrol",r=>r.patrol_name||profile?.patrol_name||""],
      ["Date of Birth",r=>r.date_of_birth||""],["Gender",r=>r.gender||""],["Blood Group",r=>r.blood_group||""],
      ["BSG UID",r=>r.bsg_uid||""],["Mobile",r=>r.primary_contact||r.mobile_number||""],
      ["Email",r=>r.email||""],["District",r=>r.district||""],
      ["Profile Status",r=>statusLabel(r.submission_status||"")],
      ["UID/Details Status",r=>statusLabel(r.review_status||"")],
      ["Official OYMS Status",r=>r.oms_status||""],["Final Status",r=>r.final_status||""]
    ];
    const safe=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    const csvCell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
    const rowsOut=rows.map(r=>fields.map(([,get])=>get(r)));
    const filename="BSG-Member-Register-"+new Date().toISOString().slice(0,10);
    if(format==="excel"){
      const csv=[fields.map(([label])=>csvCell(label)),...rowsOut.map(row=>row.map(csvCell))].map(row=>row.join(",")).join("\r\n");
      const blob=new Blob(["\\ufeff",csv],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);
      setMessage("Member register exported in Excel-compatible CSV format.");
      return;
    }
    const htmlRows=rowsOut.map(row=>"<tr>"+row.map(v=>"<td>"+safe(v)+"</td>").join("")+"</tr>").join("");
    const html="<html><head><title>"+filename+"</title><style>body{font:11px Arial;padding:18px;color:#222}h2{text-align:center;color:#321657}p{text-align:center;font-size:10px}table{border-collapse:collapse;width:100%;font-size:9px}th,td{border:1px solid #777;padding:5px;text-align:left}th{background:#eee} @page{size:landscape;margin:12mm}</style></head><body><h2>PM SHRI Kendriya Vidyalaya Ordnance Factory Medak</h2><p>Bharat Scouts & Guides · Member Register · "+safe(new Date().toLocaleDateString("en-IN"))+"</p><table><thead><tr>"+fields.map(([label])=>"<th>"+safe(label)+"</th>").join("")+"</tr></thead><tbody>"+htmlRows+"</tbody></table><script>window.onload=()=>window.print()<\\/script></body></html>";
    const win=window.open("","_blank");if(!win){setMessage("Allow pop-ups to create the PDF print view.");return;}
    win.document.open();win.document.write(html);win.document.close();setMessage("Print view opened. Choose Save as PDF in the print dialog.");
  }

  async function savePatrolProfile(e){
    e.preventDefault();setLoading(true);setMessage("");
    if(profile.role==="patrol_leader"&&!profilePhoto&&!profile.profile_photo_path){setLoading(false);setMessage("Upload your profile photograph to continue.");return;}
    if(profilePhoto&&(!["image/jpeg","image/png","image/webp"].includes(profilePhoto.type)||profilePhoto.size>5*1024*1024)){setLoading(false);setMessage("Use a JPG, PNG or WebP profile photo no larger than 5 MB.");return;}
    let photoPath=profile.profile_photo_path||null;
    if(profilePhoto){
      const ext=profilePhoto.name.split(".").pop().toLowerCase();
      const path=user.id+"/profile/"+crypto.randomUUID()+"."+ext;
      const {error:uploadError}=await supabase.storage.from("member-photos").upload(path,profilePhoto,{contentType:profilePhoto.type});
      if(uploadError){setLoading(false);setMessage("Photo upload failed: "+uploadError.message);return;}
      photoPath=path;
    }
    const updates={full_name:profileSetup.full_name.trim(),date_of_birth:profileSetup.date_of_birth||null,gender:profileSetup.gender||null,blood_group:profileSetup.blood_group||null,mobile_number:profileSetup.mobile_number.trim(),email_address:profileSetup.email_address.trim()||null,bsg_uid:profileSetup.bsg_uid.trim()||null,residential_address:profileSetup.residential_address.trim(),profile_photo_path:photoPath,...(profile.role==="patrol_leader"?{profile_completed_at:profile.profile_completed_at||new Date().toISOString()}:{})};
    const {data,error}=await supabase.from("profiles").update(updates).eq("id",user.id).select("*").single();
    setLoading(false);
    if(error){setMessage("Could not save your profile: "+error.message);return;}
    setProfile(data);setProfilePhoto(null);setProfileEditing(false);
    if(photoPath){const {data:photoData}=await supabase.storage.from("member-photos").createSignedUrl(photoPath,3600);setProfilePhotoUrl(photoData?.signedUrl||"");}
    if(data.must_change_password){setMessage("Your profile is saved. Please change the temporary password to continue.");setTab("profile");return;}
    setMessage("Profile changes saved successfully.");
    setTab("profile");
    await refreshData(data.role,user.id);
  }

  async function requestAdminActivation(){
    setLoading(true);setMessage("");
    const {error}=await supabase.auth.signInWithOtp({email:ADMIN_EMAIL,options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+window.location.pathname}});
    setLoading(false);
    setMessage(error?error.message:"A secure sign-in link has been sent to the administrator email. Open it on this device to activate the Admin account.");
  }

  async function continueWithTemporaryPassword(){
    if(profile?.role!=="patrol_leader" || !profile.profile_completed_at){setMessage("Complete your profile before opening the dashboard.");return;}
    setLoading(true);setMessage("");
    const {data:updatedProfile,error}=await supabase.from("profiles").update({must_change_password:false}).eq("id",user.id).select("*").single();
    setLoading(false);
    if(error){setMessage("Could not continue with your temporary password: "+error.message);return;}
    setProfile(updatedProfile);
    setTab("dashboard");
    await refreshData("patrol_leader",user.id);
    setMessage("You continued with your existing password. Your dashboard is ready.");
  }

  async function changePassword(e){
    e.preventDefault();
    const isInitialAdminPassword = (isAdmin||isSuperAdmin) && user?.user_metadata?.password_initialized !== true;
    if(!isInitialAdminPassword){
      if(!currentPassword){setMessage("Enter your current password.");return;}
      const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:currentPassword});
      if(verifyError){setMessage("Current password is incorrect.");return;}
    }
    if(newPassword.length<12){setMessage("Choose a password with at least 12 characters.");return;}
    if(newPassword!==confirmPassword){setMessage("New password and confirmation do not match.");return;}
    setLoading(true);
    const {error}=await supabase.auth.updateUser({password:newPassword,data:{password_initialized:true}});
    if(error){setLoading(false);setMessage(error.message);return;}
    let refreshedProfile=profile;
    if(profile?.role==="patrol_leader"){
      const {data:updatedProfile,error:profileError}=await supabase
        .from("profiles")
        .update({must_change_password:false})
        .eq("id",user.id)
        .select("*")
        .single();
      if(profileError){
        setLoading(false);
        setMessage("Password changed, but dashboard access could not be unlocked: "+profileError.message);
        return;
      }
      refreshedProfile=updatedProfile;
      setProfile(updatedProfile);
    }
    setLoading(false);
    setCurrentPassword("");setNewPassword("");setConfirmPassword("");
    const {data:sessionData}=await supabase.auth.getUser();
    if(sessionData?.user)setUser(sessionData.user);
    if(refreshedProfile?.role==="patrol_leader" && refreshedProfile.profile_completed_at && !refreshedProfile.must_change_password){
      setTab("dashboard");
      await refreshData("patrol_leader",user.id);
      setMessage("Password updated. Your Patrol Leader dashboard is now unlocked.");
    }else if(refreshedProfile?.role==="admin"||refreshedProfile?.role==="super_admin"){
      setTab("dashboard");
      await refreshData(refreshedProfile.role,user.id);
      setMessage("Password saved. Your dashboard is ready.");
    }else{
      setMessage("Password saved successfully. Complete your profile to open the dashboard.");
    }
  }

  async function signIn(e){
    e.preventDefault(); setLoading(true); setMessage("");
    const identity = (loginType==="patrol"||loginType==="admin") ? loginId.trim().toLowerCase()+"@oyms.local" : loginId.trim().toLowerCase();
    if(loginType==="super_admin" && identity!==ADMIN_EMAIL){setLoading(false);setMessage("Enter the registered Super Admin email address.");return;}
    const {data,error}=await supabase.auth.signInWithPassword({email:identity,password});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    await enterPortal(data.user);
  }

  async function signOut(){await supabase.auth.signOut();setUser(null);setProfile(null);setPage("welcome");setLoginType("");setPassword("");setLoginId("");setMessage("");}

  function generateTemporaryPassword(){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes=crypto.getRandomValues(new Uint8Array(16));
    const random=Array.from(bytes,b=>chars[b%chars.length]).join("");
    setLeaderForm(current=>({...current,password:"A"+random+"!7a"}));
    setShowLeaderPassword(true);
  }
  async function copyLeaderCredentials(details){
    const textValue="OYMS Sankalp 4.0 Patrol Login\nLogin ID: "+details.login_id+"\nTemporary password: "+details.password+"\nLogin URL: "+window.location.origin+window.location.pathname;
    try{await navigator.clipboard.writeText(textValue);setMessage("Login details copied. Share them privately with the Patrol Leader.");}
    catch{setMessage("Copy is unavailable in this browser. Select and copy the login details shown on screen.");}
  }
  async function resetLeaderPassword(row){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes=crypto.getRandomValues(new Uint8Array(18));
    const temporaryPassword="A"+Array.from(bytes,b=>chars[b%chars.length]).join("")+"!7a";
    if(!window.confirm("Generate a new temporary password for "+row.full_name+" ("+row.login_id+")? Their next login will require a password change."))return;
    setLoading(true);setMessage("");
    const {data,error}=await supabase.functions.invoke("reset-patrol-password",{body:{user_id:row.user_id,password:temporaryPassword}});
    setLoading(false);
    if(error||data?.error){setMessage(data?.error||error.message);return;}
    setCreatedLeaderCredentials({login_id:row.login_id,password:temporaryPassword,full_name:row.full_name,patrol_name:row.patrol_name});
    setMessage("Temporary password reset. Copy the details below and share them privately.");
    await refreshData("admin",user.id);
  }
  function exportPatrolLeaderAccounts(patrolName=""){
    if(!isAdmin)return;
    const selected=leaders.filter(x=>!patrolName||x.patrol_name===patrolName);
    const rows=[["Full Name","Login ID","Category","Patrol Name","BSG UID","Mobile Number","Account Status"]];
    selected.forEach(x=>rows.push([x.full_name||"",x.login_id||"",x.category||"",x.patrol_name||"",x.bsg_uid||"",x.mobile_number||"",x.is_active?"Active":"Inactive"]));
    const csv=rows.map(row=>row.map(value=>{const safe=String(value??"").replace(/^[=+@]/,"'");return '"'+safe.replace(/"/g,'""')+'"';}).join(",")).join("\r\n");
    const blob=new Blob(["\\uFEFF",csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download="OYMS-"+(patrolName?patrolName.replace(/[^a-z0-9_-]/gi,"-")+"-":"")+"Patrol-Login-IDs.csv";
    document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    setMessage((patrolName?"Patrol-wise":"All patrol")+" Login ID list exported. Passwords are excluded for security.");
  }
  async function createAdminAccount(e){
    e.preventDefault();setLoading(true);setMessage("");
    const clean={full_name:adminForm.full_name.trim(),email:adminForm.email.trim().toLowerCase(),start_date:adminForm.start_date,renewal_date:adminForm.renewal_date,login_id:adminForm.login_id.trim().toLowerCase(),password:adminForm.password};
    if(!clean.full_name||!isValidEmailFormat(clean.email)||!/^[a-z0-9._-]{3,30}$/.test(clean.login_id)||!clean.start_date||!clean.renewal_date||clean.renewal_date<clean.start_date){setLoading(false);setMessage("Enter the Admin name, a valid email, and a Renewal Date on or after the Start Date.");return;}
    const {data,error}=await supabase.functions.invoke("create-admin-account",{body:clean});
    setLoading(false);
    if(error||data?.error){setMessage(data?.error||error.message);return;}
    setAdminForm({full_name:"",email:"",start_date:new Date().toISOString().slice(0,10),renewal_date:"",login_id:"kvofmedak",password:""});setMessage("Admin account created. The Admin must change the temporary password at first login.");
    await refreshData("super_admin",user.id);
  }
  async function setAdminAccountActive(row,active){
    if(!isSuperAdmin)return;
    const {error}=await supabase.from("profiles").update({is_active:active}).eq("id",row.id).eq("role","admin");
    setMessage(error?error.message:(active?"Admin account activated.":"Admin account deactivated."));
    await refreshData("super_admin",user.id);
  }

  async function createLeader(e){
    e.preventDefault(); setLoading(true); setMessage("");
    const clean={...leaderForm,login_id:leaderForm.login_id.trim().toLowerCase(),full_name:leaderForm.full_name.trim(),patrol_name:leaderForm.patrol_name.trim(),mobile_number:leaderForm.mobile_number.trim()};
    if(!/^[a-z0-9._-]{3,30}$/.test(clean.login_id)){setLoading(false);setMessage("Login ID must be 3–30 letters, numbers, dots, underscores or hyphens.");return;}
    if(clean.password.length<12){setLoading(false);setMessage("Use a temporary password of at least 12 characters.");return;}
    const {data,error}=await supabase.functions.invoke("create-patrol-account",{body:clean});
    setLoading(false);
    if(error || data?.error){setMessage(data?.error || error.message);return;}
    setCreatedLeaderCredentials({login_id:clean.login_id,password:clean.password,full_name:clean.full_name,patrol_name:clean.patrol_name});
    setMessage("Patrol Leader account created. Copy the temporary login details below and share them privately.");
    setLeaderForm({login_id:"",full_name:"",patrol_name:"",mobile_number:"",password:"",category:"Scout",bsg_uid:""});
    setShowLeaderPassword(false);
    await refreshData("admin",user.id);
  }


  async function toggleMemberActive(row){const {error}=await supabase.from("member_records").update({is_active:!row.is_active,updated_at:new Date().toISOString()}).eq("id",row.id);setMessage(error?error.message:(row.is_active?"Member marked inactive.":"Member marked active."));await refreshData(profile.role,user.id);}
  async function viewMemberPhoto(row){if(!row.photo_path){setMessage("No member photo uploaded.");return;}const {data,error}=await supabase.storage.from("member-photos").createSignedUrl(row.photo_path,60);if(error){setMessage(error.message);return;}window.open(data.signedUrl,"_blank","noopener,noreferrer");}
  async function viewMemberForms(row){
    const paths=row.form_file_paths||[];
    if(!paths.length){setMessage("No membership form files uploaded.");return;}
    const results=await Promise.all(paths.map(async(path,index)=>{const {data,error}=await supabase.storage.from("member-forms").createSignedUrl(path,300);return error?{name:"File "+(index+1),error:error.message}:{name:"Membership form file "+(index+1),url:data.signedUrl};}));
    setFormLinks(results);setMessage(results.some(x=>x.error)?"Some files could not be opened.":"Private membership form files are ready to view.");
  }
  async function requestUnfreeze(row){const reason=window.prompt("Why do you need this member record unfrozen?");if(!reason?.trim())return;const {error}=await supabase.from("member_unfreeze_requests").insert({member_record_id:row.id,patrol_leader_id:user.id,reason:reason.trim()});setMessage(error?error.message:"Unfreeze request sent to Admin.");await refreshData(profile.role,user.id);}
  async function forwardUnfreeze(row){if(!isAdmin)return;const note=window.prompt("Add an Admin note for the Super Admin (optional):")||"";const {error}=await supabase.from("member_unfreeze_requests").update({status:"forwarded_to_super_admin",admin_forwarded_by:user.id,admin_forwarded_at:new Date().toISOString(),admin_note:note}).eq("id",row.id).eq("status","pending");if(error){setMessage("Could not forward request: "+error.message);return;}setMessage("Unfreeze request forwarded to Super Admin. The member record remains locked.");await refreshData(profile.role,user.id);}
  async function decideSuperUnfreeze(row,approve){if(!isSuperAdmin)return;if(!window.confirm(approve?"Approve this unfreeze permission? The linked record will be unlocked for the Patrol Leader.":"Reject this unfreeze request?"))return;const {error}=await supabase.from("member_unfreeze_requests").update({status:approve?"approved":"rejected",super_admin_reviewed_by:user.id,super_admin_reviewed_at:new Date().toISOString(),reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",row.id).eq("status","forwarded_to_super_admin");if(error){setMessage("Decision could not be saved: "+error.message);return;}setMessage(approve?"Unfreeze permission approved. The record is unlocked by the secure database workflow.":"Unfreeze request rejected.");await refreshData(profile.role,user.id);}
  async function saveMember(e){
    e.preventDefault();setMessage("");
    if(!isValidEmailFormat(memberForm.email)){setMessage("Enter a correctly written email address, for example name@example.com.");return;}
    if(!/^\d{12}$/.test(String(memberForm.aadhaar_number||"").replace(/\s/g,""))){setMessage("Enter the 12-digit Aadhaar number.");return;}
    setLoading(true);
    const currentPatrolCount=memberRows.filter(x=>x.patrol_leader_id===user.id&&(!leaderCategory||categoryKey(x.category||profile.category)===leaderCategory)).length;
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
    const cleanBsgUid=(memberForm.bsg_uid||"").trim();
    const payload={...memberForm,middle_name:(memberForm.middle_name||"").trim()||null,bsg_uid:cleanBsgUid||null,bsg_uid_known:!!cleanBsgUid,email:memberForm.email.trim().toLowerCase(),patrol_position:memberForm.patrol_position||"Patrol Member",category:profile.category||"Scout",patrol_leader_id:user.id,photo_path:photoPath,form_file_paths:[...existingFormPaths,...uploadedFormPaths],submission_status:"draft",review_status:"pending",review_reason:"",otp_status:"not_sent",oms_status:"not_updated",final_status:"pending",is_locked:false,updated_at:new Date().toISOString()};
    if(editingMember){
      const {error}=await supabase.from("member_records").update(payload).eq("id",editingMember.id);
      if(error){if(uploadedFormPaths.length)await supabase.storage.from("member-forms").remove(uploadedFormPaths);setLoading(false);setMessage(error.message);return;}
    }else{
      const {error}=await supabase.from("member_records").insert(payload);
      if(error){if(uploadedFormPaths.length)await supabase.storage.from("member-forms").remove(uploadedFormPaths);setLoading(false);setMessage(error.message);return;}
    }
    setLoading(false);setEditingMember(null);setMemberFormOpen(false);setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",aadhaar_number:"",urn_number:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});
    setMessage("Member details and membership form files saved. Mark Completed when ready.");await refreshData(profile.role,user.id);
  }
  async function completeMember(row){
    const {error}=await supabase.from("member_records").update({submission_status:"completed",review_status:"pending",updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}setMemberVerificationView("entered");setTab("member-verification");setMessage("Member moved to the Entered page and submitted for Admin review. The Admin can now review the submission in the dashboard.");await refreshData(profile.role,user.id);
  }
  async function reviewMember(row,status){
    if(!isAdmin){setMessage("Only the Admin can review member details.");return;}
    if(row.submission_status!=="completed"){setMessage("The Patrol Leader must submit this member record for Admin review first.");return;}
    if(status==="verified"&&!String(row.bsg_uid||"").trim()){setMessage("Enter and save the official BSG UID before verifying member details.");return;}
    if(row.is_locked||row.final_status==="approved"){setMessage("This member record is locked. Approve an Unfreeze Request before making changes.");return;}
    const reason=(memberReason[row.id]||"").trim();
    if(status==="disapproved"&&!reason){setMessage("Enter a reason for disapproval.");return;}
    const {error}=await supabase.from("member_records").update({review_status:status,review_reason:status==="disapproved"?reason:"",updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:status==="verified"?"Member details verified":"Corrections required",message:status==="verified"?"Details checked by Admin. The record can proceed to OMS update and final approval.":"Please correct the member record: "+reason});
    setMemberVerificationView(status==="verified"?"verified":"needs_changes");setTab("member-verification");setMessage(status==="verified"?"Member moved to the Verified page. Patrol Leader notified.":"Member moved to Needs Changes. Patrol Leader notified.");await refreshData(profile.role,user.id);
  }
  async function markOmsUpdated(row,status="completed"){
    if(!isAdmin){setMessage("Only the Admin can update final OYMS status.");return;}
    if(row.review_status!=="verified"||!String(row.bsg_uid||"").trim()){setMessage("Enter the BSG UID and verify member details before starting the official OYMS update.");return;}
    if(row.is_locked||row.final_status==="approved"){setMessage("This member record is already approved and locked.");return;}
    if(status==="completed"&&row.oms_status!=="in_progress"){setMessage("First mark the official OYMS update as In Progress. Then mark it Completed when finished.");return;}
    if(status==="in_progress"&&row.oms_status==="completed"){setMessage("The official OYMS update is already completed.");return;}
    if(status==="not_updated"&&row.oms_status!=="not_updated"){setMessage("The official OYMS update cannot be moved backwards. Complete the current stage instead.");return;}
    const {error}=await supabase.from("member_records").update({oms_status:status,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:status==="in_progress"?"OYMS update in progress":"OYMS verification completed",message:status==="in_progress"?"The Admin has started updating this member profile in the official OYMS.":"The Admin has completed the official OYMS profile update."});
    setMessage(status==="in_progress"?"OYMS marked In Progress.":"Final OYMS verification marked Completed.");await refreshData(profile.role,user.id);
  }
  async function openAdminMemberEditor(row){
    if(!isAdmin||row.is_locked||row.final_status==="approved"){setMessage("Only unlocked submitted records can be edited. Locked records require an approved Unfreeze Request.");return;}
    if(row.final_approval_status!=="in_progress"){
      const {error}=await supabase.from("member_records").update({final_approval_status:"in_progress",updated_at:new Date().toISOString()}).eq("id",row.id).eq("is_locked",false);
      if(error){setMessage("Could not start final approval: "+error.message);return;}
      row={...row,final_approval_status:"in_progress"};
    }
    setAdminEditingMember(row);
    setAdminMemberDraft({first_name:row.first_name||"",middle_name:row.middle_name||"",last_name:row.last_name||"",nickname:row.nickname||"",date_of_birth:row.date_of_birth||"",gender:row.gender||"",blood_group:row.blood_group||"",aadhaar_number:row.aadhaar_number||"",urn_number:row.urn_number||"",father_name:row.father_name||"",father_occupation:row.father_occupation||"",mother_name:row.mother_name||"",mother_occupation:row.mother_occupation||"",residential_address:row.residential_address||"",town_village:row.town_village||"",district:row.district||"",state:row.state||"Telangana",pin_code:row.pin_code||"",primary_contact:row.primary_contact||"",whatsapp_number:row.whatsapp_number||"",alternative_contact:row.alternative_contact||"",emergency_contact:row.emergency_contact||"",emergency_contact_person:row.emergency_contact_person||"",email:row.email||"",patrol_position:row.patrol_position||"Patrol Member",category:row.category||"Scout",bsg_uid:row.bsg_uid||""});
  }
  async function saveAdminMemberEdit(e){
    e.preventDefault();
    if(!isAdmin||!adminEditingMember)return;
    if(adminEditingMember.is_locked||adminEditingMember.final_status==="approved"){setMessage("This member record is locked. Approve an Unfreeze Request before editing.");return;}
    if(!isValidEmailFormat(adminMemberDraft.email)){setMessage("Enter a correctly written email address.");return;}
    if(!/^\\d{12}$/.test(String(adminMemberDraft.aadhaar_number||"").replace(/\\s/g,""))){setMessage("Enter the 12-digit Aadhaar number.");return;}
    const uid=String(adminMemberDraft.bsg_uid||"").trim();
    if(uid){
      const {data:duplicate,error:duplicateError}=await supabase.from("member_records").select("id").eq("bsg_uid",uid).neq("id",adminEditingMember.id).limit(1);
      if(duplicateError){setMessage("Could not check BSG UID: "+duplicateError.message);return;}
      if(duplicate?.length){setMessage("This BSG UID is already assigned to another member.");return;}
    }
    setAdminMemberSaving(true);setMessage("");
    const payload={...adminMemberDraft,bsg_uid:uid,bsg_uid_known:!!uid,updated_at:new Date().toISOString()};
    const {error}=await supabase.from("member_records").update(payload).eq("id",adminEditingMember.id).eq("is_locked",false);
    setAdminMemberSaving(false);
    if(error){setMessage("Member details could not be saved: "+error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:adminEditingMember.patrol_leader_id,member_record_id:adminEditingMember.id,title:"Member profile updated by Admin",message:"The Admin corrected the member profile. Please review the updated details in your patrol records."});
    setAdminEditingMember(null);setMessage("Member profile updated successfully. Patrol Leader notified.");await refreshData(profile.role,user.id);
  }
  async function enterMemberUid(row){
    if(!isAdmin){setMessage("Only the Admin can enter the official BSG UID.");return;}
    const uid=(uidDrafts[row.id]??row.bsg_uid??"").trim();
    if(!uid){setMessage("Enter the BSG UID number first.");return;}
    const {data:duplicate,error:duplicateError}=await supabase.from("member_records").select("id").eq("bsg_uid",uid).neq("id",row.id).limit(1);
    if(duplicateError){setMessage("Could not check whether this UID is already assigned: "+duplicateError.message);return;}
    if(duplicate?.length){setMessage("This BSG UID is already assigned to another member. Check the UID before saving.");return;}
    const {error}=await supabase.from("member_records").update({bsg_uid:uid,bsg_uid_known:true,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    setMessage("BSG UID saved for "+[row.first_name,row.last_name].filter(Boolean).join(" ")+".");await refreshData(profile.role,user.id);
  }
  async function editMemberCategory(row){
    if(!isAdmin){setMessage("Only the Admin can edit a member category.");return;}
    if(row.is_locked||row.final_status==="approved"){setMessage("This member is locked. Approve an Unfreeze Request before editing.");return;}
    const current=categoryKey(row.category||"Scout");
    const next=window.prompt("Edit member category: enter Scouts, Guides, Cubs or Bulbuls",current);
    if(next===null)return;
    const normal={"scout":"Scout","scouts":"Scout","guide":"Guide","guides":"Guide","cub":"Cub","cubs":"Cub","bulbul":"Bulbul","bulbuls":"Bulbul"}[next.trim().toLowerCase()];
    if(!normal){setMessage("Choose Scouts, Guides, Cubs or Bulbuls.");return;}
    const {error}=await supabase.from("member_records").update({category:normal,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage("Category could not be updated: "+error.message);return;}
    setMessage("Member category updated.");await refreshData(profile.role,user.id);
  }
  async function deleteDisapprovedMember(row){
    if(!isAdmin){setMessage("Only the Admin can disapprove a member record.");return;}
    if(row.is_locked||row.final_status==="approved"){setMessage("An approved and locked record cannot be deleted here.");return;}
    const name=[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"this member";
    if(!window.confirm("Disapprove and permanently delete "+name+" from this portal? This cannot be undone."))return;
    const {error}=await supabase.from("member_records").delete().eq("id",row.id).eq("is_locked",false);
    if(error){setMessage("The member record could not be deleted: "+error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,title:"Member record disapproved",message:name+" was disapproved and removed from the portal. Contact the Admin if this needs to be reviewed."});
    setMessage(name+" was disapproved and deleted from the portal.");await refreshData(profile.role,user.id);
  }
  async function finalApprove(row){
    if(!isAdmin){setMessage("Only the Admin can give final approval.");return;}
    if(row.submission_status!=="completed"||row.review_status!=="verified"||row.oms_status!=="completed"||!String(row.bsg_uid||"").trim()){setMessage("Member UID, Member Verification and official OYMS completion are required before final approval.");return;}
    if(row.final_status==="approved"||row.is_locked){setMessage("This member record is already approved and locked.");return;}
    if(!window.confirm("Final approval will lock this member record and assign its BSG Member Login ID. Continue?"))return;
    const {data:approvedMember,error}=await supabase.from("member_records").update({final_status:"approved",final_approval_status:"completed",is_locked:true}).eq("id",row.id).select("member_login_id").single();
    if(error){setMessage(error.message);return;}
    const assignedId=approvedMember?.member_login_id||"assigned after database approval";
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:"Member profile approved — Login ID assigned",message:"The member profile has been approved and locked. Member Login ID: "+assignedId});
    setMessage("Member profile approved. Assigned Login ID: "+assignedId);await refreshData(profile.role,user.id);
  }
  async function updateStatus(row,status){
    setLoading(true);
    const {error}=await supabase.from("patrol_submissions").update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",row.id);
    setLoading(false);if(error){setMessage(error.message);return;}
    setMessage("Submission status updated.");await refreshData("admin",user.id);
  }


  async function uploadPortalHeader(e){
    e.preventDefault();if(!headerFile){setMessage("Choose a header image first.");return;}
    if(!["image/jpeg","image/png","image/webp"].includes(headerFile.type)){setMessage("Use JPG, PNG or WebP.");return;}
    if(headerFile.size>50*1024*1024){setMessage("Original image must be 50 MB or smaller.");return;}
    setLoading(true);let path="";
    try{
      const bitmap=await createImageBitmap(headerFile),scale=Math.min(1,1920/bitmap.width,650/bitmap.height),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image resizing is unavailable.");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingQuality="high";ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error("Image resize failed")),"image/jpeg",.86));const file=new File([blob],"portal-header.jpg",{type:"image/jpeg"});if(file.size>10*1024*1024)throw new Error("Resized image exceeds 10 MB.");
      path="headers/"+crypto.randomUUID()+".jpg";const up=await supabase.storage.from("homepage-slides").upload(path,file,{contentType:"image/jpeg",upsert:false});if(up.error)throw up.error;
      const ins=await supabase.from("homepage_slides").insert({title:"__PORTAL_HEADER__",subtitle:"",image_path:path,sort_order:-999,expires_at:null,created_by:user.id,is_active:true});if(ins.error){await supabase.storage.from("homepage-slides").remove([path]);throw ins.error;}
      const {data:old}=await supabase.from("homepage_slides").select("id,image_path").eq("title","__PORTAL_HEADER__").neq("image_path",path);
      for(const row of old||[]){await supabase.from("homepage_slides").update({is_active:false}).eq("id",row.id);await supabase.storage.from("homepage-slides").remove([row.image_path]);}
      setHeaderFile(null);setMessage("Header image updated. Refresh the public homepage to view it.");await loadHomepageSlides();
    }catch(err){setMessage("Header image upload failed: "+(err?.message||"Please try again."));}
    setLoading(false);
  }
  async function removePortalHeader(){
    if(!window.confirm("Remove the custom header image and restore the default header?"))return;
    setLoading(true);const {data:rows}=await supabase.from("homepage_slides").select("id,image_path").eq("title","__PORTAL_HEADER__");
    for(const row of rows||[]){await supabase.from("homepage_slides").update({is_active:false}).eq("id",row.id);await supabase.storage.from("homepage-slides").remove([row.image_path]);}
    setPortalHeader("");setLoading(false);setMessage("Default header restored.");
  }
  async function uploadHomepageSlide(e){
    e.preventDefault(); if(!slideFile){setMessage("Choose a slide image first.");return;}
    if(!["image/jpeg","image/png","image/webp"].includes(slideFile.type)){setMessage("Use JPG, PNG or WebP images.");return;}if(slideEndAt&&(!Number.isFinite(new Date(slideEndAt).getTime())||new Date(slideEndAt).getTime()<=Date.now())){setMessage("Choose an end date and time in the future.");return;}
    if(slideFile.size>50*1024*1024){setMessage("Original slide image must be 50 MB or smaller.");return;}
    setLoading(true);setMessage("");
    let uploadFile;
    try{
      const bitmap=await createImageBitmap(slideFile);
      const scale=Math.min(1,1920/bitmap.width,900/bitmap.height);
      const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext("2d");
      if(!context)throw new Error("Image processing is not supported in this browser.");
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Could not resize this image.")),"image/jpeg",0.84));
      uploadFile=new File([blob],slideFile.name.replace(/\.[^.]+$/,"")+".jpg",{type:"image/jpeg"});
      bitmap.close();
      if(uploadFile.size>10*1024*1024)throw new Error("The resized image is still above the 10 MB shared storage limit. Please choose another image.");
    }catch(error){
      setLoading(false);setMessage("The slide image could not be resized. Please choose another JPG, PNG or WebP image. "+(error?.message||""));return;
    }
    const path="slides/"+crypto.randomUUID()+".jpg";
    const {error:uploadError}=await supabase.storage.from("homepage-slides").upload(path,uploadFile,{contentType:"image/jpeg",upsert:false});
    if(uploadError){setLoading(false);setMessage("Slide upload failed: "+uploadError.message);return;}
    const {error}=await supabase.from("homepage_slides").insert({title:slideTitle.trim(),subtitle:slideSubtitle.trim(),image_path:path,sort_order:homepageSlides.length?Math.max(...homepageSlides.map(x=>Number(x.sort_order)||0))+1:0,expires_at:slideEndAt?new Date(slideEndAt).toISOString():null,created_by:user.id,is_active:true});
    if(error){await supabase.storage.from("homepage-slides").remove([path]);setLoading(false);setMessage("Slide details could not be saved: "+error.message);return;}
    setSlideFile(null);setSlideTitle("");setSlideSubtitle("");setSlideEndAt("");setLoading(false);setMessage("Slide uploaded, automatically resized and published.");await loadHomepageSlides();
  }
  async function moveHomepageSlide(slide,direction){
    const ordered=[...homepageSlides].sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));
    const index=ordered.findIndex(x=>x.id===slide.id),next=index+direction;
    if(index<0||next<0||next>=ordered.length)return;
    [ordered[index],ordered[next]]=[ordered[next],ordered[index]];
    setLoading(true);
    const results=await Promise.all(ordered.map((item,i)=>supabase.from("homepage_slides").update({sort_order:i}).eq("id",item.id)));
    const failed=results.find(x=>x.error);setLoading(false);
    if(failed){setMessage("Slide order could not be saved: "+failed.error.message);return;}
    setMessage("Slideshow order updated.");await loadHomepageSlides();
  }
  async function removeHomepageSlide(slide){
    if(!window.confirm("Remove this slide from the public homepage?"))return;
    setLoading(true);const {error}=await supabase.from("homepage_slides").update({is_active:false}).eq("id",slide.id);
    if(error){setLoading(false);setMessage(error.message);return;}
    await supabase.storage.from("homepage-slides").remove([slide.image_path]);setLoading(false);setMessage("Slide removed from the homepage.");await loadHomepageSlides();
  }
  async function saveArchiveUid(row){
    const uid=(uidDrafts[row.id]??row.bsg_uid??"").trim();
    if(!uid){setMessage("Enter the official BSG UID before saving.");return;}
    setLoading(true);
    const {error}=await supabase.from("member_records").update({bsg_uid:uid,bsg_uid_known:true,updated_at:new Date().toISOString()}).eq("id",row.id);
    setLoading(false);
    if(error){setMessage("UID could not be saved: "+error.message);return;}
    setMessage("BSG UID saved for the archived member.");
    await refreshData(profile.role,user.id);
  }
  async function recordMonthlyMembership(row,status){
    const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    if(!membershipCampaign?.released||today>String(membershipCampaign.deadline)||today<String(membershipCampaign.month_start)){setMessage("Monthly membership verification is not open. Check the deadline and release set by Super Admin.");return;}
    if(isAdmin||row.patrol_leader_id!==user.id){setMessage("Only the assigned Patrol Leader can complete this monthly check.");return;}
    const d=new Date();const checkedMonth=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-01";
    if(membershipChecks.some(x=>x.member_record_id===row.id&&x.checked_month===checkedMonth)){setMessage("This member has already been checked for this month.");return;}
    const reason=status==="left"?window.prompt("Enter the reason this member has left the unit. This is required for the record."):"";
    if(status==="left"&&!reason?.trim()){setMessage("A reason is required. No change was made.");return;}
    setLoading(true);setMessage("");
    const {error:historyError}=await supabase.from("member_membership_checks").insert({member_record_id:row.id,patrol_leader_id:user.id,checked_by:user.id,checked_month:checkedMonth,status,reason:status==="left"?reason.trim():null});
    if(historyError){setLoading(false);setMessage("Monthly check was not saved: "+historyError.message);return;}
    const now=new Date().toISOString();
    const updates={membership_status:status,last_membership_check_month:checkedMonth,last_membership_check_at:now,last_membership_check_by:user.id,updated_at:now};
    if(status==="left")Object.assign(updates,{is_departed:true,is_active:false,departure_reason:reason.trim(),departed_at:now,departed_by:user.id});
    const {error}=await supabase.from("member_records").update(updates).eq("id",row.id).eq("patrol_leader_id",user.id);
    setLoading(false);
    if(error){setMessage("Monthly history was saved, but the member status update needs Admin attention: "+error.message);await refreshData(profile.role,user.id);return;}
    setMessage(status==="left"?"Member marked Left. The reason and monthly history are retained. The member will appear in the Archive after one month.":"Member marked Continuing for this month.");
    await refreshData(profile.role,user.id);
  }

  async function releaseNovemberMembershipVerification(){
    if(!isAdmin||!user?.id)return;
    setLoading(true);setMessage("");
    const monthStart=campaignMonth; const {error}=await supabase.from("membership_verification_campaigns").upsert({month_start:monthStart,title:new Date(monthStart+"T00:00:00").toLocaleDateString("en-IN",{month:"long",year:"numeric"})+" Monthly Membership Verification",deadline:campaignDeadline,released:true,released_at:new Date().toISOString(),released_by:user.id,updated_at:new Date().toISOString()},{onConflict:"month_start"});
    setLoading(false);
    if(error){setMessage("Could not release the November task: "+error.message);return;}
    setMessage("Monthly membership verification and its deadline have been released to Patrol Leader dashboards.");
    await refreshData(profile.role,user.id);
  }

  async function publishPublicNotice(e){e.preventDefault();setLoading(true);const {error}=await supabase.from("notices").insert({title:publicNoticeForm.title.trim(),body:publicNoticeForm.body.trim(),published_on:new Date().toISOString().slice(0,10),audience:"Public",is_published:true});setLoading(false);if(error){setMessage(error.message);return;}setPublicNoticeForm({title:"",body:""});setMessage("Public notice published on the website.");await loadPublicNotices();}

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

  const isSuperAdmin=profile?.role==="super_admin";
  const isAdmin=profile?.role==="admin";
  const notificationCutoff=Date.now()-10*24*60*60*1000;
  const activeNotifications=notifications.filter(x=>!x.created_at||new Date(x.created_at).getTime()>notificationCutoff);
  const archivedNotifications=notifications.filter(x=>x.created_at&&new Date(x.created_at).getTime()<=notificationCutoff);
  const leaderCategory=categoryKey(profile?.category||"");
  const visibleMemberRows=memberRows.filter(x=>!x.is_departed&&(isAdmin||(x.patrol_leader_id===user?.id&&(!leaderCategory||categoryKey(x.category||profile?.category)===leaderCategory))));
  const currentMonth=(()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-01";})();
  const localToday=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const campaignStart=membershipCampaign?.month_start||""; const campaignEnd=membershipCampaign?.deadline||"";
  const novemberVerificationOpen=!!membershipCampaign?.released&&!!campaignStart&&!!campaignEnd&&localToday>=campaignStart&&localToday<=campaignEnd&&campaignStart===currentMonth;
  const monthlyDueRows=visibleMemberRows.filter(row=>!membershipChecks.some(check=>check.member_record_id===row.id&&check.checked_month===currentMonth));
  const archiveRows=isAdmin?memberRows.filter(x=>x.is_departed&&isArchiveDue(x.departed_at)):[];
  const archivePendingCount=archiveRows.length;
  const workflowIssueCount=memberRows.filter(row=>!row.is_departed&&row.final_status==="approved"&&(row.review_status!=="verified"||row.oms_status!=="completed"||!row.is_locked)).length;
  const patrolCounts={
    total:visibleMemberRows.length,
    submitted:visibleMemberRows.filter(row=>row.submission_status==="completed").length,
    waiting:visibleMemberRows.filter(row=>row.submission_status==="completed"&&row.review_status==="pending").length,
    corrections:visibleMemberRows.filter(row=>row.review_status==="disapproved").length,
    verified:visibleMemberRows.filter(row=>row.review_status==="verified").length,
    inProgress:visibleMemberRows.filter(row=>row.oms_status==="in_progress").length,
    completed:visibleMemberRows.filter(row=>row.oms_status==="completed").length
  };
  const requiredMemberFields=["first_name","last_name","nickname","date_of_birth","gender","blood_group","aadhaar_number","urn_number","father_name","father_occupation","mother_name","mother_occupation","residential_address","town_village","district","state","pin_code","primary_contact","whatsapp_number","alternative_contact","emergency_contact","emergency_contact_person","email"];
  const incompleteProfileCount=memberRows.filter(row=>!row.is_departed&&(requiredMemberFields.some(key=>!String(row[key]??"").trim())||!row.photo_path||!(row.form_file_paths||[]).length)).length;
  const dataManagementRows=memberRows.filter(row=>{
    const leader=leaders.find(x=>x.user_id===row.patrol_leader_id);
    const category=categoryKey(row.category||leader?.category||"");
    const patrol=leader?.patrol_name||"";
    const haystack=[row.first_name,row.middle_name,row.last_name,row.bsg_uid,row.email,row.member_login_id,patrol,row.category].join(" ").toLowerCase();
    return (!dataSearch.trim()||haystack.includes(dataSearch.trim().toLowerCase()))&&(dataCategory==="all"||category===dataCategory)&&(dataPatrol==="all"||patrol===dataPatrol);
  });
  const dataCategoryCounts=["Scouts","Guides","Cubs","Bulbuls"].map(category=>({category,count:memberRows.filter(row=>categoryKey(row.category||leaders.find(x=>x.user_id===row.patrol_leader_id)?.category||"")===category).length}));
  const dataVerifiedCount=memberRows.filter(x=>x.review_status==="verified"||x.final_status==="approved").length;
  const dataPendingCount=memberRows.filter(x=>x.submission_status==="completed"&&x.review_status==="pending").length;
  const nav=profile?.role==="patrol_leader"&&!profile.profile_completed_at?[
    ["profile-setup","Complete Profile",UserCircle]
  ]:profile?.role==="patrol_leader"&&profile.must_change_password?[
    ["profile","Change Password",LockKeyhole]
  ]:(isSuperAdmin||isAdmin)&&user?.user_metadata?.password_initialized!==true?[
    ["profile","Set Password",LockKeyhole]
   ]:isSuperAdmin?[
    ["dashboard","Super Admin Dashboard",Home],["header","Header",Home],["unfreeze-super","Unfreeze Permissions",ShieldCheck],["admins","Admin Accounts",Users],["slides","Homepage Slides",FileText],["launch","Website Updates",Megaphone],["notifications","Public Notices",Bell],["profile","My Profile",UserCircle]
  ]:isAdmin?[
    ["dashboard","Admin Dashboard",Home],["leaders","Patrols & Login Accounts",Users],["member-logins","OYMS 2.0 Member Logins",LockKeyhole],["members","Records",ClipboardList],["monthly-check","Membership Check History",CheckCircle2],["data-management","Member Data Management",ClipboardList],["submissions","Patrols Submitted – Form Check",FileText],["archive","Left Members Archive",Archive],["member-verification","Member Verification",ShieldCheck],["oms-verification","OYMS Manual Verification & Final Approval",CheckCircle2],["notifications","Notifications",Bell],["audit","Unfreeze Requests",FileText],["profile","My Profile",UserCircle]
  ]:profile?.profile_completed_at?[
    ["dashboard","Dashboard",Home],["new","My Patrol",Plus],["member-logins","OYMS 2.0 Member Logins",LockKeyhole],["members","Records",ClipboardList],["monthly-check","Continue for This Month",CheckCircle2],["member-verification","Member Verification",ShieldCheck],["oms-verification","Final OYMS Verification",CheckCircle2],["notifications","Notifications",Bell],["profile","My Profile",UserCircle]
  ]:[["profile-setup","Complete Profile",UserCircle]];

  if(page==="welcome") return <div className="welcome-page" id="portal-home">
    <div className="top-ribbon"><span>Kendriya Vidyalaya Sangathan &nbsp; | &nbsp; Ministry of Education, Government of India</span><span className="ribbon-tools">A+ &nbsp; A &nbsp; A− &nbsp; | &nbsp; English &nbsp; | &nbsp; Login</span></div>
    <header className={"welcome-header"+(portalHeader?" has-custom-portal-header":"")} style={portalHeader?{backgroundImage:"url("+portalHeader+")"}:{}}>
      <div className="header-kvs-mark" aria-label="Kendriya Vidyalaya Sangathan">KVS</div>
      <div className="header-school-name"><h1>PM SHRI Kendriya Vidyalaya OF Medak, Eddumailaram</h1><p>An autonomous body under the Ministry of Education, Government of India</p><small>KV Code: 1525 · CBSE Affiliation No.: 3600010 · School Code: 59516</small></div>
      <div className="header-right-brand"><div className="header-bsg-mark" aria-label="Bharat Scouts and Guides"><img src="https://pmskvofmk.github.io/BSG-OYMS-Portal/assets/bsg-logo.webp?v=20261121" alt="Bharat Scouts and Guides official emblem"/></div><div className="header-portal-brand"><b>SANKALP 4.0</b><small>BSG · Scouts &amp; Guides</small></div></div>
    </header>
    {<section className="home-slideshow" aria-label="Sankalp 4.0 homepage slideshow">{liveHomepageSlides.length>0?<><img key={liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].id} className="home-slide-image" src={liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].image_url} alt={liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].title||"Sankalp 4.0 Bharat Scouts and Guides slide"} onError={e=>{e.currentTarget.style.visibility="hidden";e.currentTarget.setAttribute("data-slide-error","true");setSlideImageError(true);}} onLoad={e=>{e.currentTarget.style.visibility="visible";e.currentTarget.removeAttribute("data-slide-error");setSlideImageError(false);}}/>{slideImageError&&<div className="home-slide-empty"><h2>Slide image could not be displayed</h2><p>The slide is saved. Reload the slide list to try again.</p><button className="outline" onClick={()=>{setSlideImageError(false);loadHomepageSlides();}}>Reload slides</button></div>}{(liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].title||liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].subtitle)&&<div className="home-slide-shade">{liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].title&&<h2>{liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].title}</h2>}{liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].subtitle&&<p>{liveHomepageSlides[welcomeSlide%liveHomepageSlides.length].subtitle}</p>}</div>}{liveHomepageSlides.length>1&&<div className="home-slide-controls"><button aria-label="Previous slide" onClick={()=>setWelcomeSlide(v=>(v-1+liveHomepageSlides.length)%liveHomepageSlides.length)}>‹</button><div>{liveHomepageSlides.map((x,i)=><button key={x.id} aria-label={"Show slide "+(i+1)} className={i===welcomeSlide?"active":""} onClick={()=>setWelcomeSlide(i)}></button>)}</div><button aria-label="Next slide" onClick={()=>setWelcomeSlide(v=>(v+1)%liveHomepageSlides.length)}>›</button></div>}</>:<div className="home-slide-empty"><h2>Welcome to KVS-OYMS Sankalp 4.0</h2><p>New school updates and activities will appear here.</p><button className="outline" onClick={loadHomepageSlides}>Reload slides</button></div>}</section>}
    
    <main className="welcome-content">
      <section className="portal-login-strip" id="portal-login"><div><span className="eyebrow">AUTHORISED ACCESS</span><h2>Portal Login</h2><p>Choose the correct login area for your assigned OYMS account.</p></div><div className="portal-login-actions"><button className="primary large portal-login-admin" onClick={()=>{setLoginType("admin");setLoginId("");setPassword("");setPage("login");setMessage("");}}>ADMINISTRATOR LOGIN <ArrowRight size={18}/></button><button className="primary large" onClick={()=>{setLoginType("patrol");setLoginId("");setPassword("");setPage("login");setMessage("");}}>PATROL LEADER LOGIN <ArrowRight size={18}/></button><button className="outline large" onClick={()=>{setPage("choose");setMessage("");}}>ALL LOGIN OPTIONS</button></div></section>
      <section className="portal-services"><div className="public-notices-heading"><div><span className="eyebrow">SANKALP 4.0</span><h3>Portal Services</h3></div></div><div className="service-grid"><article><Users/><b>Patrol Management</b><p>Manage patrol leader accounts and unit records.</p></article><article><ClipboardList/><b>Member Records</b><p>Submit, review and maintain member information.</p></article><article><ShieldCheck/><b>Verification</b><p>Follow the administrative review and approval process.</p></article><article><Bell/><b>Notices & Updates</b><p>Read official public notices and portal notifications.</p></article></div></section>
      <section className="connected-portals" aria-label="Connected school portals">
        <div className="connected-portals-heading">
          <div><span className="eyebrow">CONNECTED SCHOOL PORTALS</span><h3>One School Network. Two Connected Portals.</h3><p>Quick access to the school’s BSG activities and youth management services.</p></div>
          <span className="connected-network-mark"><Users size={25}/></span>
        </div>
        <a className="connected-portal-card" href="https://pmskvofmk.github.io/BSG-OYMS-Portal/" target="_blank" rel="noopener noreferrer">
          <span className="connected-portal-icon"><ShieldCheck size={30}/></span>
          <span className="connected-portal-copy"><small>ACTIVITIES · UNITS · CIRCULARS · EVENTS</small><b>KVS-OYMS 2.0</b><span>Explore school activities, BSG sections, unit information, official circulars and events.</span></span>
          <span className="connected-portal-action">Explore portal <ArrowRight size={17}/></span>
        </a>
      </section>
      <section className="public-bsg-overview" id="about-bsg">
        <div className="public-notices-heading"><div><span className="eyebrow">BHARAT SCOUTS & GUIDES</span><h3>Learn, Lead and Serve</h3></div><span className="public-notice-tag">KVS · 2026–27</span></div>
        <p className="public-bsg-intro">The Bharat Scouts & Guides movement encourages young people to develop character, responsibility, teamwork, leadership and service to the community through learning by doing.</p>
        <div className="public-section-grid">
          <article id="scouts"><Flag/><b>Scouts</b><p>Outdoor learning, teamwork, practical skills and community service.</p></article>
          <article id="guides"><ShieldCheck/><b>Guides</b><p>Leadership, confidence, cooperation and service through activities.</p></article>
          <article id="cubs"><Users/><b>Cubs</b><p>Age-appropriate discovery, games, friendship and learning together.</p></article>
          <article id="bulbuls"><Users/><b>Bulbuls</b><p>Creative activities, confidence, kindness and joyful learning.</p></article>
        </div>
        <div className="public-info-grid">
          <article><b>Group & Unit Details</b><p>School unit information and section details will be published here.</p></article>
          <article><b>Leader Details</b><p>Authorised leader information will be published by the Super Admin.</p></article>
          <article><b>Activities & Achievements</b><p>Reports of camps, service activities and achievements will appear here.</p></article>
          <article><b>Photographs & Gallery</b><p>Approved school activity photographs will be displayed in the website gallery.</p></article>
          <article><b>Official Circulars</b><p>Public circulars and notices published by the Super Admin are shown below.</p></article>
        </div>
      </section>
      <section className="public-notices" id="public-notices"><div className="public-notices-heading"><div><span className="eyebrow">OFFICIAL UPDATES</span><h3>Public Notices</h3></div><span className="public-notice-tag">SANKALP 4.0</span></div>{publicNotices.map(n=><article className="public-notice-row" key={n.id}><div className="notice-date">{n.published_on?new Date(n.published_on+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"Notice"}</div><div><b>{n.title}</b>{n.body&&<p>{n.body}</p>}</div></article>)}{!publicNotices.length&&<p className="empty">No public notices have been published yet.</p>}</section>
      <footer className="welcome-footer"><div className="footer-disclaimer"><b>KVS-OYMS 4.0</b><p><b>Disclaimer:</b> This is not an official website of Kendriya Vidyalaya Sangathan (KVS) or The Bharat Scouts &amp; Guides (BSG). It is an independently created portal intended only for internal use by the PM SHRI KV OF Medak school unit and its COH Department.</p><span>© 2026 · School-unit use only</span></div></footer>{launchCountdownOpen&&<div className="launch-modal-backdrop"><section className="launch-modal" style={{textAlign:"center"}}><span className="eyebrow">PM SHRI KV OF MEDAK · OYMS SANKALP 4.0</span><h2>We are launching!</h2><p className="launch-description">The portal will open in</p><div style={{fontSize:"clamp(4rem,12vw,7rem)",fontWeight:900,color:"#6d28d9",lineHeight:1.1}}>{launchCountdownValue}</div><b>Get ready for the celebration!</b></section></div>}{confettiOn&&<div className="launch-confetti" aria-hidden="true"><div style={{position:"absolute",inset:0,display:"flex",justifyContent:"space-around",alignItems:"flex-start",fontSize:"2rem",pointerEvents:"none"}}><span>🌸</span><span>🌼</span><span>🌺</span><span>🌷</span><span>🌸</span><span>🌼</span><span>🌺</span></div>{Array.from({length:100},(_,i)=><i key={i} style={{left:((i*37)%100)+"%",animationDelay:((i%12)*0.08)+"s",transform:"rotate("+((i*41)%360)+"deg)"}}/>)}</div>}
    </main>
  </div>;

  if(page==="choose") return <div className="auth-page"><button className="back" onClick={()=>{setPage("welcome");setMessage("");}}>← Back to Welcome</button><div className="auth-card choose-card"><div className="mini-crest">BSG</div><span className="eyebrow">PATROL MEMBER PORTAL ACCESS</span><h2>Patrol Leader Login</h2><p>Sign in with the Login ID and password issued by your Admin.</p><button className="role-choice patrol-choice patrol-primary-choice" onClick={()=>{setLoginType("patrol");setLoginId("");setPage("login");setMessage("");}}><span className="choice-icon"><Flag/></span><span><b>Patrol Leader Login</b><small>Open your patrol dashboard, submit member profiles and track verification</small></span><ArrowRight/></button><div className="security-line"><LockKeyhole size={15}/> For authorised Patrol Leaders only.</div><button type="button" className="staff-login-toggle" onClick={()=>setShowStaffLogin(v=>!v)}>{showStaffLogin?"Hide staff login":"Administrator / Super Admin access"}</button>{showStaffLogin&&<div className="staff-login-options"><button className="role-choice admin-choice" onClick={()=>{setLoginType("admin");setLoginId("");setPage("login");setMessage("");}}><span className="choice-icon"><Users/></span><span><b>Administrator Login</b><small>Member records, UID checks and final verification</small></span><ArrowRight/></button><button className="role-choice admin-choice" onClick={()=>{setLoginType("super_admin");setLoginId(ADMIN_EMAIL);setPage("login");setMessage("");}}><span className="choice-icon"><ShieldCheck/></span><span><b>Super Admin Login</b><small>Super Admin access and portal management</small></span><ArrowRight/></button></div>}</div></div>;

  if(page==="login") return <div className="auth-page"><button className="back" onClick={()=>{setPage("choose");setMessage("");}}>← Back to Login Selection</button><div className="auth-card"><div className="mini-crest">{loginType==="super_admin"?"SUPER ADMIN":loginType==="admin"?"ADMIN":"BSG"}</div><span className="eyebrow">{loginType==="super_admin"?"SUPER ADMIN ACCESS":loginType==="admin"?"ADMIN ACCESS":"PATROL LEADER ACCESS"}</span><h2>{loginType==="super_admin"?"Super Admin Login":loginType==="admin"?"Administrator Login":"Patrol Leader Login"}</h2><p>{loginType==="super_admin"?"Sign in with the registered Super Admin email and password.":loginType==="admin"?"Sign in with this Admin account’s own email/login ID and password. These are separate from the Super Admin credentials.":"Enter the Login ID exactly as issued by your Admin, followed by your password. Do not add an email address."}</p>{loginType==="admin"&&<div className="login-help-note">Use the Administrator Login ID created by the Super Admin, together with your current password. Your contact email is not the Login ID.</div>}{loginType==="patrol"&&<div className="login-help-note">First login? Complete your Patrol Leader profile and change the temporary password. If you forget it, ask the Admin to reset it.</div>}
    <form onSubmit={signIn} className="auth-form" autoComplete="on"><label>{loginType==="patrol"?"Patrol Login ID":loginType==="super_admin"?"Super Admin Email":"Administrator Login ID"}<input required id="oyms-login-id" name="username" type={loginType==="patrol"||loginType==="admin"?"text":"email"} autoComplete="username" spellCheck="false" value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder={loginType==="patrol"||loginType==="admin"?"Enter your Login ID":"Enter your email address"}/></label><label>Password<input required id="oyms-login-password" name="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label><button className="primary block" disabled={loading}>{loading?"Signing in…":"LOGIN SECURELY"} <ArrowRight size={17}/></button></form>
    {loginType==="super_admin"&&<><button className="link-button" onClick={async()=>{if(!loginId.trim()){setMessage("Enter your Super Admin email first.");return;}setLoading(true);const {error}=await supabase.auth.resetPasswordForEmail(loginId.trim().toLowerCase());setLoading(false);setMessage(error?error.message:"If this email has an OYMS account, a password reset link has been sent.");}}>Forgot password?</button><button className="link-button" onClick={requestAdminActivation} disabled={loading}>First-time Super Admin? Send secure activation link</button></>}
    {message&&<div className="notice-message"><AlertCircle size={16}/>{message}</div>}<div className="security-line"><LockKeyhole size={15}/> Your role is checked by the secure database after sign-in.</div></div></div>;

  if(page==="app" && user && profile) return <div className="app-layout">
    <aside className={"sidebar "+(mobileMenu?"show":"")}><div className="side-brand"><div className="mini-crest">BSG</div><div><b>OYMS SANKALP 4.0</b><small>{isSuperAdmin?"SUPER ADMIN":isAdmin?"ADMIN":"PATROL LEADER"}</small></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div><nav>{nav.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setMobileMenu(false);}}><Icon size={17}/>{label}</button>)}</nav><div className="side-bottom"><b>{profile.full_name}</b><small>{profile.login_id} · {profile.patrol_name||"Admin"}</small><button onClick={signOut}><LogOut size={16}/> Sign out</button></div></aside>
    <section className="app-main"><header className="app-top"><button className="menu-button" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div><b>{nav.find(x=>x[0]===tab)?.[1]||"Dashboard"}</b><small>{SCHOOL}</small></div><div className="notification-menu"><button className={"notification-bell "+(notificationPopup?"opened":"")} aria-label="Open notifications" onClick={()=>setNotificationPopup(v=>!v)}><Bell size={19}/>{activeNotifications.filter(x=>!x.read_at).length>0&&<span className="notification-count">{notifications.filter(x=>!x.read_at).length}</span>}</button>{notificationPopup&&<div className="notification-popover"><div className="notification-popover-head"><b>Notifications</b><button onClick={()=>{setNotificationPopup(false);setTab("notifications");}}>View all</button></div>{activeNotifications.slice(0,4).map(x=><button className="notification-popover-item" key={x.id} onClick={()=>{setNotificationPopup(false);setTab("notifications");}}><b>{x.title}</b><small>{x.message}</small><time>{dateLabel(x.created_at)}</time></button>)}{!activeNotifications.length&&<p className="empty">No new notifications.</p>}</div>}</div><button className="refresh" onClick={()=>refreshData(profile.role,user.id)}><RefreshCw size={17}/></button></header>
    <main className="app-content">{message&&<div className="notice-message"><AlertCircle size={16}/>{message}<button onClick={()=>setMessage("")}>×</button></div>}
      {tab==="profile-setup"&&!isAdmin&&<form className="panel data-form profile-setup-form" onSubmit={savePatrolProfile}><span className="eyebrow wide">FIRST-TIME PROFILE SETUP</span><h2 className="wide">Complete Your Patrol Leader Profile</h2><p className="wide">Complete your profile once before registering your patrol members. This screen will not appear again after you save your profile.</p><div className="wide profile-photo-preview">{profilePhoto?<p>Selected photo: {profilePhoto.name}</p>:profilePhotoUrl?<img style={{width:"120px",height:"120px",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:<div className="avatar">{(profileSetup.full_name||"P").slice(0,1)}</div>}</div><label className="wide">Upload your recent passport-size photograph *<input type="file" accept="image/jpeg,image/png,image/webp" required={!profile.profile_photo_path&&!profilePhoto} onChange={e=>setProfilePhoto(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP; maximum 5 MB. No membership form upload is required for your own profile.</small></label><label>Full Name *<input required value={profileSetup.full_name} onChange={e=>setProfileSetup({...profileSetup,full_name:e.target.value})}/></label><label>Date of Birth *<input required type="date" value={profileSetup.date_of_birth} onChange={e=>setProfileSetup({...profileSetup,date_of_birth:e.target.value})}/></label><label>Gender *<select required value={profileSetup.gender} onChange={e=>setProfileSetup({...profileSetup,gender:e.target.value})}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label><label>Blood Group<select value={profileSetup.blood_group} onChange={e=>setProfileSetup({...profileSetup,blood_group:e.target.value})}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(v=><option key={v}>{v}</option>)}</select></label><label>Mobile Number *<input required type="tel" value={profileSetup.mobile_number} onChange={e=>setProfileSetup({...profileSetup,mobile_number:e.target.value})}/></label><label>Contact Email (Change to your current, correct email address.)<input type="email" value={profileSetup.email_address} placeholder="local_cubs_oyms@gmail.com" onChange={e=>setProfileSetup({...profileSetup,email_address:e.target.value})}/></label><label>BSG UID (if available)<input value={profileSetup.bsg_uid} onChange={e=>setProfileSetup({...profileSetup,bsg_uid:e.target.value})}/></label><label className="wide">Residential Address *<textarea required rows="3" value={profileSetup.residential_address} onChange={e=>setProfileSetup({...profileSetup,residential_address:e.target.value})}/></label><label>Patrol Name<input value={profile.patrol_name||""} readOnly/></label><label>Section<input value={profile.category||"Scout"} readOnly/></label><p className="wide"><small>Your Patrol Name and Scout/Guide section are assigned by the Administrator. Save your profile to unlock the patrol dashboard and member registration.</small></p><button className="primary wide" disabled={loading}>{loading?"Saving Profile…":"Save Profile & Continue"}</button></form>}
      {activeAnnouncement&&!announcementOpen&&<section className="launch-notice-bar"><Megaphone/><div><b>New portal update is available</b><p>Tap to view update</p></div><button className="primary" onClick={()=>openAnnouncement(activeAnnouncement)}>Tap to view update</button></section>}
      {tab==="dashboard"&&<>{isSuperAdmin&&<><section className="panel" style={{border:"2px solid #8b5cf6",background:"linear-gradient(135deg,#faf5ff,#fff)"}}><div className="section-title"><div><span className="eyebrow">SPECIAL EVENT · 17 NOVEMBER 2026</span><h2>Launch the Portal</h2><p className="section-subtitle">Available now for testing. Opens the public homepage, starts the 10-second countdown and celebration. The official event date remains 17 November 2026.</p></div><button className="primary" onClick={startTemporaryPortalLaunch}><Megaphone size={17}/> Test Launch Now</button></div></section><section className="panel" style={{border:"1px solid #ddd6fe",background:"#fff"}}><div className="section-title"><div><span className="eyebrow">WEBSITE MANAGEMENT · ALWAYS AVAILABLE</span><h2>New Update</h2><p className="section-subtitle">Publish a new website announcement or media update whenever the portal is online.</p></div><button className="primary" onClick={()=>setTab("launch")}><Megaphone size={17}/> Create New Update</button></div></section></>}{isAdmin&&<section className="panel membership-release-panel"><div className="section-title"><div><span className="eyebrow">ADMIN · MONTHLY TASK CONTROL</span><h3>Monthly Membership Verification</h3><p className="section-subtitle">Choose the month and deadline, then release the task to Patrol Leader dashboards.</p><label>Month<input type="month" value={campaignMonth.slice(0,7)} onChange={e=>{setCampaignMonth(e.target.value+"-01");setCampaignDeadline(e.target.value+"-30");}}/></label><label>Deadline<input type="date" value={campaignDeadline} min={campaignMonth} onChange={e=>setCampaignDeadline(e.target.value)}/></label><small className="membership-release-status">{membershipCampaign?.released?"Current month released":"Not released yet"}</small></div><button className="primary" disabled={loading||!campaignMonth||!campaignDeadline} onClick={releaseNovemberMembershipVerification}><CalendarDays size={17}/>Release Monthly Check</button></div></section>}{isAdmin&&archivePendingCount>0&&<section className="archive-reminder"><Archive size={20}/><div><b>{archivePendingCount} member account{archivePendingCount===1?"":"s"} are ready for Archive review</b><p>These members were marked Left at least one month ago. Review their UID and records before deciding whether to delete them.</p></div><button className="primary" onClick={()=>setTab("archive")}>Review Archive</button></section>}{isAdmin&&incompleteProfileCount>0&&<section className="archive-reminder"><AlertCircle size={20}/><div><b>{incompleteProfileCount} existing member profile{incompleteProfileCount===1?" is":"s are"} missing one or more required fields</b><p>Existing records were saved before the latest form checks. Locked records must go through the Unfreeze Request process before corrections. BSG UID is optional and can be added later by the Admin.</p></div><button className="primary" onClick={()=>setTab("members")}>View Records</button></section>}{isAdmin&&workflowIssueCount>0&&<section className="archive-reminder workflow-warning"><AlertCircle size={20}/><div><b>{workflowIssueCount} approved record{workflowIssueCount===1?" has":"s have"} a verification-status mismatch</b><p>Review the Member Verification and Final OYMS history before making any further changes. These records have not been altered automatically.</p></div><button className="primary" onClick={()=>setTab("oms-verification")}>Review Status</button></section>}<div className="welcome-banner"><span className="eyebrow">{isSuperAdmin?"WEBSITE MANAGEMENT":isAdmin?"ADMIN OVERVIEW":"PATROL LEADER DASHBOARD"}</span><h1>Welcome, {profile.full_name}</h1><p>{isSuperAdmin?"Manage the public website, homepage slides, notices and authorised Admin accounts.":"Manage member data, patrol accounts, verification and official OYMS progress."}</p></div>{!isSuperAdmin&&<div className="stat-grid">{(isAdmin?[["Patrol Leaders",leaders.length,Users],["Active Members",memberRows.filter(x=>!x.is_departed).length,ClipboardList],["Awaiting Review",memberRows.filter(x=>!x.is_departed&&x.submission_status==="completed"&&x.review_status==="pending").length,Clock3],["OYMS In Progress",memberRows.filter(x=>!x.is_departed&&x.oms_status==="in_progress").length,RefreshCw],["OYMS Completed",memberRows.filter(x=>!x.is_departed&&x.oms_status==="completed").length,CheckCircle2],["Workflow Alerts",workflowIssueCount,AlertCircle]]:[["My Patrol Members",patrolCounts.total,ClipboardList],["Awaiting Admin Review",patrolCounts.waiting,Clock3],["Needs Changes",patrolCounts.corrections,AlertCircle],["Verified",patrolCounts.verified,CheckCircle2],["OYMS In Progress",patrolCounts.inProgress,RefreshCw],["OYMS Completed",patrolCounts.completed,CheckCircle2]]).map(([label,value,Icon])=><article className="stat-card" key={label}><Icon/><div><strong>{value}</strong><small>{label}</small></div></article>)}</div>}{isSuperAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">WEBSITE CONTROL CENTRE</span><h3>Website Management</h3><p className="section-subtitle">Manage public-facing content here. Member data and verification are handled by the Admin account.</p></div></div><div className="dashboard-action-grid"><button onClick={()=>setTab("slides")}><FileText/><b>Homepage Slides</b><small>Upload, reorder and remove public slides</small></button><button onClick={()=>setTab("notifications")}><Bell/><b>Public Notices</b><small>Publish official school notices</small></button><button onClick={()=>setTab("launch")}><Megaphone/><b>Website Updates</b><small>Schedule announcements and media</small></button><button onClick={()=>setTab("admins")}><Users/><b>Admin Accounts</b><small>Create or deactivate the operational Admin</small></button></div></section>}{isAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">WORKFLOW CONTROL CENTRE</span><h3>Administrative Work Areas</h3><p className="section-subtitle">Each task has its own section. Member Data Management is only for viewing and maintaining member profile information.</p></div></div><div className="dashboard-action-grid"><button onClick={()=>setTab("leaders")}><Users/><b>Patrol & Login Management</b><small>Create and manage authorised login accounts</small></button><button onClick={()=>setTab("submissions")}><FileText/><b>Patrols Submitted – Form Check</b><small>Review submitted membership forms and mark them verified or needs changes</small></button><button onClick={()=>{setMemberVerificationView("dashboard");setTab("member-verification");}}><ShieldCheck/><b>Member Verification</b><small>Open the verification dashboard: submitted profiles, UID checks, OYMS update and final approval</small></button><button onClick={()=>setTab("oms-verification")}><CheckCircle2/><b>OYMS Manual Verification</b><small>Update official OYMS status: In Progress or Completed</small></button><button onClick={()=>setTab("oms-verification")}><ShieldCheck/><b>Final Approval & Lock</b><small>Give final approval after all previous checks are complete</small></button><button onClick={()=>setTab("data-management")}><ClipboardList/><b>Member Data Management</b><small>Search and view member profile information only</small></button><button onClick={()=>setTab("archive")}><Archive/><b>Left Members Archive</b><small>Review accounts after the one-month period</small></button></div></section>}{!isAdmin&&!isSuperAdmin&&novemberVerificationOpen&&<section className="panel membership-release-panel"><div className="section-title"><div><span className="eyebrow">NEW TASK · NOVEMBER 2026</span><h3>Monthly Membership Verification</h3><p className="section-subtitle">The Admin has released this month’s check. Confirm each member as Continuing or Left by {membershipCampaign?.deadline||"the displayed deadline"}.</p><small className="membership-release-status">{monthlyDueRows.length} member(s) still need verification</small></div><button className="primary" onClick={()=>setTab("monthly-check")}><CalendarDays size={17}/> Start Verification</button></div></section>}{!isAdmin&&!isSuperAdmin&&<section className="panel patrol-progress-panel"><div className="section-title"><div><span className="eyebrow">PATROL WORKFLOW</span><h3>My Patrol Progress</h3><p className="section-subtitle">Follow each member from profile submission through final OYMS completion.</p></div><button className="outline" onClick={()=>setTab("member-verification")}>View Verification</button></div><div className="patrol-progress-grid"><article><span className="progress-dot progress-draft"></span><div><b>{patrolCounts.total}</b><small>Member profiles saved</small></div></article><article><span className="progress-dot progress-pending"></span><div><b>{patrolCounts.waiting}</b><small>Awaiting Admin review</small></div></article><article><span className="progress-dot progress-warning"></span><div><b>{patrolCounts.corrections}</b><small>Corrections requested</small></div></article><article><span className="progress-dot progress-success"></span><div><b>{patrolCounts.verified}</b><small>Details verified</small></div></article><article><span className="progress-dot progress-active"></span><div><b>{patrolCounts.inProgress}</b><small>OYMS in progress</small></div></article><article><span className="progress-dot progress-success"></span><div><b>{patrolCounts.completed}</b><small>OYMS completed</small></div></article></div><p className="uid-help-note">BSG UID is optional while entering a member profile. If it is not available, the Admin will add it during Member Verification. You will receive a notification when the status changes.</p></section>}{!isAdmin&&!isSuperAdmin&&<><section className="panel patrol-howto"><div className="section-title"><div><span className="eyebrow">SIMPLE WORKFLOW</span><h3>What to do next</h3><p className="section-subtitle">Follow these steps in order. Your member details are saved centrally and can be reviewed by the Admin.</p></div></div><ol><li><b>Complete My Profile</b><span>Upload your own photo and save your Patrol Leader details once.</span></li><li><b>Open My Patrol</b><span>Add each member's details, photo and signed form files. BSG UID can be left blank if not yet available.</span></li><li><b>Check Member Verification</b><span>When the Admin reviews a record, follow any correction request and resubmit it.</span></li><li><b>Track Final OYMS Verification</b><span>Watch for In Progress and Completed updates. The Admin completes the final approval.</span></li></ol></section><section className="panel"><div className="section-title"><div><span className="eyebrow">PATROL WORKSPACE</span><h3>Quick Actions</h3><p className="section-subtitle">Open the area you need without mixing member profile entry with verification tracking.</p></div></div><div className="dashboard-action-grid"><button onClick={()=>setTab("new")}><Users/><b>My Patrol</b><small>Add or update your patrol member profiles</small></button><button onClick={()=>setTab("members")}><ClipboardList/><b>Member Records</b><small>View the details entered in profile forms</small></button><button onClick={()=>setTab("member-verification")}><ShieldCheck/><b>Member Verification</b><small>See UID and member verification status</small></button><button onClick={()=>setTab("oms-verification")}><CheckCircle2/><b>Final OYMS Verification</b><small>See the official OYMS update status</small></button><button onClick={()=>setTab("notifications")}><Bell/><b>Notifications</b><small>Read notices from the Admin</small></button></div></section></>}<section className="panel"><div className="section-title"><div><h3>{isAdmin?"Recent Active Member Records":"My Recent Patrol Members"}</h3><p className="section-subtitle">A quick view of member profile submissions.</p></div><button className="outline" onClick={()=>setTab(isAdmin?"members":"new")}>View Records</button></div><MemberRecords rows={memberRows.filter(x=>!x.is_departed&&(isAdmin||x.patrol_leader_id===user.id)).slice(0,5)} onPhoto={viewMemberPhoto} onForms={viewMemberForms}/><FormFileLinks links={formLinks}/></section></>}
      {tab==="admins"&&isSuperAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">CONTROLLED ACCOUNT CREATION</span><h2>Create Admin Account</h2><p className="section-subtitle">Only the Super Admin can create or deactivate an Admin account. Enter the Admin name, contact email, start date, renewal reminder date, Login ID and temporary password. The Admin must change the password at first login.</p></div></div><form className="panel data-form" onSubmit={createAdminAccount}><label>Admin Full Name *<input required value={adminForm.full_name} onChange={e=>setAdminForm(v=>({...v,full_name:e.target.value}))} placeholder="Enter Admin name"/></label><label>Valid Email Address *<input required type="email" value={adminForm.email} onChange={e=>setAdminForm(v=>({...v,email:e.target.value}))} placeholder="admin@example.com"/></label><label>Date of Start *<input required type="date" value={adminForm.start_date} onChange={e=>setAdminForm(v=>({...v,start_date:e.target.value}))}/></label><label>Renewal Date *<input required type="date" min={adminForm.start_date} value={adminForm.renewal_date} onChange={e=>setAdminForm(v=>({...v,renewal_date:e.target.value}))}/><small>Reminder only. This date will not expire or disable the account.</small></label><label>Admin Login ID *<input required value={adminForm.login_id} onChange={e=>setAdminForm(v=>({...v,login_id:e.target.value}))} placeholder="kvofmedak"/></label><label>Initial Password *<input required type="password" minLength="12" autoComplete="new-password" value={adminForm.password} onChange={e=>setAdminForm(v=>({...v,password:e.target.value}))} placeholder="At least 12 characters"/></label><button className="primary" disabled={loading}>{loading?"Creating account…":"Create Admin Account"} <ArrowRight size={16}/></button></form></section><section className="panel"><div className="section-title"><div><span className="eyebrow">AUTHORISED OPERATORS</span><h2>Admin Accounts ({adminAccounts.length})</h2></div></div>{adminAccounts.length?adminAccounts.map(row=><article className="notification-item" key={row.id}><Users/><div><b>{row.full_name}</b><p>Login ID: <b>{row.login_id||"—"}</b></p><small>Email: {row.email_address||"—"} · Start date: {row.start_date||"—"} · Renewal date: {row.renewal_date||"—"} (reminder only) · {row.is_active?"Active account":"Deactivated account"}</small></div><button className="outline" onClick={()=>setAdminAccountActive(row,!row.is_active)}>{row.is_active?"Deactivate":"Activate"}</button></article>):<p className="empty">No Admin account has been created yet. Create one above.</p>}</section></>}
      {tab==="member-logins"&&(isAdmin||profile?.role==="patrol_leader")&&<section className="panel">
        <div className="section-title"><div><span className="eyebrow">CONNECTED PORTAL · OYMS 2.0</span><h2>Member Login Details</h2><p className="section-subtitle">{isAdmin?"Create real OYMS 2.0 member accounts and manage access.":"View OYMS 2.0 login IDs and readiness for members in your patrol."}</p></div><div className="review-actions"><button type="button" className="outline" onClick={()=>exportOyms2MemberLogins(visibleMemberRows.filter(r=>!r.is_departed))} disabled={!visibleMemberRows.length}>Export CSV</button>{isAdmin&&<button type="button" className="primary" onClick={()=>setOyms2IdsOpen(v=>!v)}>IDs</button>}</div></div>{isAdmin&&oyms2IdsOpen&&<div className="panel data-form"><h3 className="wide">Create OYMS 2.0 Member Login</h3><label className="wide">Select child<select value={oyms2ChildId} onChange={e=>setOyms2ChildId(e.target.value)} required><option value="">Select a child</option>{visibleMemberRows.filter(r=>!r.is_departed&&!r.oyms2_login_id).map(r=><option key={r.id} value={r.id}>{[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" ")} · {r.category||"Member"}{r.bsg_uid?" · "+r.bsg_uid:""}</option>)}</select></label><label>OYMS 2.0 Login ID<input value={oyms2LoginId} onChange={e=>setOyms2LoginId(e.target.value)} minLength="3" maxLength="30" placeholder="Enter Login ID" required/></label><label className="wide">Temporary password<input type="password" value={oyms2Password} onChange={e=>setOyms2Password(e.target.value)} minLength="12" autoComplete="new-password" placeholder="At least 12 characters" required/><small>Used to create the real 2.0 sign-in account. It is not saved as plain text or included in CSV. The member must change it at first login.</small></label><div className="review-actions wide"><button type="button" className="primary" disabled={loading} onClick={createOyms2MemberLogin}>{loading?"Creating…":"Create Member Login"}</button><button type="button" className="outline" onClick={()=>{setOyms2IdsOpen(false);setOyms2Password("");}}>Cancel</button></div></div>}
        <div className="table-wrap"><table><thead><tr><th>Member</th><th>Category</th><th>BSG UID</th><th>OYMS 2.0 Login ID</th><th>Login Status</th>{isAdmin&&<th>Save</th>}</tr></thead><tbody>{visibleMemberRows.filter(r=>!r.is_departed).map(row=><tr key={row.id}><td>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"Unnamed member"}</td><td>{row.category||"—"}</td><td>{row.bsg_uid||"—"}</td><td>{isAdmin?<input aria-label={"OYMS 2.0 Login ID for "+row.first_name} defaultValue={row.oyms2_login_id||""} id={"oyms2-login-"+row.id} placeholder="Enter Login ID"/>:<b>{row.oyms2_login_id||"Not entered yet"}</b>}</td><td>{isAdmin?<select aria-label={"Login status for "+row.first_name} id={"oyms2-status-"+row.id} defaultValue={row.oyms2_login_status||"in_progress"}><option value="in_progress">Still in Progress</option><option value="can_login">Can Login</option></select>:<span className={"workflow-pill "+(row.oyms2_login_status==="can_login"?"pill-success":"pill-pending")}>{row.oyms2_login_status==="can_login"?"Can Login":"Still in Progress"}</span>}</td>{isAdmin&&<td><button type="button" className="primary" disabled={loading} onClick={()=>saveOyms2Login(row,document.getElementById("oyms2-login-"+row.id)?.value,document.getElementById("oyms2-status-"+row.id)?.value)}>Save</button></td>}</tr>)}</tbody></table></div>
        {!visibleMemberRows.filter(r=>!r.is_departed).length&&<p className="empty">No active member records are available.</p>}
        <p className="section-subtitle">The IDs button creates a real OYMS 2.0 member account. Successful creation automatically changes status to Can Login. Passwords are never included in CSV exports.</p>
      </section>}
      {tab==="data-management"&&isAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">MEMBER PROFILE DATA ONLY</span><h2>Member Data Management</h2><p className="section-subtitle">Search and view the information entered in member profile forms. Verification decisions, OYMS progress, patrol accounts and website controls are handled in their separate dashboard sections.</p></div></div><h3>Search & Filters</h3><div className="data-tools-filters"><label>Search members<input value={dataSearch} onChange={e=>setDataSearch(e.target.value)} placeholder="Name, UID, email or patrol"/></label><label>Category<select value={dataCategory} onChange={e=>setDataCategory(e.target.value)}><option value="all">All categories</option><option value="Scouts">Scouts</option><option value="Guides">Guides</option><option value="Cubs">Cubs</option><option value="Bulbuls">Bulbuls</option></select></label><label>Patrol<select value={dataPatrol} onChange={e=>setDataPatrol(e.target.value)}><option value="all">All patrols</option>{[...new Set(leaders.map(x=>x.patrol_name).filter(Boolean))].sort().map(name=><option key={name} value={name}>{name}</option>)}</select></label><button className="outline" onClick={()=>{setDataSearch("");setDataCategory("all");setDataPatrol("all");}}>Clear filters</button></div><p className="data-tools-result"><b>{dataManagementRows.filter(x=>!x.is_departed).length}</b> matching active member profiles</p><MemberRecords rows={dataManagementRows.filter(x=>!x.is_departed)} onPhoto={viewMemberPhoto} onForms={viewMemberForms}/><FormFileLinks links={formLinks}/></section>}
      {tab==="leaders"&&isAdmin&&<><div className="section-title"><div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h2>Create Patrol Leader Login</h2></div></div><form className="panel data-form" onSubmit={createLeader}><label>Category<select value={leaderForm.category} onChange={e=>setLeaderForm({...leaderForm,category:e.target.value})}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Cub">Cubs</option><option value="Bulbul">Bulbuls</option></select></label><label>BSG UID (if known)<input value={leaderForm.bsg_uid} onChange={e=>setLeaderForm({...leaderForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label><label>Full name<input required value={leaderForm.full_name} onChange={e=>setLeaderForm({...leaderForm,full_name:e.target.value})}/></label><label>Login ID<input required value={leaderForm.login_id} onChange={e=>setLeaderForm({...leaderForm,login_id:e.target.value})} placeholder="e.g. panther01"/></label><label>Patrol Name<input required value={leaderForm.patrol_name} onChange={e=>setLeaderForm({...leaderForm,patrol_name:e.target.value})}/></label><label>Mobile number<input required type="tel" value={leaderForm.mobile_number} onChange={e=>setLeaderForm({...leaderForm,mobile_number:e.target.value})}/></label><label className="wide">Temporary password<div className="password-tools"><input required type={showLeaderPassword?"text":"password"} minLength="12" autoComplete="new-password" value={leaderForm.password} onChange={e=>setLeaderForm({...leaderForm,password:e.target.value})} placeholder="Generate or enter a 12+ character password"/><button type="button" className="outline" onClick={generateTemporaryPassword}>Generate secure password</button><button type="button" className="outline" onClick={()=>setShowLeaderPassword(v=>!v)}>{showLeaderPassword?"Hide":"Show"}</button></div><small>New accounts must change this temporary password at first login. It is not stored in the browser.</small></label><button className="primary" disabled={loading}>{loading?"Creating…":"Create Patrol Login"} <Plus size={16}/></button></form>{createdLeaderCredentials&&<section className="panel credential-panel"><div><span className="eyebrow">ACCOUNT CREATED / PASSWORD RESET</span><h3>Share these login details privately</h3><p>{createdLeaderCredentials.full_name} · {createdLeaderCredentials.patrol_name}</p></div><dl><dt>Login ID</dt><dd>{createdLeaderCredentials.login_id}</dd><dt>Temporary password</dt><dd className="credential-password">{createdLeaderCredentials.password}</dd><dt>Login page</dt><dd>{window.location.origin+window.location.pathname}</dd></dl><p className="section-subtitle">The Patrol Leader must change this temporary password after signing in. This message disappears when you leave this page or dismiss it.</p><div className="review-actions"><button className="primary" onClick={()=>copyLeaderCredentials(createdLeaderCredentials)}>Copy Login Details</button><button className="outline" onClick={()=>setCreatedLeaderCredentials(null)}>Dismiss</button></div></section>}<section className="panel"><div className="section-title"><div><span className="eyebrow">ADMIN · ACCOUNT EXPORT</span><h3>Patrol Login ID Export</h3><p className="section-subtitle">Export registered Patrol Leader Login IDs from this portal as CSV. Account imports and CSV-based account creation are disabled.</p></div></div></section><section className="panel"><div className="section-title"><h3>Registered Patrol Leaders</h3><button type="button" className="outline" onClick={()=>exportPatrolLeaderAccounts()} disabled={!leaders.length}>Export All Login IDs (CSV)</button></div><p className="section-subtitle">Exports names, login IDs, category, patrol, BSG UID, mobile number and account status. Passwords are never exported.</p><input className="search-input" placeholder="Search by name, Login ID, BSG UID or patrol name" value={leaderSearch} onChange={e=>setLeaderSearch(e.target.value)}/><div className="section-title"><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Cub">Cubs</option><option value="Bulbul">Bulbuls</option><option value="Combined">Combined</option></select></div><div className="patrol-export-row"><b>Export by patrol:</b>{[...new Set(leaders.map(x=>x.patrol_name).filter(Boolean))].sort().map(name=><button type="button" className="outline" key={name} onClick={()=>exportPatrolLeaderAccounts(name)}>Export {name}</button>)}</div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>BSG UID (optional)</th><th>Login ID</th><th>Patrol</th><th>Mobile</th><th>Status</th><th>Account Tools</th></tr></thead><tbody>{leaders.filter(x=>(memberCategory==="Combined"||x.category===memberCategory)&&[x.full_name,x.login_id,x.bsg_uid,x.patrol_name].some(v=>(v||"").toLowerCase().includes(leaderSearch.toLowerCase()))).map(x=><tr key={x.user_id}><td>{x.full_name}</td><td>{x.category||"—"}</td><td>{x.bsg_uid||"—"}</td><td>{x.login_id}</td><td>{x.patrol_name}</td><td>{x.mobile_number}</td><td><button className="outline" onClick={async()=>{const {error}=await supabase.from("profiles").update({is_active:!x.is_active}).eq("id",x.user_id);setMessage(error?error.message:(x.is_active?"Account deactivated.":"Account activated."));await refreshData("admin",user.id);}}>{x.is_active?"Set Inactive":"Set Active"}</button><button className="outline" disabled={loading} onClick={()=>resetLeaderPassword(x)}>Reset Password</button></td></tr>)}</tbody></table></div></section></>}
      {tab==="monthly-check"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">MONTHLY MEMBERSHIP CONFIRMATION</span><h2>{isAdmin?"Membership Check History":"Continue for This Month"}</h2><p className="section-subtitle">{isAdmin?"Review monthly Continuing and Left decisions recorded by Patrol Leaders. Previous months remain available.":"Check each member once this month. Choose Continuing if the member is still in your patrol, or Left and provide a reason."}</p></div></div>{!isAdmin&&!isSuperAdmin&&<p className="archive-reminder"><b>{novemberVerificationOpen?monthlyDueRows.length:0}</b> member(s) still need this month's check. Deadline: {membershipCampaign?.deadline||"Not set"}. {!novemberVerificationOpen?"This month’s task is not currently released or is outside its deadline.":""}</p>}{!isAdmin&&!isSuperAdmin&&novemberVerificationOpen&&visibleMemberRows.map(row=>{const checked=membershipChecks.find(x=>x.member_record_id===row.id&&x.checked_month===currentMonth);return <article className="notification-item" key={row.id}><div><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")}</b><p>{row.category} · {row.bsg_uid||"BSG UID not entered"}</p><small>{checked?"Checked this month: "+checked.status:"Awaiting monthly check"}</small></div>{!checked&&<div className="review-actions"><button disabled={loading} onClick={()=>recordMonthlyMembership(row,"continuing")}>Continuing</button><button className="outline" disabled={loading} onClick={()=>recordMonthlyMembership(row,"left")}>Left</button></div>}</article>;})}{isAdmin&&membershipChecks.map(check=>{const row=memberRows.find(x=>x.id===check.member_record_id);return <article className="notification-item" key={check.id}><div><b>{row?[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" "):"Member record"}</b><p>{row?.category||"—"} · {check.status==="left"?"Left":"Continuing"}</p><small>{check.checked_month} · {dateLabel(check.checked_at)}</small>{check.reason&&<p>Reason: {check.reason}</p>}</div></article>;})}{isAdmin&&!membershipChecks.length&&<p className="empty">No monthly membership checks have been recorded yet.</p>}{!isAdmin&&!isSuperAdmin&&!visibleMemberRows.length&&<p className="empty">No active members are assigned to this patrol.</p>}</section>}
      {tab==="archive"&&isAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">ADMIN · RETENTION REVIEW</span><h2>Left Members Archive</h2><p className="section-subtitle">Members appear here one calendar month after being marked Left. Their full records and reasons are retained for Admin review; this archive does not delete records.</p></div><span className="archive-count">{archiveRows.length} Ready for Review</span></div>{archiveRows.length===0?<p className="empty">No members have reached the one-month archive date yet.</p>:<div className="table-wrap"><table><thead><tr><th>Member</th><th>Category</th><th>Left On</th><th>Reason</th><th>BSG UID</th><th>Retention</th></tr></thead><tbody>{archiveRows.map(row=><tr key={row.id}><td><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"Unnamed member"}</b><small className="cell-sub">{row.email||"No email recorded"}</small></td><td>{row.category||"—"}</td><td>{dateLabel(row.departed_at)}</td><td>{row.departure_reason||"—"}</td><td><div className="uid-entry"><input aria-label={"BSG UID for "+row.first_name} disabled={row.is_locked} value={uidDrafts[row.id]??row.bsg_uid??""} onChange={e=>setUidDrafts(v=>({...v,[row.id]:e.target.value}))} placeholder="UID not entered"/><button className="outline" onClick={()=>saveArchiveUid(row)}>Save UID</button></div></td><td><b>Retained</b></td></tr>)}</tbody></table></div>}</section>}
      {tab==="members"&&(isAdmin||profile?.role==="patrol_leader")&&<section className="panel"><div className="section-title"><div><span className="eyebrow">MEMBER RECORDS</span><h2>Submitted Profile Details</h2><p className="section-subtitle">{isAdmin?"All submitted member records.":"Only members registered under your own "+(profile.category||"")+" patrol."}</p></div>{isAdmin&&<select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Cub">Cubs</option><option value="Bulbul">Bulbuls</option><option value="Combined">Combined</option></select>}</div><input className="search-input" placeholder="Search by member name, email or district" value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}/><div className="member-export-tools"><span>Export visible member records</span><button type="button" className="outline" onClick={()=>exportMemberRows("excel",visibleMemberRows.filter(x=>(!isAdmin||memberCategory==="Combined"||categoryKey(x.category)===categoryKey(memberCategory))&&[x.first_name,x.middle_name,x.last_name,x.nickname,x.email,x.district].some(v=>(v||"").toLowerCase().includes(memberSearch.toLowerCase()))))}>Export Excel</button><button type="button" className="outline" onClick={()=>exportMemberRows("pdf",visibleMemberRows.filter(x=>(!isAdmin||memberCategory==="Combined"||categoryKey(x.category)===categoryKey(memberCategory))&&[x.first_name,x.middle_name,x.last_name,x.nickname,x.email,x.district].some(v=>(v||"").toLowerCase().includes(memberSearch.toLowerCase()))))}>Export PDF</button></div><MemberRecords rows={visibleMemberRows.filter(x=>(!isAdmin||memberCategory==="Combined"||categoryKey(x.category)===categoryKey(memberCategory))&&[x.first_name,x.middle_name,x.last_name,x.nickname,x.email,x.district].some(v=>(v||"").toLowerCase().includes(memberSearch.toLowerCase())))} onPhoto={viewMemberPhoto} onForms={viewMemberForms}/><FormFileLinks links={formLinks}/></section>}
      {tab==="member-verification"&&<section className="panel verification-panel">
        <div className="section-title"><div><span className="eyebrow">STAGE 1 · MEMBER VERIFICATION</span><h2>Member UID & Details Verification</h2><p className="section-subtitle">{isAdmin?"Review only records submitted by Patrol Leaders. Enter the official BSG UID, inspect the submitted profile and membership form, then record your decision.":"Track the Admin's UID entry and profile review. If changes are requested, update the record in My Patrol and submit it again."}</p></div></div>
        <div className="workflow-steps"><div className="workflow-step done"><span>1</span><b>Profile submitted</b><small>Patrol Leader</small></div><div className="workflow-step active"><span>2</span><b>UID & details check</b><small>Admin</small></div><div className="workflow-step"><span>3</span><b>Official OYMS update</b><small>In Progress → Completed</small></div><div className="workflow-step"><span>4</span><b>Final approval</b><small>Record locked</small></div></div>
        <div className="verification-view-tabs verification-main-tabs">
          <button type="button" className={memberVerificationView==="dashboard"?"primary":"outline"} onClick={()=>setMemberVerificationView("dashboard")}>Dashboard</button>
          {<button type="button" className={memberVerificationView==="submitted"?"primary":"outline"} onClick={()=>setMemberVerificationView("submitted")}>Profile Submitted ({visibleMemberRows.filter(row=>row.submission_status==="completed").length})</button>}{isAdmin&&<button type="button" className={memberVerificationView==="entered"?"primary":"outline"} onClick={()=>setMemberVerificationView("entered")}>UID & Details Check ({visibleMemberRows.filter(row=>row.submission_status==="completed"&&row.review_status==="pending").length})</button>}
          {!isAdmin&&<button type="button" className={memberVerificationView==="entered"?"primary":"outline"} onClick={()=>setMemberVerificationView("entered")}>Submitted</button>}
          <button type="button" className={memberVerificationView==="verified"?"primary":"outline"} onClick={()=>setMemberVerificationView("verified")}>Verified</button>
          <button type="button" className={memberVerificationView==="needs_changes"?"primary":"outline"} onClick={()=>setMemberVerificationView("needs_changes")}>Needs Changes</button>
        </div>
        {memberVerificationView==="dashboard"&&<div className="verification-dashboard">
          <div className="workflow-summary-grid workflow-click-grid">
            <button type="button" onClick={()=>setMemberVerificationView("submitted")}><b>{visibleMemberRows.filter(row=>row.submission_status==="completed").length}</b><small>Profile Submitted</small><span>Open submitted profiles</span></button>
            <button type="button" onClick={()=>setMemberVerificationView("entered")}><b>{visibleMemberRows.filter(row=>row.submission_status==="completed"&&row.review_status==="pending").length}</b><small>UID & Details Check</small><span>Enter or review BSG UID</span></button>
            <button type="button" onClick={()=>{setOmsVerificationView("update");setTab("oms-verification");}}><b>{visibleMemberRows.filter(row=>row.review_status==="verified"&&!row.is_locked).length}</b><small>Official OYMS Update</small><span>Ready to start / In progress</span></button>
            <button type="button" onClick={()=>{setOmsVerificationView("final");setTab("oms-verification");}}><b>{visibleMemberRows.filter(row=>row.oms_status==="completed"&&!row.is_locked).length}</b><small>Final Approval</small><span>Approve or disapprove records</span></button>
          </div>
          <button type="button" className="needs-changes-shortcut" onClick={()=>setMemberVerificationView("needs_changes")}><AlertCircle size={18}/><span><b>Needs Changes</b><small>{visibleMemberRows.filter(row=>row.review_status==="disapproved"&&!row.is_locked).length} member profile(s) need correction</small></span><ArrowRight size={17}/></button>
        </div>}
        {memberVerificationView!=="dashboard"&&<><div className="verification-toolbar">{isAdmin&&<label>Category<select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Combined">All Categories</option><option value="Scout">Scouts</option><option value="Guide">Guides</option><option value="Cub">Cubs</option><option value="Bulbul">Bulbuls</option></select></label>}<label>Search member<input value={verificationSearch} onChange={e=>setVerificationSearch(e.target.value)} placeholder="Search name, UID or patrol"/></label><button className="outline" onClick={()=>setVerificationSearch("")}>Clear</button></div>
        <div className="verification-list">{visibleMemberRows.filter(row=>(!isAdmin||memberCategory==="Combined"||categoryKey(row.category)===categoryKey(memberCategory))&&(!isAdmin||row.submission_status==="completed")&&(memberVerificationView==="submitted"?row.submission_status==="completed":memberVerificationView==="entered"?(row.submission_status==="completed"&&row.review_status==="pending"):memberVerificationView==="verified"?row.review_status==="verified":row.review_status==="disapproved")&&[row.first_name,row.middle_name,row.last_name,row.bsg_uid,leaders.find(x=>x.user_id===row.patrol_leader_id)?.patrol_name].some(value=>String(value||"").toLowerCase().includes(verificationSearch.toLowerCase()))).map(row=><article className="verification-card" key={row.id}>
          <div className="verification-card-head"><div><span className="eyebrow">{row.category||"BSG MEMBER"} · {leaders.find(x=>x.user_id===row.patrol_leader_id)?.patrol_name||"Assigned Patrol"}</span><h3>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"Unnamed member"}</h3><p>{row.nickname||"No nickname"} · DOB {row.date_of_birth||"—"} · {row.gender||"—"} · Blood group {row.blood_group||"—"}</p></div><span className={"workflow-pill "+(row.is_locked?"pill-locked":row.review_status==="verified"?"pill-success":row.review_status==="disapproved"?"pill-warning":"pill-pending")}>{row.is_locked?"Approved & Locked":row.review_status==="verified"?"Details Verified":row.review_status==="disapproved"?"Needs Changes":row.submission_status==="completed"?"Awaiting Review":"Draft — Not Submitted"}</span></div>
          <div className="verification-facts"><div><small>BSG UID</small><b>{row.bsg_uid||"Not entered yet"}</b></div><div><small>Member photograph</small><b>{row.photo_path?"Uploaded":"Missing"}</b></div><div><small>Signed membership form</small><b>{(row.form_file_paths||[]).length+" file(s)"}</b></div><div><small>Contact / email</small><b>{row.primary_contact||"—"} · {row.email||"—"}</b></div></div>
          {row.review_reason&&<div className="review-reason"><b>Admin correction note</b><p>{row.review_reason}</p></div>}
          <div className="verification-card-actions"><button className="outline" onClick={()=>viewMemberPhoto(row)} disabled={!row.photo_path}>View Photograph</button><button className="outline" onClick={()=>viewMemberForms(row)}>View Signed Form</button>{isAdmin&&!row.is_locked&&row.final_status!=="approved"&&<><button className="outline" onClick={()=>openAdminMemberEditor(row)}>Edit Full Profile</button><button className="outline" onClick={()=>editMemberCategory(row)}>Edit Category</button></>}
            {isAdmin&&<><div className="uid-entry"><input aria-label={"BSG UID for "+row.first_name} value={uidDrafts[row.id]??row.bsg_uid??""} onChange={e=>setUidDrafts(v=>({...v,[row.id]:e.target.value}))} placeholder="Enter official BSG UID"/><button className="outline" onClick={()=>enterMemberUid(row)}>Save UID</button></div><input className="review-note-input" placeholder="Reason for corrections (required if sending back)" value={memberReason[row.id]||""} onChange={e=>setMemberReason(v=>({...v,[row.id]:e.target.value}))}/><button className="primary" disabled={row.submission_status!=="completed"||!String(row.bsg_uid||"").trim()||row.is_locked} onClick={()=>reviewMember(row,"verified")}>Verify Details</button><button className="danger-outline" disabled={row.submission_status!=="completed"||!String(memberReason[row.id]||"").trim()||row.is_locked} onClick={()=>reviewMember(row,"disapproved")}>Request Corrections</button></>}
          </div>
        </article>)}</div>
        </>}
        {adminEditingMember&&isAdmin&&<form className="panel data-form admin-member-editor" onSubmit={saveAdminMemberEdit}>
          <div className="section-title wide"><div><span className="eyebrow">SUPER ADMIN · PROFILE CORRECTION</span><h3>Edit {[adminEditingMember.first_name,adminEditingMember.last_name].filter(Boolean).join(" ")}</h3><p className="section-subtitle">Changes are saved to this submitted record. Existing photo and signed form files remain attached.</p></div><button type="button" className="outline" onClick={()=>setAdminEditingMember(null)}>Close</button></div>
          <label>Category<select value={adminMemberDraft.category||"Scout"} onChange={e=>setAdminMemberDraft(v=>({...v,category:e.target.value}))}><option value="Scout">Scouts</option><option value="Guide">Guides</option><option value="Cub">Cubs</option><option value="Bulbul">Bulbuls</option></select></label>
          <label>Official BSG UID<input value={adminMemberDraft.bsg_uid||""} onChange={e=>setAdminMemberDraft(v=>({...v,bsg_uid:e.target.value}))} /></label>
          {[
            ["first_name","First Name"],["middle_name","Middle Name"],["last_name","Last Name"],["nickname","Nickname"],["date_of_birth","Date of Birth","date"],["gender","Gender"],["blood_group","Blood Group"],["aadhaar_number","Aadhaar Number"],["urn_number","URN Number"],["father_name","Father's Full Name"],["father_occupation","Father's Occupation"],["mother_name","Mother's Full Name"],["mother_occupation","Mother's Occupation"],["residential_address","Residential Address","textarea"],["town_village","Town / Village"],["district","District"],["state","State"],["pin_code","PIN Code"],["primary_contact","Primary Contact"],["whatsapp_number","WhatsApp Number"],["alternative_contact","Alternative Contact"],["emergency_contact","Emergency Contact"],["emergency_contact_person","Emergency Contact Person & Relationship"],["email","Email Address","email"]
          ].map(([key,label,type])=><label className={type==="textarea"?"wide":""} key={key}>{label}{type==="textarea"?<textarea rows="3" value={adminMemberDraft[key]||""} onChange={e=>setAdminMemberDraft(v=>({...v,[key]:e.target.value}))}/>:<input type={type||"text"} value={adminMemberDraft[key]||""} maxLength={key==="aadhaar_number"?12:undefined} onChange={e=>setAdminMemberDraft(v=>({...v,[key]:key==="aadhaar_number"?e.target.value.replace(/\\D/g,"").slice(0,12):e.target.value}))}/>}</label>)}
          <label>Patrol Designation<select value={adminMemberDraft.patrol_position||"Patrol Member"} onChange={e=>setAdminMemberDraft(v=>({...v,patrol_position:e.target.value}))}><option>Patrol Member</option><option>Assistant Patrol Leader</option></select></label>
          <div className="form-actions wide"><button type="submit" className="primary" disabled={adminMemberSaving}>{adminMemberSaving?"Saving…":"Save Profile Changes"}</button></div>
        </form>}
        <FormFileLinks links={formLinks}/>
        {memberVerificationView!=="dashboard"&&!visibleMemberRows.some(row=>(!isAdmin||row.submission_status==="completed")&&(memberVerificationView==="entered"?(row.submission_status==="completed"&&row.review_status==="pending"):memberVerificationView==="verified"?row.review_status==="verified":row.review_status==="disapproved")&&[row.first_name,row.middle_name,row.last_name,row.bsg_uid,leaders.find(x=>x.user_id===row.patrol_leader_id)?.patrol_name].some(value=>String(value||"").toLowerCase().includes(verificationSearch.toLowerCase())))&&<p className="empty">{memberVerificationView==="submitted"?"No submitted member profiles yet.":memberVerificationView==="entered"?"No entered member records are waiting for verification.":memberVerificationView==="verified"?"No verified member records yet.":"No member records need corrections."}</p>}
      </section>}
      {tab==="oms-verification"&&<section className="panel verification-panel">
        <div className="section-title"><div><span className="eyebrow">{omsVerificationView==="update"?"OFFICIAL OYMS PROFILE UPDATE":"FINAL APPROVAL"}</span><h2>{omsVerificationView==="update"?"Official OYMS Profile Update":"Final Approval"}</h2><p className="section-subtitle">{omsVerificationView==="update"?"Update each verified member's official OYMS record and track its stage.":"Approve completed OYMS records or disapprove and remove a record from this portal."}</p></div></div>
        <div className="verification-view-tabs"><button type="button" className={omsVerificationView==="update"?"primary":"outline"} onClick={()=>setOmsVerificationView("update")}>Official OYMS Profile Update</button><button type="button" className={omsVerificationView==="final"?"primary":"outline"} onClick={()=>setOmsVerificationView("final")}>Final Approval</button></div>
        <div className="table-wrap"><table><thead><tr><th>Member Name</th>{omsVerificationView==="final"&&<th>BSG UID</th>}<th>Status</th>{omsVerificationView==="final"&&<th>Action</th>}</tr></thead><tbody>{visibleMemberRows.filter(row=>(!isAdmin||row.submission_status==="completed")&&(omsVerificationView==="update"?(row.review_status==="verified"||row.final_status==="approved"):(row.oms_status==="completed"||row.final_status==="approved"||row.final_approval_status==="in_progress"))).map(row=><tr key={row.id}><td><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"Unnamed member"}</b></td>{omsVerificationView==="final"&&<td>{row.bsg_uid||"—"}</td>}<td>{omsVerificationView==="update"?(row.final_status==="approved"&&row.is_locked?<span className="workflow-pill pill-success">Finally Approved</span>:isAdmin&&!row.is_locked?<select className="workflow-select" disabled={!row.bsg_uid||row.review_status!=="verified"} value={row.oms_status||"not_updated"} onChange={e=>markOmsUpdated(row,e.target.value)}><option value="not_updated">Ready to Start</option><option value="in_progress">In Progress</option><option value="completed" disabled={row.oms_status!=="in_progress"}>OYMS Completed</option></select>:<span className="workflow-pill">{row.oms_status==="completed"?"OYMS Completed":row.oms_status==="in_progress"?"In Progress":"Ready to Start"}</span>):row.final_status==="approved"&&row.is_locked?<span className="workflow-pill pill-success">Finally Approved</span>:<span className="workflow-pill pill-pending">Awaiting Final Approval</span>}</td>{omsVerificationView==="final"&&<td>{row.final_status==="approved"&&row.is_locked?<span className="workflow-pill pill-success">Approved & Locked</span>:isAdmin?<><button className="primary" disabled={row.review_status!=="verified"||row.oms_status!=="completed"||!row.bsg_uid} onClick={()=>finalApprove(row)}>Approve</button><button className="danger-outline" onClick={()=>deleteDisapprovedMember(row)}>Disapprove & Delete</button></>:<span>Awaiting Admin</span>}</td>}</tr>)}</tbody></table></div>
        {!visibleMemberRows.some(row=>!isAdmin||row.submission_status==="completed")&&<p className="empty">No member records are available yet.</p>}
      </section>}
      {tab==="new"&&!isAdmin&&<><div className="section-title"><div><span className="eyebrow">PATROL MEMBER REGISTRATION</span><h2>{editingMember?"Edit Member Details":"My Patrol Members"}</h2></div><div><small>Patrol strength: {memberRows.filter(x=>x.patrol_leader_id===user.id&&(!leaderCategory||categoryKey(x.category||profile.category)===leaderCategory)).length+1}/8 (including you)</small><p className="roster-note">Maximum 8 people per patrol, including the Patrol Leader. The final student entered must be designated as Assistant Patrol Leader.</p></div><button className="primary" disabled={memberRows.filter(x=>x.patrol_leader_id===user.id&&(!leaderCategory||categoryKey(x.category||profile.category)===leaderCategory)).length>=7} onClick={()=>{setMemberFormOpen(true);setEditingMember(null);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",aadhaar_number:"",urn_number:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);}}><Plus size={15}/> Add Member</button></div>{memberFormOpen&&<form className="panel data-form" onSubmit={saveMember}><h3 className="wide">Member Registration Form – {profile.category||"Scout"}</h3><label>Patrol Designation *<select required value={memberForm.patrol_position||"Patrol Member"} onChange={e=>setMemberForm({...memberForm,patrol_position:e.target.value})}><option value="Patrol Member">Patrol Member</option><option value="Assistant Patrol Leader">Assistant Patrol Leader</option></select><small>The last student entered in your patrol must be selected as Assistant Patrol Leader. Only one Assistant Patrol Leader is allowed.</small></label><label className="wide">Upload recent passport-size photograph in correct Scout / Guide uniform *<input type="file" required={!editingMember?.photo_path} accept="image/jpeg,image/png,image/webp" onChange={e=>setMemberPhoto(e.target.files?.[0]||null)}/></label><label className="wide">Upload completed Membership Form *<input type="file" required={!editingMember?.form_file_paths?.length} multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{const files=Array.from(e.target.files||[]);const total=(editingMember?.form_file_paths?.length||0)+files.length;if(total>4){setMemberFormFiles([]);e.target.value="";setMessage("Maximum four membership form files are allowed.");return;}setMemberFormFiles(files);setMessage("");}}/><small>Upload the completed paper form with Parent / Guardian, Class Teacher and Student signatures. Upload 1–4 files: one PDF or up to four photos/files. PDF, JPG, PNG and WebP accepted; maximum 10 MB per file. Existing files: {editingMember?.form_file_paths?.length||0}. New files selected: {memberFormFiles.length}.</small></label><label className="wide">BSG UID Number (optional)<input value={memberForm.bsg_uid||""} onChange={e=>setMemberForm({...memberForm,bsg_uid:e.target.value,bsg_uid_known:!!e.target.value.trim()})} placeholder="Enter only if already known"/><small>If you do not know the BSG UID, leave this blank. The Super Admin will enter it during Member Verification.</small></label>{[["first_name","First Name *","text"],["middle_name","Middle Name (optional)","text"],["last_name","Last Name *","text"],["nickname","Nickname *","text"],["date_of_birth","Date of Birth *","date"],["gender","Gender *","select"],["blood_group","Blood Group *","select"],["aadhaar_number","Aadhaar Number *","text"],["urn_number","URN Number *","text"],["father_name","Father's Full Name *","text"],["father_occupation","Father's Occupation *","text"],["mother_name","Mother's Full Name *","text"],["mother_occupation","Mother's Occupation *","text"],["residential_address","Residential Address *","textarea"],["town_village","Town / Village *","text"],["district","District *","text"],["state","State *","text"],["pin_code","PIN Code *","text"],["primary_contact","Primary Contact Number *","tel"],["whatsapp_number","WhatsApp Number *","tel"],["alternative_contact","Alternative Contact Number *","tel"],["emergency_contact","Emergency Contact Number *","tel"],["emergency_contact_person","Emergency Contact Person & Relationship *","text"],["email","Email Address *","email"]].map(([key,label,type])=><label className={type==="textarea"?"wide":""} key={key}>{label}{type==="select"?<select required value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}>{(key==="gender"?["","Male","Female","Other"]:["","A+","A-","B+","B-","AB+","AB-","O+","O-"]).map(v=><option value={v}>{v||"Select"}</option>)}</select>:type==="textarea"?<textarea required rows="3" value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}/>:<input required={key!=="middle_name"} type={type} maxLength={key==="aadhaar_number"?12:undefined} inputMode={key==="aadhaar_number"?"numeric":undefined} pattern={key==="aadhaar_number"?"[0-9]{12}":undefined} value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:key==="aadhaar_number"?e.target.value.replace(/\\D/g,"").slice(0,12):e.target.value})}/>}</label>)}<div className="form-actions wide"><button className="primary" disabled={loading}>{loading?"Saving…":"Save Member Details"}</button></div></form>}<section className="panel"><h3>My Registered Patrol Members</h3><MemberRecords rows={memberRows.filter(x=>x.patrol_leader_id===user.id)} onPhoto={viewMemberPhoto} onForms={viewMemberForms} onUnfreeze={requestUnfreeze} onEdit={row=>{setEditingMember(row);setMemberFormOpen(true);setMemberFormFiles([]);setMemberForm(row);setTab("new");}} onComplete={row=>completeMember(row)}/><FormFileLinks links={formLinks}/></section></>}      {tab==="submissions"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">{isAdmin?"ADMIN REVIEW":"YOUR RECORDS"}</span><h2>{isAdmin?"All Submissions":"My Submissions"}</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_changes">Needs Changes</option><option value="completed">Completed</option></select></div><SubmissionList rows={submissions.filter(x=>filter==="all"||x.status===filter)} isAdmin={isAdmin} onStatus={updateStatus}/></section>}
      {tab==="launch"&&isSuperAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">LAUNCH & ANNOUNCEMENTS</span><h2>Send Instant Pop Up</h2><p className="section-subtitle">Each account sees each update only once in total. Start and expiry dates control when it is available.</p></div></div><form className="data-form" onSubmit={publishLaunchAnnouncement}><label className="wide">Subject / Launch Title *<input required maxLength="140" value={launchTitle} onChange={e=>setLaunchTitle(e.target.value)} placeholder="SANKALP 4.0 IS OFFICIALLY LAUNCHED!"/></label><label className="wide">Description *<textarea required rows="4" maxLength="4000" value={launchDescription} onChange={e=>setLaunchDescription(e.target.value)} placeholder="Write the launch message or announcement details…"/></label><label>Start Date *<input required type="date" value={launchSchedule} onChange={e=>setLaunchSchedule(e.target.value)}/></label><label>Expiry Date *<input required type="date" min={launchSchedule} value={launchExpiry} onChange={e=>setLaunchExpiry(e.target.value)}/></label><label className="wide">Optional image or video<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={e=>setLaunchMedia(e.target.files?.[0]||null)}/><small>JPG, PNG, WebP, MP4 or WebM · maximum 50 MB. Media fits the popup automatically; videos play automatically.</small></label><button className="primary" disabled={loading}>{loading?"Saving…":"Schedule / Publish Launch Update"} <Megaphone size={16}/></button></form></section><section className="panel"><h3>Launch Updates ({launchAnnouncements.length})</h3>{launchAnnouncements.map(x=><article className="notification-item" key={x.id}><Megaphone/><div><b>{x.title}</b><p>{x.description}</p><small>Start: {x.starts_on||"—"} · Expires: {x.expires_on||"No expiry"}</small></div><button className="outline" onClick={()=>deleteLaunchAnnouncement(x)}>Delete</button></article>)}{!launchAnnouncements.length&&<p className="empty">No launch updates yet.</p>}</section></>}
      {tab==="header"&&isSuperAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">PUBLIC HOMEPAGE</span><h2>Header Image</h2><p className="section-subtitle">Upload one image for the entire school header. It automatically adjusts for desktop and mobile. No text or logos are overlaid; include all desired design elements in the image. Homepage slides below remain unchanged.</p></div></div><form className="data-form" onSubmit={uploadPortalHeader}><label className="wide">Choose header image *<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setHeaderFile(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP · maximum 50 MB before automatic resizing. A wide landscape image is recommended.</small></label><button className="primary" disabled={loading}>{loading?"Uploading…":"Replace Header Image"} <Plus size={16}/></button></form>{portalHeader?<><h3>Current header</h3><img src={portalHeader} alt="Current custom header" style={{width:"100%",maxHeight:260,objectFit:"contain",background:"#f4eff8",borderRadius:12}}/><button className="outline" disabled={loading} onClick={removePortalHeader}>Remove image and restore default</button></>:<p className="empty">Default header is currently displayed.</p>}</section>}{tab==="slides"&&isSuperAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">PUBLIC HOMEPAGE</span><h2>Manage Welcome Slides</h2><p className="section-subtitle">Upload a banner image. Images are automatically resized to fit the slideshow while keeping their proportions.</p></div></div><form className="data-form" onSubmit={uploadHomepageSlide}><label className="wide">Slide image *<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setSlideFile(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP · maximum 50 MB (automatically resized for the slideshow). Any image shape is accepted; wide landscape looks best.</small></label><label>Slide title (optional)<input maxLength="120" value={slideTitle} onChange={e=>setSlideTitle(e.target.value)}/></label><label>Slide subtitle (optional)<input maxLength="240" value={slideSubtitle} onChange={e=>setSlideSubtitle(e.target.value)}/></label><label>Display until (optional)<input type="datetime-local" value={slideEndAt} onChange={e=>setSlideEndAt(e.target.value)}/><small>The slide automatically disappears from the public header after this date and time.</small></label><button className="primary" disabled={loading}>{loading?"Uploading…":"Upload Homepage Slide"} <Plus size={16}/></button></form></section><section className="panel"><h3>Published Slides ({homepageSlides.length})</h3>{homepageSlides.length===0&&<p className="empty">No slides uploaded yet. Upload the first homepage slide above.</p>}<div className="slide-admin-grid">{homepageSlides.map((slide,index)=><article className="slide-admin-card" key={slide.id}><img src={slide.image_url} alt={slide.title||"Homepage slide"}/><div><b>{slide.title||"Homepage slide"}</b>{slide.subtitle&&<p>{slide.subtitle}</p>}<small>{slide.expires_at?"Ends: "+dateLabel(slide.expires_at):"No end date set"}</small><div className="slide-order-actions"><button className="outline" disabled={loading||index===0} onClick={()=>moveHomepageSlide(slide,-1)}>Move Up ↑</button><button className="outline" disabled={loading||index===homepageSlides.length-1} onClick={()=>moveHomepageSlide(slide,1)}>Move Down ↓</button><button className="outline" onClick={()=>removeHomepageSlide(slide)}>Remove Slide</button></div></div></article>)}</div></section></>}
      {tab==="notifications"&&<>{!isSuperAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">PORTAL MESSAGES</span><h2>{notificationArchiveOpen?"Notification Archive":"Notices & Notifications"}</h2><p className="section-subtitle">{notificationArchiveOpen?"Notifications older than 10 days are kept here for reference.":"Notifications remain here for 10 days, then move automatically to Archive. Archived notifications are not deleted."}</p></div><button className="outline" onClick={()=>setNotificationArchiveOpen(v=>!v)}>{notificationArchiveOpen?"Back to Notifications":"See Archive ("+archivedNotifications.length+")"}</button></div>{(notificationArchiveOpen?archivedNotifications:activeNotifications).map(x=><article className="notification-item" key={x.id}><Bell size={18}/><div><b>{x.title}</b><p>{x.message}</p><small>{dateLabel(x.created_at)}{archivedNotifications.includes(x)?" · Archived":""}</small></div>{!x.read_at&&<button className="outline" onClick={()=>markRead(x)}>Mark read</button>}</article>)}{!(notificationArchiveOpen?archivedNotifications:activeNotifications).length&&<p className="empty">{notificationArchiveOpen?"No archived notifications yet.":"No new notifications."}</p>}</section>}{isAdmin&&<form className="panel data-form" onSubmit={sendNotification}><h3 className="wide">Send Notice / Notification to Login IDs</h3><label className="wide">Send to<select value={noticeRecipient} onChange={e=>setNoticeRecipient(e.target.value)}><option value="all">All active Patrol Leader Login IDs</option>{leaders.filter(x=>x.is_active).map(x=><option key={x.user_id} value={x.user_id}>{x.full_name} ({x.login_id})</option>)}</select></label><label className="wide">Title<input required value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})}/></label><label className="wide">Message<textarea required rows="3" value={noticeForm.message} onChange={e=>setNoticeForm({...noticeForm,message:e.target.value})}/></label><button className="primary" disabled={loading}>Send Notice / Notification <Bell size={16}/></button></form>}{isSuperAdmin&&<form className="panel data-form" onSubmit={publishPublicNotice}><h3 className="wide">Publish Public Website Notice</h3><p className="wide public-notice-help">This notice will appear on the public SANKALP 4.0 homepage for visitors.</p><label className="wide">Notice Title<input required maxLength="120" value={publicNoticeForm.title} onChange={e=>setPublicNoticeForm({...publicNoticeForm,title:e.target.value})}/></label><label className="wide">Notice Details<textarea rows="4" required maxLength="3000" value={publicNoticeForm.body} onChange={e=>setPublicNoticeForm({...publicNoticeForm,body:e.target.value})}/></label><button className="primary" disabled={loading}>{loading?"Publishing…":"Publish Public Notice"} <FileText size={16}/></button></form>}</>}
      {tab==="audit"&&isAdmin&&<section className="panel"><h2>Unfreeze Requests</h2>{unfreezeRequests.filter(x=>x.status==="pending").map(x=><article className="notification-item" key={x.id}><div><b>Member record: {x.member_record_id}</b><p>{x.reason}</p><small>{dateLabel(x.created_at)}</small></div><button className="outline" onClick={()=>forwardUnfreeze(x)}>Forward to Super Admin</button></article>)}{!unfreezeRequests.some(x=>x.status==="pending")&&<p className="empty">No pending unfreeze requests.</p>}</section>}
      {tab==="unfreeze-super"&&isSuperAdmin&&<section className="panel"><h2>Unfreeze Permission Requests</h2><p className="section-subtitle">Only request reasons and Admin notes appear here. Member profile details are not accessible from this dashboard.</p>{superUnfreezeRequests.map(x=><article className="notification-item" key={x.id}><div><b>Request reference: {x.id.slice(0,8).toUpperCase()}</b><p>{x.reason}</p>{x.admin_note&&<p>Admin note: {x.admin_note}</p>}<small>Forwarded: {dateLabel(x.admin_forwarded_at||x.created_at)}</small></div><button className="outline" onClick={()=>decideSuperUnfreeze(x,true)}>Approve</button><button className="outline" onClick={()=>decideSuperUnfreeze(x,false)}>Reject</button></article>)}{!superUnfreezeRequests.length&&<p className="empty">No forwarded unfreeze requests.</p>}</section>}
      {tab==="profile"&&<><section className="panel profile"><div className="avatar">{profilePhotoUrl?<img style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:(profile.full_name||"U").slice(0,1)}</div><h2>{profile.full_name}</h2><p>{profile.role==="super_admin"?"Super Admin":profile.role==="admin"?"Admin":"Patrol Leader"}</p><dl><dt>Login ID</dt><dd>{profile.login_id}</dd><dt>Patrol</dt><dd>{profile.patrol_name||"—"}</dd><dt>Email</dt><dd>{profile.email_address||user.email||"—"}</dd><dt>Mobile</dt><dd>{profile.mobile_number||"—"}</dd><dt>Date of Birth</dt><dd>{profile.date_of_birth||"—"}</dd><dt>Gender</dt><dd>{profile.gender||"—"}</dd><dt>Blood Group</dt><dd>{profile.blood_group||"—"}</dd><dt>Address</dt><dd>{profile.residential_address||"—"}</dd><dt>Account status</dt><dd>{profile.is_active?"Active":"Inactive"}</dd></dl>{["patrol_leader","admin","super_admin"].includes(profile?.role)&&<button type="button" className="outline" onClick={()=>{setProfileSetup({full_name:profile.full_name||"",date_of_birth:profile.date_of_birth||"",gender:profile.gender||"",blood_group:profile.blood_group||"",mobile_number:profile.mobile_number||"",email_address:profile.email_address||"",bsg_uid:profile.bsg_uid||"",residential_address:profile.residential_address||""});setProfileEditing(true);}}>Edit My Profile</button>}</section>{profileEditing&&["patrol_leader","admin","super_admin"].includes(profile?.role)&&<form className="panel data-form" onSubmit={savePatrolProfile}><h3 className="wide">Edit My Profile</h3><label className="wide">Profile photograph<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setProfilePhoto(e.target.files?.[0]||null)}/><small>Choose a new photo only if you want to replace the current one.</small></label><label>Full Name *<input required value={profileSetup.full_name} onChange={e=>setProfileSetup({...profileSetup,full_name:e.target.value})}/></label><label>Date of Birth *<input required type="date" value={profileSetup.date_of_birth} onChange={e=>setProfileSetup({...profileSetup,date_of_birth:e.target.value})}/></label><label>Gender *<select required value={profileSetup.gender} onChange={e=>setProfileSetup({...profileSetup,gender:e.target.value})}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label><label>Blood Group<select value={profileSetup.blood_group} onChange={e=>setProfileSetup({...profileSetup,blood_group:e.target.value})}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(v=><option key={v}>{v}</option>)}</select></label><label>Mobile Number *<input required type="tel" value={profileSetup.mobile_number} onChange={e=>setProfileSetup({...profileSetup,mobile_number:e.target.value})}/></label><label>Contact Email (Change to your current, correct email address.)<input type="email" value={profileSetup.email_address} placeholder="local_cubs_oyms@gmail.com" onChange={e=>setProfileSetup({...profileSetup,email_address:e.target.value})}/></label><label>BSG UID (if available)<input value={profileSetup.bsg_uid} onChange={e=>setProfileSetup({...profileSetup,bsg_uid:e.target.value})}/></label><label className="wide">Residential Address *<textarea required rows="3" value={profileSetup.residential_address} onChange={e=>setProfileSetup({...profileSetup,residential_address:e.target.value})}/></label><div className="form-actions wide"><button className="primary" disabled={loading}>{loading?"Saving…":"Save Changes"}</button><button type="button" className="outline" onClick={()=>setProfileEditing(false)}>Cancel</button></div></form>}<form className="panel data-form" onSubmit={changePassword}><h3 className="wide">{(isAdmin||isSuperAdmin)&&user?.user_metadata?.password_initialized!==true?"Set Account Password":"Change Password"}</h3>{profile?.role==="patrol_leader"&&profile.must_change_password&&<><p className="wide">You can keep your temporary password or choose to change it now. Changing it is optional.</p><button type="button" className="outline wide" disabled={loading} onClick={continueWithTemporaryPassword}>{loading?"Please wait…":"Continue with Temporary Password"}</button></>}{!((isAdmin||isSuperAdmin)&&user?.user_metadata?.password_initialized!==true)&&<label className="wide">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Enter current password"/></label>}<label>New password<input required type="password" autoComplete="new-password" minLength="12" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 10 characters"/></label><label>Confirm new password<input required type="password" autoComplete="new-password" minLength="12" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter new password"/></label><button className="primary" disabled={loading}>{loading?"Saving…":(isAdmin||isSuperAdmin)&&user?.user_metadata?.password_initialized!==true?"Set Password":"Update Password"}</button></form></>}
    </main><footer className="app-footer">{DIVISION} · OYMS SANKALP 4.0</footer></section>{announcementOpen&&activeAnnouncement&&<div className="launch-modal-backdrop"><div className="launch-celebration" aria-hidden="true"><div className="launch-ribbons">{Array.from({length:22},(_,i)=><i key={"r"+i} style={{left:((i*29)%100)+"%",animationDelay:((i%9)*-.43)+"s",animationDuration:(4.5+(i%6)*.7)+"s", "--ribbon-hue":(i*37)%360+"deg"}}/>)}</div><div className="launch-sparkles">{Array.from({length:100},(_,i)=><i key={"c"+i} style={{left:((i*37)%100)+"%",animationDelay:((i%17)*-.19)+"s",animationDuration:(3.2+(i%7)*.45)+"s", "--confetti-hue":(i*41)%360+"deg"}}/>)}</div></div><section className="launch-modal"><button className="launch-close" onClick={closeAnnouncement}>×</button><span className="eyebrow">SANKALP 4.0 · OFFICIAL UPDATE</span><h2>{activeAnnouncement.title}</h2>{activeAnnouncement.media_url&&(activeAnnouncement.media_type==="video"?<video className="launch-media" src={activeAnnouncement.media_url} autoPlay controls playsInline onEnded={closeAnnouncement}/>:<img className="launch-media" src={activeAnnouncement.media_url} alt="Launch update"/>)}<p className="launch-description">{activeAnnouncement.description}</p><button className="primary block" onClick={closeAnnouncement}>Continue to Portal <ArrowRight size={17}/></button></section></div>}{confettiOn&&<div className="launch-confetti" aria-hidden="true">{Array.from({length:64},(_,i)=><i key={i} style={{left:((i*37)%100)+"%",animationDelay:((i%12)*0.08)+"s",transform:"rotate("+((i*41)%360)+"deg)"}}/>)}</div>}</div>;

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


function MemberRecords({rows,onPhoto,onForms,onEdit,onComplete,onUnfreeze,onToggleActive}){
 if(!rows.length)return <p className="empty">No member records found.</p>;
 const fullName=r=>[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" ")||"—";
 const hasActions=!!(onEdit||onComplete||onUnfreeze||onToggleActive);
 return <div className="table-wrap"><table className="member-record-table"><thead><tr><th>Photo</th><th>Form</th><th>Full Name</th><th>Nickname</th><th>Date of Birth</th><th>Gender</th><th>Blood Group</th><th>Aadhaar Number (restricted)</th><th>URN Number</th><th>BSG UID (optional)</th><th>Father's Name</th><th>Father's Occupation</th><th>Mother's Name</th><th>Mother's Occupation</th><th>Residential Address</th><th>Town / Village</th><th>District</th><th>State</th><th>PIN Code</th><th>Primary Contact</th><th>WhatsApp</th><th>Alternative Contact</th><th>Emergency Contact</th><th>Emergency Contact Person</th><th>Email</th><th>Patrol Designation</th><th>Category</th>{hasActions&&<th>Actions</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.photo_path&&onPhoto?<button type="button" className="outline" onClick={()=>onPhoto(r)}>View Photo</button>:<span>—</span>}</td><td>{(r.form_file_paths||[]).length&&onForms?<button type="button" className="outline" onClick={()=>onForms(r)}>View Form</button>:<span>—</span>}</td><td><b>{fullName(r)}</b>{r.is_departed&&<small className="departed-label">LEFT THE UNIT</small>}</td><td>{r.nickname||"—"}</td><td>{r.date_of_birth||"—"}</td><td>{r.gender||"—"}</td><td>{r.blood_group||"—"}</td><td>{r.aadhaar_number?"•••• •••• "+String(r.aadhaar_number).slice(-4):"—"}</td><td>{r.urn_number||"—"}</td><td>{r.bsg_uid||"—"}</td><td>{r.father_name||"—"}</td><td>{r.father_occupation||"—"}</td><td>{r.mother_name||"—"}</td><td>{r.mother_occupation||"—"}</td><td>{r.residential_address||"—"}</td><td>{r.town_village||"—"}</td><td>{r.district||"—"}</td><td>{r.state||"—"}</td><td>{r.pin_code||"—"}</td><td>{r.primary_contact||"—"}</td><td>{r.whatsapp_number||"—"}</td><td>{r.alternative_contact||"—"}</td><td>{r.emergency_contact||"—"}</td><td>{r.emergency_contact_person||"—"}</td><td>{r.email||"—"}</td><td>{r.patrol_position||"Patrol Member"}</td><td>{r.category||"—"}</td>{hasActions&&<td><div className="review-actions">{(r.is_locked||r.final_status==="approved")?<><b>Locked</b>{onUnfreeze&&<button type="button" className="outline" onClick={()=>onUnfreeze(r)}>Request Unfreeze</button>}</>:<>{onEdit&&<button type="button" className="outline" onClick={()=>onEdit(r)}>Edit</button>}{onComplete&&r.submission_status!=="completed"&&<button type="button" onClick={()=>onComplete(r)}>Submit for Admin Review</button>}{onToggleActive&&<button type="button" className="outline" onClick={()=>onToggleActive(r)}>{r.is_active?"Set Inactive":"Set Active"}</button>}</>}</div></td>}</tr>)}</tbody></table></div>;
}
