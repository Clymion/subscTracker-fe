import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MainPage from '@/pages/MainPage';
import PaymentHistoryPage from '@/pages/PaymentHistoryPage';
import SubscriptionDetail from '@/pages/SubscriptionDetail';
import SettingsPage from '@/pages/SettingsPage';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import CurrencySettings from '@/pages/settings/CurrencySettings';
import PaymentMethodSettings from '@/pages/settings/PaymentMethodSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import LabelSettings from '@/pages/settings/LabelSettings';

import { Toaster } from "@/components/ui/toaster"

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 認証前ルート */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 認証済みルート */}
          <Route path="/home" element={<MainPage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/subscription/:id" element={<SubscriptionDetail />} />
          
          {/* 設定関連ルート */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/currency" element={<CurrencySettings />} />
          <Route path="/settings/payment" element={<PaymentMethodSettings />} />
          <Route path="/settings/notification" element={<NotificationSettings />} />
          <Route path="/settings/labels" element={<LabelSettings />} />

          {/* 存在しないパスへのアクセスはホームにリダイレクト */}
          <Route path="*" element={<Navigate to="/home" replace />} />

          {/* /mainへのアクセスは/homeにリダイレクト（後方互換性のため） */}
          <Route path="/main" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;