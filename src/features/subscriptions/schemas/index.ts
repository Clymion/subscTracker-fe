import { z } from 'zod';

import { SubscriptionStatus } from '@/constants/subscription';
import { labelSchema } from '@/features/labels/schemas';

export const SubscriptionSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  nextPaymentDate: z.string(),
  status: z.enum(['active', 'inactive', 'cancelled']),
  labels: z.array(labelSchema),
});

export const SubscriptionCreateRequestSchema = z.object({
  name: z.string(),
  price: z.number().min(0, '料金は0以上でなければなりません'),
  currency: z.string(),
  frequency: z.enum(['daily', 'monthly', 'yearly']),
  initialPaymentDate: z.string().nullable(),
  paymentMethod: z.string(),
  labels: z.array(z.string()), // ラベルのIDの配列
  url: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum([
      SubscriptionStatus.TRIAL,
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.SUSPENDED,
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.EXPIRED,
    ])
    .default(SubscriptionStatus.ACTIVE), // デフォルトはアクティブ
});
