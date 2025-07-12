import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSort: (sortOptions: { field: string; order: string }) => void;
}

export const SortDialog: React.FC<SortDialogProps> = ({ open, onOpenChange, onSort }) => {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = () => {
    onSort({ field: sortField, order: sortOrder });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>並び替え</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>並び替え項目</Label>
            <RadioGroup
              value={sortField}
              onValueChange={setSortField}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="name"
                  id="name"
                />
                <Label htmlFor="name">サービス名</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="price"
                  id="price"
                />
                <Label htmlFor="price">料金</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="nextPayment"
                  id="nextPayment"
                />
                <Label htmlFor="nextPayment">支払日</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>順序</Label>
            <RadioGroup
              value={sortOrder}
              onValueChange={setSortOrder}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="asc"
                  id="asc"
                />
                <Label htmlFor="asc">昇順</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="desc"
                  id="desc"
                />
                <Label htmlFor="desc">降順</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button onClick={handleSort}>適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SortDialog;
