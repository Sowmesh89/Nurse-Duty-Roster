export type ShiftCode = 
  | 'M'    // Morning (07:00 - 15:30)
  | 'E'    // Evening (13:30 - 21:30)
  | 'N'    // Night (21:00 - 07:30)
  | 'OFF'  // Scheduled Weekly Off
  | 'L'    // General Leave
  | 'CL'   // Casual Leave
  | 'SL'   // Sick Leave
  | 'CO'   // Compensatory Off
  | 'CNE'  // Continuing Nursing Education / Training
  | 'DD'   // Double Duty
  | 'PI'   // Pull-In (from other ward)
  | 'PO'   // Pull-Out (to other ward)
  | 'EL'   // Earned Leave / LWP
  | 'ML'   // Maternity Leave
  | 'A';   // Absent without intimation

export type NurseRole = 
  | 'Super Admin'
  | 'Nursing Head'
  | 'Shift In-Charge'
  | 'Senior Staff Nurse'
  | 'Staff Nurse'
  | 'Trainee Nurse'
  | string;

export interface MasterNurseRole {
  id: string;
  name: string;
  shortCode: string;
  category: 'Executive' | 'Supervisory' | 'Senior Staff' | 'Staff' | 'Trainee' | 'Specialist';
  minExperienceYears: number;
  description: string;
  responsibilities: string;
  payBand?: string;
  isSystem?: boolean;
  active: boolean;
}

export interface MasterShiftCode {
  code: string;
  label: string;
  category: 'duty' | 'leave' | 'off' | 'education' | 'special';
  startTime: string;
  endTime: string;
  durationHours: number;
  colorKey: 'teal' | 'amber' | 'indigo' | 'emerald' | 'rose' | 'purple' | 'sky' | 'orange' | 'fuchsia' | 'pink' | 'slate' | 'red';
  bgClass: string;
  textClass: string;
  borderClass: string;
  countsTowardsManpower: boolean;
  description: string;
  isSystem?: boolean;
  active: boolean;
}

export interface Nurse {
  id: string; // Employee ID e.g. "139510"
  name: string;
  role: NurseRole;
  department: string;
  wardId: string; // e.g. "icu", "er", "imcu", "gen", "male_gen", "female_gen", "single", "duplex"
  contact: string;
  email: string;
  experienceYears: number;
  mentorId?: string;
  isTrainee: boolean;
  cneCertified: boolean;
  skills: string[];
}

export interface Ward {
  id: string; // slug e.g. "er", "icu", "imcu", "gen", "male_gen", "female_gen", "single", "duplex"
  name: string;
  shortCode: string;
  totalBeds: number;
  minMorningStaff: number;
  minEveningStaff: number;
  minNightStaff: number;
  inChargeEmpId: string;
  inChargeName: string;
  color: string;
  description: string;
}

export interface WardActivity {
  id: string;
  wardId: string;
  wardName: string;
  timestamp: string;
  date: number;
  loggedBy: string;
  role: string;
  category: 'Shift Handover' | 'Staff Redeployment' | 'Clinical Emergency' | 'Task Audit' | 'Leave/Cover';
  title: string;
  description: string;
  severity: 'normal' | 'priority' | 'urgent';
  verifiedByHead?: boolean;
}

export interface DayShiftPlan {
  shift: ShiftCode;
  notes?: string;
  isLocked?: boolean;
}

// Maps nurseId -> dateNumber (1..31) -> DayShiftPlan
export type RosterMatrix = Record<string, Record<number, DayShiftPlan>>;

export interface DailyManpowerRecord {
  date: number; // 1..31
  month: string; // "Sep-Oct 2026"
  totalNursesForUnit: number;
  traineeCount: number;
  inChargeSupCount: number;
  shiftOccupancy: {
    M: number;
    E: number;
    N: number;
  };
  totalNursesPlanned: {
    M: number;
    E: number;
    N: number;
  };
  pullIn: {
    M: number;
    E: number;
    N: number;
  };
  pullOut: {
    M: number;
    E: number;
    N: number;
  };
  doubleDuty: number;
  offCount: number;
  slCount: number;
  clCount: number;
  compOffCount: number;
  matLevCount: number;
  lwpElCount: number;
  absentCount: number;
  remarks: string;
  department: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDate: number;
  requesterShift: ShiftCode;
  targetNurseId: string;
  targetNurseName: string;
  targetDate: number;
  targetShift: ShiftCode;
  reason: string;
  isUrgent: boolean;
  status: 'pending_peer' | 'pending_supervisor' | 'approved' | 'rejected';
  createdAt: string;
  supervisorNotes?: string;
}

export interface LeaveRequest {
  id: string;
  nurseId: string;
  nurseName: string;
  leaveType: 'CL' | 'SL' | 'CO' | 'EL' | 'CNE' | 'ML';
  startDate: number;
  endDate: number;
  reason: string;
  status: 'auto_approved' | 'supervisor_review' | 'rejected';
  autoApprovalScore: number;
  autoApprovalReason: string;
  appliedDate: string;
}

export interface AttendanceRecord {
  nurseId: string;
  date: number;
  shift: ShiftCode;
  clockInTime: string;
  status: 'on_time' | 'late' | 'double_duty' | 'absent' | 'excused';
  tasksCompleted: number;
  tasksTotal: number;
  handoverDone: boolean;
}

export interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  channel: 'icu_general' | 'shift_handovers' | 'urgent_swaps';
  content: string;
  timestamp: string;
  urgent?: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'shift_reminder' | 'swap_alert' | 'leave_status' | 'emergency';
  read: boolean;
  linkTab?: string;
}

export type UserRole = 'nurse' | 'in_charge' | 'admin' | 'nursing_head' | 'super_admin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  empId: string;
  department: string;
}

export interface UserAccount {
  empNo: string;
  password: string;
  name: string;
  role: UserRole;
  designation: NurseRole;
  department: string;
  contact?: string;
  lastLogin?: string;
}
