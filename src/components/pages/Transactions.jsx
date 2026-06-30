import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { T, Ico, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';

// ─── Reusable Platinum Container ────────────────────────
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

// ─── Stat card (Amex-mini style) ────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: `linear-gradient(145deg, ${color}16, ${color}06)`,
      border: `1px solid ${color}30`,
      borderRadius: 20, padding: '18px 18px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
    }}>
      <div className="alc-card-shimmer"/>
      {/* Watermark icon */}
      <div style={{ position: 'absolute', top: -8, right: -4, fontSize: 52, color, opacity: 0.05, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{icon}</div>
      {/* Bottom accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}80, transparent)` }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Filter chip ─────────────────────────────────────────
function FilterChip({ label, value, active, onChange, color }) {
  const activeColor = color || '#C9A84C';
  return (
    <motion.button
      type="button"
      onClick={() => onChange(value)}
      whileTap={{ scale: 0.9 }}
      style={{
        flexShrink: 0, padding: '8px 20px', borderRadius: 50,
        border: active ? `1.5px solid ${activeColor}70` : '1px solid rgba(255,255,255,0.07)',
        background: active
          ? `linear-gradient(135deg, ${activeColor}22, ${activeColor}0e)`
          : 'rgba(255,255,255,0.025)',
        color: active ? activeColor : 'rgba(255,255,255,0.35)',
        fontSize: 12, fontWeight: active ? 800 : 500,
        cursor: 'pointer', outline: 'none',
        letterSpacing: 0.3, whiteSpace: 'nowrap',
        boxShadow: active ? `0 0 16px ${activeColor}18` : 'none',
        transition: 'all .2s',
        backdropFilter: 'blur(4px)',
      }}
    >{label}</motion.button>
  );
}

// ─── Mobile transaction row ──────────────────────────────
function MobileTxRow({ tx, setModal, isLast }) {
  const isKirim = tx.tur === 'kirim';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 15, flexShrink: 0,
        background: isKirim
          ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))',
        border: `1px solid ${isKirim ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>{tx.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.katNom}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            {new Date(tx.sana).toLocaleDateString('uz-UZ')}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: isKirim ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
            color: isKirim ? '#10B981' : '#EF4444',
            border: `1px solid ${isKirim ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>{isKirim ? '↑ Kirim' : '↓ Chiqim'}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: isKirim ? '#10B981' : '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
          {isKirim ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
        </div>
        <button type="button"
          onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: '2px 0', marginTop: 2 }}>
          {Ico.del}
        </button>
      </div>
    </motion.div>
  );
}

export default function Transactions() {
  const {
    isMobile, sm, sy, sozl,
    filtrlangan, qidiruv, setQidiruv, txFilter, setTxFilter,
    setModal, csvExport,
  } = useData();

  const jami_kirim  = filtrlangan.filter(t => t.tur === 'kirim').reduce((s, t) => s + t.miqdor, 0);
  const jami_chiqim = filtrlangan.filter(t => t.tur === 'chiqim').reduce((s, t) => s + t.miqdor, 0);
  const jami_qiymat = filtrlangan.reduce((s, t) => s + (t.qiymat || 0), 0);

  return (
    <div>
      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard label="Jami kirim"    value={fmtN(jami_kirim)}  icon="↑" color="#10B981"/>
        <StatCard label="Jami chiqim"   value={fmtN(jami_chiqim)} icon="↓" color="#EF4444"/>
        <StatCard label="Umumiy qiymat" value={fmt(jami_qiymat)}  icon="≈" color="#3B82F6"/>
      </div>

      {/* ── Main daftar card ── */}
      <PlatContainer style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.3 }}>Ko'chirma</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {OYLAR_TO[sm]} {sy} · {filtrlangan.length} ta yozuv
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
                  {Ico.search}
                </span>
                <input
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                    padding: '8px 12px 8px 32px', fontSize: 12,
                    background: 'rgba(255,255,255,0.04)', outline: 'none',
                    width: isMobile ? 110 : 150, color: '#E2E8F0',
                  }}
                  placeholder="Qidirish…"
                  value={qidiruv}
                  onChange={e => setQidiruv(e.target.value)}
                />
              </div>
              <button type="button" onClick={csvExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px',
                  borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                {Ico.csv} CSV
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              { label: 'Barchasi', value: 'hammasi', color: '#C9A84C' },
              { label: '↑ Kirim',  value: 'kirim',   color: '#10B981' },
              { label: '↓ Chiqim', value: 'chiqim',  color: '#EF4444' },
            ].map(f => (
              <FilterChip key={f.value} label={f.label} value={f.value} active={txFilter === f.value} onChange={setTxFilter} color={f.color}/>
            ))}
          </div>
        </div>

        {/* Content */}
        {filtrlangan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.3 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Tranzaksiyalar topilmadi</div>
            <div style={{ fontSize: 12 }}>Filtr yoki qidiruv natijasida hech narsa chiqmadi</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: '8px 20px 16px' }}>
            <AnimatePresence>
              {filtrlangan.map((tx, i) => (
                <MobileTxRow key={tx.id} tx={tx} setModal={setModal} isLast={i === filtrlangan.length - 1}/>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['#','Sana','Kategoriya','Tur','Miqdor','Narx','Qiymat','Balans','Yetkazuvchi','Izoh',''].map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left', fontSize: 9,
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5,
                      color: 'rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrlangan.map((tx, i) => (
                  <tr
                    key={tx.id}
                    style={{ background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.sana).toLocaleDateString('uz-UZ')}
                      <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 4 }}>{new Date(tx.sana).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 700, color: '#C9A84C' }}>{tx.icon} {tx.katNom}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: tx.tur === 'kirim' ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
                        color: tx.tur === 'kirim' ? '#10B981' : '#EF4444',
                        border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        textTransform: 'uppercase', letterSpacing: 0.8,
                      }}>
                        {tx.tur === 'kirim' ? '↑ Kirim' : '↓ Chiqim'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 800, color: tx.tur === 'kirim' ? '#10B981' : '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
                        {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>
                      {tx.narx > 0 ? `${fmt(tx.narx)} ${sozl.valyuta}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', fontVariantNumeric: 'tabular-nums' }}>
                      {tx.qiymat > 0 ? <span style={{ color: '#3B82F6', fontWeight: 700 }}>{fmt(tx.qiymat)} {sozl.valyuta}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700, color: '#E2E8F0', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtN(tx.balans)} {tx.birlik}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>
                      {tx.yetkazuvchi || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.eslatma || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button type="button"
                        onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
                        style={{
                          background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20,
                          padding: '4px 12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, transition: 'all .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      >
                        {Ico.del} O'chir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PlatContainer>
    </div>
  );
}
