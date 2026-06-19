// src/lib/shared.jsx — umumiy konstantalar, formulalar va Firestore yordamchilari
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

// ─── Yordamchi funksiyalar (moliya formulalari) ─────────
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

// ─── DIZAYN TOKENLARI — Dark Premium Fintech ────────────
export const T = {
  // Asosiy ranglar
  bg:       "#0a0e1a",
  card:     "#111827",
  card2:    "#1a2235",
  accent:   "#c9a84c",
  accent2:  "#d4b96a",
  accent3:  "#a8853d",
  cream:    "#0d1526",
  border:   "rgba(255,255,255,0.08)",
  muted:    "#6b7a99",
  danger:   "#ef4444",
  warn:     "#f59e0b",
  info:     "#60a5fa",
  text:     "#f0f4ff",
  textMid:  "#b0bbd4",
  green:    "#22c55e",
  red:      "#ef4444",
  // Semantik fonlar
  dangerBg:  "rgba(239,68,68,0.1)",
  warnBg:    "rgba(245,158,11,0.1)",
  successBg: "rgba(34,197,94,0.1)",
  infoBg:    "rgba(96,165,250,0.1)",
  accentBg:  "rgba(201,168,76,0.1)",
  joriyBg:   "rgba(201,168,76,0.06)",
  // Semantik chegaralar
  dangerBdr: "rgba(239,68,68,0.3)",
  warnBdr:   "rgba(245,158,11,0.3)",
  accentBdr: "rgba(201,168,76,0.25)",
  // Radius
  r:  "16px",
  rs: "12px",
  rx: "24px",
  // Soyalar
  shadow:    "0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)",
  shadowMd:  "0 8px 40px rgba(0,0,0,0.5)",
  shadowGold:"0 0 30px rgba(201,168,76,0.2), 0 0 60px rgba(201,168,76,0.08)",
};

export const NAV_TABS = ["Bosh sahifa","Inventar","Tranzaksiyalar","Moliya","Kategoriyalar","Tahlil","Sozlamalar"];
export const SIDEBAR_W = 240;

// ─── IKONLAR ───────────────────────────────────────────
export const Ico = {
  home:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  inv:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  tx:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  mol:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  kat:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  sett:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  plus:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  bell:  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  undo:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  logout:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  del:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  edit:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  csv:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  search:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

export const NAV_ICO = [Ico.home, Ico.inv, Ico.tx, Ico.mol, Ico.kat, Ico.chart, Ico.sett];

// ─── UMUMIY KOMPONENTLAR (module scope — fokus xatosini oldini olish) ──────
export const Inp=({label,type="text",value,onChange,placeholder=""})=>(
  <div style={{marginBottom:10}}>
    {label&&<label style={{fontSize:11,color:T.muted,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"11px 14px",fontSize:13,background:T.cream,outline:"none",boxSizing:"border-box",color:T.text,transition:"border-color 0.2s"}}/>
  </div>
);

export const Sel=({label,value,onChange,children})=>(
  <div style={{marginBottom:10}}>
    {label&&<label style={{fontSize:11,color:T.muted,fontWeight:700,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}
    <select value={value} onChange={onChange} style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"11px 14px",fontSize:13,background:T.cream,outline:"none",boxSizing:"border-box",color:T.text}}>
      {children}
    </select>
  </div>
);

export const Card=({children,style={}})=>(
  <div style={{background:T.card,borderRadius:T.r,border:`1px solid ${T.border}`,padding:20,boxShadow:T.shadow,...style}}>
    {children}
  </div>
);

export const H2=({children,style={}})=>(
  <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14,display:"flex",alignItems:"center",gap:6,...style}}>
    {children}
  </div>
);

export const Btn=({children,onClick,color=T.accent,small=false,ghost=false,danger=false,style={}})=>{
  const bg=danger?T.dangerBg:ghost?"transparent":color;
  const col=danger?T.danger:ghost?T.accent:color===T.accent||color===T.accent2||color===T.accent3?"#0a0e1a":"#fff";
  const border=danger?`1.5px solid ${T.dangerBdr}`:ghost?`1.5px solid ${T.border}`:"none";
  const shadow=(!ghost&&!danger)?`0 4px 14px ${color}35`:"none";
  return(
    <button onClick={onClick} className="alc-btn"
      style={{background:bg,color:col,border,borderRadius:T.rs,padding:small?"6px 12px":"10px 18px",
              fontSize:small?12:13,cursor:"pointer",fontWeight:700,display:"inline-flex",
              alignItems:"center",gap:5,boxShadow:shadow,...style}}>
      {children}
    </button>
  );
};

export const Tag=({tur})=>(
  <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,
    background:tur==="kirim"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",
    color:tur==="kirim"?"#22c55e":"#ef4444",display:"inline-block"}}>
    {tur==="kirim"?"↑ Kirim":"↓ Chiqim"}
  </span>
);

export const Badge=({oshgan,kamaygan,val})=>(
  <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,fontWeight:700,
    background:oshgan?"rgba(239,68,68,0.15)":kamaygan?"rgba(245,158,11,0.15)":"rgba(34,197,94,0.15)",
    color:oshgan?"#ef4444":kamaygan?"#f59e0b":"#22c55e"}}>
    {oshgan?"LIMIT":kamaygan?"⚠ MIN":val}
  </span>
);

export const Prog=({pct,oshgan,kamaygan})=>(
  <div style={{background:"rgba(255,255,255,0.06)",borderRadius:8,height:6,overflow:"hidden",marginTop:6}}>
    <div style={{height:"100%",width:`${Math.min(100,pct)}%`,
      background:oshgan?"#ef4444":kamaygan?"#f59e0b":"#c9a84c",
      borderRadius:8,transition:"width 0.5s ease",
      boxShadow:oshgan?"0 0 8px rgba(239,68,68,0.5)":kamaygan?"0 0 8px rgba(245,158,11,0.5)":"0 0 8px rgba(201,168,76,0.5)"}}/>
  </div>
);

export const Met=({label,val,sub,color=T.accent,icon})=>(
  <div style={{background:T.card,borderRadius:T.r,padding:"16px 18px",border:`1px solid ${T.border}`,
    boxShadow:T.shadow,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:12,top:10,fontSize:26,opacity:0.1}}>{icon}</div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,
      background:`linear-gradient(90deg, ${color}, transparent)`,opacity:0.7,borderRadius:"0 0 16px 16px"}}/>
    <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}}>{label}</div>
    <div style={{fontSize:20,fontWeight:900,color:T.text,lineHeight:1.2}}>{val}</div>
    {sub&&<div style={{fontSize:11,color:color,marginTop:4,fontWeight:600}}>{sub}</div>}
  </div>
);
