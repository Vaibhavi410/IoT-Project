const fetch = global.fetch || require('node-fetch');

const SYSTEM_PROMPT = `You are CropGuard AI, an expert agricultural entomologist and plant pathologist. When given an image (base64) and optional context, respond ONLY with a valid JSON object in the following structure (no extra text):
{
  "identified": true,
  "pestName": "Common name",
  "scientificName": "Genus species",
  "confidence": 85,
  "severity": "Low|Moderate|High|Critical",
  "category": "Insect|Fungal Disease|Bacterial Disease|Viral Disease|Mite|Nematode|Weed|Other",
  "affectedCrops": ["Rice","Wheat"],
  "description": "Short description",
  "symptoms": ["..."],
  "organicTreatments": [],
  "chemicalTreatments": [],
  "preventionTips": [],
  "bestTimeToTreat": "",
  "spreadRisk": "Low|Moderate|High",
  "economicImpact": ""
}

If you cannot identify the pest, respond with:
{
  "identified": false,
  "message": "Reason why identification was not possible",
  "suggestions": ["Take a clearer photo"]
}
`;

// POST /api/ai/analyze
exports.analyzePest = async (req, res) => {
  try {
    const { base64Image, mimeType = 'image/jpeg', additionalContext = '' } = req.body;

    if (!base64Image) {
      return res.status(400).json({ success: false, message: 'base64Image is required' });
    }

    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_URL) {
      return res.status(501).json({
        success: false,
        message:
          'GEMINI_API_KEY or GEMINI_API_URL not configured on the server. Add GEMINI_API_KEY and GEMINI_API_URL to environment variables.',
      });
    }

    // Build the prompt for Gemini / generative model
    const prompt = `${SYSTEM_PROMPT}\nContext: ${additionalContext}\nImage (base64): ${base64Image}`;

    const payload = {
      model: process.env.GEMINI_MODEL || 'gemini-1.0',
      prompt,
      max_output_tokens: 1500,
    };

    const response = await fetch(process.env.GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      return res.status(response.status).json({ success: false, message: errText });
    }

    const data = await response.json().catch(() => null);

    // Try to extract a text result from common response shapes
    let rawText = null;
    if (data) {
      if (data.output && Array.isArray(data.output) && data.output[0]?.content) {
        const textBlock = data.output[0].content.find((c) => c.type === 'text');
        rawText = textBlock?.text || null;
      }
      rawText = rawText || data.candidates?.[0]?.content?.[0]?.text || data.result || data.text || null;
    }

    // Fallback: try reading text body
    if (!rawText) {
      try {
        const text = await response.text();
        rawText = text;
      } catch (e) {
        rawText = null;
      }
    }

    // Try to parse JSON from the model output
    let parsed = null;
    if (rawText) {
      const cleaned = String(rawText).replace(/```json|```/g, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        return res.status(200).json({ success: true, raw: cleaned });
      }
    }

    if (parsed) {
      return res.status(200).json({ success: true, data: parsed });
    }

    return res.status(500).json({ success: false, message: 'Unable to parse model output' });
  } catch (error) {
    console.error('AI analyze error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
