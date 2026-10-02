import { MapPin, Clock, Bed, Heart, Zap, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Hospital, Capacity } from '../../types';
import { getHospitalStatus, getOccupancyPct, formatTimeAgo } from '../../utils/helpers';
import StatusBadge from '../ui/StatusBadge';
import ProgressBar from '../ui/ProgressBar';

interface Props {
  hospital: Hospital;
  capacity: Capacity;
  onCompare?: (id: string) => void;
  compareSelected?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  onRequestReferral?: (id: string) => void;
}

export default function HospitalCard({
  hospital, capacity, onCompare, compareSelected, matchScore, matchReasons, onRequestReferral
}: Props) {
  const navigate = useNavigate();
  const status = getHospitalStatus(capacity);
  const occupancyPct = getOccupancyPct(capacity);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{hospital.name}</h3>
            {hospital.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin size={11} />
            <span className="truncate">{hospital.address}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={10} />{hospital.distance} km</span>
            <span className="flex items-center gap-1"><Clock size={10} />{hospital.travelTime} min</span>
            <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{hospital.rating}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-3">
          <StatusBadge label={status.label} color={status.color} bg={status.bg} dot={status.dot} />
          {matchScore !== undefined && (
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {matchScore}% match
            </span>
          )}
        </div>
      </div>

      {/* Match reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchReasons.slice(0, 3).map((r, i) => (
            <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ {r}</span>
          ))}
        </div>
      )}

      {/* Capacity grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Beds', value: capacity.availableBeds, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'ICU', value: capacity.icuAvailable, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Emerg.', value: capacity.emergencyAvailable, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Vent.', value: capacity.ventilatorAvailable, icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(item => (
          <div key={item.label} className={`${item.bg} rounded-lg p-2 text-center`}>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy */}
      <div className="mb-4">
        <ProgressBar value={occupancyPct} label="Occupancy" />
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1 mb-4">
        {hospital.specialties.slice(0, 4).map(s => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
        {hospital.specialties.length > 4 && (
          <span className="text-xs text-gray-400">+{hospital.specialties.length - 4} more</span>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mb-3">Updated {formatTimeAgo(capacity.lastUpdated)}</p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/patient/hospital/${hospital.id}`)}
          className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          View Details
        </button>
        {onCompare && (
          <button
            onClick={() => onCompare(hospital.id)}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
              compareSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Compare
          </button>
        )}
        <button
          onClick={() => onRequestReferral ? onRequestReferral(hospital.id) : navigate(`/patient/referral/${hospital.id}`)}
          className="flex-1 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Request Referral
        </button>
      </div>
    </div>
  );
}
