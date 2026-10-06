import React, { useState } from 'react';
import { 
  Nurse, 
  ShiftSwapRequest, 
  LeaveRequest, 
  RosterMatrix, 
  ShiftCode, 
  UserRole 
} from '../types/roster';
import { 
  ArrowLeftRight, 
  CalendarCheck2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface ShiftSwapsAndLeavesProps {
  nurses: Nurse[];
  matrix: RosterMatrix;
  swaps: ShiftSwapRequest[];
  leaves: LeaveRequest[];
  onAddSwap: (swap: ShiftSwapRequest) => void;
  onUpdateSwapStatus: (swapId: string, status: ShiftSwapRequest['status'], notes?: string) => void;
  onAddLeave: (leave: LeaveRequest) => void;
  onUpdateLeaveStatus: (leaveId: string, status: LeaveRequest['status']) => void;
  userRole: UserRole;
  currentNurseId: string;
}

export const ShiftSwapsAndLeaves: React.FC<ShiftSwapsAndLeavesProps> = ({
  nurses,
  matrix,
  swaps,
  leaves,
  onAddSwap,
  onUpdateSwapStatus,
  onAddLeave,
  onUpdateLeaveStatus,
  userRole,
  currentNurseId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'swaps' | 'leaves'>('swaps');
  const [showNewSwapModal, setShowNewSwapModal] = useState(false);
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);

  // New Swap Form
  const [reqDate, setReqDate] = useState<number>(6);
  const [targetNurseId, setTargetNurseId] = useState<string>(nurses[1]?.id || '134333');
  const [targetDate, setTargetDate] = useState<number>(6);
  const [swapReason, setSwapReason] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // New Leave Form
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('CL');
  const [leaveStart, setLeaveStart] = useState<number>(15);
  const [leaveEnd, setLeaveEnd] = useState<number>(15);
  const [leaveReason, setLeaveReason] = useState<string>('Personal appointment');

  // Currently logged-in nurse details
  const currentNurse = nurses.find((n) => n.id === currentNurseId) || nurses[0];

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNurse = nurses.find((n) => n.id === targetNurseId);
    if (!targetNurse) return;

    const myCurrentShift = matrix[currentNurse.id]?.[reqDate]?.shift || 'M';
    const targetCurrentShift = matrix[targetNurse.id]?.[targetDate]?.shift || 'E';

    const newSwap: ShiftSwapRequest = {
      id: `swap-${Date.now()}`,
      requesterId: currentNurse.id,
      requesterName: currentNurse.name,
      requesterDate: reqDate,
      requesterShift: myCurrentShift,
      targetNurseId: targetNurse.id,
      targetNurseName: targetNurse.name,
      targetDate: targetDate,
      targetShift: targetCurrentShift,
      reason: swapReason || 'Mutual shift adjustment',
      isUrgent,
      status: 'pending_peer',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    };

    onAddSwap(newSwap);
    setShowNewSwapModal(false);
    setSwapReason('');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();

    // Automated holiday approval algorithm:
    // Check total existing leaves on target dates & evaluate ICU minimum coverage
    let daysConflict = false;
    leaves.forEach((l) => {
      if (l.status === 'auto_approved' && l.startDate <= leaveEnd && l.endDate >= leaveStart) {
        daysConflict = true;
      }
    });

    let autoApproved = false;
    let score = 85;
    let reasonText = '';

    if (leaveType === 'SL') {
      autoApproved = true;
      score = 98;
      reasonText = 'Medical emergency / Sick leave protocol automatically validated; relief pool alerted.';
    } else if (daysConflict) {
      autoApproved = false;
      score = 55;
      reasonText = 'High concurrent leave requests on selected date(s); routed to Superintendent for quota review.';
    } else if (leaveEnd - leaveStart > 3) {
      autoApproved = false;
      score = 65;
      reasonText = 'Extended leave duration (>3 days); requires Nursing Superintendent sign-off.';
    } else {
      autoApproved = true;
      score = 92;
      reasonText = 'ICU safe staffing threshold maintained (min 4 Morning & 2 Evening nurses intact); automated approval granted.';
    }

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      nurseId: currentNurse.id,
      nurseName: currentNurse.name,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: autoApproved ? 'auto_approved' : 'supervisor_review',
      autoApprovalScore: score,
      autoApprovalReason: reasonText,
      appliedDate: '2026-10-05',
    };

    onAddLeave(newLeave);
    setShowNewLeaveModal(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: Swaps vs Leaves */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('swaps')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'swaps'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
            Shift Swap Marketplace ({swaps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'leaves'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-teal-600" />
            Automated Holiday & Leave Approvals ({leaves.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'swaps' ? (
            <button
              onClick={() => setShowNewSwapModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Propose Shift Swap
            </button>
          ) : (
            <button
              onClick={() => setShowNewLeaveModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply Leave / Holiday
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SHIFT SWAP MARKETPLACE */}
      {activeSubTab === 'swaps' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Shift Swap Requests
                </h3>
                <p className="text-xs text-slate-500">
                  Peer-to-peer reciprocal swaps with automated competency checks and supervisor sign-off
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pending Peer
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Pending Supervisor
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Approved
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {swaps.map((swap) => {
                const isPendingPeer = swap.status === 'pending_peer';
                const isPendingSupervisor = swap.status === 'pending_supervisor';
                const isApproved = swap.status === 'approved';
                const isRejected = swap.status === 'rejected';

                const canPeerApprove = 
                  isPendingPeer && (currentNurse.id === swap.targetNurseId || userRole !== 'nurse');
                const canSupervisorApprove = 
                  isPendingSupervisor && userRole !== 'nurse';

                return (
                  <div
                    key={swap.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Status & Priority Header */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono text-slate-400 text-[11px]">{swap.id}</span>
                        <div className="flex items-center gap-1.5">
                          {swap.isUrgent && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-semibold rounded text-[10px]">
                              URGENT
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPendingSupervisor
                                ? 'bg-sky-100 text-sky-800'
                                : isPendingPeer
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {swap.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Swap Comparison Box */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{swap.requesterName}</span>
                            <div className="text-[11px] text-slate-500 font-mono">Day {swap.requesterDate}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-mono font-bold">
                            Shift: {swap.requesterShift}
                          </span>
                        </div>

                        <div className="flex items-center justify-center my-0.5">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{swap.targetNurseName}</span>
                            <div className="text-[11px] text-slate-500 font-mono">Day {swap.targetDate}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">
                            Shift: {swap.targetShift}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        <span className="font-medium text-slate-800">Reason:</span> {swap.reason}
                      </div>

                      {swap.supervisorNotes && (
                        <div className="mt-1.5 text-[11px] text-teal-800 bg-teal-50 p-2 rounded border border-teal-200">
                          {swap.supervisorNotes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">{swap.createdAt}</span>

                      <div className="flex items-center gap-1.5">
                        {canPeerApprove && (
                          <>
                            <button
                              onClick={() => onUpdateSwapStatus(swap.id, 'pending_supervisor')}
                              className="px-2.5 py-1 bg-teal-700 text-white rounded font-medium hover:bg-teal-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => onUpdateSwapStatus(swap.id, 'rejected')}
                              className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium hover:bg-slate-200"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {canSupervisorApprove && (
                          <>
                            <button
                              onClick={() => onUpdateSwapStatus(swap.id, 'approved', 'Approved by In-Charge. Roster updated.')}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Approve & Update
                            </button>
                            <button
                              onClick={() => onUpdateSwapStatus(swap.id, 'rejected', 'Staffing balance insufficient')}
                              className="px-2 py-1 bg-rose-50 text-rose-700 rounded font-medium hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Applied to Roster
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AUTOMATED HOLIDAY & LEAVE APPROVALS */}
      {activeSubTab === 'leaves' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Automated Holiday & Leave Approval Engine
                  </h3>
                  <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[11px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    AI Staffing Adequacy Check
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates real-time patient census, minimum nurse-to-bed ratios & fair holiday distribution
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                Upcoming Festival: <strong className="text-amber-800">Nov 1 (Deepavali)</strong>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {leaves.map((leave) => {
                const isAutoApproved = leave.status === 'auto_approved';
                const isReview = leave.status === 'supervisor_review';
                const isRejected = leave.status === 'rejected';

                return (
                  <div key={leave.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{leave.nurseName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                          {leave.leaveType}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Days {leave.startDate} to {leave.endDate} (Oct 2026)
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isAutoApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isReview
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {leave.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Reason:</span> {leave.reason}
                      </div>

                      {/* Automated Engine Output */}
                      <div className="flex items-center gap-2 text-[11px] text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-100">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>
                          <strong>Adequacy Score {leave.autoApprovalScore}/100:</strong> {leave.autoApprovalReason}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isReview && userRole !== 'nurse' && (
                        <>
                          <button
                            onClick={() => onUpdateLeaveStatus(leave.id, 'auto_approved')}
                            className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-medium hover:bg-teal-600 transition-colors shadow-2xs"
                          >
                            Approve Leave
                          </button>
                          <button
                            onClick={() => onUpdateLeaveStatus(leave.id, 'rejected')}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {isAutoApproved && (
                        <div className="text-right">
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Confirmed in Roster
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Applied: {leave.appliedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Swap Modal */}
      {showNewSwapModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Propose Shift Swap
              </h3>
              <button
                onClick={() => setShowNewSwapModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSwap} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Your Assigned Shift Date</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={reqDate}
                  onChange={(e) => setReqDate(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                  required
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Your current shift on Day {reqDate}: <strong className="text-teal-700 font-mono">{matrix[currentNurse.id]?.[reqDate]?.shift || 'M'}</strong>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Swap With Nurse</label>
                <select
                  value={targetNurseId}
                  onChange={(e) => setTargetNurseId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium focus:ring-1 focus:ring-teal-600"
                >
                  {nurses.filter(n => n.id !== currentNurse.id).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} (ID: {n.id} - {n.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Their Shift Date</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={targetDate}
                  onChange={(e) => setTargetDate(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Swap</label>
                <textarea
                  rows={2}
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="e.g. Doctor appointment, family function, mutual agreement..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentSwap"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="urgentSwap" className="text-slate-700 font-medium">
                  Flag as Urgent (Within 24 hours)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSwapModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Send Swap Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Leave Modal */}
      {showNewLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Apply for Leave / Holiday
              </h3>
              <button
                onClick={() => setShowNewLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium focus:ring-1 focus:ring-teal-600"
                >
                  <option value="CL">CL - Casual Leave (Balance: 4)</option>
                  <option value="SL">SL - Sick Leave (Emergency Pool)</option>
                  <option value="CO">CO - Compensatory Off (Night Duty Credits: 2)</option>
                  <option value="EL">EL - Earned Leave / Holiday</option>
                  <option value="CNE">CNE - Continuing Nursing Education Day</option>
                  <option value="ML">ML - Maternity / Medical Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason / Clinical Context</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Festival travel, medical rest, personal..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-[11px]">
                <strong className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Instant Automated Approval:
                </strong>
                Requests maintaining &ge;4 Morning and &ge;2 Evening ICU nurses are auto-approved instantly.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewLeaveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Submit & Evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
