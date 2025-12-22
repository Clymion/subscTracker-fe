import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { SideNavigation } from '@/components/layout/SideNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentMethod, PaymentMethodLabels } from '@/constants/subscription';
import PaymentRecordDrawer, {
  payHistoryFormSchema,
} from '@/features/history/components/PaymentRecordDrawer';
import { Payment, PaymentHistory } from '@/features/history/types';
import FilterDialog, {
  PayHistoryFilterOptions,
  SubscFilterOptions,
} from '@/features/subscriptions/components/FilterDialog';
import { api } from '@/lib/api-client';

type SortableColumn =
  | 'paymentDate'
  | 'subscriptionName'
  | 'paymentMethod'
  | 'amount'
  | 'exchangeRate';

const PaymentHistoryPage = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // フィルター用の状態
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [sortConfig, setSortConfig] = useState<{
    key: SortableColumn;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();

  // TODO: フィルター周りのUX改善 (他アプリなどを参考に)
  const handleFilter = (filterOptions: PayHistoryFilterOptions | SubscFilterOptions) => {
    console.log('Filter by:', filterOptions);
    // TODO: ダイアログ内のフィルター処理の実装
  };

  const handleSort = (key: SortableColumn) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'desc') {
        setSortConfig({ key, direction: 'asc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: 'desc' });
    }
  };

  // 支払い履歴の取得
  const { data: paymentHistory = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['paymentHistory', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await api.get<PaymentHistory>(
        `/payments?year=${selectedYear}&month=${selectedMonth}`,
      );
      return response.data.payments;
    },
  });

  // 支払い履歴のフィルタリング処理
  // TODO: フィルターした結果がない場合の表示(TSXの方へ)
  const filteredPaymentHistory = useMemo(() => {
    return paymentHistory.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return (
        paymentDate.getFullYear() === Number(selectedYear) &&
        paymentDate.getMonth() + 1 === Number(selectedMonth)
      );
    });
  }, [paymentHistory, selectedYear, selectedMonth]);

  // TODO: ユーザー設定から取得する
  const baseCurrency = 'JPY';

  /**
   * `baseCurrency`に変換
   * 
   * @param amount 元の金額
   * @param currency 元の金額の通貨コード
   * @param rate 為替レート
   * @returns 
   */
  const convertToBaseCurrency = (amount: number, currency: string, rate?: number): number => {
    if (currency === baseCurrency || !rate || rate === 0) {
      return amount;
    }
    // レートは基準通貨から外貨への変換レート (例: JPY→USD) と想定
    return Math.round(amount * rate);
  };

  // ソートされた支払い履歴
  const sortedPaymentHistory = useMemo(() => {
    const sortableItems = [...filteredPaymentHistory];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        if (key === 'amount') {
          aValue = convertToBaseCurrency(a.amount, a.currency, a.exchangeRate);
          bValue = convertToBaseCurrency(b.amount, b.currency, b.exchangeRate);
        } else {
          aValue = a[key];
          bValue = b[key];
        }

        if (aValue === undefined || bValue === undefined) {
          if (aValue === bValue) return 0;
          return aValue === null ? 1 : -1;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPaymentHistory, sortConfig, baseCurrency]);

  // 状態の追加
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();

  // 支払い記録の処理ハンドラ
  const handlePaymentSubmit = (data: z.infer<typeof payHistoryFormSchema>) => {
    if (selectedPayment) {
      // 編集の場合
      console.log('Update payment:', { id: selectedPayment.id, ...data });
    } else {
      // 新規作成の場合
      console.log('Create payment:', data);
    }
  };

  // 支払い記録の削除
  const handlePaymentDelete = () => {
    if (selectedPayment) {
      console.log('Delete payment:', selectedPayment.id);
      setSelectedPayment(undefined);
      setDrawerOpen(false);
    }
  };

  // テーブル行のクリックハンドラ
  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  // 支払い方法の表示用関数
  const displayPaymentMethod = (method: PaymentMethod | undefined) => {
    if (!method) return '不明';
    return PaymentMethodLabels[method];
  };

  // フロントで既に取得した支払い一覧から選択可能な年/月を抽出する（API がない場合のフォールバック）
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    paymentHistory.forEach(p => years.add(new Date(p.paymentDate).getFullYear()));
    return Array.from(years).sort((a,b)=>b-a); // 新しい順
  }, [paymentHistory]);

  const availableMonthsForYear = (year: number) => {
    const months = new Set<number>();
    paymentHistory.forEach(p => {
      const d = new Date(p.paymentDate);
      if (d.getFullYear() === year) months.add(d.getMonth());
    });
    return Array.from(months).sort((a,b)=>a-b);
  };

  // Set the selected year and month to the latest payment record upon initial data load.
  // TODO: 要リファクタリング (ReactのAPIなど設計)
  useEffect(() => {
    if (isInitialLoad && paymentHistory.length > 0) {
      const latestPayment = paymentHistory.reduce((latest, current) => {
        return new Date(latest.paymentDate) > new Date(current.paymentDate) ? latest : current;
      });

      if (latestPayment) {
        const latestYear = new Date(latestPayment.paymentDate).getFullYear().toString();
        const latestMonth = (new Date(latestPayment.paymentDate).getMonth() + 1).toString();
        setSelectedYear(latestYear);
        setSelectedMonth(latestMonth);
      }
      setIsInitialLoad(false);
    }
  }, [paymentHistory, isInitialLoad]);

  // 合計金額の計算
  const totalAmount = useMemo(() => {
    return sortedPaymentHistory.reduce((sum, payment) => {
      const amountInBase = convertToBaseCurrency(
        payment.amount,
        payment.currency,
        payment.exchangeRate,
      );
      return sum + amountInBase;
    }, 0);
  }, [sortedPaymentHistory, baseCurrency]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNavigation />

      {/* メインコンテンツ */}
      <div className="lg:ml-64 p-4">
        {/* ヘッダー */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">支払い履歴</h2>
            <Button onClick={() => setDrawerOpen(true)}>
              <AddRoundedIcon />
              <span className="ml-2">支払いを記録</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="年" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem
                          key={year}
                          value={year.toString()}
                        >
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="月" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonthsForYear(Number(selectedYear)).map((i) => (
                        <SelectItem
                          key={i + 1}
                          value={(i + 1).toString()}

                        >
                          {i + 1}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">今月の合計支払額</p>
                  <p className="text-xl font-bold">¥{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterDialogOpen(true)}
            >
              <FilterListRoundedIcon />
            </Button>
          </div>
        </div>

        {/* 支払い履歴テーブル */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('paymentDate')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    支払日
                    {sortConfig?.key === 'paymentDate' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUpwardRoundedIcon className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDownwardRoundedIcon className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <SwapVertIcon className="ml-2 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('subscriptionName')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    サービス名
                    {sortConfig?.key === 'subscriptionName' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUpwardRoundedIcon className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDownwardRoundedIcon className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <SwapVertIcon className="ml-2 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('paymentMethod')}
                  className="hidden cursor-pointer md:table-cell"
                >
                  <div className="flex items-center">
                    支払い方法
                    {sortConfig?.key === 'paymentMethod' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUpwardRoundedIcon className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDownwardRoundedIcon className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <SwapVertIcon className="ml-2 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('amount')}
                  className="cursor-pointer text-right"
                >
                  <div className="flex items-center justify-end">
                    金額 (JPY)
                    {sortConfig?.key === 'amount' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUpwardRoundedIcon className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDownwardRoundedIcon className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <SwapVertIcon className="ml-2 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">元の金額</TableHead>
                <TableHead
                  onClick={() => handleSort('exchangeRate')}
                  className="cursor-pointer text-right"
                >
                  <div className="flex items-center justify-end">
                    為替レート
                    {sortConfig?.key === 'exchangeRate' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUpwardRoundedIcon className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDownwardRoundedIcon className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <SwapVertIcon className="ml-2 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPaymentHistory.map((payment) => {
                const amountInBase = convertToBaseCurrency(
                  payment.amount,
                  payment.currency,
                  payment.exchangeRate,
                );

                const originalAmountDisplay =
                  payment.currency === baseCurrency
                    ? ''
                    : payment.currency === 'USD'
                      ? `$${payment.amount.toFixed(2)}`
                      : `${payment.currency} ${payment.amount}`;

                return (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(payment)}
                  >
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.subscriptionName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {displayPaymentMethod(payment.paymentMethod)}
                    </TableCell>
                    <TableCell className="text-right">{`¥${amountInBase.toLocaleString()}`}</TableCell>
                    <TableCell className="text-right">{originalAmountDisplay}</TableCell>
                    <TableCell className="text-right">{payment.exchangeRate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
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
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onFilter={handleFilter}
      />
      <PaymentRecordDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        paymentRecord={selectedPayment}
        mode={selectedPayment ? 'view' : 'create'}
        onSubmit={handlePaymentSubmit}
        onDelete={selectedPayment ? handlePaymentDelete : undefined}
      />
    </div>
  );
};

export default PaymentHistoryPage;
