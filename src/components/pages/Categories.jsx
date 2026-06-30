import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Badge } from '../../lib/shared.jsx';
import { fmtN, P } from '../../utils/format.js';
import { UNIT_TYPES, DEF_KAT } from '../../utils/constants.js';

// ─── Constants ────────────────────────────────────────────────
const EMOJIS = [
  '📦','📁','🏗','📎','🎁','✏️','💻','🧴','🔧','☕',
  '🦺','🛒','🌿','⚡','🔑','📊','💡','🚚','🎯','🔒',
  '🏠','🎵','🌟','💊','🎮','📱','🖥','⌚','🧲','🔬',
  '🥤','🍕','🥩','🐟','🧀','🍞','🥦','🛢','🎪','🧪',
];

const UNIT_META = {
  dona:  { em: '🔢', desc: 'Shtuka soni' },
  kg:    { em: '⚖️', desc: 'Og\'irlik (kg)' },
  gr:    { em: '🧪', desc: 'Og\'irlik (gr)' },
  L:     { em: '💧', desc: 'Hajm (litr)' },
  ml:    { em: '🧴', desc: 'Hajm (ml)' },
  metr:  { em: '📏', desc: 'Uzunlik (m)' },
  paket: { em: '📦', desc: 'Paket/to\'plam' },
  rulon: { em: '🎞️', desc: 'Rulon bo\'lak' },
  shish: { em: '🍶', desc: 'Shisha/quti' },
};

// ─── Helpers ──────────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

// ─── EmojiPicker ──────────────────────────────────────────────
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
          border: `1px solid ${open ? T.accent : T.border}`,
          borderRadius: T.rs, fontSize: 28, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .2s',
        }}
      >{value || '📦'}</button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', bottom: '110%', left: 0, right: 0,
              background: '#161d2e', border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 12,
              display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2,
              zIndex: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {EMOJIS.map(em => (
              <button key={em} type="button"
                onClick={() => { onSelect(em); setOpen(false); }}
                style={{
                  background: em === value ? 'rgba(201,168,76,0.2)' : 'transparent',
                  border: 'none', borderRadius: 8, padding: 8,
                  fontSize: 20, cursor: 'pointer',
                  transform: em === value ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all .15s',
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={ev => ev.currentTarget.style.background = em === value ? 'rgba(201,168,76,0.2)' : 'transparent'}
              >{em}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SizeChip (bouncy) ────────────────────────────────────────
function SizeChip({ label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      animate={selected
        ? { scale: [1, 1.18, 0.95, 1.06, 1], backgroundColor: T.accent }
        : { scale: 1, backgroundColor: 'rgba(255,255,255,0.05)' }
      }
      transition={selected
        ? { scale: { type: 'spring', stiffness: 500, damping: 18 }, backgroundColor: { duration: 0.15 } }
        : { duration: 0.2 }
      }
      style={{
        border: selected ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
        borderRadius: 20, padding: '7px 15px',
        fontSize: 13, fontWeight: selected ? 700 : 500,
        color: selected ? '#0a0c18' : T.text,
        cursor: 'pointer', outline: 'none',
        boxShadow: selected ? `0 0 12px ${T.accent}55` : 'none',
      }}
    >{label}</motion.button>
  );
}

// ─── UnitCard grid item ────────────────────────────────────────
function UnitCard({ unit, selected, onClick }) {
  const meta = UNIT_META[unit.id] || { em: '📦', desc: unit.label };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      style={{
        background: selected ? `rgba(201,168,76,0.12)` : 'rgba(255,255,255,0.03)',
        border: selected ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
        borderRadius: 14, padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'pointer', outline: 'none',
        boxShadow: selected ? `0 0 18px ${T.accent}40` : 'none',
        transition: 'background .2s, border .2s, box-shadow .2s',
      }}
    >
      <span style={{ fontSize: 26 }}>{meta.em}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? T.accent : T.text }}>{unit.id}</span>
      <span style={{ fontSize: 9, color: T.muted, textAlign: 'center', lineHeight: 1.3 }}>{meta.desc}</span>
    </motion.button>
  );
}

// ─── QuickBtn (flash on press) ────────────────────────────────
function QuickBtn({ label, color, onClick }) {
  const [flash, setFlash] = useState(false);
  const handle = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    onClick();
  };
  return (
    <motion.button
      type="button"
      onClick={handle}
      whileTap={{ scale: 0.82 }}
      style={{
        width: 32, height: 32, borderRadius: 10,
        border: `1px solid ${color}50`,
        background: flash ? `${color}35` : `${color}18`,
        color,
        fontSize: 17, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', outline: 'none',
        transition: 'background .2s',
      }}
    >{label}</motion.button>
  );
}

// ─── VariantRow ───────────────────────────────────────────────
function VariantRow({ kat, stock, onEdit, onDelete }) {
  const { quickTx } = useData();
  const pct = kat.limit > 0 ? Math.min(100, (stock / kat.limit) * 100) : null;
  const barColor = pct === null ? T.accent : pct < 25 ? T.danger : pct < 60 ? '#f59e0b' : '#22c55e';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '10px 12px',
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{kat.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {kat.nom}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 11, color: T.muted }}>{fmtN(stock)} {kat.birlik}</span>
          {pct !== null && (
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, maxWidth: 60 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width .4s' }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <QuickBtn label="−" color={T.danger} onClick={() => quickTx(kat.id, 'chiqim', 1)} />
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text, minWidth: 28, textAlign: 'center' }}>
          {fmtN(stock)}
        </span>
        <QuickBtn label="+" color="#22c55e" onClick={() => quickTx(kat.id, 'kirim', 1)} />
      </div>
      <button type="button" onClick={onEdit}
        style={{ background: 'none', border: 'none', color: T.muted, fontSize: 15, cursor: 'pointer', padding: '2px 4px' }}>✏️</button>
      <button type="button" onClick={onDelete}
        style={{ background: 'none', border: 'none', color: T.danger, fontSize: 13, cursor: 'pointer', padding: '2px 4px' }}>✕</button>
    </motion.div>
  );
}

// ─── AddProductForm (inline inside group) ────────────────────
function AddProductForm({ groupId, groupBirlik, groupIcon, onClose }) {
  const { variantlarQoshishToGroup } = useData();
  const [nom, setNom] = useState('');
  const [icon, setIcon] = useState(groupIcon || '📦');
  const [size, setSize] = useState('');
  const unitInfo = UNIT_TYPES.find(u => u.id === groupBirlik) || UNIT_TYPES[0];
  const varBirlik = unitInfo.presets ? 'dona' : groupBirlik;
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const submit = async () => {
    const name = nom.trim() || (size ? `${groupBirlik === 'L' || groupBirlik === 'ml' ? size + groupBirlik : size}` : '');
    if (!name) return;
    await variantlarQoshishToGroup(groupId, [{ nom: name, birlik: varBirlik, icon }]);
    setNom(''); setSize('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        background: 'rgba(201,168,76,0.06)',
        border: `1px dashed ${T.accent}60`,
        borderRadius: 12, padding: 12, marginBottom: 8,
      }}>
        <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          + Yangi variant
        </div>
        {unitInfo.presets && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {unitInfo.presets.map(p => (
              <SizeChip
                key={p} label={`${p}${groupBirlik}`}
                selected={size === String(p)}
                onClick={() => {
                  const s = String(p);
                  setSize(prev => prev === s ? '' : s);
                  if (!nom) setNom(`${p}${groupBirlik}`);
                  else if (nom.match(/^\d/)) setNom(`${p}${groupBirlik}`);
                }}
              />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <EmojiPicker value={icon} onSelect={setIcon} />
          <input
            ref={inputRef}
            value={nom}
            onChange={e => setNom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
            placeholder="Variant nomi…"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${T.border}`, borderRadius: 10,
              padding: '9px 12px', fontSize: 13, color: T.text, outline: 'none',
            }}
          />
          <button type="button" onClick={submit}
            style={{
              background: T.accent, color: '#0a0c18',
              border: 'none', borderRadius: 10, padding: '9px 14px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>✓</button>
          <button type="button" onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: T.muted, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── GroupCard ────────────────────────────────────────────────
function GroupCard({ group, children, invMap, onEditGroup, onDeleteGroup, onEditVariant, onDeleteVariant }) {
  const [expanded, setExpanded] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);

  const totalStock = children.reduce((s, k) => s + (invMap[k.id] || 0), 0);

  return (
    <motion.div
      layout
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 10%, #E8CC6A 22%, #C9A84C 35%, #B8943C 50%, #D4B554 65%, #C9A84C 78%, #A87830 90%, #C9A84C 100%)',
        border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 14,
        boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(201,168,76,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {/* Brushed metal texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)', pointerEvents: 'none' }}/>
      <div className="alc-card-shimmer"/>

      {/* Group header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 18px', cursor: 'pointer',
          borderBottom: expanded ? `1px solid rgba(0,0,0,0.15)` : 'none',
          position: 'relative', zIndex: 1,
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{
          width: 42, height: 42, borderRadius: 13,
          background: 'rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>{group.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{group.nom}</div>
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', marginTop: 2, fontWeight: 600, letterSpacing: 0.8 }}>
            {children.length} variant · {fmtN(totalStock)} {group.birlik}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {group.birlik}
          </span>
          <button type="button" onClick={e => { e.stopPropagation(); onEditGroup(group); }}
            style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.45)', fontSize: 15, cursor: 'pointer', padding: '4px 6px' }}>✏️</button>
          <button type="button" onClick={e => { e.stopPropagation(); onDeleteGroup(group.id); }}
            style={{ background: 'none', border: 'none', color: 'rgba(120,20,20,0.6)', fontSize: 13, cursor: 'pointer', padding: '4px 6px' }}>🗑</button>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: 'rgba(0,0,0,0.4)', fontSize: 11, display: 'block' }}
          >▼</motion.span>
        </div>
      </div>

      {/* Variants list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ overflow: 'hidden', padding: '10px 16px 8px', background: 'rgba(0,0,0,0.12)', position: 'relative', zIndex: 1 }}
          >
            <AnimatePresence>
              {addingProduct && (
                <AddProductForm
                  key="add-form"
                  groupId={group.id}
                  groupBirlik={group.birlik}
                  groupIcon={group.icon}
                  onClose={() => setAddingProduct(false)}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {children.map(k => (
                <VariantRow
                  key={k.id} kat={k}
                  stock={invMap[k.id] || 0}
                  onEdit={() => onEditVariant(k)}
                  onDelete={() => onDeleteVariant(k.id)}
                />
              ))}
            </AnimatePresence>

            {children.length === 0 && !addingProduct && (
              <div style={{ textAlign: 'center', color: T.muted, fontSize: 12, padding: '12px 0' }}>
                Hali variant qo'shilmagan
              </div>
            )}

            <button
              type="button"
              onClick={() => setAddingProduct(a => !a)}
              style={{
                width: '100%', padding: '9px',
                background: addingProduct ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)',
                border: `1px dashed ${addingProduct ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
                borderRadius: 10, color: addingProduct ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                marginTop: 4, marginBottom: 8,
                transition: 'all .2s',
              }}
            >
              {addingProduct ? '✕ Bekor qilish' : '+ Variant qo\'shish'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Standalone card (Platinum Amex style) ───────────────────
function StandaloneCard({ kat, stock, onEdit, onDelete }) {
  const { quickTx } = useData();
  const pct = kat.limit > 0 ? Math.min(100, (stock / kat.limit) * 100) : null;
  const warn = kat.min > 0 && stock <= kat.min;
  const barColor = pct === null ? '#C9A84C' : pct < 25 ? '#EF4444' : pct < 60 ? '#F59E0B' : '#10B981';
  const accentCol = kat.color || '#8A9AAA';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{
        position: 'relative', overflow: 'hidden',
        background: warn
          ? 'linear-gradient(145deg, #2a1010, #1a0808)'
          : 'linear-gradient(145deg, #1a2236, #111828)',
        border: warn ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* Brushed metal lines */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.02, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0.6) 3px)', pointerEvents: 'none' }}/>
      <div className="alc-card-shimmer"/>
      {/* Bottom accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentCol}80, transparent)` }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: `linear-gradient(135deg, ${accentCol}28, ${accentCol}10)`,
            border: `1px solid ${accentCol}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: `0 0 12px ${accentCol}18`,
          }}>{kat.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {kat.nom}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {kat.birlik}
            </div>
          </div>
        </div>
        {/* Stock count + quick buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: warn ? '#EF4444' : '#C9A84C', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5, textShadow: warn ? '0 0 16px rgba(239,68,68,0.3)' : '0 0 16px rgba(201,168,76,0.2)' }}>
              {fmtN(stock)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>
              {warn ? '⚠ Minimum' : 'Zaxira'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <QuickBtn label="−" color="#EF4444" onClick={() => quickTx(kat.id, 'chiqim', 1)}/>
            <QuickBtn label="+" color="#10B981" onClick={() => quickTx(kat.id, 'kirim', 1)}/>
          </div>
        </div>
        {/* Progress bar */}
        {pct !== null && (
          <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', background: barColor, borderRadius: 3, boxShadow: `0 0 8px ${barColor}60` }}
            />
          </div>
        )}
      </div>

      {/* Edit/delete row */}
      <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
        <button type="button" onClick={onEdit}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px', fontSize: 11, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontWeight: 600 }}>✏️ Tahrir</button>
        <button type="button" onClick={onDelete}
          style={{ flex: 1, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '7px', fontSize: 11, color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>🗑 O'chirish</button>
      </div>
    </motion.div>
  );
}

// ─── AddSheet Wizard ──────────────────────────────────────────
const STEPS = ['Asosiy', 'Birlik', 'Sozlamalar'];

function AddSheet({ onClose, editKat, onSave }) {
  const { katlar, setKatlar, katQoshish, variantlarQoshish, showXabar } = useData();
  const isMob = useIsMobile();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Step 1 state
  const [nom, setNom] = useState(editKat?.nom || '');
  const [icon, setIcon] = useState(editKat?.icon || '📦');
  const [isGroup, setIsGroup] = useState(editKat?.isGroup || false);

  // Step 2 state
  const [birlik, setBirlik] = useState(editKat?.birlik || 'dona');

  // Step 3 state
  const [limit, setLimit] = useState(String(editKat?.limit || ''));
  const [min, setMin] = useState(String(editKat?.min || ''));
  const [selSizes, setSelSizes] = useState([]);
  const [customSize, setCustomSize] = useState('');

  const unitInfo = UNIT_TYPES.find(u => u.id === birlik) || UNIT_TYPES[0];
  const hasPresets = !!unitInfo.presets;

  const goNext = () => { setDir(1); setStep(s => Math.min(s + 1, 2)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleDone = async () => {
    if (!nom.trim()) return;
    if (editKat) {
      const updated = { ...editKat, nom: nom.trim(), icon, birlik, limit: P(parseFloat(limit)||0), min: P(parseFloat(min)||0), isGroup };
      await setKatlar(katlar.map(k => k.id === updated.id ? updated : k));
      showXabar('Yangilandi!', 'muvaffaq');
      onClose();
      return;
    }
    if (isGroup && hasPresets && selSizes.length > 0) {
      const varBirlik = 'dona';
      const group = { id: `k${Date.now()}`, nom: nom.trim(), icon, birlik, limit: 0, min: 0, isGroup: true };
      const sizeList = [...selSizes];
      if (customSize) sizeList.push(customSize);
      const variants = sizeList.map((sz, i) => ({
        id: `k${Date.now()}_v${i}`,
        nom: `${sz}${birlik}`, icon,
        birlik: varBirlik, limit: 0, min: 0,
        isGroup: false, parentId: group.id,
      }));
      await variantlarQoshish([group, ...variants]);
    } else if (isGroup) {
      await katQoshish({ nom: nom.trim(), icon, birlik, limit: 0, min: 0, isGroup: true });
    } else {
      await katQoshish({ nom: nom.trim(), icon, birlik, limit: P(parseFloat(limit)||0), min: P(parseFloat(min)||0), isGroup: false });
    }
    onClose();
  };

  const toggleSize = (s) => {
    setSelSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: isMob ? 'flex-end' : 'center',
    justifyContent: 'center',
  };

  const sheetStyle = {
    width: isMob ? '100%' : '480px',
    maxHeight: isMob ? '92vh' : '86vh',
    background: 'linear-gradient(145deg, #1a2236 0%, #111828 60%, #192133 100%)',
    border: isMob ? 'none' : '1px solid rgba(255,255,255,0.07)',
    borderRadius: isMob ? '22px 22px 0 0' : 22,
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={overlayStyle}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={isMob ? { y: '100%' } : { scale: 0.92, opacity: 0 }}
        animate={isMob ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMob ? { y: '100%' } : { scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        style={sheetStyle}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(201,168,76,0.04)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>
              {editKat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              {STEPS[step]} · {step + 1}/{STEPS.length}
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 34, height: 34, color: T.muted, fontSize: 16, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            style={{ height: '100%', background: T.accent, transition: 'width .4s ease' }}
          />
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', minHeight: 0 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              style={{ padding: '20px 20px 8px', willChange: 'transform' }}
            >
              {/* STEP 0: Name + Icon + Group toggle */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                      Kategoriya nomi *
                    </label>
                    <input
                      autoFocus
                      value={nom}
                      onChange={e => setNom(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && nom.trim() && goNext()}
                      placeholder="Masalan: Ichimliklar, Elektronika…"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                        borderRadius: 12, padding: '13px 15px', fontSize: 14,
                        color: T.text, outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                      Icon
                    </label>
                    <EmojiPicker value={icon} onSelect={setIcon} />
                  </div>
                  <div
                    onClick={() => setIsGroup(g => !g)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: isGroup ? 'rgba(201,168,76,0.09)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isGroup ? T.accent + '60' : T.border}`,
                      borderRadius: 14, padding: '13px 16px', cursor: 'pointer',
                      transition: 'all .25s',
                    }}
                  >
                    <div style={{
                      width: 40, height: 24, borderRadius: 12, position: 'relative',
                      background: isGroup ? T.accent : 'rgba(255,255,255,0.12)',
                      transition: 'background .25s',
                    }}>
                      <motion.div
                        animate={{ x: isGroup ? 18 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                          position: 'absolute', top: 2, width: 20, height: 20,
                          borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isGroup ? T.accent : T.text }}>🗂 Guruh (variant bilan)</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Masalan: Coca-Cola 0.5L, 1L, 2L</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Unit type grid */}
              {step === 1 && (
                <div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>O'lchov turini tanlang:</div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                  }}>
                    {UNIT_TYPES.map(u => (
                      <UnitCard
                        key={u.id} unit={u}
                        selected={birlik === u.id}
                        onClick={() => setBirlik(u.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Sizes / Limits */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {isGroup && hasPresets && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                          Hajmlar (variantlar) tanlang
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {unitInfo.presets.map(p => (
                            <SizeChip
                              key={p}
                              label={`${p}${birlik}`}
                              selected={selSizes.includes(String(p))}
                              onClick={() => toggleSize(String(p))}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type={unitInfo.decimal ? 'number' : 'text'}
                          step={unitInfo.decimal ? '0.01' : undefined}
                          placeholder={`Boshqa hajm (masalan: 3${birlik})`}
                          value={customSize}
                          onChange={e => setCustomSize(e.target.value)}
                          style={{
                            flex: 1, background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${T.border}`, borderRadius: 10,
                            padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none',
                          }}
                        />
                        {customSize && (
                          <SizeChip label={`+${customSize}${birlik}`} selected={false} onClick={() => {}} />
                        )}
                      </div>
                    </>
                  )}

                  {!isGroup && (
                    <>
                      {unitInfo.decimal && (
                        <div style={{ fontSize: 11, color: T.accent, background: 'rgba(201,168,76,0.08)', borderRadius: 10, padding: '8px 12px' }}>
                          💡 {birlik} uchun kasr miqdorlar qo'llab-quvvatlanadi (0.01 qadamda)
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                            Limit ({birlik})
                          </label>
                          <input
                            type="number" step={unitInfo.decimal ? '0.01' : '1'} min="0"
                            value={limit}
                            onChange={e => setLimit(e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                              borderRadius: 10, padding: '11px 12px', fontSize: 13, color: T.text, outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                            Minimum ({birlik})
                          </label>
                          <input
                            type="number" step={unitInfo.decimal ? '0.01' : '1'} min="0"
                            value={min}
                            onChange={e => setMin(e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                              borderRadius: 10, padding: '11px 12px', fontSize: 13, color: T.text, outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isGroup && !hasPresets && (
                    <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, padding: '20px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
                      Guruh yaratiladi. Variantlarni keyin qo'sha olasiz.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div style={{
          padding: '14px 20px 20px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex', gap: 10,
          background: 'rgba(0,0,0,0.2)',
        }}>
          {step > 0 && (
            <button type="button" onClick={goPrev}
              style={{
                flex: 1, padding: '12px',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                borderRadius: 13, color: T.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>← Orqaga</button>
          )}
          {step < 2 ? (
            <button type="button" onClick={goNext}
              disabled={step === 0 && !nom.trim()}
              style={{
                flex: 2, padding: '12px',
                background: nom.trim() || step > 0
                  ? `linear-gradient(135deg, #d4a843, ${T.accent})`
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 13,
                color: nom.trim() || step > 0 ? '#0a0c18' : T.muted,
                fontSize: 14, fontWeight: 800, cursor: nom.trim() || step > 0 ? 'pointer' : 'default',
                transition: 'all .25s',
              }}>Keyingi →</button>
          ) : (
            <button type="button" onClick={handleDone}
              disabled={!nom.trim()}
              style={{
                flex: 2, padding: '12px',
                background: nom.trim()
                  ? `linear-gradient(135deg, #d4a843, ${T.accent})`
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 13,
                color: nom.trim() ? '#0a0c18' : T.muted,
                fontSize: 14, fontWeight: 800,
                cursor: nom.trim() ? 'pointer' : 'default',
                boxShadow: nom.trim() ? `0 6px 20px ${T.accent}55` : 'none',
                transition: 'all .25s',
              }}>
              {editKat ? '✓ Saqlash' : isGroup ? '🗂 Guruh qo\'shish' : '+ Qo\'shish'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── EditModal ────────────────────────────────────────────────
function EditModal({ kat, onClose }) {
  const { katlar, setKatlar, katOchir, showXabar } = useData();
  const [form, setForm] = useState({ ...kat });
  const isMob = useIsMobile();

  const save = async () => {
    const updated = { ...form, limit: P(parseFloat(form.limit)||0), min: P(parseFloat(form.min)||0) };
    await setKatlar(katlar.map(k => k.id === updated.id ? updated : k));
    showXabar('Yangilandi!', 'muvaffaq');
    onClose();
  };
  const del = async () => {
    if (!window.confirm(`"${kat.nom}" o'chirilsinmi?`)) return;
    await katOchir(kat.id);
    onClose();
  };

  const unitInfo = UNIT_TYPES.find(u => u.id === form.birlik) || UNIT_TYPES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: isMob ? 'flex-end' : 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={isMob ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        animate={isMob ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMob ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        style={{
          width: isMob ? '100%' : 400,
          background: 'linear-gradient(145deg, #1a2236 0%, #111828 60%, #192133 100%)',
          border: isMob ? 'none' : '1px solid rgba(255,255,255,0.07)',
          borderRadius: isMob ? '20px 20px 0 0' : 18,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✏️ Tahrirlash</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 64 }}><EmojiPicker value={form.icon} onSelect={v => setForm(f => ({...f, icon: v}))} /></div>
          <input
            value={form.nom}
            onChange={e => setForm(f => ({...f, nom: e.target.value}))}
            placeholder="Nom"
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, color: T.muted, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Birlik</label>
          <select value={form.birlik} onChange={e => setForm(f => ({...f, birlik: e.target.value}))}
            style={{ width: '100%', background: 'rgba(10,16,30,0.9)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none' }}>
            {UNIT_TYPES.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
        {!form.isGroup && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {['limit','min'].map(field => (
              <div key={field}>
                <label style={{ fontSize: 10, color: T.muted, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {field === 'limit' ? 'Limit' : 'Minimum'} ({form.birlik})
                </label>
                <input type="number" step={unitInfo.decimal ? '0.01' : '1'} min="0"
                  value={form[field]}
                  onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T.text, outline: 'none' }}
                />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={del}
            style={{ flex: 1, padding: '11px', background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.danger}44`, borderRadius: 12, color: T.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🗑 O'chirish
          </button>
          <button type="button" onClick={save}
            style={{ flex: 2, padding: '11px', background: `linear-gradient(135deg, #d4a843, ${T.accent})`, border: 'none', borderRadius: 12, color: '#0a0c18', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            ✓ Saqlash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Categories Page ─────────────────────────────────────
export default function Categories() {
  const { katlar, invXulosa, katOchir } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editKat, setEditKat] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('barchasi');
  const isMob = useIsMobile();

  const groups    = katlar.filter(k => k.isGroup);
  const childMap  = {};
  katlar.filter(k => k.parentId).forEach(k => {
    if (!childMap[k.parentId]) childMap[k.parentId] = [];
    childMap[k.parentId].push(k);
  });
  const standalones = katlar.filter(k => !k.isGroup && !k.parentId);

  const invMap = {};
  invXulosa.forEach(i => { invMap[i.id] = i.miqdor; });

  const q = search.toLowerCase().trim();
  const showGroups = catFilter === 'barchasi' || catFilter === 'guruhlar';
  const showStandalones = catFilter === 'barchasi' || catFilter === 'mahsulotlar';
  const ogohList = standalones.filter(k => k.min > 0 && (invMap[k.id] || 0) <= k.min);

  const visibleGroups = showGroups ? groups.filter(g =>
    !q || g.nom.toLowerCase().includes(q) ||
    (childMap[g.id] || []).some(k => k.nom.toLowerCase().includes(q))
  ) : [];
  const visibleStandalones = (catFilter === 'ogoh' ? ogohList : showStandalones ? standalones : []).filter(k =>
    !q || k.nom.toLowerCase().includes(q)
  );

  const stats = {
    jami: katlar.filter(k => !k.isGroup).length,
    ogoh: katlar.filter(k => !k.isGroup && k.min > 0 && (invMap[k.id] || 0) <= k.min).length,
    guruh: groups.length,
  };

  return (
    <div style={{ padding: isMob ? '16px 12px' : '20px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
            Portfolio
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#E2E8F0', letterSpacing: -0.5 }}>Kategoriyalar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {stats.jami} ta mahsulot · {stats.guruh} guruh
            {stats.ogoh > 0 && <span style={{ color: '#EF4444' }}> · ⚠️ {stats.ogoh} ta kam</span>}
          </div>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => { setEditKat(null); setShowAdd(true); }}
          style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 30%, #E8CC6A 55%, #C9A84C 75%, #A87830 100%)',
            color: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 50,
            padding: isMob ? '10px 18px' : '11px 24px',
            fontSize: isMob ? 12 : 13, fontWeight: 900, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            display: 'flex', alignItems: 'center', gap: 6,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          {!isMob && 'Yangi karta'}
        </motion.button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Qidirish…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 22, padding: '11px 14px 11px 38px',
            fontSize: 13, color: '#E2E8F0', outline: 'none',
          }}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 15 }}>✕</button>
        )}
      </div>

      {/* Pill filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 20, paddingBottom: 2 }}>
        {[
          { k: 'barchasi',   l: 'Barchasi',   ic: '📋' },
          { k: 'guruhlar',   l: 'Guruhlar',   ic: '🗂' },
          { k: 'mahsulotlar',l: 'Mahsulotlar',ic: '📦' },
          ...(stats.ogoh > 0 ? [{ k: 'ogoh', l: `Ogoh (${stats.ogoh})`, ic: '⚠️' }] : []),
        ].map(chip => {
          const isOn = catFilter === chip.k;
          return (
            <motion.button
              key={chip.k} type="button"
              onClick={() => setCatFilter(chip.k)}
              whileTap={{ scale: 0.92 }}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 50,
                border: isOn
                  ? `1.5px solid ${chip.k === 'ogoh' ? 'rgba(239,68,68,0.5)' : 'rgba(201,168,76,0.5)'}`
                  : '1px solid rgba(255,255,255,0.07)',
                background: isOn
                  ? (chip.k === 'ogoh' ? 'rgba(239,68,68,0.12)' : 'rgba(201,168,76,0.12)')
                  : 'rgba(255,255,255,0.025)',
                color: isOn
                  ? (chip.k === 'ogoh' ? '#EF4444' : '#C9A84C')
                  : 'rgba(255,255,255,0.4)',
                fontSize: 12, fontWeight: isOn ? 700 : 500,
                cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
                transition: 'all .2s',
                boxShadow: isOn ? `0 0 12px ${chip.k === 'ogoh' ? 'rgba(239,68,68,0.2)' : 'rgba(201,168,76,0.18)'}` : 'none',
              }}
            >
              <span style={{ fontSize: 14 }}>{chip.ic}</span>
              {chip.l}
            </motion.button>
          );
        })}
      </div>

      {/* Groups */}
      {visibleGroups.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            Guruhlar
          </div>
          <AnimatePresence mode="popLayout">
            {visibleGroups.map(g => (
              <GroupCard
                key={g.id} group={g}
                children={childMap[g.id] || []}
                invMap={invMap}
                onEditGroup={k => setEditKat(k)}
                onDeleteGroup={async id => {
                  if (window.confirm('Guruh va barcha variantlar o\'chirilsinmi?')) {
                    await katOchir(id);
                  }
                }}
                onEditVariant={k => setEditKat(k)}
                onDeleteVariant={async id => {
                  if (window.confirm('O\'chirilsinmi?')) await katOchir(id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Standalones */}
      {visibleStandalones.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            Mahsulotlar
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMob ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 10,
          }}>
            <AnimatePresence mode="popLayout">
              {visibleStandalones.map(k => (
                <StandaloneCard
                  key={k.id} kat={k}
                  stock={invMap[k.id] || 0}
                  onEdit={() => setEditKat(k)}
                  onDelete={async () => {
                    if (window.confirm(`"${k.nom}" o'chirilsinmi?`)) await katOchir(k.id);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {visibleGroups.length === 0 && visibleStandalones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
            {search ? 'Natija topilmadi' : 'Hali kategoriya yo\'q'}
          </div>
          <div style={{ fontSize: 13 }}>
            {search ? `"${search}" bo'yicha hech narsa topilmadi` : 'Birinchi kategoriyangizni qo\'shing'}
          </div>
          {!search && (
            <button type="button" onClick={() => setShowAdd(true)}
              style={{
                marginTop: 20, padding: '11px 24px',
                background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 30%, #E8CC6A 55%, #C9A84C 75%, #A87830 100%)',
                border: 'none', borderRadius: 50, color: 'rgba(0,0,0,0.75)',
                fontSize: 13, fontWeight: 900, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>+ Qo'shish</button>
          )}
        </div>
      )}

      {/* Wizard / AddSheet */}
      <AnimatePresence>
        {showAdd && (
          <AddSheet key="add-sheet" onClose={() => setShowAdd(false)} />
        )}
        {editKat && (
          <EditModal key="edit-modal" kat={editKat} onClose={() => setEditKat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
