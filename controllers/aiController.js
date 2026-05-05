const axios = require('axios');
const mongoose = require('mongoose');
const PestAnalysis = require('../models/PestAnalysis');

const HF_CLASSIFIER_URL =
  'https://router.huggingface.co/hf-inference/models/Diginsa/Plant-Disease-Detection-Project';
const HF_TEXT_URL =
  'https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-1.5B-Instruct';

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

function normalizeSeverityForUi(severityDb) {
  const s = String(severityDb || '').toLowerCase();
  if (s === 'high' || s === 'critical') return 'Severe';
  if (s === 'medium' || s === 'moderate') return 'Moderate';
  return 'Mild';
}

function parseQwenSections(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    return { organic: '', chemical: '', prevention: '' };
  }

  const normalized = raw.replace(/\r\n/g, '\n').trim();
  const organic =
    normalized.match(/organic\s*:\s*([\s\S]*?)(?=\n(?:chemical|prevention)\s*:|$)/i)?.[1]?.trim() ||
    '';
  const chemical =
    normalized.match(/chemical\s*:\s*([\s\S]*?)(?=\n(?:organic|prevention)\s*:|$)/i)?.[1]?.trim() ||
    '';
  const prevention =
    normalized.match(/prevention\s*:\s*([\s\S]*?)(?=\n(?:organic|chemical)\s*:|$)/i)?.[1]?.trim() ||
    '';

  if (organic || chemical || prevention) {
    return { organic, chemical, prevention };
  }

  return {
    organic: normalized,
    chemical: '',
    prevention: '',
  };
}

async function callQwen(prompt) {
  const response = await axios.post(
    HF_TEXT_URL,
    {
      inputs: prompt,
      parameters: { max_new_tokens: 250, temperature: 0.3, return_full_text: false },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return Array.isArray(response.data)
    ? response.data[0]?.generated_text || ''
    : response.data?.generated_text || '';
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

    const prompt = `You are an agricultural expert.
Pest detected: ${pestName}
Crop: ${cropType}
Location: ${location}
Give a short treatment plan in exactly this format:
Organic: <1-2 sentences>
Chemical: <1-2 sentences>
Prevention: <1-2 sentences>`;

    let treatmentText = '';
    try {
      treatmentText = await callQwen(prompt);
    } catch (e) {
      console.error('HF treatment error:', e.response?.status, e.response?.data || e.message);
      treatmentText = '';
    }

    const treatment = parseQwenSections(treatmentText);

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
    console.error('HF Error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Analysis failed, please try again' });
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

// GET /api/ai/stats/:userId
exports.getStats = async (req, res) => {
  try {
    const { userId } = req.params || {};
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalScans = await PestAnalysis.countDocuments({ userId });
    const [severityAgg, topDiseasesAgg, recentScans] = await Promise.all([
      PestAnalysis.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      PestAnalysis.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$pestName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      PestAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const severityBreakdown = { mild: 0, moderate: 0, severe: 0 };
    severityAgg.forEach((item) => {
      const ui = normalizeSeverityForUi(item._id).toLowerCase();
      if (ui === 'mild') severityBreakdown.mild += item.count;
      if (ui === 'moderate') severityBreakdown.moderate += item.count;
      if (ui === 'severe') severityBreakdown.severe += item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalScans,
        diseaseCounts: topDiseasesAgg.map((d) => ({ name: d._id || 'Unknown', count: d.count })),
        severityBreakdown,
        recentScans,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

// POST /api/ai/chat
exports.chatAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(501).json({
        success: false,
        message: 'HUGGINGFACE_API_KEY not configured on the server.',
      });
    }

    const historyText = Array.isArray(history)
      ? history
          .slice(-8)
          .map((m) => `${m.role || 'user'}: ${m.content || ''}`)
          .join('\n')
      : '';
    const prompt = `You are Pestify AI, an agricultural assistant helping farmers in India detect and treat crop diseases.
${historyText ? `Conversation history:\n${historyText}\n` : ''}Farmer: ${message}
Assistant:`;

    const generatedText = await callQwen(prompt);
    return res.status(200).json({ success: true, generated_text: generatedText.trim() });
  } catch (error) {
    console.error('HF chat error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to get assistant response' });
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