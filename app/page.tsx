
"use client";

import { useState } from "react";

export default function Home() {
  const [role, setRole] = useState("student");
  const [tab, setTab] = useState("dashboard");

  const menu = [
    ["dashboard", "◫", "Genel Bakış"],
    ["study", "◷", "Çalışma Sayacı"],
    ["tasks", "✓", "Görevlerim"],
    ["exams", "▤", "Denemeler"],
    ["notes", "✎", "Yanlış Defterim"],
  ];

  return (
    <main className="container" style={{paddingTop:35,paddingBottom:50}}>
      <header style={{
        display:"flex",justifyContent:"space-between",
        alignItems:"center",gap:15,flexWrap:"wrap",
        marginBottom:35
      }}>
        <div>
          <div style={{fontSize:25,fontWeight:800,letterSpacing:-1}}>
            ÇOMAR<span style={{color:"#818cf8"}}>.</span>
          </div>
          <div className="muted" style={{fontSize:12}}>
            YKS 2029 • SAYISAL
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setRole("student")} style={roleButton(role==="student")}>
            Öğrenci
          </button>
          <button onClick={()=>setRole("coach")} style={roleButton(role==="coach")}>
            Koç
          </button>
        </div>
      </header>

      <section style={{marginBottom:25}}>
        <div className="muted" style={{fontSize:13}}>
          {role==="student"?"ÖĞRENCİ PANELİ":"KOÇ PANELİ"}
        </div>
        <h1 style={{fontSize:30,margin:"8px 0"}}>
          {role==="student"?"Merhaba ÇOMAR 👋":"Merhaba Baran 👋"}
        </h1>
        <p className="muted">
          {role==="student"
            ?"Bugün hedeflerine bir adım daha yaklaş."
            :"ÇOMAR'ın gelişimini buradan takip et."}
        </p>
      </section>

      <div className="grid" style={{marginBottom:22}}>
        <div className="card">
          <div className="muted" style={{fontSize:13}}>YKS 2029</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:12}}>Hedefe doğru</div>
          <div className="muted" style={{fontSize:12,marginTop:8}}>
            Sayısal hazırlık süreci
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{fontSize:13}}>Günün hedefi</div>
          <div style={{fontSize:25,fontWeight:800,marginTop:12}}>6 saat</div>
          <div style={{color:"#34d399",fontSize:12,marginTop:8}}>
            Günlük çalışma hedefi
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:22}}>
        <div style={{fontWeight:700,marginBottom:15}}>Panel menüsü</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {menu.map(([id,icon,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{
                ...navButton,
                background:tab===id?"#373c70":"#182235",
                borderColor:tab===id?"#818cf8":"#263247"
              }}>
              {icon} {label}
            </button>
          ))}
        </div>
        <div style={{borderTop:"1px solid #263247",marginTop:20,paddingTop:20}}>
          <h2 style={{fontSize:19}}>
            {menu.find(x=>x[0]===tab)?.[2]}
          </h2>
          <p className="muted" style={{fontSize:13}}>
            {tab==="dashboard"?"Çalışma ve sınav gelişimini tek yerden takip et.":
             tab==="study"?"Pomodoro ve süresiz kronometre ile çalışmanı takip et.":
             tab==="tasks"?"Koçunun verdiği görevleri burada takip et.":
             tab==="exams"?"TYT ve AYT deneme sonuçlarını incele.":
             "Yanlış yaptığın soruları ve eksik konularını kaydet."}
          </p>
          {tab==="study"&&(
            <div style={{fontSize:38,fontWeight:800,marginTop:15}}>25:00</div>
          )}
          {tab==="tasks"&&<p className="muted">Henüz görev bulunmuyor.</p>}
          {tab==="exams"&&<p className="muted">Henüz deneme kaydı bulunmuyor.</p>}
        </div>
      </div>

      <footer className="muted" style={{fontSize:11,textAlign:"center",padding:20}}>
        ÇOMAR YKS TRACKER • 2029
      </footer>
    </main>
  );
}

const navButton: React.CSSProperties = {
  padding:"11px 13px",
  border:"1px solid #263247",
  borderRadius:10,
  color:"#f1f5f9",
  fontSize:12
};

function roleButton(active:boolean):React.CSSProperties {
  return {
    padding:"10px 13px",
    borderRadius:10,
    border:"1px solid #818cf8",
    background:active?"#373c70":"#111827",
    color:"white",
    fontSize:12
  };
}
