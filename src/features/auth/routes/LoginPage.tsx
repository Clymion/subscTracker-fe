import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginRequest, LoginResponse } from '@/features/auth/types';
import apiClient from '@/lib/api-client';
import { CustomApiError } from '@/types/api';

/**
 * ログインページコンポーネント
 * ユーザーがメールアドレスとパスワードでログインするためのフォームを提供
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation<LoginResponse, CustomApiError, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      navigate('/home');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error('ログインに失敗しました', {
        description: error.message || 'メールアドレスまたはパスワードが正しくありません。',
      });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <Toaster
        richColors
        position="bottom-right"
      />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">SubsTracker</h1>
        <p className="text-gray-600">サブスクリプション管理アプリ</p>
      </div>

      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
            <div className="text-sm text-center space-y-2">
              {/* TODO: バックエンドAPIが実装されたら有効化 */}
              {/* <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-800 block"
              >
                パスワードをお忘れですか？
              </a> */}
              <div className="text-gray-600">
                アカウントをお持ちでない方は
                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => navigate('/register')}
                >
                  新規登録
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
