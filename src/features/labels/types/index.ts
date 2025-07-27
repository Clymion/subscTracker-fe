import { z } from 'zod';

import { labelSchema, labelRequestSchema } from '@/features/labels/schemas';

export type LabelType = z.infer<typeof labelSchema>;

export type LabelListResponse = {
  data: {
    labels: LabelType[];
  };
  meta: object;
};

export type LabelRequest = z.infer<typeof labelRequestSchema>;
