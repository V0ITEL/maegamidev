# maegamidev

Source of my studio site: https://maegamidev.vercel.app

Static HTML/CSS/JS. No framework, no build step, no dependencies. Two main pages: the landing and a technical case study of [euphoria-parfum.com.ua](https://euphoria-parfum.com.ua), the e-commerce store I built and operate myself.

## i18n without a framework

The site runs in three languages (UA/RU/EN). Russian is the source of truth in the DOM, English and Ukrainian live in plain dictionaries keyed by normalized source strings, switching a language rewrites text nodes and nothing else. Language detection order: saved manual choice first, then country by IP (1.5s timeout), then browser language as an instant fallback so nothing blinks.

Write-up on the approach: https://dev.to/maegamidev/adding-a-third-language-to-a-static-html-site-60-lines-of-vanilla-js-43p2

## Structure

| File | Purpose |
|---|---|
| `index.html` | landing, UA/RU/EN |
| `euphoria.html` | Euphoria case study: how the store is built and run |
| `calc.html` | interactive pricing calculator (embedded) |
| `demo.html`, `flow.html` | e-commerce demos (embedded) |
| `roborio.html`, `chatradar.html` | side project demos (Solana dApp, Tauri + Claude API app) |
| `i18n-embed.js`, `demo-i18n.js`, `roborio-i18n.js` | translations for the embedded demos |
| `support.js` | runtime for embedded components |
| `before.html` | pre-redesign snapshot kept for before/after comparison, noindex |
| `assets/` | interface screenshots (2560x1440) + og cover |

## Run locally

Any static server:

```bash
python -m http.server 4173
```

Open http://127.0.0.1:4173/

## Deploy

Plain static files, deployed on Vercel as is.
