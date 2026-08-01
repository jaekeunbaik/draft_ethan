import React, { useState } from 'react';
import { CorrectionResponse, CorrectionRequest } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
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
} from 'lucide-react';

interface ResultSectionProps {
  result: CorrectionResponse;
  request: CorrectionRequest;
  onReEdit?: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  request,
  onReEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'diff' | 'analysis' | 'keywords'>('text');
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
          <div className="flex items-center space-x-2">
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
                  <span>교정본 복사</span>
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
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 sm:p-8 text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4 relative group">
                {result.correctedText}
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
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-5 text-xs sm:text-sm text-gray-900 space-y-2">
                  <div className="text-xs font-bold text-emerald-600 border-b border-emerald-100 pb-2 mb-3">
                    [AI 첨삭 교정본]
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {result.correctedText}
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
      </div>
    </div>
  );
};

function BriefcaseColor(props: any) {
  return <Tag {...props} />;
}
