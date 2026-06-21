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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
        <Met label="Sof foyda"   val={`${fmt(sofFoyda)} ${sozl.valyuta}`} sub={`${foydaMarj}% marja`} color={sofFoyda >= 0 ? T.accent : T.danger} icon="💰" />
        <Met label="Yalpi foyda" val={`${fmt(yalpiF)} ${sozl.valyuta}`}   color={T.accent2} icon="📊" />
        <Met label="Soliq"       val={`${fmt(soliqM)} ${sozl.valyuta}`}   sub={`@${faolMol.soliq}%`} color={T.danger} icon="🏛" />
        <Met label="Aktivlar"    val={`${fmt(faolMol.aktiv)} ${sozl.valyuta}`} color={T.info} icon="🏦" />
        <Met label="Kapital"     val={`${fmt(kapital)} ${sozl.valyuta}`}  color="#5c8a3c" icon="⚖️" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <Card>
          <H2>📊 Foyda va zarar hisoboti</H2>
          {[['(+) Daromad', faolMol.daromad, T.accent, true], ['(+) Boshqa daromad', faolMol.boshqa_daromad, '#3a6b8a', false],
            ['(−) Xarajat', faolMol.xarajat, T.danger, false], ['(−) Ish haqi', faolMol.ish_haqi, T.warn, false], ['(−) Amortizatsiya', faolMol.amortizatsiya, T.muted, false]
          ].map(([l, v, col, bold]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: bold ? T.text : T.muted, fontWeight: bold ? 700 : 400 }}>{l}</span>
              <span style={{ fontWeight: bold ? 700 : 500, color: col, fontSize: 13 }}>{fmt(v)} {sozl.valyuta}</span>
            </div>
          ))}
          <div style={{ background: T.successBg, borderRadius: T.rs, padding: '12px 14px', marginTop: 14, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Sof foyda</span>
              <span style={{ fontWeight: 900, color: sofFoyda >= 0 ? T.accent : T.danger, fontSize: 15 }}>{fmt(sofFoyda)} {sozl.valyuta}</span>
            </div>
          </div>
          <Btn onClick={() => { setMolF({ ...faolMol }); setModal({ type: 'moliya' }); }} style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>{Ico.edit} Moliyani tahrirlash</Btn>
        </Card>
        <Card>
          <H2>📐 Moliyaviy sog'liq</H2>
          {[['Foyda ulushi', `${foydaMarj}%`, foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past', foydaMarj > 15 ? T.accent : foydaMarj > 5 ? T.warn : T.danger],
            ['Xarajat nisbati', `${xarajatNis}%`, xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori', xarajatNis < 60 ? T.accent : xarajatNis < 80 ? T.warn : T.danger],
            ['Joriy koef.', joriyKoef !== null ? joriyKoef : 'N/A', joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif', joriyKoef !== null && joriyKoef >= 2 ? T.accent : joriyKoef >= 1 ? T.warn : T.danger],
            ['Qarz/Kapital', qarzKap !== null ? qarzKap : 'N/A', qarzKap !== null && qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli', qarzKap !== null && qarzKap < 0.5 ? T.accent : qarzKap < 1 ? T.warn : T.danger],
          ].map(([l, v, st, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.textMid }}>{l}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 900, color: col, fontSize: 15 }}>{v}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: `${col}18`, color: col, fontWeight: 700 }}>{st}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
