import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'responsible-rock-7t3g1';
const DATABASE_ID = process.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-iatpc-ffb9e31b-129a-42aa-953b-b8ceceaf87b0';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBc2q_4Pbp6Ai9qobzfAJQJOVHIRxg_IHU';
const DOCUMENT_PATH = `projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/system_settings/ads`;

const DEFAULT_ADS = {
  belowSubtitle: '',
  inBody: '',
  afterBody: '',
  sidebarTop: '',
  sidebarBottom: '',
  belowSubtitleEnabled: true,
};

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean };

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

function fromFirestoreValue(value?: FirestoreValue): string | boolean | undefined {
  if (!value) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  return undefined;
}

function toFirestoreFields(ads: Record<string, unknown>) {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(ads)) {
    if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (typeof value === 'string') fields[key] = { stringValue: value };
  }
  return fields;
}

async function getAds(): Promise<Record<string, string | boolean>> {
  const url = `https://firestore.googleapis.com/v1/${DOCUMENT_PATH}?key=${encodeURIComponent(API_KEY)}`;
  const response = await fetch(url);

  if (response.status === 404) return { ...DEFAULT_ADS };
  if (!response.ok) {
    throw new Error(`Firestore GET failed: ${response.status}`);
  }

  const document = (await response.json()) as FirestoreDocument;
  const result: Record<string, string | boolean> = { ...DEFAULT_ADS };

  for (const [key, value] of Object.entries(document.fields || {})) {
    const parsed = fromFirestoreValue(value);
    if (parsed !== undefined) result[key] = parsed;
  }

  return result;
}

async function saveAds(ads: Record<string, unknown>) {
  const url = `https://firestore.googleapis.com/v1/${DOCUMENT_PATH}?key=${encodeURIComponent(API_KEY)}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(ads) }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore PATCH failed: ${response.status} ${detail}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const ads = await getAds();
      return res.status(200).json({ ads });
    }

    if (req.method === 'POST') {
      const incoming = req.body?.ads;
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        return res.status(400).json({ error: 'Invalid ads payload' });
      }

      const current = await getAds();
      const merged = { ...current, ...incoming };
      await saveAds(merged);
      return res.status(200).json({ ads: merged });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ads API error:', error);
    return res.status(500).json({ error: 'Failed to load shared ad settings' });
  }
}
