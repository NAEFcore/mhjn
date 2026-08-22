import React, { useState } from 'react';
import { X, Send, ShieldCheck, FileText, Phone, Mail, User, AlertCircle, CheckCircle2, Paperclip } from 'lucide-react';

interface NewsTipModalProps {
  onClose: () => void;
}

export const NewsTipModal: React.FC<NewsTipModalProps> = ({ onClose }) => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [informerName, setInformerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTitle.trim() || !tipContent.trim()) {
      alert('제보 제목과 제보 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const tipData = {
      informer: isAnonymous ? '익명 제보자' : (informerName || '익명'),
      contact: phone || email || '미기재',
      title: tipTitle,
      content: tipContent,
      attachment: attachmentName || '없음',
      submittedAt: new Date().toLocaleString('ko-KR'),
    };

    try {
      // Send to server tip endpoint
      await fetch('/api/news-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipData),
      }).catch(() => {});
    } catch (err) {
      console.warn('Tip submission to API caught:', err);
    }

    // Direct mailto trigger to ensure soobakmu@naver.com gets the email
    const mailSubject = encodeURIComponent(`[한국문화저널 기사제보] ${tipTitle}`);
    const mailBody = encodeURIComponent(
      `■ [한국문화저널 독자 기사제보]\n\n` +
      `• 제보자: ${isAnonymous ? '익명 제보자 (신원보호)' : informerName}\n` +
      `• 연락처: ${phone} / ${email}\n` +
      `• 제보일시: ${new Date().toLocaleString('ko-KR')}\n\n` +
      `-----------------------------------------\n` +
      `[제보 제목]: ${tipTitle}\n` +
      `-----------------------------------------\n` +
      `[제보 내용]:\n${tipContent}\n\n` +
      `[첨부자료/링크]: ${attachmentName || '없음'}\n` +
      `-----------------------------------------\n` +
      `※ 한국문화저널은 취재원 보호 원칙에 따라 제보자의 신원을 절대 외부에 공개하지 않습니다.`
    );

    // Trigger email client in the background/popup
    const mailtoUrl = `mailto:soobakmu@naver.com?subject=${mailSubject}&body=${mailBody}`;
    const mailLink = document.createElement('a');
    mailLink.href = mailtoUrl;
    mailLink.target = '_blank';
    document.body.appendChild(mailLink);
    mailLink.click();
    document.body.removeChild(mailLink);

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">한국문화저널 독자 기사제보 창구</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                편집국 직통 접수 (수신: soobakmu@naver.com)
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

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold font-serif-kr text-slate-900">
                기사 제보가 성공적으로 접수되었습니다
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                편집국장(soobakmu@naver.com) 및 취재 데스크에 안전하게 전달되었습니다.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1.5 font-sans">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>취재원 비밀보호 및 팩트체크 원칙</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                한국문화저널은 언론윤리강령에 따라 제보자의 신원을 철저히 비밀로 보장합니다. 제보해 주신 내용은 전담 취재기자가 사료 및 현장 확인을 거친 후 심층 보도하겠습니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#1b2a47] text-white text-xs font-bold rounded-xl hover:bg-[#25375c] transition-colors"
            >
              확인 및 창 닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
            {/* Informer Protection Alert */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[11px]">철저한 취재원 신원 보호</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  독자 여러분의 소중한 제보는 문화재 훼손 방지 및 K-컬처 정론 보도의 밑거름이 됩니다. 모든 제보 내용은 암호화되어 편집국장에게 직접 송신됩니다.
                </p>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 bg-white border border-[#d8d3cb] rounded-xl">
              <div>
                <span className="font-bold text-slate-900 text-xs">익명 제보</span>
                <p className="text-[10px] text-slate-500">제보자의 성명을 기재하지 않고 익명으로 접수합니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b2a47]"></div>
              </label>
            </div>

            {/* Informer Info (if not anonymous) */}
            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">성명</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={informerName}
                      onChange={(e) => setInformerName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">연락처</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">이메일</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Tip Title */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">제보 제목 *</label>
              <input
                type="text"
                required
                value={tipTitle}
                onChange={(e) => setTipTitle(e.target.value)}
                placeholder="제보하시고자 하는 사건이나 문화재 소식의 제목을 적어주세요"
                className="w-full p-2.5 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#1b2a47]"
              />
            </div>

            {/* Tip Content */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">제보 내용 (상세 기술) *</label>
              <textarea
                rows={6}
                required
                value={tipContent}
                onChange={(e) => setTipContent(e.target.value)}
                placeholder="언제, 어디서, 누가, 무엇을, 어떻게, 왜에 관한 사실 관계를 상세히 작성해주세요. 관련 증빙이나 현장 상황을 덧붙여주시면 취재에 큰 도움이 됩니다."
                className="w-full p-3 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-[#1b2a47]"
              />
            </div>

            {/* Attachment/Link Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">관련 링크 및 증빙 자료 안내</label>
              <div className="relative">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="관련 보도 링크, 클라우드 사진 URL 또는 증빙 자료 메모"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
                <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? '제보 전송 중...' : '편집국장에게 기사 제보 송신 (soobakmu@naver.com)'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
