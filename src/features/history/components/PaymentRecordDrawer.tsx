import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Payment } from '@/features/history/types';
import { SubscriptionSummary } from '@/features/subscriptions/types';
import { cn } from '@/lib/utils';

// Validation Schema
export const payHistoryFormSchema = z.object({
  subscriptionId: z.string().min(1, { message: 'サブスクリプションを選択してください' }),
  paymentDate: z.date({
    required_error: '支払日を選択してください',
  }),
  paymentMethod: z.string().min(1, { message: '支払い方法を選択してください' }),
  amount: z.string().min(1, { message: '金額を入力してください' }),
  currency: z.string().default('JPY'),
});

const paymentMethods = [
  { id: 'credit_card', name: 'クレジットカード' },
  { id: 'bank_transfer', name: '銀行振込' },
  { id: 'paypay', name: 'PayPay' },
];

interface PaymentRecordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentRecord?: Payment;
  mode?: 'create' | 'view' | 'edit';
  onSubmit: (data: z.infer<typeof payHistoryFormSchema>) => void;
  onDelete?: () => void;
  subscriptions: SubscriptionSummary[];
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const PaymentRecordDrawer = ({
  open,
  onOpenChange,
  paymentRecord,
  mode = 'create',
  onSubmit,
  onDelete,
  subscriptions,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
}: PaymentRecordDrawerProps) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');

  const isLoading = isCreating || isUpdating || isDeleting;

  const currencies = [
    { value: 'JPY', label: '¥ (JPY)', symbol: '¥' },
    { value: 'USD', label: '$ (USD)', symbol: '$' },
    { value: 'EUR', label: '€ (EUR)', symbol: '€' },
  ];

  // フォームの初期値を設定
  const defaultValues = paymentRecord
    ? {
        subscriptionId: String(paymentRecord.subscriptionId),
        paymentDate: new Date(paymentRecord.paymentDate),
        paymentMethod: paymentRecord.paymentMethod,
        amount: paymentRecord.amount.toString(),
        currency: paymentRecord.currency || 'JPY',
      }
    : {
        subscriptionId: '',
        paymentDate: new Date(),
        paymentMethod: '',
        amount: '',
        currency: 'JPY',
      };

  const form = useForm<z.infer<typeof payHistoryFormSchema>>({
    resolver: zodResolver(payHistoryFormSchema),
    defaultValues,
  });

  // フォームの値を監視して換算表示に使用
  const watchedAmount = useWatch({ control: form.control, name: 'amount' });
  const watchedCurrency = useWatch({ control: form.control, name: 'currency' });

  // paymentRecordまたはmodeが変更されたときにフォームの状態をリセット
  useEffect(() => {
    if (open) {
      if (paymentRecord) {
        form.reset({
          subscriptionId: String(paymentRecord.subscriptionId),
          paymentDate: new Date(paymentRecord.paymentDate),
          paymentMethod: paymentRecord.paymentMethod,
          amount: paymentRecord.amount.toString(),
          currency: paymentRecord.currency || 'JPY',
        });
        setIsEditing(mode === 'edit');
      } else {
        form.reset({
          subscriptionId: '',
          paymentDate: new Date(),
          paymentMethod: '',
          amount: '',
          currency: 'JPY',
        });
        setIsEditing(true);
      }
    }
  }, [paymentRecord, mode, open, form]);

  // サブスクリプション変更時の処理
  const handleSubscriptionChange = (value: string, onChange: (value: string) => void) => {
    onChange(value); // RHFの状態を更新

    const subscription = subscriptions.find((s) => String(s.id) === value);
    if (subscription) {
      form.setValue('amount', subscription.price.toString());
    }
  };

  // 編集モードの切り替え
  const handleEditToggle = () => {
    setIsEditing(true);
  };

  // フォーム送信処理
  const handleSubmit = (values: z.infer<typeof payHistoryFormSchema>) => {
    onSubmit(values);
  };

  const renderActionButtons = () => {
    // 新規作成モード
    if (mode === 'create') {
      return (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
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
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </>
        );
      } else {
        return (
          <>
            <Button
              type="button"
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              編集
            </Button>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isLoading}
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。この支払い記録は永久に削除されます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                    disabled={!isEditing}
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
              onValueChange={(val) => handleSubscriptionChange(val, field.onChange)}
              value={field.value}
              disabled={!isEditing}
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
                    value={String(sub.id)}
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
                        {currencies.find((c) => c.value === (watchedCurrency || 'JPY'))?.symbol}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step={1}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        {...form.register('currency')}
                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditing}
                      >
                        {currencies.map((c) => (
                          <option
                            key={c.value}
                            value={c.value}
                          >
                            {c.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {watchedCurrency !== 'JPY' && (
                  <div className="mt-2">
                    <span className="font-medium">換算金額（JPY）:</span>
                    <span className="ml-2">
                      ¥{' '}
                      {(
                        Number(watchedAmount || 0) * (watchedCurrency === 'USD' ? 148.5 : 160.2)
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
              disabled={!isEditing}
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
        {renderActionButtons()}
      </SheetFooter>
    </div>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset();
          setIsEditing(false);
        }
        onOpenChange(isOpen);
      }}
    >
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <SheetHeader>
              <SheetTitle>
                {mode === 'create'
                  ? '支払いを記録'
                  : isEditing
                  ? '支払い記録を編集'
                  : '支払い詳細'}
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
