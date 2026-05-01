const mongoose = require('mongoose');

const pestAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pestName: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    imageUrl: {
      type: String,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    cropType: {
      type: String,
    },
    location: {
      type: String,
    },
    affectedArea: {
      type: Number,
    },
    recommendations: [String],
    treatments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment',
      },
    ],
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PestAnalysis', pestAnalysisSchema);
