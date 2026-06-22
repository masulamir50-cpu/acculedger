import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// ═══════════════════════════════════════════════════════
// CursorGlow — kursor orqasidan ergashuvchi nozik gold yorug'lik
// Faqat desktop (innerWidth > 900). Raqamlarga xalaqit bermaydi.
// ═══════════════════════════════════════════════════════
export default function CursorGlow() {
  // Motion qiymatlari — spring bilan mayin ergashish
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  // Spring: yumshoq, kechikma bilan (premium his)
  const x = useSpring(mx, { stiffness: 180, damping: 28, mass: 0.6 });
  const y = useSpring(my, { stiffness: 180, damping: 28, mass: 0.6 });

  useEffect(() => {
    // Mobil/tablet'da umuman ishlamasin
    if (typeof window === 'undefined' || window.innerWidth < 900) return;

    const move = (e) => {
      mx.set(e.clientX - 250); // 500px glow markazi kursorga
      my.set(e.clientY - 250);
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my]);

  // SSR/mobil guard
  if (typeof window !== 'undefined' && window.innerWidth < 900) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        width: 500,
        height: 500,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1, // kontentdan past, fon ustida
        // Nozik gold + ko'k aralashma — raqamlarga xalaqit bermaydi
        background:
          'radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(59,130,246,0.03) 35%, transparent 65%)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
