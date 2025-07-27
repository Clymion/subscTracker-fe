import { z } from 'zod';

import {
  labelSchema,
  labelPostRequestSchema,
  labelPutRequestSchema,
} from '@/features/labels/schemas';

export type LabelType = z.infer<typeof labelSchema>;

export type LabelListResponse = {
  data: {
    labels: LabelType[];
  };
  meta: object;
};

export type LabelPostRequest = z.infer<typeof labelPostRequestSchema>;

export type LabelPutRequest = z.infer<typeof labelPutRequestSchema>;
