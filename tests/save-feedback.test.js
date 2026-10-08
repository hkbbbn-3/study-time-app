const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=require('./helpers/source.js').appSource();
function app(){
  let now=1000;
  const c={state:{records:[],subjects:[{id:'s',name:'数学'}]},Date:{now:()=>now},
    isoToday:()=> '2026-10-06',fmtMin:n=>`${n}分`,totalOn:d=>c.state.records.filter(r=>r.date===d).reduce((n,r)=>n+r.minutes,0),
    showToast:(m,undo)=>{c.message=m;c.undo=undo;},persist:()=>{},render:()=>{}};
  vm.createContext(c);
  const start=source.indexOf('function showRecordSaveFeedback(');
  assert.notEqual(start,-1,'save feedback helper exists');
  vm.runInContext(source.slice(start,source.indexOf('// ---------- streak ----------',start)),c);
  c.advance=()=>{now+=10001;};return c;
}
test('save reports subject and total; undo removes only this batch',()=>{
  const c=app(),old={id:'old',date:'2026-10-06',minutes:15},r={id:'new',date:'2026-10-06',subjectId:'s',minutes:30};
  c.state.records=[old,r];c.showRecordSaveFeedback([r],null);
  assert.match(c.message,/数学30分.*今日の合計45分/);c.undo();
  assert.equal(c.state.records.length,1);assert.equal(c.state.records[0].id,'old');
});
test('edit undo restores original date, subject, duration and memo',()=>{
  const c=app(),before={id:'r',date:'2026-10-01',subjectId:'s',minutes:27,memo:'前'},after={...before,date:'2026-10-06',minutes:60,memo:'後'};
  c.state.records=[after];c.showRecordSaveFeedback([after],before);c.undo();
  assert.equal(JSON.stringify(c.state.records[0]),JSON.stringify(before));
});
test('expired undo and undo after another edit do not change records',()=>{
  for(const expired of [true,false]){
    const c=app(),r={id:'r',date:'2026-10-06',subjectId:'s',minutes:30};c.state.records=[r];
    c.showRecordSaveFeedback([r],null);if(expired)c.advance();else r.minutes=60;
    c.undo();assert.equal(c.state.records.length,1);
  }
});
test('multiple subjects report count and actual total for the saved day',()=>{
  const c=app(),rs=['a','b'].map(id=>({id,date:'2026-10-01',subjectId:'s',minutes:60}));
  c.state.records=rs;c.showRecordSaveFeedback(rs,null);assert.match(c.message,/2件.*120分/);c.undo();assert.equal(c.state.records.length,0);
});
test('timer confirmation saves a batch that can be undone without restoring a timer',()=>{
  const c=app();let id=0;c.uid=()=>`t${++id}`;c.goalFor=()=>0;
  c.ui={timerMemo:'計測'};c.state.timer={confirming:true,subjectIds:['s','s2'],startDate:'2026-10-06',finalMinutes:27};
  vm.runInContext(source.slice(source.indexOf('function onClick(e){'),source.indexOf('function onInput(e){')),c);
  c.onClick({target:{closest:()=>({dataset:{action:'confirm-timer'}})}});
  assert.equal(c.state.records.length,2);assert.equal(c.state.timer,null);
  assert.match(c.message,/2件.*54分/);c.undo();assert.equal(c.state.records.length,0);assert.equal(c.state.timer,null);
});
