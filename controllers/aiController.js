const axios = require('axios');
const PestAnalysis = require('../models/PestAnalysis');

const HF_CLASSIFIER_URL =
  'https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
const HF_TREATMENT_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-base';

function cleanLabel(label) {
  return String(label || '')
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ')
    .trim();
}

function severityFromConfidencePct(confidencePct) {
  if (confidencePct > 80) return 'Severe';
  if (confidencePct >= 60) return 'Moderate';
  return 'Mild';
}

function severityToDbEnum(severityLevel) {
  if (severityLevel === 'Severe') return 'high';
  if (severityLevel === 'Moderate') return 'medium';
  return 'low';
}

function parseDataUrlBase64(imageBase64) {
  const s = String(imageBase64 || '');
  const m = s.match(/^data:([^;]+);base64,(.+)$/i);
  if (m) {
    return { contentType: m[1] || 'image/jpeg', base64: m[2] };
  }
  return { contentType: 'image/jpeg', base64: s };
}

function parseTreatmentText(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    return { organic: '', chemical: '', prevention: '' };
  }

  const normalized = raw.replace(/\r\n/g, '\n');
  const organic =
    normalized.match(/(?:^|\n)\s*(?:1[\).\-\:]\s*)([\s\S]*?)(?=(?:\n\s*2[\).\-\:])|$)/i)?.[1]?.trim() || '';
  const chemical =
    normalized.match(/(?:^|\n)\s*(?:2[\).\-\:]\s*)([\s\S]*?)(?=(?:\n\s*3[\).\-\:])|$)/i)?.[1]?.trim() || '';
  const prevention =
    normalized.match(/(?:^|\n)\s*(?:3[\).\-\:]\s*)([\s\S]*?)$/i)?.[1]?.trim() || '';

  if (organic || chemical || prevention) {
    return { organic, chemical, prevention };
  }

  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    organic: lines[0] || raw,
    chemical: lines[1] || '',
    prevention: lines[2] || '',
  };
}

// POST /api/ai/analyze-pest
exports.analyzePest = async (req, res) => {
  try {
    const { imageBase64, cropType, location } = req.body || {};

    if (!imageBase64 || !cropType || !location) {
      return res.status(400).json({
        success: false,
        message: 'imageBase64, cropType, and location are required',
      });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        success: false,
        message: 'HUGGINGFACE_API_KEY not configured on the server.',
      });
    }

    const { contentType, base64: rawB64 } = parseDataUrlBase64(imageBase64);
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(rawB64, 'base64');
    } catch (e) {
      return res.status(200).json({ success: false, message: 'Analysis failed, please try again' });
    }
    if (!imageBuffer || imageBuffer.length < 32) {
      return res.status(200).json({ success: false, message: 'Analysis failed, please try again' });
    }

    let classifierResp;
    try {
      classifierResp = await axios.post(HF_CLASSIFIER_URL, imageBuffer, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': contentType,
        },
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
    } catch (e) {
      console.error('HF classifier error:', e.response?.status, e.response?.data || e.message);
      return res.status(200).json({ success: false, message: 'Analysis failed, please try again' });
    }

    let predictions = [];
    const clsData = classifierResp?.data;
    if (Array.isArray(clsData)) {
      predictions = clsData;
    } else if (clsData && typeof clsData === 'object' && !clsData.error && clsData.label != null) {
      predictions = [clsData];
    }
    if (predictions.length === 0) {
      console.error('HF classifier empty/unexpected response:', clsData);
      return res.status(200).json({ success: false, message: 'Analysis failed, please try again' });
    }

    const sorted = [...predictions].sort((a, b) => (b?.score || 0) - (a?.score || 0));
    const top3Raw = sorted.slice(0, 3);
    const top3Predictions = top3Raw.map((p) => ({
      name: cleanLabel(p?.label),
      confidence: Math.round((p?.score || 0) * 100),
    }));

    const pestName = top3Predictions[0]?.name || cleanLabel(top3Raw[0]?.label);
    const confidencePct = top3Predictions[0]?.confidence ?? Math.round((top3Raw[0]?.score || 0) * 100);
    const severityLevel = severityFromConfidencePct(confidencePct);

    const prompt = `You are an agricultural expert. Pest detected: ${pestName} on ${cropType} in ${location}. Give a short treatment plan with 3 options: 1) Organic method 2) Chemical method 3) Prevention. Keep it simple for farmers.`;

    let treatmentText = '';
    try {
      const treatmentResp = await axios.post(
        HF_TREATMENT_URL,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (typeof treatmentResp?.data === 'string') {
        treatmentText = treatmentResp.data;
      } else if (Array.isArray(treatmentResp?.data)) {
        treatmentText = treatmentResp.data[0]?.generated_text || treatmentResp.data[0]?.summary_text || '';
      } else if (treatmentResp?.data && typeof treatmentResp.data === 'object') {
        treatmentText = treatmentResp.data.generated_text || treatmentResp.data.summary_text || '';
      }
    } catch (e) {
      console.error('HF treatment error:', e.response?.status, e.response?.data || e.message);
      treatmentText = '';
    }

    const treatment = parseTreatmentText(treatmentText);

    const responseJson = {
      success: true,
      data: {
        pestName,
        confidence: confidencePct,
        severityLevel,
        cropAffected: cropType,
        location,
        top3Predictions,
        treatment,
        scanDate: new Date().toISOString(),
      },
    };

    try {
      const userId = req.userId || req.body?.userId;
      if (userId) {
        await PestAnalysis.create({
          userId,
          pestName,
          confidence: confidencePct,
          severity: severityToDbEnum(severityLevel),
          cropType,
          location,
          recommendations: [
            treatment.organic ? `Organic: ${treatment.organic}` : null,
            treatment.chemical ? `Chemical: ${treatment.chemical}` : null,
            treatment.prevention ? `Prevention: ${treatment.prevention}` : null,
          ].filter(Boolean),
        });
      }
    } catch (e) {
      // If persistence fails, still return the analysis payload.
    }

    return res.status(200).json(responseJson);
  } catch (error) {
    console.error("HF Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Analysis failed, please try again" });
  }
};

// GET /api/ai/history/:userId
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params || {};
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const items = await PestAnalysis.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching history' });
  }
};

// DELETE /api/ai/:id
exports.deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ success: false, message: 'id is required' });
    }

    const deleted = await PestAnalysis.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting analysis' });
  }
};