import React, { useState } from 'react';
import {
  X,
  MapPin,
  User,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { SubjectItem } from '../types';
import {
  getDayConfig,
  getDayOfWeekFromDate,
  getDurationText,
  getSubjectColor,
  timeToMinutes,
} from '../utils/schedule';

interface SubjectDetailModalProps {
  subject: SubjectItem | null;
  onClose: () => void;
  onEdit: (subject: SubjectItem) => void;
  onDelete: (subject: SubjectItem) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!subject) return null;

  const color = getSubjectColor(subject.colorId);
  const dayConf = getDayConfig(subject.day);
  const duration = getDurationText(subject.startTime, subject.endTime);

  // Check current status
  const now = new Date();
  const currentDay = getDayOfWeekFromDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(subject.startTime);
  const endMin = timeToMinutes(subject.endTime);

  const isToday = subject.day === currentDay;
  const isOngoing = isToday && currentMinutes >= startMin && currentMinutes < endMin;
  const isPastToday = isToday && currentMinutes >= endMin;
  const isUpcomingToday = isToday && currentMinutes < startMin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Top Color Banner Line */}
        <div
          className="h-2 w-full absolute left-0 top-0"
          style={{ backgroundColor: color.accent }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: `${dayConf.color}20`,
                  color: dayConf.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dayConf.color }}
                />
                {dayConf.thaiName}
              </span>

              {subject.code && (
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  {subject.code}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {subject.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator badge */}
        {isToday && (
          <div className="p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium">
            {isOngoing && (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-lg w-full">
                <PlayCircle className="w-4 h-4 text-emerald-500" />
                <span>กำลังเรียนอยู่ในขณะนี้ (เหลืออีก {endMin - currentMinutes} นาที)</span>
              </div>
            )}
            {isPastToday && (
              <div className="flex items-center gap-2 text-stone-600 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-800/60 p-2.5 rounded-lg w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>วิชานี้เรียนจบสำหรับวันนี้แล้ว</span>
              </div>
            )}
            {isUpcomingToday && (
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 p-2.5 rounded-lg w-full">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>คาบเรียนวันนี้ (จะเริ่มในอีก {startMin - currentMinutes} นาที)</span>
              </div>
            )}
          </div>
        )}

        {/* Detail Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1 text-sm">
          {/* Time & Duration */}
          <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 flex items-start gap-3">
            <Clock className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-stone-500 dark:text-zinc-400">เวลาเรียน</div>
              <div className="font-bold text-stone-900 dark:text-white font-mono mt-0.5">
                {subject.startTime} - {subject.endTime} น.
              </div>
              <div className="text-xs text-stone-500 dark:text-zinc-400">
                ระยะเวลา {duration}
              </div>
            </div>
          </div>

          {/* Classroom */}
          <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-stone-500 dark:text-zinc-400">ห้องเรียน</div>
              <div className="font-bold text-stone-900 dark:text-white mt-0.5">
                {subject.room || 'ไม่ระบุห้องเรียน'}
              </div>
            </div>
          </div>

          {/* Teacher */}
          <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 flex items-start gap-3">
            <User className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-stone-500 dark:text-zinc-400">ครูผู้สอน</div>
              <div className="font-bold text-stone-900 dark:text-white mt-0.5">
                {subject.teacher || 'ไม่ระบุชื่อครู'}
              </div>
            </div>
          </div>

          {/* Color tag */}
          <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full mt-0.5 shrink-0"
              style={{ backgroundColor: color.accent }}
            />
            <div>
              <div className="text-xs text-stone-500 dark:text-zinc-400">สีประจำวิชา</div>
              <div className="font-semibold text-stone-900 dark:text-white mt-0.5">
                {color.name}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {subject.notes && (
          <div className="p-3.5 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/50 rounded-xl text-xs space-y-1">
            <div className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>บันทึกเพิ่มเติม / สิ่งที่ต้องเตรียม:</span>
            </div>
            <p className="text-stone-700 dark:text-zinc-300 leading-relaxed pl-5">
              {subject.notes}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ลบวิชานี้</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(subject);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>แก้ไขวิชา</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Sub-Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center text-center space-y-3 z-20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white">
              ยืนยันการลบวิชา "{subject.name}"?
            </h4>
            <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs">
              วิชานี้จะถูกลบออกจากตารางเรียนในวัน{dayConf.thaiName} อย่างถาวร
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(subject);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
