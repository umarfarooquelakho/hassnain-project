import { useNavigate } from 'react-router-dom';
import { Bed, Heart, Zap, Activity, ClipboardList, ArrowRight } from 'lucide-react';
import { getHospital, getCapacity, getReferrals } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';
import { getCapacityStatus, formatTimeAgo, getReferralStatusConfig, getUrgencyConfig } from '../../utils/helpers';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hospitalId = user?.hospitalId || 'h1';
  const hospital = getHospital(hospitalId);
  const capacity = getCapacity(hospitalId);
  const allReferrals = getReferrals().filter(r => r.hospitalId === hospitalId);
  const pendingReferrals = allReferrals.filter(r => r.status === 'sent' || r.status === 'reviewing');

  if (!hospital || !capacity) return <p className="text-gray-500">Hospital not found</p>;

  const occupancyPct = Math.round((capacity.occupiedBeds / capacity.totalBeds) * 100);
  const icuStatus = getCapacityStatus(capacity.icuAvailable, capacity.icuTotal);
  const emergencyStatus = getCapacityStatus(capacity.emergencyAvailable, capacity.emergencyTotal);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{hospital.address}</p>
        </div>
        {pendingReferrals.length > 0 && (
          <button onClick={() => navigate('/hospital/referrals')} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600">
            <ClipboardList size={15} />
            {pendingReferrals.length} Pending Referral{pendingReferrals.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Available Beds" value={capacity.availableBeds} subtitle={`of ${capacity.totalBeds} total`} icon={Bed} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="ICU Available" value={capacity.icuAvailable} subtitle={`of ${capacity.icuTotal} total`} icon={Heart} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard title="Emergency Beds" value={capacity.emergencyAvailable} subtitle={`of ${capacity.emergencyTotal} total`} icon={Zap} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <StatCard title="Ventilators" value={capacity.ventilatorAvailable} subtitle={`of ${capacity.ventilatorTotal} total`} icon={Activity} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Occupancy overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Capacity Overview</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Updated {formatTimeAgo(capacity.lastUpdated)}</span>
            <button onClick={() => navigate('/hospital/capacity')} className="flex items-center gap-1 text-xs text-red-500 font-medium hover:underline">
              Manage <ArrowRight size={11} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <ProgressBar value={occupancyPct} label="Overall Occupancy" />
          {[
            { label: 'ICU', value: capacity.icuAvailable, total: capacity.icuTotal, status: icuStatus },
            { label: 'Emergency', value: capacity.emergencyAvailable, total: capacity.emergencyTotal, status: emergencyStatus },
            { label: 'Ventilators', value: capacity.ventilatorAvailable, total: capacity.ventilatorTotal, status: getCapacityStatus(capacity.ventilatorAvailable, capacity.ventilatorTotal) },
          ].map(item => {
            const pct = item.total > 0 ? Math.round(((item.total - item.value) / item.total) * 100) : 0;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600 w-20 shrink-0">{item.label}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} showPct={false} />
                </div>
                <span className={`text-xs font-semibold ${item.status.color} w-20 text-right`}>{item.value} free</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending referrals */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList size={16} className="text-red-500" />
            Recent Referral Requests
          </h2>
          <button onClick={() => navigate('/hospital/referrals')} className="text-xs text-red-500 font-medium hover:underline">View all</button>
        </div>
        {allReferrals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No referral requests yet</p>
        ) : (
          <div className="space-y-2">
            {allReferrals.slice(0, 5).map(r => {
              const sc = getReferralStatusConfig(r.status);
              const uc = getUrgencyConfig(r.urgency);
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/hospital/referrals/${r.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{r.id}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{r.patientName} · {r.requiredResource.replace('_',' ').toUpperCase()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
