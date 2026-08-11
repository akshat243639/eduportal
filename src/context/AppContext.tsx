import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  BatchSlot,
  Enrollment,
  AttendanceRecord,
  FeeRecord,
  Homework,
  Announcement,
  ProgressRecord,
  AttendanceStatus,
  FeeStatus,
  DoubtQuestion
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_BATCHES,
  INITIAL_ENROLLMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_FEES,
  INITIAL_HOMEWORK,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PROGRESS,
  INITIAL_DOUBTS
} from '../data/seedData';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: UserProfile | null;
  allProfiles: UserProfile[];
  batches: BatchSlot[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  homework: Homework[];
  announcements: Announcement[];
  progress: ProgressRecord[];
  doubts: DoubtQuestion[];
  toasts: ToastMessage[];

  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  switchUser: (profileId: string) => void;
  registerUser: (fullName: string, email: string, role: UserProfile['role'], childEmail?: string) => UserProfile | null;
  createBatch: (data: Omit<BatchSlot, 'id' | 'created_at' | 'join_code'>) => BatchSlot;
  joinBatch: (joinCode: string, studentId: string) => { success: boolean; message: string };
  markAttendance: (batchId: string, studentId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  addFeeRecord: (batchId: string, studentId: string, month: string, amount: number, dueDate: string, status?: FeeStatus) => void;
  updateFeeStatus: (feeId: string, status: FeeStatus, paidDate?: string) => void;
  addHomework: (batchId: string, title: string, description: string, dueDate: string, attachmentUrl?: string, attachmentName?: string, attachmentType?: 'image' | 'pdf' | 'document') => void;
  addAnnouncement: (batchId: string, title: string, content: string, isUrgent?: boolean, attachmentUrl?: string, attachmentName?: string, attachmentType?: 'image' | 'pdf' | 'document') => void;
  addProgress: (batchId: string, studentId: string, testName: string, testDate: string, score: number, totalMarks: number, remarks: string) => void;
  addDoubt: (batchId: string, studentId: string, questionText: string, imageUrl?: string) => void;
  answerDoubt: (doubtId: string, answerText: string, teacherName: string) => void;
  updateTutorUpiSettings: (tutorId: string, upiId: string, upiQrUrl?: string) => void;
  linkChild: (parentId: string, studentEmail: string) => { success: boolean; message: string };
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'eduportal_tuition_app_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profiles`);
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = profiles.find(p => p.id === parsed.id);
        return match || profiles[0];
      } catch {
        return profiles[0];
      }
    }
    return profiles[0]; // Default to Tutor Prof. David Miller
  });

  const [batches, setBatches] = useState<BatchSlot[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_batches`);
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_enrollments`);
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [fees, setFees] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fees`);
    return saved ? JSON.parse(saved) : INITIAL_FEES;
  });

  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_homework`);
    return saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_announcements`);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [progress, setProgress] = useState<ProgressRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_progress`);
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [doubts, setDoubts] = useState<DoubtQuestion[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_doubts`);
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist states
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_profiles`, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_batches`, JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_enrollments`, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fees`, JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_homework`, JSON.stringify(homework));
  }, [homework]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_announcements`, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_progress`, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_doubts`, JSON.stringify(doubts));
  }, [doubts]);

  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchUser = (profileId: string) => {
    const found = profiles.find(p => p.id === profileId);
    if (found) {
      setCurrentUser(found);
      addToast(`Switched view to ${found.full_name} (${found.role.toUpperCase()})`, 'info');
    }
  };

  const registerUser = (fullName: string, email: string, role: UserProfile['role'], childEmail?: string) => {
    const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      addToast(`Account with email ${email} already exists. Logging in...`, 'info');
      setCurrentUser(existing);
      return existing;
    }

    let childId: string | undefined = undefined;
    let childName: string | undefined = undefined;

    if (role === 'parent' && childEmail) {
      const child = profiles.find(p => p.email.toLowerCase() === childEmail.toLowerCase() && p.role === 'student');
      if (child) {
        childId = child.id;
        childName = child.full_name;
      }
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      role,
      child_id: childId,
      child_name: childName,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [...prev, newProfile]);
    setCurrentUser(newProfile);
    addToast(`Account created successfully for ${fullName}`, 'success');
    return newProfile;
  };

  const createBatch = (data: Omit<BatchSlot, 'id' | 'created_at' | 'join_code'>) => {
    // Generate clean unique 6-character code e.g. MATH98, PHYS42
    const prefix = data.subject.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const joinCode = `${prefix}${randomNum}`;

    const newBatch: BatchSlot = {
      ...data,
      id: `batch-${Date.now()}`,
      join_code: joinCode,
      created_at: new Date().toISOString(),
    };

    setBatches(prev => [newBatch, ...prev]);
    addToast(`New slot "${newBatch.batch_name}" created! Unique Code: ${joinCode}`, 'success');
    return newBatch;
  };

  const joinBatch = (joinCode: string, studentId: string) => {
    const codeClean = joinCode.trim().toUpperCase();
    const batch = batches.find(b => b.join_code.toUpperCase() === codeClean);

    if (!batch) {
      return { success: false, message: 'Invalid slot join code. Please check with your tutor.' };
    }

    const existingEn = enrollments.find(e => e.batch_id === batch.id && e.student_id === studentId);
    if (existingEn) {
      return { success: false, message: `You are already enrolled in ${batch.batch_name}.` };
    }

    const student = profiles.find(p => p.id === studentId);
    const newEnrollment: Enrollment = {
      id: `en-${Date.now()}`,
      batch_id: batch.id,
      student_id: studentId,
      student_name: student?.full_name || 'Student',
      student_email: student?.email || '',
      joined_at: new Date().toISOString().split('T')[0],
    };

    setEnrollments(prev => [...prev, newEnrollment]);
    addToast(`Enrolled successfully in ${batch.batch_name}!`, 'success');
    return { success: true, message: `Enrolled in ${batch.batch_name}` };
  };

  const markAttendance = (batchId: string, studentId: string, date: string, status: AttendanceStatus, notes?: string) => {
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.batch_id === batchId && a.student_id === studentId && a.date === date));
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        batch_id: batchId,
        student_id: studentId,
        date,
        status,
        notes,
      };
      return [...filtered, newRecord];
    });
    addToast(`Attendance marked as ${status} for ${date}`, 'success');
  };

  const addFeeRecord = (
    batchId: string,
    studentId: string,
    month: string,
    amount: number,
    dueDate: string,
    status: FeeStatus = 'Pending'
  ) => {
    const batch = batches.find(b => b.id === batchId);
    const newFee: FeeRecord = {
      id: `fee-${Date.now()}`,
      batch_id: batchId,
      batch_name: batch?.batch_name || 'Tuition Slot',
      student_id: studentId,
      month,
      amount,
      status,
      due_date: dueDate,
      paid_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      receipt_no: status === 'Paid' ? `REC-${Date.now().toString().slice(-6)}` : undefined,
    };

    setFees(prev => [newFee, ...prev]);
    addToast(`Fee record generated for ${month} ($${amount})`, 'success');
  };

  const updateFeeStatus = (feeId: string, status: FeeStatus, paidDate?: string) => {
    setFees(prev => prev.map(f => {
      if (f.id === feeId) {
        return {
          ...f,
          status,
          paid_date: status === 'Paid' ? (paidDate || new Date().toISOString().split('T')[0]) : undefined,
          receipt_no: status === 'Paid' ? (f.receipt_no || `REC-${Date.now().toString().slice(-6)}`) : f.receipt_no,
        };
      }
      return f;
    }));
    addToast(`Fee status updated to ${status}`, 'success');
  };

  const addHomework = (
    batchId: string,
    title: string,
    description: string,
    dueDate: string,
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentType?: 'image' | 'pdf' | 'document'
  ) => {
    const batch = batches.find(b => b.id === batchId);
    const newHw: Homework = {
      id: `hw-${Date.now()}`,
      batch_id: batchId,
      batch_name: batch?.batch_name,
      title,
      description,
      due_date: dueDate,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      created_at: new Date().toISOString(),
    };
    setHomework(prev => [newHw, ...prev]);
    addToast(`Homework assigned for ${batch?.batch_name || 'slot'}`, 'success');
  };

  const addAnnouncement = (
    batchId: string,
    title: string,
    content: string,
    isUrgent: boolean = false,
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentType?: 'image' | 'pdf' | 'document'
  ) => {
    const batch = batches.find(b => b.id === batchId);
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      batch_id: batchId,
      batch_name: batch?.batch_name,
      title,
      content,
      is_urgent: isUrgent,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
      created_at: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addToast(`Announcement posted to ${batch?.batch_name || 'class'}`, 'success');
  };

  const addProgress = (
    batchId: string,
    studentId: string,
    testName: string,
    testDate: string,
    score: number,
    totalMarks: number,
    remarks: string
  ) => {
    const batch = batches.find(b => b.id === batchId);
    const newProg: ProgressRecord = {
      id: `prog-${Date.now()}`,
      batch_id: batchId,
      batch_name: batch?.batch_name,
      student_id: studentId,
      test_name: testName,
      test_date: testDate,
      score,
      total_marks: totalMarks,
      remarks,
      created_at: new Date().toISOString(),
    };
    setProgress(prev => [newProg, ...prev]);
    addToast(`Test score saved for ${testName}`, 'success');
  };

  const addDoubt = (
    batchId: string,
    studentId: string,
    questionText: string,
    imageUrl?: string
  ) => {
    const student = profiles.find(p => p.id === studentId);
    const batch = batches.find(b => b.id === batchId);

    const newDoubt: DoubtQuestion = {
      id: `doubt-${Date.now()}`,
      student_id: studentId,
      student_name: student?.full_name || 'Student',
      student_email: student?.email || '',
      batch_id: batchId,
      batch_name: batch?.batch_name || 'Tuition Class',
      question_text: questionText,
      image_url: imageUrl,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    setDoubts(prev => [newDoubt, ...prev]);
    addToast('Your doubt/question has been submitted to your teacher!', 'success');
  };

  const answerDoubt = (doubtId: string, answerText: string, teacherName: string) => {
    setDoubts(prev => prev.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          answer_text: answerText,
          answered_at: new Date().toISOString(),
          answered_by_name: teacherName,
          status: 'Answered',
        };
      }
      return d;
    }));
    addToast('Answer published to student!', 'success');
  };

  const updateTutorUpiSettings = (tutorId: string, upiId: string, upiQrUrl?: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === tutorId) {
        return {
          ...p,
          upi_id: upiId,
          upi_qr_url: upiQrUrl || p.upi_qr_url,
        };
      }
      return p;
    }));

    if (currentUser && currentUser.id === tutorId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        upi_id: upiId,
        upi_qr_url: upiQrUrl || prev.upi_qr_url,
      } : null);
    }

    addToast('UPI Payment details & QR Code updated!', 'success');
  };

  const linkChild = (parentId: string, studentEmail: string) => {
    const child = profiles.find(p => p.email.toLowerCase() === studentEmail.toLowerCase() && p.role === 'student');
    if (!child) {
      return { success: false, message: `No student profile found with email "${studentEmail}". Please verify.` };
    }

    setProfiles(prev => prev.map(p => {
      if (p.id === parentId) {
        return { ...p, child_id: child.id, child_name: child.full_name };
      }
      return p;
    }));

    if (currentUser && currentUser.id === parentId) {
      setCurrentUser(prev => prev ? { ...prev, child_id: child.id, child_name: child.full_name } : null);
    }

    addToast(`Linked child "${child.full_name}" to parent account`, 'success');
    return { success: true, message: `Successfully linked to ${child.full_name}` };
  };

  const resetToDemoData = () => {
    setProfiles(INITIAL_PROFILES);
    setBatches(INITIAL_BATCHES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setFees(INITIAL_FEES);
    setHomework(INITIAL_HOMEWORK);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setProgress(INITIAL_PROGRESS);
    setDoubts(INITIAL_DOUBTS);
    setCurrentUser(INITIAL_PROFILES[0]);
    addToast('Reset to original sample tuition data', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allProfiles: profiles,
        batches,
        enrollments,
        attendance,
        fees,
        homework,
        announcements,
        progress,
        doubts,
        toasts,
        setCurrentUser,
        switchUser,
        registerUser,
        createBatch,
        joinBatch,
        markAttendance,
        addFeeRecord,
        updateFeeStatus,
        addHomework,
        addAnnouncement,
        addProgress,
        addDoubt,
        answerDoubt,
        updateTutorUpiSettings,
        linkChild,
        addToast,
        removeToast,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
