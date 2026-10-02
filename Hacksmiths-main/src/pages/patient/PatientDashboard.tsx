import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, FileText, Clock, Building2, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReferrals, getHospitals } from '../../services/store';
import StatCard from '../../components/ui/StatCard';
import type { BedType, UrgencyLevel } from '../../types';

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'general', label: 'General Bed' },
  { value: 'emergency', label: 'Emergency Bed' },
  { value: 'icu', label: 'ICU Bed' },
  { value: 'nicu', label: 'NICU Bed' },
  { value: 'ventilator', label: 'Ventilator' },
  { value: 'operation_theatre', label: 'Operation Theatre' },
];

const SPECIALTIES = ['Any', 'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Surgery', 'Oncology', 'Emergency', 'Radiology'];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const referrals = getReferrals().filter(r => r.patientId === user?.id);
  const hospitals = getHospitals().filter(h => h.status === 'active');

  const [resource, setResource] = useState<BedType>('icu');
  const [specialty, setSpecialty] = useState('Any');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgent');
  const [location, setLocation] = useState('Hyderabad');
  const [radius, setRadius] = useState('25');

  const activeReferrals = referrals.filter(r => !['admitted', 'rejected', 'cancelled', 'expired'].includes(r.status));
  const pending = referrals.filter(r => r.status === 'reviewing' || r.status === 'sent');

  const handleSearch = () => {
    const params = new URLSearchParams({ resource, specialty, urgency, location, radius });
    navigate(`/patient/search?${params}`);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Find the right hospital for your needs.</p>
        </div>
        <button
          onClick={() => navigate('/patient/search?urgency=emergency')}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors shadow-sm"
        >
          <Zap size={15} />
          Emergency Assistance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Requests" value={activeReferrals.length} icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Available Hospitals" value={hospitals.length} icon={Building2} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Pending Referrals" value={pending.length} icon={Clock} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <StatCard title="Total Requests" value={referrals.length} icon={Activity} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Search size={18} className="text-red-500" />
          Find a Hospital
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Required Resource</label>
            <select
              value={resource}
              onChange={e => setResource(e.target.value as BedType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialty</label>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Urgency</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value as UrgencyLevel)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location / City</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or area"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Radius</label>
            <select
              value={radius}
              onChange={e => setRadius(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={15} />
              Find Hospitals
            </button>
          </div>
        </div>
      </div>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Referrals</h2>
            <button onClick={() => navigate('/patient/referrals')} className="text-xs text-red-500 font-medium hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {referrals.slice(0, 3).map(r => {
              const statusColors: Record<string, string> = {
                reviewing: 'text-yellow-600 bg-yellow-50',
                accepted: 'text-green-600 bg-green-50',
                rejected: 'text-red-600 bg-red-50',
                admitted: 'text-teal-600 bg-teal-50',
                sent: 'text-blue-600 bg-blue-50',
                transferred: 'text-purple-600 bg-purple-50',
              };
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/patient/referrals/${r.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.id}</p>
                    <p className="text-xs text-gray-500">{r.hospitalName} · {r.requiredResource.toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[r.status] || 'text-gray-600 bg-gray-100'}`}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
