import React, { useState } from 'react';
import { DailyManpowerRecord, UserRole } from '../types/roster';
import { 
  Plus, 
  Download, 
  Printer, 
  Edit3, 
  Check, 
  AlertCircle, 
  Users, 
  FileSpreadsheet,
  Activity
} from 'lucide-react';

interface DailyManpowerSheetProps {
  records: DailyManpowerRecord[];
  onAddRecord: (record: DailyManpowerRecord) => void;
  onUpdateRecord: (date: number, record: Partial<DailyManpowerRecord>) => void;
  userRole: UserRole;
  selectedMonth: string;
}

export const DailyManpowerSheet: React.FC<DailyManpowerSheetProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
  userRole,
  selectedMonth,
}) => {
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New record form state
  const [newDate, setNewDate] = useState<number>(records.length + 1);
  const [bedOccM, setBedOccM] = useState<number>(12);
  const [bedOccE, setBedOccE] = useState<number>(12);
  const [bedOccN, setBedOccN] = useState<number>(11);
  const [plannedM, setPlannedM] = useState<number>(4);
  const [plannedE, setPlannedE] = useState<number>(2);
  const [plannedN, setPlannedN] = useState<number>(2);
  const [pullInN, setPullInN] = useState<number>(0);
  const [pullOutE, setPullOutE] = useState<number>(0);
  const [doubleDuty, setDoubleDuty] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('Standard ICU shift handover');

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: DailyManpowerRecord = {
      date: newDate,
      month: selectedMonth,
      department: 'Critical Care ICU',
      totalNursesForUnit: 10,
      traineeCount: 4,
      inChargeSupCount: 1,
      shiftOccupancy: { M: bedOccM, E: bedOccE, N: bedOccN },
      totalNursesPlanned: { M: plannedM, E: plannedE, N: plannedN },
      pullIn: { M: 0, E: 0, N: pullInN },
      pullOut: { M: 0, E: pullOutE, N: 0 },
      doubleDuty,
      offCount: 1,
      slCount: 0,
      clCount: 0,
      compOffCount: 0,
      matLevCount: 0,
      lwpElCount: 0,
      absentCount: 0,
      remarks,
    };
    onAddRecord(newRecord);
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Date', 'Unit Total', 'Trainees', 'In-Charge', 
      'Bed Occ M', 'Bed Occ E', 'Bed Occ N', 
      'Planned M', 'Planned E', 'Planned N', 
      'Pull-In M', 'Pull-In E', 'Pull-In N', 
      'Pull-Out M', 'Pull-Out E', 'Pull-Out N', 
      'Double Duty', 'OFF', 'SL', 'CL', 'Comp Off', 'Mat Lev', 'LWP/EL', 'Absent', 'Remarks'
    ];
    const rows = records.map(r => [
      r.date, r.totalNursesForUnit, r.traineeCount, r.inChargeSupCount,
      r.shiftOccupancy.M, r.shiftOccupancy.E, r.shiftOccupancy.N,
      r.totalNursesPlanned.M, r.totalNursesPlanned.E, r.totalNursesPlanned.N,
      r.pullIn.M, r.pullIn.E, r.pullIn.N,
      r.pullOut.M, r.pullOut.E, r.pullOut.N,
      r.doubleDuty, r.offCount, r.slCount, r.clCount, r.compOffCount, r.matLevCount, r.lwpElCount, r.absentCount,
      `"${r.remarks}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Nursing_Manpower_Utilisation_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Quick Metrics */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-rose-700 uppercase font-mono">Kauvery Hospital</span>
            <span className="text-xs text-slate-400">|</span>
            <h2 className="text-base font-bold text-slate-900">Daily Nursing Manpower Utilisation Register</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            NABH / JCI compliant clinical manpower tracking, bed occupancy correlation & redeployment log
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'nurse' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Day Manpower
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Register
          </button>
        </div>
      </div>

      {/* Sheet Container Replicating Physical Format in Attached Images */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="border border-slate-300 rounded-lg overflow-x-auto bg-slate-50/50">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Main Super-Headers */}
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
                <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-300 min-w-[50px] bg-slate-200">
                  Date
                </th>
                <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-300 min-w-[60px]">
                  Total Nurses for Unit
                </th>
                <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-300 min-w-[55px]">
                  Trainee
                </th>
                <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-300 min-w-[65px]">
                  IC/Sup/ Nurse charge
                </th>
                <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-300 bg-teal-50 text-teal-900">
                  Shift Bed Occupancy
                </th>
                <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-300 bg-sky-50 text-sky-900">
                  Total Nurses Planned
                </th>
                <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-300 bg-emerald-50 text-emerald-900">
                  Pull-in
                </th>
                <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-300 bg-rose-50 text-rose-900">
                  Pull-out
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[45px]">
                  Double Duty
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[40px]">
                  OFF
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[38px]">
                  SL
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[38px]">
                  CL
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[48px]">
                  Comp. Off
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[40px]">
                  Mat. lev
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[45px]">
                  LWP / EL
                </th>
                <th rowSpan={2} className="px-1.5 py-2 text-center border-r border-slate-200 min-w-[45px]">
                  Absent
                </th>
                <th rowSpan={2} className="px-3 py-2 text-left min-w-[200px]">
                  Remarks & Shift Sign-off
                </th>
              </tr>

              {/* Sub-Headers for M, E, N */}
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-mono text-[11px]">
                {/* Occupancy M, E, N */}
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-teal-50/70">M</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-teal-50/70">E</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-300 bg-teal-50/70">N</th>

                {/* Planned M, E, N */}
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-sky-50/70">M</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-sky-50/70">E</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-300 bg-sky-50/70">N</th>

                {/* Pull-In M, E, N */}
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-emerald-50/70">M</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-emerald-50/70">E</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-300 bg-emerald-50/70">N</th>

                {/* Pull-Out M, E, N */}
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-rose-50/70">M</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-200 bg-rose-50/70">E</th>
                <th className="px-1.5 py-1 text-center border-r border-slate-300 bg-rose-50/70">N</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {records.map((record) => {
                const totalWorking = record.totalNursesPlanned.M + record.totalNursesPlanned.E + record.totalNursesPlanned.N + (record.pullIn.M + record.pullIn.E + record.pullIn.N) - (record.pullOut.M + record.pullOut.E + record.pullOut.N);
                const avgOcc = Math.round((record.shiftOccupancy.M + record.shiftOccupancy.E + record.shiftOccupancy.N) / 3);
                
                return (
                  <tr key={record.date} className="hover:bg-teal-50/20 transition-colors">
                    <td className="px-2 py-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300 bg-slate-50 tabular-nums">
                      {record.date}
                    </td>
                    <td className="px-2 py-2 text-center font-mono border-r border-slate-200 tabular-nums font-semibold text-slate-800">
                      {record.totalNursesForUnit}
                    </td>
                    <td className="px-2 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-700">
                      {record.traineeCount}
                    </td>
                    <td className="px-2 py-2 text-center font-mono border-r border-slate-300 tabular-nums text-slate-700">
                      {record.inChargeSupCount}
                    </td>

                    {/* Occupancy M, E, N */}
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-teal-900 font-semibold bg-teal-50/30">
                      {record.shiftOccupancy.M}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-teal-900 font-semibold bg-teal-50/30">
                      {record.shiftOccupancy.E}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-300 tabular-nums text-teal-900 font-semibold bg-teal-50/30">
                      {record.shiftOccupancy.N}
                    </td>

                    {/* Planned M, E, N */}
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-sky-900 font-bold bg-sky-50/30">
                      {record.totalNursesPlanned.M}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-sky-900 font-bold bg-sky-50/30">
                      {record.totalNursesPlanned.E}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-300 tabular-nums text-sky-900 font-bold bg-sky-50/30">
                      {record.totalNursesPlanned.N}
                    </td>

                    {/* Pull-In M, E, N */}
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-emerald-800">
                      {record.pullIn.M > 0 ? `+${record.pullIn.M}` : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-emerald-800">
                      {record.pullIn.E > 0 ? `+${record.pullIn.E}` : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-300 tabular-nums text-emerald-800">
                      {record.pullIn.N > 0 ? `+${record.pullIn.N}` : '-'}
                    </td>

                    {/* Pull-Out M, E, N */}
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-rose-800">
                      {record.pullOut.M > 0 ? `-${record.pullOut.M}` : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-rose-800">
                      {record.pullOut.E > 0 ? `-${record.pullOut.E}` : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-300 tabular-nums text-rose-800">
                      {record.pullOut.N > 0 ? `-${record.pullOut.N}` : '-'}
                    </td>

                    {/* Leaves & Exceptions */}
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-800">
                      {record.doubleDuty > 0 ? <span className="font-bold text-amber-700">{record.doubleDuty}</span> : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-800">
                      {record.offCount > 0 ? record.offCount : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-800">
                      {record.slCount > 0 ? <span className="text-purple-700 font-semibold">{record.slCount}</span> : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-800">
                      {record.clCount > 0 ? <span className="text-rose-700 font-semibold">{record.clCount}</span> : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-800">
                      {record.compOffCount > 0 ? <span className="text-sky-700 font-semibold">{record.compOffCount}</span> : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-500">
                      {record.matLevCount > 0 ? record.matLevCount : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-500">
                      {record.lwpElCount > 0 ? record.lwpElCount : '-'}
                    </td>
                    <td className="px-1.5 py-2 text-center font-mono border-r border-slate-200 tabular-nums text-slate-500">
                      {record.absentCount > 0 ? <span className="text-red-700 font-bold">{record.absentCount}</span> : '-'}
                    </td>

                    {/* Remarks */}
                    <td className="px-3 py-2 text-slate-700 truncate max-w-xs text-[11px]">
                      {record.remarks}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Information */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Superintendent Review:</span>
            <span>Verified by Sathika (Emp ID: 129513)</span>
            <span aria-hidden="true">·</span>
            <span>Unit: Critical Care ICU</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            NABH Hospital Manpower Formula: Ratio = (Active Nurses) / (Patient Census)
          </div>
        </div>
      </div>

      {/* Modal to Log Day Manpower Record */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Log Daily Manpower Utilisation
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date (Day of Month)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newDate}
                    onChange={(e) => setNewDate(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    disabled
                    value="Critical Care ICU"
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shift Bed Occupancy (M / E / N)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Morning (12)"
                    value={bedOccM}
                    onChange={(e) => setBedOccM(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Evening (12)"
                    value={bedOccE}
                    onChange={(e) => setBedOccE(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Night (11)"
                    value={bedOccN}
                    onChange={(e) => setBedOccN(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nurses Planned for Shift (M / E / N)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Morning (4)"
                    value={plannedM}
                    onChange={(e) => setPlannedM(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Evening (2)"
                    value={plannedE}
                    onChange={(e) => setPlannedE(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Night (2)"
                    value={plannedN}
                    onChange={(e) => setPlannedN(parseInt(e.target.value) || 0)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pull-In (Night)</label>
                  <input
                    type="number"
                    value={pullInN}
                    onChange={(e) => setPullInN(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pull-Out (Evening)</label>
                  <input
                    type="number"
                    value={pullOutE}
                    onChange={(e) => setPullOutE(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Double Duty</label>
                  <input
                    type="number"
                    value={doubleDuty}
                    onChange={(e) => setDoubleDuty(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shift Handover Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Pull-in from Ward 2 for post-CABG ventilation weaning..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
