import { getCatalogItems, getCatalogRoutes, catalogPagePath, pageSize } from "./catalogRoutes";
import publicRoutes from "../data/publicRoutes.json";

test("deduplicates catalog items and keeps racks separate", () => {
  const items = getCatalogItems();
  expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
  expect(getCatalogItems(true).every((item) => item.category === "Racks")).toBe(true);
  expect(getCatalogItems(false, "Cakes").every((item) => item.category === "Cakes")).toBe(true);
});

test("generates a unique canonical route for every catalog page", () => {
  const routes = getCatalogRoutes(publicRoutes);
  const pages = Math.ceil(getCatalogItems().length / pageSize);
  expect(routes.filter((route) => route.path.startsWith("/fireworks/"))).toHaveLength(pages - 1);
  expect(routes.find((route) => route.path === "/fireworks/page/2/").title).toContain("Page 2");
  expect(catalogPagePath(false, 1)).toBe("/fireworks/");
  expect(catalogPagePath(true, 2)).toBe("/racks/page/2/");
  expect(new Set(routes.map((route) => route.path)).size).toBe(routes.length);
});
