// Lab marker lookup and status, matching the app's BloodMarkerRange logic.
import { MARKERS } from './markers.data.js';

export { MARKERS };

const byName = new Map(MARKERS.map((m) => [m.name.toLowerCase(), m]));

export function findMarker(testName) {
  return byName.get(String(testName || '').toLowerCase()) || null;
}

export const STATUS = {
  criticalLow: { label: 'Critical Low', tone: 'red' },
  low: { label: 'Below Optimal', tone: 'amber' },
  optimal: { label: 'Optimal', tone: 'green' },
  high: { label: 'Above Optimal', tone: 'amber' },
  criticalHigh: { label: 'Critical High', tone: 'red' },
};

/** Same thresholds as RangeBarData.status(for:) in the app; null when the marker has no range. */
export function markerStatus(marker, value) {
  const r = marker?.range;
  if (!r) return null;
  if (r.criticalLow != null && value < r.criticalLow) return 'criticalLow';
  if (value < r.normalLow) return 'criticalLow';
  if (value < r.optimalLow) return 'low';
  if (value <= r.optimalHigh) return 'optimal';
  if (value <= r.normalHigh) return 'high';
  if (r.criticalHigh != null && value > r.criticalHigh) return 'criticalHigh';
  return 'high';
}

/** 0–1 position of `value` on the marker's range bar (10% padding each side, as in the app). */
export function barPosition(marker, value) {
  const r = marker.range;
  const floor = r.criticalLow ?? r.normalLow;
  const ceil = r.criticalHigh ?? r.normalHigh;
  const span = ceil - floor;
  const lo = floor - span * 0.1;
  const hi = ceil + span * 0.1;
  const at = (v) => (hi > lo ? Math.max(0, Math.min(1, (v - lo) / (hi - lo))) : 0.5);
  return { value: at(value), optimalLow: at(r.optimalLow), optimalHigh: at(r.optimalHigh) };
}

export function formatMarkerValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return Math.abs(n) >= 100 ? n.toFixed(0) : String(Number(n.toFixed(2)));
}
