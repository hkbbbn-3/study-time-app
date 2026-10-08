const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
function load(c, start, end){
  vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))), c);
}
function app(){
  const c = {ui:{tab:'home',recordMode:'manual',homeDetails:false,weekOffset:0,homeYear:2026,homeMonth:9,
    form:{date:'2026-10-06',hours:0,minutes:27,subjectIds:['s'],memo:'途中のメモ',editingId:null}},
    state:{subjects:[],records:[],timer:null},document:{getElementById:()=>null,querySelector:()=>null},window:{scrollTo:()=>{}},
    isoToday:()=> '2026-10-06',render:()=>{},recordsOn:()=>[],renderTimerCard:()=>'<div id="timer-test">timer</div>',
    icon:()=>'',formatDateFull:()=>'',formatDateJp:()=>'',escapeHtml:s=>s||'',
    goalFor:()=>120,totalOn:()=>0,computeStreak:()=>0,renderDeadlineHome:()=>'',renderBalanceHome:()=>'',
    computeAllTimeStats:()=>({totalMinutes:0,dayCount:0,firstDateLabel:'―'}),
    computeLevel:()=>({level:1,remain:300,pct:0}),renderRangeBody:()=>'',fmtMin:n=>`${n}分`,fmtMinHtml:n=>`${n}分`,
    WEEKDAY_LABELS:['月','火','水','木','金','土','日'],timerElapsedMs:()=>65000,fmtElapsed:()=> '1:05',
    Stats:require('../stats.js'),subjectById:()=>({name:'s',color:'#000'}),safeColor:s=>s};
  vm.createContext(c);
  load(c,'function dateToISO(d){','function isWeekend(');
  load(c,'function onClick(e){','function onInput(e){');
  load(c,'function onInput(e){','function onChange(e){');
  load(c,'function renderHome(){','function computeAllTimeStats(){'); // includes the 統計 card helpers
  load(c,'function recordShortcutHistory(){','function renderRecord(){');
  load(c,'function renderRecord(){','function formatDateJp(iso){');
  return c;
}
function click(c, action, data={}){c.onClick({target:{closest:()=>({dataset:{action,...data}})}});}
test('home shortcuts open the requested recording method without losing a draft',()=>{
  const c=app(), draft=c.ui.form;
  click(c,'open-record',{mode:'timer'});
  assert.equal(c.ui.tab,'record'); assert.equal(c.ui.recordMode,'timer');
  click(c,'record-mode',{mode:'manual'});
  assert.equal(c.ui.recordMode,'manual'); assert.equal(c.ui.form,draft);
  assert.equal(c.ui.form.memo,'途中のメモ'); assert.equal(c.ui.form.minutes,27);
});
test('recording shows only the chosen method and opening an edit selects manual entry',()=>{
  const c=app();
  assert.match(c.renderRecord(),/recordFormCard/); assert.doesNotMatch(c.renderRecord(),/timer-test/);
  c.ui.recordMode='timer';
  assert.match(c.renderRecord(),/timer-test/); assert.doesNotMatch(c.renderRecord(),/recordFormCard/);
  c.state.records=[{id:'r',subjectId:'s',date:'2026-10-01',minutes:27,memo:'編集'}];
  click(c,'edit-record',{id:'r'});
  assert.match(c.renderRecord(),/recordFormCard/); assert.doesNotMatch(c.renderRecord(),/timer-test/);
});
test('calendar add opens manual entry for the selected date even after using the timer',()=>{
  const c=app(); c.ui.recordMode='timer';
  click(c,'goto-record-day',{date:'2026-10-01'});
  assert.equal(c.ui.recordMode,'manual'); assert.equal(c.ui.form.date,'2026-10-01');
});
test('an edit draft can be left temporarily to reach a live timer and restored',()=>{
  const c=app(); c.state.records=[{id:'r',subjectId:'s',date:'2026-10-01',minutes:27,memo:'編集'}];
  click(c,'edit-record',{id:'r'});
  click(c,'record-mode',{mode:'timer'});
  assert.match(c.renderRecord(),/timer-test/);
  click(c,'record-mode',{mode:'manual'});
  assert.match(c.renderRecord(),/recordFormCard/);
  assert.equal(c.ui.form.editingId,'r'); assert.equal(c.ui.form.minutes,27);
});
test('unsaved manual and timer memos survive renders before blur',()=>{
  const c=app();
  c.onInput({target:{dataset:{field:'memo'},value:'入力中'}});
  c.onInput({target:{dataset:{field:'timer-memo'},value:'計測メモ'}});
  assert.equal(c.ui.form.memo,'入力中'); assert.equal(c.ui.timerMemo,'計測メモ');
});
test('home offers both shortcuts and keeps detailed reports closed until requested',()=>{
  const c=app(); const h=c.renderHome();
  assert.match(h,/data-action="open-record"[^>]*data-mode="manual"/);
  assert.match(h,/data-action="open-record"[^>]*data-mode="timer"/);
  assert.doesNotMatch(h,/期間で合計を調べる/);
  click(c,'toggle-home-details');
  assert.equal(c.ui.homeDetails,true); assert.match(c.renderHome(),/期間で合計を調べる/);
});
test('home keeps running, paused and unconfirmed timers discoverable',()=>{
  const c=app();
  for(const timer of [{running:true},{running:false},{running:false,confirming:true,finalMinutes:27}]){
    c.state.timer=timer;
    assert.match(c.renderHome(),/homeTimerDisplay/);
    click(c,'open-record',{mode:'timer'});
    assert.equal(c.ui.recordMode,'timer'); assert.equal(c.state.timer,timer);
  }
});
