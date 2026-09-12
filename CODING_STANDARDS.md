# Review Standards

## Homepage changes

For diffs touching `src/pages/MainPage.js`, `src/index.css`, or the homepage shell in `public/index.html`, read `docs/homepage-contract.md` and account for every invariant. Preserve the required product behavior while optimizing its implementation; record an explicit requirement change before removing a feature.

Require `npm run verify` plus desktop and mobile browser evidence. Compare performance only between builds with equivalent behavior.

## Generated content

Treat `src/data/updates/index.js` as generated output. Release-note edits belong in monthly source files. A build must leave the generated index unchanged unless the monthly sources changed intentionally.
