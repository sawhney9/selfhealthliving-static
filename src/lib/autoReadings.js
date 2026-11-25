// Calculator readings we can work out from data the person already has in
// their account: lab_results (from PDFs, the app, or earlier calculator saves)
// and the app's Apple Health sync (health_metrics). They're computed on the fly
// for the trend, never written back, so they can't drift from the source data.
import { findMarker } from './markers.js';

// Lab names the app's catalog doesn't know but that clearly mean one of its markers.
const ALIASES = { insulin: 'Fasting Insulin', 'insulin, fasting': 'Fasting Insulin', 'fasting glucose': 'Glucose', 'glucose, fasting': 'Glucose' };
const markerName = (testName) =>
  findMarker(testName)?.name || ALIASES[String(testName || '').trim().toLowerCase()] || null;

const norm = (u) => String(u || '').toLowerCase().replace(/μ/g, 'µ').replace(/\s/g, '');
const MGDL = (u) => norm(u) === 'mg/dl';
const UNIT_OK = {
  Triglycerides: MGDL,
  HDL: MGDL,
  'Total Cholesterol': MGDL,
  Glucose: MGDL,
  Creatinine: MGDL,
  'Fasting Insulin': (u) => ['µiu/ml', 'uiu/ml', 'miu/l', 'mu/l', 'µu/ml', 'uu/ml'].includes(norm(u)),
  HbA1c: (u) => norm(u) === '%',
  eGFR: (u) => norm(u).startsWith('ml/min'),
};

/**
 * Per calculator: `need` lab markers (by app name) → `compute` the reading;
 * `fill` maps form input ids to markers to pre-fill from the latest labs;
 * `autoRun` submits the form after filling (only when every input is filled).
 * `metric` reads a health_metrics type instead of labs.
 */
export const AUTO = {
  'triglyceride-hdl-ratio': {
    need: ['Triglycerides', 'HDL'],
    compute: (v) => v.Triglycerides / v.HDL,
    fill: { tg: 'Triglycerides', hdl: 'HDL' },
    autoRun: true,
  },
  'non-hdl-cholesterol': {
    need: ['Total Cholesterol', 'HDL'],
    compute: (v) => v['Total Cholesterol'] - v.HDL,
    fill: { total: 'Total Cholesterol', hdl: 'HDL' },
    autoRun: true,
  },
  'homa-ir': {
    need: ['Glucose', 'Fasting Insulin'],
    compute: (v) => (v.Glucose * v['Fasting Insulin']) / 405,
    fill: { glucose: 'Glucose', insulin: 'Fasting Insulin' },
    autoRun: true,
  },
  'a1c-to-average-glucose': {
    need: ['HbA1c'],
    compute: (v) => 28.7 * v.HbA1c - 46.7,
    fill: { a1c: 'HbA1c' },
    autoRun: true,
  },
  // Labs report eGFR directly; the calculator also needs age and sex, so only
  // creatinine is pre-filled.
  'egfr-calculator': {
    need: ['eGFR'],
    compute: (v) => v.eGFR,
    fill: { creatinine: 'Creatinine' },
    autoRun: false,
  },
  'vo2-max-walk-test': { metric: 'vo2_max', label: 'Apple Health' },
};

const dayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Lab values grouped by day: [{ day, date, values: { marker: number } }], oldest first. */
export function labsByDay(labs) {
  const days = new Map();
  for (const r of labs) {
    const name = markerName(r.test_name);
    if (!name || !UNIT_OK[name]?.(r.unit)) continue;
    const value = Number(r.value);
    if (!Number.isFinite(value)) continue;
    const key = dayKey(r.date);
    if (!days.has(key)) days.set(key, { day: key, date: r.date, values: {} });
    days.get(key).values[name] = value;
  }
  return [...days.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Readings for a calculator worked out from labs: [{ date, value, source }]. */
export function readingsFromLabs(slug, days) {
  const cfg = AUTO[slug];
  if (!cfg?.need) return [];
  return days
    .filter((d) => cfg.need.every((n) => d.values[n] != null && d.values[n] !== 0))
    .map((d) => ({ date: d.date, value: cfg.compute(d.values), source: 'labs' }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
}

/** One reading per day (the last) from health_metrics rows. */
export function readingsFromMetrics(slug, rows) {
  const cfg = AUTO[slug];
  const byDay = new Map();
  for (const r of rows) byDay.set(dayKey(r.recorded_at), { date: r.recorded_at, value: Number(r.value), source: cfg?.label || 'app' });
  return [...byDay.values()].filter((p) => Number.isFinite(p.value)).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** The most recent day that has every marker this calculator pre-fills from. */
export function latestFill(slug, days) {
  const cfg = AUTO[slug];
  if (!cfg?.fill) return null;
  const wanted = Object.values(cfg.fill);
  for (let i = days.length - 1; i >= 0; i--) {
    if (wanted.every((n) => days[i].values[n] != null)) {
      const inputs = Object.fromEntries(Object.entries(cfg.fill).map(([id, n]) => [id, days[i].values[n]]));
      return { date: days[i].date, inputs, autoRun: cfg.autoRun };
    }
  }
  return null;
}

export { dayKey };
