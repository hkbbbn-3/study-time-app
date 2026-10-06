const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('offline video serves valid byte ranges and rejects invalid ranges',async()=>{
  const handlers={};const c={self:{addEventListener:(k,f)=>handlers[k]=f},Response,
    fetch:async()=>{throw Error('offline');},caches:{match:async()=>new Response(new Uint8Array([0,1,2,3,4]),{headers:{'Content-Type':'video/mp4'}})}};
  vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'),c);
  for(const [range,status,expected] of [['bytes=1-3',206,[1,2,3]],['bytes=-2',206,[3,4]],['bytes=4-',206,[4]],['bytes=9-',416,[]]]){
    let response;handlers.fetch({request:{method:'GET',url:'https://example.test/video.mp4',headers:new Headers({range})},respondWith:r=>response=r});
    const r=await response;assert.equal(r.status,status);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],expected);
  }
});
