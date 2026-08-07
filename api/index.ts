import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const envKeys = Object.keys(process.env).filter(k => k.toUpperCase().includes('GEMINI') || k.toUpperCase().includes('KEY') || k.startsWith('VITE_'));
    console.error('Available ENV keys:', envKeys);
    throw new Error(`GEMINI_API_KEY 환경변수가 설정되지 않았습니다. (감지된 관련 변수: ${envKeys.join(', ') || '없음'}). Vercel 대시보드에서 Redeploy(재배포)를 진행해 주세요.`);
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `당신은 대한민국 최고 수준의 채용 컨설턴트이자 자소서 전문 에디터입니다.
제출된 자기소개서를 희망 직무와 지원 기업의 핵심 역량에 완벽히 매칭되도록 가독성, 논리력, 두괄식 어법, 성과 표현을 대폭 다듬으세요.

지침:
1. 원문의 구체적인 에피소드와 경험 사실관계는 그대로 유지하고, 추상적인 문장 표현을 명확한 비즈니스 용어로 교정하세요.
2. 전체 교정본(correctedText)은 완결된 완성형 자기소개서 형태로 작성하세요.
3. 주요 문장/단락별 Before & After 비교(lineByLineDiff) 항목을 최소 3개 이상 작성하고, 수정 사유(reason)를 친절히 설명하세요.
4. 직무적합성, 가독성, 논리성, 구체성 평가 점수와 종합점수를 객관적으로 산출하세요.
5. 제출된 자소서를 읽은 깐깐한 대기업 면접관이 실제 면접에서 물어볼 법한 날카로운 꼬리 질문 3개(interviewQuestions)와 면접관 질문 의도(interviewerIntent), 사이다 모범 답안(modelAnswer), 답변 핵심 꿀팁(keyTip)을 필수로 생성하세요.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            correctedText: { type: Type.STRING },
            feedbacks: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallScore: { type: Type.INTEGER },
            scoreBreakdown: {
              type: Type.OBJECT,
              properties: {
                jobFit: { type: Type.INTEGER },
                readability: { type: Type.INTEGER },
                logic: { type: Type.INTEGER },
                specificity: { type: Type.INTEGER },
              },
              required: ['jobFit', 'readability', 'logic', 'specificity'],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            lineByLineDiff: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['original', 'corrected', 'reason'],
              },
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  interviewerIntent: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING },
                  keyTip: { type: Type.STRING },
                },
                required: ['question', 'interviewerIntent', 'modelAnswer', 'keyTip'],
              },
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
            'interviewQuestions',
          ],
        },
        temperature: 0.7,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini API로부터 응답을 받지 못했습니다.');
    }

    const parsedResult = JSON.parse(resultText);

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

    try {
      const supabaseClient = getSupabaseClient();
      await supabaseClient.from('usage_logs').insert([
        {
          job_title: jobTitle,
          character_count: content.length,
          is_pro: isPro === true || isPro === 'true',
        },
      ]);
    } catch (logErr) {
      console.warn('Logging to usage_logs failed:', logErr);
    }

    return res.json(parsedResult);
  } catch (error: any) {
    console.error('Gemini API Correction Error:', error);
    let errorMessage = error.message || '자소서 교정 처리 중 오류가 발생했습니다.';
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID') || error.status === 400) {
      errorMessage = 'Gemini API 키가 유효하지 않거나 비활성화되었습니다. Google AI Studio (https://aistudio.google.com/app/apikey)에서 발급받으신 "AIzaSy..."로 시작하는 정식 API 키를 Vercel GEMINI_API_KEY 환경변수에 입력해 주세요.';
    }
    return res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/notify-deposit', async (req, res) => {
  try {
    const { depositorName, amount, product, email } = req.body;
    const discordWebhookUrl =
      process.env.DISCORD_WEBHOOK_URL ||
      'https://discord.com/api/webhooks/1533471768809836638/Xs8S5bFfdT_8dVwguB8qSmyjaehnQ81wXuaKvUum_K4mUo3CcF_5NRMdPTXBfBFBZRgx';

    if (discordWebhookUrl) {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '🔔 새로운 무통장 입금 확인 요청!',
              color: 0x5865f2,
              fields: [
                { name: '👤 입금자 성함', value: depositorName || '미입력', inline: true },
                { name: '💰 입금 금액', value: `${Number(amount).toLocaleString()}원`, inline: true },
                { name: '📦 신청 상품', value: product || '무제한 이용권', inline: false },
                { name: '📧 신청자 이메일/ID', value: email || '미입력', inline: false },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: 'Draft Ethan Pro 입금 알림' },
            },
          ],
        }),
      });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default app;
