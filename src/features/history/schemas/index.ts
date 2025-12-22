import { z } from 'zod';

import { PaymentMethod } from '@/constants/subscription';

export const PaymentSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  subscriptionName: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentDate: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  exchangeRate: z.number().optional(),
});

export const PaymentHistorySchema = z.object({
  payments: z.array(PaymentSchema),
});
