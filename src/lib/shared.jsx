// src/lib/shared.jsx — umumiy konstantalar, formulalar va Firestore yordamchilari
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// ─── Konstantalar ───────────────────────────────────────
export const OYLAR    = ["Yan","Feb","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
export const OYLAR_TO = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
export const HOZ_YIL  = new Date().getFullYear();
export const HOZ_OY   = new Date().getMonth();

export const DEF_KATEGORIYALAR = [
  {id:"k1",nom:"Ofis jihozlari",  birlik:"dona", limit:50, min:10,color:"#2d5a3d",icon:"📎"},
  {id:"k2",nom:"Xom ashyo",       birlik:"kg",   limit:200,min:30,color:"#4a7c59",icon:"🏗"},
  {id:"k3",nom:"Tayyor mahsulot", birlik:"dona", limit:100,min:20,color:"#3d6b4f",icon:"📦"},
  {id:"k4",nom:"Qadoqlash",       birlik:"rulon",limit:80, min:15,color:"#6b8f5e",icon:"🎁"},
  {id:"k5",nom:"Yozuv mollari",   birlik:"paket",limit:30, min:5, color:"#5c8a3c",icon:"✏️"},
  {id:"k6",nom:"Elektronika",     birlik:"dona", limit:20, min:3, color:"#3a6045",icon:"💻"},
  {id:"k7",nom:"Tozalash vosita", birlik:"shish",limit:40, min:8, color:"#4d7a6a",icon:"🧴"},
  {id:"k8",nom:"Asbob-uskunalar", birlik:"dona", limit:15, min:3, color:"#5a8a72",icon:"🔧"},
  {id:"k9",nom:"Oziq-ovqat",      birlik:"dona", limit:60, min:10,color:"#4a6b3a",icon:"☕"},
  {id:"k10",nom:"Xavfsizlik vosita",birlik:"dona",limit:25,min:5,color:"#3b5c4a",icon:"🦺"},
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

// ─── DIZAYN TOKENLARI ───────────────────────────────────
export const T = {
  // Ranglar
  bg:       "#f5f4f0",
  card:     "#ffffff",
  accent:   "#1e3a2b",   // qoʻyu yashil
  accent2:  "#2d5a3d",
  accent3:  "#4a7c59",
  cream:    "#f8f7f3",
  border:   "#e4e0d8",
  muted:    "#8a8878",
  danger:   "#c0392b",
  warn:     "#c47d0e",
  info:     "#2a5f8a",
  text:     "#1a1a1a",
  textMid:  "#444",
  green:    "#22c55e",
  red:      "#ef4444",
  // Spacing
  r:  "14px",  // radius karta
  rs: "10px",  // radius kichik
  rx: "20px",  // radius katta
  // Shadows
  shadow: "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
  shadowMd: "0 6px 24px rgba(0,0,0,0.1)",
};

export const NAV_TABS = ["Bosh sahifa","Inventar","Tranzaksiyalar","Moliya","Kategoriyalar","Tahlil","Sozlamalar"];
export const SIDEBAR_W = 232;

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
