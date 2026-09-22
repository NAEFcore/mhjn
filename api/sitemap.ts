import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBc2q_4Pbp6Ai9qobzfAJQJOVHIRxg_IHU',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'responsible-rock-7t3g1.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'responsible-rock-7t3g1',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:1075971069890:web:be3034d6da225ae56fe85b',
};

const DATABASE_ID =
  process.env.VITE_FIREBASE_DATABASE_ID ||
  'ai-studio-iatpc-ffb9e31b-129a-42aa-953b-b8ceceaf87b0';

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  let date: Date | null = null;

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  } else if (typeof value === 'object') {
    const v = value as any;
    if (typeof v.toDate === 'function') {
      try { date = v.toDate(); } catch {}
    } else if (typeof v.seconds === 'number') {
      date = new Date(v.seconds * 1000);
    } else if (typeof v._seconds === 'number') {
      date = new Date(v._seconds * 1000);
    }
  }

  return date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 10)
    : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET');
    return res.send('Method Not Allowed');
  }

  try {
    const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app, DATABASE_ID);
    const snapshot = await getDocs(collection(db, 'articles'));

    const urls: Array<{ id: string; lastmod: string | null }> = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const id = String(data.articleId || docSnap.id).trim();
      if (!id) return;

      // Only expose articles intended to be public/searchable.
      if (data.status && data.status !== 'PUBLISHED') return;
      if (data.mainNewsEnabled === false) return;
      if (data.requiresEditorApproval && data.status !== 'PUBLISHED') return;

      urls.push({
        id,
        lastmod: toDateOnly(data.updatedAt || data.publishedAt || data.createdAt),
      });
    });

    urls.sort((a, b) => a.id.localeCompare(b.id));

    const fixedUrls = [
      { loc: 'https://mhjn.vercel.app/', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://mhjn.vercel.app/sub-news', priority: '0.8', changefreq: 'daily' },
      { loc: 'https://mhjn.vercel.app/kcj-radio', priority: '0.6', changefreq: 'weekly' },
    ];

    const fixedXml = fixedUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

    const articleXml = urls.map((u) => `  <url>
    <loc>https://mhjn.vercel.app/article/${encodeURIComponent(u.id)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fixedXml}
${articleXml}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('[SITEMAP] Failed to generate sitemap:', error);
    return res.status(500).send('Sitemap generation failed');
  }
}
