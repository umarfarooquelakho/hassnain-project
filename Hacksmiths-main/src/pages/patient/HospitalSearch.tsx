import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, GitCompare } from 'lucide-react';
import { getHospitals, getCapacities } from '../../services/store';
import type { BedType, UrgencyLevel } from '../../types';
import HospitalCard from '../../components/hospital/HospitalCard';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Building2 } from 'lucide-react';

const BED_TYPES: { value: BedType | 'any'; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'general', label: 'General Bed' },
  { value: 'emergency', label: 'Emergency Bed' },
  { value: 'icu', label: 'ICU Bed' },
  { value: 'nicu', label: 'NICU Bed' },
  { value: 'ventilator', label: 'Ventilator' },
  { value: 'operation_theatre', label: 'Operation Theatre' },
];
const SPECIALTIES = ['Any', 'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Surgery', 'Oncology', 'Emergency'];

export default function HospitalSearch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Filters
  const [resource, setResource] = useState<BedType | 'any'>((params.get('resource') as BedType) || 'any');
  const [specialty, setSpecialty] = useState(params.get('specialty') || 'Any');
  const [urgency, setUrgency] = useState<UrgencyLevel | 'any'>((params.get('urgency') as UrgencyLevel) || 'any');
  const [icuOnly, setIcuOnly] = useState(false);
  const [ventOnly, setVentOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  const hospitals = getHospitals();
  const capacities = getCapacities();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = hospitals
    .filter(h => h.status === 'active')
    .filter(h => verifiedOnly ? h.verified : true)
    .filter(h => {
      const cap = capacities[h.id];
      if (!cap) return false;
      if (icuOnly && cap.icuAvailable === 0) return false;
      if (ventOnly && cap.ventilatorAvailable === 0) return false;
      if (resource !== 'any') {
        const map: Record<BedType, number> = {
          general: cap.availableBeds,
          emergency: cap.emergencyAvailable,
          icu: cap.icuAvailable,
          nicu: cap.nicuAvailable,
          ventilator: cap.ventilatorAvailable,
          operation_theatre: cap.operationTheatreAvailable,
          isolation: cap.isolationAvailable,
        };
        if (map[resource] === 0) return false;
      }
      if (specialty !== 'Any' && !h.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance ?? 99) - (b.distance ?? 99);
      if (sortBy === 'rating') return b.rating - a.rating;
      const capA = capacities[a.id];
      const capB = capacities[b.id];
      if (sortBy === 'available') return (capB?.availableBeds ?? 0) - (capA?.availableBeds ?? 0);
      return 0;
    });

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hospital Search</h1>
          <p className="text-sm text-gray-500">{filtered.length} hospitals found</p>
        </div>
        <div className="flex items-center gap-2">
          {compareIds.length >= 2 && (
            <button
              onClick={() => navigate(`/patient/compare?ids=${compareIds.join(',')}`)}
              className="flex items-center gap-1.5 bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-600"
            >
              <GitCompare size={13} />
              Compare ({compareIds.length})
            </button>
          )}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 border px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filtersOpen ? 'bg-gray-100 border-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Resource</label>
              <select value={resource} onChange={e => setResource(e.target.value as BedType | 'any')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
                {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Specialty</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Urgency</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel | 'any')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
                <option value="any">Any</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="available">Available Beds</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            {[
              { label: 'ICU Available', value: icuOnly, setter: setIcuOnly },
              { label: 'Ventilator Available', value: ventOnly, setter: setVentOnly },
              { label: 'Verified Only', value: verifiedOnly, setter: setVerifiedOnly },
            ].map(f => (
              <label key={f.label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={f.value} onChange={e => f.setter(e.target.checked)} className="accent-red-500 w-4 h-4" />
                <span className="text-sm text-gray-700">{f.label}</span>
              </label>
            ))}
            <button onClick={() => { setResource('any'); setSpecialty('Any'); setUrgency('any'); setIcuOnly(false); setVentOnly(false); setVerifiedOnly(false); setSortBy('distance'); }}
              className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <X size={12} /> Clear all
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hospitals match your filters"
          description="Try adjusting your search filters or expanding the radius."
          action={{ label: 'Clear Filters', onClick: () => { setResource('any'); setSpecialty('Any'); } }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(h => (
            <HospitalCard
              key={h.id}
              hospital={h}
              capacity={capacities[h.id]}
              onCompare={toggleCompare}
              compareSelected={compareIds.includes(h.id)}
              onRequestReferral={(id) => navigate(`/patient/referral/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
