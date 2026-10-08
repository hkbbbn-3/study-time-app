// ---------- PWA: service worker registration ----------
// Only works when served over http(s) (e.g. VSCode Live Server, GitHub Pages, etc.) —
// browsers block service workers on file:// URLs, so this silently no-ops there.
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ---------- Deep Sea backdrop ----------
// Built once, directly on <body>, OUTSIDE #canvas: render() replaces #canvas's whole innerHTML on
// every state change, so anything animated or loaded (a diver sprite, bubbles) must not live there.
// Layers, back to front — each is an empty mounting point until its effect is added:
//   .sea-gradient   the water column (surface -> shallows -> mid -> deep -> trench); scroll moves it
//   .sea-light      light entering from the surface; fades out as you go deeper
//   .sea-particles  bubbles / marine snow
//   .sea-life       fish, jellyfish (.sea-slot children)
//   .sea-diver      the diver
// The layers drift with scroll through CSS (animation-timeline: scroll(), see style.css). The diver's offset follows
// scroll and the mouse pointer through initSeaMotion below, which throttles its updates with requestAnimationFrame.
function ensureSeaLayers(){
  if(document.getElementById('seaLayers')) return;
  const el = document.createElement('div');
  el.id = 'seaLayers';
  el.className = 'sea-layers';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="sea-gradient"></div><div class="sea-light"></div><div class="sea-particles"></div><div class="sea-life"></div><div class="sea-diver"><video id="seaVideo" muted loop playsinline preload="none" poster="assets/diver-loop-poster.jpg" src="assets/diver-loop.mp4" tabindex="-1"></video></div>';
  document.body.insertBefore(el, document.body.firstChild);
  document.getElementById('seaVideo').muted=true;
  initSeaMotion();
  document.addEventListener('visibilitychange',syncSeaVideo);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncSeaVideo);
  syncSeaVideo();
}

function initSeaMotion(){
  const layer=document.getElementById('seaLayers');
  let pointerX=0,pointerY=0,pending=false;
  const update=()=>{
    pending=false;
    const active=state.design==='sea' && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const range=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    const depth=range ? Math.max(0,Math.min(1,window.scrollY/range))*96 : 0;
    layer.style.setProperty('--diver-x',`${active ? pointerX : 0}px`);
    layer.style.setProperty('--diver-y',`${active ? depth+pointerY : 0}px`);
  };
  const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse' || state.design!=='sea') return;
    pointerX=Math.max(-1,Math.min(1,e.clientX/window.innerWidth*2-1))*16;
    pointerY=Math.max(-1,Math.min(1,e.clientY/window.innerHeight*2-1))*12;
    schedule();
  },{passive:true});
  window.addEventListener('pointerout',e=>{if(!e.relatedTarget){pointerX=0;pointerY=0;schedule();}});
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',schedule);
  update();
}

function syncSeaVideo(){
  const video=document.getElementById('seaVideo');
  if(!video) return;
  const active=state.design==='sea' && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(active){
    warmSeaVideoCache(video);
    if(video.paused) video.play().catch(()=>{});
  }else if(!video.paused){video.pause();}
}

// The diver video is not precached by the service worker, so only Deep Sea users download it. Once Deep Sea is
// in use, fetch it once (a plain GET goes through sw.js's network-first handler, which caches it) so it also plays offline.
let seaVideoWarmed=false, seaVideoWaiting=false;
function warmSeaVideoCache(video){
  if(seaVideoWarmed || typeof caches==='undefined' || typeof navigator==='undefined' || !navigator.serviceWorker) return;
  if(!navigator.serviceWorker.controller){
    // First visit: the service worker only takes control a moment after it installs, so try again then.
    if(!seaVideoWaiting){
      seaVideoWaiting=true;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{ seaVideoWaiting=false; syncSeaVideo(); },{once:true});
    }
    return;
  }
  seaVideoWarmed=true;
  const src=video.currentSrc||video.src;
  caches.match(src).then(hit=>{if(!hit) return fetch(src);}).catch(()=>{seaVideoWarmed=false;});
}

