import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  MapPin, 
  BookOpen, 
  Share2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  Navigation,
  Compass,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { IssueCluster, IssuePlace, Article } from '../types';
import { IssueMap } from './IssueMap';

interface IssueDetailModalProps {
  issue: IssueCluster;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (articleId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<IssuePlace | null>(
    issue.places && issue.places.length > 0 ? issue.places[0] : null
  );
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const places = issue.places || [];

  // Filtered places by category
  const filteredPlaces = places.filter((p) => {
    if (placeFilter === 'all') return true;
    return p.type === placeFilter;
  });

  // Extract unique place types for filter tabs
  const placeTypes = Array.from(new Set(places.map((p) => p.type)));

  // Related articles
  const relatedArticles = articles.filter((a) => {
    if (issue.relatedArticleIds && issue.relatedArticleIds.includes(a.id)) return true;
    if (a.tags && a.tags.some((tag) => issue.keyword.includes(tag) || tag.includes(issue.keyword.replace('#', '')))) return true;
    if (a.title.includes(issue.keyword.replace('#', '').replace(/_/g, ' '))) return true;
    return false;
  });

  const fallbackArticles = relatedArticles.length > 0 ? relatedArticles : articles.slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-fade-in font-sans">
        
        {/* Modal Top Header */}
        <div className="bg-[#1b2a47] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                  {issue.keyword}
                </span>
                <span className="text-[11px] text-slate-300">
                  심층 이슈 브리핑 & 인터랙티브 맵
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-kr text-white mt-0.5">
                {issue.headline}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="이슈 링크 복사"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? '복사됨' : '공유'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Issue Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>업데이트: {issue.timeAgo}</span>
                <span>·</span>
                <span>관련 보도 <strong>{issue.articleCount}</strong>건</span>
              </div>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[11px]">
                한국문화저널 특별 취재반
              </span>
            </div>

            {issue.subtitle && (
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif-kr mb-2">
                {issue.subtitle}
              </h3>
            )}

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif-kr">
              {issue.description || '본 이슈는 대한민국 문화유산 및 예술계의 핵심 현안으로, 관련 기관 및 역사적 현장들의 유기적인 연계와 입체적인 사실 확인을 통해 심층 보도합니다.'}
            </p>
          </div>

          {/* INTERACTIVE MAP SECTION (지도는 오직 이슈 상세 페이지에서만 렌더링!) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif-kr">
                    이슈 연계 인터랙티브 지도
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    해당 이슈와 밀접하게 연관된 박물관, 소장처, 전승지, 공연장, 유적지 현장 정보입니다.
                  </p>
                </div>
              </div>

              {/* Category Filter Chips */}
              {placeTypes.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setPlaceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      placeFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    전체 ({places.length})
                  </button>
                  {placeTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setPlaceFilter(type)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        placeFilter === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type} ({places.filter((p) => p.type === type).length})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Render Interactive Map */}
            <IssueMap
              places={filteredPlaces}
              selectedPlaceId={selectedPlace?.id}
              onSelectPlace={(place) => setSelectedPlace(place)}
            />

            {/* Places List Grid */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>연계 현장 목록 ({filteredPlaces.length}곳)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  카드를 클릭하면 지도가 해당 장소로 이동합니다
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/40 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                          {place.type}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                          <span>지도 보기</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-serif-kr mb-1">
                        {place.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1.5 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{place.address}</span>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>

                      {/* Direction Quick Links */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">길찾기 바로가기:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://map.kakao.com/link/search/${encodeURIComponent(place.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#3c1e1e] font-bold hover:underline"
                          >
                            카카오맵
                          </a>
                          <span className="text-slate-300">|</span>
                          <a
                            href={`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#03c75a] font-bold hover:underline"
                          >
                            네이버지도
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Related Articles Clustered List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 text-amber-400 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif-kr">
                    이슈 묶음 관련 기사 ({fallbackArticles.length}편)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    사료와 현장 취재를 바탕으로 검증된 한국문화저널의 연속 보도입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {fallbackArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art.id);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 items-start"
                >
                  {art.imageUrl && (
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full sm:w-36 h-24 object-cover rounded-lg shrink-0 border border-slate-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <span className="px-2 py-0.5 rounded bg-slate-200 font-bold text-slate-700">
                        {art.categoryLabel || '문화속보'}
                      </span>
                      <span>{art.publishedAt}</span>
                      <span>·</span>
                      <span>{art.reporter?.name || '문화부 기자'}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 font-serif-kr group-hover:text-indigo-900 line-clamp-1 mb-1">
                      {art.title}
                    </h4>

                    {art.subtitle && (
                      <p className="text-xs text-slate-600 line-clamp-1 mb-1.5 font-serif-kr">
                        {art.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {art.summary || art.content.slice(0, 100)}
                    </p>

                    <div className="mt-2 flex items-center justify-end">
                      <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>전문 읽기</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-serif-kr">
            한국문화저널 · 사료 중심 검증 저널리즘
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
