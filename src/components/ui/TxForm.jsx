import { useData } from '../../contexts/DataContext';
import { OYLAR_TO, Inp, Sel, Btn, T } from '../../lib/shared.jsx';
import { fmt, P } from '../../utils/format.js';

export default function TxForm() {
  const { txF, setTxF, katlar, sozl, txQoshish } = useData();

  return (
    <div>
      <Sel label="Kategoriya" value={txF.katId} onChange={e => setTxF(f => ({ ...f, katId: e.target.value }))}>
        <option value="">Tanlang…</option>
        {katlar.map(k => <option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}
      </Sel>
      <Sel label="Tur" value={txF.tur} onChange={e => setTxF(f => ({ ...f, tur: e.target.value }))}>
        <option value="kirim">➕ Kirim</option>
        <option value="chiqim">➖ Chiqim</option>
      </Sel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Inp label="Miqdor" type="number" value={txF.miqdor} onChange={e => setTxF(f => ({ ...f, miqdor: e.target.value }))} placeholder="0" />
        <Inp label="Birlik narxi" type="number" value={txF.narx} onChange={e => setTxF(f => ({ ...f, narx: e.target.value }))} placeholder="0.00" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Sel label="Oy" value={txF.oy} onChange={e => setTxF(f => ({ ...f, oy: Number(e.target.value) }))}>
          {OYLAR_TO.map((o, i) => <option key={i} value={i}>{o}</option>)}
        </Sel>
        <Inp label="Yetkazuvchi" value={txF.yetkazuvchi} onChange={e => setTxF(f => ({ ...f, yetkazuvchi: e.target.value }))} placeholder="Manba…" />
      </div>
      <Inp label="Izoh" value={txF.eslatma} onChange={e => setTxF(f => ({ ...f, eslatma: e.target.value }))} placeholder="Eslatma…" />
      {txF.narx > 0 && txF.miqdor > 0 && (
        <div style={{ fontSize: 12, color: T.accent, background: T.accentBg, borderRadius: 8, padding: '8px 12px', marginBottom: 10, border: `1px solid ${T.accentBdr}` }}>
          💡 Jami: <strong>{fmt(P(parseFloat(txF.miqdor) * parseFloat(txF.narx)))} {sozl.valyuta}</strong>
        </div>
      )}
      <Btn onClick={txQoshish} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>Saqlash ↵</Btn>
    </div>
  );
}
