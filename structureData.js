// structureData.js
const fs = require('fs').promises;
const { cleanData } = require('./cleanScrappedData');

async function structureData() {
  try {
    const cleaned = await cleanData();
    if (typeof cleaned !== 'string' || cleaned.length === 0) {
      console.log('No data to structure');
      await fs.writeFile('structured_data.json', '[]', 'utf-8');
      return '[]';
    }
    const items = cleaned
      .split('\n')
      .filter(l => l.trim())
      .map(l => ({ content: l.trim() }));
    const json = JSON.stringify(items, null, 2);
    await fs.writeFile('structured_data.json', json, 'utf-8');
    console.log('Structured data saved to structured_data.json');
    return JSON.stringify(items); // compact string for parsing
  } catch (e) {
    console.error('Error structuring data:', e);
    return '[]';
  }
}

module.exports = { structureData };
