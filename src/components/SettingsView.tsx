import React, { useRef, useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { INITIAL_SAMPLE_SUBJECTS } from '../constants';
import { SubjectItem, UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  subjects: SubjectItem[];
  onUpdateProfile: (updated: UserProfile) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
  onImportSubjects: (imported: SubjectItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  subjects,
  onUpdateProfile,
  onResetToSample,
  onClearAll,
  onImportSubjects,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    onShowToast('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      app: 'My Class Schedule',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: formData,
      subjects: subjects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_class_schedule_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('ส่งออกไฟล์สำรองตารางเรียนสำเร็จ', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.subjects)) {
          onImportSubjects(parsed.subjects);
          if (parsed.profile) {
            onUpdateProfile({ ...formData, ...parsed.profile });
            setFormData((prev) => ({ ...prev, ...parsed.profile }));
          }
          onShowToast(`นำเข้าตารางเรียนสำเร็จ (${parsed.subjects.length} วิชา)`, 'success');
        } else if (Array.isArray(parsed)) {
          onImportSubjects(parsed);
          onShowToast(`นำเข้าตารางเรียนสำเร็จ (${parsed.length} วิชา)`, 'success');
        } else {
          onShowToast('รูปแบบไฟล์ JSON ไม่ถูกต้อง', 'error');
        }
      } catch (err) {
        onShowToast('ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบไฟล์', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" />
          <span>การตั้งค่า (Settings)</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
          จัดการข้อมูลส่วนตัว ธีมการแสดงผล และสำรองข้อมูลตารางเรียนของคุณ
        </p>
      </div>

      {/* 1. Student Profile Form */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-orange-500" />
          <span>ข้อมูลนักเรียน & โรงเรียน</span>
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                ชื่อผู้ใช้งาน / ชื่อนักเรียน
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น กิตติพงษ์ วิริยะสกุล"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                ระดับชั้น / ห้องเรียน
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="เช่น มัธยมศึกษาปีที่ 5/1"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                ชื่อสถานศึกษา / โรงเรียน
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData({ ...formData, schoolName: e.target.value })
                }
                placeholder="เช่น โรงเรียนสาธิตวิทยาคม"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                ภาคเรียน / ปีการศึกษา
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                placeholder="เช่น ภาคเรียนที่ 1 / 2569"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกข้อมูลส่วนตัว'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Display & Schedule Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>การแสดงผลตารางเรียน & ธีม</span>
        </h2>

        {/* Theme Preference */}
        <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-zinc-800/80">
          <div>
            <div className="text-sm font-semibold text-stone-900 dark:text-white">
              ธีมสีหน้าจอ (Theme)
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400">
              เลือกธีมสว่าง (Light) หรือธีมมืด (Dark) สบายตา
            </div>
          </div>
          <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                const updated = { ...formData, theme: 'light' as const };
                setFormData(updated);
                onUpdateProfile(updated);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                formData.theme === 'light'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>สว่าง</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const updated = { ...formData, theme: 'dark' as const };
                setFormData(updated);
                onUpdateProfile(updated);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                formData.theme === 'dark'
                  ? 'bg-white dark:bg-zinc-900 text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>มืด</span>
            </button>
          </div>
        </div>

        {/* Show Weekend Toggle */}
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-semibold text-stone-900 dark:text-white">
              แสดงวันเสาร์ – อาทิตย์ ในตาราง
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400">
              เปิดใช้งานเมื่อมีคอร์สเรียนพิเศษ ติวสอบ หรือกิจกรรมเสาร์-อาทิตย์
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showWeekend}
              onChange={(e) => {
                const updated = { ...formData, showWeekend: e.target.checked };
                setFormData(updated);
                onUpdateProfile(updated);
                onShowToast(
                  e.target.checked
                    ? 'เปิดการแสดงผลวันเสาร์-อาทิตย์แล้ว'
                    : 'ปิดการแสดงผลวันเสาร์-อาทิตย์แล้ว',
                  'success'
                );
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      {/* 3. Backup & Restore Data */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-orange-500" />
          <span>สำรองและกู้คืนข้อมูล (Backup & Restore)</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          ข้อมูลตารางเรียนทั้งหมดถูกบันทึกไว้ในเบราว์เซอร์ของคุณ (Local Storage) โดยอัตโนมัติ คุณสามารถดาวน์โหลดไฟล์สำรองเพื่อย้ายเครื่องหรือแชร์กับเพื่อนร่วมชั้นได้
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 bg-stone-50 dark:bg-zinc-800/80 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-zinc-200 transition-colors"
          >
            <Download className="w-4 h-4 text-orange-500" />
            <span>ดาวน์โหลดไฟล์สำรอง (JSON)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-stone-50 dark:bg-zinc-800/80 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-zinc-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-orange-500" />
              <span>นำเข้าไฟล์สำรองตารางเรียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone: Reset & Clear */}
      <div className="bg-red-50/40 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>การจัดการข้อมูลตารางเรียน</span>
        </h2>
        <p className="text-xs text-red-600/80 dark:text-red-400/80">
          คำเตือน: การล้างข้อมูลจะลบวิชาเรียนทั้งหมดที่บันทึกไว้ในเครื่อง
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Restore sample */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-orange-500" />
            <span>โหลดตารางเรียนตัวอย่างเริ่มต้น</span>
          </button>

          {/* Clear all */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>ลบวิชาทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Confirm Dialog: Reset to Sample */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              ยืนยันโหลดตารางเรียนตัวอย่าง?
            </h3>
            <p className="text-xs text-stone-600 dark:text-zinc-300">
              ระบบจะเขียนทับตารางเรียนปัจจุบันด้วยข้อมูลตัวอย่างสำหรับนักเรียนระดับมัธยมศึกษา (คณิตศาสตร์, วิทยาศาสตร์, ภาษาไทย, ภาษาอังกฤษ, คอมพิวเตอร์ ฯลฯ)
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToSample();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs"
              >
                ยืนยันโหลดข้อมูลตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog: Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>ยืนยันลบวิชาทั้งหมด?</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-zinc-300">
              วิชาเรียนทั้งหมด {subjects.length} วิชาจะถูกลบออกจากเครื่องอย่างถาวร คุณแน่ใจหรือไม่? (คุณสามารถโหลดข้อมูลตัวอย่างกลับมาใหม่ได้ทุกเมื่อ)
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                ยืนยันลบทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
