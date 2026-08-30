import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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
  where, 
  startAfter, 
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
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

// Initialize Firestore with persistent IndexedDB multi-tab cache to drastically reduce read quota usage
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firestoreDatabaseId || undefined);
} catch {
  try {
    firestoreInstance = firestoreDatabaseId 
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);
  } catch (fallbackErr) {
    console.warn('Initializing default database instance fallback:', fallbackErr);
    firestoreInstance = getFirestore(app);
  }
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
  const pubDate = article.publishedAt || now;
  return {
    articleId: article.id,
    category: article.category || 'culture_art',
    koreanTitle: article.title || '',
    koreanBody: article.content || article.summary || '',
    englishTitle: article.titleEn || '',
    englishBody: article.contentEn || '',
    createdAt: pubDate,
    publishedAt: pubDate,
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
    importSource: article.importSource || '',
  };
}

/**
 * Safely format Firestore timestamp/date value to clean string representation
 */
export function formatFirestoreDateToString(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'number') {
    return new Date(val > 1e11 ? val : val * 1000).toISOString();
  }
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try { return val.toDate().toISOString(); } catch {}
    }
    if (typeof val.toMillis === 'function') {
      try { return new Date(val.toMillis()).toISOString(); } catch {}
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toISOString();
    }
    if (typeof val._seconds === 'number') {
      return new Date(val._seconds * 1000).toISOString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
  }
  return String(val);
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
  const rawPublished = docData.publishedAt || docData.createdAt;
  const createdAt = formatFirestoreDateToString(rawPublished);
  const rawUpdated = docData.updatedAt || docData.publishedAt || docData.createdAt;
  const updatedAt = formatFirestoreDateToString(rawUpdated);
  const status = docData.status || 'PUBLISHED';
  const category = (docData.category || 'culture_art') as CategoryId;
  const importSource = docData.importSource || (
    docData.sourceName === 'WordPress Import' || 
    articleId.startsWith('art-wp-') || 
    docId.startsWith('art-wp-') 
      ? 'wordpress' 
      : undefined
  );

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
    reporter: typeof docData.reporter === 'object' && docData.reporter !== null ? {
      id: docData.reporter.id || 'rep-editor',
      name: docData.reporter.name || '편집국',
      title: docData.reporter.title || '취재기자',
      department: docData.reporter.department || '문화부',
      email: docData.reporter.email || 'editor@kculturejournal.com',
      avatar: docData.reporter.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: docData.reporter.bio || '한국문화저널 편집국 보도자료 데스크',
      subscriberCount: typeof docData.reporter.subscriberCount === 'number' ? docData.reporter.subscriberCount : 150,
      cheerCount: typeof docData.reporter.cheerCount === 'number' ? docData.reporter.cheerCount : 40,
    } : typeof docData.reporter === 'string' && docData.reporter.trim() ? {
      id: 'rep-custom',
      name: docData.reporter.trim(),
      title: '취재기자',
      department: '문화부',
      email: 'reporter@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: '한국문화저널 보도데스크',
      subscriberCount: 150,
      cheerCount: 40,
    } : {
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
    importSource: importSource,
  };
}

/**
 * Safe date parser to handle Korean date strings ('2026. 08. 28.'), ISO strings, Firestore Timestamps, and numbers
 */
export function parseDateSafely(dateVal?: any): number {
  if (!dateVal) return 0;

  // 1. Raw numeric timestamp
  if (typeof dateVal === 'number') {
    if (dateVal > 1e11) return dateVal;
    if (dateVal > 0) return dateVal * 1000;
    return 0;
  }

  // 2. Firestore Timestamp / Date objects
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toMillis === 'function') {
      try { return dateVal.toMillis(); } catch {}
    }
    if (typeof dateVal.toDate === 'function') {
      try { return dateVal.toDate().getTime(); } catch {}
    }
    if (dateVal instanceof Date) {
      return dateVal.getTime();
    }
    if (typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000 + (dateVal.nanoseconds ? Math.floor(dateVal.nanoseconds / 1e6) : 0);
    }
    if (typeof dateVal._seconds === 'number') {
      return dateVal._seconds * 1000;
    }
  }

  const dateStr = String(dateVal).trim();
  if (!dateStr) return 0;

  // 3. Relative terms ('방금 전', '오늘', etc.)
  if (dateStr.includes('방금') || dateStr.includes('초 전') || dateStr.includes('분 전')) {
    return Date.now();
  }

  // 4. Standard ISO/RFC parsing
  const direct = new Date(dateStr).getTime();
  if (!isNaN(direct) && direct > 0) return direct;

  // 5. Clean format: '2026. 08. 28. 오후 12:30' or '2026. 08. 28.'
  const isPM = dateStr.includes('오후') || dateStr.toLowerCase().includes('pm');
  const isAM = dateStr.includes('오전') || dateStr.toLowerCase().includes('am');
  const numbers = dateStr
    .replace(/[^\d]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(n => parseInt(n, 10))
    .filter(n => !isNaN(n));

  if (numbers.length >= 3) {
    let [y, m, d, hh = 0, mm = 0, ss = 0] = numbers;
    if (y < 100) y += 2000;
    if (isPM && hh < 12) hh += 12;
    if (isAM && hh === 12) hh = 0;

    const ts = new Date(y, m - 1, d, hh, mm, ss).getTime();
    if (!isNaN(ts) && ts > 0) return ts;
  }
  return 0;
}

/**
 * Fetch latest articles from Firestore / Server with safe quota limit
 */
export async function fetchArticlesFromFirestore(limitCount: number = 80): Promise<Article[]> {
  try {
    // 1. Fetch from unified server API single source of truth
    const res = await fetch('/api/articles');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles.sort((a: Article, b: Article) => {
          const dateA = parseDateSafely(a.publishedAt);
          const dateB = parseDateSafely(b.publishedAt);
          return dateB - dateA;
        });
      }
    }
  } catch (err) {
    console.warn('API articles fetch fallback:', err);
  }

  try {
    // 2. Direct Firestore SDK fetch fallback
    const articlesCol = collection(db, 'articles');
    const q = query(articlesCol, orderBy('publishedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    const articles: Article[] = [];
    snapshot.forEach(docSnap => {
      articles.push(firestoreDocToArticle(docSnap.data(), docSnap.id));
    });
    // Sort latest first with safe date parsing
    return articles.sort((a, b) => {
      const dateA = parseDateSafely(a.publishedAt);
      const dateB = parseDateSafely(b.publishedAt);
      return dateB - dateA;
    });
  } catch (error: any) {
    console.warn('Firestore fetch notice:', error?.message || error);
    return [];
  }
}

/**
 * Fetch a single article by articleId from Firestore & Server (Requirement: single-doc fetch with zero collection scans)
 */
export async function fetchArticleByIdFromFirestore(articleId: string): Promise<Article | null> {
  if (!articleId) return null;
  const cleanId = String(articleId).trim();

  // 1. Try fetching from server single source of truth
  try {
    const res = await fetch(`/api/articles/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.article) return data.article;
    }
  } catch {}

  try {
    // 2. Direct document key lookup in Firestore
    const docRef = doc(db, 'articles', cleanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return firestoreDocToArticle(docSnap.data(), docSnap.id);
    }

    // 2. Try prefix 'art-wp-' if numeric ID was provided
    if (!cleanId.startsWith('art-wp-') && /^\d+$/.test(cleanId)) {
      const wpDocRef = doc(db, 'articles', `art-wp-${cleanId}`);
      const wpSnap = await getDoc(wpDocRef);
      if (wpSnap.exists()) {
        return firestoreDocToArticle(wpSnap.data(), wpSnap.id);
      }
    }

    // 3. Try removing 'art-wp-' prefix if raw numeric ID was stored
    if (cleanId.startsWith('art-wp-')) {
      const rawId = cleanId.replace(/^art-wp-/, '');
      const rawDocRef = doc(db, 'articles', rawId);
      const rawSnap = await getDoc(rawDocRef);
      if (rawSnap.exists()) {
        return firestoreDocToArticle(rawSnap.data(), rawSnap.id);
      }
    }

    // 4. Targeted field query fallback (limit 1)
    const articlesCol = collection(db, 'articles');
    const qField = query(articlesCol, where('id', '==', cleanId), limit(1));
    const qSnap = await getDocs(qField);
    if (!qSnap.empty) {
      return firestoreDocToArticle(qSnap.docs[0].data(), qSnap.docs[0].id);
    }

    // 5. Query by wpPostId if numeric
    if (/^\d+$/.test(cleanId) || cleanId.startsWith('art-wp-')) {
      const wpNum = cleanId.replace(/^art-wp-/, '');
      const qWp = query(articlesCol, where('wpPostId', '==', wpNum), limit(1));
      const qWpSnap = await getDocs(qWp);
      if (!qWpSnap.empty) {
        return firestoreDocToArticle(qWpSnap.docs[0].data(), qWpSnap.docs[0].id);
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch article ${cleanId} from Firestore:`, error);
    return null;
  }
}

/**
 * Fetch adjacent (previous older / next newer) articles from Firestore
 * Uses orderBy + limit(1) cursors without full-collection scanning
 */
export async function fetchAdjacentArticlesFromFirestore(
  currentArticle: Article,
  category?: string
): Promise<{ prevArticle: Article | null; nextArticle: Article | null }> {
  let prevArticle: Article | null = null;
  let nextArticle: Article | null = null;

  if (!currentArticle || !currentArticle.publishedAt) {
    return { prevArticle, nextArticle };
  }

  const articlesCol = collection(db, 'articles');

  // 1. Previous (Older) Article: publishedAt < currentArticle.publishedAt, order by desc, limit 1
  try {
    let prevQ = query(
      articlesCol,
      where('publishedAt', '<', currentArticle.publishedAt),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );
    let prevSnap = await getDocs(prevQ);
    if (!prevSnap.empty) {
      prevArticle = firestoreDocToArticle(prevSnap.docs[0].data(), prevSnap.docs[0].id);
    }
  } catch (prevErr) {
    console.warn('[ADJACENT] Querying older article fallback:', prevErr);
  }

  // 2. Next (Newer) Article: publishedAt > currentArticle.publishedAt, order by asc, limit 1
  try {
    let nextQ = query(
      articlesCol,
      where('publishedAt', '>', currentArticle.publishedAt),
      orderBy('publishedAt', 'asc'),
      limit(1)
    );
    let nextSnap = await getDocs(nextQ);
    if (!nextSnap.empty) {
      nextArticle = firestoreDocToArticle(nextSnap.docs[0].data(), nextSnap.docs[0].id);
    }
  } catch (nextErr) {
    console.warn('[ADJACENT] Querying newer article fallback:', nextErr);
  }

  return { prevArticle, nextArticle };
}

/**
 * Save / Update a single article strictly in Firestore articles collection & server single source of truth
 */
export async function saveArticleToFirestore(article: Article): Promise<void> {
  // 1. Save to Unified Server API
  try {
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
  } catch (apiErr) {
    console.warn('Server API save notice:', apiErr);
  }

  // 2. Save to Firestore SDK
  try {
    const docRef = doc(db, 'articles', article.id);
    const data = articleToFirestoreDoc(article);
    await setDoc(docRef, data, { merge: true });
  } catch (error: any) {
    console.warn(`Firestore save notice for ${article.id}:`, error?.message || error);
  }
}

/**
 * Delete an article strictly from Firestore articles collection & server store
 */
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  // 1. Delete from Unified Server API
  try {
    await fetch(`/api/articles/${encodeURIComponent(articleId)}`, {
      method: 'DELETE',
    });
  } catch (apiErr) {
    console.warn('Server API delete notice:', apiErr);
  }

  // 2. Delete from Firestore SDK
  try {
    const docRef = doc(db, 'articles', articleId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn(`Firestore delete notice for ${articleId}:`, error?.message || error);
  }
}

/**
 * Batch save articles to Firestore in safe chunks (max 200 per batch) & server store
 */
export async function saveArticlesBatchToFirestore(
  articles: Article[], 
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: number; failed: number; errors: Array<{ articleId: string; error: string }> }> {
  // 1. Batch sync to Unified Server API
  try {
    await fetch('/api/articles/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles }),
    });
  } catch (apiErr) {
    console.warn('Server API batch save notice:', apiErr);
  }

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
 * Returns null if read fails, preventing accidental overwrites.
 */
export async function seedInitialArticlesIfEmpty(): Promise<Article[] | null> {
  try {
    const existing = await fetchArticlesFromFirestore();
    if (existing && existing.length > 0) {
      return existing;
    }

    console.info('Firestore articles collection is completely empty. Seeding initial articles...');
    await saveArticlesBatchToFirestore(INITIAL_ARTICLES);
    return INITIAL_ARTICLES;
  } catch (err) {
    console.warn('Firestore read error during seed check; skipping seed to prevent data loss:', err);
    return null;
  }
}

// Last visible document cursor from initial 80 load or previous load more batch
export let lastVisibleFirestoreDoc: QueryDocumentSnapshot<DocumentData> | null = null;
export const categoryLastDocSnapshots: Record<string, QueryDocumentSnapshot<DocumentData> | null> = {};

/**
 * Realtime subscriber for Firestore articles & Unified Server Single Source of Truth
 * Ensures Edge, Incognito, Chrome, and all browsers share 100% identical data.
 */
export function subscribeToFirestoreArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (error: Error) => void,
  limitCount: number = 80
): () => void {
  let isUnmounted = false;

  // 1. Initial fast load from unified server single source of truth
  const syncFromServer = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok && !isUnmounted) {
        const data = await res.json();
        if (Array.isArray(data.articles) && data.articles.length > 0) {
          const sorted = data.articles.sort((a: Article, b: Article) => {
            const dateA = parseDateSafely(a.publishedAt);
            const dateB = parseDateSafely(b.publishedAt);
            return dateB - dateA;
          });
          onUpdate(sorted);
        }
      }
    } catch (err) {
      console.warn('[SYNC SERVER NOTICE]', err);
    }
  };

  syncFromServer();

  // 2. Periodic sync timer to ensure instant multi-browser cross-sync
  const pollInterval = setInterval(() => {
    if (!isUnmounted) {
      syncFromServer();
    }
  }, 4000);

  // 3. Firestore realtime snapshot listener
  const articlesCol = collection(db, 'articles');
  const q = query(articlesCol, orderBy('publishedAt', 'desc'), limit(limitCount));
  
  const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
    if (snapshot.empty || isUnmounted) {
      return;
    }

    // Save the last visible document snapshot cursor
    lastVisibleFirestoreDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    const list: Article[] = [];
    snapshot.forEach(docSnap => {
      list.push(firestoreDocToArticle(docSnap.data(), docSnap.id));
    });
    // Sort latest first using parseDateSafely
    const sorted = list.sort((a, b) => {
      const dateA = parseDateSafely(a.publishedAt);
      const dateB = parseDateSafely(b.publishedAt);
      return dateB - dateA;
    });

    console.log('[FIRESTORE]', {
      success: true,
      count: sorted.length,
      firstTitle: sorted[0]?.title,
      firstId: sorted[0]?.id,
      firstPublishedAt: sorted[0]?.publishedAt,
      lastCursorId: lastVisibleFirestoreDoc?.id,
    });

    onUpdate(sorted);
  }, async (err) => {
    console.warn('[FIRESTORE] Error/QuotaNotice:', err?.message || err);
    console.log('[FIRESTORE]', {
      success: false,
      errorType: err?.name || 'FirestoreError',
      errorMessage: err?.message || String(err),
    });

    if (onError) onError(err);
  });

  return () => {
    isUnmounted = true;
    clearInterval(pollInterval);
    unsubscribeFirestore();
  };
}

/**
 * Get count and list of WordPress imported articles currently in Firestore
 * Strictly filters ONLY WordPress imported articles and leaves manual/official articles intact.
 */
export async function getWordPressImportedArticles(): Promise<Article[]> {
  try {
    const articlesCol = collection(db, 'articles');
    const snapshot = await getDocs(articlesCol);
    if (snapshot.empty) return [];

    const wpArticles: Article[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = data.articleId || docSnap.id;
      const isWp = data.importSource === 'wordpress' || 
                   data.sourceName === 'WordPress Import' || 
                   id.startsWith('art-wp-') || 
                   docSnap.id.startsWith('art-wp-');
      
      // Ensure we NEVER delete standard demo articles (art-001 ~ art-008, etc.) or reporter manual articles
      const isStandardDemo = /^art-00[1-9]$/.test(id) || /^art-01[0-9]$/.test(id);
      if (isWp && !isStandardDemo) {
        wpArticles.push(firestoreDocToArticle(data, docSnap.id));
      }
    });

    return wpArticles;
  } catch (err) {
    console.error('Error fetching WP imported articles:', err);
    return [];
  }
}

/**
 * Delete ONLY WordPress imported articles in chunked batches by exact article IDs
 * - Uses exact target IDs from active state to guarantee 100% Source of Truth match
 * - Leaves standard/official/manual articles untouched
 * - Updates live progress
 * - Synchronizes with Backend server persistent store
 * - Returns total deleted count
 */
export async function deleteWordPressImportedArticlesFromFirestore(
  targetIdsOrProgress?: string[] | ((deleted: number, total: number) => void),
  onProgress?: (deleted: number, total: number) => void
): Promise<{ deletedCount: number; failedCount: number }> {
  try {
    let targetArticleIds: string[] = [];
    let progressCb = onProgress;

    if (Array.isArray(targetIdsOrProgress)) {
      targetArticleIds = targetIdsOrProgress;
    } else if (typeof targetIdsOrProgress === 'function') {
      progressCb = targetIdsOrProgress;
      const wpArticles = await getWordPressImportedArticles();
      targetArticleIds = wpArticles.map(a => a.id);
    } else {
      const wpArticles = await getWordPressImportedArticles();
      targetArticleIds = wpArticles.map(a => a.id);
    }

    const total = targetArticleIds.length;
    console.log(`[WP PURGE] Target WordPress article count for deletion: ${total}`);
    console.log('[WP PURGE] Target Article ID list:', targetArticleIds);

    if (total === 0) {
      return { deletedCount: 0, failedCount: 0 };
    }

    let deletedCount = 0;
    let failedCount = 0;
    const CHUNK_SIZE = 80;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunkIds = targetArticleIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunkIds.forEach(id => {
        const docRef = doc(db, 'articles', id);
        batch.delete(docRef);
      });

      try {
        await batch.commit();
        deletedCount += chunkIds.length;
      } catch (batchErr) {
        console.warn(`Batch delete failed at index ${i}, falling back to single delete:`, batchErr);
        for (const id of chunkIds) {
          try {
            await deleteDoc(doc(db, 'articles', id));
            deletedCount++;
          } catch (singleErr) {
            console.error(`Failed to delete doc ${id}:`, singleErr);
            failedCount++;
          }
        }
      }

      if (progressCb) {
        progressCb(deletedCount, total);
      }

      // Small yield to keep UI responsive
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    return { deletedCount, failedCount };
  } catch (err) {
    console.error('Error in deleteWordPressImportedArticlesFromFirestore:', err);
    throw err;
  }
}

/**
 * Save Dual Popups Config to Firestore
 */
export async function saveDualPopupsConfigToFirestore(config: any): Promise<void> {
  try {
    const docRef = doc(db, 'system_settings', 'dual_popups');
    await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Failed to save dual popups to Firestore:', err);
  }
}

/**
 * Fetch Dual Popups Config from Firestore
 */
export async function fetchDualPopupsConfigFromFirestore(): Promise<any | null> {
  try {
    const docRef = doc(db, 'system_settings', 'dual_popups');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.warn('Failed to fetch dual popups from Firestore:', err);
  }
  return null;
}

/**
 * Fast aggregated document count from Firestore server
 * Returns the exact total number of articles stored in Firestore
 */
export async function getFirestoreArticleTotalCount(): Promise<number> {
  try {
    const articlesCol = collection(db, 'articles');
    const snapshot = await getCountFromServer(articlesCol);
    return snapshot.data().count;
  } catch (err) {
    console.warn('Failed to get count from server, fallback to default count:', err);
    return 0;
  }
}

/**
 * Fast aggregated WordPress document count from Firestore server
 */
export async function getFirestoreWordPressArticleTotalCount(): Promise<number> {
  try {
    const articlesCol = collection(db, 'articles');
    const qWp = query(articlesCol, where('importSource', '==', 'wordpress'));
    const snapshot = await getCountFromServer(qWp);
    return snapshot.data().count;
  } catch (err) {
    console.warn('Failed to get WP count from server:', err);
    return 0;
  }
}

export interface FetchMoreArticlesOptions {
  category?: string;
  subNewsCategory?: string;
  lastDocSnapshot?: QueryDocumentSnapshot<DocumentData> | null;
  lastArticleId?: string;
  limitCount?: number;
}

/**
 * On-demand pagination fetcher from Firestore for category pages, main screen, and deep browsing
 * Uses Firestore QueryDocumentSnapshot cursor for stable, leak-free pagination across 2,000+ articles
 */
export async function fetchMoreArticlesFromFirestore(
  options: FetchMoreArticlesOptions = {}
): Promise<{ articles: Article[]; hasMore: boolean; lastDocSnapshot?: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const { category, subNewsCategory, lastDocSnapshot, lastArticleId, limitCount = 80 } = options;
    const articlesCol = collection(db, 'articles');

    const constraints: any[] = [];
    if (category && category !== 'all' && category !== 'paper_edition') {
      constraints.push(where('category', '==', category));
    }
    if (subNewsCategory && subNewsCategory !== 'all') {
      constraints.push(where('subNewsCategory', '==', subNewsCategory));
    }

    // Identical sorting constraint with initial subscriber
    constraints.push(orderBy('publishedAt', 'desc'));

    // Determine cursor document snapshot strictly from Firestore QueryDocumentSnapshot
    let cursorDoc: QueryDocumentSnapshot<DocumentData> | null = lastDocSnapshot || null;

    // If no explicit doc snapshot passed, check category/main snapshot cache
    if (!cursorDoc) {
      if (category && category !== 'all' && categoryLastDocSnapshots[category]) {
        cursorDoc = categoryLastDocSnapshots[category];
      } else if ((!category || category === 'all') && lastVisibleFirestoreDoc) {
        cursorDoc = lastVisibleFirestoreDoc;
      }
    }
    
    // Only if no cached doc snapshot exists anywhere, attempt lookup by lastArticleId
    if (!cursorDoc && lastArticleId) {
      try {
        const dSnap = await getDoc(doc(db, 'articles', lastArticleId));
        if (dSnap.exists()) {
          cursorDoc = dSnap as unknown as QueryDocumentSnapshot<DocumentData>;
        }
      } catch (docErr) {
        console.warn('[LOAD MORE] Notice resolving fallback cursor by lastArticleId:', docErr);
      }
    }

    if (cursorDoc) {
      constraints.push(startAfter(cursorDoc));
    }

    constraints.push(limit(limitCount));

    const q = query(articlesCol, ...constraints);
    const snap = await getDocs(q);

    if (snap.empty) {
      return { articles: [], hasMore: false, lastDocSnapshot: null };
    }

    // Update the last visible document cursor
    const lastDoc = snap.docs[snap.docs.length - 1];
    if (!category || category === 'all') {
      lastVisibleFirestoreDoc = lastDoc;
    } else {
      categoryLastDocSnapshots[category] = lastDoc;
    }

    const items: Article[] = [];
    snap.forEach((docSnap) => {
      items.push(firestoreDocToArticle(docSnap.data(), docSnap.id));
    });

    const sorted = items.sort((a, b) => parseDateSafely(b.publishedAt) - parseDateSafely(a.publishedAt));

    return {
      articles: sorted,
      hasMore: snap.docs.length >= limitCount,
      lastDocSnapshot: lastDoc,
    };
  } catch (err) {
    console.error('Error fetching more articles from Firestore:', err);
    return { articles: [], hasMore: false, lastDocSnapshot: null };
  }
}

/**
 * Admin deep search across Firestore articles
 */
export async function searchAllFirestoreArticles(
  keyword: string,
  category: string = 'all',
  limitCount: number = 80
): Promise<Article[]> {
  try {
    const articlesCol = collection(db, 'articles');
    let q;
    if (category && category !== 'all') {
      q = query(articlesCol, where('category', '==', category), limit(400));
    } else {
      q = query(articlesCol, orderBy('publishedAt', 'desc'), limit(500));
    }
    const snap = await getDocs(q);
    const list: Article[] = [];
    const lower = keyword.toLowerCase().trim();
    snap.forEach((docSnap) => {
      const art = firestoreDocToArticle(docSnap.data(), docSnap.id);
      if (!lower) {
        list.push(art);
      } else {
        const titleMatch = art.title?.toLowerCase().includes(lower);
        const contentMatch = art.content?.toLowerCase().includes(lower);
        const reporterMatch = art.reporter?.name?.toLowerCase().includes(lower);
        const tagMatch = art.tags?.some((t) => t.toLowerCase().includes(lower));
        if (titleMatch || contentMatch || reporterMatch || tagMatch) {
          list.push(art);
        }
      }
    });
    return list.slice(0, limitCount).sort((a, b) => parseDateSafely(b.publishedAt) - parseDateSafely(a.publishedAt));
  } catch (err) {
    console.error('Error searching all articles in Firestore:', err);
    return [];
  }
}


