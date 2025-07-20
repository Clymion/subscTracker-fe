import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { signUpSchema } from '@/features/auth/schemas';
import { RegisterRequest, RegisterResponse, SignUpData } from '@/features/auth/types';
import apiClient, { CustomApiError } from '@/lib/api-client';

type SignUpError = z.inferFormattedError<typeof signUpSchema> | null;

/**
 * ユーザー登録ページコンポーネント
 * 新規ユーザーがアカウントを作成するためのフォームを提供
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpData>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    base_currency: 'JPY',
  });
  const [errors, setErrors] = useState<SignUpError>(null);

  const registerMutation = useMutation<RegisterResponse, CustomApiError, RegisterRequest>({
    mutationFn: async (request) => {
      return await apiClient.post<RegisterResponse>('/auth/register', request);
    },
    onSuccess: () => {
      toast.success('登録が完了しました。ログイン画面に移動します。');
      // NOTE: トーストを見せるために、2秒後にログインページに遷移
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      console.error(error);
      toast.error('登録に失敗しました', {
        description: error.message || '不明なエラーが発生しました。',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(null); // エラーをリセット
    const validation = signUpSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.format());
      return;
    }
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      {/* FIXME: richColors にならない */}
      <Toaster
        richColors
        position="bottom-right"
      />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">SubsTracker</h1>
        <p className="text-gray-600">サブスクリプション管理アプリ</p>
      </div>

      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ユーザー名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ユーザー名を入力"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                {errors?.username && (
                  <p className="text-red-500 text-sm">{errors.username._errors.join(', ')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm">{errors.email._errors.join(', ')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">8文字以上の英数字を組み合わせてください</p>
                {errors?.password && (
                  <p className="text-red-500 text-sm">{errors.password._errors.join(', ')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">パスワード（確認用）</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                />
                {errors?.confirm_password && (
                  <p className="text-red-500 text-sm">
                    {errors.confirm_password._errors.join(', ')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_currency">基準通貨</Label>
                <Select
                  value={formData.base_currency}
                  onValueChange={(value: SignUpData['base_currency']) =>
                    setFormData({ ...formData, base_currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="通貨を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                    <SelectItem value="USD">米ドル (USD)</SelectItem>
                    <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? '登録中...' : '新規登録'}
            </Button>
            <div className="text-sm text-center text-gray-600">
              すでにアカウントをお持ちの方は
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => navigate('/login')}
              >
                ログイン
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
