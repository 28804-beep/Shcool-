import React, { useMemo, useState } from 'react';
import {
  Search,
  BookOpen,
  Plus,
  Filter,
  Trash2,
  Edit2,
  MapPin,
  User,
  Clock,
  Calendar,
  X,
} from 'lucide-react';
import { DAYS_CONFIG } from '../constants';
import { DayOfWeek, SubjectItem, UserProfile } from '../types';
import {
  getDayConfig,
  getDurationText,
  getSubjectColor,
  timeToMinutes,
} from '../utils/schedule';

interface SubjectsListViewProps {
  subjects: SubjectItem[];
  profile: UserProfile;
  onSelectSubject: (subject: SubjectItem) => void;
  onEditSubject: (subject: SubjectItem) => void;
  onDeleteSubject: (subject: SubjectItem) => void;
  onOpenAddModal: () => void;
}

export const SubjectsListView: React.FC<SubjectsListViewProps> = ({
  subjects,
  profile,
  onSelectSubject,
  onEditSubject,
  onDeleteSubject,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<string>('all');

  const daysToShow = profile.showWeekend ? DAYS_CONFIG : DAYS_CONFIG.slice(0, 5);

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((sub) => {
        // Filter by day
        if (filterDay !== 'all' && sub.day !== filterDay) {
          return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          sub.name.toLowerCase().includes(q) ||
          (sub.code && sub.code.toLowerCase().includes(q)) ||
          sub.teacher.toLowerCase().includes(q) ||
          sub.room.toLowerCase().includes(q) ||
          (sub.notes && sub.notes.toLowerCase().includes(q)) ||
          getDayConfig(sub.day).thaiName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Sort by day first, then by start time
        const dayOrder: Record<DayOfWeek, number> = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 7,
        };
        if (dayOrder[a.day] !== dayOrder[b.day]) {
          return dayOrder[a.day] - dayOrder[b.day];
        }
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
  }, [subjects, searchQuery, filterDay]);

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>รายวิชาทั้งหมด ({subjects.length} คาบ)</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              ค้นหา ดูรายละเอียด แก้ไข และจัดการรายวิชาในตารางเรียนของคุณ
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มวิชาใหม่</span>
          </button>
        </div>

        {/* Search Input & Day Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 border-t border-stone-100 dark:border-zinc-800/80">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อวิชา, รหัสวิชา, ครูผู้สอน, ห้องเรียน..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterDay('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterDay === 'all'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
              }`}
            >
              ทุกวัน ({subjects.length})
            </button>
            {daysToShow.map((day) => {
              const count = subjects.filter((s) => s.day === day.key).length;
              const isSelected = filterDay === day.key;
              return (
                <button
                  key={day.key}
                  onClick={() => setFilterDay(day.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : day.color }}
                  />
                  <span>{day.shortThai}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count & Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            ไม่พบวิชาที่ค้นหา
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `ไม่พบข้อมูลที่ตรงกับ "${searchQuery}" ลองค้นหาด้วยคำอื่นหรือล้างคำค้นหา`
              : 'ยังไม่มีวิชาเรียนในตัวกรองนี้'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterDay('all');
              }}
              className="mt-4 px-4 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 rounded-xl text-xs font-semibold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const color = getSubjectColor(sub.colorId);
            const dayConf = getDayConfig(sub.day);
            const duration = getDurationText(sub.startTime, sub.endTime);

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-zinc-700 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Left Color Indicator Bar */}
                <div
                  className="w-1.5 h-full absolute left-0 top-0"
                  style={{ backgroundColor: color.accent }}
                />

                <div>
                  {/* Top Day Badge and Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                      style={{
                        backgroundColor: `${dayConf.color}20`,
                        color: dayConf.color,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dayConf.color }}
                      />
                      {dayConf.thaiName}
                    </span>

                    <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400">
                      {sub.startTime} - {sub.endTime} น.
                    </span>
                  </div>

                  {/* Subject Name and Code */}
                  <div
                    onClick={() => onSelectSubject(sub)}
                    className="cursor-pointer"
                  >
                    {sub.code && (
                      <span className="text-xs font-mono text-stone-400 dark:text-zinc-500 block mb-0.5">
                        {sub.code}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {sub.name}
                    </h3>
                  </div>

                  {/* Teacher & Room */}
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{sub.room || 'ไม่ระบุห้องเรียน'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{sub.teacher || 'ไม่ระบุครูผู้สอน'}</span>
                    </div>
                  </div>

                  {sub.notes && (
                    <div className="mt-2.5 p-2 bg-stone-50 dark:bg-zinc-800/60 rounded-lg text-xs text-stone-600 dark:text-zinc-400 line-clamp-2">
                      💡 {sub.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectSubject(sub)}
                    className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    ดูรายละเอียด
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSubject(sub);
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="แก้ไขวิชา"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(sub);
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="ลบวิชา"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
