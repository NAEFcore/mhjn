import React, { useEffect, useRef } from 'react';

interface DynamicAdBannerProps {
  adCode?: string;
  slotName: 'belowSubtitle' | 'inBody' | 'afterBody' | 'sidebarTop' | 'sidebarBottom';
  className?: string;
}

export const DynamicAdBanner: React.FC<DynamicAdBannerProps> = ({
  adCode,
  slotName,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adCode || !adCode.trim() || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Create a temporary container to parse HTML and scripts
    const temp = document.createElement('div');
    temp.innerHTML = adCode;

    // Append standard elements
    const scriptsToExecute: HTMLScriptElement[] = [];

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === 'script') {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');
        
        // Copy all attributes (src, async, crossOrigin, etc.)
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Copy inline script text if any
        if (oldScript.innerHTML) {
          newScript.text = oldScript.innerHTML;
        }

        scriptsToExecute.push(newScript);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Execute scripts sequentially
    scriptsToExecute.forEach((script) => {
      container.appendChild(script);
    });

    // Support Google AdSense (adsbygoogle push)
    try {
      if (window && (window as any).adsbygoogle && adCode.includes('adsbygoogle')) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignored for environments where AdSense script hasn't loaded yet
    }
  }, [adCode]);

  // If no ad code is configured, do not occupy space or break layout
  if (!adCode || !adCode.trim()) {
    return null;
  }

  // Visual framing for live dynamic ads
  return (
    <div 
      className={`dynamic-ad-container my-4 w-full flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      data-ad-slot={slotName}
    >
      <div className="w-full flex items-center justify-between px-1 mb-1 text-[10px] text-gray-400 font-sans tracking-wide">
        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold border border-gray-200">
          광고 (AD)
        </span>
        <span className="opacity-70">Sponsored Content</span>
      </div>
      <div 
        ref={containerRef} 
        className="w-full flex items-center justify-center min-h-[50px] bg-gray-50/50 rounded-lg border border-dashed border-gray-300 p-2 overflow-x-auto text-center"
      />
    </div>
  );
};
