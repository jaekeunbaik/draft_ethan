import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-gray-100 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-lg text-gray-900">이용약관 및 개인정보 처리방침</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {/* Section 1 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            제 1 조 (서비스 이용 및 데이터 저장 지침)
                        </h4>
                        <p className="text-gray-550">
                            Dethan (디든)은 사용자가 제출한 자기소개서 문장을 AI(Google Gemini) 분석 및 첨삭 목적으로만 일시 처리합니다. 제출된 본문은 사용자의 사전 동의 없이 외부에 공유되거나 무단으로 저장되지 않습니다.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-indigo-500" />
                            제 2 조 (개인정보 수집, 쿠키 및 제3자 광고)
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-550">
                            <li>수집 항목: 로그인 이메일, 프로필 정보, 이용 내역</li>
                            <li>수집 목적: 멤버십 서비스 제공, 이용 권한 확인, 맞춤형 서비스 개선</li>
                            <li>Google AdSense 관련: 본 사이트는 Google 및 제3자 광고 네트워크를 통해 맞춤형 광고를 제공할 수 있으며, 이전 방문 기록 기반 DART 쿠키가 사용될 수 있습니다. 이용자는 Google 광고 설정에서 수집을 거부할 수 있습니다.</li>
                            <li>보유 및 파기: 회원 탈퇴 또는 목적 달성 시 파기 처리됩니다.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            제 3 조 (AI 생성물 책임 제한 및 면책)
                        </h4>
                        <p className="text-gray-550">
                            본 서비스가 제공하는 자소서 첨삭 및 피드백은 합격을 보장하는 최종 채용 결과물이 아닌 서류 완성도 향상을 위한 참조용 AI 분석 컨설팅 결과입니다. 제출 전 사용자가 직접 내용을 최종 확인하여야 합니다.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-150">
                        <h4 className="font-bold text-gray-800 text-xs">
                            제 4 조 (환불 및 CS 문의)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                            PRO 이용권 결제 후 AI 첨삭 서비스를 이용하지 않은 경우 7일 이내에 인스타그램 DM 또는 고객센터를 통해 환불 요청이 가능합니다. 단, 서비스를 이미 이용한 건에 대해서는 환불이 제한될 수 있습니다.
                        </p>
                    </div>
                </div>

                {/* Footer */}
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
