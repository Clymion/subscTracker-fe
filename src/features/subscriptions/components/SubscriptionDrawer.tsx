import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionFrequency, SubscriptionStatus, SubscStatusToText } from '@/constants/subscription';
import { LabelListResponse, LabelType } from '@/features/labels/types';
import { SubscriptionCreateRequest } from '@/features/subscriptions/types';
import { api } from '@/lib/api-client';

interface SubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// フォーム用バリデーションスキーマ
const subscriptionFormSchema = z.object({
  name: z.string().min(1, { message: 'サービス名を入力してください' }),
  price: z.coerce.number().min(0, { message: '料金は0以上でなければなりません' }),
  currency: z.string().default('JPY'),
  frequency: z.enum([
    SubscriptionFrequency.DAILY,
    SubscriptionFrequency.MONTHLY,
    SubscriptionFrequency.YEARLY,
  ]),
  initialPaymentDate: z.date({ required_error: '初回支払日を選択してください' }),
  paymentMethod: z.string().min(1, { message: '支払い方法を選択してください' }),
  labels: z.array(z.string()).default([]),
  url: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum([
      SubscriptionStatus.TRIAL,
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.SUSPENDED,
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.EXPIRED,
    ])
    .default(SubscriptionStatus.ACTIVE),
});

const SubscriptionDrawer = ({ open, onOpenChange }: SubscriptionDrawerProps) => {
  const form = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      currency: 'JPY',
      frequency: SubscriptionFrequency.MONTHLY,
      initialPaymentDate: new Date(),
      paymentMethod: 'credit_card',
      labels: [],
      url: '',
      notes: '',
      status: SubscriptionStatus.ACTIVE,
    },
  });

  /**
   * @var availableLabels - 利用可能なラベル一覧
   */
  const { data: availableLabels = [], isLoading } = useQuery<LabelType[]>({
    queryKey: ['labels'],
    queryFn: async () => {
      const response = await api.get<LabelListResponse>('/labels');
      // id順にソート
      const _labels = [...response.data.labels];
      return _labels.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    },
  });

  const watchedLabels = form.watch('labels');

  // ラベルの選択/解除
  const toggleLabel = (labelId: string) => {
    const currentLabels = form.getValues('labels');
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    form.setValue('labels', newLabels);
  };

  const queryClient = useQueryClient();
  /** @var registerMutation - サブスクリプション登録のミューテーション */
  const registerMutation = useMutation({
    mutationFn: async (data: SubscriptionCreateRequest) => {
      return await api.post('/subscriptions', data);
    },
    onSuccess: () => {
      toast.success('サブスクリプションを登録しました');
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error) => {
      console.error('Subscription registration failed:', error);
      toast.error('サブスクリプションの登録に失敗しました', {
        description: error ? error.message : '不明なエラーが発生しました',
      });
    },
  });

  const isLoadingMutation = registerMutation.isPending;

  // フォーム送信処理
  const onSubmit = (values: z.infer<typeof subscriptionFormSchema>) => {
    const requestData: SubscriptionCreateRequest = {
      ...values,
      price: Number(values.price),
      initialPaymentDate: format(values.initialPaymentDate, 'yyyy-MM-dd'),
    };
    registerMutation.mutate(requestData);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset();
        }
        onOpenChange(isOpen);
      }}
    >
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <SheetHeader>
              <SheetTitle>サブスクリプション登録</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* サービス名 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サービス名 *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="例: Netflix"
                      />
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
                      <FormLabel>料金 *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="例: 1980"
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
                      <FormLabel>通貨 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

              {/* 支払い頻度 */}
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>支払い頻度 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SubscriptionFrequency.MONTHLY}>毎月</SelectItem>
                        <SelectItem value={SubscriptionFrequency.YEARLY}>毎年</SelectItem>
                        <SelectItem value={SubscriptionFrequency.DAILY}>毎日</SelectItem>
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
                    <FormLabel>初回支払日 *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarMonthRoundedIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ja })
                            ) : (
                              <span>日付を選択</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ja}
                        />
                      </PopoverContent>
                    </Popover>
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
                    <FormLabel>支払い方法 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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

              {/* ラベル */}
              <div className="space-y-2">
                <FormLabel>ラベル</FormLabel>
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
                        variant={watchedLabels.includes(String(label.id)) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleLabel(String(label.id))}
                      >
                        {label.name}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com"
                      />
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
                      <Textarea
                        {...field}
                        placeholder="備考やメモを入力"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ステータス */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoadingMutation}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isLoadingMutation}
              >
                {isLoadingMutation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登録
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default SubscriptionDrawer;
