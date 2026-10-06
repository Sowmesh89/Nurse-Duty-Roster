import React, { useState } from 'react';
import { Nurse, ShiftCode } from '../types/roster';
import { 
  UserCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  GraduationCap, 
  ShieldCheck, 
  Calendar, 
  HeartHandshake,
  Award
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newNurse: Nurse, defaultShift: ShiftCode) => void;
  existingNurses: Nurse[];
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  existingNurses,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState(`14${Math.floor(1000 + Math.random() * 9000)}`);
  const [contact, setContact] = useState('+91 9');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('TNC-2026-');
  const [role, setRole] = useState<Nurse['role']>('Trainee Nurse');
  const [department, setDepartment] = useState('Critical Care ICU');
  const [mentorId, setMentorId] = useState(existingNurses[0]?.id || '139510');
  const [preferredShift, setPreferredShift] = useState<ShiftCode>('M');
  const [cneModules, setCneModules] = useState<{ [key: string]: boolean }>({
    infection_control: true,
    basic_life_support: true,
    ventilator_care: false,
    sbar_handover: true,
    medication_safety: true,
  });

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const newNurse: Nurse = {
      id: empId,
      name: name || 'Newly Inducted Nurse',
      role,
      department,
      wardId: 'icu',
      contact: contact || '+91 98400 12345',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}.${empId}@kauveryhospital.com`,
      experienceYears: role === 'Trainee Nurse' ? 1 : 3,
      mentorId,
      isTrainee: role === 'Trainee Nurse',
      cneCertified: false,
      skills: ['Basic Life Support', 'Vitals Charting', 'Patient Care'],
    };

    onComplete(newNurse, preferredShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" />
              Kauvery Nursing Induction
            </div>
            <h3 className="text-base font-bold text-slate-900">
              New Hire Onboarding Wizard
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  step === i
                    ? 'bg-teal-800 text-white ring-4 ring-teal-100'
                    : step > i
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > i ? '✓' : i}
              </div>
              {i < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step > i ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Forms */}
        <div className="min-h-[260px] text-xs">
          {/* STEP 1: Personal & License */}
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">
                Step 1: Clinical License & Personal Details
              </h4>
              <p className="text-slate-500 text-[11px]">
                Enter statutory nursing council credentials & staff identification.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nurse Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meena / Divya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Employee ID</label>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nursing Council Reg No.</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Mobile Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Role & Mentorship */}
          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">
                Step 2: Department & Mentor Allocation
              </h4>
              <p className="text-slate-500 text-[11px]">
                Assign designated clinical mentor from senior staff for close supervision.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Designation Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Nurse['role'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Trainee Nurse">Trainee Nurse (Under Supervision)</option>
                  <option value="Staff Nurse">Staff Nurse (Registered Nurse)</option>
                  <option value="Senior Staff Nurse">Senior Staff Nurse</option>
                  <option value="Shift In-Charge">Shift In-Charge</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Senior Clinical Mentor</label>
                <select
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  {existingNurses.filter(n => !n.isTrainee).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} (Emp ID: {n.id} · {n.role})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 mt-1">
                  Mentor will review clinical logs, medication admin & SBAR handovers.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Shift Rotation Preferences */}
          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">
                Step 3: Shift Rotation & Availability
              </h4>
              <p className="text-slate-500 text-[11px]">
                Configure initial shift cycle and adherence to maximum fatigue limits.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Initial Shift Orientation</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredShift('M')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      preferredShift === 'M' ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    Morning (M)
                    <div className="text-[10px] text-slate-500 font-normal">07:00 - 15:30</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredShift('E')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      preferredShift === 'E' ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    Evening (E)
                    <div className="text-[10px] text-slate-500 font-normal">13:30 - 21:30</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredShift('N')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      preferredShift === 'N' ? 'border-indigo-700 bg-indigo-50 text-indigo-900 font-bold' : 'border-slate-200'
                    }`}
                  >
                    Night (N)
                    <div className="text-[10px] text-slate-500 font-normal">21:00 - 07:30</div>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800">Fatigue & Safety Protocol:</div>
                <div className="text-slate-600 text-[11px]">
                  ✓ Trainees must complete 14 days of supervised Morning/Evening shifts prior to independent Night duty.
                </div>
                <div className="text-slate-600 text-[11px]">
                  ✓ Max 2 consecutive night rotations strictly enforced.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Mandatory CNE Checklist */}
          {step === 4 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">
                Step 4: CNE Induction Training Modules
              </h4>
              <p className="text-slate-500 text-[11px]">
                Verify hospital safety certifications before placing nurse on active duty.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'infection_control', label: 'NABH Infection Control & Hand Hygiene' },
                  { id: 'basic_life_support', label: 'Basic Life Support (BLS) & Code Blue Drill' },
                  { id: 'medication_safety', label: 'High-Alert Medication & Double Check Protocol' },
                  { id: 'sbar_handover', label: 'SBAR Clinical Shift Handover Standard' },
                  { id: 'ventilator_care', label: 'ICU Ventilator & Arterial Line Observation' },
                ].map((mod) => (
                  <label
                    key={mod.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={cneModules[mod.id]}
                      onChange={(e) =>
                        setCneModules({ ...cneModules, [mod.id]: e.target.checked })
                      }
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="font-medium text-slate-800">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert('Please enter the nurse full name');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2 bg-teal-800 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-2xs"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Induction & Add to Roster
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
