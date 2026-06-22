import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Ico, Tag, Badge, Prog, Met, OYLAR_TO, OYLAR, mkKey } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { k: 'kun',   l: 'Bugun'  },
  { k: 'hafta', l: 'Hafta'  },
  { k: 'oy',    l: 'Oy'     },
  { k: 'yil',   l: 'Yil'    },
];

export default function Dashboard() {
  const {
    isMobile, sm, sy, sozl, period, setPeriod,
    sofFoyda, faolMol, kapital, foydaMarj, xarajatNis,
    joriyKoef, qarzKap, invXulosa, hammaTx,
    periodData, setTab, setTxF, setBottomModal,
    mMol, mol,
  } = useData();

  const chartData = (() => {
    const pts = [];
    for (let i = 5; i >= 0; i--) {
      let m = sm - i, y = sy;
      if (m < 0) { m += 12; y -= 1; }
      const key = mkKey(m, y);
      const d = mMol[key];
      pts.push({
        name: OYLAR[m],
        daromad: d ? Number(d.daromad || 0) : 0,
        xarajat: d ? Number(d.xarajat || 0) : 0,
      });
    }
    const hasData = pts.some(p => p.daromad > 0 || p.xarajat > 0);
    if (!hasData) {
      return [
        { name: OYLAR[(sm + 7) % 12], daromad: 4200, xarajat: 2800 },
        { name: OYLAR[(sm + 8) % 12], daromad: 5100, xarajat: 3200 },
        { name: OYLAR[(sm + 9) % 12], daromad: 4800, xarajat: 3600 },
        { name: OYLAR[(sm + 10) % 12], daromad: 6200, xarajat: 3100 },
        { name: OYLAR[(sm + 11) % 12], daromad: 5800, xarajat: 4200 },
        { name: OYLAR[sm], daromad: 7100, xarajat: 3800 },
      ];
    }
    return pts;
  })();

  return (
    <div>
      {/* ── Period Toggle ── */}
      <div style={{
        display: 'flex', gap: 4,
        marginBottom: 16,
        background: 'rgba(237,244,255,0.6)',
        borderRadius: 14,
        padding: 4,
        border: '1px solid rgba(37,99,235,0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        {PERIODS.map(p => {
          const isOn = period === p.k;
          return (
            <button
              key={p.k}
              onClick={() => setPeriod(p.k)}
              style={{
                flex: 1, padding: '8px 4px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 12,
                fontWeight: isOn ? 700 : 500,
                background: isOn ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: isOn ? T.cyan : T.muted,
                boxShadow: isOn ? 'inset 0 0 0 1px rgba(37,99,235,0.2)' : 'none',
                transition: 'all 0.2s',
                letterSpacing: 0.2,
              }}
            >{p.l}</button>
          );
        })}
      </div>

      {/* ── HERO BALANCE CARD ── */}
      <div style={{
        borderRadius: 24,
        padding: '26px 26px 22px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(37,99,235,0.1)',
        boxShadow: '0 12px 48px rgba(37,99,235,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: 10, color: T.muted, fontWeight: 600,
            marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2,
          }}>
            {periodData.label} — Daromad vs Xarajat
          </div>

          <div style={{ width: '100%', height: 140, marginBottom: 14 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="heroRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 9, fill: T.muted }} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(37,99,235,0.15)',
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: '0 8px 24px rgba(37,99,235,0.1)',
                  }}
                />
                <Area type="monotone" dataKey="daromad" stroke="#16a34a" strokeWidth={2} fill="url(#heroGreen)" name="Daromad"/>
                <Area type="monotone" dataKey="xarajat" stroke="#dc2626" strokeWidth={2} fill="url(#heroRed)" name="Xarajat"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sof foyda:</div>
            <div style={{
              fontSize: isMobile ? 24 : 28,
              fontWeight: 900,
              color: periodData.net >= 0 ? T.accent : T.danger,
              lineHeight: 1,
              letterSpacing: -1,
            }}>
              {fmt(periodData.net)} <span style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{sozl.valyuta}</span>
            </div>
          </div>

          {/* Three stats row */}
          <div style={{
            display: 'flex', gap: isMobile ? 0 : 1,
            background: 'rgba(237,244,255,0.6)',
            borderRadius: 14,
            border: '1px solid rgba(37,99,235,0.08)',
            overflow: 'hidden',
          }}>
            {[
              ['Daromad', `+${fmt(periodData.income)}`, T.green, '↑'],
              ['Xarajat',  `−${fmt(periodData.expense)}`, T.red,   '↓'],
              ['Kapital',  fmt(kapital), T.cyan, '⬡'],
            ].map(([l, v, col, ic], i) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderLeft: i > 0 ? '1px solid rgba(37,99,235,0.08)' : 'none',
                }}
              >
                <div style={{
                  fontSize: 9, color: T.muted, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5,
                }}>{l}</div>
                <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: col }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 10,
        marginBottom: 16,
      }}>
        {[
          { label: 'Kirim',   icon: '↑', bg: T.green,   col: '#0a1a0e', action: () => { setTxF(f => ({...f, tur:'kirim'}));  setBottomModal(true); } },
          { label: 'Chiqim',  icon: '↓', bg: T.danger,  col: '#1a0808', action: () => { setTxF(f => ({...f, tur:'chiqim'})); setBottomModal(true); } },
          { label: 'Moliya',  icon: '💼', bg: null,       col: null,      action: () => setTab('Moliya') },
          { label: 'Tahlil',  icon: '📊', bg: null,       col: null,      action: () => setTab('Tahlil') },
        ].map(({ label, icon, bg, col, action }, i) => {
          const isCTA = bg !== null;
          return (
            <button
              key={label}
              onClick={action}
              className="alc-btn alc-card-hover"
              style={{
                background: isCTA
                  ? `radial-gradient(ellipse at top, ${bg}25, ${bg}10)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCTA ? `${bg}35` : T.border}`,
                borderRadius: 16,
                padding: '16px 8px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: isCTA ? `0 4px 20px ${bg}15` : T.shadow,
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: isCTA ? `${bg}20` : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isCTA ? 18 : 20,
                color: isCTA ? bg : T.textMid,
                fontWeight: isCTA ? 900 : 'inherit',
                boxShadow: isCTA ? `0 0 12px ${bg}25` : 'none',
              }}>{icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: isCTA ? bg : T.textMid,
                letterSpacing: 0.2,
              }}>{label}</div>
            </button>
          );
        })}
      </div>

      {/* ── METRICS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 140 : 160}px, 1fr))`,
        gap: 10,
        marginBottom: 16,
      }}>
        <Met label="Sof foyda"  val={`${fmt(sofFoyda)} ${sozl.valyuta}`}     sub={`${faolMol.soliq}% soliqdan keyin`} color={sofFoyda >= 0 ? T.accent : T.danger} icon="💰"/>
        <Met label="Pul oqimi" val={`${fmt(faolMol.pul_oqimi)} ${sozl.valyuta}`}  color={faolMol.pul_oqimi >= 0 ? T.cyan : T.danger} icon="💵"/>
        {!isMobile && <>
          <Met label="Daromad" val={`${fmt(faolMol.daromad)} ${sozl.valyuta}`} color={T.green}   icon="📈"/>
          <Met label="Xarajat" val={`${fmt(faolMol.xarajat)} ${sozl.valyuta}`} sub={`${xarajatNis}% daromaddan`} color={T.red} icon="📤"/>
          <Met label="Kapital" val={`${fmt(kapital)} ${sozl.valyuta}`}          sub="Aktiv − Passiv" color={T.cyan} icon="🏦"/>
        </>}
      </div>

      {/* ── BALANS + KOEFFITSIENTLAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12, marginBottom: 12,
      }}>

        {/* Balans */}
        <Card>
          <H2>🏛 Balans va P&L</H2>
          {[
            ['Aktivlar',       faolMol.aktiv,           T.accent],
            ['Passivlar',      faolMol.passiv,           T.danger],
            ['Kapital',        kapital,                  T.cyan  ],
            ['Debitorlik',     faolMol.debitor,          T.green ],
            ['Kreditorlik',    faolMol.kreditor,         T.warn  ],
            ['Ish haqi',       faolMol.ish_haqi,         T.muted ],
            ['Amortizatsiya',  faolMol.amortizatsiya,    '#7a5c3c'],
            ['Boshqa daromad', faolMol.boshqa_daromad,   '#3a7090'],
          ].map(([l, v, col]) => (
            <div key={l} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: col }}>
                {fmt(v)} {sozl.valyuta}
              </span>
            </div>
          ))}
          <div style={{
            background: 'rgba(34,197,94,0.07)',
            borderRadius: 12,
            padding: '12px 14px',
            marginTop: 14,
            border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Sof foyda</span>
            <span style={{
              fontWeight: 900,
              color: sofFoyda >= 0 ? T.accent : T.danger,
              fontSize: 16,
              textShadow: sofFoyda >= 0 ? '0 0 20px rgba(201,168,76,0.3)' : 'none',
            }}>{fmt(sofFoyda)} {sozl.valyuta}</span>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Koeffitsientlar */}
          <Card>
            <H2>📐 Moliyaviy koeffitsientlar</H2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Foyda ulushi',   `${foydaMarj}%`,              foydaMarj > 15 ? T.accent : foydaMarj > 5 ? T.warn : T.danger, foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past'],
                ['Xarajat nisbati',`${xarajatNis}%`,             xarajatNis < 60 ? T.green : xarajatNis < 80 ? T.warn : T.danger, xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori'],
                ['Joriy koef.',    joriyKoef ?? '—',              joriyKoef >= 2 ? T.cyan : joriyKoef >= 1 ? T.warn : T.danger, joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif'],
                ['Qarz/Kapital',   qarzKap ?? '—',                qarzKap < 0.5 ? T.green : qarzKap < 1 ? T.warn : T.danger, qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli'],
              ].map(([l, v, col, st]) => (
                <div key={l} style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{l}</div>
                  <div style={{
                    fontSize: 20, fontWeight: 900, color: col, marginBottom: 6,
                    textShadow: `0 0 16px ${col}40`,
                  }}>{v}</div>
                  <div style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: `${col}15`,
                    color: col, fontWeight: 700,
                    display: 'inline-block',
                    border: `1px solid ${col}25`,
                  }}>{st}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Inventar */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <H2 style={{ marginBottom: 0 }}>📦 Inventar holati</H2>
              <Btn small ghost onClick={() => setTab('Inventar')}>Barchasi →</Btn>
            </div>
            {invXulosa.slice(0, 6).map(kat => (
              <div key={kat.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{kat.icon} {kat.nom}</span>
                  <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`}/>
                </div>
                <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Tez tranzaksiya (desktop) */}
      {!isMobile && (
        <Card style={{ marginBottom: 12 }}>
          <H2>⚡ Tez tranzaksiya</H2>
          <TxForm />
        </Card>
      )}

      {/* So'nggi tranzaksiyalar */}
      <Card style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <H2 style={{ marginBottom: 0 }}>🕐 So'nggi tranzaksiyalar — {OYLAR_TO[sm]}</H2>
          <Btn small ghost onClick={() => setTab('Tranzaksiyalar')}>Hammasini →</Btn>
        </div>
        {hammaTx.length === 0
          ? (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              color: T.muted, fontSize: 13,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📭</div>
              <div style={{ fontWeight: 500 }}>Tranzaksiyalar yo'q</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Yangi tranzaksiya qo'shing</div>
            </div>
          )
          : periodData.txList.map((tx, i) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 0',
              borderBottom: i < periodData.txList.length - 1
                ? '1px solid rgba(255,255,255,0.04)'
                : 'none',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: tx.tur === 'kirim'
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                border: `1px solid ${tx.tur === 'kirim' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>{tx.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: T.text,
                  marginBottom: 3, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{tx.katNom}</div>
                <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {new Date(tx.sana).toLocaleDateString('uz-UZ')}
                  <Tag tur={tx.tur}/>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: tx.tur === 'kirim' ? T.green : T.red,
                }}>
                  {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
                </div>
                {tx.qiymat > 0 && (
                  <div style={{ fontSize: 11, color: T.muted }}>{fmt(tx.qiymat)} {sozl.valyuta}</div>
                )}
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}
