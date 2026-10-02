import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { initStore } from './services/store';
import type { UserRole } from './types';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import HospitalSearch from './pages/patient/HospitalSearch';
import HospitalDetails from './pages/patient/HospitalDetails';
import SmartMatch from './pages/patient/SmartMatch';
import PatientReferrals from './pages/patient/PatientReferrals';
import ReferralDetail from './pages/patient/ReferralDetail';
import ReferralRequest from './pages/patient/ReferralRequest';
import HospitalComparison from './pages/patient/HospitalComparison';

// Emergency pages
import EmergencyDashboard from './pages/emergency/EmergencyDashboard';
import EmergencySearch from './pages/emergency/EmergencySearch';
import ActiveTransfers from './pages/emergency/ActiveTransfers';

// Hospital pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import CapacityManagement from './pages/hospital/CapacityManagement';
import HospitalReferrals from './pages/hospital/HospitalReferrals';
import HospitalReferralDetail from './pages/hospital/HospitalReferralDetail';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalAnalytics from './pages/hospital/HospitalAnalytics';
import HospitalProfile from './pages/hospital/HospitalProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalManagement from './pages/admin/HospitalManagement';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CapacityMonitor from './pages/admin/CapacityMonitor';
import SystemSettings from './pages/admin/SystemSettings';

// Shared
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';

// Init store on load
initStore();

const ROLE_HOME: Record<UserRole, string> = {
  patient: '/patient',
  emergency: '/emergency',
  hospital: '/hospital',
  admin: '/admin',
};

function RequireAuth({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={ROLE_HOME[user!.role]} replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient */}
            <Route path="/patient" element={<RequireAuth role="patient"><AppLayout /></RequireAuth>}>
              <Route index element={<PatientDashboard />} />
              <Route path="search" element={<HospitalSearch />} />
              <Route path="hospital/:id" element={<HospitalDetails />} />
              <Route path="smart-match" element={<SmartMatch />} />
              <Route path="referrals" element={<PatientReferrals />} />
              <Route path="referrals/:id" element={<ReferralDetail />} />
              <Route path="referral/:id" element={<ReferralRequest />} />
              <Route path="compare" element={<HospitalComparison />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Emergency */}
            <Route path="/emergency" element={<RequireAuth role="emergency"><AppLayout /></RequireAuth>}>
              <Route index element={<EmergencyDashboard />} />
              <Route path="search" element={<EmergencySearch />} />
              <Route path="referrals" element={<ActiveTransfers />} />
              <Route path="transfers" element={<ActiveTransfers />} />
              <Route path="hospitals" element={<HospitalSearch />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Hospital */}
            <Route path="/hospital" element={<RequireAuth role="hospital"><AppLayout /></RequireAuth>}>
              <Route index element={<HospitalDashboard />} />
              <Route path="capacity" element={<CapacityManagement />} />
              <Route path="resources" element={<CapacityManagement />} />
              <Route path="referrals" element={<HospitalReferrals />} />
              <Route path="referrals/:id" element={<HospitalReferralDetail />} />
              <Route path="patients" element={<HospitalPatients />} />
              <Route path="analytics" element={<HospitalAnalytics />} />
              <Route path="profile" element={<HospitalProfile />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<RequireAuth role="admin"><AppLayout /></RequireAuth>}>
              <Route index element={<AdminDashboard />} />
              <Route path="hospitals" element={<HospitalManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="capacity" element={<CapacityMonitor />} />
              <Route path="referrals" element={<AdminReferrals />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
