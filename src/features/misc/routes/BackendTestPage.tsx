import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, ChevronLeft, Server } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

// APIからテストデータを取得する非同期関数
const getTestData = () => {
  return apiClient.get<{ message: string }>('/api/v1/health');
};

const BackendTestPage = () => {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['test-backend'], // クエリの一意なキー
    queryFn: getTestData,
    enabled: false, // 最初は自動で実行しない
  });

  const handleTestClick = () => {
    refetch(); // ボタンクリックでデータを再取得
  };

  const isTestRunning = isLoading || isFetching;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            設定に戻る
          </Button>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">バックエンド通信テスト</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API通信テスト</CardTitle>
            <CardDescription>
              バックエンドのFlask APIとの通信が正しく行えるか確認します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestClick}
              disabled={isTestRunning}
              className="w-full sm:w-auto"
            >
              {isTestRunning ? '通信中...' : 'テスト実行'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {data && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>
                  <p>バックエンドから正常な応答がありました。</p>
                  <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackendTestPage;
