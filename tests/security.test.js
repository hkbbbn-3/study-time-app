const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');
function load(c,start,end){
  const a=source.indexOf(start), b=source.indexOf(end,a);
  assert.ok(a>=0 && b>a);
  vm.runInContext(source.slice(a,b),c);
}
function app(){
  const c={state:{goals:{weekday:0,weekend:120},subjects:[],records:[],deadlines:[]},DESIGNS:[],
    icon:()=>'',sortedDeadlines:()=>c.state.deadlines,daysUntil:()=>1,formatDateFull:()=>'',
    renderBalanceSettings:()=>'',subjectById:id=>c.state.subjects.find(s=>s.id===id),fmtMin:()=>'',
    showToast:()=>{},Backup:require('../backup.js'),downloadBlob:text=>{c.csv=text;}};
  vm.createContext(c);
  load(c,'function escapeHtml(str){','// ---------- events');
  load(c,'function renderSettings(){','function renderBalanceSettings(){');
  load(c,'function recordItemHtml(r){','function timerElapsedMs(');
  return c;
}
test('imported or saved subject colors and all settings/record IDs remain inert HTML data',()=>{
  const c=app(), payload='"><img src=x onerror="alert(1)"><div style="';
  c.state.subjects=[{id:payload,name:'数学<&"',color:payload}];
  c.state.deadlines=[{id:payload,label:'試験',date:'2026-10-05'}];
  const settings=c.renderSettings(), record=c.recordItemHtml({id:payload,subjectId:payload,minutes:27,memo:payload});
  for(const html of [settings,record]){
    assert.doesNotMatch(html,/<img\b/);
    assert.doesNotMatch(html,/style="[^"]*(?:url\(|onerror)/);
    assert.match(html,/data-id="&quot;&gt;&lt;img/);
  }
  assert.match(settings,/数学&lt;&amp;&quot;/);
  assert.equal(c.state.subjects[0].id,payload); // Preserve references; escape only the HTML representation.
});
test('legitimate hex colors and identifiers retain their displayed values',()=>{
  const c=app();
  c.state.subjects=[{id:'s1',name:'数学',color:'#6C5CE7'}];
  const html=c.renderSettings();
  assert.match(html,/background:#6C5CE7/);
  assert.match(html,/data-id="s1"/);
});
test('CSS URL, declarations and quote variants cannot escape the color boundary',()=>{
  const c=app();
  for(const color of ['url(https://invalid.example/image)','red;position:fixed','&#34;><img src=x>','#fff" onmouseover="alert(1)']){
    c.state.subjects=[{id:'s',name:'数学',color}];
    const html=c.renderSettings();
    assert.match(html,/style="background:#999"/);
    assert.doesNotMatch(html,/url\(|onmouseover=|<img\b|position:fixed/);
  }
});
test('selected/unselected pills, timer states and balance group IDs remain inert',()=>{
  const c=app(), payload='"><img src=x onerror="alert(1)">';
  c.state.subjects=[{id:payload,name:'数学',color:payload}];
  c.ui={timerSubjectIds:[],timerMemo:payload,rangeMode:'subject',rangeSubjectIds:null,rangeGroupIds:null};
  c.rangeGroupsAvailable=()=>true;
  c.computeRangeTotal=()=>({total:27,dayCount:1});
  c.BALANCE_MAX_GROUPS=4;
  c.rangeGroupTotals=()=>({groups:[{id:payload,name:'グループ',minutes:27}],dayCount:1,changes:[],other:0});
  c.roundTo100=()=>[100];
  c.fmtElapsed=()=>'';c.timerElapsedMs=()=>0;
  load(c,'function renderTimerCard(){','// ---------- RECORD');
  load(c,'function renderRangeBody(){','// ---------- CALENDAR');
  const outputs=[];
  for(const selected of [false,true]){
    c.ui.timerSubjectIds=selected?[payload]:[];
    c.ui.rangeSubjectIds=selected?[payload]:[];
    c.state.timer=null;
    outputs.push(c.renderTimerCard(),c.renderRangeBody());
  }
  for(const confirming of [false,true]){
    c.state.timer={subjectIds:[payload],confirming,running:true,finalMinutes:27};
    outputs.push(c.renderTimerCard());
  }
  c.ui.rangeMode='group';outputs.push(c.renderRangeBody());
  for(const html of outputs) assert.doesNotMatch(html,/<img\b|onerror="/);
  assert.match(outputs.at(-1),/data-id="&quot;&gt;&lt;img/);
});
test('CSV export neutralizes formula text without modifying records or ordinary fields',()=>{
  const c=app();
  load(c,'function exportCsv(){','function downloadBlob(');
  for(const text of ['=1+1','+SUM(1,1)','-1+1','@SUM(1,1)',' \t=1+1','\r=1+1','\tplain']){
    c.state.subjects=[{id:'s',name:text,color:'#fff'}];
    c.state.records=[{date:'2026-10-05',subjectId:'s',minutes:27,memo:text}];
    c.exportCsv();
    assert.match(c.csv,/,"'/);
    assert.equal(c.state.records[0].memo,text);
    assert.equal(c.state.subjects[0].name,text);
  }
  c.state.subjects=[{id:'s',name:'簿記',color:'#fff'}];
  c.state.records=[{date:'2026-10-05',subjectId:'s',minutes:27,memo:'仕訳,"復習"'}];
  c.exportCsv();
  assert.equal(c.csv,'\uFEFF"date","subject","minutes","memo"\n"2026-10-05","簿記","27","仕訳,""復習"""');
});
