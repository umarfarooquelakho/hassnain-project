import type { Capacity } from '../types';

export function getCapacityStatus(available: number, total: number): {
  label: string; color: string; bg: string; dot: string;
} {
  if (total === 0) return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' };
  const pct = available / total;
  if (pct === 0) return { label: 'FULL', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (pct < 0.1) return { label: 'HIGH DEMAND', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' };
  if (pct < 0.3) return { label: 'LIMITED', color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' };
  return { label: 'AVAILABLE', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' };
}

export function getHospitalStatus(capacity: Capacity) {
  return getCapacityStatus(capacity.availableBeds, capacity.totalBeds);
}

export function getOccupancyPct(capacity: Capacity): number {
  if (capacity.totalBeds === 0) return 0;
  return Math.round((capacity.occupiedBeds / capacity.totalBeds) * 100);
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getReferralStatusConfig(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    searching: { label: 'Searching', color: 'text-blue-600', bg: 'bg-blue-50' },
    sent: { label: 'Sent', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    reviewing: { label: 'Reviewing', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    accepted: { label: 'Accepted', color: 'text-green-600', bg: 'bg-green-50' },
    rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
    transferred: { label: 'Transferred', color: 'text-purple-600', bg: 'bg-purple-50' },
    admitted: { label: 'Admitted', color: 'text-teal-600', bg: 'bg-teal-50' },
    cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100' },
    expired: { label: 'Expired', color: 'text-gray-500', bg: 'bg-gray-100' },
  };
  return map[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
}

export function getUrgencyConfig(urgency: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    routine: { label: 'Routine', color: 'text-green-600', bg: 'bg-green-50' },
    urgent: { label: 'Urgent', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    emergency: { label: 'Emergency', color: 'text-red-600', bg: 'bg-red-50' },
  };
  return map[urgency] || { label: urgency, color: 'text-gray-600', bg: 'bg-gray-100' };
}

export function parseNLPRequest(text: string): {
  icuRequired: boolean; ventilatorRequired: boolean; urgency: string; specialty: string; location: string;
} {
  const lower = text.toLowerCase();
  return {
    icuRequired: lower.includes('icu') || lower.includes('intensive'),
    ventilatorRequired: lower.includes('ventilator') || lower.includes('ventilation'),
    urgency: lower.includes('emergency') ? 'emergency' : lower.includes('urgent') ? 'urgent' : 'routine',
    specialty: lower.includes('cardio') ? 'Cardiology'
      : lower.includes('neuro') ? 'Neurology'
      : lower.includes('ortho') ? 'Orthopedics'
      : lower.includes('pedia') ? 'Pediatrics'
      : lower.includes('emergency') ? 'Emergency'
      : 'General Medicine',
    location: lower.includes('hyderabad') ? 'Hyderabad'
      : lower.includes('bangalore') ? 'Bangalore'
      : lower.includes('mumbai') ? 'Mumbai'
      : 'Hyderabad',
  };
}
