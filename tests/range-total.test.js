// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { versionAt, rangeSubjectTotal, rangeGroupTotals } = require('../range-total.js');

const rec = (date, subjectId, minutes) => ({ id: `${date}-${subjectId}-${minutes}`, date, subjectId, minutes, memo: '' });

function deepFreeze(o){
  Object.values(o).forEach(v=>{ if(v && typeof v==='object') deepFreeze(v); });
  return Object.freeze(o);
}

// ---------- versionAt ----------

test('versionAt: picks the last version starting on or before the day', () => {
  const vs = [{ from:'1970-01-01', tag:'a' }, { from:'2026-09-15', tag:'b' }];
  assert.equal(versionAt(vs, '2026-09-14').tag, 'a');
  assert.equal(versionAt(vs, '2026-09-15').tag, 'b');
  assert.equal(versionAt(vs, '2026-12-01').tag, 'b');
});

test('versionAt: days before the first version use the first one', () => {
  const vs = [{ from:'2026-09-10', tag:'a' }];
  assert.equal(versionAt(vs, '2026-09-01').tag, 'a');
});

// ---------- rangeSubjectTotal (existing behaviour, moved out of script.js) ----------

test('rangeSubjectTotal: sums the chosen subjects over the inclusive range', () => {
  const records = [rec('2026-09-01','s1',30), rec('2026-09-03','s2',20), rec('2026-09-03','s1',10), rec('2026-09-04','s1',99)];
  assert.deepEqual(rangeSubjectTotal(records, '2026-09-01', '2026-09-03', ['s1','s2']), { total:60, dayCount:3 });
  assert.deepEqual(rangeSubjectTotal(records, '2026-09-01', '2026-09-03', ['s1']), { total:40, dayCount:3 });
});

test('rangeSubjectTotal: a backwards range is swapped', () => {
  const records = [rec('2026-09-02','s1',15)];
  assert.deepEqual(rangeSubjectTotal(records, '2026-09-05', '2026-09-01', ['s1']), { total:15, dayCount:5 });
});

test('rangeSubjectTotal: no subjects or no records gives zero', () => {
  assert.deepEqual(rangeSubjectTotal([rec('2026-09-02','s1',15)], '2026-09-01', '2026-09-02', []), { total:0, dayCount:2 });
  assert.deepEqual(rangeSubjectTotal([], '2026-09-01', '2026-09-01', ['s1']), { total:0, dayCount:1 });
});

test('rangeSubjectTotal: counts days across a month boundary', () => {
  assert.equal(rangeSubjectTotal([], '2026-08-30', '2026-09-02', []).dayCount, 4);
});

// ---------- rangeGroupTotals ----------

const g = (id, name, subjectIds, target=50) => ({ id, name, subjectIds, target });

test('rangeGroupTotals: sums minutes per group and puts ungrouped subjects in other', () => {
  const balance = { enabled:true, versions:[{ from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記',['s1']), g('B','会計ソフト',['s2'])] }] };
  const records = [rec('2026-09-01','s1',30), rec('2026-09-02','s2',20), rec('2026-09-02','s3',5), rec('2026-09-02','s1',10)];
  const res = rangeGroupTotals(records, balance, '2026-09-01', '2026-09-02');
  assert.deepEqual(res.groups, [{ id:'A', name:'簿記', minutes:40 }, { id:'B', name:'会計ソフト', minutes:20 }]);
  assert.equal(res.other, 5);
  assert.equal(res.dayCount, 2);
  assert.deepEqual(res.changes, []);
});

test('rangeGroupTotals: each record uses the setup in force on its own day', () => {
  // s2 moves from group A to group B on 9/15
  const balance = { enabled:true, versions:[
    { from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記',['s1','s2']), g('B','その他',[])] },
    { from:'2026-09-15', savedOn:'2026-09-15', groups:[g('A','簿記',['s1']), g('B','その他',['s2'])] },
  ] };
  const records = [rec('2026-09-14','s2',30), rec('2026-09-15','s2',20), rec('2026-09-16','s1',10)];
  const res = rangeGroupTotals(records, balance, '2026-09-01', '2026-09-30');
  assert.deepEqual(res.groups.map(x=>[x.id, x.minutes]), [['A',40], ['B',20]]);
  assert.equal(res.other, 0);
  assert.deepEqual(res.changes, ['2026-09-15']);
});

test('rangeGroupTotals: only lists groups whose setup covers the range, current groups first', () => {
  const balance = { enabled:true, versions:[
    { from:'1970-01-01', savedOn:'2026-08-01', groups:[g('OLD','旧グループ',['s1']), g('B','その他',['s2'])] },
    { from:'2026-09-15', savedOn:'2026-09-15', groups:[g('NEW','新グループ',['s1']), g('B','その他',['s2'])] },
  ] };
  assert.deepEqual(rangeGroupTotals([], balance, '2026-09-20', '2026-09-25').groups.map(x=>x.id), ['NEW','B']);
  // same order as the balance card: groups still in the current setup come first
  assert.deepEqual(rangeGroupTotals([], balance, '2026-09-01', '2026-09-05').groups.map(x=>x.id), ['B','OLD']);
  assert.deepEqual(rangeGroupTotals([], balance, '2026-09-10', '2026-09-20').groups.map(x=>x.id), ['NEW','B','OLD']);
});

test('rangeGroupTotals: a renamed group stays one group and shows its latest name', () => {
  const balance = { enabled:true, versions:[
    { from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記2級',['s1']), g('B','その他',[])] },
    { from:'2026-09-10', savedOn:'2026-09-10', groups:[g('A','簿記',['s1']), g('B','その他',[])] },
  ] };
  const records = [rec('2026-09-05','s1',30), rec('2026-09-12','s1',20)];
  const res = rangeGroupTotals(records, balance, '2026-09-01', '2026-09-30');
  assert.deepEqual(res.groups[0], { id:'A', name:'簿記', minutes:50 });
  assert.equal(res.groups.length, 2);
});

test('rangeGroupTotals: records outside the range are ignored and a backwards range is swapped', () => {
  const balance = { enabled:true, versions:[{ from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記',['s1']), g('B','その他',['s2'])] }] };
  const records = [rec('2026-08-31','s1',99), rec('2026-09-01','s1',30), rec('2026-09-03','s2',10), rec('2026-09-04','s2',99)];
  const res = rangeGroupTotals(records, balance, '2026-09-03', '2026-09-01');
  assert.deepEqual(res.groups.map(x=>x.minutes), [30, 10]);
  assert.equal(res.dayCount, 3);
});

test('rangeGroupTotals: no records gives zero for every group', () => {
  const balance = { enabled:true, versions:[{ from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記',['s1']), g('B','その他',['s2'])] }] };
  const res = rangeGroupTotals([], balance, '2026-09-01', '2026-09-01');
  assert.deepEqual(res.groups.map(x=>x.minutes), [0, 0]);
  assert.equal(res.other, 0);
});

test('rangeGroupTotals: returns null when balance has never been set up', () => {
  assert.equal(rangeGroupTotals([rec('2026-09-01','s1',30)], null, '2026-09-01', '2026-09-01'), null);
});

// ---------- saved data is never touched ----------

test('neither function modifies the records or the balance setup', () => {
  const balance = deepFreeze({ enabled:true, versions:[
    { from:'1970-01-01', savedOn:'2026-09-01', groups:[g('A','簿記',['s1']), g('B','その他',['s2'])] },
    { from:'2026-09-15', savedOn:'2026-09-15', groups:[g('A','簿記',['s1','s2']), g('B','その他',[])] },
  ] });
  const records = deepFreeze([rec('2026-09-01','s1',30), rec('2026-09-20','s2',20)]);
  const before = JSON.stringify({ balance, records });
  // frozen inputs make any write throw in strict mode; the JSON check also catches reordering
  rangeGroupTotals(records, balance, '2026-09-01', '2026-09-30');
  rangeSubjectTotal(records, '2026-09-01', '2026-09-30', ['s1','s2']);
  assert.equal(JSON.stringify({ balance, records }), before);
});
