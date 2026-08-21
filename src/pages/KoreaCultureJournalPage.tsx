import React, { useState } from 'react';
import { Header } from '../components/Header';
import { BreakingTicker } from '../components/BreakingTicker';
import { MainNewsHero } from '../components/MainNewsHero';
import { RankingSection } from '../components/RankingSection';
import { IssueClustering } from '../components/IssueClustering';
import { CultureCalendarRadar } from '../components/CultureCalendarRadar';
import { SectionArticleGrid } from '../components/SectionArticleGrid';
import { PaperEditionView } from '../components/PaperEditionView';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { CultureCalendarModal } from '../components/CultureCalendarModal';
import { ReportersDeskModal } from '../components/ReportersDeskModal';
import { AiNewsGeneratorModal } from '../components/AiNewsGeneratorModal';
import { BookmarksModal } from '../components/BookmarksModal';
import { Footer } from '../components/Footer';

import { INITIAL_ARTICLES, CATEGORY_TABS } from '../data/mockNews';
import { Article, CategoryId, Reporter } from '../types';

export const KoreaCultureJournalPage: React.FC = () => {
  // Articles state
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // Selected Article for Detail Modal
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Press Subscription State
  const [isPressSubscribed, setIsPressSubscribed] = useState(false);
  const [subscribedReporters, setSubscribedReporters] = useState<Set<string>>(new Set(['park_cw']));

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['art-001']));

  // Modals
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showReportersModal, setShowReportersModal] = useState(false);
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  // Toggle Bookmark
  const handleToggleBookmark = (articleId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  };

  // Toggle Reporter Subscription
  const handleToggleSubscribeReporter = (id: string) => {
    setSubscribedReporters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Publish New AI Generated Article
  const handlePublishNewArticle = (newArt: Article) => {
    setArticles([newArt, ...articles]);
    setSelectedArticle(newArt);
  };

  // Filtered Articles Logic
  const filteredArticles = articles.filter((art) => {
    if (activeCategory !== 'all' && activeCategory !== 'paper_edition' && art.category !== activeCategory) {
      return false;
    }
    if (selectedKeyword) {
      const kwClean = selectedKeyword.replace(/^#/, '');
      const matchTag = art.tags.some((t) => t.toLowerCase().includes(kwClean.toLowerCase()));
      const matchTitle = art.title.toLowerCase().includes(kwClean.toLowerCase());
      if (!matchTag && !matchTitle) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        art.title.toLowerCase().includes(q) ||
        (art.subtitle && art.subtitle.toLowerCase().includes(q)) ||
        art.content.toLowerCase().includes(q) ||
        art.reporter.name.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const topHeroArticle = articles.find((a) => a.isTopHeadline) || articles[0];
  const subHeroArticles = articles.filter((a) => a.id !== topHeroArticle?.id).slice(0, 4);

  const activeCategoryInfo = CATEGORY_TABS.find((t) => t.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col selection:bg-[#0051a8] selection:text-white">
      {/* 1. Header (Naver Press 009 Channel Structure) */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedKeyword(null);
        }}
        isSubscribed={isPressSubscribed}
        onToggleSubscribe={() => setIsPressSubscribed(!isPressSubscribed)}
        bookmarkCount={bookmarkedIds.size}
        onOpenBookmarks={() => setShowBookmarksModal(true)}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onOpenReporters={() => setShowReportersModal(true)}
        onOpenAiGenerator={() => setShowAiGenModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectKeyword={(kw) => {
          setSelectedKeyword(kw);
          setActiveCategory('all');
        }}
      />

      {/* 2. Breaking News Flash Ticker */}
      <BreakingTicker
        articles={articles}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5">
        {/* Active Keyword / Search Filter Banner */}
        {(selectedKeyword || searchQuery) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="font-bold">검색 필터 적용중:</span>
              {selectedKeyword && (
                <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full font-bold">
                  {selectedKeyword}
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-gray-800 text-white rounded-full font-semibold">
                  "{searchQuery}"
                </span>
              )}
              <span className="text-gray-500 font-medium">({filteredArticles.length}건 검색됨)</span>
            </div>
            <button
              onClick={() => {
                setSelectedKeyword(null);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* View Mode 1: Newspaper Print Edition Viewer */}
        {activeCategory === 'paper_edition' ? (
          <PaperEditionView
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        ) : activeCategory === 'all' && !searchQuery && !selectedKeyword ? (
          /* View Mode 2: Main Editorial Press Home (Naver Press 009 Style) */
          <div className="space-y-8">
            {/* Top Headline Hero Grid */}
            <MainNewsHero
              topArticle={topHeroArticle}
              subArticles={subHeroArticles}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />

            {/* Middle 2-Column: Left (News Feed) & Right (Rankings, Issues, Culture Radar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (8 Cols): Section Highlights & In-Depth Stories */}
              <div className="lg:col-span-8 space-y-8">
                {/* Cultural Arts Highlights */}
                <SectionArticleGrid
                  title="문화·예술 기획"
                  subtitle="미술관 특별전, 거장 인터뷰, 클래식과 전통 공연의 현장"
                  articles={articles.filter((a) => a.category === 'culture_art')}
                  onSelectArticle={(art) => setSelectedArticle(art)}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                />

                {/* Heritage & Tradition Section */}
                <SectionArticleGrid
                  title="전통과 유산 (K-헤리티지)"
                  subtitle="천년의 숨결, 무형문화재 명장과 국가유산 심층 보도"
                  articles={articles.filter((a) => a.category === 'heritage')}
                  onSelectArticle={(art) => setSelectedArticle(art)}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                />

                {/* K-Culture & Pop Story */}
                <SectionArticleGrid
                  title="K-컬처 & 라이프스타일"
                  subtitle="세계인을 사로잡은 한복, 한식, K-콘텐츠의 인문학적 탐구"
                  articles={articles.filter((a) => a.category === 'k_culture')}
                  onSelectArticle={(art) => setSelectedArticle(art)}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                />
              </div>

              {/* Right Column (4 Cols): Sidebar Widgets */}
              <aside className="lg:col-span-4 space-y-6">
                {/* 1. Real-time Rankings */}
                <RankingSection
                  articles={articles}
                  onSelectArticle={(art) => setSelectedArticle(art)}
                />

                {/* 2. Issue Clustering (심층 묶음 뉴스) */}
                <IssueClustering
                  onSelectKeyword={(kw) => {
                    setSelectedKeyword(kw);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* 3. Culture Radar (Exhibitions & Palace Openings) */}
                <CultureCalendarRadar
                  onOpenFullCalendar={() => setShowCalendarModal(true)}
                />
              </aside>
            </div>
          </div>
        ) : (
          /* View Mode 3: Specific Category Grid */
          <div className="space-y-6">
            <SectionArticleGrid
              title={activeCategoryInfo?.label || '기사 목록'}
              subtitle={activeCategoryInfo?.subcategories?.join(' · ')}
              articles={filteredArticles}
              onSelectArticle={(art) => setSelectedArticle(art)}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Modals & Popups */}
      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectRelatedArticle={(art) => setSelectedArticle(art)}
          isBookmarked={bookmarkedIds.has(selectedArticle.id)}
          onToggleBookmark={() => handleToggleBookmark(selectedArticle.id)}
        />
      )}

      {/* Culture Calendar Modal */}
      {showCalendarModal && (
        <CultureCalendarModal
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* Reporters Desk Modal */}
      {showReportersModal && (
        <ReportersDeskModal
          onClose={() => setShowReportersModal(false)}
          subscribedReporters={subscribedReporters}
          onToggleSubscribeReporter={handleToggleSubscribeReporter}
        />
      )}

      {/* AI News Scoop Generator Modal */}
      {showAiGenModal && (
        <AiNewsGeneratorModal
          onClose={() => setShowAiGenModal(false)}
          onPublishArticle={handlePublishNewArticle}
        />
      )}

      {/* Bookmarks / Scrap Modal */}
      {showBookmarksModal && (
        <BookmarksModal
          onClose={() => setShowBookmarksModal(false)}
          articles={articles}
          bookmarkedIds={bookmarkedIds}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onRemoveBookmark={(id) => handleToggleBookmark(id)}
        />
      )}
    </div>
  );
};
