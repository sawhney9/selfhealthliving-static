// Titles of on-site articles by URL path, for linking from tools and My Health.
const posts = import.meta.glob('../content/*/*.md', { eager: true });

const decode = (s) =>
  String(s).replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"');

export const ARTICLE_TITLES = Object.fromEntries(
  Object.values(posts)
    .map((p) => p.frontmatter)
    .filter((fm) => fm.pillar && fm.slug)
    .map((fm) => [`/${fm.pillar}/${fm.slug}/`, decode(fm.title)])
);

/** Titles for the given paths; throws at build time if any article is missing. */
export function articleTitles(paths) {
  const missing = paths.filter((p) => !ARTICLE_TITLES[p]);
  if (missing.length) throw new Error(`Guidance links to missing articles: ${missing.join(', ')}`);
  return Object.fromEntries(paths.map((p) => [p, ARTICLE_TITLES[p]]));
}
