import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// MUI Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CurrencyExchangeRoundedIcon from '@mui/icons-material/CurrencyExchangeRounded';

import SortDialog from './SortDialog';
import FilterDialog, { PayHistoryFilterOptions, SubscFilterOptions } from './FilterDialog';
import PaymentRecordDrawer, {PaymentRecord, payHistoryFormSchema} from './PaymentRecordDrawer';

const PaymentHistoryPage = () => {
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [showInJPY, setShowInJPY] = useState(true);

  const navigate = useNavigate();

  const handleSort = (sortOptions: { field: string; order: string }) => {
    console.log('Sort by:', sortOptions);
    // TODO: ソート処理の実装
  };

  const handleFilter = (filterOptions: PayHistoryFilterOptions | SubscFilterOptions) => {
    console.log('Filter by:', filterOptions);
    // TODO: フィルター処理の実装
  };

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

  // 金額表示を計算する関数
  const getDisplayAmount = (payment: (typeof paymentHistory)[0]) => {
    if (payment.currency === 'JPY') {
      return `¥${payment.amount.toLocaleString()}`;
    }
    if (showInJPY && payment.exchangeRate) {
      return `¥${Math.round(payment.amount * payment.exchangeRate).toLocaleString()}`;
    }
    return `$${payment.amount}`;
  };

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
              onClick={() => setShowInJPY(!showInJPY)}
              className={!showInJPY ? 'bg-gray-100' : ''}
            >
              <CurrencyExchangeRoundedIcon />
            </Button>
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

        {/* 支払い履歴テーブル */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>支払日</TableHead>
                <TableHead>サービス名</TableHead>
                <TableHead className="hidden md:table-cell">支払い方法</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(payment)}
                >
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.subscriptionName}</TableCell>
                  <TableCell className="hidden md:table-cell">{payment.paymentMethod}</TableCell>
                  <TableCell className="text-right">{getDisplayAmount(payment)}</TableCell>
                </TableRow>
              ))}
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
