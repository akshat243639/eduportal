import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  KeyRound,
  Megaphone,
  FileText,
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  CheckSquare,
  Square,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Send,
  X,
  QrCode,
  Video,
  ExternalLink
} from 'lucide-react';
import { AttachmentViewer } from '../Common/AttachmentViewer';
import { UpiPaymentModal } from './UpiPaymentModal';
import { readFileAsDataUrl } from '../../utils/fileHelpers';
import { FeeRecord } from '../../types';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    allProfiles,
    batches,
    enrollments,
    announcements,
    homework,
    fees,
    progress,
    attendance,
    doubts,
    joinBatch,
    addDoubt,
    addToast
  } = useApp();

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [completedHwIds, setCompletedHwIds] = useState<string[]>([]);

  // ASK / Doubt Form State
  const [doubtBatchId, setDoubtBatchId] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [doubtImage, setDoubtImage] = useState<{ url: string; name: string } | null>(null);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);

  // UPI Payment Modal State
  const [selectedFeeForUpi, setSelectedFeeForUpi] = useState<FeeRecord | null>(null);

  const studentId = currentUser?.id || 'student-1';

  // Get student enrollments
  const myEnrollments = enrollments.filter(e => e.student_id === studentId);
  const myBatchIds = myEnrollments.map(e => e.batch_id);
  const myBatches = batches.filter(b => myBatchIds.includes(b.id));

  // Default doubt batch selection
  React.useEffect(() => {
    if (myBatches.length > 0 && !doubtBatchId) {
      setDoubtBatchId(myBatches[0].id);
    }
  }, [myBatches, doubtBatchId]);

  // Announcements for my batches
  const myAnnouncements = announcements.filter(a => myBatchIds.includes(a.batch_id));

  // Homework for my batches
  const myHomework = homework.filter(h => myBatchIds.includes(h.batch_id));

  // Fees for student
  const myFees = fees.filter(f => f.student_id === studentId);

  // Progress for student
  const myProgress = progress.filter(p => p.student_id === studentId);

  // Doubts asked by student
  const myDoubts = doubts.filter(d => d.student_id === studentId);

  // Attendance records for student
  const myAttendance = attendance.filter(a => a.student_id === studentId);
  const presentCount = myAttendance.filter(a => a.status === 'Present').length;
  const attPct = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 100;

  // Handlers
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput) return;

    const res = joinBatch(joinCodeInput, studentId);
    if (res.success) {
      setJoinCodeInput('');
    } else {
      addToast(res.message, 'error');
    }
  };

  const toggleHwComplete = (hwId: string) => {
    setCompletedHwIds(prev =>
      prev.includes(hwId) ? prev.filter(id => id !== hwId) : [...prev, hwId]
    );
    addToast(
      completedHwIds.includes(hwId)
        ? 'Assignment marked as pending'
        : 'Assignment marked as completed!',
      'info'
    );
  };

  const handleDoubtImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsDataUrl(file);
      setDoubtImage({ url: res.url, name: res.name });
      addToast('Image attached to doubt!', 'success');
    } catch {
      addToast('Failed to process image file', 'error');
    }
  };

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtBatchId) {
      addToast('Please select a tuition slot', 'warning');
      return;
    }
    if (!questionText.trim()) {
      addToast('Please write your question or doubt', 'warning');
      return;
    }

    setIsSubmittingDoubt(true);
    addDoubt(doubtBatchId, studentId, questionText, doubtImage?.url);
    setQuestionText('');
    setDoubtImage(null);
    setIsSubmittingDoubt(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Student Top Hero Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Student Portal
              </span>
              <span className="text-blue-300 text-xs">
                {myBatches.length} Enrolled Tuition Slots
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hello, {currentUser?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              Check your class announcements, upcoming homework deadlines, fee payment ledger, and test scores.
            </p>
          </div>

          {/* Join Slot Form */}
          <form
            onSubmit={handleJoinSubmit}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 space-y-2 max-w-sm w-full"
          >
            <label className="block text-xs font-bold text-blue-100 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-300" />
              <span>Join New Slot via Unique Code</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. MATH12X"
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white text-slate-900 font-mono font-bold uppercase rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300 placeholder:normal-case placeholder:font-sans placeholder:font-normal"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                Join Slot
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              Classes
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{myBatches.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Enrolled Slots</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              Rate
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{attPct}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Overall Attendance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              Due
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {myHomework.length - completedHwIds.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Pending Homework</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
              Tests
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{myProgress.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Evaluations Recorded</p>
        </div>
      </div>

      {/* Enrolled Slots Bar */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
        <h2 className="text-base font-black text-blue-950 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>My Joined Tuition Classes ({myBatches.length})</span>
        </h2>

        {myBatches.length === 0 ? (
          <div className="text-center py-6 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
            <p className="text-xs text-slate-600 font-bold">
              You haven't joined any tuition slots yet!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Ask your tutor for the 6-character unique join code and enter it above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myBatches.map(b => (
              <div
                key={b.id}
                className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 rounded-2xl border border-blue-100 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                    {b.subject}
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {b.join_code}
                  </span>
                </div>

                <h3 className="font-extrabold text-blue-900 text-base mt-2">
                  {b.batch_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{b.schedule}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tutor: <strong>{b.tutor_name}</strong>
                </p>

                {b.meet_space_url && (
                  <a
                    href={b.meet_space_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet Class</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main 3 Columns: Announcements, Homework, Fees & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: ANNOUNCEMENTS */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-blue-950 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span>Announcements Feed</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {myAnnouncements.length}
            </span>
          </div>

          {myAnnouncements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No class announcements posted yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {myAnnouncements.map(a => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    a.is_urgent
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.is_urgent
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.is_urgent ? 'Urgent Notice ⚠️' : a.batch_name || 'Class Notice'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm mt-1">{a.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {a.content}
                  </p>

                  <AttachmentViewer
                    attachmentUrl={a.attachment_url}
                    attachmentName={a.attachment_name}
                    attachmentType={a.attachment_type}
                    label={a.title}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: HOMEWORK ASSIGNMENTS */}
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-blue-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Homework & Tasks</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {myHomework.length} Total
            </span>
          </div>

          {myHomework.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No pending homework assignments.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {myHomework.map(h => {
                const isDone = completedHwIds.includes(h.id);
                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleHwComplete(h.id)}
                        className="mt-0.5 text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            {h.batch_name || 'Assignment'}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              isDone ? 'text-emerald-700' : 'text-amber-600'
                            }`}
                          >
                            Due: {h.due_date}
                          </span>
                        </div>

                        <h4
                          className={`font-bold text-xs sm:text-sm mt-1 ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {h.title}
                        </h4>

                        {h.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {h.description}
                          </p>
                        )}

                        <AttachmentViewer
                          attachmentUrl={h.attachment_url}
                          attachmentName={h.attachment_name}
                          attachmentType={h.attachment_type}
                          label={h.title}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 3: FEES LEDGER & TEST SCORES */}
        <div className="space-y-6">
          
          {/* Fee Status Card */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-blue-950 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Fees & Dues Ledger</span>
              </h3>
            </div>

            {myFees.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No fee records logged yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {myFees.map(f => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{f.month}</p>
                      <p className="text-[10px] text-slate-500">
                        Amount: <strong className="text-emerald-700">${f.amount}</strong> • Due: {f.due_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] block ${
                          f.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                      {f.status === 'Pending' && (
                        <button
                          onClick={() => setSelectedFeeForUpi(f)}
                          className="mt-1 text-[10px] font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Pay Online</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Performance Card */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-blue-950 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Academic Marks</span>
              </h3>
            </div>

            {myProgress.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No test marks published yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {myProgress.map(p => {
                  const pct = Math.round((p.score / p.total_marks) * 100);
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start font-bold text-slate-900">
                        <span>{p.test_name}</span>
                        <span className="text-purple-700 font-black">
                          {p.score}/{p.total_marks} ({pct}%)
                        </span>
                      </div>
                      {p.remarks && (
                        <p className="text-[11px] text-slate-600 italic">
                          "{p.remarks}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ASK SECTION - DOUBTS & QUESTIONS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Student Q&A
              </span>
              <span className="text-xs text-slate-400">Direct Teacher Support</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>ASK — Doubts & Conceptual Questions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Have a question about class or homework? Ask your teacher and upload reference images.
            </p>
          </div>

          <span className="text-xs font-bold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 self-start sm:self-auto">
            {myDoubts.length} Questions Submitted
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ask Doubt Form */}
          <form
            onSubmit={handleDoubtSubmit}
            className="lg:col-span-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 p-5 rounded-2xl border border-blue-100 space-y-4"
          >
            <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Submit a New Doubt</span>
            </h3>

            {/* Batch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Tuition Class / Slot
              </label>
              <select
                value={doubtBatchId}
                onChange={e => setDoubtBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {myBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batch_name} ({b.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Question / Concept Doubt
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain what concept or problem you need help with..."
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Image Upload / Capture */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Question Image / Snap (Optional)
              </label>

              {doubtImage ? (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{doubtImage.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDoubtImage(null)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-dashed border-blue-300 rounded-xl cursor-pointer text-xs font-bold text-blue-700 transition-colors">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Click or Drag Image / Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleDoubtImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingDoubt}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Post Doubt to Teacher</span>
            </button>
          </form>

          {/* Asked Doubts History Feed */}
          <div className="lg:col-span-7 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              My Previous Asked Questions ({myDoubts.length})
            </h3>

            {myDoubts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <HelpCircle className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-bold">
                  No doubts asked yet!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type your question on the left to ask your tuition teacher directly.
                </p>
              </div>
            ) : (
              myDoubts.map(d => {
                const batch = myBatches.find(b => b.id === d.batch_id);
                return (
                  <div
                    key={d.id}
                    className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                      d.status === 'Answered'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        {batch?.batch_name || 'Tuition Slot'}
                      </span>
                      <span
                        className={`font-black text-[10px] px-2.5 py-0.5 rounded-full ${
                          d.status === 'Answered'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {d.status === 'Answered' ? 'Answered ✓' : 'Pending Teacher Response'}
                      </span>
                    </div>

                    <div>
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Q: {d.question}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Asked on {new Date(d.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Attached Image if any */}
                    <AttachmentViewer
                      attachmentUrl={d.image_url}
                      attachmentName="Doubt Attachment Photo"
                      attachmentType="image"
                      label="Your Question Photo"
                    />

                    {/* Answer Block */}
                    {d.answer && (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                          <span>Teacher Answer:</span>
                          <span>{d.answered_at && new Date(d.answered_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {d.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* UPI Payment Modal */}
      {selectedFeeForUpi && (
        <UpiPaymentModal
          fee={selectedFeeForUpi}
          tutor={allProfiles.find(p => p.role === 'tutor')}
          batch={batches.find(b => b.id === selectedFeeForUpi.batch_id)}
          onClose={() => setSelectedFeeForUpi(null)}
        />
      )}

    </div>
  );
};
