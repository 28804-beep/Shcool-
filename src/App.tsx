import React, { useEffect, useState } from 'react';
import {
  Calendar,
  LayoutDashboard,
  BookOpen,
  Settings,
  Plus,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TimetableView } from './components/TimetableView';
import { SubjectsListView } from './components/SubjectsListView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { SubjectModal } from './components/SubjectModal';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastMessage } from './components/Toast';
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
  UserProfile,
  ViewTab,
} from './types';
import {
  getScheduleForMember,
  loadActiveMemberFromStorage,
  loadAnnouncementsFromStorage,
  loadAuditLogsFromStorage,
  loadClassroomsFromStorage,
  loadCourseCatalogFromStorage,
  loadMembersFromStorage,
  loadProfileFromStorage,
  loadSchoolSettingsFromStorage,
  loadSubjectsFromStorage,
  loadTeachersFromStorage,
  saveActiveMemberToStorage,
  saveAnnouncementsToStorage,
  saveAuditLogsToStorage,
  saveClassroomsToStorage,
  saveCourseCatalogToStorage,
  saveMembersToStorage,
  saveProfileToStorage,
  saveSchoolSettingsToStorage,
  saveSubjectsToStorage,
  saveTeachersToStorage,
  setScheduleForMember,
} from './utils/schedule';
import { INITIAL_SAMPLE_SUBJECTS } from './constants';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  
  // Auth & Members
  const [members, setMembers] = useState<MemberAccount[]>(loadMembersFromStorage);
  const [activeMember, setActiveMember] = useState<MemberAccount | null>(loadActiveMemberFromStorage);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(loadAnnouncementsFromStorage);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Backoffice data
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(loadSchoolSettingsFromStorage);
  const [courses, setCourses] = useState<CourseCatalogItem[]>(loadCourseCatalogFromStorage);
  const [teachers, setTeachers] = useState<TeacherItem[]>(loadTeachersFromStorage);
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(loadClassroomsFromStorage);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(loadAuditLogsFromStorage);

  // Profile & Subjects for active user
  const [profile, setProfile] = useState<UserProfile>(() => {
    const base = loadProfileFromStorage();
    const currentM = loadActiveMemberFromStorage();
    if (currentM) {
      return {
        ...base,
        name: currentM.name,
        grade: currentM.grade,
        schoolName: currentM.schoolName,
      };
    }
    return base;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const currentM = loadActiveMemberFromStorage();
    if (currentM) {
      return getScheduleForMember(currentM.id);
    }
    return loadSubjectsFromStorage();
  });
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [prefillDay, setPrefillDay] = useState<DayOfWeek | undefined>(undefined);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectItem | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
    });
  };

  // Sync theme to <html> element
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Handle active member switch
  const handleSelectMember = (member: MemberAccount) => {
    setActiveMember(member);
    saveActiveMemberToStorage(member);

    // Update profile
    const updatedProfile: UserProfile = {
      ...profile,
      name: member.name,
      grade: member.grade,
      schoolName: member.schoolName,
    };
    setProfile(updatedProfile);
    saveProfileToStorage(updatedProfile);

    // Load member's schedule
    const memberSubjects = getScheduleForMember(member.id);
    setSubjects(memberSubjects);
  };

  const handleRegisterMember = (newMember: MemberAccount) => {
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveMembersToStorage(updatedMembers);
    
    // Seed standard schedule for the new student so they have a ready-made schedule
    setScheduleForMember(newMember.id, INITIAL_SAMPLE_SUBJECTS);
    handleSelectMember(newMember);
  };

  const handleLogout = () => {
    setActiveMember(null);
    saveActiveMemberToStorage(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'warning');
  };

  // Save changes to localStorage and member's schedule map
  const handleUpdateSubjects = (newSubjects: SubjectItem[]) => {
    setSubjects(newSubjects);
    saveSubjectsToStorage(newSubjects);
    if (activeMember) {
      setScheduleForMember(activeMember.id, newSubjects);
    }
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfileToStorage(newProfile);
    if (activeMember) {
      const updatedMembers = members.map((m) =>
        m.id === activeMember.id
          ? { ...m, name: newProfile.name, grade: newProfile.grade, schoolName: newProfile.schoolName }
          : m
      );
      setMembers(updatedMembers);
      saveMembersToStorage(updatedMembers);
      const updatedActive = updatedMembers.find((m) => m.id === activeMember.id) || activeMember;
      setActiveMember(updatedActive);
      saveActiveMemberToStorage(updatedActive);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: nextTheme };
    handleUpdateProfile(updated);
    showToast(nextTheme === 'dark' ? 'เปลี่ยนเป็นธีมมืดแล้ว' : 'เปลี่ยนเป็นธีมสว่างแล้ว', 'success');
  };

  // Subject Add / Edit
  const handleOpenAddModal = (day?: DayOfWeek, time?: string) => {
    setEditingSubject(null);
    setPrefillDay(day);
    setPrefillTime(time);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleSaveSubject = (
    data: Omit<SubjectItem, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit existing
      const updated = subjects.map((s) =>
        s.id === existingId ? { ...data, id: existingId } : s
      );
      handleUpdateSubjects(updated);
      showToast(`แก้ไขวิชา "${data.name}" เรียบร้อยแล้ว`, 'success');
    } else {
      // Add new
      const newSubject: SubjectItem = {
        ...data,
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      handleUpdateSubjects([...subjects, newSubject]);
      showToast(`เพิ่มวิชา "${data.name}" ลงในตารางแล้ว`, 'success');
    }
  };

  const handleDeleteSubject = (subject: SubjectItem) => {
    const updated = subjects.filter((s) => s.id !== subject.id);
    handleUpdateSubjects(updated);
    showToast(`ลบวิชา "${subject.name}" ออกจากตารางแล้ว`, 'warning');
  };

  const handleResetToSample = () => {
    handleUpdateSubjects(INITIAL_SAMPLE_SUBJECTS);
    showToast('โหลดตารางเรียนตัวอย่างเรียบร้อยแล้ว', 'success');
  };

  const handleClearAll = () => {
    handleUpdateSubjects([]);
    showToast('ล้างวิชาเรียนทั้งหมดเรียบร้อยแล้ว', 'warning');
  };

  const handleImportSubjects = (imported: SubjectItem[]) => {
    handleUpdateSubjects(imported);
  };

  // Admin Actions
  const handleUpdateMembers = (updated: MemberAccount[]) => {
    setMembers(updated);
    saveMembersToStorage(updated);
  };

  const handleUpdateAnnouncements = (updated: SchoolAnnouncement[]) => {
    setAnnouncements(updated);
    saveAnnouncementsToStorage(updated);
  };

  const handleUpdateSchoolSettings = (updated: SchoolSettings) => {
    setSchoolSettings(updated);
    saveSchoolSettingsToStorage(updated);
  };

  const handleUpdateCourses = (updated: CourseCatalogItem[]) => {
    setCourses(updated);
    saveCourseCatalogToStorage(updated);
  };

  const handleUpdateTeachers = (updated: TeacherItem[]) => {
    setTeachers(updated);
    saveTeachersToStorage(updated);
  };

  const handleUpdateClassrooms = (updated: ClassroomItem[]) => {
    setClassrooms(updated);
    saveClassroomsToStorage(updated);
  };

  const handleUpdateAuditLogs = (updated: AuditLogItem[]) => {
    setAuditLogs(updated);
    saveAuditLogsToStorage(updated);
  };

  const handleAdminViewStudentSchedule = (student: MemberAccount) => {
    const stuSchedule = getScheduleForMember(student.id);
    setSubjects(stuSchedule);
    setCurrentTab('schedule');
    showToast(`กำลังเปิดดูตารางเรียนของ ${student.name} (${student.memberCode})`, 'success');
  };

  const handlePushMasterScheduleToAll = () => {
    for (const m of members) {
      if (m.role === 'student') {
        setScheduleForMember(m.id, INITIAL_SAMPLE_SUBJECTS);
      }
    }
    setSubjects(INITIAL_SAMPLE_SUBJECTS);
    showToast('ส่งตารางเรียนมาตรฐานให้กับนักเรียนทุกคนเรียบร้อยแล้ว', 'success');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 flex flex-col font-sans transition-colors pb-20 md:pb-6">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => handleOpenAddModal()}
        theme={profile.theme}
        onToggleTheme={handleToggleTheme}
        activeMember={activeMember}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            subjects={subjects}
            profile={profile}
            activeMember={activeMember}
            announcements={announcements}
            onNavigateTab={setCurrentTab}
            onSelectSubject={setSelectedSubjectDetail}
            onOpenAddModal={handleOpenAddModal}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'schedule' && (
          <TimetableView
            subjects={subjects}
            profile={profile}
            onSelectSubject={setSelectedSubjectDetail}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {currentTab === 'subjects' && (
          <SubjectsListView
            subjects={subjects}
            profile={profile}
            onSelectSubject={setSelectedSubjectDetail}
            onEditSubject={handleOpenEditModal}
            onDeleteSubject={handleDeleteSubject}
            onOpenAddModal={() => handleOpenAddModal()}
          />
        )}

        {currentTab === 'admin' && activeMember && activeMember.role === 'admin' && (
          <AdminView
            currentAdmin={activeMember}
            members={members}
            announcements={announcements}
            schoolSettings={schoolSettings}
            courses={courses}
            teachers={teachers}
            classrooms={classrooms}
            auditLogs={auditLogs}
            onUpdateMembers={handleUpdateMembers}
            onUpdateAnnouncements={handleUpdateAnnouncements}
            onUpdateSchoolSettings={handleUpdateSchoolSettings}
            onUpdateCourses={handleUpdateCourses}
            onUpdateTeachers={handleUpdateTeachers}
            onUpdateClassrooms={handleUpdateClassrooms}
            onUpdateAuditLogs={handleUpdateAuditLogs}
            onViewStudentSchedule={handleAdminViewStudentSchedule}
            onPushMasterScheduleToAll={handlePushMasterScheduleToAll}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            profile={profile}
            subjects={subjects}
            onUpdateProfile={handleUpdateProfile}
            onResetToSample={handleResetToSample}
            onClearAll={handleClearAll}
            onImportSubjects={handleImportSubjects}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-stone-200 dark:border-zinc-800 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-semibold ${
            currentTab === 'dashboard'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>หน้าหลัก</span>
        </button>

        <button
          onClick={() => setCurrentTab('schedule')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-semibold ${
            currentTab === 'schedule'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-stone-500 dark:text-zinc-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>ตารางเรียน</span>
        </button>

        {/* Central Add Button */}
        <button
          onClick={() => handleOpenAddModal()}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/30 active:scale-95 transition-transform -mt-5"
          title="เพิ่มวิชา"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {activeMember?.role === 'admin' ? (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-semibold ${
              currentTab === 'admin'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-500 dark:text-zinc-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>แอดมิน</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('subjects')}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-semibold ${
              currentTab === 'subjects'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-stone-500 dark:text-zinc-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>รายวิชา</span>
          </button>
        )}

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-semibold text-stone-500 dark:text-zinc-400"
        >
          <Fingerprint className="w-5 h-5 text-orange-500" />
          <span>เมมเบอร์</span>
        </button>
      </nav>

      {/* Add / Edit Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
        prefillDay={prefillDay}
        prefillTime={prefillTime}
        allSubjects={subjects}
        showWeekend={profile.showWeekend}
      />

      {/* Subject Detail Modal */}
      <SubjectDetailModal
        subject={selectedSubjectDetail}
        onClose={() => setSelectedSubjectDetail(null)}
        onEdit={(sub) => {
          setSelectedSubjectDetail(null);
          handleOpenEditModal(sub);
        }}
        onDelete={handleDeleteSubject}
      />

      {/* Auth / Member Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeMember={activeMember}
        members={members}
        onLoginSuccess={handleSelectMember}
        onRegisterSuccess={handleRegisterMember}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
