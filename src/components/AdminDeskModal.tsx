import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Users, 
  Layers, 
  Image as ImageIcon, 
  Calendar, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  Send, 
  X,
  Eye,
  Flame,
  Newspaper,
  Upload,
  AlertCircle,
  Globe,
  Database,
  Download,
  Copy,
  FileSpreadsheet,
  Rss,
  MapPin,
  Sparkles,
  Bot,
  RotateCcw,
  FileCode,
  Save
} from 'lucide-react';
import { 
  Article, 
  Reporter, 
  CulturalEvent, 
  CategoryId, 
  AuthUser, 
  CategoryTab, 
  Comment, 
  MediaAsset, 
  AdSettings, 
  SubNewsCategoryId, 
  RssFeedSource, 
  AutoCollectedItem, 
  IssueCluster,
  PopupConfig,
  DualPopupsConfig,
  McstRssItem
} from '../types';
import { GOOGLE_APPS_SCRIPT_NEWS_TIP_CODE, parseArticlesFromGoogleSheets } from '../utils/googleAppsScriptCode';
import { 
  DEFAULT_AD_SETTINGS,
  DEFAULT_DUAL_POPUPS_CONFIG,
  loadPersistedRssSources,
  savePersistedRssSources,
  loadPersistedRssItems,
  savePersistedRssItems,
  loadPersistedIssueClusters,
  savePersistedIssueClusters
} from '../utils/storage';
import { RssAutoCollectorTab } from './RssAutoCollectorTab';
import { McstRssCollectorTab } from './McstRssCollectorTab';
import { PopupManagerTab } from './PopupManagerTab';
import { WordPressImportTab } from './WordPressImportTab';
import { 
  saveArticleToFirestore, 
  deleteArticleFromFirestore, 
  saveArticlesBatchToFirestore, 
  parseDateSafely,
  getFirestoreArticleTotalCount,
  fetchMoreArticlesFromFirestore,
  searchAllFirestoreArticles
} from '../firebase';

interface AdminDeskModalProps {
  onClose: () => void;
  currentUser: AuthUser | null;
  articles: Article[];
  onUpdateArticles: (arts: Article[]) => void;
  reporters: Reporter[];
  onUpdateReporters: (reps: Reporter[]) => void;
  events: CulturalEvent[];
  onUpdateEvents: (evts: CulturalEvent[]) => void;
  categories: CategoryTab[];
  onUpdateCategories: (cats: CategoryTab[]) => void;
  adSettings?: AdSettings;
  onUpdateAdSettings?: (ads: AdSettings) => void;
  popupConfig?: PopupConfig;
  onUpdatePopupConfig?: (cfg: PopupConfig) => void;
  dualPopupsConfig?: DualPopupsConfig;
  onUpdateDualPopupsConfig?: (cfg: DualPopupsConfig) => void;
  initialTab?: string;
}

export const AdminDeskModal: React.FC<AdminDeskModalProps> = ({
  onClose,
  currentUser,
  articles,
  onUpdateArticles,
  reporters,
  onUpdateReporters,
  events,
  onUpdateEvents,
  categories,
  onUpdateCategories,
  adSettings = DEFAULT_AD_SETTINGS,
  onUpdateAdSettings,
  popupConfig,
  onUpdatePopupConfig,
  dualPopupsConfig = DEFAULT_DUAL_POPUPS_CONFIG,
  onUpdateDualPopupsConfig,
  initialTab = 'articles',
}) => {
  // Only the editor in chief has full CMS access.
  // Reporters are limited to their own articles.
  const isEditorInChief = currentUser?.role === 'EDITOR_IN_CHIEF';
  const canManageArticle = (article: Article) =>
    isEditorInChief || (!!currentUser?.reporterId && article.reporter?.id === currentUser.reporterId);

  // Tabs: 'articles' | 'write' | 'reporters' | 'categories' | 'media' | 'paper_layout' | 'events' | 'comments' | 'sheets_sync' | 'ads' | 'rss_collector'
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Paper Edition Workspace States (1면~4면 지면 직접 편성 데스크)
  const [paperSearchTerm, setPaperSearchTerm] = useState('');
  const [paperSearchCategory, setPaperSearchCategory] = useState<string>('all');
  const [selectedPaperPage, setSelectedPaperPage] = useState<number>(1);
  const [paperSaveMessage, setPaperSaveMessage] = useState<string | null>(null);
  const [isSavingPaper, setIsSavingPaper] = useState(false);

  // AI Sentence Polishing & Drafting State (5 Styles)
  type AiStyle = 'reporter' | 'factual' | 'scholarly' | 'concise' | 'natural';
  const [aiPolishingStyle, setAiPolishingStyle] = useState<AiStyle>('reporter');
  const [isPolishing, setIsPolishing] = useState(false);
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  // RSS Automated Collection State
  const [rssSources, setRssSources] = useState<RssFeedSource[]>(() => loadPersistedRssSources());
  const [rssItems, setRssItems] = useState<AutoCollectedItem[]>(() => loadPersistedRssItems());

  const handleUpdateRssSources = (newSources: RssFeedSource[]) => {
    setRssSources(newSources);
    savePersistedRssSources(newSources);
  };

  const handleUpdateRssItems = (newItems: AutoCollectedItem[]) => {
    setRssItems(newItems);
    savePersistedRssItems(newItems);
  };

  // Ad Settings Form State
  const [adsForm, setAdsForm] = useState<AdSettings>(adSettings);

  const [adSaveMessage, setAdSaveMessage] = useState<string | null>(null);

  const handleSaveAds = () => {
    if (onUpdateAdSettings) {
      onUpdateAdSettings(adsForm);
    }
    setAdSaveMessage('광고 설정이 성공적으로 저장되었습니다! 즉시 기사 페이지 및 사이드바에 반영됩니다.');
    setTimeout(() => setAdSaveMessage(null), 3500);
  };

  // Editing state for an existing article or new article
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Article Form State (Korean & English)
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('culture_art');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formSubtitleEn, setFormSubtitleEn] = useState('');
  const [formSummaryEn, setFormSummaryEn] = useState('');
  const [formContentEn, setFormContentEn] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formBadge, setFormBadge] = useState<Article['badge']>('단독');
  const [formPageNum, setFormPageNum] = useState<number>(1);
  const [formIsTop, setFormIsTop] = useState(false);
  const [formIsBreaking, setFormIsBreaking] = useState(false);

  // Dual-Channel Publishing State (메인 뉴스앱 & 서브 뉴스앱)
  const [formMainNewsEnabled, setFormMainNewsEnabled] = useState<boolean>(true);
  const [formSubNewsEnabled, setFormSubNewsEnabled] = useState<boolean>(true);
  const [formSubNewsCategory, setFormSubNewsCategory] = useState<SubNewsCategoryId>('sports');

  // Reporter / Author Info State (기자 이름 및 소속)
  const [formReporterName, setFormReporterName] = useState<string>('');
  const [formReporterDept, setFormReporterDept] = useState<string>('');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [eventPeriod, setEventPeriod] = useState('');
  const [eventCategory, setEventCategory] = useState<CulturalEvent['category']>('전시');
  const [eventImageUrl, setEventImageUrl] = useState('');

  // Media Mock List
  const [mediaList, setMediaList] = useState<MediaAsset[]>([
    {
      id: 'med-1',
      name: '훈민정음_해례본_국보.jpg',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      caption: '간송미술관 소장 훈민정음 해례본 원본 수장고 실사',
      photographer: '한국문화저널 사진부',
      uploadedAt: '2026.08.20',
      category: '유산',
      fileSize: '4.2 MB',
    },
    {
      id: 'med-2',
      name: '조선_백자_달항아리_18세기.jpg',
      url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600',
      caption: '18세기 분원 관요 제작 조선백자 달항아리',
      photographer: '국립중앙박물관 제공',
      uploadedAt: '2026.08.18',
      category: '미술',
      fileSize: '3.8 MB',
    },
  ]);

  // Comment Moderation Mock List
  const [commentsList, setCommentsList] = useState<Comment[]>([
    {
      id: 'comm-1',
      articleId: 'art-001',
      articleTitle: '해외 유출 국보급 조선 문화재 23만 점 환수 프로젝트',
      author: '독자_역사사랑',
      content: '국가유산청과 민간이 함께 협력해서 꼭 환수했으면 좋겠습니다.',
      createdAt: '2026.08.21 14:20',
      likes: 12,
      dislikes: 0,
      isBlocked: false,
    },
    {
      id: 'comm-2',
      articleId: 'art-002',
      articleTitle: '국립현대미술관 단색화 거장 회고전',
      author: '미술관나들이',
      content: '주말에 꼭 가봐야겠네요. 좋은 기사 감사합니다.',
      createdAt: '2026.08.21 16:45',
      likes: 8,
      dislikes: 1,
      isBlocked: false,
    },
  ]);

  // Article Management Search & Selective Deletion State
  const [deskSearchKeyword, setDeskSearchKeyword] = useState('');
  const [deskSearchCategory, setDeskSearchCategory] = useState<string>('all');
  const [deskSearchStatus, setDeskSearchStatus] = useState<string>('all');
  const [deskDateFilterType, setDeskDateFilterType] = useState<'all' | 'before_date'>('all');
  const [deskFilterDate, setDeskFilterDate] = useState<string>('');
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  
  // Live Firestore Total Article Count from Server
  const [totalFirestoreCount, setTotalFirestoreCount] = useState<number | null>(null);
  const [isSearchingFirestore, setIsSearchingFirestore] = useState(false);

  React.useEffect(() => {
    getFirestoreArticleTotalCount()
      .then((count) => {
        if (count > 0) setTotalFirestoreCount(count);
      })
      .catch(() => {});
  }, []);

  const handleDeepSearchFirestore = async () => {
    setIsSearchingFirestore(true);
    try {
      const results = await searchAllFirestoreArticles(deskSearchKeyword, deskSearchCategory, 150);
      if (results.length > 0) {
        const existingIdSet = new Set(articles.map((a) => a.id));
        const newArticles = results.filter((a) => !existingIdSet.has(a.id));
        if (newArticles.length > 0) {
          onUpdateArticles([...articles, ...newArticles]);
        }
      }
    } catch (err) {
      console.error('Error deep searching Firestore:', err);
    } finally {
      setIsSearchingFirestore(false);
    }
  };

  // Toggle selection for all visible filtered articles
  const handleToggleSelectAll = (filteredList: Article[]) => {
    const visibleIds = filteredList.map(a => a.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedArticleIds.includes(id));
    if (allSelected) {
      setSelectedArticleIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedArticleIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Toggle selection for a single article
  const handleToggleSelectArticle = (id: string) => {
    setSelectedArticleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected Articles (Explicit user confirmation required)
  const handleDeleteSelectedArticles = async () => {
    if (selectedArticleIds.length === 0) {
      alert('삭제할 기사를 먼저 체크박스로 선택해주세요.');
      return;
    }

    const count = selectedArticleIds.length;
    if (!window.confirm(`선택한 ${count}개의 기사를 영구 삭제하시겠습니까? (삭제 후 복구 불가)`)) {
      return;
    }

    // Delete chosen ones from Firestore
    for (const id of selectedArticleIds) {
      deleteArticleFromFirestore(id).catch(err => {
        console.error(`Failed to delete article ${id} from Firestore:`, err);
      });
    }

    const updated = articles.filter(a => !selectedArticleIds.includes(a.id));
    onUpdateArticles(updated);
    setSelectedArticleIds([]);
    alert(`선택한 ${count}개의 기사가 정상적으로 삭제되었습니다.`);
  };

  // Open Writer
  const handleOpenWriter = (articleToEdit?: Article) => {
    if (articleToEdit) {
      setEditingArticle(articleToEdit);
      setFormTitle(articleToEdit.title);
      setFormSubtitle(articleToEdit.subtitle || '');
      setFormCategory(articleToEdit.category);
      setFormSummary(articleToEdit.summary);
      setFormContent(articleToEdit.content);
      setFormTitleEn(articleToEdit.titleEn || '');
      setFormSubtitleEn(articleToEdit.subtitleEn || '');
      setFormSummaryEn(articleToEdit.summaryEn || '');
      setFormContentEn(articleToEdit.contentEn || '');
      setFormImageUrl(articleToEdit.imageUrl);
      setFormImageCaption(articleToEdit.imageCaption || '');
      setFormTags(articleToEdit.tags.join(', '));
      setFormBadge(articleToEdit.badge || '단독');
      setFormPageNum(articleToEdit.pageNumber || 1);
      setFormIsTop(!!articleToEdit.isTopHeadline);
      setFormIsBreaking(!!articleToEdit.isBreaking);
      setFormMainNewsEnabled(articleToEdit.mainNewsEnabled !== false);
      setFormSubNewsEnabled(articleToEdit.subNewsEnabled !== false);
      setFormSubNewsCategory(articleToEdit.subNewsCategory || 'sports');
    } else {
      setEditingArticle(null);
      setFormTitle('');
      setFormSubtitle('');
      setFormCategory('culture_art');
      setFormSummary('');
      setFormContent('');
      setFormTitleEn('');
      setFormSubtitleEn('');
      setFormSummaryEn('');
      setFormContentEn('');
      setFormImageUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800');
      setFormImageCaption('');
      setFormTags('한국문화저널, 문화예술, 단독보도');
      setFormBadge('단독');
      setFormPageNum(1);
      setFormIsTop(false);
      setFormIsBreaking(false);
      setFormMainNewsEnabled(true);
      setFormSubNewsEnabled(true);
      setFormSubNewsCategory('sports');
    }
    setActiveTab('write');
  };

  // Handler: Register from MCST Official RSS Item
  const handleRegisterFromMcstRss = (item: McstRssItem) => {
    setEditingArticle(null);
    setFormTitle(item.title);
    setFormSubtitle(`문화체육관광부 보도자료 (${item.pubDate})`);
    setFormCategory('culture_art');
    setFormSummary(item.description);
    setFormContent(`${item.title}\n\n[문화체육관광부 보도자료]\n${item.description}\n\n■ 출처: 대한민국 문화체육관광부 공식 보도자료\n■ 원문 링크: ${item.link}\n■ 배포일시: ${item.pubDate}\n\n본 기사는 문화체육관광부 공식 정책 브리핑 자료를 바탕으로 재구성되었습니다.`);
    setFormTitleEn('');
    setFormSubtitleEn('');
    setFormSummaryEn('');
    setFormContentEn('');
    setFormImageUrl(item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800');
    setFormImageCaption(`▲ 문화체육관광부 제공 (${item.title})`);
    setFormTags('문체부, 문화체육관광부, 보도자료, 정책브리핑, K-컬처');
    setFormBadge('속보');
    setFormPageNum(1);
    setFormIsTop(false);
    setFormIsBreaking(true);
    setFormMainNewsEnabled(true);
    setFormSubNewsEnabled(true);
    setFormSubNewsCategory('politics_economy');
    setActiveTab('write');
  };

  // AI Sentence Polishing Handler (5 Styles: Reporter, Fact-based, Academic/Explanatory, Concise/Breaking, Natural)
  const handleAiPolish = (style: 'reporter' | 'factual' | 'scholarly' | 'concise' | 'natural') => {
    if (!formContent.trim()) {
      alert('다듬을 기사 본문 내용을 먼저 입력해주세요.');
      return;
    }
    setPreviousContent(formContent);
    setIsPolishing(true);
    setAiPolishingStyle(style);

    setTimeout(() => {
      let result = formContent;
      if (style === 'reporter') {
        // 1. 기자 수첩형: 명확한 육하원칙 보도체
        result = result
          .replace(/태동하고 있다/g, '본격화됐다')
          .replace(/집중시키고 있다/g, '모으고 있다')
          .replace(/평가를 받는다/g, '평가다')
          .replace(/강조했다/g, '밝혔다')
          .replace(/생명력을 얻는다/g, '가치를 발휘한다')
          .replace(/생각된다|보여진다/g, '분석된다')
          .replace(/것으로 보인다/g, '것으로 확인됐다');
      } else if (style === 'factual') {
        // 2. 사실 중심형: 주관적 형용사를 배제하고 팩트 위주로 정제
        result = result
          .replace(/진정한 생명력을 얻는다/g, '역사적 가치를 이어가고 있다')
          .replace(/현대인의 정서적 갈증을 채워주고 있다/g, '대중적 호응과 학술적 검토를 동시에 이끌어내고 있다')
          .replace(/비상한 관심 집중/g, '관련 지표 상승세')
          .replace(/눈부신|경이로운|압도적인/g, '주요');
      } else if (style === 'scholarly') {
        // 3. 학술·해설형: 인문학적 비평과 사료적 맥락 보강
        result = result
          .replace(/새로운 패러다임/g, '포스트모던적 미학 담론')
          .replace(/선조들의 지혜가 담긴/g, '조선조 사료와 조형 미학에 근거한 독창적')
          .replace(/접점을 획기적으로 넓혔다는/g, '장르적 외연을 확장한 학술적 의의를 지닌다는')
          .replace(/아름답다/g, '심미적 조형 가치가 높다');
      } else if (style === 'concise') {
        // 4. 간결·속보형: 문장을 짧게 끊고 군더더기를 축약
        const paragraphs = result.split('\n\n');
        result = paragraphs
          .map(p => {
            const sentences = p.split('. ').filter(s => s.trim().length > 0);
            return sentences.map(s => s.endsWith('.') ? s : s + '.').slice(0, 3).join(' ');
          })
          .join('\n\n');
      } else if (style === 'natural') {
        // 5. 자연스러운 문체: 부드럽고 가독성 높은 현대 문화 문체
        result = result
          .replace(/~함에 따라/g, '하면서')
          .replace(/인하여/g, '으로')
          .replace(/기대된다/g, '기대를 모으고 있다')
          .replace(/바 있다/g, '적이 있다');
      }
      setFormContent(result);
      setIsPolishing(false);
    }, 450);
  };

  const handleUndoAiPolish = () => {
    if (previousContent) {
      setFormContent(previousContent);
      setPreviousContent(null);
    }
  };

  const handleAiGenerateDraft = () => {
    const topic = formTitle || '조선 왕실 문화유산과 현대 K-컬처 융합 특별전';
    setIsGeneratingDraft(true);
    setTimeout(() => {
      setFormTitle(formTitle || `[기획] "${topic}"… 한국 문화예술의 새 지평`);
      setFormSubtitle(formSubtitle || '전통의 고유성과 현대적 미학의 만남, 국내외 문화계 비상한 관심 집중');
      setFormSummary(formSummary || `한국문화저널 특별취재팀이 조명한 '${topic}' 심층 르포.`);
      setFormContent(`대한민국 문화 예술계에 새로운 패러다임이 태동하고 있다. 최근 '${topic}'을 둘러싼 다양한 담론과 창작 실험들이 국경을 넘어 전 세계 관객과 비평가들의 이목을 집중시키고 있다.\n\n전통은 고정된 박제가 아니라 시대와 호흡하며 끊임없이 재해석될 때 진정한 생명력을 얻는다. 이번 기획은 선조들의 지혜가 담긴 조형미와 철학적 깊이를 현대적 미디어와 결합해 대중과의 접점을 획기적으로 넓혔다는 평가를 받는다.\n\n현장 취재진이 만난 문화계 관계자는 "한국 고유의 서사와 미학적 질감이 현대인의 정서적 갈증을 채워주고 있다"며 "앞으로도 전통과 현대를 잇는 다채로운 학술 연구와 창작 시도가 이어질 것"이라고 강조했다.`);
      if (!formImageUrl) {
        setFormImageUrl('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80');
      }
      if (!formTags) {
        setFormTags('한국문화저널, AI기획, 문화예술, K-헤리티지');
      }
      setIsGeneratingDraft(false);
    }, 550);
  };

  // Reporter status change handler (Editor-in-Chief only)
  const handleUpdateReporterStatus = (reporterId: string, newStatus: Reporter['status']) => {
    const updated = reporters.map(r => r.id === reporterId ? { ...r, status: newStatus } : r);
    onUpdateReporters(updated);
  };

  // Submit Article (Save Draft / Submit for Review / Publish by Editor)
  const handleSaveArticle = (targetStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED') => {
    // Security rule: reporters can never publish directly, even if a UI event
    // accidentally sends PUBLISHED. Only the editor in chief may publish.
    if (!isEditorInChief && targetStatus === 'PUBLISHED') {
      targetStatus = 'PENDING_REVIEW';
    }
    if (!formTitle.trim() || !formContent.trim()) {
      alert('기사 제목과 본문을 입력해주세요.');
      return;
    }

    if (!formMainNewsEnabled && !formSubNewsEnabled) {
      alert('발행 채널을 최소 하나 이상 선택해야 합니다 (메인 뉴스앱 또는 서브 뉴스앱).');
      return;
    }

    const currentReporter = reporters.find(r => r.id === currentUser?.reporterId) || reporters[0] || {
      id: 'rep-default',
      name: currentUser?.name || '편집국 기자',
      title: '취재기자',
      department: currentUser?.department || '문화부',
      email: currentUser?.email || 'reporter@kculturejournal.com',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: '한국문화저널 데스크 취재기자',
      subscriberCount: 120,
      cheerCount: 45,
      status: 'ACTIVE',
    };

    const parsedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingArticle) {
      // Update existing
      let updatedTargetArticle: Article | null = null;
      const updated = articles.map(art => {
        if (art.id === editingArticle.id) {
          const canonical = formMainNewsEnabled ? `https://kculturejournal.com/article/${art.id}` : `https://kculturejournal.com/sub-news/article/${art.id}`;
          const modified: Article = {
            ...art,
            title: formTitle,
            subtitle: formSubtitle,
            category: formCategory,
            summary: formSummary,
            content: formContent,
            titleEn: formTitleEn || undefined,
            subtitleEn: formSubtitleEn || undefined,
            summaryEn: formSummaryEn || undefined,
            contentEn: formContentEn || undefined,
            imageUrl: formImageUrl || art.imageUrl,
            imageCaption: formImageCaption,
            tags: parsedTags.length > 0 ? parsedTags : art.tags,
            badge: formBadge,
            pageNumber: formPageNum,
            isTopHeadline: formIsTop,
            isBreaking: formIsBreaking,
            mainNewsEnabled: formMainNewsEnabled,
            subNewsEnabled: formSubNewsEnabled,
            subNewsCategory: formSubNewsCategory,
            canonicalUrl: canonical,
            status: targetStatus,
            requiresEditorApproval: !isEditorInChief || targetStatus === 'PENDING_REVIEW',
            updatedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          };
          updatedTargetArticle = modified;
          return modified;
        }
        return art;
      });
      if (updatedTargetArticle) {
        saveArticleToFirestore(updatedTargetArticle).catch(err => {
          console.error('Failed to save updated article to Firestore:', err);
        });
      }
      onUpdateArticles(updated);
      alert('기사가 성공적으로 수정되었습니다.');
    } else {
      // Create new
      const newId = `art-user-${Date.now()}`;
      const canonical = formMainNewsEnabled ? `https://kculturejournal.com/article/${newId}` : `https://kculturejournal.com/sub-news/article/${newId}`;

      const newArticle: Article = {
        id: newId,
        category: formCategory,
        categoryLabel: formCategory === 'culture_art' ? '문화·예술' : formCategory === 'heritage' ? '전통·유산' : formCategory === 'k_culture' ? 'K-컬처' : '오피니언',
        title: formTitle,
        subtitle: formSubtitle,
        summary: formSummary || formContent.slice(0, 100),
        content: formContent,
        titleEn: formTitleEn || undefined,
        subtitleEn: formSubtitleEn || undefined,
        summaryEn: formSummaryEn || (formContentEn ? formContentEn.slice(0, 100) : undefined),
        contentEn: formContentEn || undefined,
        reporter: currentReporter,
        publishedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        views: 0,
        shares: 0,
        likes: 0,
        reactions: { info: 0, exciting: 0, empathy: 0, analysis: 0, followup: 0 },
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        imageCaption: formImageCaption,
        tags: parsedTags.length > 0 ? parsedTags : ['문화', '한국문화저널'],
        badge: formBadge,
        pageNumber: formPageNum,
        isTopHeadline: formIsTop,
        isBreaking: formIsBreaking,
        mainNewsEnabled: formMainNewsEnabled,
        subNewsEnabled: formSubNewsEnabled,
        subNewsCategory: formSubNewsCategory,
        canonicalUrl: canonical,
        status: targetStatus,
        requiresEditorApproval: !isEditorInChief || targetStatus === 'PENDING_REVIEW',
        commentsCount: 0,
      };

      saveArticleToFirestore(newArticle).catch(err => {
        console.error('Failed to save new article to Firestore:', err);
      });

      let newArticlesList = [newArticle, ...articles];
      if (formIsTop && isEditorInChief) {
        newArticlesList = newArticlesList.map(a => a.id === newArticle.id ? a : { ...a, isTopHeadline: false });
      }
      onUpdateArticles(newArticlesList);
      alert(targetStatus === 'PUBLISHED' ? '기사가 지면에 정식 발행되었습니다.' : '기사가 송고되었습니다.');
    }

    setActiveTab('articles');
  };

  // Approve Article (Editor in chief only)
  const handleApproveArticle = (articleId: string) => {
    const target = articles.find(art => art.id === articleId);
    if (target) {
      const approved = { ...target, status: 'PUBLISHED' as const, publishedAt: '방금 전' };
      saveArticleToFirestore(approved).catch(console.error);
    }
    const updated = articles.map(art => {
      if (art.id === articleId) {
        return { ...art, status: 'PUBLISHED' as const, publishedAt: '방금 전' };
      }
      return art;
    });
    onUpdateArticles(updated);
    alert('기사가 최종 승인되어 정식 지면에 배포되었습니다.');
  };

  // Reject Article
  const handleRejectArticle = (articleId: string) => {
    const reason = prompt('반려 사유를 입력하세요 (기자에게 전달됩니다):', '사료 출처 재검증 필요 및 문장 교열 권고');
    if (reason === null) return;

    const target = articles.find(art => art.id === articleId);
    if (target) {
      const rejected = { ...target, status: 'REJECTED' as const, rejectionReason: reason };
      saveArticleToFirestore(rejected).catch(console.error);
    }
    const updated = articles.map(art => {
      if (art.id === articleId) {
        return { ...art, status: 'REJECTED' as const, rejectionReason: reason };
      }
      return art;
    });
    onUpdateArticles(updated);
    alert('기사가 반려 처리되었습니다.');
  };

  // Delete Article (Explicit user deletion only)
  const handleDeleteArticle = (articleId: string) => {
    if (!window.confirm('정말 이 기사를 삭제하시겠습니까? (삭제 후 복구 불가)')) return;
    deleteArticleFromFirestore(articleId).catch(err => {
      console.error('Failed to delete from Firestore:', err);
    });
    onUpdateArticles(articles.filter(a => a.id !== articleId));
  };

  // Set Top Headline
  const handleSetTopHeadline = (articleId: string) => {
    const updated = articles.map(art => ({
      ...art,
      isTopHeadline: art.id === articleId,
    }));
    onUpdateArticles(updated);
    alert('선택한 기사가 오늘의 1면 톱 헤드라인으로 지정되었습니다.');
  };

  // Add Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventPlace) return;

    const newEvt: CulturalEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      place: eventPlace,
      period: eventPeriod || '2026.09.01 ~ 2026.11.30',
      category: eventCategory,
      imageUrl: eventImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=500',
      dDay: 'D-3',
      status: '진행중',
    };

    onUpdateEvents([newEvt, ...events]);
    setEventTitle('');
    setEventPlace('');
    setEventPeriod('');
    alert('새로운 문화 행사가 캘린더에 정식 등록되었습니다.');
  };

  // Toggle Block Comment
  const handleToggleBlockComment = (commId: string) => {
    setCommentsList(prev => prev.map(c => c.id === commId ? { ...c, isBlocked: !c.isBlocked } : c));
  };

  // Delete Comment
  const handleDeleteComment = (commId: string) => {
    setCommentsList(prev => prev.filter(c => c.id !== commId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
        
        {/* 1. CMS Header Bar */}
        <div className="px-6 py-3.5 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black font-serif-kr text-xl flex items-center justify-center shadow-xs">
              韓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-kr text-lg font-bold">한국문화저널 통합 CMS 데스크</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isEditorInChief ? 'bg-amber-400 text-slate-950' : 'bg-blue-500 text-white'
                }`}>
                  {isEditorInChief ? '편집국장 (총괄 관리자)' : '소속 취재기자 데스크'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                접속자: <strong className="text-white">{currentUser?.name || '편집인'}</strong> ({currentUser?.department || '편집국'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenWriter()}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>새 기사 작성·송고</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. CMS Tab Navigation (2-Row Clean Layout) */}
        <div className="bg-[#f5f1eb] border-b border-[#ded8cf] px-3 py-2 space-y-1.5 text-xs font-bold font-serif-kr">
          {/* Row 1: Core Editorial Desk (7 Tabs) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                activeTab === 'articles'
                  ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>기사 승인 & 송고 관리 ({articles.length})</span>
            </button>

            <button
              onClick={() => handleOpenWriter()}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                activeTab === 'write'
                  ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>기사 작성기 (에디터)</span>
            </button>

            {isEditorInChief && (
              <>
                <button
                  onClick={() => setActiveTab('paper_layout')}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    activeTab === 'paper_layout'
                      ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>지면 편집 (1~4면 배정)</span>
                </button>

                <button
                  onClick={() => setActiveTab('reporters')}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    activeTab === 'reporters'
                      ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>기자단 관리 ({reporters.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    activeTab === 'categories'
                      ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>카테고리 관리</span>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    activeTab === 'media'
                      ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>보도사진/미디어</span>
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                    activeTab === 'events'
                      ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>문화행사 등록 ({events.length})</span>
                </button>
              </>
            )}
          </div>

          {/* Row 2: Operations, System, Ads & Integration (6 Tabs) */}
          {isEditorInChief && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#e5dfd5]">
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'comments'
                    ? 'bg-[#1b2a47] text-amber-300 border-[#1b2a47] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>댓글 모니터링</span>
              </button>

              <button
                onClick={() => setActiveTab('sheets_sync')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'sheets_sync'
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>구글 시트 연동 (7열 DB)</span>
              </button>

              <button
                onClick={() => setActiveTab('mcst_rss')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'mcst_rss'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100 font-black'
                }`}
              >
                <Rss className="w-3.5 h-3.5 text-blue-600" />
                <span>RSS 수집함 (문체부)</span>
              </button>

              <button
                onClick={() => setActiveTab('popup')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'popup'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 font-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                <span>팝업 관리</span>
              </button>

              <button
                onClick={() => setActiveTab('ads')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'ads'
                    ? 'bg-orange-800 text-white border-orange-800 shadow-xs'
                    : 'bg-orange-50 text-orange-950 border-orange-300 hover:bg-orange-100 font-black'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>광고 동적 삽입 관리</span>
              </button>

              <button
                onClick={() => setActiveTab('rss_collector')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'rss_collector'
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                    : 'bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100 font-black'
                }`}
              >
                <Rss className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI 자동 뉴스 수집 (RSS)</span>
              </button>

              <button
                onClick={() => setActiveTab('wp_import')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'wp_import'
                    ? 'bg-amber-900 text-amber-300 border-amber-900 shadow-xs font-black'
                    : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 font-bold'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-700" />
                <span>WordPress 기사 가져오기 (XML)</span>
              </button>
            </div>
          )}
        </div>


        {/* 3. CMS Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          
          {/* TAB 1: Article List & Approval Workflow */}
          {activeTab === 'articles' && (() => {
            const filteredDeskArticles = articles.filter(art => {
              // Reporters must never see or manage other reporters' articles.
              if (!canManageArticle(art)) return false;
              // 1. Keyword search (title, content, reporter, tags)
              if (deskSearchKeyword.trim()) {
                const q = deskSearchKeyword.toLowerCase().trim();
                const matchTitle = art.title?.toLowerCase().includes(q);
                const matchReporter = art.reporter?.name?.toLowerCase().includes(q);
                const matchContent = art.content?.toLowerCase().includes(q);
                const matchTags = art.tags?.some(t => t.toLowerCase().includes(q));
                if (!matchTitle && !matchReporter && !matchContent && !matchTags) return false;
              }

              // 2. Category filter
              if (deskSearchCategory !== 'all' && art.category !== deskSearchCategory) {
                return false;
              }

              // 3. Status filter
              if (deskSearchStatus === 'PENDING' && art.status !== 'PENDING_REVIEW') return false;
              if (deskSearchStatus === 'REJECTED' && art.status !== 'REJECTED') return false;
              if (deskSearchStatus === 'PUBLISHED' && (art.status && art.status !== 'PUBLISHED')) return false;

              // 4. Date filter (e.g. before date for old articles)
              if (deskDateFilterType === 'before_date' && deskFilterDate) {
                const artTime = parseDateSafely(art.publishedAt);
                const targetTime = new Date(deskFilterDate).getTime() + (24 * 60 * 60 * 1000 - 1);
                if (artTime > targetTime) return false;
              }

              return true;
            });

            const allVisibleSelected = filteredDeskArticles.length > 0 && 
              filteredDeskArticles.every(a => selectedArticleIds.includes(a.id));

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e2ded6]">
                  <div>
                    <h3 className="font-serif-kr text-base font-bold text-slate-900">
                      기사 송고 & 승인 대시보드
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      {isEditorInChief 
                        ? '기자가 송고한 기사를 검토하여 [승인·발행] 또는 [반려]하고, 날짜/제목 검색 및 선택 삭제를 관리합니다.'
                        : '작성하신 기사의 송고 상태(승인 대기, 발행 완료, 반려)를 확인하고 관리합니다.'}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Firestore 실제 전체 기사: <strong className="text-slate-900 font-bold">{totalFirestoreCount !== null ? totalFirestoreCount.toLocaleString() : articles.length.toLocaleString()}건</strong> (현재 로드: {articles.length}건 / 검색결과: {filteredDeskArticles.length}건)
                  </div>
                </div>

                {/* Filter & Bulk Action Toolbar */}
                <div className="p-3.5 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {/* Keyword Search */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">제목·기자·내용 검색</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={deskSearchKeyword}
                          onChange={(e) => setDeskSearchKeyword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleDeepSearchFirestore();
                          }}
                          placeholder="기사 제목, 기자명, 태그 등..."
                          className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">카테고리</label>
                      <select
                        value={deskSearchCategory}
                        onChange={(e) => setDeskSearchCategory(e.target.value)}
                        className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                      >
                        <option value="all">전체 카테고리</option>
                        <option value="culture_art">문화·예술</option>
                        <option value="heritage">전통·유산</option>
                        <option value="k_culture">K-컬처</option>
                        <option value="opinion">오피니언</option>
                        <option value="photo_video">포토·영상</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">발행 상태</label>
                      <select
                        value={deskSearchStatus}
                        onChange={(e) => setDeskSearchStatus(e.target.value)}
                        className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                      >
                        <option value="all">전체 상태</option>
                        <option value="PUBLISHED">지면 발행완료</option>
                        <option value="PENDING">승인 대기중</option>
                        <option value="REJECTED">반려됨</option>
                      </select>
                    </div>

                    {/* Date Search (오래된 기사 검색) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">발행일 기준 필터</label>
                      <div className="flex items-center gap-1">
                        <select
                          value={deskDateFilterType}
                          onChange={(e) => setDeskDateFilterType(e.target.value as any)}
                          className="p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 text-xs focus:outline-none"
                        >
                          <option value="all">전체 기간</option>
                          <option value="before_date">이전 날짜만</option>
                        </select>
                        {deskDateFilterType === 'before_date' && (
                          <input
                            type="date"
                            value={deskFilterDate}
                            onChange={(e) => setDeskFilterDate(e.target.value)}
                            className="flex-1 p-1.5 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 text-xs focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selective Action Bar */}
                  <div className="pt-2 border-t border-[#e2ded6] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={() => handleToggleSelectAll(filteredDeskArticles)}
                          className="w-4 h-4 rounded text-[#1b2a47]"
                        />
                        <span>현재 검색 결과 전체 선택 ({filteredDeskArticles.length}건)</span>
                      </label>
                      {selectedArticleIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-[#1b2a47] rounded-full text-xs font-bold font-mono">
                          {selectedArticleIds.length}개 선택됨
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleDeepSearchFirestore}
                        disabled={isSearchingFirestore}
                        className="px-2.5 py-1 bg-[#1b2a47] hover:bg-[#253960] text-amber-300 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                        title="현재 로드된 80건 외에 Firestore 전체 데이터베이스에서 추가 검색 및 불러옵니다"
                      >
                        <Database className="w-3 h-3 text-amber-400" />
                        <span>{isSearchingFirestore ? '전체 DB 검색 중...' : 'Firestore 전체에서 추가 검색/불러오기'}</span>
                      </button>
                    </div>

                    {selectedArticleIds.length > 0 && isEditorInChief && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedArticles}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>선택한 {selectedArticleIds.length}개 기사 영구 삭제</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="border border-[#d8d3cb] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#f8f6f2] border-b border-[#d8d3cb] text-slate-700 font-bold font-serif-kr">
                      <tr>
                        <th className="p-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={() => handleToggleSelectAll(filteredDeskArticles)}
                            className="w-3.5 h-3.5 rounded text-[#1b2a47]"
                          />
                        </th>
                        <th className="p-3 text-center w-16">지면</th>
                        <th className="p-3">기사 제목 / 섹션</th>
                        <th className="p-3 w-28">작성 기자</th>
                        <th className="p-3 w-28 text-center">승인 상태</th>
                        <th className="p-3 w-24 text-center">발행일</th>
                        <th className="p-3 w-16 text-center">조회수</th>
                        <th className="p-3 text-right w-44">관리 기능</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeebe3]">
                      {filteredDeskArticles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                            검색 조건에 일치하는 기사가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredDeskArticles.map((art) => {
                          const isPending = art.status === 'PENDING_REVIEW';
                          const isRejected = art.status === 'REJECTED';
                          const isPublished = !art.status || art.status === 'PUBLISHED';
                          const isSelected = selectedArticleIds.includes(art.id);

                          return (
                            <tr key={art.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-[#faf8f5]'}`}>
                              {/* Checkbox */}
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectArticle(art.id)}
                                  className="w-3.5 h-3.5 rounded text-[#1b2a47]"
                                />
                              </td>

                              {/* Page Number */}
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 bg-[#f0ebe3] rounded text-[11px] font-bold text-slate-700">
                                  {art.pageNumber || 1}면
                                </span>
                              </td>

                              {/* Title */}
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  {art.isTopHeadline && (
                                    <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px] font-black">
                                      1면 톱
                                    </span>
                                  )}
                                  {art.isBreaking && (
                                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[10px] font-black">
                                      속보
                                    </span>
                                  )}
                                  {/* Channel Indicator Badge */}
                                  {art.mainNewsEnabled !== false && art.subNewsEnabled !== false ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-blue-100 to-amber-100 text-slate-900 border border-amber-300 rounded">
                                      메인+서브
                                    </span>
                                  ) : art.mainNewsEnabled !== false ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-900 border border-blue-300 rounded">
                                      메인전용
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                                      서브전용
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-[#1b2a47]">
                                    [{art.categoryLabel}]
                                  </span>
                                  {art.badge && (
                                    <span className="text-[10px] px-1 bg-slate-100 rounded text-slate-600 border border-slate-200">
                                      {art.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="font-serif-kr font-bold text-slate-900 text-sm line-clamp-1">
                                  {art.title}
                                </p>
                                {isRejected && art.rejectionReason && (
                                  <p className="text-[11px] text-rose-600 mt-1 font-bold">
                                    ⚠ 반려 사유: {art.rejectionReason}
                                  </p>
                                )}
                              </td>

                              {/* Reporter */}
                              <td className="p-3">
                                <span className="font-bold text-slate-800">{art.reporter.name}</span>
                                <span className="text-[10px] text-slate-400 block">{art.reporter.department}</span>
                              </td>

                              {/* Status */}
                              <td className="p-3 text-center">
                                {isPending ? (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px] animate-pulse">
                                    승인 대기중
                                  </span>
                                ) : isRejected ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-[10px]">
                                    반려됨
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px]">
                                    지면 발행완료
                                  </span>
                                )}
                              </td>

                              {/* Published At Date */}
                              <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                                {art.publishedAt || '-'}
                              </td>

                              {/* Views */}
                              <td className="p-3 text-center text-slate-500 font-mono">
                                {art.views.toLocaleString()}
                              </td>

                              {/* Action Buttons */}
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {/* Editor in Chief Approval Actions */}
                                  {isEditorInChief && isPending && (
                                    <>
                                      <button
                                        onClick={() => handleApproveArticle(art.id)}
                                        title="기사 승인 및 즉시 발행"
                                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 font-bold text-[11px]"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>승인</span>
                                      </button>
                                      <button
                                        onClick={() => handleRejectArticle(art.id)}
                                        title="기사 반려 (수정 요청)"
                                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg flex items-center gap-1 font-bold text-[11px]"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>반려</span>
                                      </button>
                                    </>
                                  )}

                                  {/* Editor in chief Top Headline toggle */}
                                  {isEditorInChief && isPublished && (
                                    <button
                                      onClick={() => handleSetTopHeadline(art.id)}
                                      className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
                                        art.isTopHeadline
                                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${art.isTopHeadline ? 'fill-rose-600 text-rose-600' : ''}`} />
                                      <span>{art.isTopHeadline ? '1면 톱 지정됨' : '1면 톱'}</span>
                                    </button>
                                  )}

                                  {/* Edit: reporters can edit only their own articles */}
                                  {canManageArticle(art) && (
                                    <button
                                      onClick={() => handleOpenWriter(art)}
                                      title="수정"
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Delete Single Article */}
                                  {canManageArticle(art) && (
                                    <button
                                      onClick={() => handleDeleteArticle(art.id)}
                                      title="삭제"
                                      className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: Full Article Editor / Writer */}
          {activeTab === 'write' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2ded6]">
                <h3 className="font-serif-kr text-base font-bold text-slate-900">
                  {editingArticle ? '기사 수정 및 지면 재배치' : '새 기사 작성 및 송고'}
                </h3>
                <span className="text-xs text-slate-500 font-sans">
                  {isEditorInChief ? '편집국장 권한: 즉시 발행 또는 지면 지정 가능' : '기자 권한: 작성 후 편집국 송고(승인 요청)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-sans">
                {/* Left Form: Main Content (8 Cols) */}
                <div className="md:col-span-8 space-y-4">
                  {/* Dual Channel Publishing Section (단일 DB 통합 발행 채널 선택) */}
                  <div className="p-4 bg-gradient-to-r from-amber-50/80 to-blue-50/80 border border-amber-200/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>통합 발행 채널 선택 (원클릭 전환 및 맞춤 송고) *</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-sans">
                        * 서브뉴스만, 메인뉴스만, 또는 양쪽 동시 발행을 자유롭게 지정할 수 있습니다.
                      </span>
                    </div>

                    {/* Quick Preset Selector Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormMainNewsEnabled(true);
                          setFormSubNewsEnabled(false);
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                          formMainNewsEnabled && !formSubNewsEnabled
                            ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        📰 메인 뉴스앱만
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormMainNewsEnabled(false);
                          setFormSubNewsEnabled(true);
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                          !formMainNewsEnabled && formSubNewsEnabled
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        🌐 서브 뉴스앱만
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormMainNewsEnabled(true);
                          setFormSubNewsEnabled(true);
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                          formMainNewsEnabled && formSubNewsEnabled
                            ? 'bg-gradient-to-r from-blue-700 to-amber-600 text-white border-transparent shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        ✨ 메인 + 서브 동시
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Option 1: Main News App */}
                      <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        formMainNewsEnabled ? 'bg-white border-[#1b2a47] shadow-xs' : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formMainNewsEnabled}
                          onChange={(e) => setFormMainNewsEnabled(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-[#1b2a47] focus:ring-[#1b2a47]"
                        />
                        <div>
                          <strong className="block text-slate-900 text-xs">📰 메인 뉴스앱 (한국문화저널)</strong>
                          <span className="text-[11px] text-slate-500">
                            PC 웹 / 모바일 웹 / 지면에 노출
                          </span>
                        </div>
                      </label>

                      {/* Option 2: Sub News App */}
                      <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        formSubNewsEnabled ? 'bg-white border-amber-600 shadow-xs' : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formSubNewsEnabled}
                          onChange={(e) => setFormSubNewsEnabled(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-600"
                        />
                        <div>
                          <strong className="block text-slate-900 text-xs">🌐 서브 뉴스앱 (분야별 포털)</strong>
                          <span className="text-[11px] text-slate-500">
                            포털형 분야별 뉴스 (스포츠, 씨름, 무예, IT, AI 등)
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Sub News Category Selection */}
                    {formSubNewsEnabled && (
                      <div className="pt-2 border-t border-amber-200/60 mt-2">
                        <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                          서브 뉴스 카테고리 (분야 선택) *
                        </label>
                        <select
                          value={formSubNewsCategory}
                          onChange={(e) => setFormSubNewsCategory(e.target.value as SubNewsCategoryId)}
                          className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                        >
                          <option value="sports">🏅 스포츠 (Sports)</option>
                          <option value="ssireum">🤼 씨름 (Ssireum / 민속씨름)</option>
                          <option value="martial_arts">🥋 무예 (Martial Arts / 전통무예)</option>
                          <option value="sports_science">🔬 스포츠과학 (Sports Science)</option>
                          <option value="it">💻 IT (Information Tech)</option>
                          <option value="ai">🤖 AI (Artificial Intelligence)</option>
                          <option value="politics_economy">📈 정치·경제 (Politics & Economy)</option>
                          <option value="travel">✈️ 여행 (Travel & Tour)</option>
                          <option value="education">🎓 교육 (Education)</option>
                          <option value="international">🌍 국제 (International)</option>
                          <option value="regional">🏛️ 지역 (Regional & Local)</option>
                          <option value="life">🌿 라이프 (Life & Health)</option>
                          <option value="etc">📌 기타 (Etc / Specialized)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Category & Badge & Page */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">메인 뉴스 카테고리 *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                        className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                      >
                        <option value="culture_art">문화·예술</option>
                        <option value="heritage">전통·유산 (K-헤리티지)</option>
                        <option value="k_culture">K-컬처 & 라이프스타일</option>
                        <option value="opinion">오피니언 / 사설·칼럼</option>
                        <option value="photo_video">포토·영상</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">기사 배지</label>
                      <select
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value as any)}
                        className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                      >
                        <option value="단독">단독</option>
                        <option value="기획">기획</option>
                        <option value="속보">속보</option>
                        <option value="해설">해설</option>
                        <option value="칼럼">칼럼</option>
                        <option value="사설">사설</option>
                        <option value="인터뷰">인터뷰</option>
                        <option value="포토">포토</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">신문 지면 배치 (면수)</label>
                      <select
                        value={formPageNum}
                        onChange={(e) => setFormPageNum(Number(e.target.value))}
                        className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                      >
                        <option value={1}>1면 (종합 톱·헤드라인)</option>
                        <option value={2}>2면 (문화·예술 심층)</option>
                        <option value={3}>3면 (전통·유산·기획)</option>
                        <option value={4}>4면 (K-컬처·라이프)</option>
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">기사 제목 (메인 표제) *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="독자의 시선을 끄는 품격 있는 표제를 입력하세요"
                      className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 font-serif-kr font-bold text-sm focus:outline-none focus:border-[#1b2a47]"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">부제목 (부제 / 서브 헤드라인)</label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="기사의 핵심 요약 부제목"
                      className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 font-serif-kr"
                    />
                  </div>

                  {/* Summary / Lead */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">리드문 / 요약문 (전문)</label>
                    <textarea
                      rows={2}
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="기사 첫머리에 노출될 핵심 요약 리드문"
                      className="w-full p-2.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 resize-none font-serif-kr"
                    />
                  </div>

                  {/* Korean Body Content */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">기사 본문 내용 (한국어) *</label>
                    <textarea
                      rows={12}
                      required
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="육하원칙에 맞춘 상세 기사 본문을 작성하세요."
                      className="w-full p-3.5 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-slate-900 font-serif-kr leading-relaxed text-sm focus:outline-none focus:border-[#1b2a47]"
                    />
                  </div>

                  {/* Korean & English Language Tabs for Article Content */}
                  <div className="border border-[#d8d3cb] rounded-xl p-4 bg-[#fdfcfb] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#e2ded6] pb-2">
                      <span className="font-serif-kr font-bold text-xs text-[#1b2a47] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>영문 번역 데이터 (English Edition)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">구글 시트 연동: [영어_제목, 영어_본문]</span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">영어 기사 제목 (English Title)</label>
                      <input
                        type="text"
                        value={formTitleEn}
                        onChange={(e) => setFormTitleEn(e.target.value)}
                        placeholder="e.g., [Exclusive] 600-Year Joseon Moon Jar Exhibition at National Museum"
                        className="w-full p-2.5 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 font-sans text-xs focus:outline-none focus:border-[#1b2a47]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">영어 부제목 (English Subtitle)</label>
                      <input
                        type="text"
                        value={formSubtitleEn}
                        onChange={(e) => setFormSubtitleEn(e.target.value)}
                        placeholder="e.g., Masterpieces of Joseon white porcelain gathered from global museums"
                        className="w-full p-2.5 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">영어 기사 본문 (English Article Content)</label>
                      <textarea
                        rows={6}
                        value={formContentEn}
                        onChange={(e) => setFormContentEn(e.target.value)}
                        placeholder="Enter full English article content for global readers. (If blank, 'Translation in progress...' will be displayed to readers)"
                        className="w-full p-3 bg-white border border-[#d8d3cb] rounded-lg text-slate-900 font-sans text-xs leading-relaxed resize-none focus:outline-none focus:border-[#1b2a47]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Sidebar: Meta & Image (4 Cols) */}
                <div className="md:col-span-4 space-y-4 bg-[#f8f6f2] p-4 rounded-xl border border-[#d8d3cb]">
                  <h4 className="font-serif-kr font-bold text-slate-900 text-sm border-b border-[#e2ded6] pb-2">
                    보도사진 & 메타 설정
                  </h4>

                  {/* Image URL */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">보도사진 이미지 URL</label>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900"
                    />
                    {formImageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-[#d8d3cb] aspect-16/10 bg-slate-100">
                        <img src={formImageUrl} alt="미리보기" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Image Caption */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">사진 설명 (캡션)</label>
                    <input
                      type="text"
                      value={formImageCaption}
                      onChange={(e) => setFormImageCaption(e.target.value)}
                      placeholder="예: 18세기 조선 왕실 백자 전경 / 사진=한국문화저널"
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">키워드 태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="문화재, 국보환수, 조선백자"
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg text-slate-900"
                    />
                  </div>

                  {/* Top / Breaking Toggle (Editor in chief only) */}
                  {isEditorInChief && (
                    <div className="p-3 bg-white rounded-lg border border-[#d8d3cb] space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formIsTop}
                          onChange={(e) => setFormIsTop(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1b2a47]"
                        />
                        <span>오늘의 1면 메인 톱기사로 지정</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formIsBreaking}
                          onChange={(e) => setFormIsBreaking(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600"
                        />
                        <span>긴급 속보 티커에 노출</span>
                      </label>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="pt-2 space-y-2">
                    {isEditorInChief ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveArticle('PUBLISHED')}
                          className="w-full py-3 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-4 h-4" />
                          <span>지면에 즉시 정식 발행 (승인)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveArticle('DRAFT')}
                          className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl transition-all"
                        >
                          임시저장 (초안)
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveArticle('PENDING_REVIEW')}
                        className="w-full py-3 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4 text-amber-300" />
                        <span>편집국 데스크로 송고 (승인 요청)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Paper Layout Editing (지면 편집국 - 1면~4면 직접 지정 및 조판 스튜디오) */}
          {activeTab === 'paper_layout' && isEditorInChief && (
            <div className="space-y-4">
              {/* Header & Global Action Toolbar */}
              <div className="p-4 bg-white rounded-xl border border-[#d8d3cb] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#1b2a47] text-white rounded-lg">
                      <Newspaper className="w-4 h-4" />
                    </span>
                    <h3 className="font-serif-kr text-base font-bold text-slate-900">
                      신문 지면 조판 데스크 (1면·2면·3면·4면 직접 지정)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-1">
                    관리자가 1면(종합), 2면(문화예술), 3면(전통유산), 4면(K-컬처)에 들어갈 기사를 직접 검색하고 배치합니다.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Smart Auto Assign Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const published = articles.filter(a => !a.status || a.status === 'PUBLISHED');
                      if (published.length === 0) {
                        alert('발행된 기사가 없습니다.');
                        return;
                      }
                      // Sort by date desc using parseDateSafely
                      const sorted = [...published].sort((a, b) => parseDateSafely(b.publishedAt) - parseDateSafely(a.publishedAt));
                      
                      const updated = articles.map(art => {
                        // Reset first
                        let pNum: number | undefined = undefined;
                        let sPage: string | undefined = undefined;
                        let isTop = false;

                        // 1 page lead
                        if (sorted[0] && art.id === sorted[0].id) {
                          pNum = 1; sPage = '1면 (종합)'; isTop = true;
                        } else if (sorted[1] && art.id === sorted[1].id) {
                          pNum = 1; sPage = '1면 (종합)';
                        } else if (sorted[2] && art.id === sorted[2].id) {
                          pNum = 1; sPage = '1면 (종합)';
                        }
                        // 2 page (culture/art)
                        const cArts = sorted.filter(a => a.category === 'culture_art' || a.category === 'art_exhibition' || a.category === 'performance');
                        if (cArts[0] && art.id === cArts[0].id && !pNum) { pNum = 2; sPage = '2면 (문화·예술)'; }
                        if (cArts[1] && art.id === cArts[1].id && !pNum) { pNum = 2; sPage = '2면 (문화·예술)'; }
                        
                        // 3 page (heritage)
                        const hArts = sorted.filter(a => a.category === 'heritage' || a.category === 'academic' || a.category === 'history');
                        if (hArts[0] && art.id === hArts[0].id && !pNum) { pNum = 3; sPage = '3면 (전통·유산)'; }
                        if (hArts[1] && art.id === hArts[1].id && !pNum) { pNum = 3; sPage = '3면 (전통·유산)'; }
                        
                        // 4 page (k_culture/opinion)
                        const kArts = sorted.filter(a => a.category === 'k_culture' || a.category === 'opinion' || a.category === 'people');
                        if (kArts[0] && art.id === kArts[0].id && !pNum) { pNum = 4; sPage = '4면 (K-컬처·라이프)'; }
                        if (kArts[1] && art.id === kArts[1].id && !pNum) { pNum = 4; sPage = '4면 (K-컬처·라이프)'; }

                        return {
                          ...art,
                          pageNumber: pNum,
                          sectionPage: sPage,
                          isTopHeadline: isTop,
                        };
                      });

                      onUpdateArticles(updated);
                      saveArticlesBatchToFirestore(updated).catch(() => {});
                      setPaperSaveMessage('최신 대표 기사들로 1~4면 지면이 스마트 자동 배정되었습니다!');
                      setTimeout(() => setPaperSaveMessage(null), 3500);
                    }}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>추천 기사로 자동 편성</span>
                  </button>

                  {/* Save to Firestore Button */}
                  <button
                    type="button"
                    disabled={isSavingPaper}
                    onClick={async () => {
                      setIsSavingPaper(true);
                      try {
                        await saveArticlesBatchToFirestore(articles);
                        setPaperSaveMessage('1~4면 지면 배정 설정이 Firestore에 성공적으로 영구 저장되었습니다!');
                        setTimeout(() => setPaperSaveMessage(null), 3500);
                      } catch (e) {
                        setPaperSaveMessage('지면 설정이 로컬에 저장되었습니다.');
                        setTimeout(() => setPaperSaveMessage(null), 3500);
                      } finally {
                        setIsSavingPaper(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#1b2a47] hover:bg-[#25375c] text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSavingPaper ? '저장 중...' : '지면 배치 일괄 저장 & 발행'}</span>
                  </button>
                </div>
              </div>

              {/* Feedback banner */}
              {paperSaveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paperSaveMessage}</span>
                </div>
              )}

              {/* 2-Column Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Article Search & Pool (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-[#d8d3cb] p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-serif-kr font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#1b2a47]" />
                      <span>전체 기사 보관함 (지면에 넣을 기사 선택)</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      총 {articles.filter(a => !a.status || a.status === 'PUBLISHED').length}건 발행
                    </span>
                  </div>

                  {/* Search & Category filter */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={paperSearchTerm}
                      onChange={(e) => setPaperSearchTerm(e.target.value)}
                      placeholder="기사 제목 또는 기자 이름 검색..."
                      className="w-full p-2 bg-[#f8f6f2] border border-[#d8d3cb] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                    />

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                      {[
                        { id: 'all', label: '전체' },
                        { id: 'culture_art', label: '문화예술' },
                        { id: 'heritage', label: '전통유산' },
                        { id: 'k_culture', label: 'K-컬처' },
                        { id: 'opinion', label: '사설·칼럼' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setPaperSearchCategory(cat.id)}
                          className={`px-2 py-1 rounded font-bold whitespace-nowrap transition-colors ${
                            paperSearchCategory === cat.id
                              ? 'bg-[#1b2a47] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Articles List */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[520px] pr-1">
                    {articles
                      .filter(a => !a.status || a.status === 'PUBLISHED')
                      .filter(a => {
                        const matchCat = paperSearchCategory === 'all' || a.category === paperSearchCategory;
                        const matchSearch = !paperSearchTerm || 
                          a.title.toLowerCase().includes(paperSearchTerm.toLowerCase()) ||
                          (a.reporter?.name && a.reporter.name.toLowerCase().includes(paperSearchTerm.toLowerCase()));
                        return matchCat && matchSearch;
                      })
                      .slice(0, 50)
                      .map(art => {
                        const isAssigned = typeof art.pageNumber === 'number' && art.pageNumber >= 1 && art.pageNumber <= 4;
                        return (
                          <div
                            key={art.id}
                            className={`p-3 rounded-lg border text-xs transition-all ${
                              isAssigned 
                                ? 'bg-amber-50/40 border-amber-300 shadow-2xs' 
                                : 'bg-[#fcfbf9] border-[#e8e4dc] hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] text-slate-500 font-serif-kr">
                                [{art.categoryLabel || art.category}] {art.reporter?.name || '편집국'}
                              </span>
                              {isAssigned && (
                                <span className="px-1.5 py-0.5 bg-[#1b2a47] text-white rounded text-[10px] font-bold">
                                  {art.pageNumber}면 배정됨 {art.isTopHeadline && '★톱'}
                                </span>
                              )}
                            </div>

                            <h5 className="font-serif-kr font-bold text-slate-900 line-clamp-2 leading-snug">
                              {art.title}
                            </h5>

                            {/* Quick Add to Page Buttons */}
                            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold text-slate-600">지면 추가:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4].map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                      const secName = p === 1 ? '1면 (종합)' : p === 2 ? '2면 (문화·예술)' : p === 3 ? '3면 (전통·유산)' : '4면 (K-컬처·라이프)';
                                      const updated = articles.map(a => a.id === art.id ? { ...a, pageNumber: p, sectionPage: secName } : a);
                                      onUpdateArticles(updated);
                                      setSelectedPaperPage(p);
                                      setPaperSaveMessage(`기사가 [${p}면]에 배정되었습니다. 상단 저장을 눌러 영구 보존하세요.`);
                                    }}
                                    className={`px-2 py-0.8 rounded text-[10px] font-bold border transition-colors ${
                                      art.pageNumber === p
                                        ? 'bg-[#1b2a47] text-white border-[#1b2a47]'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    +{p}면
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Right Column: 1면~4면 Tabbed BroadSheet Manager (7 cols) */}
                <div className="lg:col-span-7 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] p-4 flex flex-col space-y-4">
                  {/* Page Selector Tabs (1면, 2면, 3면, 4면) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { num: 1, name: '1면: 종합 톱·헤드라인', cat: '문화종합' },
                      { num: 2, name: '2면: 문화·예술 기획', cat: '공연/전시' },
                      { num: 3, name: '3면: 전통·유산·기획', cat: '국가유산/역사' },
                      { num: 4, name: '4면: K-컬처·오피니언', cat: '라이프/사설' },
                    ].map(tab => {
                      const count = articles.filter(a => a.pageNumber === tab.num).length;
                      const isSelected = selectedPaperPage === tab.num;
                      return (
                        <button
                          key={tab.num}
                          type="button"
                          onClick={() => setSelectedPaperPage(tab.num)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#1b2a47] text-white border-[#1b2a47] shadow-sm'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif-kr font-bold text-xs">
                              제{tab.num}면
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {count}건 배정
                            </span>
                          </div>
                          <p className={`text-[10px] mt-1 truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {tab.cat}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Page Header & Description */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="font-serif-kr text-slate-900 text-xs">
                        {selectedPaperPage === 1 && '📰 제1면 (종합 1면 톱 헤드라인 및 주요 종합 뉴스)'}
                        {selectedPaperPage === 2 && '🎭 제2면 (문화·예술·전시·공연 심층 기획 기사)'}
                        {selectedPaperPage === 3 && '🏛️ 제3면 (전통문화·국가유산·헤리티지 심층 기사)'}
                        {selectedPaperPage === 4 && '🌏 제4면 (K-컬처·글로벌 라이프·사설 및 오피니언)'}
                      </strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        * 이 지면에 배정된 기사들은 지면보기(종이신문 뷰) 제{selectedPaperPage}면에 순서대로 실물 조판됩니다.
                      </p>
                    </div>
                  </div>

                  {/* Articles Currently Assigned to this Page */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px]">
                    {(() => {
                      const pageArticles = articles.filter(a => a.pageNumber === selectedPaperPage);

                      if (pageArticles.length === 0) {
                        return (
                          <div className="p-10 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                            <p className="text-sm font-bold text-slate-700 font-serif-kr">
                              제{selectedPaperPage}면에 배정된 기사가 없습니다.
                            </p>
                            <p className="text-xs text-slate-500">
                              좌측 기사 보관함에서 <span className="font-bold text-[#1b2a47]">[+{selectedPaperPage}면]</span> 버튼을 눌러 원하는 기사를 추가해주세요.
                            </p>
                          </div>
                        );
                      }

                      return pageArticles.map((art, idx) => (
                        <div
                          key={art.id}
                          className="p-3.5 bg-white rounded-xl border border-[#d8d3cb] shadow-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              {art.isTopHeadline && (
                                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold font-serif-kr flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  <span>지면 톱(리드) 기사</span>
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500 font-serif-kr">
                                [{art.categoryLabel || art.category}] {art.reporter?.name || '편집국'}
                              </span>
                            </div>

                            {/* Top Lead Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextTop = !art.isTopHeadline;
                                const updated = articles.map(a => {
                                  if (a.id === art.id) return { ...a, isTopHeadline: nextTop };
                                  if (nextTop && a.pageNumber === selectedPaperPage) {
                                    // Make sure only one lead per page
                                    return { ...a, isTopHeadline: false };
                                  }
                                  return a;
                                });
                                onUpdateArticles(updated);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                art.isTopHeadline
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              {art.isTopHeadline ? '👑 톱기사 해제' : '👑 지면 톱(리드)으로 지정'}
                            </button>
                          </div>

                          <div className="flex items-start gap-3">
                            {art.imageUrl && (
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                className="w-16 h-12 object-cover rounded border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-serif-kr font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                                {art.title}
                              </h5>
                              {art.subtitle && (
                                <p className="text-[11px] text-slate-500 font-serif-kr truncate mt-0.5">
                                  {art.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions: Change Page / Remove */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-bold">다른 면으로 이동:</span>
                              <select
                                value={art.pageNumber}
                                onChange={(e) => {
                                  const targetP = Number(e.target.value);
                                  const secName = targetP === 1 ? '1면 (종합)' : targetP === 2 ? '2면 (문화·예술)' : targetP === 3 ? '3면 (전통·유산)' : '4면 (K-컬처·라이프)';
                                  const updated = articles.map(a => a.id === art.id ? { ...a, pageNumber: targetP, sectionPage: secName } : a);
                                  onUpdateArticles(updated);
                                }}
                                className="p-1 bg-[#f5f1eb] border border-[#d8d3cb] rounded text-[11px] font-bold text-slate-800"
                              >
                                <option value={1}>1면 (종합)</option>
                                <option value={2}>2면 (문화·예술)</option>
                                <option value={3}>3면 (전통·유산)</option>
                                <option value={4}>4면 (K-컬처)</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = articles.map(a => a.id === art.id ? { ...a, pageNumber: undefined, sectionPage: undefined, isTopHeadline: false } : a);
                                onUpdateArticles(updated);
                                setPaperSaveMessage(`기사가 제${selectedPaperPage}면에서 제외되었습니다.`);
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>지면에서 제외</span>
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Reporter Management */}
          {activeTab === 'reporters' && isEditorInChief && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2ded6] flex-wrap gap-2">
                <div>
                  <h3 className="font-serif-kr text-base font-bold text-slate-900">
                    기자단 소속 및 가입 승인·보류·정지 관리
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    신규 가입 기자의 가입 승인/보류 여부를 결정하고, 기자의 취재 및 송고 권한을 제어합니다.
                  </p>
                </div>
                <span className="text-xs bg-[#1b2a47] text-white px-2.5 py-1 rounded-lg font-bold font-sans">
                  총 {reporters.length}명 기자 등록
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
                {reporters.map(rep => {
                  const status = rep.status || 'ACTIVE';
                  const isPending = status === 'PENDING_APPROVAL';
                  const isSuspended = status === 'SUSPENDED';
                  const isActive = status === 'ACTIVE';

                  return (
                    <div 
                      key={rep.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isPending 
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200' 
                          : isSuspended 
                          ? 'bg-rose-50/60 border-rose-200 opacity-80' 
                          : 'bg-[#f8f6f2] border-[#d8d3cb]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={rep.avatar} 
                          alt={rep.name} 
                          className="w-12 h-12 rounded-full object-cover border border-[#d8d3cb] shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="font-serif-kr font-bold text-sm text-slate-900 truncate">{rep.name}</h4>
                              <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-medium shrink-0">{rep.title}</span>
                            </div>
                            {isPending && (
                              <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-black shrink-0 animate-pulse">
                                승인 대기
                              </span>
                            )}
                            {isSuspended && (
                              <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black shrink-0">
                                활동 정지
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black shrink-0">
                                정식 승인
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">{rep.department} · {rep.email}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{rep.bio}</p>
                        </div>
                      </div>

                      {/* Status Management Actions */}
                      <div className="mt-3 pt-2.5 border-t border-[#ded8cf] flex items-center justify-between flex-wrap gap-1.5">
                        <span className="text-[10px] text-slate-400">
                          구독자 {rep.subscriberCount}명 · 가입일: {rep.joinedDate || '2026.08'}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateReporterStatus(rep.id, 'ACTIVE')}
                            disabled={isActive}
                            title="기자 정식 활동 승인"
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              isActive 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            ✓ 승인 (활동)
                          </button>
                          <button
                            onClick={() => handleUpdateReporterStatus(rep.id, 'PENDING_APPROVAL')}
                            disabled={isPending}
                            title="가입 심사 보류"
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              isPending 
                                ? 'bg-amber-100 text-amber-900 border border-amber-400 font-black' 
                                : 'bg-white hover:bg-amber-500 hover:text-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            ⏳ 보류
                          </button>
                          <button
                            onClick={() => handleUpdateReporterStatus(rep.id, 'SUSPENDED')}
                            disabled={isSuspended}
                            title="기자 활동 일시 정지"
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              isSuspended 
                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                : 'bg-white hover:bg-rose-600 hover:text-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            🚫 정지
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Categories Management */}
          {activeTab === 'categories' && isEditorInChief && (
            <div className="space-y-4 text-xs font-sans">
              <div className="pb-2 border-b border-[#e2ded6]">
                <h3 className="font-serif-kr text-base font-bold text-slate-900">
                  신문 섹션 및 카테고리 관리
                </h3>
              </div>

              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="p-3 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] flex items-center justify-between">
                    <div>
                      <span className="font-serif-kr font-bold text-sm text-slate-900">{cat.label}</span>
                      <span className="text-slate-400 text-xs ml-2 font-mono">({cat.id})</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        하위 분류: {cat.subcategories.join(', ')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                      섹션 활성
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Media Management */}
          {activeTab === 'media' && isEditorInChief && (
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2ded6]">
                <h3 className="font-serif-kr text-base font-bold text-slate-900">
                  보도사진 및 미디어 라이브러리
                </h3>
                <button
                  onClick={() => {
                    const url = prompt('추가할 보도사진 URL을 입력하세요:', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=600');
                    const cap = prompt('사진 캡션(설명):', '한국 현대미술 특별전 전경');
                    if (url) {
                      setMediaList([{
                        id: `med-${Date.now()}`,
                        name: '보도사진_추가.jpg',
                        url,
                        caption: cap || '보도사진',
                        photographer: '취재부',
                        uploadedAt: '2026.08.22',
                        category: '일반',
                        fileSize: '3.1 MB'
                      }, ...mediaList]);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#1b2a47] text-white rounded-lg font-bold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>새 보도사진 등록</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map(med => (
                  <div key={med.id} className="bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] overflow-hidden">
                    <div className="aspect-16/10 bg-slate-200">
                      <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-900 text-xs truncate">{med.caption}</p>
                      <p className="text-[10px] text-slate-500 mt-1 flex justify-between">
                        <span>{med.photographer}</span>
                        <span>{med.uploadedAt}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Cultural Event Registration */}
          {activeTab === 'events' && isEditorInChief && (
            <div className="space-y-4 text-xs font-sans">
              <div className="pb-2 border-b border-[#e2ded6]">
                <h3 className="font-serif-kr text-base font-bold text-slate-900">
                  문화 캘린더 행사 등록 및 관리
                </h3>
              </div>

              {/* Add Event Form */}
              <form onSubmit={handleAddEvent} className="p-4 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] space-y-3">
                <h4 className="font-serif-kr font-bold text-slate-900 text-xs">■ 신규 문화예술 행사 등록</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">행사명 *</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="예: 2026 경복궁 야간 특별관람"
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">장소 *</label>
                    <input
                      type="text"
                      required
                      value={eventPlace}
                      onChange={(e) => setEventPlace(e.target.value)}
                      placeholder="예: 경복궁 근정전 및 경회루"
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">분류</label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value as any)}
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg"
                    >
                      <option value="전시">전시</option>
                      <option value="공연">공연</option>
                      <option value="고궁야간">고궁야간</option>
                      <option value="축제">축제</option>
                      <option value="체험">체험</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">진행 기간</label>
                    <input
                      type="text"
                      value={eventPeriod}
                      onChange={(e) => setEventPeriod(e.target.value)}
                      placeholder="예: 2026.09.01 ~ 2026.10.31"
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">포스터 이미지 URL</label>
                    <input
                      type="text"
                      value={eventImageUrl}
                      onChange={(e) => setEventImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 bg-white border border-[#d8d3cb] rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1b2a47] text-white font-bold rounded-lg hover:bg-[#25375c]"
                >
                  문화 캘린더에 행사 등록
                </button>
              </form>

              {/* Event List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {events.map(evt => (
                  <div key={evt.id} className="p-3 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] flex items-center gap-3">
                    <img src={evt.imageUrl} alt={evt.title} className="w-14 h-14 rounded-lg object-cover border border-[#d8d3cb]" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-bold">{evt.category}</span>
                      <h5 className="font-serif-kr font-bold text-slate-900 truncate mt-0.5">{evt.title}</h5>
                      <p className="text-[10px] text-slate-500">{evt.place}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: Comments Moderation */}
          {activeTab === 'comments' && isEditorInChief && (
            <div className="space-y-4 text-xs font-sans">
              <div className="pb-2 border-b border-[#e2ded6]">
                <h3 className="font-serif-kr text-base font-bold text-slate-900">
                  독자 댓글 모니터링 및 클린 저널리즘 관리
                </h3>
              </div>

              <div className="space-y-2">
                {commentsList.map(comm => (
                  <div key={comm.id} className={`p-3 rounded-xl border transition-all ${
                    comm.isBlocked ? 'bg-rose-50 border-rose-200 opacity-60' : 'bg-[#f8f6f2] border-[#d8d3cb]'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{comm.author}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{comm.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBlockComment(comm.id)}
                          className="text-[11px] font-bold text-amber-700 hover:underline"
                        >
                          {comm.isBlocked ? '차단 해제' : '댓글 블라인드(숨김)'}
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comm.id)}
                          className="text-[11px] font-bold text-rose-700 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 font-serif-kr">{comm.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">대상 기사: {comm.articleTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: Google Sheets & Apps Script DB Sync */}
          {activeTab === 'sheets_sync' && isEditorInChief && (
            <div className="space-y-6 text-xs font-sans">
              <div className="pb-3 border-b border-[#e2ded6]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif-kr text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <span>구글 스프레드시트 7열 데이터베이스 연동 & 기사제보 스크립트</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      구글 스프레드시트 7개 컬럼 규격과 데이터를 양방향 동기화하고, 네이버 메일 자동 발송 코드를 관리합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const csvHeader = '기사ID,카테고리,한국어_제목,한국어_본문,영어_제목,영어_본문,작성일\n';
                      const csvRows = articles.map(art => {
                        const clean = (str?: string) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
                        return [
                          art.id,
                          art.category,
                          clean(art.title),
                          clean(art.content),
                          clean(art.titleEn || art.title),
                          clean(art.contentEn || art.content),
                          art.publishedAt
                        ].join(',');
                      }).join('\n');
                      
                      const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `kculturejournal_articles_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>현재 기사 7열 CSV 다운로드</span>
                  </button>
                </div>
              </div>

              {/* 7 Column Structure Explanation */}
              <div className="bg-[#f8f6f2] border border-[#d8d3cb] rounded-xl p-4 space-y-3">
                <h4 className="font-serif-kr font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#1b2a47]" />
                  <span>구글 스프레드시트 7열 표준 컬럼 구조</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">1열 (A)</span>
                    <strong className="text-slate-800">기사ID</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">2열 (B)</span>
                    <strong className="text-slate-800">카테고리</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">3열 (C)</span>
                    <strong className="text-slate-800">한국어_제목</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">4열 (D)</span>
                    <strong className="text-slate-800">한국어_본문</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">5열 (E)</span>
                    <strong className="text-slate-800">영어_제목</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">6열 (F)</span>
                    <strong className="text-slate-800">영어_본문</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#ded8cf] rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-mono">7열 (G)</span>
                    <strong className="text-slate-800">작성일</strong>
                  </div>
                </div>
              </div>

              {/* Google Apps Script News Tip Code Snippet */}
              <div className="border border-[#d8d3cb] rounded-xl p-4 bg-slate-900 text-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded text-[10px]">
                      Google Apps Script
                    </span>
                    <span className="font-bold text-xs text-white">
                      기사제보 네이버 메일 (soobakmu@naver.com) 자동 발송 스크립트 코드
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_NEWS_TIP_CODE);
                      alert('구글 앱스 스크립트 코드가 클립보드에 복사되었습니다!\n\n1. script.google.com 에 접속\n2. 새 프로젝트 생성 후 붙여넣기\n3. 배포(웹 앱) 실행 후 URL을 기사제보 모달에 등록하시면 됩니다.');
                    }}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>코드 복사</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-48 text-emerald-400">
                  <pre>{GOOGLE_APPS_SCRIPT_NEWS_TIP_CODE.slice(0, 600)}
                    {'\n... (코드 복사 버튼을 누르면 전체 100% 코드가 복사됩니다)'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: Dynamic Ad Placement System (AdSense & Custom Scripts) */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Header Info & Quick Global Presets */}
              <div className="pb-4 border-b border-[#e2ded6] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-black">
                        AdSense & Ads
                      </span>
                      <h3 className="font-serif-kr text-base font-bold text-slate-900">
                        광고 동적 삽입 관리 시스템 (5대 지정 슬롯)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-sans mt-1">
                      구글 애드센스(Google AdSense), 카카오 애드핏, 또는 외부 HTML/JS 광고 스크립트를 슬롯별로 등록하면 기사 상세 페이지 및 사이드바에 실시간 동적 렌더링됩니다.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAds}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>광고 설정 전체 저장 & 즉시 적용</span>
                  </button>
                </div>

                {/* Quick 1-Click Preset Bar */}
                <div className="p-3 bg-[#f2efe9] border border-[#ded8cf] rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>원클릭 템플릿 채우기:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setAdsForm({
                          belowSubtitle: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="1111111111" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
                          inBody: `<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-1234567890123456" data-ad-slot="2222222222"></ins>`,
                          afterBody: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="3333333333" data-ad-format="rectangle"></ins>`,
                          sidebarTop: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-1234567890123456" data-ad-slot="4444444444"></ins>`,
                          sidebarBottom: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="ca-pub-1234567890123456" data-ad-slot="5555555555"></ins>`,
                        });
                        alert('구글 애드센스(AdSense) 5대 표준 슬롯 템플릿이 입력되었습니다. 필요 시 pub-id와 slot-id를 수정한 후 [저장]을 누르세요.');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-500 hover:text-white border border-[#d8d3cb] rounded-lg font-bold text-slate-700 transition-all text-[11px]"
                    >
                      ⚡ 애드센스(AdSense) 표준 템플릿 적용
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdsForm({
                          belowSubtitle: `<div style="background:linear-gradient(135deg,#1b2a47,#2b3e64);color:#ffffff;padding:14px 20px;border-radius:10px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><p style="font-size:11px;color:#fcd34d;font-weight:bold;margin:0 0 3px 0;">[특별기획] 2026 국립중앙박물관 한국 전통 명품 특별전</p><h4 style="font-size:15px;margin:0 0 4px 0;font-weight:bold;letter-spacing:-0.5px;">국보·보물 120선 한자리 공개, 사전 예매 20% 특별 우대</h4><p style="font-size:11px;color:#cbd5e1;margin:0;">전시기간: 2026.09.01 ~ 11.30 · 온라인 사전 예매 진행 중</p></div>`,
                          inBody: `<div style="background:#faf8f5;border:1.5px solid #d8d3cb;border-radius:10px;padding:14px;text-align:center;margin:8px 0;"><span style="font-size:10px;background:#1b2a47;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;">문화후원 캠페인</span><h5 style="font-size:14px;font-weight:bold;color:#0f172a;margin:6px 0 2px 0;">국외 유출 우리 문화유산 환수 프로젝트 후원</h5><p style="font-size:11px;color:#64748b;margin:0;">당신의 작은 관심이 찬란한 5천 년 민족 유산을 고국으로 되찾아옵니다.</p></div>`,
                          afterBody: `<div style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:16px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;"><div style="text-align:left;"><span style="font-size:10px;color:#f59e0b;font-weight:bold;">K-CULTURE SPECIAL</span><h4 style="font-size:14px;font-weight:bold;margin:2px 0 0 0;">한국문화저널 프리미엄 문화예술 정기구독</h4></div><a href="#subscribe" style="background:#f59e0b;color:#0f172a;font-weight:bold;font-size:12px;padding:6px 14px;border-radius:6px;text-decoration:none;">월간 정기구독 신청 →</a></div>`,
                          sidebarTop: `<div style="background:#ffffff;border:1.5px solid #d8d3cb;border-radius:10px;padding:16px 10px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><span style="font-size:9px;color:#94a3b8;border:1px solid #cbd5e1;padding:1px 4px;border-radius:3px;">광고 300x250</span><h4 style="font-size:14px;font-weight:bold;color:#1e293b;margin:8px 0 4px 0;">2026 경복궁 야간 특별관람</h4><p style="font-size:11px;color:#64748b;margin:0;">별빛 아래 거니는 조선 왕조의 숨결</p></div>`,
                          sidebarBottom: `<div style="background:linear-gradient(180deg,#1b2a47,#0f172a);color:#fff;border-radius:10px;padding:24px 12px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);"><span style="font-size:10px;color:#fcd34d;font-weight:bold;">문화예술 파트너십</span><h4 style="font-size:15px;font-weight:bold;margin:8px 0 6px 0;">전통 공예 장인 후원전</h4><p style="font-size:11px;color:#cbd5e1;margin:0 0 12px 0;">손끝으로 잇는 천년의 미학</p><span style="display:inline-block;background:#f59e0b;color:#0f172a;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:bold;">작품 관람하기</span></div>`,
                        });
                        alert('디자인 배너(HTML/CSS) 샘플 5종이 입력되었습니다. [광고 설정 저장] 버튼을 누르면 기사 페이지에 즉시 적용됩니다.');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#1b2a47] hover:text-white border border-[#d8d3cb] rounded-lg font-bold text-slate-700 transition-all text-[11px]"
                    >
                      🎨 디자인 배너(HTML) 샘플 적용
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('모든 광고 슬롯 코드를 비우시겠습니까? (비워진 슬롯은 사이트에서 자동으로 숨김 처리됩니다)')) {
                          setAdsForm({
                            belowSubtitle: '',
                            inBody: '',
                            afterBody: '',
                            sidebarTop: '',
                            sidebarBottom: '',
                          });
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-700 rounded-lg font-bold transition-all text-[11px]"
                    >
                      🗑️ 전체 비우기 (Clean)
                    </button>
                  </div>
                </div>
              </div>

              {adSaveMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adSaveMessage}</span>
                </div>
              )}

              {/* Ad Slots Form */}
              <div className="grid grid-cols-1 gap-6">
                {/* ① Below Subtitle */}
                <div className="p-5 bg-[#faf8f5] border border-[#d8d3cb] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1b2a47] text-white flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ① 기사 제목 바로 아래 (서브타이틀 하단)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {adsForm.belowSubtitle.trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 비어있음 (자동 숨김)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: belowSubtitle</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    기사 헤드라인과 기자 바이라인/공유바 바로 아래에 노출되는 최상단 반응형 리더보드/디스플레이 광고 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.belowSubtitle}
                    onChange={(e) => setAdsForm({ ...adsForm, belowSubtitle: e.target.value })}
                    placeholder={`<!-- 구글 애드센스 또는 HTML 광고 코드를 입력하세요 -->\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX" data-ad-format="auto"></ins>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, belowSubtitle: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="1111111111" data-ad-format="auto"></ins>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 애드센스 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, belowSubtitle: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>

                {/* ② In Body */}
                <div className="p-5 bg-[#faf8f5] border border-[#d8d3cb] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1b2a47] text-white flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ② 본문 중간 (문단 3~4번째 직후)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {adsForm.inBody.trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 비어있음 (자동 숨김)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: inBody</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    기사 본문을 읽어 내려가는 도중 문단 3~4번째 사이에 자연스럽게 삽입되는 인피드/인아티클(In-Article) 광고 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.inBody}
                    onChange={(e) => setAdsForm({ ...adsForm, inBody: e.target.value })}
                    placeholder={`<!-- 본문 중간 광고 HTML/JS 스크립트 -->\n<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX"></ins>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, inBody: `<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-1234567890123456" data-ad-slot="2222222222"></ins>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 애드센스 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, inBody: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>

                {/* ③ After Body */}
                <div className="p-5 bg-[#faf8f5] border border-[#d8d3cb] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1b2a47] text-white flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ③ 기사 본문 완료 직후 (태그 및 기자 카드 상단)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {adsForm.afterBody.trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 비어있음 (자동 숨김)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: afterBody</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    기사를 모두 읽은 독자의 시선이 머무는 기사 끝단, 기자 프로필 카드와 추천 기사 위에 배치되는 고효율 디스플레이 광고 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.afterBody}
                    onChange={(e) => setAdsForm({ ...adsForm, afterBody: e.target.value })}
                    placeholder={`<!-- 기사 본문 하단 광고 스크립트 -->\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX" data-ad-format="rectangle"></ins>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, afterBody: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="3333333333" data-ad-format="rectangle"></ins>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 애드센스 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, afterBody: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>

                {/* ④ Sidebar Top */}
                <div className="p-5 bg-[#faf8f5] border border-[#d8d3cb] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ④ 우측 사이드바 상단 (300x250 직사각형)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {adsForm.sidebarTop.trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 비어있음 (자동 숨김)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: sidebarTop</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    데스크톱 및 태블릿 화면의 우측 날개(사이드바) 최상단에 고정 또는 상단 배치되는 직사각형(300x250, 336x280) 배너 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.sidebarTop}
                    onChange={(e) => setAdsForm({ ...adsForm, sidebarTop: e.target.value })}
                    placeholder={`<!-- 우측 사이드바 상단 300x250 배너 광고 코드 -->\n<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX"></ins>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, sidebarTop: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-1234567890123456" data-ad-slot="4444444444"></ins>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 애드센스 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, sidebarTop: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>

                {/* ⑤ Sidebar Bottom */}
                <div className="p-5 bg-[#faf8f5] border border-[#d8d3cb] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ⑤ 우측 사이드바 하단 (스크롤 스티키 영역 300x600)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {adsForm.sidebarBottom.trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 비어있음 (자동 숨김)
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: sidebarBottom</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    사이드바 하단(문화 캘린더 및 인기 기사 랭킹 하단)에 위치하여 사용자가 긴 기사를 스크롤할 때 노출되는 스카이스크래퍼/직사각형 광고 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.sidebarBottom}
                    onChange={(e) => setAdsForm({ ...adsForm, sidebarBottom: e.target.value })}
                    placeholder={`<!-- 우측 사이드바 하단 배너 광고 코드 -->\n<ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX"></ins>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, sidebarBottom: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="ca-pub-1234567890123456" data-ad-slot="5555555555"></ins>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 애드센스 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, sidebarBottom: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>

                {/* 6. KCJ Radio 방송국 우측 사이드바 하단 배너 광고 */}
                <div className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ded8cf] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1b2a47] text-amber-300 font-bold text-xs flex items-center justify-center font-sans">
                        6
                      </span>
                      <strong className="text-slate-900 text-sm font-serif-kr">
                        ⑥ KCJ Radio 방송국 우측 사이드바 하단 (편성 대기열 하단 스폰서 배너)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      {(adsForm.radioSidebar || '').trim() ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px]">
                          ● 렌더링 활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded text-[10px]">
                          ○ 기본 후원 배너 표시
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slot: radioSidebar</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    KCJ Radio 전용 온에어 스튜디오 페이지의 우측 사이드바(실시간 온에어 플레이리스트 대기열 하단)에 표시되는 전용 스폰서 광고 및 배너 영역입니다.
                  </p>
                  <textarea
                    rows={4}
                    value={adsForm.radioSidebar || ''}
                    onChange={(e) => setAdsForm({ ...adsForm, radioSidebar: e.target.value })}
                    placeholder={`<!-- KCJ Radio 방송국 사이드바 배너 광고 코드 HTML/JS -->\n<a href="https://example.com" target="_blank"><img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600" alt="라디오 스폰서" style="width:100%;border-radius:16px;" /></a>`}
                    className="w-full p-3 font-mono text-xs bg-white border border-[#ded8cf] rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, radioSidebar: `<div style="background:linear-gradient(135deg, #1e293b, #0f172a);border:1px solid #334155;border-radius:18px;padding:16px;text-align:center;color:#f8fafc;"><p style="font-size:11px;color:#fbbf24;font-weight:bold;margin-bottom:4px;">📻 KCJ RADIO 공식 파트너십</p><h4 style="font-size:14px;font-weight:bold;margin:0 0 6px;">2026 대한민국 K-컬처 국악 대축전</h4><p style="font-size:11px;color:#94a3b8;margin:0;">전통 소리의 현대적 울림, 지금 예매하세요</p></div>` })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 font-sans"
                    >
                      + 라디오 배너 예시
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdsForm({ ...adsForm, radioSidebar: '' })}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 font-sans"
                    >
                      비우기
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Save */}
              <div className="pt-4 border-t border-[#e2ded6] flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-500 font-sans">
                  * 코드가 비어있는 슬롯은 자동으로 숨김 처리되어 기존 레이아웃이 깨지지 않습니다.
                </span>
                <button
                  onClick={handleSaveAds}
                  className="px-6 py-2.5 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>광고 설정 전체 저장 & 즉시 적용</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MCST Official RSS Collection */}
          {activeTab === 'mcst_rss' && (
            <McstRssCollectorTab
              onRegisterAsArticle={handleRegisterFromMcstRss}
            />
          )}

          {/* TAB: Layer Popup Manager */}
          {activeTab === 'popup' && (
            <PopupManagerTab
              dualPopupsConfig={dualPopupsConfig}
              onUpdateDualPopupsConfig={onUpdateDualPopupsConfig}
              popupConfig={popupConfig}
              onUpdatePopupConfig={onUpdatePopupConfig}
            />
          )}

          {/* TAB 11: RSS Automated Collection System */}
          {activeTab === 'rss_collector' && (
            <RssAutoCollectorTab
              sources={rssSources}
              onUpdateSources={handleUpdateRssSources}
              collectedItems={rssItems}
              onUpdateCollectedItems={handleUpdateRssItems}
              articles={articles}
              onPublishArticle={(newArt) => {
                onUpdateArticles([newArt, ...articles]);
              }}
            />
          )}

          {/* TAB 12: WordPress Bulk XML Import */}
          {activeTab === 'wp_import' && (
            <WordPressImportTab
              existingArticles={articles}
              onImportComplete={(imported) => {
                // Merge imported articles with current list
                const existingMap = new Map(articles.map(a => [a.id, a]));
                imported.forEach(a => existingMap.set(a.id, a));
                const updatedList = Array.from(existingMap.values());
                onUpdateArticles(updatedList);
              }}
              onArticlesPurged={(remainingArticles) => {
                onUpdateArticles(remainingArticles);
              }}
            />
          )}

        </div>


        {/* 4. CMS Footer Bar */}
        <div className="px-6 py-3 bg-[#f2efe9] border-t border-[#e2ded6] flex items-center justify-between text-xs text-slate-600 font-sans">
          <span>한국문화저널 편집국 CMS (버전 3.2.0-PRO)</span>
          <button 
            onClick={onClose} 
            className="px-4 py-1.5 bg-[#1b2a47] text-white font-bold rounded-lg hover:bg-[#25375c] transition-colors"
          >
            CMS 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
