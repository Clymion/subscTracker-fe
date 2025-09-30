import { useNavigate } from 'react-router-dom';

import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { Button } from '@/components/ui/button';

export const SideNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">SubscTracker</h1>
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
          支払履歴
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
  );
};
