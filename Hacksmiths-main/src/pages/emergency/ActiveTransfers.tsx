import { useNavigate } from 'react-router-dom';
import { Ambulance, Clock } from 'lucide-react';
import { getReferrals } from '../../services/store';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';

export default function ActiveTransfers() {
  const navigate = useNavigate();
  const referrals = getReferrals().filter(r => ['accepted', 'transferred', 'reviewing', 'sent'].includes(r.status));

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Ambulance size={22} className="text-orange-500" /> Active Transfers
      </h1>

      {referrals.length === 0 ? (
        <EmptyState icon={Ambulance} title="No active transfers" description="Active referrals and transfers will appear here." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Referral</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Hospital</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Resource</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">ETA</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Urgency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => {
                const sc = getReferralStatusConfig(r.status);
                const uc = getUrgencyConfig(r.urgency);
                return (
                  <tr key={r.id} onClick={() => navigate(`/patient/referrals/${r.id}`)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-700">{r.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{r.patientName}</p>
                      <p className="text-xs text-gray-400">{r.patientAge}y · {r.patientGender}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs hidden md:table-cell">{r.hospitalName}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.requiredResource.replace('_',' ')}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      {r.estimatedTravelTime ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={10} />{r.estimatedTravelTime} min
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden md:table-cell">{formatDateTime(r.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
