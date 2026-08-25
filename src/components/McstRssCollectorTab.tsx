import React, { useState, useEffect } from 'react';
import { Rss, RefreshCw, ExternalLink, CheckCircle2, ArrowRight, Clock, Image, FileText, AlertCircle } from 'lucide-react';
import { McstRssItem } from '../types';
import { loadPersistedMcstRssItems, savePersistedMcstRssItems } from '../utils/storage';

interface McstRssCollectorTabProps {
  onRegisterAsArticle: (item: McstRssItem) => void;
}

export const McstRssCollectorTab: React.FC<McstRssCollectorTabProps> = ({
  onRegisterAsArticle,
}) => {
  const [items, setItems] = useState<McstRssItem[]>(() => loadPersistedMcstRssItems());
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchMcstRss = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/rss/mcst');
      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        setItems(data.items);
        savePersistedMcstRssItems(data.items);
        setLastFetchedAt(new Date().toLocaleTimeString('ko-KR'));
        setFeedbackMessage(`문화체육관광부 공식 RSS에서 최신 ${data.items.length}건의 기사를 성공적으로 수집했습니다.`);
      } else {
        throw new Error('데이터 파싱 실패');
      }
    } catch (err: any) {
      console.error('MCST RSS fetch error:', err);
      setFeedbackMessage('RSS 피드 수집 중 통신 오류가 발생하여 내장 보도자료 데이터를 로드했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      fetchMcstRss();
    }
  }, []);

  return (
    <div className="space-y-5 text-xs font-sans">
      {/* Header info */}
      <div className="p-4 bg-gradient-to-r from-[#1b2a47]/5 via-amber-50 to-blue-50/50 border border-amber-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1b2a47] text-amber-300 rounded-lg">
              <Rss className="w-4 h-4" />
            </span>
            <h3 className="font-serif-kr text-base font-bold text-slate-900">
              문화체육관광부 공식 RSS 수집함
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
              공식 연동 피드
            </span>
          </div>
          <p className="text-slate-600 text-[11px]">
            연동 URL: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono">http://www.mcst.go.kr/common/rss/press.jsp</code>
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMcstRss}
          disabled={isLoading}
          className="px-4 py-2 bg-[#1b2a47] hover:bg-[#253960] text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'RSS 동기화 수집 중...' : '최신 RSS 피드 가져오기'}</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
          {lastFetchedAt && <span className="text-[10px] text-emerald-600">({lastFetchedAt} 갱신)</span>}
        </div>
      )}

      {/* Item List Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <span className="font-serif-kr font-bold text-slate-900 text-sm">
            수집된 최신 보도자료 목록 ({items.length}건)
          </span>
          <span className="text-slate-500 text-[11px]">
            '기사로 등록하기'를 누르면 에디터로 자동 전송되어 즉시 송고할 수 있습니다.
          </span>
        </div>

        {items.length === 0 && !isLoading ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-slate-600 font-bold">수집된 RSS 기사가 없습니다.</p>
            <button
              onClick={fetchMcstRss}
              className="px-3 py-1.5 bg-[#1b2a47] text-white rounded-lg text-xs font-bold"
            >
              RSS 피드 수집 시작
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start"
              >
                <div className="flex gap-3.5 flex-1 min-w-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg border border-slate-200 shrink-0 bg-[#f8f6f2] flex flex-col items-center justify-center text-slate-400">
                      <Image className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">기본 이미지</span>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-serif-kr">
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.pubDate}
                      </span>
                    </div>

                    <h4 className="font-serif-kr font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-serif-kr">
                      {item.description}
                    </p>

                    <div className="pt-1">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>원문 보도자료 링크 보기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onRegisterAsArticle(item)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>기사로 등록하기</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
