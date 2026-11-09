const C='csl-v3';
const FILES=['./','./index.html','./manifest.json','./icon.svg'];
const CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.min.js';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(FILES);try{await c.add(new Request(CDN,{mode:'cors'}));}catch(_){}}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  // Never cache Supabase API/auth traffic (private data, must stay live)
  if(u.hostname.endsWith('.supabase.co')) return;
  // CDN library: cache-first (versioned URL never changes)
  if(req.url===CDN){e.respondWith(caches.match(CDN).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(CDN,cp));}return res;})));return;}
  if(u.origin!==self.location.origin) return;
  // App files: network-first, fall back to cache offline
  e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp));}return r;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
});
