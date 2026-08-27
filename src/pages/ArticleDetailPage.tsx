import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  Printer, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Check, 
  HelpCircle, 
  ChevronRight, 
  Plus, 
  UserCheck, 
  Heart,
  Globe,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Article, Comment, ReactionType, Language, AdSettings, IssueCluster } from '../types';
import { MOCK_COMMENTS } from '../data/mockNews';
import { RankingSection } from '../components/RankingSection';
import { OpinionSidebarSection } from '../components/OpinionSidebarSection';
import { IssueClustering } from '../components/IssueClustering';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { EditorialColumnModal } from '../components/EditorialColumnModal';
import { McstPressReleaseSidebar } from '../components/McstPressReleaseSidebar';
import { DynamicAdBanner } from '../components/DynamicAdBanner';
import { ArticleBodyRenderer } from '../components/ArticleBodyRenderer';
import { translateArticleToEnglish, TranslatedArticleData } from '../utils/translator';
import { Radio } from 'lucide-react';

interface ArticleDetailPageProps {
  article: Article;
  onBack: () => void;
  onSelectRelatedArticle: (art: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  lang: Language;
  onToggleLang: () => void;
  allArticles: Article[];
  onOpenEditorial?: () => void;
  onSelectCategory?: (catId: string) => void;
  adSettings?: AdSettings;
  onGoToRadio?: (articleId: string, lang: Language) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  onBack,
  onSelectRelatedArticle,
  isBookmarked,
  onToggleBookmark,
  lang,
  onToggleLang,
  allArticles,
  onOpenEditorial,
  onSelectCategory,
  adSettings,
  onGoToRadio,
}) => {
  const isEn = lang === 'en';

  const handleNavigateToRadio = () => {
    if (onGoToRadio) {
      onGoToRadio(article.id, lang);
    } else {
      window.location.href = `/kcj-radio?article=${encodeURIComponent(article.id)}&lang=${lang}`;
    }
  };

  // Editorial modal state (if opened internally)
  const [showEditorialModal, setShowEditorialModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueCluster | null>(null);

  // Typography font size state
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Real-time Automatic Translation State (Korean -> English)
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<TranslatedArticleData | null>(null);

  // Trigger real-time translation when [EN] is selected
  useEffect(() => {
    if (!isEn) {
      setIsTranslating(false);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);

    translateArticleToEnglish({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      summary: article.summary,
      content: article.content,
      categoryLabel: article.categoryLabel,
      tags: article.tags,
      aiSummary: article.aiSummary,
    })
      .then((data) => {
        if (isMounted) {
          setTranslatedData(data);
          setIsTranslating(false);
        }
      })
      .catch((err) => {
        console.warn('Real-time EN translation error:', err);
        if (isMounted) {
          setIsTranslating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isEn, article.id, article.title, article.subtitle, article.summary, article.content, article.categoryLabel]);

  // Multi-language text resolution
  const displayTitle = isEn
    ? (translatedData?.title || article.titleEn || article.title)
    : article.title;

  const displaySubtitle = isEn
    ? (translatedData?.subtitle !== undefined ? translatedData.subtitle : (article.subtitleEn || article.subtitle))
    : article.subtitle;

  const displaySummary = isEn
    ? (translatedData?.summary !== undefined ? translatedData.summary : (article.summaryEn || article.summary))
    : article.summary;

  const displayContent = isEn
    ? (translatedData?.content || article.contentEn || article.content)
    : article.content;

  const displayCategory = isEn
    ? (translatedData?.categoryLabel || article.categoryLabelEn || article.categoryLabel)
    : article.categoryLabel;

  const displayTags = isEn
    ? (translatedData?.tags && translatedData.tags.length > 0 ? translatedData.tags : (article.tagsEn || article.tags))
    : article.tags;

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string[] | null>(
    (isEn && translatedData?.aiSummary)
      ? translatedData.aiSummary
      : (isEn && article.aiSummaryEn)
      ? article.aiSummaryEn
      : (article.aiSummary || null)
  );

  useEffect(() => {
    if (isEn && translatedData?.aiSummary) {
      setAiSummary(translatedData.aiSummary);
    } else if (!isEn) {
      setAiSummary(article.aiSummary || null);
    }
  }, [isEn, translatedData, article.aiSummary]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(true);

  // Real Web Speech API TTS Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [ttsSupported, setTtsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Culture Q&A / Docent State
  const [showAiChat, setShowAiChat] = useState(false);
  const [docentQuestion, setDocentQuestion] = useState('');
  const [docentAnswer, setDocentAnswer] = useState<string | null>(null);
  const [isLoadingDocent, setIsLoadingDocent] = useState(false);

  // Reactions State
  const [reactions, setReactions] = useState(article.reactions);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(article.userReaction || null);

  // Reporter Subscribe & Cheer
  const [isReporterSubscribed, setIsReporterSubscribed] = useState(article.reporter.isSubscribed || false);
  const [cheerCount, setCheerCount] = useState(article.reporter.cheerCount);
  const [hasCheered, setHasCheered] = useState(false);

  // Comments State
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS[article.id] || [
      {
        id: 'c-default-1',
        articleId: article.id,
        author: '문화시민_정독',
        content: '한국문화저널의 품격 있는 정론 보도에 감사드립니다. 우리 전통과 현대 K-컬처의 융합을 조명하는 시각이 매우 탁월합니다.',
        createdAt: '2026.08.22. 09:30',
        likes: 42,
        dislikes: 0,
      },
    ]
  );
  const [commentSort, setCommentSort] = useState<'likes' | 'latest'>('likes');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  // Clean up Web Speech on unmount or article change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    } else {
      setTtsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id, lang]);

  // Real TTS Play / Pause / Stop logic using SpeechSynthesis
  const handleToggleTts = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('현재 브라우저 환경에서 음성 합성(TTS)을 지원하지 않습니다.');
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlayingAudio && !isPausedAudio) {
      synth.pause();
      setIsPausedAudio(true);
      return;
    }

    if (isPlayingAudio && isPausedAudio) {
      synth.resume();
      setIsPausedAudio(false);
      return;
    }

    // Cancel any previous utterance
    synth.cancel();

    // Prepare text to read: Title + Subtitle + Content
    const textToRead = `${displayTitle}. ${displaySubtitle || ''}. ${displayContent}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    // Rate
    utterance.rate = audioSpeed;
    utterance.pitch = 1.0;

    // Select suitable voice
    const voices = synth.getVoices();
    const targetLang = isEn ? 'en' : 'ko';
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    synth.speak(utterance);
  };

  const handleStopTts = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
  };

  const handleChangeTtsSpeed = (speed: number) => {
    setAudioSpeed(speed);
    if (isPlayingAudio && utteranceRef.current) {
      handleStopTts();
      setTimeout(handleToggleTts, 150);
    }
  };

  // Request fresh AI summary
  const fetchAiSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: displayTitle,
          content: displayContent,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Ask AI Culture Docent
  const handleAskDocent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docentQuestion.trim()) return;

    setIsLoadingDocent(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: displayTitle,
          articleContent: displayContent,
          question: docentQuestion,
        }),
      });
      const data = await res.json();
      setDocentAnswer(data.answer || '답변을 불러오지 못했습니다.');
    } catch (e) {
      setDocentAnswer('AI 문화 도슨트 서비스와 연결할 수 없습니다.');
    } finally {
      setIsLoadingDocent(false);
    }
  };

  // Handle Reactions
  const handleReactionClick = (type: ReactionType) => {
    if (userReaction === type) {
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
      setUserReaction(null);
    } else {
      setReactions((prev) => {
        const next = { ...prev };
        if (userReaction) next[userReaction] = next[userReaction] - 1;
        next[type] = next[type] + 1;
        return next;
      });
      setUserReaction(type);
    }
  };

  // Handle Cheer
  const handleCheerReporter = () => {
    if (hasCheered) return;
    setCheerCount((prev) => prev + 1);
    setHasCheered(true);
    setToastMessage(isEn ? 'Cheer sent to reporter!' : '기자님께 응원(치어)을 전송했습니다!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Reporter Subscribe
  const handleToggleSubscribeReporter = () => {
    const next = !isReporterSubscribed;
    setIsReporterSubscribed(next);
    setToastMessage(
      next 
        ? (isEn ? `Subscribed to ${article.reporter.name}` : `${article.reporter.name} 기자 구독을 시작했습니다.`)
        : (isEn ? `Unsubscribed from ${article.reporter.name}` : `${article.reporter.name} 기자 구독을 해제했습니다.`)
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      articleId: article.id,
      author: newCommentAuthor.trim() || (isEn ? 'Reader' : '문화독자'),
      content: newCommentText.trim(),
      createdAt: '방금 전',
      likes: 0,
      dislikes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setToastMessage(isEn ? 'Comment posted successfully.' : '댓글이 등록되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Social Share Handlers
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?id=${article.id}&lang=${lang}`
    : `https://kculturejournal.com/?id=${article.id}&lang=${lang}`;

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&t=${encodeURIComponent(displayTitle)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  const handleShareTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`[한국문화저널] ${displayTitle}`)}`;
    window.open(twUrl, '_blank', 'width=600,height=500');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setToastMessage(isEn ? 'Article link copied to clipboard!' : '기사 고유 주소(URL)가 클립보드에 복사되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: displaySubtitle || displaySummary,
        url: currentUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  // Related Articles
  const relatedArticles = allArticles
    .filter(a => a.id !== article.id && (a.category === article.category || a.reporter.id === article.reporter.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f6f2] font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111927] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Article Header Utility Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Back button & Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-[#f8f6f2] hover:bg-slate-200 text-[#1b2a47] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shrink-0 border border-[#d8d3cb]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Newsroom Home' : '전체 기사 목록'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate font-serif-kr">
              <span className="text-slate-400">/</span>
              <span className="font-bold text-slate-800">{displayCategory}</span>
              {article.subCategory && (
                <>
                  <span className="text-slate-400">&gt;</span>
                  <span>{article.subCategory}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Tools (Language Toggle, Font Size, Bookmark, Share, Print) */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Listen on KCJ Radio Button */}
            <button
              onClick={handleNavigateToRadio}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 border border-amber-400"
              title="KCJ Radio에서 기사 방송으로 듣기"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950" />
              <span>🎙 Listen on KCJ Radio</span>
            </button>

            {/* KO / EN Language Toggle */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-lg border border-amber-300 flex items-center gap-1 transition-all"
              title="한국어 / English 원문 전환"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span>{isEn ? 'EN (English)' : 'KO (한국어)'}</span>
            </button>

            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5 text-xs border border-gray-200">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-md font-medium ${fontSize === 'normal' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-gray-500'}`}
              >
                가
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-md font-medium text-sm ${fontSize === 'large' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-gray-500'}`}
              >
                가+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-md font-medium text-base ${fontSize === 'xlarge' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-gray-500'}`}
              >
                가++
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
              title="기사 스크랩"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Share Native */}
            <button
              onClick={handleNativeShare}
              className="p-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="기사 공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="hidden sm:flex p-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="인쇄하기"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Article (8 Cols) & Right Sticky Sidebar (4 Cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 Cols): Main Article & Comments & Bottom Back Button */}
          <article className="lg:col-span-8 space-y-6">
        
        {/* Article Headline Header */}
        <header className="space-y-4 border-b border-gray-300 pb-6">
          {/* Real-time Translation Loading Notification */}
          {isTranslating && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-950 rounded-xl p-3 flex items-center justify-between text-xs font-bold animate-pulse shadow-2xs">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span>기사 실시간 영문 번역 중... (Translating to English...)</span>
              </div>
              <span className="text-[11px] text-amber-700 font-sans hidden sm:inline">실시간 자동 번역</span>
            </div>
          )}

          {/* Badge & Category */}
          <div className="flex items-center gap-2">
            {article.badge && (
              <span className="px-2.5 py-0.5 bg-[#1b2a47] text-amber-400 font-serif-kr font-bold text-xs rounded-sm shadow-2xs">
                {article.badge}
              </span>
            )}
            <span className="text-xs font-bold text-[#1b2a47] font-serif-kr">
              {displayCategory}
            </span>
            {article.sectionPage && (
              <span className="text-xs text-slate-500 font-mono">
                [{article.sectionPage}]
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif-kr text-slate-900 leading-tight tracking-tight">
            {displayTitle}
          </h1>

          {/* Subtitle */}
          {displaySubtitle && (
            <h2 className="text-sm sm:text-base md:text-lg text-slate-700 font-serif-kr leading-relaxed border-l-2 border-[#1b2a47] pl-3 py-0.5">
              {displaySubtitle}
            </h2>
          )}

          {/* Reporter Byline & Metadata Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-sans border-t border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={article.reporter.avatar}
                alt={article.reporter.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm font-serif-kr">
                    {article.reporter.name}
                  </span>
                  <span className="text-slate-500 font-serif-kr text-xs">
                    {article.reporter.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {article.reporter.department} · {article.reporter.email}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-right sm:text-right">
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  송고 {article.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {article.views.toLocaleString()} 읽음
                </span>
              </div>
              {article.updatedAt && (
                <p className="text-[10px] text-slate-400">
                  최종수정 {article.updatedAt}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Ad Slot 1: Below Subtitle / Byline */}
        <DynamicAdBanner
          adCode={adSettings?.belowSubtitle}
          slotName="belowSubtitle"
          slotLabel="광고: 기사 제목/부제목 하단"
        />

        {/* Real TTS Player Bar (Web Speech API) */}
        <div className="bg-[#1b2a47] text-white rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border border-[#2d3e5f]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleToggleTts}
              className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md shrink-0 active:scale-95"
              title={isPlayingAudio && !isPausedAudio ? '일시정지' : '본문 읽어주기 (TTS)'}
            >
              {isPlayingAudio && !isPausedAudio ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {isPlayingAudio && (
              <button
                onClick={handleStopTts}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shrink-0 active:scale-95"
                title="정지"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif-kr font-bold text-sm text-white whitespace-nowrap">
                  {isEn ? 'Voice Reader (TTS)' : '한국문화저널 본문 듣기 (AI 보이스)'}
                </span>
                {isPlayingAudio && (
                  <span className="px-2 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse whitespace-nowrap">
                    {isPausedAudio ? (isEn ? 'PAUSED' : '일시정지됨') : (isEn ? 'PLAYING' : '재생중')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-sans truncate">
                {isEn ? 'Listen to the full article with natural speech' : '기사 전문을 고품질 음성으로 편안하게 청취하세요.'}
              </p>
            </div>
          </div>

          {/* Right: Speed Selector & Open in KCJ Radio Button in Clean Horizontal Row */}
          <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto pb-0.5 md:pb-0">
            <button
              onClick={handleNavigateToRadio}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95 whitespace-nowrap"
              title="KCJ Radio 디지털 방송국 전용 스튜디오에서 듣기"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span>🎙 KCJ Radio 스튜디오에서 듣기</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs shrink-0 whitespace-nowrap">
              <span className="text-slate-400 text-[10px] px-1 font-bold whitespace-nowrap">배속:</span>
              {[0.8, 1.0, 1.2, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleChangeTtsSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    audioSpeed === spd
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI 3-Line Summary Card */}
        {aiSummary && showAiSummary && (
          <div className="bg-[#f0ebe1] border border-[#d8d0c0] rounded-2xl p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif-kr font-bold text-slate-900 text-sm">
                  {isEn ? 'AI 3-Line Summary' : '한국문화저널 AI 핵심 요약 (3줄)'}
                </h3>
              </div>
              <button
                onClick={fetchAiSummary}
                disabled={isLoadingSummary}
                className="text-[11px] text-[#1b2a47] font-bold hover:underline"
              >
                {isLoadingSummary ? (isEn ? 'Summarizing...' : '요약 생성중...') : (isEn ? 'Regenerate' : '다시 요약')}
              </button>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-800 font-serif-kr leading-relaxed list-disc list-inside">
              {aiSummary.map((item, idx) => (
                <li key={idx} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden border border-[#d8d3cb] bg-slate-900 shadow-xs aspect-16/10">
              <img
                src={article.imageUrl}
                alt={displayTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-xs text-slate-500 font-serif-kr text-center italic">
                ▲ {(isEn && article.imageCaptionEn) ? article.imageCaptionEn : article.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Lead Summary paragraph */}
        {displaySummary && (
          <div className="p-4 bg-white border-l-4 border-[#1b2a47] rounded-r-xl shadow-2xs font-serif-kr text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
            {displaySummary}
          </div>
        )}

        {/* Article Full Body Typography */}
        {isTranslating && !translatedData ? (
          <div className="py-12 px-6 bg-white/80 border border-[#d8d3cb] rounded-2xl text-center space-y-4 shadow-xs">
            <div className="inline-flex items-center justify-center p-3.5 bg-amber-100 text-amber-800 rounded-full shadow-xs animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-kr font-bold text-slate-800 text-base">
                Translating...
              </h4>
              <p className="text-xs text-slate-500 font-sans">
                한국어 기사 원문을 영어로 실시간 번역하고 있습니다. 잠시만 기다려주세요.
              </p>
            </div>
            {/* Shimmer Placeholder Lines */}
            <div className="max-w-md mx-auto space-y-2 pt-2 opacity-60">
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-full"></div>
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-5/6 mx-auto"></div>
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-4/6 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div 
            className={`pt-2 transition-opacity duration-300 ${
              isTranslating ? 'opacity-70' : 'opacity-100'
            }`}
          >
            <ArticleBodyRenderer
              content={displayContent}
              fontSize={fontSize}
              adComponent={
                <DynamicAdBanner
                  adCode={adSettings?.inBody}
                  slotName="inBody"
                  slotLabel="광고: 기사 본문 중간 (3~4번째 문단 직후)"
                />
              }
            />
          </div>
        )}

        {/* Ad Slot 3: After Body */}
        <DynamicAdBanner
          adCode={adSettings?.afterBody}
          slotName="afterBody"
          slotLabel="광고: 기사 본문 완료 직후"
        />

        {/* Tags */}
        {displayTags && displayTags.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-serif-kr">관련 키워드:</span>
            {displayTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-[#d8d3cb] rounded-full text-xs font-bold text-slate-700 hover:text-[#1b2a47] hover:border-[#1b2a47] cursor-pointer transition-colors"
              >
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* Requirement 15: Mandatory Copyright Notice */}
        {/* ========================================================================= */}
        <div className="p-4 bg-[#eeebe3] border border-[#d8d3cb] rounded-xl text-center text-xs text-slate-700 font-serif-kr font-bold shadow-2xs">
          © 2026, 편집부. All rights reserved. 모든 콘텐츠(기사)에 대한 무단 전재ㆍ복사ㆍ배포 등을 금합니다.
        </div>

        {/* ========================================================================= */}
        {/* Requirement 16: Social Media Share Buttons (Facebook, Kakao, Twitter, Copy) */}
        {/* ========================================================================= */}
        <div className="p-5 bg-white border border-[#d8d3cb] rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#1b2a47]" />
              <h4 className="font-serif-kr font-bold text-slate-900 text-sm">
                {isEn ? 'Share this article' : '기사 SNS 공유 및 링크 복사'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs hidden sm:inline">
              {currentUrl}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Facebook Share Button */}
            <button
              onClick={handleShareFacebook}
              className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>페이스북 공유</span>
            </button>

            {/* Twitter / X Share Button */}
            <button
              onClick={handleShareTwitter}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>X (트위터)</span>
            </button>

            {/* Copy Article URL */}
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-[#f8f6f2] hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-[#d8d3cb] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              <span>기사 URL 복사</span>
            </button>

            {/* Native Mobile Share */}
            <button
              onClick={handleNativeShare}
              className="px-4 py-2 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>더 많은 앱으로 공유</span>
            </button>
          </div>
        </div>

        {/* Reader Reactions (5 Emotion Points) */}
        <div className="bg-white border border-[#d8d3cb] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-serif-kr font-bold text-slate-900 text-base">
              이 기사에 어떤 반응을 남기시겠습니까?
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              독자 여러분의 피드백은 한국문화저널의 다음 심층 기획에 반영됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { type: 'info' as ReactionType, label: '쏠쏠정보', emoji: '💡', count: reactions.info },
              { type: 'exciting' as ReactionType, label: '흥미진진', emoji: '🔥', count: reactions.exciting },
              { type: 'empathy' as ReactionType, label: '공감백배', emoji: '👏', count: reactions.empathy },
              { type: 'analysis' as ReactionType, label: '분석탁월', emoji: '🔍', count: reactions.analysis },
              { type: 'followup' as ReactionType, label: '후속원해요', emoji: '📰', count: reactions.followup },
            ].map((btn) => {
              const isSelected = userReaction === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={() => handleReactionClick(btn.type)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                      : 'bg-[#fcfaf7] border-[#e2ded6] hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-xs font-serif-kr font-bold">{btn.label}</span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    {btn.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reporter Card with Cheer & Subscribe */}
        <div className="bg-[#f2efe9] border border-[#d8d3cb] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src={article.reporter.avatar}
              alt={article.reporter.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h4 className="font-serif-kr font-bold text-slate-900 text-base">
                  {article.reporter.name} 기자
                </h4>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded-sm font-serif-kr font-bold">
                  {article.reporter.department}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-serif-kr">
                {article.reporter.bio}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {article.reporter.email} · 구독자 {article.reporter.subscriberCount.toLocaleString()}명
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Cheer Button */}
            <button
              onClick={handleCheerReporter}
              disabled={hasCheered}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                hasCheered
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasCheered ? 'fill-current' : ''}`} />
              <span>응원 {cheerCount}</span>
            </button>

            {/* Reporter Subscribe Button */}
            <button
              onClick={handleToggleSubscribeReporter}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                isReporterSubscribed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#1b2a47] text-white hover:bg-[#25375c]'
              }`}
            >
              {isReporterSubscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>구독중</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>기자 구독</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Culture Docent Q&A Section */}
        <div className="bg-white border border-[#d8d3cb] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif-kr font-bold text-slate-900 text-sm">
                {isEn ? 'Ask AI Culture Docent' : 'AI 문화 전문 도슨트에게 질문하기'}
              </h3>
            </div>
            <button
              onClick={() => setShowAiChat(!showAiChat)}
              className="text-xs text-[#1b2a47] font-bold hover:underline"
            >
              {showAiChat ? '접기' : '질문 열기'}
            </button>
          </div>

          {showAiChat && (
            <div className="space-y-3 pt-1 animate-in fade-in">
              <form onSubmit={handleAskDocent} className="flex gap-2">
                <input
                  type="text"
                  value={docentQuestion}
                  onChange={(e) => setDocentQuestion(e.target.value)}
                  placeholder={isEn ? 'Ask about cultural background or artwork...' : '기사에 등장하는 문화재나 예술가의 역사적 배경이 궁금하신가요?'}
                  className="flex-1 px-3.5 py-2 bg-[#f8f6f2] border border-[#d8d3cb] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1b2a47]"
                />
                <button
                  type="submit"
                  disabled={isLoadingDocent}
                  className="px-4 py-2 bg-[#1b2a47] hover:bg-[#25375c] text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50"
                >
                  {isLoadingDocent ? '분석중...' : '질문'}
                </button>
              </form>

              {docentAnswer && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5 font-serif-kr">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>한국문화저널 AI 문화 해설</span>
                  </div>
                  <p className="leading-relaxed">{docentAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <section className="bg-white border border-[#d8d3cb] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1b2a47]" />
              <h3 className="font-serif-kr font-bold text-slate-900 text-base">
                독자 댓글 ({comments.length})
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setCommentSort('likes')}
                className={`font-bold ${commentSort === 'likes' ? 'text-[#1b2a47] underline' : 'text-slate-400'}`}
              >
                추천순
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setCommentSort('latest')}
                className={`font-bold ${commentSort === 'latest' ? 'text-[#1b2a47] underline' : 'text-slate-400'}`}
              >
                최신순
              </button>
            </div>
          </div>

          {/* Comment Write Form */}
          <form onSubmit={handleAddComment} className="space-y-2 bg-[#f8f6f2] p-4 rounded-xl border border-[#d8d3cb]">
            <input
              type="text"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              placeholder="닉네임 / 성명 (미입력 시 익명)"
              className="w-full sm:w-60 px-3 py-1.5 bg-white border border-[#d8d3cb] rounded-lg text-xs text-slate-900"
            />
            <textarea
              rows={3}
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="건전하고 품격 있는 토론 문화를 위해 신문윤리강령을 준수해 주시기 바랍니다."
              className="w-full p-3 bg-white border border-[#d8d3cb] rounded-lg text-xs text-slate-900 resize-none font-serif-kr focus:outline-none focus:border-[#1b2a47]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#1b2a47] hover:bg-[#25375c] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>댓글 등록</span>
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-3 pt-2">
            {comments.map((comm) => (
              <div key={comm.id} className="p-3.5 bg-[#fcfaf7] rounded-xl border border-[#e2ded6] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 font-serif-kr">{comm.author}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{comm.createdAt}</span>
                </div>
                <p className="text-xs text-slate-800 font-serif-kr leading-relaxed">
                  {comm.content}
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <button className="flex items-center gap-1 hover:text-[#1b2a47]">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comm.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related In-Depth News Grid */}
        {relatedArticles.length > 0 && (
          <section className="pt-4 space-y-4">
            <h3 className="font-serif-kr font-bold text-slate-900 text-lg border-b border-gray-300 pb-2">
              관련 주요 문화 뉴스
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedArticle(rel)}
                  className="bg-white rounded-xl border border-[#d8d3cb] p-3.5 flex gap-3 cursor-pointer hover:border-[#1b2a47] hover:shadow-xs transition-all group"
                >
                  <img
                    src={rel.imageUrl}
                    alt={rel.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#1b2a47] font-serif-kr">
                      {rel.categoryLabel}
                    </span>
                    <h4 className="font-serif-kr font-bold text-xs text-slate-900 group-hover:text-[#1b2a47] line-clamp-2 leading-snug mt-0.5">
                      {(isEn && rel.titleEn) ? rel.titleEn : rel.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {rel.reporter.name} 기자 · {rel.publishedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Back Button */}
        <div className="pt-8 pb-4 text-center">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1b2a47] hover:bg-[#25375c] text-white font-bold text-sm rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? 'Back to All News' : '← 전체 기사 목록으로 돌아가기'}</span>
          </button>
        </div>
      </article>

      {/* Right Column (4 Cols): Follows on scroll (Sticky) on Desktop; Located under Back Button on Mobile */}
      <aside className="lg:col-span-4 lg:self-start lg:sticky lg:top-14 space-y-6">
        {/* Ad Slot 4: Sidebar Top */}
        <DynamicAdBanner
          adCode={adSettings?.sidebarTop}
          slotName="sidebarTop"
          slotLabel="광고: 사이드바 상단"
        />

        {/* 1. Real-time Rankings */}
        <RankingSection
          articles={allArticles}
          onSelectArticle={onSelectRelatedArticle}
        />

        {/* 2. Editorial & Opinion Sidebar Section */}
        <OpinionSidebarSection
          onSelectCategory={(cat) => {
            if (onSelectCategory) {
              onSelectCategory(cat);
            } else {
              onBack();
            }
          }}
          onSelectArticle={(art) => {
            onSelectRelatedArticle(art);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          articles={allArticles}
        />

        {/* 3. Key Issues at This Hour */}
        <IssueClustering
          onSelectIssue={(iss) => setSelectedIssue(iss)}
          onSelectKeyword={(kw) => {
            onBack();
          }}
          onSelectArticle={(articleId) => {
            const targetArt = allArticles.find((a) => a.id === articleId);
            if (targetArt) {
              onSelectRelatedArticle(targetArt);
            }
          }}
        />

        {/* 4. MCST Official Press Releases (문체부 공식 보도자료 - Detail page sidebar bottom only) */}
        <McstPressReleaseSidebar />

        {/* Ad Slot 5: Sidebar Bottom */}
        <DynamicAdBanner
          adCode={adSettings?.sidebarBottom}
          slotName="sidebarBottom"
          slotLabel="광고: 사이드바 하단"
        />
      </aside>
    </div>
  </div>

  {/* Editorial Column Modal */}
  {showEditorialModal && (
    <EditorialColumnModal onClose={() => setShowEditorialModal(false)} />
  )}

  {/* Key Issue Interactive Map & Clustered Articles Modal */}
  {selectedIssue && (
    <IssueDetailModal
      issue={selectedIssue}
      onClose={() => setSelectedIssue(null)}
      articles={allArticles}
      onSelectArticle={(articleId) => {
        const targetArt = allArticles.find((a) => a.id === articleId);
        if (targetArt) {
          onSelectRelatedArticle(targetArt);
        }
        setSelectedIssue(null);
      }}
    />
  )}
</div>
);
};
