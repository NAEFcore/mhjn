// Real-time Client-side Translation Service (Korean -> English)
// Utilizes browser-compatible free Google Translation endpoints with caching and robust error handling.

const TRANSLATION_CACHE = new Map<string, string>();
const LOCAL_STORAGE_KEY_PREFIX = 'kc_trans_en_';

/**
 * Translate a single piece of text from Korean (or auto) to English
 */
export async function translateKoToEn(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();

  // 1. Check in-memory cache
  if (TRANSLATION_CACHE.has(trimmed)) {
    return TRANSLATION_CACHE.get(trimmed)!;
  }

  // 2. Check localStorage cache
  try {
    const storageKey = LOCAL_STORAGE_KEY_PREFIX + hashString(trimmed.slice(0, 100) + '_' + trimmed.length);
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      TRANSLATION_CACHE.set(trimmed, cached);
      return cached;
    }
  } catch {
    // Ignore storage quota/security issues
  }

  // 3. Perform translation via Google Translate single client endpoint
  try {
    const directResult = await fetchGoogleTranslate(trimmed);
    if (directResult) {
      cacheResult(trimmed, directResult);
      return directResult;
    }
  } catch {
    // Try CORS proxy fallback if direct fetch fails
    try {
      const proxyResult = await fetchGoogleTranslateViaProxy(trimmed);
      if (proxyResult) {
        cacheResult(trimmed, proxyResult);
        return proxyResult;
      }
    } catch {
      // Fallback
    }
  }

  return trimmed;
}

/**
 * Translate an entire article's components (title, subtitle, summary, content, category, tags)
 */
export interface TranslatedArticleData {
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  categoryLabel?: string;
  tags?: string[];
  aiSummary?: string[];
}

export async function translateArticleToEnglish(article: {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  categoryLabel?: string;
  tags?: string[];
  aiSummary?: string[];
}): Promise<TranslatedArticleData> {
  // Check composite cache for full article
  const cacheKey = `article_${article.id}_en_v2`;
  try {
    const fullCached = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + cacheKey);
    if (fullCached) {
      return JSON.parse(fullCached);
    }
  } catch {
    // ignore
  }

  // Translate each field concurrently
  const [
    transTitle,
    transSubtitle,
    transSummary,
    transContent,
    transCategory,
  ] = await Promise.all([
    translateKoToEn(article.title),
    article.subtitle ? translateKoToEn(article.subtitle) : Promise.resolve(''),
    article.summary ? translateKoToEn(article.summary) : Promise.resolve(''),
    translateArticleBody(article.content),
    article.categoryLabel ? translateKoToEn(article.categoryLabel) : Promise.resolve(''),
  ]);

  // Translate tags if present
  let transTags: string[] = [];
  if (article.tags && article.tags.length > 0) {
    transTags = await Promise.all(article.tags.map((t) => translateKoToEn(t.replace(/^#/, ''))));
  }

  // Translate AI summary bullets if present
  let transAiSummary: string[] | undefined = undefined;
  if (article.aiSummary && article.aiSummary.length > 0) {
    transAiSummary = await Promise.all(article.aiSummary.map((bullet) => translateKoToEn(bullet)));
  }

  const result: TranslatedArticleData = {
    title: transTitle || article.title,
    subtitle: transSubtitle || article.subtitle,
    summary: transSummary || article.summary,
    content: transContent || article.content,
    categoryLabel: transCategory || article.categoryLabel,
    tags: transTags.length > 0 ? transTags : article.tags,
    aiSummary: transAiSummary,
  };

  // Save composite cache
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + cacheKey, JSON.stringify(result));
  } catch {
    // ignore
  }

  return result;
}

/**
 * Translates article body by splitting paragraphs to preserve spacing and formatting
 */
async function translateArticleBody(content: string): Promise<string> {
  if (!content) return content;
  const paragraphs = content.split('\n\n');

  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // If paragraph is very long, translate directly
      return await translateKoToEn(trimmed);
    })
  );

  return translatedParagraphs.join('\n\n');
}

/**
 * Direct Google Translate endpoint
 */
async function fetchGoogleTranslate(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translate API response not ok');
  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0].map((item: any) => item[0]).join('');
    return translated || text;
  }
  return text;
}

/**
 * Proxy fallback if direct request is blocked
 */
async function fetchGoogleTranslateViaProxy(text: string): Promise<string> {
  const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('Proxy response not ok');
  const data = await res.json();
  if (data.contents) {
    const parsed = JSON.parse(data.contents);
    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      return parsed[0].map((item: any) => item[0]).join('');
    }
  }
  return text;
}

function cacheResult(source: string, translated: string) {
  TRANSLATION_CACHE.set(source, translated);
  try {
    const storageKey = LOCAL_STORAGE_KEY_PREFIX + hashString(source.slice(0, 100) + '_' + source.length);
    localStorage.setItem(storageKey, translated);
  } catch {
    // ignore
  }
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
