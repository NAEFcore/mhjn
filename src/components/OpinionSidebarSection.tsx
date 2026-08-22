import React from 'react';
import { Feather, ChevronRight, Quote, BookOpen } from 'lucide-react';

interface OpinionSidebarSectionProps {
  onOpenEditorialModal: () => void;
  onSelectColumn?: (colId: string) => void;
}

export const OpinionSidebarSection: React.FC<OpinionSidebarSectionProps> = ({
  onOpenEditorialModal,
}) => {
  const opinions = [
    {
      id: 'op-1',
      category: '사설',
      title: '국외 유출 문화유산 23만 점, 상설 전시면제 협정 체결해야',
      author: '논설위원실',
      role: '본지 주필',
      avatar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 'op-2',
      category: '문화시론',
      title: 'K-컬처 열풍 뒤에 가려진 ‘무형유산 전승 단절’의 경고',
      author: '이진원',
      role: '석좌연구위원',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 'op-3',
      category: '전시비평',
      title: '달항아리의 침묵, 서양 미니멀리즘을 압도한 조선의 미학',
      author: '정서윤',
      role: '수석 미술평론가',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-[#d8d3cb] p-5 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#e2ded6] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#1b2a47] text-amber-300">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 font-serif-kr">
            사설 · 오피니언 · 칼럼
          </h3>
        </div>
        <button
          onClick={onOpenEditorialModal}
          className="text-xs text-[#1b2a47] hover:text-amber-800 font-bold flex items-center gap-0.5"
        >
          <span>전체보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Opinion List Items */}
      <div className="divide-y divide-[#eeebe3]">
        {opinions.map((item, idx) => (
          <div
            key={item.id}
            onClick={onOpenEditorialModal}
            className="py-3 first:pt-0 last:pb-0 cursor-pointer group flex items-start gap-3 transition-colors"
          >
            <img
              src={item.avatar}
              alt={item.author}
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
        onClick={onOpenEditorialModal}
        className="mt-4 p-2.5 bg-[#f8f6f2] rounded-xl border border-[#ded8cf] text-[11px] text-slate-600 flex items-center justify-between cursor-pointer hover:bg-[#f0ebe3] transition-colors"
      >
        <span className="font-serif-kr">석학 및 문화전문가 정기 기고란</span>
        <span className="text-[10px] font-bold text-[#1b2a47]">지면 읽기 &rarr;</span>
      </div>
    </section>
  );
};
