import React, { useState } from 'react';
import { History, HelpCircle, LogIn, LogOut, User, Shield } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  historyCount: number;
  user: any | null;
  isPro?: boolean;
  proExpiresAt?: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenPayment?: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenHelp,
  historyCount,
  user,
  isPro = false,
  proExpiresAt,
  onOpenAuth,
  onSignOut,
  onOpenPayment,
  onOpenAdmin,
  isAdmin = false,
}) => {
  const [logoClicks, setLogoClicks] = useState(0);
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const handleLogoClick = () => {
    if (!isAdmin) return; // 관리자 권한이 있는 이메일/데이터 계정만 진입을 허용합니다.
    
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        if (onOpenAdmin) {
          onOpenAdmin();
        }
        return 0;
      }
      return next;
    });
  };

  const getRemainingDays = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return null;
    const now = Date.now();
    const exp = new Date(expiresAtStr).getTime();
    const diffMs = exp - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysLeft = isPro ? getRemainingDays(proExpiresAt) : null;
  const formattedExpiresDate = proExpiresAt ? new Date(proExpiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 영역 */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 cursor-pointer select-none active:scale-98 transition-transform"
          title="5번 연속 클릭 시 관리자 모드가 표시됩니다"
        >
          <span className="font-extrabold tracking-tight text-xl text-gray-900">
            Draft <span className="text-indigo-600">Ethan</span>
          </span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-medium px-2 py-0.5 rounded-full border border-indigo-100">
            AI Studio Engine
          </span>
        </div>

        {/* 상단 액션/상태 */}
        <div className="flex items-center gap-4">
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3" />
              <span>관리자</span>
            </button>
          )}

          <span className="hidden sm:inline-flex items-center text-xs text-gray-500 gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gemini 3.5 Active
          </span>
          
          <button
            onClick={onOpenHelp}
            className="text-xs font-semibold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            도움말
          </button>

          <button
            onClick={onOpenHistory}
            className="relative text-xs font-semibold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            첨삭 기록
            {historyCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-650 text-white font-mono leading-none">
                {historyCount}
              </span>
            )}
          </button>

          {/* 로그인 세션 연동 */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-150 pl-3.5">
              {/* Profile info container */}
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full border border-gray-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700 max-w-[90px] truncate" title={displayName}>
                    {displayName}
                  </span>
                  
                  {isPro ? (
                    <span
                      className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-250 flex items-center gap-1 select-none tracking-tight leading-none shrink-0 shadow-2xs cursor-help"
                      title={formattedExpiresDate ? `PRO 이용권 만료 예정일: ${formattedExpiresDate}` : undefined}
                    >
                      <span>👑 PRO</span>
                      {daysLeft !== null && (
                        <span className="bg-amber-200/60 text-amber-900 px-1 py-0.5 rounded text-[8.5px] font-bold font-mono">
                          {daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 만료'}
                        </span>
                      )}
                    </span>
                  ) : (
                    <button
                      onClick={onOpenPayment}
                      className="text-[9px] font-extrabold text-indigo-650 hover:text-indigo-750 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center shrink-0 cursor-pointer transition select-none tracking-tight leading-none hover:bg-indigo-100"
                    >
                      🚀 UPGRADE
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={onSignOut}
                className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

