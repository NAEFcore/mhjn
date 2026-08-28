import React, { useState, useEffect } from 'react';
import { PopupConfig, PopupScopeTarget } from '../types';
import { X, ExternalLink } from 'lucide-react';

interface LayerPopupProps {
  config: PopupConfig;
  currentScope?: PopupScopeTarget;
  onClose?: () => void;
  forcePreview?: boolean;
}

export const LayerPopup: React.FC<LayerPopupProps> = ({ 
  config, 
  currentScope, 
  onClose,
  forcePreview = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [pathKey, setPathKey] = useState(() => 
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Listen to SPA location changes so popups re-evaluate their scope instantly on navigation
  useEffect(() => {
    const handleLocation = () => {
      if (typeof window !== 'undefined') {
        setPathKey(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleLocation);
    window.addEventListener('kculture:locationchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('kculture:locationchange', handleLocation);
    };
  }, []);

  useEffect(() => {
    if (!config) {
      setIsVisible(false);
      return;
    }

    if (forcePreview) {
      setIsVisible(true);
      return;
    }

    if (!config.enabled) {
      setIsVisible(false);
      return;
    }

    // Determine current active page scope accurately
    let activeScope: PopupScopeTarget = currentScope || 'main_home';
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/kcj-radio')) {
        activeScope = 'kcj_radio';
      } else if (path.startsWith('/sub-news')) {
        activeScope = path.includes('/article/') ? 'sub_detail' : 'sub_home';
      } else if (path.includes('/article/')) {
        activeScope = 'main_detail';
      } else {
        activeScope = 'main_home';
      }
    }

    // Check scope match: 'all' matches everything, otherwise exact match required
    const targetScope = config.pageScope || 'all';
    if (targetScope !== 'all' && activeScope) {
      if (targetScope !== activeScope) {
        setIsVisible(false);
        return;
      }
    }

    // Check 24-hour expiration in localStorage
    const storageKey = `kculture_popup_dismissed_${config.id}`;
    const dismissedAt = localStorage.getItem(storageKey);
    if (dismissedAt) {
      const parsedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (!isNaN(parsedTime) && now - parsedTime < twentyFourHours) {
        setIsVisible(false);
        return;
      }
    }

    setIsVisible(true);
  }, [config, currentScope, pathKey, forcePreview]);

  const handleClose = () => {
    if (dontShowToday) {
      const storageKey = `kculture_popup_dismissed_${config.id}`;
      localStorage.setItem(storageKey, Date.now().toString());
    }
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleDismissToday = () => {
    const storageKey = `kculture_popup_dismissed_${config.id}`;
    localStorage.setItem(storageKey, Date.now().toString());
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible || !config.enabled) {
    return null;
  }

  // Calculate position class (Responsive: centers on mobile screens and respects alignment on tablets/desktops)
  const getPositionClass = () => {
    switch (config.position) {
      case 'TOP_LEFT':
        return 'top-16 sm:top-10 left-3 sm:left-8 right-3 sm:right-auto';
      case 'BOTTOM_LEFT':
        return 'bottom-4 sm:bottom-8 left-3 sm:left-8 right-3 sm:right-auto';
      case 'BOTTOM_RIGHT':
        return 'bottom-4 sm:bottom-8 right-3 sm:right-8 left-3 sm:left-auto';
      case 'TOP_RIGHT':
      default:
        return 'top-16 sm:top-10 right-3 sm:right-8 left-3 sm:left-auto';
    }
  };

  const popupWidth = config.width || 340;

  return (
    <div
      id={`layer-popup-${config.id}`}
      style={{
        zIndex: config.zIndex || 9999,
        width: `${popupWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
      }}
      className={`fixed ${getPositionClass()} mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95`}
    >
      {/* Header bar with title and close button */}
      <div className="bg-[#1b2a47] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-bold font-serif-kr select-none">
        <span className="truncate pr-2">{config.name || '한국문화저널 특별 공지'}</span>
        <button
          onClick={handleClose}
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
          title="닫기"
          aria-label="팝업 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Popup Body */}
      <div className="p-3 bg-white flex flex-col space-y-2.5 max-h-[70vh] overflow-y-auto">
        {config.imageUrl && (
          <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {config.linkUrl ? (
              <a
                href={config.linkUrl}
                target={config.openNewTab !== false ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block group relative cursor-pointer"
              >
                <img
                  src={config.imageUrl}
                  alt={config.text || '팝업 이미지'}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[320px] transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                    <span>자세히 보기</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ) : (
              <img
                src={config.imageUrl}
                alt={config.text || '팝업 이미지'}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[320px]"
              />
            )}
          </div>
        )}

        {/* Text Content */}
        {config.text && (
          <div className="text-xs text-slate-800 font-serif-kr leading-relaxed px-1">
            {config.linkUrl && !config.imageUrl ? (
              <a
                href={config.linkUrl}
                target={config.openNewTab !== false ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="hover:underline text-[#1b2a47] font-medium flex items-center justify-between gap-1"
              >
                <span>{config.text}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              </a>
            ) : (
              <p className="whitespace-pre-line">{config.text}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Utility: "오늘 하루 이 창을 열지 않기" & "닫기" */}
      <div className="bg-[#f8f6f2] border-t border-slate-200 px-3.5 py-2.5 flex items-center justify-between text-[11px] text-slate-600 font-sans gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-900 py-1">
          <input
            type="checkbox"
            checked={dontShowToday}
            onChange={(e) => setDontShowToday(e.target.checked)}
            className="rounded border-slate-300 text-[#1b2a47] focus:ring-amber-500 w-4 h-4"
          />
          <span className="text-[11px]">오늘 하루 보지 않기</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismissToday}
            className="px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
          >
            오늘 그만보기
          </button>
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 bg-[#1b2a47] hover:bg-[#253960] text-white rounded-lg font-bold text-xs transition-colors shadow-2xs min-h-[32px] flex items-center justify-center"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
