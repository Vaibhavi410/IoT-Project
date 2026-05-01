const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    pestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PestAnalysis',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    treatmentName: {
      type: String,
      required: true,
    },
    description: String,
    pesticide: {
      name: String,
      dosage: String,
      unit: String,
      instructions: String,
      safetyWarnings: [String],
    },
    organicAlternative: {
      name: String,
      description: String,
    },
    applicationMethod: {
      type: String,
      enum: ['spray', 'dust', 'soil_drench', 'seed_treatment', 'other'],
      default: 'spray',
    },
    frequency: {
      interval: Number,
      unit: { type: String, enum: ['days', 'weeks', 'months'] },
    },
    estimatedCost: Number,
    duration: {
      type: Number,
      description: 'Duration in days',
    },
    effectiveness: {
      type: Number,
      min: 0,
      max: 100,
    },
    weatherRequirements: String,
    precautions: [String],
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed'],
      default: 'planned',
    },
    startDate: Date,
    endDate: Date,
    results: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Treatment', treatmentSchema);
