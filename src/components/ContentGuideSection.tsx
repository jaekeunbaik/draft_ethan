import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Tag,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Stethoscope,
  Megaphone,
  ShoppingCart,
  GraduationCap,
  Factory,
} from 'lucide-react';

// ────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────

const WRITING_TIPS = [
  {
    num: '01',
    title: '수치로 말하라',
    desc: '"열심히 했습니다" 대신 "매출 15% 향상", "프로젝트 3건 완수" 같은 구체적 수치가 설득력을 기하급수적으로 높입니다.',
  },
  {
    num: '02',
    title: '직무 키워드를 제목부터 삽입하라',
    desc: '채용 담당자는 JD(직무기술서) 키워드와 자소서를 매칭합니다. 포지션명·기술 스택·업무 용어를 본문 첫 문단에 배치하세요.',
  },
  {
    num: '03',
    title: 'STAR 구조를 활용하라',
    desc: '상황(Situation) → 과제(Task) → 행동(Action) → 결과(Result) 순으로 서술하면 면접관이 쉽게 따라오는 논리적 구조가 완성됩니다.',
  },
  {
    num: '04',
    title: '첫 문장에 임팩트를 넣어라',
    desc: '"저는 어릴 때부터..."로 시작하면 서류 광탈입니다. 핵심 성과·역할·수치로 시작해 3초 내에 읽을 가치를 증명하세요.',
  },
  {
    num: '05',
    title: '성실·열정·책임감 단어를 피하라',
    desc: '이 세 단어는 100명 중 99명이 씁니다. 구체적인 사례 자체가 성실함을 보여줍니다. 단어 대신 증거를 제시하세요.',
  },
  {
    num: '06',
    title: '글자 수를 정확히 맞춰라',
    desc: '기업별 글자수 제한을 무시하면 성의 없다는 인상을 줍니다. 제한의 90~100% 범위로 정밀하게 맞추세요.',
  },
  {
    num: '07',
    title: '퇴고를 최소 3회 하라',
    desc: 'AI 첨삭 후에도 자신만의 언어로 재가공해야 진정성이 살아납니다. 소리 내어 읽으면 어색한 문장이 바로 잡힙니다.',
  },
];

const BAD_PATTERNS = [
  {
    icon: '📋',
    title: '템플릿 복붙형',
    desc: 'ChatGPT나 온라인 예시를 그대로 붙여넣은 자소서는 즉시 탈락 대상입니다. AI 첨삭 결과물도 반드시 자신의 언어로 재가공하세요.',
  },
  {
    icon: '🏢',
    title: '회사 소개 재탕형',
    desc: '"귀사는 글로벌 리더십을 보유한..."처럼 회사 홈페이지를 그대로 옮긴 문장은 오히려 역효과. 내가 그 회사에 어떤 기여를 할 수 있는지로 전환하세요.',
  },
  {
    icon: '💬',
    title: '의지·다짐 위주형',
    desc: '"최선을 다하겠습니다", "열심히 배우겠습니다"만 반복하면 신뢰가 없습니다. 과거 경험으로 미래 기여도를 증명하세요.',
  },
  {
    icon: '🎭',
    title: '과장·거짓 경험형',
    desc: '실제로 하지 않은 역할을 부풀리면 면접 꼬리 질문에서 바로 탄로납니다. 소박한 경험도 STAR 구조로 포장하면 강점이 됩니다.',
  },
  {
    icon: '📜',
    title: '두서없는 나열형',
    desc: '경험을 시간순으로 늘어놓기만 하면 직무 연관성을 파악하기 어렵습니다. 지원 직무에 가장 임팩트 있는 경험부터 역순으로 배치하세요.',
  },
];

const JOB_KEYWORDS = [
  {
    icon: Briefcase,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    job: '💻 개발자 (SW·IT)',
    keywords: ['코드 리뷰', 'CI/CD', '트러블슈팅', '시스템 설계', 'API 성능 최적화', '애자일', 'DevOps', 'MSA', '기술 부채 관리'],
  },
  {
    icon: Megaphone,
    color: 'text-pink-600 bg-pink-50 border-pink-100',
    job: '📣 마케터',
    keywords: ['CTR', 'ROAS', '퍼포먼스 마케팅', 'CRM', '바이럴 전략', '콘텐츠 기획', 'A/B 테스트', 'KPI 달성', '그로스해킹'],
  },
  {
    icon: ShoppingCart,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    job: '💼 영업직',
    keywords: ['고객 니즈 파악', '제안서 작성', '목표 달성률', '신규 거래처 개척', '관계 관리', '매출 기여도', '협상 전략', '리텐션'],
  },
  {
    icon: Stethoscope,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    job: '🏥 간호사·의료직',
    keywords: ['환자 중심 케어', '임상 경험', '응급 대처', '팀 커뮤니케이션', 'EMR 활용', '감염 관리', '교육 이수', '위기 대응'],
  },
  {
    icon: GraduationCap,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    job: '🎓 교육·강사',
    keywords: ['커리큘럼 설계', '학습 성취도 향상', '맞춤 지도', '학부모 소통', '에듀테크 활용', '수업 개선', '진로 상담'],
  },
  {
    icon: Factory,
    color: 'text-slate-600 bg-slate-50 border-slate-100',
    job: '🏭 생산·제조',
    keywords: ['품질 관리', '불량률 개선', '공정 최적화', '5S 활동', '안전 준수', '생산 목표 달성', 'ISO 인증', 'OEE 향상'],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Dethan AI 첨삭은 어떻게 작동하나요?',
    a: '지원 직무, 기업명, 자소서 문항과 내용을 입력하면 GPT-4o 기반 AI가 직무 적합성·가독성·논리성·구체성 4개 영역을 분석해 100점 기준 점수와 함께 완성된 교정본, Before/After 비교표, 직무 추천 키워드, 면접 꼬리 질문 및 모범 답안까지 제공합니다.',
  },
  {
    q: '무료로 몇 번 사용할 수 있나요?',
    a: '카카오 로그인 후 매일 3회까지 무료로 AI 첨삭을 받을 수 있습니다. 무제한 이용을 원하시면 PRO 플랜(3,900원)으로 전환하시면 됩니다. 매일 오전 6시 KST에 무료 횟수가 리셋됩니다.',
  },
  {
    q: '제출한 자기소개서 내용은 안전하게 보관되나요?',
    a: '입력하신 자기소개서는 AI 첨삭 처리 목적으로만 일시 사용되며, 분석 완료 후 서버에 별도 보관되지 않습니다. 로그인 사용자의 첨삭 결과물만 암호화된 개인 계정에 저장되며 타인에게 절대 공유되지 않습니다.',
  },
  {
    q: '어떤 직무에 대응 가능한가요?',
    a: '개발자, 마케터, 영업직, 간호사, 교사, 공무원, 금융직, 디자이너, 콘텐츠 크리에이터 등 거의 모든 직무에 대응합니다. 직무명을 정확히 입력할수록 더 정밀한 키워드 매핑과 첨삭 결과를 받을 수 있습니다.',
  },
  {
    q: 'AI가 작성한 자소서를 그대로 제출해도 되나요?',
    a: 'AI 첨삭 결과를 그대로 제출하는 것은 권장하지 않습니다. AI 결과물은 방향과 구조 개선을 위한 참고 가이드로 활용하시고, 반드시 자신의 실제 경험과 언어로 재구성하셔야 진정성 있는 합격 자소서가 완성됩니다.',
  },
];

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

export const ContentGuideSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section
      id="guide-content"
      aria-label="자소서 작성 가이드 및 콘텐츠"
      className="space-y-16 py-12 border-t border-gray-100"
    >
      {/* ── Section Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dethan 자소서 합격 가이드</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          합격 자소서의 모든 것
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
          Dethan AI가 수만 건의 자소서를 분석해 도출한 합격 공식과 실패 패턴을 공개합니다.
        </p>
      </div>

      {/* ── 7가지 핵심 원칙 ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          자소서 잘 쓰는 법 — 7가지 핵심 원칙
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WRITING_TIPS.map((tip) => (
            <article
              key={tip.num}
              className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm hover:shadow-md hover:border-indigo-200 transition group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {tip.num}
                </span>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition">
                  {tip.title}
                </h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </article>
          ))}
        </div>
      </div>

      {/* ── 채용 담당자가 싫어하는 5가지 패턴 ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          채용 담당자가 가장 싫어하는 자소서 패턴 5가지
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BAD_PATTERNS.map((item) => (
            <article
              key={item.title}
              className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 space-y-2 hover:border-rose-200 transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <h4 className="text-sm font-bold text-rose-700">{item.title}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>

      {/* ── 직무별 핵심 키워드 ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-500" />
          직무별 자소서 핵심 키워드 모음
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_KEYWORDS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.job}
                className={`border rounded-2xl p-5 space-y-3 ${item.color}`}
              >
                <h4 className="text-sm font-bold">{item.job}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] font-medium bg-white/70 border border-current/20 rounded-lg px-2 py-0.5 opacity-90"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 text-center">
          Dethan AI는 입력하신 직무명에 맞게 위 키워드를 자동으로 자소서 안에 녹여드립니다.
        </p>
      </div>

      {/* ── FAQ ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          자주 묻는 질문 (FAQ)
        </h3>
        <dl className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <dt>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition cursor-pointer"
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
              </dt>
              {openFaq === idx && (
                <dd className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {item.a}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
