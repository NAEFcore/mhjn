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
}

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
  author: string;
  authorBadge?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  replies?: Comment[];
}

export type CategoryId = 
  | 'all' 
  | 'culture_art' 
  | 'k_culture' 
  | 'heritage' 
  | 'opinion' 
  | 'photo_video'
  | 'paper_edition';

export interface CategoryTab {
  id: CategoryId;
  label: string;
  subcategories: string[];
}

export interface Article {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  subCategory?: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
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
  tags: string[];
  sectionPage?: string; // e.g. "1면 Top", "3면 기획"
  isBreaking?: boolean;
  isTopHeadline?: boolean;
  isEditorialPick?: boolean;
  commentsCount: number;
  badge?: '단독' | '기획' | '속보' | '포토' | '해설' | '칼럼' | '인터뷰';
  aiSummary?: string[];
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
}

export interface IssueCluster {
  id: string;
  keyword: string;
  headline: string;
  articleCount: number;
  timeAgo: string;
}

export interface PaperPage {
  pageNumber: number;
  title: string;
  sectionName: string;
  date: string;
  articles: Article[];
}
