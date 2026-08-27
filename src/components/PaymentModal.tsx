import React, { useState, useEffect } from 'react';
import { X, Check, Copy, CheckCircle2, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyPaymentSuccess } from '../utils/discordNotifier';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

type ProductType = '24hours' | '7days' | '30days';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, user }) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('24hours');
  const [copied, setCopied] = useState(false);
  const [depositorName, setDepositorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const getAmount = (type: ProductType) => {
    switch (type) {
      case '24hours':
        return 1200;
      case '7days':
        return 3900;
      case '30days':
        return 9900;
    }
  };

  const getProductName = (type: ProductType) => {
    switch (type) {
      case '24hours':
        return 'Dethan Pro 24시간 벼락치기 패스';
      case '7days':
        return 'Dethan Pro 7일 무제한 패스';
      case '30days':
        return 'Dethan Pro 30일 무제한 올패스';
    }
  };

  // 1. Log payment modal open intent (reuse existing 'opened' intent if present)
  useEffect(() => {
    if (!isOpen || !user) {
      // Clear local states on close
      if (!isOpen) {
        setDepositorName('');
        setCurrentRequestId(null);
      }
      return;
    }

    const logOpenIntent = async () => {
      try {
        // First check if an 'opened' request already exists for this user
        const { data: existing, error: queryError } = await supabase
          .from('payment_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'opened')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (queryError) {
          console.warn('Query existing open request warning:', queryError.message);
        }

        if (existing) {
          // Reuse existing 'opened' record and update product/amount/time
          setCurrentRequestId(existing.id);
          await supabase
            .from('payment_requests')
            .update({
              amount: getAmount(selectedProduct),
              product: getProductName(selectedProduct),
              created_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Insert a new 'opened' record if none exists
          const { data, error } = await supabase
            .from('payment_requests')
            .insert([{
              user_id: user.id,
              email: user.email || `${user.id}@kakao.user`,
              amount: getAmount(selectedProduct),
              product: getProductName(selectedProduct),
              status: 'opened'
            }])
            .select('id')
            .single();

          if (error) {
            console.warn('payment_requests table log warning - Check if table exists:', error.message);
          } else if (data) {
            setCurrentRequestId(data.id);
          }
        }
      } catch (err) {
        console.warn('Silent log error:', err);
      }
    };

    logOpenIntent();
  }, [isOpen, user]);

  // 2. Log product selection changes
  const handleProductSelect = async (product: ProductType) => {
    setSelectedProduct(product);
    if (!currentRequestId) return;

    try {
      await supabase
        .from('payment_requests')
        .update({
          amount: getAmount(product),
          product: getProductName(product)
        })
        .eq('id', currentRequestId);
    } catch (err) {
      console.warn('Failed to update product selection intent:', err);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('79420388490');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Toss Deep Link 1-Second Transfer (Mobile) or Quick Copy (PC)
  const handleTossTransfer = () => {
    const amount = getAmount(selectedProduct);
    const tossUrl = `supertoss://send?bank=${encodeURIComponent('카카오뱅크')}&accountNo=79420388490&amount=${amount}`;
    
    // 자동 계좌번호 복사도 동시 수행
    navigator.clipboard.writeText('79420388490');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (isMobile) {
      // 모바일 환경에서 토스 앱 딥링크 호출
      window.location.href = tossUrl;
    } else {
      // PC 환경에서는 친절한 계좌 복사 안내 팝업
      alert(`📋 카카오뱅크 7942-03-88490 (예금주: 백재근) 계좌번호가 복사되었습니다!\n\n스마트폰 은행 앱이나 인터넷 뱅킹에서 ${amount.toLocaleString()}원을 송금해 주세요.`);
    }
  };

  const handleConfirmPaymentRequest = async () => {
    if (!depositorName.trim()) {
      alert('입금자 성함을 입력해 주세요! 입금 확인을 위해 꼭 필요합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (currentRequestId) {
        const { error } = await supabase
          .from('payment_requests')
          .update({
            depositor_name: depositorName.trim(),
            status: 'pending',
            amount: getAmount(selectedProduct),
            product: getProductName(selectedProduct)
          })
          .eq('id', currentRequestId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_requests')
          .insert([{
            user_id: user.id,
            email: user.email || `${user.id}@kakao.user`,
            depositor_name: depositorName.trim(),
            amount: getAmount(selectedProduct),
            product: getProductName(selectedProduct),
            status: 'pending'
          }]);

        if (error) throw error;
      }

      // Try saving depositor_name to profiles table if column exists
      try {
        await supabase
          .from('profiles')
          .update({ depositor_name: depositorName.trim() })
          .eq('id', user.id);
      } catch (pErr) {
        console.warn('Skipped profiles.depositor_name update:', pErr);
      }

      // 3. Send real-time notification to Discord Webhook
      try {
        const userInfo = `${user?.email || `${user?.id || 'unknown'}@kakao.user`} (입금자명: ${depositorName.trim()})`;
        await notifyPaymentSuccess(getAmount(selectedProduct), userInfo);
      } catch (notifyErr) {
        console.warn('Failed to send Discord notification:', notifyErr);
      }

      // Store pending deposit flag in localStorage for welcome alert on next return
      try {
        localStorage.setItem(`dethan_deposit_pending_${user.id}`, 'true');
      } catch (e) {}

      alert('👍 입금 확인 요청이 접수되었습니다!\n대표님이 입금 확인 즉시 등급을 활성화해 드립니다.');
      onClose();
    } catch (err: any) {
      console.error('Failed to submit deposit request:', err);
      alert('입금 완료 요청 실패:\n데이터베이스에 [payment_requests] 테이블이 생성되어야 관리자가 확인할 수 있습니다.\n\n안내된 테이블 생성 SQL 쿼리를 어드민 가이드를 확인하여 Supabase SQL Editor에 실행해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl text-gray-800 overflow-hidden relative max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 p-6 text-white shrink-0">
          <div className="inline-flex px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold tracking-wider uppercase mb-2">
            Premium Pass
          </div>
          <h3 className="font-extrabold tracking-tight text-xl">
            Dethan <span className="text-amber-400">Pro</span> 이용권 선택
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            부담 없는 가격으로 원클릭 무제한 자소서 첨삭 기능을 완전히 잠금해제 하세요.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-indigo-100">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>무제한 첨삭 요청</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>고급 비즈니스 어체 활성화</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>첨삭 기록 전용 보관함</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>추천 직무 키워드 확장</span>
            </div>
          </div>
        </div>

        {/* Payment Form & Product Selector */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Product Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">요금제 선택</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Option 1: 24-hour Pass */}
              <div
                onClick={() => handleProductSelect('24hours')}
                className={`border-2 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between relative ${
                  selectedProduct === '24hours'
                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-extrabold text-indigo-900">24시간 패스</span>
                  </div>
                  <span className="inline-block text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded leading-none mt-1">
                    마감 D-Day 🔥
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">오늘 하루 무제한</p>
                </div>
                <div className="mt-2 pt-1 border-t border-gray-100">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900">1,200원</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium"> / 1일</span>
                </div>
              </div>

              {/* Option 2: 7-day Pass */}
              <div
                onClick={() => handleProductSelect('7days')}
                className={`border-2 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between relative ${
                  selectedProduct === '7days'
                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-extrabold text-indigo-900">7일 완성</span>
                  </div>
                  <span className="inline-block text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded leading-none mt-1">
                    추천 🌟
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">커피 1잔값 7일</p>
                </div>
                <div className="mt-2 pt-1 border-t border-gray-100">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900">3,900원</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium"> / 7일</span>
                </div>
              </div>

              {/* Option 3: 30-day Pass */}
              <div
                onClick={() => handleProductSelect('30days')}
                className={`border-2 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between relative ${
                  selectedProduct === '30days'
                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-700">30일 올패스</span>
                  </div>
                  <span className="inline-block text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded leading-none mt-1">
                    시즌권 👑
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">공채 1달 무제한</p>
                </div>
                <div className="mt-2 pt-1 border-t border-gray-100">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900">9,900원</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium"> / 30일</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Toss / Instant Transfer Section */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 border border-blue-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0064FF] animate-ping" />
                <span className="text-xs font-extrabold text-[#0064FF]">
                  {isMobile ? '⚡ 모바일 간편 송금 (토스)' : '💻 PC 간편 계좌 복사'}
                </span>
              </div>
              <span className="text-[10px] bg-blue-100 text-[#0050d8] font-bold px-2 py-0.5 rounded-full">
                {isMobile ? '계좌/금액 자동입력' : '카카오뱅크 7942-03-88490'}
              </span>
            </div>

            <p className="text-[11px] text-gray-600">
              {isMobile
                ? `버튼을 누르면 토스 앱이 실행되어 ${getAmount(selectedProduct).toLocaleString()}원 송금 화면이 바로 열립니다.`
                : `버튼을 클릭하면 계좌번호가 즉시 복사됩니다. 모바일 뱅킹에서 ${getAmount(selectedProduct).toLocaleString()}원을 이체해 주세요.`}
            </p>

            <button
              type="button"
              onClick={handleTossTransfer}
              className="w-full py-3 px-4 rounded-xl bg-[#0064FF] hover:bg-[#0050d8] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition cursor-pointer"
            >
              <span>
                {isMobile
                  ? `⚡ 토스 앱으로 ${getAmount(selectedProduct).toLocaleString()}원 1초 만에 송금하기`
                  : `📋 카카오뱅크 계좌 복사 (${getAmount(selectedProduct).toLocaleString()}원)`}
              </span>
            </button>
          </div>

          {/* Account Transfer Info Box */}
          <div className="animate-fade-in space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">타 은행 직접 이체 및 입금자 성함</label>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-500">카카오뱅크</span>
                    <span className="text-base font-extrabold text-indigo-900 tracking-tight">7942-03-88490</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">예금주: 백재근</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer ${
                    copied
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-600 font-bold'
                      : 'border-indigo-200 bg-white hover:bg-gray-50 text-indigo-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>복사완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>계좌 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-indigo-100/50 pt-3 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">지정 입금액</span>
                <span className="font-extrabold text-indigo-950 text-sm">
                  {getAmount(selectedProduct).toLocaleString()}원
                </span>
              </div>

              {/* Depositor Name Input Field */}
              <div className="border-t border-indigo-100/50 pt-3.5 space-y-1.5">
                <label className="text-[11px] font-extrabold text-indigo-900 block flex items-center gap-1">
                  <span>👤</span> 입금자 성함 (실제 송금자 이름) <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="송금 시 기재한 입금자명을 적어주세요"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3 leading-relaxed space-y-1.5">
              <p className="font-bold text-gray-700 flex items-center gap-1">
                <span>📌</span> Pro 등급 활성화 가이드:
              </p>
              <p>1. [토스 1초 송금] 또는 [계좌 복사 후 이체]로 <strong className="text-indigo-600">{getAmount(selectedProduct).toLocaleString()}원</strong>을 송금해 주세요.</p>
              <p>2. 송금 후, 위 입력란에 실제 <strong className="text-gray-900">입금자 성함</strong>을 입력하고 아래 <strong className="text-indigo-700">입금 완료 버튼</strong>을 꼭 눌러주세요!</p>
              <p>3. 입금 문의나 빠른 승인 요청은 <a href="https://www.instagram.com/draft_ethan?igsh=MXJubXc5cjJ5ZTA1Zw==" target="_blank" rel="noreferrer" className="text-purple-600 font-bold underline inline-flex items-center gap-0.5"><Instagram className="w-3 h-3 inline" />인스타그램 DM (@draft_ethan)</a>으로 남겨주시면 실시간 처리해 드립니다.</p>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center text-xs px-2">
            <span className="text-gray-500 font-medium">선택 상품</span>
            <span className="font-semibold text-gray-800 truncate max-w-[220px]">{getProductName(selectedProduct)}</span>
          </div>
          <div className="flex justify-between items-center text-sm px-2">
            <span className="text-gray-800 font-bold">최종 입금액</span>
            <span className="font-extrabold text-indigo-600 text-base">
              {getAmount(selectedProduct).toLocaleString()} 원
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              onClick={handleCopyAccount}
              className={`col-span-1 py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer active:scale-98 ${
                copied
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-600 font-extrabold'
                  : 'border-indigo-200 bg-white hover:bg-gray-50 text-indigo-700'
              }`}
            >
              <span>{copied ? '복사완료' : '계좌 복사'}</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmPaymentRequest}
              disabled={isSubmitting}
              className="col-span-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/10 active:scale-98"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <span>입금 완료 (꼭 눌러주세요!)</span>
              )}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center select-none pt-1">
            송금 완료 후 꼭 '입금 완료' 버튼을 클릭하셔야 자동 접수되어 관리자가 승인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
