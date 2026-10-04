import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    type: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    message: String,
    field: String,
    evidence: String
  },
  { _id: false }
);

const aiReviewSchema = new mongoose.Schema(
  {
    classification: String,
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'needs_clarification', 'uncertain']
    },
    confidence: Number,
    reasoning: String,
    policyEvidence: [String],
    missingInformation: [String],
    recommendedAction: {
      type: String,
      enum: ['approve', 'reject', 'request_clarification', 'manual_review']
    },
    provider: { type: String, enum: ['openai', 'ollama', 'mock'], default: 'mock' },
    model: { type: String, default: 'mock' },
    isFallback: { type: Boolean, default: false },
    isMock: { type: Boolean, default: false },
    reviewedAt: Date
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    claimant: { type: String, required: true, trim: true },
    claimantName: { type: String, trim: true },
    claimantId: { type: String, trim: true },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    receiptAvailable: { type: Boolean, default: false },
    deterministicIssues: [issueSchema],
    aiReview: aiReviewSchema,
    finalDecision: {
      type: String,
      enum: ['approved', 'rejected', 'needs_clarification', null],
      default: null
    },
    finalDecisionReason: { type: String, default: '' },
    clarificationRequest: { type: String, default: '' },
    clarificationResponse: { type: String, default: '' },
    clarificationProofLink: { type: String, default: '' },
    reviewer: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'under_review', 'compliant', 'non_compliant', 'needs_clarification', 'uncertain', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

claimSchema.index({ claimant: 1, date: 1, amount: 1, category: 1 });
claimSchema.index({ status: 1, category: 1 });

export default mongoose.model('Claim', claimSchema);
