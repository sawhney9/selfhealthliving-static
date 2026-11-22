// Internal linking for articles: related posts scored by shared topic words,
// plus the /tools calculator that matches the post's subject.

const STOPWORDS = new Set(
  `a an and are as at be but by can do does for from get how in is it its
  it's just more most not of on or our than that the their this to up what
  when why with you your yours self health living here's isn't don't one
  new best better almost actually really every`.split(/\s+/)
);

// Words that show up across most posts and carry no topical signal.
const GENERIC = new Set(['longevity', 'healthy', 'protein', 'high', 'recipe', 'guide']);

function topicWords(fm) {
  const text = [fm.title, fm.slug, fm.description, fm.recipe?.title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ');
  return new Set(text.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

/**
 * Up to `limit` posts most related to `current`. Shared topic words dominate;
 * the same pillar breaks ties, then recency.
 */
export function relatedPosts(current, allPosts, limit = 3) {
  const mine = topicWords(current);
  return allPosts
    .map((p) => p.frontmatter)
    .filter((fm) => fm.slug && fm.slug !== current.slug && fm.pillar)
    .map((fm) => {
      let score = 0;
      for (const w of topicWords(fm)) if (mine.has(w)) score += GENERIC.has(w) ? 0.5 : 2;
      if (fm.pillar === current.pillar) score += 1;
      return { fm, score };
    })
    .sort((a, b) => b.score - a.score || new Date(b.fm.date) - new Date(a.fm.date))
    .slice(0, limit)
    .map(({ fm }) => fm);
}

const TOOLS = [
  { match: /vo2|cardio|aerobic|hiit/, path: '/tools/vo2-max-walk-test/', name: 'VO2 Max Calculator (Walk Test)' },
  { match: /grip/, path: '/tools/grip-strength-tracker/', name: 'Grip Strength Tracker' },
  { match: /triglycerid|insulin|glucose|blood-sugar|cgm/, path: '/tools/triglyceride-hdl-ratio/', name: 'Triglyceride/HDL Ratio Calculator' },
  { match: /cholesterol|lipid|omega|fish-oil|fiber/, path: '/tools/non-hdl-cholesterol/', name: 'Non-HDL Cholesterol Calculator' },
  { match: /waist|visceral|belly/, path: '/tools/waist-to-height-ratio/', name: 'Waist-to-Height Ratio Calculator' },
];

// Only link calculators whose page is in this build, so a post never points
// at a tool that hasn't shipped.
const BUILT_TOOLS = new Set(
  Object.keys(import.meta.glob('../pages/tools/*.astro')).map(
    (p) => `/tools/${p.split('/').pop().replace(/\.astro$/, '')}/`
  )
);

/** The calculator matching this post's slug, or null. */
export function relatedTool(fm) {
  const slug = (fm.slug || '').toLowerCase();
  return TOOLS.find((t) => t.match.test(slug) && BUILT_TOOLS.has(t.path)) || null;
}
