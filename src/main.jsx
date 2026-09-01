import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BookOpen, CalendarCheck2, ChevronRight, Flower2, Heart,
  LockKeyhole, LogOut, Megaphone, Plus, Send, Sparkles, Upload, Users,
  MessageCircle, User, CreditCard, Award, Edit3, Home,
  Check, Circle, Leaf, Star, Menu, X, Bell, ArrowRight,
  BookMarked, Smile, Target
} from "lucide-react";
import { API_URL, APP_NAME } from "./config";
import "./styles.css";

const demo = {
  students: [
    {
      Id: "1",
      Name: "Alya",
      PIN: "1111",
      Role: "student",
      Grade: "4 SD",
      Price: "150000",
      Hobby: "Membaca Buku",
      Photo: ""
    }
  ],
  attendance: [],
  materials: [],
  announcements: [
    {
      Title: "Selamat datang",
      Content: "Jangan lupa isi absensi ya 🌷",
      Date: "2026-08-31"
    }
  ],
  evaluations: [],
  payments: []
};

async function api(action, payload = {}) {
  if (!API_URL || API_URL.trim() === "") {
    return localAction(action, payload);
  }

  try {
    const r = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...payload })
    });

    const text = await r.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      return {
        ok: false,
        error: "Gagal membaca data."
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: "Koneksi terputus."
    };
  }
}

function localAction(action, b) {
  if (action === "login") {
    const users = [
      ...demo.students,
      {
        Id: "teacher",
        Name: "Guru",
        PIN: "1234",
        Role: "teacher"
      }
    ];

    const u = users.find(
      x =>
        x.PIN === b.pin &&
        (!b.name ||
          x.Name.toLowerCase() === b.name.toLowerCase())
    );

    return u
      ? { ok: true, user: u }
      : { ok: false, error: "Nama atau PIN salah." };
  }

  if (action === "data") {
    return {
      ok: true,
      ...demo
    };
  }

  return { ok: true };
}

const fileToBase64 = file =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("rb_user") || "null")
  );

  const [page, setPage] = useState(
    () =>
      window.location.hash.replace("#", "") ||
      (user ? "dashboard" : "home")
  );

  const [data, setData] = useState(demo);
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const load = async () => {
    const r = await api("data");

    if (r.ok) {
      setData(r);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  useEffect(() => {
    const handleHash = () => {
      setPage(
        window.location.hash.replace("#", "") ||
        (user ? "dashboard" : "home")
      );
    };

    window.addEventListener("hashchange", handleHash);

    return () =>
      window.removeEventListener("hashchange", handleHash);
  }, [user]);

  const login = async (name, pin) => {
    setLoadingLogin(true);
    setNotice("");

    const r = await api("login", {
      name,
      pin
    });

    setLoadingLogin(false);

    if (!r.ok) {
      setNotice(r.error);
      return;
    }

    let loggedUser = r.user;

    const roleStr = String(
      loggedUser.Role || loggedUser.role || ""
    ).toLowerCase();

    const nameStr = String(
      loggedUser.Name || loggedUser.name || ""
    ).toLowerCase();

    if (
      nameStr === "guru" ||
      roleStr.includes("teach") ||
      roleStr.includes("admin")
    ) {
      loggedUser.role = "teacher";
    } else {
      loggedUser.role = "student";
    }

    setUser(loggedUser);

    localStorage.setItem(
      "rb_user",
      JSON.stringify(loggedUser)
    );

    setLoginOpen(false);
    window.location.hash = "dashboard";
    setNotice("");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rb_user");
    window.location.hash = "";
    setPage("home");
  };

  const go = p => {
    window.location.hash = p;
    setPage(p);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!user) {
    return (
      <>
        <Landing onLogin={() => setLoginOpen(true)} />

        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLogin={login}
          notice={notice}
          loading={loadingLogin}
        />
      </>
    );
  }

  return (
    <Shell
      user={user}
      page={page}
      setPage={go}
      logout={logout}
    >
      {page === "dashboard" && (
        <Dashboard
          user={user}
          data={data}
          go={go}
        />
      )}

      {page === "profile" && (
        <Profile
          user={user}
          reload={load}
          setUser={setUser}
        />
      )}

      {page === "attendance" && (
        <Attendance
          user={user}
          data={data}
          reload={load}
        />
      )}

      {page === "materials" && (
        <Materials
          user={user}
          data={data}
          reload={load}
        />
      )}

      {page === "evaluations" && (
        <Evaluations
          user={user}
          data={data}
          reload={load}
        />
      )}

      {page === "payments" && (
        <Payments
          user={user}
          data={data}
          reload={load}
        />
      )}

      {page === "announcements" && (
        <Announcements
          user={user}
          data={data}
          reload={load}
        />
      )}

      {page === "students" && (
        <Students data={data} />
      )}
    </Shell>
  );
}


/* =========================================================
   LANDING
========================================================= */

function Landing({ onLogin }) {
  return (
    <div className="landing">
      <div className="petal p1">✿</div>
      <div className="petal p2">✽</div>
      <div className="petal p3">❀</div>
      <div className="petal p4">✾</div>
      <div className="petal p5">❁</div>

      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-logo">
            <Flower2 />
          </div>

          <div>
            <b>{APP_NAME}</b>
            <span>Belajar dengan hati</span>
          </div>
        </div>

        <button
          className="ghost-button"
          onClick={onLogin}
        >
          <LockKeyhole size={16} />
          Masuk
        </button>
      </nav>

      <main className="hero">
        <div className="hero-copy">
          <div className="pill">
            <Sparkles size={14} />
            Tempat kecil untuk belajar lebih berarti
          </div>

          <h1>
            Belajar tumbuh
            <br />
            <i>seperti bunga.</i>
          </h1>

          <p>
            Ruang sederhana untuk absensi, materi,
            tugas, dan kabar belajar. Dibuat hangat
            untuk guru dan murid.
          </p>

          <button
            className="hero-button hero-button-large"
            onClick={onLogin}
          >
            Masuk ke Ruang Belajar
            <ChevronRight size={18} />
          </button>

          <div className="hero-note">
            <Heart size={14} />
            Dibuat untuk kelas kecil, dengan perhatian
            yang besar.
          </div>
        </div>

        <div className="landing-illustration">
          <div className="illustration-sun" />

          <div className="illustration-stem stem-a" />
          <div className="illustration-stem stem-b" />
          <div className="illustration-stem stem-c" />

          <div className="illustration-flower flower-a">
            ✿
          </div>

          <div className="illustration-flower flower-b">
            ❀
          </div>

          <div className="illustration-flower flower-c">
            ✾
          </div>

          <div className="illustration-leaf leaf-a" />
          <div className="illustration-leaf leaf-b" />
          <div className="illustration-leaf leaf-c" />
        </div>
      </main>

      <div className="landing-features">
        <Feature
          icon={<CalendarCheck2 />}
          title="Absensi"
          text="Catat kehadiran dengan mudah."
        />

        <Feature
          icon={<BookOpen />}
          title="Materi"
          text="Belajar dari materi yang rapi."
        />

        <Feature
          icon={<Heart />}
          title="Evaluasi"
          text="Pesan positif dari guru."
        />

        <Feature
          icon={<Megaphone />}
          title="Kabar"
          text="Tidak ketinggalan informasi."
        />
      </div>

      <footer>
        Dibuat dengan cinta oleh Adelia Ardabela ❤️
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="landing-feature">
      <div className="landing-feature-icon">
        {icon}
      </div>

      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}


/* =========================================================
   LOGIN
========================================================= */

function LoginModal({
  open,
  onClose,
  onLogin,
  notice,
  loading
}) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  if (!open) return null;

  return (
    <div
      className="overlay"
      onMouseDown={!loading ? onClose : undefined}
    >
      <div
        className="login-modal"
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          disabled={loading}
        >
          <X size={18} />
        </button>

        <div className="modal-flower">
          ✿
        </div>

        <h2>Selamat datang</h2>

        <p>
          Masuk ke ruang belajar kamu.
        </p>

        {notice && (
          <div className="notice">
            {notice}
          </div>
        )}

        <label>Nama</label>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Misal: Alya atau Guru"
          disabled={loading}
        />

        <label>PIN</label>

        <input
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="••••"
          type="password"
          maxLength="8"
          disabled={loading}
          onKeyDown={e => {
            if (e.key === "Enter") {
              onLogin(name, pin);
            }
          }}
        />

        <button
          className="hero-button full"
          onClick={() => onLogin(name, pin)}
          disabled={loading}
        >
          {loading ? (
            "Memeriksa..."
          ) : (
            <>
              Masuk
              <ChevronRight size={17} />
            </>
          )}
        </button>

        {!loading && (
          <button
            className="link-button"
            onClick={onClose}
          >
            Kembali
          </button>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   SHELL
========================================================= */

function Shell({
  user,
  page,
  setPage,
  logout,
  children
}) {
  const isTeacher = user.role === "teacher";

  const menus = isTeacher
    ? [
        ["dashboard", "Beranda", Home],
        ["attendance", "Absen", CalendarCheck2],
        ["materials", "Materi", BookOpen],
        ["evaluations", "Evaluasi", Award],
        ["students", "Murid", Users]
      ]
    : [
        ["dashboard", "Beranda", Home],
        ["attendance", "Absen", CalendarCheck2],
        ["materials", "Materi", BookOpen],
        ["evaluations", "Pesan", Award],
        ["profile", "Profil", User]
      ];

  const desktopMenus = isTeacher
    ? [
        ["dashboard", "Beranda", Flower2],
        ["profile", "Profil", User],
        ["attendance", "Absensi", CalendarCheck2],
        ["students", "Murid", Users],
        ["materials", "Materi", BookOpen],
        ["evaluations", "Evaluasi", Award],
        ["payments", "Paket", CreditCard],
        ["announcements", "Kabar", Megaphone]
      ]
    : [
        ["dashboard", "Beranda", Flower2],
        ["profile", "Profil Kamu", User],
        ["attendance", "Absensi", CalendarCheck2],
        ["materials", "Materi", BookOpen],
        ["evaluations", "Pesan Guru", Award],
        ["payments", "Paket", CreditCard],
        ["announcements", "Kabar", Megaphone]
      ];

  const firstName =
    (user.Name || user.name || "Kamu")
      .split(" ")[0];

  return (
    <div className="app">
      {/* DESKTOP SIDEBAR */}

      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Flower2 />
          </div>

          <div>
            <b>{APP_NAME}</b>
            <span>Belajar dengan hati</span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MENU UTAMA
        </div>

        <nav className="desktop-menu">
          {desktopMenus.map(([id, label, Icon]) => (
            <button
              className={
                page === id
                  ? "desktop-menu-item active"
                  : "desktop-menu-item"
              }
              onClick={() => setPage(id)}
              key={id}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <UserAvatar user={user} />

            <div className="user-mini-info">
              <b>{user.Name || user.name}</b>
              <span>
                {isTeacher ? "Guru" : "Murid"}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>


      {/* MAIN */}

      <main className="content">
        {/* MOBILE HEADER */}

        <header className="mobile-header">
          <div className="mobile-brand">
            <div className="brand-logo">
              <Flower2 />
            </div>

            <div>
              <b>{APP_NAME}</b>
              <span>
                Halo, {firstName} 🌷
              </span>
            </div>
          </div>

          <button
            className="mobile-avatar-button"
            onClick={() => setPage("profile")}
            aria-label="Profil"
          >
            <UserAvatar user={user} />
          </button>
        </header>

        <div className="content-inner">
          {children}
        </div>

        <footer className="app-footer">
          Dibuat dengan cinta oleh Adelia Ardabela ❤️
        </footer>
      </main>


      {/* MOBILE BOTTOM NAV */}

      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-inner">
          {menus.map(([id, label, Icon]) => (
            <button
              key={id}
              className={
                page === id
                  ? "mobile-nav-item active"
                  : "mobile-nav-item"
              }
              onClick={() => setPage(id)}
            >
              <span className="mobile-nav-icon">
                <Icon size={19} />
              </span>

              <span className="mobile-nav-label">
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function UserAvatar({ user }) {
  const name = user.Name || user.name || "U";

  if (user.Photo) {
    return (
      <img
        src={user.Photo}
        className="avatar-image"
        alt=""
      />
    );
  }

  return (
    <div className="avatar">
      {name[0].toUpperCase()}
    </div>
  );
}


/* =========================================================
   PAGE HEADER
========================================================= */

function Head({
  eyebrow,
  title,
  text,
  action
}) {
  return (
    <div className="page-head">
      <div className="page-head-copy">
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <p>{text}</p>
      </div>

      {action && (
        <div className="page-head-action">
          {action}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  data,
  go
}) {
  const userName = user.Name || user.name;
  const isTeacher = user.role === "teacher";

  const attendance =
    data?.attendance || [];

  const mine = isTeacher
    ? attendance
    : attendance.filter(
        x =>
          (x.Name || x.name) === userName
      );

  const present = mine.filter(
    x =>
      x.Status === "present" ||
      x.Status === "Hadir" ||
      x.status === "present" ||
      x.status === "Hadir"
  ).length;

  const materials =
    data?.materials || [];

  const evaluations =
    data?.evaluations || [];

  const myEvaluations =
    evaluations.filter(
      e =>
        (e.Student || e.student) === userName
    );

  const myReadMaterials =
    materials.filter(
      m =>
        (m.Viewers || []).includes(userName)
    ).length;

  const announcements =
    data?.announcements || [];

  const progressItems = [
    {
      icon: Smile,
      title: "Datang",
      text: "Siap belajar",
      done: present > 0
    },
    {
      icon: BookMarked,
      title: "Membaca",
      text: "Buka materi",
      done: myReadMaterials > 0
    },
    {
      icon: Star,
      title: "Bertumbuh",
      text: "Dapat catatan",
      done: myEvaluations > 0
    },
    {
      icon: Leaf,
      title: "Konsisten",
      text: "Terus mencoba",
      done:
        present >= 3 ||
        myReadMaterials >= 3
    }
  ];

  return (
    <div className="page-enter">
      <Head
        eyebrow="Ruang Belajar"
        title={`Halo, ${userName.split(" ")[0]} 🌷`}
        text={
          isTeacher
            ? "Mode Guru aktif. Mari lihat perkembangan kelas hari ini."
            : "Senang melihatmu kembali. Yuk belajar sedikit demi sedikit."
        }
      />

      {/* WELCOME */}

      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-label">
            CATATAN HARI INI
          </span>

          <h2>
            “Setiap halaman baru adalah
            kesempatan untuk tumbuh.”
          </h2>

          <p>
            Tidak perlu terburu-buru.
            Yang penting terus melangkah.
          </p>
        </div>

        <div className="welcome-decoration">
          <div className="welcome-circle">
            <Flower2 size={52} />
          </div>

          <span>✿</span>
          <span>❀</span>
          <span>✾</span>
        </div>
      </section>


      {/* STATS */}

      <div className="stats">
        {(isTeacher
          ? [
              [
                Users,
                data?.students?.length || 0,
                "Murid",
                "students"
              ],
              [
                CalendarCheck2,
                present,
                "Hadir",
                "attendance"
              ],
              [
                BookOpen,
                materials.length,
                "Materi",
                "materials"
              ],
              [
                Award,
                evaluations.length,
                "Evaluasi",
                "evaluations"
              ]
            ]
          : [
              [
                CalendarCheck2,
                present,
                "Hadir",
                "attendance"
              ],
              [
                BookOpen,
                materials.length,
                "Materi",
                "materials"
              ],
              [
                Award,
                myEvaluations.length,
                "Pesan",
                "evaluations"
              ],
              [
                Megaphone,
                announcements.length,
                "Kabar",
                "announcements"
              ]
            ]
        ).map(([Icon, value, label, target]) => (
          <button
            onClick={() => go(target)}
            className="stat"
            key={label}
          >
            <div className="stat-icon">
              <Icon size={19} />
            </div>

            <div className="stat-info">
              <span>{label}</span>
              <b>{value}</b>
            </div>

            <ArrowRight
              className="stat-arrow"
              size={15}
            />
          </button>
        ))}
      </div>


      {/* PROGRESS VISUAL */}

      {!isTeacher && (
        <LearningJourney
          items={progressItems}
        />
      )}


      {/* TEACHER OVERVIEW */}

      {isTeacher && (
        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-title">
              <div>
                <h2>Perjalanan Kelas</h2>
                <span>
                  Gambaran sederhana aktivitas belajar.
                </span>
              </div>
            </div>

            <div className="teacher-progress">
              <TeacherProgress
                icon={<Users size={18} />}
                label="Murid terdaftar"
                value={data?.students?.length || 0}
              />

              <TeacherProgress
                icon={<CalendarCheck2 size={18} />}
                label="Kehadiran tercatat"
                value={attendance.length}
              />

              <TeacherProgress
                icon={<BookOpen size={18} />}
                label="Materi tersedia"
                value={materials.length}
              />

              <TeacherProgress
                icon={<Heart size={18} />}
                label="Catatan perkembangan"
                value={evaluations.length}
              />
            </div>
          </div>

          <div className="panel soft-panel">
            <div className="soft-panel-flower">
              🌱
            </div>

            <span className="eyebrow">
              UNTUK GURU
            </span>

            <h2>
              Setiap kemajuan kecil
              tetap berarti.
            </h2>

            <p>
              Gunakan catatan evaluasi untuk
              memberikan semangat personal
              kepada setiap murid.
            </p>

            <button
              className="text-button"
              onClick={() => go("evaluations")}
            >
              Beri catatan
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}


/* =========================================================
   LEARNING JOURNEY
========================================================= */

function LearningJourney({ items }) {
  return (
    <section className="journey-card">
      <div className="journey-header">
        <div>
          <span className="eyebrow">
            PERJALANAN BELAJAR
          </span>

          <h2>
            Pelan-pelan, kamu tumbuh 🌱
          </h2>

          <p>
            Tidak harus sempurna. Yang penting
            terus mencoba.
          </p>
        </div>

        <div className="journey-flower">
          <Leaf size={24} />
        </div>
      </div>

      <div className="journey-track">
        {items.map((item, index) => {
          const Icon = item.icon;
          const nextDone =
            items[index + 1]?.done;

          return (
            <React.Fragment key={item.title}>
              <div
                className={
                  item.done
                    ? "journey-step done"
                    : "journey-step"
                }
              >
                <div className="journey-icon">
                  {item.done ? (
                    <Check size={18} />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>

                <b>{item.title}</b>
                <span>{item.text}</span>
              </div>

              {index < items.length - 1 && (
                <div
                  className={
                    item.done && nextDone
                      ? "journey-line filled"
                      : "journey-line"
                  }
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

function TeacherProgress({
  icon,
  label,
  value
}) {
  return (
    <div className="teacher-progress-item">
      <div className="round-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
    </div>
  );
}


/* =========================================================
   PROFILE
========================================================= */

function Profile({
  user,
  reload,
  setUser
}) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    hobby: user.Hobby || "",
    photo: user.Photo || ""
  });

  const [loading, setLoading] = useState(false);

  const userName =
    user.Name || user.name;

  const save = async () => {
    setLoading(true);

    await api("updateProfile", {
      name: userName,
      hobby: form.hobby,
      photo: form.photo
    });

    const updated = {
      ...user,
      Hobby: form.hobby,
      Photo: form.photo
    };

    setUser(updated);

    localStorage.setItem(
      "rb_user",
      JSON.stringify(updated)
    );

    setLoading(false);
    setOpen(false);

    reload();
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Personal"
        title="Profil Kamu"
        text="Ruang kecil untuk mengenal dirimu."
      />

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-decoration">
            ✿
          </div>

          <div className="profile-avatar">
            <UserAvatar user={user} />
          </div>

          <h2>{userName}</h2>

          <span className="role-pill">
            {user.role === "teacher"
              ? "Guru"
              : `Siswa ${user.Grade || ""}`}
          </span>

          {user.role === "student" && (
            <div className="profile-details">
              <div>
                <span>HOBI</span>
                <b>
                  {user.Hobby ||
                    "Belum diisi"}
                </b>
              </div>

              <div>
                <span>PAKET</span>
                <b>
                  Rp{" "}
                  {user.Price || "0"}
                </b>
              </div>
            </div>
          )}

          <button
            className="hero-button"
            onClick={() => setOpen(true)}
          >
            <Edit3 size={16} />
            Edit Profil
          </button>
        </section>
      </div>

      {open && (
        <div
          className="overlay"
          onMouseDown={() =>
            !loading && setOpen(false)
          }
        >
          <div
            className="login-modal wide"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setOpen(false)
              }
            >
              <X size={18} />
            </button>

            <div className="modal-flower">
              ✿
            </div>

            <h2>Edit Profil</h2>

            <label>
              Foto Profil
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                if (e.target.files?.[0]) {
                  setForm({
                    ...form,
                    photo:
                      await fileToBase64(
                        e.target.files[0]
                      )
                  });
                }
              }}
            />

            <label>
              Hobi / Cita-cita
            </label>

            <input
              value={form.hobby}
              onChange={e =>
                setForm({
                  ...form,
                  hobby: e.target.value
                })
              }
              placeholder="Misal: Membaca"
            />

            <button
              className="hero-button full"
              onClick={save}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Profil"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   ATTENDANCE
========================================================= */

function Attendance({
  user,
  data,
  reload
}) {
  const [status, setStatus] =
    useState("Hadir");

  const [note, setNote] =
    useState("");

  const [photo, setPhoto] =
    useState(null);

  const [sent, setSent] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const userName =
    user.Name || user.name;

  const mine =
    user.role === "teacher"
      ? data?.attendance || []
      : (data?.attendance || []).filter(
          x =>
            (x.Name || x.name) ===
            userName
        );

  const submit = async () => {
    setLoading(true);

    const r = await api("attendance", {
      name: userName,
      status,
      note,
      photo: photo
        ? await fileToBase64(photo)
        : null
    });

    setLoading(false);

    if (r.ok) {
      setSent(true);
      setNote("");
      setPhoto(null);
      reload();
    }
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Kehadiran"
        title="Absensi"
        text={
          user.role === "teacher"
            ? "Pantau kehadiran semua murid."
            : "Catat kehadiranmu hari ini."
        }
      />

      {user.role === "student" && (
        <section className="panel form-panel">
          <div className="form-heading">
            <div className="form-heading-icon">
              <Smile size={21} />
            </div>

            <div>
              <h2>
                Bagaimana kabarmu hari ini?
              </h2>

              <p>
                Pilih keadaanmu sebelum mulai
                belajar.
              </p>
            </div>
          </div>

          <div className="choice-grid">
            {[
              [
                "Hadir",
                "Hadir",
                "Saya mengikuti belajar.",
                "present"
              ],
              [
                "Sakit",
                "Sakit",
                "Saya sedang sakit.",
                "sick"
              ],
              [
                "Izin",
                "Izin",
                "Saya berhalangan hadir.",
                "permission"
              ],
              [
                "Alpa",
                "Alpa",
                "Saya tidak hadir.",
                "absent"
              ]
            ].map(item => (
              <button
                className={
                  status === item[0]
                    ? "choice active"
                    : "choice"
                }
                onClick={() =>
                  setStatus(item[0])
                }
                key={item[0]}
              >
                <span
                  className={
                    "choice-dot " +
                    item[3]
                  }
                />

                <b>{item[1]}</b>
                <small>{item[2]}</small>

                {status === item[0] && (
                  <span className="choice-check">
                    <Check size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <label>
            Catatan tambahan
          </label>

          <textarea
            value={note}
            onChange={e =>
              setNote(e.target.value)
            }
            placeholder="Tulis pesan untuk bu guru..."
            rows="3"
          />

          <label className="photo-input">
            <Upload size={18} />

            <span>
              {photo
                ? photo.name
                : "Upload foto (opsional)"}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={e =>
                setPhoto(
                  e.target.files?.[0] ||
                    null
                )
              }
            />
          </label>

          <button
            className="hero-button"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Send size={17} />
                Simpan absensi
              </>
            )}
          </button>

          {sent && (
            <div className="success">
              <Check size={15} />
              Absensi tersimpan 🌷
              Semangat belajarnya ya!
            </div>
          )}
        </section>
      )}

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Riwayat</h2>
            <span>
              Catatan kehadiran terbaru.
            </span>
          </div>
        </div>

        <div className="table">
          <div className="tr th">
            <span>Nama</span>
            <span>Tanggal</span>
            <span>Status</span>
            <span>Catatan</span>
          </div>

          {mine
            .slice(0, 30)
            .map((a, i) => (
              <div className="tr" key={i}>
                <span>
                  {a.Name || a.name}
                </span>

                <span>
                  {a.Date ||
                    a.date?.substring(
                      0,
                      10
                    ) ||
                    "-"}
                </span>

                <span>
                  <em
                    className={
                      "badge " +
                      getAttendanceClass(a)
                    }
                  >
                    {a.Status ||
                      a.status}
                  </em>
                </span>

                <span>
                  {a.Note ||
                    a.note ||
                    "-"}
                </span>
              </div>
            ))}

          {!mine.length && (
            <div className="empty">
              <CalendarCheck2 size={22} />
              Belum ada absensi.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getAttendanceClass(a) {
  const status =
    a.Status || a.status;

  if (
    status === "Hadir" ||
    status === "present"
  ) {
    return "present";
  }

  if (status === "Sakit") {
    return "sick";
  }

  if (status === "Alpa") {
    return "absent";
  }

  return "permission";
}


/* =========================================================
   MATERIALS
========================================================= */

function Materials({
  user,
  data,
  reload
}) {
  const [openAdd, setOpenAdd] =
    useState(false);

  const [form, setForm] =
    useState({});

  const [photo, setPhoto] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [selected, setSelected] =
    useState(null);

  const [comment, setComment] =
    useState("");

  const userName =
    user.Name || user.name;

  const rows =
    data?.materials || [];

  const openMat = async m => {
    setSelected(m);

    if (
      user.role === "student" &&
      !(m.Viewers || []).includes(
        userName
      )
    ) {
      await api("markRead", {
        id: m.Id,
        name: userName
      });

      reload();
    }
  };

  const save = async () => {
    setLoading(true);

    await api("material", {
      Id: "m_" + Date.now(),
      Title: form.Title,
      Content: form.Content,
      Date: new Date()
        .toISOString()
        .split("T")[0],
      Photo: photo,
      Viewers: [],
      Comments: []
    });

    setLoading(false);
    setOpenAdd(false);
    setForm({});
    setPhoto(null);
    reload();
  };

  const sendKomen = async () => {
    if (!comment.trim()) return;

    await api("comment", {
      id: selected.Id,
      name: userName,
      text: comment
    });

    setSelected({
      ...selected,
      Comments: [
        ...(selected.Comments || []),
        {
          name: userName,
          text: comment,
          time: "Baru saja"
        }
      ]
    });

    setComment("");
    reload();
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Pembelajaran"
        title="Materi Harian"
        text="Materi dibuat rapi agar mudah dibaca."
        action={
          user.role === "teacher" && (
            <button
              className="hero-button"
              onClick={() =>
                setOpenAdd(true)
              }
            >
              <Plus size={17} />
              Buat Materi
            </button>
          )
        }
      />

      <div className="cards">
        {rows.map((r, i) => {
          const isUnread =
            user.role === "student" &&
            !(r.Viewers || []).includes(
              userName
            );

          return (
            <article
              className="info-card material-card"
              key={i}
              onClick={() => openMat(r)}
            >
              {isUnread && (
                <div className="new-dot">
                  Baru
                </div>
              )}

              <div className="info-icon">
                <BookOpen size={20} />
              </div>

              <div className="info-card-content">
                <span className="eyebrow">
                  {r.Date}
                </span>

                <h2>{r.Title}</h2>

                <p className="line-clamp">
                  {r.Content}
                </p>

                <div className="card-meta">
                  <span>
                    <Users size={12} />
                    {(r.Viewers || [])
                      .length}{" "}
                    Dibaca
                  </span>

                  <span>
                    <MessageCircle size={12} />
                    {(r.Comments || [])
                      .length}{" "}
                    Komen
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {!rows.length && (
          <div className="panel empty">
            <BookOpen size={22} />
            Belum ada materi.
          </div>
        )}
      </div>

      {selected && (
        <div
          className="overlay"
          onClick={() =>
            setSelected(null)
          }
        >
          <div
            className="material-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >
            {selected.Photo && (
              <img
                src={selected.Photo}
                className="material-cover"
                alt=""
              />
            )}

            <div className="material-modal-content">
              <button
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                <X size={18} />
              </button>

              <span className="badge">
                {selected.Date}
              </span>

              <h2>
                {selected.Title}
              </h2>

              <div className="material-text">
                {selected.Content}
              </div>

              <hr />

              <h3>
                Ruang Diskusi
              </h3>

              <div className="comments">
                {(selected.Comments ||
                  []).map((c, i) => (
                  <div
                    className="comment"
                    key={i}
                  >
                    <div className="comment-avatar">
                      {c.name?.[0] ||
                        "U"}
                    </div>

                    <div className="comment-body">
                      <div className="comment-name">
                        {c.name}
                        <span>
                          {c.time}
                        </span>
                      </div>

                      <div className="comment-text">
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="comment-form">
                <input
                  value={comment}
                  onChange={e =>
                    setComment(
                      e.target.value
                    )
                  }
                  placeholder="Tulis pesan..."
                  onKeyDown={e =>
                    e.key === "Enter" &&
                    sendKomen()
                  }
                />

                <button
                  className="hero-button"
                  onClick={sendKomen}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openAdd && (
        <div
          className="overlay"
          onMouseDown={() =>
            !loading &&
            setOpenAdd(false)
          }
        >
          <div
            className="login-modal wide"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setOpenAdd(false)
              }
            >
              <X size={18} />
            </button>

            <div className="modal-flower">
              ✿
            </div>

            <h2>Buat Materi</h2>

            <label>
              Judul Materi
            </label>

            <input
              value={form.Title || ""}
              onChange={e =>
                setForm({
                  ...form,
                  Title:
                    e.target.value
                })
              }
            />

            <label>
              Penjelasan Materi
            </label>

            <textarea
              rows="5"
              value={
                form.Content || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Content:
                    e.target.value
                })
              }
            />

            <label>
              Foto Pendukung
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                if (e.target.files?.[0]) {
                  setPhoto(
                    await fileToBase64(
                      e.target.files[0]
                    )
                  );
                }
              }}
            />

            <button
              className="hero-button full"
              onClick={save}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Posting Materi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   EVALUATIONS
========================================================= */

function Evaluations({
  user,
  data,
  reload
}) {
  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const userName =
    user.Name || user.name;

  const rows =
    user.role === "teacher"
      ? data?.evaluations || []
      : (data?.evaluations || []).filter(
          r => r.Student === userName
        );

  const save = async () => {
    if (!form.Student || !form.Note) {
      alert(
        "Pilih siswa dan isi catatan!"
      );
      return;
    }

    setLoading(true);

    await api("evaluation", form);

    setLoading(false);
    setOpen(false);
    setForm({});
    reload();
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Evaluasi"
        title="Catatan Belajar"
        text="Pesan dan catatan khusus untuk murid."
        action={
          user.role === "teacher" && (
            <button
              className="hero-button"
              onClick={() =>
                setOpen(true)
              }
            >
              <Plus size={17} />
              Beri Catatan
            </button>
          )
        }
      />

      <div className="cards">
        {rows.map((r, i) => (
          <article
            className="info-card"
            key={i}
          >
            <div className="info-icon">
              <Heart size={20} />
            </div>

            <div className="info-card-content">
              <span className="eyebrow">
                {r.Date}
              </span>

              <h2>{r.Student}</h2>

              <p>{r.Note}</p>
            </div>
          </article>
        ))}

        {!rows.length && (
          <div className="panel empty">
            <Heart size={22} />
            Belum ada catatan evaluasi.
          </div>
        )}
      </div>

      {open && (
        <div
          className="overlay"
          onMouseDown={() =>
            !loading &&
            setOpen(false)
          }
        >
          <div
            className="login-modal wide"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setOpen(false)
              }
            >
              <X size={18} />
            </button>

            <div className="modal-flower">
              ✿
            </div>

            <h2>Beri Evaluasi</h2>

            <label>
              Pilih Siswa
            </label>

            <select
              value={
                form.Student || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Student:
                    e.target.value
                })
              }
            >
              <option value="">
                -- Pilih --
              </option>

              {(data?.students ||
                []).map(s => (
                <option
                  key={s.Id}
                  value={s.Name}
                >
                  {s.Name}
                </option>
              ))}
            </select>

            <label>
              Catatan Guru
            </label>

            <textarea
              rows="4"
              value={
                form.Note || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Note:
                    e.target.value
                })
              }
              placeholder="Pesan positif untuk murid..."
            />

            <button
              className="hero-button full"
              onClick={save}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Kirim Catatan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   PAYMENTS
========================================================= */

function Payments({
  user,
  data,
  reload
}) {
  const userName =
    user.Name || user.name;

  const rows =
    user.role === "teacher"
      ? data?.payments || []
      : (data?.payments || []).filter(
          r => r.Student === userName
        );

  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const save = async () => {
    setLoading(true);

    await api("payment", form);

    setLoading(false);
    setOpen(false);
    setForm({});
    reload();
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Administrasi"
        title="Info Paket"
        text="Riwayat pembayaran paket bimbingan."
        action={
          user.role === "teacher" && (
            <button
              className="hero-button"
              onClick={() =>
                setOpen(true)
              }
            >
              <Plus size={17} />
              Tambah Data
            </button>
          )
        }
      />

      <div className="cards">
        {rows.map((r, i) => (
          <article
            className="info-card"
            key={i}
          >
            <div className="info-icon">
              <CreditCard size={20} />
            </div>

            <div className="payment-content">
              <div>
                <span className="eyebrow">
                  {r.Date}
                </span>

                <h2>{r.Student}</h2>
              </div>

              <div className="payment-right">
                <b>
                  Rp {r.Amount}
                </b>

                <span className="badge">
                  {r.Status}
                </span>
              </div>
            </div>
          </article>
        ))}

        {!rows.length && (
          <div className="panel empty">
            <CreditCard size={22} />
            Belum ada data pembayaran.
          </div>
        )}
      </div>

      {open && (
        <div
          className="overlay"
          onMouseDown={() =>
            !loading &&
            setOpen(false)
          }
        >
          <div
            className="login-modal wide"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setOpen(false)
              }
            >
              <X size={18} />
            </button>

            <div className="modal-flower">
              ✿
            </div>

            <h2>
              Catat Pembayaran
            </h2>

            <label>Siswa</label>

            <select
              value={
                form.Student || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Student:
                    e.target.value
                })
              }
            >
              <option value="">
                -- Pilih --
              </option>

              {(data?.students ||
                []).map(s => (
                <option
                  key={s.Id}
                  value={s.Name}
                >
                  {s.Name}
                </option>
              ))}
            </select>

            <label>
              Nominal
            </label>

            <input
              type="number"
              value={
                form.Amount || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Amount:
                    e.target.value
                })
              }
              placeholder="150000"
            />

            <label>
              Status
            </label>

            <input
              value={
                form.Status || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Status:
                    e.target.value
                })
              }
              placeholder="Lunas"
            />

            <button
              className="hero-button full"
              onClick={save}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

function Announcements({
  user,
  data,
  reload
}) {
  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const save = async () => {
    setLoading(true);

    await api("announcement", {
      ...form,
      Date: new Date()
        .toISOString()
        .split("T")[0]
    });

    setLoading(false);
    setOpen(false);
    setForm({});
    reload();
  };

  return (
    <div className="page-enter">
      <Head
        eyebrow="Kabar"
        title="Pengumuman"
        text="Pesan penting dari guru untuk kelas."
        action={
          user.role === "teacher" && (
            <button
              className="hero-button"
              onClick={() =>
                setOpen(true)
              }
            >
              <Plus size={17} />
              Kabar Baru
            </button>
          )
        }
      />

      <div className="cards">
        {(data?.announcements ||
          []).map((r, i) => (
          <article
            className="info-card"
            key={i}
          >
            <div className="info-icon">
              <Megaphone size={20} />
            </div>

            <div className="info-card-content">
              <span className="eyebrow">
                {r.Date}
              </span>

              <h2>{r.Title}</h2>

              <p>{r.Content}</p>
            </div>
          </article>
        ))}

        {!(data?.announcements ||
          []).length && (
          <div className="panel empty">
            <Megaphone size={22} />
            Belum ada kabar.
          </div>
        )}
      </div>

      {open && (
        <div
          className="overlay"
          onMouseDown={() =>
            !loading &&
            setOpen(false)
          }
        >
          <div
            className="login-modal wide"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                !loading &&
                setOpen(false)
              }
            >
              <X size={18} />
            </button>

            <div className="modal-flower">
              ✿
            </div>

            <h2>
              Buat Pengumuman
            </h2>

            <label>Judul</label>

            <input
              value={
                form.Title || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Title:
                    e.target.value
                })
              }
            />

            <label>
              Isi Kabar
            </label>

            <textarea
              rows="4"
              value={
                form.Content || ""
              }
              onChange={e =>
                setForm({
                  ...form,
                  Content:
                    e.target.value
                })
              }
            />

            <button
              className="hero-button full"
              onClick={save}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Kirim Kabar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   STUDENTS
========================================================= */

function Students({ data }) {
  return (
    <div className="page-enter">
      <Head
        eyebrow="Kelas"
        title="Murid"
        text="Daftar seluruh siswa aktif."
      />

      <div className="student-grid">
        {(data?.students || [])
          .map(s => (
            <article
              className="student-card"
              key={s.Id}
            >
              <div className="student-avatar">
                {s.Photo ? (
                  <img
                    src={s.Photo}
                    alt=""
                  />
                ) : (
                  s.Name?.[0]
                )}
              </div>

              <div>
                <h2>{s.Name}</h2>

                <p>
                  {s.Grade ||
                    "Murid SD"}
                </p>

                <span className="student-pin">
                  PIN: {s.PIN}
                </span>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}


ReactDOM
  .createRoot(
    document.getElementById("root")
  )
  .render(<App />);