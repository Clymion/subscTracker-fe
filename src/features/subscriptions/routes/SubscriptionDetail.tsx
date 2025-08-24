import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionFrequency, SubscriptionStatus } from '@/constants/subscription';
import { SubscriptionSchema } from '@/features/subscriptions/schemas';
import { Subscription, SubscriptionResponse } from '@/features/subscriptions/types';
import apiClient from '@/lib/api-client';

const SubscriptionDetail = () => {
  type ValueOf<T> = T[keyof T];
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Subscription>({
    id: id || '',
    name: '',
    price: 0,
    currency: 'JPY',
    frequency: SubscriptionFrequency.MONTHLY,
    initialPaymentDate: null,
    nextPaymentDate: null,
    paymentMethod: 'credit_card',
    labels: [],
    url: '',
    notes: '',
    status: SubscriptionStatus.ACTIVE,
  });

  // TODO: APIから取得するように変更する
  const availableLabels = ['動画', '音楽', 'エンタメ', 'クラウド', 'ビジネス', 'ストレージ'];

  // データ取得
  const { data: subscription, isLoading } = useQuery({
    queryKey: [`subscription/${id}`,],
    queryFn: async () => {
      if (!id) throw new Error('Subscription ID is required');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get<SubscriptionResponse>(`/subscriptions/${id}`, {
        headers,
      });
      return response.data || null;
    },
  });

  /** @var updateMutation - サブスクリプション編集のミューテーション */
  const updateMutation = useMutation({
    mutationFn: async (updatedSubscription: Subscription) => {
      if (!id) throw new Error('Subscription ID is required');
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.put<SubscriptionResponse>(
        `/subscriptions/${id}`,
        {
          subscription: updatedSubscription,
        },
        { headers },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setFormData(data);
      toast.success('サブスクリプションを更新しました');
    },
    onError: () => {
      toast.error('サブスクリプションの更新に失敗しました');
    },
  });

  const toggleLabel = (label: string) => {
    if (isEditing) {
      setFormData((prev) => {
        const labels = prev.labels.includes(label)
          ? prev.labels.filter((l) => l !== label)
          : [...prev.labels, label];
        return { ...prev, labels };
      });
    }
  };

  // 保存処理
  const handleSave = async () => {
    // バリデーションチェック
    const validation = SubscriptionSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((err) => `${err.path[0]}: ${err.message}`)
        .join('\n');
      toast.error('入力内容に誤りがあります', {
        description: errorMessages,
      });
      return;
    }

    updateMutation.mutate({
      ...formData,
      initialPaymentDate: formData.initialPaymentDate
        ? format(formData.initialPaymentDate, 'yyyy-MM-dd')
        : null,
      nextPaymentDate: formData.nextPaymentDate
        ? format(formData.nextPaymentDate, 'yyyy-MM-dd')
        : null,
    });
    setIsEditing(false);
  };

  const commonHeader = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/main')}
          >
            <ArrowBackRoundedIcon />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'サブスクリプション編集' : 'サブスクリプション詳細'}
          </h1>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <EditRoundedIcon />
            編集
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              保存
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {commonHeader()}
        <div className="space-y-6">
          {isLoading && <div className="text-center">読み込み中...</div>}
        </div>
      </div>
    </div>
    );
  } else {
    if (!subscription) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {commonHeader()}
            <div className="space-y-6">
              <div className="text-center text-red-500">サブスクリプションが見つかりません</div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster
        richColors
        position="bottom-right"
      />
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        {commonHeader()}

        {/* メインコンテンツ */}
        <div className="space-y-6">
          <>
            {/* 基本情報カード */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">基本情報</h2>

                  {/* サービス名 */}
                  <div className="space-y-2">
                    <Label htmlFor="name">サービス名</Label>
                    <Input
                      id="name"
                      value={subscription.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* 料金と通貨 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">料金</Label>
                      <Input
                        id="price"
                        type="number"
                        value={subscription.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">通貨</Label>
                      <Select
                        value={subscription.currency}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            currency: value,
                          }))
                        }
                        disabled={!isEditing}
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

                  {/* ラベル */}
                  <div className="space-y-2">
                    <Label>ラベル</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableLabels.map((label) => (
                        <Badge
                          key={label}
                          variant={subscription.labels.includes(label) ? 'default' : 'outline'}
                          className={isEditing ? 'cursor-pointer' : ''}
                          onClick={() => toggleLabel(label)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 支払い情報カード */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">支払い情報</h2>

                  {/* 支払い頻度 */}
                  <div className="space-y-2">
                    <Label htmlFor="frequency">支払い頻度</Label>
                    <Select
                      value={subscription.frequency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          frequency: value as ValueOf<typeof SubscriptionFrequency>,
                        }))
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SubscriptionFrequency.MONTHLY}>毎月</SelectItem>
                        <SelectItem value={SubscriptionFrequency.YEARLY}>毎年</SelectItem>
                        {/* <SelectItem value={SubscriptionFrequency.DAILY}>毎週</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 初回支払日 */}
                  <div className="space-y-2">
                    <Label>初回支払日</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!isEditing}
                        >
                          <TodayRoundedIcon />
                          {subscription.initialPaymentDate
                            ? format(subscription.initialPaymentDate, 'PPP', { locale: ja })
                            : '未設定'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            subscription.initialPaymentDate
                              ? new Date(subscription.initialPaymentDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            date &&
                            setFormData((prev) => ({
                              ...prev,
                              initialPaymentDate: date ? format(date, 'yyyy-MM-dd') : null,
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 次回支払日 */}
                  <div className="space-y-2">
                    <Label>次回支払日</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={true}
                    >
                      <EventRepeatRoundedIcon />
                      {subscription.nextPaymentDate
                        ? format(subscription.nextPaymentDate, 'PPP', { locale: ja })
                        : '未設定'}
                    </Button>
                  </div>

                  {/* 支払い方法 */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">支払い方法</Label>
                    <Select
                      value={subscription.paymentMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                      disabled={!isEditing}
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
                </div>
              </CardContent>
            </Card>

            {/* その他情報カード */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">その他情報</h2>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={subscription.url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {/* メモ */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">メモ</Label>
                    <Textarea
                      id="notes"
                      value={subscription.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
