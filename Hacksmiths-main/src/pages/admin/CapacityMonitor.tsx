import { getHospitals, getCapacities } from '../../services/store';
import { getHospitalStatus, formatTimeAgo } from '../../utils/helpers';
import ProgressBar from '../../components/ui/ProgressBar';

export default function CapacityMonitor() {
  const hospitals = getHospitals().filter(h => h.status === 'active');
  const capacities = getCapacities();

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Capacity Monitoring</h1>
      <p className="text-sm text-gray-500 -mt-4">System-wide real-time capacity view. Demo data.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {hospitals.filter(h => capacities[h.id]).map(h => {
          const cap = capacities[h.id];
          const status = getHospitalStatus(cap);
          const occ = Math.round((cap.occupiedBeds / cap.totalBeds) * 100);
          return (
            <div key={h.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{h.name}</h3>
                  <p className="text-xs text-gray-400">{formatTimeAgo(cap.lastUpdated)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.bg} ${status.color}`}>{status.label}</span>
              </div>

              <ProgressBar value={occ} label="Occupancy" />

              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { l: 'Beds', v: cap.availableBeds, t: cap.totalBeds, c: 'text-blue-600' },
                  { l: 'ICU', v: cap.icuAvailable, t: cap.icuTotal, c: cap.icuAvailable === 0 ? 'text-red-600' : 'text-green-600' },
                  { l: 'Vent.', v: cap.ventilatorAvailable, t: cap.ventilatorTotal, c: cap.ventilatorAvailable === 0 ? 'text-red-600' : 'text-purple-600' },
                  { l: 'Emerg.', v: cap.emergencyAvailable, t: cap.emergencyTotal, c: cap.emergencyAvailable === 0 ? 'text-red-600' : 'text-orange-500' },
                ].map(item => (
                  <div key={item.l} className="text-center">
                    <p className={`text-lg font-bold ${item.c}`}>{item.v}</p>
                    <p className="text-[10px] text-gray-400">/{item.t} {item.l}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
