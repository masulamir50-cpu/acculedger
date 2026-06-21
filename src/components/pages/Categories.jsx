import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Inp, Badge, Prog, Ico } from '../../lib/shared.jsx';
import { fmtN, P, PCT, cl } from '../../utils/format.js';

export default function Categories() {
  const {
    isMobile, sm, sy, katlar, yangiK, setYangiK, tahrirK, setTahrirK,
    getCEntry, katQoshish, katOchir, setModal,
  } = useData();

  return (
    <div>
      {/* Add form */}
      <Card style={{ marginBottom: 12 }}>
        <H2>➕ Yangi kategoriya</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8, alignItems: 'end' }}>
          {[['Nomi', 'nom', 'text'], ['Birlik', 'birlik', 'text'], ['Limit', 'limit', 'number'], ['Minimum', 'min', 'number'], ['Belgi', 'icon', 'text']].map(([l, k, t]) => (
            <Inp key={k} label={l} type={t} value={yangiK[k] || ''} onChange={e => setYangiK(f => ({ ...f, [k]: e.target.value }))} placeholder={l} />
          ))}
          <Btn onClick={katQoshish} style={{ alignSelf: 'flex-end', justifyContent: 'center' }}>Qo'shish</Btn>
        </div>
      </Card>

      {/* Grid layout — 2 cols mobile, 4 cols desktop (BUG FIX) */}
      <Card>
        <H2>🗂 Barcha kategoriyalar ({katlar.length} ta)</H2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {katlar.map(kat => {
            const e = getCEntry(sm, sy, kat.id);
            const o = kat.limit > 0 && P(e.miqdor) > P(kat.limit);
            const k = kat.min > 0 && P(e.miqdor) < P(kat.min);
            const pct = kat.limit > 0 ? cl(PCT(e.miqdor, kat.limit), 0, 999) : 0;
            return (
              <div key={kat.id} style={{
                background: T.cream,
                borderRadius: T.rs,
                padding: '12px',
                border: `1px solid ${o ? T.dangerBdr : k ? T.warnBdr : T.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22 }}>{kat.icon}</span>
                  <Badge oshgan={o} kamaygan={k} val="OK" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{kat.nom}</div>
                <div style={{ fontSize: 10, color: T.muted }}>
                  {fmtN(e.miqdor)} / {fmtN(kat.limit)} {kat.birlik}
                </div>
                <Prog pct={pct} oshgan={o} kamaygan={k} />
                <div style={{ fontSize: 10, color: T.muted }}>Min: <span style={{ color: T.warn }}>{fmtN(kat.min)}</span> · {e.tranzaksiyalar.length} tx</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setTahrirK({ ...kat }); setModal({ type: 'katTahrirla' }); }}
                    style={{ flex: 1, background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}`, borderRadius: 6, padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Ico.edit}
                  </button>
                  <button onClick={() => katOchir(kat.id)}
                    style={{ flex: 1, background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBdr}`, borderRadius: 6, padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Ico.del}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
