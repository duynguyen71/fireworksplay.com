const fs = require("node:fs/promises");
const path = require("node:path");
const publicRoutes = require("../src/data/publicRoutes.json");

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
  return value
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

function renderStaticContent(route) {
  if (route.path === "/") {
    return '<main class="static-route-content static-home-route" data-static-route-content><div class="static-home-content">'
      + '<p class="static-studio-word"><span>Sim</span>play Studio</p>'
      + '<h1><img class="static-hero-logo" src="/GameLabel-clean.webp" alt="Fireworks Play" width="457" height="296" fetchpriority="high" /></h1>'
      + '<p class="static-hero-description">Fun and amazing fireworks simulator that will blow your mind!</p>'
      + '<div class="static-store-space" aria-hidden="true"></div>'
      + '<nav class="static-home-links hero-catalog-links" aria-label="Public pages"><a class="text-link" href="/fireworks/">Browse fireworks <span aria-hidden="true">→</span></a> <a class="text-link" href="/racks/">Browse racks <span aria-hidden="true">→</span></a> <a class="text-link" href="/release-note/">Release notes <span aria-hidden="true">→</span></a> <a class="text-link" href="/privacy.html">Privacy <span aria-hidden="true">→</span></a></nav>'
      + "</div></main>";
  }

  return '<main class="static-route-content" data-static-route-content><h1>'
    + escapeHtml(route.heading)
    + "</h1><p>"
    + escapeHtml(route.summary)
    + "</p>"
    + '<p><a href="/">Back to Fireworks Play</a></p>'
    + "</main>";
}

function renderRoute(template, route) {
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
    renderStaticContent(route)
  );
  return html;
}

function renderInternalRoute(template, route) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + escapeHtml(route.title) + "</title>");
  html = replaceMeta(html, "name", "title", route.title);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", "noindex, nofollow");
  html = html.replace(/\s*<link[^>]*rel="canonical"[^>]*>/i, "");
  html = html.replace(/\s*<script[^>]*id="route-structured-data"[^>]*>[\s\S]*?<\/script>/i, "");
  html = html.replace(
    /<main[^>]*data-static-route-content[^>]*>[\s\S]*?<\/main>/i,
    renderStaticContent(route)
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

async function main() {
  const template = await fs.readFile(path.join(buildDirectory, "index.html"), "utf8");

  for (const route of publicRoutes) {
    const html = renderRoute(template, route);
    const paths = [route.path, ...(route.aliases || [])];
    await Promise.all(paths.map((routePath) => writeRoute(routePath, html)));
  }

  await Promise.all(
    internalRoutes.map((route) => writeRoute(route.path, renderInternalRoute(template, route)))
  );

  console.log(
    "Generated static entry pages for "
      + publicRoutes.length
      + " canonical routes and "
      + internalRoutes.length
      + " internal routes."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
