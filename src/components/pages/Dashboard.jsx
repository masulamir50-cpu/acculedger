import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { T, Card, H2, Btn, Badge, Prog, Met, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';

const PERIODS = [
  { k: 'kun',   l: 'Bugun',  ic: '☀️' },
  { k: 'hafta', l: 'Hafta',  ic: '📅' },
  { k: 'oy',    l: 'Oy',     ic: '📊' },
  { k: 'yil',   l: 'Yil',    ic: '📈' },
];

// ── Pill chip filter row ───────────────────────────────
function PillRow({ items, value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto',
      paddingBottom: 2,
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitScrollbar: { display: 'none' },
    }}>
      {items.map(item => {
        const isOn = value === item.k;
        return (
          <motion.button
            key={item.k}
            type="button"
            onClick={() => onChange(item.k)}
            whileTap={{ scale: 0.93 }}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px',
              borderRadius: 50,
              border: isOn
                ? `1.5px solid ${T.accent}80`
                : `1px solid ${T.border}`,
              background: isOn
                ? `rgba(201,168,76,0.14)`
                : 'rgba(255,255,255,0.04)',
              color: isOn ? T.accent : T.muted,
              fontSize: 12, fontWeight: isOn ? 700 : 500,
              cursor: 'pointer', outline: 'none',
              transition: 'all .2s',
              boxShadow: isOn ? `0 0 14px rgba(201,168,76,0.2)` : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {item.ic && <span style={{ fontSize: 14 }}>{item.ic}</span>}
            {item.l}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── KPI card (2-col grid style) ────────────────────────
function KpiCard({ icon, label, value, sub, color, accent }) {
  const accentColor = color || T.accent;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 24px ${accentColor}18` }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'linear-gradient(145deg, #141c2e, #0f1525)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 22,
        padding: '18px 20px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      {/* Bottom accent bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accentColor}80, transparent)`,
      }}/>
      {/* Icon circle */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `${accentColor}18`,
        border: `1px solid ${accentColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: -0.5, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: accentColor, marginTop: 5, fontWeight: 600 }}>{sub}</div>}
    </motion.div>
  );
}

// ── Transaction row ────────────────────────────────────
function TxRow({ tx, sozl, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 46, height: 46, borderRadius: 16, flexShrink: 0,
        background: tx.tur === 'kirim'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        boxShadow: tx.tur === 'kirim' ? '0 0 16px rgba(16,185,129,0.1)' : '0 0 16px rgba(239,68,68,0.1)',
      }}>{tx.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: T.text,
          marginBottom: 3, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{tx.katNom}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: T.muted }}>
            {new Date(tx.sana).toLocaleDateString('uz-UZ')}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20,
            background: tx.tur === 'kirim' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: tx.tur === 'kirim' ? T.green : T.danger,
            border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {tx.tur === 'kirim' ? '↑ Kirim' : '↓ Chiqim'}
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 800,
          color: tx.tur === 'kirim' ? T.green : T.danger,
        }}>
          {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
        </div>
        {tx.qiymat > 0 && (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {fmt(tx.qiymat)} {sozl.valyuta}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const {
    isMobile, sm, sy, sozl, period, setPeriod,
    sofFoyda, faolMol, kapital, foydaMarj, xarajatNis,
    joriyKoef, qarzKap, invXulosa, hammaTx,
    periodData, setTab, setTxF, setBottomModal,
  } = useData();

  return (
    <div>
      {/* ── Period pill tabs ── */}
      <div style={{ marginBottom: 20 }}>
        <PillRow
          items={PERIODS}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {/* ── HERO BALANCE CARD ── */}
      <div style={{
        borderRadius: 28,
        padding: '28px 24px 24px',
        marginBottom: 14,
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #151c2e 0%, #0d1220 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Ambient blobs */}
        <div style={{
          position: 'absolute', top: -80, left: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', bottom: -60, right: -40,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>
        {/* Top shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: `linear-gradient(90deg, transparent, ${T.accent}60, transparent)`,
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Period label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 16,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: periodData.net >= 0 ? T.green : T.danger,
              boxShadow: periodData.net >= 0 ? '0 0 8px rgba(16,185,129,0.6)' : '0 0 8px rgba(239,68,68,0.6)',
            }}/>
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {periodData.label} · Sof foyda
            </span>
          </div>

          {/* Big number */}
          <div style={{
            fontSize: isMobile ? 42 : 54,
            fontWeight: 900,
            color: periodData.net >= 0 ? T.accent : T.danger,
            lineHeight: 1, letterSpacing: -2,
            marginBottom: 6,
            textShadow: periodData.net >= 0
              ? '0 0 40px rgba(201,168,76,0.22)'
              : '0 0 40px rgba(239,68,68,0.18)',
          }}>
            {fmt(periodData.net)}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 22 }}>
            {sozl.valyuta}
            {period === 'oy' && (
              <span style={{ marginLeft: 10 }}>
                · Foyda marjasi:{' '}
                <span style={{ color: foydaMarj > 10 ? T.green : foydaMarj > 0 ? T.warn : T.danger, fontWeight: 700 }}>
                  {foydaMarj}%
                </span>
              </span>
            )}
          </div>

          {/* Three stat pills */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
          }}>
            {[
              { l: 'Daromad', v: `+${fmt(periodData.income)}`, col: T.green },
              { l: 'Xarajat', v: `−${fmt(periodData.expense)}`, col: T.danger },
              { l: 'Kapital', v: fmt(kapital), col: T.accent },
            ].map(({ l, v, col }) => (
              <div key={l} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 800, color: col }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS — pill chips ── */}
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto',
        paddingBottom: 2, marginBottom: 18,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {[
          { label: 'Kirim',   icon: '↑', color: T.green,   action: () => { setTxF(f => ({...f, tur:'kirim'}));  setBottomModal(true); } },
          { label: 'Chiqim',  icon: '↓', color: T.danger,  action: () => { setTxF(f => ({...f, tur:'chiqim'})); setBottomModal(true); } },
          { label: 'Moliya',  icon: '💼', color: T.accent,  action: () => setTab('Moliya') },
          { label: 'Tahlil',  icon: '📊', color: T.cyan,    action: () => setTab('Tahlil') },
          { label: 'Inventar',icon: '📦', color: T.violet,  action: () => setTab('Inventar') },
        ].map(({ label, icon, color, action }) => (
          <motion.button
            key={label}
            type="button"
            onClick={action}
            whileTap={{ scale: 0.9 }}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              borderRadius: 50,
              border: `1px solid ${color}40`,
              background: `${color}12`,
              color, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', outline: 'none',
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 16px ${color}12`,
              transition: 'all .2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </motion.button>
        ))}
      </div>

      {/* ── KPI GRID — 2 columns, very rounded ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12, marginBottom: 16,
      }}>
        <KpiCard icon="💰" label="Sof foyda" value={`${fmt(sofFoyda)}`} sub={`${sozl.valyuta}`} color={sofFoyda >= 0 ? T.accent : T.danger}/>
        <KpiCard icon="💵" label="Pul oqimi" value={`${fmt(faolMol.pul_oqimi)}`} sub={sozl.valyuta} color={faolMol.pul_oqimi >= 0 ? T.cyan : T.danger}/>
        <KpiCard icon="📈" label="Daromad"   value={`${fmt(faolMol.daromad)}`}    sub={sozl.valyuta} color={T.green}/>
        <KpiCard icon="📤" label="Xarajat"   value={`${fmt(faolMol.xarajat)}`}    sub={`${xarajatNis}% daromaddan`} color={T.danger}/>
        {!isMobile && <>
          <KpiCard icon="🏦" label="Kapital"  value={`${fmt(kapital)}`}            sub="Aktiv − Passiv" color={T.cyan}/>
          <KpiCard icon="📐" label="Foyda ulushi" value={`${foydaMarj}%`} sub={foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past'} color={foydaMarj > 15 ? T.accent : foydaMarj > 5 ? T.warn : T.danger}/>
        </>}
      </div>

      {/* ── FINANCIAL RATIOS + INVENTORY ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 14, marginBottom: 14,
      }}>
        {/* Balans card */}
        <div style={{
          background: 'linear-gradient(145deg, #141c2e, #0f1525)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: '20px 22px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🏛 Balans va P&L
          </div>
          {[
            ['Aktivlar',      faolMol.aktiv,        T.accent],
            ['Passivlar',     faolMol.passiv,        T.danger],
            ['Kapital',       kapital,               T.cyan],
            ['Debitorlik',    faolMol.debitor,       T.green],
            ['Kreditorlik',   faolMol.kreditor,      T.warn],
            ['Ish haqi',      faolMol.ish_haqi,      T.muted],
            ['Amortizatsiya', faolMol.amortizatsiya, '#7a5c3c'],
            ['Boshqa daromad',faolMol.boshqa_daromad,'#3a7090'],
          ].map(([l, v, col]) => (
            <div key={l} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{fmt(v)} {sozl.valyuta}</span>
            </div>
          ))}
          <div style={{
            background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 14, padding: '12px 14px', marginTop: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Sof foyda</span>
            <span style={{ fontWeight: 900, color: sofFoyda >= 0 ? T.accent : T.danger, fontSize: 16 }}>
              {fmt(sofFoyda)} {sozl.valyuta}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Koeffitsientlar — 2x2 grid */}
          <div style={{
            background: 'linear-gradient(145deg, #141c2e, #0f1525)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24, padding: '20px 22px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              📐 Moliyaviy koeffitsientlar
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Foyda ulushi',    `${foydaMarj}%`,   foydaMarj > 15 ? T.accent : foydaMarj > 5 ? T.warn : T.danger, foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past'],
                ['Xarajat nisbati', `${xarajatNis}%`,  xarajatNis < 60 ? T.green : xarajatNis < 80 ? T.warn : T.danger, xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori'],
                ['Joriy koef.',     joriyKoef ?? '—',  joriyKoef >= 2 ? T.cyan : joriyKoef >= 1 ? T.warn : T.danger, joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif'],
                ['Qarz/Kapital',    qarzKap ?? '—',    qarzKap < 0.5 ? T.green : qarzKap < 1 ? T.warn : T.danger, qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli'],
              ].map(([l, v, col, st]) => (
                <div key={l} style={{
                  background: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: '13px 14px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: col, marginBottom: 7, textShadow: `0 0 16px ${col}40` }}>{v}</div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: `${col}15`, color: col, fontWeight: 700,
                    border: `1px solid ${col}25`,
                  }}>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventar */}
          <div style={{
            background: 'linear-gradient(145deg, #141c2e, #0f1525)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24, padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1 }}>
                📦 Inventar holati
              </div>
              <button type="button" onClick={() => setTab('Inventar')}
                style={{ background: 'none', border: 'none', color: T.muted, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                Barchasi →
              </button>
            </div>
            {invXulosa.slice(0, 5).map(kat => (
              <div key={kat.id} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{kat.icon} {kat.nom}</span>
                  <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${kat.pct.toFixed(1)}%`}/>
                </div>
                <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tez tranzaksiya (desktop) */}
      {!isMobile && (
        <div style={{
          background: 'linear-gradient(145deg, #141c2e, #0f1525)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: '22px 24px',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
            ⚡ Tez tranzaksiya
          </div>
          <TxForm />
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ── */}
      <div style={{
        background: 'linear-gradient(145deg, #141c2e, #0f1525)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: '20px 22px',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>So'nggi tranzaksiyalar</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{OYLAR_TO[sm]} — {periodData.txList.length} ta</div>
          </div>
          <button type="button" onClick={() => setTab('Tranzaksiyalar')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
              borderRadius: 20, padding: '6px 14px',
              color: T.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>Hammasini →</button>
        </div>

        {periodData.txList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>📭</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Tranzaksiyalar yo'q</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Yangi tranzaksiya qo'shing</div>
          </div>
        ) : (
          periodData.txList.slice(0, 8).map((tx, i, arr) => (
            <TxRow key={tx.id} tx={tx} sozl={sozl} isLast={i === arr.length - 1}/>
          ))
        )}
      </div>
    </div>
  );
}
