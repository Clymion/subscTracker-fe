import React, { useState } from 'react';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionStatus, SubscStatusToText } from '@/constants/subscription';
import { LabelListResponse, LabelType } from '@/features/labels/types';
import { SubscriptionCreateRequestSchema } from '@/features/subscriptions/schemas';
import { SubscriptionCreateRequest } from '@/features/subscriptions/types';
import apiClient from '@/lib/api-client';

interface SubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionDrawer = ({ open, onOpenChange }: SubscriptionDrawerProps) => {
  // フォームの状態管理
  // FIXME
  const [formData, setFormData] = useState<SubscriptionCreateRequest>({
    name: '',
    price: 0,
    currency: 'JPY',
    frequency: 'monthly',
    initialPaymentDate: new Date().toISOString().split('T')[0], // 今日の日付
    paymentMethod: 'credit_card',
    labels: [],
    url: '',
    notes: '',
    status: SubscriptionStatus.ACTIVE, // デフォルトはアクティブ
  });

  /**
   * @var availableLabels - 利用可能なラベル一覧
   */
  const { data: availableLabels = [], isLoading } = useQuery<LabelType[]>({
    queryKey: ['labels'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get<LabelListResponse>('/labels', { headers });
      // id順にソート
      const _labels = [...response.data.labels];
      return _labels.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    },
  });

  // ラベルの選択/解除
  const toggleLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const queryClient = useQueryClient();
  /** @var registerMutation - サブスクリプション登録のミューテーション */
  const registerMutation = useMutation({
    mutationFn: async (data: SubscriptionCreateRequest) => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await apiClient.post('/subscriptions', data, { headers });
    },
    onSuccess: () => {
      toast.success('サブスクリプションを登録しました');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error) => {
      console.error('Subscription registration failed:', error);
      toast.error('サブスクリプションの登録に失敗しました', {
        description: error ? error.message : '不明なエラーが発生しました',
      });
    },
  });

  // フォーム送信
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // バリデーション
    const validation = SubscriptionCreateRequestSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((err) => `${err.path[0]}: ${err.message}`)
        .join('\n');
      toast.error('入力内容に誤りがあります', {
        description: errorMessages,
      });
      return;
    }
    registerMutation.mutate(formData);
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))
                  }
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
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: value as 'daily' | 'monthly' | 'yearly',
                  }))
                }
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
                    selected={
                      formData.initialPaymentDate
                        ? new Date(formData.initialPaymentDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        initialPaymentDate: date ? date.toISOString().split('T')[0] : null,
                      }))
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
                {isLoading && <span className="text-gray-500">読み込み中...</span>}
                {!isLoading && availableLabels.length === 0 && (
                  <span className="text-gray-500">利用可能なラベルがありません</span>
                )}
                {!isLoading &&
                  availableLabels.length > 0 &&
                  availableLabels.map((label) => (
                    <Badge
                      key={label.id}
                      variant={formData.labels.includes(String(label.id)) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      // FIXME: 本来は label.name ではなく label.id を使用するべき
                      onClick={() => toggleLabel(String(label.id))}
                    >
                      {label.name}
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

            {/* ステータス */}
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SubscriptionStatus).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                    >
                      {SubscStatusToText[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
