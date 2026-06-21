import { lazy, Suspense } from 'react';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Badge, Prog, OYLAR_TO } from '../../lib/shared.jsx';
import { fmtN, P } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';

const InventarPieChart = lazy(() => import('../Charts.jsx').then(m => ({ default: m.InventarPieChart })));

const ChartFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: T.muted, gap: 8 }}>
    {[0,1,2].map(i => (
      <div key={i} className="alc-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: T.cyan }} />
    ))}
  </div>
);

export default function Inventory() {
  const { isMobile, sm, sy, invXulosa } = useData();
  const pieData = invXulosa.filter(k => k.miqdor > 0);

  const ogohlar = invXulosa.filter(k => k.oshgan).length;
  const kamlar  = invXulosa.filter(k => k.kamaygan).length;
  const yaxshilar = invXulosa.length - ogohlar - kamlar;

  return (
    <div>
      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10, marginBottom: 14,
      }}>
        {[
          ['Jami kategoriya', invXulosa.length, T.cyan,   '📦'],
          ['Limitdan oshgan', ogohlar,           T.danger, '⚠️'],
          ['Yaxshi holat',    yaxshilar,         T.green,  '✅'],
        ].map(([l, v, col, ic]) => (
          <div key={l} style={{
            background: T.card,
            backdropFilter: T.blur,
            borderRadius: T.rs,
            padding: '14px 16px',
            border: `1px solid rgba(255,255,255,0.06)`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -12, right: -8,
              fontSize: 40, opacity: 0.08, pointerEvents: 'none',
            }}>{ic}</div>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: col, textShadow: `0 0 16px ${col}40` }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>

        {/* Inventory list */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 12px' }}>
            <H2>📦 Tovar zaxirasi — {OYLAR_TO[sm]} {sy}</H2>
          </div>
          <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invXulosa.map(kat => {
              const statusColor = kat.oshgan ? T.danger : kat.kamaygan ? T.warn : T.cyan;
              return (
                <div
                  key={kat.id}
                  className="alc-card-hover"
                  style={{
                    background: kat.oshgan
                      ? 'rgba(239,68,68,0.05)'
                      : kat.kamaygan
                      ? 'rgba(245,158,11,0.05)'
                      : 'rgba(255,255,255,0.02)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: `1px solid ${kat.oshgan ? T.dangerBdr : kat.kamaygan ? T.warnBdr : 'rgba(255,255,255,0.06)'}`,
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 2, borderRadius: '0 2px 2px 0',
                    background: statusColor,
                    boxShadow: `0 0 6px ${statusColor}80`,
                  }}/>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{kat.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{kat.nom}</span>
                    </div>
                    <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`} />
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                    {[
                      ['Zaxira', fmtN(kat.miqdor), T.text],
                      ['Limit',  fmtN(kat.limit),  T.accent],
                      ['Min',    fmtN(kat.min),     T.warn],
                    ].map(([l, v, col]) => (
                      <div key={l} style={{ fontSize: 11 }}>
                        <span style={{ color: T.muted }}>{l}: </span>
                        <strong style={{ color: col }}>{v}</strong>
                        <span style={{ color: T.muted }}> {kat.birlik}</span>
                      </div>
                    ))}
                  </div>

                  <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan} />

                  {kat.oshgan && (
                    <div style={{ fontSize: 11, color: T.danger, fontWeight: 600, marginTop: 6 }}>
                      ⚠ +{fmtN(P(kat.miqdor - kat.limit))} {kat.birlik} limitdan oshgan
                    </div>
                  )}
                  {kat.kamaygan && (
                    <div style={{ fontSize: 11, color: T.warn, fontWeight: 600, marginTop: 6 }}>
                      🔴 {fmtN(P(kat.min - kat.miqdor))} {kat.birlik} kerak
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Pie chart */}
          <Card>
            <H2>🥧 Taqsimot diagrammasi</H2>
            <Suspense fallback={<ChartFallback />}>
              <InventarPieChart pieData={pieData} />
            </Suspense>
          </Card>

          {/* TX Form */}
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
