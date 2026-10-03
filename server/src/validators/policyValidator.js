import { z } from 'zod';

export const policySchema = z.object({
  title: z.string().trim().min(3),
  category: z.string().trim().min(2),
  description: z.string().trim().min(5),
  maxAmount: z.coerce.number().nonnegative(),
  receiptRequired: z.coerce.boolean().default(false),
  allowedCurrencies: z.array(z.string().trim().min(3).max(3)).min(1).transform((items) => items.map((item) => item.toUpperCase())),
  effectiveFrom: z.coerce.date(),
  evidenceText: z.string().trim().min(5),
  isActive: z.coerce.boolean().default(true)
});

export const policyUpdateSchema = policySchema.partial();
