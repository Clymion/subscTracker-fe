import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Mail, Smartphone, Info } from 'lucide-react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  // 通知タイミングのオプション
  const reminderTiming = [
    { value: '7', label: '7日前' },
    { value: '3', label: '3日前' },
    { value: '1', label: '1日前' },
    { value: '0', label: '当日' },
  ];

  const notificationTypes = [
    {
      id: 'payment_due',
      title: '支払い期限',
      description: '支払い期限が近づいた時に通知',
      enabled: true,
    },
    {
      id: 'trial_end',
      title: '無料トライアル終了',
      description: '無料トライアル期間の終了が近づいた時に通知',
      enabled: true,
    },
  ];

  const handleNotificationToggle = (type: string) => {
    console.log('Toggle notification:', type);
  };

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
            <Bell className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">通知設定</h2>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 通知方法設定 */}
          <Card>
            <CardHeader>
              <CardTitle>通知方法</CardTitle>
              <CardDescription>通知を受け取る方法を選択します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <Label>メール通知</Label>
                    <p className="text-sm text-gray-500">
                      登録されたメールアドレスに通知を送信します
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <Label>プッシュ通知</Label>
                    <p className="text-sm text-gray-500">ブラウザのプッシュ通知を使用します</p>
                  </div>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={setPushEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* リマインダー設定 */}
          <Card>
            <CardHeader>
              <CardTitle>リマインド設定</CardTitle>
              <CardDescription>支払い期限のリマインド通知のタイミングを設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>通知タイミング</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue placeholder="通知タイミングを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTiming.map((timing) => (
                      <SelectItem
                        key={timing.value}
                        value={timing.value}
                      >
                        {timing.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 通知種類設定 */}
          <Card>
            <CardHeader>
              <CardTitle>通知の種類</CardTitle>
              <CardDescription>受け取りたい通知の種類を選択します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label>{type.title}</Label>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                  <Switch
                    checked={type.enabled}
                    onCheckedChange={() => handleNotificationToggle(type.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 注意事項 */}
          <div className="flex items-start gap-2 p-4 bg-gray-100 rounded-lg">
            <Info className="w-4 h-4 mt-1 text-blue-500" />
            <p className="text-sm text-gray-600">
              メール通知は、登録されたメールアドレスに送信されます。プッシュ通知は、ブラウザの設定でプッシュ通知を許可する必要があります。
            </p>
          </div>
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

export default NotificationSettings;
