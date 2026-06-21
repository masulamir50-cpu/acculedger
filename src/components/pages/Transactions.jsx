import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Tag, Ico, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';

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
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          ['Jami kirim', fmtN(jami_kirim), T.green,  '↑'],
          ['Jami chiqim', fmtN(jami_chiqim), T.danger, '↓'],
          ['Umumiy qiymat', fmt(jami_qiymat), T.cyan, '≈'],
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
              position: 'absolute', top: -10, right: -4,
              fontSize: 48, fontWeight: 900,
              color: col, opacity: 0.06,
              lineHeight: 1,
            }}>{ic}</div>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: col }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
        }}>
          <H2 style={{ marginBottom: 0 }}>
            📋 Daftar — {OYLAR_TO[sm]} {sy}
            <span style={{ fontSize: 11, fontWeight: 400, color: T.muted, marginLeft: 6 }}>
              ({filtrlangan.length} yozuv)
            </span>
          </H2>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: T.muted,
                pointerEvents: 'none',
              }}>{Ico.search}</span>
              <input
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rs,
                  padding: '8px 10px 8px 34px',
                  fontSize: 12,
                  background: 'rgba(255,255,255,0.03)',
                  outline: 'none',
                  width: 140,
                  color: T.text,
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s',
                }}
                placeholder="Qidirish…"
                value={qidiruv}
                onChange={e => setQidiruv(e.target.value)}
              />
            </div>

            {/* Filter */}
            <select
              value={txFilter}
              onChange={e => setTxFilter(e.target.value)}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: T.rs,
                padding: '8px 10px',
                fontSize: 12,
                background: 'rgba(10,16,30,0.9)',
                outline: 'none',
                color: T.text,
              }}
            >
              <option value="hammasi">Barchasi</option>
              <option value="kirim">↑ Kirim</option>
              <option value="chiqim">↓ Chiqim</option>
            </select>

            <Btn small ghost onClick={csvExport} style={{ gap: 5 }}>
              {Ico.csv} CSV
            </Btn>
          </div>
        </div>

        {/* Content */}
        {filtrlangan.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '56px 20px',
            color: T.muted,
          }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.2 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Tranzaksiyalar topilmadi</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Filtr yoki qidiruv natijasida hech narsa chiqmadi</div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: '8px 14px 16px' }}>
            {filtrlangan.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: i < filtrlangan.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: tx.tur === 'kirim' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  border: `1px solid ${tx.tur === 'kirim' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>{tx.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.katNom}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {new Date(tx.sana).toLocaleDateString('uz-UZ')}
                    <Tag tur={tx.tur} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tx.tur === 'kirim' ? T.green : T.red }}>
                    {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
                  </div>
                  <button
                    onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: T.danger,
                      padding: '2px 0', marginTop: 2,
                    }}
                  >{Ico.del}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['#', 'Sana', 'Kategoriya', 'Tur', 'Miqdor', 'Narx', 'Qiymat', 'Balans', 'Yetkazuvchi', 'Izoh', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      color: T.muted,
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
                    style={{
                      background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                  >
                    <td style={{ padding: '9px 14px', fontSize: 11, color: T.muted, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{i + 1}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: T.muted, borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.sana).toLocaleDateString('uz-UZ')}{' '}
                      <span style={{ fontSize: 10, opacity: 0.6 }}>
                        {new Date(tx.sana).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 700, color: T.accent }}>{tx.icon} {tx.katNom}</span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Tag tur={tx.tur} />
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 700, color: tx.tur === 'kirim' ? T.green : T.red }}>
                        {tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.textMid }}>
                      {tx.narx > 0 ? `${fmt(tx.narx)} ${sozl.valyuta}` : '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {tx.qiymat > 0
                        ? <span style={{ color: T.cyan, fontWeight: 600 }}>{fmt(tx.qiymat)} {sozl.valyuta}</span>
                        : '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600, color: T.text }}>
                      {fmtN(tx.balans)} {tx.birlik}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.muted }}>
                      {tx.yetkazuvchi || '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.04)', color: T.muted, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.eslatma || '—'}
                    </td>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button
                        onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          color: T.danger,
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 8,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600,
                          transition: 'all 0.15s',
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
      </Card>
    </div>
  );
}
