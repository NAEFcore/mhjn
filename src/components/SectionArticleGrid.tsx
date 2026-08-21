import React from 'react';
import { Clock, Eye, MessageSquare, Bookmark, Sparkles, Share2 } from 'lucide-react';
import { Article } from '../types';

interface SectionArticleGridProps {
  title: string;
  subtitle?: string;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (articleId: string, e: React.MouseEvent) => void;
}

export const SectionArticleGrid: React.FC<SectionArticleGridProps> = ({
  title,
  subtitle,
  articles,
  onSelectArticle,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center my-6">
        <p className="text-base text-gray-500 font-medium">
          해당 조건의 기사가 없습니다. 다른 키워드나 카테고리를 선택해보세요.
        </p>
      </div>
    );
  }

  return (
    <section className="my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight font-serif-kr">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 font-semibold">
          총 {articles.length}건
        </span>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => {
          const isSaved = bookmarkedIds.has(article.id);

          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {article.badge && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-xs shadow-xs">
                        {article.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-black/60 text-white text-[11px] font-medium rounded-xs backdrop-blur-xs">
                      {article.categoryLabel}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => onToggleBookmark(article.id, e)}
                    title={isSaved ? '스크랩 해제' : '기사 스크랩'}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors ${
                      isSaved
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                    <span className="text-[#0051a8] font-bold">{article.subCategory || article.categoryLabel}</span>
                    <span>·</span>
                    <span>{article.reporter.name} 기자</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0051a8] font-headline line-clamp-2 leading-snug transition-colors mb-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {article.subtitle || article.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {article.publishedAt.split(' ')[0]}
                </span>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-gray-400" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <MessageSquare className="w-3 h-3" />
                    {article.commentsCount}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
