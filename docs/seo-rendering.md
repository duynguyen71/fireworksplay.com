# Public SEO rendering

`npm run build` runs `scripts/generate-static-routes.js` after CRA builds the app.
It publishes HTML entry pages with route-specific metadata and crawlable content:

- Homepage feature copy comes from the same `FeatureSections` data used by React.
- Catalog cards, ordering, deduplication, page sizes, and page paths use
  `src/utils/catalogRoutes.js` in both the build script and React.
  Page metadata uses the lightweight `catalogMetadata.js` and generated
  `catalogPageCounts.json`, so the homepage does not load the full catalog.
  Start, build, and CI tests regenerate those counts from the catalog.
- Catalog page 1 uses `/fireworks/` or `/racks/`; later pages use
  `/fireworks/page/2/`, etc. Each page has its own canonical and sitemap entry.
- Legacy `?page=2` links remain functional and resolve to the new canonical after
  React loads. Category filters remain query-based views canonicalized to the
  main catalog; changing a category resets pagination.
- Release notes are fetched from the public Worker API at build time (up to 100,
  matching the client request). The HTML snapshot contains the fetched archive;
  the interactive app continues to fetch current data and display five at a time.
  New releases appear in static HTML after the next deployment.
- The production sitemap is generated from public routes and catalog page counts.
  Admin routes and aliases are excluded. Admin HTML retains `noindex`.

The release API origin is `REACT_APP_WORKER_API_URL`, with the same fallback as
the browser service. A failed, timed-out, or malformed API response fails the
build instead of deploying an empty release snapshot. The previous deployed
site remains available. No authentication secrets are used for this request.

The initial HTML is a static fallback, not React hydration. React replaces it
on startup. The hero video, reduced-motion fallback, native scrolling, and
spotlight jump must still satisfy `docs/homepage-contract.md`.
