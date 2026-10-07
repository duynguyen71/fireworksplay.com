const pageCounts = require("../data/catalogPageCounts.json");
const pageSize = 50;

function catalogPagePath(racks, page) {
  const base = racks ? "/racks/" : "/fireworks/";
  return page > 1 ? `${base}page/${page}/` : base;
}

function getCatalogRoutes(publicRoutes) {
  return publicRoutes.filter((route) => ["/fireworks/", "/racks/"].includes(route.path))
    .flatMap((route) => {
      const racks = route.path === "/racks/";
      const pages = pageCounts[racks ? "racks" : "fireworks"];
      return Array.from({ length: pages - 1 }, (_, index) => {
        const page = index + 2;
        return {
          ...route,
          path: catalogPagePath(racks, page),
          aliases: [],
          title: `${route.heading} – Page ${page} | Fireworks Play`,
          description: `${route.description} Page ${page} of ${pages}.`,
        };
      });
    });
}

module.exports = { pageSize, pageCounts, catalogPagePath, getCatalogRoutes };
