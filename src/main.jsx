import React,{useEffect,useMemo,useState} from "react";
import ReactDOM from "react-dom/client";
import {BookOpen,CalendarCheck2,ChevronRight,ClipboardCheck,Flower2,Heart,LockKeyhole,LogOut,Megaphone,Paperclip,Plus,Send,Sparkles,Upload,Users} from "lucide-react";
import {API_URL,APP_NAME} from "./config";
import "./styles.css";

const demo={
 students:[
  {Id:"1",Name:"Alya",PIN:"1111",Role:"student",Grade:"4 SD"},
  {Id:"2",Name:"Raka",PIN:"2222",Role:"student",Grade:"5 SD"},
  {Id:"3",Name:"Naya",PIN:"3333",Role:"student",Grade:"3 SD"},
  {Id:"4",Name:"Fahri",PIN:"4444",Role:"student",Grade:"6 SD"},
  {Id:"5",Name:"Dina",PIN:"5555",Role:"student",Grade:"4 SD"}
 ],
 attendance:[],materials:[
  {Title:"Perkalian Dasar",Date:"2026-08-31",Content:"Latihan perkalian 2–10. Kerjakan dengan santai dan teliti."},
  {Title:"Mengenal Pecahan",Date:"2026-08-29",Content:"Pahami pembilang dan penyebut melalui contoh sehari-hari."}
 ],assignments:[{Title:"Latihan Matematika",Due:"2026-09-02",Instructions:"Kerjakan 10 soal perkalian di buku."}],
 announcements:[{Title:"Selamat datang di Ruang Belajar",Content:"Jangan lupa isi absensi sebelum belajar ya 🌷",Date:"2026-08-31"}],submissions:[]
};

async function api(action,payload={}){
 if(!API_URL){return localAction(action,payload)}
 const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,...payload})});
 return r.json();
}
function localAction(action,b){
 if(action==="login"){
  const users=[...demo.students,{Id:"teacher",Name:"Guru",PIN:"1234",Role:"teacher"}];
  const u=users.find(x=>x.PIN===b.pin&&(!b.name||x.Name.toLowerCase()===b.name.toLowerCase()));
  return u?{ok:true,user:{id:u.Id,name:u.Name,role:u.Role||"student",grade:u.Grade}}:{ok:false,error:"Nama atau PIN salah. Mode demo: Guru 1234, siswa Alya 1111, Raka 2222, Naya 3333, Fahri 4444, Dina 5555."};
 }
 if(action==="data")return {ok:true,...demo};
 if(action==="attendance"){demo.attendance.unshift({...b,Id:crypto.randomUUID(),Date:new Date().toISOString().slice(0,10)});return {ok:true}};
 if(["material","assignment","announcement","submission"].includes(action)){const key={material:"materials",assignment:"assignments",announcement:"announcements",submission:"submissions"}[action];demo[key].unshift(b);return {ok:true}};
 return {ok:true};
}

function App(){
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("rb_user")||"null"));
 const [page,setPage]=useState("home"),[data,setData]=useState(demo),[loginOpen,setLoginOpen]=useState(false),[notice,setNotice]=useState("");
 const load=async()=>{const r=await api("data");if(r.ok)setData(r)};
 useEffect(()=>{if(user)load()},[user]);
 const login=async(name,pin)=>{const r=await api("login",{name,pin});if(!r.ok){setNotice(r.error);return}setUser(r.user);localStorage.setItem("rb_user",JSON.stringify(r.user));setLoginOpen(false);setPage("dashboard");setNotice("")};
 const logout=()=>{setUser(null);localStorage.removeItem("rb_user");setPage("home")};
 if(!user)return <><Landing onLogin={()=>setLoginOpen(true)}/><LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} onLogin={login} notice={notice}/></>;
 return <Shell user={user} page={page} setPage={setPage} logout={logout}>{page==="dashboard"?<Dashboard user={user} data={data} go={setPage}/>:page==="attendance"?<Attendance user={user} data={data} reload={load}/>:page==="materials"?<Materials user={user} data={data} reload={load}/>:page==="assignments"?<Assignments user={user} data={data} reload={load}/>:page==="announcements"?<Announcements user={user} data={data} reload={load}/>:page==="students"?<Students data={data}/>:null}</Shell>
}

function Landing({onLogin}){
 return <div className="landing">
  <div className="petal p1">✿</div><div className="petal p2">✽</div><div className="petal p3">❀</div><div className="petal p4">✾</div><div className="petal p5">❁</div>
  <nav className="landing-nav"><div className="brand"><div className="brand-logo"><Flower2/></div><div><b>{APP_NAME}</b><span>Belajar dengan hati</span></div></div><button className="ghost-button" onClick={onLogin}><LockKeyhole size={16}/> Masuk</button></nav>
  <main className="hero">
   <div className="hero-copy"><div className="pill"><Sparkles size={14}/> Tempat kecil untuk belajar lebih berarti</div><h1>Belajar tumbuh<br/><i>seperti bunga.</i></h1><p>Ruang sederhana untuk absensi, materi, tugas, dan kabar belajar. Dibuat hangat untuk guru dan murid.</p><button className="hero-button" onClick={onLogin}>Masuk ke Ruang Belajar <ChevronRight size={18}/></button><div className="hero-note"><Heart size={14}/> Dibuat untuk kelas kecil, dengan perhatian yang besar.</div></div>
   <div className="flower-art"><div className="sun"></div><div className="stem s1"></div><div className="stem s2"></div><div className="stem s3"></div><div className="flower f1">✿</div><div className="flower f2">✿</div><div className="flower f3">❀</div><div className="leaf l1"></div><div className="leaf l2"></div><div className="leaf l3"></div></div>
  </main>
  <section className="features"><div><CalendarCheck2/><b>Absensi</b><span>Catat kehadiran dengan mudah.</span></div><div><BookOpen/><b>Materi</b><span>Materi harian selalu rapi.</span></div><div><ClipboardCheck/><b>Tugas</b><span>Belajar dan kumpulkan tugas.</span></div><div><Megaphone/><b>Kabar</b><span>Pengumuman dari guru.</span></div></section>
  <footer>Ruang Belajar · dibuat untuk belajar dengan tenang 🌷</footer>
 </div>
}

function LoginModal({open,onClose,onLogin,notice}){
 const [name,setName]=useState(""),[pin,setPin]=useState("");
 if(!open)return null; return <div className="overlay" onMouseDown={onClose}><div className="login-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-flower">✿</div><h2>Selamat datang</h2><p>Masuk ke ruang belajar kamu.</p>{notice&&<div className="notice">{notice}</div>}<label>Nama</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama murid / Guru"/><label>PIN</label><input value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" type="password" maxLength="8"/><button className="hero-button full" onClick={()=>onLogin(name,pin)}>Masuk <ChevronRight size={17}/></button><button className="link-button" onClick={onClose}>Kembali</button></div></div>
}

function Shell({user,page,setPage,logout,children}){
 const menus=user.role==="teacher"?[["dashboard","Beranda",Flower2],["attendance","Absensi",CalendarCheck2],["students","Murid",Users],["materials","Materi",BookOpen],["assignments","Tugas",ClipboardCheck],["announcements","Pengumuman",Megaphone]]:[["dashboard","Beranda",Flower2],["attendance","Absensi",CalendarCheck2],["materials","Materi",BookOpen],["assignments","Tugas",ClipboardCheck],["announcements","Pengumuman",Megaphone]];
 return <div className="app"><aside><div className="brand dark"><div className="brand-logo"><Flower2/></div><div><b>{APP_NAME}</b><span>Belajar dengan hati</span></div></div><nav>{menus.map(([id,l,I])=><button className={page===id?"sel":""} onClick={()=>setPage(id)} key={id}><I size={17}/>{l}</button>)}</nav><div className="side-bottom"><div className="user-mini"><div className="avatar">{user.name[0]}</div><div><b>{user.name}</b><span>{user.role==="teacher"?"Guru":"Murid"}</span></div></div><button onClick={logout}><LogOut size={16}/> Keluar</button></div></aside><main className="content"><header className="mobile-brand"><div className="brand"><div className="brand-logo"><Flower2/></div><b>{APP_NAME}</b></div></header>{children}</main></div>
}

function Head({eyebrow,title,text,action}){return <div className="page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>}

function Dashboard({user,data,go}){
 const att=user.role==="teacher"?data.attendance:data.attendance.filter(x=>x.Name===user.name);
 const present=att.filter(x=>x.Status==="present"||x.Status==="Hadir").length;
 return <><Head eyebrow="Ruang Belajar" title={`Halo, ${user.name.split(" ")[0]} 🌷`} text={user.role==="teacher"?"Semoga kegiatan belajar hari ini berjalan menyenangkan.":"Senang melihatmu kembali. Yuk belajar sedikit demi sedikit."}/><div className="quote-card"><div><span>CATATAN HARI INI</span><h2>“Setiap halaman baru adalah kesempatan untuk tumbuh.”</h2></div><div className="quote-flower">❀</div></div><div className="stats">{(user.role==="teacher"?[[Users,data.students.length,"Murid","students"],[CalendarCheck2,present,"Hadir","attendance"],[BookOpen,data.materials.length,"Materi","materials"],[ClipboardCheck,data.assignments.length,"Tugas","assignments"]]:[[CalendarCheck2,present,"Hadir","attendance"],[BookOpen,data.materials.length,"Materi","materials"],[ClipboardCheck,data.assignments.length,"Tugas","assignments"],[Megaphone,data.announcements.length,"Pengumuman","announcements"]]).map(([I,v,l,p])=><button onClick={()=>go(p)} className="stat" key={l}><I/><span>{l}</span><b>{v}</b></button>)}</div><div className="grid2"><section className="panel"><div className="panel-title"><div><h2>Materi terbaru</h2><span>Belajar hari ini dengan santai.</span></div><button onClick={()=>go("materials")}>Lihat →</button></div>{data.materials.slice(0,3).map((m,i)=><div className="row" key={i}><div className="round-icon"><BookOpen size={17}/></div><div><b>{m.Title||m.title}</b><span>{m.Content||m.content}</span></div></div>)}</section><section className="panel"><div className="panel-title"><div><h2>Pengumuman</h2><span>Pesan dari guru.</span></div><button onClick={()=>go("announcements")}>Lihat →</button></div>{data.announcements.slice(0,3).map((m,i)=><div className="row" key={i}><div className="round-icon"><Megaphone size={17}/></div><div><b>{m.Title||m.title}</b><span>{m.Content||m.content}</span></div></div>)}</section></div></>
}

function Attendance({user,data,reload}){
 const [status,setStatus]=useState("present"),[note,setNote]=useState(""),[photo,setPhoto]=useState(null),[sent,setSent]=useState(false);
 const mine=user.role==="teacher"?data.attendance:data.attendance.filter(x=>x.Name===user.name);
 const submit=async()=>{const b={name:user.name,status,note,photo:photo?await fileToBase64(photo):null};const r=await api("attendance",b);if(r.ok){setSent(true);setNote("");setPhoto(null);reload()}};
 return <><Head eyebrow="Kehadiran" title="Absensi" text={user.role==="teacher"?"Pantau kehadiran semua murid.":"Catat kehadiranmu hari ini."}/>{user.role==="student"&&<section className="panel form-panel"><h2>Bagaimana kabarmu hari ini?</h2><div className="choice-grid">{[["present","Hadir","Saya mengikuti belajar."],["sick","Sakit","Saya sedang sakit."],["permission","Izin","Saya berhalangan hadir."],["absent","Alpa","Saya tidak hadir."]].map(x=><button className={status===x[0]?"choice active":"choice"} onClick={()=>setStatus(x[0])} key={x[0]}><span className={"dot "+x[0]}></span><b>{x[1]}</b><small>{x[2]}</small></button>)}</div><label>Catatan</label><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Tulis keterangan bila perlu..." rows="3"/>{status!=="present"&&<label className="photo-input"><Upload size={18}/><span>{photo?photo.name:"Upload bukti foto (opsional)"}</span><input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>}<button className="hero-button" onClick={submit}><Send size={17}/> Simpan absensi</button>{sent&&<div className="success">Absensi tersimpan 🌷</div>}</section>}<section className="panel"><div className="panel-title"><div><h2>Riwayat</h2><span>Catatan kehadiran terbaru.</span></div></div><div className="table"><div className="tr th"><span>Nama</span><span>Tanggal</span><span>Status</span><span>Catatan</span></div>{mine.slice(0,30).map((a,i)=><div className="tr" key={i}><span>{a.Name||a.name}</span><span>{a.Date||a.date||"-"}</span><span><em className={"badge "+(a.Status||a.status)}>{labelStatus(a.Status||a.status)}</em></span><span>{a.Note||a.note||"-"}</span></div>)}{!mine.length&&<div className="empty">Belum ada absensi.</div>}</div></section></>
}

function Materials({user,data,reload}){return <CrudPage type="material" user={user} data={data} reload={reload} title="Materi harian" eyebrow="Pembelajaran" text="Materi dibuat rapi agar mudah dibaca kapan saja." icon={BookOpen} fields={["Title","Content","Date"]} rows={data.materials}/>}

function Assignments({user,data,reload}){return <CrudPage type="assignment" user={user} data={data} reload={reload} title="Tugas" eyebrow="Pembelajaran" text="Sedikit latihan setiap hari membuatmu makin hebat." icon={ClipboardCheck} fields={["Title","Instructions","Due"]} rows={data.assignments}/>}

function Announcements({user,data,reload}){return <CrudPage type="announcement" user={user} data={data} reload={reload} title="Pengumuman" eyebrow="Kabar" text="Pesan penting dari guru untuk kelas." icon={Megaphone} fields={["Title","Content","Date"]} rows={data.announcements}/>}

function CrudPage({type,user,data,reload,title,eyebrow,text,icon:Icon,fields,rows}){
 const [open,setOpen]=useState(false),[form,setForm]=useState({});
 const save=async()=>{const r=await api(type,form);if(r.ok){setOpen(false);setForm({});reload()}};
 return <><Head eyebrow={eyebrow} title={title} text={text} action={user.role==="teacher"&&<button className="hero-button" onClick={()=>setOpen(true)}><Plus size={17}/> Tambah</button>}/><div className="cards">{rows.map((r,i)=><article className="info-card" key={i}><div className="info-icon"><Icon size={20}/></div><div><span className="eyebrow">{r.Date||r.Due||"Ruang Belajar"}</span><h2>{r.Title||r.title}</h2><p>{r.Content||r.Instructions||r.content||r.instructions}</p></div></article>)}{!rows.length&&<div className="panel empty">Belum ada data.</div>}</div>{open&&<div className="overlay" onMouseDown={()=>setOpen(false)}><div className="login-modal wide" onMouseDown={e=>e.stopPropagation()}><div className="modal-flower">✿</div><h2>Tambah {title}</h2>{fields.map(f=><div key={f}><label>{pretty(f)}</label>{f==="Content"||f==="Instructions"?<textarea rows="5" value={form[f]||""} onChange={e=>setForm({...form,[f]:e.target.value})}/>:<input type={f==="Date"?"date":f==="Due"?"datetime-local":"text"} value={form[f]||""} onChange={e=>setForm({...form,[f]:e.target.value})}/>}</div>)}<button className="hero-button full" onClick={save}>Simpan <Send size={16}/></button></div></div>}</>
}

function Students({data}){return <><Head eyebrow="Kelas" title="Murid" text="Lima kursi kecil, lima perjalanan belajar yang berbeda."/><div className="student-grid">{data.students.map(s=><article className="student-card" key={s.Id}><div className="avatar big">{s.Name[0]}</div><div><h2>{s.Name}</h2><p>{s.Grade||"Murid SD"}</p><span>PIN: ••••</span></div></article>)}</div></>}

function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const [head,data]=r.result.split(",");resolve({name:file.name,type:file.type,data})};r.onerror=reject;r.readAsDataURL(file)})}
function labelStatus(x){return ({present:"Hadir",sick:"Sakit",permission:"Izin",absent:"Alpa",Hadir:"Hadir",Sakit:"Sakit",Izin:"Izin",Alpa:"Alpa"}[x]||x)}
function pretty(x){return ({Title:"Judul",Content:"Isi",Instructions:"Instruksi",Date:"Tanggal",Due:"Deadline"}[x]||x)}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);