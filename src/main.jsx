import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  ClipboardCheck,
  Flower2,
  Heart,
  LockKeyhole,
  LogOut,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Upload,
  Users,
  Loader2,
  X,
  Eye
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

const demo = {
  students: [],
  attendance: [],
  materials: [
    { Title: "Perkalian Dasar", Date: "2026-08-31", Content: "Latihan perkalian 2 sampai 10. Kerjakan dengan santai dan teliti ya!" },
    { Title: "Belajar Akar Kuadrat", Date: "2026-09-17", Content: "Tentukan nilai x! 11. x² = 25, maka x = ... 12. x² = 64, maka x = ... 13. x² = 100, maka x = ... 14. x² = 144, maka x = ... 15. x² = 225, maka x = ..." }
  ],
  assignments: [],
  announcements: [
    { Title: "Selamat Datang!", Content: "Jangan lupa isi absensi sebelum mulai belajar ya 🌷" }
  ],
  submissions: [],
};

// Kutipan penyemangat berganti secara dinamis atau bisa disesuaikan
const dailyQuotes = [
  "“Setiap halaman baru adalah kesempatan untuk tumbuh lebih indah.” 🌸",
  "“Belajar itu bukan tentang cepat, tapi tentang menikmati prosesnya.” ✨",
  "“Kesalahan adalah bukti bahwa kamu sedang mencoba dan berkembang.” 🌷",
  "“Semangat mengajarnya, hari ini pasti penuh hal baik!” 💖"
];

async function api(action, payload = {}) {
  if (!API_URL || API_URL.trim() === "") {
    return localAction(action, payload);
  }
  try {
    const r = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    });
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { ok: false, error: "Format data dari Google tidak valid." };
    }
  } catch (error) {
    return { ok: false, error: "Gagal terhubung ke server." };
  }
}

function localAction(action, b) {
  if (action === "login") {
    const users = [{ Id: "teacher", Name: "Guru", PIN: "1234", Role: "teacher" }];
    const u = users.find((x) => x.PIN === b.pin && (!b.name || x.Name.toLowerCase() === b.name.toLowerCase()));
    return u ? { ok: true, user: { id: u.Id, name: u.Name, role: u.Role || "student", grade: u.Grade } } : { ok: false, error: "Nama atau PIN salah." };
  }
  if (action === "data") return { ok: true, ...demo };
  return { ok: true };
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("rb_user") || "null"));
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    const storedUser = localStorage.getItem("rb_user");
    if (storedUser) return hash || "dashboard";
    return "home";
  });
  const [data, setData] = useState(demo);
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // State untuk kutipan harian interaktif
  const [quoteIndex, setQuoteIndex] = useState(0);

  const load = async () => {
    const r = await api("data");
    if (r.ok) setData(r);
  };

  useEffect(() => {
    if (user) load();
    // Ganti kutipan harian secara acak/berkala
    setQuoteIndex(Math.floor(Math.random() * dailyQuotes.length));
  }, [user]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setPage(hash);
      } else if (user) {
        setPage("dashboard");
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [user]);

  const navigate = (newPage) => {
    window.location.hash = newPage;
    setPage(newPage);
  };

  const login = async (name, pin) => {
    if (!name || !pin) {
      setNotice("Nama dan PIN tidak boleh kosong.");
      return;
    }
    setIsLoggingIn(true);
    setNotice("");
    const r = await api("login", { name, pin });
    setIsLoggingIn(false);
    
    if (!r.ok) {
      setNotice(r.error);
      return;
    }
    setUser(r.user);
    localStorage.setItem("rb_user", JSON.stringify(r.user));
    setLoginOpen(false);
    navigate("dashboard");
    setNotice("");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rb_user");
    window.location.hash = "";
    setPage("home");
  };

  if (!user)
    return (
      <>
        <Landing onLogin={() => setLoginOpen(true)} quote={dailyQuotes[quoteIndex]} />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} notice={notice} loading={isLoggingIn} />
      </>
    );

  return (
    <Shell user={user} page={page} setPage={navigate} logout={logout}>
      {page === "dashboard" ? (
        <Dashboard user={user} data={data} go={navigate} quote={dailyQuotes[quoteIndex]} />
      ) : page === "attendance" ? (
        <Attendance user={user} data={data} reload={load} />
      ) : page === "materials" ? (
        <Materials user={user} data={data} reload={load} />
      ) : page === "assignments" ? (
        <Assignments user={user} data={data} reload={load} />
      ) : page === "announcements" ? (
        <Announcements user={user} data={data} reload={load} />
      ) : page === "students" ? (
        <Students data={data} />
      ) : null}
    </Shell>
  );
}

function Landing({ onLogin, quote }) {
  return (
    <div className="landing" style={{ position: "relative", overflow: "hidden" }}>
      <div className="petal p1">✿</div><div className="petal p2">✽</div>
      <div className="petal p3">❀</div><div className="petal p4">✾</div>
      <div className="petal p5">❁</div>
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-logo animate-bounce"><Flower2 /></div>
          <div>
            <b>{APP_NAME || "Ruang Belajar"}</b>
            <span>Belajar dengan hati</span>
          </div>
        </div>
        <button className="ghost-button transition-transform active:scale-95 hover:bg-pink-50" onClick={onLogin}>
          <LockKeyhole size={16} /> Masuk
        </button>
      </nav>
      <main className="hero">
        <div className="hero-copy">
          <div className="pill shadow-sm">
            <Sparkles size={14} /> {quote}
          </div>
          <h1>
            Belajar tumbuh
            <br />
            <i>seperti bunga.</i>
          </h1>
          <p>
            Ruang sederhana untuk absensi, materi, tugas, dan kabar belajar. Dibuat hangat untuk guru dan murid tercinta.
          </p>
          <button className="hero-button transition-all duration-300 hover:scale-105 shadow-md" onClick={onLogin}>
            Masuk ke Kelas <ChevronRight size={18} />
          </button>
        </div>
      </main>
      <section className="features">
        <div className="hover:border-pink-300 transition-all cursor-pointer" onClick={onLogin}><CalendarCheck2 /><b>Absensi</b><span>Catat kehadiran.</span></div>
        <div className="hover:border-pink-300 transition-all cursor-pointer" onClick={onLogin}><BookOpen /><b>Materi</b><span>Belajar hari ini.</span></div>
        <div className="hover:border-pink-300 transition-all cursor-pointer" onClick={onLogin}><ClipboardCheck /><b>Tugas</b><span>Kumpulkan tugas.</span></div>
        <div className="hover:border-pink-300 transition-all cursor-pointer" onClick={onLogin}><Megaphone /><b>Kabar</b><span>Info penting.</span></div>
      </section>
      <footer className="text-center py-6 text-sm text-gray-500 font-medium">
        Dibuat dengan cinta oleh Adelia Ardabela ❤️
      </footer>
    </div>
  );
}

function LoginModal({ open, onClose, onLogin, notice, loading }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  if (!open) return null;
  return (
    <div className="overlay animate-fade" onMouseDown={!loading ? onClose : undefined}>
      <div className="login-modal shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-flower">✿</div>
        <h2>Selamat datang</h2>
        <p>Masuk ke ruang belajar kamu.</p>
        
        {notice && (
          <div className="notice" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #f87171" }}>
            {notice}
          </div>
        )}
        
        <label>Nama (Sesuai di tabel murid / Guru)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Alya atau Guru"
          disabled={loading}
        />
        
        <label>PIN</label>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          type="password"
          maxLength="8"
          disabled={loading}
        />
        
        <button 
          className="hero-button full transition-transform active:scale-95 shadow-md" 
          onClick={() => onLogin(name, pin)}
          disabled={loading}
          style={{ display: "flex", gap: "8px", justifyContent: "center" }}
        >
          {loading ? (
            <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Memeriksa...</>
          ) : (
            <>Masuk <ChevronRight size={17} /></>
          )}
        </button>
        
        {!loading && <button className="link-button" onClick={onClose}>Kembali</button>}
      </div>
    </div>
  );
}

function Shell({ user, page, setPage, logout, children }) {
  const menus =
    user.role === "teacher"
      ? [
          ["dashboard", "Beranda", Flower2],
          ["attendance", "Absensi", CalendarCheck2],
          ["students", "Murid", Users],
          ["materials", "Materi", BookOpen],
          ["assignments", "Tugas", ClipboardCheck],
          ["announcements", "Kabar", Megaphone],
        ]
      : [
          ["dashboard", "Beranda", Flower2],
          ["attendance", "Absensi", CalendarCheck2],
          ["materials", "Materi", BookOpen],
          ["assignments", "Tugas", ClipboardCheck],
          ["announcements", "Kabar", Megaphone],
        ];

  return (
    <div className="app">
      <aside className="flex flex-col justify-between">
        <div>
          <div className="brand dark">
            <div className="brand-logo"><Flower2 /></div>
            <div><b>{APP_NAME || "Ruang Belajar"}</b></div>
          </div>
          <nav>
            {menus.map(([id, l, I]) => (
              <button className={`transition-all ${page === id ? "sel shadow-sm" : ""}`} onClick={() => setPage(id)} key={id}>
                <I size={17} />{l}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tombol Keluar untuk semua perangkat (Mobile & Desktop) */}
        <div className="p-4 border-t border-pink-100">
          <div className="user-mini mb-3">
            <div className="avatar bg-pink-100 text-pink-700 font-bold">{user.name[0].toUpperCase()}</div>
            <div>
              <b>{user.name}</b>
              <span className="text-xs text-pink-500 font-medium">{user.role === "teacher" ? "Guru" : "Murid"}</span>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all active:scale-95"
          >
            <LogOut size={16} /> Keluar Aplikasi
          </button>
        </div>
      </aside>

      <main className="content flex flex-col justify-between min-h-screen">
        <div>
          <header className="mobile-brand flex justify-between items-center">
            <div className="brand flex items-center gap-2">
              <div className="brand-logo"><Flower2 /></div>
              <b>{APP_NAME || "Ruang Belajar"}</b>
            </div>
            {/* Tombol keluar cepat khusus header mobile */}
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
              <LogOut size={20} />
            </button>
          </header>
          {children}
        </div>
        
        <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 mt-10">
          Dibuat dengan cinta oleh Adelia Ardabela ❤️
        </footer>
      </main>
    </div>
  );
}

function Head({ eyebrow, title, text, action }) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ user, data, go, quote }) {
  const att = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);
  const present = att.filter((x) => x.Status === "present" || x.Status === "Hadir").length;

  return (
    <>
      <Head
        eyebrow="Ruang Belajar"
        title={`Halo, ${user.name.split(" ")[0]} 🌷`}
        text={user.role === "teacher" ? "Semoga kegiatan belajar hari ini berjalan menyenangkan." : "Yuk belajar sedikit demi sedikit dengan penuh semangat."}
      />
      <div className="quote-card shadow-sm transition-transform hover:scale-[1.01] duration-300">
        <div>
          <span>KUTIPAN PENYEMANGAT HARI INI</span>
          <h2>{quote}</h2>
        </div>
        <div className="quote-flower">❀</div>
      </div>
      <div className="stats">
        {(user.role === "teacher"
          ? [[Users, data?.students?.length || 0, "Murid", "students"], [CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length || 0, "Materi", "materials"], [ClipboardCheck, data?.assignments?.length || 0, "Tugas", "assignments"]]
          : [[CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length || 0, "Materi", "materials"], [ClipboardCheck, data?.assignments?.length || 0, "Tugas", "assignments"], [Megaphone, data?.announcements?.length || 0, "Kabar", "announcements"]]
        ).map(([I, v, l, p]) => (
          <button onClick={() => go(p)} className="stat transition-all hover:shadow-md hover:-translate-y-1" key={l}><I /><span>{l}</span><b>{v}</b></button>
        ))}
      </div>
    </>
  );
}

function Attendance({ user, data, reload }) {
  const [status, setStatus] = useState("present");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const mine = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);

  const submit = async () => {
    setLoading(true);
    const b = {
      name: user.name,
      status,
      note,
      photo: photo ? await fileToBase64(photo) : null,
    };
    const r = await api("attendance", b);
    setLoading(false);
    
    if (r.ok) {
      setSent(true);
      setNote("");
      setPhoto(null);
      reload();
    } else {
      alert("Gagal absen: " + r.error);
    }
  };

  return (
    <>
      <Head eyebrow="Kehadiran" title="Absensi" text={user.role === "teacher" ? "Pantau kehadiran murid." : "Catat kehadiranmu hari ini ya."} />
      {user.role === "student" && (
        <section className="panel form-panel shadow-sm">
          <h2>Bagaimana kabarmu hari ini?</h2>
          <div className="choice-grid">
            {[["present", "Hadir"], ["sick", "Sakit"], ["permission", "Izin"], ["absent", "Alpa"]].map((x) => (
              <button className={`transition-all ${status === x[0] ? "choice active shadow-sm" : "choice"}`} onClick={() => setStatus(x[0])} key={x[0]}>
                <span className={"dot " + x[0]}></span><b>{x[1]}</b>
              </button>
            ))}
          </div>
          <label>Catatan (Opsional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis keterangan..." rows="2" disabled={loading}/>
          
          <label className="photo-input cursor-pointer hover:bg-pink-50 transition-all">
            <Upload size={18} />
            <span>{photo ? photo.name : "Upload bukti foto absen"}</span>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} disabled={loading}/>
          </label>
          
          <button className="hero-button transition-transform active:scale-95 shadow-md" onClick={submit} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }}/> Mengirim...</> : <><Send size={17} /> Simpan absensi</>}
          </button>
          
          {sent && <div className="success animate-fade">Yeay! Absensi tersimpan 🌷</div>}
        </section>
      )}
      <section className="panel shadow-sm">
        <div className="panel-title"><div><h2>Riwayat Absensi</h2></div></div>
        <div className="table">
          <div className="tr th"><span>Nama</span><span>Tanggal</span><span>Status</span><span>Catatan</span></div>
          {mine.slice(0, 30).map((a, i) => (
            <div className="tr hover:bg-pink-50/50 transition-colors" key={i}>
              <span>{a.Name || a.name}</span><span>{a.Date || a.date?.substring(0, 10) || "-"}</span>
              <span><em className={"badge " + (a.Status || a.status)}>{labelStatus(a.Status || a.status)}</em></span>
              <span>{a.Note || a.note || "-"}</span>
            </div>
          ))}
          {!mine.length && <div className="empty">Belum ada absen.</div>}
        </div>
      </section>
    </>
  );
}

// Komponen Halaman Materi, Tugas, Pengumuman dengan Fitur Klik Pop-up (Modal) agar teks panjang rapi
function Materials({ user, data, reload }) { return <CrudPage type="material" user={user} data={data} reload={reload} title="Materi" eyebrow="Pembelajaran" icon={BookOpen} fields={["Title", "Content", "Date"]} rows={data?.materials || []} />; }
function Assignments({ user, data, reload }) { return <CrudPage type="assignment" user={user} data={data} reload={reload} title="Tugas" eyebrow="Latihan" icon={ClipboardCheck} fields={["Title", "Instructions", "Due"]} rows={data?.assignments || []} />; }
function Announcements({ user, data, reload }) { return <CrudPage type="announcement" user={user} data={data} reload={reload} title="Kabar" eyebrow="Pengumuman" icon={Megaphone} fields={["Title", "Content", "Date"]} rows={data?.announcements || []} />; }

function CrudPage({ type, user, data, reload, title, eyebrow, icon: Icon, fields, rows }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // State untuk Pop-up Detail

  const save = async () => {
    setLoading(true);
    const r = await api(type, form);
    setLoading(false);
    
    if (r.ok) {
      setOpen(false);
      setForm({});
      reload();
    } else {
      alert("Gagal menyimpan: " + r.error);
    }
  };

  return (
    <>
      <Head
        eyebrow={eyebrow} title={title}
        action={user.role === "teacher" && (
          <button className="hero-button transition-transform active:scale-95 shadow-md" onClick={() => setOpen(true)}><Plus size={17} /> Tambah {title}</button>
        )}
      />
      <div className="cards">
        {rows.map((r, i) => {
          const contentText = r.Content || r.Instructions || r.content || r.instructions || "";
          return (
            <article 
              className="info-card shadow-sm transition-all hover:shadow-md hover:border-pink-300 cursor-pointer relative group" 
              key={i}
              onClick={() => setSelectedItem(r)} // Klik kartu untuk melihat teks panjang
            >
              <div className="info-icon"><Icon size={20} /></div>
              <div className="flex-1 pr-6">
                <span className="eyebrow">{r.Date || r.Due || "Ruang Belajar"}</span>
                <h2>{r.Title || r.title}</h2>
                <p className="line-clamp-2 text-gray-600">{contentText}</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye size={20} />
              </div>
            </article>
          );
        })}
        {!rows.length && <div className="panel empty">Belum ada {title.toLowerCase()}.</div>}
      </div>

      {/* Pop-up Detail Ketika Kartu Dipencet (Mengatasi Teks Panjang) */}
      {selectedItem && (
        <div className="overlay animate-fade" onClick={() => setSelectedItem(null)}>
          <div className="login-modal wide shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full bg-gray-100"
              onClick={() => setSelectedItem(null)}
            >
              <X size={20} />
            </button>
            <div className="modal-flower">✿</div>
            <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">{selectedItem.Date || selectedItem.Due || "Informasi"}</span>
            <h2 className="text-xl font-bold mt-1 mb-3 text-gray-800">{selectedItem.Title || selectedItem.title}</h2>
            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 max-h-60 overflow-y-auto mb-6 text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {selectedItem.Content || selectedItem.Instructions || selectedItem.content || selectedItem.instructions}
            </div>
            <button className="hero-button full" onClick={() => setSelectedItem(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
      
      {/* Modal Tambah Data untuk Guru */}
      {open && (
        <div className="overlay animate-fade" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Tambah {title} Baru</h2>
            {fields.map((f) => (
              <div key={f}>
                <label>{pretty(f)}</label>
                {f === "Content" || f === "Instructions" ? (
                  <textarea rows="5" value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>
                ) : (
                  <input type={f === "Date" ? "date" : f === "Due" ? "datetime-local" : "text"} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>
                )}
              </div>
            ))}
            <button className="hero-button full transition-transform active:scale-95 shadow-md" onClick={save} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Menyimpan..." : <><Send size={16} /> Simpan Data</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Students({ data }) {
  return (
    <>
      <Head eyebrow="Kelas" title="Daftar Murid" text="Perjalanan belajar yang unik untuk setiap anak." />
      <div className="student-grid">
        {(data?.students || []).map((s) => (
          <article className="student-card shadow-sm hover:shadow-md transition-all" key={s.Id}>
            <div className="avatar big bg-pink-100 text-pink-700 font-bold">{s.Name?.[0]?.toUpperCase() || "?"}</div>
            <div>
              <h2>{s.Name}</h2>
              <p>{s.Grade || "Murid"}</p>
              <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md">PIN: {s.PIN}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const [, data] = r.result.split(",");
      resolve({ name: file.name, type: file.type, data });
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function labelStatus(x) {
  return ({ present: "Hadir", sick: "Sakit", permission: "Izin", absent: "Alpa", Hadir: "Hadir", Sakit: "Sakit", Izin: "Izin", Alpa: "Alpa" }[x] || x);
}

function pretty(x) {
  return ({ Title: "Judul", Content: "Isi", Instructions: "Instruksi", Date: "Tanggal", Due: "Tenggat Waktu" }[x] || x);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
