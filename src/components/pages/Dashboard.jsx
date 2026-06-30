import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { T, Badge, Prog, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';

const PERIODS = [
  { k: 'kun',   l: 'Bugun' },
  { k: 'hafta', l: 'Hafta' },
  { k: 'oy',    l: 'Oy'    },
  { k: 'yil',   l: 'Yil'   },
];

// ─── EMV Chip ───────────────────────────────────────────
function EmvChip({ size = 44 }) {
  const h = Math.round(size * 0.75);
  return (
    <svg width={size} height={h} viewBox="0 0 44 33" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="chip-g" x1="0" y1="0" x2="44" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E8C96A"/>
          <stop offset="30%"  stopColor="#C9A84C"/>
          <stop offset="60%"  stopColor="#D4B554"/>
          <stop offset="100%" stopColor="#A87830"/>
        </linearGradient>
      </defs>
      <rect width="44" height="33" rx="5" fill="url(#chip-g)"/>
      <line x1="0" y1="11" x2="44" y2="11" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <line x1="0" y1="22" x2="44" y2="22" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <line x1="15" y1="0" x2="15" y2="33" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <line x1="29" y1="0" x2="29" y2="33" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <rect x="15" y="11" width="14" height="11" rx="2" fill="rgba(0,0,0,0.12)"/>
      <rect x="17" y="13" width="10" height="7"  rx="1" fill="rgba(255,255,255,0.1)"/>
    </svg>
  );
}

// ─── Platinum chip (silver) ─────────────────────────────
function PlatChip({ size = 38 }) {
  const h = Math.round(size * 0.75);
  return (
    <svg width={size} height={h} viewBox="0 0 38 28" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="plat-chip" x1="0" y1="0" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#C8D8E8"/>
          <stop offset="40%"  stopColor="#8A9AAA"/>
          <stop offset="100%" stopColor="#B0C0D0"/>
        </linearGradient>
      </defs>
      <rect width="38" height="28" rx="4" fill="url(#plat-chip)"/>
      <line x1="0"  y1="9"  x2="38" y2="9"  stroke="rgba(0,0,0,0.15)" strokeWidth="0.7"/>
      <line x1="0"  y1="19" x2="38" y2="19" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7"/>
      <line x1="12" y1="0"  x2="12" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7"/>
      <line x1="26" y1="0"  x2="26" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7"/>
      <rect x="12" y="9"  width="14" height="10" rx="2" fill="rgba(0,0,0,0.1)"/>
      <rect x="14" y="11" width="10" height="6"  rx="1" fill="rgba(255,255,255,0.12)"/>
    </svg>
  );
}

// ─── Contactless icon ───────────────────────────────────
function NfcIcon({ color = 'rgba(255,255,255,0.45)', size = 26 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 26 30" fill="none">
      <path d="M13 28 C4 22 4 8 13 2"    stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M13 23 C7 19 7 11 13 7"   stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M13 18 C10 16 10 14 13 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="13" cy="15" r="2" fill={color}/>
    </svg>
  );
}

// ─── Hero Gold Card (Amex Gold aesthetic) ──────────────
function HeroCard({ periodData, sofFoyda, sozl, foydaMarj, period, sm, sy, isMobile }) {
  const isProfit = periodData.net >= 0;
  return (
    <div style={{
      position: 'relative',
      borderRadius: 24,
      overflow: 'hidden',
      background: `linear-gradient(135deg,
        #8B6914 0%, #C9A84C 10%, #E8CC6A 22%,
        #C9A84C 35%, #B8943C 50%,
        #D4B554 62%, #C9A84C 75%,
        #A87830 88%, #C9A84C 100%)`,
      boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 8px 32px rgba(201,168,76,0.2), inset 0 1px 0 rgba(255,255,255,0.22)',
      padding: isMobile ? '22px 22px 20px' : '28px 30px 24px',
      marginBottom: 16,
      userSelect: 'none',
      minHeight: isMobile ? 210 : 230,
    }}>
      {/* Shimmer sweep */}
      <div className="alc-card-shimmer"/>

      {/* Horizontal brushed-metal lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)',
        pointerEvents: 'none',
      }}/>

      {/* Logo watermark (centurion equivalent) */}
      <div style={{
        position: 'absolute', right: -12, top: '50%', transform: 'translateY(-52%)',
        opacity: 0.13, pointerEvents: 'none',
      }}>
        <img src="/logo.png" alt="" style={{ width: isMobile ? 120 : 150, height: isMobile ? 120 : 150, objectFit: 'contain' }}/>
      </div>

      {/* Row 1: Logo + brand + "card number" */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 14 : 18, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="AccuLedger" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}/>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(0,0,0,0.75)', letterSpacing: 2, textTransform: 'uppercase' }}>AccuLedger</div>
            <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.45)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Finance Platform</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.5)', letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
            {new Date().getFullYear()}
          </div>
          <NfcIcon color="rgba(0,0,0,0.35)" size={20}/>
        </div>
      </div>

      {/* Row 2: Period dots + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, position: 'relative', zIndex: 1 }}>
        {PERIODS.map(p => (
          <div key={p.k} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: period === p.k ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            transition: 'background .2s',
          }}/>
        ))}
        <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 4 }}>
          {periodData.label}
        </span>
      </div>

      {/* Row 3: Big balance number */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: isMobile ? 14 : 20 }}>
        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 3 }}>
          Sof foyda
        </div>
        <div style={{
          fontSize: isMobile ? 34 : 42,
          fontWeight: 900,
          color: isProfit ? 'rgba(0,0,0,0.82)' : '#7a1212',
          letterSpacing: -1.5,
          lineHeight: 1.05,
          textShadow: '0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.15)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {isProfit ? '' : '−'}{fmt(Math.abs(periodData.net))}
          <span style={{ fontSize: isMobile ? 13 : 16, fontWeight: 600, marginLeft: 6, opacity: 0.7 }}>{sozl.valyuta}</span>
        </div>
        {period === 'oy' && foydaMarj !== 0 && (
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', marginTop: 3, fontWeight: 600 }}>
            Foyda marjasi: {foydaMarj}%
          </div>
        )}
      </div>

      {/* Row 4: Chip + name + member since */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <EmvChip size={isMobile ? 36 : 44}/>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
              Kompaniya
            </div>
            <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 800, color: 'rgba(0,0,0,0.7)', letterSpacing: 1, textTransform: 'uppercase', textShadow: '0 1px 0 rgba(255,255,255,0.2)' }}>
              {sozl.kompaniya || 'Mening Kompaniyam'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 1 }}>A'zo bo'lgan</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(0,0,0,0.6)', letterSpacing: 1 }}>{OYLAR_TO[sm]} {sy}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Period selector (on card) ──────────────────────────
function PeriodSelector({ period, setPeriod }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {PERIODS.map(p => {
        const isOn = period === p.k;
        return (
          <motion.button
            key={p.k} type="button"
            onClick={() => setPeriod(p.k)}
            whileTap={{ scale: 0.92 }}
            style={{
              flex: 1,
              padding: '9px 4px',
              borderRadius: 14,
              border: isOn ? `1.5px solid rgba(201,168,76,0.6)` : `1px solid rgba(255,255,255,0.07)`,
              background: isOn
                ? 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.08))'
                : 'rgba(255,255,255,0.025)',
              color: isOn ? '#C9A84C' : 'rgba(255,255,255,0.35)',
              fontSize: 11, fontWeight: isOn ? 800 : 500,
              cursor: 'pointer', outline: 'none',
              letterSpacing: 0.3,
              transition: 'all .2s',
              backdropFilter: 'blur(4px)',
            }}
          >{p.l}</motion.button>
        );
      })}
    </div>
  );
}

// ─── Platinum stat panel ────────────────────────────────
function PlatPanel({ icon, label, value, sub, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 20px rgba(201,168,76,0.08)' }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 20,
        background: 'linear-gradient(140deg, #1e2736 0%, #141c28 40%, #1a2332 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding: '18px 20px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Brushed metal horizontal lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        pointerEvents: 'none',
      }}/>
      {/* Platinum sheen */}
      <div className="alc-card-shimmer"/>
      {/* Bottom color accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}90, transparent)`,
      }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon + small chip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: `linear-gradient(135deg, ${color}22, ${color}10)`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>{icon}</div>
          <PlatChip size={32}/>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
          {label}
        </div>
        <div style={{
          fontSize: 19, fontWeight: 900, color,
          letterSpacing: -0.5, lineHeight: 1.1,
          textShadow: `0 0 24px ${color}40`,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: `${color}90`, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Quick action card ──────────────────────────────────
function ActionCard({ icon, label, color, action }) {
  return (
    <motion.button
      type="button"
      onClick={action}
      whileHover={{ y: -3, boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 20px ${color}18` }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(145deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}35`,
        borderRadius: 18, padding: '16px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        cursor: 'pointer', outline: 'none',
        boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="alc-card-shimmer"/>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}28, ${color}15)`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, boxShadow: `0 0 16px ${color}20`,
      }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 0.3 }}>{label}</div>
    </motion.button>
  );
}

// ─── Statement row ──────────────────────────────────────
function StatementRow({ tx, sozl, isLast }) {
  const isKirim = tx.tur === 'kirim';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 15, flexShrink: 0,
        background: isKirim
          ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))',
        border: `1px solid ${isKirim ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        boxShadow: isKirim ? '0 0 16px rgba(16,185,129,0.1)' : '0 0 16px rgba(239,68,68,0.1)',
      }}>{tx.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
          {tx.katNom}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            {new Date(tx.sana).toLocaleDateString('uz-UZ')}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: isKirim ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
            color: isKirim ? '#10B981' : '#EF4444',
            border: `1px solid ${isKirim ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            {isKirim ? '↑ Kirim' : '↓ Chiqim'}
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: isKirim ? '#10B981' : '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
          {isKirim ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
        </div>
        {tx.qiymat > 0 && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(tx.qiymat)} {sozl.valyuta}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section header ─────────────────────────────────────
function SectionHeader({ label, action, actionLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 2 }}>
        {label}
      </div>
      {action && (
        <button type="button" onClick={action} style={{
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 20, padding: '4px 12px',
          color: '#C9A84C', fontSize: 10, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 0.5,
        }}>{actionLabel} →</button>
      )}
    </div>
  );
}

// ─── Platinum container panel ───────────────────────────
function PlatContainer({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #1a2236 0%, #111828 60%, #192133 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 22,
      boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
      padding: '20px 22px',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.018,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0.6) 3px)',
        pointerEvents: 'none',
      }}/>
      <div className="alc-card-shimmer"/>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────
export default function Dashboard() {
  const {
    isMobile, sm, sy, sozl, period, setPeriod,
    sofFoyda, faolMol, kapital, foydaMarj, xarajatNis,
    joriyKoef, qarzKap, invXulosa, hammaTx,
    periodData, setTab, setTxF, setBottomModal,
  } = useData();

  return (
    <div>
      {/* Period selector */}
      <PeriodSelector period={period} setPeriod={setPeriod}/>

      {/* ── AMEX GOLD HERO CARD ── */}
      <HeroCard
        periodData={periodData} sofFoyda={sofFoyda}
        sozl={sozl} foydaMarj={foydaMarj} period={period}
        sm={sm} sy={sy} isMobile={isMobile}
      />

      {/* ── INCOME / EXPENSE SUMMARY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { icon: '↑', label: 'Daromad',  value: fmt(periodData.income),  color: '#10B981' },
          { icon: '↓', label: 'Xarajat',  value: fmt(periodData.expense), color: '#EF4444' },
          { icon: '⬡', label: 'Kapital',  value: fmt(kapital),            color: '#C9A84C' },
        ].map(s => (
          <div key={s.label} style={{
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(145deg, ${s.color}14, ${s.color}06)`,
            border: `1px solid ${s.color}30`,
            borderRadius: 18, padding: '14px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div className="alc-card-shimmer"/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionHeader label="Tez amallar"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <ActionCard icon="↑" label="Kirim"    color="#10B981" action={() => { setTxF(f=>({...f,tur:'kirim'}));  setBottomModal(true); }}/>
          <ActionCard icon="↓" label="Chiqim"   color="#EF4444" action={() => { setTxF(f=>({...f,tur:'chiqim'})); setBottomModal(true); }}/>
          <ActionCard icon="💼" label="Moliya"  color="#C9A84C" action={() => setTab('Moliya')}/>
          <ActionCard icon="📊" label="Tahlil"  color="#3B82F6" action={() => setTab('Tahlil')}/>
        </div>
      </div>

      {/* ── KPI PLATINUM CARDS ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionHeader label="Ko'rsatkichlar"/>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 12 }}>
          <PlatPanel icon="💰" label="Sof foyda"  value={fmt(sofFoyda)}            sub={sozl.valyuta}                  color={sofFoyda >= 0 ? '#C9A84C' : '#EF4444'}/>
          <PlatPanel icon="💵" label="Pul oqimi"  value={fmt(faolMol.pul_oqimi)}   sub={sozl.valyuta}                  color={faolMol.pul_oqimi >= 0 ? '#3B82F6' : '#EF4444'}/>
          <PlatPanel icon="📈" label="Foyda ulushi" value={`${foydaMarj}%`}         sub={foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past'} color={foydaMarj > 15 ? '#10B981' : foydaMarj > 5 ? '#F59E0B' : '#EF4444'}/>
          <PlatPanel icon="📐" label="Xarajat nisbati" value={`${xarajatNis}%`}    sub={xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori'} color={xarajatNis < 60 ? '#10B981' : xarajatNis < 80 ? '#F59E0B' : '#EF4444'}/>
        </div>
      </div>

      {/* ── BALANS + INVENTORY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <PlatContainer>
          <SectionHeader label="Balans va P&L"/>
          {[
            ['Aktivlar',       faolMol.aktiv,          '#C9A84C'],
            ['Passivlar',      faolMol.passiv,          '#EF4444'],
            ['Kapital',        kapital,                 '#3B82F6'],
            ['Debitorlik',     faolMol.debitor,         '#10B981'],
            ['Kreditorlik',    faolMol.kreditor,        '#F59E0B'],
            ['Ish haqi',       faolMol.ish_haqi,        '#94A3B8'],
            ['Amortizatsiya',  faolMol.amortizatsiya,   '#7A5C3C'],
            ['Boshqa daromad', faolMol.boshqa_daromad,  '#3A7090'],
          ].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: col, fontVariantNumeric: 'tabular-nums' }}>{fmt(v)} {sozl.valyuta}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#E2E8F0' }}>Sof foyda</span>
            <span style={{ fontWeight: 900, color: sofFoyda >= 0 ? '#C9A84C' : '#EF4444', fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{fmt(sofFoyda)} {sozl.valyuta}</span>
          </div>
        </PlatContainer>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Financial ratios */}
          <PlatContainer>
            <SectionHeader label="Moliyaviy koeffitsientlar"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Joriy koef.',  joriyKoef ?? '—',  joriyKoef >= 2 ? '#10B981' : joriyKoef >= 1 ? '#F59E0B' : '#EF4444', joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif'],
                ['Qarz/Kapital', qarzKap ?? '—',    qarzKap < 0.5 ? '#10B981' : qarzKap < 1 ? '#F59E0B' : '#EF4444', qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli'],
              ].map(([l, v, col, st]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: col, marginBottom: 7, textShadow: `0 0 20px ${col}40`, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 20, background: `${col}18`, color: col, fontWeight: 700, border: `1px solid ${col}30` }}>{st}</span>
                </div>
              ))}
            </div>
          </PlatContainer>

          {/* Inventory */}
          <PlatContainer>
            <SectionHeader label="Inventar holati" action={() => setTab('Inventar')} actionLabel="Barchasi"/>
            {invXulosa.slice(0, 5).map(k => (
              <div key={k.id} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{k.icon} {k.nom}</span>
                  <Badge oshgan={k.oshgan} kamaygan={k.kamaygan} val={`${k.pct.toFixed(1)}%`}/>
                </div>
                <Prog pct={k.pct} oshgan={k.oshgan} kamaygan={k.kamaygan}/>
              </div>
            ))}
          </PlatContainer>
        </div>
      </div>

      {/* ── QUICK TRANSACTION (desktop) ── */}
      {!isMobile && (
        <PlatContainer style={{ marginBottom: 14 }}>
          <SectionHeader label="Tez tranzaksiya"/>
          <TxForm/>
        </PlatContainer>
      )}

      {/* ── STATEMENT ── */}
      <PlatContainer style={{ marginBottom: 4 }}>
        <SectionHeader label={`Ko'chirma — ${OYLAR_TO[sm]}`} action={() => setTab('Tranzaksiyalar')} actionLabel="Hammasi"/>
        {periodData.txList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Tranzaksiyalar yo'q</div>
          </div>
        ) : periodData.txList.slice(0, 8).map((tx, i, arr) => (
          <StatementRow key={tx.id} tx={tx} sozl={sozl} isLast={i === arr.length - 1}/>
        ))}
      </PlatContainer>
    </div>
  );
}
