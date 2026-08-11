import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, LogOut, LogIn, UserPlus, ShieldAlert, GraduationCap, UserCheck, Users } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { currentUser, setCurrentUser, addToast } = useApp();

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('Logged out successfully', 'info');
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'tutor':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'parent':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'tutor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'parent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-900">
                EduPortal
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200 hidden sm:inline-block">
                Tuition Suite
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 hidden md:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firebase Cloud Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Attendance • Fees • Homework • Progress Tracker
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active User Info & Controls */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-slate-50 p-1.5 pl-3 rounded-2xl border border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {currentUser.email}
                </p>
              </div>

              <span
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl border capitalize ${getRoleBadgeColor(
                  currentUser.role
                )}`}
              >
                {getRoleIcon(currentUser.role)}
                <span>{currentUser.role}</span>
              </span>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
