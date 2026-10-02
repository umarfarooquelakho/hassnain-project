import { useState } from 'react';
import { Search } from 'lucide-react';
import { getReferrals } from '../../services/store';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function AdminReferrals() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const referrals = getReferrals();

  const filtered = referrals
    .filter(r => r.patientName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.hospitalName.toLowerCase().includes(search.toLowerCase()))
    .filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Referral Monitoring</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search referrals..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        {['all', 'sent', 'reviewing', 'accepted', 'rejected', 'admitted'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Patient</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Hospital</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Resource</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Urgency</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const sc = getReferralStatusConfig(r.status);
              const uc = getUrgencyConfig(r.urgency);
              return (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patient/referrals/${r.id}`)}>
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-700">{r.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{r.patientName}</p>
                    <p className="text-xs text-gray-400">{r.patientAge}y</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{r.hospitalName}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.requiredResource.replace('_',' ')}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${uc.bg} ${uc.color}`}>{uc.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDateTime(r.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
