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
