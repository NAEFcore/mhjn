import React, { useState } from 'react';
import { 
  Globe2, 
  Award, 
  Palette, 
  BookOpen, 
  Users, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ArrowUpRight, 
  Send, 
  FileText, 
  Search, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Ticket, 
  HelpCircle,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';

interface IatpcCulturePageProps {
  onNavigateToJournal?: () => void;
}

export const IatpcCulturePage: React.FC<IatpcCulturePageProps> = ({ onNavigateToJournal }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'exchange' | 'academy' | 'artist_register' | 'forum' | 'notice'>('home');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    field: '전통예술 (국악·무용·공예)',
    email: '',
    phone: '',
    portfolio: '',
    introduction: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email) return;
    setIsSubmitted(true);
    setTimeout(() => {
      alert('IATPC 글로벌 예술인 등록 신청이 성공적으로 접수되었습니다. 담당 큐레이터가 심사 후 이메일로 안내드립니다.');
      setIsSubmitted(false);
      setRegisterForm({
        name: '',
        field: '전통예술 (국악·무용·공예)',
        email: '',
        phone: '',
        portfolio: '',
        introduction: '',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* IATPC Culture Brand Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
              I
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white font-serif-kr">IATPC 문화</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  국제예술문화총연합
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono">
                INTERNATIONAL ART, TOURISM, PERFORMANCE & CULTURE
              </p>
            </div>
          </div>

          {/* Quick Sub-Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: 'home' as const, label: '협회 홈' },
              { id: 'exchange' as const, label: '글로벌 문화교류' },
              { id: 'academy' as const, label: '문화 아카데미' },
              { id: 'forum' as const, label: '세계문화포럼' },
              { id: 'artist_register' as const, label: '예술인 등록신청' },
              { id: 'notice' as const, label: '공지사항' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Independent Journal Quick Link Button */}
          {onNavigateToJournal && (
            <button
              onClick={onNavigateToJournal}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>한국문화저널 독립 지면 이동</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-12">
        {activeTab === 'home' && (
          <>
            {/* Hero Section: Global Arts & Heritage Initiative */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2026-2030 IATPC 글로벌 K-컬처 & 세계유산 교류 비전</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black font-serif-kr text-white tracking-tight leading-tight">
                  대한민국의 빛나는 예술혼을 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                    전 세계 문화의 중심 무대로
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  IATPC 문화(국제예술문화관광총연합)는 한국 전통 유산의 품격과 현대 K-컬처를 융합하여 
                  전 세계 45개국 문화예술 기관, 갤러리, 페스티벌과 상호 교류 및 아티스트 진출을 선도합니다.
                </p>

                <div className="flex items-center gap-3 pt-4 flex-wrap">
                  <button
                    onClick={() => setActiveTab('artist_register')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>IATPC 공인 예술인 등록</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('exchange')}
                    className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Globe2 className="w-4 h-4 text-amber-400" />
                    <span>글로벌 프로젝트 둘러보기</span>
                  </button>
                </div>
              </div>

              {/* Key Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">45개국</p>
                  <p className="text-xs text-slate-400 mt-1">글로벌 문화교류 네트워크</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">1,820명</p>
                  <p className="text-xs text-slate-400 mt-1">등록 예술인 & 문화 명장</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">320회+</p>
                  <p className="text-xs text-slate-400 mt-1">해외 특별전 & 아트 페어</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</p>
                  <p className="text-xs text-slate-400 mt-1">국제 공인 심사 인증</p>
                </div>
              </div>
            </section>

            {/* Core Pillars Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white font-serif-kr">IATPC 문화 핵심 4대 사업 분야</h2>
                  <p className="text-xs text-slate-400 mt-1">전통의 보존부터 미래 디지털 아트까지 이어지는 통합 생태계</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Palette className="w-6 h-6 text-amber-400" />,
                    title: '글로벌 아트 비엔날레 & 교류전',
                    desc: '파리, 뉴욕, 도쿄, 베를린 등 주요 문화 수도에서 정기 한국문화특별전 및 해외 명작 순회전을 개최합니다.',
                    tag: '국제전시',
                  },
                  {
                    icon: <Award className="w-6 h-6 text-amber-400" />,
                    title: 'K-헤리티지 명장 인증 & 보존',
                    desc: '국가무형문화재 이수자 및 전통 공예 장인의 작품 세계화와 해외 박물관 기탁 사업을 후원합니다.',
                    tag: '전통보존',
                  },
                  {
                    icon: <GraduationCap className="w-6 h-6 text-amber-400" />,
                    title: 'IATPC 문화예술 아카데미',
                    desc: '차세대 큐레이터, 예술 경영인, K-퍼포먼스 크리에이터 양성을 위한 글로벌 마스터클래스를 운영합니다.',
                    tag: '인재육성',
                  },
                  {
                    icon: <Globe2 className="w-6 h-6 text-amber-400" />,
                    title: '세계 문화관광 융합 포럼',
                    desc: '유네스코 협력 기관 및 세계 문화도시 대표단과 함께 미래 문화유산 관광의 지속가능성을 모색합니다.',
                    tag: '글로벌포럼',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>자세히 보기</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Major Events Preview */}
            <section className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-serif-kr">
                    2026 IATPC 주요 국제 행사 일정
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">글로벌 문화교류 총연합회 주관 행사</p>
                </div>
                <button
                  onClick={() => setActiveTab('forum')}
                  className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  전체 일정 보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: '2026 파리 루브르 한-불 헤리티지 특별교류전',
                    date: '2026. 10. 15 ~ 11. 30',
                    place: '프랑스 파리 카루젤 뒤 루브르 특설관',
                    status: '출품 작가 선정완료',
                    badge: '국제교류',
                  },
                  {
                    title: '제12회 IATPC 세계 문화유산 & 관광 심포지엄',
                    date: '2026. 09. 24 ~ 09. 26',
                    place: '서울 신라호텔 다이너스티홀 & 온라인 동시송출',
                    status: '사전등록 접수중',
                    badge: '학술포럼',
                  },
                  {
                    title: '차세대 전통예술 아티스트 글로벌 오디션 & 쇼케이스',
                    date: '2026. 11. 10 ~ 11. 12',
                    place: '국립극장 달오름극장',
                    status: '참가자 접수중',
                    badge: '쇼케이스',
                  },
                ].map((ev, i) => (
                  <div
                    key={i}
                    className="p-5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                          {ev.badge}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {ev.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug mb-3">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{ev.date}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{ev.place}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Tab 2: Global Exchange */}
        {activeTab === 'exchange' && (
          <section className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white font-serif-kr">글로벌 문화예술 교류 사업</h2>
              <p className="text-xs text-slate-400 mt-1">세계 무대에서 꽃피우는 한국 문화예술의 진면목</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '한-유럽 공예 & 현대미술 교류 비엔날레',
                  desc: '조선 백자의 미학과 유럽 현대 디자인의 대화를 주제로 밀라노, 파리, 베네치아 3개국 순회전을 기획하고 국내 장인 30인의 작품을 해외 컬렉터에게 선보입니다.',
                  country: '이탈리아 · 프랑스',
                  period: '2026. 09 ~ 2026. 12',
                },
                {
                  title: '북미 K-컬처 헤리티지 로드 페스티벌',
                  desc: '뉴욕 카네기홀 국악 심포니 특별 공연 및 LA 한국문화원 연계 전통 한복 패션 아트워크 전시를 주관합니다.',
                  country: '미국 (뉴욕, LA)',
                  period: '2026. 10 ~ 2026. 11',
                },
                {
                  title: '아시아 전통예술 보존 & 청년 작가 레지던시',
                  desc: '한국, 일본, 베트남, 몽골 4개국의 청년 전통 예술인들이 한 달간 안동 하회마을에서 공동 창작을 진행하는 국제 레지던시 프로그램입니다.',
                  country: '아시아 4개국',
                  period: '2026. 08 ~ 2026. 09',
                },
                {
                  title: '유네스코 무형유산 디지털 아카이빙 프로젝트',
                  desc: '전 세계 소멸 위기 전통 공연 및 수공예 기법을 3D 볼류메트릭 비디오로 기록하고 가상 뮤지엄으로 구축합니다.',
                  country: '글로벌 연합',
                  period: '2026 연중 상시',
                },
              ].map((proj, idx) => (
                <div key={idx} className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-300 rounded font-bold">
                      {proj.country}
                    </span>
                    <span className="text-slate-400 font-mono">{proj.period}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: Academy */}
        {activeTab === 'academy' && (
          <section className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white font-serif-kr">IATPC 문화예술 아카데미 & 마스터클래스</h2>
              <p className="text-xs text-slate-400 mt-1">최고 권위의 문화 명장과 글로벌 큐레이터 직강</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  course: '국제 아트페어 & 비엔날레 큐레이팅 마스터과정',
                  mentor: '정서윤 수석 큐레이터 (전 베니스비엔날레 커미셔너)',
                  weeks: '12주 과정 (주 1회)',
                  tuition: 'IATPC 회원 장학 지원',
                  status: '모집중 (정원 20명)',
                },
                {
                  course: '조선 왕실 공예와 현대 오브제 디자인 실습',
                  mentor: '박찬우 국가무형유산 이수자',
                  weeks: '8주 집중과정',
                  tuition: '재료비 전액 협회 후원',
                  status: '마감임박 (잔여 3석)',
                },
                {
                  course: 'K-컬처 글로벌 마케팅 & 문화저작권 법률 실무',
                  mentor: '김도현 엔터테인먼트 전문 변호사',
                  weeks: '6주 속성과정',
                  tuition: '온라인 라이브 병행',
                  status: '모집중',
                },
              ].map((c, idx) => (
                <div key={idx} className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">{c.course}</h3>
                    <p className="text-xs text-slate-300">
                      <strong>교수진:</strong> {c.mentor}
                    </p>
                    <p className="text-xs text-slate-400">
                      <strong>기간:</strong> {c.weeks} | <strong>혜택:</strong> {c.tuition}
                    </p>
                  </div>
                  <button
                    onClick={() => alert(`[${c.course}] 수강 신청서 접수 창구로 연결됩니다.`)}
                    className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    수강 신청하기
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 4: Artist Registration Form */}
        {activeTab === 'artist_register' && (
          <section className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white font-serif-kr">IATPC 공인 문화예술인 등록 신청</h2>
              <p className="text-xs text-slate-400 mt-1">
                등록된 예술인은 IATPC 주관 해외 전시 지원, 레지던시 및 글로벌 홍보 프로모션 혜택을 받습니다.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">성명 / 단체명 *</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="홍길동 (또는 예술단체명)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">전문 예술 분야 *</label>
                <select
                  value={registerForm.field}
                  onChange={(e) => setRegisterForm({ ...registerForm, field: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="전통예술 (국악·무용·공예)">전통예술 (국악·무용·공예)</option>
                  <option value="순수미술 (회화·조각·판화)">순수미술 (회화·조각·판화)</option>
                  <option value="디지털 아트 & 미디어">디지털 아트 & 미디어</option>
                  <option value="공연예술 (클래식·연극·뮤지컬)">공연예술 (클래식·연극·뮤지컬)</option>
                  <option value="문화유산 보존 및 학술 연구">문화유산 보존 및 학술 연구</option>
                  <option value="K-컬처 융복합 콘텐츠">K-컬처 융복합 콘텐츠</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">이메일 주소 *</label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="artist@example.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">연락처</label>
                  <input
                    type="text"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">포트폴리오 / SNS 링크 (선택)</label>
                <input
                  type="text"
                  value={registerForm.portfolio}
                  onChange={(e) => setRegisterForm({ ...registerForm, portfolio: e.target.value })}
                  placeholder="https://instagram.com/my_art 또는 웹사이트"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">활동 경력 및 소개</label>
                <textarea
                  rows={3}
                  value={registerForm.introduction}
                  onChange={(e) => setRegisterForm({ ...registerForm, introduction: e.target.value })}
                  placeholder="주요 전시 이력, 창작 비전 등을 간략히 입력해주세요."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                등록 심사 신청서 제출
              </button>
            </form>
          </section>
        )}

        {/* Tab 5: Forum */}
        {activeTab === 'forum' && (
          <section className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white font-serif-kr">2026 IATPC 세계 문화포럼</h2>
              <p className="text-xs text-slate-400 mt-1">글로벌 문화외교와 디지털 헤리티지의 미래</p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>주제: "천년의 기억, 100년의 미래 — 글로벌 K-헤리티지 르네상스"</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">행사 개요</h4>
                  <ul className="space-y-2">
                    <li>• <strong>일시:</strong> 2026년 9월 24일(목) ~ 26일(토), 3일간</li>
                    <li>• <strong>장소:</strong> 서울 신라호텔 다이너스티홀 & 온라인 메타버스 포럼</li>
                    <li>• <strong>주최/주관:</strong> IATPC 국제예술문화총연합</li>
                    <li>• <strong>참석 대상:</strong> 국내외 문화예술계 지도자, 큐레이터, 학자 및 일반 문화애호가 1,000명</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-2">주요 세션</h4>
                  <ul className="space-y-2">
                    <li>• <strong>세션 1:</strong> AI 시대의 문화유산 복원과 디지털 저작권</li>
                    <li>• <strong>세션 2:</strong> K-아트의 글로벌 옥션과 해외 컬렉터 네트워크 확장</li>
                    <li>• <strong>세션 3:</strong> 유네스코 세계유산의 친환경 관광 모델 개발</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => alert('포럼 참가 사전등록이 완료되었습니다. 확인 메일이 발송됩니다.')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                >
                  포럼 사전등록 (무료)
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 6: Notice */}
        {activeTab === 'notice' && (
          <section className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white font-serif-kr">IATPC 공지사항 및 공모</h2>
              <p className="text-xs text-slate-400 mt-1">협회 공식 공고 및 지원사업 안내</p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800">
              {[
                {
                  title: '[공고] 2026 하반기 IATPC 해외 전시지원 아티스트 공모 요강',
                  date: '2026. 08. 20',
                  dept: '국제교류팀',
                  views: 1420,
                },
                {
                  title: '[안내] 제12회 IATPC 문화예술대상 수상 후보자 추천 접수',
                  date: '2026. 08. 18',
                  dept: '사무국',
                  views: 980,
                },
                {
                  title: '[선발] 2026 청년 전통예술 해외 문화사절단 파견 선발 공고',
                  date: '2026. 08. 15',
                  dept: '인재개발원',
                  views: 2150,
                },
                {
                  title: '[공지] IATPC 문화예술인 공식 등록증 발급 시스템 개편 안내',
                  date: '2026. 08. 10',
                  dept: '회원관리팀',
                  views: 870,
                },
              ].map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => alert(`[공지 내용]\n${n.title}\n\n상세 공고문 PDF 및 첨부파일을 다운로드할 수 있습니다.`)}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-400">[{n.dept}]</span>
                    <h4 className="text-sm font-bold text-white hover:text-amber-300">{n.title}</h4>
                    <p className="text-[11px] text-slate-500">등록일: {n.date} · 조회 {n.views}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* IATPC Culture Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 lg:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-white text-sm">IATPC 문화 (국제예술문화관광총연합)</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">비영리 공익법인</span>
            </div>
            <p className="text-[11px] text-slate-500">
              서울특별시 종로구 인사동길 45 IATPC 문화빌딩 4층 | 대표전화: 02-789-0123
            </p>
            <p className="text-[10px] text-slate-600">
              본 사이트에 게재된 모든 프로젝트 및 심사 기준은 국제 예술 규약의 보호를 받습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToJournal && (
              <button
                onClick={onNavigateToJournal}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>한국문화저널 독립 지면 바로가기</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
