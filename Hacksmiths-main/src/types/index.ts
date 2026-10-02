export type UserRole = 'patient' | 'emergency' | 'hospital' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive: string;
  hospitalId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  specialties: string[];
  contact: string;
  email: string;
  rating: number;
  createdAt: string;
  distance?: number;
  travelTime?: number;
}

export interface Capacity {
  id: string;
  hospitalId: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  icuTotal: number;
  icuAvailable: number;
  nicuTotal: number;
  nicuAvailable: number;
  emergencyTotal: number;
  emergencyAvailable: number;
  ventilatorTotal: number;
  ventilatorAvailable: number;
  operationTheatreTotal: number;
  operationTheatreAvailable: number;
  ambulanceTotal: number;
  ambulanceAvailable: number;
  isolationTotal: number;
  isolationAvailable: number;
  lastUpdated: string;
  lastUpdatedBy: string;
}

export type ReferralStatus = 'searching' | 'sent' | 'reviewing' | 'accepted' | 'rejected' | 'transferred' | 'admitted' | 'cancelled' | 'expired';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';
export type BedType = 'general' | 'emergency' | 'icu' | 'nicu' | 'ventilator' | 'operation_theatre' | 'isolation';

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  hospitalId: string;
  hospitalName: string;
  coordinatorId?: string;
  requiredResource: BedType;
  specialty: string;
  urgency: UrgencyLevel;
  icuRequired: boolean;
  ventilatorRequired: boolean;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  estimatedTravelTime?: number;
  notes?: string;
  currentLocation?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'referral_accepted' | 'referral_rejected' | 'capacity_changed' | 'transfer_update' | 'emergency_alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referralId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  hospitalName?: string;
}

export interface SmartMatchScore {
  hospitalId: string;
  totalScore: number;
  breakdown: {
    bedAvailability: number;
    icuMatch: number;
    ventilatorMatch: number;
    specialtyMatch: number;
    emergencyCapacity: number;
    distance: number;
    occupancy: number;
  };
  reasons: string[];
}

export interface AnalyticsData {
  date: string;
  totalBeds: number;
  availableBeds: number;
  icuAvailable: number;
  emergencyAvailable: number;
  referrals: number;
  accepted: number;
  occupancyRate: number;
}
