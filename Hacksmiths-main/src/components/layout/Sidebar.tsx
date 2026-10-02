import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, Star, FileText, Bell, User,
  AlertTriangle, Ambulance, Building2, BarChart3,
  Bed, Package, Users, ShieldCheck, Settings, Activity,
  ClipboardList, Heart, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

const NAV_ITEMS: Record<UserRole, { label: string; icon: React.ElementType; path: string }[]> = {
  patient: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/patient' },
    { label: 'Find Hospital', icon: Search, path: '/patient/search' },
    { label: 'Smart Match', icon: Star, path: '/patient/smart-match' },
    { label: 'My Referrals', icon: FileText, path: '/patient/referrals' },
    { label: 'Notifications', icon: Bell, path: '/patient/notifications' },
    { label: 'Profile', icon: User, path: '/patient/profile' },
  ],
  emergency: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/emergency' },
    { label: 'Emergency Search', icon: AlertTriangle, path: '/emergency/search' },
    { label: 'Active Referrals', icon: FileText, path: '/emergency/referrals' },
    { label: 'Transfers', icon: Ambulance, path: '/emergency/transfers' },
    { label: 'Hospitals', icon: Building2, path: '/emergency/hospitals' },
    { label: 'Notifications', icon: Bell, path: '/emergency/notifications' },
  ],
  hospital: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hospital' },
    { label: 'Capacity', icon: Bed, path: '/hospital/capacity' },
    { label: 'Resources', icon: Package, path: '/hospital/resources' },
    { label: 'Referral Requests', icon: ClipboardList, path: '/hospital/referrals' },
    { label: 'Patients', icon: Users, path: '/hospital/patients' },
    { label: 'Analytics', icon: BarChart3, path: '/hospital/analytics' },
    { label: 'Hospital Profile', icon: Building2, path: '/hospital/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Hospitals', icon: Building2, path: '/admin/hospitals' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Capacity Monitor', icon: Activity, path: '/admin/capacity' },
    { label: 'Referrals', icon: FileText, path: '/admin/referrals' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Audit Logs', icon: ShieldCheck, path: '/admin/audit' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient Portal',
  emergency: 'Emergency Coord.',
  hospital: 'Hospital Staff',
  admin: 'Administrator',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS[user.role];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CareConnect</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Role label */}
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
            {ROLE_LABELS[user.role]}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
