import React, { useState, useMemo } from 'react';
import { 
  MasterNurseRole, 
  MasterShiftCode, 
  Nurse, 
  UserRole,
  Ward,
  NurseRole 
} from '../types/roster';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  X, 
  Sliders, 
  Sparkles, 
  AlertCircle,
  Database,
  Building2,
  Users,
  CalendarCheck,
  Tag,
  Check,
  RefreshCw,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  BadgeAlert,
  ArrowUpDown
} from 'lucide-react';

interface MasterDataHubProps {
  roles: MasterNurseRole[];
  shiftCodes: MasterShiftCode[];
  onAddRole: (role: MasterNurseRole) => void;
  onUpdateRole: (role: MasterNurseRole) => void;
  onDeleteRole: (roleId: string) => void;
  onAddShiftCode: (shift: MasterShiftCode) => void;
  onUpdateShiftCode: (shift: MasterShiftCode) => void;
  onDeleteShiftCode: (code: string) => void;
  onResetDefaults?: () => void;
  nurses: Nurse[];
  wards?: Ward[];
  onAddNurse?: (nurse: Nurse) => void;
  onUpdateNurse?: (oldId: string, nurse: Nurse) => void;
  onUpdateNurseRole?: (nurseId: string, newRole: NurseRole) => void;
  onDeleteNurse?: (nurseId: string) => void;
  userRole: UserRole;
}

const COLOR_THEMES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  teal: { label: 'Teal (Morning)', bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-300' },
  amber: { label: 'Amber (Evening)', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  indigo: { label: 'Indigo (Night)', bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-300' },
  emerald: { label: 'Emerald (Education)', bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300' },
  rose: { label: 'Rose (Leave)', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400' },
  purple: { label: 'Purple (Sick Leave)', bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-300' },
  sky: { label: 'Sky Blue (Comp Off)', bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-300' },
  orange: { label: 'Orange (Overtime)', bg: 'bg-orange-100', text: 'text-orange-950', border: 'border-orange-500 font-bold' },
  fuchsia: { label: 'Fuchsia (Maternity)', bg: 'bg-fuchsia-50', text: 'text-fuchsia-900', border: 'border-fuchsia-300' },
  pink: { label: 'Pink (Earned Leave)', bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-300' },
  slate: { label: 'Slate (Weekly Off)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  red: { label: 'Red (Absent Alert)', bg: 'bg-red-100', text: 'text-red-950', border: 'border-red-500' },
};

export const MasterDataHub: React.FC<MasterDataHubProps> = ({
  roles,
  shiftCodes,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onAddShiftCode,
  onUpdateShiftCode,
  onDeleteShiftCode,
  onResetDefaults,
  nurses,
  wards = [],
  onAddNurse,
  onUpdateNurse,
  onUpdateNurseRole,
  onDeleteNurse,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'shifts'>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  // Role Definition Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalTab, setRoleModalTab] = useState<'specs' | 'staff'>('specs');
  const [editingRole, setEditingRole] = useState<MasterNurseRole | null>(null);
  const [roleForm, setRoleForm] = useState<Partial<MasterNurseRole>>({
    name: '',
    shortCode: '',
    category: 'Staff',
    minExperienceYears: 1,
    description: '',
    responsibilities: '',
    payBand: 'Grade-N2',
    active: true,
  });

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<MasterShiftCode | null>(null);
  const [shiftForm, setShiftForm] = useState<Partial<MasterShiftCode>>({
    code: '',
    label: '',
    category: 'duty',
    startTime: '08:00',
    endTime: '16:30',
    durationHours: 8.5,
    colorKey: 'teal',
    countsTowardsManpower: true,
    description: '',
    active: true,
  });

  // Assign / Add Staff to Role Modal State
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [targetRoleForStaff, setTargetRoleForStaff] = useState<string>('');
  const [assignMode, setAssignMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingNurseId, setSelectedExistingNurseId] = useState<string>('');
  
  // Dedicated Edit Staff Member Modal (For editing employee code, name, role reassignment, ward, etc.)
  const [editingStaff, setEditingStaff] = useState<{
    oldId: string;
    nurse: Nurse;
  } | null>(null);

  // Directly editable staff records within the Role Modal
  const [editingRoleStaffMap, setEditingRoleStaffMap] = useState<Record<string, {
    id: string;
    name: string;
    role: string;
    wardId: string;
    contact: string;
    experienceYears: number;
    isTrainee: boolean;
  }>>({});
  const [staffSavedFeedback, setStaffSavedFeedback] = useState<string | null>(null);

  // New Staff Form state
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    empCode: '',
    role: '',
    wardId: wards[0]?.id || 'icu',
    contact: '+91 98401 ',
    email: '',
    experienceYears: 2,
    isTrainee: false,
  });

  const canEdit = userRole === 'super_admin' || userRole === 'nursing_head' || userRole === 'admin';

  // Group nurses by role name
  const nursesByRole = useMemo(() => {
    const map: Record<string, Nurse[]> = {};
    roles.forEach((r) => {
      map[r.name] = [];
    });
    nurses.forEach((nurse) => {
      if (!map[nurse.role]) {
        map[nurse.role] = [];
      }
      map[nurse.role].push(nurse);
    });
    return map;
  }, [roles, nurses]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = searchQuery.toLowerCase();
      const assignedNurses = nursesByRole[r.name] || [];
      const hasMatchingNurse = assignedNurses.some(
        (n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
      );

      const matchesSearch = 
        r.name.toLowerCase().includes(q) ||
        r.shortCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        hasMatchingNurse;

      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [roles, searchQuery, selectedCategory, nursesByRole]);

  // Filtered Shifts
  const filteredShifts = useMemo(() => {
    return shiftCodes.filter((s) => {
      const matchesSearch = 
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [shiftCodes, searchQuery, selectedCategory]);

  // Handlers for Role Modal
  const openNewRoleModal = () => {
    setEditingRole(null);
    setRoleModalTab('specs');
    setRoleForm({
      name: '',
      shortCode: '',
      category: 'Staff',
      minExperienceYears: 1,
      description: '',
      responsibilities: '',
      payBand: 'Grade-N2',
      active: true,
    });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: MasterNurseRole, defaultTab: 'specs' | 'staff' = 'specs') => {
    setEditingRole(role);
    setRoleModalTab(defaultTab);
    setRoleForm({ ...role });

    // Populate editable map for all staff currently in this role
    const assigned = nursesByRole[role.name] || [];
    const map: Record<string, any> = {};
    assigned.forEach((n) => {
      map[n.id] = {
        id: n.id,
        name: n.name,
        role: n.role,
        wardId: n.wardId || wards[0]?.id || 'icu',
        contact: n.contact || '+91 98401 00000',
        experienceYears: n.experienceYears || 1,
        isTrainee: !!n.isTrainee,
      };
    });
    setEditingRoleStaffMap(map);
    setIsRoleModalOpen(true);
  };

  const handleUpdateStaffFieldInRole = (nurseOriginalId: string, field: string, val: any) => {
    setEditingRoleStaffMap((prev) => ({
      ...prev,
      [nurseOriginalId]: {
        ...prev[nurseOriginalId],
        [field]: val,
      },
    }));
  };

  const handleSaveStaffFromRoleModal = (nurseOriginalId: string) => {
    const edited = editingRoleStaffMap[nurseOriginalId];
    if (!edited || !onUpdateNurse) return;
    if (!edited.name.trim() || !edited.id.trim()) return;

    const originalNurse = nurses.find((n) => n.id === nurseOriginalId);
    if (!originalNurse) return;

    const targetWard = wards.find((w) => w.id === edited.wardId);
    const updatedNurse: Nurse = {
      ...originalNurse,
      id: edited.id.trim(),
      name: edited.name.trim(),
      role: edited.role as NurseRole,
      wardId: edited.wardId,
      department: targetWard ? targetWard.name : originalNurse.department,
      contact: edited.contact,
      experienceYears: Number(edited.experienceYears) || 1,
      isTrainee: edited.isTrainee,
    };

    onUpdateNurse(nurseOriginalId, updatedNurse);
    setStaffSavedFeedback(`Updated ${updatedNurse.name} (Emp ID: ${updatedNurse.id})`);
    setTimeout(() => setStaffSavedFeedback(null), 3000);
  };

  const handleDeleteStaffMember = (nurseId: string) => {
    if (!onDeleteNurse) return;
    const nurse = nurses.find((n) => n.id === nurseId);
    if (confirm(`Are you sure you want to permanently delete staff member "${nurse?.name || 'Staff'}" (Emp ID: ${nurseId}) from frontend and backend?`)) {
      onDeleteNurse(nurseId);
      setEditingRoleStaffMap((prev) => {
        const next = { ...prev };
        delete next[nurseId];
        return next;
      });
    }
  };

  const handleDeleteRoleClick = (role: MasterNurseRole) => {
    const assignedCount = (nursesByRole[role.name] || []).length;
    const msg = assignedCount > 0
      ? `Are you sure you want to permanently delete role "${role.name}" from frontend and backend? The ${assignedCount} assigned staff member(s) will be safely transferred to "Staff Nurse".`
      : `Are you sure you want to permanently delete role "${role.name}" from frontend and backend?`;

    if (confirm(msg)) {
      onDeleteRole(role.id);
      if (isRoleModalOpen && editingRole?.id === role.id) {
        setIsRoleModalOpen(false);
      }
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name || !roleForm.shortCode) return;

    if (editingRole) {
      const newName = roleForm.name.trim();
      const oldName = editingRole.name;

      onUpdateRole({
        ...editingRole,
        name: newName,
        shortCode: roleForm.shortCode.trim().toUpperCase(),
        category: roleForm.category || 'Staff',
        minExperienceYears: Number(roleForm.minExperienceYears) || 0,
        description: roleForm.description || '',
        responsibilities: roleForm.responsibilities || '',
        payBand: roleForm.payBand || '',
        active: roleForm.active !== undefined ? roleForm.active : true,
      });

      // If role name changed, update assigned nurses to the new role name!
      if (newName !== oldName && onUpdateNurseRole) {
        const assignedNurses = nursesByRole[oldName] || [];
        assignedNurses.forEach((nurse) => {
          onUpdateNurseRole(nurse.id, newName as NurseRole);
        });
      }
    } else {
      const newRole: MasterNurseRole = {
        id: `role-${Date.now()}`,
        name: roleForm.name.trim(),
        shortCode: roleForm.shortCode.trim().toUpperCase(),
        category: roleForm.category || 'Staff',
        minExperienceYears: Number(roleForm.minExperienceYears) || 0,
        description: roleForm.description || '',
        responsibilities: roleForm.responsibilities || '',
        payBand: roleForm.payBand || '',
        isSystem: false,
        active: true,
      };
      onAddRole(newRole);
    }

    setIsRoleModalOpen(false);
  };

  // Open Edit Staff Modal
  const openEditStaffModal = (nurse: Nurse) => {
    setEditingStaff({
      oldId: nurse.id,
      nurse: { ...nurse },
    });
  };

  const handleSaveEditedStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !onUpdateNurse) return;
    if (!editingStaff.nurse.name.trim() || !editingStaff.nurse.id.trim()) return;

    onUpdateNurse(editingStaff.oldId, editingStaff.nurse);
    setEditingStaff(null);
  };

  // Open Assign / Add Staff Modal
  const openAssignStaffModal = (roleName: string) => {
    setTargetRoleForStaff(roleName);
    setAssignMode('new');
    setSelectedExistingNurseId('');
    setNewStaffForm({
      name: '',
      empCode: '',
      role: roleName,
      wardId: wards[0]?.id || 'icu',
      contact: '+91 98401 ',
      email: '',
      experienceYears: 2,
      isTrainee: roleName.toLowerCase().includes('trainee'),
    });
    setIsAssignStaffModalOpen(true);
  };

  const handleSaveStaffToRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignMode === 'existing') {
      if (!selectedExistingNurseId || !onUpdateNurseRole) return;
      onUpdateNurseRole(selectedExistingNurseId, targetRoleForStaff as NurseRole);
      setIsAssignStaffModalOpen(false);
      return;
    }

    if (!newStaffForm.name || !newStaffForm.empCode || !onAddNurse) return;

    const assignedWard = wards.find((w) => w.id === newStaffForm.wardId);
    const newNurse: Nurse = {
      id: newStaffForm.empCode.trim(),
      name: newStaffForm.name.trim(),
      role: targetRoleForStaff as NurseRole,
      department: assignedWard ? assignedWard.name : 'Critical Care ICU',
      wardId: newStaffForm.wardId,
      contact: newStaffForm.contact,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '')}@kauveryhospital.com`,
      experienceYears: Number(newStaffForm.experienceYears) || 1,
      isTrainee: newStaffForm.isTrainee,
      cneCertified: true,
      skills: ['Patient Vitals', 'IV Administration', 'Clinical Documentation'],
    };

    onAddNurse(newNurse);
    setIsAssignStaffModalOpen(false);
  };

  // Handlers for Shift Modal
  const openNewShiftModal = () => {
    setEditingShift(null);
    setShiftForm({
      code: '',
      label: '',
      category: 'duty',
      startTime: '08:00',
      endTime: '16:30',
      durationHours: 8.5,
      colorKey: 'teal',
      countsTowardsManpower: true,
      description: '',
      active: true,
    });
    setIsShiftModalOpen(true);
  };

  const openEditShiftModal = (shift: MasterShiftCode) => {
    setEditingShift(shift);
    setShiftForm({ ...shift });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.code || !shiftForm.label) return;

    const theme = COLOR_THEMES[shiftForm.colorKey || 'teal'] || COLOR_THEMES.teal;

    let duration = Number(shiftForm.durationHours) || 8.0;
    if (shiftForm.startTime && shiftForm.endTime && shiftForm.category === 'duty') {
      const [startH, startM] = shiftForm.startTime.split(':').map(Number);
      const [endH, endM] = shiftForm.endTime.split(':').map(Number);
      let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMins < 0) diffMins += 24 * 60;
      duration = Math.round((diffMins / 60) * 10) / 10;
    } else if (shiftForm.category === 'leave' || shiftForm.category === 'off') {
      duration = 0;
    }

    if (editingShift) {
      onUpdateShiftCode({
        ...editingShift,
        label: shiftForm.label.trim(),
        category: shiftForm.category || 'duty',
        startTime: shiftForm.startTime || '07:00',
        endTime: shiftForm.endTime || '15:30',
        durationHours: duration,
        colorKey: shiftForm.colorKey as any || 'teal',
        bgClass: theme.bg,
        textClass: theme.text,
        borderClass: theme.border,
        countsTowardsManpower: shiftForm.countsTowardsManpower ?? true,
        description: shiftForm.description || '',
        active: shiftForm.active ?? true,
      });
    } else {
      const codeKey = shiftForm.code.trim().toUpperCase();
      const newShift: MasterShiftCode = {
        code: codeKey,
        label: shiftForm.label.trim(),
        category: shiftForm.category || 'duty',
        startTime: shiftForm.startTime || '07:00',
        endTime: shiftForm.endTime || '15:30',
        durationHours: duration,
        colorKey: shiftForm.colorKey as any || 'teal',
        bgClass: theme.bg,
        textClass: theme.text,
        borderClass: theme.border,
        countsTowardsManpower: shiftForm.countsTowardsManpower ?? true,
        description: shiftForm.description || '',
        isSystem: false,
        active: true,
      };
      onAddShiftCode(newShift);
    }

    setIsShiftModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hospital Master Data & Nursing Role Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              Master Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Configure hospital-wide standardized Nurse Roles, edit all staff details including <strong>Staff Name</strong>, <strong>Employee Code</strong>, ward assignments, and <strong>Role Reassignment</strong>.
          </p>
        </div>

        {/* Master Action Buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {activeTab === 'roles' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAssignStaffModal(roles[0]?.name || 'Staff Nurse')}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    title="Add staff member with Name & Employee Code to a role"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Staff & Emp Code</span>
                  </button>

                  <button
                    onClick={openNewRoleModal}
                    className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Nurse Role</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openNewShiftModal}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Shift Code
                </button>
              )}
            </>
          )}

          {onResetDefaults && canEdit && (
            <button
              onClick={onResetDefaults}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Reset to default Kauvery master catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Sub-Navigation: Roles vs Shift Codes & Layout Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-white px-6 pt-3 rounded-t-2xl gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('roles');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'text-teal-800 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Nurse Roles & Staff Master</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
              {roles.length} Roles · {nurses.length} Staff
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('shifts');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'shifts'
                ? 'text-teal-800 border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Shift Codes Master</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
              {shiftCodes.length}
            </span>
          </button>
        </div>

        {/* Live Filter / Search controls & View Toggle */}
        <div className="flex items-center gap-2 pb-3">
          {activeTab === 'roles' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Role Cards View with Staff"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="All Staff by Role Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Staff Table</span>
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'roles' 
                  ? 'Search staff name, emp code, or role...' 
                  : 'Search shift code or label...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 w-48 sm:w-64"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {activeTab === 'roles' ? (
              <>
                <option value="Executive">Executive</option>
                <option value="Supervisory">Supervisory</option>
                <option value="Senior Staff">Senior Staff</option>
                <option value="Staff">Staff</option>
                <option value="Trainee">Trainee</option>
                <option value="Specialist">Specialist</option>
              </>
            ) : (
              <>
                <option value="duty">Duty Shifts (Count in Manpower)</option>
                <option value="leave">Leaves (CL / SL / ML / EL)</option>
                <option value="off">Offs (Weekly Off / Comp Off)</option>
                <option value="education">CNE / Training</option>
                <option value="special">Special (DD / Pull-In / Pull-Out)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* ======================= TAB 1: NURSE ROLES MASTER ======================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* VIEW MODE 1: CARDS VIEW WITH STAFF NAMES, EMPLOYEE CODES & EDIT ACTIONS */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRoles.map((role) => {
                const assignedNurses = nursesByRole[role.name] || [];
                const isExpanded = expandedRoleId === role.id;

                return (
                  <div
                    key={role.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Header: Title & Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                              {role.shortCode}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">
                              {role.name}
                            </h3>
                          </div>
                          <span className="text-[11px] font-semibold text-teal-700 mt-1 inline-block">
                            {role.category} Level · {role.payBand || 'Standard Band'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {role.isSystem ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                              System Role
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold">
                              Custom Role
                            </span>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => openAssignStaffModal(role.name)}
                              className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Add staff name and employee code to this role"
                            >
                              <Plus className="w-3 h-3 text-teal-600" />
                              <span>Add Staff</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Role Description */}
                      <p className="text-xs text-slate-600 mb-3">
                        {role.description}
                      </p>

                      {/* Responsibilities */}
                      <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 text-[11px] text-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Key Clinical Scope:
                        </span>
                        <p className="line-clamp-2">{role.responsibilities}</p>
                      </div>

                      {/* Assigned Staff Members section: Staff Name & Employee Code & Inline Edit/Reassign */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-teal-700" />
                            <span>Assigned Staff ({assignedNurses.length})</span>
                          </span>

                          {assignedNurses.length > 3 && (
                            <button
                              onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                              className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Collapse' : `View All ${assignedNurses.length}`}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>

                        {assignedNurses.length > 0 ? (
                          <div className="space-y-1.5">
                            {(isExpanded ? assignedNurses : assignedNurses.slice(0, 3)).map((nurse) => {
                              const nurseWard = wards.find((w) => w.id === nurse.wardId);

                              return (
                                <div
                                  key={nurse.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                      {nurse.name.charAt(0)}
                                    </div>
                                    <div className="truncate">
                                      {/* Staff Name and Employee Code */}
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-900 truncate">
                                          {nurse.name}
                                        </span>
                                        <span className="px-1.5 py-0.2 bg-teal-100/70 text-teal-900 font-mono font-bold text-[10px] rounded border border-teal-300">
                                          Emp Code: {nurse.id}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <span>Ward: {nurseWard ? nurseWard.shortCode : nurse.department}</span>
                                        <span>·</span>
                                        <span>{nurse.experienceYears} yrs exp</span>
                                        {nurse.isTrainee && (
                                          <span className="bg-purple-100 text-purple-800 px-1 rounded text-[9px] font-semibold">
                                            Trainee
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Staff Edit & Reassign Controls */}
                                  {canEdit && (
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                      {/* Direct Edit Staff Member Button */}
                                      <button
                                        onClick={() => openEditStaffModal(nurse)}
                                        className="p-1 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors cursor-pointer"
                                        title={`Edit ${nurse.name}'s employee code, ward & profile`}
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Quick Role Reassigner dropdown */}
                                      {onUpdateNurseRole && (
                                        <select
                                          value={nurse.role}
                                          onChange={(e) => onUpdateNurseRole(nurse.id, e.target.value as NurseRole)}
                                          className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 hover:border-teal-500 focus:outline-none cursor-pointer"
                                          title="Reassign staff member to another role"
                                        >
                                          {roles.map((r) => (
                                            <option key={r.id} value={r.name}>
                                              {r.name}
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {/* Direct Delete Staff Member */}
                                      {onDeleteNurse && (
                                        <button
                                          onClick={() => handleDeleteStaffMember(nurse.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                          title={`Remove ${nurse.name} (Emp ID: ${nurse.id}) from frontend & backend`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                            <span className="text-xs text-slate-500 block mb-1.5">
                              No staff currently assigned to this role.
                            </span>
                            {canEdit && (
                              <button
                                onClick={() => openAssignStaffModal(role.name)}
                                className="px-2.5 py-1 bg-white border border-slate-300 hover:border-teal-600 text-teal-800 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                + Add Staff with Employee Code
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Metrics & Actions */}
                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="text-[11px]">Min {role.minExperienceYears} yrs experience required</span>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1.5">
                          {/* Main Role Edit Button (Allows editing specs and all assigned staff information) */}
                          <button
                            onClick={() => openEditRoleModal(role)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs shadow-2xs"
                            title="Edit role details, employee codes & reassignments"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                            <span>Edit Role & Staff</span>
                          </button>

                          {/* Delete Role Button (Both Frontend and Backend) */}
                          <button
                            onClick={() => handleDeleteRoleClick(role)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                            title={`Permanently delete role "${role.name}" from frontend and backend`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE 2: COMPREHENSIVE STAFF & ROLE MASTER TABLE */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Hospital Staff Directory by Nursing Role
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing Staff Name, Employee Code, assigned Ward, and Role Designation.
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => openAssignStaffModal(roles[0]?.name || 'Staff Nurse')}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Staff Member</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4">Employee Code</th>
                      <th className="py-2.5 px-4">Staff Nurse Name</th>
                      <th className="py-2.5 px-4">Current Role Designation</th>
                      <th className="py-2.5 px-4">Assigned Ward</th>
                      <th className="py-2.5 px-4">Experience</th>
                      <th className="py-2.5 px-4">Contact</th>
                      {canEdit && <th className="py-2.5 px-4 text-center">Edit / Reassign</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nurses.map((nurse) => {
                      const roleObj = roles.find((r) => r.name === nurse.role);
                      const nurseWard = wards.find((w) => w.id === nurse.wardId);

                      return (
                        <tr key={nurse.id} className="hover:bg-slate-50 transition-colors">
                          {/* Employee Code */}
                          <td className="py-3 px-4 font-mono font-bold text-teal-800">
                            <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded">
                              {nurse.id}
                            </span>
                          </td>

                          {/* Staff Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                                {nurse.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {nurse.name}
                                </span>
                                {nurse.isTrainee && (
                                  <span className="text-[10px] text-purple-700 font-semibold">
                                    Probationary Trainee
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role Designation */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {roleObj && (
                                <span className="px-1.5 py-0.2 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                                  {roleObj.shortCode}
                                </span>
                              )}
                              <span className="font-semibold text-slate-800">
                                {nurse.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {roleObj?.category || 'Staff'} · {roleObj?.payBand || 'Standard'}
                            </span>
                          </td>

                          {/* Ward */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-medium text-slate-700">
                              {nurseWard ? `${nurseWard.shortCode} · ${nurseWard.name}` : nurse.department}
                            </span>
                          </td>

                          {/* Experience */}
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {nurse.experienceYears} Years
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {nurse.contact}
                          </td>

                          {/* Edit Details & Reassign Role */}
                          {canEdit && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditStaffModal(nurse)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Edit staff name, employee code, ward & contact"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                {onUpdateNurseRole && (
                                  <select
                                    value={nurse.role}
                                    onChange={(e) => onUpdateNurseRole(nurse.id, e.target.value as NurseRole)}
                                    className="text-xs bg-slate-100 border border-slate-300 rounded-md py-1 px-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
                                    title="Reassign role"
                                  >
                                    {roles.map((r) => (
                                      <option key={r.id} value={r.name}>
                                        {r.name}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {onDeleteNurse && (
                                  <button
                                    onClick={() => handleDeleteStaffMember(nurse.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title={`Remove ${nurse.name} (Emp ID: ${nurse.id}) from frontend & backend`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRoles.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No nurse roles or staff members match the query &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: SHIFT CODES MASTER ======================= */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShifts.map((shift) => {
              const theme = COLOR_THEMES[shift.colorKey] || COLOR_THEMES.teal;

              return (
                <div
                  key={shift.code}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Visual Shift Badge & Shift Label */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-10 rounded-lg border flex items-center justify-center font-bold text-sm shadow-2xs ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          {shift.code}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {shift.label}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 capitalize">
                            Category: {shift.category}
                          </span>
                        </div>
                      </div>

                      {shift.countsTowardsManpower ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          On-Duty Manpower
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                          Off / Leave
                        </span>
                      )}
                    </div>

                    {/* Timings and Duration */}
                    <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span className="font-semibold text-slate-800 font-mono">
                          {shift.startTime} – {shift.endTime}
                        </span>
                      </div>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                        {shift.durationHours > 0 ? `${shift.durationHours} hrs` : 'Full Day'}
                      </span>
                    </div>

                    {/* Shift Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {shift.description}
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Theme: {shift.colorKey}
                    </span>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditShiftModal(shift)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit shift code"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!shift.isSystem && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete custom shift code "${shift.code}"?`)) {
                                onDeleteShiftCode(shift.code);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete custom shift code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredShifts.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
              No shift codes match the filter &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      )}

      {/* ======================= MODAL: EDIT / CONFIGURE ROLE & ASSIGNED STAFF ======================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-700" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingRole ? `Configure Role: ${editingRole.name}` : 'Add New Nurse Role'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Edit role specifications, clinical scope, employee codes, and staff reassignments
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs (When editing an existing role) */}
            {editingRole && (
              <div className="flex border-b border-slate-200 bg-slate-100/70 px-5 pt-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRoleModalTab('specs')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    roleModalTab === 'specs'
                      ? 'border-teal-700 text-teal-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Role Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModalTab('staff')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    roleModalTab === 'staff'
                      ? 'border-teal-700 text-teal-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Assigned Staff & Employee Codes</span>
                  <span className="bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                    {(nursesByRole[editingRole.name] || []).length}
                  </span>
                </button>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {(!editingRole || roleModalTab === 'specs') ? (
                <form onSubmit={handleSaveRole} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Role Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Clinical Nurse Specialist"
                        value={roleForm.name || ''}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Short Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="e.g. CNS"
                        value={roleForm.shortCode || ''}
                        onChange={(e) => setRoleForm({ ...roleForm, shortCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 uppercase font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category Level
                      </label>
                      <select
                        value={roleForm.category || 'Staff'}
                        onChange={(e) => setRoleForm({ ...roleForm, category: e.target.value as any })}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                      >
                        <option value="Executive">Executive</option>
                        <option value="Supervisory">Supervisory</option>
                        <option value="Senior Staff">Senior Staff</option>
                        <option value="Staff">Staff</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Specialist">Specialist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Min Exp (Yrs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={roleForm.minExperienceYears || 0}
                        onChange={(e) => setRoleForm({ ...roleForm, minExperienceYears: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pay Band
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grade-SP1"
                        value={roleForm.payBand || ''}
                        onChange={(e) => setRoleForm({ ...roleForm, payBand: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role Overview & Objective
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Primary clinical purpose and seniority scope in the hospital..."
                      value={roleForm.description || ''}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Key Clinical Responsibilities
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specific bedside procedures, patient allocations, handover verifications..."
                      value={roleForm.responsibilities || ''}
                      onChange={(e) => setRoleForm({ ...roleForm, responsibilities: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                    {editingRole && (
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-teal-950">
                          <Users className="w-4 h-4 text-teal-700 shrink-0" />
                          <span>
                            <strong>{(nursesByRole[editingRole.name] || []).length} Staff Member(s)</strong> assigned to {editingRole.name}.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRoleModalTab('staff')}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Edit Staff & Employee Codes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      {editingRole && canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRoleClick(editingRole)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Permanently delete role from frontend and backend"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Role (Frontend & Backend)</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setIsRoleModalOpen(false)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Role Details</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* TAB B: MANAGING ALL ASSIGNED STAFF & EMPLOYEE CODES IN THIS ROLE */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-teal-700" />
                          <span>Staff Assigned to &ldquo;{editingRole.name}&rdquo;</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Directly edit employee codes, names, or reassign personnel to another clinical role.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsRoleModalOpen(false);
                          openAssignStaffModal(editingRole.name);
                        }}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Add Staff to Role</span>
                      </button>
                    </div>

                    {staffSavedFeedback && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{staffSavedFeedback}</span>
                      </div>
                    )}

                    {(() => {
                      const assignedList = nursesByRole[editingRole.name] || [];
                      if (assignedList.length === 0) {
                        return (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-500 mb-2">
                              No nurses currently assigned to this role.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsRoleModalOpen(false);
                                openAssignStaffModal(editingRole.name);
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-teal-800 rounded-lg text-xs font-semibold hover:bg-slate-50"
                            >
                              + Assign Nurse with Employee Code
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {assignedList.map((nurse) => {
                            const stateData = editingRoleStaffMap[nurse.id] || {
                              id: nurse.id,
                              name: nurse.name,
                              role: nurse.role,
                              wardId: nurse.wardId || 'icu',
                              contact: nurse.contact,
                              experienceYears: nurse.experienceYears,
                              isTrainee: !!nurse.isTrainee,
                            };

                            return (
                              <div
                                key={nurse.id}
                                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-slate-100/50 transition-colors shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                                      {nurse.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="font-bold text-xs text-slate-900 block">
                                        {nurse.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        Current System Emp ID: {nurse.id}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditStaffModal(nurse)}
                                      className="p-1 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded text-xs transition-colors cursor-pointer"
                                      title="Open full profile editor"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {onDeleteNurse && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStaffMember(nurse.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs transition-colors cursor-pointer"
                                        title="Delete staff member from frontend and backend"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Editable Fields Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                      Staff Name
                                    </label>
                                    <input
                                      type="text"
                                      value={stateData.name}
                                      onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'name', e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-teal-800 uppercase mb-0.5">
                                      Employee Code (Emp ID)
                                    </label>
                                    <input
                                      type="text"
                                      value={stateData.id}
                                      onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'id', e.target.value.trim())}
                                      className="w-full px-2.5 py-1.5 bg-teal-50/50 border border-teal-300 rounded-lg text-xs font-mono font-bold text-teal-900 focus:ring-1 focus:ring-teal-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                      Reassign Role
                                    </label>
                                    <select
                                      value={stateData.role}
                                      onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'role', e.target.value)}
                                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600 cursor-pointer"
                                    >
                                      {roles.map((r) => (
                                        <option key={r.id} value={r.name}>
                                          {r.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                      Assigned Ward
                                    </label>
                                    <select
                                      value={stateData.wardId}
                                      onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'wardId', e.target.value)}
                                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600 cursor-pointer"
                                    >
                                      {wards.map((w) => (
                                        <option key={w.id} value={w.id}>
                                          {w.shortCode} - {w.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                      Contact Number
                                    </label>
                                    <input
                                      type="text"
                                      value={stateData.contact}
                                      onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'contact', e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-600"
                                    />
                                  </div>

                                  <div className="flex items-end gap-1.5">
                                    <div className="flex-1">
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                        Exp (Yrs)
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={35}
                                        value={stateData.experienceYears}
                                        onChange={(e) => handleUpdateStaffFieldInRole(nurse.id, 'experienceYears', Number(e.target.value))}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-600"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveStaffFromRoleModal(nurse.id)}
                                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                                      title="Save changes to this staff member"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Save</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      {editingRole && canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRoleClick(editingRole)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Permanently delete role from frontend and backend"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Role (Frontend & Backend)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsRoleModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
                      >
                        Done Editing
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT ALL STAFF INFORMATION (EMPLOYEE CODE, NAME, REASSIGN, WARD) ======================= */}
      {editingStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit Staff & Employee Information
                  </h3>
                  <span className="text-xs text-slate-500">
                    Update Employee Code, Name, Role Reassignment & Ward
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedStaff} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Nurse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.nurse.name}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Employee Code (Emp ID) *</span>
                    <span className="text-[10px] text-teal-700 font-mono">Editable</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.nurse.id}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, id: e.target.value.trim() },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono font-bold text-teal-800 bg-teal-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Designation / Reassign *
                  </label>
                  <select
                    value={editingStaff.nurse.role}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, role: e.target.value as NurseRole },
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.shortCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Hospital Ward *
                  </label>
                  <select
                    value={editingStaff.nurse.wardId}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, wardId: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-medium"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.shortCode} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={editingStaff.nurse.contact}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, contact: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={35}
                    value={editingStaff.nurse.experienceYears}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        nurse: { ...editingStaff.nurse, experienceYears: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Email
                </label>
                <input
                  type="email"
                  value={editingStaff.nurse.email}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      nurse: { ...editingStaff.nurse, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <input
                  type="checkbox"
                  id="isTraineeNurse"
                  checked={editingStaff.nurse.isTrainee}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      nurse: { ...editingStaff.nurse, isTrainee: e.target.checked },
                    })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isTraineeNurse" className="text-slate-700 cursor-pointer font-medium">
                  Probationary Trainee Nurse (under continuous clinical mentorship)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                {onDeleteNurse && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to permanently delete staff member "${editingStaff.nurse.name}" (Emp ID: ${editingStaff.oldId}) from frontend and backend?`)) {
                        onDeleteNurse(editingStaff.oldId);
                        setEditingStaff(null);
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete staff member from frontend and backend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Staff</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Staff & Employee Code</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD / ASSIGN STAFF TO ROLE ======================= */}
      {isAssignStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-700" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Add Staff & Employee Code to Role
                  </h3>
                  <span className="text-xs font-semibold text-teal-700">
                    Target Role: {targetRoleForStaff}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAssignStaffModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Toggle: Create New Staff vs Reassign Existing */}
            <div className="px-5 pt-4">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-center">
                <button
                  type="button"
                  onClick={() => setAssignMode('new')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    assignMode === 'new' ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  + Add New Staff Member
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('existing')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    assignMode === 'existing' ? 'bg-white text-teal-800 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Reassign Existing Nurse
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveStaffToRole} className="p-5 space-y-4">
              {assignMode === 'new' ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Staff Nurse Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Divya Ramesh"
                        value={newStaffForm.name}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employee Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 140221"
                        value={newStaffForm.empCode}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, empCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono font-bold text-teal-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assigned Hospital Ward *
                      </label>
                      <select
                        value={newStaffForm.wardId}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, wardId: e.target.value })}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                      >
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.shortCode} - {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={35}
                        value={newStaffForm.experienceYears}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, experienceYears: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={newStaffForm.contact}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, contact: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hospital Email
                      </label>
                      <input
                        type="email"
                        placeholder="name@kauveryhospital.com"
                        value={newStaffForm.email}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      This staff member will be assigned to <strong>{targetRoleForStaff}</strong> and immediately synced into the Duty Roster Matrix.
                    </span>
                  </div>
                </>
              ) : (
                /* Reassign Existing Staff Member */
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Staff Member to Reassign to &ldquo;{targetRoleForStaff}&rdquo; *
                  </label>
                  <select
                    required
                    value={selectedExistingNurseId}
                    onChange={(e) => setSelectedExistingNurseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="">-- Choose Staff Nurse --</option>
                    {nurses.map((nurse) => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} (Emp #{nurse.id}) - Current: {nurse.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Selecting a nurse updates their role designation in the Master Registry, Duty Roster, and Staff accounts.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignStaffModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {assignMode === 'new' ? 'Create & Assign Staff' : 'Reassign Role'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADD / EDIT SHIFT CODE ======================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingShift ? `Edit Shift Code: ${editingShift.code}` : 'Add New Shift Code'}
                </h3>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. G"
                    value={shiftForm.code || ''}
                    disabled={editingShift?.isSystem}
                    onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 uppercase font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Day Shift"
                    value={shiftForm.label || ''}
                    onChange={(e) => setShiftForm({ ...shiftForm, label: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={shiftForm.category || 'duty'}
                    onChange={(e) => setShiftForm({ ...shiftForm, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="duty">Duty Shift</option>
                    <option value="leave">Leave</option>
                    <option value="off">Off Rest Day</option>
                    <option value="education">Education / CNE</option>
                    <option value="special">Special / OT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={shiftForm.startTime || '07:00'}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={shiftForm.endTime || '15:30'}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>
              </div>

              {/* Color Theme Selector & Live Badge Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Color Theme & Visual Preview
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={shiftForm.colorKey || 'teal'}
                    onChange={(e) => setShiftForm({ ...shiftForm, colorKey: e.target.value as any })}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                  >
                    {Object.entries(COLOR_THEMES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>

                  {/* Preview Badge */}
                  {(() => {
                    const theme = COLOR_THEMES[shiftForm.colorKey || 'teal'] || COLOR_THEMES.teal;
                    return (
                      <div
                        className={`w-14 h-9 rounded-lg border flex items-center justify-center font-bold text-xs font-mono shadow-2xs ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        {shiftForm.code || 'M'}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Counts toward manpower checkbox */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="countsTowardsManpower"
                  checked={shiftForm.countsTowardsManpower ?? true}
                  onChange={(e) => setShiftForm({ ...shiftForm, countsTowardsManpower: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="countsTowardsManpower" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Counts towards active unit manpower on Daily Utilization sheet
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Protocols & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Expected clinical routines, handover timings, meal breaks..."
                  value={shiftForm.description || ''}
                  onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Shift Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
