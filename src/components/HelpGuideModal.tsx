import React from 'react';
import { HelpCircle, X, Sparkles, CheckCircle2, Zap, Target } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-gray-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-900">합격하는 자소서 작성 & 첨삭 가이드</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-105 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-600">
          {/* Tip 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>1. 두괄식 핵심 메시지 배치</span>
            </h4>
            <p className="leading-relaxed text-xs sm:text-sm text-gray-550">
              채용 평가관은 하루에 수백 장의 자소서를 검토합니다. 첫 문장에서 해당 문항의 결론과 핵심 성과를 먼저 제시하여 시선을 사로잡으세요.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>2. STAR 기법 활용 (Situation, Task, Action, Result)</span>
            </h4>
            <p className="leading-relaxed text-xs sm:text-sm text-gray-550">
              문제 상황(S)과 수행 과제(T)는 전체의 30% 이내로 간결히 기술하고, 본인이 직접 주도한 행동(A)과 정량적 성과(R)에 70%의 비중을 두어야 합니다.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. 숫자와 비즈니스 용어로 성과 수치화</span>
            </h4>
            <p className="leading-relaxed text-xs sm:text-sm text-gray-550">
              &quot;열심히 하여 매출이 늘었습니다&quot; 대신 &quot;고객 이탈 분석을 통해 전환율을 15% 개선하고 분기 매출 2,000만 원 증대에 기여했습니다&quot;와 같이 구체적 수치와 비즈니스 키워드를 사용하세요.
            </p>
          </div>

          {/* How AI Help Works */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
            <h5 className="font-bold text-indigo-900 text-xs">
              💡 Draft Ethan AI 자소서 첨삭 활용 팁
            </h5>
            <ul className="text-xs text-gray-650 space-y-1.5 list-disc list-inside">
              <li>희망 직무와 지원 기업명을 정확히 입력할수록 기업 인재상에 맞춰 교정됩니다.</li>
              <li>첨삭 스타일 옵션에서 강조하고 싶은 역량(수치 성과, 문제 해결 등)을 선택하세요.</li>
              <li>교정 결과의 문장별 Before & After 비교 기능을 통해 어떤 표현이 바뀌었는지 학습할 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 text-right bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
