// SEO helpers: clean text excerpts and schema.org JSON-LD builders.

/**
 * Strip markdown/HTML down to plain text and optionally truncate on a word
 * boundary. Pass maxLen = 0 to keep the full text (used for recipe steps).
 */
export function stripToText(input = '', maxLen = 155) {
  const text = String(input)
    .replace(/```[\s\S]*?```/g, ' ')        // fenced code blocks
    .replace(/<[^>]+>/g, ' ')               // HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // markdown images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // markdown links -> text
    .replace(/[#>*_`~]+/g, ' ')             // markdown symbols
    .replace(/\s+/g, ' ')
    .trim();
  if (!maxLen || text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

/** Resolve a root-relative path to an absolute URL against the site origin. */
export function absoluteUrl(path, site) {
  if (!path) return undefined;
  try {
    return new URL(path, site).href;
  } catch {
    return path;
  }
}

/** Minutes -> ISO 8601 duration (e.g. 8 -> "PT8M"); undefined when non-positive. */
function minutesToISO(min) {
  const n = Number(min);
  return Number.isFinite(n) && n > 0 ? `PT${n}M` : undefined;
}

/** Recipe schema, or null when the post has no recipe. */
export function recipeJsonLd(fm, { url, site, description } = {}) {
  const r = fm.recipe;
  if (!r) return null;

  const img = absoluteUrl(fm.featured_image, site);
  const prep = minutesToISO(r.prep_time);
  const cook = minutesToISO(r.cook_time);
  const total = minutesToISO(r.total_time);

  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title || fm.title,
    author: { '@type': 'Organization', name: 'Self Health Living' },
    ...(img && { image: [img] }),
    ...(fm.date && { datePublished: fm.date }),
    ...(description && { description }),
    ...(prep && { prepTime: prep }),
    ...(cook && { cookTime: cook }),
    ...(total && { totalTime: total }),
    ...(r.servings && {
      recipeYield: `${r.servings} ${r.servings_unit || 'servings'}`.trim(),
    }),
    ...(url && { mainEntityOfPage: url }),
  };

  if (Array.isArray(r.ingredients) && r.ingredients.length) {
    obj.recipeIngredient = r.ingredients.map((i) =>
      [i.amount, i.unit, i.name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    );
  }
  if (Array.isArray(r.instructions) && r.instructions.length) {
    obj.recipeInstructions = r.instructions.map((step) => ({
      '@type': 'HowToStep',
      text: stripToText(step, 0),
    }));
  }
  return obj;
}

/** BlogPosting schema for any article. */
export function articleJsonLd(fm, { url, site, description } = {}) {
  const img = absoluteUrl(fm.featured_image, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: fm.title,
    author: { '@type': 'Organization', name: 'Self Health Living' },
    publisher: {
      '@type': 'Organization',
      name: 'Self Health Living',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/images/brand/logo-actual.png', site),
      },
    },
    ...(img && { image: [img] }),
    ...(fm.date && { datePublished: fm.date, dateModified: fm.date }),
    ...(description && { description }),
    ...(url && { mainEntityOfPage: url }),
  };
}
