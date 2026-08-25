import React, { useEffect, useRef } from 'react';

interface DynamicAdBannerProps {
  adCode?: string;
  slotName: 'belowSubtitle' | 'inBody' | 'afterBody' | 'sidebarTop' | 'sidebarBottom';
  slotLabel?: string;
  className?: string;
}

export const DynamicAdBanner: React.FC<DynamicAdBannerProps> = ({
  adCode,
  slotName,
  slotLabel,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adCode || !adCode.trim() || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Create a temporary container to parse HTML and separate DOM elements and scripts
    const temp = document.createElement('div');
    temp.innerHTML = adCode.trim();

    const externalScripts: HTMLScriptElement[] = [];
    const inlineScripts: HTMLScriptElement[] = [];

    // Clone all non-script nodes and gather script nodes
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === 'script') {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');

        // Copy all attributes (src, async, crossOrigin, type, etc.)
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        if (oldScript.src) {
          externalScripts.push(newScript);
        } else {
          newScript.text = oldScript.innerHTML || oldScript.textContent || '';
          inlineScripts.push(newScript);
        }
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });

    // 1. Append external scripts first
    externalScripts.forEach((script) => {
      container.appendChild(script);
    });

    // 2. Append inline scripts next
    inlineScripts.forEach((script) => {
      container.appendChild(script);
    });

    // 3. Fallback support for Google AdSense push trigger
    if (adCode.includes('adsbygoogle')) {
      const triggerAdSense = () => {
        try {
          if (typeof window !== 'undefined') {
            const w = window as any;
            w.adsbygoogle = w.adsbygoogle || [];
            w.adsbygoogle.push({});
          }
        } catch (err) {
          // Ignored if AdSense queue is already processed or initialized
        }
      };

      // Attempt immediate push and delayed fallback
      triggerAdSense();
      const timer = setTimeout(triggerAdSense, 400);
      return () => clearTimeout(timer);
    }
  }, [adCode, slotName]);

  // If no ad code is configured or empty, do NOT render anything and prevent layout shifts
  if (!adCode || !adCode.trim()) {
    return null;
  }

  return (
    <div 
      className={`dynamic-ad-slot-wrapper my-4 w-full flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      data-ad-slot={slotName}
    >
      <div className="w-full flex items-center justify-between px-1 mb-1 text-[10px] text-slate-400 font-sans tracking-wide">
        <span className="bg-slate-100/90 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
          광고 (AD)
        </span>
        {slotLabel && (
          <span className="text-[10px] text-slate-400 opacity-80 hidden sm:inline font-sans">
            {slotLabel}
          </span>
        )}
      </div>
      <div 
        ref={containerRef} 
        className="w-full flex items-center justify-center min-h-[50px] bg-white/60 rounded-xl border border-slate-200/80 p-2 overflow-x-auto text-center shadow-2xs"
      />
    </div>
  );
};

