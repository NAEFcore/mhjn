import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Globe, Award, ExternalLink, Send, ArrowRight, Lock, LogOut, UserCheck } from 'lucide-react';
import { SdgPublishersCompactWheel } from './SdgPublishersCompactWheel';
import { Reporter } from '../types';

interface FooterProps {
  onOpenNewsTip?: () => void;
  onOpenOmbudsman?: () => void;
  onOpenSdgPage?: () => void;
  onOpenEditorial?: () => void;
  onOpenFactCheck?: () => void;
  onOpenAdminDesk?: () => void;
  onOpenAuthModal?: () => void;
  currentUser?: Reporter | null;
  onLogout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenNewsTip,
  onOpenOmbudsman,
  onOpenSdgPage,
  onOpenEditorial,
  onOpenFactCheck,
  onOpenAdminDesk,
  onOpenAuthModal,
  currentUser,
  onLogout,
}) => {
  return (
    <footer className="w-full bg-[#1b2432] text-slate-400 text-xs border-t border-slate-800 mt-16 font-sans">
      {/* Top Footer Navigation */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-wrap text-slate-300 font-medium text-xs">
            <button 
              onClick={onOpenEditorial}
              className="hover:text-white transition-colors"
            >
              사설·칼럼
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={onOpenFactCheck}
              className="hover:text-white transition-colors"
            >
              문화재 팩트체크
            </button>
            <span className="text-slate-700">|</span>
            
            {/* Requirement 9: 기사제보 Form Trigger */}
            <button 
              onClick={onOpenNewsTip}
              className="text-amber-300 font-bold hover:text-amber-200 transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>기사제보 (직통)</span>
            </button>
            <span className="text-slate-700">|</span>

            {/* Requirement 7: 독자권익위원회 & 정정보도 청구 창구 */}
            <button 
              onClick={onOpenOmbudsman}
              className="hover:text-white text-slate-200 font-semibold transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>독자권익위원회 & 정정보도 청구 창구</span>
            </button>
            <span className="text-slate-700">|</span>

            <button 
              onClick={onOpenSdgPage}
              className="hover:text-amber-300 transition-colors"
            >
              UN SDG 프로젝트
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">개인정보처리방침</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">청소년보호정책</span>
          </div>

          {/* Integrated Admin CMS Desk & Reporter Login in Footer Right */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
              {onOpenAdminDesk && (
                <button
                  onClick={onOpenAdminDesk}
                  className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  title="관리자 CMS 데스크 열기"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚙️ 관리자 CMS 데스크</span>
                </button>
              )}

              {currentUser ? (
                <>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                    <UserCheck className="w-3 h-3" />
                    <span>{currentUser.name} 기자</span>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      title="로그아웃"
                      className="text-slate-400 hover:text-rose-400 p-0.5 ml-1 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                onOpenAuthModal && (
                  <>
                    <span className="text-slate-600">|</span>
                    <button
                      onClick={onOpenAuthModal}
                      className="text-[11px] font-bold text-slate-300 hover:text-amber-300 transition-colors"
                    >
                      기자 로그인
                    </button>
                  </>
                )
              )}
            </div>

            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded text-[11px] border border-amber-400/30 font-medium">
              국내외 5,100여 언론사 송고망 연계
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Details */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-7 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black font-serif-kr text-base shadow-sm">
                韓
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-serif-kr tracking-tight">
                  한국문화저널
                </h2>
                <p className="text-[10px] text-slate-400 font-serif-kr">
                  KOREA CULTURE JOURNAL · 韓國文化日報
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              대한민국 전통과 현대의 숨결을 전하는 문화·예술·헤리티지 전문 정론지입니다. 
              유엔 퍼블리셔 콤팩트 협약 매체로서 사료 중심의 검증 저널리즘과 지속가능한 문화 생태계 조성을 선도합니다.
            </p>

            {/* Official Social Media Channels (Naver Blog, Twitter/X, YouTube) */}
            <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-slate-300">공식 채널:</span>
              <a
                href="https://blog.naver.com/soobakmu"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#03c75a]/15 hover:bg-[#03c75a]/25 text-[#03c75a] hover:text-[#20db74] border border-[#03c75a]/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                title="한국문화저널 공식 네이버 블로그"
              >
                <span className="font-black text-xs">N</span>
                <span>네이버 블로그</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>

              <a
                href="https://x.com/soobakmu"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                title="한국문화저널 공식 트위터(X)"
              >
                <span className="font-black font-sans text-xs">𝕏</span>
                <span>트위터</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>

              <a
                href="https://www.youtube.com/@WSFSubak"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#ff0000]/15 hover:bg-[#ff0000]/25 text-[#ff4e4e] hover:text-[#ff6b6b] border border-[#ff0000]/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                title="한국문화저널 공식 유튜브 채널"
              >
                <span className="font-black text-xs">▶</span>
                <span>유튜브</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            </div>

          </div>

          {/* Legal / Official Mandatory Publishing Details */}
          <div className="md:col-span-5 space-y-2 text-[11px] text-slate-300 leading-relaxed font-sans">
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong>제호:</strong> 한국문화저널</span>
                <span className="text-slate-600">|</span>
                <span><strong>법인명:</strong> (주)한국문화저널미디어</span>
                <span className="text-slate-600">|</span>
                <span><strong>등록번호:</strong> 부산, 아00245</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong>주소:</strong> 부산시 중구 중구로 61 4F 전관</span>
                <span className="text-slate-600">|</span>
                <span><strong>대표전화:</strong> 051 241-1323</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong>편집인(청소년보호책임자):</strong> 송기송</span>
                <span className="text-slate-600">|</span>
                <span><strong>고충처리인:</strong> soobakmu@naver.com</span>
              </p>
            </div>

            {/* Journalism Ethic & Miranda Rule */}
            <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
              ※본지는 신문윤리강령 및 실천요강을 준수합니다. 모든 콘텐츠(기사)에 대한 무단 전재ㆍ복사ㆍ배포 등을 금합니다.
            </p>
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              <strong>[뉴스 미란다 원칙]</strong> 취재원과 독자에게는 한국문화저널에 자유로이 접근할 권리와 반론·정정·추후 보도를 청구할 권리가 있습니다. (독자권익위원회 접수: soobakmu@naver.com)
            </p>
          </div>

          {/* Requirement 14: UN SDG Publishers Compact Wheel Badge with rounded corners, no border */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center">
            <div 
              onClick={onOpenSdgPage}
              className="p-3 bg-slate-900/90 rounded-2xl flex flex-col items-center text-center space-y-2 cursor-pointer hover:bg-slate-800 transition-all group"
            >
              <div className="rounded-full overflow-hidden">
                <SdgPublishersCompactWheel size={88} className="transform group-hover:scale-105 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors">
                  UN SDG Publishers Compact
                </p>
                <p className="text-[10px] text-slate-400">
                  공식 서약 협약 매체
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 group-hover:underline">
                <span>SDG 선언문 보기</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* Global News Distribution Network Banner */}
        <div className="p-3.5 bg-[#131c2a] rounded-xl border border-[#23354d] text-[11px] text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>[글로벌 뉴스 배포망]</strong> 한국문화저널 기사는 구글뉴스, 중국 소후신문, 금일두조에 뉴스송고 및 미국 미디엄, 러시아 얀덱스에 보도합니다. 국내 100개 인터넷신문에 보도자료로 배포되며 미국 EINPRESS를 통해 해외 5000개 언론사 기사를 수신, 배포합니다.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <p>Copyright &copy; 2026 <strong>한국문화저널 (KOREA CULTURE JOURNAL)</strong>. All Rights Reserved.</p>
          <p className="font-mono text-slate-600">ISSN 2982-841X · 정기간행물 등록필</p>
        </div>
      </div>
    </footer>
  );
};
