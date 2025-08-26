// chatbotContext.js
const { structureData } = require('./structureData');

async function loadContext() {
  try {
    const data = await structureData(); // stringified JSON array
    const arr = JSON.parse(typeof data === 'string' ? data : '[]');
    return Array.isArray(arr) ? arr.map(x => x.content).join('\n') : '';
  } catch (e) {
    console.error('Error loading context:', e);
    return '';
  }
}

module.exports = { loadContext };
