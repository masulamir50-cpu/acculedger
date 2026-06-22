import { useData } from '../../contexts/DataContext';
import { OYLAR_TO, Btn, T } from '../../lib/shared.jsx';
import { fmt, P } from '../../utils/format.js';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          fontSize: 10, color: T.muted, fontWeight: 600, display: 'block',
          marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2,
        }}>{label}</label>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 13,
  background: 'rgba(255,255,255,0.03)',
  outline: 'none',
  boxSizing: 'border-box',
  color: T.text,
  backdropFilter: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
  WebkitAppearance: 'none',
};

export default function TxForm({ onDone }) {
  const { txF, setTxF, katlar, sozl, txQoshish } = useData();

  const handleSave = () => {
    txQoshish();
    if (onDone) onDone();
  };

  return (
    <div>
      {/* Category */}
      <Field label="Kategoriya">
        <select
          value={txF.katId}
          onChange={e => setTxF(f => ({ ...f, katId: e.target.value }))}
          style={{ ...inputStyle, background: 'rgba(10,16,30,0.9)' }}
        >
          <option value="">Tanlang…</option>
          {katlar.map(k => <option key={k.id} value={k.id}>{k.icon} {k.nom}</option>)}
        </select>
      </Field>

      {/* Type toggle */}
      <Field label="Operatsiya turi">
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12, padding: 4,
          border: `1px solid ${T.border}`,
        }}>
          {[
            { v: 'kirim',  l: '↑ Kirim',  col: T.green  },
            { v: 'chiqim', l: '↓ Chiqim', col: T.danger },
          ].map(({ v, l, col }) => {
            const isOn = txF.tur === v;
            return (
              <button
                key={v}
                onClick={() => setTxF(f => ({ ...f, tur: v }))}
                style={{
                  flex: 1, padding: '9px',
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: isOn ? 700 : 500,
                  background: isOn ? `${col}18` : 'transparent',
                  color: isOn ? col : T.muted,
                  boxShadow: isOn ? `inset 0 0 0 1px ${col}30` : 'none',
                  transition: 'all 0.2s',
                }}
              >{l}</button>
            );
          })}
        </div>
      </Field>

      {/* Amount + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Miqdor">
          <input
            type="number"
            value={txF.miqdor}
            onChange={e => setTxF(f => ({ ...f, miqdor: e.target.value }))}
            placeholder="0"
            style={inputStyle}
          />
        </Field>
        <Field label="Birlik narxi">
          <input
            type="number"
            value={txF.narx}
            onChange={e => setTxF(f => ({ ...f, narx: e.target.value }))}
            placeholder="0.00"
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Month + Supplier */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Oy">
          <select
            value={txF.oy}
            onChange={e => setTxF(f => ({ ...f, oy: Number(e.target.value) }))}
            style={{ ...inputStyle, background: 'rgba(10,16,30,0.9)' }}
          >
            {OYLAR_TO.map((o, i) => <option key={i} value={i}>{o}</option>)}
          </select>
        </Field>
        <Field label="Yetkazuvchi">
          <input
            type="text"
            value={txF.yetkazuvchi}
            onChange={e => setTxF(f => ({ ...f, yetkazuvchi: e.target.value }))}
            placeholder="Manba…"
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Note */}
      <Field label="Izoh">
        <input
          type="text"
          value={txF.eslatma}
          onChange={e => setTxF(f => ({ ...f, eslatma: e.target.value }))}
          placeholder="Eslatma…"
          style={inputStyle}
        />
      </Field>

      {/* Total preview */}
      {txF.narx > 0 && txF.miqdor > 0 && (
        <div style={{
          background: 'rgba(201,168,76,0.07)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: T.muted }}>💡 Jami qiymat:</span>
          <strong style={{ fontSize: 14, color: T.accent }}>
            {fmt(P(parseFloat(txF.miqdor) * parseFloat(txF.narx)))} {sozl.valyuta}
          </strong>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        className="alc-btn"
        style={{
          width: '100%',
          background: `linear-gradient(135deg, ${T.accent2} 0%, ${T.accent} 60%, ${T.accent3} 100%)`,
          color: '#0a0c18',
          border: 'none',
          borderRadius: 14,
          padding: '13px',
          fontSize: 14,
          cursor: 'pointer',
          fontWeight: 800,
          letterSpacing: 0.3,
          boxShadow: '0 6px 24px rgba(201,168,76,0.35), 0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        Saqlash ↵
      </button>
    </div>
  );
}
