import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { T, Card, H2, Btn, Inp, Ico } from '../../lib/shared.jsx';
import { OYLAR_TO } from '../../utils/constants.js';

export default function Settings({ pwa }) {
  const { user } = useAuth();
  const {
    isMobile, sm, sy, sozlF, setSozlF, setSozl, showXabar,
    katlar, mData, tarix,
    csvExport, resetAllData, logout,
  } = useData();

  const jami_tx = Object.values(mData).reduce(
    (s, m) => s + Object.values(m).reduce((s2, k) => s2 + (k.tranzaksiyalar?.length || 0), 0), 0
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>

      {/* App settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <H2>⚙️ Ilova sozlamalari</H2>

          {[
            ['Kompaniya nomi', 'kompaniya', 'text',   'DMS Express'],
            ['Valyuta belgisi', 'valyuta',  'text',   'UZS'],
            ['Soliq stavkasi', 'soliq',     'number', '15'],
          ].map(([l, k, t, ph]) => (
            <Inp key={k} label={l} type={t} value={sozlF[k] ?? ''}
              onChange={e => setSozlF(prev => ({ ...prev, [k]: e.target.value }))}
              placeholder={ph}
            />
          ))}

          <Btn
            onClick={() => { setSozl(sozlF); showXabar('Sozlamalar saqlandi ✓', 'muvaffaq'); }}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            Saqlash
          </Btn>
        </Card>

        {/* Account info */}
        <Card>
          <H2>👤 Hisob ma'lumotlari</H2>
          <div style={{
            background: 'rgba(34,197,94,0.05)',
            borderRadius: 14, padding: '16px',
            border: '1px solid rgba(34,197,94,0.15)',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                border: '1px solid rgba(59,130,246,0.2)',
              }}>👤</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{user.email}</div>
                <div style={{
                  fontSize: 10, color: T.green, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4, marginTop: 2,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}` }}/>
                  Firebase Auth orqali ulangan
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 10, color: T.muted,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8, padding: '8px 10px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}>
              UID: {user.uid}
            </div>
          </div>

          {pwa?.canInstall && (
            <button
              onClick={pwa.install}
              className="alc-btn"
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${T.accent2}, ${T.accent}, ${T.accent3})`,
                color: '#0a0e1a',
                border: 'none',
                borderRadius: T.rs,
                padding: '13px',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(201,168,76,0.35)',
              }}
            >
              📲 Uy ekraniga o'rnatish
            </button>
          )}
        </Card>
      </div>

      {/* Data management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <H2>🗄 Firebase statistikasi</H2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              ['Kategoriyalar',       `${katlar.length} ta`,   T.accent, '🏷'],
              ["Ma'lumotli oylar",    `${Object.keys(mData).length} ta`, T.cyan, '📅'],
              ['Jami tranzaksiyalar', `${jami_tx} ta`,          T.green, '📊'],
              ['Undo tarixi',         `${tarix.length} qadam`, T.muted,  '↩'],
            ].map(([l, v, col, ic]) => (
              <div key={l} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{ic}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
                </div>
                <strong style={{ fontSize: 13, color: col }}>{v}</strong>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)', margin: '4px 0 14px' }}/>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn
              ghost
              onClick={csvExport}
              style={{ justifyContent: 'center', gap: 6, width: '100%' }}
            >
              {Ico.csv} CSV eksport — {OYLAR_TO[sm]} {sy}
            </Btn>

            <button
              onClick={() => {
                if (window.confirm("⚠️ Barcha ma'lumotlar o'chib ketadi!\nDavom etasizmi?")) {
                  resetAllData();
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(239,68,68,0.06)',
                color: T.danger,
                border: `1px solid rgba(239,68,68,0.25)`,
                borderRadius: T.rs,
                padding: '10px 18px',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            >
              ⚠ Barcha ma'lumotlarni o'chirish
            </button>

            <button
              onClick={logout}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                color: T.muted,
                border: `1px solid ${T.border}`,
                borderRadius: T.rs,
                padding: '10px 18px',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              {Ico.logout} Hisobdan chiqish
            </button>
          </div>
        </Card>

        {/* App version */}
        <div style={{
          background: T.card,
          backdropFilter: T.blur,
          borderRadius: T.r,
          padding: '16px 20px',
          border: `1px solid ${T.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 24, marginBottom: 8,
            filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.3))',
          }}>⚡</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>AccuLedger v1.0</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
            React + Vite + Firebase
          </div>
          <div style={{
            display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10,
          }}>
            {['PWA', 'Offline', 'Undo'].map(tag => (
              <span key={tag} style={{
                fontSize: 10, padding: '2px 8px',
                borderRadius: 20,
                background: T.cyanBg,
                color: T.cyan,
                border: `1px solid ${T.cyanBdr}`,
                fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
