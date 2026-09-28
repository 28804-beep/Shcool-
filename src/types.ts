export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type UserRole = 'admin' | 'student';

export interface SubjectColor {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  accent: string;
  lightBg: string;
}

export interface SubjectItem {
  id: string;
  code?: string;
  name: string;
  day: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  room: string;
  teacher: string;
  colorId: string;
  notes?: string;
}

export interface MemberAccount {
  id: string;
  memberCode: string; // เช่น STU-50101, ADMIN-001
  name: string;
  password: string;
  role: UserRole;
  grade: string;
  schoolName: string;
  academicYear: string;
  createdAt: string;
  avatarSeed?: string;
}

export interface UserProfile {
  name: string;
  grade: string;
  schoolName: string;
  academicYear: string;
  theme: 'light' | 'dark';
  showWeekend: boolean;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'important';
}

export interface TimeSlot {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  isLunch?: boolean;
}

export interface CourseCatalogItem {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  defaultTeacher: string;
  defaultRoom: string;
  colorId: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  department: string;
  email?: string;
  roleTitle: string;
}

export interface ClassroomItem {
  id: string;
  name: string;
  building: string;
  type: 'general' | 'lab' | 'computer' | 'sports' | 'hall';
  capacity: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  actor: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolCode: string;
  academicYear: string;
  semester: string;
  principalName: string;
  academicDirector: string;
  contactEmail: string;
}

export type ViewTab = 'dashboard' | 'schedule' | 'subjects' | 'admin' | 'settings';
export type ScheduleViewMode = 'week' | 'day';

