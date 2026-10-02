import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { getHospital, addReferral, addNotification, addAuditLog } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { generateId } from '../../utils/helpers';
import type { BedType, UrgencyLevel, Referral, Notification, AuditLog } from '../../types';

export default function ReferralRequest() {
  const { id: hospitalId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hospital = getHospital(hospitalId!);

  const [form, setForm] = useState({
    patientName: user?.name || '',
    patientAge: '',
    patientGender: 'Male',
    requiredResource: 'icu' as BedType,
    specialty: 'Cardiology',
    urgency: 'urgent' as UrgencyLevel,
    icuRequired: false,
    ventilatorRequired: false,
    currentLocation: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [referralId, setReferralId] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientName) e.patientName = 'Required';
    if (!form.patientAge || isNaN(Number(form.patientAge)) || Number(form.patientAge) < 0 || Number(form.patientAge) > 120) e.patientAge = 'Valid age required';
    if (!form.currentLocation) e.currentLocation = 'Required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const rid = generateId('RF');
    const referral: Referral = {
      id: rid,
      patientId: user?.id || 'u1',
      patientName: form.patientName,
      patientAge: Number(form.patientAge),
      patientGender: form.patientGender,
      hospitalId: hospitalId!,
      hospitalName: hospital?.name || '',
      requiredResource: form.requiredResource,
      specialty: form.specialty,
      urgency: form.urgency,
      icuRequired: form.icuRequired,
      ventilatorRequired: form.ventilatorRequired,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentLocation: form.currentLocation,
      notes: form.notes,
      estimatedTravelTime: hospital?.travelTime,
    };
    addReferral(referral);

    // Notification to hospital staff (u3)
    const n: Notification = {
      id: generateId('N'),
      userId: 'u3',
      type: 'referral_accepted',
      title: 'New Referral Request',
      message: `New referral ${rid} for ${form.requiredResource.toUpperCase()} from ${form.patientName}.`,
      read: false,
      createdAt: new Date().toISOString(),
      referralId: rid,
    };
    addNotification(n);

    // Audit log
    const log: AuditLog = {
      id: generateId('AL'),
      userId: user?.id || 'u1',
      userName: user?.name || '',
      userRole: user?.role || 'patient',
      action: 'Submitted referral request',
      entity: 'Referral',
      entityId: rid,
      newValue: `${form.requiredResource.toUpperCase()}, ${form.specialty}, ${form.urgency}`,
      timestamp: new Date().toISOString(),
    };
    addAuditLog(log);

    setReferralId(rid);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted</h2>
        <p className="text-gray-500 mb-2">Your referral has been sent to the hospital.</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1">Referral ID</p>
          <p className="text-xl font-bold text-red-500">{referralId}</p>
          <p className="text-xs text-gray-500 mt-2">Hospital: {hospital?.name}</p>
          <p className="text-xs text-gray-500">Status: Sent — awaiting hospital response</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/patient/referrals')} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
            View Referrals
          </button>
          <button onClick={() => navigate('/patient')} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Request</h1>
        {hospital && <p className="text-sm text-gray-500 mt-1">Sending to: <span className="font-medium text-gray-800">{hospital.name}</span></p>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Patient info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Patient Name *</label>
            <input value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            {errors.patientName && <p className="text-xs text-red-500 mt-0.5">{errors.patientName}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Age *</label>
            <input type="number" value={form.patientAge} onChange={e => setForm(p => ({ ...p, patientAge: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            {errors.patientAge && <p className="text-xs text-red-500 mt-0.5">{errors.patientAge}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Gender</label>
            <select value={form.patientGender} onChange={e => setForm(p => ({ ...p, patientGender: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Emergency Level *</label>
            <select value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value as UrgencyLevel }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Required Bed Type</label>
            <select value={form.requiredResource} onChange={e => setForm(p => ({ ...p, requiredResource: e.target.value as BedType }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="general">General Bed</option>
              <option value="emergency">Emergency Bed</option>
              <option value="icu">ICU Bed</option>
              <option value="nicu">NICU Bed</option>
              <option value="ventilator">Ventilator</option>
              <option value="operation_theatre">Operation Theatre</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Required Specialty</label>
            <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              {['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Surgery', 'Emergency', 'Oncology'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.icuRequired} onChange={e => setForm(p => ({ ...p, icuRequired: e.target.checked }))} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">ICU Required</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ventilatorRequired} onChange={e => setForm(p => ({ ...p, ventilatorRequired: e.target.checked }))} className="accent-red-500 w-4 h-4" />
            <span className="text-sm text-gray-700">Ventilator Required</span>
          </label>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Current Location *</label>
          <input value={form.currentLocation} onChange={e => setForm(p => ({ ...p, currentLocation: e.target.value }))}
            placeholder="Area, City"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          {errors.currentLocation && <p className="text-xs text-red-500 mt-0.5">{errors.currentLocation}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Additional Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} placeholder="Symptoms, current condition, special requirements..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-60">
          {loading ? 'Submitting...' : 'Send Referral Request'}
        </button>
      </form>
    </div>
  );
}
