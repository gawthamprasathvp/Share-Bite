const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content || '[]');
    } catch (err) {
        console.error(`Error reading database file for ${collection}:`, err);
        return [];
    }
};

const writeData = (collection, data) => {
    const filePath = getFilePath(collection);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing database file for ${collection}:`, err);
        return false;
    }
};

const db = {
    find: (collection, query = {}) => {
        const items = readData(collection);
        return items.filter(item => {
            for (const key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    },

    findOne: (collection, query = {}) => {
        const items = readData(collection);
        return items.find(item => {
            for (const key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        }) || null;
    },

    insert: (collection, doc) => {
        const items = readData(collection);
        const newDoc = {
            id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
            createdAt: new Date().toISOString(),
            ...doc
        };
        items.push(newDoc);
        writeData(collection, items);
        return newDoc;
    },

    update: (collection, query = {}, updateData = {}) => {
        const items = readData(collection);
        let updatedCount = 0;
        const newItems = items.map(item => {
            let match = true;
            for (const key in query) {
                if (item[key] !== query[key]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                updatedCount++;
                return { ...item, ...updateData, updatedAt: new Date().toISOString() };
            }
            return item;
        });
        writeData(collection, newItems);
        return updatedCount;
    },

    delete: (collection, query = {}) => {
        const items = readData(collection);
        const filteredItems = items.filter(item => {
            let match = true;
            for (const key in query) {
                if (item[key] !== query[key]) {
                    match = false;
                    break;
                }
            }
            return !match;
        });
        writeData(collection, filteredItems);
        return items.length - filteredItems.length;
    }
};

module.exports = db;
