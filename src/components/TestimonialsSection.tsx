import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  emoji: string;
  name: string;
  role: string;
  company: string;
  score: number;
  quote: string;
  resultTag: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    emoji: '🎉',
    name: '김O준',
    role: '백엔드 개발자',
    company: '카카오',
    score: 94,
    quote: '자소서에 자신이 없었는데, 디든이 부족한 부분을 정확히 짚어줘서 문장을 다시 정리할 수 있었어요. 면접 때도 자소서 질문에 막힘 없이 답변할 수 있었습니다.',
    resultTag: '서류 통과 → 최종 합격',
  },
  {
    id: 2,
    emoji: '✨',
    name: '이O현',
    role: '마케팅 AE',
    company: '대형 광고대행사',
    score: 91,
    quote: '"성실합니다" 같은 뻔한 표현을 전부 구체적인 성과 수치로 바꿔줘서, 채용 담당자에게 임팩트를 줄 수 있었어요.',
    resultTag: '서류 합격 (5개 기업 중 4곳)',
  },
  {
    id: 3,
    emoji: '💼',
    name: '박O서',
    role: '해외영업',
    company: '중견 제조기업',
    score: 88,
    quote: '영업 직무에서 강조해야 할 포인트를 몰랐는데, 직무별 맞춤 키워드와 STAR 구조로 완전히 리빌딩해 줬습니다.',
    resultTag: '경력직 서류 전형 통과',
  },
  {
    id: 4,
    emoji: '🏥',
    name: '최O은',
    role: '신규 간호사',
    company: '대학병원',
    score: 92,
    quote: '간호학과 특성상 임상 경험을 어떻게 풀어야 할지 막막했는데, 환자 중심 케어 경험을 깔끔하게 구조화해 줘서 정말 큰 도움이 됐어요.',
    resultTag: '신규 간호사 합격',
  },
  {
    id: 5,
    emoji: '🚀',
    name: '정O민',
    role: '서비스 기획',
    company: 'IT 스타트업',
    score: 95,
    quote: '기획 직무는 논리적 사고력을 어필해야 하는데, 디든이 기획 프로세스를 체계적으로 드러내 줘서 면접관한테 칭찬받았습니다.',
    resultTag: '최종 합격 & 입사 확정',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const current = testimonials[currentIndex];

  return (
    <section className="py-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
          ✅ 실제 이용 후기
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          디든으로 <span className="text-indigo-600">합격한</span> 생생한 후기
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Dethan AI 첨삭을 활용하여 서류 전형을 통과한 분들의 이야기입니다.
        </p>
      </div>

      {/* Testimonial Card */}
      <div
        className="max-w-2xl mx-auto"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            {/* Header: profile + score */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-md">
                  {current.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{current.name}</span>
                    <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                      {current.resultTag}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {current.role} · {current.company}
                  </span>
                </div>
              </div>

              {/* Score badge */}
              <div className="flex flex-col items-center bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 shrink-0">
                <span className="text-lg font-extrabold text-indigo-600">{current.score}</span>
                <span className="text-[9px] font-bold text-indigo-400 -mt-0.5">점 / 100</span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium relative pl-4 border-l-3 border-indigo-200">
              <span className="text-indigo-400 text-2xl font-serif absolute -left-0.5 -top-2">"</span>
              {current.quote}
            </blockquote>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlay(false);
              }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-2.5 bg-indigo-600'
                  : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`후기 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
