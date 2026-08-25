export interface Reporter {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  avatar: string;
  bio: string;
  subscriberCount: number;
  cheerCount: number;
  isSubscribed?: boolean;
  status?: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  joinedDate?: string;
}

export type UserRole = 'GUEST' | 'REPORTER' | 'EDITOR_IN_CHIEF';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  reporterId?: string;
  avatar?: string;
}

export type ArticleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

export type ReactionType = 'info' | 'exciting' | 'empathy' | 'analysis' | 'followup';

export interface ReactionCounts {
  info: number; // 쏠쏠정보
  exciting: number; // 흥미진진
  empathy: number; // 공감백배
  analysis: number; // 분석탁월
  followup: number; // 후속기사원해요
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  author: string;
  authorBadge?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  isBlocked?: boolean;
  replies?: Comment[];
}

export type Language = 'ko' | 'en';

export type CategoryId = 
  | 'all' 
  | 'culture_art' 
  | 'k_culture' 
  | 'heritage' 
  | 'opinion' 
  | 'photo_video'
  | 'global_news'
  | 'un_sdg'
  | 'paper_edition';

export interface CategoryTab {
  id: CategoryId;
  label: string;
  labelEn?: string;
  subcategories: string[];
  order?: number;
  isActive?: boolean;
}

export type SubNewsCategoryId =
  | 'all'
  | 'sports'
  | 'ssireum'
  | 'martial_arts'
  | 'sports_science'
  | 'it'
  | 'ai'
  | 'politics_economy'
  | 'travel'
  | 'education'
  | 'international'
  | 'regional'
  | 'life'
  | 'etc';

export interface SubNewsCategory {
  id: SubNewsCategoryId;
  label: string;
  badgeColor?: string;
  description?: string;
}

export interface Article {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  categoryLabelEn?: string;
  subCategory?: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  summary: string;
  summaryEn?: string;
  content: string;
  contentEn?: string;
  reporter: Reporter;
  publishedAt: string;
  updatedAt?: string;
  views: number;
  shares: number;
  likes: number;
  reactions: ReactionCounts;
  userReaction?: ReactionType;
  imageUrl: string;
  imageCaption?: string;
  imageCaptionEn?: string;
  tags: string[];
  tagsEn?: string[];
  sectionPage?: string; // e.g. "1면 Top", "3면 기획"
  pageNumber?: number; // 1, 2, 3, 4면 등 지면 번호
  isBreaking?: boolean;
  isTopHeadline?: boolean;
  isEditorialPick?: boolean;
  commentsCount: number;
  badge?: '단독' | '기획' | '속보' | '포토' | '해설' | '칼럼' | '인터뷰' | '사설' | '특파원' | '선언' | string;
  badgeEn?: string;
  aiSummary?: string[];
  aiSummaryEn?: string[];
  status?: ArticleStatus; // 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
  rejectionReason?: string;

  // Single DB Dual-Channel Publishing fields
  mainNewsEnabled?: boolean; // 메인 뉴스앱 (한국문화저널) 노출 여부
  subNewsEnabled?: boolean;  // 서브 뉴스앱 (분야별 뉴스 포털) 노출 여부
  subNewsCategory?: SubNewsCategoryId; // 서브 뉴스 분야 카테고리
  canonicalUrl?: string; // Canonical URL for SEO deduplication
  sourceName?: string; // 원문 출처 매체명 (RSS / 취재원)
  sourceUrl?: string;  // 원문 링크 URL
}

export interface CulturalEvent {
  id: string;
  title: string;
  place: string;
  period: string;
  category: '전시' | '공연' | '축제' | '체험' | '고궁야간';
  imageUrl: string;
  dDay: string;
  status: '진행중' | '예매중' | '마감임박';
  linkUrl?: string;
  organizer?: string;
  fee?: string;
  description?: string;
}

export interface IssuePlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: '박물관' | '미술관' | '전시관' | '전승지' | '체험관' | '기관' | '공연장' | '유적지' | string;
  description: string;
  url?: string;
  articleId?: string;
  phone?: string;
  openingHours?: string;
}

export interface IssueCluster {
  id: string;
  keyword: string;
  headline: string;
  subtitle?: string;
  description?: string;
  articleCount: number;
  timeAgo: string;
  places?: IssuePlace[];
  relatedArticleIds?: string[];
  coverImage?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  caption: string;
  photographer: string;
  uploadedAt: string;
  category: string;
  fileSize: string;
}

export interface PaperPage {
  pageNumber: number;
  sectionName?: string;
  title: string;
  subtitle?: string;
  themeColor?: string;
  pdfUrl?: string;
  date: string;
  topArticle?: Article;
  subArticles?: Article[];
  articles?: Article[];
}

export interface AdSettings {
  belowSubtitle: string; // ① 기사 제목 바로 아래 (서브타이틀 하단)
  inBody: string;        // ② 본문 중간 (문단 3~4번째 직후)
  afterBody: string;     // ③ 기사 본문 완료 직후
  sidebarTop: string;    // ④ 우측 사이드바 상단
  sidebarBottom: string; // ⑤ 우측 사이드바 하단
  belowSubtitleEnabled?: boolean; // ① belowSubtitle 활성화 여부
}

// Layer Popup Configuration Types
export type PopupPosition = 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';
export type PopupScopeTarget = 'all' | 'main_home' | 'main_detail' | 'sub_home' | 'sub_detail';

export interface PopupConfig {
  id: string;
  name?: string;
  enabled: boolean;
  pageScope?: PopupScopeTarget;
  position: PopupPosition;
  width: number;
  height: number;
  imageUrl: string;
  text: string;
  linkUrl: string;
  openNewTab?: boolean;
  zIndex?: number;
  updatedAt?: string;
}

export interface DualPopupsConfig {
  popup1: PopupConfig;
  popup2: PopupConfig;
}

// MCST Official RSS Item Type
export interface McstRssItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string;
  source: string;
  fetchedAt: string;
}

// RSS Feed Source & Auto AI Collection Types
export type RssCollectionInterval = '30m' | '1h' | '3h' | '6h' | '12h' | '24h';

export interface RssFeedSource {
  id: string;
  name: string;
  country: string; // '대한민국' | '프랑스' | '미국' | '영국' | '글로벌' 등
  rssUrl: string;
  category: string;
  language: 'ko' | 'en' | 'fr' | 'ja' | string;
  interval: RssCollectionInterval;
  isActive: boolean;
  lastFetchedAt?: string;
  status: 'HEALTHY' | 'ERROR' | 'IDLE';
  itemsCount: number;
  description?: string;
}

export interface AutoGeneratedArticleDraft {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  quotes?: string;
  reporterName: string;
  category: CategoryId;
  tags: string[];
  imageUrl: string;
  imageCaption: string;
  sourceName: string;
  sourceUrl: string;
  originalLanguage: string;
  publishedAt: string;
}

export interface AutoCollectedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  guid: string;
  originalTitle: string;
  originalContent: string;
  language: string;
  fetchedAt: string;
  status: 'AI_GENERATED_PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
  generatedArticle: AutoGeneratedArticleDraft;
}


