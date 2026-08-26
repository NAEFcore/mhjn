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
  characterCount: number;
  firstSentence: string;
  lastSentence: string;
  rawXmlItem?: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  success: number;
  duplicate: number;
  failed: number;
  currentTitle?: string;
  errors: Array<{ title: string; articleId: string; error: string; item?: WordPressParsedItem }>;
  isComplete: boolean;
}

/**
 * Decode XML/HTML Entities
 */
export function decodeXmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Extract CDATA content accurately, handling nested or multiple CDATA segments
 */
function extractCdataContent(raw: string): string {
  if (!raw) return '';
  let content = raw.trim();
  
  // If wrapped in <![CDATA[ ... ]]>
  if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
    content = content.substring(9, content.length - 3);
  } else {
    // Replace any remaining CDATA markers without removing the inner text
    content = content.replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '');
  }
  return content;
}

/**
 * Clean and preserve entire WordPress Gutenberg & Classic post content without losing a single sentence
 * - Strips Gutenberg comments `<!-- wp:... -->` and `<!-- /wp:... -->` (including attributes and multiline JSON)
 * - Preserves ALL inner HTML tags (<p>, <h1>~<h6>, <img>, <figure>, <figcaption>, <a>, <blockquote>, <ul>, <ol>, <li>, <div>, <span>, <table>, etc.)
 * - Preserves ALL content inside <!-- wp:html --> blocks
 * - Preserves image URLs, source links, embeds, and tables
 * - Converts plain text double newlines to paragraphs if no HTML tags are present
 */
export function cleanWordPressContent(rawContent: string): string {
  if (!rawContent) return '';
  
  // Step 1: Extract CDATA
  let content = extractCdataContent(rawContent);

  // Step 2: Remove Gutenberg block comment delimiters, PRESERVING ALL INNER HTML AND TEXT
  // Matches <!-- wp:anything ... --> and <!-- /wp:anything --> and <!-- wp:... /-->
  content = content.replace(/<!--\s*\/?wp:[\w\-\/]+(?:\s+[\s\S]*?)?-->/gi, '');
  
  // Step 3: Remove generic HTML comments if any, but do not touch tags
  content = content.replace(/<!--(?![\s\S]*?-->)[\s\S]*?-->/g, '');

  // Step 4: If HTML tags were escaped in the XML export as &lt;p&gt; or &lt;figure&gt;, decode them
  if (/&lt;(?:p|figure|img|h[1-6]|div|span|a|ul|ol|li|blockquote|table|strong|em|br|hr)\b/i.test(content)) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // Step 5: Normalize extra whitespace around block tags while preserving internal spacing
  content = content.trim();

  // Step 6: If the content is purely plain text without any <p>, <div>, or <br> tags (legacy WP editor with autop),
  // format paragraphs with <p> tags so it displays correctly.
  const hasHtmlBlocks = /<(p|div|h[1-6]|ul|ol|table|blockquote|figure|article|section)/i.test(content);
  if (!hasHtmlBlocks) {
    const paragraphs = content.split(/\n\s*\n/);
    content = paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  }

  return content;
}

/**
 * Extract image URL from HTML content or attachment
 */
function extractFirstImageUrl(contentHtml: string): string | undefined {
  if (!contentHtml) return undefined;
  const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && !imgMatch[1].includes('emoji') && !imgMatch[1].includes('avatar')) {
    return decodeXmlEntities(imgMatch[1]);
  }
  return undefined;
}

/**
 * Extract first and last sentences for verification and preview
 */
function getSentenceBoundaries(bodyHtml: string): { firstSentence: string; lastSentence: string; plainText: string } {
  const plainText = bodyHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return { firstSentence: '', lastSentence: '', plainText: '' };
  }

  const sentences = plainText.split(/(?<=[.!?。])\s+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0] ? sentences[0].slice(0, 100) : plainText.slice(0, 100);
  const lastSentence = sentences.length > 0 ? sentences[sentences.length - 1].slice(-100) : plainText.slice(-100);

  return { firstSentence, lastSentence, plainText };
}

/**
 * Map WordPress category string to KCJ CategoryId
 */
export function mapWpCategoryToKcj(wpCategory: string): { category: CategoryId; label: string } {
  const norm = (wpCategory || '').toLowerCase().trim();
  
  if (norm.includes('케이팝') || norm.includes('k-pop') || norm.includes('k컬처') || norm.includes('k-컬처') || norm.includes('한류') || norm.includes('드라마') || norm.includes('방송') || norm.includes('연예') || norm.includes('k콘텐츠')) {
    return { category: 'k_culture', label: 'K-컬처' };
  }
  if (norm.includes('문화재') || norm.includes('문화유산') || norm.includes('헤리티지') || norm.includes('heritage') || norm.includes('역사') || norm.includes('고궁') || norm.includes('유적') || norm.includes('전통') || norm.includes('국보') || norm.includes('보물') || norm.includes('명장')) {
    return { category: 'heritage', label: '전통·문화유산' };
  }
  if (norm.includes('오피니언') || norm.includes('opinion') || norm.includes('칼럼') || norm.includes('사설') || norm.includes('기고') || norm.includes('논설') || norm.includes('비평')) {
    return { category: 'opinion', label: '사설·칼럼' };
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
 * Robust WordPress XML WXR Parser
 * Uses optimized block extraction to comfortably parse 2,000+ items without memory bottlenecks or string truncations
 */
export function parseWordPressXml(xmlText: string): WordPressParsedItem[] {
  const items: WordPressParsedItem[] = [];
  if (!xmlText) return items;
  
  // Extract all <item>...</item> blocks cleanly
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];

    // 1. Check post_type (ignore pages, attachments, nav_menu_items, custom css, etc.)
    const postTypeMatch = itemBlock.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/i);
    const postType = postTypeMatch ? extractCdataContent(postTypeMatch[1]).trim() : 'post';
    if (postType && !['post', 'news', 'article', ''].includes(postType)) {
      continue;
    }

    // 2. Status
    const statusMatch = itemBlock.match(/<wp:status>([\s\S]*?)<\/wp:status>/i);
    const wpStatus = statusMatch ? extractCdataContent(statusMatch[1]).trim().toLowerCase() : 'publish';
    const status: 'PUBLISHED' | 'DRAFT' = (wpStatus === 'draft' || wpStatus === 'pending') ? 'DRAFT' : 'PUBLISHED';

    // 3. Post ID
    const idMatch = itemBlock.match(/<wp:post_id>([\s\S]*?)<\/wp:post_id>/i);
    const wpPostId = idMatch ? extractCdataContent(idMatch[1]).trim() : '';
    const articleId = wpPostId ? `art-wp-${wpPostId}` : `art-wp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // 4. Title
    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? extractCdataContent(titleMatch[1]) : '무제 기사';
    const koreanTitle = decodeXmlEntities(rawTitle).trim();
    if (!koreanTitle || koreanTitle === 'Auto Draft') {
      continue;
    }

    // 5. Full Body Content (content:encoded or description) - NEVER TRUNCATE
    let rawBody = '';
    const contentEncodedMatch = itemBlock.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
    if (contentEncodedMatch) {
      rawBody = contentEncodedMatch[1];
    } else {
      const descMatch = itemBlock.match(/<description>([\s\S]*?)<\/description>/i);
      rawBody = descMatch ? descMatch[1] : '';
    }

    const koreanBody = cleanWordPressContent(rawBody);
    if (!koreanBody || koreanBody.trim().length === 0) {
      continue;
    }

    const { firstSentence, lastSentence, plainText } = getSentenceBoundaries(koreanBody);
    const characterCount = koreanBody.length;

    // 6. Excerpt / Summary
    let summary = '';
    const excerptMatch = itemBlock.match(/<excerpt:encoded>([\s\S]*?)<\/excerpt:encoded>/i);
    if (excerptMatch) {
      summary = decodeXmlEntities(extractCdataContent(excerptMatch[1])).trim();
    }
    if (!summary && plainText) {
      summary = plainText.slice(0, 180) + (plainText.length > 180 ? '...' : '');
    }

    // 7. Date
    let publishedAt = new Date().toISOString();
    const postDateMatch = itemBlock.match(/<wp:post_date>([\s\S]*?)<\/wp:post_date>/i);
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    if (postDateMatch && postDateMatch[1].trim()) {
      const dateStr = extractCdataContent(postDateMatch[1]).trim();
      const d = new Date(dateStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    } else if (pubDateMatch && pubDateMatch[1].trim()) {
      const dateStr = extractCdataContent(pubDateMatch[1]).trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }

    // 8. Creator / Author
    const creatorMatch = itemBlock.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i);
    const rawCreator = creatorMatch ? extractCdataContent(creatorMatch[1]) : '편집국';
    const reporterName = decodeXmlEntities(rawCreator).trim() || '편집국';

    // 9. Categories and Tags
    const categories: string[] = [];
    const tags: string[] = [];
    const catRegex = /<category\s+([^>]*)>([\s\S]*?)<\/category>/gi;
    let catMatch: RegExpExecArray | null;

    while ((catMatch = catRegex.exec(itemBlock)) !== null) {
      const attr = catMatch[1];
      const val = decodeXmlEntities(extractCdataContent(catMatch[2])).trim();
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

    // 10. Link
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i);
    const sourceUrl = linkMatch ? decodeXmlEntities(extractCdataContent(linkMatch[1])).trim() : undefined;

    // 11. Image
    const imageUrl = extractFirstImageUrl(koreanBody) || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80';

    // 12. English fields (if present in custom postmeta)
    let englishTitle: string | undefined;
    let englishBody: string | undefined;
    if (itemBlock.includes('en_title') || itemBlock.includes('english_title')) {
      const enTitleMatch = itemBlock.match(/<wp:meta_key>(?:en_title|english_title)<\/wp:meta_key>\s*<wp:meta_value>([\s\S]*?)<\/wp:meta_value>/i);
      if (enTitleMatch) englishTitle = decodeXmlEntities(extractCdataContent(enTitleMatch[1])).trim();
    }
    if (itemBlock.includes('en_content') || itemBlock.includes('english_body')) {
      const enContentMatch = itemBlock.match(/<wp:meta_key>(?:en_content|english_body)<\/wp:meta_key>\s*<wp:meta_value>([\s\S]*?)<\/wp:meta_value>/i);
      if (enContentMatch) englishBody = cleanWordPressContent(enContentMatch[1]);
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
      characterCount,
      firstSentence,
      lastSentence,
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
    importSource: 'wordpress',
  };
}

/**
 * Execute Batch Import of WordPress items to Firestore
 * - Deduplicates against existing Firestore articles by articleId AND title
 * - Uses Firestore writeBatch in chunks of 50 ~ 100 docs
 * - Reports live progress
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
  const errors: Array<{ title: string; articleId: string; error: string; item?: WordPressParsedItem }> = [];

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
    const toUpload: { article: Article; item: WordPressParsedItem }[] = [];

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
        toUpload.push({ article, item });
        existingIdSet.add(article.id);
        if (item.wpPostId) existingIdSet.add(item.wpPostId);
        existingTitleSet.add(titleNorm);
      }
    }

    if (toUpload.length > 0) {
      const batch = writeBatch(db);
      toUpload.forEach(({ article }) => {
        const docRef = doc(db, 'articles', article.id);
        const data = articleToFirestoreDoc(article);
        batch.set(docRef, data, { merge: true });
      });

      try {
        await batch.commit();
        success += toUpload.length;
        processed += toUpload.length;
      } catch (err: any) {
        console.error(`Batch commit error at chunk ${i}:`, err);
        // Fallback: commit individually to save as many as possible
        for (const { article, item } of toUpload) {
          try {
            await saveArticleToFirestore(article);
            success++;
          } catch (singleErr: any) {
            failed++;
            errors.push({
              title: article.title,
              articleId: article.id,
              error: singleErr?.message || 'Firestore write error',
              item,
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
    await new Promise(resolve => setTimeout(resolve, 25));
  }

  progressState.isComplete = true;
  progressState.processed = total;
  onProgress({ ...progressState });

  return progressState;
}
