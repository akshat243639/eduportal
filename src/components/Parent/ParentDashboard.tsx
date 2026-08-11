import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  BarChart2,
  Calendar,
  DollarSign,
  Award,
  Link as LinkIcon,
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const {
    currentUser,
    allProfiles,
    batches,
    attendance,
    fees,
    progress,
    linkChild,
    addToast
  } = useApp();

  const [studentEmailInput, setStudentEmailInput] = useState('');

  // Parent user details
  const parentProfile = currentUser;
  const childId = parentProfile?.child_id;

  // Find linked child profile
  const childProfile = allProfiles.find(p => p.id === childId);

  // Filter child specific logs
  const childAttendance = attendance.filter(a => a.student_id === childId);
  const childFees = fees.filter(f => f.student_id === childId);
  const childProgress = progress.filter(p => p.student_id === childId);

  // Calculated Stats for Child
  const totalAttSessions = childAttendance.length;
  const presentCount = childAttendance.filter(a => a.status === 'Present').length;
  const lateCount = childAttendance.filter(a => a.status === 'Late').length;
  const absentCount = childAttendance.filter(a => a.status === 'Absent').length;

  const attRate = totalAttSessions > 0 ? Math.round((presentCount / totalAttSessions) * 100) : 100;

  const totalFeeAmount = childFees.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingFeeAmount = childFees
    .filter(f => f.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const avgTestScore =
    childProgress.length > 0
      ? Math.round(
          childProgress.reduce((acc, curr) => acc + (curr.score / curr.total_marks) * 100, 0) /
            childProgress.length
        )
      : null;

  const handleLinkChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmailInput || !parentProfile) return;

    const res = linkChild(parentProfile.id, studentEmailInput);
    if (res.success) {
      setStudentEmailInput('');
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Parent Hero Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                Parent Portal
              </span>
              <span className="text-blue-200 text-xs">
                Child Performance Tracker
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {parentProfile?.full_name || 'Parent'}
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              Monitor your child's tuition attendance history, test progress scores, and fee payment schedule.
            </p>
          </div>

          {/* Linked Child Card or Link Form */}
          {childProfile ? (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white text-blue-900 font-black text-xl flex items-center justify-center shadow-md">
                {childProfile.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">
                  Monitoring Child
                </p>
                <h3 className="font-extrabold text-white text-base">
                  {childProfile.full_name}
                </h3>
                <p className="text-xs text-blue-100">{childProfile.email}</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleLinkChildSubmit}
              className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 space-y-2 max-w-sm w-full"
            >
              <label className="block text-xs font-bold text-blue-100 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-indigo-300" />
                <span>Link Child Student Email</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.johnson@eduportal.com"
                  value={studentEmailInput}
                  onChange={e => setStudentEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-slate-900 font-medium rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
                >
                  Link
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {!childProfile ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-blue-100 shadow-xs max-w-xl mx-auto space-y-3">
          <Users className="w-12 h-12 text-blue-300 mx-auto" />
          <h3 className="text-xl font-black text-blue-900">No Child Linked Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please enter your child's registered student email address above to view their tuition attendance, test marks, and fee payment receipts.
          </p>
        </div>
      ) : (
        <>
          {/* Child Performance Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Child Attendance Rate
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{attRate}%</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  {presentCount} Present • {lateCount} Late • {absentCount} Absent
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Academic Test Score
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {avgTestScore !== null ? `${avgTestScore}%` : 'N/A'}
                </p>
                <p className="text-xs text-purple-600 font-semibold mt-0.5">
                  Across {childProgress.length} Evaluated Tests
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fee Status
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  ${pendingFeeAmount} <span className="text-xs font-medium text-slate-500">Pending</span>
                </p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">
                  Total Paid: ${totalFeeAmount - pendingFeeAmount}
                </p>
              </div>
            </div>

          </div>

          {/* Detailed Logs Grid: Attendance, Progress, Fees */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Child Attendance Register */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-blue-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Child Attendance Register</span>
                </h3>
                <span className="text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full">
                  {childAttendance.length} Sessions Recorded
                </span>
              </div>

              {childAttendance.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No attendance records logged for your child yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {childAttendance.map(a => {
                    const batch = batches.find(b => b.id === a.batch_id);
                    return (
                      <div
                        key={a.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {a.status === 'Present' && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {a.status === 'Absent' && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          {a.status === 'Late' && (
                            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                          )}

                          <div>
                            <p className="font-extrabold text-slate-900">{a.date}</p>
                            <p className="text-[11px] text-slate-500">
                              Slot: {batch?.batch_name || 'Tuition Slot'}
                              {a.notes && ` • ${a.notes}`}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`font-bold px-3 py-1 rounded-full text-xs ${
                            a.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'Absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Academic Progress & Test Performance */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-blue-950 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Academic Progress & Test Marks</span>
                </h3>
                <span className="text-xs font-bold bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full">
                  {childProgress.length} Tests
                </span>
              </div>

              {childProgress.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No test evaluation reports published yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {childProgress.map(p => {
                    const pct = Math.round((p.score / p.total_marks) * 100);
                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              {p.batch_name || 'Subject Test'}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">
                              {p.test_name}
                            </h4>
                            <p className="text-[10px] text-slate-400">Date: {p.test_date}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-purple-900">
                              {p.score}/{p.total_marks}
                            </span>
                            <span className="ml-2 text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {p.remarks && (
                          <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 italic">
                            <strong className="not-italic text-purple-900 font-bold">
                              Teacher Feedback:
                            </strong>{" "}
                            "{p.remarks}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Child Fee Ledger */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-blue-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Child Tuition Fee Ledger & Receipts</span>
              </h3>
            </div>

            {childFees.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No fee invoices issued for your child.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {childFees.map(f => (
                  <div
                    key={f.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{f.month}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          f.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Fee Amount: <strong className="text-emerald-700 font-black">${f.amount}</strong>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Due: {f.due_date} {f.paid_date ? `• Paid on ${f.paid_date}` : ''}
                    </p>

                    {f.receipt_no && (
                      <p className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 p-1.5 rounded-lg">
                        Receipt: {f.receipt_no}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
