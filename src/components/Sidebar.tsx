import React from 'react';
import { 
  CalendarDays, 
  ClipboardList, 
  ArrowLeftRight, 
  BarChart3, 
  Smartphone, 
  MessageSquare, 
  Building2, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  UserPlus, 
  Key, 
  LogOut, 
  Crown, 
  ShieldCheck, 
  Layers,
  Database
} from 'lucide-react';
import { UserRole, UserAccount, Ward } from '../types/roster';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenAccounts: () => void;
  onOpenOnboarding: () => void;
  onGenerateAIRoster: () => void;
  wards: Ward[];
  selectedWardId: string;
  onSelectWardId: (id: string) => void;
  pendingSwapsCount?: number;
  pendingLeavesCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  userRole,
  currentUser,
  onLogout,
  onOpenAccounts,
  onOpenOnboarding,
  onGenerateAIRoster,
  wards,
  selectedWardId,
  onSelectWardId,
  pendingSwapsCount = 0,
  pendingLeavesCount = 0,
}) => {
  const totalPending = pendingSwapsCount + pendingLeavesCount;

  // The 8 primary navigation tabs transferred from the header
  const navItems: NavItem[] = [
    {
      id: 'roster',
      label: 'Duty Roster Matrix',
      shortLabel: 'Roster',
      icon: CalendarDays,
      badge: '31 Days',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'master_wards',
      label: 'Master Ward Staffing',
      shortLabel: 'Wards',
      icon: Building2,
      badge: 'Master',
      badgeColor: 'bg-teal-700 text-white font-semibold',
      highlight: true,
    },
    {
      id: 'master_data',
      label: 'Master Data (Roles & Shifts)',
      shortLabel: 'Master Data',
      icon: Database,
      badge: 'Roles & Shifts',
      badgeColor: 'bg-teal-600 text-white font-semibold',
      highlight: true,
    },
    {
      id: 'nursing_head_options',
      label: 'Nursing Head Dashboards',
      shortLabel: 'Exec',
      icon: Activity,
      badge: '2 Views',
      badgeColor: 'bg-purple-800 text-white font-semibold',
      highlight: true,
    },
    {
      id: 'manpower',
      label: 'Daily Manpower Sheet',
      shortLabel: 'Manpower',
      icon: ClipboardList,
    },
    {
      id: 'swaps',
      label: 'Shift Swaps & Leaves',
      shortLabel: 'Swaps',
      icon: ArrowLeftRight,
      badge: totalPending > 0 ? totalPending : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'admin',
      label: 'Productivity & Attendance',
      shortLabel: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'mobile',
      label: 'Nurse Portal (My Shifts)',
      shortLabel: 'My Shifts',
      icon: Smartphone,
    },
    {
      id: 'chat',
      label: 'Team Chat & Handovers',
      shortLabel: 'Handovers',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-68'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Sidebar Header: Hospital Wordmark & Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0 ring-2 ring-teal-500/30">
            <span className="tracking-tighter">KC</span>
          </div>

          {/* App Title when expanded */}
          {!isCollapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="font-bold text-sm text-white tracking-tight truncate">
                Kauvery Hospital
              </span>
              <span className="text-[11px] text-teal-400 font-medium truncate">
                Nurse Duty Roster Pro
              </span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0 cursor-pointer"
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-teal-400" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Ward Quick Selector in Sidebar */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ward Filter
            </span>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800">
              {wards.length} Wards
            </span>
          </div>
          <select
            value={selectedWardId}
            onChange={(e) => onSelectWardId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            aria-label="Sidebar Ward Filter"
          >
            <option value="all">All Wards Combined</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.shortCode} - {w.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Primary Navigation Item List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical Modules
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? item.id === 'nursing_head_options'
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-950/50'
                    : item.id === 'master_wards'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-950/50'
                    : 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-teal-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ml-1.5 ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                  <div className="font-semibold">{item.label}</div>
                  {item.badge !== undefined && (
                    <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                      Status: {item.badge}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Section Divider */}
        <div className="my-3 border-t border-slate-800" />

        {/* Quick Operations & Tools */}
        {!isCollapsed && (
          <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Tools
          </div>
        )}

        {/* AI Auto-Schedule Shortcut */}
        <button
          onClick={onGenerateAIRoster}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-teal-300 hover:text-teal-100 hover:bg-teal-950/60 border border-teal-800/60 transition-colors cursor-pointer group ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="AI Auto-Schedule balanced shifts for wards"
        >
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span className="truncate">AI Auto-Schedule</span>}
        </button>

        {/* Staff Role & Credential Directory Button */}
        <button
          onClick={onOpenAccounts}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-100 hover:bg-amber-950/50 border border-amber-800/50 transition-colors cursor-pointer group ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="View Employee IDs & Passwords Directory"
        >
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Staff Credentials</span>}
        </button>

        {/* Onboarding Wizard Button (Admin / Super Admin / Head) */}
        {(userRole === 'admin' || userRole === 'nursing_head' || userRole === 'super_admin') && (
          <button
            onClick={onOpenOnboarding}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title="Onboard newly recruited nurse"
          >
            <UserPlus className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span className="truncate">New Nurse Induction</span>}
          </button>
        )}
      </div>

      {/* Sidebar Footer: Active User Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
              </div>
              {userRole === 'super_admin' && (
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col truncate leading-tight">
                <span className="font-bold text-xs text-white truncate">
                  {currentUser?.name || 'Staff Member'}
                </span>
                <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                  <span>Emp #{currentUser?.empNo || '116562'}</span>
                  <span>·</span>
                  <span className="uppercase font-semibold">
                    {userRole === 'super_admin' ? 'Super Admin' :
                     userRole === 'nursing_head' ? 'Nursing Head' :
                     userRole === 'in_charge' ? 'In-Charge' : 'Staff'}
                  </span>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
            title="Log out of session"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
