import { useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { getUsers, updateUser } from '../../services/store';
import { formatDateTime } from '../../utils/helpers';
import type { User } from '../../types';
import { useToast } from '../../components/ui/Toast';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  emergency: 'Emergency Coord.',
  hospital: 'Hospital Staff',
  admin: 'Administrator',
};

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState(() => getUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = users
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === 'all' || u.role === roleFilter);

  const toggleStatus = (user: User) => {
    const updated = { ...user, status: user.status === 'active' ? 'inactive' as const : 'active' as const };
    updateUser(updated);
    setUsers(getUsers());
    showToast(`${user.name} ${updated.status === 'active' ? 'activated' : 'deactivated'}.`, 'info');
  };

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        {['all', 'patient', 'emergency', 'hospital', 'admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${roleFilter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {r === 'all' ? 'All' : ROLE_LABELS[r] || r}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Last Active</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                    u.role === 'emergency' ? 'bg-red-50 text-red-600' :
                    u.role === 'hospital' ? 'bg-green-50 text-green-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDateTime(u.lastActive)}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    className={`flex items-center gap-1.5 ml-auto border px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      u.status === 'active'
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {u.status === 'active' ? <><UserX size={11} /> Deactivate</> : <><UserCheck size={11} /> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
