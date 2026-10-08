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
