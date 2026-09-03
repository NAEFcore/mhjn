const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'responsible-rock-7t3g1';
const DATABASE_ID = process.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-iatpc-ffb9e31b-129a-42aa-953b-b8ceceaf87b0';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBc2q_4Pbp6Ai9qobzfAJQJOVHIRxg_IHU';

const firestoreDocumentUrl = () =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/system_settings/ads?key=${encodeURIComponent(API_KEY)}`;

function defaultHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
  };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(firestoreDocumentUrl(), { method: 'GET' });
      if (response.status === 404) {
        res.status(200).json({ ads: null });
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        console.error('[ADS API] Firestore GET failed:', response.status, data);
        res.status(response.status).json({ error: 'Failed to load ad settings' });
        return;
      }

      const payload = data?.fields?.payload?.stringValue;
      let ads = null;
      if (payload) {
        try {
          ads = JSON.parse(payload);
        } catch (parseError) {
          console.error('[ADS API] Invalid stored ad payload:', parseError);
        }
      }

      res.status(200).json({ ads });
    } catch (error) {
      console.error('[ADS API] GET error:', error);
      res.status(500).json({ error: 'Failed to load ad settings' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const ads = body?.ads;
      if (!ads || typeof ads !== 'object') {
        res.status(400).json({ error: 'Missing ads settings' });
        return;
      }

      const payload = JSON.stringify(ads);
      const firestoreBody = {
        fields: {
          payload: { stringValue: payload },
          updatedAt: { stringValue: new Date().toISOString() },
        },
      };

      const response = await fetch(firestoreDocumentUrl(), {
        method: 'PATCH',
        headers: defaultHeaders(),
        body: JSON.stringify(firestoreBody),
      });
      const data = await response.json();

      if (!response.ok) {
        console.error('[ADS API] Firestore POST failed:', response.status, data);
        res.status(response.status).json({ error: 'Failed to save ad settings' });
        return;
      }

      res.status(200).json({ ok: true, updatedAt: data?.fields?.updatedAt?.stringValue || null });
    } catch (error) {
      console.error('[ADS API] POST error:', error);
      res.status(500).json({ error: 'Failed to save ad settings' });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  res.status(405).json({ error: 'Method not allowed' });
};
