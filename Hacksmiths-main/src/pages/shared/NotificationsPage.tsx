import { Bell, CheckCheck } from 'lucide-react';
import { getNotifications, markAllRead, markNotificationRead } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';
import { useState } from 'react';

const TYPE_STYLES: Record<string, { bg: string; dot: string }> = {
  referral_accepted: { bg: 'bg-green-50', dot: 'bg-green-500' },
  referral_rejected: { bg: 'bg-red-50', dot: 'bg-red-500' },
  capacity_changed: { bg: 'bg-blue-50', dot: 'bg-blue-500' },
  transfer_update: { bg: 'bg-purple-50', dot: 'bg-purple-500' },
  emergency_alert: { bg: 'bg-orange-50', dot: 'bg-orange-500' },
  system: { bg: 'bg-gray-50', dot: 'bg-gray-500' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const notifications = getNotifications(user?.id);
  const unread = notifications.filter(n => !n.read).length;

  const handleMarkAll = () => {
    if (user) { markAllRead(user.id); setTick(t => t + 1); }
  };

  const handleMark = (id: string) => {
    markNotificationRead(id);
    setTick(t => t + 1);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You'll see referral updates and alerts here." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.system;
            return (
              <div
                key={n.id + tick}
                onClick={() => !n.read && handleMark(n.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${n.read ? 'bg-white border-gray-100' : `${style.bg} border-transparent shadow-sm`}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-gray-300' : style.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400 shrink-0">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
