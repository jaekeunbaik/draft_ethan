export interface CorrectionRequest {
  question: string;
  content: string;
  jobTitle: string;
  companyName?: string;
  tone?: 'professional' | 'confident' | 'modest' | 'logical';
  focusPoints?: string[];
  targetCharCount?: number | null;
}

export interface ScoreBreakdown {
  jobFit: number;
  readability: number;
  logic: number;
  specificity: number;
}

export interface LineDiff {
  original: string;
  corrected: string;
  reason: string;
}

export interface InterviewQuestion {
  question: string;
  interviewerIntent: string;
  modelAnswer: string;
  keyTip: string;
}

export interface CorrectionResponse {
  headline: string;
  correctedText: string;
  feedbacks: string[];
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendedKeywords: string[];
  lineByLineDiff: LineDiff[];
  interviewQuestions?: InterviewQuestion[];
  summaryComparison?: {
    beforeWordCount: number;
    afterWordCount: number;
    beforeCharCount: number;
    afterCharCount: number;
  };
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  request: CorrectionRequest;
  result: CorrectionResponse;
}

export interface SamplePreset {
  id: string;
  title: string;
  jobTitle: string;
  companyName: string;
  question: string;
  content: string;
}
