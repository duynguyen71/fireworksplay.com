const fs = require("node:fs/promises");
const path = require("node:path");
const publicRoutes = require("../src/data/publicRoutes.json");
const { FeatureSections } = require("../src/data/FeatureSections");
const { pageSize, getCatalogItems, catalogPagePath, getCatalogRoutes } = require("../src/utils/catalogRoutes");

const siteOrigin = "https://fireworksplay.com";
const buildDirectory = path.resolve(__dirname, "../build");
const internalRoutes = [
  {
    path: "/login",
    title: "Admin Sign In | Fireworks Play",
    description: "Fireworks Play administrator sign in.",
    heading: "Admin sign in",
    summary: "Authentication is required to manage release notes.",
  },
  {
    path: "/dashboard",
    title: "Release Notes Dashboard | Fireworks Play",
    description: "Fireworks Play release notes administration.",
    heading: "Release Notes Dashboard",
    summary: "Authentication is required to access this page.",
  },
  {
    path: "/fireworksplay/dashboard",
    title: "Release Notes Dashboard | Fireworks Play",
    description: "Fireworks Play release notes administration.",
    heading: "Release Notes Dashboard",
    summary: "Authentication is required to access this page.",
  },
  {
    path: "/release-note-dashboard",
    title: "Release Notes Dashboard | Fireworks Play",
    description: "Fireworks Play release notes administration.",
    heading: "Release Notes Dashboard",
    summary: "Authentication is required to access this page.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp("<meta[^>]*" + attribute + '="' + key + '"[^>]*>', "i");
  const replacement = "<meta " + attribute + '="' + key + '" content="' + escapeHtml(content) + '" />';
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace("</head>", "  " + replacement + "\n</head>");
}

function renderCatalog(route) {
  const racks = route.path.startsWith("/racks/");
  const page = Number(route.path.match(/\/page\/(\d+)\//)?.[1] || 1);
  const items = getCatalogItems(racks);
  const pages = Math.ceil(items.length / pageSize);
  const cards = items.slice((page - 1) * pageSize, page * pageSize).map((item) =>
    '<article><h2>' + escapeHtml(item.name) + '</h2>'
    + (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" width="256" height="256" loading="lazy" />' : "")
    + '</article>'
  ).join("");
  const previous = page > 1 ? '<a href="' + catalogPagePath(racks, page - 1) + '">Previous</a>' : "";
  const next = page < pages ? '<a href="' + catalogPagePath(racks, page + 1) + '">Next</a>' : "";
  return '<nav aria-label="Catalog navigation"><a href="/fireworks/">All game items</a> <a href="/racks/">Racks catalog</a></nav>'
    + '<p>' + items.length + ' items</p><div class="static-catalog-grid">' + cards + '</div>'
    + '<nav aria-label="Catalog pages">' + previous + '<span>Page ' + page + ' of ' + pages + '</span>' + next + '</nav>';
}

function renderReleases(releases) {
  return releases.map((release) => '<article><h2>' + escapeHtml(release.version) + '</h2><ul>'
    + release.changes.filter((change) => change != null).map((change) => '<li>' + escapeHtml(change) + '</li>').join("")
    + '</ul></article>').join("");
}

function renderStaticContent(route, releases = []) {
  if (route.path === "/") {
    return '<main class="static-route-content static-home-route" data-static-route-content><div class="static-home-content">'
      + '<p class="static-studio-word"><a href="https://simplaystudio.com/"><span>Sim</span>play Studio</a></p>'
      + '<h1 aria-label="Fireworks Play – Free Fireworks Simulator Game"><img class="static-hero-logo" src="/GameLabel-clean.webp" alt="Fireworks Play" width="457" height="296" fetchpriority="high" /></h1>'
      + '<p class="static-hero-description"><span>Fun and amazing fireworks simulator</span><span>that will blow your mind!</span></p>'
      + '<div class="static-store-space" aria-hidden="true"></div>'
      + '<nav class="static-home-links hero-catalog-links" aria-label="Public pages"><a class="text-link" href="/fireworks/">Explore game items</a> <a class="text-link" href="/racks/">Racks catalog</a> <a class="text-link" href="/release-note/">Release notes</a> <a class="text-link" href="/privacy.html">Privacy</a></nav>'
      + '</div></main><section class="static-route-content static-feature-content" data-static-route-details aria-label="Explore Fireworks Play">'
      + FeatureSections.map((feature) => '<article><h2>' + escapeHtml(feature.title) + '</h2><p>' + escapeHtml(feature.description) + '</p></article>').join("")
      + '</section>';
  }

  return '<main class="static-route-content" data-static-route-content><h1>'
    + escapeHtml(route.heading)
    + "</h1><p>"
    + escapeHtml(route.summary)
    + "</p>"
    + (route.path?.startsWith("/fireworks/") || route.path?.startsWith("/racks/") ? renderCatalog(route) : "")
    + (route.path === "/release-note/" ? renderReleases(releases) : "")
    + '<p><a href="/">Back to Fireworks Play</a></p>'
    + "</main>";
}

function renderRoute(template, route, releases = []) {
  const canonicalUrl = new URL(route.path, siteOrigin).href;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": route.path === "/" ? "WebSite" : "WebPage",
    name: route.heading,
    description: route.description,
    url: canonicalUrl,
  }).replaceAll("<", "\\u003c");

  let html = template.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + escapeHtml(route.title) + "</title>");
  html = replaceMeta(html, "name", "title", route.title);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", "index, follow");
  html = replaceMeta(html, "property", "og:url", canonicalUrl);
  html = replaceMeta(html, "property", "og:title", route.title);
  html = replaceMeta(html, "property", "og:description", route.description);
  html = replaceMeta(html, "name", "twitter:url", canonicalUrl);
  html = replaceMeta(html, "name", "twitter:title", route.title);
  html = replaceMeta(html, "name", "twitter:description", route.description);
  html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + canonicalUrl + '" />');
  html = html.replace(
    /<script[^>]*id="route-structured-data"[^>]*>[\s\S]*?<\/script>/i,
    '<script type="application/ld+json" id="route-structured-data">' + structuredData + "</script>"
  );
  html = html.replace(
    /<main[^>]*data-static-route-content[^>]*>[\s\S]*?<\/main>/i,
    () => renderStaticContent(route, releases)
  );
  return html;
}

function renderInternalRoute(template, route) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + escapeHtml(route.title) + "</title>");
  html = replaceMeta(html, "name", "title", route.title);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", "noindex, nofollow");
  html = html.replace(/\s*<meta[^>]*(?:property|name)="(?:og:[^"]+|twitter:[^"]+)"[^>]*>/gi, "");
  html = html.replace(/\s*<link[^>]*rel="canonical"[^>]*>/i, "");
  html = html.replace(/\s*<script[^>]*id="route-structured-data"[^>]*>[\s\S]*?<\/script>/i, "");
  html = html.replace(
    /<main[^>]*data-static-route-content[^>]*>[\s\S]*?<\/main>/i,
    () => renderStaticContent(route)
  );
  return html;
}

async function writeRoute(routePath, html) {
  if (routePath === "/") {
    await fs.writeFile(path.join(buildDirectory, "index.html"), html);
    return;
  }

  const routeDirectory = path.join(buildDirectory, routePath.replace(/^\/+|\/+$/g, ""));
  await fs.mkdir(routeDirectory, { recursive: true });
  await fs.writeFile(path.join(routeDirectory, "index.html"), html);
}

async function fetchBuildReleases() {
  const origin = process.env.REACT_APP_WORKER_API_URL || "https://fireworksplay-database-api.khanhduy-dev-bt.workers.dev";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await fetch(origin.replace(/\/$/, "") + "/api/releases?page=1&limit=100", {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Unable to prerender release notes: HTTP " + response.status);
    const data = await response.json();
    const releases = data.releases || data;
    if (!Array.isArray(releases) || releases.some((release) => typeof release.version !== "string" || !Array.isArray(release.changes))) {
      throw new Error("Invalid release notes response; refusing to publish empty SEO content.");
    }
    return releases;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const template = await fs.readFile(path.join(buildDirectory, "index.html"), "utf8");
  const releases = await fetchBuildReleases();
  const routes = [...publicRoutes, ...getCatalogRoutes(publicRoutes)];

  for (const route of routes) {
    const html = renderRoute(template, route, releases);
    const paths = [route.path, ...(route.aliases || [])];
    await Promise.all(paths.map((routePath) => writeRoute(routePath, html)));
  }

  await Promise.all(
    internalRoutes.map((route) => writeRoute(route.path, renderInternalRoute(template, route)))
  );

  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + [...routes.map((route) => route.path), "/privacy.html"].map((routePath) => '  <url><loc>' + siteOrigin + routePath + '</loc></url>').join("\n")
    + '\n</urlset>\n';
  await fs.writeFile(path.join(buildDirectory, "sitemap.xml"), sitemap);

  console.log(
    "Generated static entry pages for "
      + routes.length
      + " canonical routes and "
      + internalRoutes.length
      + " internal routes."
  );
}

module.exports = { renderRoute, renderInternalRoute, fetchBuildReleases };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
