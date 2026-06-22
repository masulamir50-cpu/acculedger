// src/lib/shared.jsx — umumiy konstantalar, formulalar va Firestore yordamchilari
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// ─── Konstantalar ───────────────────────────────────────
export const OYLAR    = ["Yan","Feb","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
export const OYLAR_TO = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
export const HOZ_YIL  = new Date().getFullYear();
export const HOZ_OY   = new Date().getMonth();

export const DEF_KATEGORIYALAR = [
  {id:"k1",nom:"Ofis jihozlari",  birlik:"dona", limit:50, min:10,color:"#c9a84c",icon:"📎"},
  {id:"k2",nom:"Xom ashyo",       birlik:"kg",   limit:200,min:30,color:"#4a7c59",icon:"🏗"},
  {id:"k3",nom:"Tayyor mahsulot", birlik:"dona", limit:100,min:20,color:"#3b82f6",icon:"📦"},
  {id:"k4",nom:"Qadoqlash",       birlik:"rulon",limit:80, min:15,color:"#a855f7",icon:"🎁"},
  {id:"k5",nom:"Yozuv mollari",   birlik:"paket",limit:30, min:5, color:"#22c55e",icon:"✏️"},
  {id:"k6",nom:"Elektronika",     birlik:"dona", limit:20, min:3, color:"#06b6d4",icon:"💻"},
  {id:"k7",nom:"Tozalash vosita", birlik:"shish",limit:40, min:8, color:"#ec4899",icon:"🧴"},
  {id:"k8",nom:"Asbob-uskunalar", birlik:"dona", limit:15, min:3, color:"#f97316",icon:"🔧"},
  {id:"k9",nom:"Oziq-ovqat",      birlik:"dona", limit:60, min:10,color:"#84cc16",icon:"☕"},
  {id:"k10",nom:"Xavfsizlik vosita",birlik:"dona",limit:25,min:5,color:"#14b8a6",icon:"🦺"},
];
export const DEF_MOL = {
  daromad:0,xarajat:0,aktiv:0,passiv:0,debitor:0,kreditor:0,
  pul_oqimi:0,soliq:15,byudjet:0,ish_haqi:0,amortizatsiya:0,boshqa_daromad:0
};

// ─── Yordamchi funksiyalar ──────────────────────────────
export const fmt  = n => Number(n||0).toLocaleString("uz-UZ",{minimumFractionDigits:2,maximumFractionDigits:2});
export const fmtN = n => Number(n||0).toLocaleString("uz-UZ");
export const P    = n => Math.round((Number(n)+Number.EPSILON)*100)/100;
export const PCT  = (a,b) => b>0 ? P((a/b)*100) : 0;
export const cl   = (v,lo,hi) => Math.min(hi,Math.max(lo,v));
export const mkKey= (m,y) => `${y}-${String(m).padStart(2,"0")}`;

// ─── Firestore ──────────────────────────────────────────
export const userDoc = (uid,col) => doc(db,"users",uid,"data",col);
export const fbGet = async(uid,col,def) => {
  try { const s=await getDoc(userDoc(uid,col)); return s.exists()?s.data().value:def; }
  catch { return def; }
};
export const fbSet = async(uid,col,value) => {
  try { await setDoc(userDoc(uid,col),{value},{merge:true}); }
  catch(e) { console.error("fbSet xato:",e); }
};

// ─── Debounced Firestore yozish (800ms) ─────────────────
const DEBOUNCE_MS = 800;
const pendingWrites = new Map();

export function fbSetDebounced(uid,col,value,delay=DEBOUNCE_MS) {
  const key=`${uid}:${col}`;
  const existing=pendingWrites.get(key);
  if(existing) clearTimeout(existing.timer);
  const timer=setTimeout(()=>{
    pendingWrites.delete(key);
    fbSet(uid,col,value);
  },delay);
  pendingWrites.set(key,{timer,uid,col,value});
}

export function flushPendingWrites() {
  for(const [key,{timer,uid,col,value}] of pendingWrites) {
    clearTimeout(timer);
    fbSet(uid,col,value);
  }
  pendingWrites.clear();
}

// ─── PREMIUM DIZAYN TOKENLARI — Marcelo-style Dark Fintech ──
export const T = {
  // Core backgrounds — solid, elegant night tones
  bg:       "#090C15",
  card:     "#131826",
  card2:    "#1a2030",
  cardSolid:"#131826",
  cream:    "#0e1220",

  // Accent — elegant champagne gold
  accent:   "#C9A84C",
  accent2:  "#D4AF37",
  accent3:  "#a8853d",
  cyan:     "#3B82F6",
  cyanDim:  "rgba(59,130,246,0.1)",
  violet:   "#8b5cf6",
  violetDim:"rgba(139,92,246,0.1)",

  // Text — white & dim white (not gray)
  text:     "#E2E8F0",
  textMid:  "#94A3B8",
  muted:    "#64748B",

  // Semantic — serious, not neon
  green:    "#10B981",
  red:      "#EF4444",
  danger:   "#EF4444",
  warn:     "#F59E0B",
  info:     "#3B82F6",

  // Semantic backgrounds — subtle
  dangerBg:  "rgba(239,68,68,0.08)",
  warnBg:    "rgba(245,158,11,0.08)",
  successBg: "rgba(16,185,129,0.08)",
  infoBg:    "rgba(59,130,246,0.08)",
  accentBg:  "rgba(201,168,76,0.08)",
  cyanBg:    "rgba(59,130,246,0.06)",
  joriyBg:   "rgba(59,130,246,0.04)",

  // Borders — almost invisible, premium
  border:    "rgba(255,255,255,0.06)",
  borderGlow:"rgba(255,255,255,0.12)",
  dangerBdr: "rgba(239,68,68,0.25)",
  warnBdr:   "rgba(245,158,11,0.25)",
  accentBdr: "rgba(201,168,76,0.2)",
  cyanBdr:   "rgba(59,130,246,0.2)",

  // Radius
  r:  "16px",
  rs: "12px",
  rx: "20px",
  rxx:"24px",

  // Shadows — soft, deep
  shadow:     "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
  shadowMd:   "0 8px 32px rgba(0,0,0,0.5)",
  shadowLg:   "0 16px 48px rgba(0,0,0,0.6)",
  shadowGold: "0 4px 24px rgba(201,168,76,0.15)",
  shadowCyan: "0 4px 24px rgba(59,130,246,0.15)",

  // Gradients
  gradAccent: "linear-gradient(135deg, #D4AF37 0%, #C9A84C 50%, #a8853d 100%)",
  gradCyan:   "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)",
  gradDark:   "linear-gradient(135deg, #131826 0%, #0e1220 100%)",
  gradHero:   "linear-gradient(135deg, #151b2e 0%, #0e1322 100%)",

  // No blur — solid elegant
  blur: "none",
};

export const NAV_TABS = ["Bosh sahifa","Inventar","Tranzaksiyalar","Moliya","Kategoriyalar","Tahlil","Sozlamalar"];
export const SIDEBAR_W = 248;

// ─── IKONLAR ───────────────────────────────────────────
export const Ico = {
  home:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  inv:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  tx:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  mol:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  kat:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  sett:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  plus:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  bell:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  undo:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  logout:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  del:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  edit:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  csv:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  search:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

export const NAV_ICO = [Ico.home, Ico.inv, Ico.tx, Ico.mol, Ico.kat, Ico.chart, Ico.sett];

// ─── UMUMIY KOMPONENTLAR ──────────────────────────────
export const Inp = ({ label, type="text", value, onChange, placeholder="" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{
        fontSize: 11, color: T.muted, fontWeight: 600, display: "block",
        marginBottom: 6, textTransform: "uppercase", letterSpacing: 1,
      }}>{label}</label>
    )}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%",
        border: `1px solid ${T.border}`,
        borderRadius: T.rs,
        padding: "11px 14px",
        fontSize: 13,
        background: "rgba(255,255,255,0.03)",
        outline: "none",
        boxSizing: "border-box",
        color: T.text,
        transition: "border-color 0.2s, box-shadow 0.2s",
        
      }}
    />
  </div>
);

export const Sel = ({ label, value, onChange, children }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{
        fontSize: 11, color: T.muted, fontWeight: 600, display: "block",
        marginBottom: 6, textTransform: "uppercase", letterSpacing: 1,
      }}>{label}</label>
    )}
    <select
      value={value} onChange={onChange}
      style={{
        width: "100%",
        border: `1px solid ${T.border}`,
        borderRadius: T.rs,
        padding: "11px 14px",
        fontSize: 13,
        background: "rgba(10,16,32,0.95)",
        outline: "none",
        boxSizing: "border-box",
        color: T.text,
      }}
    >
      {children}
    </select>
  </div>
);

export const Card = ({ children, style={}, className="" }) => (
  <div
    className={className}
    style={{
      background: T.card,
      backdropFilter: "none",
      
      borderRadius: T.r,
      border: `1px solid ${T.border}`,
      padding: 20,
      boxShadow: T.shadow,
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const H2 = ({ children, style={} }) => (
  <div style={{
    fontSize: 13,
    fontWeight: 700,
    color: T.textMid,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    ...style,
  }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, color=T.accent, small=false, ghost=false, danger=false, style={} }) => {
  const isGold = color === T.accent || color === T.accent2 || color === T.accent3;
  const bg = danger
    ? T.dangerBg
    : ghost
    ? "rgba(255,255,255,0.04)"
    : isGold
    ? `linear-gradient(135deg, ${T.accent2} 0%, ${T.accent} 60%, ${T.accent3} 100%)`
    : color;
  const col = danger ? T.danger : ghost ? T.textMid : isGold ? "#0a0c18" : "#fff";
  const border = danger
    ? `1px solid ${T.dangerBdr}`
    : ghost
    ? `1px solid ${T.border}`
    : isGold
    ? "1px solid rgba(201,168,76,0.3)"
    : "none";
  const shadow = !ghost && !danger && isGold
    ? `0 4px 20px rgba(201,168,76,0.3), 0 2px 6px rgba(0,0,0,0.4)`
    : "none";
  return (
    <button
      onClick={onClick}
      className="alc-btn"
      style={{
        background: bg,
        color: col,
        border,
        borderRadius: T.rs,
        padding: small ? "6px 12px" : "10px 18px",
        fontSize: small ? 11 : 13,
        cursor: "pointer",
        fontWeight: 700,
        letterSpacing: 0.3,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        boxShadow: shadow,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const Tag = ({ tur }) => (
  <span style={{
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
    background: tur === "kirim" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
    color: tur === "kirim" ? "#22c55e" : "#ef4444",
    border: `1px solid ${tur === "kirim" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
    display: "inline-block",
    letterSpacing: 0.3,
  }}>
    {tur === "kirim" ? "↑ Kirim" : "↓ Chiqim"}
  </span>
);

export const Badge = ({ oshgan, kamaygan, val }) => (
  <span style={{
    fontSize: 10,
    padding: "3px 9px",
    borderRadius: 20,
    fontWeight: 700,
    letterSpacing: 0.3,
    background: oshgan
      ? "rgba(239,68,68,0.12)"
      : kamaygan
      ? "rgba(245,158,11,0.12)"
      : "rgba(34,197,94,0.1)",
    color: oshgan ? "#ef4444" : kamaygan ? "#f59e0b" : "#22c55e",
    border: `1px solid ${oshgan ? "rgba(239,68,68,0.25)" : kamaygan ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.2)"}`,
  }}>
    {oshgan ? "LIMIT" : kamaygan ? "⚠ MIN" : val}
  </span>
);

export const Prog = ({ pct, oshgan, kamaygan }) => {
  const color = oshgan ? "#ef4444" : kamaygan ? "#f59e0b" : T.cyan;
  const glow  = oshgan
    ? "0 0 8px rgba(239,68,68,0.5)"
    : kamaygan
    ? "0 0 8px rgba(245,158,11,0.4)"
    : "0 0 8px rgba(0,212,255,0.4)";
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, height: 5, overflow: "hidden", marginTop: 8 }}>
      <div
        className="alc-progress-fill"
        style={{
          height: "100%",
          width: `${Math.min(100, pct)}%`,
          background: oshgan
            ? "#ef4444"
            : kamaygan
            ? "#f59e0b"
            : `linear-gradient(90deg, ${T.cyan}, #7c3aed)`,
          borderRadius: 8,
          boxShadow: glow,
        }}
      />
    </div>
  );
};

export const Met = ({ label, val, sub, color=T.accent, icon }) => {
  // 3D tilt — faqat desktop. Mobil'da oddiy karta (performance).
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hov: false });
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 900;

  const onMove = (e) => {
    if (!isDesktop || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // Kursorning karta markaziga nisbatan o'rni (-0.5..0.5)
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    // Maksimal 8 daraja qiyshayish
    setTilt({ rx: -py * 8, ry: px * 8, hov: true });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, hov: false });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        background: T.card,
        borderRadius: T.r,
        padding: "18px 20px",
        border: `1px solid ${tilt.hov ? "rgba(201,168,76,0.3)" : T.border}`,
        boxShadow: tilt.hov
          ? `${T.shadow}, 0 0 28px rgba(201,168,76,0.12)`
          : T.shadow,
        position: "relative",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
        cursor: "default",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Mesh glow */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }}/>
      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: 0.6,
      }}/>
      <div style={{ position: "absolute", right: 14, top: 12, fontSize: 22, opacity: 0.12 }}>{icon}</div>
      <div style={{
        fontSize: 10, color: T.muted, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontSize: 19, fontWeight: 800, color: T.text,
        lineHeight: 1.2, letterSpacing: -0.3,
      }}>{val}</div>
      {sub && (
        <div style={{ fontSize: 11, color, marginTop: 5, fontWeight: 600 }}>{sub}</div>
      )}
    </motion.div>
  );
};
