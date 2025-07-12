import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ChevronLeft, Plus, Check } from 'lucide-react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PaymentMethodSettings = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // サンプルデータ
  const paymentMethods = [
    {
      id: 1,
      type: 'credit_card',
      cardBrand: 'Visa',
      lastFourDigits: '4242',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: 2,
      type: 'credit_card',
      cardBrand: 'Mastercard',
      lastFourDigits: '8888',
      expiryDate: '09/24',
      isDefault: false,
    },
  ];

  const handleDelete = (methodId: number) => {
    console.log('Delete payment method:', methodId);
  };

  const handleSetDefault = (methodId: number) => {
    console.log('Set as default:', methodId);
  };

  const handleAddCard = (formData: {
    cardNumber: string;
    expiryDate: string;
    securityCode: string;
    cardholderName: string;
  }) => {
    console.log('Add new card:', formData);
    setShowAddDialog(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-900">支払い方法</h2>
            </div>
            <Button
              className="gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4" />
              追加
            </Button>
          </div>
        </div>

        {/* 支払い方法一覧 */}
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>登録済みの支払い方法</CardTitle>
              <CardDescription>
                サブスクリプションの支払いに使用するカードを管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gray-100">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.cardBrand}</p>
                        <p className="text-gray-500">**** {method.lastFourDigits}</p>
                        {method.isDefault && (
                          <Badge
                            variant="secondary"
                            className="gap-1"
                          >
                            <Check className="w-3 h-3" />
                            デフォルト
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">有効期限: {method.expiryDate}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        ・・・
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!method.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                          デフォルトに設定
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(method.id)}
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {paymentMethods.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p>登録されている支払い方法はありません</p>
                </div>
              )}
            </CardContent>
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

      {/* 支払い方法追加ダイアログ */}
      <Dialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>支払い方法の追加</DialogTitle>
            <DialogDescription>新しいクレジットカードを追加します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">カード番号</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">有効期限</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityCode">セキュリティコード</Label>
                <Input
                  id="securityCode"
                  type="password"
                  placeholder="123"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardholderName">カード名義</Label>
              <Input
                id="cardholderName"
                placeholder="TARO YAMADA"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={() =>
                handleAddCard({
                  cardNumber: (document.getElementById('cardNumber') as HTMLInputElement).value,
                  expiryDate: (document.getElementById('expiryDate') as HTMLInputElement).value,
                  securityCode: (document.getElementById('securityCode') as HTMLInputElement).value,
                  cardholderName: (document.getElementById('cardholderName') as HTMLInputElement)
                    .value,
                })
              }
            >
              追加する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodSettings;
