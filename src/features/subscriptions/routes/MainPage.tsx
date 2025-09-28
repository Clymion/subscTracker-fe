import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SubscriptionFreqDisplay, SubscriptionFrequency } from '@/constants/subscription';
import { useExchangeRates } from '@/features/settings/hooks/useExchangeRates';
import { SubscriptionSummaryResponse, SubscriptionSummary } from '@/features/subscriptions/types';
import apiClient from '@/lib/api-client';

// FIXME: フィルターアイコンと並び替えアイコンがわかりにくい

import FilterDialog, {
  PayHistoryFilterOptions,
  SubscFilterOptions,
} from '../components/FilterDialog';
import SortDialog from '../components/SortDialog';
import SubscriptionDrawer from '../components/SubscriptionDrawer';

const MainPage = () => {
  type ValueOf<T> = T[keyof T];
  const [periodUnit, setPeriodUnit] = useState<ValueOf<typeof SubscriptionFreqDisplay>>(
    SubscriptionFreqDisplay.MONTH,
  );
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleSort = (sortOptions: { field: string; order: string }) => {
    console.log('Sort by:', sortOptions);
    // TODO: ソート処理の実装
  };

  const handleFilter = (filterOptions: SubscFilterOptions | PayHistoryFilterOptions) => {
    console.log('Filter by:', filterOptions);
    // TODO: フィルター処理の実装
  };

  const { data: subscriptions = [], isLoading } = useQuery<SubscriptionSummary[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get<SubscriptionSummaryResponse>('/subscriptions', {
        headers,
      });
      return response.data.subscriptions;
    },
    refetchOnWindowFocus: false,
  });

  /**
   * @description 表示用のサブスクリプションリストと表示価格を計算する
   * - まず、各サブスクリプションの料金を「月額」に正規化
   * - その後、選択された表示単位（日/月/年）に基づいて表示価格を計算
   */
  const displaySubscriptions = useMemo(() => {
    return subscriptions.map((sub) => {
      let monthlyPrice = 0;
      // まず、各サブスクの支払い頻度を基に月額料金に正規化する
      switch (sub.paymentFrequency) {
        case SubscriptionFrequency.DAILY:
          monthlyPrice = sub.price * 30; // 1ヶ月を30日として計算
          break;
        case SubscriptionFrequency.YEARLY:
          monthlyPrice = sub.price / 12;
          break;
        case SubscriptionFrequency.MONTHLY:
        default:
          monthlyPrice = sub.price;
          break;
      }

      // 正規化した月額料金を基に、選択された表示単位の価格を計算する
      let displayPrice = monthlyPrice;
      switch (periodUnit) {
        case SubscriptionFreqDisplay.DAY:
          displayPrice = monthlyPrice / 30; // 1ヶ月を30日として計算
          break;
        case SubscriptionFreqDisplay.YEAR:
          displayPrice = monthlyPrice * 12;
          break;
        case SubscriptionFreqDisplay.MONTH:
        default:
          // 月額の場合は何もしない
          break;
      }

      return {
        ...sub,
        displayPrice, // 計算結果の表示用価格を新しいプロパティとして追加
      };
    });
  }, [subscriptions, periodUnit]);

  // 今月の1日
  const startOfMonth = (new Date()).setDate(1);
  // TODO: ユーザー設定から取得する
  const baseCurrency = 'JPY';
  const { data: exchangeRates } = useExchangeRates({
    date: new Date(startOfMonth).toISOString().split('T')[0],
    base_currency: baseCurrency,
  });

  /**
   * @description 表示用データに基づいて合計金額を計算する \
   * 合計金額の通貨単位は`USER_SETTINGS.base_currency`に従うものとする
   */
  const totalPrice = useMemo(() => {
    return displaySubscriptions.reduce((sum, sub) => {
      if (sub.currency === baseCurrency) {
        return sum + sub.displayPrice;
      }
      // 為替レートの`from`が`sub.currency`、`to`が`baseCurrency`
      const rate = exchangeRates?.rates[sub.currency];
      console.log('rate', rate);
      if (!rate) {
        throw new Error(`No exchange rate found for ${baseCurrency}`);
      }
      return sum + sub.displayPrice / rate;
    }, 0);
  }, [displaySubscriptions, exchangeRates?.rates]);

  /**
   * @description 合計金額の表示テキストを生成する \
   * 合計金額の通貨単位は`USER_SETTINGS.base_currency`に従うものとする
   */
  const totalPriceText = useMemo(() => {
    const unitText =
      periodUnit === SubscriptionFreqDisplay.DAY
        ? '日'
        : periodUnit === SubscriptionFreqDisplay.MONTH
          ? '月'
          : '年';
    // toLocaleString() で3桁区切りにし、Math.round() で端数を丸める
    return (
      <>
        合計: ¥{Math.round(totalPrice).toLocaleString()}
        <span className="text-gray-600 text-sm">&nbsp;/{unitText}</span>
      </>
    );
  }, [totalPrice, periodUnit]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        richColors
        position="bottom-right"
      />
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
              <p className="text-gray-900 font-medium">{totalPriceText}</p>
              <ToggleGroup
                type="single"
                value={periodUnit}
                onValueChange={(value) => {
                  if (value) setPeriodUnit(value as ValueOf<typeof SubscriptionFreqDisplay>);
                }}
              >
                <ToggleGroupItem
                  value={SubscriptionFreqDisplay.DAY}
                  className="px-2"
                >
                  日
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={SubscriptionFreqDisplay.MONTH}
                  className="px-2"
                >
                  月
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={SubscriptionFreqDisplay.YEAR}
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
          {isLoading && (
            <div className="col-span-full text-center text-gray-500">読み込み中...</div>
          )}
          {!isLoading && displaySubscriptions.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              サブスクリプションがありません
            </div>
          )}
          {!isLoading &&
            displaySubscriptions.length > 0 &&
            displaySubscriptions.map((sub) => (
              <Card
                key={sub.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/subscription/${sub.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{sub.name}</h3>
                      <p className="font-medium text-gray-900">
                        {/* 表示には計算済みの displayPrice を使用 */}
                        {sub.currency === 'JPY'
                          ? `¥${Math.round(sub.displayPrice).toLocaleString()}`
                          : `$${sub.displayPrice.toFixed(2)}`}{' '}
                        {/* 外貨は小数点2桁まで表示 */}
                        <span className="text-gray-600 text-sm">
                          /
                          {periodUnit === SubscriptionFreqDisplay.DAY
                            ? '日'
                            : periodUnit === SubscriptionFreqDisplay.MONTH
                              ? '月'
                              : '年'}
                        </span>
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {sub.labels.map((label, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-1 text-gray-500">
                    <CalendarMonthRoundedIcon />
                    <span className="text-sm">
                      {new Date(sub.nextPaymentDate).toLocaleDateString()}
                    </span>
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
