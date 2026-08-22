import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

// In-memory data store for server-backed persistence
let serverArticles: any[] = [];
let serverAdSettings: any = {
  belowSubtitle: '',
  inBody: '',
  afterBody: '',
  sidebarTop: '',
  sidebarBottom: '',
};

// API: Get and Sync Articles
app.get('/api/articles', (req, res) => {
  res.json({ articles: serverArticles });
});

app.post('/api/articles/sync', (req, res) => {
  try {
    const { articles } = req.body;
    if (Array.isArray(articles) && articles.length > 0) {
      serverArticles = articles;
    }
    res.json({ success: true, count: serverArticles.length });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
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
    }
    res.json({ success: true, ads: serverAdSettings });
  } catch (error) {
    res.status(500).json({ error: 'Ad save failed' });
  }
});

// SEO: robots.txt for Googlebot & Yeti (Naver SearchBot)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app/sitemap.xml

User-agent: Yeti
Allow: /

User-agent: Googlebot
Allow: /
`);
});

// SEO: Dynamic XML Sitemap for Google & Naver Search
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const baseUrl = 'https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  const currentDate = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/amp</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/paper-edition</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/culture-art</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/heritage</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  res.send(xml);
});

// SEO: RSS 2.0 Feed for Naver Media, Google News & Daum News
app.get('/rss.xml', (req, res) => {
  res.type('application/rss+xml');
  const baseUrl = 'https://ais-pre-6o4ywcjcstk7ro5figwt3r-87873142145.asia-northeast1.run.app';
  const pubDate = new Date().toUTCString();

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
    <item>
      <title><![CDATA[[단독] 해외 유출 국보급 조선 문화재 23만 점 환수 프로젝트 본격화]]></title>
      <link>${baseUrl}/#art-001</link>
      <description><![CDATA[국가유산청과 국외소재문화유산재단이 전 세계 22개국에 흩어진 23만 여 점의 한국 문화유산 환수를 위한 범정부 민관합동위원회를 공식 출범했다.]]></description>
      <author>park_cw@kculturejournal.com (박찬우 문화전문기자)</author>
      <category>전통·유산</category>
      <pubDate>${pubDate}</pubDate>
      <guid>${baseUrl}/#art-001</guid>
    </item>
  </channel>
</rss>`;
  res.send(rss);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`한국문화저널 서버 구동 완료: http://localhost:${PORT}`);
  });
}

startServer();
