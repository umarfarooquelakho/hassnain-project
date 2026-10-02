import { getReferrals } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function HospitalPatients() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId || 'h1';
  const patients = getReferrals().filter(r => r.hospitalId === hospitalId && ['accepted', 'transferred', 'admitted'].includes(r.status));

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Current Patients</h1>
      {patients.length === 0 ? (
        <EmptyState icon={Users} title="No current patients" description="Accepted and admitted patients will appear here." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Referral ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Resource</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Urgency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Admitted</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(r => {
                const sc = getReferralStatusConfig(r.status);
                const uc = getUrgencyConfig(r.urgency);
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{r.patientName}</p>
                      <p className="text-xs text-gray-400">{r.patientAge}y · {r.patientGender} · {r.specialty}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 hidden md:table-cell">{r.id}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.requiredResource.replace('_',' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDateTime(r.updatedAt)}</td>
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
