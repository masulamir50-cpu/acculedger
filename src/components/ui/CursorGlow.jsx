import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { damping: 25, stiffness: 150 });
  const springY = useSpring(y, { damping: 25, stiffness: 150 });

  useEffect(() => {
    if (window.innerWidth <= 900) return;
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  if (typeof window !== 'undefined' && window.innerWidth <= 900) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: -150,
        left: -150,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9999,
        x: springX,
        y: springY,
      }}
    />
  );
}
