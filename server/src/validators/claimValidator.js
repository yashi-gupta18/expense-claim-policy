import { z } from 'zod';

export const claimCreateSchema = z.object({
  claimant: z.string().trim().min(2, 'Claimant is required'),
  date: z.coerce.date(),
  category: z.string().trim().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currency: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
  description: z.string().trim().min(5, 'Description is required'),
  receiptAvailable: z.coerce.boolean()
});

export const decisionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_clarification', 'override_ai']),
  reason: z.string().trim().min(3, 'Reason is required'),
  reviewer: z.string().trim().min(2).default('Mock Reviewer'),
  overrideClassification: z.string().trim().optional()
});
