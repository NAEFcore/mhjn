const RSS_URL = 'https://www.mcst.go.kr/common/rss/press.jsp';

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function stripHtml(value: string): string {
  return decodeXml(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(block: string, tag: string): string {
  const cdata = new RegExp('<' + tag + '(?:\\s[^>]*)?>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/' + tag + '>', 'i').exec(block);
  if (cdata) return cdata[1].trim();

  const plain = new RegExp('<' + tag + '(?:\\s[^>]*)?>\\s*([\\s\\S]*?)\\s*<\\/' + tag + '>', 'i').exec(block);
  return plain ? decodeXml(plain[1]) : '';
}

function getImage(block: string, description: string): string {
  const enclosure = /<enclosure[^>]+url=["']([^"']+)["']/i.exec(block);
  if (enclosure) return decodeXml(enclosure[1]);

  const media = /<(?:media:content|media:thumbnail)[^>]+url=["']([^"']+)["']/i.exec(block);
  if (media) return decodeXml(media[1]);

  const img = /<img[^>]+src=["']([^"']+)["']/i.exec(description);
  return img ? decodeXml(img[1]) : '';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Korea-Culture-Journal-RSS/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`MCST RSS returned HTTP ${response.status}`);
    }

    const xml = await response.text();
    const itemBlocks = xml.match(/<item(?:\\s[^>]*)?>[\\s\\S]*?<\\/item>/gi) || [];

    const items = itemBlocks.slice(0, 30).map((block, index) => {
      const title = stripHtml(getTag(block, 'title'));
      const link = stripHtml(getTag(block, 'link'));
      const guid = stripHtml(getTag(block, 'guid')) || link;
      const descriptionRaw = getTag(block, 'description');
      const description = stripHtml(descriptionRaw);
      const pubDate = stripHtml(getTag(block, 'pubDate'));

      return {
        id: guid || `mcst-rss-${index}`,
        title,
        link,
        description,
        pubDate,
        imageUrl: getImage(block, descriptionRaw),
        source: '문화체육관광부',
      };
    }).filter((item) => item.title && item.link);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ items, source: RSS_URL, fetchedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('MCST RSS API error:', error);
    res.status(502).json({
      items: [],
      error: '문화체육관광부 RSS를 가져오지 못했습니다.',
      detail: error?.message || 'Unknown error',
    });
  }
}
