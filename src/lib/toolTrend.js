// Shared "save and track" behaviour for the /tools calculators. Signed in,
// readings go to the account (tool_entries, plus the raw lab markers to
// lab_results so the SelfHealth app sees them); signed out they stay in this
// browser's localStorage, and can be moved into the account after sign-in.
import { watchSession, loginUrl } from './auth.js';
import {
  addToolEntries,
  addLabResults,
  fetchToolEntries,
  deleteToolEntry,
  dateToTimestamp,
  fetchGoals,
  fetchLabResults,
  fetchHealthMetrics,
} from './healthData.js';
import { AUTO, labsByDay, readingsFromLabs, readingsFromMetrics, latestFill, dayKey } from './autoReadings.js';
import { trendChart, trendSummary } from './trendChart.js';
import { mountGoalEditor } from './goalEditor.js';

function loadLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function storeLocal(key, entries) {
  try {
    if (entries.length) localStorage.setItem(key, JSON.stringify(entries));
    else localStorage.removeItem(key);
  } catch {}
}

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Wire up a calculator page. Expects #account-panel, #save-row, #history in the page.
 * Call the returned `ready(value, { inputs, labs, fasting })` after each calculation.
 */
export function initTrend({ slug: tool, storageKey, unit = '', digits = 1, band = null, better = 'lower' }) {
  const panel = document.getElementById('account-panel');
  const saveRow = document.getElementById('save-row');
  const historyEl = document.getElementById('history');
  if (!saveRow || !historyEl) return { ready() {} };

  const dateInput = saveRow.querySelector('[data-save-date]');
  const saveBtn = saveRow.querySelector('[data-save-btn]');
  const statusEl = saveRow.querySelector('[data-save-status]');
  dateInput.value = todayInput();
  dateInput.max = todayInput();

  const fmt = (v) => `${Number(v).toFixed(digits)}${unit ? ` ${unit}` : ''}`;
  let session = null;
  let pending = null;
  let goal = null;
  let prefilled = null; // inputs filled in from the person's labs, so they aren't re-saved
  const auto = AUTO[tool];
  const form = document.getElementById('calc-form');
  const fillNote = document.createElement('p');
  fillNote.className = 'hidden text-sm text-slate-600 mb-5 rounded-lg bg-green-accent/5 border border-green-accent/15 px-4 py-2.5';
  form?.before(fillNote);

  // Goal control sits above the history; only shown when signed in.
  const goalEl = document.createElement('div');
  goalEl.className = 'mb-4 hidden';
  historyEl.before(goalEl);
  const suggestion = () => ({
    direction: better === 'higher' ? 'at_least' : 'at_most',
    target: better === 'higher' ? band?.low ?? '' : band?.high ?? '',
  });

  function renderPanel() {
    if (!panel) return;
    panel.querySelector('[data-signed-out]').classList.toggle('hidden', Boolean(session));
    panel.querySelector('[data-signed-in]').classList.toggle('hidden', !session);
    panel.querySelector('[data-login-link]').href = loginUrl();
    if (session) panel.querySelector('[data-user-email]').textContent = session.user.email || '';
  }

  function renderRows(entries, { onDelete }) {
    if (!entries.length) {
      historyEl.innerHTML = '<p class="text-sm text-slate-400">No readings yet. Save a result above to start your trend.</p>';
      return;
    }
    const rows = entries
      .slice()
      .reverse()
      .map(
        (e, i) => `<tr class="border-b border-black/6 last:border-0">
          <td class="py-2 pr-6 text-slate-500 whitespace-nowrap">${fmtDate(e.date)}</td>
          <td class="py-2 pr-4 font-semibold text-slate-900 whitespace-nowrap">${fmt(e.value)}</td>
          <td class="py-2 w-full text-xs text-slate-400">${e.source ? (e.source === 'labs' ? 'From your labs' : `From ${e.source}`) : ''}</td>
          <td class="py-2 text-right whitespace-nowrap">${e.source ? '' : `<button type="button" data-del="${entries.length - 1 - i}" class="text-xs font-semibold text-slate-400 hover:text-red-500 cursor-pointer">Delete</button>`}</td>
        </tr>`
      )
      .join('');
    const opts = { points: entries, band, goal, unit, digits };
    historyEl.innerHTML = `<div class="rounded-xl border border-black/6 bg-white p-3 mb-3">${trendChart(opts)}</div>
      <p class="text-sm text-slate-600 mb-4">${trendSummary(opts)}</p>
      <details${entries.length <= 3 ? ' open' : ''}><summary class="list-none cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-900">All readings (${entries.length}) ▾</summary>
        <table class="w-full text-sm mt-2"><tbody>${rows}</tbody></table>
      </details>`;
    historyEl.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Two-step so a stray tap doesn't lose a reading.
        if (btn.dataset.armed) return onDelete(entries[Number(btn.dataset.del)]);
        btn.dataset.armed = '1';
        btn.textContent = 'Confirm delete';
        btn.classList.add('text-red-500');
      });
    });
  }

  async function renderHistory() {
    const local = loadLocal(storageKey);
    if (!session) {
      goal = null;
      goalEl.classList.add('hidden');
      renderRows(local, {
        onDelete: (entry) => {
          storeLocal(storageKey, local.filter((e) => e !== entry));
          renderHistory();
        },
      });
      return;
    }
    historyEl.innerHTML = '<p class="text-sm text-slate-400">Loading your readings…</p>';
    try {
      const [rows, goals, labs, metrics] = await Promise.all([
        fetchToolEntries(tool),
        fetchGoals(),
        auto?.need || auto?.fill ? fetchLabResults().catch(() => []) : [],
        auto?.metric ? fetchHealthMetrics(auto.metric).catch(() => []) : [],
      ]);
      const days = labsByDay(labs);
      // Saved readings win; account data fills in the days without one.
      const saved = rows.map((r) => ({ id: r.id, date: r.recorded_at, value: r.value }));
      const savedDays = new Set(saved.map((e) => dayKey(e.date)));
      const derived = [...readingsFromLabs(tool, days), ...readingsFromMetrics(tool, metrics)].filter(
        (p) => !savedDays.has(dayKey(p.date))
      );
      const entries = [...saved, ...derived].sort((a, b) => new Date(a.date) - new Date(b.date));
      prefillFromLabs(days);
      goal = goals[`tool:${tool}`] || null;
      mountGoalEditor(goalEl, {
        metric: `tool:${tool}`,
        goal,
        suggestion: suggestion(),
        unit,
        digits,
        onChange: (g) => {
          goal = g;
          renderHistory();
        },
      });
      goalEl.classList.remove('hidden');
      renderRows(entries, {
          onDelete: async (entry) => {
            await deleteToolEntry(entry.id);
            renderHistory();
          },
        });
      if (derived.length) {
        const note = document.createElement('p');
        note.className = 'text-xs text-slate-400 mt-3';
        note.textContent =
          auto?.metric
            ? `Includes ${derived.length} reading${derived.length === 1 ? '' : 's'} from Apple Health, synced by the SelfHealth app.`
            : `Includes ${derived.length} reading${derived.length === 1 ? '' : 's'} worked out from lab results in your account.`;
        historyEl.appendChild(note);
      }
      if (local.length) offerImport(local);
    } catch {
      historyEl.innerHTML = '<p class="text-sm text-red-500">Couldn’t load your readings. Refresh to try again.</p>';
    }
  }

  // Fill the form from the latest labs (once, and only if it's still empty),
  // and run the calculation when every input is covered.
  function prefillFromLabs(days) {
    if (!form || prefilled || !auto?.fill) return;
    const fill = latestFill(tool, days);
    if (!fill) return;
    const fields = Object.keys(fill.inputs).map((id) => document.getElementById(id));
    if (fields.some((el) => !el || el.value)) return;
    fields.forEach((el) => (el.value = String(fill.inputs[el.id])));
    prefilled = fill.inputs;
    fillNote.textContent = fill.autoRun
      ? `Filled in from your labs on ${fmtDate(fill.date)}. Change any value to try a different result.`
      : `Creatinine filled in from your labs on ${fmtDate(fill.date)}. Add your age and sex to calculate.`;
    fillNote.classList.remove('hidden');
    if (fill.autoRun) form.requestSubmit();
  }

  function offerImport(local) {
    const box = document.createElement('div');
    box.className = 'mt-5 p-4 rounded-lg bg-green-accent/5 border border-green-accent/20 text-sm text-slate-600';
    box.innerHTML = `${local.length} reading${local.length === 1 ? ' is' : 's are'} saved only on this device.
      <button type="button" class="ml-1 font-semibold text-green-accent hover:underline cursor-pointer">Add to my account</button>`;
    box.querySelector('button').addEventListener('click', async () => {
      box.textContent = 'Adding…';
      try {
        await addToolEntries(local.map((e) => ({ tool, value: e.value, unit, recorded_at: e.date })));
        storeLocal(storageKey, []);
        renderHistory();
      } catch {
        box.textContent = 'Couldn’t add them. Try again later.';
      }
    });
    historyEl.appendChild(box);
  }

  saveBtn.addEventListener('click', async () => {
    if (!pending) return;
    saveBtn.disabled = true;
    statusEl.textContent = 'Saving…';
    const day = dateInput.value || todayInput();
    try {
      if (session) {
        await addToolEntries([{ tool, value: pending.value, unit, inputs: pending.inputs, recorded_at: dateToTimestamp(day) }]);
        if (pending.labs?.length) await addLabResults(pending.labs, { day, fasting: pending.fasting ?? null });
        statusEl.textContent = pending.labs?.length
          ? 'Saved to your account. Your lab values are in the SelfHealth app too.'
          : 'Saved to your account.';
      } else {
        const local = loadLocal(storageKey);
        local.push({ date: dateToTimestamp(day), value: pending.value });
        local.sort((a, b) => new Date(a.date) - new Date(b.date));
        storeLocal(storageKey, local);
        statusEl.innerHTML = `Saved on this device. <a href="${loginUrl()}" class="font-semibold text-green-accent hover:underline">Sign in</a> to keep it in your account.`;
      }
      pending = null;
      renderHistory();
    } catch {
      statusEl.textContent = 'Couldn’t save. Check your connection and try again.';
      saveBtn.disabled = false;
    }
  });

  const stop = watchSession((s) => {
    const changed = (s?.user?.id || null) !== (session?.user?.id || null);
    session = s;
    renderPanel();
    if (changed || !historyEl.innerHTML) renderHistory();
  });
  document.addEventListener('astro:before-swap', stop, { once: true });

  return {
    ready(value, { inputs = {}, labs = [], fasting = null } = {}) {
      // The pre-filled lab values are already in the trend; don't offer to save them again.
      if (prefilled && Object.entries(prefilled).every(([k, v]) => Number(inputs[k]) === Number(v))) {
        pending = null;
        saveRow.classList.add('hidden');
        return;
      }
      pending = { value, inputs, labs, fasting };
      saveRow.classList.remove('hidden');
      saveBtn.disabled = false;
      statusEl.textContent = '';
    },
  };
}
