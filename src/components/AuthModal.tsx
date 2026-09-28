import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  ShieldCheck,
  GraduationCap,
  KeyRound,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  QrCode,
  School,
  Sparkles,
  LogOut,
  Fingerprint,
} from 'lucide-react';
import { MemberAccount, UserRole } from '../types';
import { authenticateMember, generateNextMemberCode } from '../utils/schedule';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: MemberAccount | null;
  members: MemberAccount[];
  onLoginSuccess: (member: MemberAccount) => void;
  onRegisterSuccess: (newMember: MemberAccount) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  activeMember,
  members,
  onLoginSuccess,
  onRegisterSuccess,
  onLogout,
  onShowToast,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'card'>('login');
  
  // Login form
  const [loginCode, setLoginCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regGrade, setRegGrade] = useState('มัธยมศึกษาปีที่ 4/1');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regCode, setRegCode] = useState(() => generateNextMemberCode('student', members));
  const [regPassword, setRegPassword] = useState('');
  const [regSchool, setRegSchool] = useState('โรงเรียนสาธิตวิทยาคม');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginCode.trim() || !loginPassword.trim()) {
      setLoginError('กรุณากรอกรหัสเมมเบอร์และรหัสผ่าน');
      return;
    }

    const member = authenticateMember(loginCode, loginPassword, members);
    if (!member) {
      setLoginError('รหัสเมมเบอร์หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    onLoginSuccess(member);
    onShowToast(`ยินดีต้อนรับ ${member.name} (${member.role === 'admin' ? 'แอดมิน' : 'นักเรียน'})`, 'success');
    onClose();
  };

  const handleQuickDemoLogin = (code: string, pw: string) => {
    setLoginCode(code);
    setLoginPassword(pw);
    const member = authenticateMember(code, pw, members);
    if (member) {
      onLoginSuccess(member);
      onShowToast(`เข้าสู่ระบบในฐานะ: ${member.name}`, 'success');
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!regPassword.trim()) {
      setRegError('กรุณาตั้งรหัสผ่านสำหรับเข้าใช้งาน');
      return;
    }

    // Check if code is already taken
    const exists = members.some(
      (m) => m.memberCode.toUpperCase() === regCode.trim().toUpperCase()
    );
    if (exists) {
      setRegError(`รหัสเมมเบอร์ "${regCode}" มีผู้ใช้งานแล้ว กรุณาระบุรหัสอื่น`);
      return;
    }

    const newMember: MemberAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberCode: regCode.trim().toUpperCase(),
      name: regName.trim(),
      password: regPassword.trim(),
      role: regRole,
      grade: regGrade.trim(),
      schoolName: regSchool.trim(),
      academicYear: 'ภาคเรียนที่ 1 / 2569',
      createdAt: new Date().toISOString().slice(0, 10),
      avatarSeed: regName.trim(),
    };

    onRegisterSuccess(newMember);
    onShowToast(`สมัครสมาชิกสำเร็จ! รหัสของคุณคือ: ${newMember.memberCode}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 relative overflow-hidden transition-all">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl">
            {activeMember ? (
              <button
                onClick={() => setAuthTab('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  authTab === 'card'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>บัตรเมมเบอร์</span>
              </button>
            ) : null}

            <button
              onClick={() => {
                setAuthTab('login');
                setLoginError('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                authTab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <button
              onClick={() => {
                setAuthTab('register');
                setRegError('');
                setRegCode(generateNextMemberCode(regRole, members));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                authTab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>สมัครสมาชิกใหม่</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {authTab === 'login' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-orange-500" />
                <span>เข้าสู่ระบบด้วยรหัสเมมเบอร์</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                กรอกรหัสประจำตัวนักเรียนหรือรหัสแอดมิน เพื่อเข้าใช้งานตารางเรียนของคุณ
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  รหัสเมมเบอร์ / รหัสนักเรียน (Member ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="เช่น STU-50101 หรือ ADMIN-001"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-mono uppercase text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  รหัสผ่าน / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-xs shadow-orange-500/25 transition-all"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80">
              <div className="text-xs font-medium text-stone-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>คลิกเพื่อทดสอบด้วยบัญชีตัวอย่าง (1-Click Login):</span>
              </div>
              <div className="space-y-1.5">
                {/* Admin button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN-001', 'admin')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-left hover:bg-amber-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        👑 อาจารย์วิชาการ (แอดมินระบบ)
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                        รหัส: ADMIN-001 · รหัสผ่าน: admin
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-200/60 dark:bg-amber-900 px-2 py-0.5 rounded-md">
                    สลับบทบาท
                  </span>
                </button>

                {/* Student 1 */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STU-50101', '1234')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-left hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-white">
                        👨‍🎓 กิตติพงษ์ วิริยะสกุล (ม.5/1)
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        รหัส: STU-50101 · รหัสผ่าน: 1234
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-300 bg-stone-200/60 dark:bg-zinc-700 px-2 py-0.5 rounded-md">
                    เข้าสู่ระบบ
                  </span>
                </button>

                {/* Student 2 */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STU-40315', '1234')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-left hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-500" />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-white">
                        👩‍🎓 พิมพ์มาดา รัตนกุล (ม.4/3 วิทย์-คณิต)
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        รหัส: STU-40315 · รหัสผ่าน: 1234
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-300 bg-stone-200/60 dark:bg-zinc-700 px-2 py-0.5 rounded-md">
                    เข้าสู่ระบบ
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER FORM */}
        {authTab === 'register' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-500" />
                <span>สมัครสมาชิกใหม่ (สร้างรหัสเมมเบอร์)</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                กรอกข้อมูลนักเรียนเพื่อสร้างรหัสสมาชิกและตารางเรียนส่วนตัว
              </p>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  ประเภทบัญชีสมาชิก
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('student');
                      setRegCode(generateNextMemberCode('student', members));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      regRole === 'student'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                        : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>นักเรียน (Student)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('admin');
                      setRegCode(generateNextMemberCode('admin', members));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      regRole === 'admin'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20'
                        : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>อาจารย์ / แอดมิน (Admin)</span>
                  </button>
                </div>
              </div>

              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น ศิรวิชญ์ พงษ์ไพศาล"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    รหัสเมมเบอร์ (Member ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="เช่น STU-50102"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm font-mono uppercase text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Grade & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    ระดับชั้น / แผนการเรียน
                  </label>
                  <input
                    type="text"
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value)}
                    placeholder="เช่น มัธยมศึกษาปีที่ 5/2"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    ตั้งรหัสผ่าน / PIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="ตั้งรหัสผ่านสำหรับล็อกอิน"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  สถานศึกษา
                </label>
                <input
                  type="text"
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-xs shadow-orange-500/25 transition-all"
              >
                ยืนยันการสมัครสมาชิก
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MEMBER ID CARD VIEW */}
        {authTab === 'card' && activeMember && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-orange-500" />
                <span>บัตรสมาชิกนักเรียน / Member Card</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                ข้อมูลประจำตัวผู้ใช้งานปัจจุบันในระบบ
              </p>
            </div>

            {/* Realistic School ID Card Graphic */}
            <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 text-white p-6 rounded-2xl border border-orange-500/30 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] tracking-widest uppercase text-orange-300 font-semibold">
                    {activeMember.schoolName}
                  </div>
                  <div className="text-sm font-bold text-stone-200 mt-0.5">
                    บัตรประจำตัวสมาชิกตารางเรียน
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-orange-400/40 bg-orange-500/20 text-orange-300">
                  {activeMember.role === 'admin' ? '👑 ADMINISTRATOR' : '🎓 STUDENT MEMBER'}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {activeMember.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight text-white">
                    {activeMember.name}
                  </div>
                  <div className="text-xs text-orange-200 mt-0.5">
                    {activeMember.grade}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    สมัครเมื่อ: {activeMember.createdAt}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                    MEMBER CODE
                  </div>
                  <div className="text-xl font-mono font-bold tracking-widest text-orange-400">
                    {activeMember.memberCode}
                  </div>
                </div>

                {/* Simulated Barcode Graphic */}
                <div className="flex items-center gap-0.5 h-8 bg-white/10 px-2 py-1 rounded">
                  <div className="w-1 h-full bg-white/80" />
                  <div className="w-0.5 h-full bg-white/80" />
                  <div className="w-1.5 h-full bg-white/80" />
                  <div className="w-0.5 h-full bg-white/80" />
                  <div className="w-2 h-full bg-white/80" />
                  <div className="w-1 h-full bg-white/80" />
                  <div className="w-0.5 h-full bg-white/80" />
                  <div className="w-1.5 h-full bg-white/80" />
                  <div className="w-1 h-full bg-white/80" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setAuthTab('login');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-stone-200"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
