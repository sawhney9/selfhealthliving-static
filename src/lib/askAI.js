// "Ask AI about this result": a picker (Claude / ChatGPT / Gemini / Perplexity,
// or copy the question) plus a button that opens the chosen assistant in a new tab with
// the question filled in. The choice is remembered as the default on this
// device. Nothing is sent anywhere by us; the question only travels in the link
// the person chooses to open, and it never includes their name or email.

const TARGETS = {
  claude: { label: 'Claude', url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  chatgpt: { label: 'ChatGPT', url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  // Gemini has no prefill link, so its question is copied for pasting.
  gemini: { label: 'Gemini', url: () => 'https://gemini.google.com/app', paste: true },
  perplexity: { label: 'Perplexity', url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
  copy: { label: 'Copy question' },
};
const KEY = 'shl-ask-ai';

function savedChoice() {
  try {
    const v = localStorage.getItem(KEY);
    return v && TARGETS[v] ? v : 'claude';
  } catch {
    return 'claude';
  }
}

export const AI_NOTE =
  'Explain this for education, not as a diagnosis. Keep it plain-English, mention common and less common causes, what else is usually checked alongside it, and questions I could ask my doctor.';

export function askAIHtml() {
  const options = Object.entries(TARGETS)
    .map(([k, t]) => `<option value="${k}">${t.label}</option>`)
    .join('');
  return `<div data-ask-ai class="rounded-xl border border-black/6 bg-white px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
    <p class="text-sm font-semibold text-slate-700 mr-auto">Have questions about this result?</p>
    <select data-ai-pick aria-label="Choose an AI assistant" class="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-accent/40 cursor-pointer">${options}</select>
    <a data-ai-go href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">Ask</a>
    <p data-ai-status class="w-full text-xs text-slate-400">Opens in a new tab with your result filled in. Your choice is remembered on this device.</p>
  </div>`;
}

/** Wire up every picker inside `root`; getPrompt() builds the question when clicked. */
export function bindAskAI(root, getPrompt) {
  root.querySelectorAll('[data-ask-ai]').forEach((box) => {
    const pick = box.querySelector('[data-ai-pick]');
    const go = box.querySelector('[data-ai-go]');
    const status = box.querySelector('[data-ai-status]');
    const sync = () => {
      const t = TARGETS[pick.value];
      go.textContent = pick.value === 'copy' ? 'Copy' : `Ask ${t.label} ↗`;
      go.href = t.url ? t.url(getPrompt()) : '#';
    };
    pick.value = savedChoice();
    sync();
    pick.addEventListener('change', () => {
      try {
        localStorage.setItem(KEY, pick.value);
      } catch {}
      sync();
    });
    go.addEventListener('click', async (e) => {
      const t = TARGETS[pick.value];
      if (t.paste) {
        // Copy, then let the link open Gemini.
        try {
          await navigator.clipboard.writeText(getPrompt());
          status.textContent = 'Question copied. Paste it into Gemini (⌘V or Ctrl+V).';
        } catch {
          status.textContent = 'Your browser blocked copying. Choose Copy question instead.';
        }
        return;
      }
      if (pick.value !== 'copy') return; // the link opens the assistant
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(getPrompt());
        status.textContent = 'Copied. Paste it into any AI assistant, like Gemini.';
      } catch {
        status.textContent = 'Your browser blocked copying.';
      }
    });
  });
}
