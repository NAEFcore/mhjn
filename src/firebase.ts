import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  Firestore
} from 'firebase/firestore';
import { Article, CategoryId, SubNewsCategoryId } from './types';
import { INITIAL_ARTICLES } from './data/mockNews';

// Bundled Firebase project config for Cloud Run, GitHub & Vercel deployment
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "responsible-rock-7t3g1",
  appId: "1:1075971069890:web:be3034d6da225ae56fe85b",
  apiKey: "AIzaSyBc2q_4Pbp6Ai9qobzfAJQJOVHIRxg_IHU",
  authDomain: "responsible-rock-7t3g1.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-iatpc-ffb9e31b-129a-42aa-953b-b8ceceaf87b0",
  storageBucket: "responsible-rock-7t3g1.firebasestorage.app",
  messagingSenderId: "1075971069890"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
let firestoreInstance: Firestore;
try {
  firestoreInstance = firestoreDatabaseId 
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Initializing default database instance fallback:', e);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

/**
 * Converts internal Article object to Firestore document format
 * Strictly enforces user's schema:
 * - articleId
 * - category
 * - koreanTitle
 * - koreanBody
 * - englishTitle
 * - englishBody
 * - createdAt
 * - updatedAt
 * - status
 * + metadata
 */
export function articleToFirestoreDoc(article: Article): Record<string, any> {
  const now = new Date().toISOString();
  return {
    articleId: article.id,
    category: article.category || 'culture_art',
    koreanTitle: article.title || '',
    koreanBody: article.content || article.summary || '',
    englishTitle: article.titleEn || '',
    englishBody: article.contentEn || '',
    createdAt: article.publishedAt || now,
    updatedAt: article.updatedAt || now,
    status: article.status || 'PUBLISHED',
    
    // Additional rich fields for UI & features
    categoryLabel: article.categoryLabel || '문화·예술',
    categoryLabelEn: article.categoryLabelEn || '',
    subCategory: article.subCategory || '',
    subtitle: article.subtitle || '',
    subtitleEn: article.subtitleEn || '',
    summary: article.summary || article.content?.slice(0, 160) || '',
    summaryEn: article.summaryEn || '',
    reporter: article.reporter || {
      id: 'rep-editor',
      name: '편집국',
      title: '편집위원',
      department: '문화부',
      email: 'editor@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: '한국문화저널 편집국',
      subscriberCount: 150,
      cheerCount: 40,
    },
    views: typeof article.views === 'number' ? article.views : 120,
    shares: typeof article.shares === 'number' ? article.shares : 0,
    likes: typeof article.likes === 'number' ? article.likes : 0,
    reactions: article.reactions || { info: 0, exciting: 0, empathy: 0, analysis: 0, followup: 0 },
    imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    imageCaption: article.imageCaption || '',
    imageCaptionEn: article.imageCaptionEn || '',
    tags: Array.isArray(article.tags) ? article.tags : ['한국문화저널'],
    tagsEn: Array.isArray(article.tagsEn) ? article.tagsEn : [],
    sectionPage: article.sectionPage || '1면 Top',
    pageNumber: typeof article.pageNumber === 'number' ? article.pageNumber : 1,
    isBreaking: Boolean(article.isBreaking),
    isTopHeadline: Boolean(article.isTopHeadline),
    isEditorialPick: Boolean(article.isEditorialPick),
    commentsCount: typeof article.commentsCount === 'number' ? article.commentsCount : 0,
    badge: article.badge || '',
    badgeEn: article.badgeEn || '',
    aiSummary: Array.isArray(article.aiSummary) ? article.aiSummary : [],
    aiSummaryEn: Array.isArray(article.aiSummaryEn) ? article.aiSummaryEn : [],
    mainNewsEnabled: article.mainNewsEnabled !== false,
    subNewsEnabled: article.subNewsEnabled !== false,
    subNewsCategory: article.subNewsCategory || 'sports',
    sourceName: article.sourceName || '',
    sourceUrl: article.sourceUrl || '',
  };
}

/**
 * Converts Firestore document to internal Article object
 */
export function firestoreDocToArticle(docData: any, docId: string): Article {
  const articleId = docData.articleId || docId;
  const koreanTitle = docData.koreanTitle || docData.title || '제목 없음';
  const koreanBody = docData.koreanBody || docData.content || '';
  const englishTitle = docData.englishTitle || docData.titleEn || undefined;
  const englishBody = docData.englishBody || docData.contentEn || undefined;
  const createdAt = docData.createdAt || docData.publishedAt || new Date().toISOString();
  const updatedAt = docData.updatedAt || createdAt;
  const status = docData.status || 'PUBLISHED';
  const category = (docData.category || 'culture_art') as CategoryId;

  return {
    id: articleId,
    category,
    categoryLabel: docData.categoryLabel || '문화·예술',
    categoryLabelEn: docData.categoryLabelEn,
    subCategory: docData.subCategory,
    title: koreanTitle,
    titleEn: englishTitle,
    subtitle: docData.subtitle || '',
    subtitleEn: docData.subtitleEn,
    summary: docData.summary || koreanBody.slice(0, 160) || '',
    summaryEn: docData.summaryEn,
    content: koreanBody,
    contentEn: englishBody,
    reporter: docData.reporter || {
      id: 'rep-editor',
      name: '편집국',
      title: '편집위원',
      department: '문화부',
      email: 'editor@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: '한국문화저널 편집국 보도자료 데스크',
      subscriberCount: 150,
      cheerCount: 40,
    },
    publishedAt: createdAt,
    updatedAt: updatedAt,
    views: typeof docData.views === 'number' ? docData.views : 100,
    shares: typeof docData.shares === 'number' ? docData.shares : 0,
    likes: typeof docData.likes === 'number' ? docData.likes : 0,
    reactions: docData.reactions || { info: 0, exciting: 0, empathy: 0, analysis: 0, followup: 0 },
    imageUrl: docData.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    imageCaption: docData.imageCaption || '',
    imageCaptionEn: docData.imageCaptionEn,
    tags: Array.isArray(docData.tags) && docData.tags.length > 0 ? docData.tags : ['한국문화저널'],
    tagsEn: Array.isArray(docData.tagsEn) ? docData.tagsEn : [],
    sectionPage: docData.sectionPage || '1면 Top',
    pageNumber: typeof docData.pageNumber === 'number' ? docData.pageNumber : 1,
    isBreaking: Boolean(docData.isBreaking),
    isTopHeadline: Boolean(docData.isTopHeadline),
    isEditorialPick: Boolean(docData.isEditorialPick),
    commentsCount: typeof docData.commentsCount === 'number' ? docData.commentsCount : 0,
    badge: docData.badge || undefined,
    badgeEn: docData.badgeEn || undefined,
    aiSummary: Array.isArray(docData.aiSummary) ? docData.aiSummary : undefined,
    aiSummaryEn: Array.isArray(docData.aiSummaryEn) ? docData.aiSummaryEn : undefined,
    status: status,
    mainNewsEnabled: docData.mainNewsEnabled !== false,
    subNewsEnabled: docData.subNewsEnabled !== false,
    subNewsCategory: (docData.subNewsCategory || 'sports') as SubNewsCategoryId,
    sourceName: docData.sourceName || undefined,
    sourceUrl: docData.sourceUrl || undefined,
  };
}

/**
 * Fetch all articles from Firestore
 */
export async function fetchArticlesFromFirestore(): Promise<Article[]> {
  try {
    const articlesCol = collection(db, 'articles');
    const snapshot = await getDocs(articlesCol);
    if (snapshot.empty) {
      return [];
    }
    const articles: Article[] = [];
    snapshot.forEach(docSnap => {
      articles.push(firestoreDocToArticle(docSnap.data(), docSnap.id));
    });
    // Sort latest first
    return articles.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to fetch articles from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch a single article by articleId from Firestore
 */
export async function fetchArticleByIdFromFirestore(articleId: string): Promise<Article | null> {
  try {
    const docRef = doc(db, 'articles', articleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return firestoreDocToArticle(docSnap.data(), docSnap.id);
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch article ${articleId} from Firestore:`, error);
    return null;
  }
}

/**
 * Save / Update a single article in Firestore
 */
export async function saveArticleToFirestore(article: Article): Promise<void> {
  try {
    const docRef = doc(db, 'articles', article.id);
    const data = articleToFirestoreDoc(article);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Failed to save article ${article.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete an article from Firestore
 */
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, 'articles', articleId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Failed to delete article ${articleId} from Firestore:`, error);
    throw error;
  }
}

/**
 * Batch save articles to Firestore in safe chunks (max 200 per batch)
 */
export async function saveArticlesBatchToFirestore(
  articles: Article[], 
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: number; failed: number; errors: Array<{ articleId: string; error: string }> }> {
  const CHUNK_SIZE = 100;
  let successCount = 0;
  let failedCount = 0;
  const errors: Array<{ articleId: string; error: string }> = [];

  for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
    const chunk = articles.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    chunk.forEach(art => {
      const docRef = doc(db, 'articles', art.id);
      const data = articleToFirestoreDoc(art);
      batch.set(docRef, data, { merge: true });
    });

    try {
      await batch.commit();
      successCount += chunk.length;
    } catch (err: any) {
      console.error(`Batch commit error at index ${i}:`, err);
      // Try single doc fallback for the failed chunk
      for (const art of chunk) {
        try {
          const docRef = doc(db, 'articles', art.id);
          await setDoc(docRef, articleToFirestoreDoc(art), { merge: true });
          successCount++;
        } catch (singleErr: any) {
          failedCount++;
          errors.push({ articleId: art.id, error: singleErr?.message || 'Unknown error' });
        }
      }
    }

    if (onProgress) {
      onProgress(Math.min(i + CHUNK_SIZE, articles.length), articles.length);
    }

    // Small yield to avoid blocking UI
    await new Promise(resolve => setTimeout(resolve, 20));
  }

  return { success: successCount, failed: failedCount, errors };
}

/**
 * Seed initial articles if Firestore is completely empty on first launch
 */
export async function seedInitialArticlesIfEmpty(): Promise<Article[]> {
  try {
    const existing = await fetchArticlesFromFirestore();
    if (existing.length > 0) {
      return existing;
    }

    console.info('Firestore articles collection is empty. Seeding initial articles...');
    await saveArticlesBatchToFirestore(INITIAL_ARTICLES);
    return INITIAL_ARTICLES;
  } catch (err) {
    console.warn('Error during Firestore initial seed check:', err);
    return INITIAL_ARTICLES;
  }
}

/**
 * Realtime subscriber for Firestore articles
 */
export function subscribeToFirestoreArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (error: Error) => void
): () => void {
  const articlesCol = collection(db, 'articles');
  
  return onSnapshot(articlesCol, (snapshot) => {
    if (snapshot.empty) {
      onUpdate([]);
      return;
    }
    const list: Article[] = [];
    snapshot.forEach(docSnap => {
      list.push(firestoreDocToArticle(docSnap.data(), docSnap.id));
    });
    // Sort latest first
    const sorted = list.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
    onUpdate(sorted);
  }, (err) => {
    console.error('Firestore snapshot listener error:', err);
    if (onError) onError(err);
  });
}
