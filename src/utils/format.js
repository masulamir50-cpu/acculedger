export const fmt  = n => Number(n || 0).toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtN = n => Number(n || 0).toLocaleString("uz-UZ");
export const mkKey = (m, y) => `${y}-${String(m).padStart(2, "0")}`;
export const P  = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const PCT = (a, b) => b > 0 ? P((a / b) * 100) : 0;
export const cl  = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
