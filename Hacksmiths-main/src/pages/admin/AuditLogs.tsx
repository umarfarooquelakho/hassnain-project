import { useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { getAuditLogs } from '../../services/store';
import { formatDateTime } from '../../utils/helpers';

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  hospital: 'bg-green-50 text-green-700',
  emergency: 'bg-red-50 text-red-600',
  patient: 'bg-blue-50 text-blue-700',
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const logs = getAuditLogs();

  const filtered = logs
    .filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase()) || (l.hospitalName || '').toLowerCase().includes(search.toLowerCase()))
    .filter(l => roleFilter === 'all' || l.userRole === roleFilter);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={22} className="text-red-500" /> Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">All system activity tracked and recorded</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        {['all', 'admin', 'hospital', 'emergency', 'patient'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${roleFilter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Action</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Before</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">After</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900 text-xs">{l.userName}</p>
                  {l.hospitalName && <p className="text-[10px] text-gray-400">{l.hospitalName}</p>}
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_STYLES[l.userRole] || 'bg-gray-100 text-gray-600'}`}>{l.userRole}</span>
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs text-gray-800 font-medium">{l.action}</p>
                  <p className="text-[10px] text-gray-400">{l.entity} #{l.entityId}</p>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell text-xs text-red-500">{l.previousValue || '—'}</td>
                <td className="px-5 py-3 hidden lg:table-cell text-xs text-green-600">{l.newValue || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-10 text-sm">No audit logs match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
