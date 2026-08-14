import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { createGoogleMeetSpace } from '../lib/googleMeet';
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
  createBatch: (data: Omit<BatchSlot, 'id' | 'created_at' | 'join_code'>) => Promise<BatchSlot>;
  createGoogleMeetForBatch: (batchId: string, accessToken?: string | null) => Promise<{ meetUrl: string }>;
  joinBatch: (joinCode: string, studentId: string) => Promise<{ success: boolean; message: string }>;
  markAttendance: (batchId: string, studentId: string, date: string, status: AttendanceStatus, notes?: string) => Promise<void>;
  addFeeRecord: (batchId: string, studentId: string, month: string, amount: number, dueDate: string, status?: FeeStatus) => Promise<void>;
  updateFeeStatus: (feeId: string, status: FeeStatus, paidDate?: string) => Promise<void>;
  addHomework: (batchId: string, title: string, description: string, dueDate: string, attachmentUrl?: string, attachmentName?: string, attachmentType?: 'image' | 'pdf' | 'document') => Promise<void>;
  addAnnouncement: (batchId: string, title: string, content: string, isUrgent?: boolean, attachmentUrl?: string, attachmentName?: string, attachmentType?: 'image' | 'pdf' | 'document') => Promise<void>;
  addProgress: (batchId: string, studentId: string, testName: string, testDate: string, score: number, totalMarks: number, remarks: string) => Promise<void>;
  addDoubt: (batchId: string, studentId: string, questionText: string, imageUrl?: string) => Promise<void>;
  answerDoubt: (doubtId: string, answerText: string, teacherName: string) => Promise<void>;
  updateTutorUpiSettings: (tutorId: string, upiId: string, upiQrUrl?: string) => Promise<void>;
  linkChild: (parentId: string, studentEmail: string) => Promise<{ success: boolean; message: string }>;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  loginWithEmail: (email: string) => Promise<UserProfile | null>;
  resetToDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'eduportal_tuition_app_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [batches, setBatches] = useState<BatchSlot[]>(INITIAL_BATCHES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [fees, setFees] = useState<FeeRecord[]>(INITIAL_FEES);
  const [homework, setHomework] = useState<Homework[]>(INITIAL_HOMEWORK);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [progress, setProgress] = useState<ProgressRecord[]>(INITIAL_PROGRESS);
  const [doubts, setDoubts] = useState<DoubtQuestion[]>(INITIAL_DOUBTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Initialize & Listen to Cloud Firestore realtime snapshots
  useEffect(() => {
    // Seed initial Firestore collections if empty
    const seedFirestoreIfEmpty = async () => {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        if (snap.empty) {
          console.log('Seeding initial Cloud Firestore database collections...');
          for (const item of INITIAL_PROFILES) {
            await setDoc(doc(db, 'profiles', item.id), item);
          }
          for (const item of INITIAL_BATCHES) {
            await setDoc(doc(db, 'batches', item.id), item);
          }
          for (const item of INITIAL_ENROLLMENTS) {
            await setDoc(doc(db, 'enrollments', item.id), item);
          }
          for (const item of INITIAL_ATTENDANCE) {
            await setDoc(doc(db, 'attendance', item.id), item);
          }
          for (const item of INITIAL_FEES) {
            await setDoc(doc(db, 'feeRecords', item.id), item);
          }
          for (const item of INITIAL_HOMEWORK) {
            await setDoc(doc(db, 'homework', item.id), item);
          }
          for (const item of INITIAL_ANNOUNCEMENTS) {
            await setDoc(doc(db, 'announcements', item.id), item);
          }
          for (const item of INITIAL_PROGRESS) {
            await setDoc(doc(db, 'progress', item.id), item);
          }
          for (const item of INITIAL_DOUBTS) {
            await setDoc(doc(db, 'doubts', item.id), item);
          }
        }
      } catch (err) {
        console.warn('Firestore initial seeding error or offline mode:', err);
      }
    };

    seedFirestoreIfEmpty();

    // Listen to Profiles
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as UserProfile);
        setProfiles(list);
      }
    }, err => console.warn('Profiles snapshot listener:', err));

    // Listen to Batches
    const unsubBatches = onSnapshot(collection(db, 'batches'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as BatchSlot);
        setBatches(list);
      }
    }, err => console.warn('Batches snapshot listener:', err));

    // Listen to Enrollments
    const unsubEnrollments = onSnapshot(collection(db, 'enrollments'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as Enrollment);
        setEnrollments(list);
      }
    }, err => console.warn('Enrollments snapshot listener:', err));

    // Listen to Attendance
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as AttendanceRecord);
        setAttendance(list);
      }
    }, err => console.warn('Attendance snapshot listener:', err));

    // Listen to Fees
    const unsubFees = onSnapshot(collection(db, 'feeRecords'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as FeeRecord);
        setFees(list);
      }
    }, err => console.warn('Fees snapshot listener:', err));

    // Listen to Homework
    const unsubHomework = onSnapshot(collection(db, 'homework'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as Homework);
        setHomework(list);
      }
    }, err => console.warn('Homework snapshot listener:', err));

    // Listen to Announcements
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as Announcement);
        setAnnouncements(list);
      }
    }, err => console.warn('Announcements snapshot listener:', err));

    // Listen to Progress
    const unsubProgress = onSnapshot(collection(db, 'progress'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as ProgressRecord);
        setProgress(list);
      }
    }, err => console.warn('Progress snapshot listener:', err));

    // Listen to Doubts
    const unsubDoubts = onSnapshot(collection(db, 'doubts'), snapshot => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data() as DoubtQuestion);
        setDoubts(list);
      }
    }, err => console.warn('Doubts snapshot listener:', err));

    return () => {
      unsubProfiles();
      unsubBatches();
      unsubEnrollments();
      unsubAttendance();
      unsubFees();
      unsubHomework();
      unsubAnnouncements();
      unsubProgress();
      unsubDoubts();
    };
  }, []);

  // Update currentUser when profiles change
  useEffect(() => {
    if (currentUser) {
      const match = profiles.find(p => p.id === currentUser.id || p.email.toLowerCase() === currentUser.email.toLowerCase());
      if (match) {
        setCurrentUser(match);
      }
    }
  }, [profiles]);

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
      addToast(`Logged into Cloud profile: ${fullName}`, 'info');
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

    // Persist to Cloud Firestore
    setDoc(doc(db, 'profiles', newProfile.id), newProfile)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `profiles/${newProfile.id}`));

    addToast(`Account created in Cloud for ${fullName}`, 'success');
    return newProfile;
  };

  const loginWithEmail = async (loginEmail: string): Promise<UserProfile | null> => {
    const cleanEmail = loginEmail.toLowerCase().trim();
    // 1. Check local state profiles first
    let match = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (match) {
      setCurrentUser(match);
      addToast(`Welcome back, ${match.full_name}!`, 'success');
      return match;
    }

    // 2. Fetch directly from Cloud Firestore in case account was created on another device
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      if (!snap.empty) {
        const cloudProfiles = snap.docs.map(d => d.data() as UserProfile);
        setProfiles(cloudProfiles);
        match = cloudProfiles.find(p => p.email.toLowerCase() === cleanEmail);
        if (match) {
          setCurrentUser(match);
          addToast(`Welcome back, ${match.full_name}!`, 'success');
          return match;
        }
      }
    } catch (err: any) {
      console.error('Error fetching cloud profiles:', err);
    }

    return null;
  };

  const createBatch = async (data: Omit<BatchSlot, 'id' | 'created_at' | 'join_code'>): Promise<BatchSlot> => {
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

    try {
      await setDoc(doc(db, 'batches', newBatch.id), newBatch);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `batches/${newBatch.id}`);
    }

    addToast(`New slot "${newBatch.batch_name}" saved to Cloud! Code: ${joinCode}`, 'success');
    return newBatch;
  };

  const createGoogleMeetForBatch = async (batchId: string, accessToken?: string | null) => {
    const meetSpace = await createGoogleMeetSpace(accessToken);
    const batch = batches.find(b => b.id === batchId);

    if (batch) {
      const updatedBatch: BatchSlot = {
        ...batch,
        meet_space_url: meetSpace.meetingUri,
        meet_space_id: meetSpace.name,
      };

      setBatches(prev => prev.map(b => b.id === batchId ? updatedBatch : b));

      try {
        await setDoc(doc(db, 'batches', batchId), updatedBatch);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `batches/${batchId}`);
      }

      // Also post an automatic urgent announcement to students
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        batch_id: batchId,
        batch_name: batch.batch_name,
        title: `🎥 Google Meet Live Class Session Ready!`,
        content: `Your tutor has started/scheduled a Google Meet live class for ${batch.batch_name}. Click the button above to join: ${meetSpace.meetingUri}`,
        is_urgent: true,
        created_at: new Date().toISOString(),
      };

      setAnnouncements(prev => [newAnn, ...prev]);
      try {
        await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `announcements/${newAnn.id}`);
      }

      addToast(`Google Meet created! Link: ${meetSpace.meetingUri}`, 'success');
      return { meetUrl: meetSpace.meetingUri };
    }

    return { meetUrl: meetSpace.meetingUri };
  };

  const joinBatch = async (joinCode: string, studentId: string) => {
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

    try {
      await setDoc(doc(db, 'enrollments', newEnrollment.id), newEnrollment);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `enrollments/${newEnrollment.id}`);
    }

    addToast(`Enrolled successfully in ${batch.batch_name}!`, 'success');
    return { success: true, message: `Enrolled in ${batch.batch_name}` };
  };

  const markAttendance = async (batchId: string, studentId: string, date: string, status: AttendanceStatus, notes?: string) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      batch_id: batchId,
      student_id: studentId,
      date,
      status,
      notes,
    };

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.batch_id === batchId && a.student_id === studentId && a.date === date));
      return [...filtered, newRecord];
    });

    try {
      await setDoc(doc(db, 'attendance', newRecord.id), newRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `attendance/${newRecord.id}`);
    }

    addToast(`Attendance marked as ${status} for ${date}`, 'success');
  };

  const addFeeRecord = async (
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

    try {
      await setDoc(doc(db, 'feeRecords', newFee.id), newFee);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `feeRecords/${newFee.id}`);
    }

    addToast(`Fee record generated for ${month} ($${amount})`, 'success');
  };

  const updateFeeStatus = async (feeId: string, status: FeeStatus, paidDate?: string) => {
    const feeToUpdate = fees.find(f => f.id === feeId);
    if (!feeToUpdate) return;

    const updatedFee: FeeRecord = {
      ...feeToUpdate,
      status,
      paid_date: status === 'Paid' ? (paidDate || new Date().toISOString().split('T')[0]) : undefined,
      receipt_no: status === 'Paid' ? (feeToUpdate.receipt_no || `REC-${Date.now().toString().slice(-6)}`) : feeToUpdate.receipt_no,
    };

    setFees(prev => prev.map(f => f.id === feeId ? updatedFee : f));

    try {
      await setDoc(doc(db, 'feeRecords', feeId), updatedFee);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `feeRecords/${feeId}`);
    }

    addToast(`Fee status updated to ${status}`, 'success');
  };

  const addHomework = async (
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

    try {
      await setDoc(doc(db, 'homework', newHw.id), newHw);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `homework/${newHw.id}`);
    }

    addToast(`Homework assigned for ${batch?.batch_name || 'slot'}`, 'success');
  };

  const addAnnouncement = async (
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

    try {
      await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `announcements/${newAnn.id}`);
    }

    addToast(`Announcement posted to ${batch?.batch_name || 'class'}`, 'success');
  };

  const addProgress = async (
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

    try {
      await setDoc(doc(db, 'progress', newProg.id), newProg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `progress/${newProg.id}`);
    }

    addToast(`Test score saved for ${testName}`, 'success');
  };

  const addDoubt = async (
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

    try {
      await setDoc(doc(db, 'doubts', newDoubt.id), newDoubt);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `doubts/${newDoubt.id}`);
    }

    addToast('Your doubt/question has been submitted to your teacher!', 'success');
  };

  const answerDoubt = async (doubtId: string, answerText: string, teacherName: string) => {
    const existingDoubt = doubts.find(d => d.id === doubtId);
    if (!existingDoubt) return;

    const updatedDoubt: DoubtQuestion = {
      ...existingDoubt,
      answer_text: answerText,
      answered_at: new Date().toISOString(),
      answered_by_name: teacherName,
      status: 'Answered',
    };

    setDoubts(prev => prev.map(d => d.id === doubtId ? updatedDoubt : d));

    try {
      await setDoc(doc(db, 'doubts', doubtId), updatedDoubt);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `doubts/${doubtId}`);
    }

    addToast('Answer published to student!', 'success');
  };

  const updateTutorUpiSettings = async (tutorId: string, upiId: string, upiQrUrl?: string) => {
    const profile = profiles.find(p => p.id === tutorId);
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      upi_id: upiId,
      upi_qr_url: upiQrUrl || profile.upi_qr_url,
    };

    setProfiles(prev => prev.map(p => p.id === tutorId ? updatedProfile : p));

    try {
      await setDoc(doc(db, 'profiles', tutorId), updatedProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${tutorId}`);
    }

    if (currentUser && currentUser.id === tutorId) {
      setCurrentUser(updatedProfile);
    }

    addToast('UPI Payment details & QR Code updated in Cloud!', 'success');
  };

  const linkChild = async (parentId: string, studentEmail: string) => {
    const child = profiles.find(p => p.email.toLowerCase() === studentEmail.toLowerCase() && p.role === 'student');
    if (!child) {
      return { success: false, message: `No student profile found with email "${studentEmail}". Please verify.` };
    }

    const parent = profiles.find(p => p.id === parentId);
    if (!parent) return { success: false, message: 'Parent profile not found' };

    const updatedParent = { ...parent, child_id: child.id, child_name: child.full_name };

    setProfiles(prev => prev.map(p => p.id === parentId ? updatedParent : p));

    try {
      await setDoc(doc(db, 'profiles', parentId), updatedParent);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${parentId}`);
    }

    if (currentUser && currentUser.id === parentId) {
      setCurrentUser(updatedParent);
    }

    addToast(`Linked child "${child.full_name}" to parent account`, 'success');
    return { success: true, message: `Successfully linked to ${child.full_name}` };
  };

  const resetToDemoData = async () => {
    try {
      for (const item of INITIAL_PROFILES) await setDoc(doc(db, 'profiles', item.id), item);
      for (const item of INITIAL_BATCHES) await setDoc(doc(db, 'batches', item.id), item);
      for (const item of INITIAL_ENROLLMENTS) await setDoc(doc(db, 'enrollments', item.id), item);
      for (const item of INITIAL_ATTENDANCE) await setDoc(doc(db, 'attendance', item.id), item);
      for (const item of INITIAL_FEES) await setDoc(doc(db, 'feeRecords', item.id), item);
      for (const item of INITIAL_HOMEWORK) await setDoc(doc(db, 'homework', item.id), item);
      for (const item of INITIAL_ANNOUNCEMENTS) await setDoc(doc(db, 'announcements', item.id), item);
      for (const item of INITIAL_PROGRESS) await setDoc(doc(db, 'progress', item.id), item);
      for (const item of INITIAL_DOUBTS) await setDoc(doc(db, 'doubts', item.id), item);
    } catch (err) {
      console.error('Reset error:', err);
    }

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
    addToast('Reset Cloud Firestore to original sample data', 'info');
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
        createGoogleMeetForBatch,
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
        loginWithEmail,
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
