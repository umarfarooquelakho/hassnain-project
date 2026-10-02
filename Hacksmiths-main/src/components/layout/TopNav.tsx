import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../../services/store';
import { useState } from 'react';
import { formatTimeAgo } from '../../utils/helpers';

interface Props {
  onMenuClick: () => void;
  title?: string;
}

export default function TopNav({ onMenuClick, title }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const notifications = user ? getNotifications(user.id) : [];
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
          <Menu size={18} className="text-gray-600" />
        </button>
        {title && <h1 className="text-base font-semibold text-gray-800 hidden sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-700 font-medium">Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                {unread > 0 && <span className="text-xs text-red-500 font-medium">{unread} unread</span>}
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.slice(0, 8).map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-red-50/30' : ''}`}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />}
                      <div className={!n.read ? '' : 'ml-3.5'}>
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">No notifications</p>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={() => { setShowNotif(false); navigate(`/${user?.role === 'hospital' ? 'hospital' : user?.role === 'emergency' ? 'emergency' : 'patient'}/notifications`); }}
                  className="text-xs text-red-500 font-medium hover:text-red-600"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs">
              {user?.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-24 truncate">{user?.name.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotif || showUser) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowUser(false); }} />
      )}
    </header>
  );
}
