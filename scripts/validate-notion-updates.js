const fs = require('fs');

function validateNotionUpdates() {
    const filePath = './src/data/notion-latest-updates.json';

    if (!fs.existsSync(filePath)) {
        console.error('❌ Notion updates file not found:', filePath);
        process.exit(1);
    }

    let data;

    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        console.error('❌ Invalid JSON format in Notion updates file:', err);
        process.exit(1);
    }

    if (!Array.isArray(data)) {
        console.error('❌ Notion updates file must export an array.');
        process.exit(1);
    }

    let hasError = false;

    data.forEach((item, index) => {
        if (!item.version || typeof item.version !== 'string') {
            console.error(`❌ Error at index ${index}: Missing or invalid "version"`);
            hasError = true;
        }

        if (!Array.isArray(item.changes)) {
            console.error(`❌ Error at index ${index}: "changes" must be an array`);
            hasError = true;
        } else {
            item.changes.forEach((change, idx) => {
                if (typeof change !== 'string') {
                    console.error(`❌ Error at index ${index}, change ${idx}: Must be string`);
                    hasError = true;
                }
            });
        }
    });

    if (hasError) {
        console.error('❌ Notion updates validation failed.');
        process.exit(1);
    }

    console.log('✅ Notion updates validation passed.');
}

validateNotionUpdates();
