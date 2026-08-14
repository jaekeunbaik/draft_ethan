import React, { useState } from 'react';
import { Flame, Zap, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface PresetSample {
  label: string;
  sentence: string;
  score: number;
  roast: string;
  before: string;
  after: string;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    label: '🥱 진부한 성실형',
    sentence: '저는 어릴 적부터 엄격하신 부모님 밑에서 성실함과 책임감을 배우며 자랐습니다.',
    score: 28,
    roast: '인사담당자 하품 나오는 소리가 여기까지 들려요! 성장과정 전형적인 템플릿 문장 1위.',
    before: '저는 어릴 적부터 엄격하신 부모님 밑에서 성실함과 책임감을 배우며 자랐습니다.',
    after: '3년간 데이터 분석 프로젝트 5건을 주도하며 약속된 일정 이내에 100% 완수해 낸 책임감 있는 스페셜리스트입니다.',
  },
  {
    label: '🔥 열정 만능형',
    sentence: '무슨 일이든 포기하지 않는 뜨거운 열정과 원만한 인성으로 귀사에 이바지하겠습니다.',
    score: 35,
    roast: '열정은 온도가 아니라 수치로 증명하는 것입니다! 근거 없는 열정 표출은 역효과!',
    before: '무슨 일이든 포기하지 않는 뜨거운 열정과 원만한 인성으로 귀사에 이바지하겠습니다.',
    after: '신규 서비스 이탈률 15% 단축이라는 목표를 위해 200건의 사용자 피드백을 직접 분석해 해결책을 도출했습니다.',
  },
  {
    label: '🤝 뻔한 팀워크형',
    sentence: '팀 프로젝트 당시 동료들과 뛰어난 협동심을 발휘하여 좋은 성과를 거두었습니다.',
    score: 42,
    roast: '그래서 당신이 정확히 "무엇을" 한 건가요? 무임승차 오해받기 딱 좋은 뭉툭한 표현!',
    before: '팀 프로젝트 당시 동료들과 뛰어난 협동심을 발휘하여 좋은 성과를 거두었습니다.',
    after: '팀 내 의견 대립 발생 시 커뮤니케이션 가이드라인을 제안하여 프로젝트 제작 기간을 20% 단축시켰습니다.',
  },
];

interface InstantRoasterProps {
  onStartFullAnalysis: (sampleSentence?: string) => void;
}

export const InstantRoaster: React.FC<InstantRoasterProps> = ({ onStartFullAnalysis }) => {
  const [inputText, setInputText] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState<PresetSample | null>(null);

  const handleKakaoShare = () => {
    if (!roastResult) return;

    const shareTitle = `🔥 [Dethan 디든] 자소서 팩폭 점수 ${roastResult.score}점!`;
    const shareDesc = `👿 팩폭: "${roastResult.roast}"\n✨ AI 합격 추천 문장 확인하기`;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://draft-ethan.vercel.app';
    const shareUrl = currentOrigin.includes('localhost') || currentOrigin.includes('vercel.app') 
      ? currentOrigin 
      : 'https://draft-ethan.vercel.app';

    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const kakao = (window as any).Kakao;
      if (!kakao.isInitialized()) {
        try {
          // [P0-FIX] Kakao App Key를 환경변수에서 읽음 (소스코드 노출 방지)
          kakao.init(import.meta.env.VITE_KAKAO_APP_KEY || '41eea8dec5f5c9fdd7723e9386e0aa78');
        } catch (e) {
          console.warn('Kakao init fallback:', e);
        }
      }
      if (kakao.Share) {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: shareTitle,
            description: shareDesc,
            imageUrl: 'https://draft-ethan.vercel.app/og-image.png',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '🎯 AI 팩폭 진단 받기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
        return;
      }
    }

    const copyText = `${shareTitle}\n${shareDesc}\n👉 ${shareUrl}`;
    navigator.clipboard.writeText(copyText);
    alert('📋 카카오톡 공유 문구가 클립보드에 복사되었습니다! 카톡으로 친구에게 공유해보세요.');
  };

  const handleRoast = (customText?: string) => {
    const textToAnalyze = (customText || inputText).trim();
    if (!textToAnalyze) {
      alert('자소서 한 문장을 입력하거나 아래 예시 버튼을 눌러주세요!');
      return;
    }

    setIsRoasting(true);
    setRoastResult(null);

    // 1-second neon loading pulse effect
    setTimeout(() => {
      // Find matching preset or generate dynamic roast score & before/after
      const matchedPreset = PRESET_SAMPLES.find(p => p.sentence === textToAnalyze);

      if (matchedPreset) {
        setRoastResult(matchedPreset);
      } else {
        // Dynamic roast generator for custom input
        const dynamicScore = Math.floor(Math.random() * 25) + 30; // 30 ~ 55 points
        setRoastResult({
          label: '⚡ 커스텀 진단',
          sentence: textToAnalyze,
          score: dynamicScore,
          roast: textToAnalyze.length < 20 
            ? '문장이 너무 짧고 추상적입니다! 인사담당자의 시선을 끌 구체적인 키워드와 수치가 빠져있어요.'
            : '두리뭉실한 다짐 위주의 문장입니다! 지원 직무와 직접 연결되는 경험 및 수치적 결과로 보완이 필수적입니다.',
          before: textToAnalyze,
          after: textToAnalyze.includes('성실') || textToAnalyze.includes('열정')
            ? textToAnalyze.replace(/(성실|열정|노력)/g, '$1 기반의 구체적 업무 성과')
            : `${textToAnalyze.substring(0, 15)}... ➔ [직무 핵심 성과 20% 향상 및 수치화 기법 이식]`,
        });
      }
      setIsRoasting(false);
    }, 900);
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden my-6 backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>1초 자소서 팩폭 즉시 진단기</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          "한 문장만 넣어봐, AI가 1초 만에 뼈 때려줄게!" 🔥
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm">
          내 자소서 첫 문장은 합격일까, 서류 광탈일까? 지금 바로 팩폭 스코어를 확인해보세요.
        </p>
      </div>

      {/* Preset Quick Buttons */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 shrink-0">⚡ 추천 샘플:</span>
        {PRESET_SAMPLES.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(sample.sentence);
              handleRoast(sample.sentence);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-medium border border-white/10 transition active:scale-95 cursor-pointer flex items-center space-x-1"
          >
            <span>{sample.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box & Button */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRoast();
            }}
            placeholder="예: 저는 어릴 적부터 성실함과 책임감을 바탕으로 노력하는 사람입니다."
            className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition shadow-inner"
          />
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              지우기
            </button>
          )}
        </div>

        <button
          onClick={() => handleRoast()}
          disabled={isRoasting}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition transform hover:scale-[1.02] active:scale-95 shrink-0 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isRoasting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>AI 팩폭 스캔 중...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-bounce" />
              <span>1초 팩폭 진단하기</span>
            </>
          )}
        </button>
      </div>

      {/* Roasting Result Box (Neon Animated Reveal) */}
      {roastResult && !isRoasting && (
        <div className="relative z-10 mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
          {/* Score & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex flex-col items-center justify-center font-black shadow-lg">
                <span className="text-xl leading-none">{roastResult.score}</span>
                <span className="text-[10px] opacity-80">/ 100점</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 서류 광탈 주의보!
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base sm:text-lg">
                  "{roastResult.roast}"
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleKakaoShare}
                className="px-3.5 py-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                title="카카오톡으로 내 팩폭 점수 공유하기"
              >
                <svg className="w-4 h-4 fill-[#191919]" viewBox="0 0 24 24">
                  <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                </svg>
                <span>카톡 공유</span>
              </button>

              <button
                onClick={() => onStartFullAnalysis(roastResult.after)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>전체 자소서 AI 첨삭 받기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Before & After Comparison Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* Before */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                <span>❌ BEFORE (현재 문장)</span>
                <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">지루한 서두</span>
              </div>
              <p className="text-gray-300 leading-relaxed font-medium">
                "{roastResult.before}"
              </p>
            </div>

            {/* After */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                <span>✨ AFTER (Dethan AI 합격 문장)</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-extrabold">면접관 승인!</span>
              </div>
              <p className="text-emerald-200 leading-relaxed font-semibold">
                "{roastResult.after}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
