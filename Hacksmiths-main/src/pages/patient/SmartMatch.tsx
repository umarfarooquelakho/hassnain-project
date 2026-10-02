import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, Brain } from 'lucide-react';
import { getHospitals, getCapacities } from '../../services/store';
import { rankHospitals } from '../../services/smartMatch';
import { parseNLPRequest, getHospitalStatus } from '../../utils/helpers';
import type { BedType, UrgencyLevel } from '../../types';

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'icu', label: 'ICU Bed' },
  { value: 'general', label: 'General Bed' },
  { value: 'emergency', label: 'Emergency Bed' },
  { value: 'nicu', label: 'NICU Bed' },
  { value: 'ventilator', label: 'Ventilator' },
  { value: 'operation_theatre', label: 'Operation Theatre' },
];

export default function SmartMatch() {
  const navigate = useNavigate();
  const [resource, setResource] = useState<BedType>('icu');
  const [icuRequired, setIcuRequired] = useState(true);
  const [ventRequired, setVentRequired] = useState(true);
  const [specialty, setSpecialty] = useState('Cardiology');
  const [urgency, setUrgency] = useState<UrgencyLevel>('emergency');
  const [nlpText, setNlpText] = useState('');
  const [results, setResults] = useState<ReturnType<typeof rankHospitals>>([]);
  const [searched, setSearched] = useState(false);

  const handleNLP = () => {
    if (!nlpText.trim()) return;
    const parsed = parseNLPRequest(nlpText);
    setIcuRequired(parsed.icuRequired);
    setVentRequired(parsed.ventilatorRequired);
    setUrgency(parsed.urgency as UrgencyLevel);
    setSpecialty(parsed.specialty);
    if (parsed.icuRequired) setResource('icu');
    doSearch({ icuRequired: parsed.icuRequired, ventilatorRequired: parsed.ventilatorRequired, urgency: parsed.urgency as UrgencyLevel, specialty: parsed.specialty });
  };

  const doSearch = (overrides?: Partial<typeof searchParams>) => {
    const searchParams = { requiredResource: resource, icuRequired, ventilatorRequired: ventRequired, specialty, urgency, ...overrides };
    const ranked = rankHospitals(getHospitals(), getCapacities(), searchParams as any);
    setResults(ranked);
    setSearched(true);
  };

  const searchParams = { requiredResource: resource, icuRequired, ventilatorRequired: ventRequired, specialty, urgency };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star size={22} className="text-red-500" /> Smart Hospital Match
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI-assisted hospital ranking based on your exact requirements.</p>
      </div>

      {/* NLP input */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-red-500" />
          <h2 className="font-semibold text-gray-800">Describe what the patient needs</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Smart Matching</span>
        </div>
        <div className="flex gap-2">
          <input
            value={nlpText}
            onChange={e => setNlpText(e.target.value)}
            placeholder="e.g. I need an ICU bed with ventilator for an emergency cardiac patient near Hyderabad"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            onKeyDown={e => e.key === 'Enter' && handleNLP()}
          />
          <button onClick={handleNLP} className="bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
            Analyze
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Smart matching based on current capacity and your requirements. Demo data only.</p>
      </div>

      {/* Manual criteria */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Search Criteria</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Required Resource</label>
            <select value={resource} onChange={e => setResource(e.target.value as BedType)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Specialty</label>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              {['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Surgery', 'Emergency'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Urgency</label>
            <select value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={icuRequired} onChange={e => setIcuRequired(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">ICU Required</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={ventRequired} onChange={e => setVentRequired(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">Ventilator Required</span>
          </label>
        </div>
        <button
          onClick={() => doSearch()}
          className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Star size={15} /> Find Smart Match
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Smart Match Results — {results.length} hospitals ranked</h2>
          {results.map(({ hospital, capacity, score }, i) => {
            const status = getHospitalStatus(capacity);
            const pct = Math.round((score.totalScore / 100) * 100);
            const matchColor = pct >= 80 ? 'text-green-600 bg-green-50' : pct >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50';
            return (
              <div key={hospital.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      #{i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={10} />{hospital.distance} km</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{hospital.travelTime} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-center px-4 py-2 rounded-xl font-bold ${matchColor}`}>
                      <p className="text-2xl">{pct}%</p>
                      <p className="text-xs">match</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                  {Object.entries(score.breakdown).map(([key, val]) => (
                    <div key={key} className="text-center bg-gray-50 rounded-lg py-2">
                      <p className="text-sm font-bold text-gray-800">{val}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>

                {/* Why this hospital */}
                {score.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {score.reasons.map((r, j) => (
                      <span key={j} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> {r}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/patient/hospital/${hospital.id}`)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/patient/referral/${hospital.id}`)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600"
                  >
                    Request Referral
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
