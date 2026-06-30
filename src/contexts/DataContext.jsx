import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { fbGet, fbSetDebounced, flushPendingWrites } from '../lib/shared.jsx';
import {
  OYLAR, OYLAR_TO, HOZ_YIL, HOZ_OY,
  DEF_KATEGORIYALAR, DEF_MOL, DEF_SOZL, DEF_KAT, DEF_TXF,
} from '../utils/constants.js';
import { fmt, fmtN, P, PCT, cl, mkKey } from '../utils/format.js';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children, uid }) {
  // ── Raw Firestore state ──────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [katlar,       setKatlarState]  = useState([]);
  const [mData,        setMDataState]   = useState({});
  const [mol,          setMolState]     = useState(DEF_MOL);
  const [mMol,         setMMolState]    = useState({});
  const [sozl,         setSozlState]    = useState(DEF_SOZL);

  // ── UI / navigation state ────────────────────────────────
  const [tab,         setTab]          = useState('Bosh sahifa');
  const [sm,          setSm]           = useState(HOZ_OY);
  const [sy,          setSy]           = useState(HOZ_YIL);
  const [period,      setPeriod]       = useState('oy'); // kun|hafta|oy|yil

  // ── Toast ────────────────────────────────────────────────
  const [xabar,       setXabarState]   = useState(null);

  // ── Alerts / warnings ────────────────────────────────────
  const [ogohlar,     setOgohlar]      = useState([]);

  // ── Modals ───────────────────────────────────────────────
  const [modal,       setModal]        = useState(null);
  const [bottomModal, setBottomModal]  = useState(false);

  // ── Forms ────────────────────────────────────────────────
  const [txF,   setTxF]   = useState(DEF_TXF);
  const [molF,  setMolF]  = useState({ ...DEF_MOL });
  const [sozlF, setSozlF] = useState(DEF_SOZL);
  const [yangiK,setYangiK]= useState(DEF_KAT);
  const [tahrirK,setTahrirK]= useState(null);

  // ── Search / filter ──────────────────────────────────────
  const [qidiruv,   setQidiruv]   = useState('');
  const [txFilter,  setTxFilter]  = useState('hammasi');

  // ── Undo history ─────────────────────────────────────────
  const [tarix, setTarix] = useState([]);

  // ── Responsive ───────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Firestore flush on unload ────────────────────────────
  useEffect(() => {
    window.addEventListener('beforeunload', flushPendingWrites);
    return () => {
      window.removeEventListener('beforeunload', flushPendingWrites);
      flushPendingWrites();
    };
  }, []);

  // ── Firestore setters ────────────────────────────────────
  const setKatlar = useCallback(async v => {
    const val = typeof v === 'function' ? v(katlar) : v;
    setKatlarState(val);
    fbSetDebounced(uid, 'katlar', val);
  }, [uid, katlar]);

  const setMData = useCallback(async v => {
    const val = typeof v === 'function' ? v(mData) : v;
    setMDataState(val);
    fbSetDebounced(uid, 'mdata', val);
  }, [uid, mData]);

  const setMol = useCallback(async v => {
    const val = typeof v === 'function' ? v(mol) : v;
    setMolState(val);
    fbSetDebounced(uid, 'mol', val);
  }, [uid, mol]);

  const setMMol = useCallback(async v => {
    const val = typeof v === 'function' ? v(mMol) : v;
    setMMolState(val);
    fbSetDebounced(uid, 'mmol', val);
  }, [uid, mMol]);

  const setSozl = useCallback(async v => {
    const val = typeof v === 'function' ? v(sozl) : v;
    setSozlState(val);
    fbSetDebounced(uid, 'sozl', val);
  }, [uid, sozl]);

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [k, m, mo, mm, s] = await Promise.all([
        fbGet(uid, 'katlar', DEF_KATEGORIYALAR),
        fbGet(uid, 'mdata',  {}),
        fbGet(uid, 'mol',    DEF_MOL),
        fbGet(uid, 'mmol',   {}),
        fbGet(uid, 'sozl',   DEF_SOZL),
      ]);
      setKatlarState(Array.isArray(k) ? k : DEF_KATEGORIYALAR);
      setMDataState(m && typeof m === 'object' ? m : {});
      setMolState(mo && typeof mo === 'object' ? { ...DEF_MOL, ...mo } : DEF_MOL);
      setMMolState(mm && typeof mm === 'object' ? mm : {});
      const sVal = s && typeof s === 'object' ? s : DEF_SOZL;
      setSozlState(sVal);
      setSozlF(sVal);
      setLoading(false);
    })();
  }, [uid]);

  // ── Toast helper ─────────────────────────────────────────
  const showXabar = useCallback((msg, tur = 'info') => {
    setXabarState({ msg, tur });
    setTimeout(() => setXabarState(null), 3500);
  }, []);

  // ── Internal helpers ─────────────────────────────────────
  const getCEntry  = useCallback((m, y, katId) => mData[mkKey(m, y)]?.[katId] || { miqdor: 0, tranzaksiyalar: [] }, [mData]);
  const getMolKey  = useCallback((m, y) => mMol[mkKey(m, y)] || null, [mMol]);

  // ── Computed — current period financials ─────────────────
  const faolMol = useMemo(() => getMolKey(sm, sy) || mol, [sm, sy, mol, mMol, getMolKey]);

  const sofFoyda   = useMemo(() => { const g = P(faolMol.daromad - faolMol.xarajat); return P(g - P(g * (faolMol.soliq / 100))); }, [faolMol]);
  const kapital    = useMemo(() => P(faolMol.aktiv - faolMol.passiv), [faolMol]);
  const yalpiF     = useMemo(() => P(faolMol.daromad - faolMol.xarajat), [faolMol]);
  const soliqM     = useMemo(() => P(yalpiF * (faolMol.soliq / 100)), [yalpiF, faolMol.soliq]);
  const foydaMarj  = faolMol.daromad > 0 ? P((sofFoyda / faolMol.daromad) * 100) : 0;
  const xarajatNis = faolMol.daromad > 0 ? P((faolMol.xarajat / faolMol.daromad) * 100) : 0;
  const joriyKoef  = faolMol.passiv > 0 ? P(faolMol.aktiv / faolMol.passiv) : null;
  const qarzKap    = kapital > 0 ? P(faolMol.passiv / kapital) : null;

  // ── Alerts ───────────────────────────────────────────────
  useEffect(() => {
    const yangi = [];
    katlar.filter(k => !k.isGroup).forEach(kat => {
      const e = getCEntry(HOZ_OY, HOZ_YIL, kat.id);
      if (kat.limit > 0 && P(e.miqdor) > P(kat.limit)) yangi.push({ ...kat, ishlatilgan: e.miqdor, oshgan: P(e.miqdor - kat.limit), tur: 'limit' });
      if (kat.min > 0   && P(e.miqdor) < P(kat.min))   yangi.push({ ...kat, ishlatilgan: e.miqdor, tur: 'minimum' });
    });
    setOgohlar(yangi);
  }, [katlar, mData, getCEntry]);

  // ── Computed — yearly data ────────────────────────────────
  const yillikData = useMemo(() => OYLAR.map((o, i) => {
    const mf  = getMolKey(i, sy) || mol;
    const inv = katlar.reduce((acc, k) => acc + (mData[mkKey(i, sy)]?.[k.id]?.miqdor || 0), 0);
    const g   = P(mf.daromad - mf.xarajat);
    return { oy: o, daromad: mf.daromad, xarajat: mf.xarajat, foyda: P(g - P(g * (mf.soliq / 100))), inventar: inv, pulOqimi: mf.pul_oqimi };
  }), [mData, sy, katlar, mol, mMol, getMolKey]);

  const yilJami = useMemo(() => ({
    daromad:  P(yillikData.reduce((s, d) => s + d.daromad,  0)),
    xarajat:  P(yillikData.reduce((s, d) => s + d.xarajat,  0)),
    foyda:    P(yillikData.reduce((s, d) => s + d.foyda,    0)),
    inventar: yillikData.reduce((s, d) => s + d.inventar, 0),
  }), [yillikData]);

  // ── Computed — inventory summary (groups excluded) ────────
  const invXulosa = useMemo(() => katlar.filter(k => !k.isGroup).map(kat => {
    const e   = getCEntry(sm, sy, kat.id);
    const pct = kat.limit > 0 ? cl(PCT(e.miqdor, kat.limit), 0, 999) : 0;
    return { ...kat, miqdor: e.miqdor, pct, oshgan: kat.limit > 0 && P(e.miqdor) > P(kat.limit), kamaygan: kat.min > 0 && P(e.miqdor) < P(kat.min), txSoni: e.tranzaksiyalar.length };
  }), [katlar, sm, sy, getCEntry]);

  // ── Computed — all transactions for the selected month ────
  const hammaTx = useMemo(() => {
    const key  = mkKey(sm, sy);
    const list = [];
    katlar.filter(k => !k.isGroup).forEach(kat => (mData[key]?.[kat.id]?.tranzaksiyalar || []).forEach(t => list.push({ ...t, katNom: kat.nom, birlik: kat.birlik, icon: kat.icon, katId: kat.id })));
    return list.sort((a, b) => new Date(b.sana) - new Date(a.sana));
  }, [mData, sm, sy, katlar]);

  // ── Computed — filtered transactions ─────────────────────
  const filtrlangan = useMemo(() => {
    let list = hammaTx;
    if (txFilter !== 'hammasi') list = list.filter(t => t.tur === txFilter);
    if (qidiruv) list = list.filter(t => t.katNom.toLowerCase().includes(qidiruv.toLowerCase()) || t.eslatma?.toLowerCase().includes(qidiruv.toLowerCase()));
    return list;
  }, [hammaTx, txFilter, qidiruv]);

  // ── Computed — period-filtered data for dashboard hero ───
  const periodData = useMemo(() => {
    if (period === 'oy')  return { label: OYLAR_TO[sm], net: sofFoyda, income: faolMol.daromad, expense: faolMol.xarajat, txList: hammaTx.slice(0, 5) };
    if (period === 'yil') return { label: String(sy),   net: yilJami.foyda, income: yilJami.daromad, expense: yilJami.xarajat, txList: hammaTx.slice(0, 5) };

    const now  = new Date();
    const msAgo = period === 'kun' ? 0 : 7 * 24 * 60 * 60 * 1000;
    const since = period === 'kun'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(now - msAgo);

    // Gather across all months this year for kun/hafta
    const allTx = [];
    katlar.forEach(kat => {
      for (let mo = 0; mo < 12; mo++) {
        (mData[mkKey(mo, HOZ_YIL)]?.[kat.id]?.tranzaksiyalar || []).forEach(t =>
          new Date(t.sana) >= since && allTx.push({ ...t, katNom: kat.nom, birlik: kat.birlik, icon: kat.icon, katId: kat.id })
        );
      }
    });
    allTx.sort((a, b) => new Date(b.sana) - new Date(a.sana));
    const income  = P(allTx.filter(t => t.tur === 'kirim').reduce((s, t) => s + (t.qiymat || 0), 0));
    const expense = P(allTx.filter(t => t.tur === 'chiqim').reduce((s, t) => s + (t.qiymat || 0), 0));
    return { label: period === 'kun' ? 'Bugun' : 'Bu hafta', net: P(income - expense), income, expense, txList: allTx.slice(0, 5) };
  }, [period, sm, sy, sofFoyda, faolMol, yilJami, hammaTx, katlar, mData]);

  // ── Actions ───────────────────────────────────────────────
  const txQoshish = useCallback(async () => {
    const miq = parseFloat(txF.miqdor), narx = parseFloat(txF.narx) || 0;
    if (!txF.katId || isNaN(miq) || miq <= 0) { showXabar("Kategoriya va miqdorni to'ldiring!", 'xato'); return; }
    const kat     = katlar.find(k => k.id === txF.katId);
    const key     = mkKey(txF.oy, txF.yil);
    const qiymat  = P(miq * narx);
    setTarix(prev => [{ mData, mMol }, ...prev.slice(0, 19)]);
    const yangiMData = { ...mData };
    const me = { ...(yangiMData[key] || {}) };
    const ke = me[txF.katId] || { miqdor: 0, tranzaksiyalar: [] };
    const delta    = txF.tur === 'kirim' ? miq : -miq;
    const yangiMiq = P(ke.miqdor + delta);
    const tx = { id: Date.now(), tur: txF.tur, miqdor: miq, narx, qiymat, eslatma: txF.eslatma, yetkazuvchi: txF.yetkazuvchi, sana: new Date().toISOString(), balans: yangiMiq };
    yangiMData[key] = { ...me, [txF.katId]: { miqdor: yangiMiq, tranzaksiyalar: [tx, ...ke.tranzaksiyalar] } };
    await setMData(yangiMData);
    if (narx > 0) {
      const yangiMMol = { ...mMol };
      const mf = { ...(yangiMMol[key] || { ...mol }) };
      if (txF.tur === 'kirim') mf.daromad = P((mf.daromad || 0) + qiymat);
      else                     mf.xarajat = P((mf.xarajat || 0) + qiymat);
      yangiMMol[key] = mf;
      await setMMol(yangiMMol);
    }
    showXabar(`✅ ${txF.tur === 'kirim' ? 'Kirim' : 'Chiqim'}: ${miq} ${kat?.birlik} — ${kat?.nom}`, 'muvaffaq');
    setTxF(f => ({ ...f, miqdor: '', eslatma: '', narx: '', yetkazuvchi: '' }));
    setBottomModal(false);
  }, [txF, katlar, mData, mMol, mol, setMData, setMMol, showXabar]);

  const txOchir = useCallback(async (katId, txId) => {
    const key = mkKey(sm, sy);
    setTarix(prev => [{ mData, mMol }, ...prev.slice(0, 19)]);
    const yangiMData = { ...mData };
    const me = { ...(yangiMData[key] || {}) };
    const ke = me[katId] || { miqdor: 0, tranzaksiyalar: [] };
    const ochirilgan = ke.tranzaksiyalar.find(t => t.id === txId);
    const txlar      = ke.tranzaksiyalar.filter(t => t.id !== txId);
    const yangiMiq   = txlar.reduce((acc, t) => P(acc + (t.tur === 'kirim' ? t.miqdor : -t.miqdor)), 0);
    yangiMData[key]  = { ...me, [katId]: { miqdor: yangiMiq, tranzaksiyalar: txlar } };
    await setMData(yangiMData);
    if (ochirilgan?.qiymat > 0) {
      const yangiMMol = { ...mMol };
      const mf = { ...(yangiMMol[key] || { ...mol }) };
      if (ochirilgan.tur === 'kirim') mf.daromad = P(Math.max(0, (mf.daromad || 0) - ochirilgan.qiymat));
      else                            mf.xarajat = P(Math.max(0, (mf.xarajat || 0) - ochirilgan.qiymat));
      yangiMMol[key] = mf;
      await setMMol(yangiMMol);
    }
    showXabar("Tranzaksiya o'chirildi, balans qayta hisoblandi", 'info');
    setModal(null);
  }, [sm, sy, mData, mMol, mol, setMData, setMMol, showXabar]);

  const molSaqlash = useCallback(async oyGa => {
    const d = {};
    Object.keys(DEF_MOL).forEach(k => { d[k] = P(parseFloat(molF[k]) || 0); });
    if (oyGa) { const key = mkKey(sm, sy); await setMMol({ ...mMol, [key]: d }); }
    else await setMol(d);
    showXabar(oyGa ? `${OYLAR_TO[sm]} uchun saqlandi` : 'Umumiy moliya yangilandi!', 'muvaffaq');
    setModal(null);
  }, [molF, sm, sy, mMol, setMMol, setMol, showXabar]);

  const katQoshish = useCallback(async () => {
    if (!yangiK.nom.trim()) { showXabar('Nom kiriting!', 'xato'); return; }
    const ranglar = ['#c9a84c','#4a7c59','#3b82f6','#a855f7','#22c55e','#06b6d4','#ec4899','#f97316'];
    const kat = {
      id:      `k${Date.now()}`,
      nom:     yangiK.nom.trim(),
      birlik:  yangiK.birlik || 'dona',
      limit:   P(parseFloat(yangiK.limit) || 0),
      min:     P(parseFloat(yangiK.min)   || 0),
      icon:    yangiK.icon || '📦',
      color:   ranglar[katlar.length % ranglar.length],
      isGroup: !!yangiK.isGroup,
      ...(yangiK.parentId ? { parentId: yangiK.parentId } : {}),
    };
    await setKatlar([...katlar, kat]);
    setYangiK(DEF_KAT);
    showXabar("Kategoriya qo'shildi!", 'muvaffaq');
  }, [yangiK, katlar, setKatlar, showXabar]);

  const variantlarQoshish = useCallback(async (newKatlar) => {
    if (!newKatlar.length) return;
    const ranglar = ['#c9a84c','#4a7c59','#3b82f6','#a855f7','#22c55e','#06b6d4','#ec4899','#f97316'];
    const base = katlar.length;
    const withColors = newKatlar.map((k, i) => ({
      ...k,
      color: k.color || ranglar[(base + i) % ranglar.length],
    }));
    await setKatlar([...katlar, ...withColors]);
    const gCnt = newKatlar.filter(k => k.isGroup).length;
    const vCnt = newKatlar.filter(k => !k.isGroup).length;
    showXabar(gCnt > 0 ? `Guruh + ${vCnt} variant qo'shildi!` : `${vCnt} ta kategoriya qo'shildi!`, 'muvaffaq');
  }, [katlar, setKatlar, showXabar]);

  const variantlarQoshishToGroup = useCallback(async (groupId, variantItems) => {
    if (!variantItems.length) return;
    const ranglar = ['#c9a84c','#4a7c59','#3b82f6','#a855f7','#22c55e','#06b6d4','#ec4899','#f97316'];
    const ts = Date.now();
    const base = katlar.length;
    const newKats = variantItems.map((v, i) => ({
      id: `k${ts}_p${i}`, nom: v.nom, birlik: v.birlik,
      limit: 0, min: 0, icon: v.icon || '📦',
      parentId: groupId, isGroup: false,
      color: ranglar[(base + i) % ranglar.length],
    }));
    await setKatlar([...katlar, ...newKats]);
    showXabar(`${variantItems.length} ta variant qo'shildi!`, 'muvaffaq');
  }, [katlar, setKatlar, showXabar]);

  const quickTx = useCallback(async (katId, tur, miqdor = 1) => {
    const kat = katlar.find(k => k.id === katId);
    if (!kat || miqdor <= 0) return;
    const key = mkKey(sm, sy);
    setTarix(prev => [{ mData, mMol }, ...prev.slice(0, 19)]);
    const yangiMData = { ...mData };
    const me = { ...(yangiMData[key] || {}) };
    const ke = me[katId] || { miqdor: 0, tranzaksiyalar: [] };
    const delta = tur === 'kirim' ? miqdor : -miqdor;
    const yangiMiq = P(ke.miqdor + delta);
    const tx = {
      id: Date.now(), tur, miqdor, narx: 0, qiymat: 0,
      eslatma: '', yetkazuvchi: '',
      sana: new Date().toISOString(), balans: yangiMiq,
    };
    yangiMData[key] = { ...me, [katId]: { miqdor: yangiMiq, tranzaksiyalar: [tx, ...ke.tranzaksiyalar] } };
    await setMData(yangiMData);
    showXabar(
      `${tur === 'kirim' ? '↑' : '↓'} ${miqdor} ${kat.birlik} — ${kat.nom}`,
      tur === 'kirim' ? 'muvaffaq' : 'info'
    );
  }, [sm, sy, katlar, mData, mMol, setMData, setTarix, showXabar]);

  const katSaqlash = useCallback(async () => {
    await setKatlar(katlar.map(k => k.id === tahrirK.id
      ? { ...tahrirK, limit: P(parseFloat(tahrirK.limit) || 0), min: P(parseFloat(tahrirK.min) || 0) }
      : k
    ));
    setTahrirK(null);
    setModal(null);
    showXabar('Yangilandi!', 'muvaffaq');
  }, [tahrirK, katlar, setKatlar, showXabar]);

  const katOchir = useCallback(async id => {
    // Also remove any child variants that belong to this group
    await setKatlar(katlar.filter(k => k.id !== id && k.parentId !== id));
    showXabar("O'chirildi", 'info');
  }, [katlar, setKatlar, showXabar]);

  const bekorQilish = useCallback(async () => {
    if (!tarix.length) { showXabar("Bekor qilishga narsa yo'q", 'ogoh'); return; }
    const [oldingi, ...qolgan] = tarix;
    setMDataState(oldingi.mData);
    setMMolState(oldingi.mMol);
    fbSetDebounced(uid, 'mdata', oldingi.mData);
    fbSetDebounced(uid, 'mmol',  oldingi.mMol);
    setTarix(qolgan);
    showXabar('↩ Bekor qilindi', 'info');
  }, [tarix, uid, showXabar]);

  const csvExport = useCallback(() => {
    const sarlavha = ['Sana','Kategoriya','Tur','Miqdor','Birlik','Narx','Qiymat','Balans','Yetkazuvchi','Izoh'];
    const qatorlar = hammaTx.map(t => [
      new Date(t.sana).toLocaleString('uz-UZ'), t.katNom,
      t.tur === 'kirim' ? 'Kirim' : 'Chiqim',
      t.miqdor, t.birlik, t.narx || 0, t.qiymat || 0, t.balans,
      t.yetkazuvchi || '', t.eslatma || '',
    ]);
    const csv  = [sarlavha, ...qatorlar].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `acculedger-${OYLAR_TO[sm]}-${sy}.csv`;
    a.click();
    showXabar('CSV yuklab olindi!', 'muvaffaq');
  }, [hammaTx, sm, sy, showXabar]);

  const logout = useCallback(async () => {
    flushPendingWrites();
    await signOut(auth);
  }, []);

  const resetAllData = useCallback(async () => {
    await setKatlar(DEF_KATEGORIYALAR);
    await setMData({});
    await setMol(DEF_MOL);
    await setMMol({});
    showXabar("Barcha ma'lumotlar tozalandi", 'info');
  }, [setKatlar, setMData, setMol, setMMol, showXabar]);

  const value = {
    // raw state
    loading, katlar, mData, mol, mMol, sozl,
    // navigation
    tab, setTab, sm, setSm, sy, setSy, period, setPeriod,
    // ui
    isMobile, xabar, ogohlar, modal, setModal, bottomModal, setBottomModal,
    // forms
    txF, setTxF, molF, setMolF, sozlF, setSozlF,
    yangiK, setYangiK, tahrirK, setTahrirK,
    // search
    qidiruv, setQidiruv, txFilter, setTxFilter,
    // undo
    tarix,
    // computed
    faolMol, sofFoyda, kapital, yalpiF, soliqM,
    foydaMarj, xarajatNis, joriyKoef, qarzKap,
    yillikData, yilJami, invXulosa, hammaTx, filtrlangan, periodData,
    getCEntry,
    // actions
    showXabar, txQoshish, txOchir, molSaqlash,
    katQoshish, katSaqlash, katOchir, variantlarQoshish, variantlarQoshishToGroup, quickTx,
    bekorQilish, csvExport, logout, resetAllData,
    // direct setters
    setKatlar, setMData, setMol, setMMol, setSozl,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
