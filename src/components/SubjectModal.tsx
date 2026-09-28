import React, { useEffect, useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { DAYS_CONFIG, STANDARD_TIME_SLOTS, SUBJECT_COLORS } from '../constants';
import { DayOfWeek, SubjectItem } from '../types';
import {
  findTimeConflict,
  getDayConfig,
  getSubjectColor,
  timeToMinutes,
} from '../utils/schedule';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<SubjectItem, 'id'>, existingId?: string) => void;
  editingSubject?: SubjectItem | null;
  prefillDay?: DayOfWeek;
  prefillTime?: string;
  allSubjects: SubjectItem[];
  showWeekend: boolean;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  'คณิตศาสตร์พื้นฐาน',
  'คณิตศาสตร์เพิ่มเติม',
  'ฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
  'ภาษาไทย',
  'ภาษาอังกฤษพื้นฐาน',
  'ภาษาอังกฤษเพื่อการสื่อสาร',
  'สังคมศึกษา',
  'ประวัติศาสตร์',
  'วิทยาการคำนวณ',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะและทัศนศิลป์',
  'การงานอาชีพ',
  'กิจกรรมแนะแนว',
  'กิจกรรมชุมนุม',
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubject,
  prefillDay,
  prefillTime,
  allSubjects,
  showWeekend,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [colorId, setColorId] = useState('orange');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [overrideConflict, setOverrideConflict] = useState(false);

  const daysToShow = showWeekend ? DAYS_CONFIG : DAYS_CONFIG.slice(0, 5);

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setCode(editingSubject.code || '');
      setDay(editingSubject.day);
      setStartTime(editingSubject.startTime);
      setEndTime(editingSubject.endTime);
      setRoom(editingSubject.room);
      setTeacher(editingSubject.teacher);
      setColorId(editingSubject.colorId);
      setNotes(editingSubject.notes || '');
      setErrorMessage('');
      setOverrideConflict(false);
    } else {
      setName('');
      setCode('');
      setDay(prefillDay || 'monday');
      const start = prefillTime || '08:00';
      setStartTime(start);
      // default end time = start + 60 mins
      const startMin = timeToMinutes(start);
      const endH = Math.floor((startMin + 60) / 60);
      const endM = (startMin + 60) % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
      setRoom('');
      setTeacher('');
      setColorId('orange');
      setNotes('');
      setErrorMessage('');
      setOverrideConflict(false);
    }
  }, [editingSubject, prefillDay, prefillTime, isOpen]);

  // Conflict check in real time
  const conflictingSubject = findTimeConflict(
    { day, startTime, endTime },
    allSubjects,
    editingSubject?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('กรุณากรอกชื่อวิชา');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (startMin >= endMin) {
      setErrorMessage('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    if (conflictingSubject && !overrideConflict) {
      setErrorMessage(
        `เวลาเรียนซ้อนทับกับวิชา "${conflictingSubject.name}" (${conflictingSubject.startTime} - ${conflictingSubject.endTime} น.) กรุณาปรับเวลาหรือกดยืนยันบันทึกซ้อนทับ`
      );
      return;
    }

    onSave(
      {
        name: name.trim(),
        code: code.trim() || undefined,
        day,
        startTime,
        endTime,
        room: room.trim(),
        teacher: teacher.trim(),
        colorId,
        notes: notes.trim() || undefined,
      },
      editingSubject?.id
    );
    onClose();
  };

  const handlePeriodPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl my-8 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                {editingSubject ? 'แก้ไขวิชาเรียน' : 'เพิ่มวิชาเรียนใหม่'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {editingSubject
                  ? 'แก้ไขข้อมูลวิชาและเวลาในตาราง'
                  : 'กรอกรายละเอียดเพื่อจัดเข้าตารางเรียน'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Conflict Alert */}
        {conflictingSubject && (
          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="font-bold">⚠️ ตรวจพบคาบเรียนชนกัน!</div>
              <div>
                เวลาที่เลือก ({startTime} - {endTime} น.) ซ้อนทับกับวิชา{' '}
                <span className="font-bold underline">{conflictingSubject.name}</span>{' '}
                ({conflictingSubject.startTime} - {conflictingSubject.endTime} น.) ในวัน{getDayConfig(day).thaiName}
              </div>
              <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideConflict}
                  onChange={(e) => setOverrideConflict(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span>ยินยอมให้บันทึกคาบเรียนที่ชนกัน (Override)</span>
              </label>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: Subject Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                ชื่อวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น คณิตศาสตร์พื้นฐาน, ฟิสิกส์ 2"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                รหัสวิชา (ถ้ามี)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น ค32101"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Quick Subject Suggestions */}
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>แนะนำวิชายอดนิยม:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {COMMON_SUBJECT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Day of Week Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              วันในสัปดาห์ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
              {daysToShow.map((d) => {
                const isSelected = day === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDay(d.key)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                        : 'border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 text-stone-700 dark:text-zinc-300 hover:bg-stone-100'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span>{d.shortThai}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Period Presets */}
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>เลือกช่วงเวลาแบบเร็ว (คาบเรียนมาตรฐาน):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handlePeriodPreset('08:00', '09:00')}
                className="p-1.5 border border-stone-200 dark:border-zinc-700 rounded-lg hover:border-orange-500 text-stone-700 dark:text-zinc-300 text-left"
              >
                <div className="font-semibold text-[11px]">คาบ 1 (1 ชม.)</div>
                <div className="text-[10px] text-stone-500 font-mono">08:00 - 09:00</div>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodPreset('09:00', '10:00')}
                className="p-1.5 border border-stone-200 dark:border-zinc-700 rounded-lg hover:border-orange-500 text-stone-700 dark:text-zinc-300 text-left"
              >
                <div className="font-semibold text-[11px]">คาบ 2 (1 ชม.)</div>
                <div className="text-[10px] text-stone-500 font-mono">09:00 - 10:00</div>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodPreset('10:00', '12:00')}
                className="p-1.5 border border-stone-200 dark:border-zinc-700 rounded-lg hover:border-orange-500 text-stone-700 dark:text-zinc-300 text-left"
              >
                <div className="font-semibold text-[11px]">คาบ 3-4 (2 ชม.)</div>
                <div className="text-[10px] text-stone-500 font-mono">10:00 - 12:00</div>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodPreset('13:00', '15:00')}
                className="p-1.5 border border-stone-200 dark:border-zinc-700 rounded-lg hover:border-orange-500 text-stone-700 dark:text-zinc-300 text-left"
              >
                <div className="font-semibold text-[11px]">คาบ 5-6 (2 ชม.)</div>
                <div className="text-[10px] text-stone-500 font-mono">13:00 - 15:00</div>
              </button>
            </div>
          </div>

          {/* Row 3: Custom Start & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>เวลาเริ่มเรียน</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>เวลาสิ้นสุด</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Row 4: Room & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>ห้องเรียน</span>
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="เช่น ห้อง 421, อาคาร 4"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>ชื่อครูผู้สอน</span>
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="เช่น อ.สมชาย ใจดี"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Row 5: Color Swatches */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>สีประจำวิชา</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SUBJECT_COLORS.map((c) => {
                const isSelected = colorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorId(c.id)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-orange-500 scale-105 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.accent }}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
              บันทึกเพิ่มเติม / สิ่งที่ต้องเตรียม
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น เตรียมสมุดกราฟ, ส่งการบ้านทุกวันศุกร์"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-orange-500/25 transition-all"
            >
              {editingSubject ? 'บันทึกการแก้ไข' : 'บันทึกวิชาใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
