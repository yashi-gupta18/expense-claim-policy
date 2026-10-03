import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Policy from '../models/Policy.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';
import { retrieveRelevantPolicies } from '../services/policyRetrievalService.js';
import { runDeterministicValidation } from '../services/deterministicValidationService.js';
import { runAiReview } from '../services/aiReviewService.js';

dotenv.config();

const policies = [
  {
    title: 'Meals Receipt Threshold',
    category: 'Meals',
    description: 'Meal expenses are reimbursable within daily limits when business related.',
    maxAmount: 1000,
    receiptRequired: true,
    allowedCurrencies: ['INR'],
    effectiveFrom: new Date('2026-01-01'),
    evidenceText: 'Meals above INR 1000 require a receipt.',
    isActive: true
  },
  {
    title: 'Travel Manager Approval',
    category: 'Travel',
    description: 'Travel expenses are reimbursable when tied to approved business trips.',
    maxAmount: 5000,
    receiptRequired: true,
    allowedCurrencies: ['INR'],
    effectiveFrom: new Date('2026-01-01'),
    evidenceText: 'Travel claims above INR 5000 require manager approval.',
    isActive: true
  },
  {
    title: 'Hotel Stay Justification',
    category: 'Hotel',
    description: 'Hotel stays should use preferred vendors where available.',
    maxAmount: 7000,
    receiptRequired: true,
    allowedCurrencies: ['INR'],
    effectiveFrom: new Date('2026-01-01'),
    evidenceText: 'Hotel stays above INR 7000 per night require justification.',
    isActive: true
  },
  {
    title: 'Office Supplies Receipts',
    category: 'Office Supplies',
    description: 'Office supply purchases must be for business use.',
    maxAmount: 3000,
    receiptRequired: true,
    allowedCurrencies: ['INR'],
    effectiveFrom: new Date('2026-01-01'),
    evidenceText: 'Office supplies above INR 3000 require receipt.',
    isActive: true
  },
  {
    title: 'Entertainment Preapproval',
    category: 'Entertainment',
    description: 'Entertainment expenses are generally restricted.',
    maxAmount: 0,
    receiptRequired: true,
    allowedCurrencies: ['INR'],
    effectiveFrom: new Date('2026-01-01'),
    evidenceText: 'Entertainment expenses are not reimbursable unless pre-approved.',
    isActive: true
  }
];

const claims = [
  { claimant: 'Ananya Rao', date: new Date('2026-09-10'), category: 'Meals', amount: 850, currency: 'INR', description: 'Team lunch during client workshop', receiptAvailable: true },
  { claimant: 'Vikram Shah', date: new Date('2026-09-11'), category: 'Meals', amount: 1250, currency: 'INR', description: 'Client dinner after demo', receiptAvailable: false },
  { claimant: 'Leena Mathew', date: new Date('2026-09-12'), category: 'Travel', amount: 4800, currency: 'INR', description: 'Airport cab to customer site', receiptAvailable: true },
  { claimant: 'Leena Mathew', date: new Date('2026-09-12'), category: 'Travel', amount: 4800, currency: 'INR', description: 'Duplicate airport cab submission', receiptAvailable: true },
  { claimant: 'Rahul Nair', date: new Date('2026-09-13'), category: 'Hotel', amount: 8200, currency: 'INR', description: 'Hotel stay near conference venue', receiptAvailable: true },
  { claimant: 'Mira Das', date: new Date('2026-09-14'), category: 'Office Supplies', amount: 2800, currency: 'INR', description: 'Whiteboards and markers for training room', receiptAvailable: true },
  { claimant: 'Kabir Mehta', date: new Date('2026-09-15'), category: 'Entertainment', amount: 2400, currency: 'INR', description: 'Movie tickets for customer hospitality', receiptAvailable: true },
  { claimant: 'Sara Iyer', date: new Date('2026-09-16'), category: 'Meals', amount: 650, currency: 'INR', description: 'Client meeting snacks', receiptAvailable: false },
  { claimant: 'Noah Fernandes', date: new Date('2026-12-20'), category: 'Travel', amount: 1200, currency: 'INR', description: 'Future-date taxi claim', receiptAvailable: true }
];

async function seed() {
  await connectDB();
  await Promise.all([
    Claim.deleteMany({}),
    Policy.deleteMany({}),
    Review.deleteMany({}),
    AuditLog.deleteMany({}),
    User.deleteMany({})
  ]);

  await Policy.insertMany(policies);
  await User.create({ name: 'Mock Reviewer', email: 'reviewer@example.com', role: 'reviewer' });

  for (const input of claims) {
    const relevantPolicies = await retrieveRelevantPolicies(input);
    const deterministicIssues = await runDeterministicValidation(input, relevantPolicies);
    const aiReview = await runAiReview(input, relevantPolicies, deterministicIssues);
    const claim = await Claim.create({
      ...input,
      deterministicIssues,
      aiReview,
      status: deterministicIssues.some((issue) => issue.severity === 'high') ? 'non_compliant' : aiReview.status
    });
    await AuditLog.create({ claim: claim._id, action: 'seeded', message: 'Seed claim created with validation results.' });
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
