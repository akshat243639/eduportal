import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserCheck, GraduationCap, Users, Mail, Lock, User, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { registerUser, allProfiles, setCurrentUser, addToast } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [childEmail, setChildEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('Please provide both email and password', 'error');
      return;
    }

    if (isRegistering) {
      if (!fullName) {
        addToast('Please enter your full name', 'error');
        return;
      }

      if (role === 'parent' && !childEmail) {
        addToast('Please enter your child\'s student email address', 'warning');
      }

      const user = registerUser(fullName, email, role, childEmail);
      if (user) {
        onClose();
      }
    } else {
      // Login flow
      const existing = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setCurrentUser(existing);
        addToast(`Welcome back, ${existing.full_name}!`, 'success');
        onClose();
      } else {
        addToast(`No account found for "${email}". Please register below.`, 'error');
        setIsRegistering(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-blue-100 relative overflow-hidden">
        
        {/* Background accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            EP
          </div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight">
            {isRegistering ? 'Create EduPortal Account' : 'Welcome to EduPortal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegistering
              ? 'Select your role and start managing tuitions'
              : 'Log in to access your tuition dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
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
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  I am registering as:
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
                    Child Student's Email (For Parent Monitoring)
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
                    Allows viewing your child's attendance & fee logs instantly.
                  </p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isRegistering ? 'Register & Continue' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-5 text-center pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {isRegistering
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
};
