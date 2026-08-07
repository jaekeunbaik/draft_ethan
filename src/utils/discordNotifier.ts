/**
 * Discord Webhook 실시간 알림 유틸리티 모듈
 * Draft Ethan 서비스 모니터링
 */

const getWebhookUrl = (): string | undefined => {
  return (
    import.meta.env.VITE_DISCORD_WEBHOOK_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_DISCORD_WEBHOOK_URL || process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL : undefined)
  );
};

interface SendDiscordEmbedOptions {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footerText?: string;
}

const sendDiscordEmbed = async (options: SendDiscordEmbedOptions): Promise<boolean> => {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    console.warn('⚠️ VITE_DISCORD_WEBHOOK_URL이 환경변수에 설정되어 있지 않습니다.');
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
            text: options.footerText || 'Draft Ethan Real-time Monitoring',
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

/**
 * 1. notifyVisitor(): 유저 방문 시 알림 (타임스탬프 및 접속 디바이스/브라우저 정보 포함)
 */
export const notifyVisitor = async (): Promise<boolean> => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const referrer = typeof document !== 'undefined' ? (document.referrer || 'Direct Access / Bookmark') : 'Direct Access';

  let deviceType = '🖥️ PC (Desktop)';
  if (/mobile/i.test(userAgent)) deviceType = '📱 Mobile';
  else if (/tablet|ipad/i.test(userAgent)) deviceType = '📱 Tablet';

  let browserName = '🌐 기타 브라우저';
  if (/kakao/i.test(userAgent)) browserName = '🟡 KakaoTalk InApp Browser';
  else if (/edg/i.test(userAgent)) browserName = '🟦 Edge';
  else if (/chrome/i.test(userAgent)) browserName = '🔴 Chrome';
  else if (/safari/i.test(userAgent)) browserName = '🧭 Safari';

  return sendDiscordEmbed({
    title: '👀 [Draft Ethan] 새로운 유저 방문 접속!',
    color: 0x3498db, // Blue
    fields: [
      { name: '🔗 유입 경로 (Referrer)', value: referrer, inline: false },
      { name: '🌐 접속 기기', value: deviceType, inline: true },
      { name: '🌐 브라우저', value: browserName, inline: true },
      { name: '🕒 접속 시각', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: false },
      { name: '📱 User-Agent', value: `\`\`\`${userAgent.substring(0, 150)}\`\`\``, inline: false },
    ],
    footerText: 'Draft Ethan 방문자 실시간 모니터링',
  });
};

/**
 * 2. notifyCorrectionSuccess(): 자소서 첨삭 완료 시 알림 (지원 직무, 글자 수 포함)
 */
export const notifyCorrectionSuccess = async (
  jobTitle: string,
  charCount: number
): Promise<boolean> => {
  return sendDiscordEmbed({
    title: '✨ 자소서 AI 첨삭 완료!',
    color: 0x2ecc71, // Emerald Green
    fields: [
      { name: '🎯 지원 직무', value: jobTitle || '미지정', inline: true },
      { name: '📝 자소서 글자 수', value: `${charCount.toLocaleString()}자`, inline: true },
      { name: '⏰ 첨삭 시각', value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: false },
    ],
    footerText: 'Draft Ethan AI 첨삭 모니터링',
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
    footerText: 'Draft Ethan Pro 입금/결제 알림',
  });
};
