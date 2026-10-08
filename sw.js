const CACHE_NAME = 'study-time-v36';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './backup.js',
  './range-total.js',
  './script.js',
  './assets/diver-loop-poster.jpg',
  './manifest.json',
  './icon-192.png',
  './icon-192-maskable.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Preserve native video seeking/range responses; do not cache partial bodies.
  if (event.request.headers.has('range')) {
    event.respondWith(fetch(event.request).catch(async()=>{
      const cached=await caches.match(event.request.url);
      if(!cached) return Response.error();
      const data=await cached.arrayBuffer(),size=data.byteLength;
      const match=/^bytes=(\d*)-(\d*)$/.exec(event.request.headers.get('range'));
      if(!match || (!match[1]&&!match[2])) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      const start=match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
      const end=match[1] && match[2] ? Math.min(size-1,Number(match[2])) : size-1;
      if(start>end || start>=size) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      return new Response(data.slice(start,end+1),{status:206,headers:{
        'Content-Type':cached.headers.get('Content-Type')||'video/mp4',
        'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'
      }});
    }));
    return;
  }
  // Network-first: always try to fetch the latest version, and only fall back to the
  // cache when offline. (A cache-first strategy here would keep serving whatever was
  // cached on first install forever, even after the app's files are updated.)
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
