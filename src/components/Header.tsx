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
  onOpenCoffee?: () => void;
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
  onOpenCoffee,
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* 로고 영역 */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 cursor-pointer select-none active:scale-98 transition-transform shrink-0 whitespace-nowrap"
          title="5번 연속 클릭 시 관리자 모드가 표시됩니다"
        >
          <span className="font-extrabold tracking-tight text-xl text-gray-900">
            D<span className="text-indigo-600">ethan</span>
          </span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100 whitespace-nowrap shrink-0">
            디든 AI Studio
          </span>
        </div>

        {/* 상단 액션/상태 */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 whitespace-nowrap">
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Shield className="w-3 h-3" />
              <span>관리자</span>
            </button>
          )}

          <span className="hidden lg:inline-flex items-center text-xs text-gray-500 gap-1.5 font-medium whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gemini 3.5 Active
          </span>

          <a
            href="https://de-cringe.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition whitespace-nowrap shrink-0"
            title="SNS 글 이불킥 검수 및 교정 AI 서비스 DeCringe 바로가기"
          >
            🔥 DeCringe AI
          </a>

          {onOpenCoffee && (
            <button
              onClick={onOpenCoffee}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer animate-pulse whitespace-nowrap shrink-0"
              title="서류/면접 합격하면 커피 한 잔 쏘기!"
            >
              ☕ 합격 턱 쏘기
            </button>
          )}
          
          <button
            onClick={onOpenHelp}
            className="text-xs font-semibold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>도움말</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative text-xs font-semibold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <History className="w-3.5 h-3.5" />
            <span>첨삭 기록</span>
            {historyCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-650 text-white font-mono leading-none">
                {historyCount}
              </span>
            )}
          </button>

          {/* 로그인 세션 연동 */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-150 pl-2.5 sm:pl-3.5 shrink-0 whitespace-nowrap">
              {/* Profile info container */}
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
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
                <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <span className="text-xs font-semibold text-gray-700 max-w-[80px] sm:max-w-[100px] truncate whitespace-nowrap" title={displayName}>
                    {displayName}
                  </span>
                  
                  {isPro ? (
                    <button
                      onClick={onOpenPayment}
                      className="text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-250 hover:border-amber-400 flex items-center gap-1 cursor-pointer transition select-none shrink-0 shadow-2xs active:scale-95 group whitespace-nowrap"
                      title={formattedExpiresDate ? `PRO 이용권 만료 예정일: ${formattedExpiresDate} (클릭 시 이용권 추가 연장)` : 'PRO 이용권 추가 연장하기'}
                    >
                      <span className="flex items-center gap-0.5 text-amber-700 whitespace-nowrap">
                        <span>👑</span> PRO
                      </span>
                      {daysLeft !== null && (
                        <span className="bg-amber-200/70 group-hover:bg-amber-300/80 text-amber-950 px-1.5 py-0.5 rounded text-[10px] font-bold leading-none tracking-tight whitespace-nowrap">
                          {daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 만료'}
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onOpenPayment}
                      className="text-[9px] font-extrabold text-indigo-650 hover:text-indigo-750 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center shrink-0 cursor-pointer transition select-none tracking-tight leading-none hover:bg-indigo-100 whitespace-nowrap"
                    >
                      🚀 UPGRADE
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={onSignOut}
                className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline whitespace-nowrap">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-extrabold text-[#191919] bg-[#FEE500] hover:bg-[#FDD835] border border-yellow-400/80 px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-yellow-500/10 active:scale-95 whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4 fill-[#191919] shrink-0" viewBox="0 0 24 24">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span className="whitespace-nowrap">1초 카카오 시작</span>
              <span className="hidden sm:inline-block text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">무료 3회</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

