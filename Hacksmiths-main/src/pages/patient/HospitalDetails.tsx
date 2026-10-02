import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Phone, Star, ShieldCheck, Bed, Heart,
  Zap, Activity, ArrowLeft, GitCompare,
} from 'lucide-react';
import { getHospital, getCapacity } from '../../services/store';
import { getCapacityStatus, formatTimeAgo } from '../../utils/helpers';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

export default function HospitalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hospital = getHospital(id!);
  const capacity = getCapacity(id!);

  if (!hospital || !capacity) {
    return <EmptyState icon={Bed} title="Hospital not found" description="The requested hospital doesn't exist." action={{ label: 'Go back', onClick: () => navigate(-1) }} />;
  }

  const overallStatus = getCapacityStatus(capacity.availableBeds, capacity.totalBeds);
  const occupancyPct = Math.round((capacity.occupiedBeds / capacity.totalBeds) * 100);

  const resources = [
    { label: 'General Beds', total: capacity.totalBeds, available: capacity.availableBeds, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'ICU Beds', total: capacity.icuTotal, available: capacity.icuAvailable, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'NICU', total: capacity.nicuTotal, available: capacity.nicuAvailable, icon: Activity, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'Emergency', total: capacity.emergencyTotal, available: capacity.emergencyAvailable, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Ventilators', total: capacity.ventilatorTotal, available: capacity.ventilatorAvailable, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Operation Theatres', total: capacity.operationTheatreTotal, available: capacity.operationTheatreAvailable, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Isolation', total: capacity.isolationTotal, available: capacity.isolationAvailable, icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Ambulances', total: capacity.ambulanceTotal, available: capacity.ambulanceAvailable, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={15} /> Back to results
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
              {hospital.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
              <StatusBadge label={overallStatus.label} color={overallStatus.color} bg={overallStatus.bg} dot={overallStatus.dot} size="md" />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><MapPin size={13} /> {hospital.address}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {hospital.travelTime} min away</span>
              <span className="flex items-center gap-1"><MapPin size={13} /> {hospital.distance} km</span>
              <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" /> {hospital.rating}</span>
              <span className="flex items-center gap-1"><Phone size={13} /> {hospital.contact}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/patient/compare?ids=${hospital.id}`)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <GitCompare size={14} /> Compare
            </button>
            <button onClick={() => navigate(`/patient/referral/${hospital.id}`)} className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
              Request Referral
            </button>
          </div>
        </div>
      </div>

      {/* Capacity overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Capacity Overview</h2>
          <span className="text-xs text-gray-400">Last updated {formatTimeAgo(capacity.lastUpdated)}</span>
        </div>
        <div className="mb-4">
          <ProgressBar value={occupancyPct} label="Overall Occupancy" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map(r => {
            const st = getCapacityStatus(r.available, r.total);
            const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
            return (
              <div key={r.label} className={`${r.bg} rounded-xl p-4`}>
                <r.icon size={18} className={`${r.color} mb-2`} />
                <p className={`text-2xl font-bold ${r.color}`}>{r.available}</p>
                <p className="text-xs text-gray-600 font-medium">{r.label}</p>
                <p className="text-xs text-gray-400">{r.total} total</p>
                <span className={`text-xs font-semibold ${st.color}`}>{pct}% free</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services & Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {hospital.specialties.map(s => (
            <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full font-medium">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
