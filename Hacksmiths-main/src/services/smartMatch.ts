import type { Hospital, Capacity, SmartMatchScore } from '../types';
import type { BedType } from '../types';

interface MatchRequest {
  requiredResource: BedType;
  icuRequired: boolean;
  ventilatorRequired: boolean;
  specialty: string;
  urgency: string;
  maxDistanceKm?: number;
}

export function computeSmartMatch(
  hospital: Hospital,
  capacity: Capacity,
  request: MatchRequest
): SmartMatchScore {
  const breakdown = {
    bedAvailability: 0,
    icuMatch: 0,
    ventilatorMatch: 0,
    specialtyMatch: 0,
    emergencyCapacity: 0,
    distance: 0,
    occupancy: 0,
  };
  const reasons: string[] = [];

  // Bed availability (30 pts)
  const bedMap: Record<BedType, { avail: number; total: number }> = {
    general: { avail: capacity.availableBeds, total: capacity.totalBeds },
    emergency: { avail: capacity.emergencyAvailable, total: capacity.emergencyTotal },
    icu: { avail: capacity.icuAvailable, total: capacity.icuTotal },
    nicu: { avail: capacity.nicuAvailable, total: capacity.nicuTotal },
    ventilator: { avail: capacity.ventilatorAvailable, total: capacity.ventilatorTotal },
    operation_theatre: { avail: capacity.operationTheatreAvailable, total: capacity.operationTheatreTotal },
    isolation: { avail: capacity.isolationAvailable, total: capacity.isolationTotal },
  };
  const bedInfo = bedMap[request.requiredResource];
  if (bedInfo.avail > 0) {
    breakdown.bedAvailability = 30;
    reasons.push(`${request.requiredResource.replace('_', ' ').toUpperCase()} bed available (${bedInfo.avail} free)`);
  } else {
    breakdown.bedAvailability = 0;
  }

  // ICU (20 pts)
  if (request.icuRequired) {
    if (capacity.icuAvailable > 0) {
      breakdown.icuMatch = 20;
      reasons.push(`ICU available (${capacity.icuAvailable} beds)`);
    }
  } else {
    breakdown.icuMatch = 20;
  }

  // Ventilator (15 pts)
  if (request.ventilatorRequired) {
    if (capacity.ventilatorAvailable > 0) {
      breakdown.ventilatorMatch = 15;
      reasons.push(`Ventilator available (${capacity.ventilatorAvailable} units)`);
    }
  } else {
    breakdown.ventilatorMatch = 15;
  }

  // Specialty (15 pts)
  const specialtyMatch = hospital.specialties.some(s =>
    s.toLowerCase().includes(request.specialty.toLowerCase()) ||
    request.specialty.toLowerCase().includes(s.toLowerCase())
  );
  if (specialtyMatch) {
    breakdown.specialtyMatch = 15;
    reasons.push(`${request.specialty} specialist available`);
  } else if (hospital.specialties.length > 3) {
    breakdown.specialtyMatch = 8;
  }

  // Emergency capacity (10 pts)
  if (request.urgency === 'emergency') {
    const emergencyPct = capacity.emergencyAvailable / capacity.emergencyTotal;
    if (emergencyPct > 0.3) { breakdown.emergencyCapacity = 10; reasons.push('Emergency department available'); }
    else if (emergencyPct > 0) { breakdown.emergencyCapacity = 5; }
  } else {
    breakdown.emergencyCapacity = 10;
  }

  // Distance (5 pts)
  const dist = hospital.distance ?? 20;
  if (dist <= 5) { breakdown.distance = 5; reasons.push(`${dist} km away`); }
  else if (dist <= 10) { breakdown.distance = 4; reasons.push(`${dist} km away`); }
  else if (dist <= 20) { breakdown.distance = 3; reasons.push(`${dist} km away`); }
  else { breakdown.distance = 1; }

  // Occupancy (5 pts)
  const occupancyPct = capacity.occupiedBeds / capacity.totalBeds;
  if (occupancyPct < 0.7) { breakdown.occupancy = 5; }
  else if (occupancyPct < 0.85) { breakdown.occupancy = 3; }
  else { breakdown.occupancy = 1; }

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    hospitalId: hospital.id,
    totalScore,
    breakdown,
    reasons,
  };
}

export function rankHospitals(
  hospitals: Hospital[],
  capacities: Record<string, Capacity>,
  request: MatchRequest
): Array<{ hospital: Hospital; capacity: Capacity; score: SmartMatchScore }> {
  return hospitals
    .filter(h => h.status === 'active' && capacities[h.id])
    .map(h => ({
      hospital: h,
      capacity: capacities[h.id],
      score: computeSmartMatch(h, capacities[h.id], request),
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}
