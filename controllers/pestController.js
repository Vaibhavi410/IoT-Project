const PestAnalysis = require('../models/PestAnalysis');
const Treatment = require('../models/Treatment');

// @desc Create pest analysis
// @route POST /api/pest/analyze
const createPestAnalysis = async (req, res) => {
  try {
    const {
      pestName,
      confidence,
      severity,
      cropType,
      location,
      affectedArea,
      recommendations,
      notes,
    } = req.body;

    const pestAnalysis = await PestAnalysis.create({
      userId: req.userId,
      pestName,
      confidence,
      severity,
      cropType,
      location,
      affectedArea,
      recommendations: recommendations || [],
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Pest analysis created successfully',
      data: pestAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pest analysis',
      error: error.message,
    });
  }
};

// @desc Get pest analysis history
// @route GET /api/pest/history
const getPestHistory = async (req, res) => {
  try {
    const pestAnalyses = await PestAnalysis.find({ userId: req.userId })
      .populate('treatments')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pestAnalyses.length,
      data: pestAnalyses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pest history',
      error: error.message,
    });
  }
};

// @desc Get single pest analysis
// @route GET /api/pest/:id
const getPestAnalysis = async (req, res) => {
  try {
    const pestAnalysis = await PestAnalysis.findById(req.params.id).populate(
      'treatments'
    );

    if (!pestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Pest analysis not found',
      });
    }

    if (pestAnalysis.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    res.status(200).json({
      success: true,
      data: pestAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pest analysis',
      error: error.message,
    });
  }
};

// @desc Update pest analysis
// @route PUT /api/pest/:id
const updatePestAnalysis = async (req, res) => {
  try {
    let pestAnalysis = await PestAnalysis.findById(req.params.id);

    if (!pestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Pest analysis not found',
      });
    }

    if (pestAnalysis.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource',
      });
    }

    pestAnalysis = await PestAnalysis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Pest analysis updated successfully',
      data: pestAnalysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pest analysis',
      error: error.message,
    });
  }
};

// @desc Delete pest analysis
// @route DELETE /api/pest/:id
const deletePestAnalysis = async (req, res) => {
  try {
    const pestAnalysis = await PestAnalysis.findById(req.params.id);

    if (!pestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Pest analysis not found',
      });
    }

    if (pestAnalysis.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource',
      });
    }

    await PestAnalysis.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pest analysis deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pest analysis',
      error: error.message,
    });
  }
};

module.exports = {
  createPestAnalysis,
  getPestHistory,
  getPestAnalysis,
  updatePestAnalysis,
  deletePestAnalysis,
};
