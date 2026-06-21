import { useData } from '../../contexts/DataContext';
import { T, Card, H2, Btn, Ico, Tag, Badge, Prog, Met, OYLAR_TO } from '../../lib/shared.jsx';
import { fmt, fmtN } from '../../utils/format.js';
import TxForm from '../ui/TxForm.jsx';

const PERIODS = [
  { k: 'kun',   l: 'Kun'   },
  { k: 'hafta', l: 'Hafta' },
  { k: 'oy',    l: 'Oy'    },
  { k: 'yil',   l: 'Yil'   },
];

export default function Dashboard() {
  const {
    isMobile, sm, sy, sozl, period, setPeriod,
    sofFoyda, faolMol, kapital, foydaMarj, xarajatNis,
    joriyKoef, qarzKap, invXulosa, hammaTx,
    periodData, setTab, setTxF, setBottomModal,
  } = useData();

  return (
    <div>
      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: T.card, borderRadius: T.r, padding: 6, border: `1px solid ${T.border}` }}>
        {PERIODS.map(p => (
          <button key={p.k} onClick={() => setPeriod(p.k)}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: period === p.k ? 800 : 500, background: period === p.k ? T.accentBg : 'transparent', color: period === p.k ? T.accent : T.muted, transition: 'all 0.2s', outline: period === p.k ? `1px solid ${T.accentBdr}` : 'none' }}>
            {p.l}
          </button>
        ))}
      </div>

      {/* HERO BALANCE CARD */}
      <div style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0f1929 50%, #0a0e1a 100%)', borderRadius: T.rx, padding: '28px 24px 24px', marginBottom: 16, border: 'rgba(201,168,76,0.2) 1px solid', boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(201,168,76,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -10, width: 140, height: 140, borderRadius: '50%', background: 'rgba(201,168,76,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {periodData.label} — Sof foyda
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <div style={{ fontSize: isMobile ? 34 : 44, fontWeight: 900, color: periodData.net >= 0 ? T.accent : T.danger, lineHeight: 1 }}>
              {fmt(periodData.net)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{sozl.valyuta}</div>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 22 }}>
            {period === 'oy' && <>{faolMol.soliq}% soliqdan keyin · Foyda marjasi: <span style={{ color: foydaMarj > 10 ? T.green : foydaMarj > 0 ? T.warn : T.danger }}>{foydaMarj}%</span></>}
            {period === 'yil' && 'Yil bo\'yicha sof foyda'}
            {period === 'kun' && 'Bugungi tranzaksiyalar'}
            {period === 'hafta' && 'Haftalik tranzaksiyalar'}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 28, flexWrap: 'wrap' }}>
            {[['Daromad', `+${fmt(periodData.income)}`, T.green], ['Xarajat', `−${fmt(periodData.expense)}`, T.red], ['Kapital', fmt(kapital), T.info]].map(([l, v, col]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: col }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Kirim',   icon: '⬆️', bg: 'rgba(34,197,94,0.1)',  action: () => { setTxF(f => ({ ...f, tur: 'kirim' }));  setBottomModal(true); } },
          { label: 'Chiqim',  icon: '⬇️', bg: 'rgba(239,68,68,0.1)', action: () => { setTxF(f => ({ ...f, tur: 'chiqim' })); setBottomModal(true); } },
          { label: 'Moliya',  icon: '💼', bg: 'rgba(96,165,250,0.1)', action: () => setTab('Moliya') },
          { label: 'Hisobot', icon: '📊', bg: T.accentBg,             action: () => setTab('Tahlil') },
        ].map(({ label, icon, bg, action }) => (
          <button key={label} onClick={action} className="alc-btn alc-card-hover"
            style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: T.shadow }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMid }}>{label}</div>
          </button>
        ))}
      </div>

      {/* METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${isMobile ? 140 : 160}px,1fr))`, gap: 10, marginBottom: 16 }}>
        <Met label="Sof foyda"  val={`${fmt(sofFoyda)} ${sozl.valyuta}`}     sub={`${faolMol.soliq}% soliqdan keyin`} color={sofFoyda >= 0 ? T.accent : T.danger} icon="💰" />
        <Met label="Pul oqimi" val={`${fmt(faolMol.pul_oqimi)} ${sozl.valyuta}`} color={faolMol.pul_oqimi >= 0 ? T.info : T.danger} icon="💵" />
        {!isMobile && <>
          <Met label="Daromad" val={`${fmt(faolMol.daromad)} ${sozl.valyuta}`} color={T.accent2} icon="📈" />
          <Met label="Xarajat" val={`${fmt(faolMol.xarajat)} ${sozl.valyuta}`} sub={`${xarajatNis}% daromaddan`} color={T.danger} icon="📤" />
          <Met label="Kapital" val={`${fmt(kapital)} ${sozl.valyuta}`}          sub="Aktiv − Passiv" color="#5c8a3c" icon="🏦" />
        </>}
      </div>

      {/* BALANS + KOEFFITSIENTLAR */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <H2>🏛 Balans va P&L</H2>
          {[['Aktivlar', faolMol.aktiv, T.accent], ['Passivlar', faolMol.passiv, T.danger], ['Kapital', kapital, T.info],
            ['Debitorlik', faolMol.debitor, '#5c8a3c'], ['Kreditorlik', faolMol.kreditor, T.warn],
            ['Ish haqi', faolMol.ish_haqi, T.muted], ['Amortizatsiya', faolMol.amortizatsiya, '#7a5c3c'],
            ['Boshqa daromad', faolMol.boshqa_daromad, '#3a6b8a']].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.muted }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{fmt(v)} {sozl.valyuta}</span>
            </div>
          ))}
          <div style={{ background: T.successBg, borderRadius: T.rs, padding: '10px 12px', marginTop: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Sof foyda</span>
              <span style={{ fontWeight: 900, color: sofFoyda >= 0 ? T.accent : T.danger, fontSize: 15 }}>{fmt(sofFoyda)} {sozl.valyuta}</span>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <H2>📐 Moliyaviy koeffitsientlar</H2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Foyda ulushi', `${foydaMarj}%`, foydaMarj > 15 ? T.accent : foydaMarj > 5 ? T.warn : T.danger, foydaMarj > 15 ? 'Yaxshi' : foydaMarj > 5 ? "O'rtacha" : 'Past'],
                ['Xarajat nisbati', `${xarajatNis}%`, xarajatNis < 60 ? T.accent : xarajatNis < 80 ? T.warn : T.danger, xarajatNis < 60 ? 'Samarali' : xarajatNis < 80 ? "O'rtacha" : 'Yuqori'],
                ['Joriy koef.', joriyKoef !== null ? joriyKoef : '—', joriyKoef >= 2 ? T.accent : joriyKoef >= 1 ? T.warn : T.danger, joriyKoef >= 2 ? 'Kuchli' : joriyKoef >= 1 ? 'Yetarli' : 'Zaif'],
                ['Qarz/Kapital', qarzKap !== null ? qarzKap : '—', qarzKap !== null && qarzKap < 0.5 ? T.accent : qarzKap < 1 ? T.warn : T.danger, qarzKap !== null && qarzKap < 0.5 ? 'Xavfsiz' : qarzKap < 1 ? "O'rtacha" : 'Xavfli'],
              ].map(([l, v, col, st]) => (
                <div key={l} style={{ background: T.cream, borderRadius: T.rs, padding: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: col, marginTop: 4 }}>{v}</div>
                  <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: `${col}20`, color: col, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>{st}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <H2 style={{ marginBottom: 0 }}>📦 Inventar holati</H2>
              <Btn small ghost onClick={() => setTab('Inventar')}>Barchasi →</Btn>
            </div>
            {invXulosa.slice(0, 6).map(kat => (
              <div key={kat.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{kat.icon} {kat.nom}</span>
                  <Badge oshgan={kat.oshgan} kamaygan={kat.kamaygan} val={`${fmtN(kat.miqdor)}/${fmtN(kat.limit)}`} />
                </div>
                <Prog pct={kat.pct} oshgan={kat.oshgan} kamaygan={kat.kamaygan} />
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Tez tranzaksiya (desktop) */}
      {!isMobile && (
        <Card style={{ marginBottom: 12 }}>
          <H2>⚡ Tez tranzaksiya</H2>
          <TxForm />
        </Card>
      )}

      {/* So'nggi tranzaksiyalar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <H2 style={{ marginBottom: 0 }}>🕐 So'nggi tranzaksiyalar — {OYLAR_TO[sm]}</H2>
          <Btn small ghost onClick={() => setTab('Tranzaksiyalar')}>Hammasini →</Btn>
        </div>
        {hammaTx.length === 0
          ? <div style={{ textAlign: 'center', padding: '36px 0', color: T.muted, fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📭</div>
              Tranzaksiyalar yo'q.
            </div>
          : <div>
              {periodData.txList.map((tx, i) => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < periodData.txList.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: tx.tur === 'kirim' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{tx.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.katNom}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{new Date(tx.sana).toLocaleDateString('uz-UZ')} · <Tag tur={tx.tur} /></div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tx.tur === 'kirim' ? T.green : T.red }}>{tx.tur === 'kirim' ? '+' : '−'}{fmtN(tx.miqdor)} {tx.birlik}</div>
                    {tx.qiymat > 0 && <div style={{ fontSize: 11, color: T.muted }}>{fmt(tx.qiymat)} {sozl.valyuta}</div>}
                  </div>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}
