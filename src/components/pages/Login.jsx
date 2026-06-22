import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

// ═══════════════════════════════════════════════════════
// Light-mode LOGIN — och ko'k shisha + suzuvchi premium kartalar
// ═══════════════════════════════════════════════════════

// Premium credit card komponenti (CSS bilan, original dizayn)
function FloatingCard({ variant, style, delay }) {
  const isGold = variant === 'gold';
  return (
    <div
      style={{
        position: 'absolute',
        width: 300,
        height: 189,
        borderRadius: 18,
        padding: 22,
        boxSizing: 'border-box',
        background: isGold
          ? 'linear-gradient(135deg, #f5d488 0%, #e0b551 35%, #c9962e 70%, #a87822 100%)'
          : 'linear-gradient(135deg, #f0f3f8 0%, #d4dae3 35%, #b8c0cc 70%, #9aa3b2 100%)',
        boxShadow: isGold
          ? '0 20px 60px rgba(201,150,46,0.35), inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.15)'
          : '0 20px 60px rgba(154,163,178,0.35), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)',
        border: isGold ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.5)',
        animation: `card-float 8s ease-in-out infinite`,
        animationDelay: delay,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Shine sweep */}
      <div style={{
        position: 'absolute', top: 0, left: '-60%', width: '50%', height: '100%',
        background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.45), transparent)',
        animation: 'card-shine 6s ease-in-out infinite',
        animationDelay: delay,
        pointerEvents: 'none',
      }}/>

      {/* Top row: chip + brand */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* EMV chip */}
        <div style={{
          width: 42, height: 32, borderRadius: 6,
          background: isGold
            ? 'linear-gradient(135deg, #fbe9b7, #d9b65e)'
            : 'linear-gradient(135deg, #fafcff, #c2cad6)',
          border: '1px solid rgba(0,0,0,0.12)',
          position: 'relative',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.15)',
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, padding: '0 4px' }}>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.2)' }}/>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.2)' }}/>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.2)' }}/>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 1,
          color: isGold ? '#6b4e16' : '#4a5160',
          textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.3,
        }}>
          AccuLedger<br/>
          <span style={{ fontSize: 8, fontWeight: 600, opacity: 0.7 }}>
            {isGold ? 'GOLD' : 'PLATINUM'}
          </span>
        </div>
      </div>

      {/* Card number */}
      <div style={{
        marginTop: 20,
        fontSize: 17, fontWeight: 600, letterSpacing: 2,
        color: isGold ? '#5c4313' : '#3d434f',
        fontFamily: 'monospace',
        textShadow: '0 1px 1px rgba(255,255,255,0.4)',
      }}>
        ••••  ••••  ••••  2026
      </div>

      {/* Bottom row */}
      <div style={{
        position: 'absolute', bottom: 20, left: 22, right: 22,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 600, color: isGold ? '#8a6a28' : '#6a7180', letterSpacing: 1, marginBottom: 2 }}>CARD HOLDER</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: isGold ? '#5c4313' : '#3d434f', letterSpacing: 1 }}>FAMILY ACCOUNT</div>
        </div>
        {/* Brand mark (original, AmEx-inspired but not copy) */}
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: isGold ? 'rgba(92,67,19,0.15)' : 'rgba(61,67,79,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 900,
          color: isGold ? '#5c4313' : '#3d434f',
          border: `1px solid ${isGold ? 'rgba(92,67,19,0.2)' : 'rgba(61,67,79,0.2)'}`,
        }}>AL</div>
      </div>
    </div>
  );
}

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

  // Light-mode rang palitrasi
  const C = {
    ink:    '#E2E8F0',   // asosiy qora-ko'k matn
    inkDim: '#94A3B8',   // ikkilamchi
    muted:  '#64748B',   // xira
    blue:   '#C9A84C',   // primary ko'k
    blueLt: '#D4AF37',
    border: 'rgba(255,255,255,0.08)',
    glass:  'rgba(19,24,38,0.9)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      // Tongi och ko'k osmon gradient
      background: '#090C15',
    }}>

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes card-float {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-24px) rotate(var(--rot, 0deg)); }
        }
        @keyframes card-shine {
          0%, 100% { left: -60%; }
          50% { left: 120%; }
        }
        @keyframes cloud-drift {
          from { transform: translateX(-100px); }
          to { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes sun-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
        @keyframes login-rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Quyosh nuri (yuqori o'ng) ── */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 60%)',
        animation: 'sun-pulse 8s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>

      {/* ── Bulutlar ── */}
      {[
        { top: '12%', w: 180, h: 50, dur: 60, delay: 0,   op: 0.6 },
        { top: '22%', w: 130, h: 38, dur: 80, delay: -20, op: 0.45 },
        { top: '68%', w: 200, h: 56, dur: 70, delay: -40, op: 0.5 },
      ].map((cl, i) => (
        <div key={i} style={{
          position: 'absolute', top: cl.top, left: 0,
          width: cl.w, height: cl.h,
          background: 'transparent',
          borderRadius: 100,
          filter: 'blur(12px)',
          animation: `cloud-drift ${cl.dur}s linear infinite`,
          animationDelay: `${cl.delay}s`,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* ── Shahar silueti (pastda, SVG) ── */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 280,
          pointerEvents: 'none', opacity: 0.6,
        }}
      >
        <defs>
          <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2540"/>
            <stop offset="100%" stopColor="#0e1424"/>
          </linearGradient>
          <linearGradient id="bldg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#151d33"/>
            <stop offset="100%" stopColor="#0c1220"/>
          </linearGradient>
        </defs>
        {/* Orqa qator binolar */}
        <g fill="url(#bldg2)" opacity="0.7">
          <rect x="40"   y="160" width="70"  height="160" rx="3"/>
          <rect x="160"  y="120" width="55"  height="200" rx="3"/>
          <rect x="280"  y="180" width="80"  height="140" rx="3"/>
          <rect x="420"  y="100" width="60"  height="220" rx="3"/>
          <rect x="560"  y="150" width="75"  height="170" rx="3"/>
          <rect x="720"  y="90"  width="65"  height="230" rx="3"/>
          <rect x="880"  y="140" width="70"  height="180" rx="3"/>
          <rect x="1020" y="110" width="58"  height="210" rx="3"/>
          <rect x="1160" y="170" width="85"  height="150" rx="3"/>
          <rect x="1300" y="130" width="62"  height="190" rx="3"/>
        </g>
        {/* Old qator binolar (balandroq) */}
        <g fill="url(#bldg)">
          <rect x="100"  y="80"  width="90"  height="240" rx="4"/>
          <rect x="240"  y="50"  width="70"  height="270" rx="4"/>
          <rect x="380"  y="110" width="100" height="210" rx="4"/>
          <rect x="540"  y="40"  width="80"  height="280" rx="4"/>
          <rect x="700"  y="95"  width="95"  height="225" rx="4"/>
          <rect x="860"  y="60"  width="75"  height="260" rx="4"/>
          <rect x="1000" y="105" width="105" height="215" rx="4"/>
          <rect x="1180" y="70"  width="85"  height="250" rx="4"/>
          <rect x="1340" y="120" width="70"  height="200" rx="4"/>
        </g>
        {/* Deraza nuqtalari (eng baland binolarda) */}
        <g fill="rgba(201,168,76,0.25)">
          {[260, 280, 560, 580, 720, 880, 1200, 1220].map((x, i) => (
            <g key={i}>
              <rect x={x} y={80}  width="6" height="6" rx="1"/>
              <rect x={x} y={100} width="6" height="6" rx="1"/>
              <rect x={x} y={120} width="6" height="6" rx="1"/>
            </g>
          ))}
        </g>
      </svg>

      {/* ── Suzuvchi kartalar (desktop'da ko'rinadi) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ '--rot': '-12deg', position: 'absolute', top: '14%', left: '8%', display: window.innerWidth < 900 ? 'none' : 'block' }}>
          <FloatingCard variant="gold" delay="0s" style={{ transform: 'rotate(-12deg)' }}/>
        </div>
        <div style={{ '--rot': '10deg', position: 'absolute', bottom: '16%', right: '7%', display: window.innerWidth < 900 ? 'none' : 'block' }}>
          <FloatingCard variant="platinum" delay="-3s" style={{ transform: 'rotate(10deg)' }}/>
        </div>
        <div style={{ '--rot': '6deg', position: 'absolute', top: '22%', right: '14%', display: window.innerWidth < 1300 ? 'none' : 'block', opacity: 0.85 }}>
          <FloatingCard variant="platinum" delay="-5s" style={{ transform: 'rotate(6deg) scale(0.82)' }}/>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          LOGIN KARTASI (glass, light)
      ══════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 410,
        background: 'rgba(19,24,38,0.85)',
        borderRadius: 28,
        padding: '40px 36px 32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'login-rise 0.6s cubic-bezier(.16,1,.3,1)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            position: 'relative', marginBottom: 18,
            width: 84, height: 84,
            borderRadius: 22,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <img
              src="/logo.png"
              alt="AccuLedger"
              style={{
                width: 64, height: 64,
                objectFit: 'contain',
                borderRadius: 14,
              }}
            />
          </div>

          <div style={{
            fontSize: 27, fontWeight: 900,
            color: C.ink,
            letterSpacing: -0.6, lineHeight: 1, marginBottom: 7,
          }}>AccuLedger</div>

          <div style={{
            fontSize: 11, color: C.inkDim,
            fontWeight: 600, letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}>Oilaviy moliya boshqaruvi</div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 13,
          padding: 4,
          marginBottom: 26,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[['kirish', 'Kirish'], ['royxat', "Ro'yxat"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setRejim(k); setXato(''); }}
              style={{
                flex: 1, padding: '10px',
                borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: rejim === k ? 800 : 600,
                background: rejim === k ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: rejim === k ? C.blue : C.muted,
                boxShadow: rejim === k ? 'inset 0 0 0 1px rgba(201,168,76,0.2)' : 'none',
                transition: 'all 0.2s',
                letterSpacing: 0.2,
              }}
            >{l}</button>
          ))}
        </div>

        {/* Error */}
        {xato && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            color: '#dc2626',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12,
            padding: '11px 14px',
            fontSize: 13, marginBottom: 18, fontWeight: 600,
          }}>⚠ {xato}</div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 15 }}>
          <label style={{
            fontSize: 10, color: C.inkDim, fontWeight: 700,
            display: 'block', marginBottom: 7,
            textTransform: 'uppercase', letterSpacing: 1.2,
          }}>Email</label>
          <input
            type="email"
            placeholder="email@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={() => setFocus('email')}
            onBlur={() => setFocus('')}
            style={{
              width: '100%',
              border: `1.5px solid ${focus === 'email' ? C.blue : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 13,
              padding: '13px 16px',
              fontSize: 14,
              background: 'rgba(255,255,255,0.04)',
              outline: 'none', boxSizing: 'border-box',
              color: C.ink, fontWeight: 500,
              boxShadow: focus === 'email' ? '0 0 0 3px rgba(201,168,76,0.12)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28 }}>
          <label style={{
            fontSize: 10, color: C.inkDim, fontWeight: 700,
            display: 'block', marginBottom: 7,
            textTransform: 'uppercase', letterSpacing: 1.2,
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
              border: `1.5px solid ${focus === 'parol' ? C.blue : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 13,
              padding: '13px 16px',
              fontSize: 14,
              background: 'rgba(255,255,255,0.04)',
              outline: 'none', boxSizing: 'border-box',
              color: C.ink, fontWeight: 500,
              boxShadow: focus === 'parol' ? '0 0 0 3px rgba(201,168,76,0.12)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={yukl}
          style={{
            width: '100%',
            background: yukl
              ? 'rgba(201,168,76,0.4)'
              : 'linear-gradient(135deg, #D4AF37 0%, #C9A84C 60%, #a8853d 100%)',
            color: '#0a0c18', border: 'none',
            borderRadius: 14, padding: '15px',
            fontSize: 14, cursor: yukl ? 'not-allowed' : 'pointer',
            fontWeight: 800, letterSpacing: 0.4,
            boxShadow: yukl ? 'none' : '0 8px 28px rgba(201,168,76,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {yukl
            ? 'Yuklanmoqda…'
            : rejim === 'kirish' ? 'Kirish →' : "Ro'yxatdan o'tish →"}
        </button>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          margin: '20px 0',
        }}/>

        <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, fontWeight: 500 }}>
          {rejim === 'kirish' ? "Hisobingiz yo'qmi? " : 'Hisobingiz bormi? '}
          <span
            onClick={() => { setRejim(r => r === 'kirish' ? 'royxat' : 'kirish'); setXato(''); }}
            style={{ color: C.blue, cursor: 'pointer', fontWeight: 800 }}
          >
            {rejim === 'kirish' ? "Ro'yxatdan o'tish →" : '← Kirish'}
          </span>
        </div>
      </div>
    </div>
  );
}
