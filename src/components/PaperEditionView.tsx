import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Printer, 
  Maximize2, 
  Eye, 
  X, 
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Share2,
  Bookmark
} from 'lucide-react';
import { Article, PaperPage } from '../types';

interface PaperEditionViewProps {
  articles?: Article[];
  onSelectArticle: (article: Article) => void;
}

export const PaperEditionView: React.FC<PaperEditionViewProps> = ({ 
  articles = [], 
  onSelectArticle 
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large'>('normal');
  const [showFullPaperModal, setShowFullPaperModal] = useState(false);
  const [pdfHelpOpen, setPdfHelpOpen] = useState(false);

  // Dynamic Today Date formatting
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[today.getDay()];
  const todayFormatted = `${year}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${dayName}`;
  const todayHeaderFormatted = `${year}. ${month}. ${date} (${dayName.slice(0, 1)})`;

  // Calculate Issue Number (Founded in 2016)
  const baseFoundedDate = new Date('2016-03-01').getTime();
  const daysDiff = Math.max(1, Math.floor((today.getTime() - baseFoundedDate) / (1000 * 3600 * 24)));
  const issueNumber = (2800 + Math.floor(daysDiff * 0.72)).toLocaleString();

  // Dynamic Page Generation based on Admin Page Assignments
  const dynamicPages: PaperPage[] = useMemo(() => {
    const publishedArticles = articles.filter(a => !a.status || a.status === 'PUBLISHED');

    const PAGE_DEFS = [
      { pageNumber: 1, sectionName: '종합 1면 (헤드라인)', categories: ['culture_art', 'heritage', 'k_culture'] },
      { pageNumber: 2, sectionName: '2면 (문화·예술 심층)', categories: ['culture_art', 'art_exhibition', 'performance'] },
      { pageNumber: 3, sectionName: '3면 (전통·유산·기획)', categories: ['heritage', 'academic', 'history'] },
      { pageNumber: 4, sectionName: '4면 (K-컬처·오피니언)', categories: ['k_culture', 'opinion', 'people', 'global'] },
    ];

    return PAGE_DEFS.map((def, idx) => {
      // 1. Find articles explicitly assigned to this pageNumber by admin
      // pageNumber itself is now the explicit administrator assignment.
      // Do not require the newer paperAssigned flag: older Firestore records
      // created before that flag was introduced would otherwise appear on PC cache
      // but disappear on a fresh mobile load.
      const explicitlyAssigned = publishedArticles.filter(a => a.pageNumber === def.pageNumber);
      
      let pageArticles: Article[] = [];

      // Newspaper pages must show ONLY articles explicitly assigned by the administrator.
      // Never auto-fill from category, headlines, live articles, or mock data.
      pageArticles = explicitlyAssigned.slice(0, 6);

      // Ensure top headline is first
      const topArt = pageArticles.find(a => a.isTopHeadline) || pageArticles[0];
      const otherArts = pageArticles.filter(a => a?.id !== topArt?.id);
      const orderedArts = topArt ? [topArt, ...otherArts] : pageArticles;

      return {
        pageNumber: def.pageNumber,
        sectionName: def.sectionName,
        title: topArt ? topArt.title : `한국문화저널 제${def.pageNumber}면`,
        subtitle: topArt?.subtitle || '대한민국 문화·예술·전통유산 정론 보도',
        date: todayFormatted,
        topArticle: topArt,
        subArticles: otherArts,
        articles: orderedArts,
      };
    });
  }, [articles, todayFormatted]);

  const currentPage = dynamicPages[currentPageIndex] || dynamicPages[0];

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Download Handler (triggers browser high-quality PDF print dialog)
  const handleDownloadPdf = () => {
    setPdfHelpOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="my-6">
      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #newspaper-printable-area, #newspaper-printable-area * {
            visibility: visible;
          }
          #newspaper-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Controls Bar */}
      <div className="no-print bg-white rounded-xl border border-gray-300 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#004b93] text-white rounded-xl shadow-xs">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
                오늘의 신문 지면보기 (제{issueNumber}호)
              </h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded">
                창간 2016년
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              발행일: {todayFormatted} · 관리자 지정 지면(1~4면) 실시간 반영 조판
            </p>
          </div>
        </div>

        {/* Page selector buttons & Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Page Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            {dynamicPages.map((page, idx) => (
              <button
                key={page.pageNumber}
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currentPageIndex === idx
                    ? 'bg-[#004b93] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {page.pageNumber}면
              </button>
            ))}
          </div>

          {/* Zoom Toggle */}
          <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => setZoomLevel(zoomLevel === 'normal' ? 'large' : 'normal')}
              className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md text-xs font-semibold flex items-center gap-1 border border-gray-200"
              title="지면 확대/축소"
            >
              {zoomLevel === 'normal' ? <ZoomIn className="w-4 h-4 text-blue-600" /> : <ZoomOut className="w-4 h-4 text-blue-600" />}
              <span>{zoomLevel === 'normal' ? '확대' : '표준'}</span>
            </button>
          </div>

          {/* Action Buttons: Print, PDF Download, Full Paper View */}
          <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs"
              title="지면 인쇄하기"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>지면 인쇄</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-300 transition-colors shadow-2xs"
              title="PDF 지면신문 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>PDF 다운로드</span>
            </button>

            <button
              onClick={() => setShowFullPaperModal(true)}
              className="px-3 py-1.5 bg-[#1b2a47] hover:bg-[#273d66] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="1면부터 4면까지 전체 지면 한눈에 보기"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>지면 전체보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Download Helper Notice */}
      {pdfHelpOpen && (
        <div className="no-print mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>PDF 저장 안내:</strong> 인쇄 창이 열리면 대상 프린터를 <strong>[PDF로 저장 / Save as PDF]</strong>로 선택 후 저장 버튼을 누르시면 고화질 신문 지면 PDF가 저장됩니다.
            </span>
          </div>
          <button 
            onClick={() => setPdfHelpOpen(false)}
            className="text-amber-700 hover:text-amber-950 p-1 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realistic Paper Canvas Frame */}
      <div 
        id="newspaper-printable-area"
        className={`${
          zoomLevel === 'large' ? 'max-w-6xl text-base' : 'max-w-5xl'
        } mx-auto bg-[#faf9f6] border-2 border-gray-400 p-6 sm:p-10 shadow-2xl rounded-xs text-gray-900 newspaper-texture transition-all`}
      >
        {/* Newspaper Top Header (Masthead) */}
        <div className="border-b-4 border-double border-gray-900 pb-4 mb-6">
          <div className="flex items-center justify-between text-xs text-gray-700 font-serif-kr font-semibold border-b border-gray-400 pb-1 mb-2 flex-wrap gap-2">
            <span>{currentPage.date}</span>
            <span className="font-bold text-sm tracking-widest text-[#004b93]">
              {currentPage.sectionName}
            </span>
            <span>창간 2016년 · 대한민국 대표 문화지</span>
          </div>

          <div className="text-center py-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-kr tracking-widest text-gray-950">
              韓 國 文 化 저 널
            </h1>
            <p className="text-[11px] text-gray-600 tracking-wider mt-1 font-serif-kr">
              KOREA CULTURE JOURNAL · {todayHeaderFormatted} · 제 {issueNumber}호
            </p>
          </div>
        </div>

        {/* Paper Articles Layout (Lead Article & Sub Articles) */}
        {currentPage.articles.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-serif-kr">
            <p className="text-base font-bold">배정된 지면 기사가 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">관리자 데스크의 [지면 편집] 탭에서 기사를 배정해주세요.</p>
          </div>
        ) : currentPage.articles.length === 1 ? (
          <article
            onClick={() => onSelectArticle(currentPage.articles[0])}
            className="cursor-pointer group pt-2"
          >
            {/* Section tag / Kicker */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-800 border-b border-red-800 pb-0.5 font-serif-kr">
                [{currentPage.articles[0].subCategory || currentPage.articles[0].categoryLabel || '문화종합'}] {currentPage.articles[0].badge && `· ${currentPage.articles[0].badge}`}
              </span>
              <span className="text-[11px] text-gray-500 font-serif-kr">
                {currentPage.articles[0].reporter?.name || '편집국'} 기자
              </span>
            </div>

            <h3 className="font-serif-kr font-black text-gray-950 group-hover:text-[#004b93] text-3xl sm:text-4xl leading-tight tracking-tight mb-3 transition-colors">
              {currentPage.articles[0].title}
            </h3>

            {currentPage.articles[0].subtitle && (
              <div className="border-l-2 border-gray-900 pl-3 py-1 mb-4 text-sm font-serif-kr text-gray-700 leading-relaxed font-semibold">
                {currentPage.articles[0].subtitle}
              </div>
            )}

            {currentPage.articles[0].imageUrl && (
              <div className="relative aspect-[16/9] bg-gray-200 border border-gray-400 mb-4 overflow-hidden">
                <img
                  src={currentPage.articles[0].imageUrl}
                  alt={currentPage.articles[0].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 filter contrast-105"
                />
              </div>
            )}

            <div className="text-sm font-serif-kr text-gray-800 leading-relaxed columns-1 md:columns-2 gap-8">
              <p className="first-letter:text-3xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
                {(currentPage.articles[0].summary || currentPage.articles[0].content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 700)}...
              </p>
            </div>

            <div className="mt-6 pt-2 border-t border-dotted border-gray-300 flex items-center justify-between text-xs text-[#004b93] font-bold">
              <span>[기사 전문 읽기 / 디지털 인터랙티브 뷰]</span>
              <span>{currentPage.articles[0].publishedAt}</span>
            </div>
          </article>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-300">
            {/* Left 7 Cols: Lead Article */}
            <article
              onClick={() => onSelectArticle(currentPage.articles[0])}
              className="md:col-span-7 cursor-pointer group pt-6 md:pt-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-800 border-b border-red-800 pb-0.5 font-serif-kr">
                  [{currentPage.articles[0].subCategory || currentPage.articles[0].categoryLabel || '문화종합'}] {currentPage.articles[0].badge && `· ${currentPage.articles[0].badge}`}
                </span>
                <span className="text-[11px] text-gray-500 font-serif-kr">
                  {currentPage.articles[0].reporter?.name || '편집국'} 기자
                </span>
              </div>

              <h3 className="font-serif-kr font-black text-gray-950 group-hover:text-[#004b93] text-2xl sm:text-3xl leading-tight tracking-tight mb-3 transition-colors">
                {currentPage.articles[0].title}
              </h3>

              {currentPage.articles[0].subtitle && (
                <div className="border-l-2 border-gray-900 pl-3 py-0.5 mb-4 text-xs font-serif-kr text-gray-700 leading-relaxed font-semibold">
                  {currentPage.articles[0].subtitle}
                </div>
              )}

              {currentPage.articles[0].imageUrl && (
                <div className="relative aspect-[16/10] bg-gray-200 border border-gray-400 mb-3 overflow-hidden">
                  <img
                    src={currentPage.articles[0].imageUrl}
                    alt={currentPage.articles[0].title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 filter contrast-105"
                  />
                </div>
              )}

              {currentPage.articles[0].imageCaption && (
                <p className="text-[10px] text-gray-500 font-serif-kr italic mb-3">
                  {currentPage.articles[0].imageCaption}
                </p>
              )}

              <div className="text-xs font-serif-kr text-gray-800 leading-relaxed space-y-2">
                <p className="first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                  {(currentPage.articles[0].summary || currentPage.articles[0].content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 380)}...
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-dotted border-gray-300 flex items-center justify-between text-[11px] text-[#004b93] font-bold">
                <span>[전문 읽기 / 인터랙티브 뷰]</span>
                <span>{currentPage.articles[0].publishedAt}</span>
              </div>
            </article>

            {/* Right 5 Cols: Sub Articles */}
            <div className="md:col-span-5 md:pl-8 space-y-6 divide-y divide-gray-300 pt-6 md:pt-0">
              {currentPage.articles.slice(1).map((art, index) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className={`cursor-pointer group ${index > 0 ? 'pt-6' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-red-800 font-serif-kr">
                      [{art.subCategory || art.categoryLabel || '문화'}] {art.badge && `· ${art.badge}`}
                    </span>
                    <span className="text-[10px] text-gray-500 font-serif-kr">
                      {art.reporter?.name || '편집국'}
                    </span>
                  </div>

                  <h4 className="font-serif-kr font-black text-gray-950 group-hover:text-[#004b93] text-lg sm:text-xl leading-snug tracking-tight mb-2 transition-colors">
                    {art.title}
                  </h4>

                  {art.imageUrl && (
                    <div className="relative aspect-[16/9] bg-gray-200 border border-gray-300 mb-2 overflow-hidden">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <p className="text-[11px] font-serif-kr text-gray-700 leading-relaxed line-clamp-3 mb-2">
                    {(art.summary || art.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 160)}
                  </p>

                  <div className="text-[10px] text-gray-400 font-serif-kr flex items-center justify-between">
                    <span className="text-[#004b93] font-bold">[전문보기]</span>
                    <span>{art.publishedAt?.slice(0, 10)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Paper Footer Stamp */}
        <div className="border-t-2 border-gray-900 mt-10 pt-3 flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-serif-kr gap-2">
          <span>한국문화저널 발행국 | 지면 번호: KCJ-{year}{month}{date}-P{currentPage.pageNumber}</span>
          <span>창간 2016년 | 등록번호: 부산 아, 00245 | 본 지면의 모든 저작권은 한국문화저널에 있으며 무단 전재를 금합니다.</span>
        </div>
      </div>

      {/* Prev / Next Page navigation floating bar */}
      <div className="no-print flex items-center justify-center gap-4 mt-6">
        <button
          disabled={currentPageIndex === 0}
          onClick={() => {
            setCurrentPageIndex(prev => Math.max(0, prev - 1));
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" /> 이전 면 ({currentPageIndex > 0 ? `${currentPageIndex}면` : ''})
        </button>
        <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-2xs font-mono">
          {currentPageIndex + 1} / {dynamicPages.length} 면
        </span>
        <button
          disabled={currentPageIndex === dynamicPages.length - 1}
          onClick={() => {
            setCurrentPageIndex(prev => Math.min(dynamicPages.length - 1, prev + 1));
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
        >
          다음 면 ({currentPageIndex < dynamicPages.length - 1 ? `${currentPageIndex + 2}면` : ''}) <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL: Full 4-Page Broadsheet Newspaper Viewer & Print/PDF Modal */}
      {showFullPaperModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in">
          {/* Modal Top Control Bar */}
          <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between shadow-lg z-10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-serif-kr font-bold text-base text-white">
                  한국문화저널 전체 지면 보기 (1면~4면 전면 브로드시트)
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  {todayFormatted} · 제 {issueNumber}호 (창간 2016년)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#004b93]" />
                <span>지면 전체 인쇄</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>PDF 지면 다운로드</span>
              </button>

              <button
                onClick={() => setShowFullPaperModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 ml-2"
                aria-label="닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Body: Continuous 4-Page Broadsheet */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#e8e6e1]">
            {dynamicPages.map((page) => (
              <div 
                key={page.pageNumber}
                className="max-w-5xl mx-auto bg-[#faf9f6] border-2 border-gray-400 p-6 sm:p-10 shadow-2xl rounded-xs text-gray-900 newspaper-texture"
              >
                {/* Header */}
                <div className="border-b-4 border-double border-gray-900 pb-4 mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-700 font-serif-kr font-semibold border-b border-gray-400 pb-1 mb-2">
                    <span>{page.date}</span>
                    <span className="font-bold text-sm tracking-widest text-[#004b93]">
                      {page.sectionName}
                    </span>
                    <span>창간 2016년 · 대한민국 대표 문화지</span>
                  </div>

                  <div className="text-center py-2">
                    <h1 className="text-3xl sm:text-4xl font-black font-serif-kr tracking-widest text-gray-950">
                      韓 國 文 化 저 널
                    </h1>
                    <p className="text-[11px] text-gray-600 tracking-wider mt-1 font-serif-kr">
                      KOREA CULTURE JOURNAL · {todayHeaderFormatted} · 제 {issueNumber}호
                    </p>
                  </div>
                </div>

                {/* Articles */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-300">
                  {page.articles.map((art, idx) => {
                    const isLead = idx === 0;
                    const colSpan = isLead ? 'md:col-span-7' : 'md:col-span-5 md:pl-8';

                    return (
                      <article
                        key={art.id}
                        onClick={() => {
                          setShowFullPaperModal(false);
                          onSelectArticle(art);
                        }}
                        className={`${colSpan} cursor-pointer group pt-6 md:pt-0`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-800 border-b border-red-800 pb-0.5 font-serif-kr">
                            [{art.subCategory || art.categoryLabel || '문화종합'}] {art.badge && `· ${art.badge}`}
                          </span>
                          <span className="text-[11px] text-gray-500 font-serif-kr">
                            {art.reporter?.name || '편집국'} 기자
                          </span>
                        </div>

                        <h3 className={`font-serif-kr font-black text-gray-950 group-hover:text-[#004b93] leading-tight tracking-tight mb-3 transition-colors ${
                          isLead ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                        }`}>
                          {art.title}
                        </h3>

                        {art.subtitle && (
                          <div className="border-l-2 border-gray-900 pl-3 py-0.5 mb-4 text-xs font-serif-kr text-gray-700 leading-relaxed font-semibold">
                            {art.subtitle}
                          </div>
                        )}

                        {art.imageUrl && (
                          <div className="relative aspect-[16/10] bg-gray-200 border border-gray-400 mb-3 overflow-hidden">
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 filter contrast-105"
                            />
                          </div>
                        )}

                        <div className="text-xs font-serif-kr text-gray-800 leading-relaxed space-y-2">
                          <p className="first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                            {(art.summary || art.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 380)}...
                          </p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-dotted border-gray-300 flex items-center justify-between text-[11px] text-[#004b93] font-bold">
                          <span>[전문 읽기]</span>
                          <span>{art.publishedAt}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="border-t-2 border-gray-900 mt-10 pt-3 flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-serif-kr">
                  <span>한국문화저널 제{page.pageNumber}면 | KCJ-{year}{month}{date}-P{page.pageNumber}</span>
                  <span>본 지면의 모든 저작권은 한국문화저널에 있으며 무단 전재를 금합니다.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
