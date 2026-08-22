import React, { useState } from 'react';
import { Feather, X, BookOpen, Quote, Share2 } from 'lucide-react';

interface EditorialColumnModalProps {
  onClose: () => void;
}

interface EditorialItem {
  id: string;
  type: '사설' | '칼럼' | '시론';
  title: string;
  author: string;
  authorTitle: string;
  date: string;
  content: string[];
}

const EDITORIALS: EditorialItem[] = [
  {
    id: 'ed-1',
    type: '사설',
    title: '[사설] 해외 유출 문화재 23만 점 환수, 국가적 역량 총결집할 때다',
    author: '한국문화저널 논설위원실',
    authorTitle: '논설위원실',
    date: '2026.08.21',
    content: [
      '전 세계 22개국에 흩어져 있는 우리 문화유산이 23만여 점에 달한다는 사실은 분실된 역사의 무게를 실감케 한다. 일제강점기와 6·25 전쟁의 혼란기 속에서 불법 반출된 국보급 유물들이 해외 미술관 수장고에서 잠자고 있다.',
      '최근 국외소재문화유산재단과 민관 합동위원회가 출범하며 환수 작업에 속도가 붙은 것은 매우 고무적이다. 그러나 환수는 단순한 외교적 항의만으로는 불가능하다. 정밀한 소장 경위 조사와 국제법적 논리, 그리고 무엇보다 현지 소장 기관을 설득할 수 있는 문화적 연대와 기금 조성이 뒷받침되어야 한다.',
      '문화재는 한 민족의 얼과 정체성이 담긴 살아있는 기억이다. 정부와 기업, 시민사회가 손을 맞잡고 환수와 현지 활용이라는 투트랙 전략으로 국가유산의 온전한 귀환을 이뤄내야 할 것이다.'
    ]
  },
  {
    id: 'ed-2',
    type: '칼럼',
    title: '[강서윤의 문화와 삶] 달항아리의 담백함이 현대인에게 건네는 위로',
    author: '강서윤',
    authorTitle: '수석논설위원 / 인문학 박사',
    date: '2026.08.20',
    content: [
      '우리는 끊임없이 완벽을 강요받는 사회에 살고 있다. 한 치의 오차도 없는 대칭, 결점 없는 매끄러움이 미덕으로 칭송받는 시대다.',
      '그러나 조선의 도공들이 빚어낸 백자 달항아리를 마주하면 숨이 트인다. 상부와 하부를 따로 만들어 이어 붙인 몸체는 좌우가 조금씩 비틀려 있고, 유약의 백색은 눈부시지 않은 은은한 유백색이다.',
      '그 넉넉한 부정형의 선(線) 속에 비움과 포용의 미학이 담겨 있다. 결핍을 감추지 않고 품어내는 달항아리의 지혜가 지금 우리 삶에 가장 절실한 치유의 처방전이다.'
    ]
  }
];

export const EditorialColumnModal: React.FC<EditorialColumnModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(EDITORIALS[0].id);
  const activeItem = EDITORIALS.find(i => i.id === selectedId) || EDITORIALS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-400/30">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">한국문화저널 사설·칼럼 데스크</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                시대의 통찰과 인문학적 깊이를 담은 정론 논설
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {EDITORIALS.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-serif-kr transition-all ${
                  selectedId === item.id
                    ? 'bg-[#1b2a47] text-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                [{item.type}] {item.author}
              </button>
            ))}
          </div>

          <article className="space-y-4">
            <div className="border-b border-[#ded8cf] pb-3">
              <span className="px-2 py-0.5 bg-[#f0ebe3] text-[#1b2a47] font-bold rounded text-[11px]">
                {activeItem.type}
              </span>
              <h2 className="font-serif-kr font-bold text-xl text-slate-950 mt-1.5 leading-snug">
                {activeItem.title}
              </h2>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mt-2 font-mono">
                <span>집필: {activeItem.author} ({activeItem.authorTitle})</span>
                <span>{activeItem.date}</span>
              </div>
            </div>

            <div className="p-4 bg-[#f8f6f2] rounded-xl border-l-4 border-[#1b2a47] text-slate-800 font-serif-kr text-[13px] italic">
              "사물의 본질을 꿰뚫는 시선과 한국적 가치의 재발견을 지향합니다."
            </div>

            <div className="text-[14px] text-slate-900 font-serif-kr leading-relaxed space-y-3.5 text-justify">
              {activeItem.content.map((p, i) => (
                <p key={i} className="indent-3">{p}</p>
              ))}
            </div>
          </article>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f5f1eb] border-t border-[#e2ded6] flex items-center justify-between text-xs text-slate-600">
          <span>기명 칼럼 및 외부 기고 문의: opinion@kculturejournal.com</span>
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
