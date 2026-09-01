import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen, CalendarCheck2, ChevronRight, Flower2, LockKeyhole,
  LogOut, Megaphone, Plus, Send, Sparkles, Upload, Users,
  Loader2, X, Moon, Sun, Clock, User, CreditCard, Award,
  CheckCircle2, MessageCircle, Image as ImageIcon, Camera, Edit3, Bell
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

// Data Demo Awal
const demo = {
  students: [
    { Id: "1", Name: "Alya", PIN: "1111", Role: "student", Grade: "4 SD", Price: "150000", Hobby: "Membaca Buku", Photo: "" },
    { Id: "2", Name: "Fahri", PIN: "2222", Role: "student", Grade: "5 SD", Price: "200000", Hobby: "Bermain Catur", Photo: "" }
  ],
  attendance: [],
  materials: [
    { 
      Id: "m1", Title: "Perkalian Seru Hari Ini", Date: "2026-09-01", 
      Content: "Halo anak-anak hebat! Hari ini kita belajar perkalian angka 2 sampai 5 dengan cara yang menyenangkan.", 
      Photo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
      Viewers: ["Fahri"], 
      Comments: [{ name: "Fahri", text: "Seru sekali materinya bu guru!", time: "09:00" }]
    }
  ],
  announcements: [{ Title: "Kabar Kelas", Content: "Jangan lupa kerjakan PR dan isi absen ya 🌷" }],
  evaluations: [
    { Id: "e1", Student: "Alya", Note: "Alya hari ini sangat aktif menjawab pertanyaan matematika. Pertahankan ya!", Date: "2026-09-01" }
  ], 
  payments: [],
};

const dailyQuotes = [
  "“Setiap halaman baru adalah kesempatan untuk tumbuh lebih indah.” 🌸",
  "“Belajar itu bukan tentang cepat, tapi tentang menikmati prosesnya.” ✨",
  "“Kesalahan adalah bukti bahwa kamu sedang mencoba dan berkembang.” 🌷"
];

const formatIDR = (num) => num ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num) : "Rp 0";

async function api(action, payload = {}) {
  if (!API_URL || API_URL.trim() === "") return localAction(action, payload);
  try {
    const r = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, ...payload }) });
    return await r.json();
  } catch (e) { return localAction(action, payload); }
}

function localAction(action, b) {
  if (action === "login") {
    const users = [...demo.students, { Id: "teacher", Name: "Guru", PIN: "1234", Role: "teacher" }];
    const u = users.find((x) => x.PIN === b.pin && (!b.name || x.Name.toLowerCase() === b.name.toLowerCase()));
    return u ? { ok: true, user: { ...u, role: u.Role } } : { ok: false, error: "Nama atau PIN salah." };
  }
  if (action === "data") return { ok: true, ...demo };
  if (action === "attendance") { demo.attendance.unshift({...b, Date: new Date().toISOString()}); return {ok: true}; }
  if (action === "evaluation") { demo.evaluations.unshift({...b, Date: new Date().toISOString().split('T')[0]}); return {ok: true}; }
  if (action === "updateProfile") {
    const s = demo.students.find(x => x.Name === b.name);
    if(s) { s.Hobby = b.hobby; s.Photo = b.photo; }
    return {ok: true};
  }
  if (action === "comment") {
    const m = demo.materials.find(x => x.Id === b.id);
    if(m) { m.Comments = [...(m.Comments||[]), {name: b.name, text: b.text, time: new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}]; }
    return {ok: true};
  }
  if (action === "markRead") {
    const m = demo.materials.find(x => x.Id === b.id);
    if(m && !(m.Viewers||[]).includes(b.name)) { m.Viewers = [...(m.Viewers||[]), b.name]; }
    return {ok: true};
  }
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
  const [theme, setTheme] = useState("light");

  const load = async () => { const r = await api("data"); if (r.ok) setData(r); };

  useEffect(() => { 
    if (user) load(); 
  }, [user]);

  useEffect(() => {
    const handleHash = () => setPage(window.location.hash.replace("#", "") || (user ? "dashboard" : "home"));
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [user]);

  const navigate = (newPage) => { window.location.hash = newPage; setPage(newPage); };
  const logout = () => { setUser(null); localStorage.removeItem("rb_user"); window.location.hash = ""; setPage("home"); };

  return (
    <div className={`app-wrapper ${theme}`}>
      <style>{`
        /* TEMA COKELAT HANGAT KHAS RUANG BELAJAR */
        .app-wrapper { min-height: 100vh; transition: all 0.4s ease; position: relative; font-family: system-ui, sans-serif; }
        .app-wrapper.light { background-color: #fcf9f6; color: #3d3330; }
        .app-wrapper.light .panel, .app-wrapper.light .modal-box, .app-wrapper.light aside, .app-wrapper.light header { background-color: #ffffff; border: 1px solid #f0e6e0; color: #3d3330; }
        
        /* TEMA MALAM MEWAH & RAPI (TIDAK KETUTUP) */
        .app-wrapper.dark { background: #0f1218; color: #f3f4f6; }
        .app-wrapper.dark .panel, .app-wrapper.dark .modal-box, .app-wrapper.dark aside, .app-wrapper.dark header { background: #181d26; border: 1px solid #273042; color: #f3f4f6; }
        .app-wrapper.dark input, .app-wrapper.dark textarea, .app-wrapper.dark select { background: #11151d; border: 1px solid #2d3748; color: #fff; }
        .app-wrapper.dark button.sel { background: rgba(217, 119, 6, 0.2); color: #fcd34d; }

        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        .star { position: absolute; color: #fbbf24; animation: twinkle 3s infinite ease-in-out; pointer-events: none; }
      `}.style}</style>

      {theme === "dark" && (
        <>
          <div className="star" style={{top: '10%', left: '15%', fontSize: '18px'}}>✦</div>
          <div className="star" style={{top: '30%', right: '15%', fontSize: '14px'}}>✧</div>
          <div className="star" style={{top: '75%', left: '20%', fontSize: '20px'}}>✦</div>
        </>
      )}

      {!user ? (
        <>
          <Landing onLogin={() => setLoginOpen(true)} theme={theme} setTheme={setTheme} />
          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={async(n,p)=>{
            const r = await api("login", {name: n, pin: p});
            if(r.ok) { setUser(r.user); localStorage.setItem("rb_user", JSON.stringify(r.user)); setLoginOpen(false); navigate("dashboard"); return true;}
            return r.error;
          }} />
        </>
      ) : (
        <Shell user={user} page={page} setPage={navigate} logout={logout} theme={theme} setTheme={setTheme} data={data}>
          {page === "dashboard" ? <Dashboard user={user} data={data} go={navigate} /> :
           page === "profile" ? <Profile user={user} reload={load} setUser={setUser} /> :
           page === "attendance" ? <Attendance user={user} data={data} reload={load} /> :
           page === "materials" ? <Materials user={user} data={data} reload={load} /> :
           page === "evaluations" ? <Evaluations user={user} data={data} reload={load} /> :
           page === "payments" ? <Payments user={user} data={data} reload={load} /> : null}
        </Shell>
      )}
    </div>
  );
}

// --- LANDING PAGE (DIKEMBALIKAN KE TEMA COKELAT HANGAT & LENGKAP) ---
function Landing({ onLogin, theme, setTheme }) {
  return (
    <div className="landing relative z-10 min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-7xl mx-auto">
      <nav className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="text-amber-700 bg-amber-100 p-2 rounded-2xl"><Flower2 size={24} /></div>
          <div><b className="text-lg tracking-wide">{APP_NAME}</b><span className="block text-xs opacity-60">Belajar dengan hati</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded-full border border-black/10 hover:bg-black/5">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="bg-amber-800 text-white rounded-full px-6 py-2.5 flex items-center gap-2 hover:bg-amber-900 transition-all font-semibold text-sm shadow-sm" onClick={onLogin}>
            <LockKeyhole size={15} /> Masuk
          </button>
        </div>
      </nav>
      
      <main className="grid md:grid-cols-2 gap-12 items-center my-auto py-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-6">
            <Sparkles size={14} /> {dailyQuotes[0]}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-serif text-amber-950 dark:text-amber-100">
            Belajar tumbuh <br /><i className="text-amber-700 font-normal">seperti bunga.</i>
          </h1>
          <p className="text-base opacity-80 mb-8 leading-relaxed max-w-md">
            Ruang sederhana untuk absensi, materi, dan kabar belajar. Dibuat hangat untuk murid tercinta.
          </p>
          <button className="bg-amber-900 text-white px-8 py-4 rounded-2xl font-bold transition-transform hover:scale-105 shadow-lg flex items-center gap-2" onClick={onLogin}>
            Mulai Masuk <ChevronRight size={18} />
          </button>
        </div>
        
        {/* Gambar & Kartu Menu Cepat di Beranda */}
        <div className="grid grid-cols-2 gap-4">
          <div className="panel p-6 rounded-3xl shadow-sm cursor-pointer hover:border-amber-400 transition-all" onClick={onLogin}>
            <CalendarCheck2 className="text-amber-700 mb-3" size={28}/>
            <b className="block text-base mb-1">Absensi</b>
            <span className="text-xs opacity-60">Catat kehadiran harian.</span>
          </div>
          <div className="panel p-6 rounded-3xl shadow-sm cursor-pointer hover:border-amber-400 transition-all" onClick={onLogin}>
            <BookOpen className="text-amber-700 mb-3" size={28}/>
            <b className="block text-base mb-1">Materi</b>
            <span className="text-xs opacity-60">Modul belajar asyik.</span>
          </div>
          <div className="panel p-6 rounded-3xl shadow-sm cursor-pointer hover:border-amber-400 transition-all" onClick={onLogin}>
            <Award className="text-amber-700 mb-3" size={28}/>
            <b className="block text-base mb-1">Evaluasi</b>
            <span className="text-xs opacity-60">Catatan dari guru.</span>
          </div>
          <div className="panel p-6 rounded-3xl shadow-sm cursor-pointer hover:border-amber-400 transition-all" onClick={onLogin}>
            <CreditCard className="text-amber-700 mb-3" size={28}/>
            <b className="block text-base mb-1">Paket</b>
            <span className="text-xs opacity-60">Info bimbingan.</span>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs font-medium opacity-50 py-4">
        Dibuat dengan cinta oleh Adelia Ardabela ❤️
      </footer>
    </div>
  );
}

// --- MODAL LOGIN ---
function LoginModal({ open, onClose, onLogin }) {
  const [name, setName] = useState(""); const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  if (!open) return null;
  return (
    <div className="overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={!loading ? onClose : undefined}>
      <div className="modal-box bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full" onMouseDown={(e) => e.stopPropagation()}>
        <div className="text-amber-700 text-3xl mb-2 text-center">✿</div>
        <h2 className="text-2xl font-bold text-center mb-6">Masuk Ruang Belajar</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}
        <label className="text-xs font-bold opacity-70 block mb-1">Nama Kamu / Guru</label>
        <input className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 ring-amber-300" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Alya atau Guru" disabled={loading} />
        <label className="text-xs font-bold opacity-70 block mb-1">PIN Rahasia</label>
        <input className="w-full border rounded-xl p-3 mb-6 outline-none focus:ring-2 ring-amber-300" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" type="password" maxLength="8" disabled={loading} />
        <button className="w-full bg-amber-900 text-white p-4 rounded-xl font-bold flex justify-center gap-2 hover:bg-amber-950" onClick={async () => {
          setLoading(true); setError(""); const err = await onLogin(name, pin);
          setLoading(false); if(err !== true) setError(err);
        }} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Masuk Sekarang"}
        </button>
      </div>
    </div>
  );
}

// --- LAYOUT UTAMA & NOTIFIKASI GURU UNTUK SISWA ---
function Shell({ user, page, setPage, logout, theme, setTheme, children, data }) {
  // Cek apakah ada evaluasi/pesan baru untuk siswa ini
  const myEvaluations = user.role === 'student' ? (data?.evaluations || []).filter(e => e.Student === user.Name || e.Student === user.name) : [];
  const [showNotif, setShowNotif] = useState(false);

  const menus = user.role === "teacher"
      ? [["dashboard", "Beranda", Flower2], ["profile", "Profil", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi Siswa", Award], ["payments", "Pembayaran", CreditCard]]
      : [["dashboard", "Beranda", Flower2], ["profile", "Profil Kamu", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Pesan Guru", Award]];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="md:w-64 flex flex-col justify-between p-6 border-r">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-8 text-amber-800 dark:text-amber-200"><Flower2 /> {APP_NAME}</div>
          <nav className="flex flex-col gap-2">
            {menus.map(([id, l, I]) => (
              <button className={`flex items-center justify-between p-3 rounded-2xl font-semibold text-sm transition-all ${page === id ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 shadow-sm" : "hover:bg-black/5"}`} onClick={() => setPage(id)} key={id}>
                <span className="flex items-center gap-3"><I size={18} />{l}</span>
                {id === 'evaluations' && myEvaluations.length > 0 && user.role === 'student' && (
                  <span className="bg-amber-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-bounce">{myEvaluations.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-black/10">
           <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 mb-2 font-medium text-sm">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} Mode {theme === 'light' ? 'Malam' : 'Terang'}
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8 panel p-4 rounded-3xl shadow-sm">
           <div className="flex items-center gap-2 text-sm font-semibold opacity-70"><Clock size={16} /> {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}</div>
           <div className="flex items-center gap-4">
             {/* Notifikasi Pesan Guru untuk Siswa */}
             {user.role === 'student' && myEvaluations.length > 0 && (
               <button onClick={() => setPage('evaluations')} className="relative bg-amber-100 text-amber-800 p-2.5 rounded-full hover:bg-amber-200 transition-all">
                 <Bell size={18} />
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center font-bold">{myEvaluations.length}</span>
               </button>
             )}
             <div className="text-right hidden md:block">
               <div className="font-bold text-sm">{user.Name || user.name}</div>
               <div className="text-xs opacity-60">{user.role === 'teacher' ? 'Guru Pendamping' : 'Siswa Aktif'}</div>
             </div>
             {user.Photo ? 
                <img src={user.Photo} className="w-10 h-10 rounded-full object-cover border-2 border-amber-300" alt="Profile" /> :
                <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold">{(user.Name || user.name)[0].toUpperCase()}</div>
             }
           </div>
        </header>
        <div className="flex-1 max-w-6xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}

function Dashboard({ user, data, go }) {
  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-2 font-serif">Halo, {(user.Name || user.name).split(" ")[0]} 🌷</h1>
      <p className="opacity-70 mb-8">Semoga hari ini menyenangkan dan penuh semangat belajar.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          [CalendarCheck2, "Absensi Harian", "attendance"], 
          [BookOpen, "Materi Belajar", "materials"], 
          [Award, user.role === 'teacher' ? "Evaluasi Siswa" : "Pesan Dari Guru", "evaluations"]
        ].map(([I, l, p]) => (
          <button onClick={() => go(p)} className="panel p-6 rounded-3xl text-left hover:-translate-y-1 transition-all flex flex-col gap-4 shadow-sm" key={l}>
            <div className="bg-amber-100 text-amber-800 w-12 h-12 rounded-2xl flex items-center justify-center"><I size={24}/></div>
            <b className="text-lg">{l}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- PROFIL ---
function Profile({ user, reload, setUser }) {
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ hobby: user.Hobby || "", photo: user.Photo || "" });
  const [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;

  const save = async () => {
    setLoading(true);
    await api("updateProfile", { name: userName, hobby: form.hobby, photo: form.photo });
    setUser({...user, Hobby: form.hobby, Photo: form.photo});
    setLoading(false); setEditOpen(false); reload();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade">
      <div className="panel p-8 text-center rounded-[3rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-amber-200 to-amber-400 opacity-60"></div>
        <div className="relative z-10 pt-8">
          <div className="w-32 h-32 mx-auto bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-amber-100 text-5xl font-bold text-amber-700 mb-4">
            {user.Photo ? <img src={user.Photo} className="w-full h-full object-cover" alt="Avatar"/> : userName[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold mb-1">{userName}</h1>
          <p className="opacity-70 mb-6 font-medium">{user.role === 'teacher' ? 'Guru Pembimbing' : `Siswa Kelas ${user.Grade || 'Aktif'}`}</p>
          
          {user.role === 'student' && (
            <div className="grid grid-cols-2 gap-4 text-left bg-black/5 p-6 rounded-3xl mb-6">
              <div><span className="text-xs opacity-60 uppercase font-bold">Hobi / Cita-cita</span><p className="font-semibold text-base">{user.Hobby || 'Belum diisi'}</p></div>
              <div><span className="text-xs opacity-60 uppercase font-bold">Paket Bimbel</span><p className="font-semibold text-base text-amber-700">{formatIDR(user.Price)}/bln</p></div>
            </div>
          )}
          
          <button onClick={() => setEditOpen(true)} className="bg-amber-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-amber-950 transition-transform active:scale-95">
            <Edit3 size={16}/> Edit Profil & Foto
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-box bg-white p-8 rounded-3xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Edit Profil Kamu</h2>
            <label className="block text-xs font-bold opacity-70 mb-2">Upload Foto Profil Baru</label>
            <input type="file" accept="image/*" className="text-sm w-full mb-4" onChange={async (e) => {
              if(e.target.files[0]) setForm({...form, photo: await fileToBase64(e.target.files[0])});
            }}/>
            <label className="block text-xs font-bold opacity-70 mb-2">Hobi / Bio Singkat</label>
            <input className="w-full border rounded-xl p-3 mb-6 outline-none text-sm" value={form.hobby} onChange={(e) => setForm({...form, hobby: e.target.value})} placeholder="Misal: Suka membaca buku"/>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-gray-700" onClick={() => setEditOpen(false)}>Batal</button>
              <button className="flex-1 bg-amber-900 text-white p-3 rounded-xl font-bold flex justify-center" onClick={save}>{loading ? <Loader2 className="animate-spin"/> : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ABSENSI (PENDEKATAN HANGAT & WARNA SPESIFIK) ---
function Attendance({ user, data, reload }) {
  const [status, setStatus] = useState("Hadir"); const [note, setNote] = useState(""); const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;
  const mine = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => (x.Name || x.name) === userName);

  const submit = async () => {
    setLoading(true); 
    const photoBase64 = photo ? await fileToBase64(photo) : null;
    const r = await api("attendance", { name: userName, status, note, photo: photoBase64 }); 
    setLoading(false);
    if (r.ok) { setNote(""); setPhoto(null); reload(); alert("Absen berhasil dikirim! Semangat belajarnya ya 🌷"); } 
  };

  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-2">Absensi Harian</h1>
      <p className="opacity-70 mb-8">Pilih status kehadiranmu hari ini dengan jujur ya.</p>
      
      {user.role === "student" && (
        <section className="panel p-6 rounded-3xl mb-8 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Bagaimana kabarmu untuk sesi belajar hari ini?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { id: "Hadir", title: "Hadir 🟢", desc: "Saya mengikuti belajar dengan senang." },
              { id: "Sakit", title: "Sakit 🔴", desc: "Saya sedang beristirahat karena sakit." },
              { id: "Izin", title: "Izin 🟡", desc: "Saya berhalangan hadir karena ada keperluan." },
              { id: "Alpa", title: "Alpa ⚪", desc: "Saya tidak hadir tanpa keterangan." },
            ].map((x) => (
              <button key={x.id} onClick={() => setStatus(x.id)} 
                className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col gap-1 ${status === x.id ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/40' : 'border-black/10 opacity-70 hover:opacity-100'}`}>
                <b className="text-base">{x.title}</b>
                <span className="text-xs opacity-80">{x.desc}</span>
              </button>
            ))}
          </div>
          <label className="text-xs font-bold opacity-70 block mb-1">Catatan Tambahan</label>
          <textarea className="w-full border rounded-xl p-3 mb-4 outline-none text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis pesan untuk guru jika ada..." rows="2" disabled={loading}/>
          
          <label className="flex items-center gap-2 p-3 border rounded-xl mb-6 cursor-pointer hover:bg-black/5 border-dashed">
            <Camera size={20} className="text-amber-700" />
            <span className="text-sm font-semibold opacity-80 flex-1 truncate">{photo ? photo.name : "Upload Bukti Foto / Surat Izin (Opsional)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} disabled={loading}/>
          </label>
          
          <button className="bg-amber-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-amber-950" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin"/> : <><Send size={16}/> Kirim Absensi</>}
          </button>
        </section>
      )}
      
      <div className="panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase font-bold opacity-70"><tr><th className="p-4">Nama</th><th className="p-4">Tanggal</th><th className="p-4">Status</th><th className="p-4">Catatan</th></tr></thead>
            <tbody>
              {mine.map((a, i) => {
                const st = a.Status || a.status;
                const badgeColor = st === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : st === 'Sakit' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300';
                return (
                  <tr key={i} className="border-b border-black/5 hover:bg-black/5 font-medium">
                    <td className="p-4">{a.Name || a.name}</td>
                    <td className="p-4">{new Date(a.Date || a.date).toLocaleDateString('id-ID')}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>{st}</span></td>
                    <td className="p-4">{a.Note || a.note || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!mine.length && <div className="p-8 text-center opacity-50 font-medium">Belum ada riwayat absensi.</div>}
        </div>
      </div>
    </div>
  );
}

// --- MATERI INTERAKTIF DENGAN TANDA BELUM DIBACA & DISKUSI ---
function Materials({ user, data, reload }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);
  const [form, setForm] = useState({}); const [matPhoto, setMatPhoto] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const rows = data?.materials || [];
  const userName = user.Name || user.name;

  const handleOpenMaterial = async (m) => {
    setSelectedMat(m);
    if(user.role === 'student' && !(m.Viewers||[]).includes(userName)) {
      await api("markRead", {id: m.Id, name: userName});
      reload();
    }
  };

  const submitComment = async () => {
    if(!commentText.trim()) return;
    setLoading(true);
    await api("comment", {id: selectedMat.Id, name: userName, text: commentText});
    setCommentText(""); reload();
    setSelectedMat({...selectedMat, Comments: [...(selectedMat.Comments||[]), {name: userName, text: commentText, time: "Baru saja"}]});
    setLoading(false);
  };

  return (
    <div className="animate-fade">
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold mb-1">Materi Pembelajaran</h1><p className="opacity-70 text-sm">Baca materi harian dan diskusikan bersama teman.</p></div>
        {user.role === "teacher" && <button className="bg-amber-900 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 hover:bg-amber-950 text-sm" onClick={() => setOpenAdd(true)}><Plus size={16}/> Buat Materi Baru</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((m, i) => {
          const isUnread = user.role === 'student' && !(m.Viewers||[]).includes(userName);
          return (
            <article className="panel rounded-3xl cursor-pointer hover:-translate-y-1 transition-all overflow-hidden shadow-sm relative border" key={i} onClick={() => handleOpenMaterial(m)}>
              {/* Tanda Titik Merah Belum Dibaca */}
              {isUnread && <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">Belum Dibaca</div>}
              
              {m.Photo && <img src={m.Photo} className="w-full h-48 object-cover" alt="Cover"/>}
              <div className="p-6">
                <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-2">{m.Date}</span>
                <h2 className="font-bold text-xl mb-2 leading-tight">{m.Title}</h2>
                <p className="text-sm opacity-70 line-clamp-2">{m.Content}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-semibold opacity-60">
                  <span className="flex items-center gap-1"><Users size={14}/> {(m.Viewers||[]).length} Siswa Baca</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14}/> {(m.Comments||[]).length} Komentar</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* POP-UP BACA MATERI & KOMENTAR */}
      {selectedMat && (
        <div className="overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setSelectedMat(null)}>
          <div className="modal-box bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute right-4 top-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 z-20" onClick={() => setSelectedMat(null)}><X size={18}/></button>
            
            <div className="overflow-y-auto flex-1 pb-20">
              {selectedMat.Photo && <img src={selectedMat.Photo} className="w-full h-64 object-cover" />}
              <div className="p-8">
                <div className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-4">{selectedMat.Date}</div>
                <h1 className="text-3xl font-bold mb-6">{selectedMat.Title}</h1>
                <div className="whitespace-pre-line text-base leading-relaxed opacity-90 font-medium mb-8">{selectedMat.Content}</div>
                
                <hr className="border-black/10 mb-6" />
                <h3 className="font-bold text-base flex items-center gap-2 mb-4"><MessageCircle size={18}/> Diskusi Kelas</h3>
                <div className="flex flex-col gap-3 mb-6">
                  {(selectedMat.Comments||[]).map((c, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 shrink-0 flex items-center justify-center font-bold text-xs">{c.name[0]}</div>
                      <div className="bg-black/5 p-3 rounded-2xl rounded-tl-none flex-1">
                        <div className="flex justify-between items-end mb-1"><b className="text-xs">{c.name}</b><span className="text-[10px] opacity-50">{c.time}</span></div>
                        <p className="text-xs opacity-90">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {!(selectedMat.Comments||[]).length && <p className="text-xs opacity-50 text-center py-4">Belum ada komentar.</p>}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-3 bg-white border-t flex gap-2">
              <input className="flex-1 border rounded-full px-4 py-2.5 outline-none text-sm bg-black/5" placeholder="Tulis komentar atau pertanyaan..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} disabled={loading}/>
              <button className="bg-amber-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-amber-950 shrink-0" onClick={submitComment} disabled={loading}><Send size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP GURU BUAT MATERI */}
      {openAdd && (
        <div className="overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-box bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Posting Materi Baru</h2>
            <input className="w-full border rounded-xl p-3 mb-4 outline-none font-bold text-base" placeholder="Judul Materi..." onChange={e => setForm({...form, Title: e.target.value})}/>
            <textarea className="w-full border rounded-xl p-3 mb-4 outline-none text-sm" rows="5" placeholder="Tulis isi materi selengkap-lengkapnya di sini..." onChange={e => setForm({...form, Content: e.target.value})}></textarea>
            
            <label className="flex items-center gap-2 p-3 border rounded-xl mb-6 cursor-pointer hover:bg-black/5 border-dashed">
              <ImageIcon size={20} className="text-amber-700" />
              <span className="text-sm font-semibold opacity-70 flex-1">{matPhoto ? "Gambar Terpilih" : "Upload Gambar Pendukung"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                if(e.target.files[0]) setMatPhoto(await fileToBase64(e.target.files[0]));
              }}/>
            </label>

            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-sm" onClick={() => setOpenAdd(false)}>Batal</button>
              <button className="flex-1 bg-amber-900 text-white p-3 rounded-xl font-bold text-sm" onClick={async () => {
                setLoading(true); 
                await api("material", { Id: "m_"+Date.now(), ...form, Date: new Date().toISOString().split('T')[0], Photo: matPhoto, Viewers: [], Comments: [] });
                setLoading(false); setOpenAdd(false); reload();
              }}>Posting Sekarang</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- EVALUASI (GURU BISA PILIH TARGET SISWA & SISWA DAPAT NOTIFIKASI) ---
function Evaluations({ user, data, reload }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ Student: "", Note: "" });
  const [loading, setLoading] = useState(false);
  const userName = user.Name || user.name;
  
  const rows = user.role === 'teacher' ? (data?.evaluations || []) : (data?.evaluations || []).filter(r => r.Student === userName);

  const saveEvaluation = async () => {
    if(!form.Student || !form.Note) return alert("Pilih siswa dan tulis catatan evaluasinya!");
    setLoading(true);
    await api("evaluation", form);
    setLoading(false); setOpenAdd(false); setForm({Student:"", Note:""}); reload();
  };

  return (
    <div className="animate-fade">
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold mb-1">Evaluasi & Pesan Guru</h1><p className="opacity-70 text-sm">Catatan perkembangan khusus untuk setiap siswa.</p></div>
        {user.role === "teacher" && <button className="bg-amber-900 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 hover:bg-amber-950 text-sm" onClick={() => setOpenAdd(true)}><Plus size={16}/> Kirim Evaluasi Siswa</button>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r,i) => (
          <div key={i} className="panel p-6 rounded-3xl border-l-4 border-amber-600 shadow-sm relative">
            <span className="text-xs font-bold opacity-50 block mb-1">{r.Date}</span>
            <b className="text-lg block mb-2 text-amber-900 dark:text-amber-200">{r.Student}</b>
            <p className="text-sm opacity-90 leading-relaxed font-medium">{r.Note}</p>
          </div>
        ))}
        {!rows.length && <div className="opacity-50 font-medium col-span-2 text-center py-10">Belum ada evaluasi atau catatan pesan dari guru.</div>}
      </div>

      {/* POP-UP GURU KIRIM EVALUASI KE SISWA TERTENTU */}
      {openAdd && (
        <div className="overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-box bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Kirim Catatan Evaluasi</h2>
            <label className="text-xs font-bold opacity-70 block mb-1">Pilih Target Siswa</label>
            <select className="w-full border rounded-xl p-3 mb-4 outline-none text-sm" onChange={e => setForm({...form, Student: e.target.value})}>
              <option value="">-- Pilih Siswa --</option>
              {(data?.students || []).map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
            </select>
            <label className="text-xs font-bold opacity-70 block mb-1">Catatan / Pesan Evaluasi</label>
            <textarea className="w-full border rounded-xl p-3 mb-6 outline-none text-sm" rows="4" placeholder="Tulis perkembangan belajar siswa di sini..." onChange={e => setForm({...form, Note: e.target.value})}></textarea>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 p-3 rounded-xl font-bold text-sm" onClick={() => setOpenAdd(false)}>Batal</button>
              <button className="flex-1 bg-amber-900 text-white p-3 rounded-xl font-bold text-sm flex justify-center" onClick={saveEvaluation} disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : "Kirim Pesan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Payments({ user, data }) {
  const rows = user.role === 'teacher' ? (data?.payments || []) : (data?.payments || []).filter(r => r.Student === (user.Name || user.name));
  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-2">Riwayat Pembayaran Paket</h1>
      <p className="opacity-70 mb-8 text-sm">Informasi status berlangganan les.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r,i) => (
          <div key={i} className="panel p-6 rounded-3xl flex justify-between items-center border">
            <div><span className="text-xs font-bold opacity-50 block mb-1">{r.Date}</span><b className="text-lg">{r.Student}</b></div>
            <div className="text-right"><div className="font-bold text-amber-700">{formatIDR(r.Amount)}</div><span className="text-xs font-bold opacity-50 uppercase">{r.Status}</span></div>
          </div>
        ))}
        {!rows.length && <div className="opacity-50 font-medium col-span-2 text-center py-10">Belum ada data riwayat pembayaran.</div>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
