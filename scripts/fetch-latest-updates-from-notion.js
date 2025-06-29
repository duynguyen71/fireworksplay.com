const { Client } = require('@notionhq/client');
const fs = require('fs');
require('dotenv').config();

if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_TOKEN or NOTION_DATABASE_ID missing in .env');
    process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

async function fetchReleaseNotes() {
    const pages = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
                property: 'Release Date',
                direction: 'descending',
            },
        ],
        page_size: 50,
    });

    const updates = [];

    for (const page of pages.results) {
        const props = page.properties;
        const title = props['Title']?.title?.[0]?.plain_text || 'New Update';
        const versionText = title;

        let changesText = '';

        if (props['Changes'] && props['Changes'].type === 'rich_text') {
            changesText = props['Changes'].rich_text.map(t => t.plain_text).join('\n');
        }

        const changes = changesText
            .split('\n')
            .map(line => line.replace(/^-+\s*/, '').trim())
            .map(line => line.trim())
            .filter(line => line.length > 0);


        if (props['Video Link']?.url) {
            changes.push(props['Video Link'].url);
        }

        if (versionText)
            updates.push({
                version: versionText,
                changes,
            });
    }

    fs.writeFileSync(
        './src/data/updates/notion-latest-updates.json',
        JSON.stringify(updates, null, 2)
    );

    console.log(`✅ Exported ${updates.length} versions to notion-latest-updates.json`);

    return updates;
}

// ✅ Cho phép import từ file khác:
module.exports = fetchReleaseNotes;

// ✅ Nếu chạy trực tiếp qua CLI: node scripts/fetch-latest-updates-from-notion.js
if (require.main === module) {
    fetchReleaseNotes().catch((err) => {
        console.error('❌ Error fetching Notion updates:', err);
        process.exit(1);
    });
}
