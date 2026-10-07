const catalog = require("../data/gameCatalog.json");

const { pageSize, catalogPagePath, getCatalogRoutes } = require("./catalogMetadata");
const categories = [...new Set(catalog.map((item) => item.category))];
const categoryOptions = categories.includes("Cakes")
  ? ["Cakes", ...categories.filter((category) => category !== "Cakes")]
  : categories;
const categoryRank = new Map(categoryOptions.map((category, index) => [category, index]));
const orderedCatalog = [...catalog].sort((first, second) => {
  const imagePriority = Number(Boolean(second.image)) - Number(Boolean(first.image));
  return imagePriority || categoryRank.get(first.category) - categoryRank.get(second.category);
});

function getCatalogItems(racks = false, category = "All") {
  const matches = orderedCatalog.filter((item) =>
    racks ? item.category === "Racks" : category === "All" || item.category === category
  );
  // Shells also contains effects listed in specialized categories.
  return [...new Map(matches.map((item) => [item.id, item])).values()];
}

module.exports = { pageSize, categoryOptions, getCatalogItems, catalogPagePath, getCatalogRoutes };
