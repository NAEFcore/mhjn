import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Plus, 
  Search, 
  Bookmark, 
  FileText, 
  Calendar, 
  Sparkles, 
  Share2, 
  TrendingUp,
  X,
  Newspaper,
  Sun,
  Users,
  ShieldCheck,
  Feather,
  Scale,
  FileSpreadsheet,
  Settings,
  Lock,
  Radio
} from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORY_TABS, ISSUE_CLUSTERS } from '../data/mockNews';

interface HeaderProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenCalendar: () => void;
  onOpenReporters: () => void;
  onOpenAiGenerator: () => void;
  onOpenFactCheck: () => void;
  onOpenEditorial: () => void;
  onOpenOmbudsman: () => void;
  onOpenWpXmlExtractor?: () => void;
  onOpenAdminDesk?: () => void;
  onOpenRadio?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectKeyword: (kw: string) => void;
  lang?: 'ko' | 'en';
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  isSubscribed,
  onToggleSubscribe,
  bookmarkCount,
  onOpenBookmarks,
  onOpenCalendar,
  onOpenReporters,
  onOpenAiGenerator,
  onOpenFactCheck,
  onOpenEditorial,
  onOpenOmbudsman,
  onOpenWpXmlExtractor,
  onOpenAdminDesk,
  onOpenRadio,
  searchQuery,
  onSearchChange,
  onSelectKeyword,
  lang = 'ko',
  onToggleLang,
}) => {
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [bellActive, setBellActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubscribeClick = () => {
    onToggleSubscribe();
    const nextState = !isSubscribed;
    setToastMessage(
      nextState
        ? '한국문화저널 구독이 시작되었습니다. 주요 문화 속보를 실시간으로 받아보실 수 있습니다.'
        : '한국문화저널 구독이 해제되었습니다.'
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-lg shadow-xl text-sm flex items-center gap-3 animate-fade-in border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Utility Bar */}
      <div className="bg-[#f8fafc] border-b border-gray-200 text-xs text-gray-600 px-4 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-gray-800 font-serif-kr">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-gray-700">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>서울 24.8℃ 맑음</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-emerald-700 font-medium font-serif-kr">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>K-헤리티지 지수 3,428.0 (▲14.2)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCalendar}
            className="hover:text-[#0051a8] flex items-center gap-1 transition-colors text-[11px]"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>문화 캘린더</span>
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onOpenReporters}
            className="hover:text-[#0051a8] flex items-center gap-1 transition-colors text-[11px]"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>기자 홈</span>
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onOpenBookmarks}
            className="hover:text-[#0051a8] flex items-center gap-1 transition-colors text-[11px]"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>스크랩 ({bookmarkCount})</span>
          </button>
        </div>
      </div>

      {/* Main Brand & Logo Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onSelectCategory('all')}
            className="text-left group flex items-center gap-3"
          >
            {/* Press Seal / Crest */}
            <div className="w-11 h-11 rounded-lg bg-[#1b2a47] text-white flex flex-col items-center justify-center shadow-sm group-hover:bg-[#25375c] transition-colors border border-[#2d3e5f]">
              <span className="text-[10px] font-bold tracking-tighter opacity-80 leading-none">KOREA</span>
              <span className="text-base font-black tracking-tight leading-none mt-0.5 font-serif-kr text-amber-400">韓</span>
              <span className="text-[9px] tracking-widest opacity-80 leading-none">저널</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 font-serif-kr group-hover:text-[#1b2a47] transition-colors">
                  한국문화저널
                </h1>
                <span className="px-1.5 py-0.5 bg-blue-50 text-[#1b2a47] text-[11px] font-bold rounded-sm border border-blue-200">
                  언론사 009
                </span>
              </div>
              <p className="text-[11px] text-gray-500 tracking-tight mt-0.5 font-serif-kr">
                KOREA CULTURE JOURNAL · UN 퍼블리셔 콤팩트 협약 매체
              </p>
            </div>
          </button>

          {/* Press Subscribe Button */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={handleSubscribeClick}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isSubscribed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#1b2a47] text-white hover:bg-[#25375c]'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>구독중 48.2만</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 구독 48.2만</span>
                </>
              )}
            </button>

            {isSubscribed && (
              <button
                onClick={() => setBellActive(!bellActive)}
                title={bellActive ? '알림 켜짐' : '알림 꺼짐'}
                className={`p-1.5 rounded-full border transition-colors ${
                  bellActive
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Tools & Search */}
        <div className="flex items-center gap-2">
          {/* KCJ Radio Station Button */}
          {onOpenRadio && (
            <button
              onClick={onOpenRadio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black rounded-lg text-xs shadow-xs transition-all active:scale-95 ring-1 ring-amber-400/40"
              title="KCJ Radio 실시간 디지털 라디오 방송국 열기"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              <span>📻 KCJ Radio</span>
            </button>
          )}

          {/* KO / EN Real Multi-Language Switch */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold border border-amber-300 flex items-center gap-1 transition-all shadow-2xs"
              title="한국어 / English 언어 전환"
            >
              <span className="text-[11px] font-mono">{lang === 'en' ? '🇺🇸 EN' : '🇰🇷 KO'}</span>
            </button>
          )}

          {/* AI Reporter Generator */}
          <button
            onClick={onOpenAiGenerator}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1b2a47] to-indigo-900 text-white rounded-lg text-xs font-semibold shadow-xs hover:from-[#25375c] hover:to-indigo-800 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 문화속보 생성</span>
          </button>

          {/* Paper Edition Button */}
          <button
            onClick={() => onSelectCategory('paper_edition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeCategory === 'paper_edition'
                ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-[#1b2a47]" />
            <span>오늘의 지면 (1~4면)</span>
          </button>

          {/* Search Input on Desktop */}
          <div className="relative hidden lg:block w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="문화·예술·전시 기사 검색..."
              className="w-full pl-8 pr-8 py-1.5 bg-gray-100 hover:bg-gray-50 focus:bg-white text-xs text-gray-800 rounded-full border border-transparent focus:border-[#1b2a47] focus:outline-none transition-all font-sans"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trending Tag Pills */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs text-gray-500">
        <span className="font-semibold text-gray-700 whitespace-nowrap flex items-center gap-1 font-serif-kr">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          주요 이슈 키워드:
        </span>
        {ISSUE_CLUSTERS.map((iss) => (
          <button
            key={iss.id}
            onClick={() => onSelectKeyword(iss.keyword)}
            className="px-2.5 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-[#1b2a47] rounded-full whitespace-nowrap transition-colors text-gray-600 font-medium"
          >
            {iss.keyword}
          </button>
        ))}
      </div>

      {/* Navigation Tabs (Section Bar) */}
      <nav className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
          <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-0">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => onSelectCategory(tab.id)}
                    className={`relative py-3 px-3 md:px-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 font-serif-kr ${
                      isActive
                        ? 'text-[#1b2a47]'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b2a47]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile Search Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Box Accordion */}
        {showSearchMobile && (
          <div className="lg:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="기사 제목, 장인, 전시 검색..."
                className="w-full pl-8 pr-4 py-2 bg-white text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#1b2a47]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
