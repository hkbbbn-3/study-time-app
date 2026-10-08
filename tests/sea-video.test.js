const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=require('./helpers/source.js').appSource();
test('sea video plays only when visible and motion is allowed, without restarting',()=>{
  let plays=0,pauses=0;
  const video={paused:true,currentTime:3,play(){plays++;this.paused=false;return Promise.resolve();},pause(){pauses++;this.paused=true;}};
  const c={state:{design:'sea'},document:{hidden:false,getElementById:()=>video},window:{matchMedia:()=>({matches:false})}};
  vm.createContext(c);const start=source.indexOf('function syncSeaVideo(');assert.notEqual(start,-1);
  vm.runInContext(source.slice(start,source.indexOf('// ---------- init ----------',start)),c);
  c.syncSeaVideo();c.syncSeaVideo();assert.equal(plays,1);assert.equal(video.currentTime,3);
  c.state.design='calm';c.syncSeaVideo();assert.equal(pauses,1);
  c.state.design='sea';c.document.hidden=true;c.syncSeaVideo();assert.equal(plays,1);
  c.document.hidden=false;c.window.matchMedia=()=>({matches:true});c.syncSeaVideo();assert.equal(plays,1);
});
test('sea video cache warm-up waits for the service worker to take control, then runs once',async()=>{
  const listeners={};let matched=0,fetched=0;
  const video={paused:true,currentSrc:'https://example.test/diver.mp4',play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};
  const c={state:{design:'sea'},document:{hidden:false,getElementById:()=>video},window:{matchMedia:()=>({matches:false})},
    navigator:{serviceWorker:{controller:null,addEventListener:(type,fn)=>{listeners[type]=fn;}}},
    caches:{match:async()=>{matched++;return undefined;}},fetch:async()=>{fetched++;}};
  vm.createContext(c);const start=source.indexOf('function syncSeaVideo(');
  vm.runInContext(source.slice(start,source.indexOf('// ---------- init ----------',start)),c);
  const tick=()=>new Promise(r=>setTimeout(r,0));
  c.syncSeaVideo();c.syncSeaVideo();await tick();
  assert.equal(matched,0,'nothing is cached before the service worker controls the page');
  assert.equal(typeof listeners.controllerchange,'function','it must retry when the service worker takes control');
  c.navigator.serviceWorker.controller={};listeners.controllerchange();await tick();
  assert.equal(matched,1);assert.equal(fetched,1);
  c.syncSeaVideo();await tick();assert.equal(matched,1,'warm-up runs only once');
});
