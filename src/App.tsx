/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KoreaCultureJournalPage } from './pages/KoreaCultureJournalPage';
import { AmpMobilePage } from './pages/AmpMobilePage';
import { SubNewsAppPage } from './pages/SubNewsAppPage';
import { KcjRadioPage } from './pages/KcjRadioPage';
import { Zap, Newspaper, Lock, UserCheck, LogOut, Globe2, Radio } from 'lucide-react';
import { AuthUser, Reporter, Article, CulturalEvent, CategoryTab, AdSettings, PopupConfig } from './types';
import { CATEGORY_TABS } from './data/mockNews';
import { AdminDeskModal } from './components/AdminDeskModal';
import { ReporterAuthModal } from './components/ReporterAuthModal';
import { LayerPopup } from './components/LayerPopup';
import { 
  loadPersistedArticles, 
  savePersistedArticles,
  loadPersistedReporters,
  savePersistedReporters,
  loadPersistedEvents,
  savePersistedEvents,
  loadPersistedUser,
  savePersistedUser,
  loadPersistedAdSettings,
  savePersistedAdSettings,
  loadPersistedPopupConfig,
  savePersistedPopupConfig
} from './utils/storage';

export type ViewMode = 'standard' | 'amp_mobile' | 'sub_news' | 'kcj_radio';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/kcj-radio')) {
        return 'kcj_radio';
      }
      if (window.location.pathname.startsWith('/sub-news')) {
        return 'sub_news';
      }
    }
    return 'standard';
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Global State for Articles, Reporters, Events, Categories, Ads (persisted)
  const [articles, setArticlesState] = useState<Article[]>(() => loadPersistedArticles());
  const [reporters, setReportersState] = useState<Reporter[]>(() => loadPersistedReporters());
  const [events, setEventsState] = useState<CulturalEvent[]>(() => loadPersistedEvents());
  const [categories, setCategories] = useState<CategoryTab[]>(CATEGORY_TABS);
  const [adSettings, setAdSettingsState] = useState<AdSettings>(() => loadPersistedAdSettings());
  const [popupConfig, setPopupConfigState] = useState<PopupConfig>(() => loadPersistedPopupConfig());

  // Sync browser back/forward buttons with view modes
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/kcj-radio')) {
        setViewMode('kcj_radio');
      } else if (window.location.pathname.startsWith('/sub-news')) {
        setViewMode('sub_news');
      } else {
        setViewMode('standard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authentication State (default logged out or persisted)
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(() => loadPersistedUser());

  // Wrap state updates with persistence
  const setArticles = (newArticles: Article[] | ((prev: Article[]) => Article[])) => {
    setArticlesState((prev) => {
      const next = typeof newArticles === 'function' ? newArticles(prev) : newArticles;
      savePersistedArticles(next);
      return next;
    });
  };

  const setReporters = (newReporters: Reporter[] | ((prev: Reporter[]) => Reporter[])) => {
    setReportersState((prev) => {
      const next = typeof newReporters === 'function' ? newReporters(prev) : newReporters;
      savePersistedReporters(next);
      return next;
    });
  };

  const setEvents = (newEvents: CulturalEvent[] | ((prev: CulturalEvent[]) => CulturalEvent[])) => {
    setEventsState((prev) => {
      const next = typeof newEvents === 'function' ? newEvents(prev) : newEvents;
      savePersistedEvents(next);
      return next;
    });
  };

  const setAdSettings = (newAds: AdSettings | ((prev: AdSettings) => AdSettings)) => {
    setAdSettingsState((prev) => {
      const next = typeof newAds === 'function' ? newAds(prev) : newAds;
      savePersistedAdSettings(next);
      return next;
    });
  };

  const setPopupConfig = (newPopup: PopupConfig | ((prev: PopupConfig) => PopupConfig)) => {
    setPopupConfigState((prev) => {
      const next = typeof newPopup === 'function' ? newPopup(prev) : newPopup;
      savePersistedPopupConfig(next);
      return next;
    });
  };

  const setCurrentUser = (user: AuthUser | null) => {
    setCurrentUserState(user);
    savePersistedUser(user);
  };

  // Modals
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Navigation handlers
  const handleGoToMainNews = () => {
    setViewMode('standard');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToSubNews = () => {
    setViewMode('sub_news');
    window.history.pushState(null, '', '/sub-news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToRadio = (articleId?: string, lang?: string) => {
    setViewMode('kcj_radio');
    let url = '/kcj-radio';
    const params = new URLSearchParams();
    if (articleId) params.set('article', articleId);
    if (lang) params.set('lang', lang);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    window.history.pushState(null, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToPaperEdition = () => {
    setViewMode('standard');
    setActiveCategory('paper_edition');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f2] font-sans">
      {/* Top Global Utility Bar */}
      <div className="bg-[#111927] border-b border-slate-800 text-xs text-slate-300 py-1.5 px-4 lg:px-8 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Left: Press Identity Clean */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-serif-kr font-bold text-white tracking-wide">
              한국문화저널 (Korea Culture Journal)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-amber-200/90 font-serif-kr">
              {viewMode === 'kcj_radio' 
                ? 'KCJ RADIO · 디지털 실시간 기사 방송국' 
                : viewMode === 'sub_news' 
                ? 'SUB NEWS · 분야별 심층 포털' 
                : '부산, 아00245 · 정론직필'}
            </span>
          </div>

          {/* Right: Radio, Sub News Toggle, AMP Mobile, Paper Edition, and CMS Desk Login */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* KCJ Radio Button */}
            <button
              onClick={() => handleGoToRadio()}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                viewMode === 'kcj_radio'
                  ? 'bg-gradient-to-r from-amber-400 to-red-500 text-slate-950 font-black ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-600/80 to-red-600/80 hover:from-amber-500 hover:to-red-500 text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>📻 KCJ Radio</span>
            </button>

            {/* Dual Channel Switcher: Sub News App vs Main News App */}
            {viewMode === 'sub_news' ? (
              <button
                onClick={handleGoToMainNews}
                className="px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>메인 뉴스앱 (한국문화저널)</span>
              </button>
            ) : (
              <button
                onClick={handleGoToSubNews}
                className="px-3.5 py-1 rounded-lg font-bold text-xs flex items-center transition-all bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-xs"
              >
                <span>서브 뉴스앱 (분야별 포털)</span>
              </button>
            )}

            {/* AMP Mobile Toggle Button (Main news only) */}
            {viewMode !== 'sub_news' && viewMode !== 'kcj_radio' && (
              <button
                onClick={() => setViewMode(viewMode === 'amp_mobile' ? 'standard' : 'amp_mobile')}
                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  viewMode === 'amp_mobile'
                    ? 'bg-amber-400 text-slate-950 font-black ring-1 ring-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{viewMode === 'amp_mobile' ? 'PC/표준판 보기' : 'AMP 모바일'}</span>
              </button>
            )}

            {/* Paper Edition Direct Link Button */}
            {viewMode !== 'sub_news' && viewMode !== 'kcj_radio' && (
              <button
                onClick={handleGoToPaperEdition}
                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  activeCategory === 'paper_edition' && viewMode === 'standard'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#1b2a47] hover:bg-[#283d63] text-white border border-[#2d3e5f]'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>지면 보기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: KCJ Radio OR Sub News App OR AMP Mobile View OR Standard Press View */}
      <div className="flex-1">
        {viewMode === 'kcj_radio' ? (
          <KcjRadioPage
            articles={articles}
            onBackToJournal={handleGoToMainNews}
          />
        ) : viewMode === 'sub_news' ? (
          <SubNewsAppPage
            articles={articles}
            onUpdateArticles={setArticles}
            reporters={reporters}
            currentUser={currentUser}
            onOpenAdminDesk={() => setShowAdminModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onLogout={() => setCurrentUser(null)}
            onGoToMainNews={handleGoToMainNews}
            adSettings={adSettings}
          />
        ) : viewMode === 'amp_mobile' ? (
          <AmpMobilePage
            articles={articles}
            onBackToStandard={() => setViewMode('standard')}
            onOpenPaperEdition={handleGoToPaperEdition}
          />
        ) : (
          <KoreaCultureJournalPage
            articles={articles}
            onUpdateArticles={setArticles}
            reporters={reporters}
            onUpdateReporters={setReporters}
            events={events}
            onUpdateEvents={setEvents}
            activeCategoryProp={activeCategory}
            onChangeCategory={setActiveCategory}
            currentUser={currentUser}
            onOpenAdminDesk={() => setShowAdminModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onLogout={() => setCurrentUser(null)}
            adSettings={adSettings}
            onGoToRadio={handleGoToRadio}
          />
        )}
      </div>

      {/* Common Layer Popup System */}
      <LayerPopup config={popupConfig} />

      {/* Admin CMS Desk Modal */}
      {showAdminModal && (
        <AdminDeskModal
          onClose={() => setShowAdminModal(false)}
          currentUser={currentUser}
          articles={articles}
          onUpdateArticles={setArticles}
          reporters={reporters}
          onUpdateReporters={setReporters}
          events={events}
          onUpdateEvents={setEvents}
          categories={categories}
          onUpdateCategories={setCategories}
          adSettings={adSettings}
          onUpdateAdSettings={setAdSettings}
          popupConfig={popupConfig}
          onUpdatePopupConfig={setPopupConfig}
        />
      )}

      {/* Reporter / Editor Auth Modal */}
      {showAuthModal && (
        <ReporterAuthModal
          onClose={() => setShowAuthModal(false)}
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAdminModal(true);
          }}
          onRegisterReporter={(newRep, newAuth) => {
            setReporters([newRep, ...reporters]);
            setCurrentUser(newAuth);
          }}
        />
      )}
    </div>
  );
}
