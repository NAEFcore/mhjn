import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Clock, 
  Calendar, 
  Tag, 
  Eye, 
  ArrowLeft, 
  Tv, 
  ListMusic, 
  Mic2, 
  Headphones, 
  Repeat, 
  Shuffle, 
  Search, 
  X,
  CheckCircle2,
  Tv2,
  Flame,
  Users,
  Activity,
  BarChart3,
  Archive,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Article, Language, CategoryId, AdSettings } from '../types';
import { CATEGORY_TABS } from '../data/mockNews';
import { translateArticleToEnglish } from '../utils/translator';
import studioOnAirImage from '../assets/images/kcj_radio_onair_1787733125521.jpg';

interface KcjRadioPageProps {
  articles: Article[];
  onBackToJournal?: () => void;
  onSelectArticleDetail?: (art: Article) => void;
  initialArticleId?: string | null;
  initialLang?: Language;
  adSettings?: AdSettings;
}

// Clean raw text into natural spoken broadcast script
function cleanTextForSpeech(text: string, lang: Language): string {
  if (!text) return '';
  return text
    .replace(/[#*_~`>]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\[단독\]/g, lang === 'en' ? 'Exclusive: ' : '단독 보도, ')
    .replace(/\[기획\]/g, lang === 'en' ? 'Special feature: ' : '기획 취재, ')
    .replace(/\[오피니언\]/g, lang === 'en' ? 'Opinion: ' : '오피니언, ')
    .replace(/\[사설\]/g, lang === 'en' ? 'Editorial: ' : '사설, ')
    .replace(/\[칼럼\]/g, lang === 'en' ? 'Column: ' : '칼럼, ')
    .replace(/\[속보\]/g, lang === 'en' ? 'Breaking news: ' : '속보, ')
    .replace(/\[포토\]/g, lang === 'en' ? 'Photo news: ' : '포토 뉴스, ')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^\)]*\)/g, '')
    .replace(/[▲▼━─◆■★●▶◀]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract speech segments from an article
function buildSpeechSegments(
  article: Article,
  language: Language,
  translatedEnBody?: { title: string; subtitle: string; content: string } | null
): string[] {
  const isEn = language === 'en';
  const rawTitle = isEn && (translatedEnBody?.title || article.titleEn) 
    ? (translatedEnBody?.title || article.titleEn!) 
    : article.title;
  
  const rawSubtitle = isEn && (translatedEnBody?.subtitle || article.subtitleEn) 
    ? (translatedEnBody?.subtitle || article.subtitleEn!) 
    : (article.subtitle || '');

  const rawBody = isEn && (translatedEnBody?.content || article.contentEn) 
    ? (translatedEnBody?.content || article.contentEn!) 
    : (article.content || article.summary || '');

  const title = cleanTextForSpeech(rawTitle, language);
  const subtitle = cleanTextForSpeech(rawSubtitle, language);
  const body = cleanTextForSpeech(rawBody, language);

  const segments: string[] = [];
  
  // Headline segment
  if (isEn) {
    segments.push(`Korea Culture Journal KCJ Radio News. Headline: ${title}.`);
    if (subtitle) {
      segments.push(`Key Summary: ${subtitle}.`);
    }
    const reporterName = article.reporter?.name || 'KCJ Newsroom';
    segments.push(`Reporting by ${reporterName}, Korea Culture Journal.`);
  } else {
    segments.push(`한국문화저널 KCJ Radio 문화 헤드라인 뉴스입니다. ${title}`);
    if (subtitle) {
      segments.push(`핵심 요약입니다. ${subtitle}`);
    }
    segments.push(`한국문화저널 ${article.reporter.name} 기자의 보도입니다.`);
  }

  // Split body by sentences for conversational broadcaster speech flow
  const rawParagraphs = body
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  rawParagraphs.forEach(para => {
    // Split sentences cleanly
    const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
    if (sentences && sentences.length > 0) {
      sentences.forEach(s => {
        const trimmed = s.trim();
        if (trimmed && trimmed.length > 0) {
          segments.push(trimmed);
        }
      });
    } else if (para) {
      segments.push(para);
    }
  });

  if (isEn) {
    segments.push(`This has been KCJ Radio, Korea Culture Journal's international digital broadcast. Thank you for listening.`);
  } else {
    segments.push(`지금까지 한국문화저널 KCJ Radio 디지털 방송이었습니다. 청취해 주셔서 대단히 감사합니다.`);
  }

  return segments;
}

// Generate realistic simulated timetable
function generateTimetable(articles: Article[]) {
  const timeSlots = [
    { time: '07:00 - 08:30', program: 'KCJ 모닝 문화 브리핑 (Morning Briefing)', host: '편집국 앵커' },
    { time: '09:00 - 10:30', program: '오늘의 대한민국 문화재 & 헤리티지 (Heritage Focus)', host: '문화재 전문 데스크' },
    { time: '11:00 - 12:30', program: '글로벌 K-컬처 & 한류 트렌드 (K-Wave Radar)', host: '국제문화부' },
    { time: '13:00 - 14:30', program: '정오의 예술 무대 & 공연 탐방 (Arts & Theater)', host: '공연예술 전문기자' },
    { time: '15:00 - 16:30', program: '지역 문화관광 & 축제 릴레이 (Local Travel Live)', host: '지역문화취재반' },
    { time: '17:00 - 18:30', program: '문화정책 심층 팩트체크 (Policy Deep Dive)', host: '기획취재팀' },
    { time: '19:00 - 20:30', program: 'KCJ 이브닝 문화뉴스 98.5 (Evening Prime)', host: '메인 앵커' },
    { time: '21:00 - 22:30', program: '심야 예술 산책 & 북클럽 (Midnight Books & Art)', host: '문학예술 편집위원' },
    { time: '23:00 - 06:30', program: '24시간 논스톱 K-컬처 디지털 오디오 스트림', host: 'AI 디지털 보이스' }
  ];

  return timeSlots.map((slot, index) => {
    const assignedArticle = articles[index % Math.max(articles.length, 1)];
    return {
      ...slot,
      article: assignedArticle
    };
  });
}

export const KcjRadioPage: React.FC<KcjRadioPageProps> = ({
  articles,
  onBackToJournal,
  onSelectArticleDetail,
  initialArticleId,
  initialLang = 'ko',
  adSettings,
}) => {
  // Navigation / View Tabs: Live Studio, Timetable, Archive, Analytics
  const [activeTab, setActiveTab] = useState<'studio' | 'timetable' | 'archive' | 'analytics'>('studio');
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

  // Listening History / Archive State
  const [listeningHistory, setListeningHistory] = useState<Array<{ article: Article; listenedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('kcj_radio_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Playback & Speech Synthesis State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [repeatCurrent, setRepeatCurrent] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Spoken text segments and current paragraph highlight
  const [speechSegments, setSpeechSegments] = useState<string[]>([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [isTranslatingEn, setIsTranslatingEn] = useState<boolean>(false);
  const [translatedEnBody, setTranslatedEnBody] = useState<{ title: string; subtitle: string; content: string } | null>(null);

  // Playlist search and category filter
  const [playlistCategory, setPlaylistCategory] = useState<string>('all');
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Simulated live listener stats (with subtle live fluctuations)
  const [liveListeners, setLiveListeners] = useState<number>(1428);
  const [todayPlays, setTodayPlays] = useState<number>(42890);

  // Equalizer visualizer wave animation
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(() => 
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 55) + 15)
  );

  // Refs for speech and playback tracking (prevents stale closures)
  const segmentsRef = useRef<string[]>([]);
  const activeIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const volumeRef = useRef<number>(1.0);
  const isMutedRef = useRef<boolean>(false);
  const autoNextRef = useRef<boolean>(true);
  const repeatCurrentRef = useRef<boolean>(false);
  const currentArticleRef = useRef<Article | null>(null);
  const publishedArticlesRef = useRef<Article[]>([]);
  const animationIntervalRef = useRef<any>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Keep refs in sync with state
  useEffect(() => { segmentsRef.current = speechSegments; }, [speechSegments]);
  useEffect(() => { activeIndexRef.current = activeSegmentIndex; }, [activeSegmentIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { repeatCurrentRef.current = repeatCurrent; }, [repeatCurrent]);
  useEffect(() => { currentArticleRef.current = currentArticle; }, [currentArticle]);
  useEffect(() => { publishedArticlesRef.current = publishedArticles; }, [publishedArticles]);

  // Live listeners minor fluctuation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveListeners(prev => Math.max(1200, prev + Math.floor(Math.random() * 7) - 3));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  // Current & Next Program calculation
  const currentArticleIndex = useMemo(() => {
    if (!currentArticle) return -1;
    return publishedArticles.findIndex(a => a.id === currentArticle.id);
  }, [publishedArticles, currentArticle]);

  const nextArticle = useMemo(() => {
    if (publishedArticles.length === 0) return null;
    if (currentArticleIndex === -1) return publishedArticles[0];
    const nextIdx = (currentArticleIndex + 1) % publishedArticles.length;
    return publishedArticles[nextIdx];
  }, [publishedArticles, currentArticleIndex]);

  const prevArticle = useMemo(() => {
    if (publishedArticles.length === 0) return null;
    if (currentArticleIndex === -1) return publishedArticles[publishedArticles.length - 1];
    const prevIdx = (currentArticleIndex - 1 + publishedArticles.length) % publishedArticles.length;
    return publishedArticles[prevIdx];
  }, [publishedArticles, currentArticleIndex]);

  // Save to Listening History
  const addToHistory = useCallback((art: Article) => {
    setListeningHistory(prev => {
      const filtered = prev.filter(item => item.article.id !== art.id);
      const updated = [{ article: art, listenedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }, ...filtered].slice(0, 20);
      try {
        localStorage.setItem('kcj_radio_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

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
          Array.from({ length: 40 }, () => Math.floor(Math.random() * 85) + 15)
        );
      }, 100);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setVisualizerHeights(Array.from({ length: 40 }, () => 12));
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

  // URL query parameter synchronization
  const updateUrlParams = (articleId: string, currentLang: Language) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/kcj-radio';
      url.searchParams.set('article', articleId);
      url.searchParams.set('lang', currentLang);
      window.history.pushState(null, '', url.toString());
    }
  };

  // Robust Speech Player: Plays segment directly using natural conversational broadcaster voices
  const playSegmentDirectly = (
    segmentsList: string[],
    segmentIdx: number,
    targetArticle: Article,
    targetLang: Language
  ) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Ensure previous speech is cancelled and synth is active
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (!segmentsList || segmentIdx >= segmentsList.length) {
      // Finished full article
      handleProgramEnd(targetArticle, targetLang);
      return;
    }

    setActiveSegmentIndex(segmentIdx);
    activeIndexRef.current = segmentIdx;

    const rawText = segmentsList[segmentIdx];
    const textToSpeak = cleanTextForSpeech(rawText, targetLang);
    if (!textToSpeak) {
      // Skip empty segment
      if (segmentIdx + 1 < segmentsList.length) {
        playSegmentDirectly(segmentsList, segmentIdx + 1, targetArticle, targetLang);
      } else {
        handleProgramEnd(targetArticle, targetLang);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Apply voice language, speed, pitch and volume
    utterance.lang = targetLang === 'en' ? 'en-US' : 'ko-KR';
    utterance.rate = speedRef.current;
    utterance.volume = isMutedRef.current ? 0 : volumeRef.current;
    utterance.pitch = 1.0;

    // Pick best matching natural conversational voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (targetLang === 'en') {
        const enVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('en'));
        const naturalVoice = enVoices.find(v => 
          /natural|google|neural|samantha|jenny|guy|aria|david|zira|george/i.test(v.name)
        ) || enVoices.find(v => v.lang.includes('US') || v.lang.includes('GB')) || enVoices[0];
        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }
      } else {
        const koVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('ko'));
        const naturalVoice = koVoices.find(v => 
          /natural|google|neural|heami|sunhi|yuna|seoyeon/i.test(v.name)
        ) || koVoices[0];
        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }
      }
    }

    utterance.onend = () => {
      // Advance to next segment
      if (segmentIdx + 1 < segmentsList.length) {
        playSegmentDirectly(segmentsList, segmentIdx + 1, targetArticle, targetLang);
      } else {
        handleProgramEnd(targetArticle, targetLang);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis segment event:', e);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  // Handle program completion (Auto-Next or Repeat)
  const handleProgramEnd = (finishedArticle: Article, currentLang: Language) => {
    setIsPlaying(false);
    setIsPaused(false);
    setTodayPlays(prev => prev + 1);

    if (repeatCurrentRef.current) {
      // Repeat same article
      setTimeout(() => {
        const segs = buildSpeechSegments(finishedArticle, currentLang, translatedEnBody);
        setSpeechSegments(segs);
        playSegmentDirectly(segs, 0, finishedArticle, currentLang);
      }, 700);
      return;
    }

    if (autoNextRef.current && publishedArticlesRef.current.length > 0) {
      // Move to Next Article in list
      const allArticles = publishedArticlesRef.current;
      const curIdx = allArticles.findIndex(a => a.id === finishedArticle.id);
      const nextIdx = (curIdx + 1) % allArticles.length;
      const nextArt = allArticles[nextIdx];

      if (nextArt) {
        setTimeout(() => {
          handleSelectArticle(nextArt, true, 0, currentLang);
        }, 900);
      }
    }
  };

  // Master handler for selecting and playing an article
  const handleSelectArticle = (
    article: Article, 
    autoPlay = true, 
    startSegment = 0, 
    targetLangOverride?: Language
  ) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    const activeLanguage = targetLangOverride || lang;

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentArticle(article);
    setActiveSegmentIndex(startSegment);
    addToHistory(article);
    updateUrlParams(article.id, activeLanguage);

    // If English translation is required and not present
    if (activeLanguage === 'en' && !article.contentEn) {
      setIsTranslatingEn(true);
      translateArticleToEnglish({
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        content: article.content || article.summary || '',
        categoryLabel: article.categoryLabel,
      }).then(res => {
        setIsTranslatingEn(false);
        const transData = {
          title: res.title || article.title,
          subtitle: res.subtitle || '',
          content: res.content || article.content,
        };
        setTranslatedEnBody(transData);
        const segs = buildSpeechSegments(article, 'en', transData);
        setSpeechSegments(segs);
        if (autoPlay) {
          playSegmentDirectly(segs, startSegment, article, 'en');
        }
      }).catch(() => {
        setIsTranslatingEn(false);
        const segs = buildSpeechSegments(article, 'en', null);
        setSpeechSegments(segs);
        if (autoPlay) {
          playSegmentDirectly(segs, startSegment, article, 'en');
        }
      });
      return;
    }

    // Build segments synchronously
    const segs = buildSpeechSegments(article, activeLanguage, translatedEnBody);
    setSpeechSegments(segs);

    if (autoPlay) {
      // Small timeout to allow state registration
      setTimeout(() => {
        playSegmentDirectly(segs, startSegment, article, activeLanguage);
      }, 100);
    }
  };

  // Initial segment preparation
  useEffect(() => {
    if (currentArticle) {
      const segs = buildSpeechSegments(currentArticle, lang, translatedEnBody);
      setSpeechSegments(segs);
    }
  }, [currentArticle, lang]);

  // Master Play / Pause toggle
  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (!currentArticle) {
      if (publishedArticles.length > 0) {
        handleSelectArticle(publishedArticles[0], true);
      }
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      const segs = speechSegments.length > 0 
        ? speechSegments 
        : buildSpeechSegments(currentArticle, lang, translatedEnBody);
      setSpeechSegments(segs);
      playSegmentDirectly(segs, activeSegmentIndex, currentArticle, lang);
    }
  };

  // Stop button
  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSegmentIndex(0);
  };

  // Replay from beginning
  const handleReplay = () => {
    handleStop();
    if (currentArticle) {
      setTimeout(() => {
        handleSelectArticle(currentArticle, true, 0);
      }, 200);
    }
  };

  // Previous program
  const handlePreviousProgram = () => {
    if (prevArticle) {
      handleSelectArticle(prevArticle, true, 0);
    }
  };

  // Next program
  const handleNextProgram = () => {
    if (nextArticle) {
      handleSelectArticle(nextArticle, true, 0);
    }
  };

  // Change playback speed (0.8x, 1.0x, 1.2x, 1.5x, 2.0x)
  const handleChangeSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    speedRef.current = newSpeed;

    // If currently speaking, re-speak current segment immediately with the new rate
    if (isPlaying && !isPaused && currentArticle && speechSegments.length > 0) {
      playSegmentDirectly(speechSegments, activeSegmentIndex, currentArticle, lang);
    }
  };

  // Change volume
  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    volumeRef.current = newVol;
    setIsMuted(false);
    isMutedRef.current = false;

    // Re-apply if speaking
    if (isPlaying && !isPaused && currentArticle && speechSegments.length > 0) {
      playSegmentDirectly(speechSegments, activeSegmentIndex, currentArticle, lang);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (isPlaying && !isPaused && currentArticle && speechSegments.length > 0) {
      playSegmentDirectly(speechSegments, activeSegmentIndex, currentArticle, lang);
    }
  };

  // Language switch
  const handleToggleLanguage = (targetLang: Language) => {
    if (lang === targetLang) return;
    handleStop();
    setLang(targetLang);
    if (currentArticle) {
      handleSelectArticle(currentArticle, isPlaying, 0, targetLang);
    }
  };

  // Share link copy
  const handleShareRadio = () => {
    if (!currentArticle) return;
    const shareUrl = `${window.location.origin}/kcj-radio?article=${currentArticle.id}&lang=${lang}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const displayTitle = lang === 'en' && (translatedEnBody?.title || currentArticle?.titleEn) 
    ? (translatedEnBody?.title || currentArticle?.titleEn) 
    : currentArticle?.title;

  const displaySubtitle = lang === 'en' && (translatedEnBody?.subtitle || currentArticle?.subtitleEn)
    ? (translatedEnBody?.subtitle || currentArticle?.subtitleEn)
    : currentArticle?.subtitle;

  const nextDisplayTitle = nextArticle 
    ? (lang === 'en' && nextArticle.titleEn ? nextArticle.titleEn : nextArticle.title)
    : '다음 편성 대기 중';

  const timetableItems = useMemo(() => generateTimetable(publishedArticles), [publishedArticles]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans pb-16 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Global Station Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-8 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          
          {/* Brand Identity & Live Studio Indicator */}
          <div className="flex items-center gap-3">
            {onBackToJournal && (
              <button
                onClick={onBackToJournal}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1.5 text-xs font-bold transition-all mr-1"
                title="메인 뉴스룸으로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">뉴스룸 홈</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-red-600 flex items-center justify-center text-slate-950 shadow-lg ring-2 ring-amber-400/40">
                <Radio className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-base sm:text-lg font-black font-serif-kr text-white tracking-wide">
                    KCJ RADIO 98.5
                  </h1>
                  {/* ON AIR Live Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 text-[11px] font-black tracking-wider shadow-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span>ON AIR</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                  한국문화저널 디지털 라디오 방송국 · 24시간 실시간 K-컬처 오디오 스트림
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Listeners & Station Quick Stats */}
          <div className="hidden md:flex items-center gap-4 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">실시간 청취자:</span>
              <span className="font-mono font-bold text-amber-300">{liveListeners.toLocaleString()}명</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400">금일 송출:</span>
              <span className="font-mono font-bold text-emerald-300">{todayPlays.toLocaleString()}회</span>
            </div>
          </div>

          {/* Right: Broadcast Mode Switcher & Language Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* KO / EN Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => handleToggleLanguage('ko')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === 'ko'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => handleToggleLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Share Broadcast Link */}
            <button
              onClick={handleShareRadio}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95"
              title="현재 라디오 방송 공유 링크 복사"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline text-emerald-400">복사완료</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">공유</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Top Station Navigation Bar (Live Studio / Timetable / Archive / Analytics) */}
      <div className="bg-[#0b101e] border-b border-slate-800/80 px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>🎙 라이브 방송 스튜디오 (Live On-Air)</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'timetable'
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>📅 정규 편성표 & 예약 (Timetable)</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'archive'
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>🗄️ 방송 아카이브 · 다시듣기 ({listeningHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>📊 청취자 통계 & 방송 리포트</span>
            </button>
          </div>

          {/* Current vs Next Ticker */}
          <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              NEXT:
            </span>
            <span className="text-slate-300 max-w-[240px] truncate font-serif-kr">
              {nextDisplayTitle}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-12 flex-1 w-full space-y-6">
        
        {/* Tab 1: Live Radio Studio */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 Cols): Master Radio Player Deck with FIXED ON-AIR STUDIO PHOTO */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="bg-gradient-to-b from-[#101726] to-[#0c111e] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Player Top Meta Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-serif-kr font-bold text-[11px]">
                      {currentArticle?.categoryLabel || '문화종합'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {currentArticle?.publishedAt ? `송고일시 ${currentArticle.publishedAt}` : '정규 편성'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 text-[11px]">
                      {currentArticle?.reporter.name} 기자
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span>320kbps AI Natural Voice</span>
                  </div>
                </div>

                {/* (1) USER REQUEST: FIXED MAIN STAGE STUDIO MICROPHONE / ON-AIR PHOTO (No individual article photos here) */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-16/9 shadow-2xl group">
                  <img
                    src={studioOnAirImage}
                    alt="KCJ Radio On-Air Main Studio"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  
                  {/* Cinematic Dark Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />

                  {/* Top Left: KCJ On-Air Studio LED Sign */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/40 shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping" />
                    <span className="text-red-400 font-mono font-black text-xs tracking-wider">
                      STUDIO ON-AIR · 98.5 MHz
                    </span>
                  </div>

                  {/* Bottom Studio Broadcast Overlay Caption */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Mic2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate font-serif-kr font-bold text-white text-xs sm:text-sm">
                        {displayTitle}
                      </span>
                    </div>
                    {onSelectArticleDetail && currentArticle && (
                      <button
                        onClick={() => onSelectArticleDetail(currentArticle)}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold flex items-center gap-1 text-[11px] transition-all"
                      >
                        <span>기사 원문</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Broadcast Program Titles (현재 방송 & 다음 방송) */}
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
                  {/* Current Program */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>[현재 방송 중]</span>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif-kr text-white leading-snug tracking-tight">
                      {displayTitle}
                    </h2>
                    {displaySubtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 font-serif-kr leading-relaxed border-l-2 border-amber-500 pl-3 py-0.5 mt-1">
                        {displaySubtitle}
                      </p>
                    )}
                  </div>

                  {/* Next Up Program Banner */}
                  {nextArticle && (
                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] shrink-0">
                          다음 방송 예고
                        </span>
                        <span className="truncate text-slate-300 font-serif-kr">
                          {nextDisplayTitle}
                        </span>
                      </div>
                      <button
                        onClick={handleNextProgram}
                        className="shrink-0 text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 ml-2"
                      >
                        <span>바로 듣기</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* CSS Audio Waveform Visualizer (Frequency Bars) */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${isPlaying && !isPaused ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                      <span>{isPlaying ? (isPaused ? 'AUDIO PAUSED' : 'AUDIO BROADCASTING') : 'AUDIO STANDBY'}</span>
                    </span>
                    <span>FREQUENCY EQ · {lang === 'en' ? 'EN-US VOICE' : 'KO-KR NATIVE'}</span>
                  </div>

                  {/* Dynamic Equalizer Bars */}
                  <div className="h-14 flex items-end justify-between gap-1 px-1 py-1">
                    {visualizerHeights.map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-t-xs transition-all duration-100 ${
                          isPlaying && !isPaused
                            ? i % 4 === 0 
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                              : i % 3 === 0 
                              ? 'bg-red-500' 
                              : 'bg-indigo-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Master Playback Controls (Previous, Play/Pause, Stop, Replay, Next) */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    
                    {/* Controls: ◀ Previous, Play, Pause, Stop, Replay, ▶ Next */}
                    <div className="flex items-center gap-2">
                      {/* ◀ Previous */}
                      <button
                        onClick={handlePreviousProgram}
                        className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow-md flex items-center gap-1 text-xs font-bold active:scale-95"
                        title="이전 방송 프로그램"
                      >
                        <SkipBack className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">이전 방송</span>
                      </button>

                      {/* Play / Pause Main Button */}
                      <button
                        onClick={handleTogglePlay}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black flex items-center gap-2 transition-all shadow-xl hover:shadow-amber-500/20 active:scale-95 text-sm"
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

                      {/* Stop */}
                      <button
                        onClick={handleStop}
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                        title="방송 정지"
                      >
                        <Square className="w-4 h-4 fill-current" />
                      </button>

                      {/* Replay */}
                      <button
                        onClick={handleReplay}
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                        title="처음부터 다시 듣기"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* ▶ Next */}
                      <button
                        onClick={handleNextProgram}
                        className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow-md flex items-center gap-1 text-xs font-bold active:scale-95"
                        title="다음 방송 프로그램"
                      >
                        <span className="hidden sm:inline">다음 방송</span>
                        <SkipForward className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>

                    {/* (4) Speed Selector (0.8x, 1.0x, 1.2x, 1.5x, 2.0x) */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                      <span className="text-slate-500 text-[10px] px-1 font-bold">배속</span>
                      {[0.8, 1.0, 1.2, 1.5, 2.0].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleChangeSpeed(spd)}
                          className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                            playbackSpeed === spd
                              ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Audio Controls (Auto-Next, Repeat, Volume Control) */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* (3) Auto-Next Toggle */}
                      <button
                        onClick={() => setAutoNext(!autoNext)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          autoNext
                            ? 'bg-indigo-950/90 border-indigo-600 text-indigo-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="기사 낭독이 끝나면 다음 기사로 자동 전환합니다"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>방송 종료 후 자동 다음 기사: {autoNext ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* Repeat Toggle */}
                      <button
                        onClick={() => setRepeatCurrent(!repeatCurrent)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          repeatCurrent
                            ? 'bg-amber-950/90 border-amber-600 text-amber-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="현재 기사만 무한 반복 청취합니다"
                      >
                        <Repeat className="w-3.5 h-3.5 text-amber-400" />
                        <span>한 프로그램 반복: {repeatCurrent ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    {/* (4) Volume Slider & Mute */}
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <button
                        onClick={handleToggleMute}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title={isMuted ? '음소거 해제' : '음소거'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleChangeVolume(parseFloat(e.target.value))}
                        className="w-20 sm:w-24 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        title={`볼륨: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                      />
                      <span className="font-mono text-[10px] text-slate-400 min-w-[28px] text-right">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Subtitle & Transcript Display */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
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
                        onClick={() => {
                          if (currentArticle) {
                            handleSelectArticle(currentArticle, true, idx);
                          }
                        }}
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

            {/* Right Column (5 Cols): Scheduled Playlist (편성 대기열) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                
                {/* Playlist Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-serif-kr font-bold text-white text-base">
                        KCJ Radio 실시간 편성 대기열
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        클릭 시 해당 기사를 즉시 온에어 방송으로 송출합니다
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                    총 {publishedArticles.length}편 편성
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

                {/* (2) Playlist Program Cards: Click to play immediately */}
                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredPlaylist.map((art, idx) => {
                    const isCurrent = currentArticle?.id === art.id;
                    const cardTitle = lang === 'en' && art.titleEn ? art.titleEn : art.title;

                    return (
                      <div
                        key={art.id}
                        onClick={() => handleSelectArticle(art, true, 0)}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-r from-amber-500/20 via-slate-800/80 to-slate-900 border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
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
                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                              {/* Mini Animated Equalizer */}
                              <div className="flex items-end gap-1 h-5">
                                <span className="w-1 bg-amber-400 rounded-xs animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 bg-amber-300 rounded-xs animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 bg-amber-400 rounded-xs animate-bounce" style={{ animationDelay: '300ms' }} />
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectArticle(art, true, 0);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                                  : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isCurrent && isPlaying ? '청취 중' : '방송 듣기'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPlaylist.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      검색 조건에 맞는 편성 프로그램이 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Radio Sidebar Sponsor Banner / Ad Slot (Requirement 5) */}
              {adSettings?.radioSidebar ? (
                <div 
                  id="radio-sidebar-ad-slot"
                  className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 p-4 shadow-xl text-center"
                  dangerouslySetInnerHTML={{ __html: adSettings.radioSidebar }}
                />
              ) : (
                <div 
                  id="radio-sidebar-ad-slot"
                  className="rounded-3xl overflow-hidden border border-slate-800/90 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900 p-5 text-center space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-amber-400 tracking-wider">🎙 KCJ RADIO SPONSORED</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">공식 후원사 배너</span>
                  </div>
                  <div className="py-2 space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                      2026 K-Heritage Media Partner
                    </span>
                    <h4 className="text-amber-200 font-bold text-sm font-serif-kr">
                      대한민국 문화예술 & 국악 오케스트라 후원
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      한국문화저널 KCJ Radio와 함께하는 전통 문화 콘텐츠 디지털 보존 및 글로벌 송출 프로젝트
                    </p>
                  </div>
                  <div className="pt-1">
                    <a
                      href="mailto:soobakmu@naver.com?subject=[KCJ%20Radio%20광고%20및%20방송후원%20문의]"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>KCJ Radio 광고·방송 후원 문의</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Timetable (정규 편성표 & 예약 시간) */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif-kr text-white">
                      KCJ Radio 24시간 정규 방송 편성표
                    </h2>
                    <p className="text-xs text-slate-400">
                      한국문화저널 매일 정규 송출 타임라인 및 시간대별 심층 문화 프로그램
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>현재 시각: {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Timetable Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timetableItems.map((slot, idx) => {
                  const isCurrent = slot.article && currentArticle?.id === slot.article.id;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                        isCurrent
                          ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-amber-400/80 shadow-xl'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                          {slot.time}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          진행: {slot.host}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif-kr font-bold text-white text-sm">
                          {slot.program}
                        </h4>
                        {slot.article && (
                          <p className="text-xs text-slate-400 line-clamp-2 font-serif-kr">
                            주요 기사: {slot.article.title}
                          </p>
                        )}
                      </div>

                      {slot.article && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {slot.article.categoryLabel}
                          </span>
                          <button
                            onClick={() => {
                              handleSelectArticle(slot.article!, true, 0);
                              setActiveTab('studio');
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>지금 청취</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Broadcast Archive (방송 아카이브 · 다시듣기) */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif-kr text-white">
                      KCJ Radio 방송 아카이브 & 청취 히스토리
                    </h2>
                    <p className="text-xs text-slate-400">
                      최근 송출된 문화 방송 녹음 기록 및 언제든 다시 들을 수 있는 디지털 보관소
                    </p>
                  </div>
                </div>

                {listeningHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setListeningHistory([]);
                      localStorage.removeItem('kcj_radio_history');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    기록 전체 삭제
                  </button>
                )}
              </div>

              {listeningHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listeningHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                        <img
                          src={item.article.imageUrl}
                          alt={item.article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="text-amber-400 font-bold">{item.article.categoryLabel}</span>
                          <span>·</span>
                          <span>청취시각 {item.listenedAt}</span>
                        </div>
                        <h4 className="text-xs font-serif-kr font-bold text-white truncate">
                          {item.article.title}
                        </h4>
                        <button
                          onClick={() => {
                            handleSelectArticle(item.article, true, 0);
                            setActiveTab('studio');
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>다시 듣기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <Headphones className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-serif-kr">아직 청취한 방송 기록이 없습니다.</p>
                  <p className="text-xs">라이브 스튜디오에서 기사를 청취하시면 여기에 자동으로 아카이브됩니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Listener Analytics & Statistics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif-kr text-white">
                      KCJ Radio 실시간 청취자 통계 & 분석 리포트
                    </h2>
                    <p className="text-xs text-slate-400">
                      실시간 동시 접속자 수, 채널 청취 점유율, 일간 누적 통계
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>실시간 동시 접속 청취자</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                    {liveListeners.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400 ml-1">명</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span>▲ 전시간 대비 14.8% 증가</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>오늘의 누적 송출 횟수</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                    {todayPlays.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400 ml-1">회</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    금일 00:00 기준 집계
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>디지털 스트림 품질</span>
                    <Headphones className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-300">
                    320
                    <span className="text-xs font-normal text-slate-400 ml-1">kbps HQ</span>
                  </div>
                  <p className="text-[10px] text-indigo-400">
                    무손실 Web Audio 파이프라인
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>전체 방송 편성 기사</span>
                    <ListMusic className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">
                    {publishedArticles.length}
                    <span className="text-xs font-normal text-slate-400 ml-1">편</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    실시간 자동 수집 동기화
                  </p>
                </div>
              </div>

              {/* Popular Broadcast Programs Ranking */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif-kr font-bold text-white text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>금주 가장 많이 청취된 KCJ Radio TOP 5 방송</span>
                </h3>
                <div className="space-y-2">
                  {publishedArticles.slice(0, 5).map((art, idx) => (
                    <div
                      key={art.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold ${
                          idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-serif-kr font-bold text-white truncate">
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">{art.categoryLabel} · {art.reporter.name} 기자</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleSelectArticle(art, true, 0);
                          setActiveTab('studio');
                        }}
                        className="shrink-0 px-3 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold rounded-lg transition-all"
                      >
                        청취
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 4. Station Footer Bar */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 px-4 lg:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-serif-kr font-bold text-slate-300">
              한국문화저널 KCJ Radio 98.5 디지털 방송국
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
