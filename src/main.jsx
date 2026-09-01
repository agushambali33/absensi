import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen, CalendarCheck2, ChevronRight, Flower2, Heart,
  LockKeyhole, LogOut, Megaphone, Plus, Send, Sparkles, Upload, Users,
  MessageCircle, Eye, User, CreditCard, Award, Camera, Edit3, Loader2, Home
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

const demo = {
  students: [
    { Id: "1", Name: "Alya", PIN: "1111", Role: "student", Grade: "4 SD", Price: "150000", Hobby: "Membaca Buku", Photo: "" },
  ],
  attendance: [],
  materials: [],
  announcements: [{ Title: "Selamat datang", Content: "Jangan lupa isi absensi ya 🌷", Date: "2026-08-31" }],
  evaluations: [],
  payments: [],
};

async function api(action, payload = {}) {
  if (!API_URL || API_URL.trim() === "") return localAction(action, payload);
  try {
    const r = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, ...payload }) });
    const text = await r.text();
    try { return JSON.parse(text); } catch (e) { return { ok: false, error: "Gagal membaca data." }; }
  } catch (error) { return { ok: false, error: "Koneksi terputus." }; }
}

function localAction(action, b) {
  if (action === "login") {
    const users = [...demo.students, { Id: "teacher", Name: "Guru", PIN: "1234", Role: "teacher" }];
    const u = users.find(x => x.PIN === b.pin && (!b.name || x.Name.toLowerCase() === b.name.toLowerCase()));
    return u ? { ok: true, user: u } : { ok: false, error: "Nama atau PIN salah." };
  }
  if (action === "data") return { ok: true, ...demo };
  return { ok: true };
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file);
});

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("rb_user") || "null"));
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || (user ? "dashboard" : "home"));
  const [data, setData] = useState(demo);
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const load = async () => { const r = await api("data"); if (r.ok) setData(r); };

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => {
    const handleHash = () => setPage(window.location.hash.replace("#", "") || (user ? "dashboard" : "home"));
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [user]);

  const login = async (name, pin) => {
    setLoadingLogin(true); setNotice("");
    const r = await api("login", { name, pin });
    setLoadingLogin(false);
    if (!r.ok) return setNotice(r.error);
    
    // PENGAMAN ROLE GURU (Pastikan terdeteksi sebagai teacher jika namanya Guru atau rolenya teacher/admin)
    let loggedUser = r.user;
    const roleStr = String(loggedUser.Role || loggedUser.role || "").toLowerCase();
    const nameStr = String(loggedUser.Name || loggedUser.name || "").toLowerCase();
    if (nameStr === "guru" || roleStr.includes("teach") || roleStr.includes("admin")) {
      loggedUser.role = "teacher";
    } else {
      loggedUser.role = "student";
    }

    setUser(loggedUser); 
    localStorage.setItem("rb_user", JSON.stringify(loggedUser));
    setLoginOpen(false); window.location.hash = "dashboard"; setNotice("");
  };

  const logout = () => { setUser(null); localStorage.removeItem("rb_user"); window.location.hash = ""; setPage("home"); };
  const go = (p) => { window.location.hash = p; setPage(p); };

  if (!user) return <><Landing onLogin={() => setLoginOpen(true)} /><LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} notice={notice} loading={loadingLogin} /></>;

  return (
    <Shell user={user} page={page} setPage={go} logout={logout}>
      {page === "dashboard" ? <Dashboard user={user} data={data} go={go} /> :
       page === "profile" ? <Profile user={user} reload={load} setUser={setUser} /> :
       page === "attendance" ? <Attendance user={user} data={data} reload={load} /> :
       page === "materials" ? <Materials user={user} data={data} reload={load} /> :
       page === "evaluations" ? <Evaluations user={user} data={data} reload={load} /> :
       page === "payments" ? <Payments user={user} data={data} reload={load} /> :
       page === "announcements" ? <Announcements user={user} data={data} reload={load} /> :
       page === "students" ? <Students data={data} /> : null}
    </Shell>
  );
}

function Landing({ onLogin }) {
  return (
    <div className="landing">
      <div className="petal p1">✿</div><div className="petal p2">✽</div><div className="petal p3">❀</div><div className="petal p4">✾</div><div className="petal p5">❁</div>
      <nav className="landing-nav">
        <div className="brand"><div className="brand-logo"><Flower2/></div><div><b>{APP_NAME}</b><span>Belajar dengan hati</span></div></div>
        <button className="ghost-button" onClick={onLogin}><LockKeyhole size={16}/> Masuk</button>
      </nav>
      <main className="hero">
        <div className="hero-copy">
          <div className="pill"><Sparkles size={14}/> Tempat kecil untuk belajar lebih berarti</div>
          <h1>Belajar tumbuh<br/><i>seperti bunga.</i></h1>
          <p>Ruang sederhana untuk absensi, materi, tugas, dan kabar belajar. Dibuat hangat untuk guru dan murid.</p>
          <button className="hero-button" onClick={onLogin}>Masuk ke Ruang Belajar <ChevronRight size={18}/></button>
          <div className="hero-note"><Heart size={14}/> Dibuat untuk kelas kecil, dengan perhatian yang besar.</div>
        </div>
      </main>
      <footer>Dibuat dengan cinta oleh Adelia Ardabela ❤️</footer>
    </div>
  );
}

function LoginModal({ open, onClose, onLogin, notice, loading }) {
  const [name, setName] = useState(""); const [pin, setPin] = useState("");
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={!loading ? onClose : undefined}>
      <div className="login-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-flower">✿</div>
        <h2>Selamat datang</h2>
        <p>Masuk ke ruang belajar kamu.</p>
        {notice && <div className="notice">{notice}</div>}
        <label>Nama (Murid / Guru)</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Alya atau Guru" disabled={loading} />
        <label>PIN</label>
        <input value={pin} onChange={e => setPin(e.target.value)} placeholder="••••" type="password" maxLength="8" disabled={loading} />
        <button className="hero-button full" onClick={() => onLogin(name, pin)} disabled={loading} style={{display:'flex', justifyContent:'center', gap:'8px'}}>
          {loading ? "Memeriksa..." : <>Masuk <ChevronRight size={17} /></>}
        </button>
        {!loading && <button className="link-button" onClick={onClose}>Kembali</button>}
      </div>
    </div>
  );
}

// --- SHELL UTAMA DENGAN BOTTOM NAV BAR UNTUK HP (MOBILE FRIENDLY) ---
function Shell({ user, page, setPage, logout, children }) {
  const isTeacher = user.role === "teacher";
  const menus = isTeacher
    ? [["dashboard", "Beranda", Home], ["attendance", "Absen", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi", Award], ["students", "Murid", Users]]
    : [["dashboard", "Beranda", Home], ["attendance", "Absen", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Pesan", Award], ["profile", "Profil", User]];

  return (
    <div className="app" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      {/* Sidebar untuk Desktop */}
      <aside className="desktop-sidebar" style={{display: window.innerWidth > 768 ? 'flex' : 'none'}}>
        <div className="brand dark">
          <div className="brand-logo"><Flower2 /></div>
          <div><b>{APP_NAME}</b><span>Belajar dengan hati</span></div>
        </div>
        <nav style={{flex: 1}}>
          {(isTeacher
            ? [["dashboard", "Beranda", Flower2], ["profile", "Profil", User], ["attendance", "Absensi", CalendarCheck2], ["students", "Murid", Users], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi", Award], ["payments", "Paket", CreditCard], ["announcements", "Kabar", Megaphone]]
            : [["dashboard", "Beranda", Flower2], ["profile", "Profil Kamu", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Pesan Guru", Award], ["payments", "Paket", CreditCard], ["announcements", "Kabar", Megaphone]]
          ).map(([id, l, I]) => (
            <button className={page === id ? "sel" : ""} onClick={() => setPage(id)} key={id}>
              <I size={17} />{l}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="user-mini">
            {user.Photo ? <img src={user.Photo} style={{width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover'}}/> : <div className="avatar">{(user.Name || user.name)[0].toUpperCase()}</div>}
            <div><b>{user.Name || user.name}</b><span>{isTeacher ? "Guru" : "Murid"}</span></div>
          </div>
          <button onClick={logout}><LogOut size={16} /> Keluar</button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="content" style={{flex: 1, paddingBottom: '90px'}}>
        <header className="mobile-brand" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#fff', borderBottom: '1px solid #f0e6e0'}}>
          <div className="brand" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div className="brand-logo"><Flower2 /></div>
            <b>{APP_NAME}</b>
          </div>
          <button onClick={logout} style={{background: '#ffeeee', color: '#c53030', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'}}>Keluar</button>
        </header>

        <div style={{padding: '20px'}}>
          {children}
        </div>

        <div style={{textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#a89f91'}}>
           Dibuat dengan cinta oleh Adelia Ardabela ❤️
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR (Menu Bawah Khusus HP agar tidak blank) */}
      <nav className="mobile-bottom-nav" style={{
        display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: '#ffffff', borderTop: '1px solid #f0e6e0', padding: '10px 5px', 
        justifyContent: 'around', zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        {menus.map(([id, l, I]) => (
          <button key={id} onClick={() => setPage(id)} style={{
            flex: 1, background: 'none', border: 'none', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', gap: '4px',
            color: page === id ? '#d28a7e' : '#a89f91', fontSize: '11px', fontWeight: page === id ? 'bold' : 'normal'
          }}>
            <I size={20} />
            <span>{l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Head({ eyebrow, title, text, action }) {
  return (
    <div className="page-head" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>
      {action}
    </div>
  );
}

function Dashboard({ user, data, go }) {
  const userName = user.Name || user.name;
  const isTeacher = user.role === "teacher";
  const att = isTeacher ? (data?.attendance||[]) : (data?.attendance||[]).filter(x => (x.Name||x.name) === userName);
  const present = att.filter(x => x.Status === "present" || x.Status === "Hadir").length;

  return (
    <>
      <Head eyebrow="Ruang Belajar" title={`Halo, ${userName.split(" ")[0]} 🌷`} text={isTeacher ? "Mode Guru Aktif. Silakan kelola kelas hari ini." : "Senang melihatmu kembali. Yuk belajar sedikit demi sedikit."} />
      <div className="quote-card">
        <div><span>CATATAN HARI INI</span><h2>“Setiap halaman baru adalah kesempatan untuk tumbuh.”</h2></div>
        <div className="quote-flower">❀</div>
      </div>
      <div className="stats">
        {(isTeacher
          ? [[Users, data?.students?.length||0, "Murid", "students"], [CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length||0, "Materi", "materials"], [Award, data?.evaluations?.length||0, "Evaluasi", "evaluations"]]
          : [[CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length||0, "Materi", "materials"], [Award, (data?.evaluations||[]).filter(e=>e.Student===userName).length, "Pesan", "evaluations"], [Megaphone, data?.announcements?.length||0, "Kabar", "announcements"]]
        ).map(([I, v, l, p]) => (
          <button onClick={() => go(p)} className="stat" key={l}><I /><span>{l}</span><b>{v}</b></button>
        ))}
      </div>
    </>
  );
}

function Profile({ user, reload, setUser }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ hobby: user.Hobby || "", photo: user.Photo || "" });
  const [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;

  const save = async () => {
    setLoading(true);
    await api("updateProfile", { name: userName, hobby: form.hobby, photo: form.photo });
    setUser({...user, Hobby: form.hobby, Photo: form.photo});
    setLoading(false); setOpen(false); reload();
  };

  return (
    <>
      <Head eyebrow="Personal" title="Profil Kamu" text="Ruang untuk dirimu sendiri." />
      <div className="panel" style={{textAlign: 'center', padding: '30px 15px'}}>
        <div style={{width:'90px', height:'90px', margin:'0 auto 15px', borderRadius:'50%', backgroundColor:'#f8eee4', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', fontSize:'36px', color:'#d28a7e', border:'4px solid white', boxShadow:'0 4px 12px rgba(0,0,0,0.05)'}}>
           {user.Photo ? <img src={user.Photo} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : userName[0].toUpperCase()}
        </div>
        <h2 style={{fontSize: '22px', margin: '0 0 5px 0'}}>{userName}</h2>
        <span className="badge" style={{marginBottom: '20px', display:'inline-block'}}>{user.role === 'teacher' ? 'Guru' : `Siswa ${user.Grade||''}`}</span>
        
        {user.role === 'student' && (
          <div style={{display:'flex', justifyContent:'center', gap:'15px', margin:'20px 0'}}>
            <div style={{background:'#fcfaf8', padding:'12px', borderRadius:'15px', border:'1px solid #f4ece4', flex:1}}>
              <span style={{fontSize:'10px', color:'#a89f91', textTransform:'uppercase'}}>Hobi</span>
              <div style={{fontWeight:'bold', color:'#5a4e47', fontSize:'14px'}}>{user.Hobby || 'Belum diisi'}</div>
            </div>
            <div style={{background:'#fcfaf8', padding:'12px', borderRadius:'15px', border:'1px solid #f4ece4', flex:1}}>
              <span style={{fontSize:'10px', color:'#a89f91', textTransform:'uppercase'}}>Paket</span>
              <div style={{fontWeight:'bold', color:'#5a4e47', fontSize:'14px'}}>Rp {user.Price || 0}</div>
            </div>
          </div>
        )}
        <button className="hero-button" onClick={() => setOpen(true)} style={{marginTop:'10px'}}><Edit3 size={16}/> Edit Profil</button>
      </div>

      {open && (
        <div className="overlay" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-flower">✿</div>
            <h2>Edit Profil</h2>
            <label>Upload Foto</label>
            <input type="file" accept="image/*" onChange={async (e) => { if(e.target.files[0]) setForm({...form, photo: await fileToBase64(e.target.files[0])})}} />
            <label>Hobi / Cita-cita</label>
            <input value={form.hobby} onChange={e => setForm({...form, hobby: e.target.value})} placeholder="Misal: Membaca" />
            <button className="hero-button full" onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Profil"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Attendance({ user, data, reload }) {
  const [status, setStatus] = useState("Hadir"), [note, setNote] = useState(""), [photo, setPhoto] = useState(null), [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;
  const mine = user.role === "teacher" ? (data?.attendance||[]) : (data?.attendance||[]).filter(x => (x.Name||x.name) === userName);

  const submit = async () => {
    setLoading(true);
    const r = await api("attendance", { name: userName, status, note, photo: photo ? await fileToBase64(photo) : null });
    setLoading(false);
    if (r.ok) { setSent(true); setNote(""); setPhoto(null); reload(); }
  };

  return (
    <>
      <Head eyebrow="Kehadiran" title="Absensi" text={user.role === "teacher" ? "Pantau kehadiran semua murid." : "Catat kehadiranmu hari ini."} />
      {user.role === "student" && (
        <section className="panel form-panel">
          <h2>Bagaimana kabarmu hari ini?</h2>
          <div className="choice-grid">
            {[["Hadir", "Hadir", "Saya mengikuti belajar."], ["Sakit", "Sakit", "Saya sedang sakit."], ["Izin", "Izin", "Saya berhalangan hadir."], ["Alpa", "Alpa", "Saya tidak hadir."]].map(x => (
              <button className={status === x[0] ? "choice active" : "choice"} onClick={() => setStatus(x[0])} key={x[0]}>
                <span className={"dot " + (x[0]==='Hadir'?'present':x[0]==='Sakit'?'sick':x[0]==='Izin'?'permission':'absent')}></span>
                <b>{x[1]}</b><small>{x[2]}</small>
              </button>
            ))}
          </div>
          <label>Catatan Tambahan</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Tulis pesan untuk bu guru..." rows="2" />
          <label className="photo-input">
            <Upload size={18} /><span>{photo ? photo.name : "Upload bukti foto (opsional)"}</span>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
          </label>
          <button className="hero-button" onClick={submit} disabled={loading}>{loading ? "Menyimpan..." : <><Send size={17} /> Simpan absensi</>}</button>
          {sent && <div className="success">Absensi tersimpan 🌷 Semangat belajarnya ya!</div>}
        </section>
      )}
      <section className="panel">
        <div className="panel-title"><div><h2>Riwayat</h2><span>Catatan kehadiran terbaru.</span></div></div>
        <div className="table">
          <div className="tr th"><span>Nama</span><span>Tanggal</span><span>Status</span><span>Catatan</span></div>
          {mine.slice(0, 30).map((a, i) => (
            <div className="tr" key={i}>
              <span>{a.Name || a.name}</span><span>{a.Date || a.date?.substring(0,10) || "-"}</span>
              <span><em className={"badge " + (a.Status==='Hadir'||a.status==='Hadir'?'present':a.Status==='Sakit'?'sick':'permission')}>{a.Status || a.status}</em></span>
              <span>{a.Note || a.note || "-"}</span>
            </div>
          ))}
          {!mine.length && <div className="empty">Belum ada absensi.</div>}
        </div>
      </section>
    </>
  );
}

function Materials({ user, data, reload }) {
  const [openAdd, setOpenAdd] = useState(false), [form, setForm] = useState({}), [photo, setPhoto] = useState(null), [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null), [comment, setComment] = useState("");
  const userName = user.Name || user.name;
  const rows = data?.materials || [];

  const openMat = async (m) => {
    setSelected(m);
    if(user.role === 'student' && !(m.Viewers||[]).includes(userName)) {
      await api("markRead", {id: m.Id, name: userName}); reload();
    }
  };

  const save = async () => {
    setLoading(true);
    await api("material", { Id: "m_"+Date.now(), Title: form.Title, Content: form.Content, Date: new Date().toISOString().split('T')[0], Photo: photo, Viewers: [], Comments: [] });
    setLoading(false); setOpenAdd(false); setForm({}); setPhoto(null); reload();
  };

  const sendKomen = async () => {
    if(!comment.trim()) return;
    await api("comment", {id: selected.Id, name: userName, text: comment});
    setSelected({...selected, Comments: [...(selected.Comments||[]), {name: userName, text: comment, time: "Baru saja"}]});
    setComment(""); reload();
  };

  return (
    <>
      <Head eyebrow="Pembelajaran" title="Materi Harian" text="Materi dibuat rapi agar mudah dibaca." action={user.role === "teacher" && <button className="hero-button" onClick={() => setOpenAdd(true)}><Plus size={17} /> Buat Materi</button>} />
      <div className="cards">
        {rows.map((r, i) => {
          const isUnread = user.role === 'student' && !(r.Viewers||[]).includes(userName);
          return (
            <article className="info-card" key={i} onClick={() => openMat(r)} style={{cursor: 'pointer', position:'relative'}}>
              {isUnread && <div style={{position:'absolute', top:'15px', right:'15px', background:'#d28a7e', color:'white', fontSize:'10px', padding:'2px 8px', borderRadius:'10px'}}>Baru</div>}
              <div className="info-icon"><BookOpen size={20} /></div>
              <div>
                <span className="eyebrow">{r.Date}</span><h2>{r.Title}</h2><p style={{WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{r.Content}</p>
                <div style={{marginTop:'10px', fontSize:'11px', color:'#a89f91', display:'flex', gap:'15px'}}>
                  <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Users size={12}/> {(r.Viewers||[]).length} Dibaca</span>
                  <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MessageCircle size={12}/> {(r.Comments||[]).length} Komen</span>
                </div>
              </div>
            </article>
          )
        })}
        {!rows.length && <div className="panel empty">Belum ada materi.</div>}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="login-modal wide" style={{maxHeight:'85vh', overflowY:'auto', padding:'0'}} onClick={e => e.stopPropagation()}>
            {selected.Photo && <img src={selected.Photo} style={{width:'100%', height:'200px', objectFit:'cover', borderTopLeftRadius:'24px', borderTopRightRadius:'24px'}}/>}
            <div style={{padding: '30px'}}>
              <span className="badge">{selected.Date}</span>
              <h2 style={{fontSize:'24px', margin:'10px 0 20px 0'}}>{selected.Title}</h2>
              <div style={{whiteSpace:'pre-line', lineHeight:'1.6', color:'#5a4e47'}}>{selected.Content}</div>
              
              <hr style={{border:'none', borderTop:'1px dashed #f0e6e0', margin:'30px 0'}}/>
              <h3 style={{fontSize:'16px', marginBottom:'15px'}}>Ruang Diskusi</h3>
              
              <div style={{display:'flex', flexDirection:'column', gap:'15px', marginBottom:'20px'}}>
                {(selected.Comments||[]).map((c, i) => (
                  <div key={i} style={{display:'flex', gap:'10px'}}>
                    <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#f8eee4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#d28a7e', fontWeight:'bold'}}>{c.name[0]}</div>
                    <div style={{background:'#fcfaf8', padding:'10px 15px', borderRadius:'15px', border:'1px solid #f4ece4', flex:1}}>
                      <div style={{fontSize:'12px', fontWeight:'bold', color:'#5a4e47'}}>{c.name} <span style={{fontSize:'9px', color:'#a89f91', fontWeight:'normal'}}>{c.time}</span></div>
                      <div style={{fontSize:'13px', color:'#776c65', marginTop:'2px'}}>{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:'10px'}}>
                <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tulis pesan..." style={{flex:1, border:'1px solid #f0e6e0', borderRadius:'20px', padding:'10px 15px', outline:'none'}} onKeyDown={e => e.key === 'Enter' && sendKomen()} />
                <button className="hero-button" onClick={sendKomen} style={{padding:'10px 20px'}}><Send size={14}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openAdd && (
        <div className="overlay" onMouseDown={() => !loading && setOpenAdd(false)}>
          <div className="login-modal wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-flower">✿</div>
            <h2>Buat Materi</h2>
            <label>Judul Materi</label>
            <input value={form.Title||""} onChange={e => setForm({...form, Title: e.target.value})} />
            <label>Penjelasan Materi</label>
            <textarea rows="4" value={form.Content||""} onChange={e => setForm({...form, Content: e.target.value})} />
            <label>Foto Pendukung (Opsional)</label>
            <input type="file" accept="image/*" onChange={async e => { if(e.target.files[0]) setPhoto(await fileToBase64(e.target.files[0])) }} />
            <button className="hero-button full" onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Posting Materi"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Evaluations({ user, data, reload }) {
  const [open, setOpen] = useState(false), [form, setForm] = useState({}), [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;
  const rows = user.role === 'teacher' ? (data?.evaluations||[]) : (data?.evaluations||[]).filter(r => r.Student === userName);

  const save = async () => {
    if(!form.Student || !form.Note) return alert("Pilih siswa dan isi catatan!");
    setLoading(true); await api("evaluation", form); setLoading(false); setOpen(false); reload();
  };

  return (
    <>
      <Head eyebrow="Evaluasi" title="Catatan Belajar" text="Pesan dan catatan khusus untuk murid tercinta." action={user.role === "teacher" && <button className="hero-button" onClick={() => setOpen(true)}><Plus size={17} /> Beri Catatan</button>} />
      <div className="cards">
        {rows.map((r, i) => (
          <article className="info-card" key={i}>
            <div className="info-icon"><Award size={20} /></div>
            <div>
              <span className="eyebrow">{r.Date}</span>
              <h2>{r.Student}</h2>
              <p>{r.Note}</p>
            </div>
          </article>
        ))}
        {!rows.length && <div className="panel empty">Belum ada catatan evaluasi.</div>}
      </div>

      {open && (
        <div className="overlay" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-flower">✿</div>
            <h2>Beri Evaluasi</h2>
            <label>Pilih Siswa</label>
            <select style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #f0e6e0', marginBottom:'15px', color:'#5a4e47'}} onChange={e => setForm({...form, Student: e.target.value})}>
              <option value="">-- Pilih --</option>
              {(data?.students||[]).map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
            </select>
            <label>Catatan Guru</label>
            <textarea rows="4" onChange={e => setForm({...form, Note: e.target.value})} placeholder="Pesan positif untuk murid..." />
            <button className="hero-button full" onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Kirim Catatan"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Payments({ user, data, reload }) {
  const userName = user.Name || user.name;
  const rows = user.role === 'teacher' ? (data?.payments||[]) : (data?.payments||[]).filter(r => r.Student === userName);
  const [open, setOpen] = useState(false), [form, setForm] = useState({}), [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true); await api("payment", form); setLoading(false); setOpen(false); reload();
  };

  return (
    <>
      <Head eyebrow="Administrasi" title="Info Paket" text="Riwayat pembayaran paket bimbingan." action={user.role === "teacher" && <button className="hero-button" onClick={() => setOpen(true)}><Plus size={17} /> Tambah Data</button>} />
      <div className="cards">
        {rows.map((r, i) => (
          <article className="info-card" key={i}>
            <div className="info-icon"><CreditCard size={20} /></div>
            <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
              <div><span className="eyebrow">{r.Date}</span><h2>{r.Student}</h2></div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:'bold', color:'#8b7355', fontSize:'16px'}}>Rp {r.Amount}</div>
                <span className="badge">{r.Status}</span>
              </div>
            </div>
          </article>
        ))}
        {!rows.length && <div className="panel empty">Belum ada data pembayaran.</div>}
      </div>
      {open && (
        <div className="overlay" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-flower">✿</div>
            <h2>Catat Pembayaran</h2>
            <label>Siswa</label>
            <select style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #f0e6e0', marginBottom:'15px'}} onChange={e => setForm({...form, Student: e.target.value})}>
              <option value="">-- Pilih --</option>
              {(data?.students||[]).map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
            </select>
            <label>Nominal (Misal: 150000)</label>
            <input type="number" onChange={e => setForm({...form, Amount: e.target.value})} />
            <label>Status</label>
            <input placeholder="Misal: Lunas" onChange={e => setForm({...form, Status: e.target.value})} />
            <button className="hero-button full" onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Data"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Announcements({ user, data, reload }) {
  const [open, setOpen] = useState(false), [form, setForm] = useState({}), [loading, setLoading] = useState(false);
  const save = async () => {
    setLoading(true); await api("announcement", { ...form, Date: new Date().toISOString().split('T')[0] }); setLoading(false); setOpen(false); reload();
  };

  return (
    <>
      <Head eyebrow="Kabar" title="Pengumuman" text="Pesan penting dari guru untuk kelas." action={user.role === "teacher" && <button className="hero-button" onClick={() => setOpen(true)}><Plus size={17} /> Kabar Baru</button>} />
      <div className="cards">
        {(data?.announcements||[]).map((r, i) => (
          <article className="info-card" key={i}>
            <div className="info-icon"><Megaphone size={20} /></div>
            <div><span className="eyebrow">{r.Date}</span><h2>{r.Title}</h2><p>{r.Content}</p></div>
          </article>
        ))}
        {!(data?.announcements||[]).length && <div className="panel empty">Belum ada kabar.</div>}
      </div>
      {open && (
        <div className="overlay" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-flower">✿</div>
            <h2>Buat Pengumuman</h2>
            <label>Judul</label><input onChange={e => setForm({...form, Title: e.target.value})} />
            <label>Isi Kabar</label><textarea rows="3" onChange={e => setForm({...form, Content: e.target.value})} />
            <button className="hero-button full" onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Kirim Kabar"}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Students({ data }) {
  return (
    <>
      <Head eyebrow="Kelas" title="Murid" text="Daftar seluruh siswa aktif." />
      <div className="student-grid">
        {(data?.students||[]).map(s => (
          <article className="student-card" key={s.Id}>
            <div className="avatar big">{s.Photo ? <img src={s.Photo} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}}/> : s.Name[0]}</div>
            <div><h2>{s.Name}</h2><p>{s.Grade || "Murid SD"}</p><span style={{background:'#fcfaf8', color:'#8b7355', fontSize:'11px', padding:'2px 6px', borderRadius:'6px'}}>PIN: {s.PIN}</span></div>
          </article>
        ))}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
