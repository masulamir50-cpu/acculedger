import { lazy, Suspense } from 'react';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Met, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN, P } from '../../utils/format.js';
import { HOZ_OY, HOZ_YIL } from '../../utils/constants.js';

const DaromadXarajatBarChart = lazy(() => import('../Charts.jsx').then(m => ({ default: m.DaromadXarajatBarChart })));
const SofFoydaAreaChart      = lazy(() => import('../Charts.jsx').then(m => ({ default: m.SofFoydaAreaChart })));
const InventarLineChart      = lazy(() => import('../Charts.jsx').then(m => ({ default: m.InventarLineChart })));

const ChartFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: T.muted, gap: 8 }}>
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
  </div>
);

export default function Analytics() {
  const { isMobile, sm, sy, sozl, yillikData, yilJami } = useData();

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
        <Met label="Yillik daromad" val={`${fmt(yilJami.daromad)} ${sozl.valyuta}`}  color={T.accent}  icon="📈" />
        <Met label="Yillik xarajat" val={`${fmt(yilJami.xarajat)} ${sozl.valyuta}`} color={T.danger}  icon="📤" />
        <Met label="Yillik foyda"   val={`${fmt(yilJami.foyda)} ${sozl.valyuta}`}   color={yilJami.foyda >= 0 ? T.accent : T.danger} icon="💰" />
        <Met label="Jami inventar"  val={`${fmtN(yilJami.inventar)} dona`}          color="#5c8a3c"   icon="📦" />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <H2>📊 Daromad va xarajat — {sy}</H2>
        <Suspense fallback={<ChartFallback />}>
          <DaromadXarajatBarChart yillikData={yillikData} valyuta={sozl.valyuta} />
        </Suspense>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <H2>📉 Sof foyda dinamikasi</H2>
          <Suspense fallback={<ChartFallback />}>
            <SofFoydaAreaChart yillikData={yillikData} valyuta={sozl.valyuta} />
          </Suspense>
        </Card>
        <Card>
          <H2>📦 Inventar harakati</H2>
          <Suspense fallback={<ChartFallback />}>
            <InventarLineChart yillikData={yillikData} />
          </Suspense>
        </Card>
      </div>

      <Card>
        <H2>📋 Yillik jadval — {sy}</H2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead><tr>
              {['Oy', 'Daromad', 'Xarajat', 'Sof foyda', 'Marja %', 'Inventar'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: T.muted, fontWeight: 700, borderBottom: `2px solid ${T.border}`, fontSize: 11, textTransform: 'uppercase', background: T.cream }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {yillikData.map((r, i) => {
                const marj = r.daromad > 0 ? P((r.foyda / r.daromad) * 100) : 0;
                const joriy = i === sm && sy === HOZ_YIL;
                return (
                  <tr key={i} style={{ background: joriy ? T.joriyBg : i % 2 ? T.cream : 'transparent', fontWeight: joriy ? 700 : 400 }}>
                    <td style={{ padding: '8px 10px', fontSize: 13, borderBottom: `1px solid ${T.border}`, color: joriy ? T.accent : T.textMid, fontWeight: 700 }}>{OYLAR_TO[i]}{joriy ? ' ◀' : ''}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.text }}>{fmt(r.daromad)} {sozl.valyuta}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.text }}>{fmt(r.xarajat)} {sozl.valyuta}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: r.foyda >= 0 ? T.accent : T.danger, fontWeight: 700 }}>{fmt(r.foyda)} {sozl.valyuta}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: marj > 10 ? T.accent : marj > 0 ? T.warn : T.danger }}>{marj}%</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.text }}>{fmtN(r.inventar)}</td>
                  </tr>
                );
              })}
              <tr style={{ background: T.cream, fontWeight: 900 }}>
                <td style={{ padding: '9px 10px', fontWeight: 900, borderBottom: `1px solid ${T.border}`, color: T.accent }}>JAMI</td>
                <td style={{ padding: '9px 10px', color: T.green, fontWeight: 800, borderBottom: `1px solid ${T.border}` }}>{fmt(yilJami.daromad)} {sozl.valyuta}</td>
                <td style={{ padding: '9px 10px', color: T.red, fontWeight: 800, borderBottom: `1px solid ${T.border}` }}>{fmt(yilJami.xarajat)} {sozl.valyuta}</td>
                <td style={{ padding: '9px 10px', color: yilJami.foyda >= 0 ? T.accent : T.danger, fontWeight: 900, borderBottom: `1px solid ${T.border}` }}>{fmt(yilJami.foyda)} {sozl.valyuta}</td>
                <td style={{ padding: '9px 10px', borderBottom: `1px solid ${T.border}`, color: T.textMid }}>{yilJami.daromad > 0 ? P((yilJami.foyda / yilJami.daromad) * 100) : 0}%</td>
                <td style={{ padding: '9px 10px', fontWeight: 700, borderBottom: `1px solid ${T.border}`, color: T.text }}>{fmtN(yilJami.inventar)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
