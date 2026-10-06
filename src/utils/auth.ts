import { UserAccount, UserRole, NurseRole } from '../types/roster';
import { secureSave, secureLoad } from './security';

const AUTH_STORAGE_KEY = 'kauvery_auth_session_v1';
const ACCOUNTS_STORAGE_KEY = 'kauvery_user_accounts_v1';

// Seed Initial Accounts matching Kauvery Hospital Staff
// Super Admin credentials specified by User: Username 116562, Password: 1234567890
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    empNo: '116562',
    password: '1234567890',
    name: 'Super Administrator',
    role: 'super_admin',
    designation: 'Super Admin',
    department: 'Hospital Administration & IT',
    contact: '+91 94440 00001',
  },
  {
    empNo: '110001',
    password: 'head123',
    name: 'Dr. Revathi Ramanathan',
    role: 'nursing_head',
    designation: 'Nursing Head',
    department: 'Directorate of Nursing Services',
    contact: '+91 94432 00002',
  },
  {
    empNo: '129513',
    password: 'sathika@129513',
    name: 'Sathika',
    role: 'in_charge',
    designation: 'Shift In-Charge',
    department: 'Critical Care ICU',
    contact: '+91 94862 77011',
  },
  {
    empNo: '139047',
    password: 'dharani@139047',
    name: 'Dharani',
    role: 'in_charge',
    designation: 'Shift In-Charge',
    department: 'Critical Care ICU',
    contact: '+91 98433 99014',
  },
  {
    empNo: '119930',
    password: 'priyanka@119930',
    name: 'Priyanka',
    role: 'in_charge',
    designation: 'Shift In-Charge',
    department: 'Critical Care ICU',
    contact: '+91 98840 91823',
  },
  {
    empNo: '139510',
    password: 'sandhiya@139510',
    name: 'Sandhiya',
    role: 'nurse',
    designation: 'Senior Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 94421 88201',
  },
  {
    empNo: '134333',
    password: 'sridevi@134333',
    name: 'Sridevi',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 98422 11902',
  },
  {
    empNo: '135798',
    password: 'janani@135798',
    name: 'Janani',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 97901 33412',
  },
  {
    empNo: '139326',
    password: 'bhuvana@139326',
    name: 'Bhuvana',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 96291 44521',
  },
  {
    empNo: '143327',
    password: 'surya@143327',
    name: 'Surya',
    role: 'nurse',
    designation: 'Trainee Nurse',
    department: 'Critical Care ICU',
    contact: '+91 82201 19934',
  },
  {
    empNo: '141303',
    password: 'archana@141303',
    name: 'Archana',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 90031 22894',
  },
  {
    empNo: '141309',
    password: 'vanitha@141309',
    name: 'Vanitha',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 99441 55672',
  },
  {
    empNo: '143228',
    password: 'subashini@143228',
    name: 'Subashini',
    role: 'nurse',
    designation: 'Trainee Nurse',
    department: 'Critical Care ICU',
    contact: '+91 75981 00213',
  },
  {
    empNo: '142881',
    password: 'swathy@142881',
    name: 'Swathy',
    role: 'nurse',
    designation: 'Staff Nurse',
    department: 'Critical Care ICU',
    contact: '+91 97891 66209',
  },
  {
    empNo: '140011',
    password: 'karsini@140011',
    name: 'Karsini',
    role: 'nurse',
    designation: 'Trainee Nurse',
    department: 'Critical Care ICU',
    contact: '+91 80561 33419',
  },
];

export function getUserAccounts(): UserAccount[] {
  const loaded = secureLoad<UserAccount[]>(ACCOUNTS_STORAGE_KEY, INITIAL_USER_ACCOUNTS);
  return (loaded || INITIAL_USER_ACCOUNTS).map((acc) => {
    if ((acc.designation as string) === 'Nursing Superintendent' || acc.role === 'admin') {
      return { ...acc, role: 'in_charge', designation: 'Shift In-Charge' };
    }
    return acc;
  });
}

export function saveUserAccounts(accounts: UserAccount[]): void {
  secureSave(ACCOUNTS_STORAGE_KEY, accounts);
}

export function authenticateUser(empNo: string, password: string): UserAccount | null {
  const accounts = getUserAccounts();
  const cleanedEmpNo = empNo.trim();
  const cleanedPassword = password.trim();

  const found = accounts.find(
    (acc) => acc.empNo === cleanedEmpNo && acc.password === cleanedPassword
  );

  if (found) {
    const updated = { ...found, lastLogin: new Date().toISOString() };
    saveSession(updated);
    return updated;
  }
  return null;
}

export function getActiveSession(): UserAccount | null {
  return secureLoad<UserAccount | null>(AUTH_STORAGE_KEY, null);
}

export function saveSession(user: UserAccount): void {
  secureSave(AUTH_STORAGE_KEY, user);
}

export function logoutSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
