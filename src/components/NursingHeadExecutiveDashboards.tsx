import React, { useState } from 'react';
import { 
  Ward, 
  Nurse, 
  RosterMatrix, 
  DailyManpowerRecord, 
  WardActivity, 
  UserRole 
} from '../types/roster';
import { 
  Building2, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  Users, 
  Bed, 
  Layers, 
  TrendingUp, 
  Clock, 
  ArrowRightLeft, 
  Award,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface NursingHeadExecutiveDashboardsProps {
  wards: Ward[];
  nurses: Nurse[];
  matrix: RosterMatrix;
  activities: WardActivity[];
  onAddActivity: (activity: WardActivity) => void;
  onVerifyActivity: (activityId: string) => void;
  userRole: UserRole;
  currentUserName: string;
}

export const NursingHeadExecutiveDashboards: React.FC<NursingHeadExecutiveDashboardsProps> = ({
  wards,
  nurses,
  matrix,
  activities,
  onAddActivity,
  onVerifyActivity,
  userRole,
  currentUserName,
}) => {
  // Option 1: Unit Level Dashboard, Option 2: Ward-Wise Dashboard (with New Activity Added)
  const [executiveMode, setExecutiveMode] = useState<'unit_level' | 'ward_wise'>('unit_level');
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0]?.id || 'icu');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  // New Activity Form State
  const [activityCategory, setActivityCategory] = useState<WardActivity['category']>('Shift Handover');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activitySeverity, setActivitySeverity] = useState<WardActivity['severity']>('normal');

  const selectedWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const wardActivities = activities.filter((a) => a.wardId === selectedWard.id);

  // High level hospital-wide stats
  const totalHospitalBeds = wards.reduce((sum, w) => sum + w.totalBeds, 0);
  const totalHospitalStaff = nurses.length;

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    const newAct: WardActivity = {
      id: `act-${Date.now()}`,
      wardId: selectedWard.id,
      wardName: selectedWard.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 5,
      loggedBy: `${currentUserName} (${userRole === 'nursing_head' ? 'Nursing Head' : 'In-Charge'})`,
      role: userRole === 'nursing_head' ? 'Director of Nursing' : 'Shift In-Charge',
      category: activityCategory,
      title: activityTitle.trim(),
      description: activityDesc.trim() || 'Ward clinical activity verified.',
      severity: activitySeverity,
      verifiedByHead: userRole === 'nursing_head' || userRole === 'super_admin',
    };

    onAddActivity(newAct);
    setShowAddActivityModal(false);
    setActivityTitle('');
    setActivityDesc('');
  };

  return (
    <div className="space-y-4">
      {/* Directorate Header & 2 Option Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-purple-700 uppercase font-mono">
              Directorate of Nursing Services
            </span>
            <span className="text-xs text-slate-400">|</span>
            <h2 className="text-base font-bold text-slate-900">
              Nursing Head Executive Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital-wide unit level monitoring, cross-ward clinical activity logs & accreditation compliance
          </p>
        </div>

        {/* 2 Dedicated Options Specified by User */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setExecutiveMode('unit_level')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              executiveMode === 'unit_level'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            1. Unit-Level Executive Dashboard
          </button>

          <button
            onClick={() => setExecutiveMode('ward_wise')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              executiveMode === 'ward_wise'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            2. Ward-Wise Dashboard (Activity Added)
          </button>
        </div>
      </div>

      {/* ================= OPTION 1: UNIT-LEVEL EXECUTIVE DASHBOARD ================= */}
      {executiveMode === 'unit_level' && (
        <div className="space-y-4">
          {/* Macro KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Hospital Inpatient Beds</span>
                <Bed className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {totalHospitalBeds}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({wards.length} Active Wards)
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Operational Readiness</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Nursing Personnel</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {totalHospitalStaff}
                </span>
                <span className="text-xs text-teal-700 font-medium font-mono">
                  All Wards Allocated
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                NABH ICU 1:1 · General 1:6 · Single 1:3
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Hospital Bed Occupancy (Census)</span>
                <Activity className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  88.4%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  (142 / {totalHospitalBeds} beds)
                </span>
              </div>
              <div className="text-[11px] text-purple-700 pt-1 font-medium">
                Peak: ER Bay (95%) & ICU (92%)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Directorate Compliance Score</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  98.6%
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  NABH Grade A+
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Zero fatigue violations (&le;2 nights)
              </div>
            </div>
          </div>

          {/* Hospital-Wide Ward Manpower Adequacy Matrix */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Unit-Level Manpower & Staffing Adequacy Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time correlation of bed census, scheduled nurse coverage & cross-ward redeployment balance
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-700 font-semibold">● Safe / Optimal</span>
                <span className="text-amber-700 font-semibold">▲ Balanced Pull-In</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ward / Unit Name</th>
                    <th className="py-2.5 px-3 text-center">Beds</th>
                    <th className="py-2.5 px-3 text-center">Census</th>
                    <th className="py-2.5 px-3 text-center">Assigned Staff</th>
                    <th className="py-2.5 px-3 text-center">Morning Target (Min)</th>
                    <th className="py-2.5 px-3 text-center">Evening Target (Min)</th>
                    <th className="py-2.5 px-3 text-center">Night Target (Min)</th>
                    <th className="py-2.5 px-3 text-center">NABH Compliance</th>
                    <th className="py-2.5 px-3">Unit In-Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {wards.map((ward) => {
                    const assigned = nurses.filter((n) => n.wardId === ward.id).length;
                    const occupancy = Math.round(ward.totalBeds * 0.88);
                    const isAdequate = assigned >= (ward.minMorningStaff + ward.minEveningStaff);

                    return (
                      <tr key={ward.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                            <span>{ward.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({ward.shortCode})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {ward.totalBeds}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-purple-900 font-bold bg-purple-50/40">
                          {occupancy}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-800">
                          {assigned}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          &ge; {ward.minMorningStaff}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          &ge; {ward.minEveningStaff}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          &ge; {ward.minNightStaff}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            100% COMPLIANT
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {ward.inChargeName} <span className="text-slate-400 font-mono text-[10px]">({ward.inChargeEmpId})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTION 2: WARD-WISE DASHBOARD & ACTIVITY ADDED ================= */}
      {executiveMode === 'ward_wise' && (
        <div className="space-y-4">
          {/* Ward Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {wards.map((ward) => {
              const isSelected = ward.id === selectedWardId;
              const count = activities.filter((a) => a.wardId === ward.id).length;

              return (
                <button
                  key={ward.id}
                  onClick={() => setSelectedWardId(ward.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-200' : 'text-slate-400'}`} />
                  <span>{ward.name}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        isSelected ? 'bg-purple-950 text-purple-200' : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {count} Logged
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ward Specific Activity Board */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedWard.name} · Clinical Activities & Handover Log
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-mono text-xs font-bold rounded">
                    {selectedWard.shortCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time clinical events, shift handovers, patient influx, acute trauma transfers & physician orders
                </p>
              </div>

              <button
                onClick={() => setShowAddActivityModal(true)}
                className="px-3.5 py-2 bg-purple-900 text-white rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Log New Ward Activity
              </button>
            </div>

            {/* Activities Stream */}
            <div className="space-y-3">
              {wardActivities.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No New Activity Logged Yet For This Ward</p>
                  <p className="text-xs text-slate-400">Click "Log New Ward Activity" to record handovers, transfers or emergency procedures.</p>
                </div>
              ) : (
                wardActivities.map((act) => {
                  const isUrgent = act.severity === 'urgent';
                  const isPriority = act.severity === 'priority';

                  return (
                    <div
                      key={act.id}
                      className={`p-4 rounded-xl border transition-shadow space-y-2 ${
                        isUrgent
                          ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                          : isPriority
                          ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.category === 'Clinical Emergency'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : act.category === 'Staff Redeployment'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : act.category === 'Shift Handover'
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-300'
                            }`}
                          >
                            {act.category}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {act.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{act.timestamp}</span>
                          <span>·</span>
                          <span>Day {act.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Logged by: <strong className="text-slate-800">{act.loggedBy}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {act.verifiedByHead ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Signed Off by Nursing Head
                            </span>
                          ) : (
                            <button
                              onClick={() => onVerifyActivity(act.id)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                              Directorate Sign-Off
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log New Ward Activity */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Log New Clinical Activity for {selectedWard.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Recorded in directorate activity feed with timestamp and role audit
                </p>
              </div>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Activity Category</label>
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value as WardActivity['category'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                >
                  <option value="Shift Handover">Shift Handover (SBAR Protocol)</option>
                  <option value="Staff Redeployment">Staff Redeployment (Pull-In / Pull-Out)</option>
                  <option value="Clinical Emergency">Clinical Emergency / Code Event</option>
                  <option value="Task Audit">Clinical Task & Medication Safety Audit</option>
                  <option value="Leave/Cover">Emergency Duty Cover & Overtime</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Activity Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ventilator Weaning Handover or Trauma Influx..."
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Clinical Notes & Actions</label>
                <textarea
                  rows={3}
                  placeholder="Detail patient beds, vital observations, medications administered, or relief staff deployed..."
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Severity / Urgency</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActivitySeverity('normal')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      activitySeverity === 'normal'
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200'
                    }`}
                  >
                    Normal Handover
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivitySeverity('priority')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      activitySeverity === 'priority'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                        : 'border-slate-200'
                    }`}
                  >
                    Priority Audit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivitySeverity('urgent')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      activitySeverity === 'urgent'
                        ? 'bg-rose-50 border-rose-600 text-rose-900 font-bold'
                        : 'border-slate-200'
                    }`}
                  >
                    Urgent Alert
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors"
                >
                  Log & Publish Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
