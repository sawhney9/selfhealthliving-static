// Shared "save and track" behaviour for the /tools calculators. Signed in,
// readings go to the account (tool_entries, plus the raw lab markers to
// lab_results so the SelfHealth app sees them); signed out they stay in this
// browser's localStorage, and can be moved into the account after sign-in.
import { watchSession, loginUrl } from './auth.js';
import { addToolEntries, addLabResults, fetchToolEntries, deleteToolEntry, dateToTimestamp } from './healthData.js';

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

function sparkline(values) {
  const w = 320, h = 60, pad = 6;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-16" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="#00A36C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
  </svg>`;
}

/**
 * Wire up a calculator page. Expects #account-panel, #save-row, #history in the page.
 * Call the returned `ready(value, { inputs, labs, fasting })` after each calculation.
 */
export function initTrend({ slug: tool, storageKey, unit = '', digits = 1 }) {
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
          <td class="py-2 w-full font-semibold text-slate-900">${fmt(e.value)}</td>
          <td class="py-2 text-right whitespace-nowrap"><button type="button" data-del="${entries.length - 1 - i}" class="text-xs font-semibold text-slate-400 hover:text-red-500 cursor-pointer">Delete</button></td>
        </tr>`
      )
      .join('');
    const chart = entries.length > 1 ? `<div class="mb-4">${sparkline(entries.map((e) => Number(e.value)))}</div>` : '';
    historyEl.innerHTML = `${chart}
      <table class="w-full text-sm"><tbody>${rows}</tbody></table>`;
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
      const rows = await fetchToolEntries(tool);
      renderRows(
        rows.map((r) => ({ id: r.id, date: r.recorded_at, value: r.value })),
        {
          onDelete: async (entry) => {
            await deleteToolEntry(entry.id);
            renderHistory();
          },
        }
      );
      if (local.length) offerImport(local);
    } catch {
      historyEl.innerHTML = '<p class="text-sm text-red-500">Couldn’t load your readings. Refresh to try again.</p>';
    }
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
      pending = { value, inputs, labs, fasting };
      saveRow.classList.remove('hidden');
      saveBtn.disabled = false;
      statusEl.textContent = '';
    },
  };
}
