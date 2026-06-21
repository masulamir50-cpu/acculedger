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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
      <Card>
        <H2>⚙️ Ilova sozlamalari</H2>
        {[['Kompaniya nomi', 'kompaniya', 'text'], ['Valyuta belgisi', 'valyuta', 'text'], ['Soliq stavkasi (%)', 'soliq', 'number']].map(([l, k, t]) => (
          <Inp key={k} label={l} type={t} value={sozlF[k] ?? ''} onChange={e => setSozlF(prev => ({ ...prev, [k]: e.target.value }))} />
        ))}
        <Btn onClick={() => { setSozl(sozlF); showXabar('Sozlamalar saqlandi', 'muvaffaq'); }} style={{ width: '100%', justifyContent: 'center' }}>Saqlash</Btn>
        <div style={{ marginTop: 18, padding: 16, background: T.successBg, borderRadius: T.rs, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.green, marginBottom: 8 }}>✅ Hisob ma'lumotlari</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Email: <strong style={{ color: T.text }}>{user.email}</strong></div>
          <div style={{ fontSize: 11, color: T.muted }}>UID: <strong style={{ fontSize: 10, color: T.textMid }}>{user.uid}</strong></div>
        </div>
        {pwa.canInstall && (
          <button onClick={pwa.install} style={{ width: '100%', marginTop: 12, background: `linear-gradient(135deg, ${T.accent2}, ${T.accent})`, color: '#0a0e1a', border: 'none', borderRadius: T.rs, padding: '12px', fontSize: 13, cursor: 'pointer', fontWeight: 800 }}>
            📲 Ilovani uy ekraniga o'rnatish
          </button>
        )}
      </Card>
      <Card>
        <H2>🗄 Ma'lumotlar boshqaruvi</H2>
        <div style={{ background: T.cream, borderRadius: T.rs, padding: 16, marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.accent }}>Firebase Firestore</div>
          {[['Kategoriyalar', `${katlar.length} ta`], ["Ma'lumotli oylar", `${Object.keys(mData).length} ta`],
            ['Jami tranzaksiyalar', `${Object.values(mData).reduce((s, m) => s + Object.values(m).reduce((s2, k) => s2 + (k.tranzaksiyalar?.length || 0), 0), 0)} ta`],
            ['Undo tarixi', `${tarix.length} qadam`]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
              <strong style={{ fontSize: 12, color: T.text }}>{v}</strong>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn ghost onClick={csvExport} style={{ justifyContent: 'center' }}>{Ico.csv} CSV eksport ({OYLAR_TO[sm]} {sy})</Btn>
          <Btn danger onClick={() => {
            if (window.confirm("⚠️ Barcha ma'lumotlar o'chib ketadi!")) resetAllData();
          }} style={{ justifyContent: 'center' }}>⚠ Barcha ma'lumotlarni o'chirish</Btn>
          <Btn ghost onClick={logout} style={{ justifyContent: 'center', color: T.muted, borderColor: T.border }}>
            {Ico.logout} Hisobdan chiqish
          </Btn>
        </div>
      </Card>
    </div>
  );
}
