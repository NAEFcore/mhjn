import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1e293b] text-gray-400 text-xs border-t border-gray-800 mt-16 font-sans">
      {/* Top Footer Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap text-gray-300 font-semibold">
            <button className="hover:text-white transition-colors">회사소개</button>
            <span className="text-gray-700">|</span>
            <button className="hover:text-white transition-colors">언론윤리강령</button>
            <span className="text-gray-700">|</span>
            <button className="text-white font-bold hover:underline">개인정보처리방침</button>
            <span className="text-gray-700">|</span>
            <button className="hover:text-white transition-colors">청소년보호정책</button>
            <span className="text-gray-700">|</span>
            <button className="hover:text-white transition-colors">기사제보·정정보도</button>
            <span className="text-gray-700">|</span>
            <button className="hover:text-white transition-colors">지면신문 구독안내</button>
            <span className="text-gray-700">|</span>
            <button className="hover:text-white transition-colors">광고·제휴문의</button>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <span className="px-2 py-0.5 bg-blue-900/60 text-blue-300 rounded text-[11px] border border-blue-700 font-medium">
              네이버 미디어 제휴 언론사 009
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Details */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0051a8] text-white flex items-center justify-center font-bold text-xs">
                KCJ
              </div>
              <h2 className="text-base font-bold text-white font-serif-kr">
                한국문화저널
              </h2>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              대한민국 전통과 현대의 숨결을 전하는 문화·예술·헤리티지 전문 인터넷신문입니다.
              정론직필(正論直筆)의 정신으로 문화강국의 품격을 높입니다.
            </p>
          </div>

          {/* Legal / Publishing Details */}
          <div className="md:col-span-8 space-y-1.5 text-[11px] text-gray-400 leading-relaxed">
            <p>
              <strong className="text-gray-300">(주)한국문화저널미디어</strong> | 등록번호: 서울 아 05428 | 등록일자: 2014년 5월 12일
            </p>
            <p>
              발행인·편집인: 김성우 | 문화부 데스크: 박찬우 | 청소년보호책임자: 강서윤
            </p>
            <p>
              주소: 서울특별시 종로구 삼청로 84 한국문화미디어센터 5층 (우: 03053)
            </p>
            <p>
              대표전화: 02-3456-7890 | 팩스: 02-3456-7899 | 기사제보: newsdesk@kculturejournal.com
            </p>
            <p className="pt-2 text-gray-500">
              한국문화저널의 모든 콘텐츠(기사, 사진, 그래픽, 영상 등)는 저작권법의 보호를 받으며 무단 전재 및 재배포, AI 학습용 무단 크롤링을 엄격히 금합니다.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-[10px] text-gray-500">
          Copyright &copy; 2026 <strong>KOREA CULTURE JOURNAL</strong>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
