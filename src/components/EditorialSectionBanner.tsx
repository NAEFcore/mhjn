import React from 'react';
import { ShieldCheck, Feather, Scale, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

interface EditorialSectionBannerProps {
  onOpenFactCheck: () => void;
  onOpenEditorial: () => void;
  onOpenOmbudsman: () => void;
}

export const EditorialSectionBanner: React.FC<EditorialSectionBannerProps> = ({
  onOpenFactCheck,
  onOpenEditorial,
  onOpenOmbudsman,
}) => {
  return (
    <section className="bg-gradient-to-r from-[#1b2a47] via-[#24355a] to-[#1b2a47] rounded-2xl p-5 md:p-6 text-white shadow-md border border-[#2d3e5f]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded tracking-tight">
              한국문화저널 정론 데스크
            </span>
            <span className="text-xs text-slate-300 font-serif-kr">진실과 품격의 문화 저널리즘</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold font-serif-kr tracking-tight text-white">
            문화재 팩트체크 · 수석논설위원 사설칼럼 · 독자권익위원회
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-amber-200/80 font-mono">신문 윤리강령 준수 언론</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* 1. Cultural Fact Check */}
        <div 
          onClick={onOpenFactCheck}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:border-amber-300/40 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-300 font-serif-kr">문화유산 팩트체크</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-serif-kr font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-amber-200 transition-colors">
            [검증] 훈민정음 상주본 실물 훼손설의 진실
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            국가유산청 감정위원단 분석 결과와 법적 소유권 쟁점을 심층 검증했습니다.
          </p>
        </div>

        {/* 2. Editorial & Column */}
        <div 
          onClick={onOpenEditorial}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:border-emerald-300/40 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300">
                <Feather className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-300 font-serif-kr">오늘의 사설·논설</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-serif-kr font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-emerald-200 transition-colors">
            [사설] 해외 유출 문화재 23만 점, 체계적 환수 원년으로
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            민관 협력 기금 조성과 외교적 교섭력 강화가 시급한 시점입니다.
          </p>
        </div>

        {/* 3. Ombudsman & Correction */}
        <div 
          onClick={onOpenOmbudsman}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-300/40 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-300">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-300 font-serif-kr">독자권익 & 정정보도</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-serif-kr font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-blue-200 transition-colors">
            뉴스 미란다 원칙 준수 창구
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            정정보도 청구, 오보 신고 및 고충처리인 상담 신청 (24시간 접수)
          </p>
        </div>
      </div>
    </section>
  );
};
