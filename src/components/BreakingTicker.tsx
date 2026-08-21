import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, Play, Pause } from 'lucide-react';
import { Article } from '../types';

interface BreakingTickerProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  articles,
  onSelectArticle,
}) => {
  const breakingList = articles.filter(a => a.isBreaking || a.badge === '속보' || a.isTopHeadline);
  const items = breakingList.length > 0 ? breakingList : articles.slice(0, 4);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const currentArticle = items[currentIndex];

  if (!currentArticle) return null;

  return (
    <div className="w-full bg-[#f0f4f9] border-b border-blue-100 py-2 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Flash Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white font-bold rounded-xs tracking-wider uppercase text-[11px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            속보
          </span>
          <span className="font-bold text-gray-800 hidden sm:inline">실시간 문화 브리핑</span>
        </div>

        {/* Dynamic Headline Text */}
        <div className="flex-1 overflow-hidden">
          <button
            onClick={() => onSelectArticle(currentArticle)}
            className="w-full text-left truncate text-gray-900 hover:text-[#0051a8] font-medium transition-colors flex items-center gap-2 group"
          >
            <span className="text-[#0051a8] font-bold shrink-0">[{currentArticle.categoryLabel}]</span>
            <span className="truncate group-hover:underline">{currentArticle.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0051a8] shrink-0" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 text-gray-500">
          <span className="text-[11px] font-semibold text-gray-600">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? '일시정지' : '재생'}
            className="p-1 hover:text-gray-900 rounded-sm hover:bg-gray-200 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
