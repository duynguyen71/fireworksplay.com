const fs = require('fs');
const path = require('path');

const updatesDir = path.join(__dirname);
const files = fs.readdirSync(updatesDir);

let imports = '';
let allUpdatesArray = [];

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js' && file !== 'auto-generate-index.js') {
    const name = 'updates' + path.basename(file, '.js').replace(/-/g, '');
    imports += `import ${name} from './${file}';\n`;
    allUpdatesArray.push(`...${name}`);
  }
});

const indexContent = `
${imports}

const allUpdates = [
  ${allUpdatesArray.join(',\n  ')}
];

export default allUpdates;
`;

fs.writeFileSync(path.join(updatesDir, 'index.js'), indexContent.trim());
console.log('✅ Auto-generated index.js for updates folder!');
