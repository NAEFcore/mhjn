import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Globe2 } from 'lucide-react';
import { Article } from '../types';
import { subscribeToFirestoreArticles } from '../firebase';

/**
 * 특별기획보도 기사 링크 목록
 *
 * 기사 링크만 한 줄씩 추가하면 이 페이지에 자동으로 노출됩니다.
 * 예: 'https://mhjn.vercel.app/article/art-1234'
 */
const SPECIAL_REPORT_LINKS: string[] = [
  // 1차 보도 링크를 여기에 한 줄씩 붙여 넣으세요.
];

const ARTICLE_BASE_URL = '/article/';

function getArticleId(url: string) {
  const match = url.match(/\/article\/([^/?#]+)/);
  return match?.[1] ?? '';
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function NorthernSsireumSpecialPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToFirestoreArticles(
      incoming => setArticles(Array.isArray(incoming) ? incoming : []),
      () => setArticles([]),
    );
    return () => unsubscribe?.();
  }, []);

  const reports = useMemo(() => {
    return SPECIAL_REPORT_LINKS.map(url => {
      const articleId = getArticleId(url);
      const article = articles.find(item => item.id === articleId);
      return { url, article };
    });
  }, [articles]);

  const goHome = () => {
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="bg-[#111927] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div>
            <div className="text-xs font-bold tracking-[0.18em] text-slate-300">한국문화저널 · 특별기획</div>
            <div className="mt-1 text-lg font-black">북방씨름과 세계전통레슬링</div>
          </div>
          <button
            type="button"
            onClick={goHome}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            한국문화저널
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 bg-white px-5 py-7 sm:px-8">
            <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1769aa]">
              <Globe2 className="h-4 w-4" />
              International Intangible Cultural Heritage Day 2026
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              북방씨름과 세계전통레슬링
              <span className="block text-[#1769aa]">특별기획보도</span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              한국문화저널이 1차 보도한 북방씨름과 세계 각 지역 전통레슬링 관련 기사를 한곳에서 연결해 보여주는 특별기획 페이지입니다.
            </p>
          </div>

          <div className="bg-slate-50 px-5 py-6 sm:px-8">
            <img
              src="/assets/unesco-ich-day-2026.png"
              alt="In support of the International Day of Intangible Cultural Heritage"
              className="mx-auto w-full max-w-3xl object-contain"
            />
            <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-6 text-slate-500">
              2026 국제 무형유산의 날(10월 17일) 관련 특별기획보도 페이지입니다. 이 페이지의 로고 사용은 해당 기념일과 직접 관련된 커뮤니케이션을 위한 것이며 UNESCO의 후원·승인을 의미하지 않습니다.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#1769aa]">SPECIAL REPORT</p>
              <h2 className="mt-1 text-2xl font-black">1차 보도</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">{reports.length}건</span>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm leading-7 text-slate-500">
              아직 등록된 기사가 없습니다.<br />
              <span className="font-semibold text-slate-700">SPECIAL_REPORT_LINKS</span>에 한국문화저널 기사 URL만 추가하면 이곳에 자동으로 노출됩니다.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map(({ url, article }, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url.startsWith('/') ? url : url}
                  className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1769aa]">
                        {article?.categoryLabel || '특별기획'}
                        {article?.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ''}
                      </div>
                      <h3 className="mt-2 text-lg font-extrabold leading-7 group-hover:text-[#1769aa]">
                        {article?.title || '한국문화저널 특별기획 기사'}
                      </h3>
                      {article?.summary && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.summary}</p>
                      )}
                    </div>
                    <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#1769aa]" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
