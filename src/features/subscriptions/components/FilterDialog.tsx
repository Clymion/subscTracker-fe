import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export type SubscFilterOptions = {
  status: string[];
  labels: string[];
  priceMin: string;
  priceMax: string;
  currency: string;
};
export type PayHistoryFilterOptions = {
  subscriptions: string[];
  dateRange: { start: string; end: string };
  amountMin: string;
  amountMax: string;
  currency: string;
};
interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (options: SubscFilterOptions | PayHistoryFilterOptions) => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({ open, onOpenChange, onFilter }) => {
  const [filters, setFilters] = useState<SubscFilterOptions>({
    status: [],
    labels: [],
    priceMin: '',
    priceMax: '',
    currency: 'all',
  });

  // サンプルのラベル一覧
  const availableLabels = ['動画', '音楽', 'エンタメ', 'クラウド', 'ビジネス', 'ストレージ'];

  const handleFilter = () => {
    onFilter(filters);
    onOpenChange(false);
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleLabelChange = (label: string) => {
    setFilters((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>フィルター</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* ステータス */}
          <div className="space-y-2">
            <Label>ステータス</Label>
            <div className="space-y-2">
              {['お試し中', 'アクティブ', '一時停止'].map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <Label htmlFor={status}>{status}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* ラベル */}
          <div className="space-y-2">
            <Label>ラベル</Label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <Badge
                  key={label}
                  variant={filters.labels.includes(label) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleLabelChange(label)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 料金範囲 */}
          <div className="space-y-2">
            <Label>料金範囲</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="最小"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceMin: e.target.value,
                  }))
                }
              />
              <span>〜</span>
              <Input
                type="number"
                placeholder="最大"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceMax: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* 通貨 */}
          <div className="space-y-2">
            <Label>通貨</Label>
            <Select
              value={filters.currency}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  currency: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="通貨を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                <SelectItem value="USD">米ドル (USD)</SelectItem>
                <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button onClick={handleFilter}>適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
