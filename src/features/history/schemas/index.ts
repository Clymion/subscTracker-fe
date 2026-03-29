import { z } from 'zod';

import { PaymentMethod } from '@/constants/subscription';

export const PaymentSchema = z.object({
  paymentId: z.number(),
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

// APIリクエスト用のスキーマ
export const paymentCreateSchema = z.object({
  subscription_id: z.string(),
  amount: z.number().min(0),
  currency: z.string(),
  payment_date: z.string(),
  payment_method: z.string(),
});

export const paymentUpdateSchema = z.object({
  amount: z.number().min(0),
  currency: z.string(),
  payment_date: z.string(),
  payment_method: z.string(),
});
