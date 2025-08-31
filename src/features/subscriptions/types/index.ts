import { z } from 'zod';

import {
  SubscriptionSchema,
  SubscriptionCreateRequestSchema,
  SubscriptionSummarySchema,
  SubscriptionUpdateRequestSchema,
} from '@/features/subscriptions/schemas';

export type SubscriptionSummary = z.infer<typeof SubscriptionSummarySchema>;

export type SubscriptionSummaryResponse = {
  data: {
    subscriptions: SubscriptionSummary[];
  };
  meta: object;
};

export type SubscriptionCreateRequest = z.infer<typeof SubscriptionCreateRequestSchema>;

export type Subscription = z.infer<typeof SubscriptionSchema>;

export type SubscriptionResponse = {
  data: Subscription;
  meta: object;
};

export type SubscriptionUpdateRequest = z.infer<typeof SubscriptionUpdateRequestSchema>;
