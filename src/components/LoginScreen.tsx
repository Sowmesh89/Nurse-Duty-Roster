import React, { useState } from 'react';
import { UserAccount } from '../types/roster';
import { authenticateUser } from '../utils/auth';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Crown,
  HeartPulse
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [empNo, setEmpNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = authenticateUser(empNo, password);
      setIsLoading(false);

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Invalid Employee Number or Password. Please verify credentials.');
      }
    }, 400);
  };

  const handleQuickFill = (demoEmpNo: string, demoPass: string) => {
    setEmpNo(demoEmpNo);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Medical Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Hospital Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/20 ring-4 ring-teal-500/20">
            <span className="font-extrabold text-2xl tracking-tighter">KC</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-teal-400 font-mono">
            <span>Kauvery Hospital</span>
            <span aria-hidden="true">·</span>
            <span>Trichy</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NurseRoster & Manpower Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Secure clinical duty scheduling, real-time shift swaps, and daily manpower utilization
          </p>
        </div>

        {/* Primary Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-slate-700/80 shadow-2xl space-y-5">
          <div className="border-b border-slate-700/60 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Staff Authentication</span>
              <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                TLS 1.3 / AES-GCM
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Employee Number (Emp. No.)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. 116562 or 139510"
                  value={empNo}
                  onChange={(e) => setEmpNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Clinical Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                Quick Role Credentials:
              </span>
              <span className="text-[10px]">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {/* Super Admin Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('116562', '1234567890')}
                className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-teal-500/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-teal-400 font-bold">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: <span className="text-white">116562</span>
                </div>
                <div className="text-[9px] text-teal-300/80">Pass: 1234567890</div>
              </button>

              {/* Nursing Head Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('110001', 'head123')}
                className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-purple-400 font-bold">
                  <Building2 className="w-3 h-3 text-purple-400" />
                  <span>Nursing Head</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: <span className="text-white">110001</span>
                </div>
                <div className="text-[9px] text-purple-300/80">Pass: head123</div>
              </button>

              {/* Shift In-Charge Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('139047', 'dharani@139047')}
                className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-sky-400 font-bold">
                  <span>Shift In-Charge</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Dharani (<span className="text-white">139047</span>)
                </div>
                <div className="text-[9px] text-sky-300/80">Pass: dharani@139047</div>
              </button>

              {/* Staff Nurse Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('139510', 'sandhiya@139510')}
                className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span>Staff Nurse</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Sandhiya (<span className="text-white">139510</span>)
                </div>
                <div className="text-[9px] text-emerald-300/80">Pass: sandhiya@139510</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p>Kauvery Hospital Integrated Nursing Management System · NABH Accredited</p>
          <p className="text-slate-400 font-mono text-[10px]">
            Protected Health Information (PHI) · Authorized Clinical Staff Only
          </p>
        </div>
      </div>
    </div>
  );
};
