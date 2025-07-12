import { env } from '@/config/env';
import { z } from 'zod';

// APIエラーの型を定義
const ApiErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
  errors: z.record(z.any()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * カスタムAPIエラークラス
 */
export class CustomApiError extends Error {
  status: number;
  errors?: Record<string, any>;

  constructor({ status, message, errors }: ApiError) {
    super(message);
    this.name = 'CustomApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * APIレスポンスを処理し、エラーがあればスローする
 * @param response Fetch APIのレスポンスオブジェクト
 */
async function handleApiResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    const errorPayload: ApiError = {
      status: response.status,
      message: data.detail || 'An unexpected error occurred', // OpenAPIのエラー形式に合わせる
      errors: data.errors,
    };
    throw new CustomApiError(errorPayload);
  }
  return data;
}

/**
 * APIクライアント
 */
const apiClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleApiResponse(response);
  },

  post: async <T>(url: string, body: any, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleApiResponse(response);
  },

  // TODO: 必要に応じて patch, delete も実装
};

// 環境変数を読み込むための設定
// 新規ファイル: src/config/env.ts
export const env = {
  BACKEND_BASE_URL: import.meta.env.BACKEND_BASE_URL as string,
};

export default apiClient;
