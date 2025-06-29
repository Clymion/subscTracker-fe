import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // サブスクリプションのデータ状態
  const [subscription, setSubscription] = useState({
    id: '1',
    name: 'Netflix',
    price: 1980,
    currency: 'JPY',
    frequency: 'monthly',
    initialPaymentDate: new Date('2024-01-15'),
    nextPaymentDate: new Date('2024-11-15'),
    paymentMethod: 'credit_card',
    labels: ['動画', 'エンタメ'],
    url: 'https://netflix.com',
    notes: '4K契約プラン',
    status: 'active',
  });

  const { toast } = useToast();

  // 利用可能なラベル一覧
  const availableLabels = ['動画', '音楽', 'エンタメ', 'クラウド', 'ビジネス', 'ストレージ'];

  // データ取得
  useEffect(() => {
    // TODO: APIからデータを取得
    console.log('Fetching subscription data for ID:', id);
  }, [id]);

  // ラベルの切り替え
  const toggleLabel = (label) => {
    if (isEditing) {
      setSubscription((prev) => ({
        ...prev,
        labels: prev.labels.includes(label)
          ? prev.labels.filter((l) => l !== label)
          : [...prev.labels, label],
      }));
    }
  };

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: API呼び出しで更新
      console.log('Saving subscription:', subscription);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // モック用の遅延

      setIsEditing(false);
      toast({
        title: '更新完了',
        description: 'サブスクリプション情報を更新しました',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
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
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                保存
              </Button>
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="space-y-6">
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
                    onChange={(e) => setSubscription((prev) => ({ ...prev, name: e.target.value }))}
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
                        setSubscription((prev) => ({
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
                        setSubscription((prev) => ({
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
                      setSubscription((prev) => ({
                        ...prev,
                        frequency: value,
                      }))
                    }
                    disabled={!isEditing}
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
                  <Label>初回支払日</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!isEditing}
                      >
                        <TodayRoundedIcon />
                        {format(subscription.initialPaymentDate, 'PPP', { locale: ja })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={subscription.initialPaymentDate}
                        onSelect={(date) =>
                          date &&
                          setSubscription((prev) => ({
                            ...prev,
                            initialPaymentDate: date,
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
                    {format(subscription.nextPaymentDate, 'PPP', { locale: ja })}
                  </Button>
                </div>

                {/* 支払い方法 */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">支払い方法</Label>
                  <Select
                    value={subscription.paymentMethod}
                    onValueChange={(value) =>
                      setSubscription((prev) => ({
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
                      setSubscription((prev) => ({
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
                      setSubscription((prev) => ({
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
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
