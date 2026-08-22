/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KoreaCultureJournalPage } from './pages/KoreaCultureJournalPage';
import { AmpMobilePage } from './pages/AmpMobilePage';
import { Zap, Newspaper, Lock, UserCheck, LogOut } from 'lucide-react';
import { AuthUser, Reporter, Article, CulturalEvent, CategoryTab, AdSettings } from './types';
import { CATEGORY_TABS } from './data/mockNews';
import { AdminDeskModal } from './components/AdminDeskModal';
import { ReporterAuthModal } from './components/ReporterAuthModal';
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
  savePersistedAdSettings
} from './utils/storage';

export type ViewMode = 'standard' | 'amp_mobile';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Global State for Articles, Reporters, Events, Categories, Ads (persisted)
  const [articles, setArticlesState] = useState<Article[]>(() => loadPersistedArticles());
  const [reporters, setReportersState] = useState<Reporter[]>(() => loadPersistedReporters());
  const [events, setEventsState] = useState<CulturalEvent[]>(() => loadPersistedEvents());
  const [categories, setCategories] = useState<CategoryTab[]>(CATEGORY_TABS);
  const [adSettings, setAdSettingsState] = useState<AdSettings>(() => loadPersistedAdSettings());

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

  const setCurrentUser = (user: AuthUser | null) => {
    setCurrentUserState(user);
    savePersistedUser(user);
  };

  // Modals
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Switch to Paper Edition
  const handleGoToPaperEdition = () => {
    setViewMode('standard');
    setActiveCategory('paper_edition');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f2] font-sans">
      {/* Top Global Utility Bar (Requirement 6: No IATPC text/button, Has AMP Mobile & Paper Edition buttons) */}
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
              부산, 아00245 · 정론직필
            </span>
          </div>

          {/* Right: AMP Mobile, Paper Edition, and CMS Desk Login */}
          <div className="flex items-center gap-2">
            {/* AMP Mobile Toggle Button */}
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

            {/* Paper Edition Direct Link Button */}
            <button
              onClick={handleGoToPaperEdition}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                activeCategory === 'paper_edition' && viewMode === 'standard'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-[#1b2a47] hover:bg-[#283d63] text-white border border-[#2d3e5f]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>한국문화저널 (지면 보기)</span>
            </button>

            {/* CMS / Reporter Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>편집국 CMS 데스크</span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setCurrentUser(null)}
                  title="로그아웃"
                  className="text-slate-400 hover:text-rose-400 p-0.5"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 flex items-center gap-1 border border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>기자·편집국 로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: AMP Mobile View OR Standard Press View */}
      <div className="flex-1">
        {viewMode === 'amp_mobile' ? (
          <AmpMobilePage
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
            adSettings={adSettings}
          />
        )}
      </div>

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
