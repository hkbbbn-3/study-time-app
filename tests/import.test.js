const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Backup = require('../backup.js');

// Execute the app's real import and confirmation functions. Only browser I/O is
// replaced: no files are downloaded and no browser/localStorage data is changed.
function app(){
  const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
  let id = 0;
  const c = {
    Backup, console:{warn:()=>{}}, SUBJECT_PALETTE:['#123456'],
    state:{ subjects:[{id:'s1',name:'数学',color:'#123456'}],
      records:[{id:'old',date:'2026-10-01',subjectId:'s1',minutes:60,memo:''}],
      goals:{weekday:60,weekend:60},balance:null,deadlines:[] },
    ui:{form:{subjectIds:[]}}, pendingImport:null, pendingCsvImport:null,
    messages:[], saves:0, confirmation:null,
    uid:()=>`new${++id}`, isoToday:()=>'2026-10-05',
    dateToISO:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    document:{getElementById:()=>null},
    render:()=>{}, applyTheme:()=>{},
    FileReader:class { readAsText(file){ this.onload({target:{result:file.text}}); } },
  };
  c.persist = ()=>{ c.saves++; };
  c.showToast = message=>c.messages.push(message);
  c.backupOpts = ()=>({makeId:c.uid,today:c.isoToday()});
  c.openConfirm = (title,desc,actionType,actionId)=>{
    c.confirmation = {title,desc,actionType,actionId}; c.ui.confirm = c.confirmation;
  };
  vm.createContext(c);
  for(const [start,end] of [
    ['function onClick(e){','function onChange(e){'],
    ['function resetImportInput(){','// Best-effort converter:'],
    ['function normalizeImportedData(parsed){','function launchConfetti(){'],
  ]){
    const a = source.indexOf(start), b = source.indexOf(end,a);
    assert.ok(a>=0 && b>a, 'app function boundaries exist');
    vm.runInContext(source.slice(a,b),c);
  }
  c.confirm = ()=>c.onClick({target:{closest:()=>({dataset:{action:'confirm-delete'}})}});
  return c;
}
const copy = value=>JSON.parse(JSON.stringify(value));
const native = goals=>({version:1,subjects:[{id:'s1',name:'数学',color:'#123456'}],
  records:[{id:'r1',date:'2026-02-28',subjectId:'s1',minutes:30,memo:''}],goals});

test('JSON backup round trip preserves zero-minute goals through confirmation', ()=>{
  const c = app();
  const file = Backup.buildBackup({...c.state,goals:{weekday:0,weekend:0}},1);
  c.handleImport({text:JSON.stringify(file)});
  assert.ok(c.confirmation);
  c.confirm();
  assert.deepEqual(copy(c.state.goals),{weekday:0,weekend:0});
  assert.equal(c.saves,1);
});

test('JSON restore retains positive goals and uses defaults for missing or invalid values', ()=>{
  const c = app();
  for(const [goals,want] of [
    [{weekday:90,weekend:180},{weekday:90,weekend:180}],
    [{weekday:'0',weekend:'240'},{weekday:0,weekend:240}],
    [{},{weekday:120,weekend:240}],
    [{weekday:null,weekend:''},{weekday:120,weekend:240}],
    [{weekday:-1,weekend:'invalid'},{weekday:120,weekend:240}],
  ]) assert.deepEqual(copy(c.normalizeImportedData(native(goals)).goals),want);
});

test('generic JSON restore preserves zero-minute goals', ()=>{
  const c = app();
  const result = c.normalizeImportedData({categories:['数学'],logs:[{date:'2026-02-28',category:'数学',minutes:30}],target:{weekdayMinutes:0,weekendMinutes:0}});
  assert.deepEqual(copy(result.goals),{weekday:0,weekend:0});
});

test('date normalization accepts leap days and rejects nonexistent calendar days', ()=>{
  const c = app();
  for(const [raw,want] of [
    ['2024-02-29','2024-02-29'],['2000-02-29','2000-02-29'],
    ['2026/2/28','2026-02-28'],['02/28/2026','2026-02-28'],['2024-02-29T12:00:00Z','2024-02-29'],
    ['2026-02-31',null],['2026-02-29',null],['1900-02-29',null],
    ['2026-04-31',null],['2026-13-01',null],['2026-01-00',null],
    ['02/31/2026',null],['February 31, 2026',null],['2026-02-280',null],
  ]) assert.equal(c.normalizeDate(raw),want,raw);
});

test('JSON with one invalid native record is rejected without replacing existing data', ()=>{
  const c = app(), before = JSON.stringify(c.state), file = native({weekday:60,weekend:60});
  file.records.push({...file.records[0],id:'bad',date:'2026-02-31'});
  c.handleImport({text:JSON.stringify(file)});
  assert.equal(c.confirmation,null);
  assert.equal(c.pendingImport,null);
  assert.equal(c.saves,0);
  assert.equal(JSON.stringify(c.state),before);
  assert.match(c.messages.join(' '),/日付/);
});

test('legacy and generic JSON cannot hide invalid dates with a valid recordedAt fallback', ()=>{
  const c = app();
  for(const file of [
    {subjects:['数学'],records:[{subject:'数学',date:'2026-02-31',recordedAt:'2026-03-03T12:00:00Z',minutes:30}]},
    {categories:['数学'],logs:[{category:'数学',date:'2026-02-31',minutes:30}]},
  ]){
    const result = c.normalizeImportedData(file);
    assert.equal(result.ok,false);
    assert.match(result.error,/日付/);
  }
});

test('legacy time-only dates still use valid recordedAt timestamps', ()=>{
  const c = app();
  const result = c.normalizeImportedData({subjects:['数学'],records:[{subject:'数学',date:'12:30',recordedAt:'2026-03-03T12:00:00Z',minutes:30}]});
  assert.equal(result.ok,true);
  assert.equal(result.records[0].date,'2026-03-03');
});

test('JSON with an invalid deadline or balance history date is rejected before confirmation', ()=>{
  for(const extra of [
    {deadlines:[{id:'d1',label:'試験',date:'2026-02-31'}]},
    {balance:{enabled:true,versions:[{from:'2026-02-31',groups:[]}]}},
    {balance:{enabled:true,versions:[{from:'1970-01-01',savedOn:'2026-02-31',groups:[]}]}},
  ]){
    const c = app(), before = JSON.stringify(c.state);
    c.handleImport({text:JSON.stringify({...native({weekday:0,weekend:0}),...extra})});
    assert.equal(c.confirmation,null);
    assert.equal(c.saves,0);
    assert.equal(JSON.stringify(c.state),before);
    assert.match(c.messages.join(' '),/日付/);
  }
});

test('CSV with mixed valid and invalid dates is rejected without adding records or subjects', ()=>{
  const c = app(), before = JSON.stringify(c.state);
  c.handleCsvImport({text:'date,subject,minutes,memo\n2024-02-29,数学,30,valid\n2026-02-31,新科目,30,invalid'});
  assert.equal(c.confirmation,null);
  assert.equal(c.pendingCsvImport,null);
  assert.equal(c.saves,0);
  assert.equal(JSON.stringify(c.state),before);
  assert.match(c.messages.join(' '),/日付/);
});

test('valid CSV still adds records, creates subjects and skips duplicates', ()=>{
  const c = app();
  c.handleCsvImport({text:'date,subject,minutes,memo\n2026-10-01,数学,60,\n2024-02-29,英語,27,"a,b"'});
  assert.ok(c.confirmation);
  c.confirm();
  assert.equal(c.state.records.length,2);
  assert.equal(c.state.records[1].date,'2024-02-29');
  assert.equal(c.state.records[1].minutes,27);
  assert.equal(c.state.records[1].memo,'a,b');
  assert.equal(c.state.subjects[1].name,'英語');
});
