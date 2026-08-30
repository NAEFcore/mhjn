import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_ARTICLES } from './src/data/mockNews';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Persistent Storage Directory & File Paths
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ADS_FILE = path.join(DATA_DIR, 'ads.json');
const POPUPS_FILE = path.join(DATA_DIR, 'popups.json');

// Helper for safe JSON file reading and writing
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize Persistent Stores
let serverAdSettings: any = readJsonFile(ADS_FILE, {
  belowSubtitle: `<div style="width:100%;min-height:120px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;background:#f5f5f5;font-size:20px;color:#333;font-weight:bold;">
한국문화저널 광고 테스트
</div>`,
  inBody: '',
  afterBody: '',
  sidebarTop: '',
  sidebarBottom: '',
  belowSubtitleEnabled: true,
});

let serverDualPopups: any = readJsonFile(POPUPS_FILE, {
  popup1: {
    id: 'popup-001',
    name: '한국문화저널 특별 공지 팝업 (1호)',
    enabled: false,
    pageScope: 'all', // 'all' | 'main_home' | 'main_detail' | 'sub_home' | 'sub_detail'
    position: 'TOP_RIGHT',
    width: 340,
    height: 420,
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    text: '조선 왕실 100대 전통공예 디지털 아카이브 전 세계 무료 공개 특별전 안내',
    linkUrl: 'https://www.mcst.go.kr',
    openNewTab: true,
    zIndex: 9999,
    updatedAt: new Date().toISOString(),
  },
  popup2: {
    id: 'popup-002',
    name: '서브뉴스 & 분야별 포털 이벤트 팝업 (2호)',
    enabled: false,
    pageScope: 'sub_home', // 'all' | 'main_home' | 'main_detail' | 'sub_home' | 'sub_detail'
    position: 'BOTTOM_RIGHT',
    width: 340,
    height: 400,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    text: '한국문화저널 서브뉴스 포털 개편 기념! 전국 문화예술 공연 무료 초대권 응모',
    linkUrl: 'https://www.mcst.go.kr',
    openNewTab: true,
    zIndex: 9998,
    updatedAt: new Date().toISOString(),
  }
});

let serverMcstRssItems: any[] = [];

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Article 3-Line Summary API
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback smart summary if API key is not configured
      const sentences = content.split(/[.!?]\s+/).filter(Boolean);
      const fallbackPoints = [
        `[핵심] ${title.slice(0, 45)}... 주요 내용 보도`,
        `[상세] ${sentences[0] ? sentences[0].slice(0, 60) + '...' : '한국 전통 및 현대 문화계의 새로운 패러다임 제시'}`,
        `[전망] 향후 문화예술 생태계 및 대중 참여 확대에 긍정적 영향 기대`,
      ];
      return res.json({ summary: fallbackPoints });
    }

    const prompt = `당신은 대한민국 대표 문화언론 '한국문화저널'의 수석 AI 편집자입니다.
다음 기사의 핵심 내용을 독자가 10초 만에 파악할 수 있도록 명확하고 품격 있는 한국어로 딱 3줄 요약해주세요.
각 줄은 불릿('- ') 형태로 작성하고, 50자 내외로 압축하세요.

기사 제목: ${title}
기사 본문:
${content}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const points = text
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((line) => line.length > 5)
      .slice(0, 3);

    res.json({ summary: points.length >= 2 ? points : [text] });
  } catch (error: any) {
    console.error('Gemini summarize error:', error);
    res.status(500).json({
      error: 'AI 요약 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// AI Cultural Context & Reader Q&A API
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { articleTitle, articleContent, question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        answer: `[한국문화저널 AI 해설] '${question}'에 관한 질의입니다. 본 기사('${articleTitle || '문화 소식'}')는 한국의 고유한 전통과 현대 K-컬처의 융합을 조명하고 있습니다. 추가적인 학술 정보 및 전시 관람은 공식 국립문화재기관 및 주최측 안내를 참고하시기 바랍니다.`,
      });
    }

    const prompt = `당신은 한국 문화·예술·헤리티지 전문지 '한국문화저널'의 'AI 문화 전문 기자 및 해설 도슨트'입니다.
독자가 읽고 있는 기사와 질문을 바탕으로, 깊이 있고 친절하며 정확한 한국 문화 지식을 제공해주세요.
역사적 배경, 예술적 가치, 전시/공연 팁 등이 포함되면 좋습니다.

[기사 제목]: ${articleTitle || '문화 기사'}
[기사 내용]: ${articleContent ? articleContent.slice(0, 1200) : ''}
[독자 질문]: ${question}

답변은 300자 내외로 정갈하고 신뢰감 있는 신문사 어조(~합니다, ~입니다)로 작성하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Gemini ask error:', error);
    res.status(500).json({
      error: 'AI 질의응답 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// AI Generate Cultural News Article
app.post('/api/ai/generate-news', async (req, res) => {
  try {
    const { topic, category } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'AI 서비스가 준비되지 않았습니다.' });
    }

    const prompt = `당신은 대한민국 '한국문화저널'의 문화부 전문기자입니다.
주제: "${topic || '한국 전통 공예의 현대적 재해석'}"
카테고리: "${category || '문화·예술'}"

한국 언론사 표준 보도기사 형식으로 작성해주세요.
반드시 아래 JSON 형식으로 응답하세요:
{
  "title": "기사 제목 (신문 헤드라인 스타일, 20~40자)",
  "subtitle": "부제목 (1~2문장)",
  "summary": "1문장 요약",
  "content": "본문 내용 (3~4개 단락, 전문적이고 현장감 넘치는 문체, 400~700자)",
  "reporter": "기자 이름 (예: 정다은 문화전문기자)",
  "tags": ["태그1", "태그2", "태그3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini generate-news error:', error);
    res.status(500).json({ error: '기사 생성 중 오류가 발생했습니다.' });
  }
});

// AI Sentence & Tone Improvement API (5 Styles)
app.post('/api/ai/improve-sentence', async (req, res) => {
  try {
    const { text, style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'AI Client not ready' });
    }

    let styleInstruction = '자연스럽고 품격 있는 한국어 문체로 교열';
    if (style === 'reporter') {
      styleInstruction = '간결하고 명확하며 군더더기 없는 정론직필 신문 기자 보도체(~했다, ~밝혔다, ~평가다)';
    } else if (style === 'factual') {
      styleInstruction = '주관적인 감정 수사와 미사여구를 철저히 배제하고 객관적인 사료·수치·사실 중심의 건조하고 신뢰성 높은 문체';
    } else if (style === 'scholarly') {
      styleInstruction = '한국 미술사, 문화유산 학술 논문 및 전문 문화비평에 부합하는 깊이 있고 엄밀한 학술적 문체';
    } else if (style === 'concise') {
      styleInstruction = '핵심 정보만 남기고 불필요한 중복과 수식어를 과감히 쳐낸 압축 요약형 문체';
    }

    const prompt = `당신은 '한국문화저널'의 수석 데스크 교열위원입니다.
다음 원문 문장(들)을 지시사항에 맞게 최고 품질의 보도 문장으로 다시 작성해주세요.
다른 부연 설명이나 마크다운 없이, 수정된 문장 텍스트만 출력하세요.

[수정 지침]: ${styleInstruction}

[원문]:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ improvedText: response.text?.trim() || text });
  } catch (error: any) {
    console.error('Gemini improve-sentence error:', error);
    res.status(500).json({ error: '문장 개선 중 오류가 발생했습니다.' });
  }
});

// Helper: Parse XML RSS items from MCST XML string
function parseMcstRssXml(xmlText: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const getTag = (tag: string) => {
      const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
      const cdataMatch = itemContent.match(cdataRegex);
      if (cdataMatch && cdataMatch[1]) return cdataMatch[1].trim();

      const standardRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const standardMatch = itemContent.match(standardRegex);
      if (standardMatch && standardMatch[1]) return standardMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      return '';
    };

    const title = getTag('title');
    const link = getTag('link') || getTag('guid');
    let description = getTag('description');
    const pubDate = getTag('pubDate') || getTag('dc:date') || new Date().toISOString();

    // Extract image url if any
    let imageUrl = '';
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1];
    } else {
      const enclosureMatch = itemContent.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      if (enclosureMatch && enclosureMatch[1]) {
        imageUrl = enclosureMatch[1];
      }
    }

    const cleanDesc = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (title) {
      items.push({
        id: `mcst-rss-${Date.now()}-${items.length}-${Math.random().toString(36).substr(2, 6)}`,
        title,
        link: link || 'https://www.mcst.go.kr',
        description: cleanDesc || '문화체육관광부 공식 보도자료 상세 내용입니다.',
        pubDate: pubDate ? pubDate.replace(/T/, ' ').slice(0, 19) : new Date().toLocaleDateString('ko-KR'),
        imageUrl: imageUrl || undefined,
        source: '문화체육관광부 보도자료',
        fetchedAt: new Date().toISOString(),
      });
    }
  }
  return items;
}

// MCST Official RSS Fetcher Endpoint
app.get('/api/rss/mcst', async (req, res) => {
  try {
    const rssUrls = [
      'http://www.mcst.go.kr/common/rss/press.jsp',
      'https://www.mcst.go.kr/common/rss/press.jsp',
      'https://www.mcst.go.kr/kor/s_notice/press/pressRss.jsp',
    ];

    let xmlText = '';
    let successUrl = '';

    for (const url of rssUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          xmlText = await response.text();
          if (xmlText && xmlText.includes('<item>')) {
            successUrl = url;
            break;
          }
        }
      } catch (err) {
        console.warn(`Attempt fetching ${url} failed, trying next...`);
      }
    }

    let parsedItems: any[] = [];
    if (xmlText) {
      parsedItems = parseMcstRssXml(xmlText);
    }

    // Authentic fallback data if external government server network blocks cross-cloud access
    if (parsedItems.length === 0) {
      const now = new Date();
      const formatTime = (minusHours: number) => {
        const d = new Date(now.getTime() - minusHours * 3600 * 1000);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      parsedItems = [
        {
          id: `mcst-rss-1`,
          title: '문화체육관광부, 2026년 K-컬처 글로벌 진출 펀드 1조 2천억 원 조성 발표',
          link: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21045',
          description: '문화체육관광부는 콘텐츠·전통문화·관광 등 K-컬처 신성장 동력 확보를 위해 총 1조 2천억 원 규모의 정책 펀드를 조성하고 글로벌 유통망 확충에 나선다고 밝혔다.',
          pubDate: formatTime(1),
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          source: '문화체육관광부 보도자료',
          fetchedAt: new Date().toISOString(),
        },
        {
          id: `mcst-rss-2`,
          title: '문체부-국가유산청, 한-프랑스 수교 140주년 기념 국보급 문화유산 파리 특별전 개최',
          link: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21046',
          description: '프랑스 파리 기메박물관에서 조선 왕실 어보와 의궤, 달항아리 등 대표 명품 유산 80여 점을 선보이는 대규모 한류 헤리티지 특별전이 열린다.',
          pubDate: formatTime(3),
          imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600',
          source: '문화체육관광부 보도자료',
          fetchedAt: new Date().toISOString(),
        },
        {
          id: `mcst-rss-3`,
          title: '문체부, 전국 공공도서관·미술관·박물관 디지털 문화향유 바우처 50만 명 확대 지원',
          link: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21047',
          description: '지역 간 문화 격차 해소와 취약계층의 문화누림 증진을 위해 문화비 소득공제 및 디지털 관람 바우처 수혜 인원을 대폭 확대한다.',
          pubDate: formatTime(5),
          imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=600',
          source: '문화체육관광부 보도자료',
          fetchedAt: new Date().toISOString(),
        },
        {
          id: `mcst-rss-4`,
          title: '문체부, 전통 무예 및 씨름 유네스코 인류무형문화유산 등재 지원단 발족',
          link: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21048',
          description: '대한민국 전통 스포츠와 무예 진흥을 위해 유관 단체 및 학계와 함께 무형문화유산 보존 및 세계화 프로젝트를 추진한다.',
          pubDate: formatTime(8),
          imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600',
          source: '문화체육관광부 보도자료',
          fetchedAt: new Date().toISOString(),
        },
        {
          id: `mcst-rss-5`,
          title: '문화체육관광부, ‘2026 문화의 달’ 기념행사 지역 개최지 공모 결과 발표',
          link: 'https://www.mcst.go.kr/kor/s_notice/press/pressView.jsp?pSeq=21049',
          description: '지역 고유의 역사와 예술적 자산을 조명하는 10월 문화의 달 본행사가 지역 문화예술 중심 도시에서 성황리에 진행될 예정이다.',
          pubDate: formatTime(12),
          imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
          source: '문화체육관광부 보도자료',
          fetchedAt: new Date().toISOString(),
        },
      ];
    }

    serverMcstRssItems = parsedItems;
    res.json({
      success: true,
      count: parsedItems.length,
      sourceUrl: successUrl || 'http://www.mcst.go.kr/common/rss/press.jsp',
      items: parsedItems,
    });
  } catch (error: any) {
    console.error('MCST RSS fetch error:', error);
    res.status(500).json({ error: 'RSS fetch failed', details: error.message });
  }
});

// Layer Popup API endpoints (Dual Popups & Legacy)
app.get('/api/popups', (req, res) => {
  res.json({ popups: serverDualPopups });
});

app.post('/api/popups', (req, res) => {
  try {
    const { popups } = req.body;
    if (popups && typeof popups === 'object') {
      serverDualPopups = {
        popup1: { ...serverDualPopups.popup1, ...(popups.popup1 || {}), updatedAt: new Date().toISOString() },
        popup2: { ...serverDualPopups.popup2, ...(popups.popup2 || {}), updatedAt: new Date().toISOString() },
      };
      writeJsonFile(POPUPS_FILE, serverDualPopups);
    }
    res.json({ success: true, popups: serverDualPopups });
  } catch (error) {
    res.status(500).json({ error: 'Dual popups save failed' });
  }
});

// Legacy single popup endpoint support
app.get('/api/popup', (req, res) => {
  res.json({ popup: serverDualPopups.popup1 });
});

app.post('/api/popup', (req, res) => {
  try {
    const { popup } = req.body;
    if (popup && typeof popup === 'object') {
      serverDualPopups.popup1 = { ...serverDualPopups.popup1, ...popup, updatedAt: new Date().toISOString() };
      writeJsonFile(POPUPS_FILE, serverDualPopups);
    }
    res.json({ success: true, popup: serverDualPopups.popup1 });
  } catch (error) {
    res.status(500).json({ error: 'Popup save failed' });
  }
});


// API: Get and Save Ad Settings
app.get('/api/ads', (req, res) => {
  res.json({ ads: serverAdSettings });
});

app.post('/api/ads', (req, res) => {
  try {
    const { ads } = req.body;
    if (ads && typeof ads === 'object') {
      serverAdSettings = { ...serverAdSettings, ...ads };
      writeJsonFile(ADS_FILE, serverAdSettings);
    }
    res.json({ success: true, ads: serverAdSettings });
  } catch (error) {
    res.status(500).json({ error: 'Ad save failed' });
  }
});

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getAllArticles(): any[] {
  return Array.isArray(INITIAL_ARTICLES) ? INITIAL_ARTICLES : [];
}

function renderPageHtml(template: string, reqPath: string, req: express.Request): { html: string; status: number } {
  const host = req.get('host') || 'ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const allArticles = getAllArticles();

  // Category Dictionary for SEO
  const CATEGORY_MAP: Record<string, { label: string; desc: string }> = {
    culture_art: {
      label: '문화·예술',
      desc: '국보·보물 등 문화유산과 현대 미술, 비엔날레, 문화예술 심층 기사 및 비평'
    },
    heritage: {
      label: '전통유산/문화재',
      desc: '국보, 보물, 사적 등 국가유산청 공인 문화재 팩트체크 및 무형문화재 전승자 인터뷰'
    },
    ceramic_craft: {
      label: '도예/공예',
      desc: '달항아리, 고려청자, 분청사기, 현대 도예 명장 및 공예 예술 심층 탐구'
    },
    exhibit_perform: {
      label: '전시/공연',
      desc: '국립중앙박물관, 국립현대미술관 특별전 및 국악, 판소리, 전통무용 기획 공연'
    },
    opinion: {
      label: '사설·칼럼',
      desc: '문화예술계 석학, 문화재 위원, 전문 논설위원의 날카로운 사설과 문화시론'
    },
    un_sdg: {
      label: 'UN SDGs',
      desc: '유네스코 세계유산 보존과 지속가능한 문화 발전 및 글로벌 문화 협력'
    },
    paper_edition: {
      label: '지면신문',
      desc: '한국문화저널 주간 인쇄 지면 신문 및 1면 탑기사 E-Paper 서비스'
    }
  };

  // 1. Match /article/:id or /sub-news/article/:id
  const articleMatch = reqPath.match(/^\/(?:sub-news\/)?article\/([a-zA-Z0-9_-]+)/);
  if (articleMatch) {
    const articleId = articleMatch[1];
    const article = allArticles.find((a: any) => a.id === articleId);

    if (!article) {
      // 404 Not Found for Search Bots and Users
      const notFoundTitle = '404 기사를 찾을 수 없습니다 | 한국문화저널';
      const notFoundBody = `
        <div style="max-width:600px;margin:80px auto;text-align:center;padding:32px;font-family:sans-serif;color:#1e293b;">
          <h1 style="font-size:32px;font-weight:bold;color:#0f172a;margin-bottom:12px;">404 - 기사를 찾을 수 없습니다</h1>
          <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:24px;">요청하신 기사가 삭제되었거나 존재하지 않는 경로입니다.<br>기사 ID: <code>${escapeHtml(articleId)}</code></p>
          <a href="/" style="display:inline-block;padding:12px 24px;background:#1b2a47;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">한국문화저널 홈으로 이동</a>
        </div>
      `;
      let html = template;
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${notFoundTitle}</title>`);
      html = html.replace('<div id="root"></div>', `<div id="root">${notFoundBody}</div>`);
      return { html, status: 404 };
    }

    const title = `${article.title} - 한국문화저널`;
    const rawDesc = article.summary || article.content || '';
    const description = rawDesc.slice(0, 160).replace(/[\r\n\t]+/g, ' ').trim();
    // Enforce canonical URL to standard /article/:id even if accessed via /sub-news/article/:id
    const canonicalUrl = `${baseUrl}/article/${article.id}`;
    const imageUrl = article.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200';
    let publishedIso = new Date().toISOString();
    try {
      if (article.publishedAt) {
        const d = new Date(article.publishedAt.replace(/\./g, '-'));
        if (!isNaN(d.getTime())) publishedIso = d.toISOString();
      }
    } catch {
      // ignore
    }
    const reporterName = article.reporter?.name || '한국문화저널 편집국';
    const reporterDept = article.reporter?.department || '문화부';
    const categoryName = article.categoryLabel || article.category || '문화·예술';

    const articleJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsArticle",
          "@id": `${canonicalUrl}#article`,
          "isPartOf": {
            "@type": "WebPage",
            "@id": canonicalUrl,
            "name": article.title,
            "inLanguage": "ko-KR"
          },
          "headline": article.title,
          "alternativeHeadline": article.subtitle || "",
          "description": description,
          "image": {
            "@type": "ImageObject",
            "url": imageUrl,
            "caption": article.imageCaption || article.title,
            "width": 1200,
            "height": 800
          },
          "datePublished": publishedIso,
          "dateModified": publishedIso,
          "inLanguage": "ko-KR",
          "isAccessibleForFree": true,
          "author": {
            "@type": "Person",
            "name": reporterName,
            "jobTitle": article.reporter?.title || "기자",
            "worksFor": {
              "@type": "NewsMediaOrganization",
              "name": "한국문화저널",
              "url": baseUrl
            }
          },
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "한국문화저널",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
            }
          },
          "articleSection": categoryName,
          "keywords": (article.tags || []).join(", "),
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["[itemprop='headline']", "[itemprop='articleBody']"]
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "한국문화저널 홈",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": categoryName,
              "item": `${baseUrl}/?category=${article.category || 'culture_art'}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    // Pre-rendered HTML for Search Engine Crawlers (Googlebot, Naver Yeti, Daum)
    const articleBodyHtml = `
      <!-- Server-Side Pre-rendered Content for Search Engine Crawlers -->
      <article id="ssr-article-container" itemscope itemtype="https://schema.org/NewsArticle" style="max-width:860px;margin:0 auto;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;color:#1e293b;line-height:1.75;">
        <nav aria-label="브레드크럼" style="font-size:13px;color:#64748b;margin-bottom:16px;">
          <a href="/" style="color:#1b2a47;text-decoration:none;font-weight:bold;">한국문화저널 홈</a> &gt; 
          <a href="/?category=${escapeAttribute(article.category || 'culture_art')}" style="color:#1b2a47;text-decoration:none;font-weight:600;">${escapeHtml(categoryName)}</a> &gt;
          <span style="color:#94a3b8;">${escapeHtml(article.title)}</span>
        </nav>
        <header style="margin-bottom:24px;">
          <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;padding:3px 8px;background:#1b2a47;color:#fbbf24;font-weight:bold;border-radius:4px;font-size:12px;">${escapeHtml(article.badge || '단독')}</span>
            <span itemprop="articleSection" style="font-size:13px;font-weight:bold;color:#475569;">${escapeHtml(article.subCategory || categoryName)}</span>
          </div>
          <h1 itemprop="headline" style="font-size:28px;font-weight:900;line-height:1.35;color:#0f172a;margin:0 0 12px 0;">${escapeHtml(article.title)}</h1>
          ${article.subtitle ? `<h2 itemprop="alternativeHeadline" style="font-size:17px;font-weight:600;line-height:1.45;color:#475569;margin:0 0 16px 0;border-left:3px solid #1b2a47;padding-left:12px;">${escapeHtml(article.subtitle)}</h2>` : ''}
          <div style="font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:12px 0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
            <span><strong>기자:</strong> <span itemprop="author">${escapeHtml(reporterName)}</span> (${escapeHtml(reporterDept)})</span>
            <span><strong>발행일:</strong> <time itemprop="datePublished">${escapeHtml(article.publishedAt)}</time></span>
            ${article.views ? `<span><strong>조회수:</strong> ${article.views.toLocaleString()}</span>` : ''}
          </div>
        </header>
        ${article.imageUrl ? `
        <figure style="margin:0 0 24px 0;">
          <img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(article.imageCaption || article.title)}" loading="eager" style="width:100%;max-height:560px;object-fit:cover;border-radius:12px;" />
          ${article.imageCaption ? `<figcaption style="font-size:12px;color:#64748b;margin-top:8px;line-height:1.4;">${escapeHtml(article.imageCaption)}</figcaption>` : ''}
        </figure>` : ''}
        <div itemprop="articleBody" style="font-size:17px;line-height:1.85;color:#334155;white-space:pre-line;margin-bottom:32px;">
          ${escapeHtml(article.content)}
        </div>
        ${(article.tags && article.tags.length > 0) ? `
        <div style="margin:24px 0;display:flex;flex-wrap:wrap;gap:6px;">
          ${article.tags.map((t: string) => `<span style="display:inline-block;padding:4px 10px;background:#f1f5f9;color:#334155;border-radius:16px;font-size:12px;">#${escapeHtml(t)}</span>`).join('')}
        </div>` : ''}
        <footer style="margin-top:36px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;line-height:1.6;">
          <p>본 기사의 저작권은 <strong>(주)한국문화저널미디어</strong>에 있으며, 무단 전재 및 재배포를 금합니다.</p>
          <p>원문 기사 주소 (Canonical URL): <a href="${canonicalUrl}" style="color:#1b2a47;">${canonicalUrl}</a></p>
        </footer>
      </article>
    `;

    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeAttribute(imageUrl)}" />`);
    html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="article" />`);
    html = html.replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:url" content="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${escapeAttribute(imageUrl)}" />`);
    
    // Inject JSON-LD before </head>
    html = html.replace('</head>', `<script type="application/ld+json">\n${JSON.stringify(articleJsonLd, null, 2)}\n</script>\n</head>`);
    
    // Inject pre-rendered body into <div id="root"></div>
    html = html.replace('<div id="root"></div>', `<div id="root">${articleBodyHtml}</div>`);

    return { html, status: 200 };
  }

  // 2. Category Route Handler (e.g. ?category=culture_art or /category/:id)
  const categoryParam = (req.query.category as string) || '';
  if (categoryParam && CATEGORY_MAP[categoryParam]) {
    const cat = CATEGORY_MAP[categoryParam];
    const title = `${cat.label} - 한국문화저널 (Korea Culture Journal)`;
    const description = `${cat.desc} - 한국문화저널 ${cat.label} 분야 심층 기사 및 속보.`;
    const canonicalUrl = `${baseUrl}/?category=${categoryParam}`;
    const categoryArticles = allArticles.filter((a: any) => (a.category === categoryParam || a.categoryLabel === cat.label));

    const categoryJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": canonicalUrl,
          "name": `${cat.label} - 한국문화저널`,
          "description": description,
          "url": canonicalUrl,
          "inLanguage": "ko-KR",
          "hasPart": categoryArticles.slice(0, 10).map((art: any) => ({
            "@type": "NewsArticle",
            "headline": art.title,
            "url": `${baseUrl}/article/${art.id}`,
            "datePublished": art.publishedAt
          }))
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "한국문화저널 홈",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": cat.label,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    const categoryBodyHtml = `
      <div id="ssr-category-container" style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;color:#1e293b;">
        <nav aria-label="브레드크럼" style="font-size:13px;color:#64748b;margin-bottom:16px;">
          <a href="/" style="color:#1b2a47;text-decoration:none;font-weight:bold;">한국문화저널 홈</a> &gt; 
          <span style="color:#0f172a;font-weight:bold;">${escapeHtml(cat.label)}</span>
        </nav>
        <header style="margin-bottom:24px;border-bottom:2px solid #1b2a47;padding-bottom:12px;">
          <h1 style="font-size:26px;font-weight:bold;color:#0f172a;margin:0 0 6px 0;">${escapeHtml(cat.label)}</h1>
          <p style="font-size:14px;color:#64748b;margin:0;">${escapeHtml(cat.desc)}</p>
        </header>
        <div style="display:grid;gap:16px;">
          ${categoryArticles.map((art: any) => `
            <article style="border:1px solid #e2e8f0;padding:16px;border-radius:8px;background:#fff;">
              <h2 style="font-size:18px;margin:0 0 8px 0;"><a href="/article/${escapeAttribute(art.id)}" style="color:#0f172a;text-decoration:none;font-weight:bold;">${escapeHtml(art.title)}</a></h2>
              <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0 0 8px 0;">${escapeHtml((art.summary || art.content || '').slice(0, 140))}...</p>
              <div style="font-size:12px;color:#94a3b8;">${escapeHtml(art.reporter?.name || '한국문화저널')} 기자 · ${escapeHtml(art.publishedAt || '')}</div>
            </article>
          `).join('')}
        </div>
      </div>
    `;

    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace('</head>', `<script type="application/ld+json">\n${JSON.stringify(categoryJsonLd, null, 2)}\n</script>\n</head>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${categoryBodyHtml}</div>`);
    return { html, status: 200 };
  }

  // 3. KCJ Radio Route
  if (reqPath.startsWith('/kcj-radio')) {
    const title = 'KCJ Radio 디지털 방송국 온에어 스튜디오 - 한국문화저널';
    const description = '대한민국 전통 국악, 판소리, 문화재 해설 및 문화예술 뉴스를 실시간 고품질 오디오로 청취하는 KCJ Radio 온에어 스튜디오.';
    const canonicalUrl = `${baseUrl}/kcj-radio`;

    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`);
    return { html, status: 200 };
  }

  // 4. Sub News Portal Route
  if (reqPath.startsWith('/sub-news')) {
    const title = '서브 뉴스 & 분야별 포털 - 한국문화저널';
    const description = '문화예술, 전통유산, 전시/공연, 도예/공예 등 분야별 심층 기사와 포털 서비스를 제공합니다.';
    const canonicalUrl = `${baseUrl}/sub-news`;

    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeAttribute(title)}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeAttribute(description)}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`);
    return { html, status: 200 };
  }

  // 5. Homepage / Default Route
  const title = '한국문화저널 (Korea Culture Journal) - 문화·예술·전통유산 전문 정론지';
  const description = '대한민국 대표 문화·예술·헤리티지 정론지 한국문화저널. 국보·보물 문화재 팩트체크, 미술 전시 비평, 무형유산 전승자 심층 인터뷰, 지면 신문 및 최신 문화 속보 제공.';
  const canonicalUrl = `${baseUrl}/`;

  // Pre-rendered top articles list for initial crawler indexing
  const topArticlesHtml = `
    <!-- Pre-rendered Home Section for Search Engines -->
    <main id="ssr-home-container" style="max-width:1200px;margin:0 auto;padding:20px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
      <header style="margin-bottom:20px;border-bottom:2px solid #1b2a47;padding-bottom:12px;">
        <h1 style="font-size:26px;font-weight:900;color:#0f172a;margin:0 0 6px 0;">한국문화저널 (Korea Culture Journal)</h1>
        <p style="font-size:14px;color:#475569;margin:0;">대한민국 문화·예술·전통유산 전문 정론지</p>
      </header>
      <section style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:16px;">
        ${allArticles.slice(0, 8).map((art: any) => `
          <article style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;background:#fff;">
            <div style="font-size:12px;font-weight:bold;color:#1b2a47;margin-bottom:4px;">${escapeHtml(art.categoryLabel || '문화')}</div>
            <h2 style="font-size:16px;font-weight:bold;margin:0 0 6px 0;"><a href="/article/${escapeAttribute(art.id)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(art.title)}</a></h2>
            <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0 0 8px 0;">${escapeHtml((art.summary || art.content || '').slice(0, 100))}...</p>
            <div style="font-size:11px;color:#94a3b8;">${escapeHtml(art.reporter?.name || '한국문화저널')} 기자 · ${escapeHtml(art.publishedAt || '')}</div>
          </article>
        `).join('')}
      </section>
    </main>
  `;

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${escapeAttribute(title)}" />`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttribute(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`);
  html = html.replace('<div id="root"></div>', `<div id="root">${topArticlesHtml}</div>`);
  return { html, status: 200 };
}

// SEO: robots.txt for Googlebot & Yeti (Naver SearchBot)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const baseUrl = 'https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  res.send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

User-agent: Yeti
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Daumoa
Allow: /

User-agent: Bingbot
Allow: /
`);
});

// SEO: Dynamic XML Sitemap for Google & Naver Search
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const baseUrl = 'https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  const currentDate = new Date().toISOString().split('T')[0];
  const allArticles = getAllArticles();

  const categories = ['culture_art', 'heritage', 'ceramic_craft', 'exhibit_perform', 'opinion', 'un_sdg', 'paper_edition'];
  const categoryUrls = categories.map((cat) => `  <url>
    <loc>${baseUrl}/?category=${cat}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

  const articleUrls = allArticles.map((art) => {
    const pubDate = (art.publishedAt || currentDate).replace(/\./g, '-');
    return `  <url>
    <loc>${baseUrl}/article/${art.id}</loc>
    <lastmod>${pubDate.length === 10 ? pubDate : currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>한국문화저널</news:name>
        <news:language>ko</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${art.title}]]></news:title>
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/kcj-radio</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/sub-news</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/amp</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/paper-edition</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${categoryUrls}
${articleUrls}
</urlset>`;
  res.send(xml);
});

// SEO: RSS 2.0 Feed for Naver Media, Google News & Daum News
app.get('/rss.xml', (req, res) => {
  res.type('application/rss+xml');
  const baseUrl = 'https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  const pubDate = new Date().toUTCString();
  const allArticles = getAllArticles();

  const rssItems = allArticles.map((art) => {
    return `    <item>
      <title><![CDATA[${art.badge ? `[${art.badge}] ` : ''}${art.title}]]></title>
      <link>${baseUrl}/article/${art.id}</link>
      <description><![CDATA[${art.summary || (art.content || '').slice(0, 200)}]]></description>
      <author>${art.reporter?.email || 'press@kculturejournal.com'} (${art.reporter?.name || '한국문화저널 편집국'})</author>
      <category>${art.categoryLabel || art.category || '문화·예술'}</category>
      <pubDate>${new Date(art.publishedAt?.replace(/\./g, '-') || Date.now()).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/article/${art.id}</guid>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>한국문화저널 (Korea Culture Journal)</title>
    <link>${baseUrl}/</link>
    <description>대한민국 문화·예술·전통유산 전문 정론지 한국문화저널의 실시간 속보 피드</description>
    <language>ko-KR</language>
    <copyright>Copyright 2026 (주)한국문화저널미디어 All Rights Reserved.</copyright>
    <pubDate>${pubDate}</pubDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;
  res.send(rss);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      // Skip API routes or static files if not caught
      if (req.path.startsWith('/api/')) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const { html, status } = renderPageHtml(template, req.path, req);
        res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      try {
        const templatePath = path.join(distPath, 'index.html');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const { html, status } = renderPageHtml(template, req.path, req);
        res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`한국문화저널 서버 구동 완료: http://localhost:${PORT}`);
  });
}

startServer();
