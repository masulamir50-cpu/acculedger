import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Inp, Badge, Prog, Ico } from '../../lib/shared.jsx';
import { fmtN, P, PCT, cl } from '../../utils/format.js';

export default function Categories() {
  const {
    isMobile, sm, sy, katlar, yangiK, setYangiK,
    tahrirK, setTahrirK, getCEntry, katQoshish, katOchir, setModal,
  } = useData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Add form */}
      <Card>
        <H2>➕ Yangi kategoriya qo'shish</H2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr 1fr'
            : 'repeat(5, 1fr) auto',
          gap: 8,
          alignItems: 'end',
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
            style={{ justifyContent: 'center', marginBottom: 14, whiteSpace: 'nowrap' }}
          >
            {Ico.plus} Qo'shish
          </Btn>
        </div>
      </Card>

      {/* Categories grid */}
      <Card style={{ overflow: 'visible' }}>
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

        <div className="alc-kat-grid">
          {katlar.map(kat => {
            const e   = getCEntry(sm, sy, kat.id);
            const o   = kat.limit > 0 && P(e.miqdor) > P(kat.limit);
            const k   = kat.min > 0 && P(e.miqdor) < P(kat.min);
            const pct = kat.limit > 0 ? cl(PCT(e.miqdor, kat.limit), 0, 999) : 0;
            const statusColor = o ? T.danger : k ? T.warn : T.cyan;
            const statusBg    = o ? 'rgba(239,68,68,0.06)' : k ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.04)';
            const statusBdr   = o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)';

            return (
              <div
                key={kat.id}
                className="alc-card-hover"
                style={{
                  background: statusBg,
                  borderRadius: 14,
                  border: `1px solid ${statusBdr}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  height: 3,
                  background: `linear-gradient(90deg, ${statusColor}, transparent)`,
                  opacity: 0.7,
                }}/>

                <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {/* Icon row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: 12,
                      background: `${statusColor}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                      border: `1px solid ${statusColor}28`,
                      flexShrink: 0,
                    }}>
                      {kat.icon}
                    </div>
                    <Badge oshgan={o} kamaygan={k} val="OK" />
                  </div>

                  {/* Name */}
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: T.text,
                    lineHeight: 1.3, letterSpacing: -0.1,
                  }}>
                    {kat.nom}
                  </div>

                  {/* Stock amount */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Zaxira
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                        {fmtN(e.miqdor)}
                      </span>
                      <span style={{ fontSize: 11, color: T.muted }}>{kat.birlik}</span>
                    </div>
                    {kat.limit > 0 && (
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                        Limit: <strong style={{ color: T.accent }}>{fmtN(kat.limit)}</strong>
                        {' · '}<span style={{ color: T.cyan }}>{pct}%</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {kat.limit > 0 && <Prog pct={pct} oshgan={o} kamaygan={k} />}

                  {/* Min / tx info */}
                  <div style={{ fontSize: 10, color: T.muted, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)}</strong></span>
                    <span style={{ color: T.cyan }}>{e.tranzaksiyalar.length} tx</span>
                  </div>

                  {/* Status alerts */}
                  {o && (
                    <div style={{
                      fontSize: 10, color: T.danger, fontWeight: 600,
                      background: 'rgba(239,68,68,0.08)',
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}>
                      ⚠ +{fmtN(P(e.miqdor - kat.limit))} ortiqcha
                    </div>
                  )}
                  {k && (
                    <div style={{
                      fontSize: 10, color: T.warn, fontWeight: 600,
                      background: 'rgba(245,158,11,0.08)',
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid rgba(245,158,11,0.15)',
                    }}>
                      ⬇ {fmtN(P(kat.min - e.miqdor))} kerak
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{
                  display: 'flex',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <button
                    onClick={() => { setTahrirK({ ...kat }); setModal({ type: 'katTahrirla' }); }}
                    style={{
                      flex: 1, padding: '9px',
                      background: 'transparent',
                      color: T.accent,
                      border: 'none',
                      borderRight: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 4,
                      fontSize: 11, fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {Ico.edit}
                    <span>Tahrir</span>
                  </button>
                  <button
                    onClick={() => katOchir(kat.id)}
                    style={{
                      flex: 1, padding: '9px',
                      background: 'transparent',
                      color: T.danger,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 4,
                      fontSize: 11, fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {Ico.del}
                    <span>O'chir</span>
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
