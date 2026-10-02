import { User, Phone, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/helpers';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient / Attendant',
  emergency: 'Emergency Coordinator',
  hospital: 'Hospital Staff',
  admin: 'Administrator',
};

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <span className="inline-block text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium mt-1">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Phone, label: 'Phone', value: user.phone },
            { icon: Shield, label: 'Account Status', value: user.status === 'active' ? '✓ Active' : 'Inactive' },
            { icon: User, label: 'Member Since', value: formatDateTime(user.createdAt) },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <f.icon size={16} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">{f.label}</p>
                <p className="text-sm font-medium text-gray-800">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        This is a demo account. Profile editing is not available in the hackathon demo.
      </div>
    </div>
  );
}
