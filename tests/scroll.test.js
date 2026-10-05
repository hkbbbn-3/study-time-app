const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the real render/save flow with an already displaced canvas. Browser
// layout is not simulated; this checks recovery from a retained internal offset.
function app(){
  const source = fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');
  const canvas = {innerHTML:'',scrollTop:180}, content = {innerHTML:''};
  const c = {
    state:{theme:'light',timer:null,records:[{id:'r1',date:'2026-10-01',subjectId:'s1',minutes:60,memo:''}]},
    ui:{tab:'record',form:{editingId:'r1',date:'2026-10-01',subjectIds:['s1'],hours:2,minutes:0,memo:'updated'},editReturnTab:'calendar'},
    TAB_ORDER:['home','calendar','record','settings'],
    icon:()=>'', logomark:()=>'', tabBtn:()=>'', renderPage:()=>'<p>page</p>',
    bindEvents:()=>{}, focusModal:()=>{}, persist:()=>{}, showToast:()=>{},
    goalFor:()=>0, totalOn:()=>0, isoToday:()=>'2026-10-05',
    document:{getElementById:id=>id==='canvas'?canvas:content},
    window:{scrollY:450,scrollTo(x,y){this.scrollY=y;}},
  };
  vm.createContext(c);
  for(const [start,end] of [
    ['function render(){','function closeAnyModal(){'],
    ['function submitRecord(){','function saveGoalsFromForm(){'],
  ]){
    const a=source.indexOf(start), b=source.indexOf(end,a);
    assert.ok(a>=0 && b>a);
    vm.runInContext(source.slice(a,b),c);
  }
  return {c,canvas,content};
}

test('render clears the hidden canvas offset without resetting normal page scroll', ()=>{
  const {c,canvas,content}=app();
  c.render();
  assert.equal(canvas.scrollTop,0);
  assert.equal(c.window.scrollY,450);
  assert.equal(content.innerHTML,'<p>page</p>');
});

test('saving a calendar edit returns to the true top with no retained canvas offset', ()=>{
  const {c,canvas}=app();
  c.submitRecord();
  assert.equal(c.state.records[0].minutes,120);
  assert.equal(c.ui.tab,'calendar');
  assert.equal(c.ui.selectedDate,'2026-10-01');
  assert.equal(c.window.scrollY,0);
  assert.equal(canvas.scrollTop,0);
});
