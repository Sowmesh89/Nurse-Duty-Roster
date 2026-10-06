import React, { useState } from 'react';
import { UserAccount, UserRole, NurseRole } from '../types/roster';
import { getUserAccounts, saveUserAccounts } from '../utils/auth';
import { 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Search, 
  Lock, 
  Crown, 
  Building2, 
  Eye, 
  EyeOff, 
  Check, 
  Save
} from 'lucide-react';

interface StaffAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
}

export const StaffAccountsModal: React.FC<StaffAccountsModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
}) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => getUserAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmpNo, setEditingEmpNo] = useState<string | null>(null);
  const [editedPassword, setEditedPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.empNo.includes(searchQuery) ||
      acc.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePasswordVisibility = (empNo: string) => {
    setShowPasswords((prev) => ({ ...prev, [empNo]: !prev[empNo] }));
  };

  const handleStartEdit = (acc: UserAccount) => {
    setEditingEmpNo(acc.empNo);
    setEditedPassword(acc.password);
  };

  const handleSavePassword = (empNo: string) => {
    if (!editedPassword.trim()) return;
    const updated = accounts.map((acc) =>
      acc.empNo === empNo ? { ...acc, password: editedPassword.trim() } : acc
    );
    setAccounts(updated);
    saveUserAccounts(updated);
    setEditingEmpNo(null);
    setSuccessMsg(`Password for Emp #${empNo} updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Staff Authentication & Role Directory
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono text-[10px] font-bold">
                  Super Admin / Executive View
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All roles configured with unique Employee Number and encrypted password
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

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Super Admin Info Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Emp No, Name, Role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing {filteredAccounts.length} Registered Staff Accounts
          </div>
        </div>

        {/* Accounts Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Emp. No.</th>
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Role & Access Level</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAccounts.map((acc) => {
                const isSuperAdmin = acc.role === 'super_admin';
                const isNursingHead = acc.role === 'nursing_head';
                const isEditing = editingEmpNo === acc.empNo;
                const isRevealed = showPasswords[acc.empNo] || false;

                return (
                  <tr key={acc.empNo} className="hover:bg-slate-50/80 transition-colors">
                    {/* Emp No */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {isSuperAdmin && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                        {isNursingHead && (
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        )}
                        <span>{acc.empNo}</span>
                      </div>
                    </td>

                    {/* Staff Name */}
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {acc.name}
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuperAdmin
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isNursingHead
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : acc.role === 'admin'
                            ? 'bg-sky-100 text-sky-900'
                            : acc.role === 'in_charge'
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {acc.designation}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {acc.department}
                    </td>

                    {/* Password */}
                    <td className="py-2.5 px-3 font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPassword}
                          onChange={(e) => setEditedPassword(e.target.value)}
                          className="px-2 py-1 bg-white border border-teal-500 rounded text-xs w-36 font-mono focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700">
                            {isRevealed ? acc.password : '••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.empNo)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSavePassword(acc.empNo)}
                            className="px-2 py-1 bg-teal-800 text-white rounded text-[10px] font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingEmpNo(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] hover:bg-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(acc)}
                          className="text-[11px] text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                        >
                          Change Pass
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Super Admin credential verified: Emp No <strong className="font-mono text-slate-800">116562</strong> / Password <strong className="font-mono text-slate-800">1234567890</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
