import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// MUI Icons
// TODO: それぞれのアイコンの大きさを調整
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

import SortDialog from './SortDialog';
import FilterDialog from './FilterDialog';
import SubscriptionDrawer from './SubscriptionDrawer';

const MainPage = () => {
  const [periodUnit, setPeriodUnit] = useState('month');
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleSort = (sortOptions: { field: string; order: string }) => {
    console.log('Sort by:', sortOptions);
    // TODO: ソート処理の実装
  };

  const handleFilter = (filterOptions: {
    status: string[];
    labels: string[];
    priceMin: string;
    priceMax: string;
    currency: string;
  }) => {
    console.log('Filter by:', filterOptions);
    // TODO: フィルター処理の実装
  };

  // サンプルデータ
  const subscriptions = [
    {
      id: 1,
      name: 'Netflix',
      price: 1980,
      currency: 'JPY',
      nextPayment: '2024-11-15',
      status: 'active',
      labels: ['動画', 'エンタメ'],
    },
    {
      id: 2,
      name: 'Spotify',
      price: 980,
      currency: 'JPY',
      nextPayment: '2024-11-20',
      status: 'active',
      labels: ['音楽'],
    },
    {
      id: 3,
      name: 'AWS',
      price: 25.8,
      currency: 'USD',
      nextPayment: '2024-11-01',
      status: 'active',
      labels: ['クラウド', 'ビジネス'],
    },
    {
      id: 4,
      name: 'Google One',
      price: 250,
      currency: 'JPY',
      nextPayment: '2024-11-05',
      status: 'active',
      labels: ['ストレージ'],
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
      <div className="lg:ml-64 p-4">
        {/* ヘッダー */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">サブスクリプション</h2>
            <Button onClick={() => setDrawerOpen(true)}>
              <AddRoundedIcon />
              <span className="ml-2">新規登録</span>
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-gray-900 font-medium">
                合計: ¥4,590
                <span className="text-gray-600 text-sm">
                  /{periodUnit === 'day' ? '日' : periodUnit === 'month' ? '月' : '年'}
                </span>
              </p>
              <ToggleGroup
                type="single"
                value={periodUnit}
                onValueChange={setPeriodUnit}
              >
                <ToggleGroupItem
                  value="day"
                  className="px-2"
                >
                  日
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="month"
                  className="px-2"
                >
                  月
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="year"
                  className="px-2"
                >
                  年
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortDialogOpen(true)}
              >
                <SortRoundedIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFilterDialogOpen(true)}
              >
                <FilterListRoundedIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* サブスクリプション一覧 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/subscription/${sub.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">{sub.name}</h3>
                    <p className="font-medium text-gray-900">
                      {sub.currency === 'JPY' ? `¥${sub.price.toLocaleString()}` : `$${sub.price}`}
                      <span className="text-gray-600 text-sm">
                        /{periodUnit === 'day' ? '日' : periodUnit === 'month' ? '月' : '年'}
                      </span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {sub.labels.map((label, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 text-gray-500">
                  <CalendarMonthRoundedIcon />
                  <span className="text-sm">{new Date(sub.nextPayment).toLocaleDateString()}</span>
                </div>
              </CardContent>
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

      {/* ダイアログ */}
      <SortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        onSort={handleSort}
      />
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onFilter={handleFilter}
      />

      {/* 新規登録ドロワー */}
      <SubscriptionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=home"
      />
    </div>
  );
};

export default MainPage;
