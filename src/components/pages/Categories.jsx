import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Inp, Badge, Prog, Ico } from '../../lib/shared.jsx';
import { fmtN, P, PCT, cl } from '../../utils/format.js';

export default function Categories() {
  const {
    isMobile, sm, sy, katlar, yangiK, setYangiK,
    tahrirK, setTahrirK, getCEntry, katQoshish, katOchir, setModal,
  } = useData();

  return (
    <div>
      {/* Add form */}
      <Card style={{ marginBottom: 14 }}>
        <H2>➕ Yangi kategoriya qo'shish</H2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr 1fr'
            : 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 8, alignItems: 'end',
        }}>
          {[
            ['Nomi',    'nom',    'text',   '📁 Nomi'],
            ['Birlik',  'birlik', 'text',   'dona, kg…'],
            ['Limit',   'limit',  'number', '100'],
            ['Minimum', 'min',    'number', '10'],
            ['Belgi',   'icon',   'text',   '📦'],
          ].map(([l, k, t, ph]) => (
            <Inp
              key={k}
              label={l}
              type={t}
              value={yangiK[k] || ''}
              onChange={e => setYangiK(f => ({ ...f, [k]: e.target.value }))}
              placeholder={ph}
            />
          ))}
          <Btn
            onClick={katQoshish}
            style={{ alignSelf: 'flex-end', justifyContent: 'center', marginBottom: 14 }}
          >
            {Ico.plus} Qo'shish
          </Btn>
        </div>
      </Card>

      {/* Categories grid */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <H2 style={{ marginBottom: 0 }}>🗂 Barcha kategoriyalar</H2>
          <div style={{
            fontSize: 12, fontWeight: 700,
            background: T.cyanBg,
            color: T.cyan,
            padding: '4px 12px',
            borderRadius: 20,
            border: `1px solid ${T.cyanBdr}`,
          }}>{katlar.length} ta</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {katlar.map(kat => {
            const e   = getCEntry(sm, sy, kat.id);
            const o   = kat.limit > 0 && P(e.miqdor) > P(kat.limit);
            const k   = kat.min > 0 && P(e.miqdor) < P(kat.min);
            const pct = kat.limit > 0 ? cl(PCT(e.miqdor, kat.limit), 0, 999) : 0;
            const statusColor = o ? T.danger : k ? T.warn : T.cyan;

            return (
              <div
                key={kat.id}
                className="alc-card-hover"
                style={{
                  background: o
                    ? 'rgba(239,68,68,0.05)'
                    : k
                    ? 'rgba(245,158,11,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  borderRadius: 16,
                  padding: '14px',
                  border: `1px solid ${o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                {/* Top color bar */}
                <div style={{
                  position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
                  background: statusColor,
                  borderRadius: '0 0 2px 2px',
                  boxShadow: `0 0 8px ${statusColor}60`,
                }}/>

                {/* Icon + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${statusColor}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    border: `1px solid ${statusColor}25`,
                  }}>{kat.icon}</div>
                  <Badge oshgan={o} kamaygan={k} val="✓" />
                </div>

                {/* Name */}
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                  {kat.nom}
                </div>

                {/* Stats */}
                <div style={{ fontSize: 10, color: T.muted }}>
                  <div style={{ marginBottom: 2 }}>
                    Zaxira:{' '}
                    <strong style={{ color: T.text }}>{fmtN(e.miqdor)}</strong>
                    {' / '}
                    <strong style={{ color: T.accent }}>{fmtN(kat.limit)}</strong>
                    {' '}{kat.birlik}
                  </div>
                  <div>
                    Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)}</strong>
                    {' · '}
                    <span style={{ color: T.cyan }}>{e.tranzaksiyalar.length} tx</span>
                  </div>
                </div>

                <Prog pct={pct} oshgan={o} kamaygan={k} />

                {/* Alerts */}
                {o && <div style={{ fontSize: 10, color: T.danger, fontWeight: 600 }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} ortiqcha</div>}
                {k && <div style={{ fontSize: 10, color: T.warn, fontWeight: 600 }}>⬇ {fmtN(P(kat.min - e.miqdor))} kerak</div>}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  <button
                    onClick={() => { setTahrirK({ ...kat }); setModal({ type: 'katTahrirla' }); }}
                    style={{
                      flex: 1, padding: '6px',
                      background: 'rgba(201,168,76,0.08)',
                      color: T.accent,
                      border: `1px solid rgba(201,168,76,0.2)`,
                      borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.16)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
                  >{Ico.edit}</button>
                  <button
                    onClick={() => katOchir(kat.id)}
                    style={{
                      flex: 1, padding: '6px',
                      background: 'rgba(239,68,68,0.08)',
                      color: T.danger,
                      border: `1px solid rgba(239,68,68,0.2)`,
                      borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  >{Ico.del}</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
