import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
    reviewer: { type: String, required: true },
    action: {
      type: String,
      enum: ['approve', 'reject', 'request_clarification', 'override_ai'],
      required: true
    },
    previousStatus: String,
    newStatus: String,
    reason: { type: String, required: true },
    overrideClassification: String
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
