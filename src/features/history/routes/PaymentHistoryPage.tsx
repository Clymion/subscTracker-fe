import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SwapVertIcon from '@mui/icons-material/SwapVert';
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

import FilterDialog, {
  PayHistoryFilterOptions,
  SubscFilterOptions,
} from '../../subscriptions/components/FilterDialog';
import PaymentRecordDrawer, {
  PaymentRecord,
  payHistoryFormSchema,
} from '../components/PaymentRecordDrawer';

// サンプルデータ
const paymentHistory = [
  {
    id: 1,
    subscriptionId: 'netflix-1',
    subscriptionName: 'Netflix',
    amount: 1980,
    currency: 'JPY',
    paymentDate: '2024-12-15',
    paymentMethod: 'クレジットカード',
    exchangeRate: null,
  },
  {
    id: 2,
    subscriptionId: 'aws-2',
    subscriptionName: 'AWS',
    amount: 25.8,
    currency: 'USD',
    paymentDate: '2024-11-01',
    paymentMethod: 'クレジットカード',
    exchangeRate: 148.2,
  },
  {
    id: 3,
    subscriptionId: 'spotify-3',
    subscriptionName: 'Spotify',
    amount: 980,
    currency: 'JPY',
    paymentDate: '2024-09-20',
    paymentMethod: 'PayPay',
    exchangeRate: null,
  },
];

type SortableColumn = 'paymentDate' | 'subscriptionName' | 'paymentMethod' | 'amount' | 'exchangeRate';

const PaymentHistoryPage = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [sortConfig, setSortConfig] = useState<{
    key: SortableColumn;
    direction: 'asc' | 'desc';
  } | null>(null);

  const navigate = useNavigate();

  const handleFilter = (filterOptions: PayHistoryFilterOptions | SubscFilterOptions) => {
    console.log('Filter by:', filterOptions);
    // TODO: フィルター処理の実装
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

  const sortedPaymentHistory = useMemo(() => {
    const sortableItems = [...paymentHistory];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aValue: string | number | null;
        let bValue: string | number | null;

        if (key === 'amount') {
          aValue =
            a.currency !== 'JPY' && a.exchangeRate ? Math.round(a.amount * a.exchangeRate) : a.amount;
          bValue =
            b.currency !== 'JPY' && b.exchangeRate ? Math.round(b.amount * b.exchangeRate) : b.amount;
        } else {
          aValue = a[key];
          bValue = b[key];
        }

        if (aValue === null || bValue === null) {
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
  }, [sortConfig]);

  // 状態の追加
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | undefined>();

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
  const handleRowClick = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

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
                      <SelectItem value="2024">2024年</SelectItem>
                      <SelectItem value="2023">2023年</SelectItem>
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
                      {Array.from({ length: 12 }, (_, i) => (
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
                  <p className="text-xl font-bold">¥5,783</p>
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
                const jpyAmount =
                  payment.currency === 'JPY' || !payment.exchangeRate
                    ? payment.amount
                    : Math.round(payment.amount * payment.exchangeRate);

                const originalAmountDisplay =
                  payment.currency === 'JPY'
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
                    <TableCell className="hidden md:table-cell">{payment.paymentMethod}</TableCell>
                    <TableCell className="text-right">{`¥${jpyAmount.toLocaleString()}`}</TableCell>
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
