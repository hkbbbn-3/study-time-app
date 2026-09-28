// Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidBalance, migrateBalance, buildBackup, restoreExtras } = require('../backup.js');

const opts = { makeId: (()=>{ let n=0; return ()=>`new${++n}`; })(), today: '2026-09-28' };

function deepFreeze(o){
  Object.values(o).forEach(v=>{ if(v && typeof v==='object') deepFreeze(v); });
  return Object.freeze(o);
}

const balance = () => ({ enabled:true, versions:[
  { from:'1970-01-01', savedOn:'2026-09-01', groups:[{ id:'A', name:'簿記', subjectIds:['s1'], target:70 }, { id:'B', name:'会計ソフト', subjectIds:[], target:30 }] },
  { from:'2026-09-24', savedOn:'2026-09-24', groups:[{ id:'A', name:'簿記', subjectIds:['s1'], target:70 }, { id:'B', name:'会計ソフト', subjectIds:['s2'], target:30 }] },
] });
const deadlines = () => [{ id:'d1', label:'簿記2級', date:'2026-11-15' }];
const appData = () => ({
  subjects:[{ id:'s1', name:'簿記2級', color:'#e76f51' }, { id:'s2', name:'マネーフォワード', color:'#2a9d8f' }],
  records:[{ id:'r1', date:'2026-09-22', subjectId:'s1', minutes:60, memo:'' }],
  goals:{ weekday:420, weekend:120 },
  theme:'dark', design:'x', lastMemo:'memo', timer:null,
  balance: balance(),
  deadlines: deadlines(),
});

// ---------- buildBackup ----------

test('buildBackup: keeps the existing fields exactly as before', () => {
  const data = appData();
  const b = buildBackup(data, 1);
  assert.equal(b.version, 1);
  assert.deepEqual(b.subjects, data.subjects);
  assert.deepEqual(b.records, data.records);
  assert.deepEqual(b.goals, data.goals);
});

test('buildBackup: includes the balance setup and the target dates', () => {
  const b = buildBackup(appData(), 1);
  assert.deepEqual(b.balance, balance());
  assert.deepEqual(b.deadlines, deadlines());
});

test('buildBackup: a never-set-up balance is written as null', () => {
  const b = buildBackup({ ...appData(), balance:null, deadlines:[] }, 1);
  assert.ok('balance' in b);
  assert.equal(b.balance, null);
  assert.deepEqual(b.deadlines, []);
});

// ---------- restoreExtras ----------

const current = () => ({ balance: { enabled:true, versions:[{ from:'1970-01-01', savedOn:'2026-01-01', groups:[
  { id:'X', name:'今のグループ1', subjectIds:['s1'], target:50 }, { id:'Y', name:'今のグループ2', subjectIds:[], target:50 }] }] },
  deadlines:[{ id:'dx', label:'今の目標日', date:'2026-12-01' }] });

test('restoreExtras: a backup round trip gives back the same balance and target dates', () => {
  const file = JSON.parse(JSON.stringify(buildBackup(appData(), 1)));
  const res = restoreExtras(file, current(), opts);
  assert.deepEqual(res.balance, balance());
  assert.deepEqual(res.deadlines, deadlines());
  assert.equal(res.balanceFrom, 'file');
  assert.equal(res.deadlinesFrom, 'file');
});

test('restoreExtras: an old backup without the fields keeps the current data', () => {
  const file = { version:1, subjects:[], records:[], goals:{ weekday:1, weekend:1 } };
  const cur = current();
  const res = restoreExtras(file, cur, opts);
  assert.deepEqual(res.balance, cur.balance);
  assert.deepEqual(res.deadlines, cur.deadlines);
  assert.equal(res.balanceFrom, 'kept');
  assert.equal(res.deadlinesFrom, 'kept');
});

test('restoreExtras: a new backup saying "no balance, no target dates" restores that', () => {
  const res = restoreExtras({ balance:null, deadlines:[] }, current(), opts);
  assert.equal(res.balance, null);
  assert.deepEqual(res.deadlines, []);
  assert.equal(res.balanceFrom, 'file');
  assert.equal(res.deadlinesFrom, 'file');
});

test('restoreExtras: a broken balance is ignored and the current one kept', () => {
  const cur = current();
  for(const broken of [{ versions:'x' }, { enabled:true, versions:[] }, 'abc', 42, { versions:[{ from:'1970-01-01', groups:[{ id:'A' }] }] }]){
    const res = restoreExtras({ balance:broken }, cur, opts);
    assert.deepEqual(res.balance, cur.balance, JSON.stringify(broken));
    assert.equal(res.balanceFrom, 'kept');
  }
});

test('restoreExtras: an earlier single-setup balance is converted', () => {
  const old = { enabled:true, a:{ name:'簿記', subjectIds:['s1'] }, b:{ name:'その他', subjectIds:['s2'] }, targetA:60 };
  const res = restoreExtras({ balance:old }, current(), opts);
  assert.equal(res.balanceFrom, 'file');
  assert.ok(isValidBalance(res.balance));
  assert.deepEqual(res.balance.versions[0].groups.map(g=>[g.name, g.subjectIds, g.target]), [['簿記',['s1'],60], ['その他',['s2'],40]]);
});

test('restoreExtras: only target dates with a label and a real date are taken', () => {
  const file = { deadlines:[
    { id:'d1', label:'簿記2級', date:'2026-11-15' },
    { label:'IDなし', date:'2026-12-01' },
    { id:'d3', label:'', date:'2026-12-01' },
    { id:'d4', label:'日付なし' },
    { id:'d5', label:'形が変', date:'11/15' },
    null, 'x',
  ] };
  const res = restoreExtras(file, current(), { ...opts, makeId: ()=>'gen' });
  assert.deepEqual(res.deadlines, [{ id:'d1', label:'簿記2級', date:'2026-11-15' }, { id:'gen', label:'IDなし', date:'2026-12-01' }]);
});

test('restoreExtras: target dates that are not a list are ignored', () => {
  const cur = current();
  const res = restoreExtras({ deadlines:'x' }, cur, opts);
  assert.deepEqual(res.deadlines, cur.deadlines);
  assert.equal(res.deadlinesFrom, 'kept');
});

// ---------- migrateBalance (also used when loading saved data) ----------

test('migrateBalance: a valid balance comes back unchanged and missing data gives null', () => {
  assert.deepEqual(migrateBalance(balance(), opts), balance());
  assert.equal(migrateBalance(null, opts), null);
  assert.equal(migrateBalance(undefined, opts), null);
});

test('migrateBalance: the earlier {groups} shape becomes one version from the start', () => {
  const res = migrateBalance({ enabled:false, groups:[{ name:'簿記', subjectIds:['s1'], target:50 }, { id:'K', name:'他', target:50 }] }, { makeId:()=>'id1', today:'2026-09-28' });
  assert.deepEqual(res, { enabled:false, versions:[{ from:'1970-01-01', savedOn:'2026-09-28', groups:[
    { id:'id1', name:'簿記', subjectIds:['s1'], target:50 }, { id:'K', name:'他', subjectIds:[], target:50 }] }] });
});

// ---------- inputs are never touched ----------

test('buildBackup and restoreExtras do not modify what they are given', () => {
  const data = deepFreeze(appData());
  const file = deepFreeze(JSON.parse(JSON.stringify(buildBackup(appData(), 1))));
  const cur = deepFreeze(current());
  const before = JSON.stringify({ data, file, cur });
  buildBackup(data, 1);
  restoreExtras(file, cur, opts);
  restoreExtras({}, cur, opts);
  assert.equal(JSON.stringify({ data, file, cur }), before);
});

test('restored data does not share objects with the file or the current state', () => {
  const file = JSON.parse(JSON.stringify(buildBackup(appData(), 1)));
  const res = restoreExtras(file, current(), opts);
  assert.notEqual(res.balance, file.balance);
  assert.notEqual(res.deadlines, file.deadlines);
});

// ---------- exportFileName ----------

const { exportFileName } = require('../backup.js');

test('exportFileName: puts the local date and time in the backup name, zero-padded', () => {
  assert.equal(exportFileName(new Date(2026, 8, 5, 7, 3, 59), 'json'), 'study-time-backup_2026-09-05_0703.json');
});

test('exportFileName: works on the last minute of the year', () => {
  assert.equal(exportFileName(new Date(2026, 11, 31, 23, 59), 'json'), 'study-time-backup_2026-12-31_2359.json');
});

test('exportFileName: the CSV name follows the same pattern', () => {
  assert.equal(exportFileName(new Date(2026, 8, 28, 11, 30), 'csv'), 'study-time_2026-09-28_1130.csv');
});
