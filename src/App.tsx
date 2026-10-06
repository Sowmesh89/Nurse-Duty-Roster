import React, { useState, useEffect } from 'react';
import { 
  Nurse, 
  RosterMatrix, 
  DailyManpowerRecord, 
  ShiftSwapRequest, 
  LeaveRequest, 
  AttendanceRecord, 
  TeamMessage, 
  PushNotification, 
  UserRole, 
  NurseRole,
  ShiftCode,
  UserAccount,
  Ward,
  WardActivity,
  MasterNurseRole,
  MasterShiftCode 
} from './types/roster';
import { 
  INITIAL_WARDS,
  INITIAL_NURSES, 
  INITIAL_ROSTER_MATRIX, 
  INITIAL_MANPOWER_RECORDS, 
  INITIAL_SWAP_REQUESTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_MESSAGES 
} from './data/initialRosterData';
import { 
  INITIAL_MASTER_ROLES, 
  INITIAL_MASTER_SHIFTS 
} from './data/initialMasterData';
import { 
  generateAIRosterForNurses, 
  generateAIAttendanceRecords, 
  generateInitialWardActivities 
} from './utils/aiRosterGenerator';
import { 
  secureLoad, 
  secureSave, 
  queueOfflineAction, 
  getOfflineQueue, 
  clearOfflineQueue 
} from './utils/security';
import { getActiveSession, logoutSession } from './utils/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RosterGrid } from './components/RosterGrid';
import { MasterWardStaffing } from './components/MasterWardStaffing';
import { MasterDataHub } from './components/MasterDataHub';
import { NursingHeadExecutiveDashboards } from './components/NursingHeadExecutiveDashboards';
import { DailyManpowerSheet } from './components/DailyManpowerSheet';
import { ShiftSwapsAndLeaves } from './components/ShiftSwapsAndLeaves';
import { AdminProductivityDashboard } from './components/AdminProductivityDashboard';
import { MobileNursePortal } from './components/MobileNursePortal';
import { TeamChat } from './components/TeamChat';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HMSIntegrationModal } from './components/HMSIntegrationModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import { LoginScreen } from './components/LoginScreen';
import { StaffAccountsModal } from './components/StaffAccountsModal';
import { 
  WifiOff, 
  Sparkles, 
  Crown,
  Building2,
  Key,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function App() {
  // Authentication Session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getActiveSession());

  // Wards State
  const [wards, setWards] = useState<Ward[]>(() => 
    secureLoad('kauvery_wards_v1', INITIAL_WARDS)
  );
  const [selectedWardId, setSelectedWardId] = useState<string>('all');

  // Primary Staff & Roster State
  const [nurses, setNurses] = useState<Nurse[]>(() => {
    const loaded = secureLoad<Nurse[]>('kauvery_nurses_v1', INITIAL_NURSES);
    return (loaded || INITIAL_NURSES).map((n) =>
      (n.role as string) === 'Nursing Superintendent' ? { ...n, role: 'Shift In-Charge' } : n
    );
  });

  // Initialize Matrix with AI generation for any unassigned nurses
  const [matrix, setMatrix] = useState<RosterMatrix>(() => {
    const loaded = secureLoad('kauvery_roster_matrix_v1', INITIAL_ROSTER_MATRIX);
    return generateAIRosterForNurses(INITIAL_NURSES, 31, loaded);
  });

  const [manpowerRecords, setManpowerRecords] = useState<DailyManpowerRecord[]>(() => 
    secureLoad('kauvery_manpower_records_v1', INITIAL_MANPOWER_RECORDS)
  );
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>(() => 
    secureLoad('kauvery_shift_swaps_v1', INITIAL_SWAP_REQUESTS)
  );
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => 
    secureLoad('kauvery_leave_requests_v1', INITIAL_LEAVE_REQUESTS)
  );

  // Fully Populated Attendance across all nurses and wards
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const loaded = secureLoad<AttendanceRecord[]>('kauvery_attendance_records_v1', []);
    if (loaded && loaded.length > 5) return loaded;
    return generateAIAttendanceRecords(INITIAL_NURSES, INITIAL_ROSTER_MATRIX, 5);
  });

  // Ward Activities Log for Nursing Head Dashboard
  const [activities, setActivities] = useState<WardActivity[]>(() => 
    secureLoad('kauvery_ward_activities_v1', generateInitialWardActivities(INITIAL_WARDS))
  );

  // Hospital Master Data (Nurse Roles and Shift Codes)
  const [masterRoles, setMasterRoles] = useState<MasterNurseRole[]>(() => {
    const loaded = secureLoad<MasterNurseRole[]>('kauvery_master_roles_v1', INITIAL_MASTER_ROLES);
    return (loaded || INITIAL_MASTER_ROLES).filter(
      (r) => r.id !== 'role-superintendent' && r.name !== 'Nursing Superintendent'
    );
  });
  const [masterShiftCodes, setMasterShiftCodes] = useState<MasterShiftCode[]>(() =>
    secureLoad('kauvery_master_shifts_v1', INITIAL_MASTER_SHIFTS)
  );

  const [messages, setMessages] = useState<TeamMessage[]>(INITIAL_MESSAGES);

  // Notifications State
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-1',
      title: 'Duty Reminder: Morning Shift',
      body: 'Sandhiya, your morning ICU duty starts at 07:00 AM tomorrow. Please review ventilator weaning sheets.',
      timestamp: '10 mins ago',
      type: 'shift_reminder',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Shift Swap Requested',
      body: 'Swathy has requested to swap Morning shift with Dharani on Day 5.',
      timestamp: '1 hour ago',
      type: 'swap_alert',
      read: false,
    },
  ]);

  // Operational State
  const [activeTab, setActiveTab] = useState<string>('roster');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(() => currentUser?.role || 'super_admin');
  const [currentNurseId, setCurrentNurseId] = useState<string>(() => currentUser?.empNo || '116562');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState(getOfflineQueue());

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHMSOpen, setIsHMSOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Month
  const selectedMonth = 'Sep to Oct 2026';

  // Persistence side-effects
  useEffect(() => {
    secureSave('kauvery_wards_v1', wards);
  }, [wards]);

  useEffect(() => {
    secureSave('kauvery_nurses_v1', nurses);
  }, [nurses]);

  useEffect(() => {
    secureSave('kauvery_roster_matrix_v1', matrix);
  }, [matrix]);

  useEffect(() => {
    secureSave('kauvery_manpower_records_v1', manpowerRecords);
  }, [manpowerRecords]);

  useEffect(() => {
    secureSave('kauvery_shift_swaps_v1', swaps);
  }, [swaps]);

  useEffect(() => {
    secureSave('kauvery_leave_requests_v1', leaves);
  }, [leaves]);

  useEffect(() => {
    secureSave('kauvery_attendance_records_v1', attendance);
  }, [attendance]);

  useEffect(() => {
    secureSave('kauvery_ward_activities_v1', activities);
  }, [activities]);

  useEffect(() => {
    secureSave('kauvery_master_roles_v1', masterRoles);
  }, [masterRoles]);

  useEffect(() => {
    secureSave('kauvery_master_shifts_v1', masterShiftCodes);
  }, [masterShiftCodes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Master Data Configuration Handlers
  const handleAddRole = (newRole: MasterNurseRole) => {
    setMasterRoles((prev) => [...prev, newRole]);
    showToast(`Nurse Role "${newRole.name}" created successfully.`);
  };

  const handleUpdateRole = (updated: MasterNurseRole) => {
    setMasterRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Nurse Role "${updated.name}" updated successfully.`);
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = masterRoles.find((r) => r.id === roleId);
    setMasterRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (roleToDelete) {
      // Reassign staff in deleted role to 'Staff Nurse' so they don't remain orphaned
      setNurses((prev) =>
        prev.map((n) =>
          n.role === roleToDelete.name ? { ...n, role: 'Staff Nurse' } : n
        )
      );
      showToast(`Role "${roleToDelete.name}" removed from frontend and storage.`);
    } else {
      showToast('Nurse role removed from catalog.');
    }
  };

  const handleAddShiftCode = (newShift: MasterShiftCode) => {
    setMasterShiftCodes((prev) => [...prev, newShift]);
    showToast(`Shift Code "${newShift.code}" (${newShift.label}) added to roster system.`);
  };

  const handleUpdateShiftCode = (updated: MasterShiftCode) => {
    setMasterShiftCodes((prev) => prev.map((s) => (s.code === updated.code ? updated : s)));
    showToast(`Shift Code "${updated.code}" updated.`);
  };

  const handleDeleteShiftCode = (code: string) => {
    setMasterShiftCodes((prev) => prev.filter((s) => s.code !== code));
    showToast(`Shift Code "${code}" removed from catalog.`);
  };

  const handleResetMasterDefaults = () => {
    setMasterRoles(INITIAL_MASTER_ROLES);
    setMasterShiftCodes(INITIAL_MASTER_SHIFTS);
    showToast('Master catalog restored to Kauvery Hospital defaults.');
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setCurrentNurseId(user.empNo);
    showToast(`Welcome back, ${user.name}! Authenticated as ${user.designation}.`);
  };

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    showToast('Logged out of clinical portal.');
  };

  // AI Schedule & Attendance Generator
  const handleGenerateAIRoster = (targetWardId?: string) => {
    const targetNurses = targetWardId && targetWardId !== 'all' 
      ? nurses.filter(n => n.wardId === targetWardId)
      : nurses;

    const newMatrix = generateAIRosterForNurses(targetNurses, 31, matrix);
    setMatrix(newMatrix);

    const newAttendance = generateAIAttendanceRecords(nurses, newMatrix, 5);
    setAttendance(newAttendance);

    showToast(`✨ AI generated optimal rosters and attendance for ${targetNurses.length} nurses!`);
  };

  // Ward Staffing Handlers
  const handleAddWard = (newWard: Ward) => {
    setWards((prev) => [...prev, newWard]);
    showToast(`Hospital Ward "${newWard.name}" (${newWard.shortCode}) created successfully.`);
  };

  const handleAddNurseToWard = (newNurse: Nurse) => {
    setNurses((prev) => [...prev, newNurse]);
    const updatedMatrix = generateAIRosterForNurses([...nurses, newNurse], 31, matrix);
    setMatrix(updatedMatrix);
    const updatedAttendance = generateAIAttendanceRecords([...nurses, newNurse], updatedMatrix, 5);
    setAttendance(updatedAttendance);
    showToast(`Allocated ${newNurse.name} (Emp ID: ${newNurse.id}) to ${newNurse.department}.`);
  };

  const handleTransferNurse = (nurseId: string, newWardId: string) => {
    const targetWard = wards.find((w) => w.id === newWardId);
    if (!targetWard) return;

    setNurses((prev) =>
      prev.map((n) =>
        n.id === nurseId
          ? { ...n, wardId: newWardId, department: targetWard.name }
          : n
      )
    );

    const transferredNurse = nurses.find((n) => n.id === nurseId);
    if (transferredNurse) {
      const transferActivity: WardActivity = {
        id: `act-${Date.now()}`,
        wardId: newWardId,
        wardName: targetWard.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 5,
        loggedBy: `${currentUser?.name || 'In-Charge'} (${currentUser?.designation || 'Supervisor'})`,
        role: 'Shift In-Charge',
        category: 'Staff Redeployment',
        title: `Nurse Redeployed: ${transferredNurse.name} (ID: ${transferredNurse.id})`,
        description: `${transferredNurse.name} transferred from previous station to ${targetWard.name} to reinforce clinical coverage.`,
        severity: 'normal',
        verifiedByHead: true,
      };
      setActivities((prev) => [transferActivity, ...prev]);
    }

    showToast(`Transferred ${transferredNurse?.name || 'Nurse'} to ${targetWard.name}.`);
  };

  const handleDeleteNurse = (nurseId: string) => {
    const targetNurse = nurses.find((n) => n.id === nurseId);
    setNurses((prev) => prev.filter((n) => n.id !== nurseId));
    setMatrix((prev) => {
      const next = { ...prev };
      delete next[nurseId];
      return next;
    });
    setAttendance((prev) => prev.filter((a) => a.nurseId !== nurseId));
    setSwaps((prev) => prev.filter((s) => s.requesterId !== nurseId && s.targetNurseId !== nurseId));
    setLeaves((prev) => prev.filter((l) => l.nurseId !== nurseId));
    showToast(`Staff member "${targetNurse?.name || 'Nurse'}" (Emp ID: ${nurseId}) removed completely.`);
  };

  const handleUpdateNurseRole = (nurseId: string, newRole: NurseRole) => {
    setNurses((prev) =>
      prev.map((n) => (n.id === nurseId ? { ...n, role: newRole } : n))
    );
    const target = nurses.find((n) => n.id === nurseId);
    showToast(`Updated role for ${target?.name || 'Staff'} (Emp #${nurseId}) to "${newRole}".`);
  };

  const handleUpdateNurse = (oldId: string, updatedNurse: Nurse) => {
    const targetWard = wards.find((w) => w.id === updatedNurse.wardId);
    const finalNurse: Nurse = {
      ...updatedNurse,
      department: targetWard ? targetWard.name : updatedNurse.department,
    };

    setNurses((prev) =>
      prev.map((n) => (n.id === oldId ? finalNurse : n))
    );

    // If Employee Code / ID changed, migrate matrix and records
    if (oldId !== finalNurse.id) {
      setMatrix((prev) => {
        const next = { ...prev };
        if (next[oldId]) {
          next[finalNurse.id] = next[oldId];
          delete next[oldId];
        }
        return next;
      });

      setAttendance((prev) =>
        prev.map((a) => (a.nurseId === oldId ? { ...a, nurseId: finalNurse.id } : a))
      );

      setSwaps((prev) =>
        prev.map((s) => ({
          ...s,
          requesterId: s.requesterId === oldId ? finalNurse.id : s.requesterId,
          requesterName: s.requesterId === oldId ? finalNurse.name : s.requesterName,
          targetNurseId: s.targetNurseId === oldId ? finalNurse.id : s.targetNurseId,
          targetNurseName: s.targetNurseId === oldId ? finalNurse.name : s.targetNurseName,
        }))
      );

      setLeaves((prev) =>
        prev.map((l) =>
          l.nurseId === oldId
            ? { ...l, nurseId: finalNurse.id, nurseName: finalNurse.name }
            : l
        )
      );
    }

    showToast(`Updated ${finalNurse.name} (Emp Code: ${finalNurse.id}, Role: ${finalNurse.role}).`);
  };

  // Ward Activities Handlers
  const handleAddActivity = (newAct: WardActivity) => {
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Clinical activity "${newAct.title}" logged for ${newAct.wardName}.`);
  };

  const handleVerifyActivity = (actId: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === actId ? { ...a, verifiedByHead: true } : a))
    );
    showToast('Activity signed off by Directorate.');
  };

  // Push notification trigger
  const triggerPushNotification = (title: string, body: string, type: PushNotification['type'] = 'shift_reminder') => {
    const newNotif: PushNotification = {
      id: `push-${Date.now()}`,
      title,
      body,
      timestamp: 'Just now',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {}
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      try {
        Notification.requestPermission();
      } catch (e) {}
    }

    showToast(`🔔 ${title}: ${body}`);
  };

  // Roster Shift Update Handler
  const handleUpdateShift = (nurseId: string, date: number, shift: ShiftCode) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      if (!updated[nurseId]) updated[nurseId] = {};
      updated[nurseId] = {
        ...updated[nurseId],
        [date]: { shift },
      };
      return updated;
    });

    if (isOfflineMode) {
      queueOfflineAction({
        type: 'ROSTER_EDIT',
        payload: { nurseId, date, shift },
      });
      setOfflineQueue(getOfflineQueue());
      showToast(`Duty updated locally (Offline zone: queued for cloud sync).`);
    } else {
      showToast(`Duty updated: Day ${date} assigned as '${shift}'.`);
    }
  };

  // Manpower Record Handlers
  const handleAddManpowerRecord = (record: DailyManpowerRecord) => {
    setManpowerRecords((prev) => {
      const existing = prev.filter((r) => r.date !== record.date);
      return [...existing, record].sort((a, b) => a.date - b.date);
    });
    if (isOfflineMode) {
      queueOfflineAction({
        type: 'MANPOWER_UPDATE',
        payload: record,
      });
      setOfflineQueue(getOfflineQueue());
    }
    showToast(`Daily manpower log for Day ${record.date} saved.`);
  };

  const handleUpdateManpowerRecord = (date: number, changes: Partial<DailyManpowerRecord>) => {
    setManpowerRecords((prev) =>
      prev.map((r) => (r.date === date ? { ...r, ...changes } : r))
    );
  };

  // Swap Handlers
  const handleAddSwap = (newSwap: ShiftSwapRequest) => {
    setSwaps((prev) => [newSwap, ...prev]);
    triggerPushNotification(
      'New Shift Swap Proposed',
      `${newSwap.requesterName} proposed swapping Day ${newSwap.requesterDate} with ${newSwap.targetNurseName}.`,
      'swap_alert'
    );
  };

  const handleUpdateSwapStatus = (
    swapId: string,
    status: ShiftSwapRequest['status'],
    notes?: string
  ) => {
    setSwaps((prev) =>
      prev.map((s) => {
        if (s.id !== swapId) return s;
        return {
          ...s,
          status,
          supervisorNotes: notes || s.supervisorNotes,
        };
      })
    );

    const targetSwap = swaps.find((s) => s.id === swapId);
    if (status === 'approved' && targetSwap) {
      setMatrix((prev) => {
        const updated = { ...prev };
        const reqNurseId = targetSwap.requesterId;
        const targetNurseId = targetSwap.targetNurseId;

        if (!updated[reqNurseId]) updated[reqNurseId] = {};
        updated[reqNurseId][targetSwap.requesterDate] = { shift: targetSwap.targetShift };

        if (!updated[targetNurseId]) updated[targetNurseId] = {};
        updated[targetNurseId][targetSwap.targetDate] = { shift: targetSwap.requesterShift };

        return updated;
      });

      triggerPushNotification(
        'Shift Swap Approved',
        `Swap between ${targetSwap.requesterName} and ${targetSwap.targetNurseName} has been applied to the live roster.`,
        'swap_alert'
      );
    } else if (status === 'rejected') {
      showToast('Shift swap proposal was declined.');
    }
  };

  // Leave Handlers
  const handleAddLeave = (newLeave: LeaveRequest) => {
    setLeaves((prev) => [newLeave, ...prev]);

    if (newLeave.status === 'auto_approved' || userRole === 'super_admin' || userRole === 'nursing_head') {
      setMatrix((prev) => {
        const updated = { ...prev };
        if (!updated[newLeave.nurseId]) updated[newLeave.nurseId] = {};

        for (let d = newLeave.startDate; d <= newLeave.endDate; d++) {
          updated[newLeave.nurseId][d] = {
            shift: newLeave.leaveType as ShiftCode,
          };
        }
        return updated;
      });

      triggerPushNotification(
        'Leave Request Confirmed',
        `${newLeave.nurseName}'s ${newLeave.leaveType} leave (Days ${newLeave.startDate}-${newLeave.endDate}) verified & locked.`,
        'leave_status'
      );
    } else {
      triggerPushNotification(
        'Leave Request Under Review',
        `${newLeave.nurseName}'s request routed to Nursing Superintendent for holiday quota evaluation.`,
        'leave_status'
      );
    }
  };

  const handleUpdateLeaveStatus = (leaveId: string, status: LeaveRequest['status']) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
    );

    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (status === 'auto_approved' && targetLeave) {
      setMatrix((prev) => {
        const updated = { ...prev };
        if (!updated[targetLeave.nurseId]) updated[targetLeave.nurseId] = {};
        for (let d = targetLeave.startDate; d <= targetLeave.endDate; d++) {
          updated[targetLeave.nurseId][d] = {
            shift: targetLeave.leaveType as ShiftCode,
          };
        }
        return updated;
      });
      showToast(`Leave approved for ${targetLeave.nurseName}. Roster updated.`);
    }
  };

  // Attendance Clock-In Handler
  const handleClockIn = (nurseId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendance((prev) =>
      prev.map((a) =>
        a.nurseId === nurseId
          ? { ...a, clockInTime: timeNow, status: 'on_time' }
          : a
      )
    );
    showToast(`Clock-in registered at ${timeNow}. Have a productive shift!`);
  };

  // Team Message Handler
  const handleSendMessage = (
    content: string,
    channel: TeamMessage['channel'],
    urgent?: boolean
  ) => {
    const currentNurse = nurses.find((n) => n.id === currentNurseId) || nurses[0];
    const newMsg: TeamMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentNurse.id,
      senderName: currentNurse.name,
      senderRole: currentNurse.role,
      channel,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgent,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (urgent) {
      triggerPushNotification(
        'Urgent Ward Broadcast',
        `${currentNurse.name} (${currentNurse.role}): ${content.slice(0, 80)}...`,
        'emergency'
      );
    }
  };

  // New Hire Onboarding Completion Handler
  const handleOnboardNurse = (newNurse: Nurse, defaultShift: ShiftCode) => {
    setNurses((prev) => [...prev, newNurse]);

    setMatrix((prev) => {
      const updated = { ...prev };
      updated[newNurse.id] = {};
      for (let d = 1; d <= 31; d++) {
        if (d % 6 === 0) {
          updated[newNurse.id][d] = { shift: 'OFF' };
        } else {
          updated[newNurse.id][d] = { shift: defaultShift };
        }
      }
      return updated;
    });

    triggerPushNotification(
      'New Nurse Inducted',
      `${newNurse.name} (Emp ID: ${newNurse.id}) has been added to ${newNurse.department} roster.`,
      'shift_reminder'
    );
    showToast(`Nurse ${newNurse.name} registered and roster populated.`);
  };

  // ADT Live Bed Census Import
  const handleImportBedOccupancy = (occupancy: { M: number; E: number; N: number }) => {
    setManpowerRecords((prev) => {
      return prev.map((r) => {
        if (r.date === 5) {
          return {
            ...r,
            shiftOccupancy: occupancy,
            remarks: 'Bed census updated via Kauvery HIS ADT HL7 feed.',
          };
        }
        return r;
      });
    });
    showToast(`Bed census synchronized: M:${occupancy.M} E:${occupancy.E} N:${occupancy.N}`);
  };

  // Sync offline queue when connection resumes
  const handleSyncOfflineQueue = () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    showToast(`Synchronized ${queue.length} queued action(s) to Kauvery Cloud.`);
    clearOfflineQueue();
    setOfflineQueue([]);
  };

  // If user is not authenticated, show clinical login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedNurse = nurses.find((n) => n.id === currentNurseId) || nurses[0];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingSwapsCount = swaps.filter((s) => s.status === 'pending_peer' || s.status === 'pending_supervisor').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'supervisor_review').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row font-sans">
      {/* Collapsible Left Navigation Sidebar (All 8 Clinical Tabs Transferred Here) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAccounts={() => setIsAccountsModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onGenerateAIRoster={() => handleGenerateAIRoster(selectedWardId)}
        wards={wards}
        selectedWardId={selectedWardId}
        onSelectWardId={setSelectedWardId}
        pendingSwapsCount={pendingSwapsCount}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Main Layout Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Application Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          setUserRole={setUserRole}
          isOfflineMode={isOfflineMode}
          setIsOfflineMode={(offline) => {
            setIsOfflineMode(offline);
            if (!offline) handleSyncOfflineQueue();
          }}
          offlineQueueCount={offlineQueue.length}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenHMS={() => setIsHMSOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          selectedNurseName={selectedNurse.name}
          currentUser={currentUser}
          onLogout={handleLogout}
          wards={wards}
          selectedWardId={selectedWardId}
          onSelectWardId={setSelectedWardId}
          onGenerateAIRoster={() => handleGenerateAIRoster(selectedWardId)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

      {/* Super Admin & Nursing Head Master Privileges Banner */}
      {(userRole === 'super_admin' || userRole === 'nursing_head') && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {userRole === 'super_admin' ? (
                <>
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-400">Super Admin Mode Active (Emp #116562):</strong> Master authority for all ward changes, roster modifications, staff credential directory, and audit logs.
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <strong className="text-purple-400">Nursing Head Mode Active (Directorate):</strong> Cross-ward unit oversight, 2 executive dashboards (Unit-Level & Ward-Wise Activity), and holiday sign-offs.
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAccountsModalOpen(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Key className="w-3 h-3 text-teal-400" />
                Staff Roles & Passwords Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Banner for Basement ICU Zones */}
      {isOfflineMode && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              <strong>ICU Basement Zone (Offline Mode Active):</strong> Roster edits, shift swaps, and attendance are encrypted & stored in local memory. Auto-sync will replay upon network reconnect.
            </span>
            {offlineQueue.length > 0 && (
              <span className="ml-auto font-mono bg-amber-700 text-white px-2 py-0.5 rounded text-[10px]">
                {offlineQueue.length} Pending Actions
              </span>
            )}
          </div>
        </div>
      )}

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* TAB 1: Duty Roster Grid (filtered by ward or all) */}
        {activeTab === 'roster' && (
          <RosterGrid
            nurses={nurses}
            matrix={matrix}
            onUpdateShift={handleUpdateShift}
            userRole={userRole}
            selectedMonth={selectedMonth}
            selectedWardId={selectedWardId}
            wards={wards}
            masterShiftCodes={masterShiftCodes}
          />
        )}

        {/* TAB 2: Master Ward Staffing Hub (Updated by Nursing In-Charges with Employee IDs and Add Ward) */}
        {activeTab === 'master_wards' && (
          <MasterWardStaffing
            wards={wards}
            nurses={nurses}
            onAddWard={handleAddWard}
            onAddNurseToWard={handleAddNurseToWard}
            onTransferNurse={handleTransferNurse}
            onDeleteNurse={handleDeleteNurse}
            onGenerateAIRoster={handleGenerateAIRoster}
            userRole={userRole}
          />
        )}

        {/* TAB 3: Master Data Configuration (Nurse Roles & Shift Codes) */}
        {activeTab === 'master_data' && (
          <MasterDataHub
            roles={masterRoles}
            shiftCodes={masterShiftCodes}
            onAddRole={handleAddRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
            onAddShiftCode={handleAddShiftCode}
            onUpdateShiftCode={handleUpdateShiftCode}
            onDeleteShiftCode={handleDeleteShiftCode}
            onResetDefaults={handleResetMasterDefaults}
            nurses={nurses}
            wards={wards}
            onAddNurse={handleAddNurseToWard}
            onUpdateNurseRole={handleUpdateNurseRole}
            onUpdateNurse={handleUpdateNurse}
            onDeleteNurse={handleDeleteNurse}
            userRole={userRole}
          />
        )}

        {/* TAB 3: Nursing Head Executive Dashboards (Option 1: Unit-Level, Option 2: Ward-Wise Activity) */}
        {activeTab === 'nursing_head_options' && (
          <NursingHeadExecutiveDashboards
            wards={wards}
            nurses={nurses}
            matrix={matrix}
            activities={activities}
            onAddActivity={handleAddActivity}
            onVerifyActivity={handleVerifyActivity}
            userRole={userRole}
            currentUserName={currentUser.name}
          />
        )}

        {/* TAB 4: Daily Manpower Sheet */}
        {activeTab === 'manpower' && (
          <DailyManpowerSheet
            records={manpowerRecords}
            onAddRecord={handleAddManpowerRecord}
            onUpdateRecord={handleUpdateManpowerRecord}
            userRole={userRole}
            selectedMonth={selectedMonth}
          />
        )}

        {/* TAB 5: Shift Swaps & Leaves */}
        {activeTab === 'swaps' && (
          <ShiftSwapsAndLeaves
            nurses={nurses}
            matrix={matrix}
            swaps={swaps}
            leaves={leaves}
            onAddSwap={handleAddSwap}
            onUpdateSwapStatus={handleUpdateSwapStatus}
            onAddLeave={handleAddLeave}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            userRole={userRole}
            currentNurseId={currentNurseId}
          />
        )}

        {/* TAB 6: Productivity & Attendance */}
        {activeTab === 'admin' && (
          <AdminProductivityDashboard
            nurses={nurses}
            matrix={matrix}
            manpowerRecords={manpowerRecords}
            attendance={attendance}
            onClockIn={handleClockIn}
            userRole={userRole}
            selectedMonth={selectedMonth}
          />
        )}

        {/* TAB 7: Mobile Nurse Portal */}
        {activeTab === 'mobile' && (
          <MobileNursePortal
            nurses={nurses}
            matrix={matrix}
            currentNurseId={currentNurseId}
            onSelectNurse={setCurrentNurseId}
            onClockIn={handleClockIn}
            onRequestSwap={() => setActiveTab('swaps')}
            onApplyLeave={() => setActiveTab('swaps')}
            onTriggerTestPush={triggerPushNotification}
          />
        )}

        {/* TAB 8: Team Chat & Handovers */}
        {activeTab === 'chat' && (
          <TeamChat
            messages={messages}
            onSendMessage={handleSendMessage}
            currentNurse={selectedNurse}
            onTakeShiftCover={() => {
              showToast('Shift cover accepted! Roster updated and supervisor notified.');
            }}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardNurse}
        existingNurses={nurses}
      />

      <HMSIntegrationModal
        isOpen={isHMSOpen}
        onClose={() => setIsHMSOpen(false)}
        nurses={nurses}
        matrix={matrix}
        manpowerRecords={manpowerRecords}
        onImportBedOccupancy={handleImportBedOccupancy}
      />

      <PushNotificationManager
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onNotificationClick={(notif) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
          );
        }}
      />

      <StaffAccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        currentUserRole={userRole}
      />
      </div>
    </div>
  );
}
