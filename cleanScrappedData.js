// cleanScrappedData.js
const fs = require('fs').promises;
const { scrapeWebsite } = require('./scrapeData');

async function cleanData(inputText) {
  try {
    const raw = typeof inputText === 'string' && inputText.length > 0
      ? inputText
      : await fs.readFile('scraped_data.txt', 'utf-8').catch(async () => {
          const scraped = await scrapeWebsite();
          return scraped || '';
        });

    if (typeof raw !== 'string' || raw.trim().length === 0) return '';

    const lines = raw
      .split('\n')
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(l => l.length > 0);

    const dedup = [...new Set(lines)];
    const cleaned = dedup.join('\n');
    await fs.writeFile('cleaned_data.txt', cleaned, 'utf-8');
    console.log('Cleaned data saved to cleaned_data.txt');
    return cleaned;
  } catch (e) {
    console.error('Error cleaning data:', e);
    return '';
  }
}

module.exports = { cleanData };
