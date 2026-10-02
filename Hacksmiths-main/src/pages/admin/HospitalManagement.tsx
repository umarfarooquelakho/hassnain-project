import { useState } from 'react';
import { ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { getHospitals, getCapacities, updateHospital, addAuditLog } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { getHospitalStatus, formatTimeAgo, generateId } from '../../utils/helpers';
import type { Hospital } from '../../types';
import { useToast } from '../../components/ui/Toast';

export default function HospitalManagement() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hospitals, setHospitals] = useState(() => getHospitals());
  const capacities = getCapacities();

  const filtered = hospitals
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()))
    .filter(h => statusFilter === 'all' || h.status === statusFilter || (statusFilter === 'verified' && h.verified));

  const handleVerify = (hospital: Hospital) => {
    const updated = { ...hospital, verified: true, status: 'active' as const };
    updateHospital(updated);
    addAuditLog({ id: generateId('AL'), userId: user?.id || '', userName: user?.name || '', userRole: 'admin', action: 'Verified hospital', entity: 'Hospital', entityId: hospital.id, previousValue: 'Status: Pending', newValue: 'Status: Verified', timestamp: new Date().toISOString(), hospitalName: hospital.name });
    setHospitals(getHospitals());
    showToast(`${hospital.name} has been verified.`, 'success');
  };

  const handleSuspend = (hospital: Hospital) => {
    const updated = { ...hospital, status: (hospital.status === 'suspended' ? 'active' : 'suspended') as any };
    updateHospital(updated);
    addAuditLog({ id: generateId('AL'), userId: user?.id || '', userName: user?.name || '', userRole: 'admin', action: `${updated.status === 'suspended' ? 'Suspended' : 'Reactivated'} hospital`, entity: 'Hospital', entityId: hospital.id, newValue: `Status: ${updated.status}`, timestamp: new Date().toISOString(), hospitalName: hospital.name });
    setHospitals(getHospitals());
    showToast(`${hospital.name} ${updated.status === 'suspended' ? 'suspended' : 'reactivated'}.`, updated.status === 'suspended' ? 'warning' : 'success');
  };

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hospitals..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        {['all', 'active', 'pending', 'suspended', 'verified'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Hospital</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">City</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Beds</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">ICU</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => {
              const cap = capacities[h.id];
              const status = cap ? getHospitalStatus(cap) : { label: '-', color: 'text-gray-500', bg: 'bg-gray-100' };
              return (
                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{h.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {h.verified && <span className="text-[10px] text-blue-600 flex items-center gap-0.5"><ShieldCheck size={9} /> Verified</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                            h.status === 'active' ? 'bg-green-50 text-green-600' :
                            h.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-red-50 text-red-600'
                          }`}>{h.status}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{h.city}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 hidden md:table-cell">{cap?.availableBeds ?? '-'}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium hidden lg:table-cell">
                    <span className={cap?.icuAvailable === 0 ? 'text-red-500' : 'text-green-600'}>{cap?.icuAvailable ?? '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {cap && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{cap ? formatTimeAgo(cap.lastUpdated) : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      {!h.verified && h.status === 'pending' && (
                        <button onClick={() => handleVerify(h)} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100">
                          <ShieldCheck size={11} /> Verify
                        </button>
                      )}
                      <button onClick={() => handleSuspend(h)} className={`flex items-center gap-1 border px-2.5 py-1.5 rounded-lg text-xs font-medium ${h.status === 'suspended' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                        {h.status === 'suspended' ? <><ShieldCheck size={11} /> Reactivate</> : <><ShieldOff size={11} /> Suspend</>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
