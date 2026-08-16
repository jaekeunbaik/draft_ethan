/**
 * Discord Webhook 실시간 알림 유틸리티 모듈
 * Dethan (디든) 서비스 모니터링
 */

const getWebhookUrl = (): string | undefined => {
  return (
    import.meta.env.VITE_DISCORD_WEBHOOK_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_DISCORD_WEBHOOK_URL || process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL : undefined)
  );
};

const getDepositWebhookUrl = (): string | undefined => {
  return (
    import.meta.env.VITE_DISCORD_DEPOSIT_WEBHOOK_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_DISCORD_DEPOSIT_WEBHOOK_URL || process.env.DISCORD_DEPOSIT_WEBHOOK_URL : undefined) ||
    getWebhookUrl()
  );
};

interface SendDiscordEmbedOptions {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footerText?: string;
  webhookUrl?: string;
}

const sendDiscordEmbed = async (options: SendDiscordEmbedOptions): Promise<boolean> => {
  const webhookUrl = options.webhookUrl || getWebhookUrl();
  if (!webhookUrl) {
    console.warn('⚠️ DISCORD_WEBHOOK_URL이 환경변수에 설정되어 있지 않습니다.');
    return false;
  }

  try {
    const payload = {
      embeds: [
        {
          title: options.title,
          description: options.description,
          color: options.color,
          fields: options.fields || [],
          timestamp: new Date().toISOString(),
          footer: {
            text: options.footerText || 'Dethan Real-time Monitoring',
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[DiscordNotifier] Webhook 응답 상태 코드: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[DiscordNotifier] 디스코드 웹훅 전송 중 오류 발생:', error);
    return false;
  }
};

import { supabase } from '../lib/supabase';

let lastVisitorNotifyTime = 0;
let isVisitorNotifying = false;
const VISITOR_DEDUPE_KEY = 'dethan_visitor_notify_lock';

export interface VisitorInfo {
  user?: any | null;
  isPro?: boolean;
}

const COOKIE_LOCK_NAME = 'dethan_visit_lock_v3';

/**
 * 1. notifyVisitor(): 유저 방문 시 알림 (로그인 유저 닉네임/등급 표기, Chrome 프리렌더 방지, 쿠키 락)
 */
export const notifyVisitor = async (userInfo?: VisitorInfo): Promise<boolean> => {
  // 1. Chrome Speculative Prerender 감지 (주소창 입력 시 백그라운드 프리렌더 1회 + 실제 활성화 1회 이중 실행 방지)
  if (typeof document !== 'undefined' && (document as any).prerendering) {
    document.addEventListener('prerenderingchange', () => {
      notifyVisitor(userInfo);
    }, { once: true });
    return false;
  }

  // 2. Cookie 락 (브라우저 모든 탭/프리렌더/메모리 컨텍스트 통합 3분 중복 차단)
  if (typeof document !== 'undefined') {
    if (document.cookie.includes(`${COOKIE_LOCK_NAME}=1`)) {
      return false;
    }
    document.cookie = `${COOKIE_LOCK_NAME}=1; max-age=180; path=/; samesite=lax`;
  }

  const now = Date.now();

  // 3. 메모리 즉시 락 (동시 호출 및 30초 쿨다운 차단)
  if (isVisitorNotifying || now - lastVisitorNotifyTime < 30000) {
    return false;
  }
  isVisitorNotifying = true;
  lastVisitorNotifyTime = now;

  // 4. 브라우저 세션/로컬 스토리지 락
  if (typeof window !== 'undefined') {
    try {
      const sessionLock = window.sessionStorage?.getItem(VISITOR_DEDUPE_KEY);
      const localLock = window.localStorage?.getItem(VISITOR_DEDUPE_KEY);
      const lastTs = Math.max(
        sessionLock ? parseInt(sessionLock, 10) : 0,
        localLock ? parseInt(localLock, 10) : 0
      );
      if (lastTs && now - lastTs < 180000) { // 3분(180,000ms) 이내 중복 알림 차단
        isVisitorNotifying = false;
        return false;
      }
      window.sessionStorage?.setItem(VISITOR_DEDUPE_KEY, String(now));
      window.localStorage?.setItem(VISITOR_DEDUPE_KEY, String(now));
    } catch (e) {
      // 스토리지 접근 제한 환경 예외 처리
    }
  }

  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const rawReferrer = typeof document !== 'undefined' ? (document.referrer || '') : '';

    // 유저 세션 확인 (파라미터 우선 -> localStorage Supabase 토큰 동기 파싱 -> getSession 조회)
    let currentUser = userInfo?.user;
    let isPro = userInfo?.isPro ?? false;

    if (!currentUser && typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.user) {
                currentUser = parsed.user;
                break;
              }
            }
          }
        }
      } catch (e) {}
    }

    if (!currentUser && typeof window !== 'undefined') {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          currentUser = sessionData.session.user;
        }
      } catch (e) {}
    }

    // 1. 봇 / 로그인 회원 / 비회원 판별
    let isBot = false;
    let visitorType = '👤 비회원 방문자 (Guest)';

    if (currentUser) {
      const kakaoNickname =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.user_metadata?.preferred_username ||
        currentUser.user_metadata?.nickname ||
        currentUser.user_metadata?.user_name;

      const email = currentUser.email || '';
      const nickname = kakaoNickname || (email ? email.split('@')[0] : '카카오 회원');

      // PRO 여부 정밀 확인 (localStorage 캐시 + Supabase profiles 테이블 조회)
      if (!isPro && typeof window !== 'undefined') {
        const cachedPro = localStorage.getItem(`dethan_is_pro_${currentUser.id}`);
        if (cachedPro === 'true') {
          isPro = true;
        } else {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_pro, pro_expires_at')
              .eq('id', currentUser.id)
              .single();
            if (profile?.is_pro) {
              if (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date()) {
                isPro = true;
                localStorage.setItem(`dethan_is_pro_${currentUser.id}`, 'true');
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }

      const proBadge = isPro ? '👑 PRO 회원' : '⭐ 일반 회원';
      visitorType = `👤 ${nickname}님 (${proBadge})`;
    } else if (/Mediapartners-Google/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 Google 애드센스/광고 분석 봇';
    } else if (/Googlebot/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 Google 검색 색인 크롤러';
    } else if (/bingbot/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 Bing 검색 크롤러';
    } else if (/facebookexternalhit|Threads/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 Meta / Threads 링크 미리보기 봇';
    } else if (/kakaotalk-scrap/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 카카오톡 링크 미리보기 봇';
    } else if (/Yeti|NaverBot/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 네이버 검색 크롤러';
    } else if (/bot|crawler|spider|crawling/i.test(userAgent)) {
      isBot = true;
      visitorType = '🤖 웹 크롤러 / 봇';
    }

  // 2. 유입 채널 (Referrer) 스마트 분석
  let channelName = '⚡ 직접 접속 / 북마크 / 주소창 입력';
  if (/instagram\.com/i.test(rawReferrer)) {
    channelName = '📸 인스타그램 (Instagram 프로필/링크)';
  } else if (/threads\.net/i.test(rawReferrer)) {
    channelName = '💬 스레드 (Threads 피드/프로필)';
  } else if (/youtube\.com|youtu\.be/i.test(rawReferrer)) {
    channelName = '🎬 유튜브 (YouTube 쇼츠/설명란)';
  } else if (/myti/i.test(rawReferrer)) {
    channelName = '🎯 MYTI 페르소나 테스트 ➔ 디든 연결 유입';
  } else if (/google\./i.test(rawReferrer)) {
    channelName = '🔍 Google 검색 유입';
  } else if (/naver\./i.test(rawReferrer)) {
    channelName = '🟢 네이버 검색 유입';
  } else if (/kakao/i.test(rawReferrer)) {
    channelName = '🟡 카카오톡 공유 링크 유입';
  } else if (rawReferrer) {
    channelName = `🌐 외부 웹사이트 (${rawReferrer.substring(0, 50)})`;
  }

  // 3. 기기 & OS 스마트 파싱
  let osName = '기타 OS';
  if (/iPhone/i.test(userAgent)) osName = 'Apple iPhone (iOS)';
  else if (/iPad/i.test(userAgent)) osName = 'Apple iPad (iPadOS)';
  else if (/Android/i.test(userAgent)) osName = 'Android 모바일';
  else if (/Macintosh|Mac OS/i.test(userAgent)) osName = 'Mac (macOS)';
  else if (/Windows/i.test(userAgent)) osName = 'Windows PC';

  // 4. 브라우저 파싱
  let browserName = '기타 브라우저';
  if (/kakao/i.test(userAgent)) browserName = '🟡 카카오톡 인앱';
  else if (/instagram/i.test(userAgent)) browserName = '📸 인스타 인앱';
  else if (/edg/i.test(userAgent)) browserName = '🟦 Edge';
  else if (/chrome|crios/i.test(userAgent)) browserName = '🔴 Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browserName = '🧭 Safari';

  const isProUser = visitorType.includes('PRO');
  const embedColor = isBot ? 0x95a5a6 : isProUser ? 0xf59e0b : 0x6366f1; // 봇은 차분한 그레이, PRO는 럭셔리 골드, 일반은 인디고
  const statusEmoji = isBot ? '🤖' : isProUser ? '👑' : '✨';

    return await sendDiscordEmbed({
      title: `${statusEmoji} [Dethan 디든] 실시간 방문 알림 대시보드`,
      color: embedColor,
      fields: [
        { name: '📊 방문자 분류', value: `**${visitorType}**`, inline: true },
        { name: '🔗 유입 채널', value: `**${channelName}**`, inline: true },
        { name: '📱 기기 및 OS', value: osName, inline: true },
        { name: '🌐 브라우저', value: browserName, inline: true },
        { name: '🕒 접속 시각', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: false },
      ],
      footerText: isBot ? 'Dethan (디든) 봇 트래픽 모니터링' : 'Dethan (디든) 실시간 유저 모니터링',
    });
  } catch (error) {
    console.error('[DiscordNotifier] 방문자 알림 실패:', error);
    return false;
  } finally {
    isVisitorNotifying = false;
  }
};

/**
 * 2. notifyCorrectionSuccess(): 자소서 첨삭 완료 시 알림 (유저 정보, 지원 회사, 문항, 원문 전체/미리보기 포함)
 */
export const notifyCorrectionSuccess = async (
  req: {
    question?: string;
    content: string;
    jobTitle: string;
    companyName?: string;
    tone?: string;
    focusPoints?: string[];
  },
  userEmail?: string,
  isPro?: boolean
): Promise<boolean> => {
  const charCount = req.content ? req.content.length : 0;
  const userTag = userEmail ? `${userEmail} (${isPro ? '👑 PRO 회원' : '👤 일반 회원'})` : '비회원 / 손님';

  const toneMap: Record<string, string> = {
    professional: '전문적인 비즈니스 어체',
    confident: '당당하고 적극적인 어체',
    modest: '겸손하고 진솔한 어체',
    logical: '논리적인 분석적 어체',
  };

  const focusMap: Record<string, string> = {
    metrics: '숫자/수치 성과',
    job_skills: '직무 전문 역량',
    teamwork: '팀워크/협업',
    problem_solving: '문제 해결력',
  };

  const selectedTone = req.tone ? (toneMap[req.tone] || req.tone) : '기본 어체';
  const selectedFocus = req.focusPoints && req.focusPoints.length > 0
    ? req.focusPoints.map(f => focusMap[f] || f).join(', ')
    : '기본 설정';

  const contentSnippet = req.content.length > 900
    ? req.content.substring(0, 900) + '\n... (이하 생략)'
    : req.content;

  const fields = [
    { name: '👤 제출 유저', value: userTag, inline: false },
    { name: '🎯 지원 직무 / 회사', value: `${req.jobTitle} ${req.companyName ? `(${req.companyName})` : ''}`, inline: true },
    { name: '📝 자소서 글자 수', value: `${charCount.toLocaleString()}자`, inline: true },
    { name: '⚙️ 첨삭 선택 옵션', value: `톤: ${selectedTone} | 강조: ${selectedFocus}`, inline: false },
  ];

  if (req.question && req.question.trim()) {
    fields.push({ name: '❓ 자소서 문항', value: req.question.substring(0, 300), inline: false });
  }

  fields.push({
    name: '📄 고객이 입력한 자소서 원문',
    value: `\`\`\`\n${contentSnippet}\n\`\`\``,
    inline: false,
  });

  fields.push({
    name: '⏰ 첨삭 시각',
    value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    inline: false,
  });

  return sendDiscordEmbed({
    title: '✨ [Dethan 디든] 새로운 자소서 AI 첨삭 발생!',
    color: isPro ? 0xf1c40f : 0x2ecc71, // Gold if Pro, Emerald Green if Free
    fields,
    footerText: 'Dethan (디든) AI 실시간 자소서 첨삭 모니터링',
  });
};

/**
 * 3. notifyPaymentSuccess(): 결제 성공 시 알림 (결제 금액 및 유저 식별 정보 포함)
 */
export const notifyPaymentSuccess = async (
  amount: number,
  email?: string
): Promise<boolean> => {
  return sendDiscordEmbed({
    title: '🎉 결제/입금 신청 완료 (PRO 업그레이드)!',
    color: 0xf1c40f, // Gold / Yellow
    fields: [
      { name: '💰 결제/입금 금액', value: `${amount.toLocaleString()}원`, inline: true },
      { name: '👤 유저 식별 정보', value: email || '익명/미확인 유저', inline: true },
      { name: '🕒 결제 시각', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: false },
    ],
    footerText: 'Dethan Pro 입금/결제 알림',
    webhookUrl: getDepositWebhookUrl(),
  });
};
