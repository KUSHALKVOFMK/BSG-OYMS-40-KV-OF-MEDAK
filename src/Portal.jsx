import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Users, ClipboardList, Bell, FileText, LogOut, ArrowRight, LockKeyhole, Menu, X, CheckCircle2, Clock3, AlertCircle, Plus, Search, Flag, Home, UserCircle, RefreshCw, Megaphone, Archive, Trash2 } from "lucide-react";

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

export default function Portal(){
  const [page,setPage] = useState("welcome");
  const [welcomeSlide,setWelcomeSlide] = useState(0);
  const [notificationPopup,setNotificationPopup] = useState(false);
  const [publicNotices,setPublicNotices] = useState([]);
  const [homepageSlides,setHomepageSlides] = useState([]);
  const [slideFile,setSlideFile] = useState(null);
  const [slideTitle,setSlideTitle] = useState("");
  const [slideSubtitle,setSlideSubtitle] = useState("");
  const [launchTitle,setLaunchTitle] = useState("");
  const [launchDescription,setLaunchDescription] = useState("");
  const [launchSchedule,setLaunchSchedule] = useState("");
  const [launchMedia,setLaunchMedia] = useState(null);
  const [launchAnnouncements,setLaunchAnnouncements] = useState([]);
  const [activeAnnouncement,setActiveAnnouncement] = useState(null);
  const [announcementOpen,setAnnouncementOpen] = useState(false);
  const [confettiOn,setConfettiOn] = useState(false);
  const [publicNoticeForm,setPublicNoticeForm] = useState({title:"",body:""});
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
  const [dataSearch,setDataSearch] = useState("");
  const [dataCategory,setDataCategory] = useState("all");
  const [dataPatrol,setDataPatrol] = useState("all");
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
  const [memberReason,setMemberReason] = useState({});
  const [uidDrafts,setUidDrafts] = useState({});

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{ if(data.session?.user) enterPortal(data.session.user); }); },[]);
  useEffect(()=>{ if(page!=="welcome" || homepageSlides.length<2) return; const timer=setInterval(()=>setWelcomeSlide(v=>(v+1)%homepageSlides.length),7000); return ()=>clearInterval(timer); },[page,homepageSlides.length]);
  useEffect(()=>{ loadPublicNotices(); loadHomepageSlides(); },[]);
  useEffect(()=>{if(profile?.role==="super_admin"&&tab==="launch")loadLaunchAnnouncements();},[profile?.role,tab]);
  async function loadPublicNotices(){const {data,error}=await supabase.from("notices").select("*").eq("is_published",true).order("published_on",{ascending:false}).limit(6);if(!error&&data)setPublicNotices(data);}
  async function loadHomepageSlides(){const {data,error}=await supabase.from("homepage_slides").select("*").eq("is_active",true).order("sort_order",{ascending:true}).order("created_at",{ascending:true});if(error){setMessage(error.message);return;}setHomepageSlides((data||[]).map(x=>({...x,image_url:supabase.storage.from("homepage-slides").getPublicUrl(x.image_path).data.publicUrl})));setWelcomeSlide(0);}
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
    await checkFirstLoginAnnouncement(authUser.id);
  }

  async function loadLaunchAnnouncements(){
    const {data,error}=await supabase.from("portal_announcements").select("*").order("created_at",{ascending:false}).limit(30);
    if(error){setMessage(error.message);return;}
    setLaunchAnnouncements((data||[]).map(x=>({...x,media_url:x.media_path?supabase.storage.from("portal-announcements").getPublicUrl(x.media_path).data.publicUrl:null})));
  }
  async function checkFirstLoginAnnouncement(userId){
    const {data:items,error}=await supabase.from("portal_announcements").select("*").eq("is_published",true).lte("scheduled_at",new Date().toISOString()).order("scheduled_at",{ascending:false}).limit(10);
    if(error||!items?.length)return;
    const ids=items.map(x=>x.id);
    const {data:seen}=await supabase.from("portal_announcement_views").select("announcement_id").eq("user_id",userId).in("announcement_id",ids);
    const viewed=new Set((seen||[]).map(x=>x.announcement_id));
    const next=items.find(x=>!viewed.has(x.id));
    if(next){setActiveAnnouncement({...next,media_url:next.media_path?supabase.storage.from("portal-announcements").getPublicUrl(next.media_path).data.publicUrl:null});}
  }
  async function publishLaunchAnnouncement(e){
    e.preventDefault();if(!launchTitle.trim()||!launchDescription.trim()||!launchSchedule){setMessage("Enter the launch title, description and scheduled date/time.");return;}
    if(launchMedia&&(!["image/jpeg","image/png","image/webp","video/mp4","video/webm"].includes(launchMedia.type)||launchMedia.size>50*1024*1024)){setMessage("Choose JPG, PNG, WebP, MP4 or WebM media up to 50 MB.");return;}
    setLoading(true);setMessage("");let mediaPath=null,mediaType=null;
    if(launchMedia){
      const ext=(launchMedia.name.split(".").pop()||"bin").toLowerCase();mediaPath="updates/"+crypto.randomUUID()+"."+ext;mediaType=launchMedia.type.startsWith("video/")?"video":"image";
      const {error:upErr}=await supabase.storage.from("portal-announcements").upload(mediaPath,launchMedia,{contentType:launchMedia.type});
      if(upErr){setLoading(false);setMessage("Media upload failed: "+upErr.message);return;}
    }
    const {error}=await supabase.from("portal_announcements").insert({title:launchTitle.trim(),description:launchDescription.trim(),media_path:mediaPath,media_type:mediaType,scheduled_at:new Date(launchSchedule).toISOString(),is_published:true,created_by:user.id});
    if(error){if(mediaPath)await supabase.storage.from("portal-announcements").remove([mediaPath]);setLoading(false);setMessage("Launch update could not be saved: "+error.message);return;}
    setLaunchTitle("");setLaunchDescription("");setLaunchSchedule("");setLaunchMedia(null);setLoading(false);setMessage("Launch update scheduled and saved.");await loadLaunchAnnouncements();
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
        supabase.from("member_records").select("*").eq("patrol_leader_id",userId).eq("is_departed",false).order("created_at",{ascending:false}),
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
    e.preventDefault();setMessage("");
    if(!isValidEmailFormat(memberForm.email)){setMessage("Enter a correctly written email address, for example name@example.com.");return;}
    setLoading(true);
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
    const payload={...memberForm,email:memberForm.email.trim().toLowerCase(),patrol_position:memberForm.patrol_position||"Patrol Member",category:profile.category||"Scout",patrol_leader_id:user.id,photo_path:photoPath,form_file_paths:[...existingFormPaths,...uploadedFormPaths],submission_status:"draft",review_status:"pending",review_reason:"",otp_status:"not_sent",final_status:"pending",is_locked:false,updated_at:new Date().toISOString()};
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
    if(error){setMessage(error.message);return;}setMessage("Member details submitted for Admin review. The Admin has been notified.");await refreshData(profile.role,user.id);
  }
  async function reviewMember(row,status){
    const reason=(memberReason[row.id]||"").trim();
    if(status==="disapproved"&&!reason){setMessage("Enter a reason for disapproval.");return;}
    const {error}=await supabase.from("member_records").update({review_status:status,review_reason:status==="disapproved"?reason:"",updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:status==="verified"?"Member details verified":"Corrections required",message:status==="verified"?"Details checked by Admin. The record can proceed to OMS update and final approval.":"Please correct the member record: "+reason});
    setMessage("Review saved and Patrol Leader notified.");await refreshData(profile.role,user.id);
  }
  async function markOmsUpdated(row,status="completed"){
    if(!isAdmin){setMessage("Only the Super Admin can update final OYMS status.");return;}
    const {error}=await supabase.from("member_records").update({oms_status:status,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("member_notifications").insert({recipient_user_id:row.patrol_leader_id,member_record_id:row.id,title:status==="in_progress"?"OYMS update in progress":"OYMS verification completed",message:status==="in_progress"?"The Super Admin has started updating this member profile in the official OYMS.":"The Super Admin has completed the official OYMS profile update."});
    setMessage(status==="in_progress"?"OYMS marked In Progress.":"Final OYMS verification marked Completed.");await refreshData(profile.role,user.id);
  }
  async function enterMemberUid(row){
    if(!isAdmin){setMessage("Only the Super Admin can enter the official BSG UID.");return;}
    const uid=(uidDrafts[row.id]??row.bsg_uid??"").trim();
    if(!uid){setMessage("Enter the BSG UID number first.");return;}
    const {error}=await supabase.from("member_records").update({bsg_uid:uid,bsg_uid_known:true,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    setMessage("BSG UID saved for "+[row.first_name,row.last_name].filter(Boolean).join(" ")+".");await refreshData(profile.role,user.id);
  }
  async function finalApprove(row){
    if(row.review_status!=="verified"||row.oms_status!=="completed"){setMessage("Member details review and final OYMS update must be completed before final approval.");return;}
    const {data:approvedMember,error}=await supabase.from("member_records").update({final_status:"approved",is_locked:true}).eq("id",row.id).select("member_login_id").single();
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

  async function uploadHomepageSlide(e){
    e.preventDefault(); if(!slideFile){setMessage("Choose a slide image first.");return;}
    if(!["image/jpeg","image/png","image/webp"].includes(slideFile.type)){setMessage("Use JPG, PNG or WebP images.");return;}
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
      uploadFile=new File([blob],slideFile.name.replace(/\\.[^.]+$/,"")+".jpg",{type:"image/jpeg"});
      bitmap.close();
    }catch(error){
      setLoading(false);setMessage("The slide image could not be resized. Please choose another JPG, PNG or WebP image. "+(error?.message||""));return;
    }
    const path="slides/"+crypto.randomUUID()+".jpg";
    const {error:uploadError}=await supabase.storage.from("homepage-slides").upload(path,uploadFile,{contentType:"image/jpeg",upsert:false});
    if(uploadError){setLoading(false);setMessage("Slide upload failed: "+uploadError.message);return;}
    const {error}=await supabase.from("homepage_slides").insert({title:slideTitle.trim(),subtitle:slideSubtitle.trim(),image_path:path,sort_order:homepageSlides.length,created_by:user.id,is_active:true});
    if(error){await supabase.storage.from("homepage-slides").remove([path]);setLoading(false);setMessage("Slide details could not be saved: "+error.message);return;}
    setSlideFile(null);setSlideTitle("");setSlideSubtitle("");setLoading(false);setMessage("Slide uploaded, automatically resized and published.");await loadHomepageSlides();
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
    const {error}=await supabase.from("member_records").update({bsg_uid:uid,updated_at:new Date().toISOString()}).eq("id",row.id);
    setLoading(false);
    if(error){setMessage("UID could not be saved: "+error.message);return;}
    setMessage("BSG UID saved for the archived member.");
    await refreshData(profile.role,user.id);
  }
  async function deleteArchivedMember(row){
    if(!window.confirm("Permanently delete "+[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")+" from OYMS? This cannot be undone."))return;
    setLoading(true);
    const {error}=await supabase.from("member_records").delete().eq("id",row.id);
    setLoading(false);
    if(error){setMessage("Member could not be deleted: "+error.message);return;}
    await supabase.from("audit_logs").insert({action:"Archived member permanently deleted after Super Admin review",entity_table:"member_records",record_id:row.id,actor_id:user.id});
    setMessage("Archived member permanently deleted.");
    await refreshData(profile.role,user.id);
  }

  async function markMemberDeparted(row){
    const reason=window.prompt("Enter the reason this member has left the unit. This is required for the record.");
    if(!reason?.trim()){setMessage("A reason is required. No change was made.");return;}
    const {error}=await supabase.from("member_records").update({is_departed:true,is_active:false,departure_reason:reason.trim(),departed_at:new Date().toISOString(),departed_by:user.id,updated_at:new Date().toISOString()}).eq("id",row.id);
    if(error){setMessage(error.message);return;}
    await supabase.from("audit_logs").insert({action:"Member marked as left: "+reason.trim(),entity_table:"member_records",record_id:row.id,actor_id:user.id});
    setMessage("Member marked as Left. The record and reason are retained in Admin history.");await refreshData(profile.role,user.id);
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

  const isAdmin=profile?.role==="super_admin";
  const visibleMemberRows=memberRows.filter(x=>isAdmin||x.patrol_leader_id===user?.id);
  const archiveRows=isAdmin?memberRows.filter(x=>x.is_departed&&isArchiveDue(x.departed_at)):[];
  const archivePendingCount=archiveRows.length;
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
  const nav=isAdmin?[
    ["dashboard","Dashboard",Home],["leaders","Patrols",Users],["members","Records",ClipboardList],["archive","Left Members Archive",Archive],["member-verification","Member Verification",ShieldCheck],["oms-verification","Final OYMS Verification",CheckCircle2],["slides","Website Slides",FileText],["launch","Launch Updates",Megaphone],["notifications","Notifications",Bell],["audit","Unfreeze Requests",FileText],["profile","My Profile",UserCircle]
  ]:profile?.profile_completed_at?[
    ["profile","My Profile",UserCircle],["dashboard","Dashboard",Home],["new","My Patrol",Plus],["members","Records",ClipboardList],["member-verification","Member Verification",ShieldCheck],["oms-verification","Final OYMS Verification",CheckCircle2],["notifications","Notifications",Bell]
  ]:[["profile-setup","Complete Profile",UserCircle]];

  if(page==="welcome") return <div className="welcome-page">
    <div className="top-ribbon"><span>BHARAT SCOUTS & GUIDES · OFFICIAL SCHOOL UNIT PORTAL</span><span>2026–27</span></div>
    <header className="welcome-header"><div className="crest">BSG</div><div><b>PM SHRI KENDRIYA VIDYALAYA</b><h1>Ordnance Factory Medak</h1><p>Eddumailaram · Hyderabad Division</p><small>BHARAT SCOUTS & GUIDES · KVS</small></div><div className="header-mark">OYMS<br/><small>SANKALP 4.0</small></div></header>
    <main className="welcome-content">
      <section className="home-slideshow" aria-label="School homepage slideshow">
        {homepageSlides.length? <><img className="home-slide-image" src={homepageSlides[welcomeSlide%homepageSlides.length].image_url} alt={homepageSlides[welcomeSlide%homepageSlides.length].title||"School slideshow"}/><div className="home-slide-shade">{homepageSlides[welcomeSlide%homepageSlides.length].title&&<h2>{homepageSlides[welcomeSlide%homepageSlides.length].title}</h2>}{homepageSlides[welcomeSlide%homepageSlides.length].subtitle&&<p>{homepageSlides[welcomeSlide%homepageSlides.length].subtitle}</p>}</div>{homepageSlides.length>1&&<div className="home-slide-controls"><button aria-label="Previous slide" onClick={()=>setWelcomeSlide(v=>(v-1+homepageSlides.length)%homepageSlides.length)}>‹</button><div>{homepageSlides.map((x,i)=><button key={x.id} aria-label={"Show slide "+(i+1)} className={i===welcomeSlide?"active":""} onClick={()=>setWelcomeSlide(i)}></button>)}</div><button aria-label="Next slide" onClick={()=>setWelcomeSlide(v=>(v+1)%homepageSlides.length)}>›</button></div>}</> : <div className="home-slide-empty"><span className="eyebrow">OYMS SANKALP 4.0</span><h2>Welcome to the School Youth Management Portal</h2><p>Official updates and school activities will appear here.</p></div>}
      </section>
      <section className="portal-login-strip"><div><span className="eyebrow">AUTHORISED ACCESS</span><h2>Portal Login</h2><p>Sign in to access your assigned portal services.</p></div><button className="primary large" onClick={()=>{setPage("choose");setMessage("");}}>PORTAL LOGIN <ArrowRight size={18}/></button></section>
      <section className="portal-services"><div className="public-notices-heading"><div><span className="eyebrow">SANKALP 4.0</span><h3>Portal Services</h3></div></div><div className="service-grid"><article><Users/><b>Patrol Management</b><p>Manage patrol leader accounts and unit records.</p></article><article><ClipboardList/><b>Member Records</b><p>Submit, review and maintain member information.</p></article><article><ShieldCheck/><b>Verification</b><p>Follow the administrative review and approval process.</p></article><article><Bell/><b>Notices & Updates</b><p>Read official public notices and portal notifications.</p></article></div></section>
      <section className="public-notices"><div className="public-notices-heading"><div><span className="eyebrow">OFFICIAL UPDATES</span><h3>Public Notices</h3></div><span className="public-notice-tag">SANKALP 4.0</span></div>{publicNotices.map(n=><article className="public-notice-row" key={n.id}><div className="notice-date">{n.published_on?new Date(n.published_on+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"Notice"}</div><div><b>{n.title}</b>{n.body&&<p>{n.body}</p>}</div></article>)}{!publicNotices.length&&<p className="empty">No public notices have been published yet.</p>}</section>
      <footer className="welcome-footer">PM SHRI Kendriya Vidyalaya, Ordnance Factory, Medak · Eddumailaram · KVS Hyderabad Division<span>OYMS SANKALP 4.0 · 2026–27</span></footer>
    </main>
  </div>;

  if(page==="choose") return <div className="auth-page"><button className="back" onClick={()=>{setPage("welcome");setMessage("");}}>← Back to Welcome</button><div className="auth-card choose-card"><div className="mini-crest">BSG</div><span className="eyebrow">AUTHORISED PORTAL ACCESS</span><h2>Select Login Type</h2><p>Choose the account type issued to you.</p><button className="role-choice admin-choice" onClick={()=>{setLoginType("admin");setLoginId(ADMIN_EMAIL);setPage("login");setMessage("");}}><span className="choice-icon"><ShieldCheck/></span><span><b>Admin Login</b><small>Administrator access and portal management</small></span><ArrowRight/></button><button className="role-choice patrol-choice" onClick={()=>{setLoginType("patrol");setLoginId("");setPage("login");setMessage("");}}><span className="choice-icon"><Flag/></span><span><b>Patrol Login</b><small>Patrol Leader records and submissions</small></span><ArrowRight/></button><div className="security-line"><LockKeyhole size={15}/> Only authorised accounts can access the portal.</div></div></div>;

  if(page==="login") return <div className="auth-page"><button className="back" onClick={()=>{setPage("choose");setMessage("");}}>← Back to Login Selection</button><div className="auth-card"><div className="mini-crest">{loginType==="admin"?"ADMIN":"BSG"}</div><span className="eyebrow">{loginType==="admin"?"ADMINISTRATOR ACCESS":"PATROL LEADER ACCESS"}</span><h2>{loginType==="admin"?"Admin Login":"Patrol Login"}</h2><p>{loginType==="admin"?"Sign in with the registered administrator email and password.":"Sign in using the Login ID and password created by your Administrator."}</p>
    <form onSubmit={signIn} className="auth-form"><label>{loginType==="admin"?"Admin Email":"Patrol Login ID"}<input required type={loginType==="admin"?"email":"text"} autoComplete="username" value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder={loginType==="admin"?"Administrator email":"Enter your Login ID"}/></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label><button className="primary block" disabled={loading}>{loading?"Signing in…":"LOGIN SECURELY"} <ArrowRight size={17}/></button></form>
    {loginType==="admin"&&<><button className="link-button" onClick={async()=>{if(!loginId.trim()){setMessage("Enter your admin email first.");return;}setLoading(true);const {error}=await supabase.auth.resetPasswordForEmail(loginId.trim().toLowerCase());setLoading(false);setMessage(error?error.message:"If this email has an OYMS account, a password reset link has been sent.");}}>Forgot password?</button><button className="link-button" onClick={requestAdminActivation} disabled={loading}>First-time Admin? Send secure activation link</button></>}
    {message&&<div className="notice-message"><AlertCircle size={16}/>{message}</div>}<div className="security-line"><LockKeyhole size={15}/> Your role is checked by the secure database after sign-in.</div></div></div>;

  if(page==="app" && user && profile) return <div className="app-layout">
    <aside className={"sidebar "+(mobileMenu?"show":"")}><div className="side-brand"><div className="mini-crest">BSG</div><div><b>OYMS SANKALP 4.0</b><small>{isAdmin?"ADMINISTRATOR":"PATROL LEADER"}</small></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div><nav>{nav.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setMobileMenu(false);}}><Icon size={17}/>{label}</button>)}</nav><div className="side-bottom"><b>{profile.full_name}</b><small>{profile.login_id} · {profile.patrol_name||"Admin"}</small><button onClick={signOut}><LogOut size={16}/> Sign out</button></div></aside>
    <section className="app-main"><header className="app-top"><button className="menu-button" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div><b>{nav.find(x=>x[0]===tab)?.[1]||"Dashboard"}</b><small>{SCHOOL}</small></div><div className="notification-menu"><button className={"notification-bell "+(notificationPopup?"opened":"")} aria-label="Open notifications" onClick={()=>setNotificationPopup(v=>!v)}><Bell size={19}/>{notifications.filter(x=>!x.read_at).length>0&&<span className="notification-count">{notifications.filter(x=>!x.read_at).length}</span>}</button>{notificationPopup&&<div className="notification-popover"><div className="notification-popover-head"><b>Notifications</b><button onClick={()=>{setNotificationPopup(false);setTab("notifications");}}>View all</button></div>{notifications.slice(0,4).map(x=><button className="notification-popover-item" key={x.id} onClick={()=>{setNotificationPopup(false);setTab("notifications");}}><b>{x.title}</b><small>{x.message}</small><time>{dateLabel(x.created_at)}</time></button>)}{!notifications.length&&<p className="empty">No notifications yet.</p>}</div>}</div><button className="refresh" onClick={()=>refreshData(profile.role,user.id)}><RefreshCw size={17}/></button></header>
    <main className="app-content">{message&&<div className="notice-message"><AlertCircle size={16}/>{message}<button onClick={()=>setMessage("")}>×</button></div>}
      {tab==="profile-setup"&&!isAdmin&&<form className="panel data-form profile-setup-form" onSubmit={savePatrolProfile}><span className="eyebrow wide">FIRST-TIME PROFILE SETUP</span><h2 className="wide">Complete Your Patrol Leader Profile</h2><p className="wide">Complete your profile once before registering your patrol members. This screen will not appear again after you save your profile.</p><div className="wide profile-photo-preview">{profilePhoto?<p>Selected photo: {profilePhoto.name}</p>:profilePhotoUrl?<img style={{width:"120px",height:"120px",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:<div className="avatar">{(profileSetup.full_name||"P").slice(0,1)}</div>}</div><label className="wide">Upload your recent passport-size photograph *<input type="file" accept="image/jpeg,image/png,image/webp" required={!profile.profile_photo_path&&!profilePhoto} onChange={e=>setProfilePhoto(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP; maximum 5 MB. No membership form upload is required for your own profile.</small></label><label>Full Name *<input required value={profileSetup.full_name} onChange={e=>setProfileSetup({...profileSetup,full_name:e.target.value})}/></label><label>Date of Birth *<input required type="date" value={profileSetup.date_of_birth} onChange={e=>setProfileSetup({...profileSetup,date_of_birth:e.target.value})}/></label><label>Gender *<select required value={profileSetup.gender} onChange={e=>setProfileSetup({...profileSetup,gender:e.target.value})}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label><label>Blood Group<select value={profileSetup.blood_group} onChange={e=>setProfileSetup({...profileSetup,blood_group:e.target.value})}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(v=><option key={v}>{v}</option>)}</select></label><label>Mobile Number *<input required type="tel" value={profileSetup.mobile_number} onChange={e=>setProfileSetup({...profileSetup,mobile_number:e.target.value})}/></label><label>Contact Email<input type="email" value={profileSetup.email_address} onChange={e=>setProfileSetup({...profileSetup,email_address:e.target.value})}/></label><label>BSG UID (if available)<input value={profileSetup.bsg_uid} onChange={e=>setProfileSetup({...profileSetup,bsg_uid:e.target.value})}/></label><label className="wide">Residential Address *<textarea required rows="3" value={profileSetup.residential_address} onChange={e=>setProfileSetup({...profileSetup,residential_address:e.target.value})}/></label><label>Patrol Name<input value={profile.patrol_name||""} readOnly/></label><label>Section<input value={profile.category||"Scout"} readOnly/></label><p className="wide"><small>Your Patrol Name and Scout/Guide section are assigned by the Administrator. Save your profile to unlock the patrol dashboard and member registration.</small></p><button className="primary wide" disabled={loading}>{loading?"Saving Profile…":"Save Profile & Continue"}</button></form>}
      {activeAnnouncement&&!announcementOpen&&<section className="launch-notice-bar"><Megaphone/><div><b>New portal update is available</b><p>Tap to view update</p></div><button className="primary" onClick={()=>openAnnouncement(activeAnnouncement)}>Tap to view update</button></section>}
      {tab==="dashboard"&&<>{isAdmin&&archivePendingCount>0&&<section className="archive-reminder"><Archive size={20}/><div><b>{archivePendingCount} member account{archivePendingCount===1?"":"s"} are ready for Archive review</b><p>These members were marked Left at least one month ago. Review their UID and records before deciding whether to delete them.</p></div><button className="primary" onClick={()=>setTab("archive")}>Review Archive</button></section>}<div className="welcome-banner"><span className="eyebrow">WELCOME BACK</span><h1>{profile.full_name}</h1><p>{isAdmin?"Manage Patrol Leader accounts, review records and monitor portal activity.":"Submit patrol records and follow your verification status."}</p></div><div className="stat-grid">{(isAdmin?[["Patrol Leaders",leaders.length,Users],["Member Records",memberRows.length,ClipboardList],["Awaiting Review",memberRows.filter(x=>x.submission_status==="completed"&&x.review_status==="pending").length,Clock3],["Approved",memberRows.filter(x=>x.final_status==="approved").length,CheckCircle2]]:[["My Members",memberRows.filter(x=>x.patrol_leader_id===user.id).length,ClipboardList],["Awaiting Review",memberRows.filter(x=>x.patrol_leader_id===user.id&&x.review_status==="pending"&&x.submission_status==="completed").length,Clock3],["Approved",memberRows.filter(x=>x.patrol_leader_id===user.id&&x.final_status==="approved").length,CheckCircle2],["Notifications",notifications.filter(x=>!x.read_at).length,Bell]]).map(([label,value,Icon])=><article className="stat-card" key={label}><Icon/><div><strong>{value}</strong><small>{label}</small></div></article>)}</div><section className="panel"><h3>Recent Member Records</h3><MemberRecords rows={memberRows.slice(0,5)} onPhoto={viewMemberPhoto} onForms={viewMemberForms}/><FormFileLinks links={formLinks}/></section></>}
      {tab==="data-management"&&isAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">ADMIN-ONLY TOOLS</span><h2>Data Management</h2><p className="section-subtitle">Manage and review SANKALP 4.0 records here. These tools do not change the public website.</p></div></div>
        <h3>Search & Filters</h3><div className="data-tools-filters"><label>Search members<input value={dataSearch} onChange={e=>setDataSearch(e.target.value)} placeholder="Name, UID, email or patrol"/></label><label>Category<select value={dataCategory} onChange={e=>setDataCategory(e.target.value)}><option value="all">All categories</option><option value="Scouts">Scouts</option><option value="Guides">Guides</option><option value="Cubs">Cubs</option><option value="Bulbuls">Bulbuls</option></select></label><label>Patrol<select value={dataPatrol} onChange={e=>setDataPatrol(e.target.value)}><option value="all">All patrols</option>{[...new Set(leaders.map(x=>x.patrol_name).filter(Boolean))].sort().map(name=><option key={name} value={name}>{name}</option>)}</select></label><button className="outline" onClick={()=>{setDataSearch("");setDataCategory("all");setDataPatrol("all");}}>Clear filters</button></div>
        <p className="data-tools-result"><b>{dataManagementRows.length}</b> matching member records</p><MemberRecords rows={dataManagementRows} admin={true} onPhoto={viewMemberPhoto} onForms={viewMemberForms} onToggleActive={toggleMemberActive} onMarkDeparted={markMemberDeparted} onEnterUid={enterMemberUid} onReview={reviewMember} onOms={markOmsUpdated} onApprove={finalApprove} reasons={memberReason} setReasons={setMemberReason}/><FormFileLinks links={formLinks}/>
      </section><section className="panel"><h3>Dashboard Statistics</h3><div className="stat-grid data-category-stats">{dataCategoryCounts.map(item=><article className="stat-card" key={item.category}><Users/><div><strong>{item.count}</strong><small>{item.category}</small></div></article>)}<article className="stat-card"><CheckCircle2/><div><strong>{dataVerifiedCount}</strong><small>Verified Members</small></div></article><article className="stat-card"><Clock3/><div><strong>{dataPendingCount}</strong><small>Pending Review</small></div></article></div></section>
      <section className="panel"><div className="section-title"><div><span className="eyebrow">SUPER ADMIN ONLY</span><h3>Data Backup</h3><p className="section-subtitle">Export important records as a JSON backup file. Uploaded photos and document files are not included.</p></div></div><button className="primary" onClick={exportDataBackup}><FileText size={16}/> Export Data Backup</button><p className="backup-warning">The backup contains confidential member information. Store it securely and do not share it publicly.</p></section></>}
      {tab==="leaders"&&isAdmin&&<><div className="section-title"><div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h2>Create Patrol Leader Login</h2></div></div><form className="panel data-form" onSubmit={createLeader}><label>Category<select value={leaderForm.category} onChange={e=>setLeaderForm({...leaderForm,category:e.target.value})}><option value="Guide">Guides</option><option value="Scout">Scouts</option></select></label><label>BSG UID (if known)<input value={leaderForm.bsg_uid} onChange={e=>setLeaderForm({...leaderForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label><label>Full name<input required value={leaderForm.full_name} onChange={e=>setLeaderForm({...leaderForm,full_name:e.target.value})}/></label><label>Login ID<input required value={leaderForm.login_id} onChange={e=>setLeaderForm({...leaderForm,login_id:e.target.value})} placeholder="e.g. panther01"/></label><label>Patrol Name<input required value={leaderForm.patrol_name} onChange={e=>setLeaderForm({...leaderForm,patrol_name:e.target.value})}/></label><label>Mobile number<input required type="tel" value={leaderForm.mobile_number} onChange={e=>setLeaderForm({...leaderForm,mobile_number:e.target.value})}/></label><label className="wide">Temporary password<input required type="password" minLength="10" value={leaderForm.password} onChange={e=>setLeaderForm({...leaderForm,password:e.target.value})}/><small>Use a unique password of at least 10 characters. Share it privately.</small></label><button className="primary" disabled={loading}>{loading?"Creating…":"Create Patrol Login"} <Plus size={16}/></button></form><section className="panel"><h3>Registered Patrol Leaders</h3><input className="search-input" placeholder="Search by name, Login ID, BSG UID or patrol name" value={leaderSearch} onChange={e=>setLeaderSearch(e.target.value)}/><div className="section-title"><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Combined">Combined</option></select></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>BSG UID</th><th>Login ID</th><th>Patrol</th><th>Mobile</th><th>Status</th></tr></thead><tbody>{leaders.filter(x=>(memberCategory==="Combined"||x.category===memberCategory)&&[x.full_name,x.login_id,x.bsg_uid,x.patrol_name].some(v=>(v||"").toLowerCase().includes(leaderSearch.toLowerCase()))).map(x=><tr key={x.user_id}><td>{x.full_name}</td><td>{x.category||"—"}</td><td>{x.bsg_uid||"—"}</td><td>{x.login_id}</td><td>{x.patrol_name}</td><td>{x.mobile_number}</td><td><button className="outline" onClick={async()=>{const {error}=await supabase.from("profiles").update({is_active:!x.is_active}).eq("id",x.user_id);setMessage(error?error.message:(x.is_active?"Account deactivated.":"Account activated."));await refreshData("super_admin",user.id);}}>{x.is_active?"Set Inactive":"Set Active"}</button></td></tr>)}</tbody></table></div></section></>}
      {tab==="archive"&&isAdmin&&<section className="panel"><div className="section-title"><div><span className="eyebrow">SUPER ADMIN · RETENTION REVIEW</span><h2>Left Members Archive</h2><p className="section-subtitle">Members appear here automatically one calendar month after being marked Left. Their records remain available until you permanently delete them.</p></div><span className="archive-count">{archiveRows.length} Ready for Review</span></div>{archiveRows.length===0?<p className="empty">No members have reached the one-month archive date yet.</p>:<div className="table-wrap"><table><thead><tr><th>Member</th><th>Category</th><th>Left On</th><th>Reason</th><th>BSG UID</th><th>Actions</th></tr></thead><tbody>{archiveRows.map(row=><tr key={row.id}><td><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")||"Unnamed member"}</b><small className="cell-sub">{row.email||"No email recorded"}</small></td><td>{row.category||"—"}</td><td>{dateLabel(row.departed_at)}</td><td>{row.departure_reason||"—"}</td><td><div className="uid-entry"><input aria-label={"BSG UID for "+row.first_name} value={uidDrafts[row.id]??row.bsg_uid??""} onChange={e=>setUidDrafts(v=>({...v,[row.id]:e.target.value}))} placeholder="UID not entered"/><button className="outline" onClick={()=>saveArchiveUid(row)}>Save UID</button></div></td><td><button className="danger-outline" onClick={()=>deleteArchivedMember(row)}><Trash2 size={14}/> Permanently Delete</button></td></tr>)}</tbody></table></div>}</section>}
      {tab==="members"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">MEMBER RECORDS</span><h2>Submitted Profile Details</h2><p className="section-subtitle">This table shows the same profile information submitted by Patrol Leaders. Verification fields are kept in separate sections.</p></div><select value={memberCategory} onChange={e=>setMemberCategory(e.target.value)}><option value="Guide">Guides</option><option value="Scout">Scouts</option><option value="Combined">Combined</option></select></div><input className="search-input" placeholder="Search by member name, email or district" value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}/><MemberRecords rows={visibleMemberRows.filter(x=>(memberCategory==="Combined"||categoryKey(x.category)===categoryKey(memberCategory))&&[x.first_name,x.middle_name,x.last_name,x.nickname,x.email,x.district].some(v=>(v||"").toLowerCase().includes(memberSearch.toLowerCase())))} onPhoto={viewMemberPhoto} onForms={viewMemberForms}/><FormFileLinks links={formLinks}/></section>}
      {tab==="member-verification"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">STAGE 1 · MEMBER VERIFICATION</span><h2>Member UID & Details Verification</h2><p className="section-subtitle">Enter the official BSG UID first, then review the submitted profile details. Only the Super Admin can save UID and verification decisions.</p></div></div><div className="table-wrap"><table><thead><tr><th>Full Name</th><th>Category / Patrol</th><th>BSG UID Number</th><th>Profile Details Review</th><th>Review Status</th><th>Action</th></tr></thead><tbody>{visibleMemberRows.map(row=><tr key={row.id}><td><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")}</b><small className="cell-sub">DOB: {row.date_of_birth||"—"} · {row.gender||"—"}</small></td><td>{row.category||"—"}<small className="cell-sub">{leaders.find(x=>x.user_id===row.patrol_leader_id)?.patrol_name||profile.patrol_name||"—"}</small></td><td>{isAdmin?<div className="uid-entry"><input aria-label={"BSG UID for "+row.first_name} value={uidDrafts[row.id]??row.bsg_uid??""} onChange={e=>setUidDrafts(v=>({...v,[row.id]:e.target.value}))} placeholder="Enter UID number"/><button className="outline" onClick={()=>enterMemberUid(row)}>Save UID</button></div>:(row.bsg_uid||"Not entered")}</td><td>{row.review_status==="verified"?"Verified":row.review_status==="disapproved"?"Needs Changes":"Pending Review"}</td><td>{row.review_status||"pending"}</td><td>{isAdmin&&<div className="review-actions"><input placeholder="Reason if changes required" value={memberReason[row.id]||""} onChange={e=>setMemberReason(v=>({...v,[row.id]:e.target.value}))}/><button onClick={()=>reviewMember(row,"verified")}>Verify Details</button><button className="danger-outline" onClick={()=>reviewMember(row,"disapproved")}>Needs Changes</button></div>}</td></tr>)}</tbody></table></div></section>}
      {tab==="oms-verification"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">STAGE 2 · FINAL OYMS VERIFICATION</span><h2>Official OYMS Profile Update</h2><p className="section-subtitle">Set a member to In Progress while updating their profile in official OYMS. Change it to Completed when the update is finished.</p></div></div><div className="table-wrap"><table><thead><tr><th>Member Name</th><th>BSG UID</th><th>Member Verification</th><th>Final OYMS Status</th><th>Updated</th></tr></thead><tbody>{visibleMemberRows.map(row=><tr key={row.id}><td><b>{[row.first_name,row.middle_name,row.last_name].filter(Boolean).join(" ")}</b></td><td>{row.bsg_uid||"—"}</td><td>{row.review_status==="verified"?"Verified":row.review_status==="disapproved"?"Needs Changes":"Pending"}</td><td>{isAdmin?<select disabled={!row.bsg_uid||row.review_status!=="verified"} title={!row.bsg_uid?"Enter the BSG UID first":row.review_status!=="verified"?"Complete Member Verification first":""} value={row.oms_status==="completed"?"completed":row.oms_status==="in_progress"?"in_progress":"not_started"} onChange={e=>markOmsUpdated(row,e.target.value)}><option value="not_started">Not Started</option><option value="in_progress">OYMS In Progress</option><option value="completed">Completed</option></select>:(row.oms_status==="completed"?"Completed":row.oms_status==="in_progress"?"OYMS In Progress":"Not Started")}</td><td>{row.updated_at?dateLabel(row.updated_at):"—"}</td></tr>)}</tbody></table></div></section>}
      {tab==="new"&&!isAdmin&&<><div className="section-title"><div><span className="eyebrow">PATROL MEMBER REGISTRATION</span><h2>{editingMember?"Edit Member Details":"My Patrol Members"}</h2></div><div><small>Patrol strength: {memberRows.filter(x=>x.patrol_leader_id===user.id).length+1}/8 (including you)</small><p className="roster-note">Maximum 8 people per patrol, including the Patrol Leader. The final student entered must be designated as Assistant Patrol Leader.</p></div><button className="primary" disabled={memberRows.filter(x=>x.patrol_leader_id===user.id).length>=7} onClick={()=>{setMemberFormOpen(true);setEditingMember(null);setMemberForm({first_name:"",middle_name:"",last_name:"",nickname:"",date_of_birth:"",gender:"",blood_group:"",father_name:"",father_occupation:"",mother_name:"",mother_occupation:"",residential_address:"",town_village:"",district:"",state:"Telangana",pin_code:"",primary_contact:"",whatsapp_number:"",alternative_contact:"",emergency_contact:"",emergency_contact_person:"",email:"",patrol_position:"Patrol Member",bsg_uid_known:false,bsg_uid:""});setMemberPhoto(null);setMemberFormFiles([]);setFormLinks([]);}}><Plus size={15}/> Add Member</button></div>{memberFormOpen&&<form className="panel data-form" onSubmit={saveMember}><h3 className="wide">Member Registration Form – {profile.category||"Scout"}</h3><label>Patrol Designation *<select required value={memberForm.patrol_position||"Patrol Member"} onChange={e=>setMemberForm({...memberForm,patrol_position:e.target.value})}><option value="Patrol Member">Patrol Member</option><option value="Assistant Patrol Leader">Assistant Patrol Leader</option></select><small>The last student entered in your patrol must be selected as Assistant Patrol Leader. Only one Assistant Patrol Leader is allowed.</small></label><label className="wide">Upload recent passport-size photograph in correct Scout / Guide uniform *<input type="file" required={!editingMember?.photo_path} accept="image/jpeg,image/png,image/webp" onChange={e=>setMemberPhoto(e.target.files?.[0]||null)}/></label><label className="wide">Upload completed Membership Form *<input type="file" required={!editingMember?.form_file_paths?.length} multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>{const files=Array.from(e.target.files||[]);const total=(editingMember?.form_file_paths?.length||0)+files.length;if(total>4){setMemberFormFiles([]);e.target.value="";setMessage("Maximum four membership form files are allowed.");return;}setMemberFormFiles(files);setMessage("");}}/><small>Upload 1–4 files: one PDF or up to four photos/files. PDF, JPG, PNG and WebP accepted; maximum 10 MB per file. Existing files: {editingMember?.form_file_paths?.length||0}. New files selected: {memberFormFiles.length}.</small></label><label>BSG UID status<select value={memberForm.bsg_uid_known?"known":"unknown"} onChange={e=>setMemberForm({...memberForm,bsg_uid_known:e.target.value==="known",bsg_uid:e.target.value==="known"?memberForm.bsg_uid:""})}><option value="known">BSG UID Known</option><option value="unknown">Don't Know – Admin will enter</option></select></label>{memberForm.bsg_uid_known&&<label>BSG UID Number *<input required value={memberForm.bsg_uid} onChange={e=>setMemberForm({...memberForm,bsg_uid:e.target.value})} placeholder="BSG.113994123"/></label>}{[["first_name","First Name *","text"],["middle_name","Middle Name","text"],["last_name","Last Name *","text"],["nickname","Nickname","text"],["date_of_birth","Date of Birth *","date"],["gender","Gender *","select"],["blood_group","Blood Group","select"],["father_name","Father's Full Name *","text"],["father_occupation","Father's Occupation","text"],["mother_name","Mother's Full Name *","text"],["mother_occupation","Mother's Occupation","text"],["residential_address","Residential Address *","textarea"],["town_village","Town / Village *","text"],["district","District *","text"],["state","State *","text"],["pin_code","PIN Code *","text"],["primary_contact","Primary Contact Number *","tel"],["whatsapp_number","WhatsApp Number","tel"],["alternative_contact","Alternative Contact Number","tel"],["emergency_contact","Emergency Contact Number *","tel"],["emergency_contact_person","Emergency Contact Person & Relationship *","text"],["email","Email Address *","email"]].map(([key,label,type])=><label className={type==="textarea"?"wide":""} key={key}>{label}{type==="select"?<select required={key!=="middle_name"} value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}>{(key==="gender"?["","Male","Female","Other"]:["","A+","A-","B+","B-","AB+","AB-","O+","O-"]).map(v=><option value={v}>{v||"Select"}</option>)}</select>:type==="textarea"?<textarea required rows="3" value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}/>:<input required={key!=="middle_name"} type={type} value={memberForm[key]} onChange={e=>setMemberForm({...memberForm,[key]:e.target.value})}/>}</label>)}<div className="form-actions wide"><button className="primary" disabled={loading}>{loading?"Saving…":"Save Member Details"}</button></div></form>}<section className="panel"><h3>My Registered Patrol Members</h3><MemberRecords rows={memberRows.filter(x=>x.patrol_leader_id===user.id)} onPhoto={viewMemberPhoto} onForms={viewMemberForms} onToggleActive={toggleMemberActive} onUnfreeze={requestUnfreeze} onEdit={row=>{setEditingMember(row);setMemberFormOpen(true);setMemberFormFiles([]);setMemberForm(row);setTab("new");}} onComplete={row=>completeMember(row)} onUnfreeze={row=>requestUnfreeze(row)}/><FormFileLinks links={formLinks}/></section></>}      {tab==="submissions"&&<section className="panel"><div className="section-title"><div><span className="eyebrow">{isAdmin?"ADMIN REVIEW":"YOUR RECORDS"}</span><h2>{isAdmin?"All Submissions":"My Submissions"}</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_changes">Needs Changes</option><option value="completed">Completed</option></select></div><SubmissionList rows={submissions.filter(x=>filter==="all"||x.status===filter)} isAdmin={isAdmin} onStatus={updateStatus}/></section>}
      {tab==="launch"&&isAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">LAUNCH & ANNOUNCEMENTS</span><h2>Send Instant Pop Up</h2><p className="section-subtitle">Each account sees each update once, after its scheduled time. Opening the update triggers confetti.</p></div></div><form className="data-form" onSubmit={publishLaunchAnnouncement}><label className="wide">Subject / Launch Title *<input required maxLength="140" value={launchTitle} onChange={e=>setLaunchTitle(e.target.value)} placeholder="SANKALP 4.0 IS OFFICIALLY LAUNCHED!"/></label><label className="wide">Description *<textarea required rows="4" maxLength="4000" value={launchDescription} onChange={e=>setLaunchDescription(e.target.value)} placeholder="Write the launch message or announcement details…"/></label><label>Show from date & time *<input required type="datetime-local" value={launchSchedule} onChange={e=>setLaunchSchedule(e.target.value)}/></label><label className="wide">Optional image or video<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={e=>setLaunchMedia(e.target.files?.[0]||null)}/><small>JPG, PNG, WebP, MP4 or WebM · maximum 50 MB. Media fits the popup automatically; videos play automatically.</small></label><button className="primary" disabled={loading}>{loading?"Saving…":"Schedule / Publish Launch Update"} <Megaphone size={16}/></button></form></section><section className="panel"><h3>Launch Updates ({launchAnnouncements.length})</h3>{launchAnnouncements.map(x=><article className="notification-item" key={x.id}><Megaphone/><div><b>{x.title}</b><p>{x.description}</p><small>Scheduled: {dateLabel(x.scheduled_at)}</small></div><button className="outline" onClick={()=>deleteLaunchAnnouncement(x)}>Delete</button></article>)}{!launchAnnouncements.length&&<p className="empty">No launch updates yet.</p>}</section></>}
      {tab==="slides"&&isAdmin&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">PUBLIC HOMEPAGE</span><h2>Manage Welcome Slides</h2><p className="section-subtitle">Upload a banner image. Images are automatically resized to fit the slideshow while keeping their proportions.</p></div></div><form className="data-form" onSubmit={uploadHomepageSlide}><label className="wide">Slide image *<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setSlideFile(e.target.files?.[0]||null)}/><small>JPG, PNG or WebP · maximum 50 MB (automatically resized for the slideshow). Any image shape is accepted; wide landscape looks best.</small></label><label>Slide title (optional)<input maxLength="120" value={slideTitle} onChange={e=>setSlideTitle(e.target.value)}/></label><label>Slide subtitle (optional)<input maxLength="240" value={slideSubtitle} onChange={e=>setSlideSubtitle(e.target.value)}/></label><button className="primary" disabled={loading}>{loading?"Uploading…":"Upload Homepage Slide"} <Plus size={16}/></button></form></section><section className="panel"><h3>Published Slides ({homepageSlides.length})</h3>{homepageSlides.length===0&&<p className="empty">No slides uploaded yet. Upload the first homepage slide above.</p>}<div className="slide-admin-grid">{homepageSlides.map(slide=><article className="slide-admin-card" key={slide.id}><img src={slide.image_url} alt={slide.title||"Homepage slide"}/><div><b>{slide.title||"Homepage slide"}</b>{slide.subtitle&&<p>{slide.subtitle}</p>}<button className="outline" onClick={()=>removeHomepageSlide(slide)}>Remove Slide</button></div></article>)}</div></section></>}
      {tab==="notifications"&&<><section className="panel"><div className="section-title"><div><span className="eyebrow">PORTAL MESSAGES</span><h2>Notices & Notifications</h2><p className="section-subtitle">Messages sent by the Administrator for your Login ID.</p></div></div>{notifications.map(x=><article className="notification-item" key={x.id}><Bell size={18}/><div><b>{x.title}</b><p>{x.message}</p><small>{dateLabel(x.created_at)}</small></div>{!isAdmin&&!x.read_at&&<button className="outline" onClick={()=>markRead(x)}>Mark read</button>}</article>)}{!notifications.length&&<p className="empty">No notifications yet.</p>}</section>{isAdmin&&<form className="panel data-form" onSubmit={sendNotification}><h3 className="wide">Send Notice / Notification to Login IDs</h3><label className="wide">Send to<select value={noticeRecipient} onChange={e=>setNoticeRecipient(e.target.value)}><option value="all">All active Patrol Leader Login IDs</option>{leaders.filter(x=>x.is_active).map(x=><option key={x.user_id} value={x.user_id}>{x.full_name} ({x.login_id})</option>)}</select></label><label className="wide">Title<input required value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})}/></label><label className="wide">Message<textarea required rows="3" value={noticeForm.message} onChange={e=>setNoticeForm({...noticeForm,message:e.target.value})}/></label><button className="primary" disabled={loading}>Send Notice / Notification <Bell size={16}/></button></form>}{isAdmin&&<form className="panel data-form" onSubmit={publishPublicNotice}><h3 className="wide">Publish Public Website Notice</h3><p className="wide public-notice-help">This notice will appear on the public SANKALP 4.0 homepage for visitors.</p><label className="wide">Notice Title<input required maxLength="120" value={publicNoticeForm.title} onChange={e=>setPublicNoticeForm({...publicNoticeForm,title:e.target.value})}/></label><label className="wide">Notice Details<textarea rows="4" required maxLength="3000" value={publicNoticeForm.body} onChange={e=>setPublicNoticeForm({...publicNoticeForm,body:e.target.value})}/></label><button className="primary" disabled={loading}>{loading?"Publishing…":"Publish Public Notice"} <FileText size={16}/></button></form>}</>}
      {tab==="audit"&&isAdmin&&<section className="panel"><h2>Unfreeze Requests</h2>{unfreezeRequests.filter(x=>x.status==="pending").map(x=><article className="notification-item" key={x.id}><div><b>Member record: {x.member_record_id}</b><p>{x.reason}</p><small>{dateLabel(x.created_at)}</small></div><button className="outline" onClick={()=>decideUnfreeze(x,true)}>Approve</button><button className="outline" onClick={()=>decideUnfreeze(x,false)}>Reject</button></article>)}{!unfreezeRequests.some(x=>x.status==="pending")&&<p className="empty">No pending unfreeze requests.</p>}</section>}
      {tab==="profile"&&<><section className="panel profile"><div className="avatar">{profilePhotoUrl?<img style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} src={profilePhotoUrl} alt="Profile photograph"/>:(profile.full_name||"U").slice(0,1)}</div><h2>{profile.full_name}</h2><p>{profile.role==="super_admin"?"Administrator":"Patrol Leader"}</p><dl><dt>Login ID</dt><dd>{profile.login_id}</dd><dt>Patrol</dt><dd>{profile.patrol_name||"—"}</dd><dt>Email</dt><dd>{profile.email_address||user.email||"—"}</dd><dt>Mobile</dt><dd>{profile.mobile_number||"—"}</dd><dt>Date of Birth</dt><dd>{profile.date_of_birth||"—"}</dd><dt>Gender</dt><dd>{profile.gender||"—"}</dd><dt>Blood Group</dt><dd>{profile.blood_group||"—"}</dd><dt>Address</dt><dd>{profile.residential_address||"—"}</dd><dt>Account status</dt><dd>{profile.is_active?"Active":"Inactive"}</dd></dl></section><form className="panel data-form" onSubmit={changePassword}><h3 className="wide">{isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Admin Password":"Change Password"}</h3>{!(isAdmin&&user?.user_metadata?.password_initialized!==true)&&<label className="wide">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Enter current password"/></label>}<label>New password<input required type="password" autoComplete="new-password" minLength="10" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 10 characters"/></label><label>Confirm new password<input required type="password" autoComplete="new-password" minLength="10" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter new password"/></label><button className="primary" disabled={loading}>{loading?"Saving…":isAdmin&&user?.user_metadata?.password_initialized!==true?"Set Password":"Update Password"}</button></form></>}
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


function MemberRecords({rows,onPhoto,onForms}){
 if(!rows.length)return <p className="empty">No member records found.</p>;
 const fullName=r=>[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" ")||"—";
 return <div className="table-wrap"><table className="member-record-table"><thead><tr><th>Photo</th><th>Form</th><th>Full Name</th><th>Nickname</th><th>Date of Birth</th><th>Gender</th><th>Blood Group</th><th>Father's Name</th><th>Father's Occupation</th><th>Mother's Name</th><th>Mother's Occupation</th><th>Residential Address</th><th>Town / Village</th><th>District</th><th>State</th><th>PIN Code</th><th>Primary Contact</th><th>WhatsApp</th><th>Alternative Contact</th><th>Emergency Contact</th><th>Emergency Contact Person</th><th>Email</th><th>Patrol Designation</th><th>Category</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.photo_path&&onPhoto?<button className="outline" onClick={()=>onPhoto(r)}>View Photo</button>:<span>—</span>}</td><td>{(r.form_file_paths||[]).length&&onForms?<button className="outline" onClick={()=>onForms(r)}>View Form</button>:<span>—</span>}</td><td><b>{fullName(r)}</b>{r.is_departed&&<small className="departed-label">LEFT THE UNIT</small>}</td><td>{r.nickname||"—"}</td><td>{r.date_of_birth||"—"}</td><td>{r.gender||"—"}</td><td>{r.blood_group||"—"}</td><td>{r.father_name||"—"}</td><td>{r.father_occupation||"—"}</td><td>{r.mother_name||"—"}</td><td>{r.mother_occupation||"—"}</td><td>{r.residential_address||"—"}</td><td>{r.town_village||"—"}</td><td>{r.district||"—"}</td><td>{r.state||"—"}</td><td>{r.pin_code||"—"}</td><td>{r.primary_contact||"—"}</td><td>{r.whatsapp_number||"—"}</td><td>{r.alternative_contact||"—"}</td><td>{r.emergency_contact||"—"}</td><td>{r.emergency_contact_person||"—"}</td><td>{r.email||"—"}</td><td>{r.patrol_position||"Patrol Member"}</td><td>{r.category||"—"}</td></tr>)}</tbody></table></div>;
}
