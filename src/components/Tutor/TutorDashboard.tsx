import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Users,
  Copy,
  Check,
  BookOpen,
  Calendar,
  DollarSign,
  Megaphone,
  FileText,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  Award,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  MessageSquare,
  QrCode,
  Send,
  X,
  CheckCircle2
} from 'lucide-react';
import { BatchSlot } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { AttachmentViewer } from '../Common/AttachmentViewer';
import { readFileAsDataUrl } from '../../utils/fileHelpers';

export const TutorDashboard: React.FC = () => {
  const {
    currentUser,
    batches,
    enrollments,
    announcements,
    homework,
    doubts,
    createBatch,
    addAnnouncement,
    addHomework,
    answerDoubt,
    updateTutorUpiSettings,
    addToast
  } = useApp();

  // Selected Batch Slot to view details
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(() => {
    const tutorBatches = batches.filter(b => b.tutor_id === (currentUser?.id || 'tutor-1'));
    return tutorBatches.length > 0 ? tutorBatches[0].id : null;
  });

  // Modal for hyperlinked student profile
  const [activeStudentModalId, setActiveStudentModalId] = useState<string | null>(null);

  // Modal for Create New Batch Slot
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('Mon, Wed • 4:00 PM - 5:30 PM');
  const [roomLink, setRoomLink] = useState('Room 302 / Zoom');
  const [feeAmount, setFeeAmount] = useState<number>(150);

  // UPI QR Code Settings Modal
  const [isUpiSettingsOpen, setIsUpiSettingsOpen] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState(currentUser?.upi_id || 'prof.david.miller@upi');
  const [upiQrImage, setUpiQrImage] = useState<{ url: string; name: string } | null>(
    currentUser?.upi_qr_url ? { url: currentUser.upi_qr_url, name: 'Current QR Code' } : null
  );

  // Forms for Post Announcement & Post Homework
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annUrgent, setAnnUrgent] = useState(false);
  const [annAttachment, setAnnAttachment] = useState<{ url: string; name: string; type: 'image' | 'pdf' | 'document' } | null>(null);

  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [hwAttachment, setHwAttachment] = useState<{ url: string; name: string; type: 'image' | 'pdf' | 'document' } | null>(null);

  // Answer Doubt state
  const [doubtAnswers, setDoubtAnswers] = useState<{ [doubtId: string]: string }>({});

  // Copy code state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search filter for enrolled students
  const [studentSearch, setStudentSearch] = useState('');

  // Filter batches belonging to current tutor
  const tutorBatches = batches.filter(
    b => b.tutor_id === (currentUser?.id || 'tutor-1')
  );

  const activeBatch = batches.find(b => b.id === selectedBatchId) || tutorBatches[0];

  // Enrolled students for active batch
  const activeEnrollments = enrollments.filter(e => e.batch_id === activeBatch?.id);
  const filteredEnrollments = activeEnrollments.filter(e =>
    e.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    e.student_email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Homework & Announcements for active batch
  const batchHomework = homework.filter(h => h.batch_id === activeBatch?.id);
  const batchAnnouncements = announcements.filter(a => a.batch_id === activeBatch?.id);

  // Doubts for tutor's batches
  const tutorBatchIds = tutorBatches.map(b => b.id);
  const tutorDoubts = doubts.filter(d => tutorBatchIds.includes(d.batch_id));

  // Attachment upload handlers
  const handleAnnFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsDataUrl(file);
      setAnnAttachment(res);
      addToast('File attached to announcement!', 'success');
    } catch {
      addToast('Failed to attach file', 'error');
    }
  };

  const handleHwFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsDataUrl(file);
      setHwAttachment(res);
      addToast('File attached to homework!', 'success');
    } catch {
      addToast('Failed to attach file', 'error');
    }
  };

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsDataUrl(file);
      setUpiQrImage({ url: res.url, name: res.name });
      addToast('UPI QR Code image updated!', 'success');
    } catch {
      addToast('Failed to read QR Code image', 'error');
    }
  };

  const handleSaveUpiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTutorUpiSettings(upiIdInput, upiQrImage?.url);
    setIsUpiSettingsOpen(false);
    addToast('UPI payment details saved successfully!', 'success');
  };

  // Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Copied slot code "${code}" to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !subject) {
      addToast('Please enter batch name and subject', 'error');
      return;
    }

    const newSlot = createBatch({
      tutor_id: currentUser?.id || 'tutor-1',
      tutor_name: currentUser?.full_name || 'Prof. Tutor',
      batch_name: batchName,
      subject,
      schedule,
      room_or_link: roomLink,
      fee_amount: Number(feeAmount),
      fee_frequency: 'monthly',
    });

    setSelectedBatchId(newSlot.id);
    setIsCreateBatchOpen(false);
    setBatchName('');
    setSubject('');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;
    if (!annTitle || !annContent) {
      addToast('Please provide title and content for announcement', 'error');
      return;
    }

    addAnnouncement(
      activeBatch.id,
      annTitle,
      annContent,
      annUrgent,
      annAttachment?.url,
      annAttachment?.name,
      annAttachment?.type
    );
    setAnnTitle('');
    setAnnContent('');
    setAnnUrgent(false);
    setAnnAttachment(null);
  };

  const handlePostHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;
    if (!hwTitle || !hwDueDate) {
      addToast('Please provide homework title and due date', 'error');
      return;
    }

    addHomework(
      activeBatch.id,
      hwTitle,
      hwDesc,
      hwDueDate,
      hwAttachment?.url,
      hwAttachment?.name,
      hwAttachment?.type
    );
    setHwTitle('');
    setHwDesc('');
    setHwAttachment(null);
  };

  const handleAnswerSubmit = (doubtId: string) => {
    const text = doubtAnswers[doubtId];
    if (!text || !text.trim()) {
      addToast('Please enter an answer response', 'warning');
      return;
    }

    answerDoubt(doubtId, text);
    setDoubtAnswers(prev => ({ ...prev, [doubtId]: '' }));
    addToast('Answer published to student!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Tutor Top Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Teacher Dashboard
              </span>
              <span className="text-blue-300 text-xs">
                {tutorBatches.length} Active Slots
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.full_name || 'Teacher'}
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              Manage your class slots, click any hyperlinked student to mark attendance & record fees, publish homework or announcements with image/PDF attachments, and answer student doubts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsUpiSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl border border-white/20 transition-all text-sm"
              title="Configure UPI ID & QR Code Image for Online Student Fees"
            >
              <QrCode className="w-4 h-4 text-blue-300" />
              <span>UPI Payment Setup</span>
            </button>

            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-blue-50 text-blue-900 font-extrabold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-102 shrink-0 text-sm"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Create New Batch Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Batches Sidebar + Active Batch Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of Batches / Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Your Tuition Slots</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {tutorBatches.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {tutorBatches.map(b => {
              const count = enrollments.filter(e => e.batch_id === b.id).length;
              const isSelected = activeBatch?.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {b.subject}
                      </span>
                      <h3 className="font-extrabold text-base mt-1.5 leading-snug">
                        {b.batch_name}
                      </h3>
                    </div>

                    <div
                      className={`text-right px-2.5 py-1 rounded-xl font-mono text-xs font-bold flex items-center gap-1 ${
                        isSelected
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(b.join_code);
                      }}
                      title="Click to copy unique slot join code"
                    >
                      <span>{b.join_code}</span>
                      {copiedCode === b.join_code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs mt-3 flex items-center gap-1.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{b.schedule}</span>
                  </p>

                  <div
                    className={`mt-3 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                      isSelected ? 'border-white/20 text-white' : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{count} Enrolled Students</span>
                    </span>
                    <span>${b.fee_amount}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Batch Slot Details & Interactive Controls */}
        {activeBatch ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Batch Header Card */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {activeBatch.subject}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-500">
                      {activeBatch.schedule}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-blue-900 mt-1">
                    {activeBatch.batch_name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 border border-blue-200 p-2 px-3 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">
                      Unique Join Code
                    </p>
                    <button
                      onClick={() => handleCopyCode(activeBatch.join_code)}
                      className="text-base font-black font-mono text-blue-900 flex items-center gap-1.5 hover:text-blue-700"
                    >
                      <span>{activeBatch.join_code}</span>
                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: HYPERLINKED ENROLLED STUDENTS LIST */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-black text-blue-950 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Enrolled Students List ({activeEnrollments.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any student's hyperlinked name to mark attendance and manage fees paid.
                    </p>
                  </div>

                  {/* Search box for students */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white w-full sm:w-48"
                    />
                  </div>
                </div>

                {filteredEnrollments.length === 0 ? (
                  <div className="p-8 text-center bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 text-slate-500 text-xs">
                    <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <p className="font-bold text-blue-900">No students enrolled yet</p>
                    <p className="mt-0.5">
                      Share the unique code <strong className="font-mono text-blue-700">{activeBatch.join_code}</strong> with students to let them join!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredEnrollments.map(en => (
                      <button
                        key={en.id}
                        onClick={() => setActiveStudentModalId(en.student_id)}
                        className="flex items-center justify-between p-3.5 bg-blue-50/40 hover:bg-blue-100/70 border border-blue-100 hover:border-blue-300 rounded-2xl text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white text-blue-700 font-extrabold text-sm flex items-center justify-center shadow-2xs border border-blue-100 group-hover:scale-105 transition-transform">
                            {en.student_name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-blue-900 group-hover:text-blue-700 group-hover:underline flex items-center gap-1">
                              <span>{en.student_name}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500 opacity-70 group-hover:opacity-100" />
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {en.student_email}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-blue-600 bg-white px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                          Manage →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: POST ANNOUNCEMENTS & POST HOMEWORK FOR THIS BATCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Post Announcement Form */}
              <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-sm text-blue-950">
                    Post Announcement
                  </h3>
                </div>

                <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Test Schedule Update"
                      value={annTitle}
                      onChange={e => setAnnTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Announcement Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write details for students..."
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="urgentCheck"
                      checked={annUrgent}
                      onChange={e => setAnnUrgent(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="urgentCheck" className="text-xs font-bold text-rose-600">
                      Mark as Urgent Notice ⚠️
                    </label>
                  </div>

                  {/* Attachment Upload for Announcement */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Attach Image or PDF Notice (Optional)
                    </label>
                    {annAttachment ? (
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                        <span className="font-bold text-blue-900 truncate max-w-[180px]">{annAttachment.name}</span>
                        <button
                          type="button"
                          onClick={() => setAnnAttachment(null)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-blue-700 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Image / PDF</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleAnnFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Post to Slot Feed
                  </button>
                </form>

                {/* Published Announcements List */}
                {batchAnnouncements.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500">
                      Recent Slot Announcements ({batchAnnouncements.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {batchAnnouncements.map(a => (
                        <div key={a.id} className="p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                          <p className="font-bold text-slate-900">{a.title}</p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{a.content}</p>
                          <AttachmentViewer
                            attachmentUrl={a.attachment_url}
                            attachmentName={a.attachment_name}
                            attachmentType={a.attachment_type}
                            label={a.title}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assign Homework Form */}
              <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-sm text-blue-950">
                    Assign Homework
                  </h3>
                </div>

                <form onSubmit={handlePostHomework} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Homework Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Differential Equations Worksheet"
                      value={hwTitle}
                      onChange={e => setHwTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instructions & Problem Numbers
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Solve problems 1-10 on page 140."
                      value={hwDesc}
                      onChange={e => setHwDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Submission Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={hwDueDate}
                      onChange={e => setHwDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  {/* Attachment Upload for Homework */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Attach Worksheet / PDF / Image (Optional)
                    </label>
                    {hwAttachment ? (
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                        <span className="font-bold text-blue-900 truncate max-w-[180px]">{hwAttachment.name}</span>
                        <button
                          type="button"
                          onClick={() => setHwAttachment(null)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-blue-700 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Worksheet Image / PDF</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleHwFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Publish Assignment
                  </button>
                </form>

                {/* Published Homework List */}
                {batchHomework.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500">
                      Assigned Homework ({batchHomework.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {batchHomework.map(h => (
                        <div key={h.id} className="p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900">{h.title}</p>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              Due {h.due_date}
                            </span>
                          </div>
                          <AttachmentViewer
                            attachmentUrl={h.attachment_url}
                            attachmentName={h.attachment_name}
                            attachmentType={h.attachment_type}
                            label={h.title}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center bg-white rounded-3xl border border-blue-100 shadow-xs">
            <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-blue-900">No Batches Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first tuition slot to start enrolling students, marking attendance, and tracking fees!
            </p>
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-xs"
            >
              + Create Batch Slot
            </button>
          </div>
        )}

      </div>

      {/* DOUBTS & STUDENT QUESTIONS RESOLUTION SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Student Doubts Feed
              </span>
              <span className="text-xs text-slate-400">Direct Q&A Inbox</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Student Doubts & Questions Inbox ({tutorDoubts.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review conceptual questions and reference image attachments uploaded by enrolled students, and publish explanations.
            </p>
          </div>

          <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0 self-start sm:self-auto">
            {tutorDoubts.filter(d => d.status === 'Pending').length} Pending Answers
          </span>
        </div>

        {tutorDoubts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-bold">
              No student doubts posted yet!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When students submit conceptual questions or photo snaps from their ASK portal, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorDoubts.map(d => {
              const batch = batches.find(b => b.id === d.batch_id);
              const studentName = enrollments.find(e => e.student_id === d.student_id)?.student_name || 'Enrolled Student';

              return (
                <div
                  key={d.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    d.status === 'Answered'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-amber-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-blue-900 text-xs">
                        {studentName}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        {batch?.batch_name || 'Slot'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'Answered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 font-black'
                      }`}
                    >
                      {d.status === 'Answered' ? 'Answered ✓' : 'Needs Response ⏳'}
                    </span>
                  </div>

                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">
                      Q: {d.question}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Submitted on {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Attachment Preview if Student uploaded an image */}
                  <AttachmentViewer
                    attachmentUrl={d.image_url}
                    attachmentName="Student Reference Snap"
                    attachmentType="image"
                    label="Student Reference Photo"
                  />

                  {/* Teacher Existing Answer OR Answer Form */}
                  {d.status === 'Answered' ? (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Your Published Explanation:</span>
                      </p>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {d.answer}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700">
                        Write Your Solution / Explanation
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Explain solution or provide guidance..."
                        value={doubtAnswers[d.id] || ''}
                        onChange={e => setDoubtAnswers({ ...doubtAnswers, [d.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-400"
                      />
                      <button
                        onClick={() => handleAnswerSubmit(d.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Answer to Student</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPI PAYMENT SETUP MODAL */}
      {isUpiSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-blue-900">
                  Configure Teacher UPI Payments
                </h3>
              </div>
              <button
                onClick={() => setIsUpiSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpiSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Official UPI VPA / ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. david.miller@upi or 9876543210@paytm"
                  value={upiIdInput}
                  onChange={e => setUpiIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:bg-white focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Students will use this UPI ID to transfer tuition fees directly to your bank account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Custom UPI QR Code Image
                </label>

                {upiQrImage ? (
                  <div className="space-y-2 text-center p-3 bg-blue-50 rounded-2xl border border-blue-200">
                    <img
                      src={upiQrImage.url}
                      alt="UPI QR Code"
                      className="w-32 h-32 mx-auto object-contain rounded-xl bg-white p-1 border border-blue-100 shadow-2xs"
                    />
                    <p className="text-xs font-bold text-blue-900 truncate max-w-xs mx-auto">
                      {upiQrImage.name}
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl cursor-pointer text-xs font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpiQrUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer text-xs font-bold text-blue-700 transition-colors">
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    <span>Upload UPI QR Code Image</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                      Accepts PNG, JPG, or WEBP photo of Google Pay / PhonePe QR code
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpiQrUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpiSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Save UPI Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-blue-900">
                Create New Tuition Slot
              </h3>
              <button
                onClick={() => setIsCreateBatchOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch / Slot Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Mathematics Grade 12"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Timings & Schedule
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mon, Wed, Fri • 4:00 PM - 5:30 PM"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Online Meeting Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 302 or Zoom ID #8841"
                  value={roomLink}
                  onChange={e => setRoomLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Fee Amount ($)
                </label>
                <input
                  type="number"
                  required
                  value={feeAmount}
                  onChange={e => setFeeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Create & Generate Unique Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HYPERLINKED STUDENT DETAIL MODAL */}
      {activeStudentModalId && activeBatch && (
        <StudentDetailModal
          studentId={activeStudentModalId}
          batchId={activeBatch.id}
          onClose={() => setActiveStudentModalId(null)}
        />
      )}

    </div>
  );
};
