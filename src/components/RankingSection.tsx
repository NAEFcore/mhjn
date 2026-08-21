import React, { useState } from 'react';
import { TrendingUp, MessageSquare, ThumbsUp, ChevronRight, Flame } from 'lucide-react';
import { Article } from '../types';

interface RankingSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

type TabType = 'views' | 'comments' | 'reactions';
type AgeFilter = 'all' | 'young' | 'senior';

export const RankingSection: React.FC<RankingSectionProps> = ({
  articles,
  onSelectArticle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('views');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');

  // Sorted list based on active tab
  const sortedArticles = [...articles].sort((a, b) => {
    if (activeTab === 'views') {
      return b.views - a.views;
    } else if (activeTab === 'comments') {
      return b.commentsCount - a.commentsCount;
    } else {
      const totalA = a.reactions.info + a.reactions.exciting + a.reactions.empathy + a.reactions.analysis;
      const totalB = b.reactions.info + b.reactions.exciting + b.reactions.empathy + b.reactions.analysis;
      return totalB - totalA;
    }
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
      {/* Title & Live indicator */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500 fill-red-500" />
          <h3 className="font-bold text-gray-900 text-base">
            실시간 랭킹 뉴스
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">
          실시간 집계중
        </span>
      </div>

      {/* Tabs: Views, Comments, Reactions */}
      <div className="flex items-center justify-between gap-1 mb-3 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('views')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'views'
              ? 'bg-white text-[#0051a8] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          많이 본 뉴스
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'comments'
              ? 'bg-white text-[#0051a8] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          댓글 많은 뉴스
        </button>
        <button
          onClick={() => setActiveTab('reactions')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'reactions'
              ? 'bg-white text-[#0051a8] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          추천 많은 뉴스
        </button>
      </div>

      {/* Age demographic filter */}
      <div className="flex items-center gap-1.5 mb-3 text-[11px] text-gray-500">
        <span className="font-medium text-gray-700">연령별:</span>
        <button
          onClick={() => setAgeFilter('all')}
          className={`px-2 py-0.5 rounded-full ${
            ageFilter === 'all' ? 'bg-[#0051a8] text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setAgeFilter('young')}
          className={`px-2 py-0.5 rounded-full ${
            ageFilter === 'young' ? 'bg-[#0051a8] text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          20·30대
        </button>
        <button
          onClick={() => setAgeFilter('senior')}
          className={`px-2 py-0.5 rounded-full ${
            ageFilter === 'senior' ? 'bg-[#0051a8] text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          40·50대+
        </button>
      </div>

      {/* Ranking List (1~6 Items) */}
      <ol className="divide-y divide-gray-100">
        {sortedArticles.slice(0, 6).map((art, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          return (
            <li
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="py-2.5 flex items-start gap-3 cursor-pointer group hover:bg-blue-50/50 -mx-2 px-2 rounded-lg transition-colors"
            >
              {/* Rank Number */}
              <span
                className={`w-5 text-center text-sm font-black shrink-0 ${
                  isTop3 ? 'text-[#0051a8]' : 'text-gray-400'
                }`}
              >
                {rank}
              </span>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#0051a8] line-clamp-2 leading-snug transition-colors">
                  {art.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                  <span className="text-gray-600 font-medium">{art.categoryLabel}</span>
                  <span>·</span>
                  {activeTab === 'views' && <span>조회 {art.views.toLocaleString()}</span>}
                  {activeTab === 'comments' && <span>댓글 {art.commentsCount}개</span>}
                  {activeTab === 'reactions' && (
                    <span>공감 {(art.reactions.empathy + art.reactions.info).toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Mini thumbnail if top 3 */}
              {isTop3 && (
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-10 object-cover rounded-sm bg-gray-100 shrink-0 border border-gray-100"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
