import { useState, useEffect, useCallback, useMemo } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, onSnapshot,
} from "firebase/firestore";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Konstantalar ───────────────────────────────
const OYLAR    = ["Yan","Feb","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
const OYLAR_TO = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const HOZ_YIL  = new Date().getFullYear();
const HOZ_OY   = new Date().getMonth();

const DEF_KATEGORIYALAR = [
  {id:"k1", nom:"Ofis jihozlari",   birlik:"dona", limit:50,  min:10, color:"#2d5a3d", icon:"📎"},
  {id:"k2", nom:"Xom ashyo",        birlik:"kg",   limit:200, min:30, color:"#4a7c59", icon:"🏗"},
  {id:"k3", nom:"Tayyor mahsulot",  birlik:"dona", limit:100, min:20, color:"#3d6b4f", icon:"📦"},
  {id:"k4", nom:"Qadoqlash",        birlik:"rulon",limit:80,  min:15, color:"#6b8f5e", icon:"🎁"},
  {id:"k5", nom:"Yozuv mollari",    birlik:"paket",limit:30,  min:5,  color:"#5c8a3c", icon:"✏️"},
  {id:"k6", nom:"Elektronika",      birlik:"dona", limit:20,  min:3,  color:"#3a6045", icon:"💻"},
  {id:"k7", nom:"Tozalash vosita",  birlik:"shish",limit:40,  min:8,  color:"#4d7a6a", icon:"🧴"},
  {id:"k8", nom:"Asbob-uskunalar",  birlik:"dona", limit:15,  min:3,  color:"#5a8a72", icon:"🔧"},
  {id:"k9", nom:"Oziq-ovqat",       birlik:"dona", limit:60,  min:10, color:"#4a6b3a", icon:"☕"},
  {id:"k10",nom:"Xavfsizlik vosita",birlik:"dona", limit:25,  min:5,  color:"#3b5c4a", icon:"🦺"},
];
const DEF_MOL = {
  daromad:0,xarajat:0,aktiv:0,passiv:0,debitor:0,kreditor:0,
  pul_oqimi:0,soliq:15,byudjet:0,ish_haqi:0,amortizatsiya:0,boshqa_daromad:0
};

// ─── Yordamchi funksiyalar ──────────────────────
const fmt  = n => Number(n||0).toLocaleString("uz-UZ",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtN = n => Number(n||0).toLocaleString("uz-UZ");
const P    = n => Math.round((Number(n)+Number.EPSILON)*100)/100;
const PCT  = (a,b) => b>0 ? P((a/b)*100) : 0;
const cl   = (v,lo,hi) => Math.min(hi,Math.max(lo,v));
const mkKey= (m,y) => `${y}-${String(m).padStart(2,"0")}`;

const TABLAR = ["Bosh sahifa","Inventar","Tranzaksiyalar","Moliya","Kategoriyalar","Tahlil","Sozlamalar"];
const C = {
  bg:"#f4f2ec", card:"#ffffff", accent:"#2d5a3d", accent2:"#4a7c59",
  cream:"#f7f5ef", border:"#dedad2", muted:"#7a7a6e", danger:"#b53a2f",
  warn:"#c47d0e", info:"#2a5f8a", textDark:"#1a2e24", textMid:"#3a4a40",
};

// ─── Firestore yordamchisi ──────────────────────
const userDoc = (uid, col) => doc(db, "users", uid, "data", col);

const fbGet = async (uid, col, def) => {
  try {
    const snap = await getDoc(userDoc(uid, col));
    return snap.exists() ? snap.data().value : def;
  } catch { return def; }
};

const fbSet = async (uid, col, value) => {
  try {
    await setDoc(userDoc(uid, col), { value }, { merge: true });
  } catch(e) { console.error("fbSet xato:", e); }
};

// ════════════════════════════════════════════════
// LOGIN KOMPONENTI
// ════════════════════════════════════════════════
function Login() {
  const [email,    setEmail]    = useState("");
  const [parol,    setParol]    = useState("");
  const [rejim,    setRejim]    = useState("kirish"); // kirish | royxat
  const [xato,     setXato]     = useState("");
  const [yukl,     setYukl]     = useState(false);

  const s = {
    wrap:{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
    box:{background:C.card,borderRadius:16,padding:32,width:"100%",maxWidth:400,boxShadow:"0 8px 32px rgba(0,0,0,0.1)"},
    logo:{display:"flex",alignItems:"center",gap:10,marginBottom:24,justifyContent:"center"},
    logoBox:{width:40,height:40,background:C.accent,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16},
    title:{fontSize:20,fontWeight:900,color:C.accent},
    lbl:{fontSize:12,color:C.muted,marginBottom:4,display:"block",fontWeight:700},
    inp:{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 13px",fontSize:14,background:C.cream,outline:"none",boxSizing:"border-box",marginBottom:12},
    btn:{width:"100%",background:C.accent,color:"#fff",border:"none",borderRadius:9,padding:"12px",fontSize:14,cursor:"pointer",fontWeight:700,boxShadow:`0 2px 8px rgba(45,90,61,0.3)`},
    link:{textAlign:"center",marginTop:14,fontSize:13,color:C.muted,cursor:"pointer"},
    xato:{background:"#fce4e4",color:C.danger,borderRadius:8,padding:"9px 12px",fontSize:13,marginBottom:12},
  };

  const submit = async () => {
    if(!email||!parol){setXato("Email va parolni kiriting!");return;}
    setYukl(true); setXato("");
    try {
      if(rejim==="kirish") await signInWithEmailAndPassword(auth,email,parol);
      else                 await createUserWithEmailAndPassword(auth,email,parol);
    } catch(e) {
      const xabarlar = {
        "auth/invalid-credential":"Email yoki parol noto'g'ri!",
        "auth/email-already-in-use":"Bu email allaqachon ro'yxatdan o'tgan!",
        "auth/weak-password":"Parol kamida 6 ta belgidan iborat bo'lsin!",
        "auth/invalid-email":"Email noto'g'ri formatda!",
      };
      setXato(xabarlar[e.code]||"Xatolik yuz berdi: "+e.message);
    }
    setYukl(false);
  };

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.logo}>
          <div style={s.logoBox}>AL</div>
          <div style={s.title}>AccuLedger</div>
        </div>
        <div style={{textAlign:"center",fontSize:13,color:C.muted,marginBottom:20}}>
          {rejim==="kirish"?"Hisobingizga kiring":"Yangi hisob yarating"}
        </div>
        {xato && <div style={s.xato}>⚠ {xato}</div>}
        <label style={s.lbl}>Email</label>
        <input style={s.inp} type="email" placeholder="email@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <label style={s.lbl}>Parol</label>
        <input style={s.inp} type="password" placeholder="••••••••" value={parol} onChange={e=>setParol(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <button style={s.btn} onClick={submit} disabled={yukl}>
          {yukl?"Yuklanmoqda…":rejim==="kirish"?"Kirish →":"Ro'yxatdan o'tish →"}
        </button>
        <div style={s.link} onClick={()=>{setRejim(r=>r==="kirish"?"royxat":"kirish");setXato("");}}>
          {rejim==="kirish"?"Hisob yo'qmi? Ro'yxatdan o'tish":"Hisobingiz bormi? Kirish"}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// ASOSIY ILOVA
// ════════════════════════════════════════════════
function MainApp({ foydalanuvchi }) {
  const uid = foydalanuvchi.uid;

  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [katlar,  setKatlarState]  = useState([]);
  const [mData,   setMDataState]   = useState({});
  const [mol,     setMolState]     = useState(DEF_MOL);
  const [mMol,    setMMolState]    = useState({});
  const [sozl,    setSozlState]    = useState({valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15});

  const [tab,     setTab]     = useState("Bosh sahifa");
  const [sm,      setSm]      = useState(HOZ_OY);
  const [sy,      setSy]      = useState(HOZ_YIL);
  const [xabar,   setXabar]   = useState(null);
  const [ogohlar, setOgohlar] = useState([]);
  const [modal,   setModal]   = useState(null);
  const [qidiruv, setQidiruv] = useState("");
  const [txFilter,setTxFilter]= useState("hammasi");
  const [tarix,   setTarix]   = useState([]);
  const [txF,     setTxF]     = useState({katId:"",tur:"kirim",miqdor:"",eslatma:"",oy:HOZ_OY,yil:HOZ_YIL,narx:"",yetkazuvchi:""});
  const [molF,    setMolF]    = useState({...DEF_MOL});
  const [yangiK,  setYangiK]  = useState({nom:"",birlik:"dona",limit:0,min:0,icon:"📦"});
  const [tahrirK, setTahrirK] = useState(null);

  // ── Firestore setter'lar (state + cloud)
  const setKatlar = useCallback(async (v) => { const val=typeof v==="function"?v(katlar):v; setKatlarState(val); await fbSet(uid,"katlar",val); },[uid,katlar]);
  const setMData  = useCallback(async (v) => { const val=typeof v==="function"?v(mData):v;  setMDataState(val);  await fbSet(uid,"mdata",val);  },[uid,mData]);
  const setMol    = useCallback(async (v) => { const val=typeof v==="function"?v(mol):v;    setMolState(val);    await fbSet(uid,"mol",val);    },[uid,mol]);
  const setMMol   = useCallback(async (v) => { const val=typeof v==="function"?v(mMol):v;   setMMolState(val);   await fbSet(uid,"mmol",val);   },[uid,mMol]);
  const setSozl   = useCallback(async (v) => { const val=typeof v==="function"?v(sozl):v;   setSozlState(val);   await fbSet(uid,"sozl",val);   },[uid,sozl]);

  // ── Ma'lumotlarni yuklash
  useEffect(()=>{
    (async()=>{
      const [k,m,mo,mm,s] = await Promise.all([
        fbGet(uid,"katlar", DEF_KATEGORIYALAR),
        fbGet(uid,"mdata",  {}),
        fbGet(uid,"mol",    DEF_MOL),
        fbGet(uid,"mmol",   {}),
        fbGet(uid,"sozl",   {valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15}),
      ]);
      setKatlarState(Array.isArray(k)?k:DEF_KATEGORIYALAR);
      setMDataState(m&&typeof m==="object"?m:{});
      setMolState(mo&&typeof mo==="object"?{...DEF_MOL,...mo}:DEF_MOL);
      setMMolState(mm&&typeof mm==="object"?mm:{});
      setSozlState(s&&typeof s==="object"?s:{valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15});
      setYuklanmoqda(false);
    })();
  },[uid]);

  const showXabar = (msg,tur="info")=>{setXabar({msg,tur});setTimeout(()=>setXabar(null),3500);};

  const getCEntry  = useCallback((m,y,katId)=>mData[mkKey(m,y)]?.[katId]||{miqdor:0,tranzaksiyalar:[]},[mData]);
  const getMolKey  = useCallback((m,y)=>mMol[mkKey(m,y)]||null,[mMol]);
  const faolMol    = useMemo(()=>getMolKey(sm,sy)||mol,[sm,sy,mol,mMol,getMolKey]);

  // ── Ogohlantirishlar
  useEffect(()=>{
    const yangi=[];
    katlar.forEach(kat=>{
      const e=getCEntry(HOZ_OY,HOZ_YIL,kat.id);
      if(kat.limit>0&&P(e.miqdor)>P(kat.limit)) yangi.push({...kat,ishlatilgan:e.miqdor,oshgan:P(e.miqdor-kat.limit),tur:"limit"});
      if(kat.min>0&&P(e.miqdor)<P(kat.min))     yangi.push({...kat,ishlatilgan:e.miqdor,tur:"minimum"});
    });
    setOgohlar(yangi);
  },[katlar,mData,getCEntry]);

  // ── Moliya hisobotlari
  const sofFoyda  = useMemo(()=>{const g=P(faolMol.daromad-faolMol.xarajat);return P(g-P(g*(faolMol.soliq/100)));},[faolMol]);
  const kapital   = useMemo(()=>P(faolMol.aktiv-faolMol.passiv),[faolMol]);
  const yalpiF    = useMemo(()=>P(faolMol.daromad-faolMol.xarajat),[faolMol]);
  const soliqM    = useMemo(()=>P(yalpiF*(faolMol.soliq/100)),[yalpiF,faolMol.soliq]);
  const byudjetFoiz=useMemo(()=>faolMol.byudjet>0?PCT(faolMol.xarajat,faolMol.byudjet):0,[faolMol]);
  const joriyKoef = faolMol.passiv>0?P(faolMol.aktiv/faolMol.passiv):null;
  const foydaMarj = faolMol.daromad>0?P((sofFoyda/faolMol.daromad)*100):0;
  const xarajatNis= faolMol.daromad>0?P((faolMol.xarajat/faolMol.daromad)*100):0;
  const qarzKap   = kapital>0?P(faolMol.passiv/kapital):null;

  // ── Yillik ma'lumot
  const yillikData=useMemo(()=>OYLAR.map((o,i)=>{
    const mf=getMolKey(i,sy)||mol;
    const inv=katlar.reduce((acc,k)=>acc+(mData[mkKey(i,sy)]?.[k.id]?.miqdor||0),0);
    const g=P(mf.daromad-mf.xarajat);
    return{oy:o,daromad:mf.daromad,xarajat:mf.xarajat,foyda:P(g-P(g*(mf.soliq/100))),inventar:inv,pulOqimi:mf.pul_oqimi};
  }),[mData,sy,katlar,mol,mMol,getMolKey]);

  const yilJami=useMemo(()=>({
    daromad:P(yillikData.reduce((s,d)=>s+d.daromad,0)),
    xarajat:P(yillikData.reduce((s,d)=>s+d.xarajat,0)),
    foyda:P(yillikData.reduce((s,d)=>s+d.foyda,0)),
    inventar:yillikData.reduce((s,d)=>s+d.inventar,0),
  }),[yillikData]);

  const invXulosa=useMemo(()=>katlar.map(kat=>{
    const e=getCEntry(sm,sy,kat.id);
    const pct=kat.limit>0?cl(PCT(e.miqdor,kat.limit),0,999):0;
    return{...kat,miqdor:e.miqdor,pct,oshgan:kat.limit>0&&P(e.miqdor)>P(kat.limit),
      kamaygan:kat.min>0&&P(e.miqdor)<P(kat.min),txSoni:e.tranzaksiyalar.length};
  }),[katlar,sm,sy,getCEntry]);

  const hammaTx=useMemo(()=>{
    const key=mkKey(sm,sy);const list=[];
    katlar.forEach(kat=>(mData[key]?.[kat.id]?.tranzaksiyalar||[]).forEach(t=>list.push({...t,katNom:kat.nom,birlik:kat.birlik,icon:kat.icon,katId:kat.id})));
    return list.sort((a,b)=>new Date(b.sana)-new Date(a.sana));
  },[mData,sm,sy,katlar]);

  const filtrlangan=useMemo(()=>{
    let list=hammaTx;
    if(txFilter!=="hammasi") list=list.filter(t=>t.tur===txFilter);
    if(qidiruv) list=list.filter(t=>t.katNom.toLowerCase().includes(qidiruv.toLowerCase())||t.eslatma?.toLowerCase().includes(qidiruv.toLowerCase()));
    return list;
  },[hammaTx,txFilter,qidiruv]);

  // ── Tranzaksiya qo'shish (Auto P&L)
  const txQoshish = async () => {
    const miq=parseFloat(txF.miqdor),narx=parseFloat(txF.narx)||0;
    if(!txF.katId||isNaN(miq)||miq<=0){showXabar("Kategoriya va miqdorni to'ldiring!","xato");return;}
    const kat=katlar.find(k=>k.id===txF.katId);
    const key=mkKey(txF.oy,txF.yil);
    const qiymat=P(miq*narx);
    setTarix(prev=>[{mData,mMol},...prev.slice(0,19)]);
    const yangiMData={...mData};
    const me={...(yangiMData[key]||{})};
    const ke=me[txF.katId]||{miqdor:0,tranzaksiyalar:[]};
    const delta=txF.tur==="kirim"?miq:-miq;
    const yangiMiq=P(ke.miqdor+delta);
    const tx={id:Date.now(),tur:txF.tur,miqdor:miq,narx,qiymat,eslatma:txF.eslatma,yetkazuvchi:txF.yetkazuvchi,sana:new Date().toISOString(),balans:yangiMiq};
    yangiMData[key]={...me,[txF.katId]:{miqdor:yangiMiq,tranzaksiyalar:[tx,...ke.tranzaksiyalar]}};
    await setMData(yangiMData);
    if(narx>0){
      const yangiMMol={...mMol};
      const mf={...(yangiMMol[key]||{...mol})};
      if(txF.tur==="kirim") mf.daromad=P((mf.daromad||0)+qiymat);
      else                  mf.xarajat=P((mf.xarajat||0)+qiymat);
      yangiMMol[key]=mf;
      await setMMol(yangiMMol);
    }
    showXabar(`✅ ${txF.tur==="kirim"?"Kirim":"Chiqim"}: ${miq} ${kat?.birlik} — ${kat?.nom}`,"muvaffaq");
    setTxF(f=>({...f,miqdor:"",eslatma:"",narx:"",yetkazuvchi:""}));
  };

  // ── Undo
  const bekorQilish = async () => {
    if(!tarix.length){showXabar("Bekor qilishga narsa yo'q","ogoh");return;}
    const [oldingi,...qolgan]=tarix;
    setMDataState(oldingi.mData); setMMolState(oldingi.mMol);
    await fbSet(uid,"mdata",oldingi.mData);
    await fbSet(uid,"mmol",oldingi.mMol);
    setTarix(qolgan);
    showXabar("↩ Bekor qilindi","info");
  };

  // ── Tranzaksiya o'chirish
  const txOchir = async (katId, txId) => {
    const key=mkKey(sm,sy);
    setTarix(prev=>[{mData,mMol},...prev.slice(0,19)]);
    const yangiMData={...mData};
    const me={...(yangiMData[key]||{})};
    const ke=me[katId]||{miqdor:0,tranzaksiyalar:[]};
    const ochirilgan=ke.tranzaksiyalar.find(t=>t.id===txId);
    const txlar=ke.tranzaksiyalar.filter(t=>t.id!==txId);
    const yangiMiq=txlar.reduce((acc,t)=>P(acc+(t.tur==="kirim"?t.miqdor:-t.miqdor)),0);
    yangiMData[key]={...me,[katId]:{miqdor:yangiMiq,tranzaksiyalar:txlar}};
    await setMData(yangiMData);
    if(ochirilgan?.qiymat>0){
      const yangiMMol={...mMol};
      const mf={...(yangiMMol[key]||{...mol})};
      if(ochirilgan.tur==="kirim") mf.daromad=P(Math.max(0,(mf.daromad||0)-ochirilgan.qiymat));
      else                         mf.xarajat=P(Math.max(0,(mf.xarajat||0)-ochirilgan.qiymat));
      yangiMMol[key]=mf;
      await setMMol(yangiMMol);
    }
    showXabar("Tranzaksiya o'chirildi, balans qayta hisoblandi","info");
    setModal(null);
  };

  // ── Moliya saqlash
  const molSaqlash = async (oyGa) => {
    const d={};Object.keys(DEF_MOL).forEach(k=>{d[k]=P(parseFloat(molF[k])||0);});
    if(oyGa){const key=mkKey(sm,sy);await setMMol({...mMol,[key]:d});}
    else     await setMol(d);
    showXabar(oyGa?`${OYLAR_TO[sm]} uchun saqlandi`:"Umumiy moliya yangilandi!","muvaffaq");
    setModal(null);
  };

  // ── Kategoriyalar
  const katQoshish = async () => {
    if(!yangiK.nom.trim()){showXabar("Nom kiriting!","xato");return;}
    const ranglar=["#2d5a3d","#4a7c59","#3d6b4f","#6b8f5e","#5c8a3c","#3a6045","#4d7a6a","#5a8a72"];
    const kat={id:`k${Date.now()}`,nom:yangiK.nom.trim(),birlik:yangiK.birlik||"dona",
      limit:P(parseFloat(yangiK.limit)||0),min:P(parseFloat(yangiK.min)||0),
      icon:yangiK.icon||"📦",color:ranglar[katlar.length%ranglar.length]};
    await setKatlar([...katlar,kat]);
    setYangiK({nom:"",birlik:"dona",limit:0,min:0,icon:"📦"});
    showXabar("Kategoriya qo'shildi!","muvaffaq");
  };
  const katSaqlash = async () => {
    await setKatlar(katlar.map(k=>k.id===tahrirK.id?{...tahrirK,limit:P(parseFloat(tahrirK.limit)||0),min:P(parseFloat(tahrirK.min)||0)}:k));
    setTahrirK(null);setModal(null);showXabar("Yangilandi!","muvaffaq");
  };
  const katOchir = async (id) => { await setKatlar(katlar.filter(k=>k.id!==id)); showXabar("O'chirildi","info"); };

  // ── CSV export
  const csvExport = () => {
    const sarlavha=["Sana","Kategoriya","Tur","Miqdor","Birlik","Narx","Qiymat","Balans","Yetkazuvchi","Izoh"];
    const qatorlar=hammaTx.map(t=>[new Date(t.sana).toLocaleString("uz-UZ"),t.katNom,t.tur==="kirim"?"Kirim":"Chiqim",t.miqdor,t.birlik,t.narx||0,t.qiymat||0,t.balans,t.yetkazuvchi||"",t.eslatma||""]);
    const csv=[sarlavha,...qatorlar].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`acculedger-${OYLAR_TO[sm]}-${sy}.csv`;a.click();
    showXabar("CSV yuklab olindi!","muvaffaq");
  };

  const pieData=invXulosa.filter(k=>k.miqdor>0);

  // ─── STYLES ────────────────────────────────────
  const s={
    wrap:{fontFamily:"system-ui,-apple-system,sans-serif",background:C.bg,minHeight:"100vh",paddingBottom:60},
    header:{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.07)"},
    logoBox:{width:30,height:30,background:C.accent,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13},
    nav:{display:"flex",gap:2,overflowX:"auto"},
    nb:(a)=>({background:a?"#e4ede7":C.cream,color:a?C.accent:C.muted,border:a?`1px solid ${C.accent}25`:`1px solid transparent`,borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:a?700:400,whiteSpace:"nowrap"}),
    main:{maxWidth:1100,margin:"0 auto",padding:"14px 10px"},
    card:{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px",boxShadow:"0 2px 10px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.8)"},
    g2:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12},
    g3:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10},
    g4:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10},
    g5:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10},
    lbl:{fontSize:11,color:C.muted,marginBottom:3,display:"block",fontWeight:700},
    h2:{fontSize:14,fontWeight:800,color:C.textDark,margin:"0 0 12px",display:"flex",alignItems:"center",gap:5},
    inp:{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,background:C.cream,outline:"none",boxSizing:"border-box",color:C.textDark},
    sel:{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,background:C.cream,outline:"none",boxSizing:"border-box",color:C.textDark},
    btn:{background:C.accent,color:"#fff",border:"none",borderRadius:9,padding:"9px 16px",fontSize:13,cursor:"pointer",fontWeight:700,boxShadow:`0 2px 6px rgba(45,90,61,0.3)`},
    btnSm:{background:C.accent,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600},
    btnGhost:{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`,borderRadius:9,padding:"7px 14px",fontSize:13,cursor:"pointer",fontWeight:600},
    btnD:{background:C.danger,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer"},
    btnW:{background:C.warn,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer"},
    tag:(t)=>({fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:t==="kirim"?"#dff0e3":"#fce4e4",color:t==="kirim"?"#1b5e20":"#7f0000",display:"inline-block"}),
    badge:(o,k)=>({fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700,background:o?"#fce4e4":k?"#fff3cd":"#dff0e3",color:o?"#7f0000":k?"#7a4500":"#1b5e20"}),
    sep:{height:1,background:C.border,margin:"10px 0"},
    prog:(pct,o,k)=>({height:"100%",width:`${Math.min(100,pct)}%`,background:o?C.danger:k?C.warn:C.accent,borderRadius:8,transition:"width 0.4s"}),
    progWrap:{background:"#e8e5de",borderRadius:8,height:8,overflow:"hidden",marginTop:4},
    overlay:{position:"fixed",inset:0,background:"rgba(10,20,15,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:12},
    modalBox:{background:C.card,borderRadius:16,padding:20,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.2)"},
    th:{padding:"7px 10px",textAlign:"left",color:C.muted,fontWeight:700,border:`1px solid ${C.border}`,fontSize:11,textTransform:"uppercase",background:C.cream},
    td:{padding:"6px 10px",border:`1px solid #eee`,fontSize:12},
    tRow:(i)=>({background:i%2?C.cream:C.card}),
    metCard:(acc)=>({background:C.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",borderLeft:`3.5px solid ${acc}`,position:"relative",overflow:"hidden"}),
    alertBar:{background:"#fff9ef",border:`1px solid ${C.warn}`,borderRadius:10,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8},
    dangerBar:{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:10,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8},
  };

  const Met=({label,val,sub,acc,icon})=>(
    <div style={s.metCard(acc)}>
      <div style={{position:"absolute",right:10,top:10,fontSize:18,opacity:0.12}}>{icon}</div>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
      <div style={{fontSize:18,fontWeight:900,color:C.textDark,marginTop:2}}>{val}</div>
      {sub&&<div style={{fontSize:10.5,color:C.muted,marginTop:2}}>{sub}</div>}
    </div>
  );
  const Prog=({pct,o,k})=><div style={s.progWrap}><div style={s.prog(pct,o,k)}/></div>;

  if(yuklanmoqda) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,background:C.accent,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:18}}>AL</div>
      <div style={{color:C.muted,fontSize:14}}>Ma'lumotlar yuklanmoqda…</div>
    </div>
  );

  return(
    <div style={s.wrap}>
      {xabar&&<div style={{position:"fixed",top:12,right:12,left:12,zIndex:9999,background:xabar.tur==="xato"?C.danger:xabar.tur==="muvaffaq"?C.accent:xabar.tur==="ogoh"?C.warn:C.info,color:"#fff",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",maxWidth:400,margin:"0 auto"}}>{xabar.msg}</div>}

      {modal&&(
        <div style={s.overlay} onClick={()=>setModal(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            {modal.type==="moliya"&&(<>
              <div style={{...s.h2,marginBottom:14}}>💼 Moliyaviy ma'lumotlar</div>
              <div style={s.g2}>
                {[["Daromad 💰","daromad"],["Xarajat 📤","xarajat"],["Aktivlar","aktiv"],["Passivlar","passiv"],
                  ["Debitorlik","debitor"],["Kreditorlik","kreditor"],["Pul oqimi","pul_oqimi"],
                  ["Ish haqi","ish_haqi"],["Amortizatsiya","amortizatsiya"],["Boshqa daromad","boshqa_daromad"],
                  ["Byudjet","byudjet"],["Soliq %","soliq"]].map(([l,k])=>(
                  <div key={k}><label style={s.lbl}>{l}</label>
                  <input style={s.inp} type="number" min="0" value={molF[k]||""} onChange={e=>setMolF(f=>({...f,[k]:e.target.value}))} placeholder="0"/></div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
                <button style={s.btn} onClick={()=>molSaqlash(false)}>Umumiy saqlash</button>
                <button style={s.btnGhost} onClick={()=>molSaqlash(true)}>Faqat {OYLAR[sm]} uchun</button>
                <button style={{...s.btnGhost,marginLeft:"auto"}} onClick={()=>setModal(null)}>Bekor</button>
              </div>
            </>)}
            {modal.type==="katTahrirla"&&tahrirK&&(<>
              <div style={{...s.h2,marginBottom:14}}>✏️ Kategoriyani tahrirlash</div>
              {[["Nomi","nom","text"],["Birlik","birlik","text"],["Limit","limit","number"],["Minimum","min","number"],["Belgi","icon","text"]].map(([l,k,t])=>(
                <div key={k} style={{marginBottom:10}}><label style={s.lbl}>{l}</label>
                <input style={s.inp} type={t} value={tahrirK[k]||""} onChange={e=>setTahrirK(f=>({...f,[k]:e.target.value}))}/></div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <button style={s.btn} onClick={katSaqlash}>Saqlash</button>
                <button style={s.btnGhost} onClick={()=>setModal(null)}>Bekor</button>
              </div>
            </>)}
            {modal.type==="txOchir"&&(<>
              <div style={{...s.h2,marginBottom:10}}>🗑 Tranzaksiyani o'chirish?</div>
              <p style={{fontSize:13,color:C.muted,marginBottom:18}}>Yozuv o'chiriladi va balans qayta hisoblanadi.</p>
              <div style={{display:"flex",gap:8}}>
                <button style={s.btnD} onClick={()=>txOchir(modal.katId,modal.txId)}>O'chirish</button>
                <button style={s.btnGhost} onClick={()=>setModal(null)}>Bekor</button>
              </div>
            </>)}
            {modal.type==="oyReset"&&(<>
              <div style={{...s.h2,marginBottom:10}}>⚠️ {OYLAR_TO[sm]} {sy} ni tozalash?</div>
              <p style={{fontSize:13,color:C.muted,marginBottom:18}}>Ushbu oy uchun barcha ma'lumotlar o'chiriladi!</p>
              <div style={{display:"flex",gap:8}}>
                <button style={s.btnD} onClick={async()=>{
                  const key=mkKey(sm,sy);
                  const nmd={...mData};delete nmd[key];
                  const nmm={...mMol};delete nmm[key];
                  await setMData(nmd);await setMMol(nmm);
                  showXabar(`${OYLAR_TO[sm]} ${sy} tozalandi`,"info");setModal(null);
                }}>Ha, o'chirish</button>
                <button style={s.btnGhost} onClick={()=>setModal(null)}>Bekor</button>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* SARLAVHA */}
      <div style={s.header}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={s.logoBox}>AL</div>
          <div><div style={{fontSize:13,fontWeight:800,color:C.accent,lineHeight:1}}>AccuLedger</div>
          <div style={{fontSize:9,color:C.muted}}>{sozl.kompaniya}</div></div>
        </div>
        <div style={s.nav}>{TABLAR.map(t=><button key={t} style={s.nb(tab===t)} onClick={()=>setTab(t)}>{t}</button>)}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {ogohlar.length>0&&<div style={{background:"#fce4e4",color:C.danger,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>⚠{ogohlar.length}</div>}
          <button style={{...s.btnSm,background:tarix.length>0?C.warn:"#ccc",fontSize:11,padding:"4px 8px"}} onClick={bekorQilish}>↩</button>
          <button style={{...s.btnSm,background:C.danger,fontSize:11,padding:"4px 8px"}} onClick={()=>signOut(auth)} title="Chiqish">⬡</button>
        </div>
      </div>

      <div style={s.main}>
        {/* Ogohlantirishlar */}
        {ogohlar.filter(o=>o.tur==="limit").map(o=>(
          <div key={`l-${o.id}`} style={s.alertBar}><span style={{fontSize:18}}>{o.icon}</span>
          <div style={{flex:1,fontSize:12}}><strong>{o.nom}</strong> limitdan oshdi! <strong style={{color:C.danger}}>+{fmtN(o.oshgan)} {o.birlik}</strong></div></div>
        ))}
        {ogohlar.filter(o=>o.tur==="minimum").map(o=>(
          <div key={`m-${o.id}`} style={s.dangerBar}><span style={{fontSize:18}}>{o.icon}</span>
          <div style={{flex:1,fontSize:12}}><strong>{o.nom}</strong> — Qoldi: <strong style={{color:C.danger}}>{fmtN(o.ishlatilgan)} {o.birlik}</strong> ⚠ Qayta buyurtma bering!</div></div>
        ))}

        {/* Davr tanlash */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,background:C.card,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted}}>DAVR:</span>
          <select value={sm} onChange={e=>setSm(Number(e.target.value))} style={{...s.sel,width:110}}>
            {OYLAR_TO.map((o,i)=><option key={i} value={i}>{o}</option>)}
          </select>
          <select value={sy} onChange={e=>setSy(Number(e.target.value))} style={{...s.sel,width:90}}>
            {[HOZ_YIL-2,HOZ_YIL-1,HOZ_YIL,HOZ_YIL+1].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{display:"flex",gap:6,marginLeft:"auto",flexWrap:"wrap"}}>
            <button style={s.btnW} onClick={()=>setModal({type:"oyReset"})}>🗑 Tozala</button>
            <button style={s.btnSm} onClick={()=>{setMolF({...faolMol});setModal({type:"moliya"});}}>💼 Moliya</button>
            <button style={{...s.btnSm,background:C.info}} onClick={csvExport}>📥 CSV</button>
          </div>
        </div>

        {/* ══ BOSH SAHIFA ══ */}
        {tab==="Bosh sahifa"&&(
          <div>
            <div style={s.g5}>
              <Met label="Sof foyda" val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${faolMol.soliq}% soliqdan keyin`} acc={sofFoyda>=0?C.accent:C.danger} icon="💰"/>
              <Met label="Daromad"   val={`${fmt(faolMol.daromad)} ${sozl.valyuta}`} acc={C.accent2} icon="📈"/>
              <Met label="Xarajat"   val={`${fmt(faolMol.xarajat)} ${sozl.valyuta}`} sub={`${xarajatNis}% daromaddan`} acc={C.danger} icon="📤"/>
              <Met label="Pul oqimi" val={`${fmt(faolMol.pul_oqimi)} ${sozl.valyuta}`} acc={faolMol.pul_oqimi>=0?C.info:C.danger} icon="💵"/>
              <Met label="Kapital"   val={`${fmt(kapital)} ${sozl.valyuta}`} sub="Aktiv − Passiv" acc="#5c8a3c" icon="🏦"/>
            </div>
            <div style={{...s.g2,marginTop:12}}>
              <div style={s.card}>
                <div style={s.h2}>🏛 Balans va P&L</div>
                {[["Aktivlar",faolMol.aktiv,C.accent],["Passivlar",faolMol.passiv,C.danger],["Kapital",kapital,C.info],
                  ["Debitorlik",faolMol.debitor,"#5c8a3c"],["Kreditorlik",faolMol.kreditor,C.warn],
                  ["Ish haqi",faolMol.ish_haqi,C.muted],["Amortizatsiya",faolMol.amortizatsiya,"#7a5c3c"],
                  ["Boshqa daromad",faolMol.boshqa_daromad,"#3a6b8a"]].map(([l,v,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:12,color:C.muted}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:700,color:col}}>{fmt(v)} {sozl.valyuta}</span>
                  </div>
                ))}
                <div style={s.sep}/>
                <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
                  <span style={{fontSize:11.5,color:C.muted}}>Yalpi foyda</span>
                  <span style={{fontWeight:700,color:yalpiF>=0?C.accent:C.danger,fontSize:12}}>{fmt(yalpiF)} {sozl.valyuta}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
                  <span style={{fontSize:11.5,color:C.muted}}>Soliq ({faolMol.soliq}%)</span>
                  <span style={{color:C.danger,fontWeight:600,fontSize:12}}>−{fmt(soliqM)} {sozl.valyuta}</span>
                </div>
                <div style={{background:"#e8f5e9",borderRadius:8,padding:"9px 12px",marginTop:8}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:900}}>Sof foyda</span>
                    <span style={{fontWeight:900,color:sofFoyda>=0?C.accent:C.danger,fontSize:14}}>{fmt(sofFoyda)} {sozl.valyuta}</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={s.card}>
                  <div style={s.h2}>📐 Moliyaviy koeffitsientlar</div>
                  <div style={s.g2}>
                    {[["Foyda ulushi",`${foydaMarj}%`,foydaMarj>15?C.accent:foydaMarj>5?C.warn:C.danger,foydaMarj>15?"Yaxshi":foydaMarj>5?"O'rtacha":"Past"],
                      ["Xarajat nisbati",`${xarajatNis}%`,xarajatNis<60?C.accent:xarajatNis<80?C.warn:C.danger,xarajatNis<60?"Samarali":xarajatNis<80?"O'rtacha":"Yuqori"],
                      ["Joriy koef.",joriyKoef!==null?joriyKoef:"—",joriyKoef>=2?C.accent:joriyKoef>=1?C.warn:C.danger,joriyKoef>=2?"Kuchli":joriyKoef>=1?"Yetarli":"Zaif"],
                      ["Qarz/Kapital",qarzKap!==null?qarzKap:"—",qarzKap!==null&&qarzKap<0.5?C.accent:qarzKap<1?C.warn:C.danger,qarzKap!==null&&qarzKap<0.5?"Xavfsiz":qarzKap<1?"O'rtacha":"Xavfli"],
                    ].map(([l,v,col,st])=>(
                      <div key={l} style={{background:C.cream,borderRadius:9,padding:"9px 11px",border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:9.5,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:900,color:col,marginTop:2}}>{v}</div>
                        <div style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:`${col}18`,color:col,fontWeight:600,display:"inline-block",marginTop:2}}>{st}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={s.h2}>📦 Inventar holati</div>
                    <button style={{...s.btnSm,fontSize:11}} onClick={()=>setTab("Inventar")}>Barchasi →</button>
                  </div>
                  {invXulosa.slice(0,6).map(kat=>(
                    <div key={kat.id} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,fontWeight:600}}>{kat.icon} {kat.nom}</span>
                        <span style={s.badge(kat.oshgan,kat.kamaygan)}>{kat.oshgan?"LIMIT":kat.kamaygan?"MIN PAST":`${fmtN(kat.miqdor)}/${fmtN(kat.limit)}`}</span>
                      </div>
                      <Prog pct={kat.pct} o={kat.oshgan} k={kat.kamaygan}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Tez tranzaksiya */}
            <div style={{...s.card,marginTop:12}}>
              <div style={s.h2}>⚡ Tez tranzaksiya</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,alignItems:"end"}}>
                {[
                  ["Kategoriya",<select style={s.sel} value={txF.katId} onChange={e=>setTxF(f=>({...f,katId:e.target.value}))}><option value="">Tanlang…</option>{katlar.map(k=><option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}</select>],
                  ["Tur",<select style={s.sel} value={txF.tur} onChange={e=>setTxF(f=>({...f,tur:e.target.value}))}><option value="kirim">➕ Kirim</option><option value="chiqim">➖ Chiqim</option></select>],
                  ["Miqdor",<input style={s.inp} type="number" min="0" placeholder="0" value={txF.miqdor} onChange={e=>setTxF(f=>({...f,miqdor:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&txQoshish()}/>],
                  ["Birlik narxi",<input style={s.inp} type="number" min="0" placeholder="0.00" value={txF.narx} onChange={e=>setTxF(f=>({...f,narx:e.target.value}))}/>],
                  ["Oy",<select style={s.sel} value={txF.oy} onChange={e=>setTxF(f=>({...f,oy:Number(e.target.value)}))}>{OYLAR_TO.map((o,i)=><option key={i} value={i}>{o}</option>)}</select>],
                  ["Izoh",<input style={s.inp} placeholder="Eslatma…" value={txF.eslatma} onChange={e=>setTxF(f=>({...f,eslatma:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&txQoshish()}/>],
                ].map(([l,inp])=><div key={l}><label style={s.lbl}>{l}</label>{inp}</div>)}
                <button style={{...s.btn,alignSelf:"flex-end"}} onClick={txQoshish}>Saqlash ↵</button>
              </div>
              {txF.narx>0&&txF.miqdor>0&&<div style={{fontSize:11,color:C.info,marginTop:6}}>💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor)*parseFloat(txF.narx)))} {sozl.valyuta}</strong> — avtomatik P&L ga qo'shiladi</div>}
            </div>
            {/* So'nggi tranzaksiyalar */}
            <div style={{...s.card,marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={s.h2}>🕐 So'nggi tranzaksiyalar — {OYLAR_TO[sm]}</div>
                <button style={{...s.btnSm,fontSize:11}} onClick={()=>setTab("Tranzaksiyalar")}>Hammasini ko'rish →</button>
              </div>
              {hammaTx.length===0?<div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:13}}>Tranzaksiyalar yo'q.</div>:
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                  <thead><tr>{["Sana","Kategoriya","Tur","Miqdor","Qiymat","Balans"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>{hammaTx.slice(0,8).map((tx,i)=>(
                    <tr key={tx.id} style={s.tRow(i)}>
                      <td style={{...s.td,color:C.muted}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")}</td>
                      <td style={s.td}><span style={{fontWeight:600,color:C.accent}}>{tx.icon} {tx.katNom}</span></td>
                      <td style={s.td}><span style={s.tag(tx.tur)}>{tx.tur==="kirim"?"Kirim":"Chiqim"}</span></td>
                      <td style={s.td}><span style={{fontWeight:700,color:tx.tur==="kirim"?C.accent:C.danger}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</span></td>
                      <td style={s.td}>{tx.qiymat>0?<span style={{color:C.info}}>{fmt(tx.qiymat)} {sozl.valyuta}</span>:<span style={{color:C.muted}}>—</span>}</td>
                      <td style={s.td}><span style={{fontWeight:600}}>{fmtN(tx.balans)} {tx.birlik}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>}
            </div>
          </div>
        )}

        {/* ══ INVENTAR ══ */}
        {tab==="Inventar"&&(
          <div>
            <div style={s.g2}>
              <div style={s.card}>
                <div style={s.h2}>📦 Tovar zaxirasi — {OYLAR_TO[sm]} {sy}</div>
                {invXulosa.map(kat=>(
                  <div key={kat.id} style={{background:C.cream,borderRadius:10,padding:"11px 13px",marginBottom:8,border:`1px solid ${kat.oshgan?"#c0392b30":kat.kamaygan?"#e6a00030":C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:700}}>{kat.icon} {kat.nom}</span>
                      <span style={s.badge(kat.oshgan,kat.kamaygan)}>{kat.oshgan?"LIMIT OSHDI":kat.kamaygan?"⚠ MIN PAST":`${kat.pct.toFixed(1)}%`}</span>
                    </div>
                    <div style={{fontSize:11.5,color:C.muted,marginTop:2}}>Zaxira: <strong>{fmtN(kat.miqdor)}</strong> / Limit: <strong>{fmtN(kat.limit)}</strong> / Min: <strong>{fmtN(kat.min)}</strong> {kat.birlik}</div>
                    <Prog pct={kat.pct} o={kat.oshgan} k={kat.kamaygan}/>
                    {kat.oshgan&&<div style={{fontSize:10.5,color:C.danger,fontWeight:700,marginTop:3}}>⚠ +{fmtN(P(kat.miqdor-kat.limit))} {kat.birlik} limitdan oshgan</div>}
                    {kat.kamaygan&&<div style={{fontSize:10.5,color:C.warn,fontWeight:700,marginTop:3}}>🔴 {fmtN(P(kat.min-kat.miqdor))} {kat.birlik} kerak — buyurtma bering!</div>}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={s.card}>
                  <div style={s.h2}>🥧 Taqsimot</div>
                  {pieData.length===0?<div style={{textAlign:"center",padding:"30px 0",color:C.muted}}>Ma'lumot yo'q.</div>:
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart><Pie data={pieData} dataKey="miqdor" nameKey="nom" cx="50%" cy="50%" outerRadius={85} innerRadius={35} paddingAngle={2}>
                      {pieData.map((k)=><Cell key={k.id} fill={k.color}/>)}
                    </Pie><Tooltip formatter={(v,n)=>[`${fmtN(v)}`,n]}/><Legend wrapperStyle={{fontSize:11}} iconSize={10}/></PieChart>
                  </ResponsiveContainer>}
                </div>
                <div style={s.card}>
                  <div style={s.h2}>⚡ Harakatni qayd etish</div>
                  {[["Kategoriya",<select style={s.sel} value={txF.katId} onChange={e=>setTxF(f=>({...f,katId:e.target.value}))}><option value="">Tanlang…</option>{katlar.map(k=><option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}</select>],
                    ["Tur",<select style={s.sel} value={txF.tur} onChange={e=>setTxF(f=>({...f,tur:e.target.value}))}><option value="kirim">➕ Kirim</option><option value="chiqim">➖ Chiqim</option></select>],
                    ["Miqdor",<input style={s.inp} type="number" min="0" value={txF.miqdor} onChange={e=>setTxF(f=>({...f,miqdor:e.target.value}))} placeholder="0"/>],
                    ["Birlik narxi",<input style={s.inp} type="number" min="0" value={txF.narx} onChange={e=>setTxF(f=>({...f,narx:e.target.value}))} placeholder="0.00"/>],
                    ["Yetkazuvchi",<input style={s.inp} value={txF.yetkazuvchi} onChange={e=>setTxF(f=>({...f,yetkazuvchi:e.target.value}))} placeholder="Manba…"/>],
                    ["Izoh",<input style={s.inp} value={txF.eslatma} onChange={e=>setTxF(f=>({...f,eslatma:e.target.value}))} placeholder="Eslatma…"/>],
                  ].map(([l,inp])=><div key={l} style={{marginBottom:8}}><label style={s.lbl}>{l}</label>{inp}</div>)}
                  <button style={{...s.btn,width:"100%",marginTop:4}} onClick={txQoshish}>Saqlash</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TRANZAKSIYALAR ══ */}
        {tab==="Tranzaksiyalar"&&(
          <div style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={s.h2}>📋 Daftar — {OYLAR_TO[sm]} {sy} <span style={{fontSize:11,fontWeight:400,color:C.muted}}>({filtrlangan.length} yozuv)</span></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input style={{...s.inp,width:150}} placeholder="🔍 Qidirish…" value={qidiruv} onChange={e=>setQidiruv(e.target.value)}/>
                <select style={{...s.sel,width:130}} value={txFilter} onChange={e=>setTxFilter(e.target.value)}>
                  <option value="hammasi">Barchasi</option><option value="kirim">Kiruvchi</option><option value="chiqim">Chiquvchi</option>
                </select>
                <button style={{...s.btnSm,background:C.info}} onClick={csvExport}>📥 CSV</button>
              </div>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:C.muted}}>Kirim: <strong style={{color:C.accent}}>{fmtN(filtrlangan.filter(t=>t.tur==="kirim").reduce((s,t)=>s+t.miqdor,0))}</strong></span>
              <span style={{fontSize:12,color:C.muted}}>Chiqim: <strong style={{color:C.danger}}>{fmtN(filtrlangan.filter(t=>t.tur==="chiqim").reduce((s,t)=>s+t.miqdor,0))}</strong></span>
              <span style={{fontSize:12,color:C.muted}}>Jami qiymat: <strong style={{color:C.info}}>{fmt(filtrlangan.reduce((s,t)=>s+(t.qiymat||0),0))} {sozl.valyuta}</strong></span>
            </div>
            {filtrlangan.length===0?<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>Tranzaksiyalar topilmadi.</div>:
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead><tr>{["#","Sana","Kategoriya","Tur","Miqdor","Narx","Qiymat","Balans","Yetkazuvchi","Izoh",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>{filtrlangan.map((tx,i)=>(
                  <tr key={tx.id} style={s.tRow(i)}>
                    <td style={{...s.td,color:C.muted}}>{i+1}</td>
                    <td style={{...s.td,whiteSpace:"nowrap",color:C.muted}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} {new Date(tx.sana).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td>
                    <td style={s.td}><span style={{fontWeight:600,color:C.accent}}>{tx.icon} {tx.katNom}</span></td>
                    <td style={s.td}><span style={s.tag(tx.tur)}>{tx.tur==="kirim"?"Kirim":"Chiqim"}</span></td>
                    <td style={s.td}><span style={{fontWeight:700,color:tx.tur==="kirim"?C.accent:C.danger}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</span></td>
                    <td style={s.td}>{tx.narx>0?`${fmt(tx.narx)} ${sozl.valyuta}`:<span style={{color:C.muted}}>—</span>}</td>
                    <td style={s.td}>{tx.qiymat>0?<span style={{color:C.info,fontWeight:600}}>{fmt(tx.qiymat)} {sozl.valyuta}</span>:<span style={{color:C.muted}}>—</span>}</td>
                    <td style={s.td}><span style={{fontWeight:600}}>{fmtN(tx.balans)} {tx.birlik}</span></td>
                    <td style={{...s.td,color:C.muted}}>{tx.yetkazuvchi||"—"}</td>
                    <td style={{...s.td,color:C.muted,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.eslatma||"—"}</td>
                    <td style={s.td}><button style={{...s.btnD,padding:"3px 8px"}} onClick={()=>setModal({type:"txOchir",katId:tx.katId,txId:tx.id})}>🗑</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>}
          </div>
        )}

        {/* ══ MOLIYA ══ */}
        {tab==="Moliya"&&(
          <div>
            <div style={s.g5}>
              <Met label="Sof foyda" val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${foydaMarj}% marja`} acc={sofFoyda>=0?C.accent:C.danger} icon="💰"/>
              <Met label="Yalpi foyda" val={`${fmt(yalpiF)} ${sozl.valyuta}`} acc={C.accent2} icon="📊"/>
              <Met label="Soliq" val={`${fmt(soliqM)} ${sozl.valyuta}`} sub={`@${faolMol.soliq}%`} acc={C.danger} icon="🏛"/>
              <Met label="Aktivlar" val={`${fmt(faolMol.aktiv)} ${sozl.valyuta}`} acc={C.info} icon="🏦"/>
              <Met label="Kapital" val={`${fmt(kapital)} ${sozl.valyuta}`} acc="#5c8a3c" icon="⚖️"/>
            </div>
            <div style={{...s.g2,marginTop:12}}>
              <div style={s.card}>
                <div style={s.h2}>📊 Foyda va zarar hisoboti</div>
                {[["(+) Daromad",faolMol.daromad,C.accent,true],["(+) Boshqa daromad",faolMol.boshqa_daromad,"#3a6b8a",false],
                  ["(−) Xarajat",faolMol.xarajat,C.danger,false],["(−) Ish haqi",faolMol.ish_haqi,C.warn,false],["(−) Amortizatsiya",faolMol.amortizatsiya,C.muted,false]
                ].map(([l,v,col,bold])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:12.5,color:bold?C.textDark:C.muted,fontWeight:bold?700:400}}>{l}</span>
                    <span style={{fontWeight:bold?700:500,color:col,fontSize:12.5}}>{fmt(v)} {sozl.valyuta}</span>
                  </div>
                ))}
                <div style={{background:"#e8f5e9",borderRadius:8,padding:"10px 12px",marginTop:10}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:14,fontWeight:900}}>Sof foyda</span>
                    <span style={{fontWeight:900,color:sofFoyda>=0?C.accent:C.danger,fontSize:15}}>{fmt(sofFoyda)} {sozl.valyuta}</span>
                  </div>
                </div>
                <button style={{...s.btn,width:"100%",marginTop:12}} onClick={()=>{setMolF({...faolMol});setModal({type:"moliya"});}}>✏️ Moliyani tahrirlash</button>
              </div>
              <div style={s.card}>
                <div style={s.h2}>📐 Moliyaviy sog'liq</div>
                {[["Foyda ulushi",`${foydaMarj}%`,foydaMarj>15?"Yaxshi":foydaMarj>5?"O'rtacha":"Past",foydaMarj>15?C.accent:foydaMarj>5?C.warn:C.danger],
                  ["Xarajat nisbati",`${xarajatNis}%`,xarajatNis<60?"Samarali":xarajatNis<80?"O'rtacha":"Yuqori",xarajatNis<60?C.accent:xarajatNis<80?C.warn:C.danger],
                  ["Joriy koef.",joriyKoef!==null?joriyKoef:"N/A",joriyKoef>=2?"Kuchli":joriyKoef>=1?"Yetarli":"Zaif",joriyKoef!==null&&joriyKoef>=2?C.accent:joriyKoef>=1?C.warn:C.danger],
                  ["Qarz/Kapital",qarzKap!==null?qarzKap:"N/A",qarzKap!==null&&qarzKap<0.5?"Xavfsiz":qarzKap<1?"O'rtacha":"Xavfli",qarzKap!==null&&qarzKap<0.5?C.accent:qarzKap<1?C.warn:C.danger],
                ].map(([l,v,st,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:12.5,color:C.textMid}}>{l}</span>
                    <div>
                      <span style={{fontWeight:900,color:col,fontSize:15,marginRight:8}}>{v}</span>
                      <span style={{fontSize:10.5,padding:"2px 7px",borderRadius:12,background:`${col}18`,color:col,fontWeight:700}}>{st}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ KATEGORIYALAR ══ */}
        {tab==="Kategoriyalar"&&(
          <div>
            <div style={{...s.card,marginBottom:12}}>
              <div style={s.h2}>➕ Yangi kategoriya</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,alignItems:"end"}}>
                {[["Nomi","nom","text"],["Birlik","birlik","text"],["Limit","limit","number"],["Minimum","min","number"],["Belgi","icon","text"]].map(([l,k,t])=>(
                  <div key={k}><label style={s.lbl}>{l}</label>
                  <input style={s.inp} type={t} placeholder={l} value={yangiK[k]||""} onChange={e=>setYangiK(f=>({...f,[k]:e.target.value}))} maxLength={k==="icon"?2:100}/></div>
                ))}
                <button style={{...s.btn,alignSelf:"flex-end"}} onClick={katQoshish}>Qo'shish</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.h2}>🗂 Barcha kategoriyalar ({katlar.length} ta)</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                  <thead><tr>{["","Nomi","Birlik","Limit","Min","Hozirgi","Holat","Tx","Amallar"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>{katlar.map((kat,i)=>{
                    const e=getCEntry(sm,sy,kat.id);
                    const o=kat.limit>0&&P(e.miqdor)>P(kat.limit);
                    const k=kat.min>0&&P(e.miqdor)<P(kat.min);
                    const pct=kat.limit>0?cl(PCT(e.miqdor,kat.limit),0,999):0;
                    return(<tr key={kat.id} style={s.tRow(i)}>
                      <td style={{...s.td,fontSize:18,textAlign:"center"}}>{kat.icon}</td>
                      <td style={s.td}><span style={{fontWeight:700}}>{kat.nom}</span></td>
                      <td style={s.td}>{kat.birlik}</td>
                      <td style={{...s.td,fontWeight:700}}>{fmtN(kat.limit)}</td>
                      <td style={{...s.td,color:C.warn,fontWeight:600}}>{fmtN(kat.min)}</td>
                      <td style={s.td}><div style={{fontSize:12,marginBottom:2}}>{fmtN(e.miqdor)} {kat.birlik}</div><Prog pct={pct} o={o} k={k}/></td>
                      <td style={s.td}><span style={s.badge(o,k)}>{o?"Limit oshdi":k?"Min past":"OK"}</span></td>
                      <td style={{...s.td,color:C.muted}}>{e.tranzaksiyalar.length}</td>
                      <td style={s.td}><div style={{display:"flex",gap:5}}>
                        <button style={s.btnSm} onClick={()=>{setTahrirK({...kat});setModal({type:"katTahrirla"});}}>✏️</button>
                        <button style={s.btnD} onClick={()=>katOchir(kat.id)}>🗑</button>
                      </div></td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAHLIL ══ */}
        {tab==="Tahlil"&&(
          <div>
            <div style={s.g4}>
              <Met label="Yillik daromad" val={`${fmt(yilJami.daromad)} ${sozl.valyuta}`} acc={C.accent} icon="📈"/>
              <Met label="Yillik xarajat" val={`${fmt(yilJami.xarajat)} ${sozl.valyuta}`} acc={C.danger} icon="📤"/>
              <Met label="Yillik foyda"   val={`${fmt(yilJami.foyda)} ${sozl.valyuta}`} acc={yilJami.foyda>=0?C.accent:C.danger} icon="💰"/>
              <Met label="Jami inventar"  val={`${fmtN(yilJami.inventar)} dona`} acc="#5c8a3c" icon="📦"/>
            </div>
            <div style={{...s.card,marginTop:12}}>
              <div style={s.h2}>📊 Daromad va xarajat — {sy}</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de"/>
                  <XAxis dataKey="oy" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}}/>
                  <Tooltip formatter={v=>`${fmt(v)} ${sozl.valyuta}`}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="daromad" fill={C.accent} name="Daromad" radius={[4,4,0,0]}/>
                  <Bar dataKey="xarajat" fill={C.danger} name="Xarajat" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{...s.g2,marginTop:12}}>
              <div style={s.card}>
                <div style={s.h2}>📉 Sof foyda dinamikasi</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
                    <defs><linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={C.accent} stopOpacity={0}/>
                    </linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de"/>
                    <XAxis dataKey="oy" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
                    <Tooltip formatter={v=>`${fmt(v)} ${sozl.valyuta}`}/>
                    <Area type="monotone" dataKey="foyda" stroke={C.accent} fill="url(#grd)" strokeWidth={2} name="Sof foyda" dot={{r:3}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={s.card}>
                <div style={s.h2}>📦 Inventar harakati</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de"/>
                    <XAxis dataKey="oy" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
                    <Tooltip/><Line type="monotone" dataKey="inventar" stroke={C.accent2} strokeWidth={2} dot={{r:3}} name="Dona"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{...s.card,marginTop:12}}>
              <div style={s.h2}>📋 Yillik jadval — {sy}</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                  <thead><tr>{["Oy","Daromad","Xarajat","Sof foyda","Marja %","Inventar"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {yillikData.map((r,i)=>{
                      const marj=r.daromad>0?P((r.foyda/r.daromad)*100):0;
                      const joriy=i===sm&&sy===HOZ_YIL;
                      return(<tr key={i} style={{...s.tRow(i),fontWeight:joriy?700:400}}>
                        <td style={{...s.td,color:joriy?C.accent:C.textMid,fontWeight:700}}>{OYLAR_TO[i]}{joriy?" ◀":""}</td>
                        <td style={s.td}>{fmt(r.daromad)} {sozl.valyuta}</td>
                        <td style={s.td}>{fmt(r.xarajat)} {sozl.valyuta}</td>
                        <td style={{...s.td,color:r.foyda>=0?C.accent:C.danger,fontWeight:700}}>{fmt(r.foyda)} {sozl.valyuta}</td>
                        <td style={{...s.td,color:marj>10?C.accent:marj>0?C.warn:C.danger}}>{marj}%</td>
                        <td style={s.td}>{fmtN(r.inventar)}</td>
                      </tr>);
                    })}
                    <tr style={{background:C.cream,fontWeight:900}}>
                      <td style={{...s.td,fontWeight:900}}>JAMI</td>
                      <td style={{...s.td,color:C.accent,fontWeight:800}}>{fmt(yilJami.daromad)} {sozl.valyuta}</td>
                      <td style={{...s.td,color:C.danger,fontWeight:800}}>{fmt(yilJami.xarajat)} {sozl.valyuta}</td>
                      <td style={{...s.td,color:yilJami.foyda>=0?C.accent:C.danger,fontWeight:900}}>{fmt(yilJami.foyda)} {sozl.valyuta}</td>
                      <td style={s.td}>{yilJami.daromad>0?P((yilJami.foyda/yilJami.daromad)*100):0}%</td>
                      <td style={{...s.td,fontWeight:700}}>{fmtN(yilJami.inventar)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ SOZLAMALAR ══ */}
        {tab==="Sozlamalar"&&(
          <div style={s.g2}>
            <div style={s.card}>
              <div style={s.h2}>⚙️ Ilova sozlamalari</div>
              {[["Kompaniya nomi","kompaniya","text"],["Valyuta belgisi","valyuta","text"],["Soliq stavkasi (%)","soliq","number"]].map(([l,k,t])=>(
                <div key={k} style={{marginBottom:12}}>
                  <label style={s.lbl}>{l}</label>
                  <input style={s.inp} type={t} value={sozl[k]||""} onChange={e=>setSozlState(prev=>({...prev,[k]:e.target.value}))}/>
                </div>
              ))}
              <button style={s.btn} onClick={()=>setSozl({...sozl})}>Saqlash</button>
              <div style={{marginTop:16,padding:12,background:"#e8f5e9",borderRadius:10,border:`1px solid ${C.accent}25`}}>
                <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:4}}>✅ Hisob ma'lumotlari</div>
                <div style={{fontSize:12,color:C.muted}}>Email: <strong>{foydalanuvchi.email}</strong></div>
                <div style={{fontSize:12,color:C.muted}}>UID: <strong style={{fontSize:10}}>{foydalanuvchi.uid}</strong></div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.h2}>🗄 Ma'lumotlar boshqaruvi</div>
              <div style={{background:C.cream,borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Firebase Firestore</div>
                <div style={{fontSize:12,color:C.muted}}>Kategoriyalar: <strong>{katlar.length} ta</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Ma'lumotli oylar: <strong>{Object.keys(mData).length} ta</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Jami tranzaksiyalar: <strong>{Object.values(mData).reduce((s,m)=>s+Object.values(m).reduce((s2,k)=>s2+(k.tranzaksiyalar?.length||0),0),0)} ta</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Undo tarixi: <strong>{tarix.length} qadam</strong></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button style={s.btnGhost} onClick={csvExport}>⬇ CSV eksport ({OYLAR_TO[sm]} {sy})</button>
                <button style={{...s.btnD,padding:"9px",fontSize:13,borderRadius:9,textAlign:"center"}} onClick={()=>{
                  if(window.confirm("⚠️ Barcha ma'lumotlar o'chib ketadi!")) {
                    setKatlar(DEF_KATEGORIYALAR);setMData({});setMol(DEF_MOL);setMMol({});
                    showXabar("Barcha ma'lumotlar tozalandi","info");
                  }
                }}>⚠ Barcha ma'lumotlarni o'chirish</button>
                <button style={{...s.btnD,padding:"9px",fontSize:13,borderRadius:9,textAlign:"center",background:C.muted}} onClick={()=>signOut(auth)}>
                  Hisobdan chiqish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// ROOT KOMPONENTI — Auth holati
// ════════════════════════════════════════════════
export default function App() {
  const [foydalanuvchi, setFoydalanuvchi] = useState(undefined); // undefined = tekshirilmoqda

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, user => setFoydalanuvchi(user||null));
    return () => unsub();
  },[]);

  if(foydalanuvchi===undefined) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f4f2ec",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,background:"#2d5a3d",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:18}}>AL</div>
      <div style={{color:"#7a7a6e",fontSize:14}}>Yuklanmoqda…</div>
    </div>
  );

  return foydalanuvchi ? <MainApp foydalanuvchi={foydalanuvchi}/> : <Login/>;
}
