// Compact trend chart for a marker or calculator reading: soft Above / Optimal
// / Below zones, a dot per reading, the latest value called out, and the
// person's goal as a dashed line. Returns an SVG string; each dot has a <title>
// so hovering (or long-press) shows the date and value.

const W = 600;
const H = 150;
const PAD = { top: 12, right: 64, bottom: 24, left: 8 };

const fmtShort = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short' })} ’${String(d.getFullYear()).slice(2)}`;
};
const fmtLong = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const GREEN = '#00A36C';
const withUnit = (text, unit) => (unit ? (unit === '%' ? `${text}%` : `${text} ${unit}`) : text);
const AMBER = '#D97706';
const INDIGO = '#6366F1';

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
  const hasBand = band && (band.low != null || band.high != null);

  // y domain zooms to the readings (and goal); a zone edge is pulled in only
  // when it's near them, so a wide optimal zone can't squash the trend.
  const core = goal ? [...values, goal.target] : [...values];
  const dLo = Math.min(...core);
  const dHi = Math.max(...core);
  const dSpan = Math.max(dHi - dLo, Math.abs(dHi) * 0.08, 10 ** -digits * 4);
  const marks = [...core];
  for (const edge of [band?.low, band?.high]) {
    if (edge != null && edge >= dLo - dSpan * 1.2 && edge <= dHi + dSpan * 1.2) marks.push(edge);
  }
  let lo = Math.min(...marks);
  let hi = Math.max(...marks);
  const span = hi - lo || dSpan;
  lo -= span * 0.3;
  hi += span * 0.3;
  if (dLo >= 0 && lo < 0) lo = 0;

  const times = points.map((p) => new Date(p.date).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const inset = 18; // keep end dots off the edges
  const x = (i) =>
    PAD.left + inset +
    (points.length === 1 ? (plotW - inset * 2) / 2 : t1 > t0 ? ((times[i] - t0) / (t1 - t0)) * (plotW - inset * 2) : (i / (points.length - 1)) * (plotW - inset * 2));
  const y = (v) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH;
  const right = PAD.left + plotW;
  const clampY = (v) => Math.min(Math.max(y(v), PAD.top), PAD.top + plotH);

  const parts = [];
  const zoneLabel = (text, y1, y2, color) => {
    if (y2 - y1 < 14) return;
    parts.push(`<text x="${right + 10}" y="${(y1 + y2) / 2 + 3.5}" font-size="11" font-weight="600" letter-spacing="0.06em" fill="${color}">${text}</text>`);
  };

  // Zones
  if (hasBand) {
    const top = band.high != null ? clampY(band.high) : PAD.top;
    const bottom = band.low != null ? clampY(band.low) : PAD.top + plotH;
    if (band.high != null && top > PAD.top) {
      parts.push(`<rect x="${PAD.left}" y="${PAD.top}" width="${plotW}" height="${top - PAD.top}" fill="${AMBER}" fill-opacity="0.06" />`);
      zoneLabel('ABOVE', PAD.top, top, '#B45309');
    }
    parts.push(`<rect x="${PAD.left}" y="${top}" width="${plotW}" height="${Math.max(0, bottom - top)}" fill="${GREEN}" fill-opacity="0.11" />`);
    zoneLabel('OPTIMAL', top, bottom, GREEN);
    // Zone edges with their values, so the boundary reads as a number
    for (const edge of [band.low, band.high]) {
      if (edge == null || y(edge) <= PAD.top || y(edge) >= PAD.top + plotH) continue;
      parts.push(`<line x1="${PAD.left}" x2="${right}" y1="${y(edge)}" y2="${y(edge)}" stroke="${GREEN}" stroke-opacity="0.35" stroke-width="1" />`);
      parts.push(`<text x="${PAD.left + 5}" y="${y(edge) - 4}" font-size="10.5" fill="#64748B">${fmt(edge)}</text>`);
    }
    if (band.low != null && bottom < PAD.top + plotH) {
      parts.push(`<rect x="${PAD.left}" y="${bottom}" width="${plotW}" height="${PAD.top + plotH - bottom}" fill="${AMBER}" fill-opacity="0.06" />`);
      zoneLabel('BELOW', bottom, PAD.top + plotH, '#B45309');
    }
  } else {
    parts.push(`<rect x="${PAD.left}" y="${PAD.top}" width="${plotW}" height="${plotH}" fill="#F1F5F9" fill-opacity="0.6" />`);
  }

  // Goal
  if (goal) {
    const gy = clampY(goal.target);
    parts.push(`<line x1="${PAD.left}" x2="${right}" y1="${gy}" y2="${gy}" stroke="${INDIGO}" stroke-width="1.25" stroke-dasharray="4 4" />`);
    parts.push(`<text x="${right + 10}" y="${gy + 3.5}" font-size="11" font-weight="700" fill="${INDIGO}">GOAL</text>`);
  }

  // Connecting line, kept quiet so the dots carry the story
  if (points.length > 1) {
    const d = points.map((_, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(values[i]).toFixed(1)}`).join(' ');
    parts.push(`<path d="${d}" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-linejoin="round" />`);
  }

  // Dots
  const li = points.length - 1;
  points.forEach((p, i) => {
    const ok = goal ? meetsGoal(goal, values[i]) : inBand(band, values[i]);
    const color = ok == null ? '#334155' : ok ? GREEN : AMBER;
    const tip = `<title>${fmtLong(p.date)}: ${withUnit(fmt(values[i]), unit)}</title>`;
    if (i === li) {
      parts.push(`<circle cx="${x(i)}" cy="${y(values[i])}" r="10" fill="${color}" fill-opacity="0.15" />`);
      parts.push(`<circle cx="${x(i)}" cy="${y(values[i])}" r="5.5" fill="${color}" stroke="#fff" stroke-width="2">${tip}</circle>`);
    } else {
      parts.push(`<circle cx="${x(i)}" cy="${y(values[i])}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5">${tip}</circle>`);
    }
  });

  // Latest value pill
  const label = fmt(values[li]);
  const pw = label.length * 7 + 14;
  const px = Math.min(Math.max(x(li) - pw / 2, PAD.left), right - pw);
  const above = y(values[li]) - 30 >= PAD.top - 4;
  const py = above ? y(values[li]) - 30 : y(values[li]) + 12;
  parts.push(`<rect x="${px}" y="${py}" width="${pw}" height="18" rx="9" fill="#0F172A" />`);
  parts.push(`<text x="${px + pw / 2}" y="${py + 12.5}" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${label}</text>`);

  // Dates: every point when there are few, otherwise first / middle / last
  const ticks = points.length <= 5 ? points.map((_, i) => i) : [0, Math.floor(li / 2), li];
  let lastX = -Infinity;
  for (const i of ticks) {
    if (x(i) - lastX < 44 && i !== li) continue;
    lastX = x(i);
    parts.push(`<text x="${x(i)}" y="${H - 6}" font-size="11" fill="#94A3B8" text-anchor="middle">${fmtShort(points[i].date)}</text>`);
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto block" role="img" aria-label="Trend chart, latest ${withUnit(label, unit)}">${parts.join('')}</svg>`;
}

/** One-line plain-English read of where the latest value sits. */
export function trendSummary({ points, band = null, goal = null, unit = '', digits = 1 }) {
  if (!points.length) return '';
  const fmt = (v) => withUnit(Number(Math.abs(v)).toFixed(digits), unit);
  const latest = Number(points[points.length - 1].value);
  const bits = [];
  if (goal) {
    const gap = latest - goal.target;
    bits.push(
      meetsGoal(goal, latest)
        ? 'You’re meeting your goal.'
        : `${fmt(gap)} ${gap > 0 ? 'above' : 'below'} your goal.`
    );
  } else if (band) {
    if (band.high != null && latest > band.high) bits.push(`${fmt(latest - band.high)} above optimal.`);
    else if (band.low != null && latest < band.low) bits.push(`${fmt(band.low - latest)} below optimal.`);
    else bits.push('In the optimal zone.');
  }
  if (points.length > 1) {
    const prev = Number(points[points.length - 2].value);
    const diff = latest - prev;
    if (Math.abs(diff) >= 10 ** -digits) bits.push(`${diff > 0 ? 'Up' : 'Down'} ${fmt(diff)} since ${fmtLong(points[points.length - 2].date)}.`);
    else bits.push(`No change since ${fmtLong(points[points.length - 2].date)}.`);
  }
  return bits.join(' ');
}
