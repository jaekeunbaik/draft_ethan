import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InstantRoaster } from './components/InstantRoaster';
import { FormSection } from './components/FormSection';
import { ResultSection } from './components/ResultSection';
import { HistoryModal } from './components/HistoryModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminModal } from './components/AdminModal';
import { TermsModal } from './components/TermsModal';
import { CorrectionRequest, CorrectionResponse, HistoryItem } from './types';
import { AlertCircle, ArrowUp, Instagram, ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';
import { notifyVisitor, notifyCorrectionSuccess, notifyPaymentSuccess } from './utils/discordNotifier';

const checkIsAdminUser = (user: any) => {
  if (!user) return false;
  const email = user.email || '';
  const cleanEmail = email.toLowerCase().trim();
  const metaEmail = user.user_metadata?.email || '';
  const cleanMetaEmail = metaEmail.toLowerCase().trim();
  const rawId = user.id || '';

  return (
    cleanEmail.startsWith('axsza') ||
    cleanMetaEmail.startsWith('axsza') ||
    rawId === 'd54f0cc2-a6b5-471e-9e8f-3410a8f611fc' || // 대표님의 Kakao ID 강제 허용
    (import.meta.env.VITE_ADMIN_EMAILS &&
      import.meta.env.VITE_ADMIN_EMAILS.toLowerCase().split(',').some((e: string) =>
        cleanEmail === e || cleanMetaEmail === e
      )
    )
  );
};

export default function App() {
  const [request, setRequest] = useState<CorrectionRequest | null>(null);
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Pro & Payment State
  const [isPro, setIsPro] = useState(false);
  const [proExpiresAt, setProExpiresAt] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Auth state listener & Profile sync
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch or self-initialize user profile row & listen for Realtime updates
  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setProExpiresAt(null);
      setIsAdmin(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const kakaoNickname =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.preferred_username ||
          user.user_metadata?.nickname ||
          user.user_metadata?.user_name;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // PGRST116 indicates row does not exist for new users
          if (error.code === 'PGRST116') {
            console.log('Profile mapping not found, initializing standard profile...');
            const emailValue = kakaoNickname
              ? `${kakaoNickname} (${user.email || `${user.id}@kakao.user`})`
              : user.email || `${user.id}@kakao.user`;

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: user.id, email: emailValue, is_pro: false }])
              .select('*')
              .single();

            if (!insertError && newProfile) {
              setIsPro(newProfile.is_pro);
              setProExpiresAt(newProfile.pro_expires_at || null);
              setIsAdmin((newProfile as any).is_admin === true || checkIsAdminUser(user));
            }
          } else {
            throw error;
          }
        } else if (data) {
          // If profile exists and user logged in with Kakao, sync nickname & email
          const updateData: any = {};
          if (kakaoNickname && !data.nickname) {
            updateData.nickname = kakaoNickname;
          }
          if (kakaoNickname && data.email && !data.email.includes(kakaoNickname)) {
            updateData.email = `${kakaoNickname} (${data.email})`;
          }

          if (Object.keys(updateData).length > 0) {
            let { error: updErr } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', user.id);

            if (updErr && updErr.message?.includes('nickname')) {
              delete updateData.nickname;
              if (Object.keys(updateData).length > 0) {
                await supabase.from('profiles').update(updateData).eq('id', user.id);
              }
            }
            if (updateData.email) data.email = updateData.email;
          }

          let activePro = data.is_pro;
          let activeExp = data.pro_expires_at || null;
          if (activePro && activeExp) {
            const expiresDate = new Date(activeExp);
            if (expiresDate < new Date()) {
              console.log('PRO membership expired on', activeExp, '- auto downgrading to free tier...');
              activePro = false;
              activeExp = null;
              await supabase
                .from('profiles')
                .update({ is_pro: false, pro_expires_at: null })
                .eq('id', user.id);
            }
          }
          setIsPro(activePro);
          setProExpiresAt(activePro ? activeExp : null);
          setIsAdmin((data as any).is_admin === true || checkIsAdminUser(user));
        }
      } catch (err) {
        console.error('Failed to sync profile status:', err);
        setIsPro(false);
        setProExpiresAt(null);
        setIsAdmin(checkIsAdminUser(user));
      }
    };

    fetchProfile();

    // 🚀 Supabase Realtime Listener for instant PRO upgrade without refresh
    const channel = supabase
      .channel(`profile-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            const nextPro = payload.new.is_pro;
            const nextExp = payload.new.pro_expires_at || null;
            setIsPro((prevPro) => {
              if (!prevPro && nextPro) {
                alert('🎉 축하합니다! 관리자 입금 확인이 완료되어 PRO 무제한 첨삭 기능이 즉시 활성화되었습니다!');
              }
              return nextPro;
            });
            setProExpiresAt(nextPro ? nextExp : null);
            if (payload.new.is_admin !== undefined) {
              setIsAdmin(payload.new.is_admin === true || checkIsAdminUser(user));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Real-time visitor notification to Discord Webhook (Fires on every visit)
  useEffect(() => {
    notifyVisitor();
  }, []);

  // Handle URL redirect query parameters for payment callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      alert('🎉 Pro 멤버십 결제가 성공적으로 완료되었습니다! 평생 무제한 첨삭 기능이 활성화되었습니다.');
      notifyPaymentSuccess(3900, user?.email || 'PG 결제 유저');
      window.history.replaceState({}, document.title, window.location.pathname);

      // Instantly trigger re-checking profile to sync Badge
      if (user) {
        supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setIsPro(data.is_pro);
          });
      }
    } else if (params.get('payment_fail') === 'true') {
      const msg = params.get('message') || '결제 진행 중 오류가 발생했습니다.';
      alert(`❌ 결제 실패: ${msg}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // Free Usage Limit Gating Logic (Local fallback)
  const getFreeUsageToday = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('draft_ethan_usage_count');
    if (saved) {
      try {
        const { date, count } = JSON.parse(saved);
        if (date === today) {
          return count;
        }
      } catch (e) {
        console.error('Failed to parse free usage count:', e);
      }
    }
    return 0;
  };

  const incrementFreeUsage = () => {
    const today = new Date().toDateString();
    const count = getFreeUsageToday() + 1;
    localStorage.setItem('draft_ethan_usage_count', JSON.stringify({ date: today, count }));
  };

  // Load history from Supabase (dependent on user session)
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        // Logged out -> load from localStorage backup
        const saved = localStorage.getItem('ai_coverletter_history');
        if (saved) {
          try {
            setHistory(JSON.parse(saved));
          } catch (err) {
            console.error('Failed to parse local history:', err);
          }
        } else {
          setHistory([]);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('history_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);

        if (error) {
          throw error;
        }

        if (data) {
          const mappedItems: HistoryItem[] = data.map((item: any) => ({
            id: item.id,
            createdAt: item.created_at,
            request: item.request_data,
            result: item.result_data,
          }));
          setHistory(mappedItems);
        }
      } catch (e) {
        console.error('Failed to load history from Supabase:', e);
        // Fallback to localStorage
        const saved = localStorage.getItem('ai_coverletter_history');
        if (saved) {
          try {
            setHistory(JSON.parse(saved));
          } catch (err) {
            console.error('Failed to parse local history:', err);
          }
        }
      }
    };

    loadHistory();
  }, [user]);

  // Save history to Supabase (if logged in) and localStorage backup
  const saveToHistory = async (req: CorrectionRequest, res: CorrectionResponse) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const newItem: HistoryItem = {
      id,
      createdAt,
      request: req,
      result: res,
    };

    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);

    // LocalStorage Backup
    try {
      localStorage.setItem('ai_coverletter_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Supabase Sync (save both logged-in users and guest submissions to history_items)
    try {
      await supabase.from('history_items').insert([
        {
          id,
          created_at: createdAt,
          job_title: req.jobTitle,
          company_name: req.companyName || null,
          request_data: req,
          result_data: res,
          user_id: user?.id || null,
        },
      ]);
    } catch (e) {
      console.error('Failed to save history to Supabase:', e);
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('ai_coverletter_history');

    if (user) {
      try {
        const { error } = await supabase
          .from('history_items')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to clear history from Supabase:', e);
      }
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('ai_coverletter_history', JSON.stringify(updated));

    if (user) {
      try {
        const { error } = await supabase
          .from('history_items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (e) {
        console.error('Failed to delete history item from Supabase:', e);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRequest(item.request);
    setResult(item.result);
    setIsHistoryOpen(false);
    setError(null);

    // Smooth scroll to top/result
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Submit Handler
  const handleSubmit = async (req: CorrectionRequest) => {
    // 1. Enforce login check (block guests)
    if (!user) {
      setError('AI 첨삭 기능을 이용하려면 먼저 로그인이 필요합니다.');
      setIsAuthOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRequest(req);

    // 1-1. Real-time DB Re-verification: Check if PRO membership has expired during active session
    let currentIsPro = isPro;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_pro, pro_expires_at')
        .eq('id', user.id)
        .single();

      if (profileData) {
        if (profileData.is_pro && profileData.pro_expires_at) {
          if (new Date(profileData.pro_expires_at) < new Date()) {
            console.log('PRO membership expired during active session. Reverting to free tier.');
            await supabase
              .from('profiles')
              .update({ is_pro: false, pro_expires_at: null })
              .eq('id', user.id);
            
            setIsPro(false);
            currentIsPro = false;
            alert('⏰ PRO 이용권 기간이 만료되어 일반 회원(일 3회 제한)으로 변경되었습니다.');
          } else {
            setIsPro(true);
            currentIsPro = true;
          }
        } else {
          setIsPro(profileData.is_pro);
          currentIsPro = profileData.is_pro;
        }
      }
    } catch (e) {
      console.warn('Realtime profile check warning:', e);
    }

    // 2. Gating check: Block free users executing more than 3 requests daily (measured from KST 6:00 AM)
    if (!currentIsPro) {
      try {
        const now = new Date();
        // Convert to KST representational hours (UTC + 9)
        const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const kstCutoff = new Date(kstNow);
        kstCutoff.setUTCHours(6, 0, 0, 0); // Target 6:00 AM KST

        // If current KST is before 6:00 AM KST, the reset happens at 6:00 AM KST of yesterday
        if (kstNow.getUTCHours() < 6) {
          kstCutoff.setUTCDate(kstCutoff.getUTCDate() - 1);
        }

        // Convert back to UTC cutoff date
        const utcCutoffTime = new Date(kstCutoff.getTime() - (9 * 60 * 60 * 1000));

        // Fetch profile to check if usage has been reset globally/manually
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('free_usage_reset_at')
          .eq('id', user.id)
          .single();

        if (profileErr) throw profileErr;

        let finalCutoffTime = utcCutoffTime;
        if (profile && profile.free_usage_reset_at) {
          const resetTime = new Date(profile.free_usage_reset_at);
          if (resetTime > utcCutoffTime) {
            finalCutoffTime = resetTime;
          }
        }

        const { count, error: countError } = await supabase
          .from('history_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', finalCutoffTime.toISOString());

        if (countError) throw countError;

        if (count !== null && count >= 3) {
          setError('일일 무료 AI 첨삭 한도(3회)를 모두 소진하셨습니다. 업그레이드 하시면 무제한 첨삭 및 정밀 분석이 가능합니다.');
          setIsPaymentOpen(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to verify usage logs from database:', err);
        // Fallback to local storage
        const currentUsage = getFreeUsageToday();
        if (currentUsage >= 3) {
          setError('일일 무료 AI 첨삭 한도(3회)를 모두 소진하셨습니다. 업그레이드 하시면 무제한 첨삭 및 정밀 분석이 가능합니다.');
          setIsPaymentOpen(true);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...req,
          isPro,
          userId: user.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '자소서 교정 중 오류가 발생했습니다.');
      }

      setResult(data);
      await saveToHistory(req, data);
      const kakaoNickname =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.user_metadata?.preferred_username ||
        user?.user_metadata?.nickname ||
        user?.user_metadata?.user_name;

      const userDisplay = kakaoNickname
        ? `${kakaoNickname} (${user?.email || `${user?.id}@kakao.user`})`
        : (user?.email || (user?.id ? `${user.id}@kakao.user` : '비회원 손님'));

      notifyCorrectionSuccess(req, userDisplay, currentIsPro);

      // Increment limits locally if using free tier
      if (!isPro) {
        incrementFreeUsage();
      }

      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error('Error submitting cover letter:', err);
      setError(err.message || '네트워크 오류가 발생했습니다. 잠시 후 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        historyCount={history.length}
        user={user}
        isPro={isPro}
        proExpiresAt={proExpiresAt}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={isAdmin}
        onOpenPayment={() => {
          if (!user) {
            alert('PRO 업그레이드를 구독하려면 먼저 카카오 간편 로그인이 필요합니다.');
            setIsAuthOpen(true);
          } else {
            setIsPaymentOpen(true);
          }
        }}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-12 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            <span>✨</span>
            <span>Drafted by Dethan. Approved by Recruiters.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            자소서 고민, <span className="text-indigo-600">Dethan (디든)</span>에게 맡기세요
          </h1>

          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            어색한 문장은 다듬고, 지원 직무에 맞는 키워드만 정교하게 연결해 드립니다.
          </p>
        </div>

        {/* ⚡ 1초 자소서 팩폭 즉시 진단기 (Instant Roaster Widget) */}
        <InstantRoaster
          onStartFullAnalysis={(sampleText) => {
            if (sampleText) {
              setRequest((prev) => ({
                question: prev?.question || '지원동기 및 주요 성과',
                content: sampleText,
                jobTitle: prev?.jobTitle || '백엔드 개발자',
                companyName: prev?.companyName,
                tone: prev?.tone || 'logical',
                focusPoints: prev?.focusPoints || ['metrics', 'job_skills'],
              }));
            }
            if (!user) {
              setIsAuthOpen(true);
            } else {
              document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs sm:text-sm flex items-start space-x-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold">오류가 발생했습니다:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs underline text-rose-600 hover:text-rose-800 shrink-0 cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}

        {/* Form Section */}
        {/* High Conversion Kakao Login Banner for Guests */}
        {!user && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 border-2 border-yellow-300 text-[#191919] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transform hover:scale-[1.01] transition duration-300">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/10 text-xs font-black uppercase tracking-wider">
                <span>🔥 3초 무료 팩폭 검수 이벤트</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900">
                회원가입 절차 0초! 카카오 1초 로그인하고 AI 팩폭 첨삭 받기
              </h3>
              <p className="text-xs text-gray-800 font-medium">
                로그인하시면 작성하신 자기소개서와 AI 첨삭 결과가 내 계정에 평생 안전하게 보관됩니다.
              </p>
            </div>
            <button
              onClick={() => {
                supabase.auth.signInWithOAuth({
                  provider: 'kakao',
                  options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                      scope: 'profile_nickname,profile_image',
                    },
                  }
                });
              }}
              className="px-6 py-3.5 bg-[#191919] hover:bg-black text-[#FEE500] text-sm font-extrabold rounded-xl shrink-0 cursor-pointer transition shadow-lg flex items-center justify-center space-x-2 active:scale-95 border border-yellow-400"
            >
              <svg className="w-5 h-5 fill-[#FEE500] shrink-0" viewBox="0 0 24 24">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>💛 1초 카카오 로그인</span>
            </button>
          </div>
        )}

        <FormSection
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialRequest={request}
          isPro={isPro}
          remainingFreeUsage={Math.max(0, 3 - getFreeUsageToday())}
          onOpenUpgrade={() => {
            if (!user) {
              alert('PRO 요금제 기능을 잠금해제하려면 먼저 로그인이 필요합니다.');
              setIsAuthOpen(true);
            } else {
              setIsPaymentOpen(true);
            }
          }}
        />

        {/* Result Section */}
        {result && request && !isLoading && (
          <ResultSection
            result={result}
            request={request}
            onReEdit={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Floating Scroll to Top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl transition transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
        title="맨 위로 이동"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <span className="font-semibold text-gray-800">Dethan (디든)</span>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-gray-500 hover:text-indigo-600 font-medium underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              이용약관 및 개인정보 처리방침
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://de-cringe.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              <span>🔥 DeCringe AI (SNS 흑역사 검수)</span>
            </a>

            <a
              href="https://www.instagram.com/draft_ethan?igsh=MXJubXc5cjJ5ZTA1Zw=="
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-semibold text-xs shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>인스타그램 CS / 입금 문의</span>
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-4 text-[11px] text-gray-400 text-center sm:text-left leading-relaxed">
          제출하신 자기소개서는 오직 AI 분석 및 첨삭 목적으로만 일시 처리되며 서버에 별도로 저장되지 않습니다. | AI 결과물은 서류 작성 참고용이며 채용 결과를 보장하지 않습니다.
        </div>
      </footer>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Help Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Payment Widget Modal */}
      {user && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          user={user}
        />
      )}

      {/* Terms Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Admin Panel Modal */}
      {isAdmin && (
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
