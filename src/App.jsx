import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  OYLAR, OYLAR_TO, HOZ_YIL, HOZ_OY, DEF_KATEGORIYALAR, DEF_MOL,
  fmt, fmtN, P, PCT, cl, mkKey,
  fbGet, fbSetDebounced, flushPendingWrites,
  T, NAV_TABS, SIDEBAR_W, Ico, NAV_ICO,
  Inp, Sel, Card, H2, Btn, Tag, Badge, Prog, Met,
} from "./lib/shared.jsx";

// ─── Lazy yuklanadigan grafiklar ─────────────────────────
const InventarPieChart      = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.InventarPieChart})));
const DaromadXarajatBarChart= lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.DaromadXarajatBarChart})));
const SofFoydaAreaChart     = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.SofFoydaAreaChart})));
const InventarLineChart     = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.InventarLineChart})));

const ChartFallback = ()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,color:T.muted,fontSize:12,gap:8}}>
    <div className="alc-dot" style={{width:7,height:7,borderRadius:"50%",background:T.accent}}/>
    <div className="alc-dot" style={{width:7,height:7,borderRadius:"50%",background:T.accent}}/>
    <div className="alc-dot" style={{width:7,height:7,borderRadius:"50%",background:T.accent}}/>
  </div>
);

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
function Login() {
  const [email,setEmail]=useState("");
  const [parol,setParol]=useState("");
  const [rejim,setRejim]=useState("kirish");
  const [xato,setXato]=useState("");
  const [yukl,setYukl]=useState(false);

  const submit = async() => {
    if(!email||!parol){setXato("Email va parolni kiriting!");return;}
    setYukl(true);setXato("");
    try {
      if(rejim==="kirish") await signInWithEmailAndPassword(auth,email,parol);
      else                 await createUserWithEmailAndPassword(auth,email,parol);
    } catch(e) {
      const m={"auth/invalid-credential":"Email yoki parol noto'g'ri!","auth/email-already-in-use":"Bu email allaqachon ro'yxatdan o'tgan!","auth/weak-password":"Parol kamida 6 ta belgidan iborat bo'lsin!","auth/invalid-email":"Email noto'g'ri formatda!"};
      setXato(m[e.code]||"Xatolik: "+e.message);
    }
    setYukl(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at top, #1a1400 0%, #0a0e1a 65%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.card,borderRadius:T.rx,padding:"40px 36px",width:"100%",maxWidth:400,boxShadow:"0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"}}>

        {/* Logo with glow */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:36}}>
          <div style={{position:"relative",marginBottom:18}}>
            <div style={{position:"absolute",inset:-20,background:"radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)",borderRadius:"50%",animation:"alc-glow-pulse 2.5s ease-in-out infinite"}}/>
            <img src="/logo.png" alt="AccuLedger" style={{width:80,height:80,objectFit:"contain",borderRadius:18,position:"relative",zIndex:1,filter:"drop-shadow(0 0 12px rgba(201,168,76,0.4))"}}/>
          </div>
          <div style={{fontSize:26,fontWeight:900,color:T.accent,letterSpacing:-0.5,lineHeight:1}}>AccuLedger</div>
          <div style={{fontSize:12,color:T.muted,marginTop:6,letterSpacing:0.5}}>Moliyaviy boshqaruv tizimi</div>
        </div>

        <div style={{textAlign:"center",fontSize:13,color:T.muted,marginBottom:24,background:T.cream,borderRadius:T.rs,padding:"8px 16px",border:`1px solid ${T.border}`}}>
          {rejim==="kirish"?"Hisobingizga kiring":"Yangi hisob yarating"}
        </div>

        {xato&&<div style={{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBdr}`,borderRadius:T.rs,padding:"10px 14px",fontSize:13,marginBottom:16}}>⚠ {xato}</div>}

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:T.muted,fontWeight:700,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Email</label>
          <input style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"13px 16px",fontSize:14,background:T.cream,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s, box-shadow 0.2s",color:T.text}}
            type="email" placeholder="email@gmail.com" value={email}
            onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
            onFocus={e=>{e.target.style.borderColor=T.accent;e.target.style.boxShadow="0 0 0 3px rgba(201,168,76,0.15)";}}
            onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}/>
        </div>
        <div style={{marginBottom:28}}>
          <label style={{fontSize:11,color:T.muted,fontWeight:700,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Parol</label>
          <input style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"13px 16px",fontSize:14,background:T.cream,outline:"none",boxSizing:"border-box",color:T.text}}
            type="password" placeholder="••••••••" value={parol}
            onChange={e=>setParol(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        <button onClick={submit} disabled={yukl}
          style={{width:"100%",background:`linear-gradient(135deg, ${T.accent2}, ${T.accent})`,color:"#0a0e1a",border:"none",borderRadius:T.rs,padding:"14px",fontSize:14,cursor:yukl?"not-allowed":"pointer",fontWeight:800,boxShadow:"0 6px 20px rgba(201,168,76,0.35)",opacity:yukl?0.7:1,letterSpacing:0.3}}>
          {yukl?"Yuklanmoqda…":rejim==="kirish"?"Kirish →":"Ro'yxatdan o'tish →"}
        </button>

        <div onClick={()=>{setRejim(r=>r==="kirish"?"royxat":"kirish");setXato("");}}
          style={{textAlign:"center",marginTop:20,fontSize:13,color:T.accent,cursor:"pointer",fontWeight:600,padding:"8px",borderRadius:T.rs}}>
          {rejim==="kirish"?"Hisob yo'qmi? Ro'yxatdan o'tish →":"← Hisobingiz bormi? Kirish"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
function MainApp({foydalanuvchi}) {
  const uid = foydalanuvchi.uid;

  const [yuklanmoqda,setYuklanmoqda]=useState(true);
  const [katlar,setKatlarState]=useState([]);
  const [mData,setMDataState]=useState({});
  const [mol,setMolState]=useState(DEF_MOL);
  const [mMol,setMMolState]=useState({});
  const [sozl,setSozlState]=useState({valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15});
  const [tab,setTab]=useState("Bosh sahifa");
  const [sm,setSm]=useState(HOZ_OY);
  const [sy,setSy]=useState(HOZ_YIL);
  const [xabar,setXabar]=useState(null);
  const [ogohlar,setOgohlar]=useState([]);
  const [modal,setModal]=useState(null);
  const [qidiruv,setQidiruv]=useState("");
  const [txFilter,setTxFilter]=useState("hammasi");
  const [tarix,setTarix]=useState([]);
  const [txF,setTxF]=useState({katId:"",tur:"kirim",miqdor:"",eslatma:"",oy:HOZ_OY,yil:HOZ_YIL,narx:"",yetkazuvchi:""});
  const [molF,setMolF]=useState({...DEF_MOL});
  const [sozlF,setSozlF]=useState({valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15});
  const [yangiK,setYangiK]=useState({nom:"",birlik:"dona",limit:0,min:0,icon:"📦"});
  const [tahrirK,setTahrirK]=useState(null);
  const [bottomModal,setBottomModal]=useState(false);
  const [pwaPrompt,setPwaPrompt]=useState(null);
  const [showPwaBanner,setShowPwaBanner]=useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    const onPrompt=e=>{e.preventDefault();setPwaPrompt(e);};
    const onInstalled=()=>{setPwaPrompt(null);setShowPwaBanner(false);};
    window.addEventListener("beforeinstallprompt",onPrompt);
    window.addEventListener("appinstalled",onInstalled);
    return()=>{window.removeEventListener("beforeinstallprompt",onPrompt);window.removeEventListener("appinstalled",onInstalled);};
  },[]);

  // Show PWA install banner after 30 seconds
  useEffect(()=>{
    if(!pwaPrompt) return;
    const t=setTimeout(()=>setShowPwaBanner(true),30000);
    return()=>clearTimeout(t);
  },[pwaPrompt]);

  const pwaOrnatish=async()=>{
    if(!pwaPrompt) return;
    await pwaPrompt.prompt();
    setPwaPrompt(null);setShowPwaBanner(false);
  };

  const setKatlar=useCallback(async(v)=>{const val=typeof v==="function"?v(katlar):v;setKatlarState(val);fbSetDebounced(uid,"katlar",val);},[uid,katlar]);
  const setMData =useCallback(async(v)=>{const val=typeof v==="function"?v(mData):v; setMDataState(val); fbSetDebounced(uid,"mdata",val);},[uid,mData]);
  const setMol   =useCallback(async(v)=>{const val=typeof v==="function"?v(mol):v;   setMolState(val);   fbSetDebounced(uid,"mol",val);},[uid,mol]);
  const setMMol  =useCallback(async(v)=>{const val=typeof v==="function"?v(mMol):v;  setMMolState(val);  fbSetDebounced(uid,"mmol",val);},[uid,mMol]);
  const setSozl  =useCallback(async(v)=>{const val=typeof v==="function"?v(sozl):v;  setSozlState(val);  fbSetDebounced(uid,"sozl",val);},[uid,sozl]);

  useEffect(()=>{
    window.addEventListener("beforeunload",flushPendingWrites);
    return()=>{window.removeEventListener("beforeunload",flushPendingWrites);flushPendingWrites();};
  },[]);

  useEffect(()=>{
    (async()=>{
      const [k,m,mo,mm,s]=await Promise.all([
        fbGet(uid,"katlar",DEF_KATEGORIYALAR),fbGet(uid,"mdata",{}),
        fbGet(uid,"mol",DEF_MOL),fbGet(uid,"mmol",{}),
        fbGet(uid,"sozl",{valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15}),
      ]);
      setKatlarState(Array.isArray(k)?k:DEF_KATEGORIYALAR);
      setMDataState(m&&typeof m==="object"?m:{});
      setMolState(mo&&typeof mo==="object"?{...DEF_MOL,...mo}:DEF_MOL);
      setMMolState(mm&&typeof mm==="object"?mm:{});
      const sVal=s&&typeof s==="object"?s:{valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15};
      setSozlState(sVal);setSozlF(sVal);
      setYuklanmoqda(false);
    })();
  },[uid]);

  const showXabar=(msg,tur="info")=>{setXabar({msg,tur});setTimeout(()=>setXabar(null),3500);};

  const getCEntry =useCallback((m,y,katId)=>mData[mkKey(m,y)]?.[katId]||{miqdor:0,tranzaksiyalar:[]},[mData]);
  const getMolKey =useCallback((m,y)=>mMol[mkKey(m,y)]||null,[mMol]);
  const faolMol   =useMemo(()=>getMolKey(sm,sy)||mol,[sm,sy,mol,mMol,getMolKey]);

  useEffect(()=>{
    const yangi=[];
    katlar.forEach(kat=>{
      const e=getCEntry(HOZ_OY,HOZ_YIL,kat.id);
      if(kat.limit>0&&P(e.miqdor)>P(kat.limit)) yangi.push({...kat,ishlatilgan:e.miqdor,oshgan:P(e.miqdor-kat.limit),tur:"limit"});
      if(kat.min>0&&P(e.miqdor)<P(kat.min))     yangi.push({...kat,ishlatilgan:e.miqdor,tur:"minimum"});
    });
    setOgohlar(yangi);
  },[katlar,mData,getCEntry]);

  const sofFoyda  =useMemo(()=>{const g=P(faolMol.daromad-faolMol.xarajat);return P(g-P(g*(faolMol.soliq/100)));},[faolMol]);
  const kapital   =useMemo(()=>P(faolMol.aktiv-faolMol.passiv),[faolMol]);
  const yalpiF    =useMemo(()=>P(faolMol.daromad-faolMol.xarajat),[faolMol]);
  const soliqM    =useMemo(()=>P(yalpiF*(faolMol.soliq/100)),[yalpiF,faolMol.soliq]);
  const foydaMarj =faolMol.daromad>0?P((sofFoyda/faolMol.daromad)*100):0;
  const xarajatNis=faolMol.daromad>0?P((faolMol.xarajat/faolMol.daromad)*100):0;
  const joriyKoef =faolMol.passiv>0?P(faolMol.aktiv/faolMol.passiv):null;
  const qarzKap   =kapital>0?P(faolMol.passiv/kapital):null;

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
    return{...kat,miqdor:e.miqdor,pct,oshgan:kat.limit>0&&P(e.miqdor)>P(kat.limit),kamaygan:kat.min>0&&P(e.miqdor)<P(kat.min),txSoni:e.tranzaksiyalar.length};
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

  const txQoshish=async()=>{
    const miq=parseFloat(txF.miqdor),narx=parseFloat(txF.narx)||0;
    if(!txF.katId||isNaN(miq)||miq<=0){showXabar("Kategoriya va miqdorni to'ldiring!","xato");return;}
    const kat=katlar.find(k=>k.id===txF.katId);
    const key=mkKey(txF.oy,txF.yil);const qiymat=P(miq*narx);
    setTarix(prev=>[{mData,mMol},...prev.slice(0,19)]);
    const yangiMData={...mData};const me={...(yangiMData[key]||{})};
    const ke=me[txF.katId]||{miqdor:0,tranzaksiyalar:[]};
    const delta=txF.tur==="kirim"?miq:-miq;const yangiMiq=P(ke.miqdor+delta);
    const tx={id:Date.now(),tur:txF.tur,miqdor:miq,narx,qiymat,eslatma:txF.eslatma,yetkazuvchi:txF.yetkazuvchi,sana:new Date().toISOString(),balans:yangiMiq};
    yangiMData[key]={...me,[txF.katId]:{miqdor:yangiMiq,tranzaksiyalar:[tx,...ke.tranzaksiyalar]}};
    await setMData(yangiMData);
    if(narx>0){
      const yangiMMol={...mMol};const mf={...(yangiMMol[key]||{...mol})};
      if(txF.tur==="kirim") mf.daromad=P((mf.daromad||0)+qiymat);
      else                  mf.xarajat=P((mf.xarajat||0)+qiymat);
      yangiMMol[key]=mf;await setMMol(yangiMMol);
    }
    showXabar(`✅ ${txF.tur==="kirim"?"Kirim":"Chiqim"}: ${miq} ${kat?.birlik} — ${kat?.nom}`,"muvaffaq");
    setTxF(f=>({...f,miqdor:"",eslatma:"",narx:"",yetkazuvchi:""}));
    setBottomModal(false);
  };

  const bekorQilish=async()=>{
    if(!tarix.length){showXabar("Bekor qilishga narsa yo'q","ogoh");return;}
    const [oldingi,...qolgan]=tarix;
    setMDataState(oldingi.mData);setMMolState(oldingi.mMol);
    fbSetDebounced(uid,"mdata",oldingi.mData);fbSetDebounced(uid,"mmol",oldingi.mMol);
    setTarix(qolgan);showXabar("↩ Bekor qilindi","info");
  };

  const txOchir=async(katId,txId)=>{
    const key=mkKey(sm,sy);
    setTarix(prev=>[{mData,mMol},...prev.slice(0,19)]);
    const yangiMData={...mData};const me={...(yangiMData[key]||{})};
    const ke=me[katId]||{miqdor:0,tranzaksiyalar:[]};
    const ochirilgan=ke.tranzaksiyalar.find(t=>t.id===txId);
    const txlar=ke.tranzaksiyalar.filter(t=>t.id!==txId);
    const yangiMiq=txlar.reduce((acc,t)=>P(acc+(t.tur==="kirim"?t.miqdor:-t.miqdor)),0);
    yangiMData[key]={...me,[katId]:{miqdor:yangiMiq,tranzaksiyalar:txlar}};
    await setMData(yangiMData);
    if(ochirilgan?.qiymat>0){
      const yangiMMol={...mMol};const mf={...(yangiMMol[key]||{...mol})};
      if(ochirilgan.tur==="kirim") mf.daromad=P(Math.max(0,(mf.daromad||0)-ochirilgan.qiymat));
      else                         mf.xarajat=P(Math.max(0,(mf.xarajat||0)-ochirilgan.qiymat));
      yangiMMol[key]=mf;await setMMol(yangiMMol);
    }
    showXabar("Tranzaksiya o'chirildi, balans qayta hisoblandi","info");setModal(null);
  };

  const molSaqlash=async(oyGa)=>{
    const d={};Object.keys(DEF_MOL).forEach(k=>{d[k]=P(parseFloat(molF[k])||0);});
    if(oyGa){const key=mkKey(sm,sy);await setMMol({...mMol,[key]:d});}
    else await setMol(d);
    showXabar(oyGa?`${OYLAR_TO[sm]} uchun saqlandi`:"Umumiy moliya yangilandi!","muvaffaq");setModal(null);
  };

  const katQoshish=async()=>{
    if(!yangiK.nom.trim()){showXabar("Nom kiriting!","xato");return;}
    const ranglar=["#c9a84c","#4a7c59","#3b82f6","#a855f7","#22c55e","#06b6d4","#ec4899","#f97316"];
    const kat={id:`k${Date.now()}`,nom:yangiK.nom.trim(),birlik:yangiK.birlik||"dona",limit:P(parseFloat(yangiK.limit)||0),min:P(parseFloat(yangiK.min)||0),icon:yangiK.icon||"📦",color:ranglar[katlar.length%ranglar.length]};
    await setKatlar([...katlar,kat]);setYangiK({nom:"",birlik:"dona",limit:0,min:0,icon:"📦"});
    showXabar("Kategoriya qo'shildi!","muvaffaq");
  };

  const katSaqlash=async()=>{
    await setKatlar(katlar.map(k=>k.id===tahrirK.id?{...tahrirK,limit:P(parseFloat(tahrirK.limit)||0),min:P(parseFloat(tahrirK.min)||0)}:k));
    setTahrirK(null);setModal(null);showXabar("Yangilandi!","muvaffaq");
  };
  const katOchir=async(id)=>{await setKatlar(katlar.filter(k=>k.id!==id));showXabar("O'chirildi","info");};

  const csvExport=()=>{
    const sarlavha=["Sana","Kategoriya","Tur","Miqdor","Birlik","Narx","Qiymat","Balans","Yetkazuvchi","Izoh"];
    const qatorlar=hammaTx.map(t=>[new Date(t.sana).toLocaleString("uz-UZ"),t.katNom,t.tur==="kirim"?"Kirim":"Chiqim",t.miqdor,t.birlik,t.narx||0,t.qiymat||0,t.balans,t.yetkazuvchi||"",t.eslatma||""]);
    const csv=[sarlavha,...qatorlar].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`acculedger-${OYLAR_TO[sm]}-${sy}.csv`;a.click();
    showXabar("CSV yuklab olindi!","muvaffaq");
  };

  const pieData=invXulosa.filter(k=>k.miqdor>0);

  // ── TRANZAKSIYA FORMA ────────────────────────────────
  const txFormJSX=(
    <div>
      <Sel label="Kategoriya" value={txF.katId} onChange={e=>setTxF(f=>({...f,katId:e.target.value}))}>
        <option value="">Tanlang…</option>
        {katlar.map(k=><option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}
      </Sel>
      <Sel label="Tur" value={txF.tur} onChange={e=>setTxF(f=>({...f,tur:e.target.value}))}>
        <option value="kirim">➕ Kirim</option>
        <option value="chiqim">➖ Chiqim</option>
      </Sel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Inp label="Miqdor" type="number" value={txF.miqdor} onChange={e=>setTxF(f=>({...f,miqdor:e.target.value}))} placeholder="0"/>
        <Inp label="Birlik narxi" type="number" value={txF.narx} onChange={e=>setTxF(f=>({...f,narx:e.target.value}))} placeholder="0.00"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Sel label="Oy" value={txF.oy} onChange={e=>setTxF(f=>({...f,oy:Number(e.target.value)}))}>
          {OYLAR_TO.map((o,i)=><option key={i} value={i}>{o}</option>)}
        </Sel>
        <Inp label="Yetkazuvchi" value={txF.yetkazuvchi} onChange={e=>setTxF(f=>({...f,yetkazuvchi:e.target.value}))} placeholder="Manba…"/>
      </div>
      <Inp label="Izoh" value={txF.eslatma} onChange={e=>setTxF(f=>({...f,eslatma:e.target.value}))} placeholder="Eslatma…"/>
      {txF.narx>0&&txF.miqdor>0&&(
        <div style={{fontSize:12,color:T.accent,background:T.accentBg,borderRadius:8,padding:"8px 12px",marginBottom:10,border:`1px solid ${T.accentBdr}`}}>
          💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor)*parseFloat(txF.narx)))} {sozl.valyuta}</strong>
        </div>
      )}
      <Btn onClick={txQoshish} style={{width:"100%",justifyContent:"center",marginTop:4}}>Saqlash ↵</Btn>
    </div>
  );

  // ── SIDEBAR (desktop) ───────────────────────────────
  const sidebarJSX=(
    <div style={{position:"fixed",left:0,top:0,bottom:0,width:SIDEBAR_W,background:"#0d1526",borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",zIndex:100,boxShadow:"2px 0 24px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"20px 16px 18px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{position:"relative",flexShrink:0}}>
          <div style={{position:"absolute",inset:-6,background:"radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",borderRadius:14}}/>
          <img src="/logo.png" alt="AccuLedger" style={{width:36,height:36,objectFit:"contain",borderRadius:10,position:"relative",zIndex:1,filter:"drop-shadow(0 0 6px rgba(201,168,76,0.3))"}}/>
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:15,fontWeight:900,color:T.accent,lineHeight:1}}>AccuLedger</div>
          <div style={{fontSize:10,color:T.muted,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sozl.kompaniya}</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"10px 8px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV_TABS.map((t,i)=>{
          const isOn=tab===t;
          return(
            <button key={t} onClick={()=>setTab(t)} className="alc-nav-item"
              style={{display:"flex",alignItems:"center",gap:12,border:"none",
                background:isOn?T.accentBg:"transparent",
                color:isOn?T.accent:T.muted,
                borderRadius:12,padding:"10px 12px",fontSize:13,fontWeight:isOn?700:500,
                cursor:"pointer",textAlign:"left",width:"100%",
                borderLeft:isOn?`2px solid ${T.accent}`:"2px solid transparent"}}>
              {NAV_ICO[i]}
              <span style={{flex:1}}>{t}</span>
              {t==="Bosh sahifa"&&ogohlar.length>0&&(
                <span style={{background:"rgba(239,68,68,0.2)",color:T.danger,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:700}}>{ogohlar.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:2}}>
        {(pwaPrompt||showPwaBanner)&&(
          <button onClick={pwaOrnatish} className="alc-nav-item"
            style={{display:"flex",alignItems:"center",gap:12,border:`1px solid ${T.accentBdr}`,background:T.accentBg,color:T.accent,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left",width:"100%"}}>
            📲 <span>Ilovani o'rnatish</span>
          </button>
        )}
        <button onClick={bekorQilish} className="alc-nav-item"
          style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:tarix.length>0?T.warn:T.muted,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
          {Ico.undo} <span>Bekor qilish</span>
        </button>
        <button onClick={()=>{flushPendingWrites();signOut(auth);}} className="alc-nav-item"
          style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:T.muted,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
          {Ico.logout} <span>Chiqish</span>
        </button>
      </div>
    </div>
  );

  // ── LOADING ─────────────────────────────────────────
  if(yuklanmoqda) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:20}}>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:-24,background:"radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)",borderRadius:"50%"}}/>
        <img src="/logo.png" alt="AccuLedger" className="alc-pulse" style={{width:100,height:100,objectFit:"contain",position:"relative",zIndex:1,filter:"drop-shadow(0 0 16px rgba(201,168,76,0.4))"}}/>
      </div>
      <div style={{color:T.muted,fontSize:13,fontWeight:600}}>Ma'lumotlar yuklanmoqda…</div>
      <div style={{display:"flex",gap:8}}>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:T.accent}}/>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:T.accent}}/>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:T.accent}}/>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:T.bg,minHeight:"100vh",paddingBottom:isMobile?88:20}}>

      {/* TOAST */}
      {xabar&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,
          background:xabar.tur==="xato"?T.danger:xabar.tur==="muvaffaq"?"#1a3a1a":xabar.tur==="ogoh"?"#2a1a00":"#0d1a2a",
          color:xabar.tur==="xato"?"#fff":xabar.tur==="muvaffaq"?T.green:xabar.tur==="ogoh"?T.warn:"#93c5fd",
          border:`1px solid ${xabar.tur==="xato"?T.dangerBdr:xabar.tur==="muvaffaq"?"rgba(34,197,94,0.3)":xabar.tur==="ogoh"?T.warnBdr:"rgba(147,197,253,0.3)"}`,
          borderRadius:T.r,padding:"11px 20px",fontSize:13,fontWeight:700,
          boxShadow:T.shadowMd,whiteSpace:"nowrap",maxWidth:"90vw"}}>
          {xabar.msg}
        </div>
      )}

      {/* PWA INSTALL BANNER */}
      {showPwaBanner&&isMobile&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9998,background:`linear-gradient(135deg, #1a1400, #0f1929)`,borderBottom:`1px solid ${T.accentBdr}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:T.shadowMd}}>
          <img src="/logo.png" alt="" style={{width:36,height:36,borderRadius:10,objectFit:"contain"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:T.accent}}>AccuLedger'ni o'rnating</div>
            <div style={{fontSize:11,color:T.muted}}>Tezroq kirish uchun uy ekraniga qo'shing</div>
          </div>
          <button onClick={pwaOrnatish} style={{background:`linear-gradient(135deg, ${T.accent2}, ${T.accent})`,color:"#0a0e1a",border:"none",borderRadius:T.rs,padding:"8px 14px",fontSize:12,fontWeight:800,cursor:"pointer"}}>O'rnatish</button>
          <button onClick={()=>setShowPwaBanner(false)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",padding:4,fontSize:18}}>×</button>
        </div>
      )}

      {/* MODAL */}
      {modal&&(
        <div className="alc-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setModal(null)}>
          <div className="alc-modal" style={{background:T.card,borderRadius:T.rx,padding:28,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:T.shadowMd,border:`1px solid ${T.border}`}} onClick={e=>e.stopPropagation()}>
            {modal.type==="moliya"&&(<>
              <H2>💼 Moliyaviy ma'lumotlar</H2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Daromad 💰","daromad"],["Xarajat 📤","xarajat"],["Aktivlar","aktiv"],["Passivlar","passiv"],
                  ["Debitorlik","debitor"],["Kreditorlik","kreditor"],["Pul oqimi","pul_oqimi"],
                  ["Ish haqi","ish_haqi"],["Amortizatsiya","amortizatsiya"],["Boshqa daromad","boshqa_daromad"],
                  ["Byudjet","byudjet"],["Soliq %","soliq"]].map(([l,k])=>(
                  <Inp key={k} label={l} type="number" value={molF[k]||""} onChange={e=>setMolF(f=>({...f,[k]:e.target.value}))} placeholder="0"/>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn onClick={()=>molSaqlash(false)}>Umumiy saqlash</Btn>
                <Btn ghost onClick={()=>molSaqlash(true)}>Faqat {OYLAR[sm]} uchun</Btn>
                <Btn ghost onClick={()=>setModal(null)} style={{marginLeft:"auto"}}>Bekor</Btn>
              </div>
            </>)}
            {modal.type==="katTahrirla"&&tahrirK&&(<>
              <H2>✏️ Kategoriyani tahrirlash</H2>
              {[["Nomi","nom","text"],["Birlik","birlik","text"],["Limit","limit","number"],["Minimum","min","number"],["Belgi","icon","text"]].map(([l,k,t])=>(
                <Inp key={k} label={l} type={t} value={tahrirK[k]||""} onChange={e=>setTahrirK(f=>({...f,[k]:e.target.value}))}/>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Btn onClick={katSaqlash}>Saqlash</Btn>
                <Btn ghost onClick={()=>setModal(null)}>Bekor</Btn>
              </div>
            </>)}
            {modal.type==="txOchir"&&(<>
              <H2>🗑 Tranzaksiyani o'chirish?</H2>
              <p style={{fontSize:13,color:T.muted,marginBottom:24}}>Yozuv o'chiriladi va balans qayta hisoblanadi.</p>
              <div style={{display:"flex",gap:8}}>
                <Btn danger onClick={()=>txOchir(modal.katId,modal.txId)}>O'chirish</Btn>
                <Btn ghost onClick={()=>setModal(null)}>Bekor</Btn>
              </div>
            </>)}
            {modal.type==="oyReset"&&(<>
              <H2>⚠️ {OYLAR_TO[sm]} {sy} ni tozalash?</H2>
              <p style={{fontSize:13,color:T.muted,marginBottom:24}}>Ushbu oy uchun barcha ma'lumotlar o'chiriladi!</p>
              <div style={{display:"flex",gap:8}}>
                <Btn danger onClick={async()=>{
                  const key=mkKey(sm,sy);
                  const nmd={...mData};delete nmd[key];
                  const nmm={...mMol};delete nmm[key];
                  await setMData(nmd);await setMMol(nmm);
                  showXabar(`${OYLAR_TO[sm]} ${sy} tozalandi`,"info");setModal(null);
                }}>Ha, o'chirish</Btn>
                <Btn ghost onClick={()=>setModal(null)}>Bekor</Btn>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* BOTTOM SHEET — Yangi yozuv */}
      {bottomModal&&(
        <div className="alc-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setBottomModal(false)}>
          <div className="alc-sheet" style={{background:T.card,borderRadius:"24px 24px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:T.border,borderRadius:100,margin:"0 auto 20px"}}/>
            <H2>{Ico.plus} Yangi yozuv qo'shish</H2>
            {txFormJSX}
          </div>
        </div>
      )}

      {/* SIDEBAR (desktop) */}
      {!isMobile&&sidebarJSX}

      <div style={{marginLeft:isMobile?0:SIDEBAR_W,transition:"margin-left 0.25s ease"}}>

        {/* MOBILE HEADER */}
        {isMobile&&(
          <div style={{background:"rgba(10,14,26,0.9)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,0.4)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",inset:-4,background:"radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)",borderRadius:12}}/>
                <img src="/logo.png" alt="AccuLedger" style={{width:40,height:40,objectFit:"contain",borderRadius:10,position:"relative",zIndex:1,filter:"drop-shadow(0 0 6px rgba(201,168,76,0.25))"}}/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:900,color:T.accent,lineHeight:1}}>AccuLedger</div>
                <div style={{fontSize:10,color:T.muted}}>{tab}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {ogohlar.length>0&&<div style={{background:"rgba(239,68,68,0.15)",color:T.danger,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>⚠{ogohlar.length}</div>}
              <button onClick={bekorQilish} style={{width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,background:tarix.length>0?"rgba(245,158,11,0.1)":T.cream,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:tarix.length>0?T.warn:T.muted}}>
                {Ico.undo}
              </button>
              <button onClick={()=>{flushPendingWrites();signOut(auth);}} style={{width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,background:T.cream,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}>
                {Ico.logout}
              </button>
            </div>
          </div>
        )}

        {/* DAVR TANLASH */}
        <div style={{maxWidth:1100,margin:"12px auto 0",padding:"0 12px"}}>
          <div style={{background:T.card,borderRadius:T.r,padding:"10px 14px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",boxShadow:T.shadow}}>
            <span style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:0.5}}>DAVR</span>
            <select value={sm} onChange={e=>setSm(Number(e.target.value))} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,background:T.cream,outline:"none",color:T.text}}>
              {OYLAR_TO.map((o,i)=><option key={i} value={i}>{o}</option>)}
            </select>
            <select value={sy} onChange={e=>setSy(Number(e.target.value))} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",fontSize:12,background:T.cream,outline:"none",color:T.text}}>
              {[HOZ_YIL-2,HOZ_YIL-1,HOZ_YIL,HOZ_YIL+1].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <div style={{display:"flex",gap:6,marginLeft:"auto",flexWrap:"wrap"}}>
              <Btn small danger onClick={()=>setModal({type:"oyReset"})}>Tozala</Btn>
              <Btn small onClick={()=>{setMolF({...faolMol});setModal({type:"moliya"});}}>💼 Moliya</Btn>
              <Btn small color={T.info} onClick={csvExport}>{Ico.csv} CSV</Btn>
            </div>
          </div>

          {/* Ogohlantirishlar */}
          {ogohlar.filter(o=>o.tur==="limit").map(o=>(
            <div key={`l-${o.id}`} style={{background:T.warnBg,border:`1px solid ${T.warnBdr}`,borderRadius:T.rs,padding:"9px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{o.icon}</span>
              <div style={{flex:1,fontSize:12,color:T.text}}><strong>{o.nom}</strong> limitdan oshdi! <strong style={{color:T.danger}}>+{fmtN(o.oshgan)} {o.birlik}</strong></div>
            </div>
          ))}
          {ogohlar.filter(o=>o.tur==="minimum").map(o=>(
            <div key={`m-${o.id}`} style={{background:T.dangerBg,border:`1px solid ${T.dangerBdr}`,borderRadius:T.rs,padding:"9px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{o.icon}</span>
              <div style={{flex:1,fontSize:12,color:T.text}}><strong>{o.nom}</strong> — Qoldi: <strong style={{color:T.danger}}>{fmtN(o.ishlatilgan)} {o.birlik}</strong> ⚠ Buyurtma bering!</div>
            </div>
          ))}
        </div>

        {/* ══ KONTENT ══════════════════════════════════════ */}
        <div key={tab} className="alc-fade-in" style={{maxWidth:1100,margin:"12px auto",padding:"0 12px"}}>

          {/* BOSH SAHIFA */}
          {tab==="Bosh sahifa"&&(
            <div>
              {/* HERO BALANCE CARD */}
              <div style={{background:"linear-gradient(135deg, #1a1400 0%, #0f1929 50%, #0a0e1a 100%)",borderRadius:T.rx,padding:"28px 24px 24px",marginBottom:16,border:`1px solid rgba(201,168,76,0.2)`,boxShadow:"0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-50,right:-20,width:200,height:200,borderRadius:"50%",background:"rgba(201,168,76,0.04)",pointerEvents:"none"}}/>
                <div style={{position:"absolute",bottom:-30,left:-10,width:140,height:140,borderRadius:"50%",background:"rgba(201,168,76,0.03)",pointerEvents:"none"}}/>
                <div style={{position:"relative",zIndex:1}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>
                    {OYLAR_TO[sm]} {sy} — Sof foyda
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                    <div style={{fontSize:isMobile?34:44,fontWeight:900,color:sofFoyda>=0?T.accent:T.danger,lineHeight:1}}>
                      {fmt(sofFoyda)}
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:T.muted}}>{sozl.valyuta}</div>
                  </div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:22}}>
                    {faolMol.soliq}% soliqdan keyin · Foyda marjasi: <span style={{color:foydaMarj>10?T.green:foydaMarj>0?T.warn:T.danger}}>{foydaMarj}%</span>
                  </div>
                  <div style={{display:"flex",gap:isMobile?16:28,flexWrap:"wrap"}}>
                    {[["Daromad",`+${fmt(faolMol.daromad)}`,T.green],["Xarajat",`−${fmt(faolMol.xarajat)}`,T.red],["Kapital",fmt(kapital),T.info]].map(([l,v,col])=>(
                      <div key={l}>
                        <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{l}</div>
                        <div style={{fontSize:15,fontWeight:700,color:col}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                {[
                  {label:"Kirim",icon:"⬆️",bg:"rgba(34,197,94,0.1)",action:()=>{setTxF(f=>({...f,tur:"kirim"}));setBottomModal(true);}},
                  {label:"Chiqim",icon:"⬇️",bg:"rgba(239,68,68,0.1)",action:()=>{setTxF(f=>({...f,tur:"chiqim"}));setBottomModal(true);}},
                  {label:"Moliya",icon:"💼",bg:"rgba(96,165,250,0.1)",action:()=>setTab("Moliya")},
                  {label:"Hisobot",icon:"📊",bg:T.accentBg,action:()=>setTab("Tahlil")},
                ].map(({label,icon,bg,action})=>(
                  <button key={label} onClick={action} className="alc-btn alc-card-hover" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"pointer",boxShadow:T.shadow}}>
                    <div style={{width:44,height:44,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:T.textMid}}>{label}</div>
                  </button>
                ))}
              </div>

              {/* METRICS */}
              <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit,minmax(${isMobile?140:160}px,1fr))`,gap:10,marginBottom:16}}>
                <Met label="Sof foyda" val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${faolMol.soliq}% soliqdan keyin`} color={sofFoyda>=0?T.accent:T.danger} icon="💰"/>
                <Met label="Pul oqimi" val={`${fmt(faolMol.pul_oqimi)} ${sozl.valyuta}`} color={faolMol.pul_oqimi>=0?T.info:T.danger} icon="💵"/>
                {!isMobile&&<>
                  <Met label="Daromad" val={`${fmt(faolMol.daromad)} ${sozl.valyuta}`} color={T.accent2} icon="📈"/>
                  <Met label="Xarajat" val={`${fmt(faolMol.xarajat)} ${sozl.valyuta}`} sub={`${xarajatNis}% daromaddan`} color={T.danger} icon="📤"/>
                  <Met label="Kapital" val={`${fmt(kapital)} ${sozl.valyuta}`} sub="Aktiv − Passiv" color="#5c8a3c" icon="🏦"/>
                </>}
              </div>

              {/* BALANS + KOEFFITSIENTLAR (desktop) */}
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
                <Card>
                  <H2>🏛 Balans va P&L</H2>
                  {[["Aktivlar",faolMol.aktiv,T.accent],["Passivlar",faolMol.passiv,T.danger],["Kapital",kapital,T.info],
                    ["Debitorlik",faolMol.debitor,"#5c8a3c"],["Kreditorlik",faolMol.kreditor,T.warn],
                    ["Ish haqi",faolMol.ish_haqi,T.muted],["Amortizatsiya",faolMol.amortizatsiya,"#7a5c3c"],
                    ["Boshqa daromad",faolMol.boshqa_daromad,"#3a6b8a"]].map(([l,v,col])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:12,color:T.muted}}>{l}</span>
                      <span style={{fontSize:13,fontWeight:700,color:col}}>{fmt(v)} {sozl.valyuta}</span>
                    </div>
                  ))}
                  <div style={{background:T.successBg,borderRadius:T.rs,padding:"10px 12px",marginTop:12,border:"1px solid rgba(34,197,94,0.2)"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:14,fontWeight:900,color:T.text}}>Sof foyda</span>
                      <span style={{fontWeight:900,color:sofFoyda>=0?T.accent:T.danger,fontSize:15}}>{fmt(sofFoyda)} {sozl.valyuta}</span>
                    </div>
                  </div>
                </Card>

                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Card>
                    <H2>📐 Moliyaviy koeffitsientlar</H2>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[["Foyda ulushi",`${foydaMarj}%`,foydaMarj>15?T.accent:foydaMarj>5?T.warn:T.danger,foydaMarj>15?"Yaxshi":foydaMarj>5?"O'rtacha":"Past"],
                        ["Xarajat nisbati",`${xarajatNis}%`,xarajatNis<60?T.accent:xarajatNis<80?T.warn:T.danger,xarajatNis<60?"Samarali":xarajatNis<80?"O'rtacha":"Yuqori"],
                        ["Joriy koef.",joriyKoef!==null?joriyKoef:"—",joriyKoef>=2?T.accent:joriyKoef>=1?T.warn:T.danger,joriyKoef>=2?"Kuchli":joriyKoef>=1?"Yetarli":"Zaif"],
                        ["Qarz/Kapital",qarzKap!==null?qarzKap:"—",qarzKap!==null&&qarzKap<0.5?T.accent:qarzKap<1?T.warn:T.danger,qarzKap!==null&&qarzKap<0.5?"Xavfsiz":qarzKap<1?"O'rtacha":"Xavfli"],
                      ].map(([l,v,col,st])=>(
                        <div key={l} style={{background:T.cream,borderRadius:T.rs,padding:"12px",border:`1px solid ${T.border}`}}>
                          <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                          <div style={{fontSize:18,fontWeight:900,color:col,marginTop:4}}>{v}</div>
                          <div style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:`${col}20`,color:col,fontWeight:600,display:"inline-block",marginTop:4}}>{st}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <H2 style={{marginBottom:0}}>📦 Inventar holati</H2>
                      <Btn small ghost onClick={()=>setTab("Inventar")}>Barchasi →</Btn>
                    </div>
                    {invXulosa.slice(0,6).map(kat=>(
                      <div key={kat.id} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:600,color:T.text}}>{kat.icon} {kat.nom}</span>
                          <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${fmtN(kat.miqdor)}/${fmtN(kat.limit)}`}/>
                        </div>
                        <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>

              {/* Tez tranzaksiya (desktop) */}
              {!isMobile&&(
                <Card style={{marginBottom:12}}>
                  <H2>⚡ Tez tranzaksiya</H2>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,alignItems:"end"}}>
                    <Sel label="Kategoriya" value={txF.katId} onChange={e=>setTxF(f=>({...f,katId:e.target.value}))}>
                      <option value="">Tanlang…</option>
                      {katlar.map(k=><option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}
                    </Sel>
                    <Sel label="Tur" value={txF.tur} onChange={e=>setTxF(f=>({...f,tur:e.target.value}))}>
                      <option value="kirim">➕ Kirim</option>
                      <option value="chiqim">➖ Chiqim</option>
                    </Sel>
                    <Inp label="Miqdor" type="number" value={txF.miqdor} onChange={e=>setTxF(f=>({...f,miqdor:e.target.value}))} placeholder="0"/>
                    <Inp label="Birlik narxi" type="number" value={txF.narx} onChange={e=>setTxF(f=>({...f,narx:e.target.value}))} placeholder="0.00"/>
                    <Sel label="Oy" value={txF.oy} onChange={e=>setTxF(f=>({...f,oy:Number(e.target.value)}))}>
                      {OYLAR_TO.map((o,i)=><option key={i} value={i}>{o}</option>)}
                    </Sel>
                    <Inp label="Izoh" value={txF.eslatma} onChange={e=>setTxF(f=>({...f,eslatma:e.target.value}))} placeholder="Eslatma…"/>
                    <Btn onClick={txQoshish} style={{alignSelf:"flex-end",width:"100%",justifyContent:"center"}}>Saqlash ↵</Btn>
                  </div>
                  {txF.narx>0&&txF.miqdor>0&&<div style={{fontSize:12,color:T.accent,marginTop:8}}>💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor)*parseFloat(txF.narx)))} {sozl.valyuta}</strong></div>}
                </Card>
              )}

              {/* So'nggi tranzaksiyalar */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <H2 style={{marginBottom:0}}>🕐 So'nggi tranzaksiyalar — {OYLAR_TO[sm]}</H2>
                  <Btn small ghost onClick={()=>setTab("Tranzaksiyalar")}>Hammasini →</Btn>
                </div>
                {hammaTx.length===0
                  ?<div style={{textAlign:"center",padding:"36px 0",color:T.muted,fontSize:13}}>
                    <div style={{fontSize:36,marginBottom:10,opacity:0.4}}>📭</div>
                    Tranzaksiyalar yo'q.
                  </div>
                  :<div>
                    {hammaTx.slice(0,isMobile?5:8).map((tx,i)=>(
                      <div key={tx.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<hammaTx.slice(0,isMobile?5:8).length-1?`1px solid ${T.border}`:"none"}}>
                        <div style={{width:44,height:44,borderRadius:12,background:tx.tur==="kirim"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{tx.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.katNom}</div>
                          <div style={{fontSize:11,color:T.muted}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} · <Tag tur={tx.tur}/></div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:tx.tur==="kirim"?T.green:T.red}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</div>
                          {tx.qiymat>0&&<div style={{fontSize:11,color:T.muted}}>{fmt(tx.qiymat)} {sozl.valyuta}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </Card>
            </div>
          )}

          {/* INVENTAR */}
          {tab==="Inventar"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                <Card>
                  <H2>📦 Tovar zaxirasi — {OYLAR_TO[sm]} {sy}</H2>
                  {invXulosa.map(kat=>(
                    <div key={kat.id} style={{background:T.cream,borderRadius:T.rs,padding:"14px",marginBottom:8,border:`1px solid ${kat.oshgan?T.dangerBdr:kat.kamaygan?T.warnBdr:T.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:700,color:T.text}}>{kat.icon} {kat.nom}</span>
                        <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`}/>
                      </div>
                      <div style={{fontSize:11,color:T.muted,marginBottom:6}}>
                        Zaxira: <strong style={{color:T.text}}>{fmtN(kat.miqdor)}</strong> / Limit: <strong style={{color:T.text}}>{fmtN(kat.limit)}</strong> / Min: <strong style={{color:T.warn}}>{fmtN(kat.min)}</strong> {kat.birlik}
                      </div>
                      <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
                      {kat.oshgan&&<div style={{fontSize:11,color:T.danger,fontWeight:600,marginTop:6}}>⚠ +{fmtN(P(kat.miqdor-kat.limit))} {kat.birlik} limitdan oshgan</div>}
                      {kat.kamaygan&&<div style={{fontSize:11,color:T.warn,fontWeight:600,marginTop:6}}>🔴 {fmtN(P(kat.min-kat.miqdor))} {kat.birlik} kerak</div>}
                    </div>
                  ))}
                </Card>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Card>
                    <H2>🥧 Taqsimot</H2>
                    <Suspense fallback={<ChartFallback/>}>
                      <InventarPieChart pieData={pieData}/>
                    </Suspense>
                  </Card>
                  {!isMobile&&(
                    <Card>
                      <H2>⚡ Harakatni qayd etish</H2>
                      {txFormJSX}
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TRANZAKSIYALAR */}
          {tab==="Tranzaksiyalar"&&(
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <H2 style={{marginBottom:0}}>📋 Daftar — {OYLAR_TO[sm]} {sy} <span style={{fontSize:11,fontWeight:400,color:T.muted}}>({filtrlangan.length} yozuv)</span></H2>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.muted}}>{Ico.search}</span>
                    <input style={{border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"8px 10px 8px 34px",fontSize:13,background:T.cream,outline:"none",width:150,color:T.text}} placeholder="Qidirish…" value={qidiruv} onChange={e=>setQidiruv(e.target.value)}/>
                  </div>
                  <select value={txFilter} onChange={e=>setTxFilter(e.target.value)} style={{border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"8px 10px",fontSize:13,background:T.cream,outline:"none",color:T.text}}>
                    <option value="hammasi">Barchasi</option><option value="kirim">Kiruvchi</option><option value="chiqim">Chiquvchi</option>
                  </select>
                  <Btn small color={T.info} onClick={csvExport}>{Ico.csv} CSV</Btn>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                {[["Kirim",filtrlangan.filter(t=>t.tur==="kirim").reduce((s,t)=>s+t.miqdor,0),T.green],
                  ["Chiqim",filtrlangan.filter(t=>t.tur==="chiqim").reduce((s,t)=>s+t.miqdor,0),T.red],
                  ["Jami qiymat",filtrlangan.reduce((s,t)=>s+(t.qiymat||0),0),T.info]].map(([l,v,col])=>(
                  <div key={l} style={{background:T.cream,borderRadius:T.rs,padding:"6px 14px",border:`1px solid ${T.border}`}}>
                    <span style={{fontSize:11,color:T.muted}}>{l}: </span>
                    <strong style={{color:col,fontSize:13}}>{l==="Jami qiymat"?fmt(v):fmtN(v)}</strong>
                  </div>
                ))}
              </div>
              {filtrlangan.length===0
                ?<div style={{textAlign:"center",padding:"48px 0",color:T.muted,fontSize:13}}>
                  <div style={{fontSize:36,opacity:0.3,marginBottom:10}}>📋</div>
                  Tranzaksiyalar topilmadi.
                </div>
                :<div>
                  {isMobile
                    ? filtrlangan.map((tx,i)=>(
                      <div key={tx.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<filtrlangan.length-1?`1px solid ${T.border}`:"none"}}>
                        <div style={{width:42,height:42,borderRadius:12,background:tx.tur==="kirim"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tx.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>{tx.katNom}</div>
                          <div style={{fontSize:11,color:T.muted}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} {tx.eslatma?`· ${tx.eslatma}`:""}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:tx.tur==="kirim"?T.green:T.red}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</div>
                          <button onClick={()=>setModal({type:"txOchir",katId:tx.katId,txId:tx.id})} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,padding:0,marginTop:2}}>
                            {Ico.del}
                          </button>
                        </div>
                      </div>
                    ))
                    :<div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                        <thead><tr>
                          {["#","Sana","Kategoriya","Tur","Miqdor","Narx","Qiymat","Balans","Yetkazuvchi","Izoh",""].map(h=>(
                            <th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,borderBottom:`2px solid ${T.border}`,fontSize:11,textTransform:"uppercase",background:T.cream,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>{filtrlangan.map((tx,i)=>(
                          <tr key={tx.id} style={{background:i%2?T.cream:"transparent"}}>
                            <td style={{padding:"8px 10px",fontSize:12,color:T.muted,borderBottom:`1px solid ${T.border}`}}>{i+1}</td>
                            <td style={{padding:"8px 10px",fontSize:12,color:T.muted,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} {new Date(tx.sana).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><span style={{fontWeight:600,color:T.accent}}>{tx.icon} {tx.katNom}</span></td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><Tag tur={tx.tur}/></td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><span style={{fontWeight:700,color:tx.tur==="kirim"?T.green:T.red}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</span></td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.textMid}}>{tx.narx>0?`${fmt(tx.narx)} ${sozl.valyuta}`:"—"}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{tx.qiymat>0?<span style={{color:T.info,fontWeight:600}}>{fmt(tx.qiymat)} {sozl.valyuta}</span>:"—"}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,fontWeight:600,color:T.text}}>{fmtN(tx.balans)} {tx.birlik}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted}}>{tx.yetkazuvchi||"—"}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.eslatma||"—"}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                              <button onClick={()=>setModal({type:"txOchir",katId:tx.katId,txId:tx.id})} style={{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBdr}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600}}>
                                {Ico.del} O'chir
                              </button>
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  }
                </div>
              }
            </Card>
          )}

          {/* MOLIYA */}
          {tab==="Moliya"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
                <Met label="Sof foyda" val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${foydaMarj}% marja`} color={sofFoyda>=0?T.accent:T.danger} icon="💰"/>
                <Met label="Yalpi foyda" val={`${fmt(yalpiF)} ${sozl.valyuta}`} color={T.accent2} icon="📊"/>
                <Met label="Soliq" val={`${fmt(soliqM)} ${sozl.valyuta}`} sub={`@${faolMol.soliq}%`} color={T.danger} icon="🏛"/>
                <Met label="Aktivlar" val={`${fmt(faolMol.aktiv)} ${sozl.valyuta}`} color={T.info} icon="🏦"/>
                <Met label="Kapital" val={`${fmt(kapital)} ${sozl.valyuta}`} color="#5c8a3c" icon="⚖️"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                <Card>
                  <H2>📊 Foyda va zarar hisoboti</H2>
                  {[["(+) Daromad",faolMol.daromad,T.accent,true],["(+) Boshqa daromad",faolMol.boshqa_daromad,"#3a6b8a",false],
                    ["(−) Xarajat",faolMol.xarajat,T.danger,false],["(−) Ish haqi",faolMol.ish_haqi,T.warn,false],["(−) Amortizatsiya",faolMol.amortizatsiya,T.muted,false]
                  ].map(([l,v,col,bold])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:13,color:bold?T.text:T.muted,fontWeight:bold?700:400}}>{l}</span>
                      <span style={{fontWeight:bold?700:500,color:col,fontSize:13}}>{fmt(v)} {sozl.valyuta}</span>
                    </div>
                  ))}
                  <div style={{background:T.successBg,borderRadius:T.rs,padding:"12px 14px",marginTop:14,border:"1px solid rgba(34,197,94,0.2)"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:14,fontWeight:900,color:T.text}}>Sof foyda</span>
                      <span style={{fontWeight:900,color:sofFoyda>=0?T.accent:T.danger,fontSize:15}}>{fmt(sofFoyda)} {sozl.valyuta}</span>
                    </div>
                  </div>
                  <Btn onClick={()=>{setMolF({...faolMol});setModal({type:"moliya"});}} style={{width:"100%",justifyContent:"center",marginTop:14}}>{Ico.edit} Moliyani tahrirlash</Btn>
                </Card>
                <Card>
                  <H2>📐 Moliyaviy sog'liq</H2>
                  {[["Foyda ulushi",`${foydaMarj}%`,foydaMarj>15?"Yaxshi":foydaMarj>5?"O'rtacha":"Past",foydaMarj>15?T.accent:foydaMarj>5?T.warn:T.danger],
                    ["Xarajat nisbati",`${xarajatNis}%`,xarajatNis<60?"Samarali":xarajatNis<80?"O'rtacha":"Yuqori",xarajatNis<60?T.accent:xarajatNis<80?T.warn:T.danger],
                    ["Joriy koef.",joriyKoef!==null?joriyKoef:"N/A",joriyKoef>=2?"Kuchli":joriyKoef>=1?"Yetarli":"Zaif",joriyKoef!==null&&joriyKoef>=2?T.accent:joriyKoef>=1?T.warn:T.danger],
                    ["Qarz/Kapital",qarzKap!==null?qarzKap:"N/A",qarzKap!==null&&qarzKap<0.5?"Xavfsiz":qarzKap<1?"O'rtacha":"Xavfli",qarzKap!==null&&qarzKap<0.5?T.accent:qarzKap<1?T.warn:T.danger],
                  ].map(([l,v,st,col])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:13,color:T.textMid}}>{l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontWeight:900,color:col,fontSize:15}}>{v}</span>
                        <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:`${col}18`,color:col,fontWeight:700}}>{st}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* KATEGORIYALAR */}
          {tab==="Kategoriyalar"&&(
            <div>
              <Card style={{marginBottom:12}}>
                <H2>➕ Yangi kategoriya</H2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,alignItems:"end"}}>
                  {[["Nomi","nom","text"],["Birlik","birlik","text"],["Limit","limit","number"],["Minimum","min","number"],["Belgi","icon","text"]].map(([l,k,t])=>(
                    <Inp key={k} label={l} type={t} value={yangiK[k]||""} onChange={e=>setYangiK(f=>({...f,[k]:e.target.value}))} placeholder={l}/>
                  ))}
                  <Btn onClick={katQoshish} style={{alignSelf:"flex-end",justifyContent:"center"}}>Qo'shish</Btn>
                </div>
              </Card>
              <Card>
                <H2>🗂 Barcha kategoriyalar ({katlar.length} ta)</H2>
                {isMobile
                  ? katlar.map((kat,i)=>{
                      const e=getCEntry(sm,sy,kat.id);const o=kat.limit>0&&P(e.miqdor)>P(kat.limit);const k=kat.min>0&&P(e.miqdor)<P(kat.min);
                      return(
                        <div key={kat.id} style={{background:T.cream,borderRadius:T.rs,padding:"14px",marginBottom:8,border:`1px solid ${T.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:14,fontWeight:700,color:T.text}}>{kat.icon} {kat.nom}</span>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>{setTahrirK({...kat});setModal({type:"katTahrirla"});}} style={{background:T.accentBg,color:T.accent,border:`1px solid ${T.accentBdr}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.edit}</button>
                              <button onClick={()=>katOchir(kat.id)} style={{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBdr}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.del}</button>
                            </div>
                          </div>
                          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Birlik: {kat.birlik} · Limit: {fmtN(kat.limit)} · Min: {fmtN(kat.min)}</div>
                          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4}}>{fmtN(e.miqdor)} {kat.birlik} <Badge oshgan={o} kamaygan={k} val="OK"/></div>
                          <Prog pct={kat.limit>0?cl(PCT(e.miqdor,kat.limit),0,999):0} oshgan={o} kamaygan={k}/>
                        </div>
                      );
                    })
                  :<div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                      <thead><tr>
                        {["","Nomi","Birlik","Limit","Min","Hozirgi","Holat","Tx","Amallar"].map(h=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,borderBottom:`2px solid ${T.border}`,fontSize:11,textTransform:"uppercase",background:T.cream}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{katlar.map((kat,i)=>{
                        const e=getCEntry(sm,sy,kat.id);const o=kat.limit>0&&P(e.miqdor)>P(kat.limit);const k=kat.min>0&&P(e.miqdor)<P(kat.min);
                        const pct=kat.limit>0?cl(PCT(e.miqdor,kat.limit),0,999):0;
                        return(
                          <tr key={kat.id} style={{background:i%2?T.cream:"transparent"}}>
                            <td style={{padding:"8px 10px",fontSize:18,borderBottom:`1px solid ${T.border}`,textAlign:"center"}}>{kat.icon}</td>
                            <td style={{padding:"8px 10px",fontSize:13,borderBottom:`1px solid ${T.border}`,fontWeight:700,color:T.text}}>{kat.nom}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.textMid}}>{kat.birlik}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,fontWeight:700,color:T.text}}>{fmtN(kat.limit)}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.warn,fontWeight:600}}>{fmtN(kat.min)}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                              <div style={{marginBottom:4,color:T.text}}>{fmtN(e.miqdor)} {kat.birlik}</div>
                              <Prog pct={pct} oshgan={o} kamaygan={k}/>
                            </td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><Badge oshgan={o} kamaygan={k} val="OK"/></td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted}}>{e.tranzaksiyalar.length}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                              <div style={{display:"flex",gap:5}}>
                                <button onClick={()=>{setTahrirK({...kat});setModal({type:"katTahrirla"});}} style={{background:T.accentBg,color:T.accent,border:`1px solid ${T.accentBdr}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600}}>{Ico.edit} Tahrirla</button>
                                <button onClick={()=>katOchir(kat.id)} style={{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBdr}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600}}>{Ico.del} O'chir</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                }
              </Card>
            </div>
          )}

          {/* TAHLIL */}
          {tab==="Tahlil"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
                <Met label="Yillik daromad" val={`${fmt(yilJami.daromad)} ${sozl.valyuta}`} color={T.accent} icon="📈"/>
                <Met label="Yillik xarajat" val={`${fmt(yilJami.xarajat)} ${sozl.valyuta}`} color={T.danger} icon="📤"/>
                <Met label="Yillik foyda"   val={`${fmt(yilJami.foyda)} ${sozl.valyuta}`} color={yilJami.foyda>=0?T.accent:T.danger} icon="💰"/>
                <Met label="Jami inventar"  val={`${fmtN(yilJami.inventar)} dona`} color="#5c8a3c" icon="📦"/>
              </div>
              <Card style={{marginBottom:12}}>
                <H2>📊 Daromad va xarajat — {sy}</H2>
                <Suspense fallback={<ChartFallback/>}>
                  <DaromadXarajatBarChart yillikData={yillikData} valyuta={sozl.valyuta}/>
                </Suspense>
              </Card>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
                <Card>
                  <H2>📉 Sof foyda dinamikasi</H2>
                  <Suspense fallback={<ChartFallback/>}>
                    <SofFoydaAreaChart yillikData={yillikData} valyuta={sozl.valyuta}/>
                  </Suspense>
                </Card>
                <Card>
                  <H2>📦 Inventar harakati</H2>
                  <Suspense fallback={<ChartFallback/>}>
                    <InventarLineChart yillikData={yillikData}/>
                  </Suspense>
                </Card>
              </div>
              <Card>
                <H2>📋 Yillik jadval — {sy}</H2>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                    <thead><tr>
                      {["Oy","Daromad","Xarajat","Sof foyda","Marja %","Inventar"].map(h=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,borderBottom:`2px solid ${T.border}`,fontSize:11,textTransform:"uppercase",background:T.cream}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {yillikData.map((r,i)=>{
                        const marj=r.daromad>0?P((r.foyda/r.daromad)*100):0;const joriy=i===sm&&sy===HOZ_YIL;
                        return(
                          <tr key={i} style={{background:joriy?T.joriyBg:i%2?T.cream:"transparent",fontWeight:joriy?700:400}}>
                            <td style={{padding:"8px 10px",fontSize:13,borderBottom:`1px solid ${T.border}`,color:joriy?T.accent:T.textMid,fontWeight:700}}>{OYLAR_TO[i]}{joriy?" ◀":""}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.text}}>{fmt(r.daromad)} {sozl.valyuta}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.text}}>{fmt(r.xarajat)} {sozl.valyuta}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:r.foyda>=0?T.accent:T.danger,fontWeight:700}}>{fmt(r.foyda)} {sozl.valyuta}</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:marj>10?T.accent:marj>0?T.warn:T.danger}}>{marj}%</td>
                            <td style={{padding:"8px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.text}}>{fmtN(r.inventar)}</td>
                          </tr>
                        );
                      })}
                      <tr style={{background:T.cream,fontWeight:900}}>
                        <td style={{padding:"9px 10px",fontWeight:900,borderBottom:`1px solid ${T.border}`,color:T.accent}}>JAMI</td>
                        <td style={{padding:"9px 10px",color:T.green,fontWeight:800,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.daromad)} {sozl.valyuta}</td>
                        <td style={{padding:"9px 10px",color:T.red,fontWeight:800,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.xarajat)} {sozl.valyuta}</td>
                        <td style={{padding:"9px 10px",color:yilJami.foyda>=0?T.accent:T.danger,fontWeight:900,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.foyda)} {sozl.valyuta}</td>
                        <td style={{padding:"9px 10px",borderBottom:`1px solid ${T.border}`,color:T.textMid}}>{yilJami.daromad>0?P((yilJami.foyda/yilJami.daromad)*100):0}%</td>
                        <td style={{padding:"9px 10px",fontWeight:700,borderBottom:`1px solid ${T.border}`,color:T.text}}>{fmtN(yilJami.inventar)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* SOZLAMALAR */}
          {tab==="Sozlamalar"&&(
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <Card>
                <H2>⚙️ Ilova sozlamalari</H2>
                {[["Kompaniya nomi","kompaniya","text"],["Valyuta belgisi","valyuta","text"],["Soliq stavkasi (%)","soliq","number"]].map(([l,k,t])=>(
                  <Inp key={k} label={l} type={t} value={sozlF[k]??""} onChange={e=>setSozlF(prev=>({...prev,[k]:e.target.value}))}/>
                ))}
                <Btn onClick={()=>{setSozl(sozlF);showXabar("Sozlamalar saqlandi","muvaffaq");}} style={{width:"100%",justifyContent:"center"}}>Saqlash</Btn>
                <div style={{marginTop:18,padding:16,background:T.successBg,borderRadius:T.rs,border:"1px solid rgba(34,197,94,0.2)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:8}}>✅ Hisob ma'lumotlari</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Email: <strong style={{color:T.text}}>{foydalanuvchi.email}</strong></div>
                  <div style={{fontSize:11,color:T.muted}}>UID: <strong style={{fontSize:10,color:T.textMid}}>{foydalanuvchi.uid}</strong></div>
                </div>
                {(pwaPrompt||showPwaBanner)&&(
                  <button onClick={pwaOrnatish} style={{width:"100%",marginTop:12,background:`linear-gradient(135deg, ${T.accent2}, ${T.accent})`,color:"#0a0e1a",border:"none",borderRadius:T.rs,padding:"12px",fontSize:13,cursor:"pointer",fontWeight:800}}>
                    📲 Ilovani uy ekraniga o'rnatish
                  </button>
                )}
              </Card>
              <Card>
                <H2>🗄 Ma'lumotlar boshqaruvi</H2>
                <div style={{background:T.cream,borderRadius:T.rs,padding:16,marginBottom:16,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:T.accent}}>Firebase Firestore</div>
                  {[["Kategoriyalar",`${katlar.length} ta`],["Ma'lumotli oylar",`${Object.keys(mData).length} ta`],
                    ["Jami tranzaksiyalar",`${Object.values(mData).reduce((s,m)=>s+Object.values(m).reduce((s2,k)=>s2+(k.tranzaksiyalar?.length||0),0),0)} ta`],
                    ["Undo tarixi",`${tarix.length} qadam`]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:12,color:T.muted}}>{l}</span>
                      <strong style={{fontSize:12,color:T.text}}>{v}</strong>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Btn ghost onClick={csvExport} style={{justifyContent:"center"}}>{Ico.csv} CSV eksport ({OYLAR_TO[sm]} {sy})</Btn>
                  <Btn danger onClick={()=>{
                    if(window.confirm("⚠️ Barcha ma'lumotlar o'chib ketadi!")) {
                      setKatlar(DEF_KATEGORIYALAR);setMData({});setMol(DEF_MOL);setMMol({});
                      showXabar("Barcha ma'lumotlar tozalandi","info");
                    }
                  }} style={{justifyContent:"center"}}>⚠ Barcha ma'lumotlarni o'chirish</Btn>
                  <Btn ghost onClick={()=>{flushPendingWrites();signOut(auth);}} style={{justifyContent:"center",color:T.muted,borderColor:T.border}}>
                    {Ico.logout} Hisobdan chiqish
                  </Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV — 5 items with center FAB */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,14,26,0.95)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",alignItems:"center",paddingLeft:8,paddingRight:8,paddingBottom:"env(safe-area-inset-bottom, 12px)",zIndex:90,boxShadow:"0 -4px 24px rgba(0,0,0,0.4)",minHeight:64}}>
          {[
            {t:"Bosh sahifa",i:Ico.home,l:"Bosh"},
            {t:"Inventar",i:Ico.inv,l:"Inventar"},
            null,
            {t:"Tahlil",i:Ico.chart,l:"Tahlil"},
            {t:"Sozlamalar",i:Ico.sett,l:"Sozlama"},
          ].map((item,idx)=>{
            if(item===null) return(
              <button key="fab" onClick={()=>setBottomModal(true)} className="alc-btn" style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg, ${T.accent2}, ${T.accent})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0e1a",boxShadow:`0 4px 20px rgba(201,168,76,0.5), 0 2px 8px rgba(0,0,0,0.5)`,transform:"translateY(-10px)",flexShrink:0}}>
                {Ico.plus}
              </button>
            );
            const isOn=tab===item.t;
            return(
              <button key={item.t} onClick={()=>setTab(item.t)} className="alc-nav-item" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,border:"none",background:"transparent",cursor:"pointer",padding:"8px 10px",borderRadius:12,color:isOn?T.accent:T.muted,minWidth:48,flex:1,transition:"color 0.2s"}}>
                <div style={{width:40,height:32,borderRadius:10,background:isOn?T.accentBg:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}>
                  {item.i}
                </div>
                <span style={{fontSize:9,fontWeight:isOn?700:400,lineHeight:1}}>{item.l}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT — Auth holati
// ═══════════════════════════════════════════════════════
export default function App() {
  const [foydalanuvchi,setFoydalanuvchi]=useState(undefined);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,user=>setFoydalanuvchi(user||null));
    return()=>unsub();
  },[]);

  if(foydalanuvchi===undefined) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"radial-gradient(ellipse at top, #1a1400 0%, #0a0e1a 70%)",flexDirection:"column",gap:24}}>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:-28,background:"radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)",borderRadius:"50%",animation:"alc-glow-pulse 2.5s ease-in-out infinite"}}/>
        <img src="/logo.png" alt="AccuLedger" className="alc-pulse" style={{width:120,height:120,objectFit:"contain",position:"relative",zIndex:1,filter:"drop-shadow(0 0 20px rgba(201,168,76,0.5))"}}/>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:900,color:"#c9a84c",letterSpacing:-0.5,marginBottom:6}}>AccuLedger</div>
        <div style={{color:"#6b7a99",fontSize:13,fontWeight:600}}>Yuklanmoqda…</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:"#c9a84c"}}/>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:"#c9a84c"}}/>
        <div className="alc-dot" style={{width:8,height:8,borderRadius:"50%",background:"#c9a84c"}}/>
      </div>
    </div>
  );

  return foydalanuvchi?<MainApp foydalanuvchi={foydalanuvchi}/>:<Login/>;
}
