const fs = require("node:fs");
const path = require("node:path");
const { getCatalogItems, pageSize } = require("../src/utils/catalogRoutes");

const counts = {
  fireworks: Math.ceil(getCatalogItems().length / pageSize),
  racks: Math.ceil(getCatalogItems(true).length / pageSize),
};
fs.writeFileSync(path.resolve(__dirname, "../src/data/catalogPageCounts.json"), JSON.stringify(counts, null, 2) + "\n");
