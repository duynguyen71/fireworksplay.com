const fs = require("node:fs/promises");
const path = require("node:path");
const publicRoutes = require("../src/data/publicRoutes.json");

const buildDirectory = path.resolve(__dirname, "../build");
const internalRoutes = [
  "/login/",
  "/dashboard/",
  "/fireworksplay/dashboard/",
  "/release-note-dashboard/",
];

function routeFile(routePath) {
  if (routePath === "/") return path.join(buildDirectory, "index.html");
  return path.join(buildDirectory, routePath.replace(/^\/+|\/+$/g, ""), "index.html");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function validatePublicRoute(route, routePath) {
  const html = await fs.readFile(routeFile(routePath), "utf8");
  const canonicalUrl = new URL(route.path, "https://fireworksplay.com").href;

  assert(html.includes('<meta name="robots" content="index, follow"'), `${routePath}: missing public robots directive`);
  assert(html.includes(`<link rel="canonical" href="${canonicalUrl}"`), `${routePath}: invalid canonical URL`);
  assert(html.includes('id="route-structured-data"'), `${routePath}: missing structured data`);
}

async function validateInternalRoute(routePath) {
  const html = await fs.readFile(routeFile(routePath), "utf8");

  assert(html.includes('<meta name="robots" content="noindex, nofollow"'), `${routePath}: missing internal robots directive`);
  assert(!html.includes('rel="canonical"'), `${routePath}: internal route has a canonical URL`);
  assert(!html.includes('id="route-structured-data"'), `${routePath}: internal route has structured data`);
}

async function main() {
  const publicChecks = publicRoutes.flatMap((route) => (
    [route.path, ...(route.aliases || [])].map((routePath) => validatePublicRoute(route, routePath))
  ));
  const internalChecks = internalRoutes.map(validateInternalRoute);

  await Promise.all([...publicChecks, ...internalChecks]);

  const homepage = await fs.readFile(routeFile("/"), "utf8");
  assert(homepage.includes('src="/GameLabel-clean.webp"'), "homepage: optimized hero logo is missing");
  assert(homepage.includes('fetchpriority="high"'), "homepage: hero logo is not high priority");

  console.log(`Validated ${publicChecks.length} public entries and ${internalChecks.length} internal entries.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
