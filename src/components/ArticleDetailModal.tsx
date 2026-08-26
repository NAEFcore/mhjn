import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  Check, 
  HelpCircle, 
  ChevronRight, 
  Plus, 
  UserCheck, 
  Heart,
  RotateCcw
} from 'lucide-react';
import { Article, Comment, ReactionType } from '../types';
import { MOCK_COMMENTS, INITIAL_ARTICLES } from '../data/mockNews';
import { ArticleBodyRenderer } from './ArticleBodyRenderer';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
  onSelectRelatedArticle: (art: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onSelectRelatedArticle,
  isBookmarked,
  onToggleBookmark,
}) => {
  // Typography font size state
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string[] | null>(article.aiSummary || null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(true);

  // TTS Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<'1.0x' | '1.2x' | '1.5x'>('1.0x');
  const [audioProgress, setAudioProgress] = useState(0);

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
        content: '한국문화저널의 깊이 있는 취재에 감사드립니다. 우리 문화의 숨은 가치를 다시금 깨닫게 되네요.',
        createdAt: '2026.08.21. 09:30',
        likes: 34,
        dislikes: 0,
      },
    ]
  );
  const [commentSort, setCommentSort] = useState<'likes' | 'latest'>('likes');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // TTS audio playback simulation
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  // Request fresh AI summary
  const fetchAiSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
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
  const handleAskDocent = async (customQ?: string) => {
    const query = customQ || docentQuestion;
    if (!query.trim()) return;

    setIsLoadingDocent(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: article.title,
          articleContent: article.content,
          question: query,
        }),
      });
      const data = await res.json();
      setDocentAnswer(data.answer);
    } catch (e) {
      console.error(e);
      setDocentAnswer('AI 도슨트 서버와의 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingDocent(false);
    }
  };

  // Handle Reaction Click
  const handleReactionClick = (type: ReactionType) => {
    if (userReaction === type) {
      // Toggle off
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
      setUserReaction(null);
    } else {
      // Toggle new
      setReactions((prev) => {
        const updated = { ...prev };
        if (userReaction) {
          updated[userReaction] = updated[userReaction] - 1;
        }
        updated[type] = updated[type] + 1;
        return updated;
      });
      setUserReaction(type);
      showToast('공감이 반영되었습니다.');
    }
  };

  // Handle Reporter Cheer
  const handleCheer = () => {
    if (!hasCheered) {
      setCheerCount((prev) => prev + 1);
      setHasCheered(true);
      showToast(`${article.reporter.name} 기자에게 응원을 보냈습니다! 👏`);
    }
  };

  // Handle Reporter Subscribe
  const handleReporterSubscribe = () => {
    const next = !isReporterSubscribed;
    setIsReporterSubscribed(next);
    showToast(
      next
        ? `${article.reporter.name} 기자를 구독했습니다. 기자의 최신 기사를 모아볼 수 있습니다.`
        : `${article.reporter.name} 기자 구독을 취소했습니다.`
    );
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: Comment = {
      id: `c-new-${Date.now()}`,
      articleId: article.id,
      author: newCommentAuthor.trim() || '익명독자',
      content: newCommentText.trim(),
      createdAt: '방금 전',
      likes: 0,
      dislikes: 0,
    };

    setComments([newC, ...comments]);
    setNewCommentText('');
    showToast('댓글이 등록되었습니다.');
  };

  const handleLikeComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('기사 링크가 클립보드에 복사되었습니다.');
  };

  const fontSizeClass =
    fontSize === 'xlarge'
      ? 'text-lg sm:text-xl leading-loose'
      : fontSize === 'large'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  // Sorted Comments
  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'likes') return b.likes - a.likes;
    return b.id.localeCompare(a.id);
  });

  const relatedArticles = INITIAL_ARTICLES.filter((a) => a.id !== article.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Article Detail Paper Container */}
      <div className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-200">
        {/* Sticky Header Nav */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="font-bold text-[#0051a8]">한국문화저널</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-800 font-semibold">{article.categoryLabel}</span>
            {article.subCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">{article.subCategory}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="기사 공유"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleBookmark}
              title={isBookmarked ? '스크랩 취소' : '기사 스크랩'}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => window.print()}
              title="기사 인쇄"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="p-4 sm:p-8 lg:p-10 flex-1 space-y-6">
          {/* Article Badge & Category */}
          <div className="flex items-center gap-2">
            {article.badge && (
              <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-xs shadow-xs">
                {article.badge}
              </span>
            )}
            <span className="text-xs font-bold text-[#0051a8] bg-blue-50 px-2.5 py-1 rounded-xs border border-blue-100">
              {article.categoryLabel}
            </span>
            {article.sectionPage && (
              <span className="text-xs text-gray-500 font-medium">
                지면 {article.sectionPage}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-kr text-gray-950 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed border-l-3 border-[#0051a8] pl-3 py-0.5">
              {article.subtitle}
            </p>
          )}

          {/* Reporter Byline & Date Bar */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
            {/* Reporter Profile */}
            <div className="flex items-center gap-3">
              <img
                src={article.reporter.avatar}
                alt={article.reporter.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{article.reporter.name} 기자</span>
                  <button
                    onClick={handleReporterSubscribe}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      isReporterSubscribed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#0051a8] hover:text-[#0051a8]'
                    }`}
                  >
                    {isReporterSubscribed ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>구독중</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>기자 구독</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{article.reporter.department} · {article.reporter.email}</p>
              </div>
            </div>

            {/* Dates & Cheer button */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="text-right">
                <p>입력 {article.publishedAt}</p>
                {article.updatedAt && <p className="text-gray-400">수정 {article.updatedAt}</p>}
              </div>

              <button
                onClick={handleCheer}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  hasCheered
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasCheered ? 'fill-red-600 text-red-600' : ''}`} />
                <span>응원 {cheerCount}</span>
              </button>
            </div>
          </div>

          {/* Reader Interactive Toolbar (Font Size, AI 3-Line Summary, TTS Player, AI Docent) */}
          <div className="bg-[#f0f4f9] rounded-xl p-3.5 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-2xs">
              <span className="text-gray-500 font-medium mr-1">글자 크기:</span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-sm font-bold ${fontSize === 'normal' ? 'bg-[#0051a8] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                가
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-sm font-bold ${fontSize === 'large' ? 'bg-[#0051a8] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                가+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-sm font-bold ${fontSize === 'xlarge' ? 'bg-[#0051a8] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                가++
              </button>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* TTS Audio button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  isPlayingAudio
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-white border border-gray-300 text-gray-800 hover:border-indigo-500 hover:text-indigo-600'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? '본문 듣는 중...' : '본문 듣기 (TTS)'}</span>
              </button>

              {/* AI 3-Line Summary Toggle */}
              <button
                onClick={() => {
                  if (!aiSummary && !isLoadingSummary) fetchAiSummary();
                  setShowAiSummary(!showAiSummary);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 3줄 요약</span>
              </button>

              {/* AI Culture Docent Q&A Button */}
              <button
                onClick={() => setShowAiChat(!showAiChat)}
                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-bold flex items-center gap-1.5 hover:bg-indigo-50 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>기사 속 문화 AI 질문</span>
              </button>
            </div>
          </div>

          {/* TTS Audio Player Widget */}
          {isPlayingAudio && (
            <div className="bg-indigo-950 text-white p-4 rounded-xl shadow-lg border border-indigo-800 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="text-xs font-bold">오디오 뉴스 재생 중 (성우 음성 합성)</p>
                  <p className="text-[11px] text-indigo-300 truncate max-w-xs">{article.title}</p>
                </div>
              </div>

              {/* Progress Bar & Waveform Simulation */}
              <div className="flex-1 w-full max-w-md mx-2">
                <div className="w-full bg-indigo-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center gap-2">
                {(['1.0x', '1.2x', '1.5x'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setAudioSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      audioSpeed === spd ? 'bg-white text-indigo-950' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
                <button
                  onClick={() => setIsPlayingAudio(false)}
                  className="p-1 text-indigo-300 hover:text-white"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* AI 3-Line Summary Box */}
          {showAiSummary && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-200/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0051a8]" />
                  <h4 className="text-sm font-bold text-gray-900">
                    한국문화저널 AI 3줄 핵심 브리핑
                  </h4>
                </div>
                <button
                  onClick={fetchAiSummary}
                  disabled={isLoadingSummary}
                  className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className={`w-3 h-3 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                  {isLoadingSummary ? '요약 생성중...' : '새로고침'}
                </button>
              </div>

              {isLoadingSummary ? (
                <div className="py-4 text-center text-xs text-blue-600 font-medium animate-pulse">
                  Gemini AI가 기사의 핵심 맥락을 요약하고 있습니다...
                </div>
              ) : aiSummary && aiSummary.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                  {aiSummary.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#0051a8] font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">요약 데이터가 준비되지 않았습니다.</p>
              )}
            </div>
          )}

          {/* AI Culture Docent Q&A Drawer */}
          {showAiChat && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-5 shadow-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-indigo-200">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-indigo-950">
                    AI 문화 전문기자 & 도슨트에게 질문하기
                  </h4>
                </div>
                <button
                  onClick={() => setShowAiChat(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sample Suggested Questions */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs text-indigo-800 font-semibold">추천 질문:</span>
                {[
                  '이 유물의 역사적 가치는?',
                  '전시 관람 시 꼭 봐야 할 포인트는?',
                  '관련 전통 문화용어 설명해줘',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocentQuestion(q);
                      handleAskDocent(q);
                    }}
                    className="text-xs bg-white text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={docentQuestion}
                  onChange={(e) => setDocentQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskDocent()}
                  placeholder="기사 내용 중 궁금한 점(역사, 배경, 작가 등)을 질문하세요..."
                  className="flex-1 px-3 py-2 bg-white text-xs rounded-lg border border-indigo-300 focus:outline-none focus:border-indigo-600"
                />
                <button
                  onClick={() => handleAskDocent()}
                  disabled={isLoadingDocent || !docentQuestion.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>질문</span>
                </button>
              </div>

              {/* Answer Box */}
              {isLoadingDocent && (
                <div className="p-3 bg-white rounded-lg border border-indigo-200 text-xs text-indigo-600 animate-pulse font-medium">
                  AI 도슨트가 문화재 연구 데이터와 기사 맥락을 분석하고 있습니다...
                </div>
              )}
              {docentAnswer && !isLoadingDocent && (
                <div className="p-4 bg-white rounded-lg border border-indigo-200 text-xs sm:text-sm text-gray-800 leading-relaxed shadow-2xs">
                  <div className="flex items-center gap-1 text-indigo-700 font-bold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 도슨트 답변:</span>
                  </div>
                  <p>{docentAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Main Photo with Caption */}
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[520px] object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-xs text-gray-500 italic text-center font-serif-kr">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Article Full Text */}
          <ArticleBodyRenderer
            content={article.content}
            fontSize={fontSize}
          />

          {/* Article Copyright / Reporter Desk Tag */}
          <div className="border-t border-b border-gray-200 py-4 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-3 font-sans">
            <div>
              <p className="font-semibold text-gray-700">한국문화저널 기사제보 및 문의</p>
              <p>email: newsdesk@kculturejournal.com | 전화: 02-3456-7890</p>
            </div>
            <p className="text-[11px] text-gray-400">
              &copy; 한국문화저널(kculturejournal.com), 무단 전재 및 재배포 금지
            </p>
          </div>

          {/* Naver News Authentic 5-Emotion Reactions Bar */}
          <div className="py-6 text-center">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 font-sans">
              이 기사에 대한 독자 반응을 선택해주세요
            </h4>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {[
                { type: 'info' as const, emoji: '👍', label: '쏠쏠정보', count: reactions.info },
                { type: 'exciting' as const, emoji: '😮', label: '흥미진진', count: reactions.exciting },
                { type: 'empathy' as const, emoji: '❤️', label: '공감백배', count: reactions.empathy },
                { type: 'analysis' as const, emoji: '💡', label: '분석탁월', count: reactions.analysis },
                { type: 'followup' as const, emoji: '✍️', label: '후속기사원해요', count: reactions.followup },
              ].map((item) => {
                const isSelected = userReaction === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleReactionClick(item.type)}
                    className={`flex flex-col items-center justify-center p-3 sm:px-4 sm:py-3.5 rounded-xl border transition-all shadow-xs min-w-[76px] ${
                      isSelected
                        ? 'bg-blue-50 border-[#0051a8] text-[#0051a8] scale-105 shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-500 mt-0.5">
                      {item.count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs font-bold text-gray-500">관련 태그:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full hover:bg-blue-50 hover:text-[#0051a8] cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-8 border-t-2 border-gray-900 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0051a8]" />
                <h3 className="text-lg font-black text-gray-900">
                  독자 댓글 <span className="text-[#0051a8]">({comments.length})</span>
                </h3>
              </div>

              {/* Sort Tabs */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <button
                  onClick={() => setCommentSort('likes')}
                  className={`px-2.5 py-1 rounded-full ${
                    commentSort === 'likes' ? 'bg-[#0051a8] text-white' : 'hover:text-gray-900'
                  }`}
                >
                  순공감순
                </button>
                <span>·</span>
                <button
                  onClick={() => setCommentSort('latest')}
                  className={`px-2.5 py-1 rounded-full ${
                    commentSort === 'latest' ? 'bg-[#0051a8] text-white' : 'hover:text-gray-900'
                  }`}
                >
                  최신순
                </button>
              </div>
            </div>

            {/* Comment Write Input */}
            <form onSubmit={handleAddComment} className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  placeholder="닉네임 (기본: 익명독자)"
                  className="px-3 py-1.5 bg-white text-xs rounded-md border border-gray-300 focus:outline-none focus:border-[#0051a8] w-44"
                />
                <span className="text-[11px] text-gray-400">
                  건전한 문화 비평 문화를 위해 타인에 대한 배려를 담아주세요.
                </span>
              </div>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="기사에 대한 의견이나 문화적 소감을 남겨주세요."
                rows={3}
                className="w-full p-3 bg-white text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#0051a8] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-[#0051a8] text-white text-xs font-bold rounded-lg hover:bg-[#003e82] disabled:opacity-40 transition-colors"
                >
                  댓글 등록
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 divide-y divide-gray-100">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{comment.author}</span>
                      {comment.authorBadge && (
                        <span className="px-1.5 py-0.2 bg-blue-100 text-[#0051a8] text-[10px] font-bold rounded-xs">
                          {comment.authorBadge}
                        </span>
                      )}
                      <span className="text-gray-400">{comment.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed mb-2">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 hover:text-[#0051a8] transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>공감 {comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related News Carousel / Grid */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4 font-serif-kr">
              이 기사를 본 독자가 많이 읽은 관련 뉴스
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedArticle(rel)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-[#0051a8] block mb-1">
                      {rel.categoryLabel}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0051a8] line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
