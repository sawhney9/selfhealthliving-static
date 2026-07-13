# Recipe reels

Turns an approved **fuel** (recipe) post into a vertical, silent MP4 for Instagram
Reels / TikTok. Silent by design — you add a trending sound in-app, which is what
drives reach. Nothing here posts to social; it only builds the file (and can email you).

## Run it

```bash
npm run reel -- <slug>              # writes ~/Downloads/<slug>_reel.mp4
npm run reel -- <slug> --email      # also emails REVIEW_EMAIL with the file attached
npm run reel -- <slug> --out DIR    # write somewhere else
```

`<slug>` is the recipe filename under `src/content/fuel/` without `.md`
(e.g. `gut-and-glow-smoothie`).

## What it does

1. Reads `src/content/fuel/<slug>.md` (title, `featured_image`, ingredient names).
2. Asks Claude for the on-screen copy — hook, one nutrient callout per ingredient,
   and outro — grounded in the recipe's own stated benefits (uses the site voice).
3. Maps each ingredient to a vetted photo in `ingredients/` via `ingredients/manifest.json`.
4. Picks an accent color from the smoothie photo automatically (or from `accents.json`
   when a hero is too low-res / garnish-heavy to read reliably).
5. Renders 1080x1920 scenes (`render_scenes.py`) and assembles them with a gentle
   Ken Burns zoom + crossfades (`build_video.sh`).

## Requirements

- `python3` + Pillow (`pip install pillow`)
- `ffmpeg` — auto-found at `~/.local/bin/ffmpeg`, else `$REEL_FFMPEG`, else PATH.
- Env (from `.env`, loaded by the npm script): `ANTHROPIC_API_KEY`, and for `--email`
  also `RESEND_API_KEY` + `REVIEW_EMAIL`.

## Adding an ingredient

If a recipe uses an ingredient with no photo yet, it is skipped (no card) and the run
warns you. To include it: add a vetted square-ish photo to `ingredients/<name>.jpg` and
an entry to `manifest.json` mapping the ingredient's wording to that file.

## Auto-trigger (not wired yet)

To fire this on approval instead of by hand: in `workers/approval/index.js`
`handleApprove`, after a successful `fuel` commit, call the GitHub API to dispatch a
workflow that installs ffmpeg + Pillow, runs this generator for the slug, and emails a
download link. Kept manual for now so the live approval button is untouched.
