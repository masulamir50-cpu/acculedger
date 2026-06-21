import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { T } from '../../lib/shared.jsx';

export default function Login() {
  const [email, setEmail]  = useState('');
  const [parol, setParol]  = useState('');
  const [rejim, setRejim]  = useState('kirish');
  const [xato,  setXato]   = useState('');
  const [yukl,  setYukl]   = useState(false);
  const [focus, setFocus]  = useState('');

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
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: '40%', right: '20%',
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }}/>

      {/* Card */}
      <div style={{
        background: 'rgba(10,16,30,0.88)',
        backdropFilter: 'blur(32px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
        borderRadius: 28,
        padding: '44px 40px 36px',
        width: '100%',
        maxWidth: 420,
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        {/* Top neon line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
          borderRadius: 1,
        }}/>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            {/* Outer ring */}
            <div className="alc-spin" style={{
              position: 'absolute', inset: -10,
              borderRadius: '50%',
              border: '1.5px conic-gradient(from 0deg, rgba(0,212,255,0.7), transparent, rgba(201,168,76,0.5), transparent) 1px solid',
              opacity: 0.7,
            }}/>
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: -16,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)',
            }}/>
            <img
              src="/logo.png"
              alt="AccuLedger"
              className="alc-pulse"
              style={{
                width: 76, height: 76,
                objectFit: 'contain',
                borderRadius: 18,
                position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 0 16px rgba(0,212,255,0.3)) drop-shadow(0 0 32px rgba(201,168,76,0.15))',
              }}
            />
          </div>

          <div style={{
            fontSize: 28, fontWeight: 900,
            background: `linear-gradient(135deg, ${T.text} 20%, ${T.accent} 60%, ${T.cyan} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -0.8, lineHeight: 1,
            marginBottom: 6,
          }}>AccuLedger</div>

          <div style={{
            fontSize: 11, color: T.muted,
            fontWeight: 500, letterSpacing: 2,
            textTransform: 'uppercase',
          }}>Moliyaviy boshqaruv tizimi</div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 28,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[['kirish','Kirish'], ['royxat',"Ro'yxat"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setRejim(k); setXato(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: rejim === k ? 700 : 500,
                background: rejim === k
                  ? 'rgba(0,212,255,0.1)'
                  : 'transparent',
                color: rejim === k ? T.cyan : T.muted,
                boxShadow: rejim === k
                  ? 'inset 0 0 0 1px rgba(0,212,255,0.2), 0 0 12px rgba(0,212,255,0.08)'
                  : 'none',
                transition: 'all 0.2s',
                letterSpacing: 0.3,
              }}
            >{l}</button>
          ))}
        </div>

        {/* Error */}
        {xato && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            color: '#ff6b6b',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: '11px 14px',
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 500,
          }}>⚠ {xato}</div>
        )}

        {/* Email field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 10, color: T.muted,
            fontWeight: 600, display: 'block',
            marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2,
          }}>Email</label>
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={() => setFocus('email')}
            onBlur={() => setFocus('')}
            style={{
              width: '100%',
              border: `1px solid ${focus === 'email' ? 'rgba(0,212,255,0.5)' : T.border}`,
              borderRadius: 12,
              padding: '13px 16px',
              fontSize: 14,
              background: 'rgba(255,255,255,0.03)',
              outline: 'none',
              boxSizing: 'border-box',
              color: T.text,
              boxShadow: focus === 'email' ? '0 0 0 3px rgba(0,212,255,0.1), 0 0 20px rgba(0,212,255,0.06)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: 32 }}>
          <label style={{
            fontSize: 10, color: T.muted,
            fontWeight: 600, display: 'block',
            marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2,
          }}>Parol</label>
          <input
            type="password"
            placeholder="••••••••"
            value={parol}
            onChange={e => setParol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={() => setFocus('parol')}
            onBlur={() => setFocus('')}
            style={{
              width: '100%',
              border: `1px solid ${focus === 'parol' ? 'rgba(0,212,255,0.5)' : T.border}`,
              borderRadius: 12,
              padding: '13px 16px',
              fontSize: 14,
              background: 'rgba(255,255,255,0.03)',
              outline: 'none',
              boxSizing: 'border-box',
              color: T.text,
              boxShadow: focus === 'parol' ? '0 0 0 3px rgba(0,212,255,0.1), 0 0 20px rgba(0,212,255,0.06)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={yukl}
          style={{
            width: '100%',
            background: yukl
              ? 'rgba(201,168,76,0.3)'
              : `linear-gradient(135deg, ${T.accent2} 0%, ${T.accent} 50%, ${T.accent3} 100%)`,
            color: '#0a0c18',
            border: 'none',
            borderRadius: 14,
            padding: '15px',
            fontSize: 14,
            cursor: yukl ? 'not-allowed' : 'pointer',
            fontWeight: 800,
            letterSpacing: 0.4,
            boxShadow: yukl
              ? 'none'
              : '0 8px 28px rgba(201,168,76,0.4), 0 2px 8px rgba(0,0,0,0.4)',
            transition: 'all 0.2s',
            opacity: yukl ? 0.7 : 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {yukl
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(10,12,24,0.4)', borderTopColor: '#0a0c18', borderRadius: '50%' }} className="alc-spin"/>
                Yuklanmoqda…
              </span>
            : rejim === 'kirish'
            ? 'Kirish →'
            : "Ro'yxatdan o'tish →"
          }
        </button>

        {/* Bottom divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          margin: '20px 0',
        }}/>

        <div style={{ textAlign: 'center', fontSize: 12, color: T.muted, fontWeight: 500 }}>
          {rejim === 'kirish' ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}{' '}
          <span
            onClick={() => { setRejim(r => r === 'kirish' ? 'royxat' : 'kirish'); setXato(''); }}
            style={{
              color: T.cyan, cursor: 'pointer', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {rejim === 'kirish' ? "Ro'yxatdan o'tish →" : '← Kirish'}
          </span>
        </div>
      </div>
    </div>
  );
}
