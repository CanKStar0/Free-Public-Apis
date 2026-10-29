# Repository maintenance rules

- The canonical API catalog lives in `CanKStar0/Free-API`, not in this repository.
- `README.md` is the public directory. Preserve its prose and generated markers.
- Never hand-edit generated API rows or category navigation. Use `node scripts/sync-readme.mjs` with the upstream generated index, then verify with `node scripts/sync-readme.mjs --check`.
- Every API name must keep the canonical `https://findfreeapi.com/en/service/[slug]` destination provided by the upstream catalog. Do not create copied API detail pages or raw catalog exports.
- On every catalog change, verify that the README count, category navigation, and generated rows match the upstream index before publishing.
