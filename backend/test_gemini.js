const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBBnZgQvTX22lPvlq4DuL5ZpmMm6akIlzY');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
model.generateContent('hello').then(r => console.log('Success:', r.response.text())).catch(e => console.log('ErrorStr:', e.toString()));
