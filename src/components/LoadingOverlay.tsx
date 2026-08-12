import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, CheckCircle2, ShieldCheck, HeartPulse, Briefcase, Smile, Zap } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  jobTitle?: string;
}

const STEPS = [
  {
    step: 1,
    title: '🔍 1/3 직무 역량 & 인재상 정밀 분석 중...',
    desc: '희망 직무에 필요한 핵심 어휘 및 채용 담당자의 눈길을 사로잡을 키워드를 추출합니다.',
  },
  {
    step: 2,
    title: '⚡ 2/3 STAR 수치화 & 비즈니스 두괄식 교정 중...',
    desc: '추상적인 경험을 명확한 행동 수치(%, ms, 건수)와 두괄식 논리로 전면 재구성합니다.',
  },
  {
    step: 3,
    title: '🎯 3/3 면접관 압박 꼬리 질문 & 사이다 답안 생성 중...',
    desc: '실제 면접에서 지적될 수 있는 날카로운 압박 질문 3선과 모범 답안을 작성합니다.',
  },
  {
    step: 4,
    title: '✨ 최종 합격 보고서 & Before/After 비교 가공 중...',
    desc: '바로 제출 가능한 수준의 완성형 자기소개서 결과물을 가공하고 있습니다.',
  },
];

const JOB_TIPS = [
  {
    role: '🏥 임상간호사 / 보건의료',
    tip: '투약 안전(5 Right), 감염 관리, 전인적 환자 간호 경험을 수치 및 구체적 수액/환자 수와 연결하면 서류 통과율이 급상승합니다.',
  },
  {
    role: '☕ 고객서비스 / CS 매니저',
    tip: '컴플레인 응대 경험은 감정적 서술 대신 "공감 경청 -> 신속 대안 제안 -> 재방문율 95% 회복" 처럼 프로세스 중심으로 기술하세요.',
  },
  {
    role: '💻 IT / 백엔드 / 기획(PM)',
    tip: '기술 스택 나열보다 "트래픽 몰림 -> 인덱스 & Redis 도입 -> 응답속도 45% 단축" 식의 문제해결 데이터 결과를 두괄식으로 상단에 적으세요.',
  },
  {
    role: '💼 경영지원 / 영업 / 일반사무',
    tip: '일상 업무도 "문서 정리 효율화 30% 개선", "고객사 매칭 건수 20% 증대"와 같이 성과 지표로 재구성하면 강한 임팩트를 줍니다.',
  },
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, jobTitle }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      setProgressPercent(15);
      setTipIndex(0);
      return;
    }

    // Step progress timer
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev < STEPS.length - 1 ? prev + 1 : prev;
        return next;
      });
    }, 2800);

    // Smooth progress bar animation
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 90) return prev + Math.floor(Math.random() * 6) + 2;
        return 92;
      });
    }, 400);

    // Tip rotation timer
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % JOB_TIPS.length);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const currentStep = STEPS[currentStepIndex];
  const currentTip = JOB_TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
        
        {/* Top Glowing Ambient Light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badges */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Dethan AI 수석 컨설턴트 가동 중</span>
          </div>

          {jobTitle && (
            <span className="text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium truncate max-w-[140px]">
              🎯 {jobTitle}
            </span>
          )}
        </div>

        {/* Center Animated Wand Icon */}
        <div className="text-center my-4 space-y-3">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/40 animate-pulse">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Wand2 className="w-10 h-10 text-amber-300 animate-bounce" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white transition-all duration-300">
            {currentStep.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto min-h-[36px]">
            {currentStep.desc}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 my-6">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-indigo-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              첨삭진행률
            </span>
            <span className="text-amber-400 font-mono text-sm">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Job Tip Box */}
        <div className="mt-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-xs space-y-1.5 transition-all duration-500">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <span>💡</span> {currentTip.role} 합격 Tip
            </span>
            <span className="text-[10px] text-slate-400">실시간 조언</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            "{currentTip.tip}"
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>원문 맥락 100% 유지 & 비즈니스 핵심 역량 극대화</span>
        </div>
      </div>
    </div>
  );
};
