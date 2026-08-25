import React, { useState, useEffect } from 'react';
import { PopupConfig } from '../types';
import { X, ExternalLink } from 'lucide-react';

interface LayerPopupProps {
  config: PopupConfig;
  currentScope?: 'main_home' | 'main_detail' | 'sub_home' | 'sub_detail';
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

    // Determine current scope if not passed
    let activeScope = currentScope;
    if (!activeScope && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isSub = path.startsWith('/sub-news');
      const isDetail = path.includes('/article/');
      if (isSub) {
        activeScope = isDetail ? 'sub_detail' : 'sub_home';
      } else {
        activeScope = isDetail ? 'main_detail' : 'main_home';
      }
    }

    // Check scope match: 'all' matches everything, otherwise exact match
    if (config.pageScope && config.pageScope !== 'all' && activeScope) {
      if (config.pageScope !== activeScope) {
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
      if (now - parsedTime < twentyFourHours) {
        setIsVisible(false);
        return;
      }
    }

    setIsVisible(true);
  }, [config, currentScope, forcePreview]);

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

  // Calculate position class
  const getPositionClass = () => {
    switch (config.position) {
      case 'TOP_LEFT':
        return 'top-4 left-4 sm:top-8 sm:left-8';
      case 'BOTTOM_LEFT':
        return 'bottom-4 left-4 sm:bottom-8 sm:left-8';
      case 'BOTTOM_RIGHT':
        return 'bottom-4 right-4 sm:bottom-8 sm:right-8';
      case 'TOP_RIGHT':
      default:
        return 'top-4 right-4 sm:top-8 sm:right-8';
    }
  };

  return (
    <div
      id={`layer-popup-${config.id}`}
      style={{
        width: `${config.width || 340}px`,
        zIndex: config.zIndex || 9999,
      }}
      className={`fixed ${getPositionClass()} max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95`}
    >
      {/* Header bar with title and close button */}
      <div className="bg-[#1b2a47] text-white px-3.5 py-2 flex items-center justify-between text-xs font-bold font-serif-kr">
        <span className="truncate pr-2">{config.name || '한국문화저널 특별 공지'}</span>
        <button
          onClick={handleClose}
          className="text-slate-300 hover:text-white p-0.5 rounded transition-colors"
          title="닫기"
          aria-label="팝업 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Popup Body */}
      <div className="p-3 bg-white flex flex-col space-y-2.5">
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
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] px-2 py-1 rounded-full flex items-center gap-1 font-bold">
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
      <div className="bg-[#f8f6f2] border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[11px] text-slate-600 font-sans">
        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-900">
          <input
            type="checkbox"
            checked={dontShowToday}
            onChange={(e) => setDontShowToday(e.target.checked)}
            className="rounded border-slate-300 text-[#1b2a47] focus:ring-amber-500 w-3.5 h-3.5"
          />
          <span>오늘 하루 이 창을 열지 않기</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismissToday}
            className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
          >
            오늘 그만보기
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-1 bg-[#1b2a47] hover:bg-[#253960] text-white rounded-lg font-bold text-xs transition-colors shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
