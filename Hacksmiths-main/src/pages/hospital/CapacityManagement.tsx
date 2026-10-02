import { useState } from 'react';
import { Bed, Heart, Zap, Activity, Save, CheckCircle } from 'lucide-react';
import { getCapacity, updateCapacity, addAuditLog } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import type { Capacity } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { formatTimeAgo, generateId } from '../../utils/helpers';
import CapacityCard from '../../components/hospital/CapacityCard';

export default function CapacityManagement() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId || 'h1';
  const { showToast } = useToast();

  const [capacity, setCapacity] = useState<Capacity>(() => getCapacity(hospitalId) as Capacity);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof Capacity, value: number) => {
    setCapacity(prev => {
      const next = { ...prev, [field]: Math.max(0, value) };
      // Validations
      if (next.availableBeds > next.totalBeds) next.availableBeds = next.totalBeds;
      if (next.occupiedBeds > next.totalBeds) next.occupiedBeds = next.totalBeds;
      if (next.icuAvailable > next.icuTotal) next.icuAvailable = next.icuTotal;
      if (next.emergencyAvailable > next.emergencyTotal) next.emergencyAvailable = next.emergencyTotal;
      if (next.ventilatorAvailable > next.ventilatorTotal) next.ventilatorAvailable = next.ventilatorTotal;
      return next;
    });
    setSaved(false);
  };

  const handleFieldUpdate = (field: keyof Capacity, delta: number) => {
    update(field, (capacity[field] as number) + delta);
  };

  const handleSave = () => {
    const prevCap = getCapacity(hospitalId);
    updateCapacity({ ...capacity, lastUpdatedBy: user?.name || 'Staff', lastUpdated: new Date().toISOString() });

    // Log changes
    const changes: string[] = [];
    if (prevCap && prevCap.icuAvailable !== capacity.icuAvailable)
      changes.push(`ICU: ${prevCap.icuAvailable} → ${capacity.icuAvailable}`);
    if (prevCap && prevCap.ventilatorAvailable !== capacity.ventilatorAvailable)
      changes.push(`Ventilators: ${prevCap.ventilatorAvailable} → ${capacity.ventilatorAvailable}`);
    if (prevCap && prevCap.availableBeds !== capacity.availableBeds)
      changes.push(`General Beds: ${prevCap.availableBeds} → ${capacity.availableBeds}`);

    if (changes.length > 0) {
      addAuditLog({
        id: generateId('AL'),
        userId: user?.id || '',
        userName: user?.name || '',
        userRole: user?.role || 'hospital',
        action: 'Updated capacity',
        entity: 'Capacity',
        entityId: capacity.id,
        previousValue: changes.map(c => c.split(' → ')[0]).join(', '),
        newValue: changes.map(c => c.split(' → ')[1]).join(', '),
        timestamp: new Date().toISOString(),
        hospitalName: 'My Hospital',
      });
    }

    setSaved(true);
    showToast('Capacity updated successfully', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const resources = [
    { label: 'General Beds', icon: Bed, iconColor: 'text-blue-600', total: capacity.totalBeds, available: capacity.availableBeds, occupied: capacity.occupiedBeds, reserved: capacity.reservedBeds, availField: 'availableBeds' as keyof Capacity, occField: 'occupiedBeds' as keyof Capacity },
    { label: 'ICU Beds', icon: Heart, iconColor: 'text-red-500', total: capacity.icuTotal, available: capacity.icuAvailable, occupied: capacity.icuTotal - capacity.icuAvailable, reserved: 0, availField: 'icuAvailable' as keyof Capacity, occField: undefined },
    { label: 'NICU Beds', icon: Activity, iconColor: 'text-pink-500', total: capacity.nicuTotal, available: capacity.nicuAvailable, occupied: capacity.nicuTotal - capacity.nicuAvailable, reserved: 0, availField: 'nicuAvailable' as keyof Capacity, occField: undefined },
    { label: 'Emergency Beds', icon: Zap, iconColor: 'text-orange-500', total: capacity.emergencyTotal, available: capacity.emergencyAvailable, occupied: capacity.emergencyTotal - capacity.emergencyAvailable, reserved: 0, availField: 'emergencyAvailable' as keyof Capacity, occField: undefined },
    { label: 'Ventilators', icon: Activity, iconColor: 'text-purple-600', total: capacity.ventilatorTotal, available: capacity.ventilatorAvailable, occupied: capacity.ventilatorTotal - capacity.ventilatorAvailable, reserved: 0, availField: 'ventilatorAvailable' as keyof Capacity, occField: undefined },
    { label: 'Operation Theatres', icon: Activity, iconColor: 'text-teal-600', total: capacity.operationTheatreTotal, available: capacity.operationTheatreAvailable, occupied: capacity.operationTheatreTotal - capacity.operationTheatreAvailable, reserved: 0, availField: 'operationTheatreAvailable' as keyof Capacity, occField: undefined },
    { label: 'Isolation Beds', icon: Bed, iconColor: 'text-gray-600', total: capacity.isolationTotal, available: capacity.isolationAvailable, occupied: capacity.isolationTotal - capacity.isolationAvailable, reserved: 0, availField: 'isolationAvailable' as keyof Capacity, occField: undefined },
    { label: 'Ambulances', icon: Activity, iconColor: 'text-green-600', total: capacity.ambulanceTotal, available: capacity.ambulanceAvailable, occupied: capacity.ambulanceTotal - capacity.ambulanceAvailable, reserved: 0, availField: 'ambulanceAvailable' as keyof Capacity, occField: undefined },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacity Management</h1>
          <p className="text-sm text-gray-500">Last updated {formatTimeAgo(capacity.lastUpdated)} by {capacity.lastUpdatedBy}</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
          {saved ? <><CheckCircle size={15} /> Saved</> : <><Save size={15} /> Update Capacity</>}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        Changes will update hospital availability in real-time. Use + / − buttons or type values directly.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {resources.map(r => (
          <CapacityCard
            key={r.label}
            label={r.label}
            icon={r.icon}
            iconColor={r.iconColor}
            total={r.total}
            available={r.available}
            occupied={r.occupied}
            reserved={r.reserved}
            editable
            onUpdate={(field, delta) => {
              if (field === 'available') handleFieldUpdate(r.availField, delta);
              else if (field === 'occupied' && r.occField) handleFieldUpdate(r.occField, delta);
            }}
          />
        ))}
      </div>
    </div>
  );
}
