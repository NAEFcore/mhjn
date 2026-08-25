import React from 'react';
import { Feather, ChevronRight, Quote, BookOpen, ArrowRight } from 'lucide-react';
import { Article } from '../types';

interface OpinionSidebarSectionProps {
  onOpenEditorialModal?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onSelectArticle?: (article: Article) => void;
  articles?: Article[];
}

export const OpinionSidebarSection: React.FC<OpinionSidebarSectionProps> = ({
  onOpenEditorialModal,
  onSelectCategory,
  onSelectArticle,
  articles = [],
}) => {
  // Dynamically filter opinion articles from live articles data
  const realTimeOpinionArticles = articles.filter(
    (a) => a.category === 'opinion' || a.tags.some(t => ['사설', '칼럼', '오피니언', '시론', '비평'].includes(t))
  );

  const defaultOpinions = [
    {
      id: 'art-op-1',
      category: '사설',
      title: '[사설] 국외 유출 문화유산 23만 점, 상설 전시면제 협정 체결해야',
      author: '논설위원실',
      role: '본지 주필',
      avatar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 'art-op-2',
      category: '문화시론',
      title: '[이진원의 문화시론] K-컬처 열풍 뒤에 가려진 ‘무형유산 전승 단절’의 경고',
      author: '이진원',
      role: '석좌연구위원',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 'art-op-3',
      category: '전시비평',
      title: '[전시비평] 달항아리의 침묵, 서양 미니멀리즘을 압도한 조선의 미학',
      author: '정서윤',
      role: '수석 미술평론가',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    },
  ];

  // Display items: use real-time opinion articles if available, supplemented by default
  const displayItems = realTimeOpinionArticles.length > 0
    ? realTimeOpinionArticles.slice(0, 4).map((art) => {
        // Prioritize the actual article's main photo/image, fallback to reporter avatar
        const photoUrl = art.imageUrl || art.reporter?.avatar || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=200';
        return {
          id: art.id,
          category: art.badge || (art.title.startsWith('[사설]') ? '사설' : art.title.startsWith('[칼럼]') ? '칼럼' : '오피니언'),
          title: art.title,
          author: art.reporter?.name || '논설위원실',
          role: art.reporter?.title || '전문 필진',
          avatar: photoUrl,
          originalArticle: art,
        };
      })
    : defaultOpinions.map(d => ({ ...d, originalArticle: undefined as Article | undefined }));

  const handleHeaderClick = () => {
    if (onSelectCategory) {
      onSelectCategory('opinion');
    } else if (onOpenEditorialModal) {
      onOpenEditorialModal();
    }
  };

  const handleItemClick = (item: typeof displayItems[0]) => {
    if (item.originalArticle && onSelectArticle) {
      onSelectArticle(item.originalArticle);
      return;
    }

    // Look for matching article in the articles list
    const foundArticle = articles.find(
      (a) => a.id === item.id || a.title.includes(item.category) || (a.category === 'opinion' && a.title.includes(item.author))
    );

    if (foundArticle && onSelectArticle) {
      onSelectArticle(foundArticle);
    } else if (onSelectArticle) {
      const fallbackArticle: Article = {
        id: item.id,
        category: 'opinion',
        categoryLabel: '오피니언',
        title: item.title,
        subtitle: `${item.author} ${item.role}의 한국문화저널 심층 칼럼 및 사설`,
        summary: `${item.author} ${item.role}이 전하는 문화 예술 현안에 대한 통찰과 비평 리포트입니다.`,
        content: `${item.title}\n\n한국문화저널 오피니언 데스크입니다.\n\n문화는 한 시대의 거울이자 미래를 여는 열쇠입니다. 본지는 격변하는 글로벌 문화 지형 속에서 전통의 가치를 재발견하고 품격 있는 담론을 형성하기 위해 각계 석학과 문화예술 전문가들의 혜안을 전합니다.\n\n[기고 및 비평 전문]\n${item.title}에 관한 심층적인 분석과 제언이 이어집니다. 본 칼럼에 대한 독자 여러분의 품격 있는 의견과 건설적인 토론을 환영합니다.`,
        reporter: {
          id: `rep-${item.id}`,
          name: item.author,
          title: item.role,
          department: '오피니언 데스크',
          email: 'opinion@kculturejournal.com',
          avatar: item.avatar,
          bio: `${item.author} ${item.role} / 한국문화저널 전문 필진`,
          subscriberCount: 18200,
          cheerCount: 2300,
        },
        publishedAt: '2026.08.21',
        views: 38200,
        shares: 420,
        likes: 1250,
        reactions: { info: 210, exciting: 180, empathy: 490, analysis: 320, followup: 150 },
        imageUrl: item.avatar,
        imageCaption: `▲ ${item.author} ${item.role}`,
        tags: ['사설', '오피니언', '칼럼', '한국문화저널'],
        badge: item.category as any,
        commentsCount: 32,
        mainNewsEnabled: true,
        subNewsEnabled: true,
        subNewsCategory: 'politics_economy',
      };
      onSelectArticle(fallbackArticle);
    } else if (onSelectCategory) {
      onSelectCategory('opinion');
    } else if (onOpenEditorialModal) {
      onOpenEditorialModal();
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-[#d8d3cb] p-5 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#e2ded6] pb-3 mb-4">
        <div 
          onClick={handleHeaderClick}
          className="flex items-center gap-2 cursor-pointer group"
          title="오피니언 카테고리로 이동"
        >
          <div className="p-1 rounded-md bg-[#1b2a47] text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 font-serif-kr group-hover:text-[#1b2a47] transition-colors">
            사설 · 오피니언 · 칼럼
          </h3>
        </div>
        <button
          onClick={handleHeaderClick}
          className="text-xs text-[#1b2a47] hover:text-amber-800 font-bold flex items-center gap-0.5"
          title="오피니언 섹션 전체 기사 보기"
        >
          <span>섹션 바로가기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Opinion List Items */}
      <div className="divide-y divide-[#eeebe3]">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="py-3 first:pt-0 last:pb-0 cursor-pointer group flex items-start gap-3 transition-colors hover:bg-slate-50/80 -mx-2 px-2 rounded-lg"
            title="기사 본문 읽기"
          >
            <img
              src={item.avatar}
              alt={item.author}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-[#d8d3cb] shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#f5f1eb] text-slate-700 rounded border border-[#e2ded6] font-serif-kr">
                  {item.category}
                </span>
                <span className="text-[11px] font-bold text-slate-800 truncate">
                  {item.author}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.role}
                </span>
              </div>
              <h4 className="text-xs font-bold font-serif-kr text-slate-900 group-hover:text-[#1b2a47] leading-snug line-clamp-2 transition-colors">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Editorial Notice */}
      <div 
        onClick={handleHeaderClick}
        className="mt-4 p-2.5 bg-[#f8f6f2] rounded-xl border border-[#ded8cf] text-[11px] text-slate-600 flex items-center justify-between cursor-pointer hover:bg-[#f0ebe3] hover:text-slate-900 transition-colors"
        title="오피니언 카테고리 전체 목록 보기"
      >
        <span className="font-serif-kr font-bold text-slate-700">석학 및 문화전문가 정기 기고란</span>
        <span className="text-[10px] font-bold text-[#1b2a47] flex items-center gap-0.5">
          <span>오피니언 홈</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </section>
  );
};
