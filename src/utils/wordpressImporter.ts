import { Article, CategoryId, Reporter } from '../types';
import { 
  fetchArticlesFromFirestore, 
  saveArticleToFirestore, 
  articleToFirestoreDoc, 
  db 
} from '../firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export interface WordPressParsedItem {
  wpPostId: string;
  articleId: string;
  koreanTitle: string;
  koreanBody: string;
  englishTitle?: string;
  englishBody?: string;
  summary: string;
  subtitle?: string;
  category: CategoryId;
  categoryLabel: string;
  tags: string[];
  reporterName: string;
  publishedAt: string;
  updatedAt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW' | 'REJECTED';
  imageUrl?: string;
  imageCaption?: string;
  sourceUrl?: string;
  rawXmlItem?: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  success: number;
  duplicate: number;
  failed: number;
  currentTitle?: string;
  errors: Array<{ title: string; articleId: string; error: string }>;
  isComplete: boolean;
}

/**
 * Clean HTML helper for text extraction
 */
function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Extract image URL from HTML content
 */
function extractFirstImageUrl(contentHtml: string): string | undefined {
  if (!contentHtml) return undefined;
  const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && !imgMatch[1].includes('emoji') && !imgMatch[1].includes('avatar')) {
    return imgMatch[1];
  }
  return undefined;
}

/**
 * Map WordPress category string to KCJ CategoryId
 */
export function mapWpCategoryToKcj(wpCategory: string): { category: CategoryId; label: string } {
  const norm = (wpCategory || '').toLowerCase().trim();
  
  if (norm.includes('케이팝') || norm.includes('k-pop') || norm.includes('k컬처') || norm.includes('k-컬처') || norm.includes('한류') || norm.includes('드라마') || norm.includes('방송') || norm.includes('연예')) {
    return { category: 'k_culture', label: 'K-컬처' };
  }
  if (norm.includes('문화재') || norm.includes('문화유산') || norm.includes('헤리티지') || norm.includes('heritage') || norm.includes('역사') || norm.includes('고궁') || norm.includes('유적') || norm.includes('전통') || norm.includes('국보') || norm.includes('보물')) {
    return { category: 'heritage', label: '문화유산' };
  }
  if (norm.includes('오피니언') || norm.includes('opinion') || norm.includes('칼럼') || norm.includes('사설') || norm.includes('기고') || norm.includes('논설') || norm.includes('비평')) {
    return { category: 'opinion', label: '오피니언' };
  }
  if (norm.includes('포토') || norm.includes('photo') || norm.includes('영상') || norm.includes('비디오') || norm.includes('화보') || norm.includes('사진')) {
    return { category: 'photo_video', label: '포토·영상' };
  }
  if (norm.includes('글로벌') || norm.includes('global') || norm.includes('세계') || norm.includes('국제') || norm.includes('해외')) {
    return { category: 'global_news', label: '글로벌뉴스' };
  }
  if (norm.includes('sdg') || norm.includes('un') || norm.includes('esg') || norm.includes('지속가능') || norm.includes('유네스코') || norm.includes('환경')) {
    return { category: 'un_sdg', label: 'UN SDG' };
  }
  if (norm.includes('지면') || norm.includes('paper') || norm.includes('신문')) {
    return { category: 'paper_edition', label: '지면보기' };
  }
  
  // Default to culture_art
  return { category: 'culture_art', label: '문화·예술' };
}

/**
 * Fast & resilient WordPress XML Parser
 * Uses regex/streaming block parsing to comfortably handle large 2,000+ items XML files
 */
export function parseWordPressXml(xmlText: string): WordPressParsedItem[] {
  const items: WordPressParsedItem[] = [];
  
  // Extract all <item>...</item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];

    // Check post_type (ignore pages, attachments, nav_menu_items)
    const postTypeMatch = itemBlock.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/i);
    const postType = postTypeMatch ? cleanHtmlText(postTypeMatch[1]) : 'post';
    if (postType && !['post', 'news', 'article', ''].includes(postType)) {
      continue;
    }

    // Status
    const statusMatch = itemBlock.match(/<wp:status>([\s\S]*?)<\/wp:status>/i);
    const wpStatus = statusMatch ? cleanHtmlText(statusMatch[1]).toLowerCase() : 'publish';
    const status: 'PUBLISHED' | 'DRAFT' = (wpStatus === 'draft' || wpStatus === 'pending') ? 'DRAFT' : 'PUBLISHED';

    // Post ID
    const idMatch = itemBlock.match(/<wp:post_id>([\s\S]*?)<\/wp:post_id>/i);
    const wpPostId = idMatch ? cleanHtmlText(idMatch[1]) : '';
    const articleId = wpPostId ? `art-wp-${wpPostId}` : `art-wp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Title
    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
    const koreanTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : '무제 기사';
    if (!koreanTitle || koreanTitle === 'Auto Draft') {
      continue;
    }

    // Content
    let koreanBody = '';
    const contentEncodedMatch = itemBlock.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
    if (contentEncodedMatch) {
      koreanBody = cleanHtmlText(contentEncodedMatch[1]);
    } else {
      const descMatch = itemBlock.match(/<description>([\s\S]*?)<\/description>/i);
      koreanBody = descMatch ? cleanHtmlText(descMatch[1]) : '';
    }

    // Excerpt / Summary
    let summary = '';
    const excerptMatch = itemBlock.match(/<excerpt:encoded>([\s\S]*?)<\/excerpt:encoded>/i);
    if (excerptMatch) {
      summary = cleanHtmlText(excerptMatch[1]);
    }
    if (!summary && koreanBody) {
      const stripped = koreanBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      summary = stripped.slice(0, 180) + (stripped.length > 180 ? '...' : '');
    }

    // Date
    let publishedAt = new Date().toISOString();
    const postDateMatch = itemBlock.match(/<wp:post_date>([\s\S]*?)<\/wp:post_date>/i);
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    if (postDateMatch && postDateMatch[1].trim()) {
      const d = new Date(postDateMatch[1].trim().replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    } else if (pubDateMatch && pubDateMatch[1].trim()) {
      const d = new Date(pubDateMatch[1].trim());
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }

    // Creator / Author
    const creatorMatch = itemBlock.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i);
    const reporterName = creatorMatch ? cleanHtmlText(creatorMatch[1]) : '편집국';

    // Categories and Tags
    const categories: string[] = [];
    const tags: string[] = [];
    const catRegex = /<category\s+([^>]*)>([\s\S]*?)<\/category>/gi;
    let catMatch: RegExpExecArray | null;

    while ((catMatch = catRegex.exec(itemBlock)) !== null) {
      const attr = catMatch[1];
      const val = cleanHtmlText(catMatch[2]);
      if (!val) continue;

      if (attr.includes('domain="category"')) {
        categories.push(val);
      } else if (attr.includes('domain="post_tag"') || attr.includes('domain="tag"')) {
        tags.push(val);
      } else {
        tags.push(val);
      }
    }

    const primaryCategoryStr = categories[0] || '';
    const { category, label: categoryLabel } = mapWpCategoryToKcj(primaryCategoryStr);

    // Link
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i);
    const sourceUrl = linkMatch ? cleanHtmlText(linkMatch[1]) : undefined;

    // Image
    const imageUrl = extractFirstImageUrl(koreanBody) || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80';

    // English fields (if present in custom postmeta)
    let englishTitle: string | undefined;
    let englishBody: string | undefined;
    if (itemBlock.includes('en_title') || itemBlock.includes('english_title')) {
      const enTitleMatch = itemBlock.match(/<wp:meta_key>(?:en_title|english_title)<\/wp:meta_key>\s*<wp:meta_value>([\s\S]*?)<\/wp:meta_value>/i);
      if (enTitleMatch) englishTitle = cleanHtmlText(enTitleMatch[1]);
    }
    if (itemBlock.includes('en_content') || itemBlock.includes('english_body')) {
      const enContentMatch = itemBlock.match(/<wp:meta_key>(?:en_content|english_body)<\/wp:meta_key>\s*<wp:meta_value>([\s\S]*?)<\/wp:meta_value>/i);
      if (enContentMatch) englishBody = cleanHtmlText(enContentMatch[1]);
    }

    items.push({
      wpPostId,
      articleId,
      koreanTitle,
      koreanBody,
      englishTitle,
      englishBody,
      summary,
      category,
      categoryLabel,
      tags: tags.length > 0 ? tags : ['한국문화저널', categoryLabel],
      reporterName,
      publishedAt,
      updatedAt: publishedAt,
      status,
      imageUrl,
      sourceUrl,
      rawXmlItem: itemBlock.slice(0, 300),
    });
  }

  return items;
}

/**
 * Convert WordPressParsedItem to full Article model
 */
export function wpItemToArticle(item: WordPressParsedItem): Article {
  const reporter: Reporter = {
    id: `rep-${encodeURIComponent(item.reporterName || 'editor')}`,
    name: item.reporterName || '편집국',
    title: '전문기자',
    department: item.categoryLabel + '부',
    email: 'news@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: `한국문화저널 ${item.reporterName} 기자`,
    subscriberCount: Math.floor(Math.random() * 200) + 50,
    cheerCount: Math.floor(Math.random() * 50) + 10,
  };

  return {
    id: item.articleId,
    category: item.category,
    categoryLabel: item.categoryLabel,
    title: item.koreanTitle,
    titleEn: item.englishTitle,
    subtitle: item.subtitle || '',
    summary: item.summary,
    content: item.koreanBody,
    contentEn: item.englishBody,
    reporter,
    publishedAt: item.publishedAt,
    updatedAt: item.updatedAt,
    views: Math.floor(Math.random() * 300) + 120,
    shares: Math.floor(Math.random() * 20),
    likes: Math.floor(Math.random() * 40) + 5,
    reactions: {
      info: Math.floor(Math.random() * 15) + 2,
      exciting: Math.floor(Math.random() * 10) + 1,
      empathy: Math.floor(Math.random() * 20) + 3,
      analysis: Math.floor(Math.random() * 12) + 2,
      followup: Math.floor(Math.random() * 8) + 1,
    },
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    imageCaption: item.imageCaption || '',
    tags: item.tags,
    sectionPage: '문화종합',
    pageNumber: 1,
    isBreaking: false,
    isTopHeadline: false,
    isEditorialPick: false,
    commentsCount: 0,
    badge: undefined,
    status: item.status,
    mainNewsEnabled: true,
    subNewsEnabled: true,
    sourceName: 'WordPress Import',
    sourceUrl: item.sourceUrl,
  };
}

/**
 * Execute Batch Import of WordPress items to Firestore
 * - Deduplicates against existing Firestore articles by articleId AND title
 * - Uses Firestore writeBatch in chunks of 50 ~ 100 docs
 * - Reports live progress (0/2000, 250/2000, ..., 2000/2000)
 */
export async function executeWordPressImportToFirestore(
  wpItems: WordPressParsedItem[],
  onProgress: (progress: ImportProgress) => void,
  chunkSize: number = 80
): Promise<ImportProgress> {
  const total = wpItems.length;
  let processed = 0;
  let success = 0;
  let duplicate = 0;
  let failed = 0;
  const errors: Array<{ title: string; articleId: string; error: string }> = [];

  // Step 1: Fetch existing article IDs and titles from Firestore for robust deduplication
  const existingArticles = await fetchArticlesFromFirestore();
  const existingIdSet = new Set<string>();
  const existingTitleSet = new Set<string>();

  existingArticles.forEach(a => {
    existingIdSet.add(a.id);
    if (a.id.startsWith('art-wp-')) {
      existingIdSet.add(a.id.replace('art-wp-', ''));
    }
    if (a.title) {
      existingTitleSet.add(a.title.trim().toLowerCase());
    }
  });

  const progressState: ImportProgress = {
    total,
    processed: 0,
    success: 0,
    duplicate: 0,
    failed: 0,
    errors: [],
    isComplete: false,
  };

  onProgress({ ...progressState });

  // Step 2: Chunk-based batch upload
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = wpItems.slice(i, i + chunkSize);
    const toUpload: Article[] = [];

    for (const item of chunk) {
      const titleNorm = (item.koreanTitle || '').trim().toLowerCase();
      
      // Check duplication
      if (
        existingIdSet.has(item.articleId) ||
        (item.wpPostId && existingIdSet.has(item.wpPostId)) ||
        (item.wpPostId && existingIdSet.has(`art-wp-${item.wpPostId}`)) ||
        existingTitleSet.has(titleNorm)
      ) {
        duplicate++;
        processed++;
      } else {
        const article = wpItemToArticle(item);
        toUpload.push(article);
        existingIdSet.add(article.id);
        if (item.wpPostId) existingIdSet.add(item.wpPostId);
        existingTitleSet.add(titleNorm);
      }
    }

    if (toUpload.length > 0) {
      const batch = writeBatch(db);
      toUpload.forEach(art => {
        const docRef = doc(db, 'articles', art.id);
        const data = articleToFirestoreDoc(art);
        batch.set(docRef, data, { merge: true });
      });

      try {
        await batch.commit();
        success += toUpload.length;
        processed += toUpload.length;
      } catch (err: any) {
        console.error(`Batch commit error at chunk ${i}:`, err);
        // Fallback: commit individually to save as many as possible
        for (const art of toUpload) {
          try {
            await saveArticleToFirestore(art);
            success++;
          } catch (singleErr: any) {
            failed++;
            errors.push({
              title: art.title,
              articleId: art.id,
              error: singleErr?.message || 'Firestore write error',
            });
          }
          processed++;
        }
      }
    }

    progressState.processed = processed;
    progressState.success = success;
    progressState.duplicate = duplicate;
    progressState.failed = failed;
    progressState.errors = errors;
    progressState.currentTitle = chunk[chunk.length - 1]?.koreanTitle;

    onProgress({ ...progressState });

    // Non-blocking yield for UI rendering
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  progressState.isComplete = true;
  progressState.processed = total;
  onProgress({ ...progressState });

  return progressState;
}
