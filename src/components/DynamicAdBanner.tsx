import React, { useEffect, useRef, useState } from 'react';
import { fetchAdSettingsFromFirestore, saveAdSettingsToFirestore } from '../utils/adFirestore';

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
  const [sharedAdCode, setSharedAdCode] = useState<string>('');

  // Site-wide ad settings are read directly through the existing Firebase client SDK.
  // This avoids the Vercel /api/ads REST endpoint, which cannot authenticate to
  // Firestore with a Firebase API key alone.
  useEffect(() => {
    let cancelled = false;
    const loadSharedAd = async () => {
      try {
        let settings = await fetchAdSettingsFromFirestore();

        // One-time migration: if the shared document does not exist yet, seed it
        // from the current browser's saved ad settings. This lets the existing
        // Chrome configuration become the site-wide configuration for Edge/mobile.
        if (!settings && typeof window !== 'undefined') {
          try {
            const local = window.localStorage.getItem('kculture_ad_settings_v1');
            if (local) {
              const parsed = JSON.parse(local);
              if (parsed && typeof parsed === 'object') {
                settings = {
                  belowSubtitle: typeof parsed.belowSubtitle === 'string' ? parsed.belowSubtitle : '',
                  inBody: typeof parsed.inBody === 'string' ? parsed.inBody : '',
                  afterBody: typeof parsed.afterBody === 'string' ? parsed.afterBody : '',
                  sidebarTop: typeof parsed.sidebarTop === 'string' ? parsed.sidebarTop : '',
                  sidebarBottom: typeof parsed.sidebarBottom === 'string' ? parsed.sidebarBottom : '',
                  radioSidebar: typeof parsed.radioSidebar === 'string' ? parsed.radioSidebar : '',
                  belowSubtitleEnabled: parsed.belowSubtitleEnabled !== false,
                };
                await saveAdSettingsToFirestore(settings);
              }
            }
          } catch {
            // Keep the page usable if migration fails.
          }
        }

        const code = settings?.[slotName];
        if (!cancelled && typeof code === 'string') {
          setSharedAdCode(code);
        }
      } catch {
        // Keep local/default behavior if shared Firestore settings are unavailable.
      }
    };
    loadSharedAd();
    return () => { cancelled = true; };
  }, [slotName]);

  const effectiveAdCode = (adCode && adCode.trim()) ? adCode : sharedAdCode;

  useEffect(() => {
    if (!effectiveAdCode || !effectiveAdCode.trim() || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const temp = document.createElement('div');
    temp.innerHTML = effectiveAdCode.trim();

    // Google AdSense requires its loader to exist on the page before an
    // <ins class="adsbygoogle"> slot is pushed. Add it once per page.
    const adElement = temp.querySelector('.adsbygoogle') as HTMLElement | null;
    const clientId = adElement?.getAttribute('data-ad-client') || '';
    if (clientId) {
      const existingLoader = document.querySelector('script[data-kcj-adsense-loader="true"]');
      if (!existingLoader) {
        const loader = document.createElement('script');
        loader.async = true;
        loader.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
        loader.crossOrigin = 'anonymous';
        loader.setAttribute('data-kcj-adsense-loader', 'true');
        document.head.appendChild(loader);
      }
    }

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

    externalScripts.forEach((script) => container.appendChild(script));
    inlineScripts.forEach((script) => container.appendChild(script));

    if (effectiveAdCode.includes('adsbygoogle')) {
      const triggerAdSense = () => {
        try {
          const w = window as any;
          w.adsbygoogle = w.adsbygoogle || [];
          w.adsbygoogle.push({});
        } catch {
          // AdSense may already have processed this slot.
        }
      };

      const timer = window.setTimeout(triggerAdSense, 250);
      return () => window.clearTimeout(timer);
    }
  }, [effectiveAdCode, slotName]);

  if (!effectiveAdCode || !effectiveAdCode.trim()) {
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
