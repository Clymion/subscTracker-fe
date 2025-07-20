import { env } from '@/config/env';

/**
 * APIエラーのレスポンス形式
 */
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: object;
  };
};

/**
 * APIレスポンスの型
 */
export class CustomApiError extends Error {
  code: number;
  details?: object;

  constructor({ error }: ApiErrorResponse) {
    super(error.message);
    this.code = parseInt(error.code, 10);
    this.details = error.details;
  }
}

/**
 * APIレスポンスを処理し、エラーがあればスローする
 * @param response Fetch APIのレスポンスオブジェクト
 * @return レスポンスのJSONデータ
 * @throws `CustomApiError` エラーが発生した場合
 */
async function handleApiResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    const errorPayload: ApiErrorResponse = {
      error: {
        code: data.error.code || response.status,
        message: data.error.message || '不明なエラーが発生しました。',
        details: data.error.details || {},
      },
    };
    throw new CustomApiError(errorPayload);
  }
  return data;
}

const NET_ERROR_MESSAGE = 'サーバーに接続できませんでした。ネットワーク接続を確認してください。';

/**
 * APIクライアント
 */
const apiClient = {
  /**
   * GETリクエストを送信
   * @param url エンドポイントのURL
   * @param options Fetch APIのオプション
   * @return レスポンスのJSONデータ
   * @throws `CustomApiError` エラーが発生した場合
   */
  get: async <T>(url: string, options?: RequestInit): Promise<T> => {
    try {
      const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      // ネットワークエラー (fetch自体が失敗) はここでキャッチ
      console.error('Network or other fetch error:', error);
      throw new CustomApiError({
        error: {
          code: '503',
          message: NET_ERROR_MESSAGE,
        },
      });
    }
  },

  /**
   * POSTリクエストを送信
   * @param url エンドポイントのURL
   * @param body リクエストボディ
   * @param options Fetch APIのオプション
   * @return レスポンスのJSONデータ
   * @throws `CustomApiError` エラーが発生した場合
   */
  post: async <T, B = unknown>(url: string, body: B, options?: RequestInit): Promise<T> => {
    try {
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
    } catch (error) {
      // ネットワークエラー (fetch自体が失敗) はここでキャッチ
      console.error('Network or other fetch error:', error);
      throw new CustomApiError({
        error: {
          code: '503',
          message: NET_ERROR_MESSAGE,
        },
      });
    }
  },

  // TODO: 必要に応じて patch, delete も実装
};

export default apiClient;
