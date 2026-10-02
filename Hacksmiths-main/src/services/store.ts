import type { Hospital, Capacity, User, Referral, Notification, AuditLog } from '../types';
import {
  MOCK_HOSPITALS, MOCK_CAPACITIES, MOCK_USERS,
  MOCK_REFERRALS, MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS
} from '../data/mockData';

const KEYS = {
  hospitals: 'cc_hospitals',
  capacities: 'cc_capacities',
  users: 'cc_users',
  referrals: 'cc_referrals',
  notifications: 'cc_notifications',
  auditLogs: 'cc_audit_logs',
  currentUser: 'cc_current_user',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initStore() {
  if (!localStorage.getItem(KEYS.hospitals)) {
    save(KEYS.hospitals, MOCK_HOSPITALS);
    save(KEYS.capacities, MOCK_CAPACITIES);
    save(KEYS.users, MOCK_USERS);
    save(KEYS.referrals, MOCK_REFERRALS);
    save(KEYS.notifications, MOCK_NOTIFICATIONS);
    save(KEYS.auditLogs, MOCK_AUDIT_LOGS);
  }
}

export function resetStore() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  initStore();
}

// Hospitals
export function getHospitals(): Hospital[] { return load(KEYS.hospitals, MOCK_HOSPITALS); }
export function getHospital(id: string): Hospital | undefined { return getHospitals().find(h => h.id === id); }
export function updateHospital(hospital: Hospital) {
  const hospitals = getHospitals().map(h => h.id === hospital.id ? hospital : h);
  save(KEYS.hospitals, hospitals);
}

// Capacities
export function getCapacities(): Record<string, Capacity> { return load(KEYS.capacities, MOCK_CAPACITIES); }
export function getCapacity(hospitalId: string): Capacity | undefined { return getCapacities()[hospitalId]; }
export function updateCapacity(capacity: Capacity) {
  const capacities = getCapacities();
  capacities[capacity.hospitalId] = { ...capacity, lastUpdated: new Date().toISOString() };
  save(KEYS.capacities, capacities);
}

// Users
export function getUsers(): User[] { return load(KEYS.users, MOCK_USERS); }
export function getUser(id: string): User | undefined { return getUsers().find(u => u.id === id); }
export function updateUser(user: User) {
  const users = getUsers().map(u => u.id === user.id ? user : u);
  save(KEYS.users, users);
}

// Referrals
export function getReferrals(): Referral[] { return load(KEYS.referrals, MOCK_REFERRALS); }
export function getReferral(id: string): Referral | undefined { return getReferrals().find(r => r.id === id); }
export function addReferral(referral: Referral) {
  const referrals = getReferrals();
  referrals.unshift(referral);
  save(KEYS.referrals, referrals);
}
export function updateReferral(referral: Referral) {
  const referrals = getReferrals().map(r => r.id === referral.id ? { ...referral, updatedAt: new Date().toISOString() } : r);
  save(KEYS.referrals, referrals);
}

// Notifications
export function getNotifications(userId?: string): Notification[] {
  const all = load<Notification[]>(KEYS.notifications, MOCK_NOTIFICATIONS);
  return userId ? all.filter(n => n.userId === userId) : all;
}
export function addNotification(n: Notification) {
  const all = load<Notification[]>(KEYS.notifications, MOCK_NOTIFICATIONS);
  all.unshift(n);
  save(KEYS.notifications, all);
}
export function markNotificationRead(id: string) {
  const all = load<Notification[]>(KEYS.notifications, MOCK_NOTIFICATIONS).map(n =>
    n.id === id ? { ...n, read: true } : n
  );
  save(KEYS.notifications, all);
}
export function markAllRead(userId: string) {
  const all = load<Notification[]>(KEYS.notifications, MOCK_NOTIFICATIONS).map(n =>
    n.userId === userId ? { ...n, read: true } : n
  );
  save(KEYS.notifications, all);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] { return load(KEYS.auditLogs, MOCK_AUDIT_LOGS); }
export function addAuditLog(log: AuditLog) {
  const logs = load<AuditLog[]>(KEYS.auditLogs, MOCK_AUDIT_LOGS);
  logs.unshift(log);
  save(KEYS.auditLogs, logs);
}

// Auth
export function getCurrentUser(): User | null { return load(KEYS.currentUser, null); }
export function setCurrentUser(user: User | null) { save(KEYS.currentUser, user); }
export function logout() { localStorage.removeItem(KEYS.currentUser); }
