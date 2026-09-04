import React, { useEffect, useRef, useState } from 'react';

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
  const [sharedAdCode, setSharedAdCode] = useState<string | undefined>(adCode);

  // Advertisement settings are shared through the server API when a browser
  // does not already have a local ad setting. Article data is not touched.
  useEffect(() => {
    if (adCode && adCode.trim()) {
      setSharedAdCode(adCode);
      return;
    }

    let cancelled = false;
    fetch('/api/ads', { method: 'GET', cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Ad settings request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const code = data?.ads?.[slotName];
        if (typeof code === 'string' && code.trim()) {
          setSharedAdCode(code);
        }
      })
      .catch((err) => {
        console.warn('Failed to load shared ad settings:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [adCode, slotName]);

  useEffect(() => {
    if (!sharedAdCode || !sharedAdCode.trim() || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const temp = document.createElement('div');
    temp.innerHTML = sharedAdCode.trim();

    const externalScripts: HTMLScriptElement[] = [];
    const inlineScripts: HTMLScriptElement[] = [];

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === 'script') {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');

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

    externalScripts.forEach((script) => {
      container.appendChild(script);
    });

    inlineScripts.forEach((script) => {
      container.appendChild(script);
    });

    if (sharedAdCode.includes('adsbygoogle')) {
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

      triggerAdSense();
      const timer = setTimeout(triggerAdSense, 400);
      return () => clearTimeout(timer);
    }
  }, [sharedAdCode, slotName]);

  if (!sharedAdCode || !sharedAdCode.trim()) {
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
