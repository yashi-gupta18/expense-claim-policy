import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    maxAmount: { type: Number, required: true },
    receiptRequired: { type: Boolean, default: false },
    allowedCurrencies: [{ type: String, required: true, uppercase: true, trim: true }],
    effectiveFrom: { type: Date, required: true },
    evidenceText: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

policySchema.index({ category: 1, isActive: 1 });

export default mongoose.model('Policy', policySchema);
