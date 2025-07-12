import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Server, AlertCircle, CheckCircle } from 'lucide-react';

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ バックエンドのURLをここに設定してください ★
// ★ 例: 'https://your-flask-app-xxxxxxxxxx-an.a.run.app' ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
const BACKEND_URL = 'https://stage.api.jakinjakin.com';

const BackendTestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestClick = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    if (!BACKEND_URL) {
      setError('バックエンドのURLが設定されていません。src/pages/BackendTestPage.tsx ファイルを編集してください。');
      setLoading(false);
      return;
    }

    try {
      // バックエンドに `/api/test` というテスト用エンドポイントがあることを想定しています
      const res = await fetch(`${BACKEND_URL}/api/test`); 

      if (!res.ok) {
        throw new Error(`サーバーエラー: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error('通信エラー:', err);
      setError('通信に失敗しました。バックエンドのCORS設定やURLが正しいか、コンソールログを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/settings')}>
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
            <Button onClick={handleTestClick} disabled={loading} className="w-full sm:w-auto">
              {loading ? '通信中...' : 'テスト実行'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {response && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>
                  <p>バックエンドから正常な応答がありました。</p>
                  <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(response, null, 2)}</code>
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
