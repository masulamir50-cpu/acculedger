import { lazy, Suspense } from 'react';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Badge, Prog, OYLAR_TO } from '../../lib/shared.jsx';
import { fmtN, P } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';

const InventarPieChart = lazy(() => import('../Charts.jsx').then(m => ({ default: m.InventarPieChart })));
const ChartFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: T.muted, gap: 8 }}>
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
    <div className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
  </div>
);

export default function Inventory() {
  const { isMobile, sm, sy, invXulosa } = useData();
  const pieData = invXulosa.filter(k => k.miqdor > 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <Card>
          <H2>📦 Tovar zaxirasi — {OYLAR_TO[sm]} {sy}</H2>
          {invXulosa.map(kat => (
            <div key={kat.id} style={{ background: T.cream, borderRadius: T.rs, padding: '14px', marginBottom: 8, border: `1px solid ${kat.oshgan ? T.dangerBdr : kat.kamaygan ? T.warnBdr : T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{kat.icon} {kat.nom}</span>
                <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`} />
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>
                Zaxira: <strong style={{ color: T.text }}>{fmtN(kat.miqdor)}</strong> / Limit: <strong style={{ color: T.text }}>{fmtN(kat.limit)}</strong> / Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)}</strong> {kat.birlik}
              </div>
              <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan} />
              {kat.oshgan && <div style={{ fontSize: 11, color: T.danger, fontWeight: 600, marginTop: 6 }}>⚠ +{fmtN(P(kat.miqdor - kat.limit))} {kat.birlik} limitdan oshgan</div>}
              {kat.kamaygan && <div style={{ fontSize: 11, color: T.warn, fontWeight: 600, marginTop: 6 }}>🔴 {fmtN(P(kat.min - kat.miqdor))} {kat.birlik} kerak</div>}
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <H2>🥧 Taqsimot</H2>
            <Suspense fallback={<ChartFallback />}>
              <InventarPieChart pieData={pieData} />
            </Suspense>
          </Card>
          {!isMobile && (
            <Card>
              <H2>⚡ Harakatni qayd etish</H2>
              <TxForm />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
