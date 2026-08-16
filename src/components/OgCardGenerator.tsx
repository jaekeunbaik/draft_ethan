import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { ScoreBreakdown } from '../types';

interface OgCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  overallScore: number;
  headline: string;
  jobTitle: string;
  companyName?: string;
  scoreBreakdown: ScoreBreakdown;
}

export const OgCardGenerator: React.FC<OgCardGeneratorProps> = ({
  isOpen,
  onClose,
  overallScore,
  headline,
  jobTitle,
  companyName,
  scoreBreakdown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', label: '매우 우수', color: '#10b981' };
    if (score >= 80) return { grade: 'A', label: '우수', color: '#6366f1' };
    if (score >= 70) return { grade: 'B', label: '양호', color: '#f59e0b' };
    return { grade: 'C', label: '보완 필요', color: '#ef4444' };
  };

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 (OG 이미지 표준 1200x630)
    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // 1. 배경 그라데이션 (다크 프리미엄)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.4, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. 배경 장식 원 (글로우 효과)
    ctx.save();
    ctx.globalAlpha = 0.08;
    const glowGrad1 = ctx.createRadialGradient(900, 100, 10, 900, 100, 300);
    glowGrad1.addColorStop(0, '#818cf8');
    glowGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad1;
    ctx.fillRect(600, -200, 600, 600);

    const glowGrad2 = ctx.createRadialGradient(200, 500, 10, 200, 500, 250);
    glowGrad2.addColorStop(0, '#6366f1');
    glowGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad2;
    ctx.fillRect(-50, 250, 500, 500);
    ctx.restore();

    // 3. 상단 Dethan 브랜딩
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 20px "Inter", "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✨ Dethan (디든) AI 자소서 첨삭 리포트', 60, 55);

    // 4. 직무 태그
    ctx.save();
    const tagText = jobTitle + (companyName ? ` · ${companyName}` : '');
    ctx.font = 'bold 22px "Inter", "Pretendard", sans-serif';
    const tagWidth = ctx.measureText(tagText).width + 40;
    // Tag pill background
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.beginPath();
    const tagX = 60;
    const tagY = 75;
    const tagH = 38;
    const tagR = 19;
    ctx.moveTo(tagX + tagR, tagY);
    ctx.lineTo(tagX + tagWidth - tagR, tagY);
    ctx.arcTo(tagX + tagWidth, tagY, tagX + tagWidth, tagY + tagR, tagR);
    ctx.arcTo(tagX + tagWidth, tagY + tagH, tagX + tagWidth - tagR, tagY + tagH, tagR);
    ctx.lineTo(tagX + tagR, tagY + tagH);
    ctx.arcTo(tagX, tagY + tagH, tagX, tagY + tagH - tagR, tagR);
    ctx.arcTo(tagX, tagY, tagX + tagR, tagY, tagR);
    ctx.closePath();
    ctx.fill();
    // Tag border
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Tag text
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 20px "Inter", "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(tagText, tagX + 20, tagY + 26);
    ctx.restore();

    // 5. 헤드라인 (중앙 메인)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    // 긴 텍스트 줄바꿈 처리
    const maxLineWidth = 680;
    const headlineChars = headline.split('');
    let currentLine = '';
    const headlineLines: string[] = [];
    for (const char of headlineChars) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxLineWidth && currentLine.length > 0) {
        headlineLines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) headlineLines.push(currentLine);

    const headlineStartY = 160;
    headlineLines.slice(0, 3).forEach((line, i) => {
      const isLast = i === headlineLines.length - 1 || i === 2;
      const displayLine = i === 2 && headlineLines.length > 3 ? line.slice(0, -3) + '...' : line;
      const prefix = i === 0 ? '"' : '';
      const suffix = isLast ? '"' : '';
      ctx.fillText(`${prefix}${displayLine}${suffix}`, 60, headlineStartY + i * 48);
    });

    // 6. 점수 원형 게이지 (우측)
    const { grade, label, color } = getGrade(overallScore);
    const cx = 1000;
    const cy = 200;
    const radius = 110;

    // 게이지 배경
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // 게이지 채움
    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * overallScore) / 100;
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 점수 숫자
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Inter", "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(overallScore), cx, cy - 8);

    // 등급 표시
    ctx.fillStyle = color;
    ctx.font = 'bold 24px "Inter", "Pretendard", sans-serif';
    ctx.fillText(`${grade}등급 (${label})`, cx, cy + 50);

    // "점" 라벨
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '18px "Inter", "Pretendard", sans-serif';
    ctx.fillText('/ 100점', cx, cy + 80);

    ctx.textBaseline = 'alphabetic';

    // 7. 세부 점수 바 (좌측 하단)
    const breakdownItems = [
      { label: '직무 적합성', value: scoreBreakdown.jobFit },
      { label: '가독성·어휘력', value: scoreBreakdown.readability },
      { label: '논리성·구조', value: scoreBreakdown.logic },
      { label: '구체성·성과', value: scoreBreakdown.specificity },
    ];

    const barStartX = 60;
    const barStartY = 380;
    const barWidth = 240;
    const barHeight = 10;
    const barGap = 70;

    breakdownItems.forEach((item, i) => {
      const x = barStartX + (i % 2) * (barWidth + 140);
      const y = barStartY + Math.floor(i / 2) * barGap;

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '18px "Inter", "Pretendard", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x, y);

      // Score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", "Pretendard", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.value}점`, x + barWidth, y);

      // Bar background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y + 10, barWidth, barHeight, 5);
      ctx.fill();

      // Bar fill
      const fillGrad = ctx.createLinearGradient(x, 0, x + barWidth, 0);
      fillGrad.addColorStop(0, '#6366f1');
      fillGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.roundRect(x, y + 10, (barWidth * item.value) / 100, barHeight, 5);
      ctx.fill();
    });

    // 8. 우측 하단 미니 원형 게이지
    const miniStartX = 820;
    const miniStartY = 395;
    const miniGap = 75;
    const miniRadius = 22;

    breakdownItems.forEach((item, i) => {
      const mx = miniStartX + (i % 2) * 170;
      const my = miniStartY + Math.floor(i / 2) * miniGap;

      // 미니 원형 배경
      ctx.beginPath();
      ctx.arc(mx, my, miniRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 미니 원형 채움
      ctx.beginPath();
      ctx.arc(mx, my, miniRadius, startAngle, startAngle + (Math.PI * 2 * item.value) / 100);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 숫자
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Inter", "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(item.value), mx, my);
      ctx.textBaseline = 'alphabetic';

      // 라벨
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px "Inter", "Pretendard", sans-serif';
      ctx.fillText(item.label, mx + 55, my + 5);
    });

    // 9. 하단 CTA 바
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, H - 65, W, 65);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 65);
    ctx.lineTo(W, H - 65);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '16px "Inter", "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('draft-ethan.vercel.app  ·  막히는 초안부터 직무 맞춤 첨삭까지, AI 자소서 팩폭 검수', W / 2, H - 28);

    setIsRendered(true);
  }, [isOpen, overallScore, headline, jobTitle, companyName, scoreBreakdown]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Dethan_첨삭결과_${jobTitle.replace(/\s+/g, '_')}_${overallScore}점.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleKakaoShare = () => {
    const { grade } = getGrade(overallScore);
    const shareTitle = `🎯 [Dethan 디든] ${jobTitle} 첨삭 결과: ${overallScore}점 (${grade}등급)!`;
    const shareDesc = `💡 "${headline}"\n📊 직무 적합성: ${scoreBreakdown.jobFit}점 · 가독성: ${scoreBreakdown.readability}점 · 논리성: ${scoreBreakdown.logic}점 · 구체성: ${scoreBreakdown.specificity}점`;
    const shareUrl = 'https://draft-ethan.vercel.app';

    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const kakao = (window as any).Kakao;
      if (!kakao.isInitialized()) {
        try {
          kakao.init(import.meta.env.VITE_KAKAO_APP_KEY || '41eea8dec5f5c9fdd7723e9386e0aa78');
        } catch (e) {
          console.warn('Kakao init fallback:', e);
        }
      }
      if (kakao.Share) {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: shareTitle,
            description: shareDesc,
            imageUrl: 'https://draft-ethan.vercel.app/og-image.png',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '📝 나도 AI 자소서 첨삭 받기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
        return;
      }
    }

    // 카카오 SDK 없을 경우 클립보드 복사
    const fallbackText = `${shareTitle}\n${shareDesc}\n👉 ${shareUrl}`;
    navigator.clipboard.writeText(fallbackText);
    alert('📋 공유 문구가 클립보드에 복사되었습니다! 카카오톡/SNS에 붙여넣기 하세요.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <span>📸</span>
              <span>첨삭 결과 점수 카드</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              SNS에 공유하거나 이미지로 저장하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="p-5">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-gray-900">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ aspectRatio: '1200/630' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>📥 이미지 저장 (PNG)</span>
          </button>

          <button
            onClick={handleKakaoShare}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-extrabold text-sm shadow-lg border border-yellow-400 transition active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-[#191919]" viewBox="0 0 24 24">
              <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.92 1.92 5.48 4.8 6.92-.12.44-.8 2.88-.84 3.08-.04.2.08.28.24.16.12-.08 2.04-1.4 2.88-1.96.96.24 2 .36 2.92.36 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span>💛 카카오톡으로 공유</span>
          </button>
        </div>

        {/* Tip */}
        <div className="px-5 pb-5">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 flex items-start gap-2">
            <Share2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>💡 Tip:</strong> 저장한 이미지를 인스타그램 스토리, 스레드, 에브리타임에 공유하면 친구들의 반응을 받을 수 있어요!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
