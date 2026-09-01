import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen, CalendarCheck2, ChevronRight, Flower2, LockKeyhole,
  LogOut, Megaphone, Plus, Send, Sparkles, Upload, Users,
  Loader2, X, Moon, Sun, Clock, User, CreditCard, Award,
  CheckCircle2, MessageCircle, Image as ImageIcon, Camera, Edit3
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

// Data Demo (Berfungsi sebagai penyimpan sementara)
const demo = {
  students: [
    { Id: "1", Name: "Alya", PIN: "1111", Role: "student", Grade: "4 SD", Price: "150000", Hobby: "Membaca Buku", Photo: "" },
    { Id: "2", Name: "Fahri", PIN: "2222", Role: "student", Grade: "5 SD", Price: "200000", Hobby: "Bermain Catur", Photo: "" }
  ],
  attendance: [],
  materials: [
    { 
      Id: "m1", Title: "Keajaiban Alam Semesta", Date: "2026-09-01", 
      Content: "Hari ini kita belajar tentang tata surya. \n\nBumi adalah planet ketiga dari matahari. Silakan amati gambar dan berikan pendapatmu di kolom komentar ya anak-anak!", 
      Photo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
      Viewers: ["Fahri"], 
      Comments: [{ name: "Fahri", text: "Wah gambarnya indah sekali bu guru!", time: "08:15" }]
    }
  ],
  announcements: [{ Title: "Selamat Datang!", Content: "Jangan lupa isi absensi ya 🌷" }],
  evaluations: [], payments: [],
};

const dailyQuotes = ["“Setiap halaman baru adalah kesempatan untuk tumbuh.” 🌸", "“Belajar itu menikmati prosesnya.” ✨", "“Kesalahan adalah bukti kamu sedang berkembang.” 🌷"];
const formatIDR = (num) => num ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num) : "Rp 0";

// Sistem API & Local Data
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

// Konversi File ke Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file);
});

// Warna Status Absen
const getStatusColor = (status) => {
  if(status === 'Hadir') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if(status === 'Sakit') return 'bg-rose-100 text-rose-700 border-rose-200';
  if(status === 'Izin') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("rb_user") || "null"));
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || (user ? "dashboard" : "home"));
  const [data, setData] = useState(demo);
  const [loginOpen, setLoginOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const load = async () => { const r = await api("data"); if (r.ok) setData(r); };

  useEffect(() => { 
    if (user) load(); 
    const hour = new Date().getHours();
    if(hour >= 18 || hour < 6) setTheme("dark");
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
        .app-wrapper { min-height: 100vh; transition: background 0.5s ease, color 0.5s ease; position: relative; }
        .app-wrapper.light { background: linear-gradient(135deg, #fff5f7 0%, #fff 100%); color: #4a4a4a; }
        
        /* DARK MODE MEWAH */
        .app-wrapper.dark { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #f1f5f9; }
        .dark .panel, .dark .modal-box { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .dark input, .dark textarea, .dark select { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); color: white; }
        .dark aside { border-right: 1px solid rgba(255,255,255,0.05); }
        .dark header { background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.05); }
        .dark button.sel { background: rgba(236, 72, 153, 0.15); color: #fbcfe8; }
        .dark .text-gray-800, .dark h1, .dark h2 { color: #f8fafc; }
        .dark .bg-white { background: #1e293b; }
        
        /* Animasi Bintang */
        @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .star { position: absolute; color: #fde047; animation: twinkle 3s infinite ease-in-out; pointer-events: none; }
      `}</style>

      {theme === "dark" && (
        <>
          <div className="star" style={{top: '15%', left: '10%', fontSize: '18px', animationDelay: '0s'}}>✦</div>
          <div className="star" style={{top: '40%', right: '20%', fontSize: '12px', animationDelay: '1s'}}>✧</div>
          <div className="star" style={{top: '70%', left: '25%', fontSize: '20px', animationDelay: '2s'}}>✦</div>
          <div className="star" style={{top: '20%', right: '10%', fontSize: '16px', animationDelay: '0.5s'}}>✧</div>
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
        <Shell user={user} page={page} setPage={navigate} logout={logout} theme={theme} setTheme={setTheme}>
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

// --- LANDING PAGE (Dipercantik dengan Gambar) ---
function Landing({ onLogin, theme, setTheme }) {
  return (
    <div className="landing relative z-10 min-h-screen flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="text-pink-500 animate-bounce"><Flower2 size={28} /></div>
          <div><b className="text-lg">{APP_NAME}</b><span className="block text-xs opacity-70">Belajar dengan hati</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-black/5">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="border rounded-full px-5 py-2 flex items-center gap-2 hover:bg-pink-50 transition-all font-semibold" onClick={onLogin}>
            <LockKeyhole size={16} /> Masuk
          </button>
        </div>
      </nav>
      
      <main className="flex-1 flex items-center justify-center px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-bold mb-6">
              <Sparkles size={16} /> {dailyQuotes[0]}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Belajar tumbuh <br /><i className="font-serif text-pink-500 font-normal">seperti bunga.</i>
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-md leading-relaxed">
              Ruang belajar yang rapi, cantik, dan nyaman. Terhubung langsung dengan guru untuk absensi, materi, dan evaluasi harianmu.
            </p>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold transition-transform hover:scale-105 shadow-xl flex items-center gap-2" onClick={onLogin}>
              Mulai Belajar <ChevronRight size={18} />
            </button>
          </div>
          
          {/* Gambar Estetik Penambah Keindahan */}
          <div className="relative hidden md:block animate-fade">
            <div className="absolute inset-0 bg-pink-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" 
              alt="Belajar" 
              className="relative z-10 w-full h-[450px] object-cover rounded-[3rem] shadow-2xl border-4 border-white/50 transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle2 size={24}/></div>
              <div><p className="text-sm font-bold text-gray-800">Absensi Mudah</p><p className="text-xs text-gray-500">Sekali klik</p></div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm font-medium opacity-60">
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
    <div className="overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onMouseDown={!loading ? onClose : undefined}>
      <div className="modal-box bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4" onMouseDown={(e) => e.stopPropagation()}>
        <div className="text-pink-500 text-4xl mb-2 text-center animate-bounce">✿</div>
        <h2 className="text-2xl font-bold text-center mb-6">Selamat Datang</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}
        <input className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 ring-pink-200" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Kamu" disabled={loading} />
        <input className="w-full border rounded-xl p-3 mb-6 outline-none focus:ring-2 ring-pink-200" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN (••••)" type="password" maxLength="8" disabled={loading} />
        <button className="w-full bg-pink-500 text-white p-4 rounded-xl font-bold flex justify-center gap-2 hover:bg-pink-600" onClick={async () => {
          setLoading(true); setError(""); const err = await onLogin(name, pin);
          setLoading(false); if(err !== true) setError(err);
        }} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Masuk"}
        </button>
      </div>
    </div>
  );
}

// --- LAYOUT UTAMA ---
function Shell({ user, page, setPage, logout, theme, setTheme, children }) {
  const menus = user.role === "teacher"
      ? [["dashboard", "Beranda", Flower2], ["profile", "Profil", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi", Award], ["payments", "Pembayaran", CreditCard]]
      : [["dashboard", "Beranda", Flower2], ["profile", "Profil Kamu", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Raporku", Award]];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className={`md:w-64 flex flex-col justify-between p-6 ${theme==='dark'?'bg-slate-900/40':'bg-white/60'} backdrop-blur-xl border-r`}>
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-10"><Flower2 className="text-pink-500" /> {APP_NAME}</div>
          <nav className="flex flex-col gap-2">
            {menus.map(([id, l, I]) => (
              <button className={`flex items-center gap-3 p-3 rounded-2xl font-medium text-sm transition-all ${page === id ? "bg-pink-500 text-white shadow-md" : "hover:bg-black/5"}`} onClick={() => setPage(id)} key={id}>
                <I size={18} />{l}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-black/5">
           <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 mb-2 font-medium text-sm">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} Mode {theme === 'light' ? 'Malam' : 'Terang'}
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl text-sm font-bold">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8 panel p-4 rounded-3xl shadow-sm">
           <div className="flex items-center gap-2 text-sm font-semibold opacity-70"><Clock size={16} /> {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}</div>
           <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <div className="font-bold text-sm">{user.Name || user.name}</div>
               <div className="text-xs opacity-70">{user.role === 'teacher' ? 'Guru' : 'Siswa Aktif'}</div>
             </div>
             {user.Photo ? 
                <img src={user.Photo} className="w-10 h-10 rounded-full object-cover border-2 border-pink-200" alt="Profile" /> :
                <div className="w-10 h-10 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold">{user.name[0].toUpperCase()}</div>
             }
           </div>
        </header>
        <div className="flex-1 max-w-6xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ user, data, go }) {
  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-2">Halo, {user.name.split(" ")[0]} 🌷</h1>
      <p className="opacity-70 mb-8">Semoga hari ini penuh dengan ilmu yang bermanfaat.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[[CalendarCheck2, "Absensi", "attendance"], [BookOpen, "Materi", "materials"], [Award, "Evaluasi", "evaluations"]].map(([I, l, p]) => (
          <button onClick={() => go(p)} className="panel p-6 rounded-3xl text-left hover:-translate-y-1 hover:shadow-md transition-all flex flex-col gap-4" key={l}>
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center text-pink-600"><I size={24}/></div>
            <b className="text-lg">{l}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- PROFIL (Dengan Fitur Upload Foto & Edit Bio) ---
function Profile({ user, reload, setUser }) {
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ hobby: user.Hobby || "", photo: user.Photo || "" });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    await api("updateProfile", { name: user.name, hobby: form.hobby, photo: form.photo });
    setUser({...user, Hobby: form.hobby, Photo: form.photo}); // Update state lokal
    setLoading(false); setEditOpen(false); reload();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade">
      <div className="panel p-8 text-center rounded-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pink-400 to-purple-400 opacity-80"></div>
        <div className="relative z-10 pt-10">
          <div className="w-32 h-32 mx-auto bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-pink-100 text-6xl font-bold text-pink-400 mb-4">
            {user.Photo ? <img src={user.Photo} className="w-full h-full object-cover" alt="Avatar"/> : user.name[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="opacity-70 mb-6">{user.role === 'teacher' ? 'Guru Pendamping' : `Siswa ${user.Grade || ''}`}</p>
          
          {user.role === 'student' && (
            <div className="grid grid-cols-2 gap-4 text-left bg-black/5 p-6 rounded-3xl mb-6">
              <div><span className="text-xs opacity-60 uppercase font-bold">Hobi / Bio</span><p className="font-semibold text-lg">{user.Hobby || 'Belum diisi'}</p></div>
              <div><span className="text-xs opacity-60 uppercase font-bold">Paket</span><p className="font-semibold text-lg text-emerald-600">{formatIDR(user.Price)}/bln</p></div>
            </div>
          )}
          
          <button onClick={() => setEditOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-gray-800">
            <Edit3 size={18}/> Edit Profil
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-box bg-white p-8 rounded-3xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Edit Profil</h2>
            <label className="block text-sm font-semibold mb-2">Foto Profil</label>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 border">
                 {form.photo ? <img src={form.photo} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-5 opacity-50"/>}
               </div>
               <input type="file" accept="image/*" className="text-sm w-full" onChange={async (e) => {
                 if(e.target.files[0]) setForm({...form, photo: await fileToBase64(e.target.files[0])});
               }}/>
            </div>
            <label className="block text-sm font-semibold mb-2">Hobi / Bio Singkat</label>
            <input className="w-full border rounded-xl p-3 mb-6 outline-none" value={form.hobby} onChange={(e) => setForm({...form, hobby: e.target.value})} placeholder="Misal: Suka menggambar"/>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-200 p-3 rounded-xl font-bold text-gray-700" onClick={() => setEditOpen(false)}>Batal</button>
              <button className="flex-1 bg-pink-500 text-white p-3 rounded-xl font-bold flex justify-center" onClick={save}>{loading ? <Loader2 className="animate-spin"/> : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ABSENSI (Dengan Warna Status & Upload Foto) ---
function Attendance({ user, data, reload }) {
  const [status, setStatus] = useState("Hadir"); const [note, setNote] = useState(""); const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const mine = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);

  const submit = async () => {
    setLoading(true); 
    const photoBase64 = photo ? await fileToBase64(photo) : null;
    const r = await api("attendance", { name: user.name, status, note, photo: photoBase64 }); 
    setLoading(false);
    if (r.ok) { setNote(""); setPhoto(null); reload(); alert("Absen berhasil dikirim!"); } 
  };

  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-8">Data Absensi</h1>
      {user.role === "student" && (
        <section className="panel p-6 rounded-3xl mb-8">
          <h2 className="font-bold mb-4">Kehadiran Hari Ini</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {["Hadir", "Sakit", "Izin", "Alpa"].map((x) => (
              <button key={x} onClick={() => setStatus(x)} 
                className={`p-3 rounded-xl font-bold transition-all border-2 ${status === x ? getStatusColor(x) : 'bg-transparent border-black/10 opacity-60 hover:opacity-100'}`}>
                {x}
              </button>
            ))}
          </div>
          <textarea className="w-full border rounded-xl p-3 mb-4 outline-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis keterangan bila perlu..." rows="2" disabled={loading}/>
          <label className="flex items-center gap-2 p-3 border rounded-xl mb-4 cursor-pointer hover:bg-black/5 transition-all">
            <Camera size={20} className="opacity-70" />
            <span className="text-sm font-semibold opacity-80 flex-1 truncate">{photo ? photo.name : "Upload Foto Bukti / Selfie (Opsional)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} disabled={loading}/>
          </label>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Kirim Absensi</>}
          </button>
        </section>
      )}
      
      <div className="panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase font-bold opacity-70"><tr><th className="p-4">Nama</th><th className="p-4">Tanggal</th><th className="p-4">Status</th><th className="p-4">Catatan</th></tr></thead>
            <tbody>
              {mine.map((a, i) => (
                <tr key={i} className="border-b border-black/5 hover:bg-black/5 font-medium">
                  <td className="p-4">{a.Name || a.name}</td>
                  <td className="p-4">{new Date(a.Date || a.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(a.Status || a.status)}`}>{a.Status || a.status}</span></td>
                  <td className="p-4">{a.Note || a.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!mine.length && <div className="p-8 text-center opacity-50 font-medium">Belum ada catatan absensi.</div>}
        </div>
      </div>
    </div>
  );
}

// --- MATERI (Fitur Klik, Postingan Panjang, Upload Gambar & Komentar) ---
function Materials({ user, data, reload }) {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedMat, setSelectedMat] = useState(null);
  const [form, setForm] = useState({}); const [matPhoto, setMatPhoto] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const rows = data?.materials || [];

  const handleOpenMaterial = async (m) => {
    setSelectedMat(m);
    // Jika siswa belum baca, tandai sudah baca (Kirim ke backend)
    if(user.role === 'student' && !(m.Viewers||[]).includes(user.name)) {
      await api("markRead", {id: m.Id, name: user.name});
      reload(); // Refresh data viewers
    }
  };

  const submitComment = async () => {
    if(!commentText.trim()) return;
    setLoading(true);
    await api("comment", {id: selectedMat.Id, name: user.name, text: commentText});
    setCommentText(""); reload();
    // Update state lokal untuk pop-up agar langsung muncul
    setSelectedMat({...selectedMat, Comments: [...(selectedMat.Comments||[]), {name: user.name, text: commentText, time: "Baru saja"}]});
    setLoading(false);
  };

  return (
    <div className="animate-fade">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold">Materi Belajar</h1>
        {user.role === "teacher" && <button className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold flex gap-2 hover:bg-pink-600" onClick={() => setOpenAdd(true)}><Plus size={18}/> Buat Materi</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((m, i) => {
          const isUnread = user.role === 'student' && !(m.Viewers||[]).includes(user.name);
          return (
            <article className="panel rounded-3xl cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all overflow-hidden border border-black/5 relative" key={i} onClick={() => handleOpenMaterial(m)}>
              {isUnread && <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm z-10"></div>}
              {m.Photo && <img src={m.Photo} className="w-full h-40 object-cover opacity-90" alt="Cover"/>}
              <div className="p-6">
                <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-2">{m.Date}</span>
                <h2 className="font-bold text-xl mb-2 leading-tight">{m.Title}</h2>
                <p className="text-sm opacity-70 line-clamp-2">{m.Content}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-semibold opacity-60">
                  <span className="flex items-center gap-1"><Users size={14}/> {(m.Viewers||[]).length} Dibaca</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14}/> {(m.Comments||[]).length} Komen</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* POP-UP DETAIL MATERI FULL */}
      {selectedMat && (
        <div className="overlay fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setSelectedMat(null)}>
          <div className="modal-box bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute right-4 top-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 z-20" onClick={() => setSelectedMat(null)}><X size={20}/></button>
            
            <div className="overflow-y-auto flex-1 pb-20">
              {selectedMat.Photo && <img src={selectedMat.Photo} className="w-full h-64 object-cover" />}
              <div className="p-8">
                <div className="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full mb-4">{selectedMat.Date}</div>
                <h1 className="text-3xl font-bold mb-6">{selectedMat.Title}</h1>
                <div className="whitespace-pre-line text-lg leading-relaxed opacity-90 font-medium mb-10">{selectedMat.Content}</div>
                
                <hr className="border-black/10 mb-8" />
                
                {/* Area Komentar */}
                <h3 className="font-bold text-lg flex items-center gap-2 mb-6"><MessageCircle size={20}/> Ruang Diskusi</h3>
                <div className="flex flex-col gap-4 mb-6">
                  {(selectedMat.Comments||[]).map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-500">{c.name[0]}</div>
                      <div className="bg-black/5 p-4 rounded-2xl rounded-tl-none flex-1">
                        <div className="flex justify-between items-end mb-1"><b className="text-sm">{c.name}</b><span className="text-[10px] opacity-50">{c.time}</span></div>
                        <p className="text-sm opacity-90">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {!(selectedMat.Comments||[]).length && <p className="text-sm opacity-50 text-center py-4">Belum ada diskusi, jadilah yang pertama!</p>}
                </div>
              </div>
            </div>

            {/* Input Komen Tetap di Bawah */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-black/10 flex gap-2">
              <input className="flex-1 border border-black/10 rounded-full px-4 py-3 outline-none focus:border-pink-300 bg-black/5" placeholder="Tulis komentarmu..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} disabled={loading}/>
              <button className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-pink-600 shrink-0" onClick={submitComment} disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}</button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP TAMBAH MATERI (GURU) */}
      {openAdd && (
        <div className="overlay fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="modal-box bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Buat Postingan Materi</h2>
            <input className="w-full border rounded-xl p-3 mb-4 outline-none font-bold text-lg" placeholder="Judul Materi..." onChange={e => setForm({...form, Title: e.target.value})}/>
            <textarea className="w-full border rounded-xl p-3 mb-4 outline-none" rows="5" placeholder="Isi penjelasan materi yang panjang di sini..." onChange={e => setForm({...form, Content: e.target.value})}></textarea>
            
            <label className="flex items-center gap-2 p-4 border rounded-xl mb-6 cursor-pointer hover:bg-black/5 border-dashed border-2">
              <ImageIcon size={24} className="text-pink-400" />
              <span className="font-semibold opacity-70 flex-1">{matPhoto ? "Gambar Terpilih (Ganti)" : "Upload Gambar Pendukung"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                if(e.target.files[0]) setMatPhoto(await fileToBase64(e.target.files[0]));
              }}/>
            </label>

            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 p-4 rounded-xl font-bold" onClick={() => setOpenAdd(false)}>Batal</button>
              <button className="flex-1 bg-pink-500 text-white p-4 rounded-xl font-bold" onClick={async () => {
                setLoading(true); await api("material", { ...form, Date: new Date().toISOString().split('T')[0], Photo: matPhoto, Viewers: [], Comments: [] });
                setLoading(false); setOpenAdd(false); reload();
              }}>Posting Materi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fitur Sederhana Evaluasi & Pembayaran
function Evaluations({ user, data }) {
  const rows = user.role === 'teacher' ? (data?.evaluations || []) : (data?.evaluations || []).filter(r => r.Student === user.name);
  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-8">Evaluasi / Rapor</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r,i) => (
          <div key={i} className="panel p-6 rounded-3xl border-l-4 border-emerald-400">
            <span className="text-xs font-bold opacity-50 block mb-1">{r.Date}</span>
            <b className="text-lg block mb-2">{r.Student}</b>
            <p className="text-sm opacity-80">{r.Note}</p>
          </div>
        ))}
        {!rows.length && <div className="opacity-50 font-medium">Belum ada evaluasi dicatat.</div>}
      </div>
    </div>
  );
}
function Payments({ user, data }) {
  const rows = user.role === 'teacher' ? (data?.payments || []) : (data?.payments || []).filter(r => r.Student === user.name);
  return (
    <div className="animate-fade">
      <h1 className="text-3xl font-bold mb-8">Riwayat Pembayaran</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r,i) => (
          <div key={i} className="panel p-6 rounded-3xl flex justify-between items-center border border-black/5">
            <div><span className="text-xs font-bold opacity-50 block mb-1">{r.Date}</span><b className="text-lg">{r.Student}</b></div>
            <div className="text-right"><div className="font-bold text-emerald-600">{formatIDR(r.Amount)}</div><span className="text-xs font-bold opacity-50 uppercase">{r.Status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
