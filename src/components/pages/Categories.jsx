import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Badge, Ico } from '../../lib/shared.jsx';
import { fmtN, P, PCT, cl } from '../../utils/format.js';
import { UNIT_TYPES, DEF_KAT } from '../../utils/constants.js';

const EMOJIS = [
  '📦','📁','🏗','📎','🎁','✏️','💻','🧴','🔧','☕',
  '🦺','🛒','🌿','⚡','🔑','📊','💡','🚚','🎯','🔒',
  '🏠','🎵','🌟','💊','🎮','📱','🖥','⌚','🧲','🔬',
  '🥤','🍕','🥩','🐟','🧀','🍞','🥦','🛢','🎪','🧪',
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
          background: '#1a2030', border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 12,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
          zIndex: 210, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}>
          {EMOJIS.map(em => (
            <button key={em} type="button"
              onClick={() => { onSelect(em); setOpen(false); }}
              style={{ background: 'transparent', border: 'none', borderRadius: 8, padding: 8, fontSize: 22, cursor: 'pointer' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
            >{em}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Unit type dropdown ───────────────────────────────────
function UnitSelect({ value, onChange, height = 56 }) {
  return (
    <select
      value={value || 'dona'}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', height,
        background: 'rgba(10,16,30,0.9)',
        border: `1px solid ${T.border}`,
        borderRadius: T.rs,
        padding: '0 14px', fontSize: 14, color: T.text,
        outline: 'none', boxSizing: 'border-box',
      }}
    >
      {UNIT_TYPES.map(u => (
        <option key={u.id} value={u.id}>{u.label}</option>
      ))}
    </select>
  );
}

// ─── Add / Group sheet (mobile = bottom, desktop = modal) ─
function AddSheet({ onClose }) {
  const { isMobile, yangiK, setYangiK, katQoshish, variantlarQoshish } = useData();

  const [isGroup,    setIsGroup]    = useState(false);
  const [variants,   setVariants]   = useState([]);
  const [prodNom,    setProdNom]    = useState('');
  const [selSizes,   setSelSizes]   = useState([]);
  const [customSize, setCustomSize] = useState('');

  const unitInfo = UNIT_TYPES.find(u => u.id === (yangiK.birlik || 'dona')) || UNIT_TYPES[0];

  const toggleSize = s =>
    setSelSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addProductVariants = () => {
    const name = prodNom.trim();
    if (!name) return;
    const allSizes = [...selSizes];
    if (customSize.trim() && !isNaN(parseFloat(customSize))) allSizes.push(parseFloat(customSize));
    const toAdd = allSizes.length > 0
      ? allSizes.map(s => ({ nom: `${name} ${s}${unitInfo.id}`, birlik: unitInfo.id }))
      : [{ nom: name, birlik: unitInfo.id }];
    setVariants(prev => [...prev, ...toAdd]);
    setProdNom(''); setSelSizes([]); setCustomSize('');
  };

  const handleAdd = async () => {
    if (!yangiK.nom.trim()) return;
    if (isGroup) {
      if (variants.length === 0) return;
      const ts = Date.now();
      const groupId = `k${ts}`;
      await variantlarQoshish([
        { id: groupId, nom: yangiK.nom.trim(), birlik: unitInfo.id, limit: 0, min: 0, icon: yangiK.icon || '📦', isGroup: true },
        ...variants.map((v, i) => ({
          id: `k${ts}_v${i + 1}`, nom: v.nom, birlik: v.birlik,
          limit: 0, min: 0, icon: yangiK.icon || '📦',
          parentId: groupId, isGroup: false,
        })),
      ]);
      setYangiK(DEF_KAT);
    } else {
      await katQoshish();
    }
    onClose();
  };

  const inp = {
    width: '100%', height: 52,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${T.border}`, borderRadius: T.rs,
    padding: '0 16px', fontSize: 15, color: T.text,
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    fontSize: 11, color: T.muted, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8, display: 'block',
  };

  const submitDisabled = isGroup && variants.length === 0;

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Icon + Name */}
      <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'start' }}>
        <div>
          <label style={lbl}>Belgi</label>
          <EmojiPicker value={yangiK.icon} onSelect={icon => setYangiK(f => ({ ...f, icon }))} />
        </div>
        <div>
          <label style={lbl}>Nomi</label>
          <input autoFocus type="text" value={yangiK.nom || ''} onChange={e => setYangiK(f => ({ ...f, nom: e.target.value }))} placeholder="Masalan: Ichimliklar" style={inp} />
        </div>
      </div>

      {/* Unit type */}
      <div>
        <label style={lbl}>O'lchov birligi</label>
        <UnitSelect value={yangiK.birlik || 'dona'} onChange={v => { setYangiK(f => ({ ...f, birlik: v })); setSelSizes([]); }} />
      </div>

      {/* Group toggle */}
      <div
        onClick={() => setIsGroup(g => !g)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: T.rs, cursor: 'pointer',
          background: isGroup ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isGroup ? T.accentBdr : T.border}`,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: isGroup ? T.accent : T.text }}>Guruh sifatida</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Bir nechta variant bo'lsa (hajm, o'lcham)</div>
        </div>
        <div style={{
          width: 42, height: 24, borderRadius: 12, flexShrink: 0,
          background: isGroup ? T.accent : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: isGroup ? 20 : 2,
            width: 20, height: 20, borderRadius: '50%',
            background: isGroup ? '#0a0c18' : 'rgba(255,255,255,0.6)',
            transition: 'left 0.2s',
          }}/>
        </div>
      </div>

      {/* Non-group: limit + min */}
      {!isGroup && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Limit</label>
            <input type="number" value={yangiK.limit || ''} onChange={e => setYangiK(f => ({ ...f, limit: e.target.value }))} placeholder="100" style={inp} />
          </div>
          <div>
            <label style={lbl}>Minimum</label>
            <input type="number" value={yangiK.min || ''} onChange={e => setYangiK(f => ({ ...f, min: e.target.value }))} placeholder="10" style={inp} />
          </div>
        </div>
      )}

      {/* Group: variant builder */}
      {isGroup && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          padding: '14px 14px', background: 'rgba(255,255,255,0.02)',
          borderRadius: T.rs, border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Variantlar qo'shish
          </div>

          {/* Product name */}
          <input
            type="text"
            value={prodNom}
            onChange={e => setProdNom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addProductVariants()}
            placeholder={`Mahsulot nomi (Coca-Cola, Pepsi…)`}
            style={{ ...inp, height: 44, fontSize: 14 }}
          />

          {/* Preset size chips */}
          {unitInfo.presets && (
            <div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Hajm tanlang
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {unitInfo.presets.map(s => {
                  const on = selSizes.includes(s);
                  return (
                    <button
                      key={s} type="button" onClick={() => toggleSize(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 10,
                        border: `1px solid ${on ? T.accent : T.border}`,
                        background: on ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                        color: on ? T.accent : T.text,
                        fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer',
                      }}
                    >{s}{unitInfo.id}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom size (for decimal units) */}
          {unitInfo.decimal && (
            <input
              type="number"
              step="0.1"
              value={customSize}
              onChange={e => setCustomSize(e.target.value)}
              placeholder={`Boshqa hajm (${unitInfo.id})…`}
              style={{ ...inp, height: 40, fontSize: 13 }}
            />
          )}

          {/* Add product button */}
          <button
            type="button"
            onClick={addProductVariants}
            disabled={!prodNom.trim()}
            style={{
              height: 40, padding: '0 16px',
              background: prodNom.trim() ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${prodNom.trim() ? T.cyanBdr : T.border}`,
              borderRadius: T.rs, color: prodNom.trim() ? T.cyan : T.muted,
              fontSize: 13, fontWeight: 700, cursor: prodNom.trim() ? 'pointer' : 'default',
            }}
          >+ Mahsulot qo'shish</button>

          {/* Pending variants */}
          {variants.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Qo'shiladigan variantlar ({variants.length})
              </div>
              {variants.map((v, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
                }}>
                  <span style={{ fontSize: 13, color: T.text }}>{yangiK.icon || '📦'} {v.nom}</span>
                  <button
                    type="button"
                    onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'transparent', border: 'none', color: T.danger, cursor: 'pointer', fontSize: 18, fontWeight: 700, padding: '0 4px', lineHeight: 1 }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleAdd}
        disabled={submitDisabled}
        style={{
          height: 56, width: '100%',
          background: submitDisabled ? 'rgba(255,255,255,0.06)' : T.gradAccent,
          color: submitDisabled ? T.muted : '#0a0c18',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: T.rs, fontSize: 16, fontWeight: 800,
          cursor: submitDisabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: submitDisabled ? 'none' : '0 4px 20px rgba(201,168,76,0.35)',
          letterSpacing: 0.2,
        }}
      >
        {Ico.plus}
        {isGroup
          ? variants.length > 0 ? `Guruh + ${variants.length} variant yaratish` : "Avval variantlar qo'shish"
          : "Qo'shish"}
      </button>
    </div>
  );

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.3 }}>
        {isGroup ? '🗂 Yangi guruh' : '➕ Yangi kategoriya'}
      </div>
      <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 18 }}>✕</button>
    </div>
  );

  if (isMobile) {
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
            background: T.card, borderRadius: '24px 24px 0 0',
            border: `1px solid ${T.border}`, borderBottom: 'none',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.6)',
            maxHeight: '92vh', overflowY: 'auto',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, paddingBottom: 8 }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }}/>
          </div>
          <div style={{ padding: '0 20px 8px' }}>{header}</div>
          <div style={{ padding: '0 20px 16px' }}>{body}</div>
        </motion.div>
      </>
    );
  }

  // Desktop: centered modal
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: T.card, borderRadius: T.rxx,
          border: `1px solid ${T.border}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '24px 24px 28px',
        }}
      >
        {header}
        {body}
      </motion.div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', gap: 16 }}
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

// ─── Progress bar ─────────────────────────────────────────
function ProgBar({ pct, o, k }) {
  const bg = o ? '#ef4444' : k ? '#f59e0b' : `linear-gradient(90deg, ${T.cyan}, #7c3aed)`;
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
      <div
        className="alc-progress-fill"
        style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: bg, borderRadius: 99,
          boxShadow: o ? '0 0 6px rgba(239,68,68,0.5)' : k ? '0 0 6px rgba(245,158,11,0.4)' : '0 0 6px rgba(59,130,246,0.4)',
        }}
      />
    </div>
  );
}

// ─── Desktop card ─────────────────────────────────────────
function DesktopCard({ kat, e, o, k, pct, onEdit, onDelete, index }) {
  const sc = o ? T.danger : k ? T.warn : T.cyan;
  const sb = o ? 'rgba(239,68,68,0.06)' : k ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.04)';
  const sd = o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
      className="alc-card-hover"
      style={{ background: sb, borderRadius: 14, border: `1px solid ${sd}`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${sc}, transparent)`, opacity: 0.7 }}/>
      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${sc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${sc}28`, flexShrink: 0 }}>{kat.icon}</div>
          <Badge oshgan={o} kamaygan={k} val="OK" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{kat.nom}</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1 }}>{fmtN(e.miqdor)}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>{kat.birlik}</span>
          </div>
          {kat.limit > 0 && (
            <>
              <ProgBar pct={pct} o={o} k={k} />
              <div style={{ fontSize: 10, color: T.muted, marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
                <span>Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)} {kat.birlik}</strong></span>
                <span>Limit: <strong style={{ color: T.accent }}>{fmtN(kat.limit)}</strong> · <span style={{ color: T.cyan }}>{pct}%</span></span>
              </div>
            </>
          )}
        </div>
        <div style={{ fontSize: 10, color: T.muted }}>
          {e.tranzaksiyalar.length} ta tranzaksiya
        </div>
        {o && <div style={{ fontSize: 10, color: T.danger, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.15)' }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} ortiqcha</div>}
        {k && <div style={{ fontSize: 10, color: T.warn, fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.15)' }}>⬇ {fmtN(P(kat.min - e.miqdor))} kerak</div>}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onEdit}
          style={{ flex: 1, padding: '10px', background: 'transparent', color: T.accent, border: 'none', borderRight: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'background 0.15s', minHeight: 40 }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >{Ico.edit} <span>Tahrir</span></button>
        <button onClick={onDelete}
          style={{ flex: 1, padding: '10px', background: 'transparent', color: T.danger, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'background 0.15s', minHeight: 40 }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >{Ico.del} <span>O'chir</span></button>
      </div>
    </motion.div>
  );
}

// ─── Mobile swipe card ────────────────────────────────────
function MobileCard({ kat, e, o, k, pct, onEdit, onDelete, onKirim, onChiqim, onHistory, index }) {
  const x = useMotionValue(0);
  const [swipeDir, setSwipeDir] = useState('none');
  const [expanded, setExpanded] = useState(false);
  const [showCtx, setShowCtx] = useState(false);
  const longPressTimer = { current: null };

  const sc = o ? T.danger : k ? T.warn : T.cyan;
  const sb = o ? 'rgba(239,68,68,0.06)' : k ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.04)';
  const sd = o ? T.dangerBdr : k ? T.warnBdr : 'rgba(255,255,255,0.07)';

  const snap = (target) => {
    animate(x, target, { type: 'spring', stiffness: 500, damping: 40 });
    setSwipeDir(target > 0 ? 'right' : target < 0 ? 'left' : 'none');
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 52) snap(80);
    else if (info.offset.x < -52) snap(-80);
    else snap(0);
  };

  const handleCardClick = () => {
    if (swipeDir !== 'none') { snap(0); return; }
    setExpanded(ex => !ex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 380, damping: 30 }}
      style={{ position: 'relative', borderRadius: 16 }}
    >
      {/* Kirim strip */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, display: 'flex', borderRadius: '16px 0 0 16px', overflow: 'hidden' }}>
        <button onClick={() => { snap(0); onKirim(); }} style={{ flex: 1, background: 'rgba(34,197,94,0.18)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#22c55e', fontSize: 10, fontWeight: 800 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span>Kirim</span>
        </button>
      </div>

      {/* Chiqim strip */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, display: 'flex', borderRadius: '0 16px 16px 0', overflow: 'hidden' }}>
        <button onClick={() => { snap(0); onChiqim(); }} style={{ flex: 1, background: 'rgba(239,68,68,0.18)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: T.danger, fontSize: 10, fontWeight: 800 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>
          <span>Chiqim</span>
        </button>
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={{ left: 0.06, right: 0.06 }}
        style={{ x, background: sb, border: `1px solid ${sd}`, borderRadius: 16, position: 'relative', zIndex: 1, touchAction: 'pan-y' }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        onPointerDown={() => { longPressTimer.current = setTimeout(() => setShowCtx(true), 600); }}
        onPointerUp={() => clearTimeout(longPressTimer.current)}
        onPointerLeave={() => clearTimeout(longPressTimer.current)}
        onPointerCancel={() => clearTimeout(longPressTimer.current)}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${sc}, transparent)`, opacity: 0.75, borderRadius: '16px 16px 0 0' }}/>

        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: `${sc}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${sc}30` }}>{kat.icon}</div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4, letterSpacing: -0.2 }}>{kat.nom}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: kat.limit > 0 ? 8 : 0 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: -0.5 }}>{fmtN(e.miqdor)}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{kat.birlik}</span>
            </div>
            {kat.limit > 0 && (
              <div>
                <ProgBar pct={pct} o={o} k={k} />
                <div style={{ fontSize: 11, color: T.muted, marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Min: <strong style={{ color: T.warn }}>{fmtN(kat.min)} {kat.birlik}</strong></span>
                  <span>Limit: <strong style={{ color: T.accent }}>{fmtN(kat.limit)}</strong> · <span style={{ color: pct > 100 ? T.danger : T.cyan }}>{pct}%</span></span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <Badge oshgan={o} kamaygan={k} val="OK" />
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </motion.div>
          </div>
        </div>

        {(o || k) && !expanded && (
          <div style={{ padding: '0 16px 12px' }}>
            {o && <div style={{ fontSize: 11, color: T.danger, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.18)' }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} {kat.birlik} ortiqcha</div>}
            {k && <div style={{ fontSize: 11, color: T.warn, fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.18)' }}>⬇ {fmtN(P(kat.min - e.miqdor))} {kat.birlik} kerak</div>}
          </div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Minimum', val: `${fmtN(kat.min)} ${kat.birlik}`, color: T.warn },
                    { label: 'Limit', val: `${fmtN(kat.limit)} ${kat.birlik}`, color: T.accent },
                    { label: 'Tranzaksiya', val: `${e.tranzaksiyalar.length} ta`, color: T.cyan },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
                {o && <div style={{ fontSize: 11, color: T.danger, fontWeight: 600, background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.18)', marginBottom: 8 }}>⚠ +{fmtN(P(e.miqdor - kat.limit))} {kat.birlik} ortiqcha</div>}
                {k && <div style={{ fontSize: 11, color: T.warn, fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.18)', marginBottom: 8 }}>⬇ {fmtN(P(kat.min - e.miqdor))} {kat.birlik} kerak</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={ev => { ev.stopPropagation(); onEdit(); }} style={{ flex: 1, height: 48, background: 'rgba(201,168,76,0.09)', color: T.accent, border: `1px solid rgba(201,168,76,0.22)`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>{Ico.edit} Tahrirlash</button>
                  <button onClick={ev => { ev.stopPropagation(); onDelete(); }} style={{ flex: 1, height: 48, background: 'rgba(239,68,68,0.09)', color: T.danger, border: `1px solid rgba(239,68,68,0.22)`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>{Ico.del} O'chirish</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCtx(false)} style={{ position: 'fixed', inset: 0, zIndex: 400 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 401, background: '#1a2030', borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', overflow: 'hidden', minWidth: 190 }}
            >
              {[
                { label: 'Tahrirlash',    icon: Ico.edit, color: T.accent, action: () => { setShowCtx(false); onEdit(); } },
                { label: "O'chirish",     icon: Ico.del,  color: T.danger, action: () => { setShowCtx(false); onDelete(); } },
                { label: "Tarix ko'rish", icon: Ico.tx,   color: T.cyan,   action: () => { setShowCtx(false); onHistory(); } },
              ].map((item, i, arr) => (
                <button key={i} onClick={item.action}
                  style={{ width: '100%', padding: '15px 18px', background: 'transparent', border: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none', color: item.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, minHeight: 52 }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                >{item.icon} {item.label}</button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Group card (collapsible group with child cards) ──────
function GroupCard({ group, children, baseIndex }) {
  const [expanded, setExpanded] = useState(true);
  const { isMobile, sm, sy, getCEntry, setTahrirK, setModal, katOchir, setTxF, setBottomModal, setTab } = useData();

  const totalMiqdor = children.reduce((sum, c) => sum + (getCEntry(sm, sy, c.id).miqdor || 0), 0);

  const childCards = children.map((child, idx) => {
    const entry = getCEntry(sm, sy, child.id);
    const o = child.limit > 0 && P(entry.miqdor) > P(child.limit);
    const k = child.min > 0 && P(entry.miqdor) < P(child.min);
    const pct = child.limit > 0 ? cl(PCT(entry.miqdor, child.limit), 0, 999) : 0;
    const shared = {
      kat: child, e: entry, o, k, pct, index: baseIndex + idx,
      onEdit:   () => { setTahrirK({ ...child }); setModal({ type: 'katTahrirla' }); },
      onDelete: () => katOchir(child.id),
    };
    return isMobile
      ? <MobileCard key={child.id} {...shared}
          onKirim={()  => { setTxF(f => ({ ...f, katId: child.id, tur: 'kirim' })); setBottomModal(true); }}
          onChiqim={() => { setTxF(f => ({ ...f, katId: child.id, tur: 'chiqim' })); setBottomModal(true); }}
          onHistory={() => setTab('Tranzaksiyalar')}
        />
      : <DesktopCard key={child.id} {...shared} />;
  });

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      {/* Group header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseIndex * 0.04, type: 'spring', stiffness: 380, damping: 30 }}
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          cursor: 'pointer',
          background: 'rgba(201,168,76,0.05)',
          border: `1px solid rgba(201,168,76,0.15)`,
          borderRadius: expanded ? '12px 12px 0 0' : 12,
          transition: 'border-radius 0.2s',
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, border: '1px solid rgba(201,168,76,0.2)', flexShrink: 0 }}>
          {group.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.accent, letterSpacing: -0.2 }}>{group.nom}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {children.length} variant · Jami: <strong style={{ color: T.text }}>{fmtN(totalMiqdor)} {group.birlik}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={ev => { ev.stopPropagation(); setTahrirK({ ...group }); setModal({ type: 'katTahrirla' }); }}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(201,168,76,0.1)', border: `1px solid rgba(201,168,76,0.2)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}
          >{Ico.edit}</button>
          <button
            onClick={ev => { ev.stopPropagation(); katOchir(group.id); }}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger }}
          >{Ico.del}</button>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              border: `1px solid rgba(201,168,76,0.12)`,
              borderTop: 'none', borderRadius: '0 0 12px 12px',
              padding: isMobile ? '8px 8px' : '12px',
              background: 'rgba(201,168,76,0.01)',
              display: isMobile ? 'flex' : 'grid',
              flexDirection: isMobile ? 'column' : undefined,
              gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
            }}>
              {children.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                  Hali variant qo'shilmagan
                </div>
              ) : childCards}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Swipe hint ───────────────────────────────────────────
function SwipeHint() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontSize: 11, color: T.muted, opacity: 0.5, paddingBottom: 88 }}>
      <span style={{ color: '#22c55e' }}>↑ o'ngga: kirim</span>
      <span>·</span>
      <span style={{ color: T.danger }}>↓ chapga: chiqim</span>
      <span>·</span>
      <span>bosib turing: menyu</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function Categories() {
  const {
    isMobile, sm, sy, katlar, yangiK, setYangiK,
    setTahrirK, getCEntry, katQoshish, katOchir, setModal,
    setTxF, setBottomModal, setTab,
  } = useData();
  const [showSheet, setShowSheet] = useState(false);

  // Separate into groups, their children, and standalone
  const groups = katlar.filter(k => k.isGroup);
  const childMap = {};
  katlar.filter(k => k.parentId).forEach(k => {
    if (!childMap[k.parentId]) childMap[k.parentId] = [];
    childMap[k.parentId].push(k);
  });
  const standalones = katlar.filter(k => !k.isGroup && !k.parentId);

  const totalCount = standalones.length + groups.reduce((s, g) => s + (childMap[g.id]?.length || 0), 0);

  const quickAdd = (katId, tur) => {
    setTxF(f => ({ ...f, katId, tur }));
    setBottomModal(true);
  };

  const inpStyle = {
    width: '100%', border: `1px solid ${T.border}`, borderRadius: T.rs,
    padding: '11px 14px', fontSize: 13, background: 'rgba(255,255,255,0.03)',
    outline: 'none', boxSizing: 'border-box', color: T.text,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

      {/* Desktop inline form — quick non-group add */}
      {!isMobile && (
        <Card>
          <H2>➕ Yangi kategoriya qo'shish</H2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px 60px auto auto', gap: 8, alignItems: 'end' }}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Nomi</label>
              <input type="text" value={yangiK.nom || ''} onChange={e => setYangiK(f => ({ ...f, nom: e.target.value }))} placeholder="📁 Nomi" style={inpStyle} />
            </div>
            {/* Unit type dropdown */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Birlik</label>
              <UnitSelect value={yangiK.birlik || 'dona'} onChange={v => setYangiK(f => ({ ...f, birlik: v }))} height={44} />
            </div>
            {/* Limit */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Limit</label>
              <input type="number" value={yangiK.limit || ''} onChange={e => setYangiK(f => ({ ...f, limit: e.target.value }))} placeholder="100" style={inpStyle} />
            </div>
            {/* Min */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Minimum</label>
              <input type="number" value={yangiK.min || ''} onChange={e => setYangiK(f => ({ ...f, min: e.target.value }))} placeholder="10" style={inpStyle} />
            </div>
            {/* Icon */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Belgi</label>
              <input type="text" value={yangiK.icon || ''} onChange={e => setYangiK(f => ({ ...f, icon: e.target.value }))} placeholder="📦" style={inpStyle} />
            </div>
            {/* Quick add */}
            <button
              onClick={katQoshish}
              style={{ marginBottom: 14, height: 44, padding: '0 16px', background: T.gradAccent, color: '#0a0c18', border: 'none', borderRadius: T.rs, fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {Ico.plus} Qo'shish
            </button>
            {/* Group / variant creator button */}
            <button
              onClick={() => setShowSheet(true)}
              style={{ marginBottom: 14, height: 44, padding: '0 14px', background: 'rgba(201,168,76,0.08)', color: T.accent, border: `1px solid ${T.accentBdr}`, borderRadius: T.rs, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🗂 Guruh
            </button>
          </div>
        </Card>
      )}

      {/* Category list */}
      <Card style={{ overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <H2 style={{ marginBottom: 0 }}>🗂 Barcha kategoriyalar</H2>
          <div style={{ fontSize: 12, fontWeight: 700, background: T.cyanBg, color: T.cyan, padding: '4px 12px', borderRadius: 20, border: `1px solid ${T.cyanBdr}` }}>
            {totalCount} ta
          </div>
        </div>

        {katlar.length === 0 ? (
          <EmptyState onAdd={() => setShowSheet(true)} />
        ) : (
          <div className={isMobile ? 'alc-kat-list' : 'alc-kat-grid'}>
            {/* Groups first */}
            {groups.map((group, idx) => (
              <GroupCard key={group.id} group={group} children={childMap[group.id] || []} baseIndex={idx} />
            ))}
            {/* Standalone categories */}
            {standalones.map((kat, idx) => {
              const entry = getCEntry(sm, sy, kat.id);
              const o = kat.limit > 0 && P(entry.miqdor) > P(kat.limit);
              const k = kat.min > 0 && P(entry.miqdor) < P(kat.min);
              const pct = kat.limit > 0 ? cl(PCT(entry.miqdor, kat.limit), 0, 999) : 0;
              const shared = {
                kat, e: entry, o, k, pct, index: groups.length + idx,
                onEdit:   () => { setTahrirK({ ...kat }); setModal({ type: 'katTahrirla' }); },
                onDelete: () => katOchir(kat.id),
              };
              return isMobile
                ? <MobileCard key={kat.id} {...shared}
                    onKirim={()  => quickAdd(kat.id, 'kirim')}
                    onChiqim={() => quickAdd(kat.id, 'chiqim')}
                    onHistory={() => setTab('Tranzaksiyalar')}
                  />
                : <DesktopCard key={kat.id} {...shared} />;
            })}
          </div>
        )}
      </Card>

      {isMobile && katlar.length > 0 && <SwipeHint />}

      {/* FAB (mobile) */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowSheet(true)}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            right: 20, zIndex: 100,
            width: 56, height: 56, borderRadius: '50%',
            background: T.gradAccent, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(201,168,76,0.5), 0 2px 8px rgba(0,0,0,0.5)',
            color: '#0a0c18',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </motion.button>
      )}

      {/* Sheet / modal */}
      <AnimatePresence>
        {showSheet && <AddSheet onClose={() => setShowSheet(false)} />}
      </AnimatePresence>
    </div>
  );
}
