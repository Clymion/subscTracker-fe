/**
 * リクエストヘッダーの型
 */
type RequestHeaders = {
  'Content-Type'?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
  Authorization?: string; // オプションの認証ヘッダー
  [key: string]: string | undefined;
};

/**
 * リクエストのオプション型
 */
export type RequestOptions = {
  headers?: RequestHeaders;
  params?: Record<string, string | number>;
};

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
