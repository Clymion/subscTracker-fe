import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Tag, ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LabelSettings = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<{
    id: number;
    name: string;
    color: string;
    count: number;
  } | null>(null);

  // サンプルデータ
  const [labels] = useState([
    { id: 1, name: '動画', color: '#EF4444', count: 3 },
    { id: 2, name: '音楽', color: '#3B82F6', count: 2 },
    { id: 3, name: 'クラウド', color: '#10B981', count: 4 },
    { id: 4, name: 'エンタメ', color: '#F59E0B', count: 1 },
  ]);

  // 利用可能な色のパレット
  const colorPalette = [
    '#EF4444', // 赤
    '#F59E0B', // オレンジ
    '#F4E511', // 黄
    '#10B981', // 緑
    '#3B82F6', // 青
    '#6366F1', // インディゴ
    '#8B5CF6', // 紫
    '#EC4899', // ピンク
  ];

  const handleAddLabel = (formData: { name: string; color: string }) => {
    console.log('Add label:', formData);
    setShowAddDialog(false);
  };

  const handleEditLabel = (formData: { name: string; color: string }) => {
    console.log('Edit label:', formData);
    setShowEditDialog(false);
  };

  const handleDeleteLabel = () => {
    console.log('Delete label:', selectedLabel);
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PCサイドナビゲーション - lg以上で表示 */}
      <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">SubsTracker</h1>
        </div>
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/home')}
          >
            <HomeRoundedIcon style={{ fontSize: '24px' }} />
            ホーム
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/payment-history')}
          >
            <HistoryRoundedIcon />
            支払い履歴
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/settings')}
          >
            <SettingsRoundedIcon />
            設定
          </Button>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:ml-64 p-4 pb-20 lg:pb-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-900">ラベル管理</h2>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>

        {/* ラベル一覧 */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>登録済みのラベル</CardTitle>
              <CardDescription>
                サブスクリプションの分類に使用するラベルを管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <div>
                      <p className="font-medium">{label.name}</p>
                      <p className="text-sm text-gray-500">
                        {label.count}個のサブスクリプションで使用中
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedLabel(label);
                        setShowEditDialog(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setSelectedLabel(label);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {labels.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p>登録されているラベルはありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* モバイルフッターナビゲーション - lg未満で表示 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/home')}
          >
            <HomeRoundedIcon />
            <span className="text-xs mt-1">ホーム</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/payment-history')}
          >
            <HistoryRoundedIcon />
            <span className="text-xs mt-1">履歴</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col py-2"
            onClick={() => navigate('/settings')}
          >
            <SettingsRoundedIcon />
            <span className="text-xs mt-1">設定</span>
          </Button>
        </div>
      </div>

      {/* ラベル追加・編集ダイアログ */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={() => {
          setShowAddDialog(false);
          setShowEditDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'ラベルを編集' : 'ラベルを作成'}</DialogTitle>
            <DialogDescription>
              サブスクリプションの分類に使用するラベルの詳細を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labelName">ラベル名</Label>
              <Input
                id="labelName"
                placeholder="例: エンタメ、ビジネス"
                defaultValue={selectedLabel?.name}
              />
            </div>
            <div className="space-y-2">
              <Label>ラベルの色</Label>
              <div className="grid grid-cols-8 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ${
                      selectedLabel?.color === color ? 'ring-black' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setSelectedLabel(selectedLabel ? { ...selectedLabel, color } : null)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const formData = {
                  name: (document.getElementById('labelName') as HTMLInputElement).value,
                  color: selectedLabel?.color || colorPalette[0],
                };
                if (showEditDialog) {
                  handleEditLabel(formData);
                } else {
                  handleAddLabel(formData);
                }
              }}
            >
              {showEditDialog ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ラベルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このラベルは{selectedLabel?.count}個のサブスクリプションで使用されています。
              削除すると、関連付けられたサブスクリプションからラベルが削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteLabel}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LabelSettings;
