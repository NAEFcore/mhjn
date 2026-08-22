import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';

interface FactCheckModalProps {
  onClose: () => void;
}

interface FactCheckItem {
  id: string;
  claim: string;
  claimant: string;
  verdict: 'TRUE' | 'MOSTLY_TRUE' | 'HALF_TRUE' | 'FALSE';
  verdictLabel: string;
  summary: string;
  evidence: string[];
  date: string;
}

const FACT_CHECK_ITEMS: FactCheckItem[] = [
  {
    id: 'fc-1',
    claim: '훈민정음 상주본이 화재로 인해 전소되어 완전히 훼손되었다?',
    claimant: '일부 온라인 커뮤니티 및 SNS 루머',
    verdict: 'FALSE',
    verdictLabel: '전혀 사실 아님 (거짓)',
    summary: '국가유산청 및 고문헌 전문가 조사 결과, 2015년 화재 당시 상주본의 일부 표지가 그을렸으나 본문 주요 페이지는 금고에 보관되어 온전한 상태임이 확인되었습니다.',
    evidence: [
      '국가유산청 동산문화재 분과위원회 정밀 실태조사 보고서 (2024)',
      '국립국어원 고문헌 감정평가원 학술 브리핑',
      '대법원 소유권 확인 판결문 검토 결과'
    ],
    date: '2026.08.20'
  },
  {
    id: 'fc-2',
    claim: '해외 박물관에 소장된 한국 문화재는 모두 약탈 문화재이므로 즉각 무상 반환되어야 한다?',
    claimant: '일부 민간 단체 주장',
    verdict: 'HALF_TRUE',
    verdictLabel: '절반의 사실',
    summary: '해외 유출 문화재 약 23만 점 중 불법 약탈 및 도난 문화재는 국제 협약에 따라 환수 대상이나, 정당한 외교 선물이나 합법적 구매로 취득된 유물은 현지 박물관과의 공동 전시 및 보존 협력 방식으로 다루어집니다.',
    evidence: [
      '유네스코 1970년 불법 문화재 반출입 금지 협약',
      '국외소재문화유산재단 해외 소장 유물 취득 경로별 통계'
    ],
    date: '2026.08.18'
  }
];

export const FactCheckModal: React.FC<FactCheckModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(FACT_CHECK_ITEMS[0].id);
  const activeItem = FACT_CHECK_ITEMS.find(i => i.id === selectedId) || FACT_CHECK_ITEMS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">한국문화저널 문화재 팩트체크 센터</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                국가유산청·학술 전문가 연계 공신력 있는 사실 검증
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FACT_CHECK_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  selectedId === item.id
                    ? 'border-[#1b2a47] bg-[#f5f2eb] ring-1 ring-[#1b2a47]'
                    : 'border-[#ded8cf] bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    item.verdict === 'FALSE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {item.verdictLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                </div>
                <h4 className="font-serif-kr font-bold text-slate-900 text-xs line-clamp-2">
                  {item.claim}
                </h4>
              </button>
            ))}
          </div>

          {/* Detailed Verification View */}
          <div className="p-5 bg-[#fcfaf7] rounded-xl border border-[#ded8cf] space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">검증 대상 주장:</span>
              <h3 className="font-serif-kr font-bold text-base text-slate-950">
                "{activeItem.claim}"
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                제기처: {activeItem.claimant}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-[#1b2a47] block mb-1">팩트체크 결론:</span>
              <p className="text-xs text-slate-800 font-serif-kr leading-relaxed font-semibold">
                {activeItem.summary}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-600 block mb-2">검증 근거 및 공식 문서:</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeItem.evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f5f1eb] border-t border-[#e2ded6] flex items-center justify-between text-xs text-slate-600">
          <span>제보 및 검증 요청: factcheck@kculturejournal.com</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2a47] text-white rounded-lg font-bold hover:bg-[#25375c] transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
