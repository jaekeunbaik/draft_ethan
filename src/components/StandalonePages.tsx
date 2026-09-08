import React from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface StandaloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'about' | 'privacy' | 'terms' | 'contact';
}

export const StandaloneModal: React.FC<StandaloneModalProps> = ({ isOpen, onClose, pageType }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (pageType) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                Service Introduction
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dethan (디든) 소개</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                채용 담당자의 눈높이에서 탄생한 나만의 AI 자소서 아키텍트 솔루션
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  기획 배경 & 핵심 미션
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  매년 수십만 명의 취업 준비생과 이직자가 밤을 새워 자기소개서를 작성하지만, 채용 담당자가 3초 만에 서류를 스캔할 때 무엇을 보는지 몰라 아쉽게 탈락합니다. Dethan은 대기업 및 유니콘 스타트업 채용 실무진의 평가 프레임워크를 학습한 AI 엔진을 통해, 무의미한 미사여구를 걷어내고 정량적 수치와 직무 맞춤형 키워드를 탑재한 <strong>‘진짜 합격 자소서’</strong>로 교정해 드립니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    4대 핵심 지표 정량 평가
                  </h4>
                  <p className="text-xs text-gray-500">직무 적합성, 가독성, 논리성, 구체성 4개 영역 100점 기준 심층 진단</p>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    면접 연계 질문 자동 추출
                  </h4>
                  <p className="text-xs text-gray-500">서류 통과 후 실제 면접관이 던질 꼬리 질문과 모범 답변 가이드 선제 제공</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <div className="space-y-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                Privacy Policy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">개인정보처리방침</h2>
              <p className="text-xs text-gray-400">최종 개정일: 2026년 9월 1일</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80 max-h-[55vh] overflow-y-auto">
              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">1. 수집하는 개인정보 항목 및 수집 방법</h3>
                <p>
                  - 카카오 간편 로그인 시: 고유 식별자(ID), 이메일, 닉네임, 프로필 이미지<br />
                  - 자소서 첨삭 서비스 이용 시: 입력하신 희망 직무, 지원 기업명, 자소서 문항 및 작성 본문<br />
                  - 서비스 이용 과정에서 자동 생성 정보: 접속 IP, 쿠키(Cookie), 서비스 이용 기록, 기기 브라우저 정보
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">2. 개인정보의 이용 목적</h3>
                <p>
                  - AI 자소서 교정 및 맞춤형 피드백 생성<br />
                  - 회원 식별, 부정 이용 방지, 결제 처리 및 PRO 이용권 부여<br />
                  - 서비스 개선 및 통계 분석, 고객 문의 응대
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">3. 개인정보의 보유 및 파기</h3>
                <p>
                  원칙적으로 이용자의 개인정보는 이용 목적이 달성되면 지체 없이 파기합니다. 회원이 계정 탈퇴를 요청하는 경우 즉시 관련 정보를 영구 삭제 조치합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">4. Google AdSense 및 쿠키(Cookie) 관련 규정</h3>
                <p>
                  본 사이트는 광고 게재를 위해 Google AdSense를 이용하며, Google을 포함한 서드파티 공급업체는 사용자의 이전 방문 기록을 기반으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다. 사용자는 Google 광고 설정(adssettings.google.com)에서 맞춤 광고를 사용 중지할 수 있습니다.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">5. 개인정보 보호책임자 및 문의처</h3>
                <p>
                  - 책임자: Dethan 개인정보 보호팀<br />
                  - 문의 이메일: axsza@naver.com
                </p>
              </section>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <div className="space-y-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                Terms of Service
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">서비스 이용약관</h2>
              <p className="text-xs text-gray-400">최종 개정일: 2026년 9월 1일</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80 max-h-[55vh] overflow-y-auto">
              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">제1조 (목적)</h3>
                <p>본 약관은 Dethan (디든)이 제공하는 AI 자기소개서 첨삭 및 관련 제반 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">제2조 (서비스의 제공 및 변경)</h3>
                <p>
                  1. 회사는 이용자에게 일일 무료 AI 첨삭(3회) 및 PRO 유료 이용권을 제공합니다.<br />
                  2. 회사는 AI 기술의 발전에 따라 제공되는 서비스의 세부 알고리즘이나 기능을 개선 및 변경할 수 있습니다.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">제3조 (환불 규정 및 유료 이용권)</h3>
                <p>
                  1. 유료 이용권(PRO 패스) 결제 후 서비스를 단 1회도 이용하지 않은 경우 7일 이내 전액 환불을 요청할 수 있습니다.<br />
                  2. 이미 AI 첨삭 서비스를 1회 이상 이용한 경우에는 디지털 콘텐츠 특성상 환불이 제한될 수 있습니다.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-sm">제4조 (면책 조항)</h3>
                <p>
                  AI가 제공하는 첨삭 결과물은 서류 작성의 참고 자료이며, 회사는 이용자의 최종 채용 합격 여부에 대해 법적 책임을 지지 않습니다.
                </p>
              </section>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                Contact & Support
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">고객 지원 및 문의</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                서비스 이용 중 궁금한 점이나 결제/제휴 문의를 남겨주시면 신속하게 답변해 드립니다.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>공식 이메일 문의</span>
                </div>
                <p className="text-gray-600">
                  이메일: <a href="mailto:axsza@naver.com" className="font-semibold text-indigo-600 underline">axsza@naver.com</a><br />
                  운영 시간: 평일 09:00 ~ 18:00 (주말/공휴일 포함 24시간 이내 회신)
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="font-bold text-gray-900 text-sm">자주 묻는 질문 빠른 해결</div>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li><strong>입금 후 승인이 안 돼요</strong>: 입금자 성함을 동일하게 입력하셨는지 확인해 주시고, 10분 이상 지연 시 이메일로 입금 내역을 남겨주시면 즉시 수동 승인해 드립니다.</li>
                  <li><strong>무료 횟수는 언제 리셋되나요?</strong>: 매일 오전 6시(KST)에 3회 무료 이용량이 자동 충전됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl text-gray-900 overflow-hidden relative max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            {pageType === 'about' && <Info className="w-4 h-4 text-indigo-600" />}
            {pageType === 'privacy' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
            {pageType === 'terms' && <FileText className="w-4 h-4 text-indigo-600" />}
            {pageType === 'contact' && <Mail className="w-4 h-4 text-pink-600" />}
            <span className="text-sm font-bold text-gray-900 uppercase">{pageType}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-7">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
