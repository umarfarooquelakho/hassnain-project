import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getHospitals, getCapacities } from '../../services/store';
import { rankHospitals } from '../../services/smartMatch';
import { getHospitalStatus, formatTimeAgo } from '../../utils/helpers';
import type { BedType } from '../../types';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';

export default function EmergencySearch() {
  const navigate = useNavigate();
  const [resource, setResource] = useState<BedType>('icu');
  const [icuRequired, setIcuRequired] = useState(true);
  const [ventRequired, setVentRequired] = useState(false);
  const [specialty, setSpecialty] = useState('Emergency');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof rankHospitals>>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const hospitals = getHospitals();
    const capacities = getCapacities();
    const ranked = rankHospitals(hospitals, capacities, {
      requiredResource: resource, icuRequired, ventilatorRequired: ventRequired,
      specialty, urgency: 'emergency'
    });
    setResults(ranked);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-red-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={20} />
          <h1 className="text-xl font-bold">Emergency Hospital Search</h1>
        </div>
        <p className="text-red-100 text-sm">Find available hospitals instantly for emergency patients.</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Required Resource</label>
            <select value={resource} onChange={e => setResource(e.target.value as BedType)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="icu">ICU Bed</option>
              <option value="emergency">Emergency Bed</option>
              <option value="general">General Bed</option>
              <option value="ventilator">Ventilator</option>
              <option value="nicu">NICU</option>
              <option value="operation_theatre">Operation Theatre</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Specialty</label>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              {['Emergency', 'Cardiology', 'Neurology', 'Trauma', 'Surgery', 'Pediatrics'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={icuRequired} onChange={e => setIcuRequired(e.target.checked)} className="accent-red-500 w-4 h-4" />
                <span className="text-sm text-gray-700">ICU</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ventRequired} onChange={e => setVentRequired(e.target.checked)} className="accent-red-500 w-4 h-4" />
                <span className="text-sm text-gray-700">Ventilator</span>
              </label>
            </div>
            <button onClick={handleSearch} className="bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <AlertTriangle size={14} /> Search Now
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>}

      {searched && !loading && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">{results.length} hospitals found — sorted by match score</p>
          {results.map(({ hospital, capacity, score }, i) => {
            const status = getHospitalStatus(capacity);
            const pct = Math.round((score.totalScore / 100) * 100);
            return (
              <div key={hospital.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>#{i + 1}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                      <p className="text-xs text-gray-500">{hospital.distance}km · {hospital.travelTime} min travel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${pct >= 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{pct}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { l: 'ICU', v: capacity.icuAvailable, c: 'text-red-500 bg-red-50' },
                    { l: 'Ventilator', v: capacity.ventilatorAvailable, c: 'text-purple-600 bg-purple-50' },
                    { l: 'Emergency', v: capacity.emergencyAvailable, c: 'text-orange-500 bg-orange-50' },
                    { l: 'General', v: capacity.availableBeds, c: 'text-blue-600 bg-blue-50' },
                  ].map(item => (
                    <div key={item.l} className={`${item.c} rounded-lg p-2 text-center`}>
                      <p className="font-bold text-lg">{item.v}</p>
                      <p className="text-[10px]">{item.l}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-3">Updated {formatTimeAgo(capacity.lastUpdated)}</p>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/patient/hospital/${hospital.id}`)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-gray-50">
                    View Details
                  </button>
                  <button onClick={() => navigate(`/patient/referral/${hospital.id}`)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-600">
                    Send Emergency Referral
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
