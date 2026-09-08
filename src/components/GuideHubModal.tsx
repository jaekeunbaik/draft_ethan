import React, { useState } from 'react';
import { X, BookOpen, ArrowLeft, Clock, Tag, Share2, Sparkles, ChevronRight, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guidesData';

interface GuideHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string | null;
  onSelectJobForCorrection?: (jobTitle: string) => void;
}

export const GuideHubModal: React.FC<GuideHubModalProps> = ({
  isOpen,
  onClose,
  initialSlug,
  onSelectJobForCorrection,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync initialSlug when prop changes
  React.useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  if (!isOpen) return null;

  const currentArticle = GUIDE_ARTICLES.find((a) => a.slug === selectedSlug);

  const categories = ['전체', '직무별 공략', '작성 비법', '합격 분석'];

  const filteredArticles = GUIDE_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === '전체' || article.category === selectedCategory;
    const matchesQuery =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/guide/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl text-gray-900 overflow-hidden relative max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            {selectedSlug ? (
              <button
                onClick={() => setSelectedSlug(null)}
                className="p-1.5 -ml-1 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200 cursor-pointer flex items-center gap-1 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Dethan 자소서 합격 백과</h2>
                  <p className="text-xs text-gray-500">채용 담당자 관점의 직무별 합격 공식 및 작성 바이블</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {currentArticle ? (
            /* ── Article Detail View ── */
            <article className="space-y-8 max-w-3xl mx-auto">
              <div className="space-y-4 pb-6 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-md border border-indigo-100">
                    {currentArticle.category}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> {currentArticle.readTime} 읽기
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{currentArticle.publishDate}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                  {currentArticle.title}
                </h1>

                <p className="text-sm text-gray-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {currentArticle.content.overview}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {currentArticle.tags.map((tag) => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopyLink(currentArticle.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedUrl ? '링크 복사됨!' : '공유하기'}</span>
                  </button>
                </div>
              </div>

              {/* 3대 핵심 포인트 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  핵심 합격 체크포인트
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {currentArticle.content.keyPoints.map((kp, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/40 border border-indigo-100/70 rounded-xl space-y-1">
                      <div className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {kp.title}
                      </div>
                      <p className="text-xs text-gray-600 pl-7 leading-relaxed">{kp.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before & After 비교 분석 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  실전 Before & After 비교 교정
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded">
                      ❌ 흔한 탈락 자소서 (Before)
                    </span>
                    <p className="text-xs text-rose-900 font-mono leading-relaxed bg-white/80 p-2.5 rounded-lg border border-rose-100">
                      "{currentArticle.content.beforeAfter.before}"
                    </p>
                    <p className="text-[11px] text-rose-700 leading-normal pt-1">
                      ⚠️ <strong>탈락 이유:</strong> {currentArticle.content.beforeAfter.reason}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      ✅ 합격자 수준 교정본 (After)
                    </span>
                    <p className="text-xs text-emerald-950 font-mono leading-relaxed bg-white/80 p-2.5 rounded-lg border border-emerald-100 whitespace-pre-line">
                      "{currentArticle.content.beforeAfter.after}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 상세 심층 가이드 섹션 */}
              <div className="space-y-4">
                {currentArticle.content.detailedSections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="text-sm font-bold text-gray-900">{sec.heading}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed bg-white border border-gray-100 p-3.5 rounded-xl shadow-xs">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* 채용팀 실무 팁 & CTA */}
              <div className="p-5 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Dethan AI 채용 아키텍트 추천</span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  작성하신 초안을 Dethan AI 첨삭기에 넣으시면, 위 합격 원칙과 실무 키워드를 바탕으로 즉시 100점 기준 점수와 팩폭 교정본을 제공합니다.
                </p>
                {currentArticle.targetJob && onSelectJobForCorrection && (
                  <button
                    onClick={() => {
                      onSelectJobForCorrection(currentArticle.targetJob!);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <span>'{currentArticle.targetJob}' 직무로 AI 자소서 첨삭 시작</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </article>
          ) : (
            /* ── Article List Hub View ── */
            <div className="space-y-6">
              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="직무명, 키워드(예: STAR, 백엔드, 면접, 소제목)를 검색하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Articles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.slug}
                    onClick={() => setSelectedSlug(article.slug)}
                    className="bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                          {article.category}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
                      <span>가이드 전문 읽기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-sm">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
