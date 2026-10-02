import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone } from 'lucide-react';
import { getReferral, getHospital } from '../../services/store';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime } from '../../utils/helpers';
import ReferralTimeline from '../../components/referral/ReferralTimeline';
import EmptyState from '../../components/ui/EmptyState';
import { FileText } from 'lucide-react';

export default function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const referral = getReferral(id!);
  const hospital = referral ? getHospital(referral.hospitalId) : undefined;

  if (!referral) return <EmptyState icon={FileText} title="Referral not found" action={{ label: 'Go back', onClick: () => navigate(-1) }} />;

  const sc = getReferralStatusConfig(referral.status);
  const uc = getUrgencyConfig(referral.urgency);

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-gray-500 font-medium">Referral</p>
              <p className="font-mono font-bold text-gray-900 text-lg">{referral.id}</p>
            </div>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${uc.bg} ${uc.color}`}>{uc.label}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">{formatDateTime(referral.createdAt)}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient</h3>
            <p className="font-semibold text-gray-900">{referral.patientName}</p>
            <p className="text-sm text-gray-500">{referral.patientAge} years · {referral.patientGender}</p>
            {referral.currentLocation && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} />{referral.currentLocation}</p>}
          </div>

          {/* Hospital info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Hospital</h3>
            <p className="font-semibold text-gray-900">{referral.hospitalName}</p>
            {hospital && (
              <>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} />{hospital.address}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={12} />{referral.estimatedTravelTime} min travel time</p>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12} />{hospital.contact}</p>
              </>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Requirements</h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{referral.requiredResource.replace('_',' ')}</span>
            <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">{referral.specialty}</span>
            {referral.icuRequired && <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">ICU Required</span>}
            {referral.ventilatorRequired && <span className="bg-orange-50 text-orange-600 text-xs px-2.5 py-1 rounded-full font-medium">Ventilator Required</span>}
          </div>
          {referral.notes && <p className="text-sm text-gray-600 mt-2">{referral.notes}</p>}
          {referral.rejectionReason && (
            <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded-lg">Rejection reason: {referral.rejectionReason}</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Referral Progress</h2>
        <ReferralTimeline
          status={referral.status}
          createdAt={referral.createdAt}
          updatedAt={referral.updatedAt}
          rejectionReason={referral.rejectionReason}
        />
      </div>
    </div>
  );
}
