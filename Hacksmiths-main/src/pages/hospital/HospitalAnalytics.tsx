import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { getCapacity, getReferrals } from '../../services/store';
import { useAuth } from '../../context/AuthContext';

export default function HospitalAnalytics() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId || 'h1';
  const capacity = getCapacity(hospitalId);
  const referrals = getReferrals().filter(r => r.hospitalId === hospitalId);

  const accepted = referrals.filter(r => r.status === 'accepted' || r.status === 'admitted' || r.status === 'transferred').length;
  const rejected = referrals.filter(r => r.status === 'rejected').length;

  const pieData = [
    { name: 'Accepted', value: accepted, color: '#16a34a' },
    { name: 'Rejected', value: rejected, color: '#dc2626' },
    { name: 'Pending', value: referrals.length - accepted - rejected, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Analytics</h1>
      <p className="text-sm text-gray-500 -mt-4">Demo data — 7-day trend</p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{accepted}</p>
          <p className="text-sm text-gray-500">Accepted Referrals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-red-500">{rejected}</p>
          <p className="text-sm text-gray-500">Rejected Referrals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{capacity ? Math.round((capacity.occupiedBeds / capacity.totalBeds) * 100) : 0}%</p>
          <p className="text-sm text-gray-500">Current Occupancy</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Capacity trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Bed Availability Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="availableBeds" stroke="#F04438" strokeWidth={2} dot={false} name="Available Beds" />
              <Line type="monotone" dataKey="icuAvailable" stroke="#7c3aed" strokeWidth={2} dot={false} name="ICU Available" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Referral status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Referral Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy rate */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Occupancy Rate Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[60, 90]} />
              <Tooltip />
              <Bar dataKey="occupancyRate" fill="#F04438" radius={[4, 4, 0, 0]} name="Occupancy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Referrals received */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Referrals</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#6366f1" radius={[4, 4, 0, 0]} name="Referrals" />
              <Bar dataKey="accepted" fill="#16a34a" radius={[4, 4, 0, 0]} name="Accepted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
