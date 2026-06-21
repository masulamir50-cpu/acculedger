import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Tag, Ico, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';

export default function Transactions() {
  const {
    isMobile, sm, sy, sozl,
    filtrlangan, qidiruv, setQidiruv, txFilter, setTxFilter,
    setModal, csvExport,
  } = useData();

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <H2 style={{ marginBottom: 0 }}>
          📋 Daftar — {OYLAR_TO[sm]} {sy}
          <span style={{ fontSize: 11, fontWeight: 400, color: T.muted }}> ({filtrlangan.length} yozuv)</span>
        </H2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted }}>{Ico.search}</span>
            <input style={{ border: `1.5px solid ${T.border}`, borderRadius: T.rs, padding: '8px 10px 8px 34px', fontSize: 13, background: T.cream, outline: 'none', width: 150, color: T.text }}
              placeholder="Qidirish…" value={qidiruv} onChange={e => setQidiruv(e.target.value)} />
          </div>
          <select value={txFilter} onChange={e => setTxFilter(e.target.value)}
            style={{ border: `1.5px solid ${T.border}`, borderRadius: T.rs, padding: '8px 10px', fontSize: 13, background: T.cream, outline: 'none', color: T.text }}>
            <option value="hammasi">Barchasi</option>
            <option value="kirim">Kiruvchi</option>
            <option value="chiqim">Chiquvchi</option>
          </select>
          <Btn small color={T.info} onClick={csvExport}>{Ico.csv} CSV</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['Kirim',      filtrlangan.filter(t => t.tur === 'kirim').reduce((s, t) => s + t.miqdor, 0), T.green],
          ['Chiqim',     filtrlangan.filter(t => t.tur === 'chiqim').reduce((s, t) => s + t.miqdor, 0), T.red],
          ['Jami qiymat',filtrlangan.reduce((s, t) => s + (t.qiymat || 0), 0), T.info]].map(([l, v, col]) => (
          <div key={l} style={{ background: T.cream, borderRadius: T.rs, padding: '6px 14px', border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, color: T.muted }}>{l}: </span>
            <strong style={{ color: col, fontSize: 13 }}>{l === 'Jami qiymat' ? fmt(v) : fmtN(v)}</strong>
          </div>
        ))}
      </div>

      {filtrlangan.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 0', color: T.muted, fontSize: 13 }}>
            <div style={{ fontSize: 36, opacity: 0.3, marginBottom: 10 }}>📋</div>
            Tranzaksiyalar topilmadi.
          </div>
        : isMobile
          ? filtrlangan.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < filtrlangan.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: tx.tur === 'kirim' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tx.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{tx.katNom}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{new Date(tx.sana).toLocaleDateString('uz-UZ')} {tx.eslatma ? `· ${tx.eslatma}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tx.tur === 'kirim' ? T.green : T.red }}>{tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}</div>
                  <button onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger, padding: 0, marginTop: 2 }}>
                    {Ico.del}
                  </button>
                </div>
              </div>
            ))
          : <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr>
                  {['#', 'Sana', 'Kategoriya', 'Tur', 'Miqdor', 'Narx', 'Qiymat', 'Balans', 'Yetkazuvchi', 'Izoh', ''].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: T.muted, fontWeight: 700, borderBottom: `2px solid ${T.border}`, fontSize: 11, textTransform: 'uppercase', background: T.cream, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{filtrlangan.map((tx, i) => (
                  <tr key={tx.id} style={{ background: i % 2 ? T.cream : 'transparent' }}>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
                      {new Date(tx.sana).toLocaleDateString('uz-UZ')} {new Date(tx.sana).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}><span style={{ fontWeight: 600, color: T.accent }}>{tx.icon} {tx.katNom}</span></td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}><Tag tur={tx.tur} /></td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontWeight: 700, color: tx.tur === 'kirim' ? T.green : T.red }}>{tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.textMid }}>{tx.narx > 0 ? `${fmt(tx.narx)} ${sozl.valyuta}` : '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>{tx.qiymat > 0 ? <span style={{ color: T.info, fontWeight: 600 }}>{fmt(tx.qiymat)} {sozl.valyuta}</span> : '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, fontWeight: 600, color: T.text }}>{fmtN(tx.balans)} {tx.birlik}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.muted }}>{tx.yetkazuvchi || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}`, color: T.muted, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.eslatma || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => setModal({ type: 'txOchir', katId: tx.katId, txId: tx.id })}
                        style={{ background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBdr}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
                        {Ico.del} O'chir
                      </button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
      }
    </Card>
  );
}
