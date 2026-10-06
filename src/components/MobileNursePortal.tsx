import React, { useState } from 'react';
import { 
  Nurse, 
  RosterMatrix, 
  ShiftCode, 
  PushNotification 
} from '../types/roster';
import { 
  Smartphone, 
  Clock, 
  MapPin, 
  Bell, 
  Calendar, 
  ArrowLeftRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Coffee,
  ChevronRight
} from 'lucide-react';

interface MobileNursePortalProps {
  nurses: Nurse[];
  matrix: RosterMatrix;
  currentNurseId: string;
  onSelectNurse: (id: string) => void;
  onClockIn: (nurseId: string) => void;
  onRequestSwap: () => void;
  onApplyLeave: () => void;
  onTriggerTestPush: (title: string, body: string) => void;
}

export const MobileNursePortal: React.FC<MobileNursePortalProps> = ({
  nurses,
  matrix,
  currentNurseId,
  onSelectNurse,
  onClockIn,
  onRequestSwap,
  onApplyLeave,
  onTriggerTestPush,
}) => {
  const [clockedIn, setClockedIn] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const nurse = nurses.find((n) => n.id === currentNurseId) || nurses[0];

  // Upcoming 7 days shift schedule
  const todayDate = 5;
  const upcomingDays = [5, 6, 7, 8, 9, 10, 11];

  const todayShift = matrix[nurse.id]?.[todayDate]?.shift || 'M';
  const tomorrowShift = matrix[nurse.id]?.[todayDate + 1]?.shift || 'OFF';

  const handleMobileClockIn = () => {
    setClockedIn(true);
    onClockIn(nurse.id);
    onTriggerTestPush(
      'Attendance Verified',
      `Clock-in confirmed for ${nurse.name} at Critical Care ICU. Have a safe shift!`
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-8">
      {/* Mobile Header / Identity Card */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              {nurse.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">{nurse.name}</h2>
              <div className="text-[11px] text-teal-200 font-mono">
                ID: {nurse.id} · {nurse.role}
              </div>
            </div>
          </div>

          {/* Quick Staff Switcher for demo */}
          <select
            value={nurse.id}
            onChange={(e) => onSelectNurse(e.target.value)}
            className="text-xs bg-teal-950/60 text-teal-100 border border-teal-700/60 rounded-lg px-2 py-1 focus:outline-none"
            aria-label="Switch Nurse Profile"
          >
            {nurses.map((n) => (
              <option key={n.id} value={n.id} className="text-slate-900">
                {n.name} ({n.id})
              </option>
            ))}
          </select>
        </div>

        {/* Current Active Duty Banner */}
        <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-teal-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Today's Duty (Day {todayDate})
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-teal-950 font-bold font-mono text-xs">
              Shift {todayShift}
            </span>
          </div>

          <div className="text-sm font-semibold">
            {todayShift === 'M' ? 'Morning Shift · 07:00 AM - 03:30 PM' :
             todayShift === 'E' ? 'Evening Shift · 01:30 PM - 09:30 PM' :
             todayShift === 'N' ? 'Night Shift · 09:00 PM - 07:30 AM' :
             'Scheduled Rest Day (OFF)'}
          </div>

          <div className="flex items-center justify-between text-[11px] text-teal-200 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Kauvery Hospital · ICU Ward 4
            </span>
            <span>Beds 1 to 4</span>
          </div>
        </div>

        {/* 1-Tap Geofenced Clock-In */}
        <div>
          {clockedIn ? (
            <div className="w-full py-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Clocked In at 06:58 AM (Geofence Verified)
            </div>
          ) : (
            <button
              onClick={handleMobileClockIn}
              className="w-full py-2.5 bg-white text-teal-900 font-bold text-xs rounded-xl shadow-xs hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              One-Tap Mobile Clock-In (Ward Wi-Fi)
            </button>
          )}
        </div>
      </div>

      {/* Push Notifications & Shift Reminders Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900">Push Shift Reminders</h3>
          </div>
          <button
            onClick={() => {
              setPushEnabled(!pushEnabled);
              if (!pushEnabled) {
                onTriggerTestPush('Notifications Activated', 'You will receive reminders 2 hours before upcoming duty shifts.');
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              pushEnabled ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pushEnabled ? 'Active (Push ON)' : 'Muted'}
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Automated browser and device push alerts sent 2 hours before Night Shifts and 12 hours prior to Morning rotations.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onTriggerTestPush('Upcoming Shift Alert', `Reminder for ${nurse.name}: Morning duty starts tomorrow at 07:00 AM at Critical Care ICU.`)}
            className="flex-1 py-1.5 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-1"
          >
            <Send className="w-3 h-3" />
            Send Test Shift Alert
          </button>
        </div>
      </div>

      {/* Quick Mobile Action Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRequestSwap}
          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left shadow-2xs flex flex-col justify-between"
        >
          <ArrowLeftRight className="w-5 h-5 text-teal-600 mb-2" />
          <div>
            <div className="text-xs font-bold text-slate-900">Request Shift Swap</div>
            <div className="text-[10px] text-slate-500">Swap duty with peers</div>
          </div>
        </button>

        <button
          onClick={onApplyLeave}
          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left shadow-2xs flex flex-col justify-between"
        >
          <Calendar className="w-5 h-5 text-sky-600 mb-2" />
          <div>
            <div className="text-xs font-bold text-slate-900">Apply Leave / Comp Off</div>
            <div className="text-[10px] text-slate-500">Instant auto-approval</div>
          </div>
        </button>
      </div>

      {/* Upcoming 7-Day Personal Schedule */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">My 7-Day Duty Rotation</h3>
          <span className="text-[10px] text-slate-400 font-mono">Oct 5 - 11, 2026</span>
        </div>

        <div className="space-y-2">
          {upcomingDays.map((day) => {
            const shift = matrix[nurse.id]?.[day]?.shift || 'OFF';
            const isToday = day === todayDate;

            return (
              <div
                key={day}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  isToday
                    ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 text-center">
                    <div className="font-bold text-slate-900 font-mono">{day}</div>
                    <div className="text-[9px] text-slate-400 uppercase">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(day + 3) % 7]}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      {shift === 'M' ? 'Morning Shift' :
                       shift === 'E' ? 'Evening Shift' :
                       shift === 'N' ? 'Night Shift' :
                       shift === 'OFF' ? 'Weekly Scheduled Off' :
                       shift === 'CL' ? 'Casual Leave' :
                       shift === 'CO' ? 'Compensatory Off' : shift}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {shift === 'M' ? '07:00 - 15:30' :
                       shift === 'E' ? '13:30 - 21:30' :
                       shift === 'N' ? '21:00 - 07:30' : 'Rest period'}
                    </div>
                  </div>
                </div>

                <span
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs border ${
                    shift === 'M' ? 'bg-teal-50 text-teal-900 border-teal-300' :
                    shift === 'E' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                    shift === 'N' ? 'bg-indigo-50 text-indigo-900 border-indigo-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {shift}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
