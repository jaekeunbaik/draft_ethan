import React, { useState } from 'react';
import { OgCardGenerator } from './OgCardGenerator';
import { CorrectionResponse, CorrectionRequest } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  ImageIcon,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Layers,
  FileCheck2,
  Tag,
  Zap,
  Split,
  Maximize2,
  Printer,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface ResultSectionProps {
  result: CorrectionResponse;
  request: CorrectionRequest;
  isPro?: boolean;
  user?: any | null;
  onOpenPayment?: () => void;
  onOpenAuth?: () => void;
  onReEdit?: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  request,
  isPro = false,
  user,
  onOpenPayment,
  onOpenAuth,
  onReEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'diff' | 'analysis' | 'keywords' | 'interview'>('text');
  const [isOgCardOpen, setIsOgCardOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'corrected' | 'sideBySide'>('corrected');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName?: string) => {
    navigator.clipboard.writeText(text);
    if (keyName) {
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyAll = () => {
    const fullText = `=========================================
[Dethan 디든 AI 자소서 첨삭 리포트]
- 지원 직무: ${request.jobTitle}
- 지원 기업: ${request.companyName || '미지정'}
- 종합 역량 점수: ${result.overallScore}점 / 100점
=========================================

[대표 헤드라인]
${result.headline}

[교정 자소서 전문]
${result.correctedText}

=========================================
[수석 컨설턴트 피드백]
${result.feedbacks.map((f, i) => `${i + 1}. ${f}`).join('\n')}

[면접 꼬리 질문 및 모범 답안]
${(result.interviewQuestions || []).map((iq, i) => `Q${i + 1}. ${iq.question}\n- 면접관 의도: ${iq.interviewerIntent}\n- 사이다 모범 답안: ${iq.modelAnswer}\n- 꿀팁: ${iq.keyTip}`).join('\n\n')}
`;

    navigator.clipboard.writeText(fullText);
    alert('✨ 전체 첨삭본 + 면접 모범답안이 클립보드에 완벽 복사되었습니다!');
  };

  const handleKakaoReportShare = () => {
    const shareTitle = `🎯 [Dethan 디든] ${request.jobTitle || '자소서'} AI 첨삭 완료!`;
    const shareDesc = `🏆 종합 점수: ${result.overallScore}점 / 100점\n💡 "${result.headline}"`;
    const shareUrl = 'https://draft-ethan.vercel.app';

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
              title: '📝 AI 자소서 첨삭 받기',
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
    alert('📋 카카오톡 공유 문구가 클립보드에 복사되었습니다!');
  };

  const handleDownloadTxt = () => {
    const textContent = `=========================================
[AI 자소서 첨삭 리포트]
- 지원 직무: ${request.jobTitle}
- 지원 기업: ${request.companyName || '미지정'}
- 종합 역량 점수: ${result.overallScore}점 / 100점
=========================================

[대표 헤드라인]
${result.headline}

[교정 자소서 전문]
${result.correctedText}

=========================================
[핵심 첨삭 피드백]
${result.feedbacks.map((f, i) => `${i + 1}. ${f}`).join('\n')}

[강점]
${result.strengths.map((s) => `- ${s}`).join('\n')}

[보완점]
${result.weaknesses.map((w) => `- ${w}`).join('\n')}

[추천 어휘 및 키워드]
${result.recommendedKeywords.join(', ')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `자소서_첨삭결과_${request.jobTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Color helper for scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 80) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div id="result-section" className="space-y-6">
      {/* Non-logged-in Guest Conversion Card */}
      {!user && onOpenAuth && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FEE500] border-2 border-yellow-400 flex items-center justify-center text-xl shrink-0 shadow-md shadow-yellow-500/20">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-amber-950 bg-yellow-300 border border-yellow-400 px-2 py-0.5 rounded-full">
                  1회 무료 체험 완료
                </span>
                <span className="text-xs font-extrabold text-amber-950">이 첨삭 결과를 내 계정에 영구 저장하시겠습니까?</span>
              </div>
              <p className="text-xs text-gray-700 mt-1 font-medium">
                지금 1초 카카오 가입하시면 <b>이 첨삭본이 계정에 평생 보관</b>되며, <b>매일 무료 3회 첨삭</b>이 추가 지급됩니다!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] border-2 border-yellow-400 text-[#191919] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-yellow-500/20 shrink-0"
          >
            <svg className="w-4 h-4 fill-[#191919] shrink-0" viewBox="0 0 24 24">
              <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span>💛 1초 카카오 가입하고 저장</span>
          </button>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#1e293b] via-[#312e81] to-[#1e293b] border border-indigo-950/20 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 font-semibold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                {request.jobTitle}
              </span>
              {request.companyName && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-indigo-100 font-medium border border-white/10">
                  {request.companyName}
                </span>
              )}
              <span className="text-gray-300">자소서 첨삭 완료</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              &quot;{result.headline}&quot;
            </h2>

            <p className="text-xs sm:text-sm text-gray-300">
              지원 직무의 핵심 역량이 돋보이도록 비즈니스 문장과 논리 구조를 개선했습니다.
            </p>
          </div>

          {/* Overall Score Meter */}
          <div className="flex items-center space-x-4 self-start md:self-auto bg-black/35 p-4 rounded-2xl border border-white/10 shadow-inner min-w-[200px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Circular Gauge */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * result.overallScore) / 100}
                  strokeLinecap="round"
                  className="text-indigo-300 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-lg font-extrabold text-white">
                {result.overallScore}
              </span>
            </div>

            <div>
              <div className="text-xs text-gray-300 font-medium">종합 역량 점수</div>
              <div className="text-sm font-bold text-indigo-300 mt-0.5">
                {result.overallScore >= 90
                  ? 'S등급 (매우 우수)'
                  : result.overallScore >= 80
                  ? 'A등급 (우수)'
                  : result.overallScore >= 70
                  ? 'B등급 (양호)'
                  : 'C등급 (보완 필요)'}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">상위 10% 수준 완성도</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'jobFit', name: '직무 적합성', value: result.scoreBreakdown.jobFit },
          { key: 'readability', name: '가독성·어휘력', value: result.scoreBreakdown.readability },
          { key: 'logic', name: '논리성·구조', value: result.scoreBreakdown.logic },
          { key: 'specificity', name: '구체성·성과', value: result.scoreBreakdown.specificity },
        ].map((item) => (
          <div
            key={item.key}
            className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.name}</span>
              <strong className="text-sm text-gray-900 font-bold">{item.value}점</strong>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* Navigation Bar & Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'text', label: '완성 교정본', icon: FileCheck2 },
              { id: 'diff', label: '문장별 Before & After', icon: Split, badge: result.lineByLineDiff?.length },
              { id: 'analysis', label: '강점 및 보완점', icon: BarChart3 },
              { id: 'keywords', label: '직무 추천 어휘', icon: Tag, badge: result.recommendedKeywords?.length },
              { id: 'interview', label: '면접 예상 질문', icon: MessageSquare, badge: result.interviewQuestions?.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Export & Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsOgCardOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="점수 카드 이미지 생성 및 공유"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>📸 점수 카드</span>
            </button>

            <button
              onClick={handleKakaoReportShare}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
              title="카카오톡으로 첨삭 결과 리포트 공유"
            >
              <svg className="w-3.5 h-3.5 fill-[#191919]" viewBox="0 0 24 24">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>카톡 공유</span>
            </button>

            <button
              onClick={handleCopyAll}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
              title="교정본 + 면접 질문 + 피드백 전체 한 번에 복사"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>전체 리포트 복사</span>
            </button>

            <button
              onClick={() => handleCopy(result.correctedText)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 text-xs font-medium transition cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>교정본만 복사</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium transition cursor-pointer"
              title="텍스트 파일로 저장"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">다운로드</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium transition cursor-pointer"
              title="인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">인쇄/PDF</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: Complete Text */}
        {activeTab === 'text' && (
          <div className="space-y-4 animate-fade-in">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">보기 모드:</span>
                <button
                  onClick={() => setViewMode('corrected')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === 'corrected'
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-100'
                  }`}
                >
                  교정본만
                </button>
                <button
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === 'sideBySide'
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-100'
                  }`}
                >
                  원문 vs 교정본 나란히 보기
                </button>
              </div>

              {/* Character Diff Stat */}
              {result.summaryComparison && (
                <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-400">
                  <span>
                    원문: {result.summaryComparison.beforeCharCount}자
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-indigo-600 font-bold">
                    교정본: {result.summaryComparison.afterCharCount}자
                  </span>
                </div>
              )}
            </div>

            {/* Display Body */}
            {viewMode === 'corrected' ? (
              <div className="relative">
                <div className={`bg-gray-50 border border-gray-100 rounded-xl p-6 sm:p-8 text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4 relative group ${!isPro ? 'select-none' : ''}`}>
                  {!isPro ? (
                    <>
                      <span>{result.correctedText.slice(0, 180)}</span>
                      <span className="filter blur-md opacity-40 block mt-2">{result.correctedText.slice(180)}</span>
                    </>
                  ) : (
                    result.correctedText
                  )}
                </div>

                {!isPro && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent rounded-xl flex flex-col items-center justify-end pb-8 p-4 text-center">
                    <div className="max-w-md bg-white border-2 border-indigo-600 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Dethan Pro 전용 완성본</span>
                      </div>
                      <h4 className="font-extrabold text-base text-gray-900 leading-snug">
                        나머지 완성형 자기소개서 전체를 즉시 확인하세요!
                      </h4>
                      <p className="text-xs text-gray-600">
                        스타벅스 커피 한 잔보다 저렴한 <strong className="text-indigo-600">3,900원</strong>으로 7일 동안 무제한 팩폭 첨삭 & 전체 완성본을 열람하세요.
                      </p>
                      <button
                        onClick={onOpenPayment}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>3,900원에 전체 자소서 & 면접 질문 잠금 해제 &gt;</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-5 text-xs sm:text-sm text-gray-700 space-y-2">
                  <div className="text-xs font-bold text-rose-500 border-b border-rose-100 pb-2 mb-3">
                    [원문 내용]
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed opacity-95">
                    {request.content}
                  </div>
                </div>

                {/* Corrected */}
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-5 text-xs sm:text-sm text-gray-900 space-y-2 relative">
                  <div className="text-xs font-bold text-emerald-600 border-b border-emerald-100 pb-2 mb-3">
                    [AI 첨삭 교정본]
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed ${!isPro ? 'select-none' : ''}`}>
                    {!isPro ? (
                      <>
                        <span>{result.correctedText.slice(0, 180)}</span>
                        <span className="filter blur-md opacity-40 block mt-2">{result.correctedText.slice(180)}</span>
                      </>
                    ) : (
                      result.correctedText
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: Line-by-Line Diff */}
        {activeTab === 'diff' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-gray-500">
              원문의 표현 중 직무 적합성과 가독성을 위해 개선된 핵심 문장 비교입니다.
            </p>

            <div className="space-y-4">
              {result.lineByLineDiff?.map((diff, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-indigo-600">포인트 #{idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs sm:text-sm space-y-1">
                      <div className="text-[11px] font-bold text-rose-500">Before (원문)</div>
                      <p className="leading-relaxed">&quot;{diff.original}&quot;</p>
                    </div>

                    {/* After */}
                    <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-850 text-xs sm:text-sm space-y-1">
                      <div className="text-[11px] font-bold text-emerald-600">After (교정)</div>
                      <p className="leading-relaxed">&quot;{diff.corrected}&quot;</p>
                    </div>
                  </div>

                  {/* Reason explanation */}
                  <div className="p-3 rounded-lg bg-white text-xs text-gray-600 border border-gray-200 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-600">개선 이유:</strong> {diff.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: Strengths & Weaknesses Analysis */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Strengths */}
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 flex items-center space-x-2 border-b border-emerald-100 pb-3">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>잘된 점 & 주요 강점</span>
              </h3>
              <ul className="space-y-2.5">
                {result.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Improvements */}
            <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-rose-500 flex items-center space-x-2 border-b border-rose-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>보완할 점 & 보완 방향</span>
              </h3>
              <ul className="space-y-2.5">
                {result.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-450 shrink-0 mt-2" />
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: Recommended Keywords */}
        {activeTab === 'keywords' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-gray-500">
              [{request.jobTitle}] 직무 평가관의 눈길을 끄는 비즈니스 핵심 추천 키워드입니다. (클릭 시 복사)
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {result.recommendedKeywords?.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopy(kw, `kw-${idx}`)}
                  className="group relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-350 text-xs font-semibold transition cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span>{kw}</span>
                  {copiedKey === `kw-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Consultant Key Feedback Checklist */}
        <div className="mt-8 pt-6 border-t border-gray-150 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>수석 컨설턴트의 핵심 총평 & 피드백</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.feedbacks?.map((fb, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed space-y-1.5"
              >
                <div className="text-[11px] font-bold text-indigo-600">Point 0{idx + 1}</div>
                <p>{fb}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TAB CONTENT 5: 면접 예상 질문 & 사이다 모범 답안 (전용 탭) */}
        {activeTab === 'interview' && (
          <div className="space-y-5 animate-fade-in">
            {/* 면접 탭 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white shadow-lg border border-indigo-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <MessageSquare className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                      실전 대비 🔥
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      면접 예상 질문 & 사이다 모범 답안
                    </h3>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    이 자소서를 본 대기업 면접관이 실제 던질 법한 날카로운 꼬리 질문과 합격 모범 답안입니다.
                  </p>
                </div>
              </div>

              {/* 면접 질문 전체 복사 버튼 */}
              {isPro && result.interviewQuestions && result.interviewQuestions.length > 0 && (
                <button
                  onClick={() => {
                    const allQA = (result.interviewQuestions || []).map((iq, i) =>
                      `Q${i + 1}. ${iq.question}\n- 면접관 의도: ${iq.interviewerIntent}\n- 사이다 모범 답안: ${iq.modelAnswer}\n- 꿀팁: ${iq.keyTip}`
                    ).join('\n\n');
                    navigator.clipboard.writeText(allQA);
                    alert('✨ 면접 예상 질문 & 모범 답안 전체가 클립보드에 복사되었습니다!');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 border border-white/20"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>전체 복사</span>
                </button>
              )}
            </div>

            {/* 면접 질문 카드 목록 */}
            {result.interviewQuestions && result.interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {result.interviewQuestions.map((iq, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/5 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-indigo-300 transition"
                  >
                    {/* Q Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span className="px-2.5 py-1 bg-rose-500 text-white font-extrabold text-xs rounded-lg shrink-0 mt-0.5">
                          질문 0{idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                          &quot;{iq.question}&quot;
                        </h4>
                      </div>

                      <button
                        onClick={() => handleCopy(iq.modelAnswer, `iq-${idx}`)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold shrink-0 transition flex items-center space-x-1 cursor-pointer"
                        title="모범 답안 복사"
                      >
                        {copiedKey === `iq-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">답안 복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>답안 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Interviewer Intent & Model Answer */}
                    {!isPro && idx > 0 ? (
                      <div className="relative rounded-xl overflow-hidden p-4 bg-gray-50 border border-indigo-100 text-center space-y-3">
                        <div className="filter blur-sm opacity-40 select-none space-y-2 pointer-events-none">
                          <div className="p-3 bg-amber-500/10 rounded-xl text-xs text-amber-900">
                            <strong>😈 면접관 속마음 / 질문 의도:</strong> 이 지원자의 실제 문제 해결 역량과 수치 근거를 날카롭게 검증하려는 의도입니다.
                          </div>
                          <div className="p-4 bg-indigo-50/60 rounded-xl text-xs text-gray-800">
                            💡 사이다 모범 답안: 데이터 수치와 구체적 성과를 두괄식으로 답변합니다.
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 mb-1">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Dethan Pro 전용 면접관 의도 & 사이다 모범 답안</span>
                          </div>
                          <button
                            onClick={onOpenPayment}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>3,900원에 실전 면접 족보 잠금 해제 &gt;</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Interviewer Intent */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-amber-900">😈 면접관 속마음 / 질문 의도:</strong>{' '}
                            {iq.interviewerIntent}
                          </div>
                        </div>

                        {/* Model Answer */}
                        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-center justify-between text-indigo-700 font-bold text-xs">
                            <span>💡 사이다 모범 답안</span>
                            <span className="text-[10px] text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded">합격 가이드</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                            &quot;{iq.modelAnswer}&quot;
                          </p>
                        </div>

                        {/* Key Tip */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500 pt-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span><strong className="text-gray-700">면접 꿀팁:</strong> {iq.keyTip}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                면접 예상 질문이 아직 생성되지 않았습니다.
              </div>
            )}

            {/* 🎯 면접 준비 핵심 체크리스트 */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-4">
              <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">✓</span>
                면접 준비 핵심 체크리스트
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { emoji: '🎯', title: '두괄식 답변 구조', desc: '결론 → 근거 → 사례 순서로 30초 이내에 핵심을 전달하세요.' },
                  { emoji: '📊', title: '수치화된 성과 제시', desc: '"20% 개선", "3건 수주" 등 구체적 숫자로 신뢰도를 높이세요.' },
                  { emoji: '💬', title: '역질문 준비', desc: '"제가 합류한다면 어떤 프로젝트부터 맡게 될까요?" 등 적극적인 관심을 보여주세요.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="text-xs font-bold text-gray-900">{item.title}</div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky-like Sign-up Card for Guests */}
      {!user && onOpenAuth && (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-6 text-center text-white shadow-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
            <span>🎁 신규 유저 웰컴 혜택</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
            방금 첨삭받은 자소서, 사라지기 전에 저장해두세요!
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-lg mx-auto">
            1초 만에 카카오로 시작하면 이 첨삭 결과가 계정에 안전하게 보관되고, 매일 3회 무료 첨삭이 계속 제공됩니다.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-black text-sm inline-flex items-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-yellow-500/20 border border-yellow-400"
            >
              <svg className="w-5 h-5 fill-[#191919] shrink-0" viewBox="0 0 24 24">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>💛 1초 카카오 간편 가입하고 계속 이용하기</span>
            </button>
          </div>
        </div>
      )}
      {/* OG Card Generator Modal */}
      <OgCardGenerator
        isOpen={isOgCardOpen}
        onClose={() => setIsOgCardOpen(false)}
        overallScore={result.overallScore}
        headline={result.headline}
        jobTitle={request.jobTitle}
        companyName={request.companyName}
        scoreBreakdown={result.scoreBreakdown}
      />
    </div>
  );
};

function BriefcaseColor(props: any) {
  return <Tag {...props} />;
}
