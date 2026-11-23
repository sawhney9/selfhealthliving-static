// HTML for a guidance block (see guidance.js). Shared by the calculator pages
// (rendered at build time) and My Health (rendered in the browser).
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function guidanceHtml(g, titles, { heading } = {}) {
  if (!g) return '';
  const title = heading || (g.direction === 'lower' ? 'How to bring it down' : 'How to bring it up');
  const tips = g.tips.map((t) => `<li class="flex gap-2"><span class="text-green-accent font-bold">•</span><span>${esc(t)}</span></li>`).join('');
  const read = g.read
    .filter((p) => titles[p])
    .map((p) => `<li><a href="${esc(p)}" class="text-green-accent font-semibold hover:underline">${esc(titles[p])}</a></li>`)
    .join('');
  const sources = g.sources
    .map((s) => `<li><a href="${esc(s.href)}" target="_blank" rel="noopener" class="text-slate-600 hover:text-slate-900 underline decoration-slate-300">${esc(s.label)} ↗</a></li>`)
    .join('');
  return `<div class="rounded-xl bg-green-accent/5 border border-green-accent/15 p-5">
    <p class="font-display font-bold text-slate-900 mb-3">${esc(title)}</p>
    <ul class="flex flex-col gap-2 text-sm text-slate-700 leading-relaxed mb-4">${tips}</ul>
    ${read ? `<p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Read on SelfHealth Living</p><ul class="flex flex-col gap-1.5 text-sm mb-4">${read}</ul>` : ''}
    ${sources ? `<p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trusted sources</p><ul class="flex flex-col gap-1.5 text-sm mb-4">${sources}</ul>` : ''}
    <p class="text-xs text-slate-400">General information, not medical advice. Talk to your doctor before changing medication or starting supplements.</p>
  </div>`;
}
