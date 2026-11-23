// Small "Set a goal" control used on calculator pages and My Health.
import { saveGoal, deleteGoal } from './healthData.js';

const btn = 'text-xs font-semibold cursor-pointer';
const field =
  'rounded-lg border border-black/10 px-2 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-accent/40';

/**
 * el: container element. metric: lab test_name or `tool:<slug>`.
 * suggestion: { target, direction } prefilled when no goal exists yet.
 * onChange(goal | null) runs after a save or removal.
 */
export function mountGoalEditor(el, { metric, goal, suggestion, unit = '', digits = 1, onChange }) {
  const sym = (d) => (d === 'at_most' ? '≤' : '≥');
  const show = (g) => (g ? `${sym(g.direction)} ${Number(g.target).toFixed(digits)}${unit ? ` ${unit}` : ''}` : '');

  function view() {
    el.innerHTML = goal
      ? `<div class="flex flex-wrap items-center gap-3 text-sm">
          <span class="inline-flex items-center gap-1.5 font-semibold text-indigo-600"><span class="inline-block w-4 border-t-2 border-dashed border-indigo-500"></span>Goal ${show(goal)}</span>
          <button type="button" data-edit class="${btn} text-slate-500 hover:text-slate-900">Edit</button>
          <button type="button" data-remove class="${btn} text-slate-400 hover:text-red-500">Remove</button>
        </div>`
      : `<button type="button" data-edit class="${btn} text-indigo-600 hover:underline">+ Set a goal</button>`;
    el.querySelector('[data-edit]').addEventListener('click', edit);
    el.querySelector('[data-remove]')?.addEventListener('click', async () => {
      try {
        await deleteGoal(metric);
        goal = null;
        onChange?.(null);
      } finally {
        view();
      }
    });
  }

  function edit() {
    const start = goal || suggestion || { target: '', direction: 'at_most' };
    el.innerHTML = `<form class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-slate-600">Goal:</span>
        <select class="${field}" data-dir>
          <option value="at_most"${start.direction === 'at_most' ? ' selected' : ''}>at most ≤</option>
          <option value="at_least"${start.direction === 'at_least' ? ' selected' : ''}>at least ≥</option>
        </select>
        <input type="number" step="any" required class="${field} w-24" data-target value="${start.target === '' ? '' : Number(start.target)}" />
        <span class="text-slate-500">${unit}</span>
        <button type="submit" class="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">Save</button>
        <button type="button" data-cancel class="${btn} text-slate-500 hover:text-slate-900">Cancel</button>
        <span data-msg class="text-xs text-red-500"></span>
      </form>`;
    const form = el.querySelector('form');
    el.querySelector('[data-cancel]').addEventListener('click', view);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const target = parseFloat(form.querySelector('[data-target]').value);
      const direction = form.querySelector('[data-dir]').value;
      if (!Number.isFinite(target)) return;
      try {
        await saveGoal(metric, target, direction);
        goal = { target, direction };
        onChange?.(goal);
        view();
      } catch {
        form.querySelector('[data-msg]').textContent = 'Couldn’t save. Try again.';
      }
    });
  }

  view();
}
