// Persistent Storage Utility for articles, reporters, cultural events, auth user, ad settings, issue clusters, and RSS feeds
import { Article, Reporter, CulturalEvent, AuthUser, AdSettings, IssueCluster, RssFeedSource, AutoCollectedItem, PopupConfig, DualPopupsConfig, McstRssItem } from '../types';
import { INITIAL_ARTICLES, REPORTERS_DATA, CULTURAL_EVENTS, ISSUE_CLUSTERS } from '../data/mockNews';

const STORAGE_KEYS = {
  ARTICLES_CURRENT: 'kculture_articles_v4_master',
  ARTICLES_LEGACY: 'kculture_articles_v3_secure',
  ARTICLES_BACKUP: 'kculture_user_created_articles_backup',
  REPORTERS: 'kculture_reporters_v3_secure',
  EVENTS: 'kculture_events_v3_secure',
  AUTH_USER: 'kculture_auth_user_v3',
  BOOKMARKS: 'kculture_bookmarks_v3',
  GAS_WEBHOOK_URL: 'kculture_gas_webhook_url_v3',
  AD_SETTINGS: 'kculture_ad_settings_v1',
  ISSUE_CLUSTERS: 'kculture_issue_clusters_v1',
  RSS_SOURCES: 'kculture_rss_sources_v1',
  RSS_ITEMS: 'kculture_rss_collected_items_v1',
  POPUP_CONFIG: 'kculture_popup_config_v1',
  DUAL_POPUPS_CONFIG: 'kculture_dual_popups_config_v1',
  MCST_RSS_ITEMS: 'kculture_mcst_rss_items_v1',
};


export const DEFAULT_AD_SETTINGS: AdSettings = {
  belowSubtitle: `<div style="width:100%;min-height:120px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;background:#f5f5f5;font-size:20px;color:#333;font-weight:bold;">
한국문화저널 광고 테스트
</div>`,
  inBody: '',
  afterBody: '',
  sidebarTop: '',
  sidebarBottom: '',
  radioSidebar: '',
  belowSubtitleEnabled: true,
};

export const DEFAULT_POPUP_CONFIG_1: PopupConfig = {
  id: 'popup-001',
  name: '한국문화저널 1번 팝업 (메인/전체)',
  enabled: false,
  pageScope: 'all',
  position: 'TOP_RIGHT',
  width: 340,
  height: 420,
  imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  text: '조선 왕실 100대 전통공예 디지털 아카이브 전 세계 무료 공개 특별전 안내',
  linkUrl: 'https://www.mcst.go.kr',
  openNewTab: true,
  zIndex: 9999,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_POPUP_CONFIG_2: PopupConfig = {
  id: 'popup-002',
  name: '한국문화저널 2번 팝업 (서브/상세)',
  enabled: false,
  pageScope: 'all',
  position: 'TOP_LEFT',
  width: 320,
  height: 380,
  imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  text: '2026 K-헤리티지 & 글로벌 문화교류 포럼 온라인 사전 참가신청 접수 중',
  linkUrl: 'https://www.mcst.go.kr',
  openNewTab: true,
  zIndex: 9998,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_DUAL_POPUPS_CONFIG: DualPopupsConfig = {
  popup1: DEFAULT_POPUP_CONFIG_1,
  popup2: DEFAULT_POPUP_CONFIG_2,
};

export const DEFAULT_POPUP_CONFIG: PopupConfig = DEFAULT_POPUP_CONFIG_1;

// Load saved articles with smart fallback (Firestore is the Source of Truth)
export function loadPersistedArticles(): Article[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES_CURRENT);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load articles cache from localStorage:', e);
  }

  return INITIAL_ARTICLES;
}

// Helper to sanitize an article for lightweight localStorage cache (< 1KB per article)
function sanitizeArticleForCache(art: Article): Article {
  return {
    ...art,
    // Store only summary or first 300 characters of content to guarantee < 100KB total cache
    content: art.summary ? art.summary : (art.content && art.content.length > 300 ? art.content.slice(0, 300) + '...' : (art.content || '')),
    contentEn: art.contentEn && art.contentEn.length > 200 ? art.contentEn.slice(0, 200) + '...' : (art.contentEn || ''),
  };
}

// Save articles safely in client-side cache with strict quota management (Firestore is Source of Truth)
export function savePersistedArticles(articles: Article[]): void {
  if (!Array.isArray(articles)) return;

  // 1. Proactively purge old redundant legacy & backup keys to free browser quota
  try {
    localStorage.removeItem(STORAGE_KEYS.ARTICLES_LEGACY);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES_BACKUP);
    localStorage.removeItem('kculture_articles_v2');
    localStorage.removeItem('kculture_articles_v1');
    localStorage.removeItem('kculture_articles_master');
  } catch {}

  // 2. Cache only the top 50 recent articles with truncated content to stay well under quota (e.g. ~50KB total)
  try {
    const cacheSlice = articles.slice(0, 50).map(sanitizeArticleForCache);
    const jsonStr = JSON.stringify(cacheSlice);
    localStorage.setItem(STORAGE_KEYS.ARTICLES_CURRENT, jsonStr);
  } catch (e) {
    // If quota is still somehow tight, reduce to 15 articles
    try {
      const minimalSlice = articles.slice(0, 15).map(sanitizeArticleForCache);
      localStorage.setItem(STORAGE_KEYS.ARTICLES_CURRENT, JSON.stringify(minimalSlice));
    } catch {
      // In extreme cases, clear the local cache key entirely without interrupting execution
      try {
        localStorage.removeItem(STORAGE_KEYS.ARTICLES_CURRENT);
      } catch {}
    }
  }

  // 3. Background server upsert sync
  try {
    fetch('/api/articles/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles }),
    }).catch(() => {});
  } catch {}
}

// Load saved ad settings
export function loadPersistedAdSettings(): AdSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AD_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        belowSubtitle: parsed.belowSubtitle || '',
        inBody: parsed.inBody || '',
        afterBody: parsed.afterBody || '',
        sidebarTop: parsed.sidebarTop || '',
        sidebarBottom: parsed.sidebarBottom || '',
        radioSidebar: parsed.radioSidebar || '',
        belowSubtitleEnabled: parsed.belowSubtitleEnabled !== false,
      };
    }
  } catch (e) {
    console.warn('Failed to load ad settings:', e);
  }
  return DEFAULT_AD_SETTINGS;
}

// Save ad settings permanently
export function savePersistedAdSettings(settings: AdSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(settings));
    fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ads: settings }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save ad settings:', e);
  }
}

// Load saved reporters
export function loadPersistedReporters(): Reporter[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load reporters from storage:', e);
  }
  return REPORTERS_DATA;
}

// Save reporters permanently
export function savePersistedReporters(reporters: Reporter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTERS, JSON.stringify(reporters));
  } catch (e) {
    console.error('Failed to save reporters:', e);
  }
}

// Load saved cultural events
export function loadPersistedEvents(): CulturalEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load events from storage:', e);
  }
  return CULTURAL_EVENTS;
}

// Save cultural events permanently
export function savePersistedEvents(events: CulturalEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events:', e);
  }
}

// Load saved user session
export function loadPersistedUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load user:', e);
  }
  return null;
}

// Save user session
export function savePersistedUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

// Google Apps Script Webhook URL for Google Spreadsheet & MailApp
export function getGasWebhookUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.GAS_WEBHOOK_URL) || '';
  } catch {
    return '';
  }
}

export function setGasWebhookUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAS_WEBHOOK_URL, url);
  } catch {}
}

// Issue Clusters Storage
export function loadPersistedIssueClusters(): IssueCluster[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ISSUE_CLUSTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load issue clusters from storage:', e);
  }
  return ISSUE_CLUSTERS;
}

export function savePersistedIssueClusters(clusters: IssueCluster[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ISSUE_CLUSTERS, JSON.stringify(clusters));
  } catch (e) {
    console.error('Failed to save issue clusters:', e);
  }
}

// Default RSS Sources (국내외 문화 기관 및 주요 미디어)
export const DEFAULT_RSS_SOURCES: RssFeedSource[] = [
  {
    id: 'rss-kr-mcst',
    name: '문화체육관광부 보도자료',
    country: '대한민국',
    rssUrl: 'https://www.mcst.go.kr/kor/s_notice/press/pressRss.jsp',
    category: '문화정책·행정',
    language: 'ko',
    interval: '1h',
    isActive: true,
    lastFetchedAt: '15분 전',
    status: 'HEALTHY',
    itemsCount: 14,
    description: '문체부 주관 문화예술 진흥 및 K-콘텐츠 글로벌 정책 속보',
  },
  {
    id: 'rss-kr-khs',
    name: '국가유산청 국가유산포털',
    country: '대한민국',
    rssUrl: 'https://www.khs.go.kr/rss/news/newsList.xml',
    category: '국가유산·발굴',
    language: 'ko',
    interval: '3h',
    isActive: true,
    lastFetchedAt: '32분 전',
    status: 'HEALTHY',
    itemsCount: 9,
    description: '국보·보물 지정, 문화유산 보존 및 고고학 유적 발굴 공식 브리핑',
  },
  {
    id: 'rss-kr-museum',
    name: '국립중앙박물관 기획소식',
    country: '대한민국',
    rssUrl: 'https://www.museum.go.kr/site/main/rss/news',
    category: '박물관·전시',
    language: 'ko',
    interval: '6h',
    isActive: true,
    lastFetchedAt: '1시간 전',
    status: 'HEALTHY',
    itemsCount: 6,
    description: '특별전시, 해외 박물관 교류전 및 한국 고미술 소장품 공개 리포트',
  },
  {
    id: 'rss-unesco-wh',
    name: 'UNESCO World Heritage Centre',
    country: '글로벌',
    rssUrl: 'https://whc.unesco.org/en/news/rss',
    category: '세계유산·보존',
    language: 'en',
    interval: '12h',
    isActive: true,
    lastFetchedAt: '2시간 전',
    status: 'HEALTHY',
    itemsCount: 8,
    description: '유네스코 인류무형문화유산 및 세계기록유산 위원회 국제 동향',
  },
  {
    id: 'rss-the-art-newspaper',
    name: 'The Art Newspaper Global',
    country: '영국/미국',
    rssUrl: 'https://www.theartnewspaper.com/rss.xml',
    category: '국제미술·비평',
    language: 'en',
    interval: '3h',
    isActive: true,
    lastFetchedAt: '45분 전',
    status: 'HEALTHY',
    itemsCount: 12,
    description: '세계 유수 옥션, 비엔날레 및 국제 미술관 주요 트렌드 속보',
  },
  {
    id: 'rss-louvre-news',
    name: 'Musée du Louvre News',
    country: '프랑스',
    rssUrl: 'https://www.louvre.fr/en/rss/news',
    category: '해외박물관',
    language: 'fr',
    interval: '24h',
    isActive: true,
    lastFetchedAt: '3시간 전',
    status: 'HEALTHY',
    itemsCount: 5,
    description: '루브르 박물관 및 유럽 문화재 복원 학술 프로젝트 소식',
  },
];

// Initial Mock Auto-Collected RSS Items
export const INITIAL_COLLECTED_ITEMS: AutoCollectedItem[] = [
  {
    id: 'rss-item-1',
    sourceId: 'rss-kr-mcst',
    sourceName: '문화체육관광부 보도자료',
    sourceUrl: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21045',
    guid: 'mcst-20260821-21045',
    originalTitle: '문체부, 2026 한국 전통공예 디지털 아카이브 전 세계 무료 공개',
    originalContent: '문화체육관광부는 조선 왕실 나전칠기, 분원 백자, 은입사 등 100대 한국 전통공예 기법의 3D 초정밀 디지털 스캔 데이터를 글로벌 오픈소스로 개방한다고 밝혔다...',
    language: 'ko',
    fetchedAt: '15분 전',
    status: 'AI_GENERATED_PENDING_REVIEW',
    generatedArticle: {
      title: '조선 왕실 100대 전통공예 기법, 3D 디지털 아카이브로 세계 최초 전면 개방',
      subtitle: '문체부, 나전칠기·분원백자 초정밀 데이터 공개… 글로벌 크리에이터와 전통 장인 잇는 디지털 실크로드',
      summary: '문화체육관광부가 소멸 위기에 놓인 전통 공예 장인들의 수공 기술을 디지털 3D로 완벽 복원해 전 세계에 무상 공개한다.',
      content: `문화체육관광부가 대한민국 전통 공예의 정수를 보존하고 글로벌 확산을 견인하기 위해 ‘조선 왕실 100대 전통공예 디지털 아카이브’를 전격 개방했다.

이번 프로젝트는 국가무형유산 장인들의 섬세한 손놀림과 도구 제작 기법, 천연 안료 배합비 등을 초정밀 3D 스캐닝과 8K 고화질 영상으로 집대성한 국가적 문화 디지털화 사업이다. 특히 나전칠기의 정교한 자개 패각 세공과 조선 왕실 관요 백자의 비례미가 가상현실(VR) 환경에서도 그대로 구현된다.

문체부 문화정책관은 "우리 선조들의 탁월한 조형 의식과 장인 정신이 전 세계 디자이너와 아티스트들의 새로운 창작 영감이 될 것"이라며 "지속가능한 문화유산 전승을 위해 디지털 복원 기술을 더욱 고도화하겠다"고 밝혔다.`,
      reporterName: 'AI 수집 데스크 (정다은 기자 검토)',
      category: 'heritage',
      tags: ['문화체육관광부', '전통공예', '디지털아카이브', '나전칠기', '조선백자'],
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      imageCaption: '▲ 디지털 3D로 정밀 복원된 조선 백자 및 나전 공예 기술 데이터 (자료제공=문화체육관광부)',
      sourceName: '문화체육관광부 보도자료',
      sourceUrl: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21045',
      originalLanguage: '한국어',
      publishedAt: '2026.08.21. 14:30',
    },
  },
  {
    id: 'rss-item-2',
    sourceId: 'rss-unesco-wh',
    sourceName: 'UNESCO World Heritage Centre',
    sourceUrl: 'https://whc.unesco.org/en/news/2026/08/hanji-nomination',
    guid: 'unesco-20260821-hanji',
    originalTitle: 'UNESCO Advisory Committee evaluates Traditional Korean Paper "Hanji" for Intangible Cultural Heritage List',
    originalContent: 'The UNESCO Intergovernmental Committee for the Safeguarding of the Intangible Cultural Heritage has officially accepted the evaluation file for "Knowledge and craftsmanship of Hanji making in the Republic of Korea" with exemplary commendations on sustainable community engagement...',
    language: 'en',
    fetchedAt: '1시간 전',
    status: 'AI_GENERATED_PENDING_REVIEW',
    generatedArticle: {
      title: '[외신 심층] 유네스코 자문기구, 한국 ‘전통 한지 제조 기술’ 등재 권고 최종 확정',
      subtitle: '천년의 내구성과 친환경 공동체 전승 방식 극찬… 12월 세계무형유산 등재 확실시',
      summary: '유네스코 인류무형문화유산 자문기구가 한국의 한지 제조 기술에 대해 만장일치로 ‘등재 권고’ 판정을 내렸다.',
      content: `프랑스 파리 유네스코 본부에서 열린 제21차 무형유산보호 정부간위원회 산하 평가기구 심사에서 대한민국이 신청한 ‘한지 제작의 전통 지식과 기술’이 최고 등급인 ‘등재(Inscribe)’ 권고를 받았다.

유네스코 평가기구는 심사 보고서에서 "한국의 한지는 닥나무 재배부터 잿물 삶기, 닥뜨기, 도침에 이르는 99번의 수작업 과정 속에 자연과의 조화와 지속가능한 생태 철학이 깃들어 있다"고 평가했다. 이어 "지역 공동체와 한지 장인들이 수 세대에 걸쳐 자발적으로 전승 환경을 가꿔온 점이 모범 사례로 꼽혔다"고 덧붙였다.

이번 권고로 오는 12월 열리는 제21차 본회의에서 한국 한지의 유네스코 인류무형문화유산 정식 등재가 확실시되며, 한국은 총 23건의 세계무형유산을 보유하게 된다.`,
      reporterName: 'AI 글로벌 데스크 (김유라 기자 검토)',
      category: 'heritage',
      tags: ['UNESCO', '한지', '인류무형문화유산', '세계유산', '전통문화'],
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: '▲ 전통 닥나무 껍질을 다듬고 한지를 물질하는 국가무형유산 장인의 손길 (UNESCO 아카이브)',
      sourceName: 'UNESCO World Heritage News',
      sourceUrl: 'https://whc.unesco.org/en/news/2026/08/hanji-nomination',
      originalLanguage: '영어 (English)',
      publishedAt: '2026.08.21. 13:15',
    },
  },
];

// Load and save RSS sources
export function loadPersistedRssSources(): RssFeedSource[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RSS_SOURCES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load RSS sources:', e);
  }
  return DEFAULT_RSS_SOURCES;
}

export function savePersistedRssSources(sources: RssFeedSource[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RSS_SOURCES, JSON.stringify(sources));
  } catch (e) {
    console.error('Failed to save RSS sources:', e);
  }
}

// Load and save RSS collected items
export function loadPersistedRssItems(): AutoCollectedItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RSS_ITEMS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load RSS items:', e);
  }
  return INITIAL_COLLECTED_ITEMS;
}

export function savePersistedRssItems(items: AutoCollectedItem[]): void {
  try {
    const limited = items.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.RSS_ITEMS, JSON.stringify(limited));
  } catch (e) {
    try {
      const minimal = items.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.RSS_ITEMS, JSON.stringify(minimal));
    } catch {}
  }
}

// Load and save Layer Popup configuration (Dual popups support)
export function loadPersistedDualPopupsConfig(): DualPopupsConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DUAL_POPUPS_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && (parsed.popup1 || parsed.popup2)) {
        return {
          popup1: { ...DEFAULT_POPUP_CONFIG_1, ...(parsed.popup1 || {}) },
          popup2: { ...DEFAULT_POPUP_CONFIG_2, ...(parsed.popup2 || {}) },
        };
      }
    }

    // Fallback: check legacy single popup config key
    const singleSaved = localStorage.getItem(STORAGE_KEYS.POPUP_CONFIG);
    if (singleSaved) {
      const parsedSingle = JSON.parse(singleSaved);
      if (parsedSingle && typeof parsedSingle === 'object') {
        return {
          popup1: { ...DEFAULT_POPUP_CONFIG_1, ...parsedSingle },
          popup2: DEFAULT_POPUP_CONFIG_2,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load dual popups config:', e);
  }
  return DEFAULT_DUAL_POPUPS_CONFIG;
}

export function savePersistedDualPopupsConfig(config: DualPopupsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DUAL_POPUPS_CONFIG, JSON.stringify(config));
    // Keep legacy single config in sync
    localStorage.setItem(STORAGE_KEYS.POPUP_CONFIG, JSON.stringify(config.popup1));
    // Sync to server endpoints
    fetch('/api/popups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ popups: config }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save dual popups config:', e);
  }
}

// Backward-compatible single popup helper
export function loadPersistedPopupConfig(): PopupConfig {
  return loadPersistedDualPopupsConfig().popup1;
}

export function savePersistedPopupConfig(config: PopupConfig): void {
  const current = loadPersistedDualPopupsConfig();
  savePersistedDualPopupsConfig({
    ...current,
    popup1: config,
  });
}

// Load and save MCST Official RSS Collected Items
export function loadPersistedMcstRssItems(): McstRssItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MCST_RSS_ITEMS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load MCST RSS items:', e);
  }
  return [];
}

export function savePersistedMcstRssItems(items: McstRssItem[]): void {
  try {
    const limited = items.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.MCST_RSS_ITEMS, JSON.stringify(limited));
  } catch (e) {
    try {
      const minimal = items.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.MCST_RSS_ITEMS, JSON.stringify(minimal));
    } catch {}
  }
}


