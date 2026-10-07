/* eslint-disable testing-library/render-result-naming-convention -- These render helpers return HTML strings, not React Testing Library results. */
import fs from "fs";
import path from "path";
import publicRoutes from "./publicRoutes.json";
import { FeatureSections } from "./FeatureSections";
import { getCatalogItems, getCatalogRoutes, pageSize } from "../utils/catalogRoutes";

const { renderRoute, renderInternalRoute, fetchBuildReleases } = require("../../scripts/generate-static-routes");
const template = fs.readFileSync(path.resolve(__dirname, "../../public/index.html"), "utf8");

test("prerenders homepage features from the same data as React", () => {
  const html = renderRoute(template, publicRoutes[0]);
  expect(html).toContain("Free Fireworks Simulator Game</title>");
  expect(html).toContain('href="/racks/"');
  const document = new DOMParser().parseFromString(html, "text/html");
  FeatureSections.forEach((feature) => expect(document.body.textContent).toContain(feature.description));
  expect((html.match(/<h1[ >]/g) || []).length).toBe(1);
});

test("prerenders distinct catalog pages with self canonicals and real links", () => {
  const route = getCatalogRoutes(publicRoutes).find((entry) => entry.path === "/fireworks/page/2/");
  const html = renderRoute(template, route);
  const document = new DOMParser().parseFromString(html, "text/html");
  expect(document.querySelector('link[rel="canonical"]').href).toBe("https://fireworksplay.com/fireworks/page/2/");
  expect(document.querySelectorAll("article")).toHaveLength(pageSize);
  expect(document.querySelector("article h2").textContent).toBe(getCatalogItems()[pageSize].name);
  expect(document.querySelector('a[href="/fireworks/page/3/"]')).not.toBeNull();
});

test("renders release notes safely and keeps admin pages non-indexable", () => {
  const releaseRoute = publicRoutes.find((route) => route.path === "/release-note/");
  const html = renderRoute(template, releaseRoute, [{ version: "Version 2026.10.1", changes: ["New maps", "<script>alert(1)</script>", "Price: $&"] }]);
  expect(html).toContain("Version 2026.10.1");
  expect(html).toContain("New maps");
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain("Price: $&amp;");
  const internal = renderInternalRoute(template, { title: "Admin", description: "Admin", heading: "Admin", summary: "Sign in" });
  expect(internal).toContain('content="noindex, nofollow"');
  expect(internal).not.toContain('rel="canonical"');
});

test("fails rather than publishing an invalid release API response", async () => {
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ error: "unavailable" }) });
  try {
    await expect(fetchBuildReleases()).rejects.toThrow("Invalid release notes response");
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchBuildReleases()).rejects.toThrow("HTTP 503");
  } finally {
    global.fetch = originalFetch;
  }
});
