import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { usePWA } from './hooks/usePWA.js';
import {
  OYLAR, OYLAR_TO, HOZ_YIL,
  T, SIDEBAR_W, Ico, NAV_ICO, NAV_TABS,
  H2, Inp, Btn,
  flushPendingWrites,
} from './lib/shared.jsx';
import { fmtN, mkKey } from './utils/format.js';

import LoginPage from './components/pages/Login.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import Inventory from './components/pages/Inventory.jsx';
import Transactions from './components/pages/Transactions.jsx';
import Finance from './components/pages/Finance.jsx';
import Categories from './components/pages/Categories.jsx';
import Analytics from './components/pages/Analytics.jsx';
import Settings from './components/pages/Settings.jsx';
import TxForm from './components/ui/TxForm.jsx';

// ═══════════════════════════════════════════════════════
// MAIN APP SHELL
// ═══════════════════════════════════════════════════════
function MainApp() {
  const pwa = usePWA();
  const {
    loading, isMobile, tab, setTab, sm, setSm, sy, setSy,
    xabar, ogohlar, modal, setModal, bottomModal, setBottomModal,
    tarix, bekorQilish, faolMol, setMolF, molF, sozl,
    molSaqlash, tahrirK, setTahrirK, katSaqlash, txOchir,
    csvExport, setMData, setMMol, mData, mMol, mol, showXabar,
    logout,
  } = useData();

  if (loading) return (
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

  const renderTab = () => {
    switch (tab) {
      case 'Bosh sahifa':    return <Dashboard />;
      case 'Inventar':       return <Inventory />;
      case 'Tranzaksiyalar': return <Transactions />;
      case 'Moliya':         return <Finance />;
      case 'Kategoriyalar':  return <Categories />;
      case 'Tahlil':         return <Analytics />;
      case 'Sozlamalar':     return <Settings pwa={pwa} />;
      default:               return <Dashboard />;
    }
  };

  return (
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

      {/* PWA INSTALL BANNER (mobile) */}
      {pwa.showBanner&&isMobile&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9998,background:"linear-gradient(135deg, #1a1400, #0f1929)",borderBottom:`1px solid ${T.accentBdr}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:T.shadowMd}}>
          <img src="/logo.png" alt="" style={{width:36,height:36,borderRadius:10,objectFit:"contain"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:T.accent}}>AccuLedger'ni o'rnating</div>
            <div style={{fontSize:11,color:T.muted}}>Tezroq kirish uchun uy ekraniga qo'shing</div>
          </div>
          <button onClick={pwa.install} style={{background:`linear-gradient(135deg, ${T.accent2}, ${T.accent})`,color:"#0a0e1a",border:"none",borderRadius:T.rs,padding:"8px 14px",fontSize:12,fontWeight:800,cursor:"pointer"}}>O'rnatish</button>
          <button onClick={pwa.dismissBanner} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",padding:4,fontSize:18}}>×</button>
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

      {/* BOTTOM SHEET — Yangi yozuv (mobile) */}
      {bottomModal&&(
        <div className="alc-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setBottomModal(false)}>
          <div className="alc-sheet" style={{background:T.card,borderRadius:"24px 24px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:T.border,borderRadius:100,margin:"0 auto 20px"}}/>
            <H2>{Ico.plus} Yangi yozuv qo'shish</H2>
            <TxForm />
          </div>
        </div>
      )}

      {/* SIDEBAR (desktop) */}
      {!isMobile&&(
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
            {pwa.canInstall&&(
              <button onClick={pwa.install} className="alc-nav-item"
                style={{display:"flex",alignItems:"center",gap:12,border:`1px solid ${T.accentBdr}`,background:T.accentBg,color:T.accent,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left",width:"100%"}}>
                📲 <span>Ilovani o'rnatish</span>
              </button>
            )}
            <button onClick={bekorQilish} className="alc-nav-item"
              style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:tarix.length>0?T.warn:T.muted,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
              {Ico.undo} <span>Bekor qilish</span>
            </button>
            <button onClick={logout} className="alc-nav-item"
              style={{display:"flex",alignItems:"center",gap:12,border:"none",background:"transparent",color:T.muted,borderRadius:12,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",width:"100%"}}>
              {Ico.logout} <span>Chiqish</span>
            </button>
          </div>
        </div>
      )}

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
              <button onClick={logout} style={{width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,background:T.cream,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.muted}}>
                {Ico.logout}
              </button>
            </div>
          </div>
        )}

        {/* DAVR TANLASH — Period selector */}
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

        {/* ══ TAB CONTENT ══════════════════════════════════ */}
        <div key={tab} className="alc-fade-in" style={{maxWidth:1100,margin:"12px auto",padding:"0 12px"}}>
          {renderTab()}
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
// AUTHENTICATED WRAPPER — provides DataContext
// ═══════════════════════════════════════════════════════
function AuthenticatedApp() {
  const { user } = useAuth();
  return (
    <DataProvider uid={user.uid}>
      <MainApp />
    </DataProvider>
  );
}

// ═══════════════════════════════════════════════════════
// APP CONTENT — auth routing
// ═══════════════════════════════════════════════════════
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
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

  return user ? <AuthenticatedApp /> : <LoginPage />;
}

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
