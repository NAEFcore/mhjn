import React from 'react';
import { Clock, Eye, MessageSquare, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Article } from '../types';

interface MainNewsHeroProps {
  topArticle: Article;
  subArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const MainNewsHero: React.FC<MainNewsHeroProps> = ({
  topArticle,
  subArticles,
  onSelectArticle,
}) => {
  if (!topArticle) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#0051a8] rounded-xs" />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            주요뉴스 · <span className="text-[#0051a8]">헤드라인</span>
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          편집 데스크 엄선 {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 판
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Featured Top Article (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between group">
          <div 
            onClick={() => onSelectArticle(topArticle)}
            className="cursor-pointer"
          >
            {/* Image Container with Badge */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-lg overflow-hidden bg-gray-100 mb-4 shadow-xs">
              <img
                src={topArticle.imageUrl}
                alt={topArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {topArticle.badge && (
                  <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-sm shadow-md tracking-wider">
                    {topArticle.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold rounded-sm">
                  {topArticle.categoryLabel}
                </span>
              </div>
              {topArticle.sectionPage && (
                <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium rounded-sm">
                  {topArticle.sectionPage}
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-bold font-serif-kr text-gray-900 group-hover:text-[#0051a8] leading-snug tracking-tight transition-colors mb-2">
              {topArticle.title}
            </h3>

            {/* Subtitle / Summary */}
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
              {topArticle.subtitle || topArticle.summary}
            </p>
          </div>

          {/* Reporter & Metadata Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <img
                src={topArticle.reporter.avatar}
                alt={topArticle.reporter.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-gray-200"
              />
              <span className="font-semibold text-gray-800">{topArticle.reporter.name} 기자</span>
              <span className="text-gray-400">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {topArticle.publishedAt}
              </span>
            </div>

            <div className="flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1 text-gray-600">
                <Eye className="w-3.5 h-3.5" />
                {topArticle.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <MessageSquare className="w-3.5 h-3.5" />
                {topArticle.commentsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sub-Headlines List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-gray-100">
          {subArticles.slice(0, 4).map((art, idx) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="py-3.5 first:pt-0 last:pb-0 cursor-pointer group flex items-start justify-between gap-3 hover:bg-gray-50/80 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {art.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-xs ${
                      art.badge === '속보' ? 'bg-red-100 text-red-700' :
                      art.badge === '단독' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {art.badge}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#0051a8]">
                    {art.categoryLabel}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[11px] text-gray-400">{art.reporter.name} 기자</span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0051a8] line-clamp-2 leading-snug font-headline transition-colors">
                  {art.title}
                </h4>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <span>{art.publishedAt.split(' ')[1] || art.publishedAt}</span>
                  <span>·</span>
                  <span className="text-gray-500">댓글 {art.commentsCount}</span>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="w-20 h-16 sm:w-22 sm:h-17 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
