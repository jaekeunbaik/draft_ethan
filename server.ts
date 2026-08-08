import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const currentFilename = typeof __filename !== 'undefined' ? __filename : (typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '');
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : (currentFilename ? path.dirname(currentFilename) : process.cwd());


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Supabase Client
  const getSupabaseClient = () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseKey);
  };

  // Initialize Gemini Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Endpoint for Cover Letter Proofreading
  app.post('/api/correct', async (req, res) => {
    try {
      const { question, content, jobTitle, companyName, tone, focusPoints, targetCharCount, isPro } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: '자소서 내용을 입력해 주세요.' });
      }

      if (!jobTitle || !jobTitle.trim()) {
        return res.status(400).json({ error: '희망 직무를 입력해 주세요.' });
      }

      const ai = getAiClient();

      const toneGuide = tone ? `
[요청 첨삭 톤/어조]: ${
  tone === 'professional' ? '전문적이고 신뢰감을 주는 비즈니스 어체' :
  tone === 'confident' ? '당당하고 적극적인 주도적 어체' :
  tone === 'modest' ? '겸손하면서도 진솔하고 개방적인 어체' :
  '논리적이고 명확한 분석적 어체'
}` : '';

      const focusGuide = focusPoints && focusPoints.length > 0 ? `
[중점 강조 포인트]: ${focusPoints.map((f: string) => {
  if (f === 'metrics') return '숫자 및 수치화된 성과';
  if (f === 'job_skills') return '직무 전문 역량 및 실무 도구';
  if (f === 'teamwork') return '소통 및 조직 협업 능력';
  if (f === 'problem_solving') return '논리적 문제 해결 과정';
  return f;
}).join(', ')}` : '';

      const lengthGuide = targetCharCount ? `
[목표 글자수]: 공백 포함 약 ${targetCharCount}자 내외로 맞춰주세요.` : '';

      const prompt = `
사용자가 제출한 자기소개서를 [${jobTitle}] 직무 및 [${companyName || '관련 기업'}] 지원 목적에 맞춰 대기업 채용담당자 관점에서 고도화 첨삭을 진행해주세요.

${toneGuide}
${focusGuide}
${lengthGuide}

[자소서 문항]:
${question || '자유 지원 항목'}

[사용자 원문 자소서]:
${content}
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      let response: any = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: `당신은 대한민국 최고 수준의 채용 컨설턴트이자 자소서 전문 에디터입니다.
제출된 자기소개서를 희망 직무와 지원 기업의 핵심 역량에 완벽히 매칭되도록 가독성, 논리력, 두괄식 어법, 성과 표현을 대폭 다듬으세요.

지침:
1. 원문의 구체적인 에피소드와 경험 사실관계는 그대로 유지하고, 추상적인 문장 표현을 명확한 비즈니스 용어로 교정하세요.
2. 전체 교정본(correctedText)은 완결된 완성형 자기소개서 형태로 작성하세요.
3. 주요 문장/단락별 Before & After 비교(lineByLineDiff) 항목을 최소 3개 이상 작성하고, 수정 사유(reason)를 친절히 설명하세요.
4. 직무적합성, 가독성, 논리성, 구체성 평가 점수와 종합점수를 객관적으로 산출하세요.`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  headline: {
                    type: Type.STRING,
                    description: '교정된 자소서를 한눈에 보여주는 임팩트 있는 대표 헤드라인',
                  },
                  correctedText: {
                    type: Type.STRING,
                    description: '완성도 높게 첨삭 교정된 자기소개서 전체 텍스트',
                  },
                  feedbacks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '핵심 첨삭 제안 포인트 3~5가지',
                  },
                  overallScore: {
                    type: Type.INTEGER,
                    description: '종합 역량 평가 점수 (0-100)',
                  },
                  scoreBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      jobFit: { type: Type.INTEGER, description: '직무 적합성 (0-100)' },
                      readability: { type: Type.INTEGER, description: '가독성 및 어휘력 (0-100)' },
                      logic: { type: Type.INTEGER, description: '논리성 및 구성 (0-100)' },
                      specificity: { type: Type.INTEGER, description: '구체성 및 성과표현 (0-100)' },
                    },
                    required: ['jobFit', 'readability', 'logic', 'specificity'],
                  },
                  strengths: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '원문의 돋보이는 강점 및 우수한 점 2~4개',
                  },
                  weaknesses: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '원문의 보완이 필요한 개선 포인트 2~4개',
                  },
                  recommendedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '해당 직무 맞춤 어휘 및 추천 키워드 4~8개',
                  },
                  lineByLineDiff: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: { type: Type.STRING, description: '교정 전 원문 문장 또는 단락' },
                        corrected: { type: Type.STRING, description: '교정 후 개선된 문장 또는 단락' },
                        reason: { type: Type.STRING, description: '수정 이유 및 개선 효과' },
                      },
                      required: ['original', 'corrected', 'reason'],
                    },
                    description: '핵심 문장/단락별 Before & After 비교 및 사유',
                  },
                },
                required: [
                  'headline',
                  'correctedText',
                  'feedbacks',
                  'overallScore',
                  'scoreBreakdown',
                  'strengths',
                  'weaknesses',
                  'recommendedKeywords',
                  'lineByLineDiff',
                ],
              },
              temperature: 0.7,
            },
          });
          if (response && response.text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini API Warning] Model ${model} failed, trying fallback:`, err.message);
        }
      }

      if (!response) {
        throw lastError || new Error('Gemini API 호출에 실패했습니다.');
      }

      const resultText = response.text;

      if (!resultText) {
        throw new Error('Gemini API로부터 응답을 받지 못했습니다.');
      }

      const parsedResult = JSON.parse(resultText);

      // Add summary word/character counts
      const beforeCharCount = content.length;
      const beforeWordCount = content.trim().split(/\s+/).length;
      const correctedText = parsedResult.correctedText || '';
      const afterCharCount = correctedText.length;
      const afterWordCount = correctedText.trim().split(/\s+/).length;

      parsedResult.summaryComparison = {
        beforeWordCount,
        afterWordCount,
        beforeCharCount,
        afterCharCount,
      };

      // Save log to usage_logs in database
      try {
        const supabaseClient = getSupabaseClient();
        await supabaseClient.from('usage_logs').insert([
          {
            job_title: jobTitle,
            character_count: content.length,
            is_pro: isPro === true || isPro === 'true'
          }
        ]);
        console.log('Successfully logged to usage_logs');
      } catch (logErr) {
        console.warn('Logging to usage_logs failed:', logErr);
      }

      return res.json(parsedResult);
    } catch (error: any) {
      console.error('Gemini API Correction Error:', error);
      let errorMessage = error.message || '자소서 교정 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID') || error.status === 400) {
        errorMessage = 'Gemini API 키가 유효하지 않습니다. Google AI Studio (https://aistudio.google.com/app/apikey)에서 발급받으신 "AIzaSy..."로 시작하는 정식 API 키를 AI Studio 우측 상단 Secrets 메뉴에서 GEMINI_API_KEY로 입력해 주세요.';
      }

      return res.status(500).json({
        error: errorMessage,
      });
    }
  });

  // API Endpoint for Discord Deposit Request Notification
  app.post('/api/notify-deposit', async (req, res) => {
    try {
      const { depositorName, amount, product, email } = req.body;
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

      if (!discordWebhookUrl) {
        console.warn('DISCORD_WEBHOOK_URL is not set in .env');
        return res.json({ success: true, message: 'Webhook URL not configured' });
      }

      const payload = {
        embeds: [
          {
            title: '🔔 [Dethan 디든] 새로운 무통장 입금 확인 요청!',
            color: 0x5865f2,
            fields: [
              { name: '👤 입금자 성함', value: depositorName || '미입력', inline: true },
              { name: '💰 입금 금액', value: `${Number(amount).toLocaleString()}원`, inline: true },
              { name: '📦 신청 상품', value: product || '무제한 이용권', inline: false },
              { name: '📧 신청자 이메일/ID', value: email || '미입력', inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Dethan Pro 입금 알림',
            },
          },
        ],
      };

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`[Discord Notify] Deposit request from ${depositorName} (${amount}원) sent!`);
      return res.json({ success: true });
    } catch (error) {
      console.error('Discord notification failed:', error);
      return res.status(500).json({ error: 'Failed to send Discord notification' });
    }
  });

  // API Endpoint for Toss Payments Success
  app.get('/api/payments/success', async (req, res) => {
    const { paymentKey, orderId, amount } = req.query;

    if (!paymentKey || !orderId || !amount) {
      return res.redirect('/?payment_fail=true&message=' + encodeURIComponent('결제 승인 정보가 불충분합니다.'));
    }

    try {
      const secretKey = process.env.TOSS_SECRET_KEY || 'test_gck_docs_OaPz8L5KdmQXkzRz3y47BMw6';
      const basicAuthToken = Buffer.from(secretKey + ':').toString('base64');

      // Request payment confirm to Toss Payments
      const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: Number(amount),
        }),
      });

      const tossData: any = await tossResponse.json();

      if (!tossResponse.ok) {
        throw new Error(tossData.message || '토스 결제 승인 API 호출이 실패했습니다.');
      }

      // Extract userId from orderId (order_user_{userId}_{timestamp})
      const orderParts = (orderId as string).split('_');
      const userId = orderParts[2] || orderParts[1]; // Handles order_user_{uuid} or order_{uuid}

      if (!userId) {
        throw new Error('주문 정보에서 사용자 아이디를 식별할 수 없습니다.');
      }

      // Update profiles is_pro status to true
      const supabaseClient = getSupabaseClient();
      const { error: dbError } = await supabaseClient
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);

      if (dbError) {
        throw dbError;
      }

      console.log(`User ${userId} successfully upgraded to PRO!`);
      return res.redirect('/?payment_success=true');
    } catch (error: any) {
      console.error('Toss Confirmation Failed:', error);
      const errMsg = error.message || '결제 승인 처리 중 에러가 발생했습니다.';
      return res.redirect(`/?payment_fail=true&message=${encodeURIComponent(errMsg)}`);
    }
  });

  // Vite development vs production static setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
