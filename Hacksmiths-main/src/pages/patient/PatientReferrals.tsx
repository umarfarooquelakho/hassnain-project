import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { getReferrals } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';

export default function PatientReferrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allReferrals = getReferrals().filter(r => r.patientId === user?.id || true); // show all for demo
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? allReferrals : allReferrals.filter(r => r.status === filter);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Referrals</h1>
        <button onClick={() => navigate('/patient/search')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
          New Referral
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'sent', 'reviewing', 'accepted', 'rejected', 'admitted'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No referrals found" description="Submit a referral to a hospital to see it here." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Referral ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Hospital</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Resource</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Urgency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sc = getReferralStatusConfig(r.status);
                const uc = getUrgencyConfig(r.urgency);
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patient/referrals/${r.id}`)}>
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-800">{r.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{r.patientName}</p>
                      <p className="text-xs text-gray-400">Age {r.patientAge}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell text-xs">{r.hospitalName}</td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize">{r.requiredResource.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden md:table-cell">{formatDateTime(r.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button className="text-xs text-red-500 font-medium hover:underline">View</button>
                    </td>
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
