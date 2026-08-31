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
  Loader2 
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

const demo = {
  students: [],
  attendance: [],
  materials: [],
  assignments: [],
  announcements: [],
  submissions: [],
};

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
      return { ok: false, error: "Data dari Google tidak dapat dibaca. Pastikan URL sudah berakhiran /exec." };
    }
  } catch (error) {
    console.error("Kesalahan API:", error);
    return { ok: false, error: "Gagal terhubung! Periksa koneksi internet atau link di config.js." };
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
  
  // PERBAIKAN 1: Cek status login saat reload agar tidak stuk di logo
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

  const load = async () => {
    const r = await api("data");
    if (r.ok) setData(r);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  // PERBAIKAN 2: Menghubungkan tombol "Back" browser dengan riwayat menu web
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

  // Fungsi baru untuk berpindah halaman dan mengubah link di atas (URL)
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
        <Landing onLogin={() => setLoginOpen(true)} />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} notice={notice} loading={isLoggingIn} />
      </>
    );

  return (
    <Shell user={user} page={page} setPage={navigate} logout={logout}>
      {page === "dashboard" ? (
        <Dashboard user={user} data={data} go={navigate} />
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

function Landing({ onLogin }) {
  return (
    <div className="landing">
      <div className="petal p1">✿</div><div className="petal p2">✽</div>
      <div className="petal p3">❀</div><div className="petal p4">✾</div>
      <div className="petal p5">❁</div>
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-logo"><Flower2 /></div>
          <div>
            <b>{APP_NAME || "Ruang Belajar"}</b>
            <span>Belajar dengan hati</span>
          </div>
        </div>
        <button className="ghost-button" onClick={onLogin}>
          <LockKeyhole size={16} /> Masuk
        </button>
      </nav>
      <main className="hero">
        <div className="hero-copy">
          <div className="pill">
            <Sparkles size={14} /> Tempat kecil untuk belajar lebih berarti
          </div>
          <h1>
            Belajar tumbuh
            <br />
            <i>seperti bunga.</i>
          </h1>
          <p>
            Ruang sederhana untuk absensi, materi, tugas, dan kabar belajar. Dibuat hangat untuk guru dan murid.
          </p>
          <button className="hero-button" onClick={onLogin}>
            Masuk ke Kelas <ChevronRight size={18} />
          </button>
        </div>
      </main>
      <section className="features">
        <div><CalendarCheck2 /><b>Absensi</b><span>Catat kehadiran.</span></div>
        <div><BookOpen /><b>Materi</b><span>Belajar hari ini.</span></div>
        <div><ClipboardCheck /><b>Tugas</b><span>Kumpulkan tugas.</span></div>
      </section>
      <footer>Dibuat untuk belajar dengan tenang 🌷</footer>
    </div>
  );
}

function LoginModal({ open, onClose, onLogin, notice, loading }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={!loading ? onClose : undefined}>
      <div className="login-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-flower">✿</div>
        <h2>Selamat datang</h2>
        <p>Masuk ke ruang belajar kamu.</p>
        
        {notice && (
          <div className="notice" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #f87171" }}>
            {notice}
          </div>
        )}
        
        <label>Nama (Sesuai di tabel murid)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Alya"
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        />
        
        <label>PIN</label>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          type="password"
          maxLength="8"
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        />
        
        <button 
          className="hero-button full" 
          onClick={() => onLogin(name, pin)}
          disabled={loading}
          style={{ display: "flex", gap: "8px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Memeriksa...</>
          ) : (
            <>Masuk <ChevronRight size={17} /></>
          )}
        </button>
        
        {!loading && <button className="link-button" onClick={onClose}>Kembali</button>}
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
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
      <aside>
        <div className="brand dark">
          <div className="brand-logo"><Flower2 /></div>
          <div><b>{APP_NAME || "Ruang Belajar"}</b></div>
        </div>
        <nav>
          {menus.map(([id, l, I]) => (
            <button className={page === id ? "sel" : ""} onClick={() => setPage(id)} key={id}>
              <I size={17} />{l}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="user-mini">
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <b>{user.name}</b>
              <span>{user.role === "teacher" ? "Guru" : "Murid"}</span>
            </div>
          </div>
          <button onClick={logout}><LogOut size={16} /> Keluar</button>
        </div>
      </aside>
      <main className="content">
        <header className="mobile-brand">
          <div className="brand">
            <div className="brand-logo"><Flower2 /></div>
            <b>{APP_NAME || "Ruang Belajar"}</b>
          </div>
        </header>
        {children}
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

function Dashboard({ user, data, go }) {
  // PERBAIKAN 3: Pengaman (?. || []) agar web tidak blank kalau data dari Google telat/kosong
  const att = user.role === "teacher" ? (data?.attendance || []) : (data?.attendance || []).filter((x) => x.Name === user.name);
  const present = att.filter((x) => x.Status === "present" || x.Status === "Hadir").length;

  return (
    <>
      <Head
        eyebrow="Ruang Belajar"
        title={`Halo, ${user.name.split(" ")[0]} 🌷`}
        text={user.role === "teacher" ? "Semoga kegiatan belajar hari ini berjalan menyenangkan." : "Yuk belajar sedikit demi sedikit."}
      />
      <div className="quote-card">
        <div>
          <span>CATATAN HARI INI</span>
          <h2>“Setiap halaman baru adalah kesempatan untuk tumbuh.”</h2>
        </div>
        <div className="quote-flower">❀</div>
      </div>
      <div className="stats">
        {(user.role === "teacher"
          ? [[Users, data?.students?.length || 0, "Murid", "students"], [CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length || 0, "Materi", "materials"], [ClipboardCheck, data?.assignments?.length || 0, "Tugas", "assignments"]]
          : [[CalendarCheck2, present, "Hadir", "attendance"], [BookOpen, data?.materials?.length || 0, "Materi", "materials"], [ClipboardCheck, data?.assignments?.length || 0, "Tugas", "assignments"], [Megaphone, data?.announcements?.length || 0, "Kabar", "announcements"]]
        ).map(([I, v, l, p]) => (
          <button onClick={() => go(p)} className="stat" key={l}><I /><span>{l}</span><b>{v}</b></button>
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
      <Head eyebrow="Kehadiran" title="Absensi" text={user.role === "teacher" ? "Pantau kehadiran murid." : "Catat kehadiranmu."} />
      {user.role === "student" && (
        <section className="panel form-panel">
          <h2>Bagaimana kabarmu hari ini?</h2>
          <div className="choice-grid">
            {[["present", "Hadir"], ["sick", "Sakit"], ["permission", "Izin"], ["absent", "Alpa"]].map((x) => (
              <button className={status === x[0] ? "choice active" : "choice"} onClick={() => setStatus(x[0])} key={x[0]}>
                <span className={"dot " + x[0]}></span><b>{x[1]}</b>
              </button>
            ))}
          </div>
          <label>Catatan (Opsional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis keterangan..." rows="2" disabled={loading}/>
          
          <label className="photo-input">
            <Upload size={18} />
            <span>{photo ? photo.name : "Upload bukti foto absen"}</span>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} disabled={loading}/>
          </label>
          
          <button className="hero-button" onClick={submit} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }}/> Mengirim...</> : <><Send size={17} /> Simpan absensi</>}
          </button>
          
          {sent && <div className="success">Yeay! Absensi tersimpan 🌷</div>}
        </section>
      )}
      <section className="panel">
        <div className="panel-title"><div><h2>Riwayat</h2></div></div>
        <div className="table">
          <div className="tr th"><span>Nama</span><span>Tanggal</span><span>Status</span><span>Catatan</span></div>
          {mine.slice(0, 30).map((a, i) => (
            <div className="tr" key={i}>
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

function Materials({ user, data, reload }) { return <CrudPage type="material" user={user} data={data} reload={reload} title="Materi" eyebrow="Pembelajaran" icon={BookOpen} fields={["Title", "Content", "Date"]} rows={data?.materials || []} />; }
function Assignments({ user, data, reload }) { return <CrudPage type="assignment" user={user} data={data} reload={reload} title="Tugas" eyebrow="Latihan" icon={ClipboardCheck} fields={["Title", "Instructions", "Due"]} rows={data?.assignments || []} />; }
function Announcements({ user, data, reload }) { return <CrudPage type="announcement" user={user} data={data} reload={reload} title="Kabar" eyebrow="Pengumuman" icon={Megaphone} fields={["Title", "Content", "Date"]} rows={data?.announcements || []} />; }

function CrudPage({ type, user, data, reload, title, eyebrow, icon: Icon, fields, rows }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

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
          <button className="hero-button" onClick={() => setOpen(true)}><Plus size={17} /> Tambah</button>
        )}
      />
      <div className="cards">
        {rows.map((r, i) => (
          <article className="info-card" key={i}>
            <div className="info-icon"><Icon size={20} /></div>
            <div>
              <span className="eyebrow">{r.Date || r.Due || "Ruang Belajar"}</span>
              <h2>{r.Title || r.title}</h2>
              <p>{r.Content || r.Instructions || r.content || r.instructions}</p>
            </div>
          </article>
        ))}
        {!rows.length && <div className="panel empty">Belum ada data.</div>}
      </div>
      
      {open && (
        <div className="overlay" onMouseDown={() => !loading && setOpen(false)}>
          <div className="login-modal wide" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Tambah {title}</h2>
            {fields.map((f) => (
              <div key={f}>
                <label>{pretty(f)}</label>
                {f === "Content" || f === "Instructions" ? (
                  <textarea rows="4" value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>
                ) : (
                  <input type={f === "Date" ? "date" : f === "Due" ? "datetime-local" : "text"} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} disabled={loading}/>
                )}
              </div>
            ))}
            <button className="hero-button full" onClick={save} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Menyimpan..." : <><Send size={16} /> Simpan</>}
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
      <Head eyebrow="Kelas" title="Murid" text="Perjalanan belajar yang berbeda." />
      <div className="student-grid">
        {(data?.students || []).map((s) => (
          <article className="student-card" key={s.Id}>
            <div className="avatar big">{s.Name?.[0]?.toUpperCase() || "?"}</div>
            <div>
              <h2>{s.Name}</h2>
              <p>{s.Grade || "Murid"}</p>
              <span>PIN: {s.PIN}</span>
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
