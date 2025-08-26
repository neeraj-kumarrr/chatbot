require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { GoogleGenAI } = require('@google/genai');
// Optional: const { loadContext } = require('./chatbotContext');

const app = express();
app.set('view engine', 'ejs');

const parseForm = bodyParser.urlencoded({ extended: false });
const csrfProtection = csrf({ cookie: true });

app.use(cookieParser());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', csrfProtection, (req, res) => {
  res.render('index', { csrfToken: req.csrfToken(), response: null, userInput: null });
});

app.post('/', parseForm, csrfProtection, async (req, res, next) => {
  try {
    const userInput = (req.body.userInput || '').toString();

    // Optional context load, but don’t let it break the request
    let context = '';
    try {
      // context = await loadContext();
    } catch (_) {
      context = '';
    }

    const systemText =
      'You are a helpful assistant' +
      (context ? ' with knowledge from the following website content:\n' + context : '.');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemText }] },
        { role: 'user', parts: [{ text: userInput }] },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
    });

    const text = response.text || 'No response.';
    res.render('index', { csrfToken: req.csrfToken(), response: text, userInput });
  } catch (err) {
    next(err); // Let error middleware produce a response
  }
});

// CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Invalid CSRF token');
  next(err);
});

// General errors (keep last)
app.use((err, req, res, _next) => {
  console.error('Route error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
