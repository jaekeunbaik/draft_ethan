import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            scope: 'profile_nickname,profile_image',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Kakao OAuth Error:', err);
      setError(err.message || '카카오 로그인 시도 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSuccessMsg('회원가입 인증 메일이 발송되었습니다. 메일함을 확인해 주세요.');
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err.message || '인증 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl max-w-sm w-full flex flex-col shadow-2xl text-gray-800 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center space-y-2 mt-4">
          <h3 className="font-extrabold tracking-tight text-2xl text-gray-900">
            Draft <span className="text-indigo-600">Ethan</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            막히는 초안부터 직무 맞춤 첨삭까지, AI 자소서 아키텍트
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-0 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Kakao Auth Button */}
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full py-4 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-extrabold text-sm flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] active:scale-98 cursor-pointer shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
          >
            {/* Kakao logo path */}
            <svg className="w-5 h-5 fill-[#191919] shrink-0" viewBox="0 0 24 24">
              <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span>💛 1초 카카오 간편 로그인하기</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase font-bold tracking-wider">또는 이메일로 계속하기</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Email Tab Header */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-indigo-650 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-indigo-650 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">이메일 주소</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">비밀번호</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/5 active:scale-98"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'signin' ? '로그인하기' : '인증 이메일 전송'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50 text-center text-[10px] text-gray-400">
          계정 생성 시 Draft Ethan의 서비스 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
        </div>

      </div>
    </div>
  );
};
