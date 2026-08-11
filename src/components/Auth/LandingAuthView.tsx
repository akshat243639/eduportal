import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  UserCheck,
  GraduationCap,
  Users,
  Mail,
  Lock,
  User,
  Link as LinkIcon,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  BarChart2,
  Calendar,
  Sparkles,
  Rocket
} from 'lucide-react';
import { UserRole } from '../../types';

export const LandingAuthView: React.FC = () => {
  const { registerUser, allProfiles, setCurrentUser, addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [childEmail, setChildEmail] = useState('');
  const [showQuickAccounts, setShowQuickAccounts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('Please provide both email and password', 'error');
      return;
    }

    if (mode === 'register') {
      if (!fullName) {
        addToast('Please enter your full name', 'error');
        return;
      }

      if (role === 'parent' && !childEmail) {
        addToast('Please enter your child\'s student email address', 'warning');
      }

      const user = registerUser(fullName, email, role, childEmail);
      if (user) {
        addToast(`Account created successfully! Welcome, ${fullName}`, 'success');
      }
    } else {
      // Login flow
      const existing = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setCurrentUser(existing);
        addToast(`Welcome back, ${existing.full_name}!`, 'success');
      } else {
        addToast(`No account found for "${email}". Creating new account form below.`, 'info');
        setMode('register');
      }
    }
  };

  const handleQuickAccountSelect = (selectedEmail: string) => {
    const account = allProfiles.find(p => p.email.toLowerCase() === selectedEmail.toLowerCase());
    if (account) {
      setCurrentUser(account);
      addToast(`Logged in as ${account.full_name} (${account.role})`, 'success');
    }
  };

  return (
    <div className="py-6 space-y-12 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Branding & Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-900 border border-blue-200 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Complete All-In-One Tuition Management System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Streamline Tuition Classes, Attendance & Fee Records
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            EduPortal connects Tutors, Students, and Parents into a unified platform. Track daily attendance, assign homework, record test scores, and collect fees effortlessly.
          </p>

          {/* Core Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">For Tutors</h4>
              <p className="text-[11px] text-slate-500">Manage batches, attendance registers & fee receipts.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">For Students</h4>
              <p className="text-[11px] text-slate-500">Submit homework, view schedules & check test results.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900">For Parents</h4>
              <p className="text-[11px] text-slate-500">Monitor child attendance & track fee payment status.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xl relative overflow-hidden space-y-6">
            
            <div className="flex border-b border-slate-100 text-sm font-bold gap-4 pb-3">
              <button
                onClick={() => setMode('login')}
                className={`pb-2 border-b-2 transition-all ${
                  mode === 'login'
                    ? 'border-blue-600 text-blue-900 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`pb-2 border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-blue-600 text-blue-900 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-blue-950">
                {mode === 'login' ? 'Account Log In' : 'New User Registration'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Enter your credentials to access your tuition portal'
                  : 'Select your role to create your personal EduPortal account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Prof. David Miller"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Type / Role:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('tutor')}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          role === 'tutor'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Tutor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          role === 'student'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('parent')}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          role === 'parent'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Parent</span>
                      </button>
                    </div>
                  </div>

                  {role === 'parent' && (
                    <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 space-y-1">
                      <label className="block text-xs font-bold text-blue-900">
                        Child Student's Email Address
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={childEmail}
                          onChange={e => setChildEmail(e.target.value)}
                          placeholder="e.g. alex.johnson@eduportal.com"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-blue-200 rounded-lg text-xs focus:border-blue-500 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-blue-700">
                        Links your account to your child's attendance and fee records.
                      </p>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                <span>{mode === 'register' ? 'Register Account' : 'Log In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Credentials Dropdown (Hidden by default for production) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {showQuickAccounts ? 'Quick Sign-In (Testing):' : 'Demo Mode Access'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickAccounts(!showQuickAccounts)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  {showQuickAccounts ? 'Hide Quick Sign-In' : 'Show Demo Sign-In'}
                </button>
              </div>

              {showQuickAccounts && (
                <div className="grid grid-cols-3 gap-1.5 text-[11px] mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAccountSelect('david.miller@eduportal.com')}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-medium border border-slate-200 text-center truncate"
                    title="Tutor Account"
                  >
                    Tutor Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAccountSelect('alex.johnson@eduportal.com')}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg font-medium border border-slate-200 text-center truncate"
                    title="Student Account"
                  >
                    Student Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAccountSelect('sarah.johnson@eduportal.com')}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg font-medium border border-slate-200 text-center truncate"
                    title="Parent Account"
                  >
                    Parent Account
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
