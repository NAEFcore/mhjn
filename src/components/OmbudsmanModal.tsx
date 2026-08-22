import React, { useState } from 'react';
import { Scale, X, Send, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface OmbudsmanModalProps {
  onClose: () => void;
}

export const OmbudsmanModal: React.FC<OmbudsmanModalProps> = ({ onClose }) => {
  const [requestType, setRequestType] = useState<'CORRECTION' | 'COMPLAINT' | 'RIGHTS'>('CORRECTION');
  const [articleUrl, setArticleUrl] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300 border border-blue-400/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">독자권익위원회 & 정정보도 청구 창구</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                뉴스 미란다 원칙 준수 및 언론 피해 구제 옴부즈만
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans bg-white">
          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-[#f8f6f2] rounded-xl border border-emerald-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif-kr font-bold text-base text-slate-900">
                청구 및 신고 접수가 완료되었습니다.
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                접수된 사안은 한국문화저널 독자권익위원회와 편집국 고충처리인이 즉시 사실관계를 조사하여 48시간 이내에 기재해주신 연락처로 통보해 드립니다.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-[#1b2a47] text-white rounded-lg font-bold text-xs"
              >
                추가 접수하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-[#f5f1eb] rounded-xl border border-[#ded8cf] text-[11px] text-slate-700 leading-relaxed space-y-1">
                <p className="font-bold text-slate-900 font-serif-kr">⚖️ 한국문화저널 뉴스 미란다 원칙 안내</p>
                <p>본지는 언론중재법 및 방송통신심의위원회 규정을 철저히 준수하며, 사실과 다른 보도로 피해를 입은 독자의 정정보도·반론보도·추후보도 청구권을 적극 보장합니다.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">신청 유형 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CORRECTION', label: '정정보도 청구' },
                    { id: 'COMPLAINT', label: '반론보도 청구' },
                    { id: 'RIGHTS', label: '권리침해·오보 제보' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRequestType(t.id as any)}
                      className={`py-2 text-center rounded-lg font-bold text-xs border transition-all ${
                        requestType === t.id
                          ? 'bg-[#1b2a47] text-amber-200 border-[#1b2a47]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">신청인 성명 / 기관명</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="홍길동 (또는 단체명)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#1b2a47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">연락처 / 이메일</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="010-0000-0000 / email@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#1b2a47] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">대상 기사 제목 또는 링크</label>
                <input
                  type="text"
                  required
                  value={articleUrl}
                  onChange={e => setArticleUrl(e.target.value)}
                  placeholder="예: [단독] 훈민정음 상주본 관련 기사"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#1b2a47] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">청구 사유 및 수정 요청 내용</label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="사실과 다른 부분 및 정확한 정정 요청 내용을 상세히 적어주세요."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#1b2a47] outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b2a47] text-white font-bold rounded-lg hover:bg-[#25375c] flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>청구서 제출하기</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f5f1eb] border-t border-[#e2ded6] flex items-center justify-between text-[11px] text-slate-500">
          <span>고충처리인 직통: 051-241-1323 | soobakmu@naver.com</span>
          <span className="font-serif-kr">한국문화저널 독자권익위원회</span>
        </div>
      </div>
    </div>
  );
};
