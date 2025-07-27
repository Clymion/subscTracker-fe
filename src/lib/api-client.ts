import { env } from '@/config/env';
import { RequestOptions, ApiErrorResponse, CustomApiError } from '@/types/api';

/**
 * オブジェクトのキーをスネークケースからキャメルケースに変換するユーティリティ関数
 * @param obj 変換対象のオブジェクト
 * @returns キャメルケースのキーを持つオブジェクト
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
  }
  return obj;
};

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
  return toCamelCase(data);
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
  get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
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
  post: async <T, B = unknown>(url: string, body: B, options?: RequestOptions): Promise<T> => {
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

  /**
   * PUTリクエストを送信
   * @param url エンドポイントのURL
   * @param body リクエストボディ
   * @param options Fetch APIのオプション
   * @return レスポンスのJSONデータ
   * @throws `CustomApiError` エラーが発生した場合
   */
  put: async <T, B = unknown>(url: string, body: B, options?: RequestOptions): Promise<T> => {
    try {
      const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
        ...options,
        method: 'PUT',
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

  /**
   * DELETEリクエストを送信
   * @param url エンドポイントのURL
   * @param options Fetch APIのオプション
   * @return レスポンスのJSONデータ
   * @throws `CustomApiError` エラーが発生した場合
   */
  delete: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    try {
      const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
        ...options,
        method: 'DELETE',
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
};

export default apiClient;
