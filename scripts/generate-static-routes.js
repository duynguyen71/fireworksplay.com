const fs = require("node:fs/promises");
const path = require("node:path");
const publicRoutes = require("../src/data/publicRoutes.json");

const siteOrigin = "https://fireworksplay.com";
const buildDirectory = path.resolve(__dirname, "../build");

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
  const navigation = route.path === "/"
    ? '<nav aria-label="Public pages"><a href="/fireworks/">Fireworks</a> <a href="/racks/">Racks</a> <a href="/release-note/">Release Notes</a></nav>'
    : '<p><a href="/">Back to Fireworks Play</a></p>';

  return '<main class="static-route-content" data-static-route-content><h1>'
    + escapeHtml(route.heading)
    + "</h1><p>"
    + escapeHtml(route.summary)
    + "</p>"
    + navigation
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

  console.log("Generated static entry pages for " + publicRoutes.length + " canonical routes.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
