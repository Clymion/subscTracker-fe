import { z } from 'zod';

import {
  SubscriptionCreateRequestSchema,
  SubscriptionSummarySchema,
} from '@/features/subscriptions/schemas';

export type SubscriptionSummary = z.infer<typeof SubscriptionSummarySchema>;

export type SubscriptionSummaryResponse = {
  data: {
    subscriptions: SubscriptionSummary[];
  };
  meta: object;
};

export type SubscriptionCreateRequest = z.infer<typeof SubscriptionCreateRequestSchema>;
