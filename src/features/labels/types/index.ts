import { z } from 'zod';

import { labelSchema } from '@/features/labels/schemas';

export type LabelType = z.infer<typeof labelSchema>;

export type LabelListResponse = {
  data: {
    labels: LabelType[];
  };
  meta: object;
};
