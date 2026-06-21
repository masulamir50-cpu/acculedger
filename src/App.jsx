import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { usePWA } from './hooks/usePWA.js';
import {
  OYLAR, OYLAR_TO, HOZ_YIL,
  T, Ico, NAV_ICO, NAV_TABS,
  H2, Inp, Btn, SIDEBAR_W,
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
// LOADING SCREEN
// ═══════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: T.bg,
      flexDirection: "column",
      gap: 28,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient background orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "20%",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: "20%", right: "15%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      {/* Logo ring */}
      <div style={{ position: "relative" }}>
        {/* Outer rotating ring */}
        <div className="alc-spin" style={{
          position: "absolute",
          inset: -18,
          borderRadius: "50%",
          border: "1.5px solid transparent",
          backgroundImage: `conic-gradient(${T.cyan} 0deg, transparent 120deg, ${T.accent} 240deg, transparent 360deg)`,
          backgroundOrigin: "border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          maskComposite: "exclude",
        }}/>
        {/* Glow */}
        <div className="alc-logo-glow" style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(201,168,76,0.1) 50%, transparent 70%)",
        }}/>
        <img
          src="/logo.png"
          alt="AccuLedger"
          style={{
            width: 88, height: 88,
            objectFit: "contain",
            borderRadius: 20,
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 0 16px rgba(0,212,255,0.3)) drop-shadow(0 0 32px rgba(201,168,76,0.2))",
          }}
        />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 24, fontWeight: 800,
          background: `linear-gradient(135deg, ${T.text} 30%, ${T.accent} 70%, ${T.cyan} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -0.5, marginBottom: 6,
        }}>AccuLedger</div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Yuklanmoqda…
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div
            key={i}
            className="alc-dot"
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i === 0 ? T.cyan : i === 1 ? T.accent : T.violet,
            }}
          />
        ))}
      </div>
    </div>
  );
}

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

  if (loading) return <LoadingScreen />;

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
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      background: T.bg,
      minHeight: "100vh",
      paddingBottom: isMobile ? 88 : 24,
    }}>

      {/* ── TOAST ── */}
      {xabar && (
        <div
          className="alc-toast"
          style={{
            position: "fixed", top: 20, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: xabar.tur === "xato"
              ? "rgba(30,8,8,0.95)"
              : xabar.tur === "muvaffaq"
              ? "rgba(8,22,12,0.95)"
              : xabar.tur === "ogoh"
              ? "rgba(22,14,4,0.95)"
              : "rgba(8,14,28,0.95)",
            color: xabar.tur === "xato" ? "#ff6b6b"
              : xabar.tur === "muvaffaq" ? "#22c55e"
              : xabar.tur === "ogoh" ? "#f59e0b"
              : T.cyan,
            border: `1px solid ${
              xabar.tur === "xato" ? "rgba(239,68,68,0.4)"
              : xabar.tur === "muvaffaq" ? "rgba(34,197,94,0.35)"
              : xabar.tur === "ogoh" ? "rgba(245,158,11,0.35)"
              : "rgba(0,212,255,0.35)"
            }`,
            borderRadius: 14,
            padding: "11px 22px",
            fontSize: 13, fontWeight: 700,
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            whiteSpace: "nowrap", maxWidth: "90vw",
            letterSpacing: 0.2,
          }}
        >
          {xabar.msg}
        </div>
      )}

      {/* ── PWA INSTALL BANNER ── */}
      {pwa.showBanner && isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
          background: "rgba(8,12,24,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.cyanBdr}`,
          padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 24px rgba(0,212,255,0.08)`,
        }}>
          <img src="/logo.png" alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain" }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.cyan }}>AccuLedger'ni o'rnating</div>
            <div style={{ fontSize: 11, color: T.muted }}>Tezroq kirish uchun uy ekraniga qo'shing</div>
          </div>
          <button
            onClick={pwa.install}
            style={{
              background: T.gradAccent,
              color: "#0a0c18", border: "none",
              borderRadius: 10, padding: "8px 14px",
              fontSize: 12, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(201,168,76,0.35)",
            }}
          >O'rnatish</button>
          <button
            onClick={pwa.dismissBanner}
            style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", padding: 4, fontSize: 18 }}
          >×</button>
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div
          className="alc-overlay"
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 500,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={() => setModal(null)}
        >
          <div
            className="alc-modal"
            style={{
              background: "rgba(10,16,30,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: T.rxx,
              padding: "28px 28px 24px",
              width: "100%", maxWidth: 480,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.12), 0 0 32px rgba(0,212,255,0.06)",
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
            onClick={e => e.stopPropagation()}
          >
            {modal.type === "moliya" && (<>
              <H2>💼 Moliyaviy ma'lumotlar</H2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Daromad","daromad"],["Xarajat","xarajat"],["Aktivlar","aktiv"],["Passivlar","passiv"],
                  ["Debitorlik","debitor"],["Kreditorlik","kreditor"],["Pul oqimi","pul_oqimi"],
                  ["Ish haqi","ish_haqi"],["Amortizatsiya","amortizatsiya"],["Boshqa daromad","boshqa_daromad"],
                  ["Byudjet","byudjet"],["Soliq %","soliq"]].map(([l,k]) => (
                  <Inp key={k} label={l} type="number" value={molF[k]||""} onChange={e => setMolF(f => ({...f,[k]:e.target.value}))} placeholder="0"/>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <Btn onClick={() => molSaqlash(false)}>Umumiy saqlash</Btn>
                <Btn ghost onClick={() => molSaqlash(true)}>Faqat {OYLAR_TO[sm]}</Btn>
                <Btn ghost onClick={() => setModal(null)} style={{ marginLeft: "auto" }}>Bekor</Btn>
              </div>
            </>)}

            {modal.type === "katTahrirla" && tahrirK && (<>
              <H2>✏️ Kategoriyani tahrirlash</H2>
              {[["Nomi","nom","text"],["Birlik","birlik","text"],["Limit","limit","number"],["Minimum","min","number"],["Belgi","icon","text"]].map(([l,k,t]) => (
                <Inp key={k} label={l} type={t} value={tahrirK[k]||""} onChange={e => setTahrirK(f => ({...f,[k]:e.target.value}))}/>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Btn onClick={katSaqlash}>Saqlash</Btn>
                <Btn ghost onClick={() => setModal(null)}>Bekor</Btn>
              </div>
            </>)}

            {modal.type === "txOchir" && (<>
              <H2>🗑 Tranzaksiyani o'chirish?</H2>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
                Yozuv o'chiriladi va balans qayta hisoblanadi.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn danger onClick={() => txOchir(modal.katId, modal.txId)}>O'chirish</Btn>
                <Btn ghost onClick={() => setModal(null)}>Bekor</Btn>
              </div>
            </>)}

            {modal.type === "oyReset" && (<>
              <H2>⚠️ {OYLAR_TO[sm]} {sy} ni tozalash?</H2>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
                Ushbu oy uchun barcha ma'lumotlar o'chiriladi!
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  danger
                  onClick={async () => {
                    const key = mkKey(sm, sy);
                    const emptyMol = { daromad:0,xarajat:0,aktiv:0,passiv:0,debitor:0,kreditor:0,pul_oqimi:0,soliq:15,byudjet:0,ish_haqi:0,amortizatsiya:0,boshqa_daromad:0 };
                    const newMData = { ...mData, [key]: {} };
                    const newMMol = { ...mMol, [key]: emptyMol };
                    setMData(newMData);
                    setMMol(newMMol);
                    const { fbSetDebounced } = await import('./lib/shared.jsx');
                    const { useAuth: _useAuth } = await import('./contexts/AuthContext.jsx');
                    setModal(null);
                    showXabar("Oy tozalandi", "muvaffaq");
                  }}
                >Tozalash</Btn>
                <Btn ghost onClick={() => setModal(null)}>Bekor</Btn>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* ── BOTTOM SHEET (Mobile Transaction) ── */}
      {bottomModal && isMobile && (
        <div
          className="alc-overlay"
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 400,
            display: "flex", alignItems: "flex-end",
          }}
          onClick={() => setBottomModal(false)}
        >
          <div
            className="alc-sheet"
            style={{
              width: "100%",
              background: "rgba(10,16,30,0.98)",
              backdropFilter: "blur(24px)",
              borderRadius: "24px 24px 0 0",
              padding: "0 20px 32px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.7), 0 -1px 0 rgba(0,212,255,0.15)",
              paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 40, height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
              margin: "14px auto 22px",
            }}/>
            <TxForm onDone={() => setBottomModal(false)} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════════════════ */}
      {!isMobile && (
        <div style={{
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: SIDEBAR_W,
          background: "rgba(8,12,24,0.85)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
          // Subtle inner glow on right edge
          outline: "none",
        }}>
          {/* Right edge neon line */}
          <div style={{
            position: "absolute",
            right: 0, top: "20%", bottom: "20%",
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(0,212,255,0.3) 50%, transparent)",
            pointerEvents: "none",
          }}/>

          {/* Logo area */}
          <div style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", inset: -4,
                  borderRadius: 14,
                  background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
                }}/>
                <img
                  src="/logo.png"
                  alt="AccuLedger"
                  style={{
                    width: 40, height: 40,
                    objectFit: "contain",
                    borderRadius: 12,
                    position: "relative",
                    filter: "drop-shadow(0 0 10px rgba(0,212,255,0.25))",
                  }}
                />
              </div>
              <div>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  background: `linear-gradient(135deg, ${T.text} 40%, ${T.accent})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: -0.3,
                }}>AccuLedger</div>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 500, letterSpacing: 0.8 }}>FINANCE PLATFORM</div>
              </div>
            </div>
          </div>

          {/* Period selector in sidebar */}
          <div style={{ padding: "14px 14px 8px" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" }}>Davr</div>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={sm}
                  onChange={e => setSm(Number(e.target.value))}
                  style={{
                    flex: 1, border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "6px 8px",
                    fontSize: 11, background: "rgba(255,255,255,0.04)",
                    outline: "none", color: T.text,
                  }}
                >
                  {OYLAR_TO.map((o,i) => <option key={i} value={i}>{o}</option>)}
                </select>
                <select
                  value={sy}
                  onChange={e => setSy(Number(e.target.value))}
                  style={{
                    width: 64, border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "6px 6px",
                    fontSize: 11, background: "rgba(255,255,255,0.04)",
                    outline: "none", color: T.text,
                  }}
                >
                  {[HOZ_YIL-2,HOZ_YIL-1,HOZ_YIL,HOZ_YIL+1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: "6px 10px", overflowY: "auto" }}>
            {NAV_TABS.map((t, i) => {
              const isOn = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="alc-nav-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: isOn ? "rgba(0,212,255,0.08)" : "transparent",
                    color: isOn ? T.cyan : T.muted,
                    cursor: "pointer",
                    marginBottom: 2,
                    textAlign: "left",
                    position: "relative",
                    boxShadow: isOn ? "inset 0 0 0 1px rgba(0,212,255,0.15)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Active indicator */}
                  {isOn && <div className="alc-sidebar-active-line"/>}
                  {/* Icon wrapper */}
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: 9,
                    background: isOn ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}>
                    {NAV_ICO[i]}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isOn ? 700 : 500, letterSpacing: 0.1 }}>{t}</span>
                  {/* Active dot */}
                  {isOn && (
                    <div style={{
                      marginLeft: "auto",
                      width: 6, height: 6,
                      borderRadius: "50%",
                      background: T.cyan,
                      boxShadow: `0 0 8px ${T.cyan}`,
                    }}/>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom sidebar actions */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            {/* Alerts */}
            {ogohlar.length > 0 && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "8px 12px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 11, color: T.danger, fontWeight: 600 }}>
                  {ogohlar.length} ta ogohlantirish
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={bekorQilish}
                title="Bekor qilish"
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: tarix.length > 0 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tarix.length > 0 ? T.warn : T.muted,
                  transition: "all 0.2s",
                }}
              >{Ico.undo}</button>
              <button
                onClick={() => { setMolF({...faolMol}); setModal({type:"moliya"}); }}
                title="Moliya"
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.accent, fontSize: 16,
                  transition: "all 0.2s",
                }}
              >💼</button>
              <button
                onClick={csvExport}
                title="CSV export"
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.info,
                  transition: "all 0.2s",
                }}
              >{Ico.csv}</button>
              <button
                onClick={logout}
                title="Chiqish"
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.muted,
                  transition: "all 0.2s",
                }}
              >{Ico.logout}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════ */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W }}>

        {/* MOBILE TOPBAR */}
        {isMobile && (
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 90,
            background: "rgba(5,8,16,0.92)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.png" alt="" style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 8 }}/>
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 800,
                  background: `linear-gradient(135deg, ${T.text}, ${T.accent})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: -0.2,
                }}>AccuLedger</div>
                <div style={{ fontSize: 9, color: T.muted, fontWeight: 500, letterSpacing: 0.5 }}>{tab.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {ogohlar.length > 0 && (
                <div style={{
                  background: "rgba(239,68,68,0.15)",
                  color: T.danger,
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 11, fontWeight: 700,
                  border: "1px solid rgba(239,68,68,0.3)",
                }}>⚠ {ogohlar.length}</div>
              )}
              <button
                onClick={bekorQilish}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: tarix.length > 0 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tarix.length > 0 ? T.warn : T.muted,
                }}
              >{Ico.undo}</button>
              <button
                onClick={logout}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.muted,
                }}
              >{Ico.logout}</button>
            </div>
          </div>
        )}

        {/* MOBILE PERIOD BAR */}
        {isMobile && (
          <div style={{
            padding: "10px 14px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <select
              value={sm}
              onChange={e => setSm(Number(e.target.value))}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "7px 10px",
                fontSize: 12,
                background: "rgba(255,255,255,0.04)",
                outline: "none",
                color: T.text,
                backdropFilter: "blur(8px)",
              }}
            >
              {OYLAR_TO.map((o,i) => <option key={i} value={i}>{o}</option>)}
            </select>
            <select
              value={sy}
              onChange={e => setSy(Number(e.target.value))}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "7px 10px",
                fontSize: 12,
                background: "rgba(255,255,255,0.04)",
                outline: "none",
                color: T.text,
              }}
            >
              {[HOZ_YIL-2,HOZ_YIL-1,HOZ_YIL,HOZ_YIL+1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <button
                onClick={() => { setMolF({...faolMol}); setModal({type:"moliya"}); }}
                style={{
                  height: 34, padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(201,168,76,0.25)",
                  background: "rgba(201,168,76,0.08)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  color: T.accent, fontSize: 14,
                }}
              >💼</button>
              <button
                onClick={() => setModal({type:"oyReset"})}
                style={{
                  height: 34, padding: "0 10px",
                  borderRadius: 10,
                  border: `1px solid ${T.dangerBdr}`,
                  background: T.dangerBg,
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  color: T.danger, fontSize: 11, fontWeight: 700,
                }}
              >Tozala</button>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {ogohlar.length > 0 && (
          <div style={{ maxWidth: 1100, margin: "10px auto 0", padding: "0 14px" }}>
            {ogohlar.filter(o => o.tur === "limit").map(o => (
              <div key={`l-${o.id}`} style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12,
                padding: "10px 16px",
                marginTop: 8,
                display: "flex", alignItems: "center", gap: 12,
                backdropFilter: "blur(8px)",
              }}>
                <span style={{ fontSize: 18 }}>{o.icon}</span>
                <div style={{ flex: 1, fontSize: 12, color: T.text }}>
                  <strong>{o.nom}</strong> limitdan oshdi!{" "}
                  <strong style={{ color: T.danger }}>+{fmtN(o.oshgan)} {o.birlik}</strong>
                </div>
              </div>
            ))}
            {ogohlar.filter(o => o.tur === "minimum").map(o => (
              <div key={`m-${o.id}`} style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 12,
                padding: "10px 16px",
                marginTop: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 18 }}>{o.icon}</span>
                <div style={{ flex: 1, fontSize: 12, color: T.text }}>
                  <strong>{o.nom}</strong> — Qoldi:{" "}
                  <strong style={{ color: T.warn }}>{fmtN(o.ishlatilgan)} {o.birlik}</strong> ⚠ Buyurtma bering!
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB CONTENT ── */}
        <div
          key={tab}
          className="alc-fade-in"
          style={{
            maxWidth: 1100,
            margin: "16px auto 0",
            padding: "0 14px",
          }}
        >
          {renderTab()}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          background: "rgba(5,8,16,0.94)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
          zIndex: 90,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.5), 0 -1px 0 rgba(0,212,255,0.06)",
          minHeight: 64,
        }}>
          {[
            { t: "Bosh sahifa", i: Ico.home, l: "Bosh" },
            { t: "Inventar",    i: Ico.inv,  l: "Inventar" },
            null, // FAB
            { t: "Tahlil",     i: Ico.chart, l: "Tahlil" },
            { t: "Sozlamalar", i: Ico.sett,  l: "Sozlama" },
          ].map((item, idx) => {
            if (item === null) return (
              <button
                key="fab"
                onClick={() => setBottomModal(true)}
                className="alc-btn"
                style={{
                  width: 54, height: 54,
                  borderRadius: "50%",
                  background: T.gradAccent,
                  border: "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#0a0c18",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.45), 0 0 0 1px rgba(201,168,76,0.3), 0 2px 8px rgba(0,0,0,0.6)",
                  transform: "translateY(-12px)",
                  flexShrink: 0,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >{Ico.plus}</button>
            );
            const isOn = tab === item.t;
            return (
              <button
                key={item.t}
                onClick={() => setTab(item.t)}
                className="alc-nav-item"
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                  border: "none", background: "transparent",
                  cursor: "pointer", padding: "8px 10px",
                  borderRadius: 12,
                  color: isOn ? T.cyan : T.muted,
                  minWidth: 48, flex: 1,
                  transition: "color 0.2s",
                }}
              >
                <div style={{
                  width: 38, height: 30,
                  borderRadius: 10,
                  background: isOn ? "rgba(0,212,255,0.1)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                  boxShadow: isOn ? "0 0 12px rgba(0,212,255,0.2)" : "none",
                }}>
                  {item.i}
                </div>
                <span style={{
                  fontSize: 9,
                  fontWeight: isOn ? 700 : 400,
                  lineHeight: 1,
                  letterSpacing: 0.2,
                }}>{item.l}</span>
                {isOn && (
                  <div style={{
                    position: "absolute",
                    bottom: 4,
                    width: 4, height: 4,
                    borderRadius: "50%",
                    background: T.cyan,
                    boxShadow: `0 0 6px ${T.cyan}`,
                  }}/>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AUTHENTICATED WRAPPER
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
// APP CONTENT
// ═══════════════════════════════════════════════════════
function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
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
