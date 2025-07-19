import { z } from 'zod';

/**
 * @description ユーザー登録フォームのバリデーションスキーマ
 */
export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'ユーザー名は3文字以上で入力してください。' })
      .max(32, { message: 'ユーザー名は32文字以下で入力してください。' }),
    email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
    password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください。' }),
    confirm_password: z.string(),
    // NOTE: バックエンドでは通過設定が未実装
    base_currency: z.enum(['JPY', 'USD', 'EUR'], {
      errorMap: () => ({ message: '有効な通貨を選択してください。' }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'パスワードが一致しません。',
    path: ['confirm_password'],
  });
