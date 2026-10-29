# Repository maintenance rules

- The canonical API catalog lives in `CanKStar0/Free-API`, not in this repository.
- `README.md` is the public directory. Preserve its prose and generated markers.
- Never hand-edit generated API rows or category navigation. The source repository passes its generated index to `node scripts/sync-readme.mjs`; verify local structure with `node scripts/verify-readme.mjs`.
- Every API name must keep the canonical `https://findfreeapi.com/en/service/[slug]` destination provided by the upstream catalog. Do not create copied API detail pages or raw catalog exports.
- On every catalog change, verify that the README count, category navigation, and generated rows match the upstream index before publishing. The cross-repository update runs from the private source repository and requires its narrowly scoped `FREE_PUBLIC_APIS_TOKEN` Actions secret.
