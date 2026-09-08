import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  slot?: string;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot = '1234567890',
  className = ''
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.debug('AdSense init error:', err);
    }
  }, []);

  return (
    <div className={`w-full my-6 p-2.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-slate-500 font-medium tracking-wider mb-1 uppercase">ADVERTISEMENT</span>
      <div className="w-full min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client="ca-pub-4403789108346139"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
