import React, { useEffect, useState } from 'react';
import { X, Search, Shield, RefreshCw, UserCheck, AlertOctagon, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  email: string | null;
  is_pro: boolean;
  pro_expires_at?: string | null;
  created_at?: string;
}

interface PaymentRequest {
  id: string;
  user_id: string;
  email: string | null;
  depositor_name: string | null;
  amount: number;
  product: string;
  status: 'opened' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'profiles'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      const sorted = (data || []).sort((a: any, b: any) => {
        if (a.is_pro && !b.is_pro) return -1;
        if (!a.is_pro && b.is_pro) return 1;
        return (a.email || '').localeCompare(b.email || '');
      });

      setProfiles(sorted);
    } catch (err: any) {
      console.error('Failed to load profiles:', err);
      setErrorMsg('데이터베이스에서 유저 목록을 불러오지 못했습니다.');
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "payment_requests" does not exist')) {
          console.warn('Tabler payment_requests does not exist yet. Please run migration SQL.');
        } else {
          throw error;
        }
      } else {
        setPaymentRequests(data || []);
      }
    } catch (err: any) {
      console.error('Failed to load payment requests:', err);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    await Promise.all([fetchProfiles(), fetchPaymentRequests()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen]);

  const handleTogglePro = async (userId: string, currentProStatus: boolean) => {
    setActionLoadingId(userId);
    try {
      const nextStatus = !currentProStatus;
      const expiresAt = nextStatus
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: nextStatus, pro_expires_at: expiresAt })
        .eq('id', userId);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === userId ? { ...profile, is_pro: nextStatus, pro_expires_at: expiresAt } : profile
        ).sort((a: any, b: any) => {
          if (a.is_pro && !b.is_pro) return -1;
          if (!a.is_pro && b.is_pro) return 1;
          return (a.email || '').localeCompare(b.email || '');
        })
      );
    } catch (err) {
      console.error('Failed to update membership:', err);
      alert('등급 변경 실패: 권한 또는 네트워크 에러입니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetUsage = async (userId: string, email: string) => {
    setActionLoadingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ free_usage_reset_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      alert(`✅ [${email || '회원'}]님의 일일 AI 첨삭 3회 제한 사용량이 성공적으로 초기화되었습니다.`);
    } catch (err) {
      console.error('Failed to reset usage limit:', err);
      alert('초기화 실패: DB 오류가 발생했습니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprovePayment = async (req: PaymentRequest) => {
    setActionLoadingId(req.id);
    try {
      let days = 30;
      if (req.product.includes('7일')) {
        days = 7;
      } else if (req.product.includes('30일')) {
        days = 30;
      }
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      // 1. Upgrade profile's is_pro status to true with pro_expires_at timestamp
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_pro: true, pro_expires_at: expiresAt })
        .eq('id', req.user_id);

      if (profileError) throw profileError;

      // 2. Set payment request status as approved
      const { error: reqError } = await supabase
        .from('payment_requests')
        .update({ status: 'approved' })
        .eq('id', req.id);

      if (reqError) throw reqError;

      const expiresDateStr = new Date(expiresAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      alert(`👑 [${req.depositor_name || '무명'}] 회원님의 이체 승인이 완료되었습니다.\nPRO 이용권(${days}일)이 활성화되었습니다!\n자동 만료 예정일: ${expiresDateStr}`);
      
      // Update state locally
      setPaymentRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r))
      );
      setProfiles((prev) =>
        prev.map((p) => (p.id === req.user_id ? { ...p, is_pro: true, pro_expires_at: expiresAt } : p))
      );
    } catch (err) {
      console.error('Approve failed:', err);
      alert('승인 처리 실패: DB 권한 오류이거나 잘못된 요청입니다.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPayment = async (reqId: string) => {
    if (!confirm('정말로 이 입금 요청 건을 거절/취소 처리하시겠습니까?')) return;
    setActionLoadingId(reqId);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: 'rejected' })
        .eq('id', reqId);

      if (error) throw error;

      alert('해당 요청이 거절(반려) 처리되었습니다.');
      setPaymentRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r))
      );
    } catch (err) {
      console.error('Reject failed:', err);
      alert('거절 처리 실패.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  const cleanQuery = searchQuery.replace('#', '').trim().toLowerCase();

  // Filters profiles
  const filteredProfiles = profiles.filter((p) =>
    (p.email || '').toLowerCase().includes(cleanQuery) ||
    (p.id || '').toLowerCase().includes(cleanQuery)
  );

  // Filters payment requests
  const filteredRequests = paymentRequests.filter((p) =>
    (p.email || '').toLowerCase().includes(cleanQuery) ||
    (p.depositor_name || '').toLowerCase().includes(cleanQuery) ||
    (p.id || '').toLowerCase().includes(cleanQuery) ||
    (p.user_id || '').toLowerCase().includes(cleanQuery)
  );

  const pendingRequestsCount = paymentRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl max-w-3xl w-full flex flex-col shadow-2xl text-gray-800 overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="bg-indigo-900 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-300" />
            <div>
              <h3 className="font-extrabold tracking-tight text-base">
                Draft Ethan <span className="text-amber-400">Pro</span> 어드민 제어판
              </h3>
              <p className="text-[10px] text-indigo-200">
                입금 확인 요청을 기반으로 회원의 등급을 한 번에 승인 제어합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="새로고침"
              disabled={isLoading}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 flex justify-center items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'border-indigo-650 text-indigo-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <span>💳 입금 완료 요청 리스트</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold leading-none animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex-1 py-3 text-xs font-bold transition border-b-2 flex justify-center items-center gap-2 cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-indigo-650 text-indigo-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <span>👥 전체 가입자 데이터베이스</span>
            <span className="text-[10px] text-gray-400 font-mono font-medium">
              ({profiles.length}명)
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'requests' 
                  ? '입금자명, 이메일 주소 또는 매칭 코드 검색'
                  : '회원 이메일 주소 또는 고유코드(#) 검색'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-indigo-650"
            />
          </div>
          <div className="text-[11px] text-gray-500 font-bold shrink-0">
            총 {activeTab === 'requests' ? filteredRequests.length : filteredProfiles.length}건 검색됨
          </div>
        </div>

        {/* Dynamic Content Body Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[35vh]">
          {isLoading && (profiles.length === 0 && paymentRequests.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-250 border-t-indigo-650 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">데이터 동기화하는 중...</span>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-16 text-rose-500 text-xs font-semibold">
              {errorMsg}
            </div>
          ) : activeTab === 'requests' ? (
            /* TAB 1: Payment Check Requests */
            filteredRequests.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-xs">
                {paymentRequests.length === 0 
                  ? '송금 신청하거나 모달을 열어 이탈한 기록이 없습니다. (payment_requests 테이블 조회 실패 포함)' 
                  : '검색 기준에 부합하는 입금 요청 내역이 없습니다.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const isUpdating = actionLoadingId === req.id;
                  const dateStr = new Date(req.created_at).toLocaleTimeString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        req.status === 'pending'
                          ? 'border-indigo-200 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-50'
                          : req.status === 'approved'
                          ? 'border-emerald-100 bg-emerald-50/10'
                          : req.status === 'rejected'
                          ? 'border-gray-200 bg-gray-55/40 text-gray-400'
                          : 'border-amber-100 bg-amber-50/5' // 'opened' status (leads)
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {req.status === 'pending' ? (
                            <span className="text-[9px] font-extrabold text-white bg-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 animate-pulse">
                              <Clock className="w-2.5 h-2.5" />
                              입금확인요청
                            </span>
                          ) : req.status === 'approved' ? (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                              <CheckCircle className="w-2.5 h-2.5" />
                              입금확인완료
                            </span>
                          ) : req.status === 'rejected' ? (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded shrink-0">
                              반려/취소됨
                            </span>
                          ) : (
                            <span className="text-[9px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                              결제 대기 (이탈)
                            </span>
                          )}

                          <span className="text-xs font-extrabold text-gray-900 select-all">
                            {req.depositor_name ? `${req.depositor_name} (입금인)` : '이름 미기입'}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            • {req.email || '이메일 없음'}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 font-medium">
                          신청상품: <span className="font-bold text-indigo-900">{req.product} ({req.amount.toLocaleString()}원)</span>
                        </div>

                        <div className="text-[9px] text-gray-405 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>시각: {dateStr}</span>
                          <span>|</span>
                          <span>고유코드: #{req.user_id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Request Action Buttons */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleRejectPayment(req.id)}
                            disabled={isUpdating}
                            className="px-2.5 py-1.5 border border-rose-250 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer transition"
                          >
                            거절
                          </button>
                          <button
                            onClick={() => handleApprovePayment(req)}
                            disabled={isUpdating}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1 shadow shadow-indigo-600/10"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>입금확인/승인</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'opened' && (
                        <button
                          onClick={() => {
                            // Let the admin manually force upgrade this user even if they didn't complete the modal name form
                            const mockReq: PaymentRequest = { ...req, depositor_name: '수동강제승격' };
                            handleApprovePayment(mockReq);
                          }}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 text-[10px] font-bold rounded-lg shrink-0 transition"
                          title="이탈 고객에 대해 강제 프로 활성화"
                        >
                          강제 승격
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TAB 2: Profiles DB */
            filteredProfiles.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-xs">
                검색 대상 회원이 한 명도 존재하지 않습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProfiles.map((profile) => {
                  const isProAcc = profile.is_pro;
                  const isUpdating = actionLoadingId === profile.id;
                  
                  return (
                    <div
                      key={profile.id}
                      className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50/70 transition"
                    >
                      <div className="space-y-1 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 break-all select-all truncate">
                            {profile.email || '이메일 없음'}
                          </span>
                          {isProAcc ? (
                            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-250 shrink-0">
                              👑 PRO 멤버
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1 py-0.5 rounded border border-gray-150 shrink-0">
                              일반회원
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-gray-400 font-mono tracking-tight flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[150px] sm:max-w-none">ID: {profile.id}</span>
                          <span className="text-gray-300">|</span>
                          <span className="font-extrabold text-indigo-650 bg-indigo-50/65 px-1 py-0.5 rounded border border-indigo-100/50 select-all">
                            코드: #{profile.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResetUsage(profile.id, profile.email)}
                          disabled={isUpdating}
                          className="text-xs font-semibold py-1.5 px-3 border border-gray-200 hover:bg-gray-100 text-gray-700 bg-white hover:text-gray-900 rounded-lg transition cursor-pointer"
                        >
                          3회 초기화
                        </button>
                        <button
                          onClick={() => handleTogglePro(profile.id, isProAcc)}
                          disabled={isUpdating}
                          className={`text-xs font-semibold py-1.5 px-3.5 rounded-lg border transition cursor-pointer flex items-center justify-center shrink-0 min-w-[90px] ${
                            isUpdating
                              ? 'bg-gray-100 text-gray-400 border-gray-200'
                              : isProAcc
                              ? 'bg-rose-550/10 hover:bg-rose-550/20 text-rose-600 border-rose-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                          }`}
                        >
                          {isUpdating ? (
                            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-650 rounded-full animate-spin" />
                          ) : isProAcc ? (
                            '일반 전환'
                          ) : (
                            'PRO 승격'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Footer info & Guide */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 select-none shrink-0 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span>* 테이블명: payment_requests (user_id, email, depositor_name, amount, product, status, created_at)</span>
          <span className="font-bold text-gray-550">어드민 전용 권한을 가진 계정에서만 데이터 수정이 완료됩니다.</span>
        </div>
      </div>
    </div>
  );
};
