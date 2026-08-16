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

let lastVisitorNotifyTime = 0;
let isVisitorNotifying = false;
const VISITOR_DEDUPE_KEY = 'dethan_visitor_notify_lock';

/**
 * 1. notifyVisitor(): 유저 방문 시 알림 (3중 락으로 중복 알림 100% 방지, 스마트 봇 감지, SNS 유입 채널 분석)
 */
export const notifyVisitor = async (): Promise<boolean> => {
  const now = Date.now();

  // 1단계: 메모리 락 (15초 쿨다운 및 동시 실행 방지)
  if (isVisitorNotifying || now - lastVisitorNotifyTime < 15000) {
    return false;
  }

  // 2단계: 브라우저 세션/로컬 스토리지 락 (동일 브라우저 세션에서 5분 이내 중복 전송 원천 차단)
  if (typeof window !== 'undefined') {
    try {
      const sessionLock = window.sessionStorage?.getItem(VISITOR_DEDUPE_KEY);
      const localLock = window.localStorage?.getItem(VISITOR_DEDUPE_KEY);
      const lastTs = Math.max(
        sessionLock ? parseInt(sessionLock, 10) : 0,
        localLock ? parseInt(localLock, 10) : 0
      );
      if (lastTs && now - lastTs < 300000) { // 5분(300,000ms) 이내 중복 알림 차단
        return false;
      }
      window.sessionStorage?.setItem(VISITOR_DEDUPE_KEY, String(now));
      window.localStorage?.setItem(VISITOR_DEDUPE_KEY, String(now));
    } catch (e) {
      // 스토리지 접근 제한 환경 예외 처리
    }
  }

  isVisitorNotifying = true;
  lastVisitorNotifyTime = now;

  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const rawReferrer = typeof document !== 'undefined' ? (document.referrer || '') : '';

  // 1. 봇 / 크롤러 판별
  let isBot = false;
  let visitorType = '👤 일반 방문자 (Real Human)';
  if (/Mediapartners-Google/i.test(userAgent)) {
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

  const embedColor = isBot ? 0x95a5a6 : 0x6366f1; // 봇은 차분한 그레이, 유저는 선명한 인디고
  const statusEmoji = isBot ? '🤖' : '✨';

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
