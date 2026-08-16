import React, { useState, useRef } from 'react';
import { CorrectionRequest, SamplePreset } from '../types';
import { JOB_SUGGESTIONS, SAMPLE_PRESETS } from '../data/samples';
import {
  Sparkles,
  Briefcase,
  Building2,
  FileText,
  Upload,
  Trash2,
  Sliders,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Wand2,
} from 'lucide-react';

interface FormSectionProps {
  onSubmit: (request: CorrectionRequest) => void;
  isLoading: boolean;
  initialRequest?: CorrectionRequest | null;
  isPro?: boolean;
  remainingFreeUsage?: number;
  onOpenUpgrade?: () => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  onSubmit,
  isLoading,
  initialRequest,
  isPro = false,
  remainingFreeUsage = 3,
  onOpenUpgrade,
}) => {
  const [jobTitle, setJobTitle] = useState(initialRequest?.jobTitle || '');
  const [companyName, setCompanyName] = useState(initialRequest?.companyName || '');
  const [question, setQuestion] = useState(initialRequest?.question || '');
  const [content, setContent] = useState(initialRequest?.content || '');
  const [tone, setTone] = useState<CorrectionRequest['tone']>(
    initialRequest?.tone || (isPro ? 'professional' : 'logical')
  );
  const [focusPoints, setFocusPoints] = useState<string[]>(initialRequest?.focusPoints || ['metrics', 'job_skills']);
  const [targetCharCount, setTargetCharCount] = useState<number | null>(initialRequest?.targetCharCount || null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initialRequest prop changes dynamically
  React.useEffect(() => {
    if (initialRequest) {
      if (initialRequest.jobTitle) setJobTitle(initialRequest.jobTitle);
      if (initialRequest.companyName) setCompanyName(initialRequest.companyName);
      if (initialRequest.question) setQuestion(initialRequest.question);
      if (initialRequest.content) setContent(initialRequest.content);
    }
  }, [initialRequest]);

  // Quick Preset Handlers
  const handleSelectSample = (preset: SamplePreset) => {
    setJobTitle(preset.jobTitle);
    setCompanyName(preset.companyName);
    setQuestion(preset.question);
    setContent(preset.content);
  };

  const handleReset = () => {
    setJobTitle('');
    setCompanyName('');
    setQuestion('');
    setContent('');
    setTone(isPro ? 'professional' : 'logical');
    setFocusPoints(['metrics', 'job_skills']);
    setTargetCharCount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleFocusPoint = (point: string) => {
    if (focusPoints.includes(point)) {
      setFocusPoints(focusPoints.filter((p) => p !== point));
    } else {
      setFocusPoints([...focusPoints, point]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !jobTitle.trim()) return;

    onSubmit({
      question: question.trim(),
      content: content.trim(),
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim() || undefined,
      tone,
      focusPoints,
      targetCharCount: targetCharCount || undefined,
    });
  };

  // Character Counts
  const charWithSpaces = content.length;
  const charWithoutSpaces = content.replace(/\s/g, '').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div id="form-section" className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-7 shadow-sm text-gray-800">
      {/* Header bar inside form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
              🎁 무로그인 1회 즉시 무료 체험 가능
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            자소서 작성 및 AI 팩폭 첨삭
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            희망 직무와 자소서를 입력하시면 대기업 채용담당자 관점에서 3초 만에 팩폭 교정해 드립니다.
          </p>
        </div>

        {/* Preset Sample Loaders */}
        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/80">
          <div className="flex items-center gap-1 text-xs text-indigo-950 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>자소서가 없다면? 1초 샘플 채우기:</span>
          </div>
          <div className="inline-flex flex-wrap gap-1.5">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectSample(preset)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-white hover:bg-indigo-600 text-gray-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600 shadow-sm transition transform hover:scale-105 active:scale-95 font-bold cursor-pointer flex items-center gap-1"
              >
                <span>⚡</span>
                <span>{preset.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Job Title & Company Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                희망 직무 <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="예: 백엔드 개발자, 서비스 기획자, 마케터"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {/* Quick Suggestions Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {JOB_SUGGESTIONS.slice(0, 5).map((job) => (
                <button
                  key={job}
                  type="button"
                  onClick={() => setJobTitle(job)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition cursor-pointer ${
                    jobTitle === job
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  +{job}
                </button>
              ))}
            </div>
          </div>

          {/* Company Name / Industry (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" />
              지원의 기업 / 산업군 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="예: 네이버, 삼성전자, 금융권, IT 스타트업"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <p className="text-[11px] text-gray-400 mt-2">
              지원 기업을 지정하면 해당 기업 인재상과 비즈니스 언어에 맞춰 첨삭합니다.
            </p>
          </div>
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>자소서 질문 / 항목 <span className="text-gray-400 font-normal">(선택)</span></span>
            <div className="flex gap-1">
              {['지원 동기', '성장 과정', '직무 역량', '문제 해결 경험'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuestion(`${q} 및 입사 후 포부를 기술하시오.`)}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 지원 동기와 직무를 수행하기 위해 기울인 노력을 기술해주세요."
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Content Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              기존 자소서 내용 <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span>
                공백 포함 <strong className="text-indigo-600">{charWithSpaces.toLocaleString()}</strong>자
              </span>
              <span className="text-gray-300">|</span>
              <span>
                공백 제외 <strong className="text-gray-700">{charWithoutSpaces.toLocaleString()}</strong>자
              </span>
              <span className="text-gray-300">|</span>
              <span>
                단어 <strong className="text-gray-700">{wordCount.toLocaleString()}</strong>개
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="첨삭받고 싶은 자기소개서 내용을 여기에 직접 입력하거나 텍스트 파일을 업로드하세요..."
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed resize-y font-sans"
            />

            {/* Quick Actions Bar inside textarea bottom */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition cursor-pointer"
                title="텍스트 파일 업로드"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">파일 불러오기</span>
              </button>

              {content && (
                <button
                  type="button"
                  onClick={() => setContent('')}
                  className="inline-flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition cursor-pointer"
                  title="내용 비우기"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">지우기</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>첨삭 스타일 & 상세 옵션 설정</span>
            <ChevronDown
              className={`w-4 h-4 transform transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 animate-fade-in">
              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  교정 어조 / 톤앤매너
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'professional', label: '전문적·비즈니스 👑', desc: '비즈니스 표준 윤문 (PRO)' },
                    { id: 'confident', label: '당당·적극적 👑', desc: '주도성과 역량 리드 (PRO)' },
                    { id: 'logical', label: '논리·분석적', desc: '원인과 근거 명확히 정리' },
                    { id: 'modest', label: '겸손·진솔함', desc: '상생과 진솔한 톤매너' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (!isPro && (t.id === 'professional' || t.id === 'confident')) {
                          if (onOpenUpgrade) {
                            onOpenUpgrade();
                          } else {
                            alert('PRO 기능입니다. 상단 UPGRADE 버튼을 눌러 결제 후 이용 가능합니다.');
                          }
                          return;
                        }
                        setTone(t.id as CorrectionRequest['tone']);
                      }}
                      className={`p-2.5 rounded-lg text-left transition border text-xs cursor-pointer ${
                        tone === t.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-semibold ${tone === t.id ? 'text-indigo-900' : 'text-gray-700'}`}>{t.label}</div>
                      <div className={`text-[10px] mt-0.5 ${tone === t.id ? 'text-indigo-600' : 'text-gray-400'}`}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Points Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  중점 강조 포인트 <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'metrics', label: '수치 및 성과 강조' },
                    { id: 'job_skills', label: '직무 역량 & 도구' },
                    { id: 'teamwork', label: '협업 & 소통 능력' },
                    { id: 'problem_solving', label: '논리적 문제해결' },
                  ].map((fp) => {
                    const isChecked = focusPoints.includes(fp.id);
                    return (
                      <button
                        key={fp.id}
                        type="button"
                        onClick={() => toggleFocusPoint(fp.id)}
                        className={`p-2 rounded-lg text-xs flex items-center space-x-2 transition border cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isChecked ? 'text-indigo-600' : 'text-gray-400'
                          }`}
                        />
                        <span>{fp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Length Slider */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  목표 글자수 맞춤
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: null, label: '제한 없음 (원문 길이 유지)' },
                    { value: 500, label: '500자 이내' },
                    { value: 800, label: '800자 이내' },
                    { value: 1000, label: '1,000자 이내' },
                    { value: 1500, label: '1,500자 이내' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setTargetCharCount(item.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        targetCharCount === item.value
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-600 transition px-3 py-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>

            {/* Remaining free usage indicator */}
            {isPro ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span>👑</span> PRO 무제한 첨삭 이용 중
              </span>
            ) : (
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                오늘 무료 첨삭: <strong className="font-extrabold text-indigo-600">{remainingFreeUsage}/3회</strong> 남음
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !content.trim() || !jobTitle.trim()}
            className={`relative inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-sm transition-all duration-300 cursor-pointer ${
              isLoading || !content.trim() || !jobTitle.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI 첨삭 컨설팅 진행 중...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-indigo-200" />
                <span>Gemini AI 자소서 첨삭 받기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
