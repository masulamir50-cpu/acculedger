import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const keyframes = `
@keyframes login-clouds {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes login-float-card {
  0%, 100% { transform: translateY(0) rotate(var(--rot)); }
  50% { transform: translateY(-18px) rotate(calc(var(--rot) + 3deg)); }
}
@keyframes login-sun-pulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
@keyframes login-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes login-fade-up {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes login-bird {
  0% { transform: translateX(-30px) translateY(0); }
  25% { transform: translateX(0) translateY(-8px); }
  50% { transform: translateX(30px) translateY(0); }
  75% { transform: translateX(60px) translateY(-6px); }
  100% { transform: translateX(90px) translateY(0); }
}
`;

const Cloud = ({ top, dur, opacity, scale }) => (
  <div style={{
    position: 'absolute', top, left: 0, width: '200%', height: 80,
    opacity, animation: `login-clouds ${dur}s linear infinite`,
  }}>
    {[0, 12, 28, 45, 60, 78, 92].map((l, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: `${l}%`,
        top: i % 2 === 0 ? 0 : 20,
        width: 120 * scale, height: 50 * scale,
        borderRadius: '50px',
        background: 'rgba(255,255,255,0.7)',
        filter: 'blur(6px)',
      }}/>
    ))}
  </div>
);

const Building = ({ left, w, h, color, windows }) => (
  <div style={{
    position: 'absolute', bottom: 0, left, width: w, height: h,
    background: `linear-gradient(180deg, ${color} 0%, rgba(180,200,220,0.5) 100%)`,
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(0,0,0,0.05)',
  }}>
    {windows && Array.from({ length: Math.floor(h / 24) }).map((_, row) =>
      Array.from({ length: Math.floor(w / 18) }).map((_, col) => (
        <div key={`${row}-${col}`} style={{
          position: 'absolute',
          top: 12 + row * 24,
          left: 6 + col * 18,
          width: 10, height: 14,
          borderRadius: 2,
          background: (row + col) % 3 === 0
            ? 'rgba(255,220,120,0.6)'
            : 'rgba(200,220,240,0.5)',
        }}/>
      ))
    )}
  </div>
);

const CreditCard = ({ top, left, rot, delay, color1, color2, chip }) => (
  <div style={{
    position: 'absolute', top, left,
    '--rot': `${rot}deg`,
    animation: `login-float-card 4s ease-in-out ${delay}s infinite`,
    zIndex: 2,
  }}>
    <div style={{
      width: 110, height: 68,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
      padding: 10,
      position: 'relative',
      overflow: 'hidden',
      transform: `rotate(${rot}deg)`,
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
      }}/>
      <div style={{
        width: 18, height: 13, borderRadius: 3,
        background: chip === 'gold'
          ? 'linear-gradient(135deg, #d4a54a, #f7d774, #c9a84c)'
          : 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #a0a0a0)',
        marginTop: 4,
      }}/>
      <div style={{
        position: 'absolute', bottom: 8, left: 10,
        fontSize: 6, letterSpacing: 2, color: 'rgba(255,255,255,0.7)',
        fontWeight: 600, fontFamily: 'monospace',
      }}>•••• •••• 4242</div>
      <div style={{
        position: 'absolute', bottom: 8, right: 10,
        fontSize: 5, color: 'rgba(255,255,255,0.5)',
        fontWeight: 500,
      }}>ACCU</div>
    </div>
  </div>
);

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
      background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0F6 25%, #E8F4FD 50%, #FFF8E7 75%, #FFE4B5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <style>{keyframes}</style>

      {/* Sun */}
      <div style={{
        position: 'absolute', top: 30, right: '12%',
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,223,100,0.9) 0%, rgba(255,180,50,0.4) 40%, transparent 70%)',
        animation: 'login-sun-pulse 6s ease-in-out infinite',
        zIndex: 0,
      }}/>
      <div style={{
        position: 'absolute', top: 10, right: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,200,50,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>

      {/* Cloud layers */}
      <Cloud top="8%" dur={45} opacity={0.6} scale={1} />
      <Cloud top="15%" dur={60} opacity={0.4} scale={0.8} />
      <Cloud top="22%" dur={35} opacity={0.5} scale={1.1} />

      {/* Birds */}
      {[{ t: '12%', l: '20%', d: 0 }, { t: '9%', l: '55%', d: 2 }, { t: '16%', l: '70%', d: 4 }].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.t, left: b.l, fontSize: 10, zIndex: 1,
          animation: `login-bird ${6 + i * 2}s ease-in-out ${b.d}s infinite alternate`,
          color: 'rgba(60,60,80,0.3)',
        }}>~</div>
      ))}

      {/* City skyline */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <Building left="2%"  w={60} h="80%" color="rgba(160,185,210,0.35)" windows />
        <Building left="8%"  w={45} h="55%" color="rgba(170,190,215,0.3)" windows />
        <Building left="14%" w={70} h="95%" color="rgba(140,170,200,0.4)" windows />
        <Building left="22%" w={40} h="50%" color="rgba(175,195,218,0.3)" windows />
        <Building left="28%" w={55} h="70%" color="rgba(155,180,210,0.35)" windows />
        <Building left="36%" w={80} h="100%" color="rgba(130,165,200,0.45)" windows />
        <Building left="48%" w={50} h="60%" color="rgba(165,188,215,0.3)" windows />
        <Building left="55%" w={65} h="85%" color="rgba(145,175,205,0.4)" windows />
        <Building left="64%" w={45} h="45%" color="rgba(175,195,218,0.3)" windows />
        <Building left="70%" w={75} h="90%" color="rgba(135,168,200,0.42)" windows />
        <Building left="80%" w={55} h="65%" color="rgba(160,185,212,0.35)" windows />
        <Building left="88%" w={70} h="75%" color="rgba(150,178,208,0.38)" windows />
      </div>

      {/* Floating credit cards */}
      <CreditCard top="18%" left="5%"  rot={-15} delay={0}   color1="#1a1a2e" color2="#2d2d5e" chip="gold" />
      <CreditCard top="12%" left="78%" rot={12}  delay={1.5} color1="#c9a84c" color2="#dfc370" chip="silver" />
      <CreditCard top="55%" left="3%"  rot={20}  delay={0.8} color1="#e8e8e8" color2="#f5f5f5" chip="gold" />
      <CreditCard top="60%" left="82%" rot={-10} delay={2}   color1="#1e3a5f" color2="#2a5a8f" chip="silver" />
      <CreditCard top="35%" left="85%" rot={8}   delay={3}   color1="#2d1b4e" color2="#4a2d7a" chip="gold" />

      {/* Login card */}
      <div style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderRadius: 28,
        padding: '44px 40px 36px',
        width: '100%',
        maxWidth: 420,
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.6)',
        position: 'relative',
        zIndex: 5,
        animation: 'login-fade-up 0.8s ease-out both',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 3,
          borderRadius: '0 0 4px 4px',
          background: 'linear-gradient(90deg, #c9a84c, #FFD700, #DAA520)',
        }}/>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
            }}/>
            <img
              src="/logo.png"
              alt="AccuLedger"
              style={{
                width: 72, height: 72,
                objectFit: 'contain',
                borderRadius: 18,
                position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
              }}
            />
          </div>
          <div style={{
            fontSize: 28, fontWeight: 900,
            background: 'linear-gradient(135deg, #1a1a2e 20%, #c9a84c 60%, #DAA520 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -0.8, lineHeight: 1,
            marginBottom: 6,
          }}>AccuLedger</div>
          <div style={{
            fontSize: 11, color: '#8899aa',
            fontWeight: 600, letterSpacing: 2,
            textTransform: 'uppercase',
          }}>Moliyaviy boshqaruv tizimi</div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {[['kirish','Kirish'], ['royxat',"Ro'yxat"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setRejim(k); setXato(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: rejim === k ? 700 : 500,
                fontFamily: 'inherit',
                background: rejim === k
                  ? 'rgba(255,255,255,0.9)'
                  : 'transparent',
                color: rejim === k ? '#1a1a2e' : '#8899aa',
                boxShadow: rejim === k
                  ? '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                  : 'none',
                transition: 'all 0.25s',
                letterSpacing: 0.3,
              }}
            >{l}</button>
          ))}
        </div>

        {/* Error */}
        {xato && (
          <div style={{
            background: 'rgba(220,53,69,0.08)',
            color: '#dc3545',
            border: '1px solid rgba(220,53,69,0.2)',
            borderRadius: 12,
            padding: '11px 14px',
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 500,
          }}>{xato}</div>
        )}

        {/* Email field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 10, color: '#8899aa',
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
              border: `1.5px solid ${focus === 'email' ? '#c9a84c' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 12,
              padding: '13px 16px',
              fontSize: 14,
              background: focus === 'email' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#1a1a2e',
              fontFamily: 'inherit',
              boxShadow: focus === 'email' ? '0 0 0 3px rgba(201,168,76,0.12), 0 4px 12px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.25s',
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: 28 }}>
          <label style={{
            fontSize: 10, color: '#8899aa',
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
              border: `1.5px solid ${focus === 'parol' ? '#c9a84c' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 12,
              padding: '13px 16px',
              fontSize: 14,
              background: focus === 'parol' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#1a1a2e',
              fontFamily: 'inherit',
              boxShadow: focus === 'parol' ? '0 0 0 3px rgba(201,168,76,0.12), 0 4px 12px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.25s',
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
              ? 'rgba(201,168,76,0.4)'
              : 'linear-gradient(135deg, #c9a84c 0%, #FFD700 50%, #DAA520 100%)',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: 14,
            padding: '15px',
            fontSize: 14,
            cursor: yukl ? 'not-allowed' : 'pointer',
            fontWeight: 800,
            fontFamily: 'inherit',
            letterSpacing: 0.4,
            boxShadow: yukl
              ? 'none'
              : '0 8px 24px rgba(201,168,76,0.35), 0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.25s',
            opacity: yukl ? 0.7 : 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundSize: '200% auto',
            animation: yukl ? 'none' : 'login-shimmer 3s linear infinite',
          }}
        >
          {yukl
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(26,26,46,0.3)', borderTopColor: '#1a1a2e', borderRadius: '50%' }} className="alc-spin"/>
                Yuklanmoqda...
              </span>
            : rejim === 'kirish'
            ? 'Kirish'
            : "Ro'yxatdan o'tish"
          }
        </button>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
          margin: '20px 0',
        }}/>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#8899aa', fontWeight: 500 }}>
          {rejim === 'kirish' ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}{' '}
          <span
            onClick={() => { setRejim(r => r === 'kirish' ? 'royxat' : 'kirish'); setXato(''); }}
            style={{
              color: '#c9a84c', cursor: 'pointer', fontWeight: 700,
            }}
          >
            {rejim === 'kirish' ? "Ro'yxatdan o'tish" : 'Kirish'}
          </span>
        </div>
      </div>
    </div>
  );
}
