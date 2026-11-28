
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  display_name: string;
  role: "coach" | "student";
};

const menu = [
  { id: "home", icon: "⌂", label: "Genel Bakış" },
  { id: "timer", icon: "◷", label: "Çalışma Merkezi" },
  { id: "tasks", icon: "✓", label: "Görevler" },
  { id: "exams", icon: "▤", label: "Denemeler" },
  { id: "analysis", icon: "↗", label: "Analizler" },
  { id: "notes", icon: "▧", label: "Yanlış Defteri" },
];

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState<"pomodoro" | "stopwatch">("pomodoro");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const [focusMinutes, setFocusMinutes] = useState(25);

  async function loadProfile(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", id)
      .single();

    if (error) {
      setError("Profil yüklenemedi: " + error.message);
      setProfile(null);
      return;
    }

    if (data.role !== "coach" && data.role !== "student") {
      setError("Kullanıcı rolü geçersiz.");
      setProfile(null);
      return;
    }

    setProfile(data as Profile);
    setError("");
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        await loadProfile(data.session.user.id);
      }

      if (mounted) setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          setProfile(null);
          return;
        }

        if (event === "SIGNED_IN") {
          setTimeout(() => {
            if (mounted) loadProfile(session.user.id);
          }, 0);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((old) => {
        if (mode === "pomodoro" && old <= 1) {
          setRunning(false);
          return 0;
        }
        return mode === "pomodoro" ? old - 1 : old + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else if (data.user) await loadProfile(data.user.id);

    setBusy(false);
  }

  async function logout() {
    setRunning(false);
    await supabase.auth.signOut();
    setProfile(null);
  }

  function changeMode(next: "pomodoro" | "stopwatch") {
    setRunning(false);
    setMode(next);
    setSeconds(next === "pomodoro" ? focusMinutes * 60 : 0);
  }

  function resetTimer() {
    setRunning(false);
    setSeconds(mode === "pomodoro" ? focusMinutes * 60 : 0);
  }

  
function currentElapsed() {
  if (!session) return 0;

  if (session.status === "paused" || !session.last_started_at) {
    return session.duration_seconds;
  }

  return session.duration_seconds + Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(session.last_started_at).getTime()) / 1000
    )
  );
}

async function startTimer() {
  if (!profile || saving) return;

  setSaving(true);
  setSessionError("");

  const now = new Date().toISOString();
  const target = mode === "pomodoro" ? focusMinutes * 60 : null;


  if (!profile) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}>
        <form onSubmit={login} style={{ ...cardStyle, width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 34 }}>ÇOMAR<span style={{ color: "#8b7cff" }}>.</span></h1>
          <p className="muted">YKS 2029 · SAYISAL</p>
          <h2>Tekrar hoş geldin 👋</h2>

          <label>E-posta</label>
          <input required type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle} />

          <label>Şifre</label>
          <input required type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle} />

          {error && <p style={{ color: "#f87171" }}>{error}</p>}

          <button disabled={busy} style={{ ...buttonStyle, width: "100%" }}>
            {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </main>
    );
  }

  const isCoach = profile.role === "coach";
  const activeMenu = menu.filter(item =>
    isCoach || item.id !== "notes"
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          ÇOMAR<span>.</span>
          <p className="muted" style={{ fontSize: 11, letterSpacing: 1 }}>
            YKS 2029 PLATFORM
          </p>
        </div>

        <p className="muted" style={{ fontSize: 10, paddingLeft: 12 }}>
          MENÜ
        </p>

        <nav>
          {activeMenu.map(item => (
            <button key={item.id}
              className={`nav-item ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>

<span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 35, padding: 12 }}>
          <p className="muted" style={{ fontSize: 11 }}>OTURUM AÇAN</p>
          <strong>{profile.display_name}</strong>
          <p className="muted" style={{ fontSize: 12 }}>
            {isCoach ? "Koç hesabı" : "Öğrenci hesabı"}
          </p>
          <button className="secondary-btn" onClick={logout}
            style={{ width: "100%", marginTop: 10 }}>
            Çıkış Yap ↗
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
        }}>
          <div>
            <p className="muted" style={{ fontSize: 12 }}>
              {isCoach ? "KOÇ MERKEZİ" : "ÖĞRENCİ MERKEZİ"}
            </p>
            <h1 style={{ fontSize: 27, margin: "5px 0" }}>
              {menu.find(x => x.id === tab)?.label || "Genel Bakış"}
            </h1>
          </div>
          <span className="secondary-btn">● YKS 2029 · SAYISAL</span>
        </header>

        {tab === "home" && (
          <>
            <section style={{ marginBottom: 25 }}>
              <h2>Merhaba, {profile.display_name} 👋</h2>
              <p className="muted">
                {isCoach
                  ? "ÇOMAR'ın gelişimini bugün de yakından takip et."
                  : "Bugün hedeflerine bir adım daha yaklaş."}
              </p>
            </section>

            <section className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))"
            }}>
              {[
                ["Günlük çalışma", "—", "Veriler bağlanmayı bekliyor"],
                ["Tamamlanan görev", "—", "Henüz veri yok"],
                ["Deneme neti", "—", "Henüz veri yok"],
                ["Hedef sınav", "2029", "Sayısal"],
              ].map(([title, value, note]) => (
                <div className="stat-card" key={title}>
                  <p className="muted">{title}</p>
                  <div className="stat-value">{value}</div>
                  <p className="muted" style={{ fontSize: 11 }}>{note}</p>
                </div>
              ))}
            </section>

            <section className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              marginTop: 22,
            }}>
              <div style={cardStyle}>
                <h3>Günlük hedef</h3>
                <p className="muted">Çalışma hedefini belirle</p>
                <div className="progress" style={{ marginTop: 20 }}>
                  <div className="progress-fill" style={{ width: "0%" }} />
                </div>
                <p className="muted" style={{ fontSize: 12 }}>
                  Çalışma kayıtları henüz bağlanmadı.
                </p>
              </div>

              <div style={cardStyle}>
                <h3>Hızlı erişim</h3>
                <p className="muted">Çalışmaya hemen başla.</p>
                <button style={buttonStyle}
                  onClick={() => setTab("timer")}>
                  ◷ Çalışma merkezini aç
                </button>
              </div>
            </section>
          </>
        )}

        {tab === "timer" && (
          <section style={{ ...cardStyle, maxWidth: 650, margin: "auto", textAlign: "center" }}>
            <p className="muted">ÇALIŞMA MERKEZİ</p>
            <h2>Odaklanma zamanı.</h2>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              margin: "25px 0",
              flexWrap: "wrap",
            }}>
              <button className="secondary-btn"
                onClick={() => changeMode("pomodoro")}>
                Pomodoro
              </button>
              <button className="secondary-btn"
                onClick={() => changeMode("stopwatch")}>
                Süresiz Sayaç
              </button>
            </div>

            {mode === "pomodoro" && (
              <div style={{ marginBottom: 15 }}>
                <label className="muted">Odak süresi</label>
                <select value={focusMinutes}
                  disabled={running}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setFocusMinutes(v);
                    setSeconds(v * 60);
                  }}
                  style={inputStyle}>
                  <option value={25}>25 dakika</option>
                  <option value={30}>30 dakika</option>
                  <option value={45}>45 dakika</option>
                  <option value={50}>50 dakika</option>
                  <option value={60}>60 dakika</option>
                </select>
              </div>
            )}

            <div style={{
              fontSize: "clamp(45px,10vw,76px)",
              fontWeight: 800,
              letterSpacing: 2,
              margin: "25px 0",
            }}>
              {formatTime(seconds)}
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
            }}>
              <button style={buttonStyle}
                onClick={() => setRunning(!running)}>
                {running ? "Duraklat" : "Başlat"}
              </button>
              <button className="secondary-btn" onClick={resetTimer}>
                Sıfırla
              </button>
            </div>

            <p className="muted" style={{ marginTop: 25, fontSize: 12 }}>
              {running ? "Odaklanma devam ediyor..." : "Hazır olduğunda başla."}
            </p>
          </section>
        )}

        {tab !== "home" && tab !== "timer" && (
          <section style={cardStyle}>
            <h2>{menu.find(x => x.id === tab)?.label}</h2>
            <p className="muted">
              Bu modülün tasarımı hazırlanıyor. Bir sonraki geliştirme
              aşamasında gerçek veritabanı bağlantısı eklenecek.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: 13,
  marginTop: 8,
  marginBottom: 18,
  background: "#182235",
  color: "white",
  border: "1px solid #263247",
  borderRadius: 10,
};
