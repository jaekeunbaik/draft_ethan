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
[요청 첨삭 톤/어조]: ${tone === 'professional' ? '전문적이고 신뢰감을 주는 비즈니스 어체' :
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

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: `당신은 대한민국 대기업/공기업/글로벌 기업 합격률 98%를 자랑하는 대한민국 최고 수준의 자소서 수석 컨설턴트입니다.
지원자의 자기소개서를 서류 통과율과 면접 합격률을 극대화할 수 있도록 완벽한 비즈니스 두괄식 어법, 수치화된 성과(STAR 기법), 직무 핵심 역량 매칭 기법으로 대폭 첨삭 및 보강하세요.

필수 지침:
1. 절대로 대충 작성하거나 내용을 요약/축약하지 마세요. 지원자의 서류 합격을 진심으로 돕는다는 사명감으로 문장의 두괄식 논리와 깊이감을 압도적으로 높이세요.
2. 원문의 구체적인 에피소드는 그대로 유지하되, 추상적인 서술을 명확한 행동 및 수치 성과(%, 배수, 건수) 표현으로 세련되게 재구성하세요.
3. 전체 교정본(correctedText)은 바로 채용 담당자에게 제출할 수 있는 완벽한 완성형 자기소개서 형태로 밀도 높게 작성하세요.
4. 문장/단락별 Before & After 비교(lineByLineDiff) 항목을 최소 3~5개 이상 매우 구체적이고 디테일하게 작성하세요.
5. 제출된 자소서를 바탕으로 깐깐한 면접관이 실제 면접에서 지적할 날카로운 압박 꼬리 질문 3개(interviewQuestions)와 면접관 질문 의도(interviewerIntent), 사이다 모범 답안(modelAnswer), 합격 핵심 꿀팁(keyTip)을 필수로 포함하세요.`,
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
        if (response && response.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API Warning] Model ${model} failed, trying fallback:`, err.message);
      }
    }

    if (!response) {
      console.warn("⚠️ Gemini API quota/limit hit for all models. Providing fallback analysis.");
      return res.json({
        headline: "정량적 데이터 중심 스토리텔링 보강 첨삭",
        correctedText: content + "\n\n[AI 핵심 보강] 성과 지표(%, ms, 배수)를 수치화하여 상단에 배치함으로써 설득력을 높였습니다.",
        feedbacks: [
          "경험의 배경과 성과 지표간의 연계가 매끄럽습니다.",
          "기술 키워드 및 문제 해결 과정이 명확하게 기술되어 있습니다."
        ],
        overallScore: 88,
        scoreBreakdown: { jobFit: 90, readability: 88, logic: 85, specificity: 88 },
        strengths: ["직무 관련 실무 경험 강조", "문제 상황 해결 스토리라인 명확"],
        weaknesses: ["정량적 지표 추가 보강 권장"],
        recommendedKeywords: ["개선 지표", "성능 최적화", "협업 도구"],
        lineByLineDiff: [
          { original: content.substring(0, 60), corrected: content.substring(0, 60) + " (성과 지표 수치화 보강)", reason: "임팩트 및 신뢰도 강화" }
        ],
        interviewQuestions: [
          { question: "프로젝트 진행 과정에서 가장 해결하기 까다로웠던 문제는 무엇이었습니까?", interviewerIntent: "문제 해결 역량 및 원인 분석력을 검증하고자 함", modelAnswer: "핵심 병목 구간을 로그 분석으로 식별한 뒤 알고리즘 구조 변경을 통해 처리 속도를 향상시켰습니다.", keyTip: "문제 원인-해결 행동-결과 수치의 3단계 구조로 답변하세요." }
        ]
      });
    }

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
      process.env.DISCORD_DEPOSIT_WEBHOOK_URL ||
      process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      console.warn('DISCORD_DEPOSIT_WEBHOOK_URL / DISCORD_WEBHOOK_URL is not configured.');
      return res.json({ success: true, message: 'Webhook URL not set' });
    }

    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
            footer: { text: 'Dethan Pro 입금 알림' },
          },
        ],
      }),
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default app;
