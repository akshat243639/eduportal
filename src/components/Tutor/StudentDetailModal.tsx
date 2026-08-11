import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  Award,
  Plus,
  BarChart2,
  FileText
} from 'lucide-react';
import { AttendanceStatus, FeeStatus } from '../../types';

interface StudentDetailModalProps {
  studentId: string | null;
  batchId: string;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  batchId,
  onClose,
}) => {
  const {
    allProfiles,
    batches,
    attendance,
    fees,
    progress,
    markAttendance,
    addFeeRecord,
    updateFeeStatus,
    addProgress,
    addToast
  } = useApp();

  // Active Tab inside student modal
  const [activeTab, setActiveTab] = useState<'attendance' | 'fees' | 'progress'>('attendance');

  // Attendance Form state
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('Present');
  const [attNotes, setAttNotes] = useState('');

  // Fee Form state
  const [feeMonth, setFeeMonth] = useState('August 2026');
  const [feeAmount, setFeeAmount] = useState<number>(150);
  const [feeDueDate, setFeeDueDate] = useState('2026-08-15');
  const [feeStatusVal, setFeeStatusVal] = useState<FeeStatus>('Pending');

  // Progress Form state
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState<number>(85);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [remarks, setRemarks] = useState('');

  if (!studentId) return null;

  const student = allProfiles.find(p => p.id === studentId);
  const batch = batches.find(b => b.id === batchId);

  // Filter student specific records for this batch
  const studentAttendance = attendance.filter(a => a.student_id === studentId && a.batch_id === batchId);
  const studentFees = fees.filter(f => f.student_id === studentId && f.batch_id === batchId);
  const studentProgress = progress.filter(p => p.student_id === studentId && p.batch_id === batchId);

  // Calculated Stats
  const totalAttSessions = studentAttendance.length;
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attRate = totalAttSessions > 0 ? Math.round((presentCount / totalAttSessions) * 100) : 100;

  const totalFeesCount = studentFees.length;
  const paidFeesCount = studentFees.filter(f => f.status === 'Paid').length;

  const avgScore =
    studentProgress.length > 0
      ? Math.round(
          studentProgress.reduce((acc, curr) => acc + (curr.score / curr.total_marks) * 100, 0) /
            studentProgress.length
        )
      : null;

  // Handlers
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attDate) {
      addToast('Please select a date', 'error');
      return;
    }
    markAttendance(batchId, studentId, attDate, attStatus, attNotes);
    setAttNotes('');
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeMonth || !feeAmount) {
      addToast('Please provide fee month and amount', 'error');
      return;
    }
    addFeeRecord(batchId, studentId, feeMonth, feeAmount, feeDueDate, feeStatusVal);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName) {
      addToast('Please enter test name', 'error');
      return;
    }
    addProgress(batchId, studentId, testName, testDate, Number(score), Number(totalMarks), remarks);
    setTestName('');
    setRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center shrink-0">
              {student?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">
                  {student?.full_name || 'Enrolled Student'}
                </h3>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  Student Record
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {batch?.batch_name} ({batch?.subject}) • {student?.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Performance Stats Bar */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-center">
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Attendance Rate
            </p>
            <p className="text-lg font-black text-blue-900 mt-0.5">{attRate}%</p>
            <p className="text-[10px] text-blue-600 font-medium">
              {presentCount}/{totalAttSessions} Sessions
            </p>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Fees Clearance
            </p>
            <p className="text-lg font-black text-emerald-900 mt-0.5">
              {paidFeesCount}/{totalFeesCount} Paid
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">
              {totalFeesCount - paidFeesCount} Pending
            </p>
          </div>

          <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100 text-center">
            <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              Avg. Test Score
            </p>
            <p className="text-lg font-black text-purple-900 mt-0.5">
              {avgScore !== null ? `${avgScore}%` : 'N/A'}
            </p>
            <p className="text-[10px] text-purple-600 font-medium">
              {studentProgress.length} Tests Recorded
            </p>
          </div>
        </div>

        {/* Modal Tab Controls */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance Log</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'fees'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fees Management</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Academic Progress</span>
          </button>
        </div>

        {/* Modal Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          
          {/* TAB 1: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Mark Attendance Form */}
              <form onSubmit={handleSaveAttendance} className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Mark Session Attendance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={attDate}
                      onChange={e => setAttDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={attStatus}
                      onChange={e => setAttStatus(e.target.value as AttendanceStatus)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    >
                      <option value="Present">Present ✅</option>
                      <option value="Absent">Absent ❌</option>
                      <option value="Late">Late ⏳</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tutor Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Participated well"
                      value={attNotes}
                      onChange={e => setAttNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Save Attendance Record
                </button>
              </form>

              {/* Attendance Log Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Session Attendance History ({studentAttendance.length})
                </h4>
                {studentAttendance.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">
                    No attendance recorded yet for this student.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {studentAttendance.map(a => (
                      <div key={a.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {a.status === 'Present' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          {a.status === 'Absent' && <XCircle className="w-4 h-4 text-rose-600" />}
                          {a.status === 'Late' && <Clock className="w-4 h-4 text-amber-500" />}
                          <div>
                            <p className="font-bold text-slate-900">{a.date}</p>
                            {a.notes && <p className="text-[11px] text-slate-500">{a.notes}</p>}
                          </div>
                        </div>

                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              {/* Record Fee Form */}
              <form onSubmit={handleSaveFee} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-3">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Log / Update Tuition Fee Record
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Billing Month
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. August 2026"
                      value={feeMonth}
                      onChange={e => setFeeMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={feeAmount}
                      onChange={e => setFeeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={feeDueDate}
                      onChange={e => setFeeDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={feeStatusVal}
                      onChange={e => setFeeStatusVal(e.target.value as FeeStatus)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Paid">Paid ✅</option>
                      <option value="Pending">Pending ⏳</option>
                      <option value="Overdue">Overdue ⚠️</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Save Fee Record
                </button>
              </form>

              {/* Fee History Ledger */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Fee Statement History ({studentFees.length})
                </h4>
                {studentFees.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">
                    No fee records logged yet for this slot.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {studentFees.map(f => (
                      <div key={f.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{f.month}</span>
                            <span className="font-bold text-emerald-700">${f.amount}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Due: {f.due_date} {f.paid_date ? `• Paid on ${f.paid_date}` : ''}
                            {f.receipt_no && ` • Receipt: ${f.receipt_no}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                              f.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : f.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {f.status}
                          </span>

                          {f.status !== 'Paid' && (
                            <button
                              onClick={() => updateFeeStatus(f.id, 'Paid')}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESS */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Add Test Progress Form */}
              <form onSubmit={handleSaveProgress} className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Record Test / Assessment Score
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Test / Exam Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 2 Integration Test"
                      value={testName}
                      onChange={e => setTestName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Test Date
                    </label>
                    <input
                      type="date"
                      required
                      value={testDate}
                      onChange={e => setTestDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      required
                      value={score}
                      onChange={e => setScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      required
                      value={totalMarks}
                      onChange={e => setTotalMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teacher Feedback & Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Clear concept understanding, work on speed."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Save Progress Record
                </button>
              </form>

              {/* Progress History Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Academic Test History ({studentProgress.length})
                </h4>
                {studentProgress.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">
                    No test scores recorded yet for this student.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {studentProgress.map(p => {
                      const pct = Math.round((p.score / p.total_marks) * 100);
                      return (
                        <div key={p.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{p.test_name}</p>
                              <p className="text-[11px] text-slate-500">{p.test_date}</p>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-purple-900">
                                {p.score} / {p.total_marks}
                              </span>
                              <span className="ml-2 text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                {pct}%
                              </span>
                            </div>
                          </div>

                          {p.remarks && (
                            <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 border border-slate-100 italic">
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
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
