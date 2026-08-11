export type UserRole = 'tutor' | 'student' | 'parent';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  child_id?: string; // For parents linked to student profile ID
  child_name?: string;
  upi_id?: string;
  upi_qr_url?: string;
  created_at: string;
}

export interface BatchSlot {
  id: string;
  tutor_id: string;
  tutor_name: string;
  batch_name: string;
  subject: string;
  join_code: string;
  schedule: string; // e.g. "Mon, Wed • 4:00 PM - 5:30 PM"
  room_or_link?: string;
  meet_space_url?: string;
  meet_space_id?: string;
  fee_amount: number;
  fee_frequency: 'monthly' | 'per_session';
  created_at: string;
}

export interface Enrollment {
  id: string;
  batch_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  joined_at: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id: string;
  batch_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export type FeeStatus = 'Paid' | 'Pending' | 'Overdue';

export interface FeeRecord {
  id: string;
  batch_id: string;
  batch_name?: string;
  student_id: string;
  month: string; // e.g. "August 2026"
  amount: number;
  status: FeeStatus;
  due_date: string;
  paid_date?: string;
  receipt_no?: string;
  notes?: string;
}

export interface Homework {
  id: string;
  batch_id: string;
  batch_name?: string;
  title: string;
  description: string;
  due_date: string;
  attachments?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: 'image' | 'pdf' | 'document';
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  submitted_at?: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  batch_id: string;
  batch_name?: string;
  title: string;
  content: string;
  is_urgent?: boolean;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: 'image' | 'pdf' | 'document';
  created_at: string;
}

export interface ProgressRecord {
  id: string;
  batch_id: string;
  batch_name?: string;
  student_id: string;
  test_name: string;
  test_date: string;
  score: number;
  total_marks: number;
  remarks: string;
  created_at: string;
}

export interface DoubtQuestion {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  batch_id: string;
  batch_name?: string;
  question_text: string;
  image_url?: string;
  answer_text?: string;
  answered_at?: string;
  answered_by_name?: string;
  status: 'Pending' | 'Answered';
  created_at: string;
}
