
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  display_name: string;
  role: "coach" | "student";
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      setError("Profil yüklenemedi: " + error.message);
      return;
    }

    if (data.role !== "coach" && data.role !== "student") {
      setError("Kullanıcı rolü geçersiz.");
      return;
    }

    setProfile(data as Profile);
    setError("");
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        await loadProfile(data.session.user.id);
      }

      if (mounted) setLoading(false);
    }

    initialize();

    const { data: listener } =
      supabase.auth.onAuthStateChange((event, session) => {
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
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      await loadProfile(data.user.id);
    }

    setBusy(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
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

  const buttonStyle: React.CSSProperties = {
    padding: 13,
    borderRadius: 10,
    border: "none",
    background: "#6366f1",
    color: "white",
    fontWeight: 700,
    width: "100%",
  };

  if (loading) {
    return <main className="container" style={{padding:50}}>Yükleniyor...</main>;
  }

  if (!profile) {
    return (
      <main className="container" style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center"
      }}>
        <form onSubmit={login} className="card" style={{width:"100%",maxWidth:420}}>
          <h1 style={{fontSize:30}}>
            ÇOMAR<span style={{color:"#818cf8"}}>.</span>
          </h1>
          <p className="muted">YKS 2029 • SAYISAL</p>
          <h2>Hoş geldin 👋</h2>

          <label>E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={inputStyle}
          />

          <label>Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={e=>setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <p style={{color:"#f87171"}}>{error}</p>}

          <button disabled={busy} style={buttonStyle}>
            {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="container" style={{paddingTop:35}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>ÇOMAR.</h1>
        <button onClick={logout} style={{...buttonStyle,width:"auto"}}>
          Çıkış Yap
        </button>
      </header>

      <section style={{marginTop:40}}>
        <p className="muted">
          {profile.role === "coach" ? "KOÇ PANELİ" : "ÖĞRENCİ PANELİ"}
        </p>
        <h2>Merhaba {profile.display_name} 👋</h2>
        <p className="muted">
          {profile.role === "coach"
            ? "ÇOMAR'ın gelişimini buradan takip et."
            : "Bugün hedeflerine bir adım daha yaklaş."}
        </p>
      </section>

      <section className="grid" style={{marginTop:25}}>
        <div className="card">
          <p className="muted">Hedef sınav</p>
          <h2>YKS 2029</h2>
          <p>Sayısal</p>
        </div>
        <div className="card">
          <p className="muted">Kullanıcı rolü</p>
          <h2>{profile.role === "coach" ? "Koç" : "Öğrenci"}</h2>
        </div>
      </section>

      {error && <p style={{color:"#f87171"}}>{error}</p>}
    </main>
  );
}
