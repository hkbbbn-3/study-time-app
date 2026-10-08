const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('scroll and mouse move the existing backdrop with bounded offsets',()=>{
  const events={},values={},frames=[];
  const c={state:{design:'sea'},document:{hidden:false,documentElement:{scrollHeight:2000},getElementById:()=>({style:{setProperty:(k,v)=>values[k]=v}})},
    window:{scrollY:0,innerHeight:1000,innerWidth:1000,matchMedia:()=>({matches:false,addEventListener:()=>{}}),addEventListener:(k,f)=>events[k]=f},requestAnimationFrame:f=>frames.push(f)};
  vm.createContext(c);const source=require('./helpers/source.js').appSource();
  const start=source.indexOf('function initSeaMotion(');assert.notEqual(start,-1);
  vm.runInContext(source.slice(start,source.indexOf('function syncSeaVideo(',start)),c);c.initSeaMotion();
  c.window.scrollY=500;events.scroll();events.pointermove({pointerType:'mouse',clientX:1000,clientY:1000});
  assert.equal(frames.length,1);frames.shift()();
  assert.equal(values['--diver-x'],'16px');assert.equal(values['--diver-y'],'60px');
  c.window.scrollY=9000;events.scroll();frames.shift()();assert.equal(values['--diver-y'],'108px');
  c.window.matchMedia=()=>({matches:true});events.scroll();frames.shift()();assert.equal(values['--diver-y'],'0px');
});
