const { analyzeTextAndImages } = require("./openRouterService");
const { analyzeAllVideos } = require("./twelveLabsService");

function computeOverallVerdict(textImage, video) {
  const verdicts = [textImage.verdict];
  if (video && video.videoVerdict) verdicts.push(video.videoVerdict);

  let overallVerdict = 'unverified';
  let recommendation = 'forward';

  if (verdicts.includes('fake')) {
    overallVerdict = 'fake';
    recommendation = 'block';
  } else if (verdicts.includes('suspicious')) {
    overallVerdict = 'suspicious';
    recommendation = 'review';
  } else if (verdicts.every(v => v === 'genuine')) {
    overallVerdict = 'genuine';
    recommendation = 'forward';
  }

  let scores = [];
  if (textImage && textImage.status === 'completed' && textImage.credibilityScore !== undefined) {
    scores.push(textImage.credibilityScore);
  }
  if (video && video.status === 'completed' && video.videoCredibilityScore !== undefined) {
    scores.push(video.videoCredibilityScore);
  }
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return {
    verdict: overallVerdict,
    recommendation,
    overallScore,
    verifiedBy: ['openrouter', video ? 'twelvelabs' : null].filter(Boolean)
  };
}

async function analyzeReport({ crimeType, description, address, imageFiles, videoFiles, reportId }) {
  const [textImageResult, videoResult] = await Promise.allSettled([
    analyzeTextAndImages({ crimeType, description, address, imageFiles, hasVideo: videoFiles.length > 0 }),
    videoFiles.length > 0
      ? analyzeAllVideos({ crimeType, description, address, videoFiles })
      : Promise.resolve(null)
  ]);

  const textImage = textImageResult.status === 'fulfilled'
    ? textImageResult.value
    : { verdict: 'unverified', status: 'failed', credibilityScore: 50, reasons: ['Text/image analysis failed'] };
  
  const video = videoResult.status === 'fulfilled' ? videoResult.value : null;

  return {
    analyzedAt: new Date().toISOString(),
    reportId,
    textAndImage: {
      credibilityScore: textImage.credibilityScore,
      imageMatchScore: textImage.imageMatchScore,
      aiGeneratedImageRisk: textImage.aiGeneratedImageRisk,
      verdict: textImage.verdict,
      reasons: textImage.reasons,
      recommendation: textImage.recommendation,
      status: textImage.status,
      imagesAnalyzed: imageFiles.length
    },
    video: video ? {
      videoCredibilityScore: video.videoCredibilityScore,
      videoMatchScore: video.videoMatchScore,
      aiGeneratedVideoRisk: video.aiGeneratedVideoRisk,
      videoVerdict: video.videoVerdict,
      videoReasons: video.videoReasons,
      videoRecommendation: video.videoRecommendation,
      manipulationDetected: video.manipulationDetected,
      videoContentSummary: video.videoContentSummary,
      status: video.status,
      videosAnalyzed: video.videosAnalyzed || videoFiles.length
    } : null,
    overall: computeOverallVerdict(textImage, video),
    summary: {
      totalImagesAnalyzed: imageFiles.length,
      totalVideosAnalyzed: videoFiles.length,
      hasVideoAnalysis: video !== null,
      hasImageAnalysis: imageFiles.length > 0
    }
  };
}

module.exports = { analyzeReport };
