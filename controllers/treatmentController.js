const Treatment = require('../models/Treatment');
const PestAnalysis = require('../models/PestAnalysis');

// @desc Create treatment
// @route POST /api/treatment/create
const createTreatment = async (req, res) => {
  try {
    const {
      pestId,
      treatmentName,
      description,
      pesticide,
      organicAlternative,
      applicationMethod,
      frequency,
      estimatedCost,
      duration,
      effectiveness,
      weatherRequirements,
      precautions,
    } = req.body;

    // Check if pest analysis exists and belongs to user
    const pestAnalysis = await PestAnalysis.findById(pestId);
    if (!pestAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Pest analysis not found',
      });
    }

    if (pestAnalysis.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create treatment for this pest',
      });
    }

    const treatment = await Treatment.create({
      pestId,
      userId: req.userId,
      treatmentName,
      description,
      pesticide,
      organicAlternative,
      applicationMethod,
      frequency,
      estimatedCost,
      duration,
      effectiveness,
      weatherRequirements,
      precautions,
    });

    // Add treatment to pest analysis
    pestAnalysis.treatments.push(treatment._id);
    await pestAnalysis.save();

    res.status(201).json({
      success: true,
      message: 'Treatment created successfully',
      data: treatment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating treatment',
      error: error.message,
    });
  }
};

// @desc Get treatments for a pest
// @route GET /api/treatment/pest/:pestId
const getTreatmentsByPest = async (req, res) => {
  try {
    const treatments = await Treatment.find({
      pestId: req.params.pestId,
      userId: req.userId,
    });

    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching treatments',
      error: error.message,
    });
  }
};

// @desc Get all treatments for user
// @route GET /api/treatment/my-treatments
const getMyTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find({ userId: req.userId })
      .populate('pestId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching treatments',
      error: error.message,
    });
  }
};

// @desc Get single treatment
// @route GET /api/treatment/:id
const getTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id).populate('pestId');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found',
      });
    }

    if (treatment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    res.status(200).json({
      success: true,
      data: treatment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching treatment',
      error: error.message,
    });
  }
};

// @desc Update treatment
// @route PUT /api/treatment/:id
const updateTreatment = async (req, res) => {
  try {
    let treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found',
      });
    }

    if (treatment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource',
      });
    }

    treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Treatment updated successfully',
      data: treatment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating treatment',
      error: error.message,
    });
  }
};

// @desc Delete treatment
// @route DELETE /api/treatment/:id
const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found',
      });
    }

    if (treatment.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource',
      });
    }

    await Treatment.findByIdAndDelete(req.params.id);

    // Remove from pest analysis
    await PestAnalysis.findByIdAndUpdate(treatment.pestId, {
      $pull: { treatments: treatment._id },
    });

    res.status(200).json({
      success: true,
      message: 'Treatment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting treatment',
      error: error.message,
    });
  }
};

module.exports = {
  createTreatment,
  getTreatmentsByPest,
  getMyTreatments,
  getTreatment,
  updateTreatment,
  deleteTreatment,
};
