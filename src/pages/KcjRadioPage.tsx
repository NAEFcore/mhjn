import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Globe2, 
  ExternalLink, 
  Share2, 
  Check, 
  Sparkles, 
  Clock, 
  Calendar, 
  Tag, 
  Eye, 
  ArrowLeft, 
  Tv, 
  ListMusic, 
  Sliders, 
  Mic2, 
  Headphones, 
  Volume1, 
  Repeat, 
  Shuffle, 
  Search, 
  X,
  Newspaper,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Tv2
} from 'lucide-react';
import { Article, Language, CategoryId } from '../types';
import { CATEGORY_TABS } from '../data/mockNews';
import { translateArticleToEnglish } from '../utils/translator';

interface KcjRadioPageProps {
  articles: Article[];
  onBackToNews?: () => void;
  onSelectArticleDetail?: (art: Article) => void;
  initialArticleId?: string | null;
  initialLang?: Language;
}

export const KcjRadioPage: React.FC<KcjRadioPageProps> = ({
  articles,
  onBackToNews,
  onSelectArticleDetail,
  initialArticleId,
  initialLang = 'ko',
}) => {
  // Navigation / Broadcast channel tab: Radio vs TV Live
  const [broadcastMode, setBroadcastMode] = useState<'radio' | 'tv_live'>('radio');

  // Multi-Language State
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'en' || urlLang === 'ko') return urlLang;
    }
    return initialLang;
  });

  // Filter only published articles and order chronologically (latest first)
  const publishedArticles = useMemo(() => {
    const list = articles.filter(a => !a.status || a.status === 'PUBLISHED');
    return [...list].sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [articles]);

  // Active playing article state
  const [currentArticle, setCurrentArticle] = useState<Article | null>(() => {
    // Check URL search param first
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlArticleId = urlParams.get('article') || initialArticleId;
      if (urlArticleId) {
        const match = articles.find(a => a.id === urlArticleId);
        if (match) return match;
      }
    }
    return publishedArticles[0] || articles[0] || null;
  });

  // Direct fetch fallback for incognito / direct URL /article/ resolution
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlArticleId = urlParams.get('article');
    const urlLang = urlParams.get('lang');

    if (urlLang === 'en' || urlLang === 'ko') {
      setLang(urlLang);
    }

    if (urlArticleId) {
      const existing = articles.find(a => a.id === urlArticleId);
      if (existing) {
        setCurrentArticle(existing);
      } else {
        // Fetch directly from server API
        fetch(`/api/articles/${urlArticleId}`)
          .then(res => res.json())
          .then(data => {
            if (data.article) {
              setCurrentArticle(data.article);
            }
          })
          .catch(err => console.warn('Radio article fetch error:', err));
      }
    }
  }, [articles]);

  // Audio Playback & TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoNext, setAutoNext] = useState(true);
  const [repeatCurrent, setRepeatCurrent] = useState(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Real-time spoken text paragraph/sentence tracking
  const [speechSegments, setSpeechSegments] = useState<string[]>([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [isTranslatingEn, setIsTranslatingEn] = useState(false);
  const [translatedEnBody, setTranslatedEnBody] = useState<{ title: string; subtitle: string; content: string } | null>(null);

  // Playlist search and category filter
  const [playlistCategory, setPlaylistCategory] = useState<string>('all');
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio visualizer bars animation data
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(() => 
    Array.from({ length: 36 }, () => Math.floor(Math.random() * 60) + 20)
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationIntervalRef = useRef<any>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Prepare text segments whenever article or language changes
  useEffect(() => {
    if (!currentArticle) return;

    let titleText = currentArticle.title;
    let subtitleText = currentArticle.subtitle || '';
    let bodyText = currentArticle.content || currentArticle.summary || '';

    if (lang === 'en') {
      if (currentArticle.contentEn) {
        titleText = currentArticle.titleEn || currentArticle.title;
        subtitleText = currentArticle.subtitleEn || '';
        bodyText = currentArticle.contentEn;
        setTranslatedEnBody({ title: titleText, subtitle: subtitleText, content: bodyText });
      } else {
        // Translate real-time to English if missing
        setIsTranslatingEn(true);
        translateArticleToEnglish({
          id: currentArticle.id,
          title: currentArticle.title,
          subtitle: currentArticle.subtitle,
          summary: currentArticle.summary,
          content: currentArticle.content,
          categoryLabel: currentArticle.categoryLabel,
        }).then(res => {
          setIsTranslatingEn(false);
          setTranslatedEnBody({
            title: res.title || currentArticle.title,
            subtitle: res.subtitle || '',
            content: res.content || currentArticle.content,
          });
        }).catch(() => {
          setIsTranslatingEn(false);
        });
      }
    } else {
      setTranslatedEnBody(null);
    }

    // Break content into clean spoken segments
    const activeTitle = lang === 'en' && currentArticle.titleEn ? currentArticle.titleEn : currentArticle.title;
    const activeSubtitle = lang === 'en' && currentArticle.subtitleEn ? currentArticle.subtitleEn : currentArticle.subtitle;
    const activeBody = lang === 'en' && currentArticle.contentEn ? currentArticle.contentEn : currentArticle.content;

    const segments: string[] = [];
    segments.push(`[KCJ Radio 방송 헤드라인] ${activeTitle}`);
    if (activeSubtitle) {
      segments.push(`[핵심 요약] ${activeSubtitle}`);
    }

    // Split body into readable paragraph segments
    const rawParas = activeBody.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p.length > 0);
    rawParas.forEach(p => segments.push(p));

    setSpeechSegments(segments);
    setActiveSegmentIndex(0);
  }, [currentArticle, lang]);

  // Clean-up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  // Equalizer visualizer wave animation loop
  useEffect(() => {
    if (isPlaying && !isPaused) {
      animationIntervalRef.current = setInterval(() => {
        setVisualizerHeights(
          Array.from({ length: 36 }, () => Math.floor(Math.random() * 85) + 15)
        );
      }, 120);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setVisualizerHeights(Array.from({ length: 36 }, () => 14));
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Auto-scroll transcript container to active segment
  useEffect(() => {
    if (transcriptScrollRef.current) {
      const activeEl = transcriptScrollRef.current.querySelector(`[data-segment="${activeSegmentIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSegmentIndex]);

  // SpeechSynthesis Engine Controller
  const playSpeechSegment = (index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!speechSegments || index >= speechSegments.length) {
      // Completed reading full article
      handleArticleFinished();
      return;
    }

    setActiveSegmentIndex(index);
    const textToSpeak = speechSegments[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Language Voice Selection
    utterance.lang = lang === 'en' ? 'en-US' : 'ko-KR';
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : volume;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetLangPrefix = lang === 'en' ? 'en' : 'ko';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onend = () => {
      // Advance to next paragraph/segment
      if (index + 1 < speechSegments.length) {
        playSpeechSegment(index + 1);
      } else {
        handleArticleFinished();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or cancelled:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleArticleFinished = () => {
    setIsPlaying(false);
    setIsPaused(false);

    if (repeatCurrent) {
      // Repeat same program
      setTimeout(() => {
        playSpeechSegment(0);
      }, 800);
      return;
    }

    if (autoNext && publishedArticles.length > 0 && currentArticle) {
      const currentIndex = publishedArticles.findIndex(a => a.id === currentArticle.id);
      const nextIndex = (currentIndex + 1) % publishedArticles.length;
      const nextArticle = publishedArticles[nextIndex];
      if (nextArticle) {
        setCurrentArticle(nextArticle);
        // Update URL
        updateUrlParams(nextArticle.id, lang);
        setTimeout(() => {
          playSpeechSegment(0);
        }, 1000);
      }
    }
  };

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      playSpeechSegment(activeSegmentIndex);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSegmentIndex(0);
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => {
      playSpeechSegment(0);
    }, 200);
  };

  const handleSelectArticle = (art: Article, autoStart = true) => {
    handleStop();
    setCurrentArticle(art);
    updateUrlParams(art.id, lang);
    if (autoStart) {
      setTimeout(() => {
        playSpeechSegment(0);
      }, 300);
    }
  };

  const handlePreviousProgram = () => {
    if (!currentArticle || publishedArticles.length === 0) return;
    const currentIndex = publishedArticles.findIndex(a => a.id === currentArticle.id);
    const prevIndex = (currentIndex - 1 + publishedArticles.length) % publishedArticles.length;
    handleSelectArticle(publishedArticles[prevIndex], isPlaying);
  };

  const handleNextProgram = () => {
    if (!currentArticle || publishedArticles.length === 0) return;
    const currentIndex = publishedArticles.findIndex(a => a.id === currentArticle.id);
    const nextIndex = (currentIndex + 1) % publishedArticles.length;
    handleSelectArticle(publishedArticles[nextIndex], isPlaying);
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    if (isPlaying && !isPaused) {
      // Re-trigger current segment with new speed
      playSpeechSegment(activeSegmentIndex);
    }
  };

  const handleToggleLanguage = (targetLang: Language) => {
    if (lang === targetLang) return;
    handleStop();
    setLang(targetLang);
    if (currentArticle) {
      updateUrlParams(currentArticle.id, targetLang);
    }
  };

  const updateUrlParams = (articleId: string, currentLang: Language) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/kcj-radio';
      url.searchParams.set('article', articleId);
      url.searchParams.set('lang', currentLang);
      window.history.pushState(null, '', url.toString());
    }
  };

  const handleShareRadio = () => {
    if (!currentArticle) return;
    const shareUrl = `${window.location.origin}/kcj-radio?article=${currentArticle.id}&lang=${lang}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // Filtered playlist
  const filteredPlaylist = useMemo(() => {
    return publishedArticles.filter(art => {
      const matchesCategory = playlistCategory === 'all' || art.category === playlistCategory;
      const matchesSearch = !playlistSearch.trim() || 
        art.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
        art.reporter.name.toLowerCase().includes(playlistSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [publishedArticles, playlistCategory, playlistSearch]);

  const displayTitle = lang === 'en' && (translatedEnBody?.title || currentArticle?.titleEn) 
    ? (translatedEnBody?.title || currentArticle?.titleEn) 
    : currentArticle?.title;

  const displaySubtitle = lang === 'en' && (translatedEnBody?.subtitle || currentArticle?.subtitleEn)
    ? (translatedEnBody?.subtitle || currentArticle?.subtitleEn)
    : currentArticle?.subtitle;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-16 flex flex-col">
      {/* 1. Global Station Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Brand Identity & Live Indicator */}
          <div className="flex items-center gap-3">
            {onBackToNews && (
              <button
                onClick={onBackToNews}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all mr-1"
                title="메인 뉴스룸으로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">뉴스룸 홈</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 shadow-lg ring-2 ring-amber-400/30">
                <Radio className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black font-serif-kr text-white tracking-wide">
                    KCJ RADIO
                  </h1>
                  {/* ON AIR Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[11px] font-black tracking-wider animate-pulse shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
                    <span>ON AIR</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                  한국문화저널 디지털 라디오 방송국 · KCJ 98.5 MHz Digital Stream
                </p>
              </div>
            </div>
          </div>

          {/* Center/Right: Broadcast Mode Switcher (Radio vs TV Live) & Language Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Mode Switcher */}
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setBroadcastMode('radio')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  broadcastMode === 'radio'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>KCJ Radio (오디오)</span>
              </button>
              <button
                onClick={() => setBroadcastMode('tv_live')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  broadcastMode === 'tv_live'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>KCJ TV Live (영상예정)</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => handleToggleLanguage('ko')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === 'ko'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => handleToggleLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Share Broadcast Link */}
            <button
              onClick={handleShareRadio}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="현재 라디오 방송 공유 링크 복사"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline text-emerald-400">복사완료</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden md:inline">방송 공유</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-8 flex-1 w-full space-y-6">
        {broadcastMode === 'tv_live' ? (
          /* Future KCJ TV Live Studio Placeholder Section */
          <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-4 max-w-3xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 mx-auto flex items-center justify-center">
              <Tv2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif-kr text-white">
                KCJ TV · YouTube Live 스튜디오 개국 준비 중
              </h2>
              <p className="text-slate-400 text-xs max-w-lg mx-auto">
                한국문화저널의 글로벌 문화예술 영상 중계 및 유튜브 라이브 방송 채널입니다. 현재는 오디오 라디오 방송국(KCJ Radio)을 전시간 운영하고 있습니다.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setBroadcastMode('radio')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition-all"
              >
                📻 KCJ Radio 방송으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          /* Active Radio Studio Deck */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Main Column (7 Cols): Master Radio Player & Live Transcript */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Studio Master Player Box */}
              <div className="bg-gradient-to-b from-[#111827] to-[#0d131f] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Player Top Meta Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-serif-kr font-bold text-[11px]">
                      {currentArticle?.categoryLabel || '문화속보'}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {currentArticle?.publishedAt ? `송고일시 ${currentArticle.publishedAt}` : '정규 편성 방송'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span>Web Speech TTS · 320kbps Crystal Stream</span>
                  </div>
                </div>

                {/* Featured Representative Image with Broadcast Frame */}
                {currentArticle?.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-950 aspect-16/9 shadow-lg group">
                    <img
                      src={currentArticle.imageUrl}
                      alt={displayTitle || '대표 이미지'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Image Caption overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="truncate pr-2 font-serif-kr">
                        {currentArticle.imageCaption || `▲ [보도자료] ${displayTitle}`}
                      </span>
                      {onSelectArticleDetail && currentArticle && (
                        <button
                          onClick={() => onSelectArticleDetail(currentArticle)}
                          className="shrink-0 text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 text-[10px]"
                        >
                          <span>기사 전문 보기</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Article Headline & Subtitle */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-kr text-white leading-snug tracking-tight">
                    {displayTitle}
                  </h2>
                  {displaySubtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 font-serif-kr leading-relaxed border-l-2 border-amber-500 pl-3 py-0.5">
                      {displaySubtitle}
                    </p>
                  )}
                </div>

                {/* CSS Audio Waveform Visualizer (Frequency Bars) */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Mic2 className={`w-3.5 h-3.5 ${isPlaying && !isPaused ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                      <span>{isPlaying ? (isPaused ? 'AUDIO PAUSED' : 'AUDIO BROADCASTING') : 'AUDIO STANDBY'}</span>
                    </span>
                    <span>FREQUENCY EQ · {lang === 'en' ? 'EN-US VOICE' : 'KO-KR NATIVE'}</span>
                  </div>

                  {/* Dynamic Equalizer Bars */}
                  <div className="h-16 flex items-end justify-between gap-1 px-1 py-1">
                    {visualizerHeights.map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-t-sm transition-all duration-100 ${
                          isPlaying && !isPaused
                            ? i % 4 === 0 
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                              : i % 3 === 0 
                              ? 'bg-amber-500' 
                              : 'bg-indigo-500'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Master Playback Controls */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    
                    {/* Previous / Play-Pause / Stop / Next */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePreviousProgram}
                        className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                        title="이전 프로그램"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleTogglePlay}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
                      >
                        {isPlaying && !isPaused ? (
                          <>
                            <Pause className="w-5 h-5 fill-current" />
                            <span>일시정지</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                            <span>{isPaused ? '이어듣기' : '방송 청취'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleStop}
                        className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                        title="정지"
                      >
                        <Square className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={handleReplay}
                        className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                        title="처음부터 다시 듣기"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleNextProgram}
                        className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                        title="다음 프로그램"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Speed Selector (0.8x ~ 2.0x) */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                      <span className="text-slate-500 text-[10px] px-1 font-bold">속도</span>
                      {[0.8, 1.0, 1.2, 1.5, 2.0].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleChangeSpeed(spd)}
                          className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                            playbackSpeed === spd
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Audio Settings (Auto-Next & Loop & Volume) */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Auto-Next toggle */}
                      <button
                        onClick={() => setAutoNext(!autoNext)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          autoNext
                            ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>연속 자동 방송: {autoNext ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* Repeat toggle */}
                      <button
                        onClick={() => setRepeatCurrent(!repeatCurrent)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          repeatCurrent
                            ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>한 곡 반복: {repeatCurrent ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* Volume Mute */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title={isMuted ? '음소거 해제' : '음소거'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Subtitle & Transcript Display */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="font-serif-kr font-bold text-white text-sm">
                      실시간 방송 자막 & 본문 텍스트 (Live Transcript)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    문단 {activeSegmentIndex + 1} / {Math.max(speechSegments.length, 1)}
                  </span>
                </div>

                {isTranslatingEn && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold animate-pulse">
                    영문 실시간 번역 생성 중입니다... (Translating content for English broadcast...)
                  </div>
                )}

                <div 
                  ref={transcriptScrollRef}
                  className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin text-xs sm:text-sm font-serif-kr leading-relaxed text-slate-300"
                >
                  {speechSegments.map((seg, idx) => {
                    const isActive = idx === activeSegmentIndex && isPlaying;
                    return (
                      <div
                        key={idx}
                        data-segment={idx}
                        onClick={() => playSpeechSegment(idx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 font-bold shadow-md ring-1 ring-amber-400/30 scale-[1.01]'
                            : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <p className="flex-1 whitespace-pre-wrap">
                            {seg}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Scheduled Program Playlist (편성표) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                
                {/* Playlist Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-serif-kr font-bold text-white text-base">
                        KCJ Radio 자동 편성표
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        총 {publishedArticles.length}개 문화 기사 실시간 자동 편성
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                    최신순 자동 갱신
                  </span>
                </div>

                {/* Playlist Search & Category Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={playlistSearch}
                      onChange={(e) => setPlaylistSearch(e.target.value)}
                      placeholder="편성 프로그램 검색 (제목, 기자명)..."
                      className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    {playlistSearch && (
                      <button
                        onClick={() => setPlaylistSearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    <button
                      onClick={() => setPlaylistCategory('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                        playlistCategory === 'all'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      전체 ({publishedArticles.length})
                    </button>
                    {CATEGORY_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setPlaylistCategory(tab.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                          playlistCategory === tab.id
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Playlist Program Cards */}
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredPlaylist.map((art, idx) => {
                    const isCurrent = currentArticle?.id === art.id;
                    const cardTitle = lang === 'en' && art.titleEn ? art.titleEn : art.title;

                    return (
                      <div
                        key={art.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden group ${
                          isCurrent
                            ? 'bg-gradient-to-r from-amber-500/20 via-slate-800/80 to-slate-900 border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 relative">
                          <img
                            src={art.imageUrl}
                            alt={cardTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                              {/* Mini animated equalizer */}
                              <div className="flex items-end gap-0.5 h-4">
                                <span className="w-1 bg-amber-400 rounded-xs animate-eq-bar" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 bg-amber-300 rounded-xs animate-eq-bar" style={{ animationDelay: '200ms' }} />
                                <span className="w-1 bg-amber-400 rounded-xs animate-eq-bar" style={{ animationDelay: '400ms' }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Text & Meta */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-serif-kr text-[10px] font-bold">
                              {art.categoryLabel}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {art.publishedAt}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-serif-kr font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-200 transition-colors">
                            {cardTitle}
                          </h4>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 truncate">
                              {art.reporter.name} 기자
                            </span>

                            {/* Listen Button */}
                            <button
                              onClick={() => handleSelectArticle(art, true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                                  : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isCurrent && isPlaying ? '청취중' : '▶ Listen'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPlaylist.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      선택된 카테고리에 해당하는 편성 프로그램이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* 3. Station Footer Bar */}
      <footer className="border-t border-slate-800/80 bg-[#0c121e] py-6 px-4 lg:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-serif-kr font-bold text-slate-300">
              한국문화저널 KCJ Radio 디지털 방송국
            </span>
            <span>|</span>
            <span>글로벌 K-컬처 & 헤리티지 24시간 실시간 디지털 스트림</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">등록번호: 부산, 아00245</span>
            <span>·</span>
            <span>발행·편집국: 한국문화저널 디지털 방송본부</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
