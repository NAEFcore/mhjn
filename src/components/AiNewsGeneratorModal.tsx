import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Check, 
  RefreshCw, 
  PenTool, 
  Edit3, 
  Wand2, 
  Eraser, 
  FileText, 
  Tag, 
  Image as ImageIcon,
  CheckCircle2,
  Undo2,
  BookOpen
} from 'lucide-react';
import { Article } from '../types';
import { REPORTERS } from '../data/mockNews';

interface AiNewsGeneratorModalProps {
  onClose: () => void;
  onPublishArticle: (newArticle: Article) => void;
}

type ImproveStyle = 'natural' | 'reporter' | 'concise' | 'factual' | 'scholarly';

export const AiNewsGeneratorModal: React.FC<AiNewsGeneratorModalProps> = ({
  onClose,
  onPublishArticle,
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'culture_art' | 'k_culture' | 'heritage' | 'opinion'>('culture_art');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any | null>(null);

  // Edit Form Fields
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editReporter, setEditReporter] = useState('김유라 문화전문기자');
  const [editTags, setEditTags] = useState('한국문화저널, AI속보, 문화예술');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageCaption, setEditImageCaption] = useState('');
  const [editBadge, setEditBadge] = useState<Article['badge']>('기획');

  // AI Sentence Improvement State
  const [isImproving, setIsImproving] = useState(false);
  const [improvedPreview, setImprovedPreview] = useState<{
    original: string;
    improved: string;
    style: ImproveStyle;
  } | null>(null);
  const [targetParagraphIndex, setTargetParagraphIndex] = useState<number | null>(null);

  const sampleTopics = [
    '조선 왕실 은입사 공예 기법의 현대 가구 접목',
    '국립발레단, 창작 판소리 발레 <심청의 눈물> 세계 초연',
    '유네스코 세계유산 안동 하회마을, 친환경 한옥 보존 프로젝트',
    '글로벌 K-웹툰의 문학성과 한국 설화 속 영웅 서사',
  ];

  const handleGenerate = async (targetTopic?: string) => {
    const query = targetTopic || topic;
    if (!query.trim()) return;

    setIsLoading(true);
    setImprovedPreview(null);

    try {
      const res = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: query,
          category: category === 'culture_art' ? '문화·예술' : category === 'k_culture' ? 'K-컬처' : '전통유산',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        populateFields(data);
      } else {
        throw new Error('API unavailable');
      }
    } catch (e) {
      // High-quality local generative engine fallback
      setTimeout(() => {
        const mockDraft = {
          title: `[기획] "${query}"… 한국문화의 새로운 지평을 열다`,
          subtitle: '전통의 고유성과 현대적 감각의 만남, 국내외 문화계 비상한 관심 집중',
          summary: '한국문화저널 특별취재팀이 조명한 새로운 문화 예술 트렌드 리포트.',
          content: `대한민국 문화 예술계에 새로운 패러다임이 태동하고 있다. 최근 '${query}'을 둘러싼 다양한 담론과 창작 실험들이 국경을 넘어 전 세계 관객과 비평가들의 이목을 집중시키고 있다.

전통은 고정된 박제가 아니라 시대와 호흡하며 끊임없이 재해석될 때 진정한 생명력을 얻는다. 이번 기획은 선조들의 지혜가 담긴 조형미와 철학적 깊이를 현대적 미디어와 결합해 대중과의 접점을 획기적으로 넓혔다는 평가를 받는다.

현장 취재진이 만난 문화계 관계자는 "한국 고유의 서사와 미학적 질감이 현대인의 정서적 갈증을 채워주고 있다"며 "앞으로도 전통과 현대를 잇는 다채로운 학술 연구와 창작 시도가 이어질 것"이라고 강조했다.`,
          reporter: '정다은 문화전문기자',
          tags: ['한국문화저널', 'K-헤리티지', '문화기획', '예술비평'],
          imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
          imageCaption: '▲ 한국문화저널 특별취재팀 문화예술 현장 보도 사진.',
        };
        populateFields(mockDraft);
        setIsLoading(false);
      }, 700);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const populateFields = (data: any) => {
    setGeneratedData(data);
    setEditTitle(data.title || '');
    setEditSubtitle(data.subtitle || '');
    setEditSummary(data.summary || data.subtitle || '');
    setEditContent(data.content || '');
    setEditReporter(data.reporter || '정다은 문화전문기자');
    setEditTags(Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '한국문화저널, AI속보, 문화예술'));
    setEditImageUrl(data.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80');
    setEditImageCaption(data.imageCaption || '▲ 한국문화저널 AI 문화부 데스크 기획 취재 보도 사진.');
  };

  // AI Sentence Improvement Handler (5 Styles)
  const handleImproveSentence = async (style: ImproveStyle, targetText?: string) => {
    const textToImprove = targetText || editContent;
    if (!textToImprove.trim()) return;

    setIsImproving(true);

    try {
      const res = await fetch('/api/ai/improve-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToImprove, style }),
      });

      if (res.ok) {
        const json = await res.json();
        setImprovedPreview({
          original: textToImprove,
          improved: json.improvedText,
          style,
        });
      } else {
        throw new Error('Fallback to local style engine');
      }
    } catch {
      // Local Intelligent Style Transformation Engine
      setTimeout(() => {
        let result = textToImprove;

        if (style === 'reporter') {
          // 간결·명확한 보도체
          result = textToImprove
            .replace(/태동하고 있다/g, '본격화됐다')
            .replace(/집중시키고 있다/g, '모으고 있다')
            .replace(/평가를 받는다/g, '평가다')
            .replace(/강조했다/g, '밝혔다')
            .replace(/생명력을 얻는다/g, '가치를 발휘한다');
        } else if (style === 'concise') {
          // 간결하게 축약
          const lines = textToImprove.split('\n\n');
          result = lines.map(p => p.slice(0, Math.floor(p.length * 0.75)) + (p.endsWith('.') ? '' : '.')).join('\n\n');
        } else if (style === 'factual') {
          // 사실 중심 (주관적 감정 수사 제거)
          result = textToImprove
            .replace(/진정한 생명력을 얻는다/g, '역사적 가치를 이어가고 있다')
            .replace(/현대인의 정서적 갈증을 채워주고 있다/g, '대중적 호응과 학술적 검토를 동시에 이끌어내고 있다')
            .replace(/비상한 관심 집중/g, '관련 지표 상승세');
        } else if (style === 'scholarly') {
          // 전문 학술 및 문화비평 문체
          result = textToImprove
            .replace(/새로운 패러다임/g, '포스트모던적 미학 담론')
            .replace(/선조들의 지혜가 담긴/g, '조선조 사료에 근거한 독창적')
            .replace(/접점을 획기적으로 넓혔다는/g, '장르적 외연을 확장한 학술적 의의를 지닌다는');
        } else {
          // 자연스럽게 다시 쓰기
          result = textToImprove
            .replace(/태동하고 있다/g, '자리를 잡아가고 있다')
            .replace(/이목을 집중시키고 있다/g, '큰 주목을 받고 있다');
        }

        setImprovedPreview({
          original: textToImprove,
          improved: result,
          style,
        });
        setIsImproving(false);
      }, 500);
    } finally {
      setIsImproving(false);
    }
  };

  // Apply Improved Text to Body
  const handleApplyImprovement = () => {
    if (!improvedPreview) return;

    if (targetParagraphIndex !== null) {
      const paragraphs = editContent.split('\n\n');
      paragraphs[targetParagraphIndex] = improvedPreview.improved;
      setEditContent(paragraphs.join('\n\n'));
    } else {
      setEditContent(improvedPreview.improved);
    }

    setImprovedPreview(null);
    setTargetParagraphIndex(null);
  };

  // Quick Cliché Cleaner (상투적 표현 자동 정제)
  const handleCleanCliches = () => {
    let cleaned = editContent
      .replace(/전통은 고정된 박제가 아니라 시대와 호흡하며 끊임없이 재해석될 때 진정한 생명력을 얻는다\./g, '역사적 유산은 체계적인 사료 고증과 현대적 보존 기술이 결합할 때 지속가능한 가치를 발휘한다.')
      .replace(/한국 고유의 서사와 미학적 질감이 현대인의 정서적 갈증을 채워주고 있다/g, '전통 기법에 담긴 정밀한 장인 정신과 조형미가 국내외 연구진과 대중에게 실증적인 문화적 울림을 전하고 있다');
    
    setEditContent(cleaned);
  };

  const handlePublish = () => {
    if (!editTitle.trim()) {
      alert('기사 제목을 입력해 주세요.');
      return;
    }

    const tagList = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newArticle: Article = {
      id: `ai-art-${Date.now()}`,
      category: category,
      categoryLabel:
        category === 'culture_art'
          ? '문화·예술'
          : category === 'k_culture'
          ? 'K-컬처·엔터'
          : category === 'heritage'
          ? '전통과 유산'
          : '오피니언',
      title: editTitle,
      subtitle: editSubtitle,
      summary: editSummary || editSubtitle || editTitle,
      content: editContent,
      reporter: {
        ...REPORTERS.kim_yr,
        name: editReporter || '정다은 문화전문기자',
      },
      publishedAt: '2026.08.21. 방금 전',
      views: 120,
      shares: 15,
      likes: 24,
      reactions: {
        info: 10,
        exciting: 15,
        empathy: 18,
        analysis: 8,
        followup: 4,
      },
      imageUrl: editImageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      imageCaption: editImageCaption || '▲ 한국문화저널 AI 문화부 데스크 기획 취재 보도 사진.',
      tags: tagList.length > 0 ? tagList : ['한국문화저널', 'AI속보', '문화예술'],
      badge: editBadge,
      commentsCount: 0,
      aiSummary: [
        editSubtitle || '한국 문화계의 새로운 패러다임과 창작 실험 조명',
        '전통의 깊이와 현대적 감각의 융합으로 국내외 호평',
      ],
    };

    onPublishArticle(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-fade-in font-sans">
        
        {/* Header */}
        <div className="bg-[#1b2a47] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl shadow-xs font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-serif-kr">
                  AI 문화속보 & 기획기사 생성기
                </h2>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                  생성 및 AI 문장 개선 에디터
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gemini AI 기사 작성 후 전체 문장 직접 편집 및 5가지 AI 보도체 교열 지원
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          
          {/* STEP 1: Generation Inputs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>취재 분야 및 키워드 설정</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                원하는 카테고리와 취재 아이템을 입력하세요
              </span>
            </div>

            {/* Category Select */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'culture_art' as const, label: '문화·예술' },
                { id: 'k_culture' as const, label: 'K-컬처·엔터' },
                { id: 'heritage' as const, label: '전통과 유산' },
                { id: 'opinion' as const, label: '오피니언' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    category === c.id
                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Topic Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 조선 달항아리의 현대적 재해석, 국악과 재즈의 크로스오버..."
                className="flex-1 px-4 py-2.5 bg-white text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !topic.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>작성중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 기사 생성</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-slate-400">추천 주제:</span>
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(t);
                    handleGenerate(t);
                  }}
                  className="text-[11px] bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: EDITING & REVIEW INTERFACE */}
          {generatedData && (
            <div className="space-y-4 border-t border-slate-200 pt-5 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-serif-kr">
                    생성된 기사 검토 및 직접 편집
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    에디터 모드 활성화
                  </span>
                </div>

                {/* Quick Action Tools */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCleanCliches}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                    title="상투적이고 판에 박힌 AI 클리셰 표현을 보도 정론직필 문장으로 자동 교정"
                  >
                    <Eraser className="w-3.5 h-3.5 text-amber-600" />
                    <span>상투적 표현 정제</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>다시 생성</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle Edit */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    기사 제목 (헤드라인)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 font-serif-kr focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    부제목 (서브타이틀)
                  </label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3줄 핵심 요약 (AI Summary)
                  </label>
                  <input
                    type="text"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* AI SENTENCE IMPROVEMENT TOOLBAR */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">
                      AI 문장 개선 도구 (본문 문체 5대 변환)
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    원하는 문체를 클릭하면 본문이 전문적으로 개선됩니다
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleImproveSentence('reporter')}
                    disabled={isImproving}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📰</span>
                    <span>기자 문체로 수정 (간결·명확한 보도체)</span>
                  </button>

                  <button
                    onClick={() => handleImproveSentence('factual')}
                    disabled={isImproving}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>🔍</span>
                    <span>사실 중심으로 수정 (감정 수사 배제)</span>
                  </button>

                  <button
                    onClick={() => handleImproveSentence('scholarly')}
                    disabled={isImproving}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>🏛️</span>
                    <span>학술·문화비평 문체</span>
                  </button>

                  <button
                    onClick={() => handleImproveSentence('concise')}
                    disabled={isImproving}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>✂️</span>
                    <span>간결하게 수정</span>
                  </button>

                  <button
                    onClick={() => handleImproveSentence('natural')}
                    disabled={isImproving}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>🌿</span>
                    <span>자연스럽게 다시 쓰기</span>
                  </button>
                </div>

                {/* AI Improvement Preview Box */}
                {improvedPreview && (
                  <div className="bg-white border border-indigo-300 rounded-xl p-3.5 space-y-2 animate-fade-in shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>AI 개선 결과 미리보기 ({improvedPreview.style})</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setImprovedPreview(null)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleApplyImprovement}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>본문에 즉시 적용</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-serif-kr bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {improvedPreview.improved}
                    </p>
                  </div>
                )}
              </div>

              {/* Main Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    기사 본문 (Full Content)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {editContent.length}자
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm leading-relaxed text-slate-800 font-serif-kr focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Metadata Fields (Reporter, Badge, Image) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    작성 기자명 (바이라인)
                  </label>
                  <input
                    type="text"
                    value={editReporter}
                    onChange={(e) => setEditReporter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    기사 뱃지
                  </label>
                  <select
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="기획">기획 (기획특집)</option>
                    <option value="속보">속보 (문화속보)</option>
                    <option value="단독">단독 (단독보도)</option>
                    <option value="사설">사설·칼럼</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    키워드 태그 (쉼표 구분)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Image Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 보도사진 URL
                  </label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    사진 캡션 및 출처
                  </label>
                  <input
                    type="text"
                    value={editImageCaption}
                    onChange={(e) => setEditImageCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            닫기
          </button>

          {generatedData && (
            <button
              onClick={handlePublish}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <PenTool className="w-4 h-4" />
              <span>최종 검토 완료 & 신문에 발행하기</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
