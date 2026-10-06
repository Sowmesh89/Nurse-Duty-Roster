import React, { useState, useMemo } from 'react';
import { 
  Nurse, 
  RosterMatrix, 
  ShiftCode, 
  UserRole,
  Ward,
  MasterShiftCode 
} from '../types/roster';
import { 
  Search, 
  Filter, 
  Printer, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';

interface RosterGridProps {
  nurses: Nurse[];
  matrix: RosterMatrix;
  onUpdateShift: (nurseId: string, date: number, shift: ShiftCode) => void;
  userRole: UserRole;
  selectedMonth: string;
  selectedWardId?: string;
  wards?: Ward[];
  masterShiftCodes?: MasterShiftCode[];
}

const SHIFT_CONFIG: Record<string, { label: string; desc: string; bg: string; text: string; border: string }> = {
  M: { label: 'M', desc: 'Morning (07:00 - 15:30)', bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-300' },
  E: { label: 'E', desc: 'Evening (13:30 - 21:30)', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  N: { label: 'N', desc: 'Night (21:00 - 07:30)', bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-300' },
  OFF: { label: 'OFF', desc: 'Weekly Scheduled Off', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  L: { label: 'L', desc: 'General Leave', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
  CL: { label: 'CL', desc: 'Casual Leave', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-400' },
  SL: { label: 'SL', desc: 'Sick Leave', bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-300' },
  CO: { label: 'CO', desc: 'Compensatory Off', bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-300' },
  CNE: { label: 'CNE', desc: 'Continuing Nursing Education', bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300' },
  DD: { label: 'DD', desc: 'Double Duty (Overtime)', bg: 'bg-orange-100', text: 'text-orange-950', border: 'border-orange-500 font-bold' },
  PI: { label: 'PI', desc: 'Pull-In from other ward', bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-400' },
  PO: { label: 'PO', desc: 'Pull-Out to other ward', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300 line-through' },
  EL: { label: 'EL', desc: 'Earned Leave / LWP', bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-300' },
  ML: { label: 'ML', desc: 'Maternity Leave', bg: 'bg-fuchsia-50', text: 'text-fuchsia-900', border: 'border-fuchsia-300' },
  A: { label: 'A', desc: 'Absent without intimation', bg: 'bg-red-100', text: 'text-red-950', border: 'border-red-500' },
};

export const RosterGrid: React.FC<RosterGridProps> = ({
  nurses,
  matrix,
  onUpdateShift,
  userRole,
  selectedMonth,
  selectedWardId = 'all',
  wards = [],
  masterShiftCodes = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeCellModal, setActiveCellModal] = useState<{
    nurseId: string;
    nurseName: string;
    date: number;
    currentShift: string;
  } | null>(null);

  // Dynamic Shift Configuration merged from Master Shift Codes
  const effectiveShiftConfig = useMemo(() => {
    const config: Record<string, { label: string; desc: string; bg: string; text: string; border: string }> = { ...SHIFT_CONFIG };
    if (masterShiftCodes && masterShiftCodes.length > 0) {
      masterShiftCodes.forEach((s) => {
        config[s.code] = {
          label: s.code,
          desc: `${s.label} (${s.startTime} - ${s.endTime})`,
          bg: s.bgClass,
          text: s.textClass,
          border: s.borderClass,
        };
      });
    }
    return config;
  }, [masterShiftCodes]);

  // Visible dates in month (Day 1 through 31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Filtered nurses by search, role, and ward
  const filteredNurses = useMemo(() => {
    return nurses.filter((nurse) => {
      const matchesSearch = 
        nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.id.includes(searchQuery);
      
      const matchesRole = 
        roleFilter === 'all' ? true :
        roleFilter === 'trainee' ? nurse.isTrainee :
        roleFilter === 'in_charge' ? nurse.role.includes('In-Charge') || nurse.role.includes('Superintendent') :
        roleFilter === 'staff' ? !nurse.isTrainee && !nurse.role.includes('In-Charge') : true;

      const matchesWard = 
        selectedWardId === 'all' ? true : nurse.wardId === selectedWardId;

      return matchesSearch && matchesRole && matchesWard;
    });
  }, [nurses, searchQuery, roleFilter, selectedWardId]);

  // Compute daily shift coverage
  const dailyCoverage = useMemo(() => {
    const coverage: Record<number, { M: number; E: number; N: number; total: number; leaves: number }> = {};
    
    daysInMonth.forEach((day) => {
      let m = 0;
      let e = 0;
      let n = 0;
      let leaves = 0;

      nurses.forEach((nurse) => {
        const shift = matrix[nurse.id]?.[day]?.shift;
        if (shift === 'M') m++;
        else if (shift === 'E') e++;
        else if (shift === 'N') n++;
        else if (['OFF', 'L', 'CL', 'SL', 'CO', 'EL', 'ML'].includes(shift)) leaves++;
      });

      coverage[day] = { M: m, E: e, N: n, total: m + e + n, leaves };
    });

    return coverage;
  }, [nurses, matrix]);

  // Compute per-nurse totals
  const nurseStats = useMemo(() => {
    const stats: Record<string, { M: number; E: number; N: number; OFF: number; leaves: number }> = {};
    
    nurses.forEach((nurse) => {
      let m = 0;
      let e = 0;
      let n = 0;
      let off = 0;
      let leaves = 0;

      daysInMonth.forEach((day) => {
        const shift = matrix[nurse.id]?.[day]?.shift;
        if (shift === 'M') m++;
        else if (shift === 'E') e++;
        else if (shift === 'N') n++;
        else if (shift === 'OFF') off++;
        else if (['L', 'CL', 'SL', 'CO', 'EL', 'ML'].includes(shift)) leaves++;
      });

      stats[nurse.id] = { M: m, E: e, N: n, OFF: off, leaves };
    });

    return stats;
  }, [nurses, matrix]);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Emp ID', 'Nurse Name', 'Role', ...daysInMonth.map(d => `Day ${d}`), 'Total M', 'Total E', 'Total N', 'Total Off/Leave'];
    const rows = nurses.map(n => {
      const stats = nurseStats[n.id] || { M: 0, E: 0, N: 0, OFF: 0, leaves: 0 };
      const shiftCells = daysInMonth.map(d => matrix[n.id]?.[d]?.shift || '-');
      return [
        n.id,
        `"${n.name}"`,
        `"${n.role}"`,
        ...shiftCells,
        stats.M,
        stats.E,
        stats.N,
        stats.OFF + stats.leaves
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kauvery_Nursing_Roster_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Controls Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search nurse or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-44 md:w-56 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Segmented Role Controls (Compliant with Section 1.A) */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                roleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff ({nurses.length})
            </button>
            <button
              onClick={() => setRoleFilter('in_charge')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                roleFilter === 'in_charge'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In-Charge / Sup
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                roleFilter === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Nurses
            </button>
            <button
              onClick={() => setRoleFilter('trainee')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                roleFilter === 'trainee'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trainees (4)
            </button>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 mr-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Morning (M)
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Evening (E)
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Night (N)
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Register
          </button>
        </div>
      </div>

      {/* Official Paper Header for Print / Authentic View */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-rose-700 uppercase font-mono">kauvery hospital</span>
              <span className="text-xs text-slate-400">|</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Duty Roaster for the Month of {selectedMonth}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Department: Critical Care ICU / Ward 4</span>
              <span aria-hidden="true">·</span>
              <span>Total Unit Staff: 13 (Trainees: 4)</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-700 font-medium">NABH Staff Ratio Standard: 1:1 / 1:2</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono text-right">
            <div>CNE list change verified</div>
            <div className="text-amber-700 font-medium">Nov-1 Deepavali Roster In Effect</div>
          </div>
        </div>

        {/* Scrollable High Density Matrix Grid */}
        <div className="overflow-x-auto relative border border-slate-200 rounded-lg bg-slate-50">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                {/* Sticky Left Columns for Nurse Info */}
                <th className="sticky left-0 z-20 bg-slate-100 px-3 py-2 text-left font-semibold text-slate-900 border-r border-slate-300 min-w-[170px] shadow-xs">
                  Staff Nurse Name & ID
                </th>
                <th className="px-2 py-2 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[75px]">
                  Role
                </th>

                {/* Day Columns 1 to 31 */}
                {daysInMonth.map((day) => {
                  const coverage = dailyCoverage[day];
                  const isUnderstaffed = coverage && (coverage.M < 4 || coverage.E < 2 || coverage.N < 1);
                  return (
                    <th
                      key={day}
                      className={`px-1.5 py-2 text-center font-mono font-medium border-r border-slate-200 min-w-[34px] ${
                        day === 5 ? 'bg-teal-100/70 text-teal-900 font-bold' : ''
                      } ${isUnderstaffed ? 'bg-amber-100/50 text-amber-900' : ''}`}
                    >
                      <div className="text-[11px] tabular-nums font-semibold">{day}</div>
                      <div className="text-[9px] text-slate-500 font-normal">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][(day + 3) % 7]}
                      </div>
                    </th>
                  );
                })}

                {/* Summary Totals */}
                <th className="px-2 py-2 text-center font-semibold text-slate-800 border-l-2 border-slate-300 bg-slate-200 min-w-[40px]">
                  M
                </th>
                <th className="px-2 py-2 text-center font-semibold text-slate-800 border-r border-slate-200 bg-slate-200 min-w-[40px]">
                  E
                </th>
                <th className="px-2 py-2 text-center font-semibold text-slate-800 border-r border-slate-200 bg-slate-200 min-w-[40px]">
                  N
                </th>
                <th className="px-2 py-2 text-center font-semibold text-slate-800 bg-slate-200 min-w-[45px]">
                  Off/L
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredNurses.map((nurse, idx) => {
                const stats = nurseStats[nurse.id] || { M: 0, E: 0, N: 0, OFF: 0, leaves: 0 };
                return (
                  <tr key={nurse.id} className="hover:bg-teal-50/30 transition-colors group">
                    {/* Sticky Nurse Name & Employee ID */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50/50 px-3 py-2 border-r border-slate-300 font-medium text-slate-900 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1})</span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                            {nurse.name}
                            {nurse.isTrainee && (
                              <span className="text-[9px] px-1 py-0.2 bg-purple-100 text-purple-800 rounded font-normal">
                                Trainee
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-tight">
                            ID: {nurse.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-2 py-2 text-[11px] text-slate-600 border-r border-slate-200 text-center truncate">
                      {nurse.role === 'Nursing Head' ? 'Head' :
                       nurse.role === 'Shift In-Charge' ? 'In-Chg' :
                       nurse.isTrainee ? 'Trainee' : 'Staff'}
                    </td>

                    {/* Shift cells 1..31 */}
                    {daysInMonth.map((day) => {
                      const dayPlan = matrix[nurse.id]?.[day];
                      const shift = dayPlan?.shift || 'OFF';
                      const config = effectiveShiftConfig[shift] || effectiveShiftConfig.OFF;

                      return (
                        <td
                          key={day}
                          onClick={() => {
                            setActiveCellModal({
                              nurseId: nurse.id,
                              nurseName: nurse.name,
                              date: day,
                              currentShift: shift,
                            });
                          }}
                          title={`${nurse.name} - Day ${day}: ${config.desc} (Click to change)`}
                          className={`p-0.5 text-center border-r border-slate-100 cursor-pointer transition-transform hover:scale-105 select-none ${
                            day === 5 ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div
                            className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-mono text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs hover:shadow-xs`}
                          >
                            {config.label}
                          </div>
                        </td>
                      );
                    })}

                    {/* Summary Totals */}
                    <td className="px-2 py-2 text-center font-mono font-medium text-teal-800 border-l-2 border-slate-300 bg-slate-50 tabular-nums">
                      {stats.M}
                    </td>
                    <td className="px-2 py-2 text-center font-mono font-medium text-amber-800 border-r border-slate-200 bg-slate-50 tabular-nums">
                      {stats.E}
                    </td>
                    <td className="px-2 py-2 text-center font-mono font-medium text-indigo-800 border-r border-slate-200 bg-slate-50 tabular-nums">
                      {stats.N}
                    </td>
                    <td className="px-2 py-2 text-center font-mono font-medium text-rose-800 bg-slate-50 tabular-nums">
                      {stats.OFF + stats.leaves}
                    </td>
                  </tr>
                );
              })}

              {/* Bottom Daily Staffing Summary Row (Morning, Evening, Night Coverage) */}
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-800">
                <td className="sticky left-0 z-10 bg-slate-100 px-3 py-2 border-r border-slate-300 text-xs font-bold text-teal-900 shadow-xs">
                  Morning Staff (M)
                </td>
                <td className="px-2 py-2 text-center text-[10px] text-slate-500 border-r border-slate-200 font-mono">
                  Min: 4
                </td>
                {daysInMonth.map((day) => {
                  const mCount = dailyCoverage[day]?.M || 0;
                  const isSafe = mCount >= 4;
                  return (
                    <td
                      key={day}
                      className={`px-1 py-1.5 text-center font-mono text-xs tabular-nums border-r border-slate-200 ${
                        isSafe ? 'text-teal-900' : 'text-amber-800 bg-amber-100 font-bold'
                      }`}
                    >
                      {mCount}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-slate-200 text-center text-xs text-slate-600 font-mono">
                  Morning target: 4+
                </td>
              </tr>

              <tr className="bg-slate-100 border-t border-slate-200 font-semibold text-slate-800">
                <td className="sticky left-0 z-10 bg-slate-100 px-3 py-2 border-r border-slate-300 text-xs font-bold text-amber-900 shadow-xs">
                  Evening Staff (E)
                </td>
                <td className="px-2 py-2 text-center text-[10px] text-slate-500 border-r border-slate-200 font-mono">
                  Min: 2
                </td>
                {daysInMonth.map((day) => {
                  const eCount = dailyCoverage[day]?.E || 0;
                  const isSafe = eCount >= 2;
                  return (
                    <td
                      key={day}
                      className={`px-1 py-1.5 text-center font-mono text-xs tabular-nums border-r border-slate-200 ${
                        isSafe ? 'text-amber-900' : 'text-rose-800 bg-rose-100 font-bold'
                      }`}
                    >
                      {eCount}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-slate-200 text-center text-xs text-slate-600 font-mono">
                  Evening target: 2+
                </td>
              </tr>

              <tr className="bg-slate-100 border-t border-slate-200 font-semibold text-slate-800">
                <td className="sticky left-0 z-10 bg-slate-100 px-3 py-2 border-r border-slate-300 text-xs font-bold text-indigo-900 shadow-xs">
                  Night Staff (N)
                </td>
                <td className="px-2 py-2 text-center text-[10px] text-slate-500 border-r border-slate-200 font-mono">
                  Min: 2
                </td>
                {daysInMonth.map((day) => {
                  const nCount = dailyCoverage[day]?.N || 0;
                  const isSafe = nCount >= 2;
                  return (
                    <td
                      key={day}
                      className={`px-1 py-1.5 text-center font-mono text-xs tabular-nums border-r border-slate-200 ${
                        isSafe ? 'text-indigo-900' : 'text-amber-800 bg-amber-100 font-bold'
                      }`}
                    >
                      {nCount}
                    </td>
                  );
                })}
                <td colSpan={4} className="bg-slate-200 text-center text-xs text-slate-600 font-mono">
                  Night target: 2+
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend bar */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-900">Shift Codes:</span>
            {Object.entries(effectiveShiftConfig).map(([code, cfg]) => (
              <span key={code} className="inline-flex items-center gap-1">
                <span className={`w-4 h-4 rounded text-[10px] font-mono font-bold flex items-center justify-center border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {cfg.label}
                </span>
                <span className="text-[11px] text-slate-600">{code}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Click any shift cell to edit duty code or log double duty.</span>
          </div>
        </div>
      </div>

      {/* Quick Shift Assignment Modal */}
      {activeCellModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Shift Assignment
                </h3>
                <p className="text-xs text-slate-500">
                  {activeCellModal.nurseName} · Day {activeCellModal.date} of {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => setActiveCellModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1">
              {Object.keys(effectiveShiftConfig).map((code) => {
                const cfg = effectiveShiftConfig[code];
                const isSelected = activeCellModal.currentShift === code;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      onUpdateShift(activeCellModal.nurseId, activeCellModal.date, code as ShiftCode);
                      setActiveCellModal(null);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                      {code}
                    </span>
                    <span className="text-[9px] text-slate-500 line-clamp-1">
                      {cfg.desc.split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveCellModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
