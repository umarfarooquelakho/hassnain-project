import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { getHospital, getCapacity } from '../../services/store';
import { getHospitalStatus, getOccupancyPct } from '../../utils/helpers';

export default function HospitalComparison() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 3);

  const hospitals = ids.map(id => ({ hospital: getHospital(id), capacity: getCapacity(id) })).filter(x => x.hospital && x.capacity) as any[];

  if (hospitals.length < 1) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 mb-6"><ArrowLeft size={15} /> Back</button>
        <div className="text-center py-16 text-gray-400">Select hospitals to compare from the search results.</div>
      </div>
    );
  }

  const rows = [
    { label: 'Distance', getValue: ({ hospital }: any) => `${hospital.distance} km` },
    { label: 'Travel Time', getValue: ({ hospital }: any) => `${hospital.travelTime} min` },
    { label: 'Rating', getValue: ({ hospital }: any) => `⭐ ${hospital.rating}` },
    { label: 'Verified', getValue: ({ hospital }: any) => hospital.verified ? '✓ Yes' : '✗ No', isGood: ({ hospital }: any) => hospital.verified },
    { label: 'Available Beds', getValue: ({ capacity }: any) => capacity.availableBeds, isGood: ({ capacity }: any) => capacity.availableBeds > 0 },
    { label: 'ICU Available', getValue: ({ capacity }: any) => capacity.icuAvailable, isGood: ({ capacity }: any) => capacity.icuAvailable > 0 },
    { label: 'NICU Available', getValue: ({ capacity }: any) => capacity.nicuAvailable, isGood: ({ capacity }: any) => capacity.nicuAvailable > 0 },
    { label: 'Emergency Beds', getValue: ({ capacity }: any) => capacity.emergencyAvailable, isGood: ({ capacity }: any) => capacity.emergencyAvailable > 0 },
    { label: 'Ventilators', getValue: ({ capacity }: any) => capacity.ventilatorAvailable, isGood: ({ capacity }: any) => capacity.ventilatorAvailable > 0 },
    { label: 'Operation Theatres', getValue: ({ capacity }: any) => capacity.operationTheatreAvailable, isGood: ({ capacity }: any) => capacity.operationTheatreAvailable > 0 },
    { label: 'Ambulances', getValue: ({ capacity }: any) => capacity.ambulanceAvailable, isGood: ({ capacity }: any) => capacity.ambulanceAvailable > 0 },
    { label: 'Overall Occupancy', getValue: ({ capacity }: any) => `${getOccupancyPct(capacity)}%`, isGood: ({ capacity }: any) => getOccupancyPct(capacity) < 80 },
    { label: 'Status', getValue: ({ capacity }: any) => getHospitalStatus(capacity).label },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={15} /> Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Comparison</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 w-40">Criteria</th>
              {hospitals.map(({ hospital }: any) => (
                <th key={hospital.id} className="text-center px-5 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{hospital.name}</p>
                  <p className="text-xs text-gray-400 font-normal">{hospital.city}</p>
                  <button
                    onClick={() => navigate(`/patient/referral/${hospital.id}`)}
                    className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600"
                  >
                    Request
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                <td className="px-5 py-3 text-xs font-semibold text-gray-500">{row.label}</td>
                {hospitals.map(({ hospital, capacity }: any) => {
                  const value = row.getValue({ hospital, capacity });
                  const isGood = row.isGood ? row.isGood({ hospital, capacity }) : undefined;
                  return (
                    <td key={hospital.id} className="px-5 py-3 text-center">
                      <span className={`text-sm font-medium ${isGood === true ? 'text-green-600' : isGood === false ? 'text-red-500' : 'text-gray-700'}`}>
                        {typeof value === 'boolean' ? (value ? <CheckCircle size={16} /> : <XCircle size={16} />) : value}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Specialties row */}
            <tr className="border-b border-gray-50">
              <td className="px-5 py-3 text-xs font-semibold text-gray-500">Specialties</td>
              {hospitals.map(({ hospital }: any) => (
                <td key={hospital.id} className="px-5 py-3">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {hospital.specialties.slice(0, 4).map((s: string) => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
