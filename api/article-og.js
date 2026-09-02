const PROJECT_ID='responsible-rock-7t3g1';
const DATABASE_ID='ai-studio-iatpc-ffb9e31b-129a-42aa-953b-b8ceceaf87b0';
const API_KEY='AIzaSyBc2q_4Pbp6Ai9qobzfAJQJOVHIRxg_IHU';
const FALLBACK_IMAGE='https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80';
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function val(f){if(!f)return '';return f.stringValue??f.integerValue??f.doubleValue??f.timestampValue??''}
export default async function handler(req,res){
 const id=String(req.query.id||'').replace(/[^a-zA-Z0-9_-]/g,'');
 if(!id)return res.status(400).send('Article ID required');
 const url='https://mhjn.vercel.app/article/'+encodeURIComponent(id);
 try{
  const endpoint='https://firestore.googleapis.com/v1/projects/'+PROJECT_ID+'/databases/'+DATABASE_ID+'/documents/articles/'+encodeURIComponent(id)+'?key='+API_KEY;
  const r=await fetch(endpoint);
  if(!r.ok)return res.status(404).send('<h1>기사를 찾을 수 없습니다</h1>');
  const d=await r.json(),f=d.fields||{},g=n=>val(f[n]);
  const status=g('status')||'PUBLISHED';
  if(status!=='PUBLISHED')return res.status(404).send('<h1>기사를 찾을 수 없습니다</h1>');
  const title=g('koreanTitle')||g('title')||'한국문화저널';
  const raw=g('summary')||g('koreanBody')||g('content')||'';
  const description=String(raw).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,200);
  const image=g('imageUrl')||FALLBACK_IMAGE;
  const date=g('publishedAt')||g('createdAt');
  const body=String(g('koreanBody')||g('content')||raw).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send('<!doctype html><html lang="ko" prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' | 한국문화저널</title><meta name="description" content="'+esc(description)+'"><link rel="canonical" href="'+url+'"><meta property="og:type" content="article"><meta property="og:site_name" content="한국문화저널"><meta property="og:locale" content="ko_KR"><meta property="og:url" content="'+url+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:image" content="'+esc(image)+'"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'+(date?'<meta property="article:published_time" content="'+esc(date)+'">':'')+'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+esc(title)+'"><meta name="twitter:description" content="'+esc(description)+'"><meta name="twitter:image" content="'+esc(image)+'"><style>body{margin:0;background:#f8f6f2;color:#171717;font-family:Arial,sans-serif}.wrap{max-width:820px;margin:auto;padding:28px 18px}.brand{font-weight:bold;color:#1b2a47;text-decoration:none}h1{font-size:clamp(28px,5vw,46px);line-height:1.3}.date{color:#777;margin-bottom:22px}.hero{width:100%;max-height:520px;object-fit:cover}.body{white-space:pre-wrap;font-size:18px;line-height:1.9;margin-top:24px}</style></head><body><main class="wrap"><a class="brand" href="https://mhjn.vercel.app/">한국문화저널 · Korea Culture Journal</a><h1>'+esc(title)+'</h1><div class="date">'+esc(date)+'</div><img class="hero" src="'+esc(image)+'" alt="'+esc(title)+'"><article class="body">'+esc(body)+'</article></main></body></html>');
 }catch(e){console.error(e);return res.status(500).send('Article temporarily unavailable');}
}