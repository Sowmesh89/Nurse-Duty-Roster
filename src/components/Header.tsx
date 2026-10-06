import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  Database,
  UserPlus,
  LogOut,
  Crown,
  Building2,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { UserRole, UserAccount, Ward } from '../types/roster';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueueCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenHMS: () => void;
  onOpenOnboarding: () => void;
  selectedNurseName: string;
  currentUser: UserAccount | null;
  onLogout: () => void;
  wards: Ward[];
  selectedWardId: string;
  onSelectWardId: (id: string) => void;
  onGenerateAIRoster: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  isOfflineMode,
  setIsOfflineMode,
  offlineQueueCount,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenHMS,
  onOpenOnboarding,
  selectedNurseName,
  currentUser,
  onLogout,
  wards,
  selectedWardId,
  onSelectWardId,
  onGenerateAIRoster,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  // Tab title helper
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'roster': return 'Duty Roster Matrix';
      case 'master_wards': return 'Master Ward Staffing';
      case 'master_data': return 'Master Data (Nurse Roles & Shift Codes)';
      case 'nursing_head_options': return 'Nursing Head Dashboards';
      case 'manpower': return 'Daily Manpower Utilization';
      case 'swaps': return 'Shift Swaps & Leave Approvals';
      case 'admin': return 'Productivity & Attendance Reports';
      case 'mobile': return 'Nurse Mobile Portal';
      case 'chat': return 'Clinical Handovers & Chat';
      default: return 'Duty Roster';
    }
  };

  const activeWard = wards.find((w) => w.id === selectedWardId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Sidebar Toggle, Wordmark & Active Section Title */}
          <div className="flex items-center gap-3">
            {/* Sidebar Collapse / Expand Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle navigation sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-teal-700" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Wordmark and Active Title */}
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('roster');
                }}
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors"
              >
                Kauvery Hospital - Nurse Duty Roster
              </a>

              <span className="hidden sm:inline text-slate-300">/</span>

              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {getTabLabel(activeTab)}
              </span>
            </div>
          </div>

          {/* Zone 2: Center status context (Active Ward badge) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Active Context:</span>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              {activeWard ? `${activeWard.shortCode} · ${activeWard.name}` : 'All Hospital Wards'}
            </span>
          </div>

          {/* Zone 3: Primary System Actions (Ward Filter, AI Generate, Offline, Notifications, HMS, Role Switcher, Logout) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ward Selector Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Ward:</span>
              <select
                value={selectedWardId}
                onChange={(e) => onSelectWardId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                aria-label="Active Hospital Ward Selector"
              >
                <option value="all">All Wards Combined</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.shortCode} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Auto-Generate Roster Button */}
            <button
              onClick={onGenerateAIRoster}
              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="AI auto-generates balanced shifts, clock-in attendance & productivity metrics"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">AI Auto-Schedule</span>
            </button>

            {/* Offline Zone Simulator */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              title={isOfflineMode ? 'Offline Zone active (ICU Basement) - edits queue locally' : 'Hospital Network Online'}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden lg:inline text-[11px]">Offline</span>
                  {offlineQueueCount > 0 && (
                    <span className="bg-amber-600 text-white text-[10px] px-1 rounded font-mono">
                      {offlineQueueCount}
                    </span>
                  )}
                </>
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>

            {/* Notifications Alert */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Shift notifications & push alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* HMS Connector Button */}
            <button
              onClick={onOpenHMS}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block cursor-pointer"
              title="Hospital Management System (FHIR / HL7) API connector"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* New Hire Induction Wizard */}
            {(userRole === 'admin' || userRole === 'nursing_head' || userRole === 'super_admin') && (
              <button
                onClick={onOpenOnboarding}
                className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors hidden xl:flex items-center gap-1.5 cursor-pointer"
                title="Onboard newly recruited nurse"
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                <span>Onboard</span>
              </button>
            )}

            {/* RBAC Role Selector & Active User Lockup */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <div className="flex flex-col text-right pr-1 hidden 2xl:block">
                <div className="flex items-center justify-end gap-1">
                  {userRole === 'super_admin' && (
                    <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                  )}
                  {userRole === 'nursing_head' && (
                    <Building2 className="w-3 h-3 text-purple-600" />
                  )}
                  <span className="text-[11px] font-bold text-slate-900 truncate max-w-[110px]">
                    {currentUser?.name || selectedNurseName}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 font-mono">
                  <span>ID: {currentUser?.empNo || '116562'}</span>
                  <span>·</span>
                  <span className="text-teal-700 font-semibold uppercase">
                    {userRole === 'super_admin' ? 'SUPER ADMIN' :
                     userRole === 'nursing_head' ? 'NURSING HEAD' :
                     userRole === 'in_charge' ? 'IN-CHG' : 'STAFF'}
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher */}
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="text-xs bg-slate-100 border border-slate-300 rounded-md py-1.5 px-2 font-medium text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
                aria-label="Role-Based Access Control Switcher"
              >
                <option value="super_admin">Super Admin (116562)</option>
                <option value="nursing_head">Nursing Head (110001)</option>
                <option value="in_charge">Shift In-Charge</option>
                <option value="nurse">Staff Nurse</option>
              </select>

              {/* Log Out Button */}
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Log out of clinical session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
