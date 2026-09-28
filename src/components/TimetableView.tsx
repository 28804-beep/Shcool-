import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Coffee,
  MapPin,
  User,
  Filter,
  Check,
} from 'lucide-react';
import { DAYS_CONFIG, STANDARD_TIME_SLOTS } from '../constants';
import { DayOfWeek, ScheduleViewMode, SubjectItem, UserProfile } from '../types';
import {
  getDayConfig,
  getDayOfWeekFromDate,
  getDurationText,
  getSubjectColor,
  timeToMinutes,
} from '../utils/schedule';

interface TimetableViewProps {
  subjects: SubjectItem[];
  profile: UserProfile;
  onSelectSubject: (subject: SubjectItem) => void;
  onOpenAddModal: (prefillDay?: DayOfWeek, prefillTime?: string) => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  subjects,
  profile,
  onSelectSubject,
  onOpenAddModal,
}) => {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const today = getDayOfWeekFromDate(new Date());
    // If weekend and not showWeekend, default to monday
    if (!profile.showWeekend && (today === 'saturday' || today === 'sunday')) {
      return 'monday';
    }
    return today;
  });

  const daysToShow = profile.showWeekend ? DAYS_CONFIG : DAYS_CONFIG.slice(0, 5);
  const todayDay = getDayOfWeekFromDate(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>ตารางเรียนประจำสัปดาห์</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            {profile.schoolName} · {profile.grade} · {profile.academicYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              มุมมองรายสัปดาห์
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              มุมมองรายวัน
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-colors"
            title="พิมพ์ตารางเรียน"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">พิมพ์ตาราง</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => onOpenAddModal(viewMode === 'day' ? selectedDay : undefined)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มวิชา</span>
          </button>
        </div>
      </div>

      {/* View Mode 1: Weekly Matrix Grid */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Scrollable Container with sticky headers */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-800/80">
                  <th className="p-3 w-32 text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider text-center border-r border-stone-200 dark:border-zinc-800 sticky left-0 bg-stone-50/95 dark:bg-zinc-800/95 z-10">
                    เวลา / วัน
                  </th>
                  {daysToShow.map((day) => {
                    const isToday = day.key === todayDay;
                    return (
                      <th
                        key={day.key}
                        className={`p-3 text-center border-r border-stone-200 dark:border-zinc-800 last:border-r-0 ${
                          isToday
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                            : 'text-stone-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: day.color }}
                          />
                          <span className="text-sm font-bold">{day.thaiName}</span>
                          {isToday && (
                            <span className="text-[10px] font-semibold bg-orange-500 text-white px-1.5 py-0.2 rounded-full">
                              วันนี้
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:border-zinc-800">
                {STANDARD_TIME_SLOTS.map((slot) => {
                  const isLunch = slot.isLunch;

                  if (isLunch) {
                    return (
                      <tr
                        key={slot.label}
                        className="bg-amber-50/60 dark:bg-amber-950/20 border-y border-amber-200/80 dark:border-amber-900/40"
                      >
                        <td className="p-3 text-center border-r border-stone-200 dark:border-zinc-800 sticky left-0 bg-amber-50/90 dark:bg-zinc-900/90 z-10">
                          <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">
                            พักกลางวัน
                          </div>
                        </td>
                        <td
                          colSpan={daysToShow.length}
                          className="p-3 text-center text-xs font-medium text-amber-800 dark:text-amber-300"
                        >
                          <div className="inline-flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-500" />
                            <span>12:00 – 13:00 น. พักรับประทานอาหารกลางวัน (Lunch Break) 🍱</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const slotStartMin = timeToMinutes(slot.startTime);
                  const slotEndMin = timeToMinutes(slot.endTime);

                  return (
                    <tr
                      key={slot.period}
                      className="hover:bg-stone-50/40 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Time Label Column */}
                      <td className="p-3 text-center border-r border-stone-200 dark:border-zinc-800 sticky left-0 bg-white/95 dark:bg-zinc-900/95 z-10">
                        <div className="text-xs font-bold text-stone-900 dark:text-white font-mono">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
                          {slot.label}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {daysToShow.map((day) => {
                        // Find matching subject that covers this time slot
                        const matchingSubjects = subjects.filter((s) => {
                          if (s.day !== day.key) return false;
                          const sStart = timeToMinutes(s.startTime);
                          const sEnd = timeToMinutes(s.endTime);
                          // Intersects this period slot
                          return Math.max(sStart, slotStartMin) < Math.min(sEnd, slotEndMin);
                        });

                        const isToday = day.key === todayDay;

                        return (
                          <td
                            key={day.key}
                            className={`p-2 border-r border-stone-200 dark:border-zinc-800 last:border-r-0 align-top h-24 transition-colors ${
                              isToday ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                            }`}
                          >
                            {matchingSubjects.length > 0 ? (
                              <div className="space-y-1.5 h-full">
                                {matchingSubjects.map((sub) => {
                                  const color = getSubjectColor(sub.colorId);
                                  const duration = getDurationText(sub.startTime, sub.endTime);

                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => onSelectSubject(sub)}
                                      className={`h-full min-h-[72px] p-2.5 rounded-xl border transition-all cursor-pointer group shadow-2xs hover:shadow-xs relative overflow-hidden flex flex-col justify-between ${color.lightBg} ${color.border}`}
                                    >
                                      {/* Accent color bar */}
                                      <div
                                        className="w-1.5 h-full absolute left-0 top-0"
                                        style={{ backgroundColor: color.accent }}
                                      />

                                      <div className="pl-1">
                                        <div className="flex items-center justify-between gap-1">
                                          {sub.code ? (
                                            <span className="text-[10px] font-mono font-medium text-stone-500 dark:text-zinc-400">
                                              {sub.code}
                                            </span>
                                          ) : <span />}
                                          <span className="text-[10px] font-mono font-semibold text-stone-600 dark:text-zinc-400">
                                            {sub.startTime} - {sub.endTime}
                                          </span>
                                        </div>
                                        <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                          {sub.name}
                                        </h4>
                                      </div>

                                      <div className="pl-1 mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-stone-600 dark:text-zinc-400">
                                        {sub.room && (
                                          <span className="truncate max-w-[100px]" title={sub.room}>
                                            📍 {sub.room}
                                          </span>
                                        )}
                                        {sub.teacher && (
                                          <span className="truncate max-w-[100px]" title={sub.teacher}>
                                            👤 {sub.teacher}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* Empty Slot: hover to add */
                              <button
                                onClick={() => onOpenAddModal(day.key, slot.startTime)}
                                className="w-full h-full min-h-[64px] border border-dashed border-transparent hover:border-orange-300 dark:hover:border-zinc-700 rounded-xl flex items-center justify-center text-stone-300 dark:text-zinc-700 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-zinc-800/40 transition-all group"
                                title={`คลิกเพื่อเพิ่มวิชาในวัน${day.thaiName} (${slot.startTime} น.)`}
                              >
                                <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-medium transition-opacity">
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>เพิ่ม</span>
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 2: Daily View */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {daysToShow.map((day) => {
              const isSelected = selectedDay === day.key;
              const count = subjects.filter((s) => s.day === day.key).length;
              const isToday = day.key === todayDay;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                      : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:border-orange-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : day.color }}
                  />
                  <span>{day.thaiName}</span>
                  {isToday && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                      }`}
                    >
                      วันนี้
                    </span>
                  )}
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-md font-mono ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Schedule List */}
          {(() => {
            const daySubs = subjects
              .filter((s) => s.day === selectedDay)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

            if (daySubs.length === 0) {
              return (
                <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
                  <Calendar className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    ไม่มีวิชาเรียนใน{getDayConfig(selectedDay).thaiName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    ยังไม่มีข้อมูลรายวิชาสำหรับวันนี้ คุณสามารถคลิกปุ่มด้านล่างเพื่อเพิ่มวิชาใหม่ได้ทันที
                  </p>
                  <button
                    onClick={() => onOpenAddModal(selectedDay)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มวิชาใน{getDayConfig(selectedDay).thaiName}</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daySubs.map((sub) => {
                  const color = getSubjectColor(sub.colorId);
                  const duration = getDurationText(sub.startTime, sub.endTime);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubject(sub)}
                      className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-800/80 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                    >
                      <div
                        className="w-1.5 h-full absolute left-0 top-0"
                        style={{ backgroundColor: color.accent }}
                      />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-mono">
                            {sub.startTime} - {sub.endTime} น. ({duration})
                          </span>
                          {sub.code && (
                            <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400">
                              {sub.code}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {sub.name}
                        </h3>

                        {sub.notes && (
                          <p className="text-xs text-stone-600 dark:text-zinc-400 mt-2 bg-stone-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-zinc-800">
                            💡 {sub.notes}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
                        <div className="flex items-center gap-3">
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
                        </div>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold group-hover:underline">
                          ดูรายละเอียด →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
