import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { LandingAuthView } from './components/Auth/LandingAuthView';
import { TutorDashboard } from './components/Tutor/TutorDashboard';
import { StudentDashboard } from './components/Student/StudentDashboard';
import { ParentDashboard } from './components/Parent/ParentDashboard';
import { ToastContainer } from './components/Common/Toast';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Primary Header Navbar */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentUser ? (
          <>
            {currentUser.role === 'tutor' && <TutorDashboard />}
            {currentUser.role === 'student' && <StudentDashboard />}
            {currentUser.role === 'parent' && <ParentDashboard />}
          </>
        ) : (
          <LandingAuthView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            EduPortal Tuition Management System • All Rights Reserved
          </p>
          <p className="text-slate-400 font-medium">
            Secure Role-Based Attendance, Fees & Progress Portal
          </p>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
