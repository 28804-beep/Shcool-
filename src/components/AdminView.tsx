import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  GraduationCap,
  Calendar,
  Megaphone,
  Plus,
  Check,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Send,
  Eye,
  School,
  Building,
  UserCheck,
  History,
  Download,
  Upload,
  BookOpen,
  MapPin,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DAYS_CONFIG, SUBJECT_COLORS } from '../constants';
import {
  AuditLogItem,
  ClassroomItem,
  CourseCatalogItem,
  DayOfWeek,
  MemberAccount,
  SchoolAnnouncement,
  SchoolSettings,
  SubjectItem,
  TeacherItem,
  UserRole,
} from '../types';
import {
  addAuditLog,
  findTimeConflict,
  generateNextMemberCode,
  getDayConfig,
  getScheduleForMember,
  getSubjectColor,
  setScheduleForMember,
  timeToMinutes,
} from '../utils/schedule';

interface AdminViewProps {
  currentAdmin: MemberAccount;
  members: MemberAccount[];
  announcements: SchoolAnnouncement[];
  schoolSettings: SchoolSettings;
  courses: CourseCatalogItem[];
  teachers: TeacherItem[];
  classrooms: ClassroomItem[];
  auditLogs: AuditLogItem[];
  onUpdateMembers: (members: MemberAccount[]) => void;
  onUpdateAnnouncements: (announcements: SchoolAnnouncement[]) => void;
  onUpdateSchoolSettings: (settings: SchoolSettings) => void;
  onUpdateCourses: (courses: CourseCatalogItem[]) => void;
  onUpdateTeachers: (teachers: TeacherItem[]) => void;
  onUpdateClassrooms: (classrooms: ClassroomItem[]) => void;
  onUpdateAuditLogs: (logs: AuditLogItem[]) => void;
  onViewStudentSchedule: (member: MemberAccount) => void;
  onPushMasterScheduleToAll: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentAdmin,
  members,
  announcements,
  schoolSettings,
  courses,
  teachers,
  classrooms,
  auditLogs,
  onUpdateMembers,
  onUpdateAnnouncements,
  onUpdateSchoolSettings,
  onUpdateCourses,
  onUpdateTeachers,
  onUpdateClassrooms,
  onUpdateAuditLogs,
  onViewStudentSchedule,
  onPushMasterScheduleToAll,
  onShowToast,
}) => {
  const [backofficeTab, setBackofficeTab] = useState<
    'members' | 'edit-schedule' | 'courses' | 'school' | 'faculty' | 'announcements' | 'logs'
  >('members');

  // Search & Filters
  const [searchMember, setSearchMember] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [searchCourse, setSearchCourse] = useState('');

  // Selected Student for direct backoffice schedule editing
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<MemberAccount | null>(null);
  const [studentSubjects, setStudentSubjects] = useState<SubjectItem[]>([]);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // New Subject Form for Student Schedule
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDay, setSubDay] = useState<DayOfWeek>('monday');
  const [subStart, setSubStart] = useState('08:00');
  const [subEnd, setSubEnd] = useState('09:00');
  const [subRoom, setSubRoom] = useState('');
  const [subTeacher, setSubTeacher] = useState('');
  const [subColorId, setSubColorId] = useState('orange');
  const [subNotes, setSubNotes] = useState('');

  // Modals for Member CRUD
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberAccount | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<MemberAccount | null>(null);

  // New member form
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState(() => generateNextMemberCode('student', members));
  const [newGrade, setNewGrade] = useState('มัธยมศึกษาปีที่ 5/1');
  const [newPassword, setNewPassword] = useState('1234');

  // School Settings form
  const [settingsForm, setSettingsForm] = useState<SchoolSettings>(schoolSettings);

  // Course Form
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDept, setCourseDept] = useState('คณิตศาสตร์');
  const [courseCredits, setCourseCredits] = useState(1.5);
  const [courseTeacher, setCourseTeacher] = useState('');
  const [courseRoom, setCourseRoom] = useState('');
  const [courseColor, setCourseColor] = useState('orange');

  // Announcement Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'normal' | 'important'>('normal');

  // Load student's schedule when selected for editing
  const handleSelectStudentForEdit = (student: MemberAccount) => {
    setSelectedStudentForEdit(student);
    const subs = getScheduleForMember(student.id);
    setStudentSubjects(subs);
    setBackofficeTab('edit-schedule');
  };

  const handleSaveStudentSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    if (!subName.trim()) {
      onShowToast('กรุณากรอกชื่อวิชา', 'error');
      return;
    }

    const startMin = timeToMinutes(subStart);
    const endMin = timeToMinutes(subEnd);
    if (startMin >= endMin) {
      onShowToast('เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด', 'error');
      return;
    }

    const newSub: SubjectItem = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: subName.trim(),
      code: subCode.trim() || undefined,
      day: subDay,
      startTime: subStart,
      endTime: subEnd,
      room: subRoom.trim(),
      teacher: subTeacher.trim(),
      colorId: subColorId,
      notes: subNotes.trim() || undefined,
    };

    const updated = [...studentSubjects, newSub];
    setStudentSubjects(updated);
    setScheduleForMember(selectedStudentForEdit.id, updated);
    
    // Add audit log
    const updatedLogs = addAuditLog(
      'เพิ่มวิชาในตารางนักเรียน',
      `เพิ่มวิชา "${newSub.name}" ให้กับ ${selectedStudentForEdit.name} (${selectedStudentForEdit.memberCode})`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`เพิ่มวิชา "${newSub.name}" ในตารางของ ${selectedStudentForEdit.name} สำเร็จ`, 'success');
    setIsAddSubjectModalOpen(false);
    setSubName('');
    setSubCode('');
  };

  const handleDeleteStudentSubject = (subjectId: string, subName: string) => {
    if (!selectedStudentForEdit) return;
    const updated = studentSubjects.filter((s) => s.id !== subjectId);
    setStudentSubjects(updated);
    setScheduleForMember(selectedStudentForEdit.id, updated);

    // Audit log
    const updatedLogs = addAuditLog(
      'ลบวิชาในตารางนักเรียน',
      `ลบวิชา "${subName}" จากตารางของ ${selectedStudentForEdit.name}`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`ลบวิชา "${subName}" ออกจากตารางแล้ว`, 'warning');
  };

  // Quick fill from Course Catalog
  const handleSelectCourseTemplate = (crs: CourseCatalogItem) => {
    setSubName(crs.name);
    setSubCode(crs.code);
    setSubTeacher(crs.defaultTeacher);
    setSubRoom(crs.defaultRoom);
    setSubColorId(crs.colorId);
  };

  // Member CRUD
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onShowToast('กรุณาระบุชื่อ-นามสกุล', 'error');
      return;
    }
    const exists = members.some(
      (m) => m.memberCode.toUpperCase() === newCode.trim().toUpperCase()
    );
    if (exists) {
      onShowToast(`รหัสเมมเบอร์ "${newCode}" มีอยู่แล้วในระบบ`, 'error');
      return;
    }

    const created: MemberAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberCode: newCode.trim().toUpperCase(),
      name: newName.trim(),
      password: newPassword.trim() || '1234',
      role: newRole,
      grade: newGrade.trim(),
      schoolName: schoolSettings.schoolName,
      academicYear: schoolSettings.academicYear,
      createdAt: new Date().toISOString().slice(0, 10),
      avatarSeed: newName.trim(),
    };

    const updatedMembers = [...members, created];
    onUpdateMembers(updatedMembers);

    // Audit log
    const updatedLogs = addAuditLog(
      'สร้างสมาชิกใหม่',
      `สร้างสมาชิก ${created.name} รหัส ${created.memberCode} (${created.role})`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`เพิ่มสมาชิก ${created.name} (${created.memberCode}) สำเร็จ`, 'success');
    setIsAddMemberOpen(false);
    setNewName('');
    setNewPassword('1234');
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updatedList = members.map((m) =>
      m.id === editingMember.id ? editingMember : m
    );
    onUpdateMembers(updatedList);

    // Audit log
    const updatedLogs = addAuditLog(
      'แก้ไขข้อมูลสมาชิก',
      `แก้ไขข้อมูล ${editingMember.name} (${editingMember.memberCode})`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`แก้ไขข้อมูล ${editingMember.name} เรียบร้อยแล้ว`, 'success');
    setEditingMember(null);
  };

  const handleDeleteMember = () => {
    if (!memberToDelete) return;
    if (memberToDelete.id === currentAdmin.id) {
      onShowToast('ไม่สามารถลบบัญชีแอดมินที่กำลังใช้งานอยู่ได้', 'error');
      setMemberToDelete(null);
      return;
    }

    const updated = members.filter((m) => m.id !== memberToDelete.id);
    onUpdateMembers(updated);

    // Audit log
    const updatedLogs = addAuditLog(
      'ลบสมาชิก',
      `ลบสมาชิก ${memberToDelete.name} (${memberToDelete.memberCode}) ออกจากระบบ`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`ลบสมาชิก "${memberToDelete.name}" ออกจากระบบแล้ว`, 'warning');
    setMemberToDelete(null);
  };

  // Save School Settings
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolSettings(settingsForm);

    const updatedLogs = addAuditLog(
      'แก้ไขการตั้งค่าโรงเรียน',
      `อัปเดตข้อมูลสถานศึกษา: ${settingsForm.schoolName} (ปีการศึกษา ${settingsForm.academicYear})`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast('บันทึกข้อมูลการตั้งค่าโรงเรียนเรียบร้อยแล้ว', 'success');
  };

  // Course Catalog CRUD
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !courseCode.trim()) {
      onShowToast('กรุณากรอกรหัสวิชาและชื่อวิชา', 'error');
      return;
    }

    const newCrs: CourseCatalogItem = {
      id: `crs-${Date.now()}`,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      department: courseDept.trim(),
      credits: Number(courseCredits) || 1.0,
      defaultTeacher: courseTeacher.trim(),
      defaultRoom: courseRoom.trim(),
      colorId: courseColor,
    };

    const updated = [...courses, newCrs];
    onUpdateCourses(updated);

    const updatedLogs = addAuditLog(
      'เพิ่มรายวิชาในหลักสูตร',
      `เพิ่มรายวิชา "${newCrs.name}" (${newCrs.code}) ในกลุ่มสาระฯ ${newCrs.department}`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`เพิ่มวิชา ${newCrs.name} ในหลักสูตรสำเร็จ`, 'success');
    setIsAddCourseOpen(false);
    setCourseName('');
    setCourseCode('');
  };

  const handleDeleteCourse = (id: string, name: string) => {
    const updated = courses.filter((c) => c.id !== id);
    onUpdateCourses(updated);

    const updatedLogs = addAuditLog(
      'ลบรายวิชาในหลักสูตร',
      `ลบรายวิชา "${name}" ออกจากหลักสูตรกลาง`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast(`ลบวิชา "${name}" เรียบร้อยแล้ว`, 'warning');
  };

  // Announcements CRUD
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      onShowToast('กรุณากรอกหัวข้อและเนื้อหาประกาศ', 'error');
      return;
    }

    const ann: SchoolAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      date: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      author: currentAdmin.name,
      priority: newAnnPriority,
    };

    onUpdateAnnouncements([ann, ...announcements]);

    const updatedLogs = addAuditLog(
      'เผยแพร่ประกาศ',
      `เผยแพร่ประกาศ: "${ann.title}"`,
      currentAdmin.name
    );
    onUpdateAuditLogs(updatedLogs);

    onShowToast('เผยแพร่ประกาศโรงเรียนเรียบร้อยแล้ว', 'success');
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    onUpdateAnnouncements(updated);
    onShowToast('ลบประกาศเรียบร้อยแล้ว', 'warning');
  };

  // Full Database Backup
  const handleExportFullDatabase = () => {
    const dump = {
      app: 'My Class Schedule',
      system: 'Backoffice Management Console',
      exportedAt: new Date().toISOString(),
      schoolSettings,
      members,
      courses,
      teachers,
      classrooms,
      announcements,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backoffice_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('ดาวน์โหลดฐานข้อมูลระบบหลังบ้านสำเร็จ', 'success');
  };

  const filteredMembers = members.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
  });

  const filteredCourses = courses.filter((c) => {
    if (!searchCourse.trim()) return true;
    const q = searchCourse.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.defaultTeacher.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Backoffice Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-orange-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-orange-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ระบบแก้ไขหลังบ้าน (Backoffice Management System)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              แผงควบคุมฝ่ายวิชาการ & ทะเบียน
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              ผู้ดูแลระบบ: <span className="text-white font-semibold">{currentAdmin.name}</span> ({currentAdmin.memberCode}) · {schoolSettings.schoolName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportFullDatabase}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors"
              title="ดาวน์โหลดฐานข้อมูลระบบทั้งหมด (JSON)"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>สำรองฐานข้อมูล</span>
            </button>

            <button
              onClick={() => {
                setNewRole('student');
                setNewCode(generateNextMemberCode('student', members));
                setIsAddMemberOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มสมาชิก</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Backoffice Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 dark:border-zinc-800">
        <button
          onClick={() => setBackofficeTab('members')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'members'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการสมาชิก ({members.length})</span>
        </button>

        <button
          onClick={() => setBackofficeTab('edit-schedule')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'edit-schedule'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>แก้ไขตารางเรียนนักเรียน</span>
        </button>

        <button
          onClick={() => setBackofficeTab('courses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'courses'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>หลักสูตร & รายวิชา ({courses.length})</span>
        </button>

        <button
          onClick={() => setBackofficeTab('school')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'school'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>ตั้งค่าสถานศึกษา</span>
        </button>

        <button
          onClick={() => setBackofficeTab('faculty')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'faculty'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>คณาจารย์ & ห้องเรียน</span>
        </button>

        <button
          onClick={() => setBackofficeTab('announcements')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'announcements'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>ประกาศโรงเรียน ({announcements.length})</span>
        </button>

        <button
          onClick={() => setBackofficeTab('logs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            backofficeTab === 'logs'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติกิจกรรม ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS MANAGEMENT */}
      {backofficeTab === 'members' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัสเมมเบอร์, ระดับชั้น..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === 'all'
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                }`}
              >
                ทั้งหมด ({members.length})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === 'student'
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                }`}
              >
                นักเรียน ({members.filter((m) => m.role === 'student').length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === 'admin'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                }`}
              >
                แอดมิน ({members.filter((m) => m.role === 'admin').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5">รหัสเมมเบอร์</th>
                  <th className="p-3.5">ชื่อ - นามสกุล</th>
                  <th className="p-3.5">บทบาท</th>
                  <th className="p-3.5">ระดับชั้น / แผนการเรียน</th>
                  <th className="p-3.5 text-right">การจัดการหลังบ้าน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
                {filteredMembers.map((m) => {
                  const isCurrent = m.id === currentAdmin.id;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {m.memberCode}
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{m.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 px-1.5 py-0.2 rounded font-normal">
                              คุณ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}
                        >
                          {m.role === 'admin' ? '👑 ผู้ดูแลระบบ' : '🎓 นักเรียน'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600 dark:text-zinc-400">
                        {m.grade}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Direct Backoffice Schedule Editor */}
                          <button
                            onClick={() => handleSelectStudentForEdit(m)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 rounded-lg font-semibold transition-colors"
                            title="แก้ไขตารางเรียนของนักเรียนคนนี้โดยตรง"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>แก้ไขตารางเรียน</span>
                          </button>

                          {/* Edit Member */}
                          <button
                            onClick={() => setEditingMember({ ...m })}
                            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลสมาชิก"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Member */}
                          {!isCurrent && (
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              title="ลบสมาชิก"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT STUDENT SCHEDULE EDITOR IN BACKOFFICE */}
      {backofficeTab === 'edit-schedule' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>
                  แก้ไขตารางเรียนของนักเรียน: {selectedStudentForEdit ? selectedStudentForEdit.name : 'กรุณาเลือกนักเรียน'}
                </span>
                {selectedStudentForEdit && (
                  <span className="font-mono text-xs text-orange-600 font-bold bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded">
                    {selectedStudentForEdit.memberCode}
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                แอดมินสามารถเพิ่ม, แก้ไข, ลบวิชาในตารางเรียนของนักเรียนรายบุคคลได้โดยตรงจากระบบหลังบ้าน
              </p>
            </div>

            {/* Student Picker Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedStudentForEdit?.id || ''}
                onChange={(e) => {
                  const s = members.find((m) => m.id === e.target.value);
                  if (s) handleSelectStudentForEdit(s);
                }}
                className="px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white"
              >
                <option value="">-- เลือกนักเรียนที่ต้องการแก้ไข --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.memberCode}) - {m.grade}
                  </option>
                ))}
              </select>

              {selectedStudentForEdit && (
                <button
                  onClick={() => setIsAddSubjectModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มวิชาให้นักเรียน</span>
                </button>
              )}
            </div>
          </div>

          {selectedStudentForEdit ? (
            <div className="space-y-4">
              {/* Daily breakdown of student's classes */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {DAYS_CONFIG.slice(0, 5).map((day) => {
                  const daySubs = studentSubjects
                    .filter((s) => s.day === day.key)
                    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

                  return (
                    <div
                      key={day.key}
                      className="border border-stone-200 dark:border-zinc-800 rounded-xl p-3 bg-stone-50/50 dark:bg-zinc-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80 dark:border-zinc-700/80">
                        <span className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: day.color }}
                          />
                          <span>{day.thaiName}</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 bg-white dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                          {daySubs.length} วิชา
                        </span>
                      </div>

                      {daySubs.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-stone-400">
                          ไม่มีคาบเรียน
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {daySubs.map((sub) => {
                            const color = getSubjectColor(sub.colorId);
                            return (
                              <div
                                key={sub.id}
                                className="p-2.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs space-y-1 relative group shadow-2xs"
                                style={{ borderColor: `${color.accent}40` }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-semibold text-stone-500">
                                    {sub.startTime} - {sub.endTime}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteStudentSubject(sub.id, sub.name)}
                                    className="text-stone-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="ลบวิชานี้"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="font-bold text-stone-900 dark:text-white truncate">
                                  {sub.name}
                                </div>
                                <div className="text-[10px] text-stone-500 flex items-center justify-between">
                                  <span className="truncate">{sub.room || 'ไม่ระบุห้อง'}</span>
                                  <span className="truncate">{sub.teacher || ''}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">กรุณาเลือกนักเรียนจากเมนูเพื่อเริ่มแก้ไขตารางเรียน</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COURSE CATALOG */}
      {backofficeTab === 'courses' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <span>หลักสูตรกลาง & รายวิชาของโรงเรียน ({courses.length} วิชา)</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                จัดการรายวิชามาตรฐานที่เปิดสอนในโรงเรียน กำหนดรหัสวิชา หน่วยกิต และครูผู้สอน
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                placeholder="ค้นหารายวิชา, รหัสวิชา..."
                className="px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-xs"
              />
              <button
                onClick={() => setIsAddCourseOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มวิชาในหลักสูตร</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {filteredCourses.map((c) => {
              const color = getSubjectColor(c.colorId);
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-800/40 relative overflow-hidden flex flex-col justify-between"
                >
                  <div
                    className="w-1.5 h-full absolute left-0 top-0"
                    style={{ backgroundColor: color.accent }}
                  />
                  <div className="pl-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                        {c.code}
                      </span>
                      <span className="text-[10px] font-semibold bg-stone-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                        {c.credits} หน่วยกิต
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      {c.name}
                    </h4>
                    <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                      <div>หมวด: {c.department}</div>
                      <div>ครูผู้สอน: {c.defaultTeacher || 'ไม่ระบุ'}</div>
                      <div>ห้องประจำ: {c.defaultRoom || 'ไม่ระบุ'}</div>
                    </div>
                  </div>

                  <div className="pl-2 pt-3 mt-2 border-t border-stone-200/60 dark:border-zinc-700/60 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.name)}
                      className="text-stone-400 hover:text-red-600 p-1 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบวิชา</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SCHOOL & TERM SETTINGS */}
      {backofficeTab === 'school' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-orange-500" />
            <span>แก้ไขข้อมูลสถานศึกษาและภาคเรียน (School Profile & Term Settings)</span>
          </h3>

          <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">ชื่อสถานศึกษา / โรงเรียน</label>
                <input
                  type="text"
                  required
                  value={settingsForm.schoolName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">รหัสสถานศึกษา (School Code)</label>
                <input
                  type="text"
                  value={settingsForm.schoolCode}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, schoolCode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ปีการศึกษา</label>
                <input
                  type="text"
                  value={settingsForm.academicYear}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, academicYear: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ภาคเรียนปัจจุบัน</label>
                <input
                  type="text"
                  value={settingsForm.semester}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, semester: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ผู้อำนวยการสถานศึกษา</label>
                <input
                  type="text"
                  value={settingsForm.principalName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, principalName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">หัวหน้ากลุ่มบริหารวิชาการ</label>
                <input
                  type="text"
                  value={settingsForm.academicDirector}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, academicDirector: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-xs text-xs"
              >
                บันทึกการตั้งค่าโรงเรียน
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: FACULTY & CLASSROOMS DIRECTORY */}
      {backofficeTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Teachers list */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-500" />
              <span>ทำเนียบครูผู้สอน ({teachers.length} ท่าน)</span>
            </h4>
            <div className="space-y-2">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/70 dark:border-zinc-700/70 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-stone-900 dark:text-white">{t.name}</div>
                    <div className="text-[11px] text-stone-500">{t.department} · {t.roleTitle}</div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{t.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Classrooms list */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-500" />
              <span>ห้องเรียนและอาคาร ({classrooms.length} ห้อง)</span>
            </h4>
            <div className="space-y-2">
              {classrooms.map((rm) => (
                <div
                  key={rm.id}
                  className="p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/70 dark:border-zinc-700/70 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-stone-900 dark:text-white">{rm.name}</div>
                    <div className="text-[11px] text-stone-500">{rm.building}</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-stone-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                    ความจุ {rm.capacity} ที่นั่ง
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {backofficeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-orange-500" />
              <span>สร้างประกาศใหม่ส่งถึงนักเรียน</span>
            </h3>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  หัวข้อประกาศ
                </label>
                <input
                  type="text"
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="เช่น 📢 แจ้งกำหนดการสอบ หรือ 🌿 กิจกรรมพัฒนาโรงเรียน"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  เนื้อหาประกาศ
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAnnPriority === 'normal'}
                      onChange={() => setNewAnnPriority('normal')}
                    />
                    <span>ทั่วไป</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-red-600 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAnnPriority === 'important'}
                      onChange={() => setNewAnnPriority('important')}
                    />
                    <span>สำคัญมาก (ด่วน)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold"
                >
                  เผยแพร่ประกาศ
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.priority === 'important'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {ann.priority === 'important' ? 'สำคัญมาก' : 'ทั่วไป'}
                    </span>
                    <span className="text-stone-400">
                      {ann.date} · โดย {ann.author}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">{ann.title}</h4>
                  <p className="text-stone-600 dark:text-zinc-400">{ann.content}</p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM AUDIT LOGS */}
      {backofficeTab === 'logs' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-orange-500" />
                <span>ประวัติกิจกรรมและบันทึกการแก้ไขระบบ (System Audit Trail)</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                บันทึกการกระทำของผู้ดูแลระบบทั้งหมดเพื่อความโปร่งใสและการตรวจสอบย้อนหลัง
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-zinc-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">{log.action}</span>
                    <span className="font-mono text-[11px] text-stone-400">{log.timestamp}</span>
                  </div>
                  <p className="text-stone-600 dark:text-zinc-300">{log.detail}</p>
                </div>
                <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded">
                  {log.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT TO STUDENT SCHEDULE */}
      {isAddSubjectModalOpen && selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" />
                <span>เพิ่มวิชาในตารางของ {selectedStudentForEdit.name}</span>
              </h3>
              <button
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Fill from Course Catalog */}
            <div>
              <div className="text-[11px] font-semibold text-stone-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>หรือเลือกวิชาจากหลักสูตรกลาง (คลิกเพื่อดึงข้อมูลอัตโนมัติ):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 dark:bg-zinc-800/60 rounded-xl">
                {courses.map((crs) => (
                  <button
                    key={crs.id}
                    type="button"
                    onClick={() => handleSelectCourseTemplate(crs)}
                    className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-orange-50 dark:hover:bg-orange-950 border border-stone-200 dark:border-zinc-600 rounded-lg text-[11px] text-stone-700 dark:text-zinc-200"
                  >
                    {crs.code} {crs.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveStudentSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">ชื่อวิชา *</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="เช่น คณิตศาสตร์เพิ่มเติม"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">รหัสวิชา</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="เช่น ค32201"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">วันในสัปดาห์ *</label>
                <div className="grid grid-cols-5 gap-1">
                  {DAYS_CONFIG.slice(0, 5).map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSubDay(d.key)}
                      className={`py-1.5 rounded-lg border font-semibold ${
                        subDay === d.key
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      {d.shortThai}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    required
                    value={subStart}
                    onChange={(e) => setSubStart(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    required
                    value={subEnd}
                    onChange={(e) => setSubEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ห้องเรียน</label>
                  <input
                    type="text"
                    value={subRoom}
                    onChange={(e) => setSubRoom(e.target.value)}
                    placeholder="เช่น ห้อง 421"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ครูผู้สอน</label>
                  <input
                    type="text"
                    value={subTeacher}
                    onChange={(e) => setSubTeacher(e.target.value)}
                    placeholder="เช่น อ.สมชาย"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">สีประจำวิชา</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSubColorId(c.id)}
                      className={`h-7 rounded-lg ${subColorId === c.id ? 'ring-2 ring-orange-500 scale-105' : ''}`}
                      style={{ backgroundColor: c.accent }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                >
                  บันทึกลงตาราง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COURSE TO CATALOG */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                เพิ่มวิชาในหลักสูตรโรงเรียน
              </h3>
              <button onClick={() => setIsAddCourseOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">รหัสวิชา *</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="เช่น ค32101"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">หน่วยกิต</label>
                  <input
                    type="number"
                    step="0.5"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อวิชา *</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="เช่น ฟิสิกส์ 2 หรือ เคมี 2"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">กลุ่มสาระการเรียนรู้</label>
                <input
                  type="text"
                  value={courseDept}
                  onChange={(e) => setCourseDept(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ครูผู้สอนเริ่มต้น</label>
                  <input
                    type="text"
                    value={courseTeacher}
                    onChange={(e) => setCourseTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ห้องเรียนเริ่มต้น</label>
                  <input
                    type="text"
                    value={courseRoom}
                    onChange={(e) => setCourseRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                >
                  บันทึกวิชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">เพิ่มสมาชิกใหม่</h3>
              <button onClick={() => setIsAddMemberOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ประเภทบัญชี</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewRole('student');
                      setNewCode(generateNextMemberCode('student', members));
                    }}
                    className={`p-2 rounded-xl border font-semibold ${newRole === 'student' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-200'}`}
                  >
                    นักเรียน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRole('admin');
                      setNewCode(generateNextMemberCode('admin', members));
                    }}
                    className={`p-2 rounded-xl border font-semibold ${newRole === 'admin' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-stone-200'}`}
                  >
                    อาจารย์ / แอดมิน
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">รหัสเมมเบอร์</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">รหัสผ่าน / PIN</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ระดับชั้น / แผนการเรียน</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                แก้ไขข้อมูล ({editingMember.memberCode})
              </h3>
              <button onClick={() => setEditingMember(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSaveEditMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">ระดับชั้น / ห้องเรียน</label>
                <input
                  type="text"
                  value={editingMember.grade}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, grade: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">รหัสผ่านใหม่</label>
                <input
                  type="text"
                  required
                  value={editingMember.password}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">บทบาท</label>
                <select
                  value={editingMember.role}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                >
                  <option value="student">นักเรียน (Student)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MEMBER */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>ยืนยันลบสมาชิก?</span>
            </h4>
            <p className="text-xs text-stone-600 dark:text-zinc-300">
              คุณต้องการลบ <strong>{memberToDelete.name}</strong> ({memberToDelete.memberCode}) ออกจากระบบหรือไม่?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
