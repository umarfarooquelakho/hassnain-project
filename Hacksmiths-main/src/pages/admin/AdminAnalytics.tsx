import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { useState } from 'react';

export default function AdminAnalytics() {
  const [range, setRange] = useState('7d');

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <div className="flex gap-2">
          {['7d', '30d'].map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Available Beds', value: Math.round(MOCK_ANALYTICS.reduce((a, d) => a + d.availableBeds, 0) / MOCK_ANALYTICS.length) },
          { label: 'Avg ICU Available', value: Math.round(MOCK_ANALYTICS.reduce((a, d) => a + d.icuAvailable, 0) / MOCK_ANALYTICS.length) },
          { label: 'Total Referrals (7d)', value: MOCK_ANALYTICS.reduce((a, d) => a + d.referrals, 0) },
          { label: 'Acceptance Rate', value: `${Math.round((MOCK_ANALYTICS.reduce((a, d) => a + d.accepted, 0) / MOCK_ANALYTICS.reduce((a, d) => a + d.referrals, 0)) * 100)}%` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Capacity Availability</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_ANALYTICS}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F04438" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F04438" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="availableBeds" stroke="#F04438" fill="url(#grad1)" strokeWidth={2} name="Available Beds" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Resource Availability Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="icuAvailable" stroke="#dc2626" strokeWidth={2} dot={false} name="ICU" />
              <Line type="monotone" dataKey="emergencyAvailable" stroke="#f59e0b" strokeWidth={2} dot={false} name="Emergency" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Occupancy Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[65, 85]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="occupancyRate" fill="#6366f1" radius={[4,4,0,0]} name="Occupancy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Referrals — Total vs Accepted</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#cbd5e1" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="accepted" fill="#16a34a" radius={[4,4,0,0]} name="Accepted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
