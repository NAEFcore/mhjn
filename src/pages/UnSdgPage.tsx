import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Leaf, 
  BookOpen, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Scale, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { SdgPublishersCompactWheel } from '../components/SdgPublishersCompactWheel';
import { Language } from '../types';

interface UnSdgPageProps {
  onBackToHome: () => void;
  lang?: Language;
}

export const UnSdgPage: React.FC<UnSdgPageProps> = ({ onBackToHome, lang = 'ko' }) => {
  const isEn = lang === 'en';

  const [selectedGoalIndex, setSelectedGoalIndex] = useState<number | null>(null);

  // The 17 UN Sustainable Development Goals
  const sdgGoals = [
    { num: 1, name: '빈곤 퇴치', nameEn: 'No Poverty', color: '#E5243B', desc: '모든 곳에서 모든 형태의 빈곤 종식' },
    { num: 2, name: '기아 종식', nameEn: 'Zero Hunger', color: '#DDA63A', desc: '식량 안보 달성 및 지속가능한 농업 증진' },
    { num: 3, name: '건강과 복지', nameEn: 'Good Health & Well-being', color: '#4C9F38', desc: '모든 연령층을 위한 건강한 삶 보장' },
    { num: 4, name: '양질의 교육', nameEn: 'Quality Education', color: '#C5192D', desc: '모두를 위한 포용적이고 공평한 양질의 교육' },
    { num: 5, name: '성평등', nameEn: 'Gender Equality', color: '#FF3A21', desc: '성평등 달성 및 모든 여성과 여아의 역량 강화' },
    { num: 6, name: '깨끗한 물과 위생', nameEn: 'Clean Water & Sanitation', color: '#26BDE2', desc: '모두를 위한 물과 위생의 이용가능성 및 지속가능한 관리' },
    { num: 7, name: '모두를 위한 지속가능한 에너지', nameEn: 'Affordable & Clean Energy', color: '#FCC30B', desc: '적정 가격의 신뢰할 수 있는 지속가능한 현대적 에너지' },
    { num: 8, name: '양질의 일자리와 경제성장', nameEn: 'Decent Work & Economic Growth', color: '#A21942', desc: '포용적이고 지속가능한 경제 성장과 생산적 일자리' },
    { num: 9, name: '산업·혁신 및 인프라', nameEn: 'Industry, Innovation & Infrastructure', color: '#FD6925', desc: '회복력 있는 인프라 구축, 지속가능한 산업화 및 혁신' },
    { num: 10, name: '불평등 해소', nameEn: 'Reduced Inequalities', color: '#DD1367', desc: '국가 내 및 국가 간 불평등 감소' },
    { num: 11, name: '지속가능한 도시와 공동체', nameEn: 'Sustainable Cities & Communities', color: '#FD9D24', desc: '포용적이고 안전하며 회복력 있는 지속가능한 도시 및 거주지' },
    { num: 12, name: '책임감 있는 소비와 생산', nameEn: 'Responsible Consumption & Production', color: '#BF8B2E', desc: '지속가능한 소비 및 생산 패턴 보장' },
    { num: 13, name: '기후위기 대응', nameEn: 'Climate Action', color: '#3F7E44', desc: '기후변화와 그 영향에 대처하기 위한 긴급한 행동' },
    { num: 14, name: '해양생태계 보전', nameEn: 'Life Below Water', color: '#0A97D9', desc: '지속가능한 발전을 위한 해양과 해양자원의 보전 및 이용' },
    { num: 15, name: '육상생태계 보전', nameEn: 'Life on Land', color: '#56C02B', desc: '육상 생태계 보호, 복원 및 지속가능한 이용 증진' },
    { num: 16, name: '평화·정의·효과적인 제도', nameEn: 'Peace, Justice & Strong Institutions', color: '#00689D', desc: '평화롭고 포용적인 사회 증진, 모두에게 정의 보장' },
    { num: 17, name: '지구촌 협력체계 구축', nameEn: 'Partnerships for the Goals', color: '#19486A', desc: '지속가능발전을 위한 글로벌 파트너십 활성화' },
  ];

  // 10 Commitments of Publishers Compact
  const commitments = [
    { title: '지속가능성 콘텐츠 보도 확대', titleEn: 'Expanding Sustainability Coverage', desc: '기후위기, 문화다양성, 헤리티지 보전과 관련된 심층 탐사보도를 매주 지속적으로 송고합니다.' },
    { title: '탄소중립 및 친환경 인쇄 원칙', titleEn: 'Green Printing & Digital Carbon Reduction', desc: '디지털 뉴스룸의 에너지 효율화 및 재생 용지 사용 원칙을 준수합니다.' },
    { title: '글로벌 문화다양성과 포용성 실천', titleEn: 'Cultural Diversity & Inclusivity', desc: '소외계층, 장애인, 다문화 예술인의 창작 활동을 차별 없이 조명하고 권익을 옹호합니다.' },
    { title: '팩트체크와 투명한 저널리즘', titleEn: 'Fact-checking & Editorial Transparency', desc: '가짜뉴스와 왜곡된 역사 인식을 배격하고, 유엔 헌장 및 신문윤리강령을 엄격히 준수합니다.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-bold text-[#1b2a47] hover:underline bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? 'Back to Newsroom' : '← 메인 기사 목록으로 돌아가기'}</span>
        </button>

        <a
          href="https://www.un.org/sustainabledevelopment/sdg-publishers-compact/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
        >
          <span>UN 공식 SDG Publishers Compact 웹사이트</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Official Hero Declaration */}
      <div className="bg-gradient-to-br from-[#111927] via-[#1b2a47] to-[#0f172a] text-white rounded-3xl p-6 sm:p-10 border border-[#2d3e5f] shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Circular Wheel Asset */}
          <div className="shrink-0">
            <SdgPublishersCompactWheel size={140} className="shadow-2xl" />
          </div>

          <div className="space-y-3.5 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
              <Globe className="w-3.5 h-3.5" />
              <span>UNITED NATIONS SDG PUBLISHERS COMPACT SIGNATORY</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-kr tracking-tight leading-snug">
              한국문화저널은 유엔 퍼블리셔 콤팩트 협약 매체로써<br className="hidden sm:inline" />
              유엔의 SDG 프로젝트를 지지합니다.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
              {isEn ? (
                'Korea Culture Journal is an official signatory to the United Nations SDG Publishers Compact. We inspire, inform, and advocate for sustainable cultural development, climate awareness, and heritage preservation worldwide.'
              ) : (
                '한국문화저널은 유엔 지속가능발전목표(SDG) 퍼블리셔 콤팩트에 공식 서약한 문화 정론지입니다. 문화·예술과 전통 유산의 힘으로 지구촌 기후위기 대응, 양질의 교육, 불평등 해소 및 평화로운 사회 구축에 기여합니다.'
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <a
                href="https://www.un.org/sustainabledevelopment/sdg-publishers-compact/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>UN SDG Publishers Compact 공식 서약 확인</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {commitments.map((c, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 hover:border-[#1b2a47] transition-all">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#1b2a47] flex items-center justify-center font-bold font-mono">
              0{idx + 1}
            </div>
            <h3 className="font-bold font-serif-kr text-slate-900 text-sm">
              {isEn ? c.titleEn : c.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {c.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive 17 Goals Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif-kr text-slate-900">
              UN 지속가능발전목표 (SDGs) 17대 과제
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              각 목표 카드를 클릭하여 한국문화저널의 저널리즘 실천 지침을 확인하세요.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            17 GOALS FOR SUSTAINABILITY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sdgGoals.map((goal, idx) => {
            const isSelected = selectedGoalIndex === idx;
            return (
              <button
                key={goal.num}
                onClick={() => setSelectedGoalIndex(isSelected ? null : idx)}
                style={{ backgroundColor: goal.color }}
                className={`p-3.5 rounded-2xl text-white text-left flex flex-col justify-between h-28 transition-all relative overflow-hidden shadow-xs hover:scale-105 ${
                  isSelected ? 'ring-4 ring-slate-900 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-black font-mono leading-none">{goal.num}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-black leading-tight line-clamp-2">
                    {isEn ? goal.nameEn : goal.name}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Goal Highlight Details */}
        {selectedGoalIndex !== null && (
          <div 
            style={{ borderLeftColor: sdgGoals[selectedGoalIndex].color }}
            className="p-5 bg-slate-50 rounded-2xl border-l-4 border-t border-r border-b border-slate-200 space-y-2 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span 
                style={{ backgroundColor: sdgGoals[selectedGoalIndex].color }}
                className="px-2.5 py-0.5 rounded-full text-white text-xs font-black font-mono"
              >
                GOAL {sdgGoals[selectedGoalIndex].num}
              </span>
              <h3 className="font-bold text-slate-900 text-sm font-serif-kr">
                {sdgGoals[selectedGoalIndex].name} ({sdgGoals[selectedGoalIndex].nameEn})
              </h3>
            </div>
            <p className="text-xs text-slate-700 font-sans leading-relaxed">
              {sdgGoals[selectedGoalIndex].desc}
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              ※ 한국문화저널은 해당 과제와 관련된 문화재 보전 현장, 사회적 약자 문화 향유권, 친환경 예술 실천 사례를 지속 보도합니다.
            </p>
          </div>
        )}
      </div>

      {/* Official Signatory Note */}
      <div className="p-6 bg-[#f5f1eb] rounded-2xl border border-[#ded8cf] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700 font-sans">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-bold text-slate-900 font-serif-kr text-sm">
            유엔 퍼블리셔 콤팩트(SDG Publishers Compact)란?
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">
            전 세계 출판사, 언론사, 학술 기관이 유엔과 협력하여 2030년까지 17개 지속가능발전목표(SDG) 달성을 촉진하기 위해 행동을 약속하는 글로벌 서약입니다. 한국문화저널은 정론직필을 통해 전 인류의 지속가능한 미래에 동참합니다.
          </p>
        </div>
        <a
          href="https://www.un.org/sustainabledevelopment/sdg-publishers-compact/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#1b2a47] text-white font-bold rounded-xl hover:bg-[#25375c] transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>자세히 보기 (UN 공식)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
