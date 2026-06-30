export const OYLAR    = ["Yan","Feb","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
export const OYLAR_TO = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
export const HOZ_YIL  = new Date().getFullYear();
export const HOZ_OY   = new Date().getMonth();

export const DEF_SOZL = { valyuta: "so'm", kompaniya: "Mening Kompaniyam", soliq: 15 };
export const DEF_KAT  = { nom: "", birlik: "dona", limit: 0, min: 0, icon: "📦", isGroup: false, parentId: null };

export const UNIT_TYPES = [
  { id: "dona",  label: "Dona",           decimal: false, presets: null },
  { id: "kg",    label: "Kilogram (kg)",   decimal: true,  presets: null },
  { id: "gr",    label: "Gram (gr)",       decimal: false, presets: null },
  { id: "L",     label: "Litr (L)",        decimal: true,  presets: [0.5, 1, 1.5, 2, 2.5] },
  { id: "ml",    label: "Millilitr (ml)",  decimal: false, presets: [250, 330, 500, 1000] },
  { id: "metr",  label: "Metr (m)",        decimal: true,  presets: null },
  { id: "paket", label: "Paket",           decimal: false, presets: null },
  { id: "rulon", label: "Rulon",           decimal: false, presets: null },
  { id: "shish", label: "Shisha",          decimal: false, presets: null },
];
export const DEF_TXF  = { katId: "", tur: "kirim", miqdor: "", eslatma: "", oy: HOZ_OY, yil: HOZ_YIL, narx: "", yetkazuvchi: "" };

export const DEF_KATEGORIYALAR = [
  { id:"k1",  nom:"Ofis jihozlari",    birlik:"dona",  limit:50,  min:10, color:"#c9a84c", icon:"📎" },
  { id:"k2",  nom:"Xom ashyo",         birlik:"kg",    limit:200, min:30, color:"#4a7c59", icon:"🏗"  },
  { id:"k3",  nom:"Tayyor mahsulot",   birlik:"dona",  limit:100, min:20, color:"#3b82f6", icon:"📦" },
  { id:"k4",  nom:"Qadoqlash",         birlik:"rulon", limit:80,  min:15, color:"#a855f7", icon:"🎁" },
  { id:"k5",  nom:"Yozuv mollari",     birlik:"paket", limit:30,  min:5,  color:"#22c55e", icon:"✏️"  },
  { id:"k6",  nom:"Elektronika",       birlik:"dona",  limit:20,  min:3,  color:"#06b6d4", icon:"💻" },
  { id:"k7",  nom:"Tozalash vosita",   birlik:"shish", limit:40,  min:8,  color:"#ec4899", icon:"🧴" },
  { id:"k8",  nom:"Asbob-uskunalar",   birlik:"dona",  limit:15,  min:3,  color:"#f97316", icon:"🔧" },
  { id:"k9",  nom:"Oziq-ovqat",        birlik:"dona",  limit:60,  min:10, color:"#84cc16", icon:"☕" },
  { id:"k10", nom:"Xavfsizlik vosita", birlik:"dona",  limit:25,  min:5,  color:"#14b8a6", icon:"🦺" },
];

export const DEF_MOL = {
  daromad:0, xarajat:0, aktiv:0, passiv:0, debitor:0, kreditor:0,
  pul_oqimi:0, soliq:15, byudjet:0, ish_haqi:0, amortizatsiya:0, boshqa_daromad:0,
};

export const NAV_TABS = [
  "Bosh sahifa", "Inventar", "Tranzaksiyalar",
  "Moliya", "Kategoriyalar", "Tahlil", "Sozlamalar",
];

export const TAB_TO_PAGE = {
  "Bosh sahifa":     "Dashboard",
  "Inventar":        "Inventory",
  "Tranzaksiyalar":  "Transactions",
  "Moliya":          "Finance",
  "Kategoriyalar":   "Categories",
  "Tahlil":          "Analytics",
  "Sozlamalar":      "Settings",
};
