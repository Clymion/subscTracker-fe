import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// 日付フォーマット用ヘルパー
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

interface SubscriptionForm {
  name: string;
  price: string;
  currency: string;
  frequency: string;
  initialPaymentDate: Date | null;
  paymentMethod: string;
  labels: string[];
  url?: string;
  notes?: string;
}

interface SubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionDrawer = ({ open, onOpenChange }: SubscriptionDrawerProps) => {
  // フォームの状態管理
  const [formData, setFormData] = useState<SubscriptionForm>({
    name: '',
    price: '',
    currency: 'JPY',
    frequency: 'monthly',
    initialPaymentDate: new Date(),
    paymentMethod: 'credit_card',
    labels: [],
    url: '',
    notes: '',
  });

  // 利用可能なラベル一覧（実際にはDBから取得）
  const availableLabels = ['動画', '音楽', 'エンタメ', 'クラウド', 'ビジネス', 'ストレージ'];

  // ラベルの選択/解除
  const toggleLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: API呼び出し
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>サブスクリプション登録</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* サービス名 */}
            <div className="space-y-2">
              <Label htmlFor="name">サービス名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例: Netflix"
                required
              />
            </div>

            {/* 料金と通貨 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">料金 *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="例: 1980"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">通貨 *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">JPY - 日本円</SelectItem>
                    <SelectItem value="USD">USD - 米ドル</SelectItem>
                    <SelectItem value="EUR">EUR - ユーロ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 支払い頻度 */}
            <div className="space-y-2">
              <Label htmlFor="frequency">支払い頻度 *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">毎月</SelectItem>
                  <SelectItem value="yearly">毎年</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 初回支払日 */}
            <div className="space-y-2">
              <Label>初回支払日 *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarMonthRoundedIcon />
                    {formData.initialPaymentDate ? (
                      format(formData.initialPaymentDate, 'PPP', { locale: ja })
                    ) : (
                      <span>日付を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.initialPaymentDate ?? undefined}
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, initialPaymentDate: date ?? null }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 支払い方法 */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">支払い方法 *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">クレジットカード</SelectItem>
                  <SelectItem value="bank_transfer">銀行振込</SelectItem>
                  <SelectItem value="convenience_store">コンビニ決済</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ラベル */}
            <div className="space-y-2">
              <Label>ラベル</Label>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => (
                  <Badge
                    key={label}
                    variant={formData.labels.includes(label) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleLabel(label)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <Label htmlFor="notes">メモ</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="備考やメモを入力"
              />
            </div>
          </div>

          <SheetFooter className="gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">登録</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default SubscriptionDrawer;
