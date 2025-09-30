/**
 * JWT認証付きAPIクライアント
 * 認証が必要なリクエスト(api)と不要なリクエスト(publicApi)を提供
 */
import { env } from '@/config/env';
import { ApiErrorResponse, CustomApiError } from '@/types/api';

// ネットワークエラー時の共通メッセージ
const NET_ERROR_MESSAGE = 'サーバーに接続できませんでした。ネットワーク接続を確認してください。';

// LocalStorageのキー名
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

// リフレッシュ中のPromiseをキャッシュ（重複呼び出し防止）
let refreshPromise: Promise<void> | null = null;

/**
 * JWTをデコードしてペイロードを取得
 */
function decodeJWT(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * トークンの有効期限をチェック（5秒のバッファを持たせる）
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 5; // 5秒前に期限切れとみなす

  return decoded.exp < currentTime + bufferTime;
}

/**
 * LocalStorageからトークンを取得
 */
function getTokens() {
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

/**
 * LocalStorageにトークンを保存
 */
function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * LocalStorageからトークンを削除
 */
function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * リフレッシュトークンを使って新しいアクセストークンを取得
 */
async function refreshAccessToken(): Promise<void> {
  // 既にリフレッシュ中の場合は、そのPromiseを返す
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { refreshToken } = getTokens();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${env.BACKEND_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { access_token, refresh_token } = data.data;

      saveTokens(access_token, refresh_token);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearTokens();
      window.location.href = '/login';
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

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
 * オブジェクトのキーをキャメルケースからスネークケースに変換するユーティリティ関数
 * @param obj 変換対象のオブジェクト
 * @returns スネークケースのキーを持つオブジェクト
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
  }
  return obj;
};

/**
 * APIレスポンスを処理し、エラーがあればスローする
 * @param response Fetch APIのレスポンスオブジェクト
 * @return レスポンスのJSONデータ（ボディがない場合は null）
 * @throws `CustomApiError` エラーが発生した場合
 */
async function handleApiResponse(response: Response) {
  const text = await response.text();
  // テキストが空でなければJSONとしてパース、空ならnull (DELETEリクエストなどでボディがない場合の対応)
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorPayload: ApiErrorResponse = {
      error: {
        // dataが存在する場合のみその中の値を使用する
        code: data?.error?.code || response.status,
        message: data?.error?.message || '不明なエラーが発生しました。',
        details: data?.error?.details || {},
      },
    };
    throw new CustomApiError(errorPayload);
  }
  return data ? toCamelCase(data) : null;
}

/**
 * ベースのHTTPリクエスト関数
 */
async function baseRequest(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${env.BACKEND_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * 認証が必要なAPIリクエストを実行
 */
async function authenticatedRequest(
  url: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<Response> {
  let { accessToken } = getTokens();

  // トークンが存在しない場合
  if (!accessToken) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('No access token available');
  }

  // トークンの有効期限を事前チェック
  if (isTokenExpired(accessToken)) {
    await refreshAccessToken();
    const tokens = getTokens();
    accessToken = tokens.accessToken!;
  }

  // APIリクエストを実行
  const response = await fetch(`${env.BACKEND_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 401エラーの場合、リフレッシュして1回だけリトライ
  if (response.status === 401 && !isRetry) {
    await refreshAccessToken();
    return authenticatedRequest(url, options, true);
  }

  return response;
}

/**
 * HTTPメソッドのヘルパー関数を生成するファクトリ
 */
function createApiMethods(requestFn: typeof baseRequest | typeof authenticatedRequest) {
  return {
    /**
     * 共通のfetchリクエスト処理
     */
    _request: async <T>(
      url: string,
      method: string,
      options?: RequestInit,
      body?: unknown,
    ): Promise<T> => {
      try {
        const _optinons = body ? { ...options, body: JSON.stringify(toSnakeCase(body)) } : options;
        const response = await requestFn(url, {
          ..._optinons,
          method,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
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
     * GETリクエスト
     */
    async get<T = unknown>(url: string, options?: RequestInit): Promise<T> {
      return this._request<T>(url, 'GET', options);
    },

    /**
     * POSTリクエスト
     */
    async post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return this._request<T>(url, 'POST', options, data);
    },

    /**
     * PUTリクエスト
     */
    async put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return this._request<T>(url, 'PUT', options, data);
    },

    /**
     * PATCHリクエスト
     */
    async patch<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
      return this._request<T>(url, 'PATCH', options, data);
    },

    /**
     * DELETEリクエスト
     */
    async delete<T = unknown>(url: string, options?: RequestInit): Promise<T> {
      return this._request<T>(url, 'DELETE', options);
    },
  };
}

/**
 * 認証が必要なAPIクライアント
 * アクセストークンを自動的に付与し、期限切れ時は自動リフレッシュ
 */
export const api = createApiMethods(authenticatedRequest);

/**
 * 認証が不要な公開APIクライアント
 * ログイン、サインアップなどの公開エンドポイント用
 */
export const publicApi = createApiMethods(baseRequest);

/**
 * トークン管理用のユーティリティ関数
 */
export const authUtils = {
  /**
   * トークンを保存
   */
  saveTokens,

  /**
   * トークンを取得
   */
  getTokens,

  /**
   * トークンをクリア
   */
  clearTokens,

  /**
   * ログイン状態をチェック
   */
  isAuthenticated(): boolean {
    const { accessToken, refreshToken } = getTokens();
    return !!(accessToken && refreshToken);
  },
};
