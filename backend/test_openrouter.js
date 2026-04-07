require('dotenv').config();
const axios = require('axios');

async function testOpenRouter() {
  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "user", content: "hello" }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", JSON.stringify(error.response ? error.response.data : error.message, null, 2));
  }
}

testOpenRouter();
