import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { SubscriptionFrequency } from '@/constants/subscription';
import { LabelListResponse, LabelType } from '@/features/labels/types';
import { SubscriptionUpdateRequestSchema } from '@/features/subscriptions/schemas';
import { SubscriptionResponse, SubscriptionUpdateRequest } from '@/features/subscriptions/types';
import { api } from '@/lib/api-client';

const subscriptionDetailFormSchema = SubscriptionUpdateRequestSchema;

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  /**
   * @var availableLabels - 利用可能なラベル一覧
   */
  const { data: availableLabels = [], isLoading: isLoadingLabels } = useQuery<LabelType[]>({
    queryKey: ['labels'],
    queryFn: async () => {
      const response = await api.get<LabelListResponse>('/labels');
      // id順にソート
      const _labels = [...response.data.labels];
      return _labels.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    },
  });

  // データ取得
  const { data: subscription, isLoading } = useQuery({
    queryKey: [`subscription/${id}`],
    queryFn: async () => {
      if (!id) throw new Error('Subscription ID is required');
      const response = await api.get<SubscriptionResponse>(`/subscriptions/${id}`);
      response.data.id = String(response.data.id);
      return response.data || null;
    },
  });

  const form = useForm<SubscriptionUpdateRequest>({
    resolver: zodResolver(subscriptionDetailFormSchema),
    values: subscription ? {
      ...subscription,
      id: String(subscription.id),
      labels: subscription.labels.map((label) => String(label.labelId)),
    } : undefined,
  });

  /** @var updateMutation - サブスクリプション編集のミューテーション */
  const updateMutation = useMutation({
    mutationFn: async (updatedSubscription: SubscriptionUpdateRequest) => {
      if (!id) throw new Error('Subscription ID is required');
      const response = await api.put<SubscriptionResponse>(
        `/subscriptions/${id}`,
        {
          subscription: updatedSubscription,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`subscription/${id}`], data);
      toast.success('サブスクリプションを更新しました');
    },
    onError: () => {
      toast.error('サブスクリプションの更新に失敗しました');
      console.error('Failed to update subscription:');
      console.error(form.getValues());
    },
  });

  // 削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Subscription ID is required');
      await api.delete(`/subscriptions/${id}`);
    },
    onSuccess: () => {
      toast.success('サブスクリプションを削除しました');
      navigate('/main');
    },
    onError: () => {
      toast.error('サブスクリプションの削除に失敗しました');
    },
  });

  // ラベルの選択/解除
  const toggleLabel = (label: string) => {
    if (!isEditing) return;
    const currentLabels = form.getValues('labels');
    form.setValue('labels',
      currentLabels.includes(label)
        ? currentLabels.filter((l) => l !== label)
        : [...currentLabels, label]
    );
  };

  // フォーム値の監視
  const watchedLabels = useWatch({ control: form.control, name: 'labels' });

  // 保存処理
  const handleSave = async () => {
    // バリデーションチェック
    const validation = SubscriptionUpdateRequestSchema.safeParse(form.getValues());
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
      ...form.getValues(),
    });
    setIsEditing(false);
  };

  // キャンセル処理
  const handleCancel = () => {
    if (subscription) {
      const _formData: SubscriptionUpdateRequest = {
        ...subscription,
        id: String(subscription.id),
        labels: subscription.labels.map((label) => String(label.labelId)),
      };
      form.reset(_formData);
    }
    setIsEditing(false);
  };

  // 共通ヘッダー
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
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (window.confirm('本当に削除しますか？この操作は取り消せません。')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending === true}
              className="mr-2"
            >
              <DeleteRoundedIcon />
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <EditRoundedIcon />
              編集
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
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
  };

  // ローディング中
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
    // サブスクリプションが存在しない場合
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
        <Form {...form}>
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>サービス名</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 料金と通貨 */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>料金</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>通貨</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!isEditing}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="JPY">JPY - 日本円</SelectItem>
                                <SelectItem value="USD">USD - 米ドル</SelectItem>
                                <SelectItem value="EUR">EUR - ユーロ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ラベル */}
                    <div className="space-y-2">
                      <Label>ラベル</Label>
                      <div className="flex flex-wrap gap-2">
                        {isLoadingLabels && <span className="text-gray-500">読み込み中...</span>}
                        {!isLoadingLabels && availableLabels.length === 0 && (
                          <span className="text-gray-500">利用可能なラベルがありません</span>
                        )}
                        {!isLoading &&
                          availableLabels.length > 0 &&
                          availableLabels.map((label) => (
                            <Badge
                              key={label.id}
                              variant={
                                watchedLabels?.includes(String(label.id)) ? 'default' : 'outline'
                              }
                              className={isEditing ? 'cursor-pointer' : ''}
                              onClick={() => toggleLabel(String(label.id))}
                            >
                              {label.name}
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
                    <FormField
                      control={form.control}
                      name="paymentFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>支払い頻度</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SubscriptionFrequency.MONTHLY}>毎月</SelectItem>
                              <SelectItem value={SubscriptionFrequency.YEARLY}>毎年</SelectItem>
                              <SelectItem value={SubscriptionFrequency.DAILY}>毎週</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 初回支払日 */}
                    <FormField
                      control={form.control}
                      name="initialPaymentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>初回支払日</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  disabled={!isEditing}
                                >
                                  <TodayRoundedIcon />
                                  {field.value
                                    ? format(new Date(field.value.replace(/-/g, '/')), 'PPP', { locale: ja })
                                    : '未設定'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                defaultMonth={field.value ? new Date(field.value.replace(/-/g, '/')) : new Date()}
                                selected={field.value ? new Date(field.value.replace(/-/g, '/')) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 次回支払日 */}
                    <FormField
                      control={form.control}
                      name="nextPaymentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>次回支払日</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={true}
                          >
                            <EventRepeatRoundedIcon />
                            {field.value
                              ? format(new Date(field.value.replace(/-/g, '/')), 'PPP', { locale: ja })
                              : '未設定'}
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 支払い方法 */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>支払い方法</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit_card">クレジットカード</SelectItem>
                              <SelectItem value="bank_transfer">銀行振込</SelectItem>
                              <SelectItem value="convenience_store">コンビニ決済</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* その他情報カード */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">その他情報</h2>

                    {/* URL */}
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input type="url" {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* メモ */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メモ</FormLabel>
                          <FormControl>
                            <Textarea {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
