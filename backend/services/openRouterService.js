const axios = require("axios");
const fs = require("fs");
const path = require("path");

const SYSTEM_PROMPT = `You are a crime report verification assistant for the Telangana Police Department. Assess whether a crime report and its image evidence is credible.

Check the description for:
- Is the location real, specific, and in Telangana?
- Does the timeline make logical sense?
- Is the narrative coherent and detailed enough to be genuine?
- Any signs of spam, hate speech, or false reporting?

If images are provided, check:
- Do the images visually match what the description claims happened?
- Are there signs the images are AI-generated? Look for: unnatural lighting,
  distorted faces, blurred backgrounds, GAN artifacts, diffusion model patterns,
  inconsistent shadows, or AI tool watermarks.

Respond ONLY in this exact JSON with no markdown, no explanation, nothing else:
{
  "credibilityScore": <0-100>,
  "imageMatchScore": <0-100 or null if no images>,
  "aiGeneratedImageRisk": <0-100 or null if no images>,
  "verdict": "genuine" | "suspicious" | "fake",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "recommendation": "forward" | "review" | "block"
}`;

async function imageFileToBase64(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    if (ext === ".gif") mimeType = "image/gif";
    if (ext === ".webp") mimeType = "image/webp";
    return { base64: buffer.toString("base64"), mimeType };
  } catch (e) {
    return null;
  }
}

async function analyzeTextAndImages({ crimeType, description, address, imageFiles, hasVideo }) {
  try {
    const contentArray = [
      {
        type: "text",
        text: "Crime Type: " + crimeType + "\nAddress: " + address + "\nDescription: " + description + "\n\nAnalyze this crime report for credibility."
      }
    ];

    for (const filePath of imageFiles) {
      const imgData = await imageFileToBase64(filePath);
      if (imgData) {
        contentArray.push({
          type: "image_url",
          image_url: { url: "data:" + imgData.mimeType + ";base64," + imgData.base64 }
        });
      }
    }

    let dynamicPrompt = SYSTEM_PROMPT;
    dynamicPrompt += `\n\nCRITICAL SCORING RULE: Be highly critical. If the evidence does not clearly support the described crime, or if it appears to be fake or completely unrelated, strictly award a low credibilityScore (0-30), assign a 'fake' or 'suspicious' verdict, and set the recommendation to 'block' or 'review'. Award above 60 ONLY if the evidence is highly convincing and directly matches the description.`;

    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: contentArray }
      ],
      max_tokens: 500
    }, {
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Anonymous Crime Reporting System"
      }
    });

    let text = response.data.choices[0].message.content;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(text);
    return { ...result, source: 'openrouter', status: 'completed' };
  } catch (error) {
    console.error("OpenRouter Error:", error.response ? error.response.data : error.message);
    return {
      credibilityScore: 50,
      imageMatchScore: null,
      aiGeneratedImageRisk: null,
      verdict: 'unverified',
      recommendation: 'forward',
      reasons: ['OpenRouter verification unavailable'],
      source: 'openrouter',
      status: 'failed'
    };
  }
}

module.exports = { analyzeTextAndImages };
