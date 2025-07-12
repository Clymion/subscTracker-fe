// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: lucide-react -> mui-icons-material
import { Settings, User, CreditCard, Bell, Tag, ChevronRight, Globe, Server } from 'lucide-react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'profile',
      title: 'プロフィール設定',
      icon: <User className="w-5 h-5" />,
      description: 'ユーザー情報の管理',
      path: '/settings/profile',
    },
    {
      id: 'currency',
      title: '通貨設定',
      icon: <Globe className="w-5 h-5" />,
      description: '基準通貨と為替レートの設定',
      path: '/settings/currency',
    },
    {
      id: 'payment',
      title: '支払い方法',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'デフォルトの支払い方法の設定',
      path: '/settings/payment',
    },
    {
      id: 'notification',
      title: '通知設定',
      icon: <Bell className="w-5 h-5" />,
      description: '通知のタイミングと方法の設定',
      path: '/settings/notification',
    },
    {
      id: 'labels',
      title: 'ラベル管理',
      icon: <Tag className="w-5 h-5" />,
      description: 'カスタムラベルの作成と編集',
      path: '/settings/labels',
    },
    {
      id: 'backend-test',
      title: 'バックエンド通信テスト',
      icon: <Server className="w-5 h-5" />,
      description: 'APIサーバーとの接続を確認します',
      path: '/backend-test',
    },
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
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-900">設定</h2>
          </div>
        </div>

        {/* 設定メニュー - グリッドレイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-gray-100">{item.icon}</div>
                    <div>
                      <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                </div>
              </CardHeader>
            </Card>
          ))}
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

export default SettingsPage;
