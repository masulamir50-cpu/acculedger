import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { T, Ico, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';

// ── Pill filter row ────────────────────────────────────
function FilterChip({ label, value, active, onChange }) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(value)}
      whileTap={{ scale: 0.91 }}
      style={{
        flexShrink: 0,
        padding: '8px 18px',
        borderRadius: 50,
        border: active ? `1.5px solid ${T.accent}80` : `1px solid ${T.border}`,
        background: active ? 'rgba(201,168,76,0.14)' : 'rgba(255,255,255,0.04)',
        color: active ? T.accent : T.muted,
        fontSize: 12, fontWeight: active ? 700 : 500,
        cursor: 'pointer', outline: 'none',
        transition: 'all .2s',
        boxShadow: active ? '0 0 14px rgba(201,168,76,0.18)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >{label}</motion.button>
  );
}

// ── Stat card ──────────────────────────────────────────
function StatCard({ label, value, icon, color, isMobile }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #141c2e, #0f1525)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 22, padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -12, right: -8,
        fontSize: 52, fontWeight: 900,
        color, opacity: 0.05, lineHeight: 1, pointerEvents: 'none',
        userSelect: 'none',
      }}>{icon}</div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}80, transparent)`,
      }}/>
      <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color }}>
        {value}
      </div>
    </div>
  );
}

// ── Mobile tx row ──────────────────────────────────────
function MobileTxRow({ tx, setModal, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 16, flexShrink: 0,
        background: tx.tur === 'kirim'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      }}>{tx.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tx.katNom}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: T.muted }}>
            {new Date(tx.sana).toLocaleDateString('uz-UZ')}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
            background: tx.tur === 'kirim' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: tx.tur === 'kirim' ? T.green : T.danger,
            border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {tx.tur === 'kirim' ? '↑' : '↓'} {tx.tur}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: tx.tur === 'kirim' ? T.green : T.danger }}>
          {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger, padding: '2px 0', marginTop: 2 }}
        >{Ico.del}</button>
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

  const FILTERS = [
    { label: 'Barchasi', value: 'hammasi' },
    { label: '↑ Kirim',  value: 'kirim'   },
    { label: '↓ Chiqim', value: 'chiqim'  },
  ];

  return (
    <div>
      {/* ── Summary stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        <StatCard label="Jami kirim"     value={fmtN(jami_kirim)}  icon="↑" color={T.green}  isMobile={isMobile}/>
        <StatCard label="Jami chiqim"    value={fmtN(jami_chiqim)} icon="↓" color={T.danger} isMobile={isMobile}/>
        <StatCard label="Umumiy qiymat"  value={fmt(jami_qiymat)}  icon="≈" color={T.cyan}   isMobile={isMobile}/>
      </div>

      {/* ── Main table card ── */}
      <div style={{
        background: 'linear-gradient(145deg, #141c2e, #0f1525)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                Daftar
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                {OYLAR_TO[sm]} {sy} · {filtrlangan.length} ta yozuv
              </div>
            </div>

            {/* Search + CSV */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)', color: T.muted,
                  pointerEvents: 'none', fontSize: 13,
                }}>{Ico.search}</span>
                <input
                  style={{
                    border: `1px solid ${T.border}`, borderRadius: 20,
                    padding: '8px 12px 8px 32px', fontSize: 12,
                    background: 'rgba(255,255,255,0.04)', outline: 'none',
                    width: isMobile ? 120 : 160, color: T.text,
                    transition: 'border-color .2s',
                  }}
                  placeholder="Qidirish…"
                  value={qidiruv}
                  onChange={e => setQidiruv(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={csvExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 12px', borderRadius: 20,
                  border: `1px solid ${T.border}`,
                  background: 'rgba(255,255,255,0.04)',
                  color: T.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >{Ico.csv} CSV</button>
            </div>
          </div>

          {/* Filter pill chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {FILTERS.map(f => (
              <FilterChip
                key={f.value} label={f.label} value={f.value}
                active={txFilter === f.value}
                onChange={setTxFilter}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        {filtrlangan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: T.muted }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.2 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Tranzaksiyalar topilmadi</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Filtr yoki qidiruv natijasida hech narsa chiqmadi</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: '8px 18px 16px' }}>
            <AnimatePresence>
              {filtrlangan.map((tx, i) => (
                <MobileTxRow
                  key={tx.id} tx={tx}
                  setModal={setModal}
                  isLast={i === filtrlangan.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['#', 'Sana', 'Kategoriya', 'Tur', 'Miqdor', 'Narx', 'Qiymat', 'Balans', 'Yetkazuvchi', 'Izoh', ''].map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left',
                      fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 1,
                      color: T.muted,
                      background: 'rgba(255,255,255,0.025)',
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
                    style={{ background: i % 2 ? 'rgba(255,255,255,0.012)' : 'transparent', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 ? 'rgba(255,255,255,0.012)' : 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.muted, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: T.muted, borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.sana).toLocaleDateString('uz-UZ')}{' '}
                      <span style={{ fontSize: 10, opacity: 0.6 }}>
                        {new Date(tx.sana).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 700, color: T.accent }}>{tx.icon} {tx.katNom}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: tx.tur === 'kirim' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: tx.tur === 'kirim' ? T.green : T.danger,
                        border: `1px solid ${tx.tur === 'kirim' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}>
                        {tx.tur === 'kirim' ? '↑ Kirim' : '↓ Chiqim'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 800, color: tx.tur === 'kirim' ? T.green : T.danger }}>
                        {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.textMid }}>
                      {tx.narx > 0 ? `${fmt(tx.narx)} ${sozl.valyuta}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {tx.qiymat > 0 ? <span style={{ color: T.cyan, fontWeight: 600 }}>{fmt(tx.qiymat)} {sozl.valyuta}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700, color: T.text }}>
                      {fmtN(tx.balans)} {tx.birlik}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.muted }}>
                      {tx.yetkazuvchi || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.muted, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.eslatma || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button
                        type="button"
                        onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
                        style={{
                          background: 'rgba(239,68,68,0.08)', color: T.danger,
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20,
                          padding: '4px 12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, transition: 'all .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
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
      </div>
    </div>
  );
}
