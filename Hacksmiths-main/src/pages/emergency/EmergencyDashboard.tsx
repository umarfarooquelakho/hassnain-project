import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Heart, Zap, Activity, Search, Ambulance } from 'lucide-react';
import { getHospitals, getCapacities, getReferrals } from '../../services/store';
import { rankHospitals } from '../../services/smartMatch';
import StatCard from '../../components/ui/StatCard';
import { getReferralStatusConfig } from '../../utils/helpers';
import type { BedType, UrgencyLevel } from '../../types';

export default function EmergencyDashboard() {
  const navigate = useNavigate();
  const hospitals = getHospitals().filter(h => h.status === 'active');
  const capacities = getCapacities();
  const referrals = getReferrals();

  const [resource, setResource] = useState<BedType>('icu');
  const [icuReq, setIcuReq] = useState(true);
  const [ventReq, setVentReq] = useState(false);
  const [location, setLocation] = useState('Hyderabad');
  const urgency: UrgencyLevel = 'emergency';

  const totalIcuAvailable = Object.values(capacities).reduce((a, c) => a + c.icuAvailable, 0);
  const totalVentAvailable = Object.values(capacities).reduce((a, c) => a + c.ventilatorAvailable, 0);
  const totalEmergencyAvailable = Object.values(capacities).reduce((a, c) => a + c.emergencyAvailable, 0);

  const activeEmergencies = referrals.filter(r => r.urgency === 'emergency' && ['sent', 'reviewing', 'accepted', 'transferred'].includes(r.status));

  const quickResults = rankHospitals(hospitals, capacities, { requiredResource: resource, icuRequired: icuReq, ventilatorRequired: ventReq, specialty: 'Emergency', urgency }).slice(0, 3);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Alert header */}
      <div className="bg-red-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={22} />
          <h1 className="text-xl font-bold">Emergency Coordination Center</h1>
          <div className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
        <p className="text-red-100 text-sm">Find and coordinate hospital capacity for emergency patients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Emergencies" value={activeEmergencies.length} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard title="ICU Available" value={totalIcuAvailable} icon={Heart} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard title="Ventilators" value={totalVentAvailable} icon={Activity} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Emergency Beds" value={totalEmergencyAvailable} icon={Zap} iconBg="bg-orange-50" iconColor="text-orange-500" />
      </div>

      {/* Quick search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Search size={16} className="text-red-500" />Quick Hospital Search</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Patient Requirement</label>
            <select value={resource} onChange={e => setResource(e.target.value as BedType)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="icu">ICU Bed</option>
              <option value="emergency">Emergency Bed</option>
              <option value="general">General Bed</option>
              <option value="ventilator">Ventilator</option>
              <option value="nicu">NICU</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div className="flex items-end">
            <button onClick={() => navigate('/emergency/search')} className="w-full bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-2">
              <AlertTriangle size={14} /> Emergency Search
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={icuReq} onChange={e => setIcuReq(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">ICU Required</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={ventReq} onChange={e => setVentReq(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">Ventilator Required</span>
          </label>
        </div>
      </div>

      {/* Quick match results */}
      {quickResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Recommended Hospitals</h2>
          <div className="space-y-3">
            {quickResults.map(({ hospital, capacity, score }, i) => {
              const pct = Math.round((score.totalScore / 100) * 100);
              return (
                <div key={hospital.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/emergency/search`)}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">#{i+1}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{hospital.name}</p>
                      <p className="text-xs text-gray-500">{hospital.distance}km · ICU: {capacity.icuAvailable} · Vent: {capacity.ventilatorAvailable}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${pct >= 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {pct}% match
                    </span>
                    <button onClick={e => { e.stopPropagation(); navigate(`/emergency/referrals/new/${hospital.id}`); }} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">
                      Send Referral
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active transfers */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Ambulance size={16} className="text-orange-500" />Active Referrals</h2>
          <button onClick={() => navigate('/emergency/referrals')} className="text-xs text-red-500 font-medium hover:underline">View all</button>
        </div>
        {activeEmergencies.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active emergency referrals</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-500 font-semibold">ID</th>
                  <th className="text-left py-2 text-xs text-gray-500 font-semibold">Patient</th>
                  <th className="text-left py-2 text-xs text-gray-500 font-semibold hidden md:table-cell">Hospital</th>
                  <th className="text-left py-2 text-xs text-gray-500 font-semibold hidden md:table-cell">ETA</th>
                  <th className="text-left py-2 text-xs text-gray-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeEmergencies.map(r => {
                  const sc = getReferralStatusConfig(r.status);
                  return (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="py-2.5 font-mono text-xs font-semibold text-gray-700">{r.id}</td>
                      <td className="py-2.5 text-gray-800 font-medium">{r.patientName}</td>
                      <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell">{r.hospitalName}</td>
                      <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell">{r.estimatedTravelTime ? `${r.estimatedTravelTime} min` : '-'}</td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
