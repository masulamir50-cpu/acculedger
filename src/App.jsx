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
  Inp, Sel,
} from "./lib/shared.jsx";

// ─── Lazy yuklanadigan grafiklar (recharts) ─────────────
const InventarPieChart      = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.InventarPieChart})));
const DaromadXarajatBarChart= lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.DaromadXarajatBarChart})));
const SofFoydaAreaChart     = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.SofFoydaAreaChart})));
const InventarLineChart     = lazy(()=>import("./components/Charts.jsx").then(m=>({default:m.InventarLineChart})));

const ChartFallback = ()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:180,color:T.muted,fontSize:12}}>
    Grafik yuklanmoqda…
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
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.card,borderRadius:T.rx,padding:32,width:"100%",maxWidth:380,boxShadow:T.shadowMd}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"center",marginBottom:28}}>
          <img src="/logo.png" alt="AccuLedger" style={{width:44,height:44,borderRadius:12,objectFit:"cover",flexShrink:0,boxShadow:T.shadow}}/>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:T.accent,lineHeight:1}}>AccuLedger</div>
            <div style={{fontSize:11,color:T.muted}}>Moliyaviy boshqaruv tizimi</div>
          </div>
        </div>

        <div style={{textAlign:"center",fontSize:13,color:T.muted,marginBottom:20}}>
          {rejim==="kirish"?"Hisobingizga kiring":"Yangi hisob yarating"}
        </div>

        {xato&&<div style={{background:"#fef2f2",color:T.danger,border:`1px solid #fecaca`,borderRadius:T.rs,padding:"10px 14px",fontSize:13,marginBottom:14}}>⚠ {xato}</div>}

        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,color:T.muted,fontWeight:700,display:"block",marginBottom:5}}>Email</label>
          <input style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"12px 14px",fontSize:14,background:T.cream,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
            type="email" placeholder="email@gmail.com" value={email}
            onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
            onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:T.muted,fontWeight:700,display:"block",marginBottom:5}}>Parol</label>
          <input style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"12px 14px",fontSize:14,background:T.cream,outline:"none",boxSizing:"border-box"}}
            type="password" placeholder="••••••••" value={parol}
            onChange={e=>setParol(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        <button onClick={submit} disabled={yukl}
          style={{width:"100%",background:T.accent,color:"#fff",border:"none",borderRadius:T.rs,padding:"13px",fontSize:14,cursor:"pointer",fontWeight:700,boxShadow:`0 4px 12px rgba(30,58,43,0.35)`,opacity:yukl?0.7:1}}>
          {yukl?"Yuklanmoqda…":rejim==="kirish"?"Kirish →":"Ro'yxatdan o'tish →"}
        </button>

        <div onClick={()=>{setRejim(r=>r==="kirish"?"royxat":"kirish");setXato("");}}
          style={{textAlign:"center",marginTop:16,fontSize:13,color:T.accent,cursor:"pointer",fontWeight:600}}>
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
  const [yangiK,setYangiK]=useState({nom:"",birlik:"dona",limit:0,min:0,icon:"📦"});
  const [tahrirK,setTahrirK]=useState(null);
  const [bottomModal,setBottomModal]=useState(false);
  const [pwaPrompt,setPwaPrompt]=useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    const onPrompt=e=>{e.preventDefault();setPwaPrompt(e);};
    const onInstalled=()=>setPwaPrompt(null);
    window.addEventListener("beforeinstallprompt",onPrompt);
    window.addEventListener("appinstalled",onInstalled);
    return()=>{window.removeEventListener("beforeinstallprompt",onPrompt);window.removeEventListener("appinstalled",onInstalled);};
  },[]);
  const pwaOrnatish=async()=>{
    if(!pwaPrompt) return;
    await pwaPrompt.prompt();
    setPwaPrompt(null);
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
      setSozlState(s&&typeof s==="object"?s:{valyuta:"so'm",kompaniya:"Mening Kompaniyam",soliq:15});
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
    const ranglar=["#2d5a3d","#4a7c59","#3d6b4f","#6b8f5e","#5c8a3c","#3a6045","#4d7a6a","#5a8a72"];
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
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`acculedger-${OYLAR_TO[sm]}-${sy}.csv`;a.click();
    showXabar("CSV yuklab olindi!","muvaffaq");
  };

  const pieData=invXulosa.filter(k=>k.miqdor>0);

  // ── STYLE YORDAMCHILAR ──────────────────────────────
  const Card=({children,style={}})=>(
    <div style={{background:T.card,borderRadius:T.r,border:`1px solid ${T.border}`,padding:16,boxShadow:T.shadow,...style}}>
      {children}
    </div>
  );

  const H2=({children})=>(
    <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
      {children}
    </div>
  );

  const Btn=({children,onClick,color=T.accent,small=false,ghost=false,danger=false,style={}})=>{
    const bg=danger?"#fef2f2":ghost?"transparent":color;
    const col=danger?T.danger:ghost?T.accent:"#fff";
    const border=danger?`1.5px solid #fecaca`:ghost?`1.5px solid ${T.accent}`:"none";
    return(
      <button onClick={onClick} className="alc-btn" style={{background:bg,color:col,border,borderRadius:T.rs,padding:small?"6px 12px":"10px 18px",fontSize:small?12:13,cursor:"pointer",fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,...style}}>
        {children}
      </button>
    );
  };

  const Tag=({tur})=>(
    <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:tur==="kirim"?"#dcfce7":"#fee2e2",color:tur==="kirim"?"#166534":"#991b1b",display:"inline-block"}}>
      {tur==="kirim"?"↑ Kirim":"↓ Chiqim"}
    </span>
  );

  const Badge=({oshgan,kamaygan,val})=>(
    <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,fontWeight:700,background:oshgan?"#fee2e2":kamaygan?"#fef9c3":"#dcfce7",color:oshgan?"#991b1b":kamaygan?"#713f12":"#166534"}}>
      {oshgan?"LIMIT":kamaygan?"⚠ MIN":val}
    </span>
  );

  const Prog=({pct,oshgan,kamaygan})=>(
    <div style={{background:"#e8e5de",borderRadius:8,height:7,overflow:"hidden",marginTop:5}}>
      <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:oshgan?T.danger:kamaygan?T.warn:T.accent,borderRadius:8,transition:"width 0.5s ease"}}/>
    </div>
  );

  const Met=({label,val,sub,color=T.accent,icon})=>(
    <div style={{background:T.card,borderRadius:T.r,padding:"14px 16px",border:`1px solid ${T.border}`,boxShadow:T.shadow,borderLeft:`3px solid ${color}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:10,top:8,fontSize:20,opacity:0.1}}>{icon}</div>
      <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{label}</div>
      <div style={{fontSize:20,fontWeight:900,color:T.text,lineHeight:1.2}}>{val}</div>
      {sub&&<div style={{fontSize:11,color:T.muted,marginTop:3}}>{sub}</div>}
    </div>
  );

  const TxForm=()=>(
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
        <div style={{fontSize:12,color:T.info,background:"#eff6ff",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
          💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor)*parseFloat(txF.narx)))} {sozl.valyuta}</strong>
        </div>
      )}
      <Btn onClick={txQoshish} style={{width:"100%",justifyContent:"center",marginTop:4}}>Saqlash ↵</Btn>
    </div>
  );

  // ── SIDEBAR (desktop) ───────────────────────────────
  const Sidebar=()=>(
    <div style={{position:"fixed",left:0,top:0,bottom:0,width:SIDEBAR_W,background:T.card,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",zIndex:100,boxShadow:"2px 0 12px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 18px 16px",borderBottom:`1px solid ${T.border}`}}>
        <img src="/logo.png" alt="AccuLedger" style={{width:38,height:38,objectFit:"contain",borderRadius:9,flexShrink:0}}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14,fontWeight:900,color:T.accent,lineHeight:1}}>AccuLedger</div>
          <div style={{fontSize:10,color:T.muted,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sozl.kompaniya}</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV_TABS.map((t,i)=>{
          const isOn=tab===t;
          return(
            <button key={t} onClick={()=>setTab(t)} className="alc-nav-item"
              style={{display:"flex",alignItems:"center",gap:12,border:"none",background:isOn?"#e8f0eb":"transparent",color:isOn?T.accent:T.muted,borderRadius:10,padding:"10px 12px",fontSize:13,fontWeight:isOn?700:500,cursor:"pointer",textAlign:"left",width:"100%"}}>
              {NAV_ICO[i]}
              <span style={{flex:1}}>{t}</span>
              {t==="Bosh sahifa"&&ogohlar.length>0&&(
                <span style={{background:"#fee2e2",color:T.danger,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:700}}>{ogohlar.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{padding:"10px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:4}}>
        {pwaPrompt&&(
          <button onClick={pwaOrnatish} className="alc-nav-item" style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"#e8f5e9",color:T.accent,borderRadius:10,padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left",width:"100%"}}>
            📲 <span>Ilovani o'rnatish</span>
          </button>
        )}
        <button onClick={bekorQilish} className="alc-nav-item" style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:tarix.length>0?T.warn:T.muted,borderRadius:10,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
          {Ico.undo} <span>Bekor qilish</span>
        </button>
        <button onClick={()=>{flushPendingWrites();signOut(auth);}} className="alc-nav-item" style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:T.muted,borderRadius:10,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
          {Ico.logout} <span>Chiqish</span>
        </button>
      </div>
    </div>
  );

  // ── LOADING ─────────────────────────────────────────
  if(yuklanmoqda) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:16}}>
      <img src="/logo.png" alt="AccuLedger" className="alc-pulse" style={{width:72,height:96,objectFit:"contain"}}/>
      <div style={{color:T.muted,fontSize:14,fontWeight:600}}>Ma'lumotlar yuklanmoqda…</div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:T.bg,minHeight:"100vh",paddingBottom: isMobile ? 80 : 20}}>

      {/* XABAR TOAST */}
      {xabar&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:xabar.tur==="xato"?T.danger:xabar.tur==="muvaffaq"?T.accent:xabar.tur==="ogoh"?T.warn:T.info,color:"#fff",borderRadius:T.r,padding:"11px 20px",fontSize:13,fontWeight:600,boxShadow:T.shadowMd,whiteSpace:"nowrap",maxWidth:"90vw"}}>
          {xabar.msg}
        </div>
      )}

      {/* MODAL */}
      {modal&&(
        <div className="alc-overlay" style={{position:"fixed",inset:0,background:"rgba(10,20,15,0.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setModal(null)}>
          <div className="alc-modal" style={{background:T.card,borderRadius:T.rx,padding:24,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:T.shadowMd}} onClick={e=>e.stopPropagation()}>
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
              <p style={{fontSize:13,color:T.muted,marginBottom:20}}>Yozuv o'chiriladi va balans qayta hisoblanadi.</p>
              <div style={{display:"flex",gap:8}}>
                <Btn danger onClick={()=>txOchir(modal.katId,modal.txId)}>O'chirish</Btn>
                <Btn ghost onClick={()=>setModal(null)}>Bekor</Btn>
              </div>
            </>)}
            {modal.type==="oyReset"&&(<>
              <H2>⚠️ {OYLAR_TO[sm]} {sy} ni tozalash?</H2>
              <p style={{fontSize:13,color:T.muted,marginBottom:20}}>Ushbu oy uchun barcha ma'lumotlar o'chiriladi!</p>
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

      {/* BOTTOM MODAL — Yangi yozuv */}
      {bottomModal&&(
        <div className="alc-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setBottomModal(false)}>
          <div className="alc-sheet" style={{background:T.card,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:T.border,borderRadius:100,margin:"0 auto 18px"}}/>
            <H2>{Ico.plus} Yangi yozuv qo'shish</H2>
            <TxForm/>
          </div>
        </div>
      )}

      {/* ── SIDEBAR (desktop) ──────────────────────────── */}
      {!isMobile&&<Sidebar/>}

      <div style={{marginLeft:isMobile?0:SIDEBAR_W,transition:"margin-left 0.25s ease"}}>

      {/* ── MOBILE HEADER ───────────────────────────────── */}
      {isMobile&&(
        <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src="/logo.png" alt="AccuLedger" style={{width:32,height:32,objectFit:"contain",borderRadius:9,flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:900,color:T.accent,lineHeight:1}}>AccuLedger</div>
              <div style={{fontSize:10,color:T.muted}}>{tab}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {pwaPrompt&&(
              <button onClick={pwaOrnatish} title="O'rnatish" style={{width:34,height:34,borderRadius:10,border:`1px solid ${T.border}`,background:"#e8f5e9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.accent,fontSize:15}}>
                📲
              </button>
            )}
            {ogohlar.length>0&&<div style={{background:"#fee2e2",color:T.danger,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>⚠{ogohlar.length}</div>}
            <button onClick={bekorQilish} style={{width:34,height:34,borderRadius:10,border:`1px solid ${T.border}`,background:tarix.length>0?"#fff9ef":T.cream,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:tarix.length>0?T.warn:T.muted}}>
              {Ico.undo}
            </button>
            <button onClick={()=>{flushPendingWrites();signOut(auth);}} style={{width:34,height:34,borderRadius:10,border:`1px solid ${T.border}`,background:T.cream,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}>
              {Ico.logout}
            </button>
          </div>
        </div>
      )}

      {/* DAVR TANLASH */}
      <div style={{maxWidth:1100,margin:"12px auto 0",padding:"0 12px"}}>
        <div style={{background:T.card,borderRadius:T.r,padding:"10px 14px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",boxShadow:T.shadow}}>
          <span style={{fontSize:11,fontWeight:700,color:T.muted}}>DAVR:</span>
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
          <div key={`l-${o.id}`} style={{background:"#fff9ef",border:`1px solid ${T.warn}`,borderRadius:T.rs,padding:"9px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{o.icon}</span>
            <div style={{flex:1,fontSize:12}}><strong>{o.nom}</strong> limitdan oshdi! <strong style={{color:T.danger}}>+{fmtN(o.oshgan)} {o.birlik}</strong></div>
          </div>
        ))}
        {ogohlar.filter(o=>o.tur==="minimum").map(o=>(
          <div key={`m-${o.id}`} style={{background:"#fff1f2",border:`1px solid ${T.danger}`,borderRadius:T.rs,padding:"9px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{o.icon}</span>
            <div style={{flex:1,fontSize:12}}><strong>{o.nom}</strong> — Qoldi: <strong style={{color:T.danger}}>{fmtN(o.ishlatilgan)} {o.birlik}</strong> ⚠ Buyurtma bering!</div>
          </div>
        ))}
      </div>

      {/* ══ KONTENT ══════════════════════════════════════ */}
      <div key={tab} className="alc-fade-in" style={{maxWidth:1100,margin:"12px auto",padding:"0 12px"}}>

        {/* BOSH SAHIFA */}
        {tab==="Bosh sahifa"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
              <Met label="Sof foyda" val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${faolMol.soliq}% soliqdan keyin`} color={sofFoyda>=0?T.accent:T.danger} icon="💰"/>
              <Met label="Daromad"   val={`${fmt(faolMol.daromad)} ${sozl.valyuta}`} color={T.accent2} icon="📈"/>
              <Met label="Xarajat"   val={`${fmt(faolMol.xarajat)} ${sozl.valyuta}`} sub={`${xarajatNis}% daromaddan`} color={T.danger} icon="📤"/>
              <Met label="Pul oqimi" val={`${fmt(faolMol.pul_oqimi)} ${sozl.valyuta}`} color={faolMol.pul_oqimi>=0?T.info:T.danger} icon="💵"/>
              <Met label="Kapital"   val={`${fmt(kapital)} ${sozl.valyuta}`} sub="Aktiv − Passiv" color="#5c8a3c" icon="🏦"/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
              <Card>
                <H2>🏛 Balans va P&L</H2>
                {[["Aktivlar",faolMol.aktiv,T.accent],["Passivlar",faolMol.passiv,T.danger],["Kapital",kapital,T.info],
                  ["Debitorlik",faolMol.debitor,"#5c8a3c"],["Kreditorlik",faolMol.kreditor,T.warn],
                  ["Ish haqi",faolMol.ish_haqi,T.muted],["Amortizatsiya",faolMol.amortizatsiya,"#7a5c3c"],
                  ["Boshqa daromad",faolMol.boshqa_daromad,"#3a6b8a"]].map(([l,v,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:12,color:T.muted}}>{l}</span>
                    <span style={{fontSize:13,fontWeight:700,color:col}}>{fmt(v)} {sozl.valyuta}</span>
                  </div>
                ))}
                <div style={{background:"#e8f5e9",borderRadius:T.rs,padding:"10px 12px",marginTop:10}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:14,fontWeight:900}}>Sof foyda</span>
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
                      <div key={l} style={{background:T.cream,borderRadius:T.rs,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:900,color:col,marginTop:2}}>{v}</div>
                        <div style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:`${col}18`,color:col,fontWeight:600,display:"inline-block",marginTop:2}}>{st}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <H2 style={{margin:0}}>📦 Inventar holati</H2>
                    <Btn small ghost onClick={()=>setTab("Inventar")}>Barchasi →</Btn>
                  </div>
                  {invXulosa.slice(0,6).map(kat=>(
                    <div key={kat.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:600}}>{kat.icon} {kat.nom}</span>
                        <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${fmtN(kat.miqdor)}/${fmtN(kat.limit)}`}/>
                      </div>
                      <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {/* Tez tranzaksiya — desktop */}
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
                {txF.narx>0&&txF.miqdor>0&&<div style={{fontSize:12,color:T.info,marginTop:8}}>💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor)*parseFloat(txF.narx)))} {sozl.valyuta}</strong></div>}
              </Card>
            )}

            {/* So'nggi tranzaksiyalar */}
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <H2>🕐 So'nggi tranzaksiyalar — {OYLAR_TO[sm]}</H2>
                <Btn small ghost onClick={()=>setTab("Tranzaksiyalar")}>Hammasini ko'rish →</Btn>
              </div>
              {hammaTx.length===0
                ?<div style={{textAlign:"center",padding:"30px 0",color:T.muted,fontSize:13}}>Tranzaksiyalar yo'q.</div>
                :<div>
                  {hammaTx.slice(0,isMobile?5:8).map((tx,i)=>(
                    <div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<hammaTx.slice(0,isMobile?5:8).length-1?`1px solid ${T.border}`:"none"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tx.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.katNom}</div>
                        <div style={{fontSize:11,color:T.muted}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} · <Tag tur={tx.tur}/></div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:700,color:tx.tur==="kirim"?T.green:T.red}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</div>
                        {tx.qiymat>0&&<div style={{fontSize:11,color:T.info}}>{fmt(tx.qiymat)} {sozl.valyuta}</div>}
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
                  <div key={kat.id} style={{background:T.cream,borderRadius:T.rs,padding:"12px 14px",marginBottom:8,border:`1px solid ${kat.oshgan?"#fecaca":kat.kamaygan?"#fef08a":T.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700}}>{kat.icon} {kat.nom}</span>
                      <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`}/>
                    </div>
                    <div style={{fontSize:11,color:T.muted}}>
                      Zaxira: <strong>{fmtN(kat.miqdor)}</strong> / Limit: <strong>{fmtN(kat.limit)}</strong> / Min: <strong>{fmtN(kat.min)}</strong> {kat.birlik}
                    </div>
                    <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
                    {kat.oshgan&&<div style={{fontSize:11,color:T.danger,fontWeight:600,marginTop:4}}>⚠ +{fmtN(P(kat.miqdor-kat.limit))} {kat.birlik} limitdan oshgan</div>}
                    {kat.kamaygan&&<div style={{fontSize:11,color:T.warn,fontWeight:600,marginTop:4}}>🔴 {fmtN(P(kat.min-kat.miqdor))} {kat.birlik} kerak</div>}
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
                    <TxForm/>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRANZAKSIYALAR */}
        {tab==="Tranzaksiyalar"&&(
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <H2>📋 Daftar — {OYLAR_TO[sm]} {sy} <span style={{fontSize:11,fontWeight:400,color:T.muted}}>({filtrlangan.length} yozuv)</span></H2>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.muted}}>{Ico.search}</span>
                  <input style={{border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"8px 10px 8px 32px",fontSize:13,background:T.cream,outline:"none",width:150,color:T.text}} placeholder="Qidirish…" value={qidiruv} onChange={e=>setQidiruv(e.target.value)}/>
                </div>
                <select value={txFilter} onChange={e=>setTxFilter(e.target.value)} style={{border:`1.5px solid ${T.border}`,borderRadius:T.rs,padding:"8px 10px",fontSize:13,background:T.cream,outline:"none",color:T.text}}>
                  <option value="hammasi">Barchasi</option><option value="kirim">Kiruvchi</option><option value="chiqim">Chiquvchi</option>
                </select>
                <Btn small color={T.info} onClick={csvExport}>{Ico.csv} CSV</Btn>
              </div>
            </div>
            <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>
              {[["Kirim",filtrlangan.filter(t=>t.tur==="kirim").reduce((s,t)=>s+t.miqdor,0),T.green],
                ["Chiqim",filtrlangan.filter(t=>t.tur==="chiqim").reduce((s,t)=>s+t.miqdor,0),T.red],
                ["Jami qiymat",filtrlangan.reduce((s,t)=>s+(t.qiymat||0),0),T.info]].map(([l,v,col])=>(
                <div key={l} style={{background:T.cream,borderRadius:T.rs,padding:"6px 12px",border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:11,color:T.muted}}>{l}: </span>
                  <strong style={{color:col,fontSize:13}}>{l==="Jami qiymat"?fmt(v):fmtN(v)}</strong>
                </div>
              ))}
            </div>
            {filtrlangan.length===0
              ?<div style={{textAlign:"center",padding:"40px 0",color:T.muted,fontSize:13}}>Tranzaksiyalar topilmadi.</div>
              :<div>
                {isMobile
                  ? filtrlangan.map((tx,i)=>(
                    <div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:i<filtrlangan.length-1?`1px solid ${T.border}`:"none"}}>
                      <div style={{width:38,height:38,borderRadius:10,background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tx.icon}</div>
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
                          <th key={h} style={{padding:"8px 10px",textAlign:"left",color:T.muted,fontWeight:700,borderBottom:`2px solid ${T.border}`,fontSize:11,textTransform:"uppercase",background:T.cream}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{filtrlangan.map((tx,i)=>(
                        <tr key={tx.id} style={{background:i%2?T.cream:T.card}}>
                          <td style={{padding:"7px 10px",fontSize:12,color:T.muted,borderBottom:`1px solid ${T.border}`}}>{i+1}</td>
                          <td style={{padding:"7px 10px",fontSize:12,color:T.muted,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{new Date(tx.sana).toLocaleDateString("uz-UZ")} {new Date(tx.sana).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><span style={{fontWeight:600,color:T.accent}}>{tx.icon} {tx.katNom}</span></td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><Tag tur={tx.tur}/></td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><span style={{fontWeight:700,color:tx.tur==="kirim"?T.accent:T.danger}}>{tx.tur==="kirim"?"+":"−"}{fmtN(tx.miqdor)} {tx.birlik}</span></td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{tx.narx>0?`${fmt(tx.narx)} ${sozl.valyuta}`:<span style={{color:T.muted}}>—</span>}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{tx.qiymat>0?<span style={{color:T.info,fontWeight:600}}>{fmt(tx.qiymat)} {sozl.valyuta}</span>:<span style={{color:T.muted}}>—</span>}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,fontWeight:600}}>{fmtN(tx.balans)} {tx.birlik}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted}}>{tx.yetkazuvchi||"—"}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.eslatma||"—"}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                            <button onClick={()=>setModal({type:"txOchir",katId:tx.katId,txId:tx.id})} style={{background:"#fee2e2",color:T.danger,border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11}}>
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
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:13,color:bold?T.text:T.muted,fontWeight:bold?700:400}}>{l}</span>
                    <span style={{fontWeight:bold?700:500,color:col,fontSize:13}}>{fmt(v)} {sozl.valyuta}</span>
                  </div>
                ))}
                <div style={{background:"#e8f5e9",borderRadius:T.rs,padding:"11px 14px",marginTop:12}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:14,fontWeight:900}}>Sof foyda</span>
                    <span style={{fontWeight:900,color:sofFoyda>=0?T.accent:T.danger,fontSize:15}}>{fmt(sofFoyda)} {sozl.valyuta}</span>
                  </div>
                </div>
                <Btn onClick={()=>{setMolF({...faolMol});setModal({type:"moliya"});}} style={{width:"100%",justifyContent:"center",marginTop:12}}>{Ico.edit} Moliyani tahrirlash</Btn>
              </Card>
              <Card>
                <H2>📐 Moliyaviy sog'liq</H2>
                {[["Foyda ulushi",`${foydaMarj}%`,foydaMarj>15?"Yaxshi":foydaMarj>5?"O'rtacha":"Past",foydaMarj>15?T.accent:foydaMarj>5?T.warn:T.danger],
                  ["Xarajat nisbati",`${xarajatNis}%`,xarajatNis<60?"Samarali":xarajatNis<80?"O'rtacha":"Yuqori",xarajatNis<60?T.accent:xarajatNis<80?T.warn:T.danger],
                  ["Joriy koef.",joriyKoef!==null?joriyKoef:"N/A",joriyKoef>=2?"Kuchli":joriyKoef>=1?"Yetarli":"Zaif",joriyKoef!==null&&joriyKoef>=2?T.accent:joriyKoef>=1?T.warn:T.danger],
                  ["Qarz/Kapital",qarzKap!==null?qarzKap:"N/A",qarzKap!==null&&qarzKap<0.5?"Xavfsiz":qarzKap<1?"O'rtacha":"Xavfli",qarzKap!==null&&qarzKap<0.5?T.accent:qarzKap<1?T.warn:T.danger],
                ].map(([l,v,st,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
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
                      <div key={kat.id} style={{background:T.cream,borderRadius:T.rs,padding:"12px 14px",marginBottom:8,border:`1px solid ${T.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:14,fontWeight:700}}>{kat.icon} {kat.nom}</span>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{setTahrirK({...kat});setModal({type:"katTahrirla"});}} style={{background:"#e8f0eb",color:T.accent,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.edit}</button>
                            <button onClick={()=>katOchir(kat.id)} style={{background:"#fee2e2",color:T.danger,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.del}</button>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:T.muted}}>Birlik: {kat.birlik} · Limit: {fmtN(kat.limit)} · Min: {fmtN(kat.min)}</div>
                        <div style={{fontSize:12,fontWeight:600,marginTop:4}}>{fmtN(e.miqdor)} {kat.birlik} <Badge oshgan={o} kamaygan={k} val="OK"/></div>
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
                        <tr key={kat.id} style={{background:i%2?T.cream:T.card}}>
                          <td style={{padding:"7px 10px",fontSize:18,borderBottom:`1px solid ${T.border}`,textAlign:"center"}}>{kat.icon}</td>
                          <td style={{padding:"7px 10px",fontSize:13,borderBottom:`1px solid ${T.border}`,fontWeight:700}}>{kat.nom}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{kat.birlik}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,fontWeight:700}}>{fmtN(kat.limit)}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.warn,fontWeight:600}}>{fmtN(kat.min)}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                            <div style={{marginBottom:3}}>{fmtN(e.miqdor)} {kat.birlik}</div>
                            <Prog pct={pct} oshgan={o} kamaygan={k}/>
                          </td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}><Badge oshgan={o} kamaygan={k} val="OK"/></td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:T.muted}}>{e.tranzaksiyalar.length}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>{setTahrirK({...kat});setModal({type:"katTahrirla"});}} style={{background:"#e8f0eb",color:T.accent,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11}}>{Ico.edit} Tahrirla</button>
                              <button onClick={()=>katOchir(kat.id)} style={{background:"#fee2e2",color:T.danger,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:11}}>{Ico.del} O'chir</button>
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
                        <tr key={i} style={{background:joriy?"#e8f5e9":i%2?T.cream:T.card,fontWeight:joriy?700:400}}>
                          <td style={{padding:"7px 10px",fontSize:13,borderBottom:`1px solid ${T.border}`,color:joriy?T.accent:T.textMid,fontWeight:700}}>{OYLAR_TO[i]}{joriy?" ◀":""}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{fmt(r.daromad)} {sozl.valyuta}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{fmt(r.xarajat)} {sozl.valyuta}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:r.foyda>=0?T.accent:T.danger,fontWeight:700}}>{fmt(r.foyda)} {sozl.valyuta}</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`,color:marj>10?T.accent:marj>0?T.warn:T.danger}}>{marj}%</td>
                          <td style={{padding:"7px 10px",fontSize:12,borderBottom:`1px solid ${T.border}`}}>{fmtN(r.inventar)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{background:T.cream,fontWeight:900}}>
                      <td style={{padding:"8px 10px",fontWeight:900,borderBottom:`1px solid ${T.border}`}}>JAMI</td>
                      <td style={{padding:"8px 10px",color:T.accent,fontWeight:800,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.daromad)} {sozl.valyuta}</td>
                      <td style={{padding:"8px 10px",color:T.danger,fontWeight:800,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.xarajat)} {sozl.valyuta}</td>
                      <td style={{padding:"8px 10px",color:yilJami.foyda>=0?T.accent:T.danger,fontWeight:900,borderBottom:`1px solid ${T.border}`}}>{fmt(yilJami.foyda)} {sozl.valyuta}</td>
                      <td style={{padding:"8px 10px",borderBottom:`1px solid ${T.border}`}}>{yilJami.daromad>0?P((yilJami.foyda/yilJami.daromad)*100):0}%</td>
                      <td style={{padding:"8px 10px",fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{fmtN(yilJami.inventar)}</td>
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
                <Inp key={k} label={l} type={t} value={sozl[k]||""} onChange={e=>setSozlState(prev=>({...prev,[k]:e.target.value}))}/>
              ))}
              <Btn onClick={()=>setSozl({...sozl})} style={{width:"100%",justifyContent:"center"}}>Saqlash</Btn>
              <div style={{marginTop:16,padding:14,background:"#e8f5e9",borderRadius:T.rs,border:`1px solid ${T.accent}25`}}>
                <div style={{fontSize:12,fontWeight:700,color:T.accent,marginBottom:6}}>✅ Hisob ma'lumotlari</div>
                <div style={{fontSize:12,color:T.muted,marginBottom:3}}>Email: <strong>{foydalanuvchi.email}</strong></div>
                <div style={{fontSize:11,color:T.muted}}>UID: <strong style={{fontSize:10}}>{foydalanuvchi.uid}</strong></div>
              </div>
            </Card>
            <Card>
              <H2>🗄 Ma'lumotlar boshqaruvi</H2>
              <div style={{background:T.cream,borderRadius:T.rs,padding:14,marginBottom:14,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:T.text}}>Firebase Firestore</div>
                {[["Kategoriyalar",`${katlar.length} ta`],["Ma'lumotli oylar",`${Object.keys(mData).length} ta`],
                  ["Jami tranzaksiyalar",`${Object.values(mData).reduce((s,m)=>s+Object.values(m).reduce((s2,k)=>s2+(k.tranzaksiyalar?.length||0),0),0)} ta`],
                  ["Undo tarixi",`${tarix.length} qadam`]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:12,color:T.muted}}>{l}</span>
                    <strong style={{fontSize:12}}>{v}</strong>
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

      {/* ── MOBILE BOTTOM NAV ──────────────────────────── */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 20px",zIndex:90,boxShadow:"0 -2px 16px rgba(0,0,0,0.08)"}}>
          {NAV_TABS.map((t,i)=>{
            const isOn=tab===t;
            return(
              <button key={t} onClick={()=>setTab(t)} className="alc-nav-item" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",padding:"4px 8px",borderRadius:10,color:isOn?T.accent:T.muted,minWidth:48}}>
                <div style={{width:36,height:36,borderRadius:10,background:isOn?"#e8f0eb":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}>
                  {NAV_ICO[i]}
                </div>
                <span style={{fontSize:9,fontWeight:isOn?700:400,lineHeight:1}}>{t.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── MOBILE FAB ─────────────────────────────────── */}
      {isMobile&&(
        <button onClick={()=>setBottomModal(true)}
          style={{position:"fixed",bottom:88,right:20,width:52,height:52,borderRadius:"50%",background:T.accent,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 20px rgba(30,58,43,0.4)`,zIndex:91,color:"#fff"}}>
          {Ico.plus}
        </button>
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
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5f4f0",flexDirection:"column",gap:16}}>
      <img src="/logo.png" alt="AccuLedger" className="alc-pulse" style={{width:72,height:96,objectFit:"contain"}}/>
      <div style={{color:"#8a8878",fontSize:14,fontWeight:600}}>Yuklanmoqda…</div>
    </div>
  );

  return foydalanuvchi?<MainApp foydalanuvchi={foydalanuvchi}/>:<Login/>;
}