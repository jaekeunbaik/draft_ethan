import React, { useState } from 'react';
import { X, Coffee, Copy, CheckCircle2, Heart, Trophy, Sparkles } from 'lucide-react';
import { notifyPaymentSuccess } from '../utils/discordNotifier';
import { supabase } from '../lib/supabase';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

type CoffeeOption = '1cup' | '2cups' | 'pass';

export const CoffeeModal: React.FC<CoffeeModalProps> = ({ isOpen, onClose, user }) => {
  const [selectedOption, setSelectedOption] = useState<CoffeeOption>('1cup');
  const [copied, setCopied] = useState(false);
  const [depositorName, setDepositorName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getAmount = (option: CoffeeOption) => {
    switch (option) {
      case '1cup':
        return 3000;
      case '2cups':
        return 6000;
      case 'pass':
        return 10000;
      default:
        return 3000;
    }
  };

  const getOptionName = (option: CoffeeOption) => {
    switch (option) {
      case '1cup':
        return '☕ 커피 1잔 쏘기 (3,000원)';
      case '2cups':
        return '☕☕ 커피 2잔 쏘기 (6,000원)';
      case 'pass':
        return '🏆 최종 합격 축하 턱! (10,000원)';
      default:
        return '☕ 커피 1잔 쏘기 (3,000원)';
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('79420388490');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositorName.trim()) {
      alert('입금자 성함(송금 시 표시되는 이름)을 입력해 주세요!');
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = getAmount(selectedOption);
      const optionName = getOptionName(selectedOption);

      // Save coffee support request to Supabase payment_requests if table exists
      try {
        if (user) {
          await supabase.from('payment_requests').insert([
            {
              user_id: user.id,
              email: user.email || `${user.id}@kakao.user`,
              depositor_name: depositorName.trim(),
              amount,
              product: `[커피 후원] ${optionName} ${message ? `(메시지: ${message})` : ''}`,
              status: 'opened',
            },
          ]);
        }
      } catch (dbErr) {
        console.warn('Skipped saving coffee support to DB:', dbErr);
      }

      // Send Discord notification embed
      const kakaoNickname =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.user_metadata?.preferred_username ||
        user?.user_metadata?.nickname ||
        user?.user_metadata?.user_name;

      const userDisplay = kakaoNickname
        ? `${kakaoNickname} (${user?.email || `${user?.id}@kakao.user`})`
        : user?.email || (user?.id ? `${user.id}@kakao.user` : '손님 지원자');

      const infoText = `[합격 턱 후원] ${userDisplay} (입금자: ${depositorName.trim()}) ${message ? `| 메시지: ${message.substring(0, 100)}` : ''}`;
      await notifyPaymentSuccess(amount, infoText);

      alert(`🎉 따뜻한 합격 턱 커피 후원이 접수되었습니다!\n개발자 에탄에게 큰 힘이 됩니다. 합격을 다시 한번 진심으로 축하드립니다! 🚀`);
      setDepositorName('');
      setMessage('');
      onClose();
    } catch (err: any) {
      console.error('Failed to submit coffee support:', err);
      alert('후원 접수 중 오류가 발생했습니다. 마음만은 깊이 감사드립니다!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400/20 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> 서류/면접 합격 턱 후원
            </span>
          </div>
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            ☕ 합격하면 커피 한 잔 쏘기!
          </h3>
          <p className="text-xs text-amber-100 mt-1 leading-relaxed">
            Dethan (디든)으로 서류나 면접에 통과하셨나요? 축하드립니다! 🎉<br />
            개발자 에탄에게 신나는 합격 턱 커피 한 잔을 선물해 주세요!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitSupport} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              후원 항목 선택
            </label>
            <div className="space-y-2">
              {/* Option 1: 1 Cup */}
              <div
                onClick={() => setSelectedOption('1cup')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                  selectedOption === '1cup'
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-gray-150 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-lg">
                    ☕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">시원한 아메리카노 1잔</div>
                    <div className="text-[10px] text-gray-500">서류 합격 기쁨 나누기</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-amber-700">3,000원</div>
              </div>

              {/* Option 2: 2 Cups */}
              <div
                onClick={() => setSelectedOption('2cups')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                  selectedOption === '2cups'
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-gray-150 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-lg">
                    ☕☕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">달콤한 디저트 & 커피 2잔</div>
                    <div className="text-[10px] text-gray-500">면접 합격 감사 인사를 담아</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-amber-700">6,000원</div>
              </div>

              {/* Option 3: Pass Celebration */}
              <div
                onClick={() => setSelectedOption('pass')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                  selectedOption === 'pass'
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-gray-150 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-lg shadow-sm">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      최종 합격 대박 턱!
                      <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.2 rounded font-bold">인기</span>
                    </div>
                    <div className="text-[10px] text-gray-500">원하던 기업 최종 통과 축하!!</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-amber-700">10,000원</div>
              </div>
            </div>
          </div>

          {/* Bank Account Info Box */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">카카오뱅크</span>
                  <span className="text-sm font-extrabold text-amber-950 tracking-tight">7942-03-88490</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">예금주: 백재근</p>
              </div>

              <button
                type="button"
                onClick={handleCopyAccount}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition shrink-0 ${
                  copied
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600 font-bold'
                    : 'border-amber-300 bg-white hover:bg-amber-100 text-amber-800'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>복사완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>계좌복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-2 border-t border-amber-200/40 pt-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  👤 송금 입금자 성함 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="송금 시 표시되는 이름을 적어주세요"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  💌 합격한 기업명 / 응원의 한마디 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 00기업 서류 통과했습니다! 디든 덕분에 합격했어요!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>{getAmount(selectedOption).toLocaleString()}원 합격 턱 커피 쏘기</span>
          </button>
        </form>
      </div>
    </div>
  );
};
