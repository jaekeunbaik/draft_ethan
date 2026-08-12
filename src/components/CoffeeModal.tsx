import React, { useState } from 'react';
import { X, ExternalLink, Sparkles, Heart } from 'lucide-react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const CoffeeModal: React.FC<CoffeeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kofi' | 'account'>('kofi');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" /> 합격 축하 턱 커피 위젯
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
            ☕ Buy a Coffee for Ethan (합격 턱 쏘기)
          </h3>
          <p className="text-xs text-amber-100 mt-1 leading-relaxed">
            Dethan(디든) AI로 합격하셨나요? 개발자 이든(Ethan)에게 시원한 커피를 선물해 보세요!
          </p>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/20 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('kofi')}
              className={`px-3 py-1 rounded-lg transition ${
                activeTab === 'kofi'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              💙 Ko-fi 카드 결제 위젯
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-3 py-1 rounded-lg transition ${
                activeTab === 'account'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              💳 계좌 이체 후원
            </button>
          </div>
        </div>

        {/* Tab 1: Official Ko-fi Widget iframe */}
        {activeTab === 'kofi' ? (
          <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-2 min-h-[500px]">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/ethan0117/?hidefeed=true&widget=true&embed=true"
              style={{
                border: 'none',
                width: '100%',
                height: '520px',
                padding: '4px',
                background: '#f9fafb',
              }}
              title="ethan0117 ko-fi widget"
            />
            <div className="p-3 w-full bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="truncate">페이지가 안 떠나요?</span>
              <a
                href="https://ko-fi.com/ethan0117"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
              >
                <span>Ko-fi 새창에서 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Tab 2: Bank Transfer Options */
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
              <div className="text-sm font-extrabold text-amber-950">카카오뱅크 계좌 후원</div>
              <div className="text-lg font-black text-amber-800 tracking-tight font-mono select-all">
                7942-03-88490
              </div>
              <div className="text-xs text-gray-600">예금주: 백재근</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('79420388490');
                  alert('계좌번호 (79420388490)가 클립보드에 복사되었습니다!');
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                계좌번호 복사하기
              </button>
            </div>

            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>마음만으로도 진심으로 감사드립니다! 💖</p>
              <p>합격을 다시 한번 축하드립니다!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
