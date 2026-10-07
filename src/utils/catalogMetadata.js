const pageCounts = require("../data/catalogPageCounts.json");
const pageSize = 50;

function catalogPagePath(page) {
  const base = "/fireworks/";
  return page > 1 ? `${base}page/${page}/` : base;
}

function getCatalogRoutes(publicRoutes) {
  return publicRoutes.filter((route) => route.path === "/fireworks/")
    .flatMap((route) => {
      const pages = pageCounts.fireworks;
      return Array.from({ length: pages - 1 }, (_, index) => {
        const page = index + 2;
        return {
          ...route,
          path: catalogPagePath(page),
          aliases: [],
          title: `${route.heading} – Page ${page} | Fireworks Play`,
          description: `${route.description} Page ${page} of ${pages}.`,
        };
      });
    });
}

module.exports = { pageSize, pageCounts, catalogPagePath, getCatalogRoutes };
