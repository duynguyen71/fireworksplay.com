import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const monthName = now.toLocaleString("en-US", { month: "long" });
const version = `Version ${year}.${month}.1`;

const varName = `updates${monthName}${year}`;
const fileName = `${year}-${String(month).padStart(2, "0")}.js`;

// content
const template = `const ${varName} = [
  {
    version: "${version}",
    changes: [
      "TODO: Add release notes here."
    ]
  },
];

export default ${varName};
`;

const dir = path.join(__dirname, "updates"); // create inside updates folder
const filePath = path.join(dir, fileName);

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
if (fs.existsSync(filePath)) {
  console.log(`File already exists: ${filePath}`);
  process.exit(0);
}

fs.writeFileSync(filePath, template);
console.log(`✅ Created ${fileName} in updates folder`);
