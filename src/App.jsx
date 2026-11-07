import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Activity, AlertCircle, ArrowDownToLine, Award, Bell, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, ClipboardList, Clock3, Compass, Download,
  FileBadge, FileBarChart, FileText, Flag, GraduationCap, Home, Image, LayoutDashboard, LogOut,
  Menu, Megaphone, Pencil, Plus, Search, Settings, ShieldCheck, Shield, Sparkles, Trash2, Trophy,
  User, UserCheck, UserPlus, Users, X, Printer, Tent, BookMarked, UsersRound
} from 'lucide-react';

const SCHOOL = 'PM SHRI KENDRIYA VIDYALAYA ORDNANCE FACTORY MEDAK';
const PLACE = 'EDDUMAILARAM';
const DIVISION = 'KVS HYDERABAD DIVISION';
const STAGES = ['Pravesh','Pratham Sopan','Dwitiya Sopan','Tritiya Sopan','Rajya Puraskar','Rashtrapati'];
const PATROLS = ['Panther','Eagle','Fox','Tiger','Lion'];
const ROLES = [
  {id:'super_admin',label:'Super Admin'},
  {id:'school_admin',label:'School / Group Admin'},
  {id:'unit_leader',label:'Unit Leader'},
  {id:'patrol_leader',label:'Patrol Leader'},
  {id:'assistant_patrol_leader',label:'Assistant Patrol Leader'},
  {id:'member',label:'Scout / Guide Member'}
];
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard,roles:['all']},
  {id:'school-applications',label:'Vidyalaya Applications',icon:GraduationCap,roles:['super_admin']},
  {id:'accounts',label:'Create Login Accounts',icon:UserPlus,roles:['school_admin','unit_leader']},
  {id:'members',label:'Members',icon:Users,roles:['super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader']},
  {id:'uid',label:'UID Verification',icon:ShieldCheck,roles:['super_admin','school_admin','unit_leader']},
  {id:'units',label:'Scout & Guide Units',icon:Flag,roles:['super_admin','school_admin','unit_leader']},
  {id:'patrols',label:'Patrol Management',icon:UsersRound,roles:['super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader']},
  {id:'attendance',label:'Attendance',icon:ClipboardCheck,roles:['super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader']},
  {id:'tests',label:'Tests & Marks',icon:GraduationCap,roles:['super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader']},
  {id:'progression',label:'Progression Records',icon:Trophy,roles:['super_admin','school_admin','unit_leader']},
  {id:'events',label:'Camps & Activities',icon:Tent,roles:['all']},
  {id:'notices',label:'Circulars & Notifications',icon:Megaphone,roles:['all']},
  {id:'court',label:'Court of Honour',icon:Shield,roles:['super_admin','school_admin','unit_leader']},
  {id:'logbooks',label:'Digital Logbooks',icon:BookOpen,roles:['all']},
  {id:'certificates',label:'Certificates',icon:FileBadge,roles:['super_admin','school_admin','unit_leader']},
  {id:'gallery',label:'Gallery',icon:Image,roles:['all']},
  {id:'reports',label:'Reports & Analytics',icon:FileBarChart,roles:['super_admin','school_admin','unit_leader']},
  {id:'profile',label:'My Profile',icon:User,roles:['all']},
  {id:'settings',label:'Settings',icon:Settings,roles:['super_admin','school_admin']}
];
const TABLES = {
  members:'members', units:'units', patrols:'patrols', school_applications:'school_applications', attendance_sessions:'attendance_sessions',
  attendance_records:'attendance_records', tests:'tests', test_results:'test_results',
  progression_records:'progression_records', events:'events', notices:'notices',
  certificates:'certificates', logbook_entries:'logbook_entries', registration_requests:'registration_requests'
};
const DEMO = {
  members:[
    {id:'m1',full_name:'Aarav Kumar',category:'Scout',parents_names:'R. Kumar',dob:'2012-04-16',mobile:'9000000001',email:'aarav@example.com',joining_date:'2025-06-10',bsg_uid:'BSG-MDK-001',unit:'Scout',patrol_id:'p1',verification_status:'approved',status:'active'},
    {id:'m2',full_name:'Ananya Reddy',category:'Guide',parents_names:'S. Reddy',dob:'2012-08-22',mobile:'9000000002',email:'ananya@example.com',joining_date:'2025-06-10',bsg_uid:'BSG-MDK-002',unit:'Guide',patrol_id:'p2',verification_status:'approved',status:'active'},
    {id:'m3',full_name:'Rahul Naik',category:'Scout',parents_names:'M. Naik',dob:'2011-11-03',mobile:'9000000003',email:'rahul@example.com',joining_date:'2025-07-01',bsg_uid:'',unit:'Scout',patrol_id:'p1',verification_status:'pending',status:'active'},
    {id:'m4',full_name:'Sana Fatima',category:'Guide',parents_names:'A. Fatima',dob:'2012-02-14',mobile:'9000000004',email:'sana@example.com',joining_date:'2025-07-05',bsg_uid:'BSG-MDK-004',unit:'Guide',patrol_id:'p2',verification_status:'rejected',status:'active'}
  ],
  units:[{id:'u1',name:'Scout Unit',category:'Scout',leader_name:'Scout Master'},{id:'u2',name:'Guide Company',category:'Guide',leader_name:'Guide Captain'}],
  patrols:PATROLS.map((n,i)=>({id:'p'+(i+1),name:n,unit:i===1||i===4?'Guide':'Scout',leader_name:i===0?'Aarav Kumar':'',assistant_leader:'',capacity:8})),
  attendance_sessions:[{id:'a1',title:'Weekly Unit Meeting',session_date:'2026-11-07',start_time:'09:00',closing_time:'10:30',unit:'All'}],
  attendance_records:[{id:'ar1',session_id:'a1',member_id:'m1',status:'present'},{id:'ar2',session_id:'a1',member_id:'m2',status:'present'},{id:'ar3',session_id:'a1',member_id:'m3',status:'absent'}],
  tests:[{id:'t1',title:'Dwitiya Sopan Testing Camp — Set 1',stage:'Dwitiya Sopan',test_date:'2026-11-15',max_marks:100,unit:'All'}],
  test_results:[{id:'tr1',test_id:'t1',member_id:'m1',marks:82,remarks:'Good performance'},{id:'tr2',test_id:'t1',member_id:'m2',marks:91,remarks:'Excellent'}],
  progression_records:[{id:'pr1',member_id:'m1',stage:'Pratham Sopan',completion_date:'2025-12-12',status:'completed',certificate_number:'KVMDK/BSG/2025/01'}],
  events:[{id:'e1',title:'Dwitiya Sopan Testing Camp',event_type:'Testing Camp',event_date:'2026-11-15',venue:'Vidyalaya Scout & Guide Meeting Arena',description:'Unit-level testing camp for Scouts and Guides.',status:'upcoming'}],
  notices:[{id:'n1',title:'Unit Meeting — Important Information',body:'All approved Scouts and Guides are requested to report in proper uniform.',published_on:'2026-11-07',audience:'All',is_published:true}],
  certificates:[],logbook_entries:[],registration_requests:[]
};
const emptyForm = {full_name:'',category:'Scout',father_name:'',mother_name:'',parents_names:'',dob:'',address:'',pin_code:'',unit_address:'',email:'',mobile:'',joining_date:'',investiture_date:'',leaving_date:'',troop_company:'',role_in_unit:'Member',stage_completion_dates:{},bsg_uid:'',unit:'Scout',unit_id:'',patrol_id:'',verification_status:'pending',status:'active'};
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = envUrl && envKey ? createClient(envUrl,envKey) : null;
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.random().toString(16).slice(2));
const today = () => new Date().toISOString().slice(0,10);
const labelRole = (r) => ROLES.find(x=>x.id===r)?.label || 'Member';
const fmtDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function readDemo(){
  try{
    const saved=localStorage.getItem('kvmedak-oyms-data-v4');
    if(saved) return JSON.parse(saved);
  }catch(e){}
  return JSON.parse(JSON.stringify(DEMO));
}
function exportCSV(name,rows){
  if(!rows.length){window.alert('There are no records to export yet.');return;}
  const cols=Object.keys(rows[0]);
  const csv=[cols.join(','),...rows.map(r=>cols.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();URL.revokeObjectURL(url);
}
function App(){
  const [data,setData]=useState(readDemo);
  const [user,setUser]=useState(null);
  const [role,setRole]=useState('super_admin');
  const [page,setPage]=useState('home');
  const [loginMode,setLoginMode]=useState(false);
  const [demoMode,setDemoMode]=useState(!supabase);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState('');
  const [search,setSearch]=useState('');
  const [modal,setModal]=useState('');
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [login,setLogin]=useState({email:'',password:''});
  const [loginRole,setLoginRole]=useState('school_admin');
  const [loginOtp,setLoginOtp]=useState('');
  const [loginOtpSent,setLoginOtpSent]=useState(false);
  const [schoolForm,setSchoolForm]=useState({school_name:'',affiliation_number:'',division:'KVS Hyderabad Division',school_address:'',principal_name:'',contact_person:'',email:'',mobile:''});
  const [schoolOtp,setSchoolOtp]=useState('');
  const [schoolOtpSent,setSchoolOtpSent]=useState(false);
  const schoolRegistrationInProgress=useRef(false);
  const requestedLoginRole=useRef(null);
  const [accountForm,setAccountForm]=useState({full_name:'',email:'',role:'unit_leader',unit_id:'',patrol_id:''});
  const [recoveryMode,setRecoveryMode]=useState(false);
  const [newPassword,setNewPassword]=useState('');
  const [mobileNav,setMobileNav]=useState(false);
  const [selectedSession,setSelectedSession]=useState('');
  const [selectedTest,setSelectedTest]=useState('');
  const [selectedMember,setSelectedMember]=useState('');
  const [marks,setMarks]=useState({});
  const [attendance,setAttendance]=useState({});
  const [eventForm,setEventForm]=useState({title:'',event_type:'Activity',event_date:today(),venue:'',description:''});
  const [noticeForm,setNoticeForm]=useState({title:'',body:'',published_on:today(),audience:'All',is_published:true});
  const [testForm,setTestForm]=useState({title:'',stage:'Pravesh',test_date:today(),max_marks:100,unit:'All'});
  const [certForm,setCertForm]=useState({recipient_name:'',certificate_type:'Participation',certificate_number:'',issue_date:today(),remarks:''});
  const [memberFilter,setMemberFilter]=useState('all');
  const isStaff=['super_admin','school_admin','unit_leader'].includes(role);
  const canManage=['super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader'].includes(role);
  const visibleNav=NAV.filter(n=>n.roles.includes('all')||n.roles.includes(role));
  const counts=useMemo(()=>({
    members:data.members.length,
    approved:data.members.filter(m=>m.verification_status==='approved').length,
    pending:data.members.filter(m=>m.verification_status==='pending').length,
    patrols:data.patrols.length,
    events:data.events.length
  }),[data]);

  useEffect(()=>{
    if(!supabase){localStorage.setItem('kvmedak-oyms-data-v4',JSON.stringify(data));return;}
  },[data]);
  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getSession().then(async ({data:s})=>{
      if(s.session) await loadProfile(s.session.user);
    });
    const {data:sub}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY'){setRecoveryMode(true);setUser(session?.user||null);return;}
      if(session?.user) setTimeout(()=>loadProfile(session.user),0);
      else {setUser(null);setLoginMode(false);setPage('home');}
    });
    return ()=>sub.subscription.unsubscribe();
  },[]);
  async function loadProfile(authUser){
    if(schoolRegistrationInProgress.current)return;
    const {data:p,error}=await supabase.from('profiles').select('*').eq('id',authUser.id).single();
    if(error||!p){
      const {data:application}=await supabase.from('school_applications').select('status').eq('applicant_user_id',authUser.id).maybeSingle();
      setNotice(application?.status==='pending'?'Your email is verified. The Super Admin must approve your Vidyalaya registration before School Admin access is activated.':'Your email is verified, but no OYMS role has been assigned. Contact the portal administrator.');
      await supabase.auth.signOut();setUser(null);setPage('home');return;
    }
    if(requestedLoginRole.current&&p.role!==requestedLoginRole.current){const expected=requestedLoginRole.current;requestedLoginRole.current=null;setNotice('This account is registered as '+labelRole(p.role)+', not '+labelRole(expected)+'. Please select the correct login type.');await supabase.auth.signOut();return;}
    requestedLoginRole.current=null;
    setUser({...authUser,profile:p});setRole(p.role);setDemoMode(false);setLoginMode(false);setPage('dashboard');
    await loadRemoteData();
  }
  async function loadRemoteData(){
    const next={};
    for(const [key,table] of Object.entries(TABLES)){
      const {data:rows,error}=await supabase.from(table).select('*').order('created_at',{ascending:false}).limit(1000);
      if(!error) next[key]=rows||[];
    }
    setData(prev=>({...prev,...next}));
  }
  async function saveRow(key,row){
    const table=TABLES[key];
    if(supabase&&!demoMode){
      const scopedRow={...row,school_id:row.school_id||user?.profile?.school_id||null};
      const {data:result,error}=await supabase.from(table).upsert(scopedRow).select().single();
      if(error){setNotice(error.message);return null;}
      setData(prev=>({...prev,[key]:[result,...prev[key].filter(x=>x.id!==result.id)]}));return result;
    }
    const saved={...row,id:row.id||uid()};
    setData(prev=>({...prev,[key]:[saved,...(prev[key]||[]).filter(x=>x.id!==saved.id)]}));
    return saved;
  }
  async function deleteRow(key,id){
    if(!window.confirm('Delete this record? This action cannot be undone.'))return;
    if(supabase&&!demoMode){
      const {error}=await supabase.from(TABLES[key]).delete().eq('id',id);
      if(error){setNotice(error.message);return;}
    }
    setData(prev=>({...prev,[key]:prev[key].filter(x=>x.id!==id)}));setNotice('Record deleted.');
  }
  async function signIn(e){
    e.preventDefault();if(!supabase){setNotice('Backend is not configured.');return;}
    requestedLoginRole.current=loginRole;setLoading(true);const {error}=await supabase.auth.signInWithPassword(login);
    setLoading(false);if(error){requestedLoginRole.current=null;setNotice(error.message);}
  }
  async function sendOtp(){
    if(!supabase||!login.email){setNotice('Enter your registered email address first.');return;}
    setLoading(true);
    const {error}=await supabase.auth.signInWithOtp({email:login.email,options:{shouldCreateUser:false}});
    setLoading(false);if(error){setNotice(error.message);return;}setLoginOtpSent(true);setNotice('A one-time login code has been sent to your registered email.');
  }
  async function verifyLoginOtp(e){
    e.preventDefault();if(!supabase||!login.email||!loginOtp.trim()){setNotice('Enter the email OTP.');return;}
    requestedLoginRole.current=loginRole;setLoading(true);const {error}=await supabase.auth.verifyOtp({email:login.email,token:loginOtp.trim(),type:'email'});setLoading(false);if(error){requestedLoginRole.current=null;setNotice(error.message);}
  }
  async function sendSchoolOtp(e){
    e.preventDefault();if(!supabase){setNotice('Vidyalaya registration requires the configured email OTP backend.');return;}
    if(!schoolForm.school_name.trim()||!schoolForm.contact_person.trim()||!schoolForm.email.trim()||!schoolForm.school_address.trim()){setNotice('Complete the Vidyalaya name, authorised contact, email and address.');return;}
    setLoading(true);const {error}=await supabase.auth.signInWithOtp({email:schoolForm.email.trim().toLowerCase(),options:{shouldCreateUser:true,data:{full_name:schoolForm.contact_person,registration_type:'vidyalaya_application'}}});setLoading(false);
    if(error){setNotice(error.message);return;}setSchoolOtpSent(true);setNotice('OTP sent. Check the registered Vidyalaya email and enter the code to verify it.');
  }
  async function verifySchoolOtp(e){
    e.preventDefault();if(!supabase||!schoolOtp.trim())return;
    schoolRegistrationInProgress.current=true;setLoading(true);const {data:verified,error}=await supabase.auth.verifyOtp({email:schoolForm.email.trim().toLowerCase(),token:schoolOtp.trim(),type:'email'});
    if(error||!verified.user){schoolRegistrationInProgress.current=false;setLoading(false);setNotice(error?.message||'Email verification failed.');return;}
    const application={...schoolForm,applicant_user_id:verified.user.id,email:schoolForm.email.trim().toLowerCase(),email_verified:true,status:'pending'};
    const {error:insertError}=await supabase.from('school_applications').insert(application);
    setLoading(false);
    if(insertError){schoolRegistrationInProgress.current=false;setNotice(insertError.message);await supabase.auth.signOut();return;}
    await supabase.auth.signOut();schoolRegistrationInProgress.current=false;setSchoolOtpSent(false);setSchoolOtp('');setSchoolForm({school_name:'',affiliation_number:'',division:'KVS Hyderabad Division',school_address:'',principal_name:'',contact_person:'',email:'',mobile:''});setPage('home');setNotice('Vidyalaya email verified. Your registration is now pending Super Admin approval. School Admin access will be activated only after approval.');
  }
  async function createRoleAccount(e){
    e.preventDefault();if(!supabase||demoMode){setNotice('Connect the production Supabase backend to create real login accounts.');return;}
    setLoading(true);const {data:result,error}=await supabase.functions.invoke('create-role-account',{body:accountForm});setLoading(false);
    if(error||result?.error){setNotice(result?.error||error.message);return;}
    setNotice(result.message||'Account invitation sent.');setAccountForm({full_name:'',email:'',role:role==='school_admin'?'unit_leader':'patrol_leader',unit_id:user?.profile?.unit_id||'',patrol_id:user?.profile?.patrol_id||''});await loadRemoteData();
  }
  async function reviewSchoolApplication(application,decision){
    if(!supabase||role!=='super_admin'){setNotice('Only the Super Admin can review Vidyalaya registrations.');return;}
    const notes=decision==='reject'?(window.prompt('Reason for rejection (optional):')||''):'';
    setLoading(true);const {data:result,error}=await supabase.functions.invoke('approve-school',{body:{application_id:application.id,decision,review_notes:notes}});setLoading(false);
    if(error||result?.error){setNotice(result?.error||error.message);return;}setNotice(result.message);await loadRemoteData();
  }
  async function recoverPassword(){
    if(!supabase||!login.email){setNotice('Enter your account email first.');return;}
    setLoading(true);
    const {error}=await supabase.auth.resetPasswordForEmail(login.email,{redirectTo:window.location.origin+window.location.pathname});
    setLoading(false);setNotice(error?error.message:'Password recovery instructions have been sent, if the account exists.');
  }
  async function updatePassword(e){
    e.preventDefault();
    if(newPassword.length<8){setNotice('Use a password with at least eight characters.');return;}
    setLoading(true);const {data:result,error}=await supabase.auth.updateUser({password:newPassword});setLoading(false);
    if(error){setNotice(error.message);return;}
    setRecoveryMode(false);setNewPassword('');setNotice('Password updated successfully.');
    if(result.user)await loadProfile(result.user);
  }
  async function signOut(){
    if(supabase&&!demoMode)await supabase.auth.signOut();
    setUser(null);setRole('member');setDemoMode(!supabase);setPage('home');setLoginMode(false);
  }
  function enterDemo(r){
    setRole(r);setDemoMode(true);setUser({email:'demo@kvmedak.local',profile:{full_name:'Demo User',role:r}});
    setLoginMode(false);setPage('dashboard');setNotice('Demo mode: records are stored only in this browser.');
  }
  function openCreate(type,row=null){
    setEditing(row);setModal(type);
    if(type==='member')setForm(row?{...emptyForm,...row}:{...emptyForm,unit_id:user?.profile?.unit_id||'',patrol_id:role==='patrol_leader'||role==='assistant_patrol_leader'?user?.profile?.patrol_id||'':''});
    if(type==='event')setEventForm(row?{...row}:{title:'',event_type:'Activity',event_date:today(),venue:'',description:''});
    if(type==='notice')setNoticeForm(row?{...row}:{title:'',body:'',published_on:today(),audience:'All',is_published:true});
    if(type==='test')setTestForm(row?{...row}:{title:'',stage:'Pravesh',test_date:today(),max_marks:100,unit:'All'});
    if(type==='certificate')setCertForm(row?{...row}:{recipient_name:'',certificate_type:'Participation',certificate_number:'',issue_date:today(),remarks:''});
  }
  async function submitMember(e){
    e.preventDefault();
    if(!form.full_name.trim()){setNotice('Enter the member name.');return;}
    if(!editing&&!form.email.trim()){setNotice('A member email is required to create their individual login.');return;}
    if(form.patrol_id&&data.patrols.find(p=>p.id===form.patrol_id)){
      const patrol=data.patrols.find(p=>p.id===form.patrol_id);
      const occupied=data.members.filter(m=>m.patrol_id===form.patrol_id&&m.id!==editing?.id).length;
      if(occupied>=Math.min(8,Number(patrol.capacity||8))){setNotice('This patrol is full. Maximum capacity is eight members.');return;}
    }
    const row={...form,id:editing?.id||uid(),bsg_uid:String(form.bsg_uid||'').trim()||null,patrol_id:form.patrol_id||null,unit_id:form.unit_id||user?.profile?.unit_id||null};
    if(!editing&&supabase&&!demoMode){
      if(!form.email.trim()){setNotice('A member email is required to create their individual login.');return;}
      setLoading(true);const {data:result,error}=await supabase.functions.invoke('create-role-account',{body:{role:'member',full_name:form.full_name,email:form.email,unit_id:row.unit_id,patrol_id:row.patrol_id,member:row}});setLoading(false);
      if(error||result?.error){setNotice(result?.error||error.message);return;}
      await loadRemoteData();setModal('');setNotice(result.message||'Member record created and login invitation sent by email.');return;
    }
    const saved=await saveRow('members',row);if(!saved)return;setModal('');setNotice(editing?'Member updated.':'Demo member record saved.');
  }
  async function verifyMember(m,status){
    if(status==='approved'&&!String(m.bsg_uid||'').trim()){setNotice('A BSG UID is required before approval.');return;}
    await saveRow('members',{...m,verification_status:status});
    setNotice('UID verification marked '+status+'.');
  }
  async function reviewRegistration(r,status){
    if(status==='approved'){
      const exists=data.members.some(m=>m.email&&r.email&&m.email.toLowerCase()===r.email.toLowerCase());
      if(exists){setNotice('A member with this email already exists. Review the existing member record.');return;}
      await saveRow('members',{id:uid(),full_name:r.full_name,category:r.category,parents_names:r.parents_names||'',dob:r.dob||null,mobile:r.mobile||'',email:r.email||'',address:r.address||'',unit:r.category,verification_status:'pending',status:'active'});
    }
    await saveRow('registration_requests',{...r,status});
    setNotice(status==='approved'?'Registration approved and a pending member record was created. Add the BSG UID and verify it separately.':'Registration request rejected.');
  }

  async function submitAttendance(){
    if(!selectedSession){setNotice('Select an attendance session.');return;}
    const sessionRecords=data.members.filter(m=>m.verification_status==='approved').map(m=>({session_id:selectedSession,member_id:m.id,status:attendance[m.id]||'absent'}));
    for(const r of sessionRecords){
      const old=data.attendance_records.find(x=>x.session_id===r.session_id&&x.member_id===r.member_id);
      if(old)await saveRow('attendance_records',{...old,...r});else await saveRow('attendance_records',{...r,id:uid()});
    }
    setNotice('Attendance saved for approved members.');
  }
  async function submitMarks(){
    if(!selectedTest){setNotice('Select a test first.');return;}
    const test=data.tests.find(t=>t.id===selectedTest);
    for(const [memberId,value] of Object.entries(marks)){
      if(value==='')continue;const n=Number(value);
      if(!Number.isFinite(n)||n<0||n>Number(test.max_marks)){setNotice('Marks must be between 0 and '+test.max_marks+'.');return;}
      const old=data.test_results.find(x=>x.test_id===selectedTest&&x.member_id===memberId);
      await saveRow('test_results',{...(old||{}),id:old?.id||uid(),test_id:selectedTest,member_id:memberId,marks:n});
    }
    setNotice('Marks saved.');
  }
  async function addPatrol(){
    const name=window.prompt('Enter patrol name (Panther, Eagle, Fox, Tiger, Lion):');if(!name)return;
    if(data.patrols.some(p=>p.name.toLowerCase()===name.trim().toLowerCase())){setNotice('A patrol with this name already exists.');return;}
    const unit=data.units.find(u=>u.id===user?.profile?.unit_id)||data.units.find(u=>u.category==='Scout');
    if(!unit){setNotice('Create or select a Scout / Guide unit before adding a patrol.');return;}
    await saveRow('patrols',{id:uid(),name:name.trim(),unit:unit.category,unit_id:unit.id,assistant_leader:'',capacity:8});
  }
  async function submitEvent(e){e.preventDefault();await saveRow('events',{...eventForm,id:editing?.id||uid(),status:'upcoming'});setModal('');setNotice('Event saved.');}
  async function submitNotice(e){e.preventDefault();await saveRow('notices',{...noticeForm,id:editing?.id||uid()});setModal('');setNotice('Notice published.');}
  async function submitTest(e){e.preventDefault();await saveRow('tests',{...testForm,id:editing?.id||uid(),max_marks:Number(testForm.max_marks)});setModal('');setNotice('Test created.');}
  async function submitCertificate(e){e.preventDefault();await saveRow('certificates',{...certForm,id:editing?.id||uid()});setModal('');setNotice('Certificate record created.');}
  const filteredMembers=data.members.filter(m=>(memberFilter==='all'||m.verification_status===memberFilter)&&[m.full_name,m.bsg_uid,m.mobile,m.category].join(' ').toLowerCase().includes(search.toLowerCase()));
  const activeTitle=visibleNav.find(n=>n.id===page)?.label||'Dashboard';
  const go=(p)=>{setPage(p);setMobileNav(false);setSearch('');};

  function Topbar(){return <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><div><div className="crumb">BSG OYMS 4.0 / <b>{activeTitle}</b></div><h1>{activeTitle}</h1></div><div className="top-actions"><span className={'mode-pill '+(demoMode?'demo':'live')}>{demoMode?'DEMO MODE':'CONNECTED'}</span><button className="icon-btn" title="Notifications" onClick={()=>go('notices')}><Bell size={19}/></button><div className="avatar">{(user?.profile?.full_name||'U').slice(0,1).toUpperCase()}</div></div></header>}
  function Sidebar(){return <aside className={'sidebar '+(mobileNav?'open':'')}><div className="side-brand"><div className="brand-seal">BSG</div><div><b>KV MEDAK</b><small>OYMS 4.0 · 2026</small></div><button className="side-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div><div className="side-institution">BHARAT SCOUTS & GUIDES<br/>KVS HYDERABAD DIVISION</div><nav>{visibleNav.map(n=><button key={n.id} className={page===n.id?'active':''} onClick={()=>go(n.id)}><n.icon size={17}/><span>{n.label}</span></button>)}</nav><div className="side-bottom"><div className="user-mini"><div className="avatar small">{(user?.profile?.full_name||'D').slice(0,1).toUpperCase()}</div><div><b>{user?.profile?.full_name||'Demo User'}</b><small>{labelRole(role)}</small></div></div><button className="logout-btn" onClick={signOut}><LogOut size={16}/> Sign out</button></div></aside>}
  function Stat({icon:Icon,label,value,sub}){return <div className="stat-card"><div className="stat-icon"><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>}
  function SectionHead({title,sub,action}){return <div className="section-head"><div><h2>{title}</h2>{sub&&<p>{sub}</p>}</div>{action}</div>}
  function Table({headers,children}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
  function Empty({text}){return <div className="empty"><ClipboardList size={28}/><b>No records found</b><span>{text||'Records will appear here when added.'}</span></div>}
  function Status({value}){return <span className={'status '+String(value).toLowerCase().replaceAll(' ','-')}>{value}</span>}
  function Dashboard(){const dashTitle=role==='super_admin'?'Super Admin Dashboard':role==='school_admin'?'School / Group Admin Dashboard':role==='unit_leader'?'Unit Leader Dashboard':role==='patrol_leader'?'Patrol Leader Dashboard':role==='assistant_patrol_leader'?'Assistant Patrol Leader Dashboard':'My Scout & Guide Dashboard';const dashIntro=role==='member'?'Follow your unit activities, learning record and Scout / Guide journey.':(role==='patrol_leader'||role==='assistant_patrol_leader')?'Coordinate your patrol, attendance and member participation.':role==='unit_leader'?'Oversee Scout and Guide units, progression and unit activities.':'Monitor the BSG unit, member records, verification and administration.';return <><div className="welcome-banner"><div><span className="eyebrow">BHARAT SCOUTS & GUIDES · UNIT MANAGEMENT</span><h2>{dashTitle}</h2><p>{dashIntro}</p></div><div className="banner-mark"><Compass size={42}/><small>BE PREPARED</small></div></div><div className="stat-grid"><Stat icon={Users} label="Total Members" value={counts.members} sub={counts.approved+' UID verified'}/><Stat icon={ShieldCheck} label="Pending UID" value={counts.pending} sub="Awaiting verification"/><Stat icon={Flag} label="Active Patrols" value={counts.patrols} sub="Scout & Guide patrols"/><Stat icon={CalendarDays} label="Activities" value={counts.events} sub="Camps and events"/></div><div className="content-grid"><section className="panel"><SectionHead title="Recent Unit Updates" sub="Latest notices and announcements" action={<button className="text-btn" onClick={()=>go('notices')}>View all</button>}/>{data.notices.slice(0,4).map(n=><div className="feed-row" key={n.id}><div className="feed-icon"><Megaphone size={17}/></div><div><b>{n.title}</b><small>{fmtDate(n.published_on)}</small></div><ChevronRight size={16}/></div>)}</section><section className="panel"><SectionHead title="Upcoming Activities" sub="Unit calendar" action={<button className="text-btn" onClick={()=>go('events')}>View all</button>}/>{data.events.slice(0,4).map(e=><div className="feed-row" key={e.id}><div className="feed-icon gold"><CalendarDays size={17}/></div><div><b>{e.title}</b><small>{fmtDate(e.event_date)} · {e.venue||'Venue to be announced'}</small></div><ChevronRight size={16}/></div>)}</section></div><section className="panel quick-panel"><SectionHead title="Quick Actions" sub="Frequently used unit operations"/><div className="quick-grid"><button onClick={()=>{openCreate('member');}}><UserPlus/><span>Add member</span></button><button onClick={()=>go('attendance')}><ClipboardCheck/><span>Mark attendance</span></button><button onClick={()=>{openCreate('event');}}><Tent/><span>Create activity</span></button><button onClick={()=>go('reports')}><FileBarChart/><span>View reports</span></button></div></section></>}
  function Members(){return <><SectionHead title="Member Database" sub="Manage Scout, Guide, Rover and Ranger records" action={canManage?<button className="primary-btn" onClick={()=>openCreate('member')}><Plus size={16}/> Add Member</button>:null}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, UID, mobile..."/></div><select value={memberFilter} onChange={e=>setMemberFilter(e.target.value)}><option value="all">All verification states</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select><button className="outline-btn" onClick={()=>exportCSV('kv-medak-members',filteredMembers)}><Download size={16}/> Export CSV</button></div><div className="panel"><Table headers={['Member','Category','BSG UID','Unit / Patrol','Verification','Actions']}>{filteredMembers.map(m=><tr key={m.id}><td><b>{m.full_name}</b><small className="cell-sub">{m.mobile||m.email||'Contact not added'}</small></td><td>{m.category}</td><td>{m.bsg_uid||'—'}</td><td>{m.unit||'—'}<small className="cell-sub">{data.patrols.find(p=>p.id===m.patrol_id)?.name||'Unassigned'}</small></td><td><Status value={m.verification_status}/></td><td className="row-actions">{canManage&&<><button title="Edit" onClick={()=>openCreate('member',m)}><Pencil size={15}/></button>{m.verification_status!=='approved'&&<button title="Approve UID" onClick={()=>verifyMember(m,'approved')}><Check size={15}/></button>}<button title="Delete" onClick={()=>deleteRow('members',m.id)}><Trash2 size={15}/></button></>}</td></tr>)}</Table>{filteredMembers.length===0&&<Empty text="Try another search or add a new member."/>}</div></>}
  function UID(){const pending=data.members.filter(m=>m.verification_status!=='approved');const requests=data.registration_requests.filter(r=>r.status==='pending');return <><SectionHead title="UID Verification & Registration Review" sub="Review new registration requests and verify BSG UID details."/><div className="stat-grid compact"><Stat icon={ShieldCheck} label="Approved" value={counts.approved} sub="Verified members"/><Stat icon={Clock3} label="Pending UID" value={counts.pending} sub="Needs review"/><Stat icon={UserPlus} label="Registration requests" value={requests.length} sub="Awaiting unit review"/></div><div className="panel"><SectionHead title="New Registration Requests" sub="Approval creates a member record with UID verification still pending."/><Table headers={['Applicant','Category','Contact','Submitted','Review']}>{requests.map(r=><tr key={r.id}><td><b>{r.full_name}</b><small className="cell-sub">{r.parents_names||'Parent details not provided'}</small></td><td>{r.category}</td><td>{r.mobile||'—'}<small className="cell-sub">{r.email||''}</small></td><td>{fmtDate(r.submitted_at?.slice(0,10))}</td><td className="row-actions"><button className="approve" onClick={()=>reviewRegistration(r,'approved')}><Check size={15}/> Approve</button><button className="reject" onClick={()=>reviewRegistration(r,'rejected')}><X size={15}/> Reject</button></td></tr>)}</Table>{!requests.length&&<Empty text="There are no pending registration requests."/>}</div><div className="panel"><SectionHead title="BSG UID Verification" sub="A BSG UID is required before a member can be approved."/><Table headers={['Member','BSG UID','Category','Contact','Status','Review']}>{pending.map(m=><tr key={m.id}><td><b>{m.full_name}</b></td><td>{m.bsg_uid||'Not provided'}</td><td>{m.category}</td><td>{m.mobile||'—'}<small className="cell-sub">{m.email||''}</small></td><td><Status value={m.verification_status}/></td><td className="row-actions"><button className="approve" onClick={()=>verifyMember(m,'approved')}><Check size={15}/> Approve</button><button className="reject" onClick={()=>verifyMember(m,'rejected')}><X size={15}/> Reject</button></td></tr>)}</Table>{!pending.length&&<Empty text="All current member records are approved."/>}</div></>}
  function Units(){return <><SectionHead title="Scout & Guide Units" sub="Unit structure for the Medak BSG Group" action={canManage?<button className="primary-btn" onClick={()=>{const n=window.prompt('Unit name');if(n)saveRow('units',{id:uid(),name:n,category:n.toLowerCase().includes('guide')?'Guide':'Scout'});}}><Plus size={16}/> Add Unit</button>:null}/><div className="unit-grid">{data.units.map(u=><div className="panel unit-card" key={u.id}><div className="unit-symbol"><Flag/></div><span className="eyebrow">{u.category} SECTION</span><h3>{u.name}</h3><p>Unit Leader: {u.leader_name||'Not assigned'}</p><strong>{data.members.filter(m=>m.unit===u.category).length} members</strong></div>)}</div></>}
  function Patrols(){return <><SectionHead title="Patrol Management" sub="Five patrol identities · maximum eight members per patrol" action={canManage?<button className="primary-btn" onClick={addPatrol}><Plus size={16}/> Add Patrol</button>:null}/><div className="patrol-grid">{data.patrols.map((p,i)=>{const ms=data.members.filter(m=>m.patrol_id===p.id);return <div className="panel patrol-card" key={p.id}><div className="patrol-top"><div className="patrol-crest">{p.name.slice(0,1)}</div><Status value={ms.length>=8?'Full':'Active'}/></div><span className="eyebrow">{p.unit||'Scout'} PATROL</span><h3>{p.name}</h3><div className="capacity"><div><b>{ms.length} / 8</b><small>Members</small></div><div className="progress"><i style={{width:(Math.min(ms.length,8)/8*100)+'%'}}/></div></div><small>Patrol Leader: {p.leader_name||'Not assigned'}</small>{ms.map(m=><div className="member-chip" key={m.id}>{m.full_name}</div>)}{canManage&&<button className="text-btn" onClick={()=>{const m=data.members.find(x=>!x.patrol_id&&x.verification_status==='approved');if(!m){setNotice('No unassigned approved member is available.');return;}if(ms.length>=8){setNotice('Patrol is full. Maximum eight members.');return;}saveRow('members',{...m,patrol_id:p.id});setNotice(m.full_name+' assigned to '+p.name+'.');}}>Assign next approved member</button>}</div>})}</div></>}
  function Attendance(){const sessions=data.attendance_sessions;const current=sessions.find(s=>s.id===selectedSession)||sessions[0];return <><SectionHead title="Attendance Management" sub="Create sessions and record attendance for approved members" action={canManage?<button className="primary-btn" onClick={()=>{const title=window.prompt('Attendance session title');if(title)saveRow('attendance_sessions',{id:uid(),title,session_date:today(),start_time:'09:00',closing_time:'10:00',unit:'All'});}}><Plus size={16}/> New Session</button>:null}/><div className="toolbar"><select value={current?.id||''} onChange={e=>setSelectedSession(e.target.value)}><option value="">Select session</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.title} — {fmtDate(s.session_date)}</option>)}</select><button className="outline-btn" onClick={()=>exportCSV('kv-medak-attendance',data.attendance_records)}><Download size={16}/> Export</button></div>{current?<div className="panel"><SectionHead title={current.title} sub={fmtDate(current.session_date)+' · '+(current.start_time||'')+' – '+(current.closing_time||'')}/><Table headers={['Member','Unit','Attendance']}>{data.members.filter(m=>m.verification_status==='approved').map(m=><tr key={m.id}><td><b>{m.full_name}</b></td><td>{m.unit}</td><td><select value={attendance[m.id]||data.attendance_records.find(x=>x.session_id===current.id&&x.member_id===m.id)?.status||'absent'} onChange={e=>setAttendance(p=>({...p,[m.id]:e.target.value}))}><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option></select></td></tr>)}</Table><div className="panel-actions"><button className="primary-btn" onClick={submitAttendance}><Check size={16}/> Save Attendance</button></div></div>:<Empty text="Create an attendance session to begin."/>}</>}
  function Tests(){const current=data.tests.find(t=>t.id===selectedTest)||data.tests[0];return <><SectionHead title="Tests & Marks" sub="Sopan tests, marks entry and result tracking" action={canManage?<button className="primary-btn" onClick={()=>openCreate('test')}><Plus size={16}/> Create Test</button>:null}/><div className="toolbar"><select value={current?.id||''} onChange={e=>setSelectedTest(e.target.value)}><option value="">Select test</option>{data.tests.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select><button className="outline-btn" onClick={()=>exportCSV('kv-medak-test-results',data.test_results)}><Download size={16}/> Export marks</button></div>{current?<div className="panel"><div className="test-summary"><div><span className="eyebrow">{current.stage}</span><h3>{current.title}</h3><p>{fmtDate(current.test_date)} · Maximum marks: {current.max_marks}</p></div></div><Table headers={['Member','UID','Marks','Result']}>{data.members.filter(m=>m.verification_status==='approved').map(m=>{const result=data.test_results.find(r=>r.test_id===current.id&&r.member_id===m.id);return <tr key={m.id}><td><b>{m.full_name}</b></td><td>{m.bsg_uid||'—'}</td><td><input className="marks-input" type="number" min="0" max={current.max_marks} value={marks[m.id]??result?.marks??''} onChange={e=>setMarks(p=>({...p,[m.id]:e.target.value}))}/></td><td>{result?<Status value={Number(result.marks)>=Number(current.max_marks)*.4?'Recorded':'Review'} />:'Not entered'}</td></tr>})}</Table><div className="panel-actions"><button className="primary-btn" onClick={submitMarks}>Save Marks</button></div></div>:<Empty text="Create a test to enter marks."/>}</>}
  function Progression(){return <><SectionHead title="Progression Records" sub="Track stage completion and awards. Higher-stage records are staff controlled."/><div className="panel"><Table headers={['Member','Stage','Completion date','Status','Certificate no.']}>{data.progression_records.map(r=><tr key={r.id}><td>{data.members.find(m=>m.id===r.member_id)?.full_name||'Member'}</td><td>{r.stage}</td><td>{fmtDate(r.completion_date)}</td><td><Status value={r.status}/></td><td>{r.certificate_number||'—'}</td></tr>)}</Table>{!data.progression_records.length&&<Empty/>}</div>{canManage&&<button className="primary-btn section-button" onClick={()=>{const member=data.members[0];if(!member){setNotice('Add a member first.');return;}const stage=window.prompt('Stage name',STAGES[0]);if(stage)saveRow('progression_records',{id:uid(),member_id:member.id,stage,completion_date:today(),status:'completed'});}}> <Plus size={16}/> Add Progression Record</button>}</>}
  function Events(){return <><SectionHead title="Camps & Activities" sub="Plan, publish and review unit programmes" action={canManage?<button className="primary-btn" onClick={()=>openCreate('event')}><Plus size={16}/> Add Activity</button>:null}/><div className="event-grid">{data.events.map(e=><div className="panel event-card" key={e.id}><div className="event-date"><CalendarDays/><b>{fmtDate(e.event_date)}</b></div><span className="eyebrow">{e.event_type}</span><h3>{e.title}</h3><p>{e.description}</p><small><Compass size={13}/> {e.venue||'Venue to be announced'}</small>{canManage&&<div className="row-actions"><button onClick={()=>openCreate('event',e)}><Pencil size={15}/></button><button onClick={()=>deleteRow('events',e.id)}><Trash2 size={15}/></button></div>}</div>)}</div>{!data.events.length&&<Empty/>}</>}
  function Notices(){return <><SectionHead title="Circulars & Notifications" sub="Official unit announcements and instructions" action={canManage?<button className="primary-btn" onClick={()=>openCreate('notice')}><Plus size={16}/> New Notice</button>:null}/><div className="notice-list">{data.notices.map(n=><div className="panel notice-card" key={n.id}><div className="notice-symbol"><Megaphone/></div><div className="notice-body"><div className="notice-meta">{fmtDate(n.published_on)} · {n.audience}</div><h3>{n.title}</h3><p>{n.body}</p></div>{canManage&&<div className="row-actions"><button onClick={()=>openCreate('notice',n)}><Pencil size={15}/></button><button onClick={()=>deleteRow('notices',n.id)}><Trash2 size={15}/></button></div>}</div>)}</div>{!data.notices.length&&<Empty/>}</>}
  function Court(){return <><SectionHead title="Court of Honour" sub="Record meeting dates, decisions and responsibilities"/><div className="panel"><p className="muted">Use this section to maintain the unit's Court of Honour record. Meeting minutes and decisions should be entered and verified by the Unit Leader.</p><button className="primary-btn" onClick={()=>{const title=window.prompt('Meeting / decision title');if(title)saveRow('logbook_entries',{id:uid(),activity:'Court of Honour: '+title,entry_date:today(),learning:'Meeting record — verify minutes with Unit Leader'});}}><Plus size={16}/> Add Meeting Record</button>{data.logbook_entries.filter(x=>(x.activity||'').startsWith('Court of Honour:')).map(x=><div className="feed-row" key={x.id}><BookMarked/><div><b>{x.activity}</b><small>{fmtDate(x.entry_date)}</small></div></div>)}</div></>}
  function Logbooks(){return <><SectionHead title="Digital Logbooks" sub="Member learning, activities and skill records" action={<button className="primary-btn" onClick={()=>{const activity=window.prompt('Activity / skill completed');if(activity)saveRow('logbook_entries',{id:uid(),member_id:selectedMember||data.members[0]?.id,entry_date:today(),activity,learning:'',verified_by:''});}}><Plus size={16}/> Add Entry</button>}/><div className="panel"><Table headers={['Date','Member','Activity / Skill','Learning','Verified by']}>{data.logbook_entries.map(x=><tr key={x.id}><td>{fmtDate(x.entry_date)}</td><td>{data.members.find(m=>m.id===x.member_id)?.full_name||'Unit record'}</td><td>{x.activity}</td><td>{x.learning||'—'}</td><td>{x.verified_by||'Pending'}</td></tr>)}</Table>{!data.logbook_entries.length&&<Empty text="Logbook entries will appear here."/>}</div></>}
  function Certificates(){return <><SectionHead title="Certificate Preparation" sub="Prepare print-ready certificate drafts for unit activities and progression" action={<button className="primary-btn" onClick={()=>openCreate('certificate')}><Plus size={16}/> New Certificate</button>}/><div className="certificate-grid">{data.certificates.map(c=><div className="panel certificate-card" key={c.id}><div className="cert-preview"><div className="cert-logo">BSG</div><span>BHARAT SCOUTS & GUIDES</span><h3>CERTIFICATE</h3><p>This is to certify that</p><b>{c.recipient_name}</b><p>has participated in / completed</p><strong>{c.certificate_type}</strong><small>{SCHOOL} · KVS HYDERABAD DIVISION</small></div><div className="cert-actions"><span>{c.certificate_number||'Draft certificate'}</span><button className="outline-btn" onClick={()=>{setEditing(c);setCertForm(c);setModal('certificate');}}>Edit</button><button className="outline-btn" onClick={()=>window.print()}><Printer size={15}/> Print</button></div></div>)}</div>{!data.certificates.length&&<Empty text="Create a certificate draft to see it here."/>}</>}
  function Reports(){return <><SectionHead title="Reports & Analytics" sub="Unit-level overview and downloadable data"/><div className="stat-grid"><Stat icon={Users} label="Members" value={counts.members} sub="All categories"/><Stat icon={CheckCircle2} label="UID approved" value={counts.approved} sub="Verified records"/><Stat icon={ClipboardCheck} label="Attendance entries" value={data.attendance_records.length} sub="Saved records"/><Stat icon={Award} label="Progression records" value={data.progression_records.length} sub="Stages recorded"/></div><div className="report-grid"><div className="panel"><h3>Member composition</h3>{['Scout','Guide','Rover','Ranger'].map(c=><div className="bar-row" key={c}><span>{c}</span><div className="progress"><i style={{width:(counts.members?data.members.filter(m=>m.category===c).length/counts.members*100:0)+'%'}}/></div><b>{data.members.filter(m=>m.category===c).length}</b></div>)}</div><div className="panel"><h3>UID verification status</h3>{['approved','pending','rejected'].map(s=><div className="bar-row" key={s}><span>{s}</span><div className="progress"><i style={{width:(counts.members?data.members.filter(m=>m.verification_status===s).length/counts.members*100:0)+'%'}}/></div><b>{data.members.filter(m=>m.verification_status===s).length}</b></div>)}</div></div><div className="panel export-panel"><h3>Download data</h3><button className="outline-btn" onClick={()=>exportCSV('oyms-members',data.members)}>Members CSV</button><button className="outline-btn" onClick={()=>exportCSV('oyms-attendance',data.attendance_records)}>Attendance CSV</button><button className="outline-btn" onClick={()=>exportCSV('oyms-progression',data.progression_records)}>Progression CSV</button><button className="outline-btn" onClick={()=>exportCSV('oyms-events',data.events)}>Activities CSV</button></div></>}
  function Profile(){return <div className="panel profile-panel"><div className="profile-avatar">{(user?.profile?.full_name||'D').slice(0,1).toUpperCase()}</div><h2>{user?.profile?.full_name||'Demo User'}</h2><p>{user?.email||'demo@kvmedak.local'}</p><Status value={labelRole(role)}/><div className="profile-details"><span>Institution</span><b>{SCHOOL}</b><span>Division</span><b>{DIVISION}</b><span>Account mode</span><b>{demoMode?'Local demo':'Authenticated account'}</b></div></div>}
  function SchoolApplications(){const pending=data.school_applications.filter(a=>a.status==='pending');return <><SectionHead title="Vidyalaya Registration Applications" sub="Only email-verified school applications can be approved. Approval activates the School / Group Admin account."/><div className="stat-grid compact"><Stat icon={Clock3} label="Pending review" value={pending.length} sub="Verified applications"/><Stat icon={CheckCircle2} label="Approved" value={data.school_applications.filter(a=>a.status==='approved').length} sub="Active Vidyalayas"/><Stat icon={AlertCircle} label="Rejected" value={data.school_applications.filter(a=>a.status==='rejected').length} sub="Not approved"/></div><div className="panel"><Table headers={['Vidyalaya','Division / Code','Authorised Contact','Verified Email','Status','Decision']}>{data.school_applications.map(a=><tr key={a.id}><td><b>{a.school_name}</b><small className="cell-sub">{a.school_address}</small></td><td>{a.division}<small className="cell-sub">{a.affiliation_number||'Code not supplied'}</small></td><td>{a.contact_person}<small className="cell-sub">{a.mobile||'—'}</small></td><td>{a.email}<small className="cell-sub">{a.email_verified?'Email OTP verified':'Not verified'}</small></td><td><Status value={a.status}/></td><td className="row-actions">{a.status==='pending'&&<><button className="approve" disabled={loading} onClick={()=>reviewSchoolApplication(a,'approve')}><Check size={15}/> Approve & Create Admin</button><button className="reject" disabled={loading} onClick={()=>reviewSchoolApplication(a,'reject')}><X size={15}/> Reject</button></>}</td></tr>)}</Table>{!data.school_applications.length&&<Empty text="No Vidyalaya applications have been submitted yet."/ >}</div></>}
  function Accounts(){const choices=role==='school_admin'?[{id:'unit_leader',label:'Unit Leader (Scout Master / Guide Captain)'}]:[{id:'patrol_leader',label:'Patrol Leader'},{id:'assistant_patrol_leader',label:'Assistant Patrol Leader'}];return <><SectionHead title="Create Leadership Login" sub={role==='school_admin'?'Create the Scout Master / Guide Captain account for a registered unit.':'Create Patrol Leader and Assistant Patrol Leader accounts for your assigned unit.'}/><div className="panel"><form onSubmit={createRoleAccount} className="form-grid"><label>Full name *<input required value={accountForm.full_name} onChange={e=>setAccountForm({...accountForm,full_name:e.target.value})}/></label><label>Official email *<input type="email" required value={accountForm.email} onChange={e=>setAccountForm({...accountForm,email:e.target.value})}/></label><label>Account role<select value={accountForm.role} onChange={e=>setAccountForm({...accountForm,role:e.target.value,patrol_id:''})}>{choices.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>{role==='school_admin'?<label>Scout / Guide Unit *<select required value={accountForm.unit_id} onChange={e=>setAccountForm({...accountForm,unit_id:e.target.value})}><option value="">Select unit</option>{data.units.map(u=><option key={u.id} value={u.id}>{u.name} ({u.category})</option>)}</select></label>:<label>Assigned Patrol *<select required value={accountForm.patrol_id} onChange={e=>setAccountForm({...accountForm,patrol_id:e.target.value})}><option value="">Select patrol</option>{data.patrols.filter(p=>!user?.profile?.unit_id||p.unit_id===user.profile.unit_id).map(p=><option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}</select></label>}<div className="span-2 demo-warning"><ShieldCheck size={17}/> The account invitation is sent to the email address. The recipient must accept the invitation and set up their own password. Their role and unit / patrol permissions are assigned by the server.</div><div className="span-2 form-actions"><button className="primary-btn" disabled={loading}>{loading?'Creating account…':'Create Login & Send Email Invitation'}</button></div></form></div><div className="panel"><SectionHead title="Your reporting structure" sub="Accounts created under your authority"/><Table headers={['Name','Email','Role','Unit','Patrol']}>{data.school_applications.length===0&&role==='school_admin'?<tr><td colSpan="5">No additional account list is available yet.</td></tr>:<>{data.members.filter(m=>role==='school_admin'||m.patrol_id===user?.profile?.patrol_id).map(m=><tr key={m.id}><td>{m.full_name}</td><td>{m.email}</td><td>Scout / Guide Member</td><td>{m.unit}</td><td>{data.patrols.find(p=>p.id===m.patrol_id)?.name||'—'}</td></tr>)}</>}</Table></div></>}
  function SettingsPage(){return <div className="panel"><h3>Portal Settings</h3><p className="muted">This portal is configured for PM SHRI KV Ordnance Factory Medak. Production authentication and shared storage require Supabase environment variables and the SQL schema.</p><div className="setting-row"><div><b>Database connection</b><small>{supabase?'Supabase client configured':'Supabase credentials not configured'}</small></div><Status value={supabase?'configured':'demo'}/></div><div className="setting-row"><div><b>Current role</b><small>{labelRole(role)}</small></div><Status value="active"/></div><div className="setting-row"><div><b>Patrol capacity rule</b><small>Maximum eight members per patrol</small></div><Status value="enabled"/></div><button className="outline-btn" onClick={()=>{localStorage.removeItem('kvmedak-oyms-data-v4');setData(readDemo());setNotice('Local demo data reset.');}}>Reset local demo data</button></div>}
  function Gallery(){return <div className="panel"><SectionHead title="Unit Gallery" sub="Photographs and memories from Scout and Guide activities"/><div className="gallery-empty"><Image size={34}/><b>Gallery space</b><p>Connect an authorised image storage bucket to publish unit photographs. No sample student photographs are displayed.</p></div></div>}
  function Modal(){if(!modal)return null;return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('');}}><div className="modal"><div className="modal-head"><div><span className="eyebrow">OYMS RECORD</span><h2>{modal==='member'?(editing?'Edit Member':'Add Member'):modal==='event'?'Activity Details':modal==='notice'?'Circular / Notice':modal==='test'?'Create Test':'Certificate Details'}</h2></div><button className="icon-btn" onClick={()=>setModal('')}><X/></button></div>{modal==='member'&&<form onSubmit={submitMember} className="form-grid"><label>Full name *<input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value,unit:e.target.value})}>{['Scout','Guide','Rover','Ranger'].map(x=><option>{x}</option>)}</select></label><label>Father's name<input value={form.father_name||''} onChange={e=>setForm({...form,father_name:e.target.value})}/></label><label>Mother's name<input value={form.mother_name||''} onChange={e=>setForm({...form,mother_name:e.target.value})}/></label><label>Date of birth<input type="date" value={form.dob||''} onChange={e=>setForm({...form,dob:e.target.value})}/></label><label>Mobile number<input required value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></label><label>Member email / login ID *<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Joining date<input type="date" value={form.joining_date||''} onChange={e=>setForm({...form,joining_date:e.target.value})}/></label><label>Investiture date<input type="date" value={form.investiture_date||''} onChange={e=>setForm({...form,investiture_date:e.target.value})}/></label><label>Leaving date (if applicable)<input type="date" value={form.leaving_date||''} onChange={e=>setForm({...form,leaving_date:e.target.value})}/></label><label>BSG UID number (optional)<input placeholder="Leave blank if not yet allotted" value={form.bsg_uid||''} onChange={e=>setForm({...form,bsg_uid:e.target.value})}/></label><label>Troop / Company<input value={form.troop_company||''} onChange={e=>setForm({...form,troop_company:e.target.value})}/></label><label>Unit / Section<select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>Scout</option><option>Guide</option><option>Rover</option><option>Ranger</option></select></label><label>Patrol<select value={form.patrol_id||''} onChange={e=>setForm({...form,patrol_id:e.target.value})} disabled={role==='patrol_leader'||role==='assistant_patrol_leader'}><option value="">Unassigned</option>{data.patrols.map(p=><option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}</select></label><label>PIN code<input value={form.pin_code||''} onChange={e=>setForm({...form,pin_code:e.target.value})}/></label><label className="span-2">Home address<textarea value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})}/></label><label className="span-2">Unit address<textarea value={form.unit_address||''} onChange={e=>setForm({...form,unit_address:e.target.value})}/></label><label>Role in Unit<input value={form.role_in_unit||'Member'} onChange={e=>setForm({...form,role_in_unit:e.target.value})}/></label><div className="span-2"><b className="eyebrow">STAGE COMPLETION DATES · OYMS RECORD</b></div>{STAGES.map(stage=><label key={stage}>{stage} completion date<input type="date" value={form.stage_completion_dates?.[stage]||''} onChange={e=>setForm({...form,stage_completion_dates:{...(form.stage_completion_dates||{}),[stage]:e.target.value}})}/></label>)}<div className="form-actions span-2"><button type="button" className="outline-btn" onClick={()=>setModal('')}>Cancel</button><button className="primary-btn">{loading?'Creating…':editing?'Update Member':'Create Member Login'}</button></div></form>}{modal==='event'&&<form onSubmit={submitEvent} className="form-grid"><label>Activity title *<input required value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})}/></label><label>Type<select value={eventForm.event_type} onChange={e=>setEventForm({...eventForm,event_type:e.target.value})}>{['Activity','Meeting','Camp','Testing Camp','Service Project','Workshop'].map(x=><option>{x}</option>)}</select></label><label>Date<input type="date" value={eventForm.event_date||''} onChange={e=>setEventForm({...eventForm,event_date:e.target.value})}/></label><label>Venue<input value={eventForm.venue} onChange={e=>setEventForm({...eventForm,venue:e.target.value})}/></label><label className="span-2">Description<textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})}/></label><div className="form-actions span-2"><button type="button" className="outline-btn" onClick={()=>setModal('')}>Cancel</button><button className="primary-btn">Save Activity</button></div></form>}{modal==='notice'&&<form onSubmit={submitNotice} className="form-grid"><label>Title *<input required value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})}/></label><label>Audience<select value={noticeForm.audience} onChange={e=>setNoticeForm({...noticeForm,audience:e.target.value})}><option>All</option><option>Scouts</option><option>Guides</option><option>Leaders</option></select></label><label className="span-2">Message<textarea required value={noticeForm.body} onChange={e=>setNoticeForm({...noticeForm,body:e.target.value})}/></label><div className="form-actions span-2"><button type="button" className="outline-btn" onClick={()=>setModal('')}>Cancel</button><button className="primary-btn">Publish Notice</button></div></form>}{modal==='test'&&<form onSubmit={submitTest} className="form-grid"><label>Test title *<input required value={testForm.title} onChange={e=>setTestForm({...testForm,title:e.target.value})}/></label><label>Stage<select value={testForm.stage} onChange={e=>setTestForm({...testForm,stage:e.target.value})}>{STAGES.map(x=><option>{x}</option>)}</select></label><label>Date<input type="date" value={testForm.test_date||''} onChange={e=>setTestForm({...testForm,test_date:e.target.value})}/></label><label>Maximum marks<input type="number" min="1" value={testForm.max_marks} onChange={e=>setTestForm({...testForm,max_marks:e.target.value})}/></label><div className="form-actions span-2"><button type="button" className="outline-btn" onClick={()=>setModal('')}>Cancel</button><button className="primary-btn">Create Test</button></div></form>}{modal==='certificate'&&<form onSubmit={submitCertificate} className="form-grid"><label>Recipient name *<input required value={certForm.recipient_name} onChange={e=>setCertForm({...certForm,recipient_name:e.target.value})}/></label><label>Certificate type<input required value={certForm.certificate_type} onChange={e=>setCertForm({...certForm,certificate_type:e.target.value})}/></label><label>Certificate number<input value={certForm.certificate_number} onChange={e=>setCertForm({...certForm,certificate_number:e.target.value})}/></label><label>Issue date<input type="date" value={certForm.issue_date} onChange={e=>setCertForm({...certForm,issue_date:e.target.value})}/></label><label className="span-2">Remarks<textarea value={certForm.remarks} onChange={e=>setCertForm({...certForm,remarks:e.target.value})}/></label><div className="form-actions span-2"><button type="button" className="outline-btn" onClick={()=>setModal('')}>Cancel</button><button className="primary-btn">Save Certificate</button></div></form>}</div></div>}
  if(recoveryMode)return <div className="login-page"><div className="login-card"><div className="public-logo">BSG</div><span className="eyebrow">ACCOUNT SECURITY</span><h1>Set a new password</h1><p>Choose a new password for your OYMS account.</p><form onSubmit={updatePassword}><label>New password<input type="password" minLength="8" required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><button className="primary-btn block-btn" disabled={loading}>{loading?'Updating…':'Update password'}</button></form></div></div>;
  if(page==='home')return <div className="public-home"><div className="gov-strip"><span>भारत स्काउट्स एवं गाइड्स · BHARAT SCOUTS & GUIDES</span><span>School Unit Portal · KVS Hyderabad Division</span></div><header className="public-head"><div className="public-logo">BSG</div><div><b>भारत स्काउट्स एवं गाइड्स</b><h1>BHARAT SCOUTS & GUIDES</h1><p>{SCHOOL} · {PLACE}</p><small>{DIVISION}</small></div><div className="public-system">OYMS 4.0<small>ONLINE YOUTH MANAGEMENT SYSTEM · 2026</small></div></header><main className="public-main"><section className="public-columns"><div className="public-column"><h2>Unit Highlights</h2><ul><li>Scout and Guide unit activities and patrol programmes</li><li>Pravesh to Rashtrapati progression records</li><li>Dwitiya Sopan Testing Camp and skill development</li><li>Community service, SDG projects and workshops</li><li>Camps, Court of Honour and unit announcements</li></ul><button className="public-button" onClick={()=>setPage('events')}>View Activities</button></div><div className="public-column updates"><h2>Portal Updates</h2><ul><li>Vidyalaya email OTP verification and Super Admin approval <em>NEW</em></li><li>School Admin → Unit Leader → Patrol Leader → Member account hierarchy <em>NEW</em></li><li>Attendance and participation records</li><li>Tests, marks and progression updates</li><li>Certificates, notices and reports</li></ul><button className="public-button" onClick={()=>setPage('notices')}>View All</button></div></section><section className="public-access"><div><b>Access the BSG OYMS Portal</b><small>Use your approved role-specific login. New Vidyalayas must verify their official email before Admin approval.</small></div><button onClick={()=>setLoginMode(true)}>Portal Login <ChevronRight size={16}/></button><button className="secondary" onClick={()=>setPage('register')}>Register Your Vidyalaya</button></section><section className="public-services"><h2>Integrated Portal Services</h2><div>{['Member Database','UID Verification','Scout & Guide Units','Patrol Management','Attendance','Tests & Marks','Progression Records','Camps & Activities','Certificates','Reports & Analytics'].map(x=><article><ShieldCheck/><b>{x}</b></article>)}</div></section></main><footer className="public-footer">{SCHOOL} · EDDUMAILARAM · {DIVISION}<br/>Independent school-level Bharat Scouts & Guides Unit Management Portal · 2026</footer></div>;
  if(page==='register')return <div className="register-page"><button className="back-link" onClick={()=>{setPage('home');setSchoolOtpSent(false);}}><ChevronLeft size={16}/> Back to Home</button><div className="panel register-card"><div className="public-logo">OYMS</div><span className="eyebrow">VIDYALAYA ONBOARDING · EMAIL VERIFICATION REQUIRED</span><h1>Register Your Vidyalaya</h1><p>Submit your school details. A one-time password will be sent to the official email address. No Admin login is issued until the Super Admin approves the verified application.</p>{!schoolOtpSent?<form onSubmit={sendSchoolOtp} className="form-grid"><label>Vidyalaya name *<input required value={schoolForm.school_name} onChange={e=>setSchoolForm({...schoolForm,school_name:e.target.value})}/></label><label>KVS Division *<input required value={schoolForm.division} onChange={e=>setSchoolForm({...schoolForm,division:e.target.value})}/></label><label>Affiliation / KV code<input value={schoolForm.affiliation_number} onChange={e=>setSchoolForm({...schoolForm,affiliation_number:e.target.value})}/></label><label>Principal name<input value={schoolForm.principal_name} onChange={e=>setSchoolForm({...schoolForm,principal_name:e.target.value})}/></label><label>Authorised contact person *<input required value={schoolForm.contact_person} onChange={e=>setSchoolForm({...schoolForm,contact_person:e.target.value})}/></label><label>Official email for OTP *<input type="email" required value={schoolForm.email} onChange={e=>setSchoolForm({...schoolForm,email:e.target.value})}/></label><label>Contact mobile<input type="tel" value={schoolForm.mobile} onChange={e=>setSchoolForm({...schoolForm,mobile:e.target.value})}/></label><label className="span-2">Complete Vidyalaya address *<textarea required value={schoolForm.school_address} onChange={e=>setSchoolForm({...schoolForm,school_address:e.target.value})}/></label><div className="span-2 form-actions"><button className="primary-btn" disabled={loading}>{loading?'Sending OTP…':'Send Email OTP'}</button></div></form>:<form onSubmit={verifySchoolOtp} className="form-grid"><div className="span-2 demo-warning"><ShieldCheck size={17}/> OTP sent to {schoolForm.email}. Verify this email before the application is submitted.</div><label className="span-2">6-digit email OTP<input required inputMode="numeric" maxLength="8" autoComplete="one-time-code" value={schoolOtp} onChange={e=>setSchoolOtp(e.target.value)}/></label><div className="span-2 form-actions"><button type="button" className="outline-btn" onClick={()=>setSchoolOtpSent(false)}>Edit details</button><button className="primary-btn" disabled={loading}>{loading?'Verifying…':'Verify Email & Submit Application'}</button></div></form>}<small className="muted">After OTP verification, the Super Admin reviews the Vidyalaya. Only an approved Vidyalaya receives School / Group Admin access. That Admin can then create Unit Leader accounts.</small></div></div>;
  if(loginMode)return <div className="login-page"><button className="back-link" onClick={()=>setLoginMode(false)}><ChevronLeft size={16}/> Back to portal</button><div className="login-card"><div className="public-logo">BSG</div><span className="eyebrow">OYMS 4.0 · SECURE ROLE-BASED ACCESS</span><h1>{labelRole(loginRole)} Login</h1><p>Select your authorised account level. Your actual permissions are determined by the role approved by the Super Admin / School Admin.</p><label>Login portal<select value={loginRole} onChange={e=>{setLoginRole(e.target.value);setLoginOtpSent(false);}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.label} Login</option>)}</select></label>{supabase?<><form onSubmit={signIn}><label>Registered email<input type="email" required value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/></label><label>Password<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Use password or request email OTP"/></label><button className="primary-btn block-btn" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><div className="login-links"><button type="button" onClick={sendOtp} disabled={loading}>Send email OTP</button><button type="button" onClick={recoverPassword} disabled={loading}>Forgot password?</button></div>{loginOtpSent&&<form onSubmit={verifyLoginOtp} className="otp-login-form"><label>Email OTP<input required inputMode="numeric" autoComplete="one-time-code" value={loginOtp} onChange={e=>setLoginOtp(e.target.value)}/></label><button className="primary-btn block-btn" disabled={loading}>{loading?'Verifying…':'Verify OTP & Login'}</button></form>}</>:<div className="demo-warning"><AlertCircle size={17}/> Live login is not enabled yet. Configure Supabase Auth, database migrations and Edge Function secrets. Demo role-switching is disabled so nobody can bypass the approval hierarchy.</div>}</div></div>;
    const pageContent=({dashboard:<Dashboard/>,'school-applications':<SchoolApplications/>,accounts:<Accounts/>,members:<Members/>,uid:<UID/>,units:<Units/>,patrols:<Patrols/>,attendance:<Attendance/>,tests:<Tests/>,progression:<Progression/>,events:<Events/>,notices:<Notices/>,court:<Court/>,logbooks:<Logbooks/>,certificates:<Certificates/>,reports:<Reports/>,profile:<Profile/>,settings:<SettingsPage/>,gallery:<Gallery/>})[page]||<Dashboard/>;
  return <div className="app-shell"><Sidebar/><div className="main-area"><Topbar/><main className="page-content">{notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}{pageContent}</main><footer className="app-footer">{SCHOOL} · {PLACE} · {DIVISION}<span>BSG OYMS 4.0 · 2026</span></footer></div><Modal/></div>;
}
export default App;
