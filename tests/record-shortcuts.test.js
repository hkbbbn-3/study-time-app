const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=require('./helpers/source.js').appSource();
function app(){
  const c={state:{subjects:[{id:'a',name:'数学',color:'#fff'},{id:'b',name:'英語',color:'#fff'}],records:[]},
    ui:{form:{date:'2026-10-01',hours:0,minutes:27,subjectIds:['b'],memo:'入力中',editingId:null}},
    render:()=>{},isoToday:()=> '2026-10-06',recordsOn:()=>[],icon:()=>'',escapeHtml:s=>s||'',safeColor:()=> '#fff',
    formatDateFull:()=>'',formatDateJp:()=>'',fmtMin:n=>`${n}分`};
  vm.createContext(c);
  for(const [a,b] of [['// ---------- RECORD ----------','function formatDateJp(iso){'],['function onClick(e){','function onInput(e){']]){
    vm.runInContext(source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a))),c);
  }
  return c;
}
function click(c,action,data={}){c.onClick({target:{closest:()=>({dataset:{action,...data}})}});}
test('previous entry uses the last usable saved record, today and the current memo',()=>{
  const c=app();
  c.state.records=[{subjectId:'a',minutes:780},{subjectId:'deleted',minutes:30}];
  click(c,'reuse-last-record');
  assert.equal(c.ui.form.subjectIds.join(','),'a'); assert.equal(c.ui.form.hours,13);
  assert.equal(c.ui.form.minutes,0); assert.equal(c.ui.form.date,'2026-10-06');
  assert.equal(c.ui.form.memo,'入力中'); assert.equal(c.state.records.length,2);
  assert.match(c.renderRecord(),/<option value="13" selected>/);
});
test('recent subjects section is absent and the regular subject choices remain',()=>{
  const c=app();c.state.records=[{subjectId:'a',minutes:27}];
  const html=c.renderRecord();
  assert.doesNotMatch(html,/recent-subjects|最近使った科目/);
  assert.match(html,/subject-pill-grid/);
  assert.match(html,/数学/);assert.match(html,/英語/);
});
test('editing cannot be overwritten by shortcut actions',()=>{
  const c=app(); c.ui.form.editingId='r'; const before=JSON.stringify(c.ui.form);
  c.state.records=[{subjectId:'a',minutes:30}];
  click(c,'preset-record-time',{minutes:'60'}); click(c,'reuse-last-record');
  assert.equal(JSON.stringify(c.ui.form),before);
  assert.doesNotMatch(c.renderRecord(),/data-action="(?:reuse-last-record|preset-record-time)"/);
});
test('empty history has no previous-entry button and still permits exact minute input',()=>{
  const c=app(); const html=c.renderRecord();
  assert.doesNotMatch(html,/data-action="reuse-last-record"/);
  assert.match(html,/<option value="27" selected>/);
});
test('duration presets are absent while exact time fields remain',()=>{
  const c=app();const html=c.renderRecord();
  assert.doesNotMatch(html,/time-presets|preset-record-time/);
  assert.match(html,/data-field="hours"/);
  assert.match(html,/<option value="27" selected>/);
});