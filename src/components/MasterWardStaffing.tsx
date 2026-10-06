import React, { useState } from 'react';
import { Ward, Nurse, UserRole, ShiftCode } from '../types/roster';
import { 
  Building2, 
  Plus, 
  Users, 
  Bed, 
  UserPlus, 
  ArrowRightLeft, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MasterWardStaffingProps {
  wards: Ward[];
  nurses: Nurse[];
  onAddWard: (ward: Ward) => void;
  onAddNurseToWard: (nurse: Nurse) => void;
  onTransferNurse: (nurseId: string, newWardId: string) => void;
  onDeleteNurse: (nurseId: string) => void;
  onGenerateAIRoster: (wardId?: string) => void;
  userRole: UserRole;
}

export const MasterWardStaffing: React.FC<MasterWardStaffingProps> = ({
  wards,
  nurses,
  onAddWard,
  onAddNurseToWard,
  onTransferNurse,
  onDeleteNurse,
  onGenerateAIRoster,
  userRole,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0]?.id || 'icu');
  const [showAddWardModal, setShowAddWardModal] = useState(false);
  const [showAddNurseModal, setShowAddNurseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState<Nurse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Ward Form
  const [newWardName, setNewWardName] = useState('');
  const [newWardCode, setNewWardCode] = useState('');
  const [newWardBeds, setNewWardBeds] = useState(20);
  const [newMinM, setNewMinM] = useState(4);
  const [newMinE, setNewMinE] = useState(3);
  const [newMinN, setNewMinN] = useState(2);
  const [newInChargeName, setNewInChargeName] = useState('');
  const [newInChargeEmpId, setNewInChargeEmpId] = useState('');
  const [newWardDesc, setNewWardDesc] = useState('');

  // New Nurse Form
  const [nurseName, setNurseName] = useState('');
  const [nurseEmpId, setNurseEmpId] = useState(`14${Math.floor(1000 + Math.random() * 9000)}`);
  const [nurseRole, setNurseRole] = useState<Nurse['role']>('Staff Nurse');
  const [nurseContact, setNurseContact] = useState('+91 9');
  const [nurseExp, setNurseExp] = useState(3);

  // Transfer Form Target
  const [transferTargetWardId, setTransferTargetWardId] = useState(wards[1]?.id || 'er');

  const currentWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const wardNurses = nurses.filter((n) => n.wardId === currentWard.id);

  const filteredWardNurses = wardNurses.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.includes(searchQuery) ||
      n.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName.trim()) return;

    const slug = newWardName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
    const newWard: Ward = {
      id: slug || `ward_${Date.now()}`,
      name: newWardName.trim(),
      shortCode: newWardCode.toUpperCase() || slug.toUpperCase().slice(0, 4),
      totalBeds: newWardBeds,
      minMorningStaff: newMinM,
      minEveningStaff: newMinE,
      minNightStaff: newMinN,
      inChargeEmpId: newInChargeEmpId || '139047',
      inChargeName: newInChargeName || 'Unit In-Charge',
      color: 'teal',
      description: newWardDesc || 'Newly commissioned hospital clinical ward.',
    };

    onAddWard(newWard);
    setSelectedWardId(newWard.id);
    setShowAddWardModal(false);
    setNewWardName('');
  };

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseName.trim() || !nurseEmpId.trim()) return;

    const newNurse: Nurse = {
      id: nurseEmpId.trim(),
      name: nurseName.trim(),
      role: nurseRole,
      department: currentWard.name,
      wardId: currentWard.id,
      contact: nurseContact,
      email: `${nurseName.toLowerCase().replace(/\s+/g, '')}.${nurseEmpId}@kauveryhospital.com`,
      experienceYears: nurseExp,
      isTrainee: nurseRole === 'Trainee Nurse',
      cneCertified: nurseRole !== 'Trainee Nurse',
      skills: ['Basic Life Support', 'Ward Protocols', 'Clinical Care'],
    };

    onAddNurseToWard(newNurse);
    setShowAddNurseModal(false);
    setNurseName('');
    setNurseEmpId(`14${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleExecuteTransfer = () => {
    if (!showTransferModal) return;
    onTransferNurse(showTransferModal.id, transferTargetWardId);
    setShowTransferModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-rose-700 uppercase font-mono">Kauvery Hospital</span>
            <span className="text-xs text-slate-400">|</span>
            <h2 className="text-base font-bold text-slate-900">
              Master Ward Staffing & Employee Allocation Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administered by Nursing In-Charges & Nursing Head: Employee rosters, ID management & cross-ward transfers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onGenerateAIRoster(selectedWardId)}
            className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="AI generates optimal shift rotations adhering to NABH bed-to-nurse constraints"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            AI Auto-Schedule Ward
          </button>

          <button
            onClick={() => setShowAddNurseModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Staff to {currentWard.shortCode}
          </button>

          <button
            onClick={() => setShowAddWardModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add New Ward
          </button>
        </div>
      </div>

      {/* Ward Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {wards.map((ward) => {
          const isSelected = ward.id === selectedWardId;
          const count = nurses.filter((n) => n.wardId === ward.id).length;

          return (
            <button
              key={ward.id}
              onClick={() => setSelectedWardId(ward.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
              <span>{ward.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  isSelected ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Ward Overview Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{currentWard.name}</h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                Code: {currentWard.shortCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentWard.description}</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Bed className="w-4 h-4 text-teal-600" />
              <span><strong>{currentWard.totalBeds}</strong> Active Beds</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-teal-600" />
              <span><strong>{wardNurses.length}</strong> Assigned Nurses</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="text-[11px] font-mono text-slate-500">
              Min Staff: <span className="text-teal-700 font-bold">M:{currentWard.minMorningStaff}</span> · <span className="text-amber-700 font-bold">E:{currentWard.minEveningStaff}</span> · <span className="text-indigo-700 font-bold">N:{currentWard.minNightStaff}</span>
            </div>
          </div>
        </div>

        {/* Search & Staff Table */}
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff name, Emp ID, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-500">
              In-Charge: <strong className="text-slate-800">{currentWard.inChargeName}</strong> (ID: {currentWard.inChargeEmpId})
            </div>
          </div>

          {/* Nurses Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Emp. ID</th>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">Role / Designation</th>
                  <th className="py-2.5 px-3">Official Contact</th>
                  <th className="py-2.5 px-3">Clinical Competencies</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredWardNurses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No nurses allocated to this ward yet. Click "+ Add Staff" to assign employees.
                    </td>
                  </tr>
                ) : (
                  filteredWardNurses.map((nurse) => (
                    <tr key={nurse.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {nurse.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {nurse.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            nurse.role.includes('In-Charge') || nurse.role.includes('Superintendent')
                              ? 'bg-purple-100 text-purple-900'
                              : nurse.isTrainee
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-teal-100 text-teal-900'
                          }`}
                        >
                          {nurse.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {nurse.contact}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {nurse.skills?.join(', ') || 'General Nursing'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active on Roster
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setShowTransferModal(nurse)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Transfer nurse to another hospital ward"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-teal-700" />
                            Transfer
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove ${nurse.name} (Emp ID: ${nurse.id}) from ${currentWard.name}?`)) {
                                onDeleteNurse(nurse.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove from ward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add New Ward */}
      {showAddWardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Hospital Ward</h3>
              <button
                onClick={() => setShowAddWardModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWard} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Ward Name</label>
                <input
                  type="text"
                  placeholder="e.g. NICU / Dialysis Suite / Cath Lab"
                  value={newWardName}
                  onChange={(e) => setNewWardName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g. NICU"
                    value={newWardCode}
                    onChange={(e) => setNewWardCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    value={newWardBeds}
                    onChange={(e) => setNewWardBeds(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  NABH Minimum Staff Per Shift (M / E / N)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={newMinM}
                    onChange={(e) => setNewMinM(parseInt(e.target.value) || 1)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                    title="Morning Staff Min"
                  />
                  <input
                    type="number"
                    value={newMinE}
                    onChange={(e) => setNewMinE(parseInt(e.target.value) || 1)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                    title="Evening Staff Min"
                  />
                  <input
                    type="number"
                    value={newMinN}
                    onChange={(e) => setNewMinN(parseInt(e.target.value) || 1)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                    title="Night Staff Min"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">In-Charge Lead Name</label>
                  <input
                    type="text"
                    placeholder="Lead Nurse Name"
                    value={newInChargeName}
                    onChange={(e) => setNewInChargeName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">In-Charge Emp ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 135890"
                    value={newInChargeEmpId}
                    onChange={(e) => setNewInChargeEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Scope / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Neonatal intensive care and continuous incubators..."
                  value={newWardDesc}
                  onChange={(e) => setNewWardDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWardModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Create Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Nurse To Current Ward */}
      {showAddNurseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Staff to {currentWard.name}</h3>
                <p className="text-xs text-slate-500">Allocate registered nurse with Employee ID</p>
              </div>
              <button
                onClick={() => setShowAddNurseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNurse} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nurse Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Divya / Karthik"
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employee ID (Emp No)</label>
                  <input
                    type="text"
                    value={nurseEmpId}
                    onChange={(e) => setNurseEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role / Designation</label>
                  <select
                    value={nurseRole}
                    onChange={(e) => setNurseRole(e.target.value as Nurse['role'])}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="Staff Nurse">Staff Nurse</option>
                    <option value="Senior Staff Nurse">Senior Staff Nurse</option>
                    <option value="Shift In-Charge">Shift In-Charge</option>
                    <option value="Trainee Nurse">Trainee Nurse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official Mobile Contact</label>
                  <input
                    type="text"
                    value={nurseContact}
                    onChange={(e) => setNurseContact(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={nurseExp}
                    onChange={(e) => setNurseExp(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddNurseModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Allocate to Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Nurse Between Wards */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Transfer Staff Nurse</h3>
              <button
                onClick={() => setShowTransferModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{showTransferModal.name}</div>
              <div className="font-mono text-slate-500">ID: {showTransferModal.id} · {showTransferModal.role}</div>
              <div className="text-teal-700 font-semibold pt-1">Currently assigned to: {currentWard.name}</div>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="block font-medium text-slate-700">Select Destination Ward</label>
              <select
                value={transferTargetWardId}
                onChange={(e) => setTransferTargetWardId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                {wards.filter(w => w.id !== currentWard.id).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.shortCode} - {w.totalBeds} Beds)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowTransferModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-4 py-2 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
