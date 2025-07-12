import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Globe, ChevronLeft, RefreshCcw, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const CurrencySettings = () => {
  const navigate = useNavigate();
  const [autoUpdate, setAutoUpdate] = useState(true);

  // サンプルデータ
  const currencies = [
    { code: 'JPY', name: '日本円 (¥)' },
    { code: 'USD', name: '米ドル ($)' },
    { code: 'EUR', name: 'ユーロ (€)' },
    { code: 'GBP', name: 'イギリスポンド (£)' },
  ];

  const updateFrequencies = [
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'monthly', label: '毎月' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PCサイドナビゲーション - lg以上で表示 */}
      <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">SubsTracker</h1>
        </div>
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/home')}
          >
            <HomeRoundedIcon style={{ fontSize: '24px' }} />
            ホーム
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/payment-history')}
          >
            <HistoryRoundedIcon />
            支払い履歴
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/settings')}
          >
            <SettingsRoundedIcon />
            設定
          </Button>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:ml-64 p-4 pb-20 lg:pb-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">通貨設定</h2>
          </div>
        </div>

        {/* 通貨設定フォーム */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 基準通貨設定 */}
          <Card>
            <CardHeader>
              <CardTitle>基準通貨</CardTitle>
              <CardDescription>全ての金額はこの通貨で換算して表示されます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>通貨を選択</Label>
                <RadioGroup
                  defaultValue="JPY"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {currencies.map((currency) => (
                    <div
                      key={currency.code}
                      className="flex items-center space-x-2 border rounded-lg p-4"
                    >
                      <RadioGroupItem
                        value={currency.code}
                        id={currency.code}
                      />
                      <Label
                        htmlFor={currency.code}
                        className="flex-1 cursor-pointer"
                      >
                        {currency.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* 為替レート更新設定 */}
          <Card>
            <CardHeader>
              <CardTitle>為替レート更新</CardTitle>
              <CardDescription>為替レートの自動更新に関する設定を行います</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動更新</Label>
                  <p className="text-sm text-gray-500">為替レートを自動的に更新します</p>
                </div>
                <Switch
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
                />
              </div>

              {autoUpdate && (
                <div className="space-y-2">
                  <Label>更新頻度</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="更新頻度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {updateFrequencies.map((freq) => (
                        <SelectItem
                          key={freq.value}
                          value={freq.value}
                        >
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                <Info className="w-4 h-4 mt-1 text-blue-500" />
                <p className="text-sm text-gray-600">
                  為替レートは信頼できるソースから取得していますが、実際の取引レートとは異なる場合があります。
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                今すぐ更新
              </Button>
              <Button>保存</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* モバイルフッターナビゲーション - lg未満で表示 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/home')}
          >
            <HomeRoundedIcon />
            <span className="text-xs mt-1">ホーム</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/payment-history')}
          >
            <HistoryRoundedIcon />
            <span className="text-xs mt-1">履歴</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/settings')}
          >
            <SettingsRoundedIcon />
            <span className="text-xs mt-1">設定</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
