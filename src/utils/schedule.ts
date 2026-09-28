import {
  DAYS_CONFIG,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_CLASSROOMS,
  DEFAULT_COURSE_CATALOG,
  DEFAULT_MEMBERS,
  DEFAULT_SCHOOL_SETTINGS,
  DEFAULT_TEACHERS,
  DEFAULT_USER_PROFILE,
  INITIAL_SAMPLE_SUBJECTS,
  SUBJECT_COLORS,
} from '../constants';
import {
  AuditLogItem,
  ClassroomItem,
  CourseCatalogItem,
  DayOfWeek,
  MemberAccount,
  SchoolAnnouncement,
  SchoolSettings,
  SubjectColor,
  SubjectItem,
  TeacherItem,
  UserProfile,
} from '../types';

const STORAGE_KEY_SUBJECTS = 'my_class_schedule_subjects_v1';
const STORAGE_KEY_PROFILE = 'my_class_schedule_profile_v1';
const STORAGE_KEY_MEMBERS = 'my_class_schedule_members_v1';
const STORAGE_KEY_ACTIVE_MEMBER = 'my_class_schedule_active_member_v1';
const STORAGE_KEY_ANNOUNCEMENTS = 'my_class_schedule_announcements_v1';
const STORAGE_KEY_MEMBER_SCHEDULES_MAP = 'my_class_schedule_member_map_v1';
const STORAGE_KEY_SCHOOL_SETTINGS = 'my_class_schedule_school_settings_v1';
const STORAGE_KEY_COURSE_CATALOG = 'my_class_schedule_courses_v1';
const STORAGE_KEY_TEACHERS = 'my_class_schedule_teachers_v1';
const STORAGE_KEY_CLASSROOMS = 'my_class_schedule_classrooms_v1';
const STORAGE_KEY_AUDIT_LOGS = 'my_class_schedule_audit_logs_v1';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const map: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return map[dayIndex] || 'monday';
}

export function getDayConfig(day: DayOfWeek) {
  return DAYS_CONFIG.find((d) => d.key === day) || DAYS_CONFIG[0];
}

export function getSubjectColor(colorId: string): SubjectColor {
  return SUBJECT_COLORS.find((c) => c.id === colorId) || SUBJECT_COLORS[0];
}

/**
 * Checks if a subject time conflicts with any existing subject on the same day.
 * Two time ranges [startA, endA] and [startB, endB] overlap if:
 * max(startA, startB) < min(endA, endB)
 */
export function findTimeConflict(
  candidate: Pick<SubjectItem, 'day' | 'startTime' | 'endTime'>,
  allSubjects: SubjectItem[],
  ignoreId?: string
): SubjectItem | null {
  const candStart = timeToMinutes(candidate.startTime);
  const candEnd = timeToMinutes(candidate.endTime);

  if (candStart >= candEnd) {
    return null;
  }

  for (const existing of allSubjects) {
    if (ignoreId && existing.id === ignoreId) continue;
    if (existing.day !== candidate.day) continue;

    const existStart = timeToMinutes(existing.startTime);
    const existEnd = timeToMinutes(existing.endTime);

    // Overlap condition
    if (Math.max(candStart, existStart) < Math.min(candEnd, existEnd)) {
      return existing;
    }
  }

  return null;
}

export interface NextClassStatus {
  currentClass: SubjectItem | null;
  nextClass: SubjectItem | null;
  isTodayDone: boolean;
  minutesUntilNext: number | null;
  minutesRemainingInCurrent: number | null;
  isWeekendNotice: boolean;
}

export function getNextAndCurrentClass(
  subjects: SubjectItem[],
  currentDate: Date = new Date()
): NextClassStatus {
  const currentDay = getDayOfWeekFromDate(currentDate);
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // If weekend and no subjects on weekend
  const todaySubjects = subjects
    .filter((s) => s.day === currentDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  let currentClass: SubjectItem | null = null;
  let nextClass: SubjectItem | null = null;
  let minutesUntilNext: number | null = null;
  let minutesRemainingInCurrent: number | null = null;

  for (const sub of todaySubjects) {
    const start = timeToMinutes(sub.startTime);
    const end = timeToMinutes(sub.endTime);

    if (currentMinutes >= start && currentMinutes < end) {
      currentClass = sub;
      minutesRemainingInCurrent = end - currentMinutes;
    } else if (currentMinutes < start && !nextClass) {
      nextClass = sub;
      minutesUntilNext = start - currentMinutes;
    }
  }

  const isTodayDone = todaySubjects.length > 0 && !currentClass && !nextClass && currentMinutes > timeToMinutes(todaySubjects[todaySubjects.length - 1].endTime);

  // If no upcoming class today, look for the first class of tomorrow or next school day
  if (!currentClass && !nextClass) {
    // Find next day with classes
    const dayKeys: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIdx = dayKeys.indexOf(currentDay);
    
    for (let offset = 1; offset <= 7; offset++) {
      const nextDayIdx = (currentDayIdx + offset) % 7;
      const targetDay = dayKeys[nextDayIdx];
      const futureSubs = subjects
        .filter((s) => s.day === targetDay)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      
      if (futureSubs.length > 0) {
        nextClass = futureSubs[0];
        break;
      }
    }
  }

  return {
    currentClass,
    nextClass,
    isTodayDone,
    minutesUntilNext,
    minutesRemainingInCurrent,
    isWeekendNotice: currentDay === 'saturday' || currentDay === 'sunday',
  };
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export function formatThaiDate(date: Date, format: 'full' | 'short' = 'full'): string {
  const dayName = getDayConfig(getDayOfWeekFromDate(date)).thaiName;
  const day = date.getDate();
  const month = format === 'full' ? THAI_MONTHS[date.getMonth()] : THAI_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear() + 543; // Buddhist Era

  if (format === 'short') {
    return `${dayName} ${day} ${month} ${year}`;
  }
  return `${dayName}ที่ ${day} ${month} พ.ศ. ${year}`;
}

export function formatLiveTime(date: Date): { time: string; seconds: string } {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return {
    time: `${h}:${m}`,
    seconds: s,
  };
}

export function getDurationText(startTime: string, endTime: string): string {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (diff <= 0) return '0 นาที';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} ชม. ${mins} นาที`;
  }
  if (hours > 0) {
    return `${hours} ชั่วโมง`;
  }
  return `${mins} นาที`;
}

// Storage helpers
export function loadSubjectsFromStorage(): SubjectItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
    if (!raw) {
      saveSubjectsToStorage(INITIAL_SAMPLE_SUBJECTS);
      return INITIAL_SAMPLE_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_SUBJECTS;
  } catch (e) {
    console.error('Failed to load subjects from localStorage:', e);
    return INITIAL_SAMPLE_SUBJECTS;
  }
}

export function saveSubjectsToStorage(subjects: SubjectItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects to localStorage:', e);
  }
}

export function loadProfileFromStorage(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      saveProfileToStorage(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile from localStorage:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

// Members storage
export function loadMembersFromStorage(): MemberAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!raw) {
      saveMembersToStorage(DEFAULT_MEMBERS);
      return DEFAULT_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_MEMBERS;
  } catch (e) {
    console.error('Failed to load members from localStorage:', e);
    return DEFAULT_MEMBERS;
  }
}

export function saveMembersToStorage(members: MemberAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members to localStorage:', e);
  }
}

// Active member session
export function loadActiveMemberFromStorage(): MemberAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_MEMBER);
    if (!raw) {
      // Default to student member STU-50101 for seamless initial launch
      const members = loadMembersFromStorage();
      const defaultStudent = members.find((m) => m.role === 'student') || members[0] || null;
      if (defaultStudent) {
        saveActiveMemberToStorage(defaultStudent);
      }
      return defaultStudent;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load active member session:', e);
    return null;
  }
}

export function saveActiveMemberToStorage(member: MemberAccount | null): void {
  try {
    if (member) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_MEMBER, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_MEMBER);
    }
  } catch (e) {
    console.error('Failed to save active member session:', e);
  }
}

// Announcements
export function loadAnnouncementsFromStorage(): SchoolAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
    if (!raw) {
      saveAnnouncementsToStorage(DEFAULT_ANNOUNCEMENTS);
      return DEFAULT_ANNOUNCEMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ANNOUNCEMENTS;
  } catch (e) {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveAnnouncementsToStorage(announcements: SchoolAnnouncement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
  } catch (e) {
    console.error('Failed to save announcements:', e);
  }
}

// Member-specific schedules map
export function loadMemberSchedulesMap(): Record<string, SubjectItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBER_SCHEDULES_MAP);
    if (!raw) {
      const initialMap: Record<string, SubjectItem[]> = {
        'user-stu-501': INITIAL_SAMPLE_SUBJECTS,
      };
      saveMemberSchedulesMap(initialMap);
      return initialMap;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function saveMemberSchedulesMap(map: Record<string, SubjectItem[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBER_SCHEDULES_MAP, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save member schedules map:', e);
  }
}

export function getScheduleForMember(memberId: string): SubjectItem[] {
  const map = loadMemberSchedulesMap();
  if (map[memberId] && map[memberId].length > 0) {
    return map[memberId];
  }
  // Fallback to general subjects in storage or initial sample
  return loadSubjectsFromStorage();
}

export function setScheduleForMember(memberId: string, subjects: SubjectItem[]): void {
  const map = loadMemberSchedulesMap();
  map[memberId] = subjects;
  saveMemberSchedulesMap(map);
  // Also update standard subjects key for active student
  saveSubjectsToStorage(subjects);
}

// Auth Helper
export function authenticateMember(
  memberCode: string,
  password: string,
  members: MemberAccount[]
): MemberAccount | null {
  const cleanCode = memberCode.trim().toUpperCase();
  const cleanPw = password.trim();

  return (
    members.find(
      (m) =>
        m.memberCode.toUpperCase() === cleanCode &&
        m.password === cleanPw
    ) || null
  );
}

// Generate Next Member Code
export function generateNextMemberCode(role: 'admin' | 'student', members: MemberAccount[]): string {
  const prefix = role === 'admin' ? 'ADMIN-' : 'STU-';
  const roleMembers = members.filter((m) => m.role === role);
  const nextNum = roleMembers.length + 1;
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}${500 + nextNum}${randomSuffix % 100}`;
}

// School Settings
export function loadSchoolSettingsFromStorage(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL_SETTINGS);
    if (!raw) {
      saveSchoolSettingsToStorage(DEFAULT_SCHOOL_SETTINGS);
      return DEFAULT_SCHOOL_SETTINGS;
    }
    return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SCHOOL_SETTINGS;
  }
}

export function saveSchoolSettingsToStorage(settings: SchoolSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHOOL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save school settings:', e);
  }
}

// Course Catalog
export function loadCourseCatalogFromStorage(): CourseCatalogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSE_CATALOG);
    if (!raw) {
      saveCourseCatalogToStorage(DEFAULT_COURSE_CATALOG);
      return DEFAULT_COURSE_CATALOG;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COURSE_CATALOG;
  } catch (e) {
    return DEFAULT_COURSE_CATALOG;
  }
}

export function saveCourseCatalogToStorage(courses: CourseCatalogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COURSE_CATALOG, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save course catalog:', e);
  }
}

// Teachers
export function loadTeachersFromStorage(): TeacherItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (!raw) {
      saveTeachersToStorage(DEFAULT_TEACHERS);
      return DEFAULT_TEACHERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEACHERS;
  } catch (e) {
    return DEFAULT_TEACHERS;
  }
}

export function saveTeachersToStorage(teachers: TeacherItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers:', e);
  }
}

// Classrooms
export function loadClassroomsFromStorage(): ClassroomItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSROOMS);
    if (!raw) {
      saveClassroomsToStorage(DEFAULT_CLASSROOMS);
      return DEFAULT_CLASSROOMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CLASSROOMS;
  } catch (e) {
    return DEFAULT_CLASSROOMS;
  }
}

export function saveClassroomsToStorage(classrooms: ClassroomItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
  } catch (e) {
    console.error('Failed to save classrooms:', e);
  }
}

// Audit Logs
export function loadAuditLogsFromStorage(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (!raw) {
      saveAuditLogsToStorage(DEFAULT_AUDIT_LOGS);
      return DEFAULT_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_AUDIT_LOGS;
  } catch (e) {
    return DEFAULT_AUDIT_LOGS;
  }
}

export function saveAuditLogsToStorage(logs: AuditLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
}

export function addAuditLog(action: string, detail: string, actor: string): AuditLogItem[] {
  const current = loadAuditLogsFromStorage();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const newLog: AuditLogItem = {
    id: `log-${Date.now()}`,
    timestamp: `${dateStr} ${timeStr}`,
    action,
    detail,
    actor,
  };
  const updated = [newLog, ...current.slice(0, 49)]; // keep latest 50
  saveAuditLogsToStorage(updated);
  return updated;
}


