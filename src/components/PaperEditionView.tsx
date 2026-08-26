import React, { useState } from 'react';
import { Newspaper, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Bookmark, Share2 } from 'lucide-react';
import { PAPER_PAGES } from '../data/mockNews';
import { Article } from '../types';

interface PaperEditionViewProps {
  onSelectArticle: (article: Article) => void;
}

export const PaperEditionView: React.FC<PaperEditionViewProps> = ({ onSelectArticle }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large'>('normal');

  const currentPage = PAPER_PAGES[currentPageIndex];

  return (
    <div className="my-6">
      {/* Paper Viewer Header Controls */}
      <div className="bg-white rounded-xl border border-gray-300 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#004b93] text-white rounded-lg">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
              오늘의 신문 지면보기 (제18,450호)
            </h2>
            <p className="text-xs text-gray-500">
              실제 발행 신문 판형 레이아웃 · 기사를 클릭하면 고해상도 상세 본문으로 이동합니다.
            </p>
          </div>
        </div>

        {/* Page selector buttons & zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            {PAPER_PAGES.map((page, idx) => (
              <button
                key={page.pageNumber}
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currentPageIndex === idx
                    ? 'bg-[#004b93] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {page.pageNumber}면 ({page.sectionName})
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => setZoomLevel(zoomLevel === 'normal' ? 'large' : 'normal')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1"
              title="지면 확대"
            >
              {zoomLevel === 'normal' ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
              <span>{zoomLevel === 'normal' ? '확대' : '표준'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realistic Paper Canvas Frame */}
      <div className="max-w-5xl mx-auto bg-[#faf9f6] border-2 border-gray-400 p-6 sm:p-10 shadow-2xl rounded-sm text-gray-900 newspaper-texture">
        {/* Newspaper Top Header (Masthead) */}
        <div className="border-b-4 border-double border-gray-900 pb-4 mb-6">
          <div className="flex items-center justify-between text-xs text-gray-700 font-serif-kr font-semibold border-b border-gray-400 pb-1 mb-2">
            <span>{currentPage.date}</span>
            <span className="font-bold text-sm tracking-widest">{currentPage.sectionName} ({currentPage.pageNumber}면)</span>
            <span>창간 1988년 · 대한민국 대표 문화지</span>
          </div>

          <div className="text-center py-2">
            <h1 className="text-3xl sm:text-4xl font-black font-serif-kr tracking-widest text-gray-950">
              韓 國 文 化 저 널
            </h1>
            <p className="text-[11px] text-gray-600 tracking-wider mt-1">
              KOREA CULTURE JOURNAL · 2026. 08. 21 (금요일)
            </p>
          </div>
        </div>

        {/* Paper Articles Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-300">
          {currentPage.articles.map((art, index) => {
            const isLead = index === 0;
            const colSpan = isLead ? 'md:col-span-7' : 'md:col-span-5 md:pl-8';

            return (
              <article
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className={`${colSpan} cursor-pointer group pt-6 md:pt-0`}
              >
                {/* Section tag / Kicker */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-800 border-b border-red-800 pb-0.5 font-serif-kr">
                    [{art.subCategory || art.categoryLabel}] {art.badge && `· ${art.badge}`}
                  </span>
                  <span className="text-[11px] text-gray-500 font-serif-kr">
                    {art.reporter.name} 기자
                  </span>
                </div>

                {/* Main Headline */}
                <h3 className={`font-serif-kr font-black text-gray-950 group-hover:text-[#004b93] leading-tight tracking-tight mb-3 transition-colors ${
                  isLead ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                }`}>
                  {art.title}
                </h3>

                {/* Subtitle Box */}
                {art.subtitle && (
                  <div className="border-l-2 border-gray-900 pl-3 py-0.5 mb-4 text-xs font-serif-kr text-gray-700 leading-relaxed font-semibold">
                    {art.subtitle}
                  </div>
                )}

                {/* Photo in Print */}
                <div className="relative aspect-[16/10] bg-gray-200 border border-gray-400 mb-3 overflow-hidden">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 filter contrast-105"
                  />
                </div>
                {art.imageCaption && (
                  <p className="text-[10px] text-gray-500 font-serif-kr italic mb-3">
                    {art.imageCaption}
                  </p>
                )}

                {/* Lead Text columns */}
                <div className="text-xs font-serif-kr text-gray-800 leading-relaxed space-y-2">
                  <p className="first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                    {(art.summary || art.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 350)}...
                  </p>
                </div>

                {/* Read Full Article Button */}
                <div className="mt-4 pt-2 border-t border-dotted border-gray-300 flex items-center justify-between text-[11px] text-[#004b93] font-bold">
                  <span>[전문 읽기 / 인터랙티브 뷰]</span>
                  <span>댓글 {art.commentsCount}개</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Paper Footer Stamp */}
        <div className="border-t-2 border-gray-900 mt-10 pt-3 flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-serif-kr">
          <span>한국문화저널 발행국 | 지면 스크랩 번호: KCJ-20260821-009</span>
          <span>본 지면의 모든 저작권은 한국문화저널에 있으며 무단 전재를 금합니다.</span>
        </div>
      </div>

      {/* Prev / Next Page navigation floating bar */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={currentPageIndex === 0}
          onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" /> 이전 면 ({currentPageIndex > 0 ? `${currentPageIndex}면` : ''})
        </button>
        <span className="text-xs font-bold text-gray-600">
          {currentPageIndex + 1} / {PAPER_PAGES.length} 면
        </span>
        <button
          disabled={currentPageIndex === PAPER_PAGES.length - 1}
          onClick={() => setCurrentPageIndex(prev => Math.min(PAPER_PAGES.length - 1, prev + 1))}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
        >
          다음 면 ({currentPageIndex < PAPER_PAGES.length - 1 ? `${currentPageIndex + 2}면` : ''}) <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
