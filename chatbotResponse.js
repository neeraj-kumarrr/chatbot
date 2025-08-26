// chatbotResponse.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { loadContext } = require('./chatbotContext');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // use proper env var

async function getChatbotResponse(userInput) {
  try {
    const ctx = await loadContext();
    const systemPrompt =
       'You are FinAdvantage’s website assistant. Use ONLY the context below. ' +
  'If the answer is not contained in the context, say you do not know.\n\n' +
  'Context:\n' + (ctx    || '(no context)');

    // Per docs: provide contents or an array of role/parts; messages is not valid here
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: String(userInput ?? '').slice(0, 4000) }] },
      ],
      // max_tokens is not used in this SDK; use generationConfig if needed
      generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
    });

    // SDK exposes .text convenience field for combined output
    return response.text || 'No response.';
  } catch (e) {
    console.error('Error getting response:', e);
    return 'Sorry, an error occurred.';
  }
}

module.exports = { getChatbotResponse };
