import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Inp, Badge, Prog, Ico } from '../../lib/shared.jsx';
import { fmtN, P, PCT, cl } from '../../utils/format.js';

const EMOJIS = [
  '📦','📁','🏗','📎','🎁','✏️','💻','🧴','🔧','☕',
  '🦺','🛒','🌿','⚡','🔑','📊','💡','🚚','🎯','🔒',
  '🏠','🎵','🌟','💊','🎮','📱','🖥','⌚','🧲','🔬',
];

// ─── Emoji picker ─────────────────────────────────────────
function EmojiPicker({ value, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 56,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${T.border}`,
          borderRadius: T.rs,
          fontSize: 28, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >{value || '📦'}</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: '#1a2030',
          border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 12,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
          zIndex: 200, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}>
          {EMOJIS.map(em => (
            <button key={em} type="button"
              onClick={() => { onSelect(em); setOpen(false); }}
              style={{ background: 'transparent', border: 'none', borderRadius: 8, padding: 8, fontSize: 22, cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
            >{em}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bottom sheet (mobile add form) ──────────────────────
function AddSheet({ onClose, yangiK, setYangiK, katQoshish }) {
  const inp = {
    width: '100%', height: 56,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${T.border}`,
    borderRadius: T.rs,
    padding: '0 16px',
    fontSize: 16, color: T.text,
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    fontSize: 11, color: T.muted, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'block',
  };

  const handleAdd = () => { katQoshish(); onClose(); };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: T.card,
          borderRadius: '24px 24px 0 0',
          border: `1px solid ${T.border}`, borderBottom: 'none',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.6)',
          maxHeight: '90vh', overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }}/>
        </div>
        {/* Header */}
        <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>Yangi kategoriya</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 18 }}>✕</button>
        </div>
        {/* Fields */}
        <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Belgi (Emoji)</label>
            <EmojiPicker value={yangiK.icon} onSelect={icon => setYangiK(f => ({ ...f, icon }))} />
          </div>
          <div>
            <label style={lbl}>Nomi</label>
            <input autoFocus type="text" value={yangiK.nom || ''} onChange={e => setYangiK(f => ({ ...f, nom: e.target.value }))} placeholder="Masalan: Xom ashyo" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Birlik</label>
              <input type="text" value={yangiK.birlik || ''} onChange={e => setYangiK(f => ({ ...f, birlik: e.target.value }))} placeholder="dona, kg…" style={inp} />
            </div>
            <div>
              <label style={lbl}>Limit</label>
              <input type="number" value={yangiK.limit || ''} onChange={e => setYangiK(f => ({ ...f, limit: e.target.value }))} placeholder="100" style={inp} />
            </div>
          </div>
          <div>
            <label style={lbl}>Minimum</label>
            <input type="number" value={yangiK.min || ''} onChange={e => setYangiK(f => ({ ...f, min: e.target.value }))} placeholder="10" style={inp} />
          </div>
          <button onClick={handleAdd} style={{ height: 56, width: '100%', background: T.gradAccent, color: '#0a0c18', border: '1px solid rgba(201,168,76,0.3)', borderRadius: T.rs, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(201,168,76,0.3)', marginTop: 4 }}>
            {Ico.plus} Qo'shish
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 16 }}
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 88, height: 88, borderRadius: 28, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}
      >🗂</motion.div>
      <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>Kategoriyalar yo'q</div>
      <div style={{ fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>
        Birinchi kategoriyangizni qo'shing va inventarni tashkillashtiring
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ marginTop: 8, height: 52, padding: '0 28px', background: T.gradAccent, color: '#0a0c18', border: 'none', borderRadius: T.rs, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
          {Ico.plus} Kategoriya qo'shish
        </button>
      )}
    </motion.div>
  );
}

// ─── Desktop card (grid) ──────────────────────────────────
function DesktopCard({ kat, e, o, k, pct, onEdit, onDelete, index }) {
  const sc = o ? T.danger : k ? T.warn : T.cyan;
  const sb = o ? 'rgba(239,68,68,0.06)' : k ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.04)';
  const sd = o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
      className="alc-card-hover"
      style={{ background: sb, borderRadius: 14, border: `1px solid ${sd}`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${sc}, transparent)`, opacity: 0.7 }}/>
      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${sc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${sc}28`, flexShrink: 0 }}>{kat.icon}</div>
          <Badge oshgan={o} kamaygan={k} val="OK" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.3, letterSpacing: -0.1 }}>{kat.nom}</div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Zaxira</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.text, lineHeight: 1 }}>{fmtN(e.miqdor)}</span>
            <span style={{ fontSize: 11, color: T.muted }}>{kat.birlik}</span>
          </div>
          {kat.limit > 0 && (
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
              Limit: <strong style={{ color: T.accent }}>{fmtN(kat.limit)}</strong>
              {' · '}<span style={{ color: T.cyan }}>{pct}%</span>
            </div>
          )}
        </div>
        {kat.limit > 0 && <Prog pct={pct} oshgan={o} kamaygan={k} />}
        <div style={{ fontSize: 10, color: T.muted, display: 'flex', justifyContent: 'space-between' }}>
          <span>Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)}</strong></span>
          <span style={{ color: T.cyan }}>{e.tranzaksiyalar.length} tx</span>
        </div>
        {o && <div style={{ fontSize: 10, color: T.danger, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.15)' }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} ortiqcha</div>}
        {k && <div style={{ fontSize: 10, color: T.warn, fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.15)' }}>⬇ {fmtN(P(kat.min - e.miqdor))} kerak</div>}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onEdit}
          style={{ flex: 1, padding: '9px', background: 'transparent', color: T.accent, border: 'none', borderRight: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'background 0.15s' }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >{Ico.edit} <span>Tahrir</span></button>
        <button onClick={onDelete}
          style={{ flex: 1, padding: '9px', background: 'transparent', color: T.danger, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'background 0.15s' }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >{Ico.del} <span>O'chir</span></button>
      </div>
    </motion.div>
  );
}

// ─── Mobile card (swipeable full-width) ───────────────────
function MobileCard({ kat, e, o, k, pct, onEdit, onDelete, index }) {
  const x = useMotionValue(0);
  const [swiped, setSwiped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showCtx, setShowCtx] = useState(false);
  const longPressTimer = useRef(null);

  const sc = o ? T.danger : k ? T.warn : T.cyan;
  const sb = o ? 'rgba(239,68,68,0.06)' : k ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.04)';
  const sd = o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)';

  const snap = (target) => {
    animate(x, target, { type: 'spring', stiffness: 500, damping: 40 });
    setSwiped(target < 0);
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => setShowCtx(true), 600);
  };
  const handleLongPressEnd = () => clearTimeout(longPressTimer.current);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
      style={{ position: 'relative', borderRadius: 14 }}
    >
      {/* Swipe-revealed action strip */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, display: 'flex', borderRadius: '0 14px 14px 0', overflow: 'hidden' }}>
        <button onClick={() => { snap(0); onEdit(); }}
          style={{ flex: 1, background: 'rgba(201,168,76,0.18)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: T.accent, fontSize: 10, fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.04)' }}
        >{Ico.edit}<span>Tahrir</span></button>
        <button onClick={() => { snap(0); onDelete(); }}
          style={{ flex: 1, background: 'rgba(239,68,68,0.18)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: T.danger, fontSize: 10, fontWeight: 700 }}
        >{Ico.del}<span>O'chir</span></button>
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.15 }}
        style={{ x, background: sb, border: `1px solid ${sd}`, borderRadius: 14, position: 'relative', zIndex: 1, touchAction: 'pan-y' }}
        onDragEnd={(_, info) => snap(info.offset.x < -50 ? -100 : 0)}
        whileTap={{ scale: 0.985 }}
        onClick={() => swiped ? snap(0) : setExpanded(ex => !ex)}
        onPointerDown={handleLongPressStart}
        onPointerUp={handleLongPressEnd}
        onPointerLeave={handleLongPressEnd}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${sc}, transparent)`, opacity: 0.7, borderRadius: '14px 14px 0 0' }}/>

        {/* Summary row */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 14, background: `${sc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: `1px solid ${sc}28` }}>
            {kat.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{kat.nom}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1 }}>{fmtN(e.miqdor)}</span>
              <span style={{ fontSize: 12, color: T.muted }}>{kat.birlik}</span>
            </div>
            {kat.limit > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div className="alc-progress-fill" style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: o ? '#ef4444' : k ? '#f59e0b' : `linear-gradient(90deg, ${T.cyan}, #7c3aed)`, borderRadius: 99 }}/>
                </div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{pct}% · limit: {fmtN(kat.limit)}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <Badge oshgan={o} kamaygan={k} val="OK" />
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} style={{ fontSize: 9, color: T.muted }}>▼</motion.div>
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 14 }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Min</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.warn }}>{fmtN(kat.min)}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{kat.birlik}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Tranzaksiya</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.cyan }}>{e.tranzaksiyalar.length}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>bu oy</div>
                  </div>
                </div>
                {o && <div style={{ fontSize: 12, color: T.danger, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)', marginBottom: 8 }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} ortiqcha</div>}
                {k && <div style={{ fontSize: 12, color: T.warn, fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)', marginBottom: 8 }}>⬇ {fmtN(P(kat.min - e.miqdor))} kerak</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={ev => { ev.stopPropagation(); onEdit(); }}
                    style={{ flex: 1, height: 48, background: 'rgba(201,168,76,0.09)', color: T.accent, border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
                  >{Ico.edit} Tahrirlash</button>
                  <button onClick={ev => { ev.stopPropagation(); onDelete(); }}
                    style={{ flex: 1, height: 48, background: 'rgba(239,68,68,0.09)', color: T.danger, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
                  >{Ico.del} O'chirish</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Long-press context menu */}
      <AnimatePresence>
        {showCtx && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCtx(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 400 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{ position: 'absolute', top: 16, right: 12, zIndex: 401, background: '#1a2030', borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', overflow: 'hidden', minWidth: 180 }}
            >
              <button onClick={() => { setShowCtx(false); onEdit(); }}
                style={{ width: '100%', padding: '15px 18px', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, color: T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}
              >{Ico.edit} Tahrirlash</button>
              <button onClick={() => { setShowCtx(false); onDelete(); }}
                style={{ width: '100%', padding: '15px 18px', background: 'transparent', border: 'none', color: T.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}
              >{Ico.del} O'chirish</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function Categories() {
  const {
    isMobile, sm, sy, katlar, yangiK, setYangiK,
    tahrirK, setTahrirK, getCEntry, katQoshish, katOchir, setModal,
  } = useData();
  const [showSheet, setShowSheet] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

      {/* Desktop: inline add form */}
      {!isMobile && (
        <Card>
          <H2>➕ Yangi kategoriya qo'shish</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: 8, alignItems: 'end' }}>
            {[
              ['Nomi',    'nom',    'text',   '📁 Nomi'],
              ['Birlik',  'birlik', 'text',   'dona, kg…'],
              ['Limit',   'limit',  'number', '100'],
              ['Minimum', 'min',    'number', '10'],
              ['Belgi',   'icon',   'text',   '📦'],
            ].map(([l, k, t, ph]) => (
              <Inp key={k} label={l} type={t} value={yangiK[k] || ''} onChange={e => setYangiK(f => ({ ...f, [k]: e.target.value }))} placeholder={ph} />
            ))}
            <Btn onClick={katQoshish} style={{ justifyContent: 'center', marginBottom: 14, whiteSpace: 'nowrap' }}>
              {Ico.plus} Qo'shish
            </Btn>
          </div>
        </Card>
      )}

      {/* Category list */}
      <Card style={{ overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <H2 style={{ marginBottom: 0 }}>🗂 Barcha kategoriyalar</H2>
          <div style={{ fontSize: 12, fontWeight: 700, background: T.cyanBg, color: T.cyan, padding: '4px 12px', borderRadius: 20, border: `1px solid ${T.cyanBdr}` }}>{katlar.length} ta</div>
        </div>

        {katlar.length === 0 ? (
          <EmptyState onAdd={isMobile ? () => setShowSheet(true) : undefined} />
        ) : (
          <div className={isMobile ? 'alc-kat-list' : 'alc-kat-grid'}>
            {katlar.map((kat, idx) => {
              const entry = getCEntry(sm, sy, kat.id);
              const o = kat.limit > 0 && P(entry.miqdor) > P(kat.limit);
              const k = kat.min > 0 && P(entry.miqdor) < P(kat.min);
              const pct = kat.limit > 0 ? cl(PCT(entry.miqdor, kat.limit), 0, 999) : 0;
              const handlers = {
                onEdit:   () => { setTahrirK({ ...kat }); setModal({ type: 'katTahrirla' }); },
                onDelete: () => katOchir(kat.id),
              };
              return isMobile
                ? <MobileCard key={kat.id} kat={kat} e={entry} o={o} k={k} pct={pct} index={idx} {...handlers} />
                : <DesktopCard key={kat.id} kat={kat} e={entry} o={o} k={k} pct={pct} index={idx} {...handlers} />;
            })}
          </div>
        )}
      </Card>

      {/* Mobile swipe hint */}
      {isMobile && katlar.length > 0 && (
        <div style={{ fontSize: 11, color: T.muted, textAlign: 'center', opacity: 0.5, paddingBottom: 80 }}>
          ← chapga suring · bosib turing: menyu
        </div>
      )}

      {/* FAB */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSheet(true)}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            right: 20, zIndex: 100,
            width: 56, height: 56, borderRadius: '50%',
            background: T.gradAccent,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(201,168,76,0.45), 0 2px 8px rgba(0,0,0,0.5)',
            color: '#0a0c18',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </motion.button>
      )}

      {/* Bottom sheet */}
      <AnimatePresence>
        {showSheet && (
          <AddSheet
            onClose={() => setShowSheet(false)}
            yangiK={yangiK}
            setYangiK={setYangiK}
            katQoshish={katQoshish}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
