import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Menu, 
  ChevronRight, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  Flame, 
  Newspaper,
  ArrowLeft,
  Feather,
  ShieldCheck
} from 'lucide-react';
import { Article, CategoryId } from '../types';
import { CATEGORY_TABS } from '../data/mockNews';
import { loadPersistedArticles } from '../utils/storage';

interface AmpMobilePageProps {
  articles?: Article[];
  onBackToStandard: () => void;
  onOpenPaperEdition: () => void;
}

export const AmpMobilePage: React.FC<AmpMobilePageProps> = ({
  articles: articlesProp,
  onBackToStandard,
  onOpenPaperEdition,
}) => {
  const articles = articlesProp || [];
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const publishedArticles = articles.filter(a => !a.status || a.status === 'PUBLISHED');
  const topArticle = publishedArticles.find(a => a.isTopHeadline) || publishedArticles[0];
  const listArticles = publishedArticles.filter(a => a.id !== topArticle?.id);

  const filteredArticles = activeCategory === 'all' 
    ? listArticles 
    : listArticles.filter(a => a.category === activeCategory);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()} AMP 모바일 속보판`;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#111111] font-sans antialiased max-w-md mx-auto border-x border-[#d8d3cb] shadow-lg flex flex-col">
      {/* 1. AMP Top Fast-Load Bar */}
      <div className="bg-[#1b2a47] text-white px-3.5 py-2 flex items-center justify-between text-xs border-b border-[#2d3e5f]">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
            <Zap className="w-3 h-3 fill-amber-300" />
            <span>AMP 초고속 모바일</span>
          </span>
          <span className="text-[10px] text-slate-300 font-mono">{formattedDate}</span>
        </div>

        <button
          onClick={onBackToStandard}
          className="text-[11px] text-amber-200 hover:text-white font-bold flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"
        >
          <span>PC/표준판</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. AMP Masthead Header */}
      <header className="px-4 py-3 bg-[#fcfaf7] border-b border-[#e2ded6] flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-[#fcfaf7]/95">
        <div 
          onClick={() => {
            setSelectedArticle(null);
            setActiveCategory('all');
          }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1b2a47] text-amber-400 flex items-center justify-center font-serif-kr font-black text-lg border border-[#2d3e5f]">
            韓
          </div>
          <div>
            <h1 className="text-lg font-black font-serif-kr tracking-tight text-slate-950">
              한국문화저널
            </h1>
            <p className="text-[9px] text-[#6b6257] font-serif-kr -mt-0.5">
              AMP KOREA CULTURE JOURNAL
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPaperEdition}
          className="px-2.5 py-1 bg-[#1b2a47] text-amber-200 text-[11px] font-bold font-serif-kr rounded-lg flex items-center gap-1 shadow-2xs"
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>지면보기</span>
        </button>
      </header>

      {/* 3. Category Horizontal Scroll */}
      <nav className="bg-[#1b2a47] text-white px-3 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-[#2d3e5f]">
        {CATEGORY_TABS.filter(t => t.id !== 'paper_edition').map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id);
              setSelectedArticle(null);
            }}
            className={`px-3 py-1 text-xs font-bold font-serif-kr rounded-full shrink-0 transition-all ${
              activeCategory === tab.id
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 4. Article Detail View (if selected) or Feed */}
      <main className="flex-1 p-4 space-y-4">
        {selectedArticle ? (
          <article className="space-y-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-1 text-xs font-bold text-[#1b2a47] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>전체 기사 목록으로</span>
            </button>

            <div>
              <span className="text-[11px] font-bold text-[#1b2a47] bg-[#f0ebe3] px-2 py-0.5 rounded font-serif-kr">
                {selectedArticle.categoryLabel}
              </span>
              <h2 className="text-xl font-bold font-serif-kr text-slate-950 leading-snug mt-1.5">
                {selectedArticle.title}
              </h2>
              {selectedArticle.subtitle && (
                <p className="text-xs font-semibold text-slate-600 mt-1 font-serif-kr">
                  {selectedArticle.subtitle}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200 font-mono">
                <span>기자: {selectedArticle.reporter.name}</span>
                <span>{selectedArticle.publishedAt}</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-16/10 bg-slate-100 border border-[#d8d3cb]">
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
            </div>
            {selectedArticle.imageCaption && (
              <p className="text-[10px] text-slate-500 font-serif-kr -mt-2 italic">
                ▲ {selectedArticle.imageCaption}
              </p>
            )}

            <div className="p-3 bg-[#f5f1eb] rounded-xl border-l-4 border-[#1b2a47] text-xs font-serif-kr text-slate-800 leading-relaxed">
              "{selectedArticle.summary}"
            </div>

            <div className="text-[14px] text-slate-900 font-serif-kr leading-relaxed space-y-3 text-justify">
              {selectedArticle.content.split('\n\n').map((p, i) => (
                <p key={i} className="indent-3">{p}</p>
              ))}
            </div>

            <div className="p-3 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] text-[11px] text-slate-500 font-sans">
              <p>저작권자 &copy; 한국문화저널. 무단전재 및 재배포 금지</p>
            </div>
          </article>
        ) : (
          <>
            {/* Top 1 Headline Hero */}
            {activeCategory === 'all' && (
              <div 
                onClick={() => setSelectedArticle(topArticle)}
                className="bg-white rounded-2xl border border-[#d8d3cb] overflow-hidden shadow-xs cursor-pointer group"
              >
                <div className="relative aspect-16/10 bg-slate-100">
                  <img src={topArticle.imageUrl} alt={topArticle.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">
                    1면 톱기사
                  </div>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#1b2a47]">
                    [{topArticle.categoryLabel}]
                  </span>
                  <h3 className="font-serif-kr font-bold text-base text-slate-950 leading-snug group-hover:text-[#1b2a47] transition-colors">
                    {topArticle.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {topArticle.summary}
                  </p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{topArticle.reporter.name} 기자</span>
                    <span>조회 {topArticle.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Opinion / Fact Check Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#f5f1eb] rounded-xl border border-[#ded8cf] flex items-center gap-2">
                <Feather className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-emerald-900 block">오늘의 사설</span>
                  <p className="font-serif-kr font-bold text-[11px] text-slate-900 truncate">해외유출 문화재 환수</p>
                </div>
              </div>
              <div className="p-2.5 bg-[#f5f1eb] rounded-xl border border-[#ded8cf] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-amber-900 block">팩트체크</span>
                  <p className="font-serif-kr font-bold text-[11px] text-slate-900 truncate">훈민정음 원형 검증</p>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#e2ded6] pb-1.5">
                <span className="font-serif-kr font-bold text-xs text-slate-900">
                  {activeCategory === 'all' ? '최신 주요 기사' : `${activeCategory} 섹션`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">총 {filteredArticles.length}건</span>
              </div>

              {filteredArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white p-3 rounded-xl border border-[#e2ded6] flex gap-3 cursor-pointer hover:border-[#1b2a47] transition-all shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-[#1b2a47]">
                        [{art.categoryLabel}]
                      </span>
                      {art.badge && (
                        <span className="text-[9px] px-1 bg-slate-100 rounded text-slate-600">
                          {art.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif-kr font-bold text-xs text-slate-950 leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{art.reporter.name}</span>
                      <span>•</span>
                      <span>{art.publishedAt}</span>
                    </p>
                  </div>
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* 5. AMP Footer */}
      <footer className="p-4 bg-[#1b2432] text-slate-400 text-[10px] text-center space-y-1.5 border-t border-slate-800">
        <p className="text-slate-300 font-serif-kr font-bold text-xs">한국문화저널 (AMP 모바일)</p>
        <p>부산시 중구 중구로 61 4F | 편집인: 송기송 | 대표전화: 051 241-1323</p>
        <p>Copyright &copy; 2026 KOREA CULTURE JOURNAL. All Rights Reserved.</p>
      </footer>
    </div>
  );
};
