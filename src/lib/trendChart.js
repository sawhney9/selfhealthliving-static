// Trend chart for a marker or calculator reading: values over time, with the
// optimal zone shaded and the person's goal drawn as a dashed line. Returns an
// SVG string; each point has a <title> so hovering (or long-press) shows it.

const W = 640;
const H = 220;
const PAD = { top: 18, right: 64, bottom: 30, left: 12 };

const fmtShort = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
const fmtLong = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Whether a value meets a goal ({ target, direction: 'at_most' | 'at_least' }). */
export function meetsGoal(goal, value) {
  if (!goal) return null;
  return goal.direction === 'at_most' ? value <= goal.target : value >= goal.target;
}

function inBand(band, v) {
  if (!band) return null;
  return (band.low == null || v >= band.low) && (band.high == null || v <= band.high);
}

/**
 * points: [{ date, value }] oldest first.
 * band: { low, high } optimal zone (either side may be null/undefined).
 * goal: { target, direction }.
 */
export function trendChart({ points, band = null, goal = null, unit = '', digits = 1 }) {
  if (!points.length) return '';
  const fmt = (v) => Number(v).toFixed(digits);
  const values = points.map((p) => Number(p.value));

  // y domain covers the readings, the zone edges and the goal, with headroom.
  const marks = [...values];
  if (band?.low != null) marks.push(band.low);
  if (band?.high != null) marks.push(band.high);
  if (goal) marks.push(goal.target);
  let lo = Math.min(...marks);
  let hi = Math.max(...marks);
  const span = hi - lo || Math.abs(hi) * 0.2 || 1;
  lo -= span * 0.15;
  hi += span * 0.15;
  // A one-sided zone ("below 2", "above 90") gets enough room to read as a zone.
  if (band && band.low == null && band.high != null) lo = Math.min(lo, band.high - (hi - band.high) * 0.5);
  if (band && band.high == null && band.low != null) hi = Math.max(hi, band.low + (band.low - lo) * 0.5);
  if (Math.min(...marks) >= 0 && lo < 0) lo = 0;

  const times = points.map((p) => new Date(p.date).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i) =>
    PAD.left + (t1 > t0 ? ((times[i] - t0) / (t1 - t0)) * plotW : points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH;
  const right = W - PAD.right;

  const parts = [];

  // Optimal zone
  if (band && (band.low != null || band.high != null)) {
    const top = y(band.high != null ? Math.min(band.high, hi) : hi);
    const bottom = y(band.low != null ? Math.max(band.low, lo) : lo);
    parts.push(`<rect x="${PAD.left}" y="${top}" width="${plotW}" height="${Math.max(0, bottom - top)}" fill="#00A36C" fill-opacity="0.10" />`);
    for (const edge of [band.low, band.high]) {
      if (edge == null || edge < lo || edge > hi) continue;
      parts.push(`<line x1="${PAD.left}" x2="${right}" y1="${y(edge)}" y2="${y(edge)}" stroke="#00A36C" stroke-opacity="0.35" stroke-width="1" />`);
      parts.push(`<text x="${right + 6}" y="${y(edge) + 4}" font-size="11" fill="#00A36C">${fmt(edge)}</text>`);
    }
    parts.push(`<text x="${PAD.left + 6}" y="${top + 14}" font-size="11" font-weight="600" fill="#00A36C">Optimal zone</text>`);
  }

  // Goal line
  if (goal) {
    const gy = y(goal.target);
    parts.push(`<line x1="${PAD.left}" x2="${right}" y1="${gy}" y2="${gy}" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="6 5" />`);
    parts.push(`<text x="${right + 6}" y="${gy + 4}" font-size="11" font-weight="700" fill="#6366F1">Goal</text>`);
  }

  // Line and points
  if (points.length > 1) {
    const d = points.map((_, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(values[i]).toFixed(1)}`).join(' ');
    parts.push(`<path d="${d}" fill="none" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`);
  }
  points.forEach((p, i) => {
    const ok = goal ? meetsGoal(goal, values[i]) : inBand(band, values[i]);
    const color = ok == null ? '#0F172A' : ok ? '#00A36C' : '#D97706';
    const last = i === points.length - 1;
    parts.push(
      `<circle cx="${x(i)}" cy="${y(values[i])}" r="${last ? 6 : 4.5}" fill="${color}" stroke="#fff" stroke-width="2"><title>${fmtLong(p.date)}: ${fmt(values[i])}${unit ? ` ${unit}` : ''}</title></circle>`
    );
  });

  // Latest value label
  const li = points.length - 1;
  const lx = Math.min(Math.max(x(li), PAD.left + 30), right - 30);
  const ly = y(values[li]) - 12 < PAD.top + 4 ? y(values[li]) + 22 : y(values[li]) - 12;
  parts.push(`<text x="${lx}" y="${ly}" font-size="13" font-weight="700" fill="#0F172A" text-anchor="middle">${fmt(values[li])}</text>`);

  // Date axis: first, last, and a middle tick when there's room
  const ticks = new Set([0, li]);
  if (points.length > 4) ticks.add(Math.floor(li / 2));
  for (const i of ticks) {
    const anchor = ticks.size > 1 && i === 0 ? 'start' : i === li && li > 0 ? 'end' : 'middle';
    parts.push(`<text x="${x(i)}" y="${H - 8}" font-size="11" fill="#94A3B8" text-anchor="${anchor}">${fmtShort(points[i].date)}</text>`);
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Trend chart, latest ${fmt(values[li])}${unit ? ` ${unit}` : ''}">${parts.join('')}</svg>`;
}

/** One-line plain-English read of where the latest value sits. */
export function trendSummary({ points, band = null, goal = null, unit = '', digits = 1 }) {
  if (!points.length) return '';
  const fmt = (v) => `${Number(Math.abs(v)).toFixed(digits)}${unit ? ` ${unit}` : ''}`;
  const latest = Number(points[points.length - 1].value);
  const bits = [];
  if (goal) {
    const gap = latest - goal.target;
    bits.push(
      meetsGoal(goal, latest)
        ? 'You’re meeting your goal.'
        : `${fmt(gap)} ${gap > 0 ? 'above' : 'below'} your goal of ${goal.direction === 'at_most' ? '≤' : '≥'} ${Number(goal.target).toFixed(digits)}.`
    );
  } else if (band) {
    if (band.high != null && latest > band.high) bits.push(`${fmt(latest - band.high)} above the optimal zone.`);
    else if (band.low != null && latest < band.low) bits.push(`${fmt(band.low - latest)} below the optimal zone.`);
    else bits.push('In the optimal zone.');
  }
  if (points.length > 1) {
    const prev = Number(points[points.length - 2].value);
    const diff = latest - prev;
    if (Math.abs(diff) >= 10 ** -digits) bits.push(`${diff > 0 ? 'Up' : 'Down'} ${fmt(diff)} since ${fmtLong(points[points.length - 2].date)}.`);
    else bits.push(`Unchanged since ${fmtLong(points[points.length - 2].date)}.`);
  }
  return bits.join(' ');
}
