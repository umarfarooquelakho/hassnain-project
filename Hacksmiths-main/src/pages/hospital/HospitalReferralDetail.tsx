import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { getReferral, updateReferral, getCapacity, updateCapacity, addNotification, addAuditLog } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime, generateId } from '../../utils/helpers';
import ReferralTimeline from '../../components/referral/ReferralTimeline';
import EmptyState from '../../components/ui/EmptyState';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import type { Referral } from '../../types';

export default function HospitalReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const hospitalId = user?.hospitalId || 'h1';

  const [referral, setReferral] = useState(() => getReferral(id!));
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!referral) return <EmptyState icon={FileText} title="Referral not found" action={{ label: 'Go back', onClick: () => navigate(-1) }} />;

  const sc = getReferralStatusConfig(referral.status);
  const uc = getUrgencyConfig(referral.urgency);
  const canAct = referral.status === 'sent' || referral.status === 'reviewing';

  const handleAccept = () => {
    const updated: Referral = { ...referral, status: 'accepted', updatedAt: new Date().toISOString() };
    updateReferral(updated);
    const cap = getCapacity(hospitalId);
    if (cap) {
      const capUpdate = { ...cap };
      if (referral.icuRequired) capUpdate.icuAvailable = Math.max(0, capUpdate.icuAvailable - 1);
      if (referral.ventilatorRequired) capUpdate.ventilatorAvailable = Math.max(0, capUpdate.ventilatorAvailable - 1);
      if (referral.requiredResource === 'general') capUpdate.availableBeds = Math.max(0, capUpdate.availableBeds - 1);
      if (referral.requiredResource === 'emergency') capUpdate.emergencyAvailable = Math.max(0, capUpdate.emergencyAvailable - 1);
      updateCapacity({ ...capUpdate, lastUpdatedBy: user?.name || 'Staff' });
    }
    addNotification({ id: generateId('N'), userId: referral.patientId, type: 'referral_accepted', title: 'Referral Accepted', message: `Your referral ${referral.id} has been accepted.`, read: false, createdAt: new Date().toISOString(), referralId: referral.id });
    addAuditLog({ id: generateId('AL'), userId: user?.id || '', userName: user?.name || '', userRole: 'hospital', action: 'Accepted referral', entity: 'Referral', entityId: referral.id, previousValue: 'reviewing', newValue: 'accepted', timestamp: new Date().toISOString() });
    setReferral({ ...updated });
    showToast('Referral accepted. Capacity updated.', 'success');
  };

  const handleReject = () => {
    if (!rejectReason) return;
    const updated: Referral = { ...referral, status: 'rejected', rejectionReason: rejectReason, updatedAt: new Date().toISOString() };
    updateReferral(updated);
    addNotification({ id: generateId('N'), userId: referral.patientId, type: 'referral_rejected', title: 'Referral Rejected', message: `Referral ${referral.id} rejected: ${rejectReason}.`, read: false, createdAt: new Date().toISOString(), referralId: referral.id });
    setReferral({ ...updated });
    setRejectModal(false);
    showToast('Referral rejected.', 'info');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-gray-900 text-lg">{referral.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${uc.bg} ${uc.color}`}>{uc.label}</span>
            </div>
            <p className="text-xs text-gray-400">{formatDateTime(referral.createdAt)}</p>
          </div>
          {canAct && (
            <div className="flex gap-2">
              <button onClick={handleAccept} className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">
                <CheckCircle size={14} /> Accept
              </button>
              <button onClick={() => setRejectModal(true)} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient</h3>
            <p className="font-semibold text-gray-900">{referral.patientName}</p>
            <p className="text-sm text-gray-500">{referral.patientAge} years · {referral.patientGender}</p>
            {referral.currentLocation && <p className="text-sm text-gray-500 mt-1">{referral.currentLocation}</p>}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{referral.requiredResource.replace('_',' ')}</span>
              <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">{referral.specialty}</span>
              {referral.icuRequired && <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">ICU</span>}
              {referral.ventilatorRequired && <span className="bg-orange-50 text-orange-600 text-xs px-2.5 py-1 rounded-full font-medium">Ventilator</span>}
            </div>
            {referral.notes && <p className="text-sm text-gray-600 mt-2">{referral.notes}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Referral Timeline</h2>
        <ReferralTimeline status={referral.status} createdAt={referral.createdAt} updatedAt={referral.updatedAt} rejectionReason={referral.rejectionReason} />
      </div>

      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Referral">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select reason for rejection:</p>
          {['No Capacity', 'Resource Unavailable', 'Specialist Unavailable', 'Emergency Department Full', 'Other'].map(r => (
            <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="rr" value={r} checked={rejectReason === r} onChange={() => setRejectReason(r)} className="accent-red-500" />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setRejectModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={handleReject} disabled={!rejectReason} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
