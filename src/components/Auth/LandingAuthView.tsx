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
import { signInWithGoogle } from '../../firebase';

export const LandingAuthView: React.FC = () => {
  const { registerUser, allProfiles, setCurrentUser, addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [childEmail, setChildEmail] = useState('');
  const [showQuickAccounts, setShowQuickAccounts] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { user } = await signInWithGoogle();
      if (user) {
        const userEmail = user.email || `${user.uid}@gmail.com`;
        const userFullName = user.displayName || 'Google User';

        const profile = registerUser(userFullName, userEmail, role, childEmail);
        addToast(`Signed in with Google as ${userFullName}`, 'success');
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      const code = err?.code;
      if (code === 'auth/unauthorized-domain') {
        addToast(
          'Firebase Domain Error: Please add "akshat243639.github.io" under Firebase Console -> Authentication -> Settings -> Authorized Domains.',
          'error'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        addToast('Google Sign-in popup was closed.', 'info');
      } else if (code === 'auth/popup-blocked') {
        addToast('Sign-in popup blocked by browser. Please allow popups.', 'warning');
      } else {
        addToast(`Google Sign-in error: ${err?.message || 'Failed to authenticate'}`, 'error');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

            {/* Google Sign In Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-3 text-xs sm:text-sm"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-extrabold text-slate-400">
                  <span className="bg-white px-2">Or continue with Email</span>
                </div>
              </div>
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
