import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { getReferrals, updateReferral, getCapacity, updateCapacity, addNotification, addAuditLog } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { getReferralStatusConfig, getUrgencyConfig, formatDateTime, generateId } from '../../utils/helpers';
import type { Referral } from '../../types';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function HospitalReferrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const hospitalId = user?.hospitalId || 'h1';

  const [referrals, setReferrals] = useState(() => getReferrals().filter(r => r.hospitalId === hospitalId));
  const [rejectModal, setRejectModal] = useState<Referral | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('all');

  const REJECT_REASONS = ['No Capacity', 'Resource Unavailable', 'Specialist Unavailable', 'Emergency Department Full', 'Other'];

  const handleAccept = (referral: Referral) => {
    const updated: Referral = { ...referral, status: 'accepted', updatedAt: new Date().toISOString() };
    updateReferral(updated);

    // Update capacity
    const cap = getCapacity(hospitalId);
    if (cap) {
      const resource = referral.requiredResource;
      const capUpdate = { ...cap };
      if (resource === 'icu' || referral.icuRequired) {
        capUpdate.icuAvailable = Math.max(0, capUpdate.icuAvailable - 1);
        capUpdate.icuAvailable = capUpdate.icuAvailable;
      }
      if (referral.ventilatorRequired) capUpdate.ventilatorAvailable = Math.max(0, capUpdate.ventilatorAvailable - 1);
      if (resource === 'general') capUpdate.availableBeds = Math.max(0, capUpdate.availableBeds - 1);
      if (resource === 'emergency') capUpdate.emergencyAvailable = Math.max(0, capUpdate.emergencyAvailable - 1);
      updateCapacity({ ...capUpdate, lastUpdatedBy: user?.name || 'Staff' });
    }

    // Notify patient
    addNotification({ id: generateId('N'), userId: referral.patientId, type: 'referral_accepted', title: 'Referral Accepted', message: `Your referral ${referral.id} has been accepted by ${referral.hospitalName}.`, read: false, createdAt: new Date().toISOString(), referralId: referral.id });

    addAuditLog({ id: generateId('AL'), userId: user?.id || '', userName: user?.name || '', userRole: 'hospital', action: 'Accepted referral', entity: 'Referral', entityId: referral.id, previousValue: 'Status: Reviewing', newValue: 'Status: Accepted', timestamp: new Date().toISOString() });

    setReferrals(getReferrals().filter(r => r.hospitalId === hospitalId));
    showToast(`Referral ${referral.id} accepted. Capacity updated.`, 'success');
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason) return;
    const updated: Referral = { ...rejectModal, status: 'rejected', rejectionReason: rejectReason, updatedAt: new Date().toISOString() };
    updateReferral(updated);

    addNotification({ id: generateId('N'), userId: rejectModal.patientId, type: 'referral_rejected', title: 'Referral Update', message: `Referral ${rejectModal.id} was rejected: ${rejectReason}.`, read: false, createdAt: new Date().toISOString(), referralId: rejectModal.id });

    setReferrals(getReferrals().filter(r => r.hospitalId === hospitalId));
    setRejectModal(null);
    setRejectReason('');
    showToast(`Referral ${rejectModal.id} rejected.`, 'info');
  };

  const displayed = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Referral Requests</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'sent', 'reviewing', 'accepted', 'rejected', 'admitted'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
            {s === 'sent' && referrals.filter(r => r.status === 'sent').length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {referrals.filter(r => r.status === 'sent').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No referrals" description="Referral requests from patients and coordinators will appear here." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Resource</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Urgency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(r => {
                const sc = getReferralStatusConfig(r.status);
                const uc = getUrgencyConfig(r.urgency);
                const canAct = r.status === 'sent' || r.status === 'reviewing';
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-700">{r.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{r.patientName}</p>
                      <p className="text-xs text-gray-400">{r.patientAge}y · {r.patientGender}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full capitalize inline-block w-fit">
                          {r.requiredResource.replace('_',' ')}
                        </span>
                        <div className="flex gap-1">
                          {r.icuRequired && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">ICU</span>}
                          {r.ventilatorRequired && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">Vent</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDateTime(r.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => navigate(`/hospital/referrals/${r.id}`)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                          <Eye size={13} />
                        </button>
                        {canAct && <>
                          <button onClick={() => handleAccept(r)} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                            <CheckCircle size={12} /> Accept
                          </button>
                          <button onClick={() => { setRejectModal(r); setRejectReason(''); }} className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                            <XCircle size={12} /> Reject
                          </button>
                        </>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`Reject Referral ${rejectModal?.id}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please select a reason for rejecting this referral.</p>
          <div className="space-y-2">
            {REJECT_REASONS.map(r => (
              <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="reason" value={r} checked={rejectReason === r} onChange={() => setRejectReason(r)} className="accent-red-500" />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleReject} disabled={!rejectReason} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
