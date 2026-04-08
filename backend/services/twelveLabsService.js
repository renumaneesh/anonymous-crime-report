const { TwelveLabs } = require("twelvelabs-js");
const fs = require("fs");
const path = require("path");

const INDEX_NAME = "anonymous-crime-video-index";
let client = null;
let cachedIndexId = null;

if (process.env.TWELVE_LABS_API_KEY) {
  client = new TwelveLabs({ apiKey: process.env.TWELVE_LABS_API_KEY });
}

const VIDEO_ANALYSIS_PROMPT = `You are a crime evidence verification specialist for the Police Department. You are watching a video uploaded as evidence for a crime report.

Watch the ENTIRE video carefully and analyze:
1. VIDEO AUTHENTICITY: Is this video real footage or AI-generated/deepfake?
2. CONTENT VERIFICATION: Does the video actually show a crime or suspicious activity?
3. MANIPULATION DETECTION: Has the video been edited suspiciously?

CRITICAL SCORING RULE: Be highly skeptical. If the video appears fake, staged, or completely unrelated to the crime, give a low videoCredibilityScore (0-30), label it "fake", and recommend "block". A score of 60 or above should ONLY be given if the video genuinely and clearly depicts the crime described.

Respond ONLY in this exact JSON with no markdown, no explanation, nothing else:
{
  "videoCredibilityScore": <0-100>,
  "videoMatchScore": <0-100>,
  "aiGeneratedVideoRisk": <0-100>,
  "videoVerdict": "genuine" | "suspicious" | "fake",
  "videoReasons": ["specific observation 1", "specific observation 2"],
  "videoRecommendation": "forward" | "review" | "block",
  "manipulationDetected": true | false,
  "videoContentSummary": "<one sentence describing what is actually in the video>"
}`;

async function getOrCreateIndex() {
  if (cachedIndexId) return cachedIndexId;
  
  // TwelveLabs SDK v1+ usually exposes client.index
  const indexesResponse = await client.indexes.list();
  // list() could return an array directly or inside data
  const indexList = Array.isArray(indexesResponse) ? indexesResponse : (indexesResponse.data || indexesResponse);
  
  let existing = null;
  if (Array.isArray(indexList)) {
     existing = indexList.find(i => i.name === INDEX_NAME || i.indexName === INDEX_NAME);
  }
  
  if (existing) {
    cachedIndexId = existing.id || existing._id;
    return cachedIndexId;
  }

  const newIndex = await client.indexes.create({
    indexName: INDEX_NAME,
    models: [
      {
        modelName: "pegasus1.2",
        modelOptions: ["visual", "audio"],
      },
    ],
  });
  cachedIndexId = newIndex.id || newIndex._id;
  return cachedIndexId;
}

async function analyzeVideo({ crimeType, description, address, videoFilePath }) {
  try {
    if (!fs.existsSync(videoFilePath)) throw new Error("File not found");
    if (!client) throw new Error("Twelve Labs API Key missing. Are you sure you saved it in .env?");

    const indexId = await getOrCreateIndex();

    // Upload & Index
    const task = await client.tasks.create({
      indexId: indexId,
      videoFile: fs.createReadStream(videoFilePath),
    });

    console.log("TwelveLabs: Wait for indexing...", task.id || task._id);
    const completedTask = await client.tasks.waitForDone(task.id || task._id);

    const videoId = completedTask.videoId;
    console.log("TwelveLabs: Indexing complete. Generating text...");

    // Generate JSON Analysis
    const prompt = VIDEO_ANALYSIS_PROMPT + "\n\nCrime Type: " + crimeType + "\nAddress: " + address + "\nCitizen Description: " + description;
    
    // Attempt generation
    const response = await client.analyze({ videoId, prompt });

    let text = "";
    if (typeof response === "string") text = response;
    else if (response.data) {
      text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    }
    else text = JSON.stringify(response); // Fallback if structure changes

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(e) {
      console.log("Failed to parse Twelve Labs JSON:", text);
      throw new Error("Invalid output format from Twelve Labs");
    }

    // Try deleting to clean up anonymously
    try {
      if (client.indexes && client.indexes.video && client.indexes.video.delete) {
        await client.indexes.video.delete(indexId, videoId);
      }
    } catch(e) {}

    return { ...parsed, source: 'twelvelabs', status: 'completed', videoFile: path.basename(videoFilePath) };

  } catch (error) {
    console.error("Twelve Labs Video Error:", error);
    return {
      videoCredibilityScore: 50, videoMatchScore: null,
      aiGeneratedVideoRisk: null, videoVerdict: 'unverified',
      videoReasons: ['Video verification unavailable (' + (error.message || 'Error') + ')'],
      videoRecommendation: 'forward', manipulationDetected: false,
      videoContentSummary: 'Video analysis could not be completed',
      source: 'twelvelabs', status: 'failed', videosAnalyzed: 0
    };
  }
}

async function analyzeAllVideos({ crimeType, description, address, videoFiles }) {
  if (!videoFiles || videoFiles.length === 0) return null;
  const promises = videoFiles.map(filePath => analyzeVideo({ crimeType, description, address, videoFilePath: filePath }));
  const resultsSettled = await Promise.allSettled(promises);
  
  const validResults = resultsSettled.filter(r => r.status === 'fulfilled' && r.value.status === 'completed').map(r => r.value);
  if (validResults.length === 0) {
    const fallback = resultsSettled[0].status === 'fulfilled' ? resultsSettled[0].value : null;
    return fallback || {
      videoCredibilityScore: 50, videoMatchScore: null,
      aiGeneratedVideoRisk: null, videoVerdict: 'unverified',
      videoReasons: ['Video verification unavailable'],
      videoRecommendation: 'forward', manipulationDetected: false,
      videoContentSummary: 'Video analysis could not be completed',
      source: 'twelvelabs', status: 'failed', videosAnalyzed: 0
    };
  }

  let totalCredibility = 0, totalMatch = 0, totalAiRisk = 0;
  let hasMatch = false, hasAiRisk = false;
  let allReasons = [];
  let verdict = 'genuine';
  let manipulation = false;
  let summaries = [];

  for (const r of validResults) {
    totalCredibility += r.videoCredibilityScore || 0;
    if (r.videoMatchScore !== null) { totalMatch += r.videoMatchScore; hasMatch = true; }
    if (r.aiGeneratedVideoRisk !== null) { totalAiRisk += r.aiGeneratedVideoRisk; hasAiRisk = true; }
    if (r.videoReasons) allReasons = allReasons.concat(r.videoReasons);
    if (r.videoVerdict === 'fake') verdict = 'fake';
    else if (r.videoVerdict === 'suspicious' && verdict !== 'fake') verdict = 'suspicious';
    if (r.manipulationDetected) manipulation = true;
    if (r.videoContentSummary) summaries.push(r.videoContentSummary);
  }

  const n = validResults.length;
  return {
    videoCredibilityScore: Math.round(totalCredibility / n),
    videoMatchScore: hasMatch ? Math.round(totalMatch / validResults.filter(r => r.videoMatchScore !== null).length) : null,
    aiGeneratedVideoRisk: hasAiRisk ? Math.round(totalAiRisk / validResults.filter(r => r.aiGeneratedVideoRisk !== null).length) : null,
    videoVerdict: verdict,
    videoReasons: [...new Set(allReasons)],
    videoRecommendation: verdict === 'fake' ? 'block' : (verdict === 'suspicious' ? 'review' : 'forward'),
    manipulationDetected: manipulation,
    videoContentSummary: summaries.join(" | "),
    source: 'twelvelabs',
    status: 'completed',
    videosAnalyzed: n
  };
}

module.exports = { analyzeAllVideos };
