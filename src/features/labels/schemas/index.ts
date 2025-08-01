import { z } from 'zod';

export const labelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'ラベル名は必須です'),
  color: z.string().optional(),
  usageCount: z.number().default(0),
});

export const labelPostRequestSchema = z.object({
  name: z.string().min(1, 'ラベル名は必須です'),
  color: z.string().optional(),
});

export const labelPutRequestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'ラベル名は必須です'),
  color: z.string(),
});
