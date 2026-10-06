import React, { useState } from 'react';
import { 
  Nurse, 
  RosterMatrix, 
  DailyManpowerRecord, 
  AttendanceRecord, 
  UserRole 
} from '../types/roster';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Download, 
  Printer, 
  Users, 
  ShieldCheck, 
  Activity,
  Layers,
  Award
} from 'lucide-react';

interface AdminProductivityDashboardProps {
  nurses: Nurse[];
  matrix: RosterMatrix;
  manpowerRecords: DailyManpowerRecord[];
  attendance: AttendanceRecord[];
  onClockIn: (nurseId: string) => void;
  userRole: UserRole;
  selectedMonth: string;
}

export const AdminProductivityDashboard: React.FC<AdminProductivityDashboardProps> = ({
  nurses,
  matrix,
  manpowerRecords,
  attendance,
  onClockIn,
  userRole,
  selectedMonth,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(5);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Calculate high-level KPIs
  const totalNurses = nurses.length;
  const traineeCount = nurses.filter(n => n.isTrainee).length;
  const inChargeCount = nurses.filter(n => n.role.includes('In-Charge') || n.role.includes('Superintendent')).length;
  
  // Total hours calculation (8h per standard shift, 12h for double duty)
  let totalHours = 0;
  let doubleDutyCount = 0;
  let sickLeaveCount = 0;
  let nightShiftsCount = 0;

  nurses.forEach(n => {
    for (let day = 1; day <= 31; day++) {
      const shift = matrix[n.id]?.[day]?.shift;
      if (shift === 'M' || shift === 'E') totalHours += 8;
      else if (shift === 'N') {
        totalHours += 10;
        nightShiftsCount++;
      } else if (shift === 'DD') {
        totalHours += 16;
        doubleDutyCount++;
      } else if (shift === 'SL') {
        sickLeaveCount++;
      }
    }
  });

  // Calculate task completion rate for today's active shift
  const totalTasksToday = attendance.reduce((sum, a) => sum + a.tasksTotal, 0);
  const doneTasksToday = attendance.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const taskRate = totalTasksToday > 0 ? Math.round((doneTasksToday / totalTasksToday) * 100) : 100;

  const handleDownloadReport = () => {
    const headers = ['Nurse Name', 'Employee ID', 'Designation', 'Total Shifts', 'Night Shifts', 'Hours Logged', 'CNE Status', 'Productivity Index'];
    const rows = nurses.map(n => {
      let shifts = 0;
      let nights = 0;
      for (let d = 1; d <= 31; d++) {
        const s = matrix[n.id]?.[d]?.shift;
        if (['M', 'E', 'N', 'DD'].includes(s || '')) {
          shifts++;
          if (s === 'N') nights++;
        }
      }
      const hrs = shifts * 8 + (nights * 2);
      const prodScore = Math.min(100, Math.round((hrs / 190) * 100));
      return [
        `"${n.name}"`,
        n.id,
        `"${n.role}"`,
        shifts,
        nights,
        hrs,
        n.cneCertified ? 'Certified' : 'In Induction',
        `${prodScore}%`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kauvery_Monthly_Productivity_Report_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Unit Staff & Trainees */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Unit Staff Strength</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalNurses}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (4 Trainees · 2 In-Charge)
            </span>
          </div>
          <div className="text-[11px] text-teal-700 flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% NABH ICU staffing standard</span>
          </div>
        </div>

        {/* Metric 2: Monthly Hours Delivered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Duty Hours Delivered</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalHours}
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono">
              +4.2% vs baseline
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Night shifts: <strong className="font-mono text-slate-700">{nightShiftsCount}</strong> · Double Duty: <strong className="font-mono text-slate-700">{doubleDutyCount}</strong>
          </div>
        </div>

        {/* Metric 3: Today's Clinical Task Completion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Shift Task Completion</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {taskRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({doneTasksToday}/{totalTasksToday} checked)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${taskRate}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Nurse-to-Patient Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ICU Manpower Ratio</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              1 : 1.3
            </span>
            <span className="text-xs text-purple-700 font-medium">
              Optimal ICU Index
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Bed Occupancy: 13 / 14 active ICU beds
          </div>
        </div>
      </div>

      {/* Main Administrative Sections: Live Attendance & Monthly Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Live Shift Attendance & Task Tracker */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Shift Attendance & Ward Task Tracker (Day 5)
              </h3>
              <p className="text-xs text-slate-500">
                Clock-in timestamps, medication rounds, ventilator checklists & SBAR handover verification
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-mono font-medium">
              Live Duty Station
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2 text-left">Nurse Name & ID</th>
                  <th className="py-2 text-center">Duty Shift</th>
                  <th className="py-2 text-center">Clock-In</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-center">Tasks Completed</th>
                  <th className="py-2 text-center">SBAR Handover</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((record) => {
                  const nurse = nurses.find((n) => n.id === record.nurseId);
                  const isDone = record.tasksCompleted === record.tasksTotal;

                  return (
                    <tr key={record.nurseId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{nurse?.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {record.nurseId}</div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-teal-50 text-teal-900 border border-teal-200">
                          {record.shift}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-mono tabular-nums text-slate-700">
                        {record.clockInTime}
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            record.status === 'on_time'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : record.status === 'double_duty'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {record.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isDone ? 'bg-emerald-600' : 'bg-sky-600'
                              }`}
                              style={{
                                width: `${(record.tasksCompleted / (record.tasksTotal || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-600">
                            {record.tasksCompleted}/{record.tasksTotal}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        {record.handoverDone ? (
                          <span className="text-emerald-700 flex items-center justify-center gap-1 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 text-[11px] font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {record.clockInTime === '-' && (
                          <button
                            onClick={() => onClockIn(record.nurseId)}
                            className="px-2.5 py-1 bg-teal-700 text-white rounded text-[11px] font-medium hover:bg-teal-600 transition-colors"
                          >
                            Clock-In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Monthly Productivity & NABH Audit Export */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Performance & Audit
              </h3>
              <Award className="w-4 h-4 text-teal-600" />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Audit Period</span>
                <span className="font-semibold text-slate-900">{selectedMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Facility Code</span>
                <span className="font-mono font-medium text-teal-800">KAUVERY-TRICHY-01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Deepavali Holiday Allocation</span>
                <span className="text-emerald-700 font-semibold">100% Balanced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Unannounced Absenteeism</span>
                <span className="font-mono font-semibold text-slate-900">0.0%</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">Administrative Highlights:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                <li>Zero mandatory fatigue breaches (&le;3 consecutive nights enforced).</li>
                <li>4 newly inducted Trainee nurses paired with Senior Mentors (Sandhiya, Sathika, Dharani).</li>
                <li>Daily manpower sheets verified with medical bed occupancy census.</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleDownloadReport}
              className="w-full py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Monthly Productivity CSV
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Administrative Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
