import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Coffee,
  Plus,
  Megaphone,
  Fingerprint,
  ShieldCheck,
} from 'lucide-react';
import { DAYS_CONFIG } from '../constants';
import { DayOfWeek, MemberAccount, SchoolAnnouncement, SubjectItem, UserProfile, ViewTab } from '../types';
import {
  formatLiveTime,
  formatThaiDate,
  getDayConfig,
  getDayOfWeekFromDate,
  getNextAndCurrentClass,
  getSubjectColor,
  timeToMinutes,
} from '../utils/schedule';

interface DashboardViewProps {
  subjects: SubjectItem[];
  profile: UserProfile;
  activeMember: MemberAccount | null;
  announcements: SchoolAnnouncement[];
  onNavigateTab: (tab: ViewTab) => void;
  onSelectSubject: (subject: SubjectItem) => void;
  onOpenAddModal: (prefillDay?: DayOfWeek) => void;
  onOpenAuthModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  profile,
  activeMember,
  announcements,
  onNavigateTab,
  onSelectSubject,
  onOpenAddModal,
  onOpenAuthModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDay = getDayOfWeekFromDate(currentDate);
  const todayConfig = getDayConfig(todayDay);
  const { time, seconds } = formatLiveTime(currentDate);
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // Status for current and next class
  const classStatus = getNextAndCurrentClass(subjects, currentDate);

  // Today's subjects sorted by time
  const todaySubjects = subjects
    .filter((s) => s.day === todayDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Compute total hours today
  const totalMinutesToday = todaySubjects.reduce((acc, sub) => {
    return acc + (timeToMinutes(sub.endTime) - timeToMinutes(sub.startTime));
  }, 0);
  const totalHoursToday = (totalMinutesToday / 60).toFixed(1);

  // Greeting based on hour
  const currentHour = currentDate.getHours();
  let greetingPeriod = 'สวัสดี';
  if (currentHour < 12) greetingPeriod = 'อรุณสวัสดิ์';
  else if (currentHour < 16) greetingPeriod = 'สวัสดีตอนบ่าย';
  else greetingPeriod = 'สวัสดีตอนเย็น';

  // Counts by day
  const daysToShow = profile.showWeekend ? DAYS_CONFIG : DAYS_CONFIG.slice(0, 5);
  const subjectsByDay = daysToShow.map((d) => ({
    ...d,
    count: subjects.filter((s) => s.day === d.key).length,
  }));

  return (
    <div className="space-y-6">
      {/* 0. School Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {announcements[0].title}
                  </span>
                  {announcements[0].priority === 'important' && (
                    <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                      ด่วน
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  {announcements[0].content}
                </p>
                <div className="text-[11px] text-amber-700 dark:text-amber-400">
                  {announcements[0].date} · {announcements[0].author}
                </div>
              </div>
            </div>
            {activeMember?.role === 'admin' && (
              <button
                onClick={() => onNavigateTab('admin')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
              >
                จัดการประกาศ →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Hero Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{profile.grade} · {profile.schoolName}</span>
              </div>

              {activeMember && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-full text-xs font-semibold transition-all cursor-pointer"
                  title="ดูบัตรประจำตัวสมาชิก / สลับบัญชี"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span className="font-mono">รหัสเมมเบอร์: {activeMember.memberCode}</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {greetingPeriod}, {profile.name}
            </h1>
            <p className="text-orange-100 text-sm sm:text-base max-w-xl">
              วันนี้เป็น<span className="font-semibold text-white underline decoration-orange-300 underline-offset-4">{todayConfig.thaiName}</span> มีวิชาเรียนทั้งหมด{' '}
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md font-mono">{todaySubjects.length}</span> คาบ
              {todaySubjects.length > 0 && ` (${totalHoursToday} ชั่วโมง)`}
            </p>
          </div>

          {/* Quick Date-Time Badge */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right md:text-right shrink-0">
            <div className="text-xs text-orange-100 font-medium">
              {formatThaiDate(currentDate, 'full')}
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight tabular-nums mt-0.5">
              {time}
              <span className="text-orange-200 text-lg">:{seconds}</span>
              <span className="text-xs ml-1.5 font-normal text-orange-100">น.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current / Next Class Highlight */}
        <div className="sm:col-span-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
              {classStatus.currentClass ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">กำลังเรียนอยู่ในขณะนี้</span>
                </>
              ) : classStatus.nextClass ? (
                <>
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400 font-bold">คาบถัดไป</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-400" />
                  <span>สถานะการเรียนวันนี้</span>
                </>
              )}
            </span>

            {classStatus.currentClass && classStatus.minutesRemainingInCurrent !== null && (
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full font-mono">
                เหลืออีก {classStatus.minutesRemainingInCurrent} นาที
              </span>
            )}
            {!classStatus.currentClass && classStatus.minutesUntilNext !== null && (
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full font-mono">
                อีก {classStatus.minutesUntilNext} นาทีจะเริ่ม
              </span>
            )}
          </div>

          {classStatus.currentClass ? (
            <div
              onClick={() => onSelectSubject(classStatus.currentClass!)}
              className="cursor-pointer group bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {classStatus.currentClass.code && (
                      <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400">
                        {classStatus.currentClass.code}
                      </span>
                    )}
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {classStatus.currentClass.startTime} - {classStatus.currentClass.endTime} น.
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {classStatus.currentClass.name}
                  </h3>
                </div>
                <div className="w-3 h-8 rounded-full shrink-0" style={{ backgroundColor: getSubjectColor(classStatus.currentClass.colorId).accent }} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {classStatus.currentClass.room || 'ไม่ระบุห้อง'}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  {classStatus.currentClass.teacher || 'ไม่ระบุครูผู้สอน'}
                </span>
              </div>
            </div>
          ) : classStatus.nextClass ? (
            <div
              onClick={() => onSelectSubject(classStatus.nextClass!)}
              className="cursor-pointer group bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {classStatus.nextClass.code && (
                      <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400">
                        {classStatus.nextClass.code}
                      </span>
                    )}
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      {classStatus.nextClass.startTime} - {classStatus.nextClass.endTime} น. · {getDayConfig(classStatus.nextClass.day).thaiName}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {classStatus.nextClass.name}
                  </h3>
                </div>
                <div className="w-3 h-8 rounded-full shrink-0" style={{ backgroundColor: getSubjectColor(classStatus.nextClass.colorId).accent }} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {classStatus.nextClass.room || 'ไม่ระบุห้อง'}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  {classStatus.nextClass.teacher || 'ไม่ระบุครูผู้สอน'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 text-center py-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
                {classStatus.isWeekendNotice
                  ? 'วันนี้เป็นวันหยุดสุดสัปดาห์'
                  : 'เสร็จสิ้นการเรียนสำหรับวันนี้แล้ว 🎉'}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                พักผ่อนให้เพียงพอ ทบทวนบทเรียน และพร้อมลุยวันต่อไป
              </p>
            </div>
          )}
        </div>

        {/* Metric 2: Today's Subject Count */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              วิชาเรียนวันนี้
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
              {todaySubjects.length} <span className="text-sm font-normal text-stone-500">คาบ</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
              รวมเวลาเรียนประมาณ {totalHoursToday} ชม.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="mt-4 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>ดูตารางสัปดาห์</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Metric 3: Total Weekly Subjects */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              วิชาทั้งหมดในตาราง
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
              {subjects.length} <span className="text-sm font-normal text-stone-500">คาบ/สัปดาห์</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
              {profile.academicYear}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="mt-4 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>จัดการรายวิชา</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3. Summary of Subjects by Day */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              สรุปจำนวนวิชาในแต่ละวัน
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              คลิกที่วันเพื่อดูตารางเรียนหรือเพิ่มวิชา
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {subjectsByDay.map((day) => {
            const isToday = day.key === todayDay;
            return (
              <button
                key={day.key}
                onClick={() => onNavigateTab('schedule')}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isToday
                    ? 'border-orange-500/80 bg-orange-50/70 dark:bg-orange-950/30 ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40 hover:bg-stone-100/70 dark:hover:bg-zinc-800'
                }`}
              >
                <div
                  className="w-1.5 h-full absolute left-0 top-0"
                  style={{ backgroundColor: day.color }}
                />
                <div className="pl-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 dark:text-zinc-200">
                    {day.shortThai}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded">
                      วันนี้
                    </span>
                  )}
                </div>
                <div className="pl-1.5 mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-stone-900 dark:text-white tabular-nums">
                    {day.count}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-zinc-400">วิชา</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Today's Class Agenda / Timeline */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>ตารางเรียนวันนี้</span>
              <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-md">
                {todayConfig.thaiName}
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              แสดงรายการวิชาเรียงตามลำดับเวลาเรียนในวันนี้
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddModal(todayDay)}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-950/60 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/80 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มวิชาในวันนี้</span>
            </button>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg"
            >
              ดูแบบตารางเต็ม
            </button>
          </div>
        </div>

        {todaySubjects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 dark:border-zinc-800 rounded-xl">
            <Calendar className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-zinc-200">
              ไม่มีคาบเรียนในวันนี้
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              ยังไม่มีวิชาเรียนที่บันทึกไว้สำหรับวัน{todayConfig.thaiName} คุณสามารถเพิ่มวิชาใหม่ได้ตลอดเวลา
            </p>
            <button
              onClick={() => onOpenAddModal(todayDay)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มวิชาในวัน{todayConfig.thaiName}</span>
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-stone-200 dark:border-zinc-800 ml-4 pl-6 space-y-4">
            {todaySubjects.map((sub, index) => {
              const startMin = timeToMinutes(sub.startTime);
              const endMin = timeToMinutes(sub.endTime);
              const isPast = currentMinutes >= endMin;
              const isOngoing = currentMinutes >= startMin && currentMinutes < endMin;
              const isFuture = currentMinutes < startMin;
              const color = getSubjectColor(sub.colorId);

              // Check if we need to insert lunch break notice
              const prevSub = index > 0 ? todaySubjects[index - 1] : null;
              const showLunchBefore =
                startMin >= 780 &&
                (index === 0 || (prevSub && timeToMinutes(prevSub.endTime) <= 720));

              return (
                <React.Fragment key={sub.id}>
                  {/* Lunch break indicator */}
                  {showLunchBefore && (
                    <div className="py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-xl">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <span>12:00 - 13:00 น. · เวลาพักรับประทานอาหารกลางวัน 🍱</span>
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    {/* Status node on the timeline */}
                    <div
                      className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 bg-white dark:bg-zinc-900 transition-colors ${
                        isOngoing
                          ? 'border-orange-500 bg-orange-500 ring-4 ring-orange-500/20'
                          : isPast
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-stone-300 dark:border-zinc-600'
                      }`}
                    />

                    <div
                      onClick={() => onSelectSubject(sub)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isOngoing
                          ? 'border-orange-300 dark:border-orange-800/80 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
                          : isPast
                          ? 'border-stone-200 dark:border-zinc-800/80 bg-stone-50/40 dark:bg-zinc-900/40 opacity-75'
                          : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300 dark:hover:border-zinc-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: color.accent }}
                          />
                          {sub.code && (
                            <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400">
                              {sub.code}
                            </span>
                          )}
                          <h3 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {sub.name}
                          </h3>
                        </div>

                        {/* Status label */}
                        <div className="flex items-center gap-2">
                          {isOngoing && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                              <PlayCircle className="w-3 h-3" />
                              กำลังเรียน
                            </span>
                          )}
                          {isPast && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-zinc-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              เรียนจบแล้ว
                            </span>
                          )}
                          {isFuture && (
                            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">
                              รอเรียน
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-stone-700 dark:text-zinc-300 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            {sub.startTime} - {sub.endTime} น.
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-zinc-400">
                        {sub.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {sub.room}
                          </span>
                        )}
                        {sub.teacher && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            {sub.teacher}
                          </span>
                        )}
                        {sub.notes && (
                          <span className="text-orange-600 dark:text-orange-400 truncate max-w-xs">
                            💡 {sub.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
