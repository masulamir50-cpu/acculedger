import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Met, Ico } from '../../lib/shared.jsx';
import { fmt } from '../../utils/format.js';

export default function Finance() {
  const {
    isMobile, sozl, faolMol, sofFoyda, yalpiF, soliqM,
    kapital, foydaMarj, xarajatNis, joriyKoef, qarzKap,
    setMolF, setModal,
  } = useData();

  return (
    <div>
      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 140 : 165}px, 1fr))`,
        gap: 10, marginBottom: 14,
      }}>
        <Met label="Sof foyda"   val={`${fmt(sofFoyda)} ${sozl.valyuta}`}  sub={`${foydaMarj}% marja`} color={sofFoyda >= 0 ? T.accent : T.danger} icon="💰" />
        <Met label="Yalpi foyda" val={`${fmt(yalpiF)} ${sozl.valyuta}`}    color={T.accent2}            icon="📊" />
        <Met label="Soliq"       val={`${fmt(soliqM)} ${sozl.valyuta}`}    sub={`@${faolMol.soliq}%`}   color={T.danger}  icon="🏛" />
        <Met label="Aktivlar"    val={`${fmt(faolMol.aktiv)} ${sozl.valyuta}`}  color={T.cyan}          icon="🏦" />
        <Met label="Kapital"     val={`${fmt(kapital)} ${sozl.valyuta}`}   color={T.green}              icon="⚖️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>

        {/* P&L Statement */}
        <Card>
          <H2>📊 Foyda va zarar hisoboti</H2>

          {/* Income section */}
          <div style={{
            background: 'rgba(34,197,94,0.04)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 10,
            border: '1px solid rgba(34,197,94,0.1)',
          }}>
            <div style={{ fontSize: 9, color: T.green, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Daromadlar</div>
            {[
              ['Asosiy daromad',  faolMol.daromad,         T.accent],
              ['Boshqa daromad',  faolMol.boshqa_daromad,  T.info],
            ].map(([l, v, col]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
                <span style={{ fontWeight: 600, color: col, fontSize: 13 }}>{fmt(v)} {sozl.valyuta}</span>
              </div>
            ))}
          </div>

          {/* Expense section */}
          <div style={{
            background: 'rgba(239,68,68,0.04)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 10,
            border: '1px solid rgba(239,68,68,0.1)',
          }}>
            <div style={{ fontSize: 9, color: T.danger, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Xarajatlar</div>
            {[
              ['Asosiy xarajat',    faolMol.xarajat,         T.danger],
              ['Ish haqi',          faolMol.ish_haqi,         T.warn],
              ['Amortizatsiya',     faolMol.amortizatsiya,    T.muted],
            ].map(([l, v, col]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
                <span style={{ fontWeight: 600, color: col, fontSize: 13 }}>{fmt(v)} {sozl.valyuta}</span>
              </div>
            ))}
          </div>

          {/* Divider line */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '4px 0 14px' }}/>

          {/* Net profit */}
          <div style={{
            background: sofFoyda >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            borderRadius: 14,
            padding: '16px 18px',
            border: `1px solid ${sofFoyda >= 0 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: `radial-gradient(circle, ${sofFoyda >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Sof foyda</span>
              <span style={{
                fontWeight: 900,
                color: sofFoyda >= 0 ? T.accent : T.danger,
                fontSize: 20,
                letterSpacing: -0.5,
                textShadow: sofFoyda >= 0 ? '0 0 24px rgba(201,168,76,0.3)' : '0 0 24px rgba(239,68,68,0.3)',
              }}>
                {fmt(sofFoyda)} {sozl.valyuta}
              </span>
            </div>
          </div>

          <Btn
            onClick={() => { setMolF({ ...faolMol }); setModal({ type: 'moliya' }); }}
            ghost
            style={{ width: '100%', justifyContent: 'center', marginTop: 14, gap: 6 }}
          >
            {Ico.edit} Moliyani tahrirlash
          </Btn>
        </Card>

        {/* Health indicators */}
        <Card>
          <H2>📐 Moliyaviy sog'liq ko'rsatkichlari</H2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                label: 'Foyda ulushi (Profit Margin)',
                val: `${foydaMarj}%`,
                status: foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past',
                color: foydaMarj > 15 ? T.green : foydaMarj > 5 ? T.warn : T.danger,
                info: 'Daromaddan qolgan sof foyda ulushi',
                pct: Math.min(100, foydaMarj),
              },
              {
                label: 'Xarajat nisbati',
                val: `${xarajatNis}%`,
                status: xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori',
                color: xarajatNis < 60 ? T.green : xarajatNis < 80 ? T.warn : T.danger,
                info: 'Daromaddan ketadigan xarajat ulushi',
                pct: Math.min(100, xarajatNis),
              },
              {
                label: 'Joriy likvidlik koeffitsienti',
                val: joriyKoef !== null ? joriyKoef : 'N/A',
                status: joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif',
                color: joriyKoef >= 2 ? T.cyan : joriyKoef >= 1 ? T.warn : T.danger,
                info: 'Joriy aktiv / passiv nisbati',
                pct: joriyKoef ? Math.min(100, joriyKoef * 40) : 0,
              },
              {
                label: 'Qarz / Kapital nisbati',
                val: qarzKap !== null ? qarzKap : 'N/A',
                status: qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli',
                color: qarzKap < 0.5 ? T.green : qarzKap < 1 ? T.warn : T.danger,
                info: 'Passiv / kapital nisbati',
                pct: qarzKap ? Math.min(100, 100 - qarzKap * 50) : 50,
              },
            ].map(({ label, val, status, color, info, pct }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 14,
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Left bar */}
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 2, background: color, borderRadius: '0 2px 2px 0',
                  boxShadow: `0 0 6px ${color}60`,
                }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{info}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{
                      fontSize: 20, fontWeight: 900, color,
                      textShadow: `0 0 16px ${color}40`,
                      lineHeight: 1,
                    }}>{val}</div>
                    <span style={{
                      fontSize: 10, padding: '2px 8px',
                      borderRadius: 20,
                      background: `${color}18`,
                      color, fontWeight: 700,
                      border: `1px solid ${color}25`,
                      display: 'inline-block', marginTop: 4,
                    }}>{status}</span>
                  </div>
                </div>
                {/* Mini progress */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(0, pct)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}80)`,
                    borderRadius: 4,
                    boxShadow: `0 0 6px ${color}60`,
                    transition: 'width 0.6s cubic-bezier(.16,1,.3,1)',
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
