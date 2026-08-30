import React from 'react';
import { X, Bookmark, Trash2, ChevronRight, Clock } from 'lucide-react';
import { Article } from '../types';

interface BookmarksModalProps {
  onClose: () => void;
  articles: Article[];
  bookmarkedIds: Set<string>;
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  onClose,
  articles,
  bookmarkedIds,
  onSelectArticle,
  onRemoveBookmark,
}) => {
  const savedArticles = articles.filter((a) => bookmarkedIds.has(a.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
                스크랩한 기사 보관함 ({savedArticles.length})
              </h2>
              <p className="text-xs text-gray-500">
                언제든 다시 읽고 싶은 한국문화저널의 깊이 있는 기사 목록입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-gray-100">
          {savedArticles.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">스크랩된 기사가 없습니다.</p>
              <p className="text-xs text-gray-400 mt-1">기사 본문 또는 목록에서 북마크 아이콘을 눌러 저장해보세요.</p>
            </div>
          ) : (
            savedArticles.map((art) => (
              <div
                key={art.id}
                className="py-3.5 flex items-start justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-[#0051a8] block mb-1">
                    [{art.categoryLabel}] {art.subCategory && `· ${art.subCategory}`}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#0051a8] line-clamp-1 leading-snug mb-1">
                    {art.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{art.reporter?.name || '편집국'} 기자</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.publishedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-12 object-cover rounded-md bg-gray-100"
                  />
                  <button
                    onClick={() => onRemoveBookmark(art.id)}
                    title="스크랩 삭제"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
