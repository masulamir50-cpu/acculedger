import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { T } from '../../lib/shared.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [parol, setParol] = useState('');
  const [rejim, setRejim] = useState('kirish');
  const [xato,  setXato]  = useState('');
  const [yukl,  setYukl]  = useState(false);

  const submit = async () => {
    if (!email || !parol) { setXato("Email va parolni kiriting!"); return; }
    setYukl(true); setXato('');
    try {
      if (rejim === 'kirish') await signInWithEmailAndPassword(auth, email, parol);
      else                    await createUserWithEmailAndPassword(auth, email, parol);
    } catch (e) {
      const m = {
        'auth/invalid-credential':   "Email yoki parol noto'g'ri!",
        'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan!",
        'auth/weak-password':        "Parol kamida 6 ta belgidan iborat bo'lsin!",
        'auth/invalid-email':        "Email noto'g'ri formatda!",
      };
      setXato(m[e.code] || 'Xatolik: ' + e.message);
    }
    setYukl(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1a1400 0%, #0a0e1a 65%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: T.card, borderRadius: T.rx, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', marginBottom: 18 }}>
            <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)', borderRadius: '50%', animation: 'alc-glow-pulse 2.5s ease-in-out infinite' }} />
            <img src="/logo.png" alt="AccuLedger" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 18, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.4))' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: T.accent, letterSpacing: -0.5, lineHeight: 1 }}>AccuLedger</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6, letterSpacing: 0.5 }}>Moliyaviy boshqaruv tizimi</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: T.muted, marginBottom: 24, background: T.cream, borderRadius: T.rs, padding: '8px 16px', border: `1px solid ${T.border}` }}>
          {rejim === 'kirish' ? "Hisobingizga kiring" : "Yangi hisob yarating"}
        </div>

        {xato && <div style={{ background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBdr}`, borderRadius: T.rs, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>⚠ {xato}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
          <input
            style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: T.rs, padding: '13px 16px', fontSize: 14, background: T.cream, outline: 'none', boxSizing: 'border-box', color: T.text, transition: 'border-color 0.2s' }}
            type="email" placeholder="email@gmail.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Parol</label>
          <input
            style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: T.rs, padding: '13px 16px', fontSize: 14, background: T.cream, outline: 'none', boxSizing: 'border-box', color: T.text }}
            type="password" placeholder="••••••••" value={parol}
            onChange={e => setParol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <button onClick={submit} disabled={yukl}
          style={{ width: '100%', background: `linear-gradient(135deg, ${T.accent2}, ${T.accent})`, color: '#0a0e1a', border: 'none', borderRadius: T.rs, padding: '14px', fontSize: 14, cursor: yukl ? 'not-allowed' : 'pointer', fontWeight: 800, boxShadow: '0 6px 20px rgba(201,168,76,0.35)', opacity: yukl ? 0.7 : 1, letterSpacing: 0.3 }}>
          {yukl ? 'Yuklanmoqda…' : rejim === 'kirish' ? 'Kirish →' : "Ro'yxatdan o'tish →"}
        </button>

        <div onClick={() => { setRejim(r => r === 'kirish' ? 'royxat' : 'kirish'); setXato(''); }}
          style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.accent, cursor: 'pointer', fontWeight: 600, padding: '8px', borderRadius: T.rs }}>
          {rejim === 'kirish' ? "Hisob yo'qmi? Ro'yxatdan o'tish →" : '← Hisobingiz bormi? Kirish'}
        </div>
      </div>
    </div>
  );
}
