import { z } from 'zod';

import { PaymentSchema } from '@/features/history/schemas';

export type Payment = z.infer<typeof PaymentSchema>;

export type PaymentHistory = {
  data: {
    payments: Payment[];
  };
  meta: {
    total: number;
  };
};

export interface PaymentCreateRequest {
  subscriptionId: string;
  paymentDate: string; // ISO 8601 date string
  amount: number;
  currency: string;
  paymentMethod: string;
  exchangeRate?: number | null;
}

export type PaymentUpdateRequest = Partial<PaymentCreateRequest>;
