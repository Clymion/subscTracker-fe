import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/routes/LoginPage';
import RegisterPage from '@/features/auth/routes/RegisterPage';
import MainPage from '@/features/subscriptions/routes/MainPage';
import PaymentHistoryPage from '@/features/history/routes/PaymentHistoryPage';
import SubscriptionDetail from '@/features/subscriptions/routes/SubscriptionDetail';
import SettingsPage from '@/features/settings/routes/SettingsPage';
import ProfileSettings from '@/features/settings/routes/ProfileSettings';
import CurrencySettings from '@/features/settings/routes/CurrencySettings';
import PaymentMethodSettings from '@/features/settings/routes/PaymentMethodSettings';
import NotificationSettings from '@/features/settings/routes/NotificationSettings';
import LabelSettings from '@/features/settings/routes/LabelSettings';
import BackendTestPage from '@/features/misc/routes/BackendTestPage';

const App = () => {
  return (
    <>
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

        {/* テスト用ルート */}
        <Route path="/backend-test" element={<BackendTestPage />} />

        {/* /mainへのアクセスは/homeにリダイレクト（後方互換性のため） */}
        <Route path="/main" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
};

export default App;