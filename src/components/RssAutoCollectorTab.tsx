import React, { useState } from 'react';
import { 
  Rss, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Globe, 
  Layers, 
  Play, 
  Check, 
  X, 
  Clock, 
  ArrowRight,
  Filter,
  Eye,
  FileText,
  Wand2,
  BookmarkPlus
} from 'lucide-react';
import { RssFeedSource, AutoCollectedItem, Article, CategoryId, RssCollectionInterval } from '../types';
import { REPORTERS } from '../data/mockNews';

interface RssAutoCollectorTabProps {
  sources: RssFeedSource[];
  onUpdateSources: (sources: RssFeedSource[]) => void;
  collectedItems: AutoCollectedItem[];
  onUpdateCollectedItems: (items: AutoCollectedItem[]) => void;
  articles: Article[];
  onPublishArticle: (article: Article) => void;
}

export const RssAutoCollectorTab: React.FC<RssAutoCollectorTabProps> = ({
  sources,
  onUpdateSources,
  collectedItems,
  onUpdateCollectedItems,
  articles,
  onPublishArticle,
}) => {
  const [subTab, setSubTab] = useState<'pending' | 'sources' | 'published'>('pending');
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);

  // New Source Form Modal State
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceCountry, setNewSourceCountry] = useState('대한민국');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('문화예술');
  const [newSourceLang, setNewSourceLang] = useState<'ko' | 'en' | 'fr' | 'ja'>('ko');
  const [newSourceInterval, setNewSourceInterval] = useState<RssCollectionInterval>('1h');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  // Item Review / Edit Modal State
  const [reviewingItem, setReviewingItem] = useState<AutoCollectedItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryId>('heritage');
  const [editTags, setEditTags] = useState('');

  // Statistics
  const totalSources = sources.length;
  const activeSources = sources.filter(s => s.isActive).length;
  const errorSources = sources.filter(s => s.status === 'ERROR').length;
  const pendingItems = collectedItems.filter(i => i.status === 'AI_GENERATED_PENDING_REVIEW');
  const publishedItems = collectedItems.filter(i => i.status === 'PUBLISHED');

  // Trigger Instant RSS Collection (Fetch Now)
  const handleCollectNow = async (sourceId?: string) => {
    setIsCollecting(true);
    setCollectMessage('국내외 RSS 피드로부터 최신 문화 보도자료를 수집하고 AI 기사 변환을 진행 중입니다...');

    try {
      // Simulate real-world AI processing pipeline
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockNewItem: AutoCollectedItem = {
        id: `rss-item-${Date.now()}`,
        sourceId: sourceId || 'rss-kr-mcst',
        sourceName: sourceId ? (sources.find(s => s.id === sourceId)?.name || '외신 피드') : '국가유산청 국가유산포털',
        sourceUrl: 'https://www.khs.go.kr/news/release/20260821-heritage-restoration',
        guid: `guid-${Date.now()}`,
        originalTitle: '국가유산청, 경주 신라 왕경 사찰 터에서 8세기 금동여래입상 추가 출토 발표',
        originalContent: '국가유산청 국립경주문화유산연구소는 경주 동천동 절터 발굴 조사에서 통일신라 8세기 전반의 완성도 높은 35cm 금동여래입상을 완형에 가깝게 수습했다고 21일 밝혔다...',
        language: 'ko',
        fetchedAt: '방금 전',
        status: 'AI_GENERATED_PENDING_REVIEW',
        generatedArticle: {
          title: '[단독] 경주 신라 왕경 사찰터서 8세기 ‘금동여래입상’ 완형 출토… 불교미술 정수',
          subtitle: '국가유산청 발굴조사단, 섬세한 옷주름과 자비로운 미소 간직한 35cm 명품 불상 공개',
          summary: '경주 도심 신라 사찰터에서 8세기 전성기 통일신라 불교조각의 극치를 보여주는 금동여래입상이 온전한 모습으로 발굴됐다.',
          content: `천년고도 경주의 신라 왕경 사찰 유적에서 8세기 통일신라 전성기 불교 조각의 정수를 보여주는 금동여래입상이 온전한 형태로 출토됐다.

국가유산청 국립경주문화유산연구소는 21일 현장 언론 브리핑을 열고, 경주 동천동 사찰 추정 유적지 3차 발굴조사에서 높이 35cm 크기의 통일신라 8세기 전반 금동여래입상 1점을 완형으로 수습했다고 공식 발표했다.

이번에 수습된 불상은 도금이 거의 훼손되지 않은 채 생생하게 보존되어 있으며, 유려하게 흘러내리는 법의의 주름과 정교한 육계, 자비로운 표정이 국보급 조각 양식을 여실히 드러내고 있다.

학계 연구진은 "8세기 신라 조각 기술이 당대 아시아 최고 수준이었음을 증명하는 사료적 쾌거"라며 "보존 처리 후 국립경주박물관에서 일반에 특별 공개될 예정"이라고 설명했다.`,
          reporterName: 'AI 속보 데스크 (박철우 기자 검토)',
          category: 'heritage',
          tags: ['국가유산청', '경주발굴', '금동여래입상', '통일신라', '불교미술'],
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
          imageCaption: '▲ 경주 사찰 터에서 완형으로 출토된 8세기 통일신라 금동여래입상 (자료=국가유산청)',
          sourceName: '국가유산청 국가유산포털',
          sourceUrl: 'https://www.khs.go.kr/news/release/20260821-heritage-restoration',
          originalLanguage: '한국어',
          publishedAt: '2026.08.21. 방금 전',
        },
      };

      // Check duplicates
      const existingGuids = new Set(collectedItems.map(i => i.guid));
      if (!existingGuids.has(mockNewItem.guid)) {
        onUpdateCollectedItems([mockNewItem, ...collectedItems]);
      }

      // Update source last fetched
      const updatedSources = sources.map(s => {
        if (!sourceId || s.id === sourceId) {
          return { ...s, lastFetchedAt: '방금 전', itemsCount: s.itemsCount + 1, status: 'HEALTHY' as const };
        }
        return s;
      });
      onUpdateSources(updatedSources);

      setCollectMessage('수집 및 AI 정론 기사 변환이 완료되었습니다! 1건의 새로운 기사가 검토 대기 큐에 등록되었습니다.');
      setTimeout(() => setCollectMessage(null), 4000);
    } catch {
      setCollectMessage('수집 중 일부 RSS 피드 통신 오류가 발생했습니다.');
    } finally {
      setIsCollecting(false);
    }
  };

  // Toggle Source Active
  const handleToggleSource = (id: string) => {
    onUpdateSources(
      sources.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
    );
  };

  // Delete Source
  const handleDeleteSource = (id: string) => {
    if (!window.confirm('이 RSS 수집 소스를 삭제하시겠습니까?')) return;
    onUpdateSources(sources.filter(s => s.id !== id));
  };

  // Add New Source
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newSourceUrl) return;

    const newSrc: RssFeedSource = {
      id: `rss-custom-${Date.now()}`,
      name: newSourceName,
      country: newSourceCountry,
      rssUrl: newSourceUrl,
      category: newSourceCategory,
      language: newSourceLang,
      interval: newSourceInterval,
      isActive: true,
      lastFetchedAt: '방금 등록',
      status: 'HEALTHY',
      itemsCount: 0,
      description: newSourceDesc || `${newSourceName} 공식 문화 소식 RSS 피드`,
    };

    onUpdateSources([newSrc, ...sources]);
    setShowAddSourceModal(false);
    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceDesc('');
  };

  // Open Review Item
  const handleOpenReview = (item: AutoCollectedItem) => {
    setReviewingItem(item);
    setEditTitle(item.generatedArticle.title);
    setEditSubtitle(item.generatedArticle.subtitle);
    setEditSummary(item.generatedArticle.summary);
    setEditContent(item.generatedArticle.content);
    setEditCategory(item.generatedArticle.category);
    setEditTags(item.generatedArticle.tags.join(', '));
  };

  // Approve & Publish Item
  const handleApprovePublish = (item: AutoCollectedItem) => {
    const finalDraft = reviewingItem?.id === item.id ? {
      ...item.generatedArticle,
      title: editTitle,
      subtitle: editSubtitle,
      summary: editSummary,
      content: editContent,
      category: editCategory,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    } : item.generatedArticle;

    const newArticle: Article = {
      id: `art-rss-${Date.now()}`,
      category: finalDraft.category,
      categoryLabel: finalDraft.category === 'heritage' ? '전통과 유산' : finalDraft.category === 'k_culture' ? 'K-컬처' : '문화·예술',
      title: finalDraft.title,
      subtitle: finalDraft.subtitle,
      summary: finalDraft.summary,
      content: finalDraft.content,
      reporter: {
        ...REPORTERS.kim_yr,
        name: finalDraft.reporterName || 'AI 수집 데스크',
      },
      publishedAt: '2026.08.21. 방금 전',
      views: 45,
      shares: 6,
      likes: 12,
      reactions: { info: 12, exciting: 5, empathy: 8, analysis: 6, followup: 2 },
      imageUrl: finalDraft.imageUrl,
      imageCaption: finalDraft.imageCaption,
      tags: finalDraft.tags,
      badge: '속보',
      commentsCount: 0,
      aiSummary: [finalDraft.subtitle, finalDraft.summary],
      sourceName: finalDraft.sourceName,
      sourceUrl: finalDraft.sourceUrl,
    };

    // Update status in collected list
    onUpdateCollectedItems(
      collectedItems.map(i => i.id === item.id ? { ...i, status: 'PUBLISHED' as const } : i)
    );

    // Publish to main newspaper
    onPublishArticle(newArticle);
    setReviewingItem(null);
    alert('기사가 최종 검토 및 승인되어 한국문화저널 지면에 정식 발행되었습니다!');
  };

  // Reject Item
  const handleRejectItem = (id: string) => {
    onUpdateCollectedItems(
      collectedItems.map(i => i.id === id ? { ...i, status: 'REJECTED' as const } : i)
    );
    if (reviewingItem?.id === id) setReviewingItem(null);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header & Summary Statistics */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Rss className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif-kr">
              국내·해외 문화뉴스 RSS 자동 수집 & AI 기사 생성기
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            등록된 국내외 기관·외신 RSS를 주기적으로 스캔하여 번역·요약 후 정론직필 보도 기사로 자동 생성합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCollectNow()}
            disabled={isCollecting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCollecting ? 'animate-spin' : ''}`} />
            <span>{isCollecting ? '전체 수집 진행중...' : '지금 전체 수집 실행 (Fetch All)'}</span>
          </button>

          <button
            onClick={() => setShowAddSourceModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 RSS 소스 등록</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {collectMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{collectMessage}</span>
        </div>
      )}

      {/* 2. Statistical Metric Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>등록된 RSS 피드</span>
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-serif-kr">
            {totalSources}개 <span className="text-xs text-slate-400 font-normal">({activeSources}개 활성)</span>
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-indigo-700 mb-1">
            <span>검토 대기 기사 (AI 생성완료)</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-950 font-serif-kr">
            {pendingItems.length}건
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span>신문 승인 발행 완료</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-serif-kr">
            {publishedItems.length}건
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>수집 상태 모니터링</span>
            <Clock className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 font-serif-kr flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>정상 가동 중 (All Systems OK)</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            subTab === 'pending'
              ? 'bg-slate-900 text-amber-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>검토 대기 큐 ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setSubTab('sources')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            subTab === 'sources'
              ? 'bg-slate-900 text-amber-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>RSS 소스 관리 ({sources.length})</span>
        </button>

        <button
          onClick={() => setSubTab('published')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            subTab === 'published'
              ? 'bg-slate-900 text-amber-300 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>발행 완료 내역 ({publishedItems.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PENDING REVIEW QUEUE */}
      {subTab === 'pending' && (
        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">현재 검토 대기 중인 AI 수집 기사가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">상단의 [지금 전체 수집 실행] 버튼을 눌러 새 기사를 수집하세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded">
                        {item.sourceName}
                      </span>
                      <span className="text-slate-400">{item.fetchedAt}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">원문 언어: {item.language === 'en' ? '영어(외신)' : item.language === 'fr' ? '프랑스어' : '한국어'}</span>
                    </div>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold text-[11px]"
                    >
                      <span>원문 출처 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* AI Generated Headline & Subtitle */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-serif-kr mb-1">
                      {item.generatedArticle.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium font-serif-kr">
                      {item.generatedArticle.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {item.generatedArticle.content}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-bold">기자 바이라인:</span>
                      <span>{item.generatedArticle.reporterName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectItem(item.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        반려·제외
                      </button>

                      <button
                        onClick={() => handleOpenReview(item)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정 및 문장개선</span>
                      </button>

                      <button
                        onClick={() => handleApprovePublish(item)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>승인 & 신문 발행</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: RSS SOURCES MANAGEMENT */}
      {subTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 font-serif-kr">
                      {src.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                      {src.country}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleToggleSource(src.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      src.isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {src.isActive ? '수집 활성' : '수집 일시중지'}
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-mono line-clamp-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                  {src.rssUrl}
                </p>

                <p className="text-xs text-slate-600">
                  {src.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span>주기: <strong>{src.interval}</strong></span>
                    <span>·</span>
                    <span>최근 수집: {src.lastFetchedAt || '없음'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCollectNow(src.id)}
                      disabled={isCollecting}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded transition-colors"
                      title="이 소스만 즉시 수집"
                    >
                      지금 수집
                    </button>
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="소스 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PUBLISHED LOGS */}
      {subTab === 'published' && (
        <div className="space-y-3">
          {publishedItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
              아직 RSS를 통해 정식 신문에 발행된 기사가 없습니다.
            </div>
          ) : (
            publishedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                      발행 완료
                    </span>
                    <span>출처: {item.sourceName}</span>
                    <span>·</span>
                    <span>수집: {item.fetchedAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif-kr">
                    {item.generatedArticle.title}
                  </h4>
                </div>

                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 shrink-0"
                >
                  <span>원문 링크</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* REVIEW & EDIT MODAL */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-300">
            <div className="bg-[#1b2a47] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold font-serif-kr text-base">
                  AI 수집 기사 검토 & 수정
                </h3>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  기사 제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold font-serif-kr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  부제목
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  본문
                </label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-serif-kr leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setReviewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                취소
              </button>

              <button
                onClick={() => handleApprovePublish(reviewingItem)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>승인 & 신문에 발행</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW RSS SOURCE MODAL */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-300">
            <div className="bg-[#1b2a47] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold font-serif-kr text-base">새 RSS 피드 소스 등록</h3>
              <button onClick={() => setShowAddSourceModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSource} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">기관 / 언론사명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 예술의전당, 국립현대미술관, BBC Culture..."
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">국가 / 지역</label>
                <input
                  type="text"
                  placeholder="예: 대한민국, 프랑스, 미국, 글로벌"
                  value={newSourceCountry}
                  onChange={(e) => setNewSourceCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RSS 피드 URL (XML/RSS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/rss.xml"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">언어</label>
                  <select
                    value={newSourceLang}
                    onChange={(e) => setNewSourceLang(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ko">한국어 (국내)</option>
                    <option value="en">영어 (외신)</option>
                    <option value="fr">프랑스어 (외신)</option>
                    <option value="ja">일본어 (외신)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">수집 주기</label>
                  <select
                    value={newSourceInterval}
                    onChange={(e) => setNewSourceInterval(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="30m">30분마다</option>
                    <option value="1h">1시간마다</option>
                    <option value="3h">3시간마다</option>
                    <option value="6h">6시간마다</option>
                    <option value="12h">12시간마다</option>
                    <option value="24h">24시간마다</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">설명 / 비고</label>
                <input
                  type="text"
                  placeholder="피드 주요 콘텐츠 설명"
                  value={newSourceDesc}
                  onChange={(e) => setNewSourceDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
