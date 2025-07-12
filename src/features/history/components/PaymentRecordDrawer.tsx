import { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// 型定義
export type PaymentRecord = {
  id: number;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  exchangeRate: number | null;
};

// Validation Schema
export const payHistoryFormSchema = z.object({
  subscriptionId: z.string().min(1, { message: 'サブスクリプションを選択してください' }),
  paymentDate: z.date({
    required_error: '支払日を選択してください',
  }),
  paymentMethod: z.string().min(1, { message: '支払い方法を選択してください' }),
  amount: z.string().min(1, { message: '金額を入力してください' }),
});

// サンプルデータ（実際はAPIから取得）
const subscriptions = [
  { id: '1', name: 'Netflix', currency: 'JPY', amount: 1980 },
  { id: '2', name: 'AWS', currency: 'USD', amount: 25.8 },
  { id: '3', name: 'Spotify', currency: 'JPY', amount: 980 },
];

const paymentMethods = [
  { id: 'credit_card', name: 'クレジットカード' },
  { id: 'bank_transfer', name: '銀行振込' },
  { id: 'paypay', name: 'PayPay' },
];

interface PaymentRecordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentRecord?: PaymentRecord;
  mode?: 'create' | 'view' | 'edit';
  onSubmit: (data: z.infer<typeof payHistoryFormSchema>) => void;
  onDelete?: () => void;
}

const PaymentRecordDrawer = ({
  open,
  onOpenChange,
  paymentRecord,
  mode = 'create',
  onSubmit,
  onDelete,
}: PaymentRecordDrawerProps) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [currency, setCurrency] = useState('JPY');
  const [amount, setAmount] = useState('');

  const currencies = [
    { value: 'JPY', label: '¥ (JPY)', symbol: '¥' },
    { value: 'USD', label: '$ (USD)', symbol: '$' },
    { value: 'EUR', label: '€ (EUR)', symbol: '€' },
  ];

  // フォームの初期値を設定
  const defaultValues = paymentRecord
    ? {
        subscriptionId: paymentRecord.subscriptionId,
        paymentDate: new Date(paymentRecord.paymentDate),
        paymentMethod: paymentRecord.paymentMethod,
        amount: paymentRecord.amount.toString(),
      }
    : {
        subscriptionId: '',
        paymentDate: new Date(),
        paymentMethod: '',
        amount: '',
      };

  const form = useForm<z.infer<typeof payHistoryFormSchema>>({
    resolver: zodResolver(payHistoryFormSchema),
    defaultValues,
  });

  // paymentRecordが変更されたときにフォームの値をリセット
  useEffect(() => {
    if (paymentRecord) {
      form.reset({
        subscriptionId: paymentRecord.subscriptionId,
        paymentDate: new Date(paymentRecord.paymentDate),
        paymentMethod: paymentRecord.paymentMethod,
        amount: paymentRecord.amount.toString(),
      });
    } else {
      form.reset({
        subscriptionId: '',
        paymentDate: new Date(),
        paymentMethod: '',
        amount: '',
      });
    }
  }, [paymentRecord, form]);

  // 選択されたサブスクリプションの情報を取得
  // const selectedSubscription = subscriptions.find((s) => s.id === form.watch('subscriptionId'));

  // サブスクリプション変更時の処理
  const handleSubscriptionChange = (value: string) => {
    form.setValue('subscriptionId', value);
    const subscription = subscriptions.find((s) => s.id === value);
    if (subscription) {
      form.setValue('amount', subscription.amount.toString());
    }
  };

  // 編集モードの切り替え
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // 編集モードに入る時、現在の値をフォームに設定
      form.reset(defaultValues);
    }
  };

  // フォーム送信処理
  const handleSubmit = (values: z.infer<typeof payHistoryFormSchema>) => {
    onSubmit(values);
    if (mode === 'edit') {
      setIsEditing(false);
    }
    setIsEditing(false);
    onOpenChange(false);
  };

  const ActionButtons = () => {
    // 新規作成モード
    if (mode === 'create') {
      return (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </>
      );
    }

    // 表示・編集モード
    if (mode === 'view' || mode === 'edit') {
      if (isEditing) {
        return (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                form.reset(); // フォームをリセット
              }}
            >
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </>
        );
      } else {
        return (
          <>
            <Button
              type="button"
              onClick={handleEditToggle}
            >
              編集
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                削除
              </Button>
            )}
          </>
        );
      }
    }

    return null;
  };

  const renderFormFields = () => (
    <div className="flex-1 space-y-6 py-6">
      {/* 支払日 */}
      <FormField
        control={form.control}
        name="paymentDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>支払日 *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                    disabled={!isEditing && mode !== 'create'}
                  >
                    {field.value ? (
                      format(field.value, 'PPP', { locale: ja })
                    ) : (
                      <span>日付を選択</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
              >
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

      {/* サブスクリプション選択 */}
      <FormField
        control={form.control}
        name="subscriptionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>サブスクリプション *</FormLabel>
            <Select
              onValueChange={handleSubscriptionChange}
              defaultValue={field.value}
              disabled={!isEditing && mode !== 'create'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="サブスクリプションを選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subscriptions.map((sub) => (
                  <SelectItem
                    key={sub.id}
                    value={sub.id}
                  >
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 支払い金額 */}
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">金額 *</FormLabel>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="relative flex-1">
                  <div className="flex">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {currencies.find((c) => c.value === currency)?.symbol}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onBlur={(e) => setAmount(e.target.value)}
                        step={1}
                        disabled={!isEditing && mode !== 'create'}
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditing && mode !== 'create'}
                      >
                        {currencies.map((currency) => (
                          <option
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {currency !== 'JPY' && (
                  <div className="mt-2">
                    <span className="font-medium">換算金額（JPY）:</span>
                    <span className="ml-2">
                      ¥{' '}
                      {(
                        Number(amount || 0) * (currency === 'USD' ? 148.5 : 160.2)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
              disabled={!isEditing && mode !== 'create'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="支払い方法を選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id}
                  >
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* アクションボタン */}
      <SheetFooter className="gap-4 pt-4">
        <ActionButtons />
      </SheetFooter>
    </div>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <SheetHeader>
              <SheetTitle>
                {mode === 'create' ? '支払いを記録' : isEditing ? '支払い記録を編集' : '支払い詳細'}
              </SheetTitle>
            </SheetHeader>
            {renderFormFields()}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentRecordDrawer;
