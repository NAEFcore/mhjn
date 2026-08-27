import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { BreakingTicker } from '../components/BreakingTicker';
import { MainNewsHero } from '../components/MainNewsHero';
import { EditorialSectionBanner } from '../components/EditorialSectionBanner';
import { RankingSection } from '../components/RankingSection';
import { OpinionSidebarSection } from '../components/OpinionSidebarSection';
import { IssueClustering } from '../components/IssueClustering';
import { CultureCalendarRadar } from '../components/CultureCalendarRadar';
import { SectionArticleGrid } from '../components/SectionArticleGrid';
import { PaperEditionView } from '../components/PaperEditionView';
import { CultureCalendarModal } from '../components/CultureCalendarModal';
import { ReportersDeskModal } from '../components/ReportersDeskModal';
import { AiNewsGeneratorModal } from '../components/AiNewsGeneratorModal';
import { BookmarksModal } from '../components/BookmarksModal';
import { FactCheckModal } from '../components/FactCheckModal';
import { EditorialColumnModal } from '../components/EditorialColumnModal';
import { OmbudsmanModal } from '../components/OmbudsmanModal';
import { WpXmlConverterModal } from '../components/WpXmlConverterModal';
import { NewsTipModal } from '../components/NewsTipModal';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { ArticleDetailPage } from './ArticleDetailPage';
import { UnSdgPage } from './UnSdgPage';
import { Footer } from '../components/Footer';

import { CATEGORY_TABS } from '../data/mockNews';
import { Article, CategoryId, Reporter, CulturalEvent, AuthUser, Language, AdSettings, IssueCluster } from '../types';
import { loadPersistedIssueClusters } from '../utils/storage';
import { fetchArticleByIdFromFirestore } from '../firebase';


interface KoreaCultureJournalPageProps {
  articles: Article[];
  onUpdateArticles: (arts: Article[]) => void;
  reporters: Reporter[];
  onUpdateReporters: (reps: Reporter[]) => void;
  events: CulturalEvent[];
  onUpdateEvents: (evts: CulturalEvent[]) => void;
  activeCategoryProp?: string;
  onChangeCategory?: (cat: string) => void;
  currentUser: AuthUser | null;
  onOpenAdminDesk?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  initialArticleId?: string | null;
  adSettings?: AdSettings;
  onGoToRadio?: (articleId?: string, lang?: Language) => void;
}

export const KoreaCultureJournalPage: React.FC<KoreaCultureJournalPageProps> = ({
  articles,
  onUpdateArticles,
  reporters,
  onUpdateReporters,
  events,
  onUpdateEvents,
  activeCategoryProp = 'all',
  onChangeCategory,
  currentUser,
  onOpenAdminDesk,
  onOpenAuthModal,
  onLogout,
  initialArticleId = null,
  adSettings,
  onGoToRadio,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>((activeCategoryProp as CategoryId) || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ko');
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [articleNotFound, setArticleNotFound] = useState(false);

  // Selected Article for Standalone Detail Page (Requirement 1 & 2)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialArticleId) {
      return articles.find((a) => a.id === initialArticleId) || null;
    }
    // Check URL path or hash
    const path = window.location.pathname;
    const match = path.match(/\/article\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return articles.find((a) => a.id === match[1]) || null;
    }
    return null;
  });

  // Direct URL resolution (/article/:id) across incognito / new browsers
  useEffect(() => {
    const resolveArticleFromUrl = async () => {
      const path = window.location.pathname;
      const match = path.match(/\/article\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const articleId = match[1];
        const localFound = articles.find((a) => a.id === articleId);
        if (localFound) {
          setSelectedArticle(localFound);
          setArticleNotFound(false);
          return;
        }

        // Fetch from Firestore directly for instant cross-device/incognito loading
        setIsLoadingArticle(true);
        try {
          const firestoreArticle = await fetchArticleByIdFromFirestore(articleId);
          if (firestoreArticle) {
            setSelectedArticle(firestoreArticle);
            setArticleNotFound(false);
            if (!articles.some(a => a.id === firestoreArticle.id)) {
              onUpdateArticles([firestoreArticle, ...articles]);
            }
            return;
          }

          // Fallback to server API if not found in Firestore yet
          const res = await fetch(`/api/articles/${articleId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.article) {
              setSelectedArticle(data.article);
              setArticleNotFound(false);
              if (!articles.some(a => a.id === data.article.id)) {
                onUpdateArticles([data.article, ...articles]);
              }
            } else {
              setArticleNotFound(true);
            }
          } else {
            setArticleNotFound(true);
          }
        } catch (err) {
          console.error('Failed to load article from Firestore/API:', err);
          setArticleNotFound(true);
        } finally {
          setIsLoadingArticle(false);
        }
      } else if (path === '/un-sdg') {
        setActiveCategory('un_sdg');
        setSelectedArticle(null);
      }
    };

    resolveArticleFromUrl();
  }, [articles, onUpdateArticles]);

  // Sync with browser URL changes
  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      const match = path.match(/\/article\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const articleId = match[1];
        const found = articles.find((a) => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
          setArticleNotFound(false);
        } else {
          try {
            const firestoreArticle = await fetchArticleByIdFromFirestore(articleId);
            if (firestoreArticle) {
              setSelectedArticle(firestoreArticle);
              setArticleNotFound(false);
              return;
            }
          } catch (e) {
            console.warn('Popstate firestore fetch error:', e);
          }

          fetch(`/api/articles/${articleId}`)
            .then(res => res.json())
            .then(data => {
              if (data.article) {
                setSelectedArticle(data.article);
                setArticleNotFound(false);
              } else {
                setArticleNotFound(true);
              }
            })
            .catch(() => setArticleNotFound(true));
        }
      } else if (path === '/un-sdg') {
        setActiveCategory('un_sdg');
        setSelectedArticle(null);
      } else {
        setSelectedArticle(null);
        setArticleNotFound(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  // Sync external category changes
  useEffect(() => {
    if (activeCategoryProp) {
      setActiveCategory(activeCategoryProp as CategoryId);
    }
  }, [activeCategoryProp]);

  const handleSelectCategory = (cat: CategoryId) => {
    setActiveCategory(cat);
    setSelectedKeyword(null);
    setSelectedArticle(null);
    if (window.history.pushState) {
      window.history.pushState({}, '', cat === 'all' ? '/' : `/?category=${cat}`);
    }
    if (onChangeCategory) onChangeCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArticle = (art: Article) => {
    setSelectedArticle(art);
    if (window.history.pushState) {
      window.history.pushState({ articleId: art.id }, '', `/article/${art.id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromArticle = () => {
    setSelectedArticle(null);
    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);
  const [showEditorialModal, setShowEditorialModal] = useState(false);
  const [showOmbudsmanModal, setShowOmbudsmanModal] = useState(false);
  const [showWpXmlModal, setShowWpXmlModal] = useState(false);
  const [showNewsTipModal, setShowNewsTipModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueCluster | null>(null);
  const [issueClusters, setIssueClusters] = useState<IssueCluster[]>(() => loadPersistedIssueClusters());

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
    onUpdateArticles([newArt, ...articles]);
    handleOpenArticle(newArt);
  };

  // Filtered Articles Logic
  const visibleArticles = articles.filter((art) => {
    // Exclude articles configured solely for Sub-News
    if (art.mainNewsEnabled === false) return false;
    if (!art.status || art.status === 'PUBLISHED') return true;
    if (currentUser?.role === 'EDITOR_IN_CHIEF') return true;
    if (currentUser?.reporterId && art.reporter.id === currentUser.reporterId) return true;
    return false;
  });

  const filteredArticles = visibleArticles.filter((art) => {
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

  const topHeroArticle = visibleArticles.find((a) => a.isTopHeadline) || visibleArticles[0];
  const subHeroArticles = visibleArticles.filter((a) => a.id !== topHeroArticle?.id).slice(0, 4);

  const activeCategoryInfo = CATEGORY_TABS.find((t) => t.id === activeCategory);



  return (
    <div className="min-h-screen bg-[#f8f6f2] flex flex-col selection:bg-[#1b2a47] selection:text-amber-200 font-sans">
      {/* 1. Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        isSubscribed={isPressSubscribed}
        onToggleSubscribe={() => setIsPressSubscribed(!isPressSubscribed)}
        bookmarkCount={bookmarkedIds.size}
        onOpenBookmarks={() => setShowBookmarksModal(true)}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onOpenReporters={() => setShowReportersModal(true)}
        onOpenAiGenerator={() => setShowAiGenModal(true)}
        onOpenFactCheck={() => setShowFactCheckModal(true)}
        onOpenEditorial={() => setShowEditorialModal(true)}
        onOpenOmbudsman={() => setShowOmbudsmanModal(true)}
        onOpenAdminDesk={onOpenAdminDesk}
        onOpenRadio={() => onGoToRadio?.()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectKeyword={(kw) => {
          setSelectedKeyword(kw);
          setActiveCategory('all');
        }}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      />

      {/* 2. Main Content: Article Detail Page if selected, else Newsroom Home */}
      {isLoadingArticle ? (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-serif-kr">기사를 안전하게 불러오는 중입니다...</h3>
          <p className="text-xs text-slate-500">한국문화저널 디지털 뉴스 아카이브 연동 중</p>
        </main>
      ) : articleNotFound ? (
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
          <div className="p-4 bg-amber-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-2xl">
            📰
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif-kr">존재하지 않거나 삭제된 기사입니다</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            입력하신 개별 기사 주소의 기사를 찾을 수 없습니다.<br />
            주소가 정확한지 확인하시거나 아래 버튼을 통해 한국문화저널 메인으로 이동해 주세요.
          </p>
          <button
            onClick={handleBackFromArticle}
            className="px-5 py-2.5 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            한국문화저널 홈으로 가기
          </button>
        </main>
      ) : selectedArticle ? (
        <main className="flex-1 w-full">
          <ArticleDetailPage
            article={selectedArticle}
            onBack={handleBackFromArticle}
            onSelectRelatedArticle={handleOpenArticle}
            isBookmarked={bookmarkedIds.has(selectedArticle.id)}
            onToggleBookmark={() => handleToggleBookmark(selectedArticle.id)}
            lang={lang}
            onToggleLang={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            allArticles={visibleArticles}
            onSelectCategory={(catId) => {
              handleBackFromArticle();
              handleSelectCategory(catId as CategoryId);
            }}
            adSettings={adSettings}
            onGoToRadio={(artId, l) => onGoToRadio?.(artId, l)}
          />
        </main>
      ) : (
        <>
          {/* Breaking News Flash Ticker */}
          <BreakingTicker
            articles={visibleArticles}
            onSelectArticle={handleOpenArticle}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Active Keyword / Search Filter Banner */}
        {(selectedKeyword || searchQuery) && (
          <div className="bg-[#eeebe3] border border-[#d8d3cb] rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-serif-kr font-bold">검색 필터 적용중:</span>
              {selectedKeyword && (
                <span className="px-2.5 py-0.5 bg-[#1b2a47] text-white rounded-full font-bold">
                  {selectedKeyword}
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-slate-800 text-white rounded-full font-semibold">
                  "{searchQuery}"
                </span>
              )}
              <span className="text-slate-500 font-medium">({filteredArticles.length}건 검색됨)</span>
            </div>
            <button
              onClick={() => {
                setSelectedKeyword(null);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#1b2a47] hover:underline"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* View Mode 1: UN SDG Special Feature Page (Requirement 13) */}
        {activeCategory === 'un_sdg' ? (
          <div className="space-y-6">
            <UnSdgPage
              onBackToHome={() => handleSelectCategory('all')}
              lang={lang}
            />
            {/* Show UN SDG related news articles */}
            <div className="pt-6 border-t border-gray-200">
              <SectionArticleGrid
                title="UN SDG & 문화 생태계 관련 보도"
                subtitle="지속가능발전목표(SDGs)와 대한민국 문화유산 보전 특별 기사"
                articles={visibleArticles.filter((a) => a.category === 'un_sdg' || a.tags.includes('UN_SDG'))}
                onSelectArticle={handleOpenArticle}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
              />
            </div>
          </div>
        ) : activeCategory === 'paper_edition' ? (
          /* View Mode 2: Newspaper Print Edition Viewer */
          <PaperEditionView
            articles={articles}
            onSelectArticle={handleOpenArticle}
          />
        ) : activeCategory === 'all' && !searchQuery && !selectedKeyword ? (
          /* View Mode 3: Main Editorial Press Home (Broadsheet Layout) */
          <div className="space-y-8">
            {/* Top Headline Hero Grid */}
            <MainNewsHero
              topArticle={topHeroArticle}
              subArticles={subHeroArticles}
              onSelectArticle={handleOpenArticle}
            />

            {/* 정론 데스크 메인 배너 (사설/칼럼 + 문화재 팩트체크 + 독자권익위원회) */}
            <EditorialSectionBanner
              onOpenFactCheck={() => setShowFactCheckModal(true)}
              onOpenEditorial={() => setShowEditorialModal(true)}
              onOpenOmbudsman={() => setShowOmbudsmanModal(true)}
            />

            {/* Middle 2-Column: Left (News Feed) & Right (Rankings, Editorial Opinion, Issues, Culture Radar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 Cols): Section Highlights & In-Depth Stories (Each Section in 2-Column Grid, 2 Rows max) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Cultural Arts Highlights */}
                <SectionArticleGrid
                  title="문화·예술 기획"
                  subtitle="미술관 특별전, 거장 인터뷰, 클래식과 전통 공연의 현장"
                  articles={visibleArticles.filter((a) => a.category === 'culture_art')}
                  onSelectArticle={handleOpenArticle}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  columns={2}
                  maxItems={4}
                  onViewMore={() => handleSelectCategory('culture_art')}
                />

                {/* Heritage & Tradition Section */}
                <SectionArticleGrid
                  title="전통과 유산 (K-헤리티지)"
                  subtitle="천년의 숨결, 무형문화재 명장과 국가유산 심층 보도"
                  articles={visibleArticles.filter((a) => a.category === 'heritage')}
                  onSelectArticle={handleOpenArticle}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  columns={2}
                  maxItems={4}
                  onViewMore={() => handleSelectCategory('heritage')}
                />

                {/* K-Culture & Pop Story */}
                <SectionArticleGrid
                  title="K-컬처 & 라이프스타일"
                  subtitle="세계인을 사로잡은 한복, 한식, K-콘텐츠의 인문학적 탐구"
                  articles={visibleArticles.filter((a) => a.category === 'k_culture')}
                  onSelectArticle={handleOpenArticle}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  columns={2}
                  maxItems={4}
                  onViewMore={() => handleSelectCategory('k_culture')}
                />

                {/* Global News Section (Requirement 12) */}
                <SectionArticleGrid
                  title="Global News (해외 문화 & 글로벌 교류)"
                  subtitle="뉴욕 메트, 파리 루브르 등 해외 유수 미술관과 글로벌 한국 문화재 소식"
                  articles={visibleArticles.filter((a) => a.category === 'global_news')}
                  onSelectArticle={handleOpenArticle}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  columns={2}
                  maxItems={4}
                  onViewMore={() => handleSelectCategory('global_news')}
                />
              </div>

              {/* Right Column (4 Cols): Sidebar Widgets (Sticky on scroll) */}
              <aside className="lg:col-span-4 space-y-6 self-start sticky top-4">
                {/* 1. Real-time Rankings */}
                <RankingSection
                  articles={visibleArticles}
                  onSelectArticle={handleOpenArticle}
                />

                {/* 2. Editorial & Opinion Sidebar Section under Ranking */}
                <OpinionSidebarSection
                  onSelectCategory={() => handleSelectCategory('opinion')}
                  onSelectArticle={handleOpenArticle}
                  articles={visibleArticles}
                />

                {/* 3. Issue Clustering (심층 묶음 뉴스) - Requirement: Clickable to open Issue Interactive Map & Clustered Articles */}
                <IssueClustering
                  issueClusters={issueClusters}
                  onSelectIssue={(issue) => setSelectedIssue(issue)}
                  onSelectKeyword={(kw) => {
                    setSelectedKeyword(kw);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectArticle={(articleId) => {
                    const targetArt = articles.find((a) => a.id === articleId);
                    if (targetArt) handleOpenArticle(targetArt);
                  }}
                />


                {/* 4. Culture Radar (Exhibitions & Palace Openings) - Requirement 3: Dynamic Events */}
                <CultureCalendarRadar
                  events={events}
                  onOpenFullCalendar={() => setShowCalendarModal(true)}
                />
              </aside>
            </div>
          </div>
        ) : (
          /* View Mode 4: Specific Category Grid (e.g. Global News, Heritage, Culture Art, etc.) */
          <div className="space-y-6">
            <SectionArticleGrid
              title={activeCategoryInfo?.label || '기사 목록'}
              subtitle={activeCategoryInfo?.subcategories?.join(' · ')}
              articles={filteredArticles}
              onSelectArticle={handleOpenArticle}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}
      </main>
      </>
      )}

      {/* 3. Footer (Requirement 7, 9, 14) */}
      <Footer
        onOpenNewsTip={() => setShowNewsTipModal(true)}
        onOpenOmbudsman={() => setShowOmbudsmanModal(true)}
        onOpenSdgPage={() => handleSelectCategory('un_sdg')}
        onOpenEditorial={() => setShowEditorialModal(true)}
        onOpenFactCheck={() => setShowFactCheckModal(true)}
        onOpenAdminDesk={onOpenAdminDesk}
        onOpenAuthModal={onOpenAuthModal}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Modals & Dialogs */}
      {showCalendarModal && (
        <CultureCalendarModal
          events={events}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {showReportersModal && (
        <ReportersDeskModal
          onClose={() => setShowReportersModal(false)}
          subscribedReporters={subscribedReporters}
          onToggleSubscribeReporter={handleToggleSubscribeReporter}
        />
      )}

      {showAiGenModal && (
        <AiNewsGeneratorModal
          onClose={() => setShowAiGenModal(false)}
          onPublishArticle={handlePublishNewArticle}
        />
      )}

      {showBookmarksModal && (
        <BookmarksModal
          onClose={() => setShowBookmarksModal(false)}
          articles={articles}
          bookmarkedIds={bookmarkedIds}
          onSelectArticle={handleOpenArticle}
          onRemoveBookmark={(id) => handleToggleBookmark(id)}
        />
      )}

      {showFactCheckModal && (
        <FactCheckModal
          onClose={() => setShowFactCheckModal(false)}
        />
      )}

      {showEditorialModal && (
        <EditorialColumnModal
          onClose={() => setShowEditorialModal(false)}
        />
      )}

      {showOmbudsmanModal && (
        <OmbudsmanModal
          onClose={() => setShowOmbudsmanModal(false)}
        />
      )}

      {showWpXmlModal && (
        <WpXmlConverterModal
          onClose={() => setShowWpXmlModal(false)}
        />
      )}

      {/* Requirement 9: 기사제보 modal directly sending to soobakmu@naver.com */}
      {showNewsTipModal && (
        <NewsTipModal
          onClose={() => setShowNewsTipModal(false)}
        />
      )}

      {/* Requirement: Issue Detail Modal with Interactive Map */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          articles={articles}
          onSelectArticle={(articleId) => {
            const targetArt = articles.find((a) => a.id === articleId);
            if (targetArt) handleOpenArticle(targetArt);
            setSelectedIssue(null);
          }}
        />
      )}
    </div>
  );
};

