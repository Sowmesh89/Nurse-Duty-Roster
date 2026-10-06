import React from 'react';
import { PushNotification } from '../types/roster';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  ArrowLeftRight, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: PushNotification) => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full h-[550px] flex flex-col justify-between animate-in slide-in-from-right-8">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Shift & Duty Notifications
              </h3>
              <p className="text-[11px] text-slate-500">
                Push alerts & automated handover reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Notification Stream */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bell className="w-8 h-8 stroke-1 mb-2 opacity-40" />
              <p className="font-medium text-slate-600">All Caught Up</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No new shift alerts or swap requests
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isShift = notif.type === 'shift_reminder';
              const isSwap = notif.type === 'swap_alert';
              const isEmergency = notif.type === 'emergency';

              return (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick(notif)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    !notif.read
                      ? 'bg-teal-50/40 border-teal-200 ring-1 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {isShift && <Clock className="w-3.5 h-3.5 text-teal-600" />}
                      {isSwap && <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600" />}
                      {isEmergency && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {notif.body}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>

          <button
            onClick={onClearAll}
            className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
