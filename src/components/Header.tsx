import React, { useEffect, useState } from 'react';
import {
  Calendar,
  BookOpen,
  Settings,
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  Clock,
  GraduationCap,
  Menu,
  X,
  ShieldCheck,
  User,
  Fingerprint,
} from 'lucide-react';
import { MemberAccount, ViewTab } from '../types';
import { formatLiveTime, formatThaiDate } from '../utils/schedule';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeMember: MemberAccount | null;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  theme,
  onToggleTheme,
  activeMember,
  onOpenAuthModal,
}) => {
  const [now, setNow] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { time, seconds } = formatLiveTime(now);
  const thaiDateStr = formatThaiDate(now, 'short');

  const navItems: { key: ViewTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'dashboard', label: 'หน้าหลัก', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'schedule', label: 'ตารางเรียน', icon: <Calendar className="w-4 h-4" /> },
    { key: 'subjects', label: 'รายวิชา', icon: <BookOpen className="w-4 h-4" /> },
    ...(activeMember?.role === 'admin'
      ? [
          {
            key: 'admin' as ViewTab,
            label: 'ระบบแอดมิน',
            icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
            badge: 'Admin',
          },
        ]
      : []),
    { key: 'settings', label: 'ตั้งค่า', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight tracking-tight">
                  My Class Schedule
                </span>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  ตารางเรียนของฉัน
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/70 p-1 rounded-xl">
            {navItems.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 hover:bg-stone-200/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Live Clock, Member Badge, Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Clock Chip */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-orange-50/80 dark:bg-zinc-800/80 border border-orange-200/70 dark:border-zinc-700/70 rounded-xl text-stone-700 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <div className="text-xs flex flex-col leading-tight">
                <span className="text-stone-500 dark:text-zinc-400 text-[10px]">{thaiDateStr}</span>
                <span className="font-semibold tabular-nums text-stone-900 dark:text-white font-mono text-xs">
                  {time}<span className="text-orange-500">:{seconds}</span> น.
                </span>
              </div>
            </div>

            {/* Member Profile / Auth Button */}
            {activeMember ? (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-stone-200 dark:border-zinc-700 rounded-xl text-left transition-all"
                title="คลิกเพื่อดูบัตรเมมเบอร์หรือสลับบัญชี"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                    activeMember.role === 'admin'
                      ? 'bg-amber-600'
                      : 'bg-orange-500'
                  }`}
                >
                  {activeMember.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    activeMember.name.slice(0, 1)
                  )}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-white truncate max-w-[110px]">
                      {activeMember.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-semibold">
                    {activeMember.memberCode}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Dark/Light Mode Button */}
            <button
              onClick={onToggleTheme}
              aria-label="สลับธีม สว่าง/มืด"
              className="p-2 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* Prominent Add Subject Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-orange-500/25 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">เพิ่มวิชา</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 dark:border-zinc-800 py-3 px-1 space-y-1">
            <div className="px-3 py-2 text-xs text-stone-500 dark:text-zinc-400 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800/80 mb-1">
              <span>{thaiDateStr}</span>
              <span className="font-mono tabular-nums font-semibold text-orange-600 dark:text-orange-400">
                {time}:{seconds} น.
              </span>
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onTabChange(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
