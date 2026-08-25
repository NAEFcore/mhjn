import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Globe,
  Sparkles,
  Newspaper,
  LayoutGrid,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Article, Reporter, AuthUser, SubNewsCategoryId, AdSettings, Language } from '../types';
import { SUB_NEWS_CATEGORIES } from '../data/mockNews';
import { DynamicAdBanner } from '../components/DynamicAdBanner';
import { ArticleDetailPage } from './ArticleDetailPage';
import { OpinionSidebarSection } from '../components/OpinionSidebarSection';

interface SubNewsAppPageProps {
  articles: Article[];
  onUpdateArticles: (arts: Article[]) => void;
  reporters: Reporter[];
  currentUser: AuthUser | null;
  onOpenAdminDesk?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onGoToMainNews: () => void;
  adSettings?: AdSettings;
  initialArticleId?: string | null;
}

export const SubNewsAppPage: React.FC<SubNewsAppPageProps> = ({
  articles,
  onUpdateArticles,
  reporters,
  currentUser,
  onOpenAdminDesk,
  onOpenAuthModal,
  onLogout,
  onGoToMainNews,
  adSettings,
  initialArticleId = null,
}) => {
  const [activeCategory, setActiveCategory] = useState<SubNewsCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialArticleId) {
      return articles.find((a) => a.id === initialArticleId) || null;
    }
    const path = window.location.pathname;
    const match = path.match(/\/sub-news\/article\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return articles.find((a) => a.id === match[1]) || null;
    }
    return null;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('ko');

  // Helper: Check if article was published in the last 7 days
  const isWithinRecent7Days = (dateStr?: string) => {
    if (!dateStr) return true;
    try {
      const cleanDate = dateStr.replace(/\./g, '-').replace(/\s.+/, '');
      const d = new Date(cleanDate);
      if (isNaN(d.getTime())) return true;
      const diffDays = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7 && diffDays >= -1;
    } catch {
      return true;
    }
  };

  // Filter articles for Sub-News (articles where subNewsEnabled !== false)
  const subArticles = useMemo(() => {
    return articles.filter(
      (a) => a.subNewsEnabled !== false && (!a.status || a.status === 'PUBLISHED')
    );
  }, [articles]);

  // "최근 7일 기사 중 랜덤 노출" logic: category items are filtered by last 7 days and randomly shuffled
  const randomizedCategoryArticles = useMemo(() => {
    const matched = subArticles.filter(
      (art) => activeCategory === 'all' || art.subNewsCategory === activeCategory
    );
    const recent7 = matched.filter((art) => isWithinRecent7Days(art.publishedAt));
    const pool = recent7.length >= 2 ? recent7 : matched;
    return [...pool].sort(() => Math.random() - 0.5);
  }, [subArticles, activeCategory]);

  // Filter by category and search
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return randomizedCategoryArticles;

    return subArticles.filter((art) => {
      const matchesCategory = activeCategory === 'all' || art.subNewsCategory === activeCategory;
      const matchesSearch = 
        art.title.toLowerCase().includes(q) ||
        (art.subtitle && art.subtitle.toLowerCase().includes(q)) ||
        art.content.toLowerCase().includes(q) ||
        (art.reporter?.name && art.reporter.name.toLowerCase().includes(q)) ||
        art.tags.some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [randomizedCategoryArticles, subArticles, searchQuery, activeCategory]);

  // Top Headline Article for Sub-News
  const headlineArticle = searchQuery.trim()
    ? (filteredArticles[0] || null)
    : (filteredArticles[0] || subArticles[0] || null);
  const remainingArticles = headlineArticle
    ? filteredArticles.filter(a => a.id !== headlineArticle.id)
    : filteredArticles;

  // Popular / Trending Articles
  const trendingArticles = [...subArticles].sort((a, b) => b.views - a.views).slice(0, 6);

  // Handle article select
  const handleOpenArticle = (art: Article) => {
    setSelectedArticle(art);
    window.history.pushState(null, '', `/sub-news/article/${art.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    window.history.pushState(null, '', '/sub-news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (selectedArticle) {
      setSelectedArticle(null);
      window.history.pushState(null, '', '/sub-news');
    }
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // SEO Canonical Tag management
  useEffect(() => {
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    if (selectedArticle) {
      // If article is published on main news as well, set canonical to main news to avoid duplicate content penalty
      const targetCanonical = selectedArticle.mainNewsEnabled !== false
        ? `https://kculturejournal.com/article/${selectedArticle.id}`
        : `https://kculturejournal.com/sub-news/article/${selectedArticle.id}`;
      canonicalLink.setAttribute('href', targetCanonical);
      document.title = `${selectedArticle.title} | 한국문화저널 SUB NEWS`;
    } else {
      canonicalLink.setAttribute('href', 'https://kculturejournal.com/sub-news');
      document.title = '분야별 뉴스 포털 - 스포츠·씨름·무예·IT·AI·경제·라이프 | 한국문화저널 SUB NEWS';
    }

    return () => {
      canonicalLink?.setAttribute('href', 'https://kculturejournal.com/');
    };
  }, [selectedArticle]);

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-slate-900 font-sans flex flex-col selection:bg-amber-200 selection:text-slate-950">
      {/* 1. Sub-News Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top Utility Bar */}
        <div className="bg-[#0f172a] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="font-bold text-amber-400">⚡ 실시간 분야별 포털</span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
              <span className="text-slate-400 hidden md:inline">|</span>
              <span className="text-slate-400 hidden md:inline">서울 14°C 맑음</span>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              한국문화저널 공식 서브 뉴스 포털
            </div>
          </div>
        </div>

        {/* Main Branding & Search Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToList}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md">
              韓
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-kr text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  한국문화저널
                </span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-sm">
                  SUB NEWS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans tracking-normal hidden sm:block">
                스포츠 · 씨름 · 전통무예 · IT/AI · 경제 · 라이프 실시간 심층 포털
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="관심 분야, 기자명, 본문 키워드 검색..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100/90 border border-slate-300 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                  title="검색어 지우기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Categories Navigation Bar */}
        <nav className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-bold">
              <button
                onClick={() => { setActiveCategory('all'); if (selectedArticle) handleBackToList(); }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                전체보기
              </button>

              {SUB_NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); if (selectedArticle) handleBackToList(); }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* 2. Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {selectedArticle ? (
          /* Article Detail View in Sub News App */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={handleBackToList}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>서브 뉴스 목록으로 돌아가기</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-[11px]">
                  {selectedArticle.mainNewsEnabled !== false ? '📰 메인·서브 동시발행 기사' : '🌐 서브뉴스 단독기사'}
                </span>
                <button
                  onClick={onGoToMainNews}
                  className="px-3 py-1.5 bg-[#1b2a47] text-white rounded-lg font-bold text-xs hover:bg-[#283d64] transition-colors"
                >
                  본지(한국문화저널)에서 보기
                </button>
              </div>
            </div>

            {/* Standard Article Detail Rendering */}
            <ArticleDetailPage
              article={selectedArticle}
              onBack={handleBackToList}
              onSelectRelatedArticle={handleOpenArticle}
              isBookmarked={bookmarkedIds.has(selectedArticle.id)}
              onToggleBookmark={() => handleToggleBookmark(selectedArticle.id)}
              lang={lang}
              onToggleLang={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              allArticles={subArticles}
              onSelectCategory={(catId) => {
                handleBackToList();
                // Map or set category
                if (catId === 'opinion') {
                  setActiveCategory('politics_economy');
                }
              }}
              adSettings={adSettings}
            />
          </div>
        ) : (
          /* Portal Home Grid */
          <div className="space-y-8">
            {/* Top Category Header Banner */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {activeCategory === 'all' ? '🔥' : SUB_NEWS_CATEGORIES.find(c => c.id === activeCategory)?.icon || '📌'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-serif-kr text-slate-900">
                  {activeCategory === 'all' 
                    ? '실시간 주요 분야별 헤드라인' 
                    : `${SUB_NEWS_CATEGORIES.find(c => c.id === activeCategory)?.name} 뉴스`}
                </h1>
                <span className="text-xs text-slate-500 font-sans font-normal hidden sm:inline">
                  (총 {filteredArticles.length}건 기사)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">정렬:</span>
                <span className="font-bold text-slate-900">최신순</span>
              </div>
            </div>

            {/* Top Section: Hero Article + Trending Sidebar */}
            {headlineArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 8 Cols: Large Top Headline Story */}
                <div className="lg:col-span-8">
                  <div 
                    onClick={() => handleOpenArticle(headlineArticle)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                      <img
                        src={headlineArticle.imageUrl}
                        alt={headlineArticle.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-md shadow-md">
                          {headlineArticle.badge || '헤드라인'}
                        </span>
                        {headlineArticle.subNewsCategory && (
                          <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm text-white font-bold text-xs rounded-md">
                            {SUB_NEWS_CATEGORIES.find(c => c.id === headlineArticle.subNewsCategory)?.name || '분야'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-serif-kr text-slate-900 group-hover:text-amber-700 leading-tight">
                          {headlineArticle.title}
                        </h2>
                        {headlineArticle.subtitle && (
                          <p className="text-xs sm:text-sm text-slate-600 font-serif-kr line-clamp-2">
                            {headlineArticle.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed">
                          {headlineArticle.summary || headlineArticle.content.slice(0, 150)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <img
                            src={headlineArticle.reporter.avatar}
                            alt={headlineArticle.reporter.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-800">{headlineArticle.reporter.name} 기자</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {headlineArticle.publishedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {headlineArticle.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Most Read Trending in Sub-News */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <h3 className="font-serif-kr font-bold text-slate-900 text-sm">
                        실시간 인기 급상승 뉴스
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-100 mt-2">
                      {trendingArticles.map((art, idx) => (
                        <div
                          key={art.id}
                          onClick={() => handleOpenArticle(art)}
                          className="py-3 flex items-start gap-3 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                        >
                          <span className={`text-base font-black font-mono w-5 shrink-0 ${
                            idx < 3 ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-xs font-bold font-serif-kr text-slate-900 group-hover:text-amber-700 line-clamp-2 leading-snug">
                              {art.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{SUB_NEWS_CATEGORIES.find(c => c.id === art.subNewsCategory)?.name || art.categoryLabel}</span>
                              <span>·</span>
                              <span>{art.publishedAt}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opinion & Column Section in Sub News Sidebar */}
                  <OpinionSidebarSection
                    articles={articles}
                    onSelectArticle={handleOpenArticle}
                  />

                  {/* Ad slot in sidebar */}
                  <DynamicAdBanner
                    adCode={adSettings?.sidebarTop}
                    slotName="sidebarTop"
                    slotLabel="광고: 서브뉴스 사이드바"
                  />
                </div>
              </div>
            )}

            {/* Remaining Sub News Articles Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-serif-kr font-bold text-base text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-600" />
                  <span>분야별 최신 기사 피드</span>
                </h3>
                <span className="text-xs text-slate-500">실시간 자동 갱신</span>
              </div>

              {remainingArticles.length === 0 && !headlineArticle ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-base font-bold text-slate-700">
                    {searchQuery.trim() ? `'${searchQuery}'에 대한 검색 결과가 없습니다.` : '해당 분야의 기사가 아직 등록되지 않았습니다.'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {searchQuery.trim() ? '다른 검색어를 입력하시거나 전체보기를 눌러보세요.' : '데스크 관리자에서 서브 뉴스 채널을 선택하여 기사를 송고해보세요.'}
                  </p>
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      전체 기사 보기
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {remainingArticles.map((art) => {
                    const catInfo = SUB_NEWS_CATEGORIES.find(c => c.id === art.subNewsCategory);
                    return (
                      <div
                        key={art.id}
                        onClick={() => handleOpenArticle(art)}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col group"
                      >
                        <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {catInfo && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs text-amber-300 font-bold text-[11px] rounded-md shadow-xs flex items-center gap-1">
                              <span>{catInfo.icon}</span>
                              <span>{catInfo.name}</span>
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                          <div className="space-y-1.5">
                            <h4 className="font-serif-kr font-bold text-sm text-slate-900 group-hover:text-amber-700 line-clamp-2 leading-snug">
                              {art.title}
                            </h4>
                            <p className="text-xs text-slate-600 font-serif-kr line-clamp-2 leading-relaxed">
                              {art.summary || art.content.slice(0, 100)}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{art.reporter.name} 기자</span>
                            <span>{art.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Sub-News Footer */}
      <footer className="bg-[#111927] text-slate-300 border-t border-slate-800 text-xs py-10 mt-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                韓
              </div>
              <span className="font-serif-kr font-bold text-base text-white">
                한국문화저널 SUB NEWS
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs flex-wrap">
              <button onClick={onGoToMainNews} className="hover:text-white transition-colors underline">
                한국문화저널(본지) 바로가기
              </button>
              <span>·</span>
              {onOpenAdminDesk && (
                <button onClick={onOpenAdminDesk} className="text-amber-400 hover:text-white font-bold transition-colors">
                  ⚙️ 관리자 CMS 데스크
                </button>
              )}
              {currentUser ? (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">{currentUser.name} 기자</span>
                  {onLogout && (
                    <button onClick={onLogout} className="hover:text-rose-400 transition-colors ml-1">
                      로그아웃
                    </button>
                  )}
                </>
              ) : (
                onOpenAuthModal && (
                  <>
                    <span>·</span>
                    <button onClick={onOpenAuthModal} className="hover:text-amber-300 transition-colors">
                      기자 로그인
                    </button>
                  </>
                )
              )}
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
            <p>
              이 사이트는 한국문화저널의 분야별 뉴스 포털 서비스로, 스포츠, 씨름, 무예, IT, AI, 경제, 라이프 등 각 분야의 전문성 있는 심층 기사를 실시간으로 제공합니다.
            </p>
            <p>
              등록번호: 부산 아, 00245 | 발행·편집인: 한국문화저널 편집위원회 | 청소년보호책임자: 편집국장
            </p>
            <p className="pt-2 text-slate-500">
              © 2026 한국문화저널 SUB NEWS. All rights reserved. 본 포털의 모든 콘텐츠는 저작권법의 보호를 받습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
