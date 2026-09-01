import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen, CalendarCheck2, ChevronRight, Flower2, LockKeyhole,
  LogOut, Megaphone, Plus, Send, Sparkles, Upload, Users,
  Loader2, X, Eye, Moon, Sun, Clock, User, CreditCard, Award
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

const demo = {
  students: [
    { Id: "1", Name: "Alya", PIN: "1111", Role: "student", Grade: "4 SD", Price: "150000", Hobby: "Membaca Buku" },
    { Id: "2", Name: "Fahri", PIN: "2222", Role: "student", Grade: "5 SD", Price: "200000", Hobby: "Bermain Catur" }
  ],
  attendance: [],
  materials: [],
  announcements: [{ Title: "Selamat Datang!", Content: "Jangan lupa isi absensi ya 🌷" }],
  evaluations: [],
  payments: [],
};

const dailyQuotes = [
  "“Setiap halaman baru adalah kesempatan untuk tumbuh lebih indah.” 🌸",
  "“Belajar itu bukan tentang cepat, tapi tentang menikmati prosesnya.” ✨",
  "“Kesalahan adalah bukti bahwa kamu sedang mencoba dan berkembang.” 🌷"
];

const formatIDR = (number) => {
  if (!number) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
};

async function api(action, payload = {}) {
  if (!API_URL || API_URL.trim() === "") return localAction(action, payload);
  try {
    const r = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action, ...payload }) });
    const text = await r.text();
    try { return JSON.parse(text); } catch (e) { return { ok: false, error: "Format data tidak valid." }; }
  } catch (error) { return { ok: false, error: "Gagal terhubung ke server." }; }
}

function localAction(action, b) {
  if (action === "login") {
    const users = [...demo.students, { Id: "teacher", Name: "Guru", PIN: "1234", Role: "teacher" }];
    const u = users.find((x) => x.PIN === b.pin && (!b.name || x.Name.toLowerCase() === b.name.toLowerCase()));
    return u ? { ok: true, user: { id: u.Id, name: u.Name, role: u.Role, grade: u.Grade, price: u.Price, hobby: u.Hobby } } : { ok: false, error: "Nama atau PIN salah." };
  }
  if (action === "data") return { ok: true, ...demo };
  return { ok: true };
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("rb_user") || "null"));
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || (localStorage.getItem("rb_user") ? "dashboard" : "home"));
  const [data, setData] = useState(demo);
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [theme, setTheme] = useState("light");

  const load = async () => {
    const r = await api("data");
    if (r.ok) setData(r);
  };

  useEffect(() => {
    if (user) load();
    setQuoteIndex(Math.floor(Math.random() * dailyQuotes.length));
    
    // Auto detect time for theme
    const hour = new Date().getHours();
    if(hour >= 18 || hour < 6) setTheme("dark");
  }, [user]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      setPage(hash || (user ? "dashboard" : "home"));
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [user]);

  const navigate = (newPage) => { window.location.hash = newPage; setPage(newPage); };

  const login = async (name, pin) => {
    if (!name || !pin) return setNotice("Nama dan PIN tidak boleh kosong.");
    setIsLoggingIn(true); setNotice("");
    const r = await api("login", { name, pin });
    setIsLoggingIn(false);
    if (!r.ok) return setNotice(r.error);
    setUser(r.user); localStorage.setItem("rb_user", JSON.stringify(r.user));
    setLoginOpen(false); navigate("dashboard"); setNotice("");
  };

  const logout = () => { setUser(null); localStorage.removeItem("rb_user"); window.location.hash = ""; setPage("home"); };

  return (
    <div className={`app-wrapper ${theme}`}>
      {/* CSS Injection for Themes */}
      <style>{`
        .app-wrapper { min-height: 100vh; transition: all 0.5s ease; position: relative; }
        .app-wrapper.light { background: linear-gradient(135deg, #fff5f7 0%, #fff 100%); color: #4a4a4a; }
        .app-wrapper.dark { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #f1f5f9; }
        
        /* Dark Mode Overrides */
        .dark .panel, .dark .login-modal, .dark .info-card, .dark .student-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; }
        .dark h1, .dark h2, .dark b { color: #f8fafc; }
        .dark .text-gray-500, .dark .text-gray-600 { color: #cbd5e1; }
        .dark aside { border-right: 1px solid rgba(255,255,255,0.1); }
        .dark button.sel { background: rgba(236, 72, 153, 0.2); color: #fbcfe8; }
        
        /* Star Animation */
        @keyframes twinkle { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
        .star { position: absolute; color: #fef08a; animation: twinkle 3s infinite ease-in-out; pointer-events: none; }
        
        /* Big Flower SVG Art */
        .big-flower-art { position: absolute; right: -5%; top: 10%; opacity: 0.8; z-index: 0; pointer-events: none; }
        .app-wrapper.dark .big-flower-art { display: none; } /* Hide flower in dark mode */
      `}</style>

      {/* Decorative Backgrounds */}
      {theme === "dark" && (
        <>
          <div className="star" style={{top: '10%', left: '20%', fontSize: '24px', animationDelay: '0s'}}>✦</div>
          <div className="star" style={{top: '30%', right: '15%', fontSize: '18px', animationDelay: '1s'}}>✧</div>
          <div className="star" style={{top: '60%', left: '10%', fontSize: '20px', animationDelay: '2s'}}>✦</div>
          <div className="star" style={{top: '80%', right: '25%', fontSize: '14px', animationDelay: '0.5s'}}>✧</div>
        </>
      )}

      {theme === "light" && (
        <div className="big-flower-art hidden md:block">
           <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M100,100 C100,50 150,50 150,100 C150,150 100,150 100,100 Z" fill="#fbcfe8" opacity="0.6"/>
            <path d="M100,100 C50,100 50,50 100,50 C150,50 150,100 100,100 Z" fill="#f9a8d4" opacity="0.6"/>
            <path d="M100,100 C100,150 50,150 50,100 C50,50 100,50 100,100 Z" fill="#fbcfe8" opacity="0.6"/>
            <path d="M100,100 C150,100 150,150 100,150 C50,150 50,100 100,100 Z" fill="#f9a8d4" opacity="0.6"/>
            <circle cx="100" cy="100" r="15" fill="#fcd34d" />
            <path d="M100,115 C100,180 90,200 90,200" stroke="#86efac" strokeWidth="4" fill="none"/>
            <path d="M95,150 C70,140 60,160 60,160 C70,170 90,160 95,150 Z" fill="#86efac"/>
          </svg>
        </div>
      )}

      {!user ? (
        <>
          <Landing onLogin={() => setLoginOpen(true)} quote={dailyQuotes[quoteIndex]} theme={theme} setTheme={setTheme} />
          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} notice={notice} loading={isLoggingIn} />
        </>
      ) : (
        <Shell user={user} page={page} setPage={navigate} logout={logout} theme={theme} setTheme={setTheme}>
          {page === "dashboard" ? <Dashboard user={user} data={data} go={navigate} quote={dailyQuotes[quoteIndex]} /> :
           page === "profile" ? <Profile user={user} /> :
           page === "attendance" ? <Attendance user={user} data={data} reload={load} /> :
           page === "materials" ? <Materials user={user} data={data} reload={load} /> :
           page === "evaluations" ? <Evaluations user={user} data={data} reload={load} /> :
           page === "payments" ? <Payments user={user} data={data} reload={load} /> :
           page === "announcements" ? <Announcements user={user} data={data} reload={load} /> :
           page === "students" ? <Students data={data} /> : null}
        </Shell>
      )}
    </div>
  );
}

// Komponen Jam Real-Time
function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
      <Clock size={16} />
      {time.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {time.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
    </div>
  );
}

function Landing({ onLogin, quote, theme, setTheme }) {
  return (
    <div className="landing relative z-10">
      <nav className="landing-nav pt-4 px-6 flex justify-between items-center">
        <div className="brand flex items-center gap-2">
          <div className="brand-logo animate-bounce"><Flower2 /></div>
          <div><b>{APP_NAME}</b><span className="block text-xs opacity-70">Belajar dengan hati</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-black/5 transition-all">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="ghost-button transition-transform active:scale-95 border rounded-full px-4" onClick={onLogin}>
            <LockKeyhole size={16} /> Masuk
          </button>
        </div>
      </nav>
      <main className="hero text-center py-20 px-4">
        <div className="hero-copy max-w-2xl mx-auto flex flex-col items-center">
          <div className="pill shadow-sm mb-6 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-pink-100 flex gap-2 items-center">
            <Sparkles size={14} className="text-pink-500" /> {quote}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight leading-tight">
            Belajar tumbuh <br /><i className="font-serif text-pink-400 font-normal">seperti bunga.</i>
          </h1>
          <p className="text-lg opacity-80 mb-8 max-w-lg">
            Ruang belajar sederhana, cantik, dan nyaman. Dibuat hangat untuk guru dan murid tercinta.
          </p>
          <button className="hero-button bg-gray-800 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2" onClick={onLogin}>
            Masuk ke Ruang Belajar <ChevronRight size={18} />
          </button>
        </div>
      </main>
      <section className="features grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-5xl mx-auto mt-10">
        {[
          [CalendarCheck2, "Absensi", "Catat kehadiran."],
          [BookOpen, "Materi", "Modul harian."],
          [Award, "Evaluasi", "Perkembangan belajar."],
          [CreditCard, "Paket", "Info berlangganan."]
        ].map(([Icon, title, desc], i) => (
          <div key={i} className="panel p-6 text-center rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-pink-200 bg-white/60 backdrop-blur-md" onClick={onLogin}>
            <Icon size={28} className="mx-auto mb-3 text-pink-400" />
            <b className="block text-lg">{title}</b>
            <span className="text-sm opacity-70">{desc}</span>
          </div>
        ))}
      </section>
      <footer className="text-center py-10 mt-10 text-sm font-medium opacity-60">
        Dibuat dengan cinta oleh Adelia Ardabela ❤️
      </footer>
    </div>
  );
}

// Sisa Komponen Modal Login (Tetap Sama)
function LoginModal({ open, onClose, onLogin, notice, loading }) {
  const [name, setName] = useState(""); const [pin, setPin] = useState("");
  if (!open) return null;
  return (
    <div className="overlay animate-fade fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onMouseDown={!loading ? onClose : undefined}>
      <div className="login-modal bg-white text-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4" onMouseDown={(e) => e.stopPropagation()}>
        <div className="text-pink-400 text-4xl mb-4 text-center">✿</div>
        <h2 className="text-2xl font-bold text-center mb-1">Selamat datang</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Masuk ke ruang belajar kamu.</p>
        {notice && <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm mb-4">{notice}</div>}
        
        <label className="block text-sm font-semibold mb-1">Nama (Sesuai Data)</label>
        <input className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 ring-pink-200" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Alya atau Guru" disabled={loading} />
        
        <label className="block text-sm font-semibold mb-1">PIN</label>
        <input className="w-full border rounded-xl p-3 mb-6 outline-none focus:ring-2 ring-pink-200" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" type="password" maxLength="8" disabled={loading} />
        
        <button className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70" onClick={() => onLogin(name, pin)} disabled={loading}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Memeriksa...</> : <>Masuk <ChevronRight size={17} /></>}
        </button>
        {!loading && <button className="w-full mt-3 p-3 text-gray-500 font-semibold" onClick={onClose}>Batal</button>}
      </div>
    </div>
  );
}

function Shell({ user, page, setPage, logout, theme, setTheme, children }) {
  const menus = user.role === "teacher"
      ? [["dashboard", "Beranda", Flower2], ["profile", "Profil", User], ["attendance", "Absensi", CalendarCheck2], ["students", "Daftar Siswa", Users], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi", Award], ["payments", "Pembayaran", CreditCard], ["announcements", "Kabar", Megaphone]]
      : [["dashboard", "Beranda", Flower2], ["profile", "Profil Kamu", User], ["attendance", "Absensi", CalendarCheck2], ["materials", "Materi", BookOpen], ["evaluations", "Evaluasi", Award], ["payments", "Riwayat Bayar", CreditCard], ["announcements", "Kabar", Megaphone]];

  return (
    <div className="flex flex-col md:flex-row min-h-screen z-10 relative">
      <aside className={`md:w-64 flex flex-col justify-between p-6 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} backdrop-blur-xl border-r border-black/5`}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2 font-bold text-lg"><Flower2 className="text-pink-400" /> {APP_NAME}</div>
          </div>
          <nav className="flex flex-col gap-2">
            {menus.map(([id, l, I]) => (
              <button className={`flex items-center gap-3 p-3 rounded-2xl transition-all font-medium text-sm ${page === id ? "bg-pink-100 text-pink-700 shadow-sm" : "hover:bg-black/5"}`} onClick={() => setPage(id)} key={id}>
                <I size={18} />{l}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-black/5">
           <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 mb-2 font-medium text-sm transition-all">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} Mode {theme === 'light' ? 'Malam' : 'Terang'}
          </button>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-red-100/50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition-transform active:scale-95">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8 bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-black/5">
           <RealTimeClock />
           <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <div className="font-bold text-sm">{user.name}</div>
               <div className="text-xs opacity-70">{user.role === 'teacher' ? 'Admin / Guru' : 'Siswa Aktif'}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold shadow-inner">
               {user.name[0].toUpperCase()}
             </div>
           </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
        <footer className="text-center py-6 text-xs font-medium opacity-50 mt-10">
          Dibuat dengan cinta oleh Adelia Ardabela ❤️
        </footer>
      </main>
    </div>
  );
}

// --- HALAMAN PROFIL (BARU) ---
function Profile({ user }) {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="panel p-8 text-center rounded-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pink-300 to-purple-300 opacity-50"></div>
        <div className="relative z-10">
          <div className="w-32 h-32 mx-auto bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-pink-300 mb-4 mt-8">
            {user.name[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
          <p className="opacity-70 mb-6 flex items-center justify-center gap-2"><Award size={16}/> {user.role === 'teacher' ? 'Guru Pendamping' : `Siswa ${user.grade || ''}`}</p>
          
          {user.role === 'student' && (
            <div className="grid grid-cols-2 gap-4 text-left bg-black/5 p-6 rounded-3xl border border-black/5">
              <div>
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Hobi</span>
                <p className="font-semibold text-lg">{user.hobby || 'Belum diisi'}</p>
              </div>
              <div>
                <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Paket Langganan</span>
                <p className="font-semibold text-lg text-green-600">{formatIDR(user.price)}/bln</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, data, go, quote }) {
  const att = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);
  const present = att.filter((x) => x.Status === "present" || x.Status === "Hadir").length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Halo, {user.name.split(" ")[0]} 🌷</h1>
        <p className="opacity-70">{user.role === "teacher" ? "Ringkasan data kelas hari ini." : "Yuk semangat belajar hari ini."}</p>
      </div>
      
      <div className="panel p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4 border-l-4 border-pink-400">
        <Sparkles className="text-pink-400 shrink-0" size={32} />
        <div>
          <span className="text-xs font-bold opacity-50 uppercase tracking-wider block mb-1">Penyemangat Hari Ini</span>
          <h2 className="text-xl font-serif">{quote}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(user.role === "teacher"
          ? [[Users, data?.students?.length || 0, "Siswa Aktif", "students"], [CalendarCheck2, present, "Hadir", "attendance"], [Award, data?.evaluations?.length || 0, "Evaluasi", "evaluations"], [CreditCard, data?.payments?.length || 0, "Transaksi", "payments"]]
          : [[CalendarCheck2, present, "Kehadiran", "attendance"], [BookOpen, data?.materials?.length || 0, "Materi", "materials"], [Award, data?.evaluations?.filter(e=>e.Student===user.name).length || 0, "Raporku", "evaluations"], [CreditCard, data?.payments?.filter(e=>e.Student===user.name).length || 0, "Pembayaran", "payments"]]
        ).map(([I, v, l, p]) => (
          <button onClick={() => go(p)} className="panel p-6 rounded-3xl text-left transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-32 border border-black/5" key={l}>
            <div className="bg-pink-100/50 w-10 h-10 rounded-full flex items-center justify-center text-pink-500 mb-2"><I size={20}/></div>
            <div>
              <b className="block text-2xl mb-0 leading-none">{v}</b>
              <span className="text-sm opacity-60 font-medium">{l}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// Halaman-halaman Data (CrudPage Reusable)
function Materials({ user, data, reload }) { return <CrudPage type="material" user={user} data={data} reload={reload} title="Materi Belajar" icon={BookOpen} fields={["Title", "Content", "Date"]} rows={data?.materials || []} />; }
function Announcements({ user, data, reload }) { return <CrudPage type="announcement" user={user} data={data} reload={reload} title="Papan Kabar" icon={Megaphone} fields={["Title", "Content", "Date"]} rows={data?.announcements || []} />; }

// Menu Baru: Evaluasi & Pembayaran
function Evaluations({ user, data, reload }) { 
  const rows = user.role === 'teacher' ? (data?.evaluations || []) : (data?.evaluations || []).filter(r => r.Student === user.name);
  return <CrudPage type="evaluation" user={user} data={data} reload={reload} title="Catatan Evaluasi" icon={Award} fields={["Student", "Note", "Date"]} rows={rows} />; 
}
function Payments({ user, data, reload }) { 
  const rows = user.role === 'teacher' ? (data?.payments || []) : (data?.payments || []).filter(r => r.Student === user.name);
  return <CrudPage type="payment" user={user} data={data} reload={reload} title="Riwayat Pembayaran" icon={CreditCard} fields={["Student", "Amount", "Status", "Date"]} rows={rows} isPayment={true} />; 
}

function CrudPage({ type, user, data, reload, title, icon: Icon, fields, rows, isPayment }) {
  const [open, setOpen] = useState(false); const [form, setForm] = useState({}); const [loading, setLoading] = useState(false); const [selectedItem, setSelectedItem] = useState(null);

  const save = async () => {
    setLoading(true); const r = await api(type, form); setLoading(false);
    if (r.ok) { setOpen(false); setForm({}); reload(); } else { alert("Gagal: " + r.error); }
  };

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold">{title}</h1></div>
        {user.role === "teacher" && (
          <button className="bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-transform active:scale-95" onClick={() => setOpen(true)}><Plus size={16} /> Tambah</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((r, i) => {
          const content = r.Content || r.Note || r.Amount || "";
          return (
            <article className="panel p-6 rounded-3xl cursor-pointer hover:shadow-md transition-all border border-black/5 relative group flex gap-4" key={i} onClick={() => setSelectedItem(r)}>
              <div className="bg-pink-50 p-3 rounded-2xl text-pink-500 h-fit shrink-0"><Icon size={24} /></div>
              <div className="flex-1 pr-4 overflow-hidden">
                <span className="text-xs font-bold opacity-50 uppercase block mb-1">{r.Date || "-"} {r.Student ? `· ${r.Student}` : ''}</span>
                <h2 className="font-bold text-lg leading-tight mb-2 truncate">{r.Title || r.Status || "Detail Info"}</h2>
                <p className="text-sm opacity-70 line-clamp-2">{isPayment ? formatIDR(content) : content}</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><Eye className="text-pink-300"/></div>
            </article>
          );
        })}
        {!rows.length && <div className="p-8 text-center opacity-50 border-2 border-dashed rounded-3xl w-full col-span-2">Belum ada rekaman data.</div>}
      </div>

      {selectedItem && (
        <div className="overlay fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setSelectedItem(null)}>
          <div className="panel bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-6 top-6 opacity-50 hover:opacity-100 bg-gray-100 p-2 rounded-full" onClick={() => setSelectedItem(null)}><X size={20} /></button>
            <div className="text-xs font-bold text-pink-500 uppercase mb-2">{selectedItem.Date} {selectedItem.Student ? `· ${selectedItem.Student}` : ''}</div>
            <h2 className="text-2xl font-bold mb-4">{selectedItem.Title || selectedItem.Status || "Detail Informasi"}</h2>
            <div className="bg-black/5 p-4 rounded-2xl max-h-60 overflow-y-auto whitespace-pre-line text-sm leading-relaxed mb-6 font-medium">
              {isPayment ? formatIDR(selectedItem.Amount) : (selectedItem.Content || selectedItem.Note)}
            </div>
            <button className="w-full bg-gray-100 text-gray-800 p-4 rounded-xl font-bold hover:bg-gray-200" onClick={() => setSelectedItem(null)}>Tutup Halaman</button>
          </div>
        </div>
      )}
      
      {open && (
        <div className="overlay fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => !loading && setOpen(false)}>
          <div className="panel bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full" onMouseDown={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Tambah {title}</h2>
            {fields.map((f) => (
              <div key={f} className="mb-4">
                <label className="block text-sm font-semibold mb-1">{f}</label>
                {f === "Content" || f === "Note" ? <textarea className="w-full border rounded-xl p-3 outline-none focus:ring-2 ring-pink-200" rows="3" onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>
                : f === "Student" ? (
                  <select className="w-full border rounded-xl p-3 outline-none" onChange={(e) => setForm({ ...form, [f]: e.target.value })}>
                    <option value="">Pilih Siswa...</option>
                    {data.students.map(s => <option key={s.Id} value={s.Name}>{s.Name}</option>)}
                  </select>
                )
                : <input className="w-full border rounded-xl p-3 outline-none focus:ring-2 ring-pink-200" type={f === "Date" ? "date" : "text"} onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>}
              </div>
            ))}
            <button className="w-full bg-pink-500 text-white p-4 rounded-xl font-bold mt-2 hover:bg-pink-600 disabled:opacity-70 flex justify-center" onClick={save} disabled={loading}>
              {loading ? <Loader2 className="animate-spin"/> : "Simpan Data"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// --- DAFTAR SISWA (Menampilkan Harga Paket) ---
function Students({ data }) {
  return (
    <>
      <div className="mb-8"><h1 className="text-3xl font-bold">Daftar Siswa</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data?.students || []).map((s) => (
          <article className="panel p-5 rounded-3xl flex items-center gap-4 border border-black/5 hover:shadow-md transition-all bg-white/60" key={s.Id}>
            <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 font-bold text-xl flex items-center justify-center shrink-0">{s.Name?.[0]?.toUpperCase()}</div>
            <div className="flex-1">
              <h2 className="font-bold text-lg leading-tight">{s.Name}</h2>
              <p className="text-xs font-semibold opacity-60">{s.Grade || "Siswa Aktif"} · PIN: {s.PIN}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-xs uppercase font-bold opacity-50 mb-1">Paket</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">{formatIDR(s.Price)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// Sisa Komponen Absensi persis seperti fungsi Crud normal
function Attendance({ user, data, reload }) {
  const [status, setStatus] = useState("Hadir"); const [note, setNote] = useState(""); const [loading, setLoading] = useState(false);
  const mine = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);

  const submit = async () => {
    setLoading(true); const r = await api("attendance", { name: user.name, status, note, photo: null }); setLoading(false);
    if (r.ok) { setNote(""); reload(); alert("Absen tersimpan!"); } else { alert("Gagal: " + r.error); }
  };

  return (
    <>
      <div className="mb-8"><h1 className="text-3xl font-bold">Absensi</h1></div>
      {user.role === "student" && (
        <section className="panel p-6 rounded-3xl mb-8 border border-black/5 bg-white/60">
          <h2 className="font-bold mb-4">Isi Kehadiran Hari Ini</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {["Hadir", "Sakit", "Izin", "Alpa"].map((x) => (
              <button className={`p-3 rounded-xl border font-semibold transition-all ${status === x ? "bg-pink-500 text-white border-pink-500" : "hover:bg-black/5 border-black/10"}`} onClick={() => setStatus(x)} key={x}>{x}</button>
            ))}
          </div>
          <textarea className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 ring-pink-200" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan opsional..." rows="2" disabled={loading}/>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50" onClick={submit} disabled={loading}>{loading ? "Menyimpan..." : "Kirim Absensi"}</button>
        </section>
      )}
      <div className="panel rounded-3xl overflow-hidden border border-black/5 bg-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-xs uppercase font-bold opacity-70"><tr><th className="p-4">Nama</th><th className="p-4">Tanggal</th><th className="p-4">Status</th><th className="p-4">Catatan</th></tr></thead>
            <tbody>
              {mine.map((a, i) => (
                <tr key={i} className="border-b border-black/5 hover:bg-black/5 font-medium">
                  <td className="p-4">{a.Name || a.name}</td><td className="p-4">{a.Date || a.date?.substring(0, 10)}</td>
                  <td className="p-4"><span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-md">{a.Status || a.status}</span></td><td className="p-4">{a.Note || a.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!mine.length && <div className="p-8 text-center opacity-50">Belum ada absen.</div>}
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
