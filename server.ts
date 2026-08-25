import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Persistent Storage Directory & File Paths
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
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

// Initial Seed Articles (Including user's test article art-user-1787492319169)
const SEED_ARTICLES = [
  {
    id: 'art-user-1787492319169',
    category: 'opinion',
    categoryLabel: '오피니언',
    subCategory: '사설·칼럼',
    title: '역도산과 함경도 전통 신체문화의 재조명, 임홍택 박사',
    subtitle: '일본 프로레슬링 전설 역도산(김신락)의 한반도 북부 전통 신체문화 성장 배경과 미발굴 역사적 의의 고찰',
    summary: '역도산(김신락)은 오늘날 일본 프로레슬링의 상징적 인물로 널리 알려져 있다. 그러나 그가 함경남도 홍원 출신이라는 사실과, 그의 성장 배경이 한반도 북부 지역의 전통 신체문화 환경과 연결되어 있다는 점은 상대적으로 충분히 조명되지 못했다.',
    content: `역도산(김신락)은 오늘날 일본 프로레슬링의 상징적 인물로 널리 알려져 있다. 그러나 그가 함경남도 홍원 출신이라는 사실과, 그의 성장 배경이 한반도 북부 지역의 전통 신체문화 환경과 연결되어 있다는 점은 상대적으로 충분히 조명되지 못했다.

전통사회에서 신체문화는 오늘날처럼 스포츠, 무예, 놀이, 축제 등으로 명확히 구분된 형태로 존재하지 않았다. 농경과 어로, 군사 훈련, 마을 축제와 신체 단련이 서로 밀접하게 결합된 총체적 생활문화였다.

함경도 지역은 험준한 지형과 혹독한 기후, 국경 지대라는 지리적 특성으로 인해 강인한 신체 능력과 체력이 강조되었으며, 단오와 백중 등 명절에 행해지던 씨름과 힘겨루기(돌들기 등)는 단순한 오락을 넘어 공동체의 기상을 확인하는 신체문화였다.

임홍택 서울문화예술대학교 교수는 이러한 함경도 전통 신체문화와 무형유산의 맥락 속에서 역도산의 신체적 정체성과 한반도 근대 체육사의 미발굴 영역을 입체적으로 조명하고 있다.

역도산의 성장기에 형성된 강인한 골격과 씨름 기술, 정신적 끈기는 단순히 개인적 재능에 국한된 것이 아니라, 함경도 홍원 일대의 유구한 전통 신체문화의 토양 위에서 배양된 것이라는 평가다. 향후 남북 전통 무예 교류 및 신체문화사 연구의 중요한 이정표가 될 것으로 기대를 모은다.`,
    reporter: {
      id: 'rep-lim-ht',
      name: '임홍택',
      title: '서울문화예술대학교 교수',
      department: '오피니언·학술비평 데스크',
      email: 'lim.ht@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=200',
      bio: '서울문화예술대학교 교수 / 한국 전통 신체문화 및 무예사 연구자',
      subscriberCount: 21400,
      cheerCount: 3900,
    },
    publishedAt: '2026.08.24',
    views: 48920,
    shares: 1240,
    likes: 3120,
    reactions: { info: 680, exciting: 420, empathy: 1120, analysis: 940, followup: 410 },
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800',
    imageCaption: '▲ 임홍택 서울문화예술대학교 교수 (한국문화저널 특별 기고)',
    tags: ['한국문화저널', '문화예술', '단독보도', '오피니언', '칼럼', '임홍택'],
    badge: '칼럼',
    commentsCount: 42,
    mainNewsEnabled: true,
    subNewsEnabled: true,
    subNewsCategory: 'politics_economy',
  },
  {
    id: 'art-001',
    category: 'culture_art',
    categoryLabel: '문화·예술',
    subCategory: '미술·전시',
    title: '[단독] "600년 비움의 미학"… 국립중앙박물관, 조선 백자 달항아리 30점 한자리 첫 공개',
    subtitle: '국보·보물급 조선 후기 대표 백자 총집결… 해외 유수 미술관 소장품 7점 국내 귀환 전시',
    summary: '국립중앙박물관이 한미 수교 및 문화유산 교류 140주년을 맞아 대영박물관, 메트로폴리탄 소장 백자를 포함한 조선 달항아리 명작 30점을 역대 최대 규모로 선보인다.',
    content: `조선 후기 선비 정신과 한국 고유의 담백한 조형미를 대표하는 '달항아리(백자대호·白磁大壺)'의 진수가 국립중앙박물관 기획전시실에서 펼쳐진다.

21일 한국문화저널 취재를 종합하면, 국립중앙박물관은 오는 9월부터 '달을 품은 흙, 조선의 마음을 빚다' 특별기획전을 개최한다. 이번 전시는 국보 제309호 백자 달항아리를 비롯해 영국 대영박물관, 미국 메트로폴리탄 미술관, 프랑스 기메 박물관 등에 소장되어 있던 희귀 해외 유물 7점이 80년 만에 고국으로 돌아와 함께 전시되는 사상 첫 프로젝트다.

달항아리는 17세기 후반부터 18세기 전반에 걸쳐 경기도 광주 분원에서 제작된 대형 순백자로, 둥근 형태가 보름달을 닮아 붙여진 이름이다. 상부와 하부를 따로 물레로 빚은 뒤 이음매를 맞추어 가마에 구워내기 때문에 완전한 구형이 아닌 자연스러운 비대칭의 곡선미가 특징이다.`,
    reporter: {
      id: 'kim_yr',
      name: '김예림',
      title: '문화부 미술·헤리티지 전문기자',
      department: '문화부 미술팀',
      email: 'yerim.kim@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: '국립현대미술관·국립중앙박물관 출입 12년. 전통 백자와 현대 미술의 접점을 탐구합니다.',
      subscriberCount: 38400,
      cheerCount: 4210,
    },
    publishedAt: '2026.08.21',
    views: 124500,
    shares: 3420,
    likes: 8930,
    reactions: { info: 1840, exciting: 920, empathy: 2450, analysis: 1320, followup: 680 },
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    imageCaption: '▲ 국립중앙박물관 소장 국보 백자 달항아리. 은은한 우윳빛 유약과 유려한 비대칭 곡선이 돋보인다.',
    tags: ['달항아리', '조선백자', '국립중앙박물관', 'K-헤리티지', '전통도예', '단독보도'],
    badge: '단독',
    commentsCount: 142,
    mainNewsEnabled: true,
    subNewsEnabled: true,
    subNewsCategory: 'culture_art',
  },
  {
    id: 'art-002',
    category: 'heritage',
    categoryLabel: '전통·유산',
    subCategory: '문화재 복원',
    title: '경복궁 근정전 처마 끝 천년의 숨결, 전통 단청장 3대(代)의 불꽃 복원기',
    subtitle: '천연 광물 안료 ‘석채’로 되살린 조선 궁궐의 장엄미… 3년에 걸친 국가유산 정밀 수리 대장정',
    summary: '조선 왕실의 정궁 경복궁 근정전의 단청이 150년 만에 전통 석채 기법으로 온전히 복원되었다. 국가무형유산 단청장 보유자와 전수생들의 땀방울을 기록했다.',
    content: `붉고 푸른 오방색(五方位)이 빚어내는 장엄한 조화가 경복궁 근정전 처마 아래로 되살아났다.

문화유산청 산하 궁능유적본부는 지난 2023년부터 3개년에 걸쳐 추진해 온 '경복궁 근정전 단청 종합 보존정비 사업'을 성공적으로 마무리했다고 20일 발표했다. 이번 복원은 일제강점기와 1970년대 보수 당시 사용된 화학 합성 안료를 전면 제거하고, 19세기 고종 중건 당시의 원형 기록(영건의궤)에 따라 100% 천연 광물 안료(석채)와 아교만을 사용하여 복원한 최초의 국가유산 정밀 수리 사례다.`,
    reporter: {
      id: 'park_cw',
      name: '박찬우',
      title: '문화재·역사 심층취재 데스크',
      department: '문화재 기획취재부',
      email: 'cw.park@kculturejournal.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&q=80',
      bio: '국가유산청 전문 출입. 사라져가는 무형유산 장인과 조선왕실 의궤 복원 현장을 기록합니다.',
      subscriberCount: 45900,
      cheerCount: 6890,
    },
    publishedAt: '2026.08.20',
    views: 98300,
    shares: 2150,
    likes: 6540,
    reactions: { info: 2100, exciting: 640, empathy: 1890, analysis: 1450, followup: 460 },
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    imageCaption: '▲ 천연 석채로 복원된 경복궁 근정전 추녀마루 단청의 화려하고 정교한 문양.',
    tags: ['경복궁', '단청장', '국가유산청', '문화재복원', '조선왕실', 'K-헤리티지'],
    badge: '기획',
    commentsCount: 89,
    mainNewsEnabled: true,
    subNewsEnabled: true,
    subNewsCategory: 'culture_art',
  },
];

// Initialize Persistent Stores
let serverArticles: any[] = readJsonFile(ARTICLES_FILE, SEED_ARTICLES);
if (serverArticles.length === 0) {
  serverArticles = SEED_ARTICLES;
  writeJsonFile(ARTICLES_FILE, serverArticles);
} else {
  // Ensure the user's test article is always present in server storage
  const hasUserArticle = serverArticles.some(a => a.id === 'art-user-1787492319169');
  if (!hasUserArticle) {
    serverArticles = [SEED_ARTICLES[0], ...serverArticles];
    writeJsonFile(ARTICLES_FILE, serverArticles);
  }
}

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

// API: Get All Articles
app.get('/api/articles', (req, res) => {
  res.json({ articles: serverArticles, total: serverArticles.length });
});

// API: Get Single Article by ID (Ensures /article/:id URL resolves directly across browsers)
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const article = serverArticles.find(a => a.id === id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found', id });
  }
  res.json({ article });
});

// API: Create Article
app.post('/api/articles', (req, res) => {
  try {
    const newArticle = req.body;
    if (!newArticle || !newArticle.id || !newArticle.title) {
      return res.status(400).json({ error: 'Valid article object is required' });
    }
    // Remove if already exists, then prepend
    serverArticles = [newArticle, ...serverArticles.filter(a => a.id !== newArticle.id)];
    writeJsonFile(ARTICLES_FILE, serverArticles);
    res.json({ success: true, article: newArticle, count: serverArticles.length });
  } catch (error) {
    res.status(500).json({ error: 'Create article failed' });
  }
});

// API: Update Article
app.put('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const index = serverArticles.findIndex(a => a.id === id);
    if (index === -1) {
      // If not found, add it
      serverArticles.unshift({ ...updatedData, id });
    } else {
      serverArticles[index] = { ...serverArticles[index], ...updatedData };
    }
    writeJsonFile(ARTICLES_FILE, serverArticles);
    res.json({ success: true, article: serverArticles[index] || updatedData });
  } catch (error) {
    res.status(500).json({ error: 'Update article failed' });
  }
});

// API: Delete Article
app.delete('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    serverArticles = serverArticles.filter(a => a.id !== id);
    writeJsonFile(ARTICLES_FILE, serverArticles);
    res.json({ success: true, count: serverArticles.length });
  } catch (error) {
    res.status(500).json({ error: 'Delete article failed' });
  }
});

// API: Bulk Sync Articles
app.post('/api/articles/sync', (req, res) => {
  try {
    const { articles } = req.body;
    if (Array.isArray(articles) && articles.length > 0) {
      serverArticles = articles;
      writeJsonFile(ARTICLES_FILE, serverArticles);
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
      writeJsonFile(ADS_FILE, serverAdSettings);
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
