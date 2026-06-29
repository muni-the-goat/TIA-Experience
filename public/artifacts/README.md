# Artifact photos

Drop your artifact images in this folder. Name each file to match the artifact `id`
in `lib/data.ts` (any of these extensions: .jpg .jpeg .png .webp).

| Put a file named…           | For artifact                     |
| --------------------------- | -------------------------------- |
| `naga-balustrade.jpg`       | 01 · The Seven-Headed Naga       |
| `apsara-relief.jpg`         | 02 · Apsara, Celestial Dancer    |
| `garuda-bronze.jpg`         | 03 · Garuda in Flight            |
| `lotus-stele.jpg`           | 04 · The Lotus Stele             |
| `temple-model.jpg`          | 05 · Prasat — Temple Mountain    |

Then set the matching `image` path in `lib/data.ts`, e.g.
`image: "/artifacts/naga-balustrade.jpg"`.

If a file is missing or fails to load, the card automatically falls back to the
inline Khmer SVG motif — nothing breaks.

Recommended: square-ish or portrait crops, ~1200px on the long edge, optimized
(.webp is smallest). Files here are served from the site root, so
`public/artifacts/naga-balustrade.jpg` → `/artifacts/naga-balustrade.jpg`.
