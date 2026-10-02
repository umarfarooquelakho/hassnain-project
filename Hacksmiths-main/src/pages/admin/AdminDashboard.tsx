import { Building2, Bed, Heart, Activity, FileText, AlertTriangle, Users, ShieldCheck } from 'lucide-react';
import { getHospitals, getCapacities, getReferrals, getUsers } from '../../services/store';
import StatCard from '../../components/ui/StatCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { getHospitalStatus, formatTimeAgo } from '../../utils/helpers';

export default function AdminDashboard() {
  const hospitals = getHospitals();
  const capacities = getCapacities();
  const referrals = getReferrals();
  const users = getUsers();

  const verifiedHospitals = hospitals.filter(h => h.verified && h.status === 'active').length;
  const totalBeds = Object.values(capacities).reduce((a, c) => a + c.totalBeds, 0);
  const availableBeds = Object.values(capacities).reduce((a, c) => a + c.availableBeds, 0);
  const icuAvailable = Object.values(capacities).reduce((a, c) => a + c.icuAvailable, 0);
  const ventsAvailable = Object.values(capacities).reduce((a, c) => a + c.ventilatorAvailable, 0);
  const activeReferrals = referrals.filter(r => ['sent', 'reviewing', 'accepted', 'transferred'].includes(r.status)).length;
  const emergencyRequests = referrals.filter(r => r.urgency === 'emergency').length;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide capacity and referral overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Hospitals" value={hospitals.length} subtitle={`${verifiedHospitals} verified`} icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Total Beds" value={totalBeds.toLocaleString()} subtitle={`${availableBeds} available`} icon={Bed} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="ICU Available" value={icuAvailable} icon={Heart} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard title="Ventilators" value={ventsAvailable} icon={Activity} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Referrals" value={activeReferrals} icon={FileText} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <StatCard title="Emergency Requests" value={emergencyRequests} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard title="Total Users" value={users.length} icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard title="Verified Hospitals" value={verifiedHospitals} icon={ShieldCheck} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">7-Day Capacity Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="availableBeds" stroke="#F04438" strokeWidth={2} dot={false} name="Available Beds" />
              <Line type="monotone" dataKey="icuAvailable" stroke="#7c3aed" strokeWidth={2} dot={false} name="ICU Available" />
              <Line type="monotone" dataKey="emergencyAvailable" stroke="#f59e0b" strokeWidth={2} dot={false} name="Emergency" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Referrals</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#F04438" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="accepted" fill="#16a34a" radius={[4,4,0,0]} name="Accepted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hospital capacity table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Hospital Capacity Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Hospital</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Beds</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">ICU</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Vent.</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Emergency</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Occupancy</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Updated</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.filter(h => capacities[h.id]).map(h => {
                const cap = capacities[h.id];
                const status = getHospitalStatus(cap);
                const occ = Math.round((cap.occupiedBeds / cap.totalBeds) * 100);
                return (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{h.name}</p>
                        {h.verified && <ShieldCheck size={12} className="text-blue-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">{cap.availableBeds}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${cap.icuAvailable === 0 ? 'text-red-500' : 'text-green-600'}`}>{cap.icuAvailable}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${cap.ventilatorAvailable === 0 ? 'text-red-500' : 'text-purple-600'}`}>{cap.ventilatorAvailable}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${cap.emergencyAvailable === 0 ? 'text-red-500' : 'text-orange-500'}`}>{cap.emergencyAvailable}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${occ >= 90 ? 'text-red-500' : occ >= 70 ? 'text-yellow-600' : 'text-green-600'}`}>{occ}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatTimeAgo(cap.lastUpdated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
