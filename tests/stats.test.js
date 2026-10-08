// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { monthSummary, monthComparison, yearSummary } = require('../stats.js');

const rec = (date, subjectId, minutes) => ({ id: `${date}-${subjectId}-${minutes}`, date, subjectId, minutes, memo: '' });

function deepFreeze(o){
  Object.values(o).forEach(v=>{ if(v && typeof v==='object') deepFreeze(v); });
  return Object.freeze(o);
}

const records = deepFreeze([
  rec('2026-09-30', 'math', 40),   // previous month, last day
  rec('2026-10-01', 'math', 60),
  rec('2026-10-01', 'eng', 30),    // same day, another subject: still one study day
  rec('2026-10-07', 'eng', 45),    // 1〜7日の最終日
  rec('2026-10-08', 'math', 20),   // 8〜14日の最初の日
  rec('2026-10-29', 'jp', 15),     // 29日〜月末の週
  rec('2026-11-01', 'math', 99),   // next month: must not leak in
  rec('2025-10-05', 'math', 500),  // same month, other year: must not leak in
]);

test('monthSummary totals, study days and average per study day', () => {
  const s = monthSummary(records, 2026, 9);
  assert.equal(s.total, 60 + 30 + 45 + 20 + 15);
  assert.equal(s.studyDays, 4);
  assert.equal(s.avgPerStudyDay, Math.round(170 / 4));
});

test('monthSummary splits the month into 7-day buckets with a short last week', () => {
  const s = monthSummary(records, 2026, 9);
  assert.deepEqual(s.weeks.map(w => w.label), ['1〜7日', '8〜14日', '15〜21日', '22〜28日', '29〜31日']);
  assert.deepEqual(s.weeks.map(w => w.minutes), [135, 20, 0, 0, 15]);
});

test('monthSummary leaves out the 29th+ bucket when the month has only 28 days', () => {
  const s = monthSummary([rec('2027-02-28', 'math', 10)], 2027, 1);
  assert.equal(s.weeks.length, 4);
  assert.equal(s.weeks[3].minutes, 10);
  assert.equal(s.weeks[3].label, '22〜28日');
});

test('monthSummary lists subjects by minutes, largest first', () => {
  const s = monthSummary(records, 2026, 9);
  assert.deepEqual(s.bySubject, [['math', 80], ['eng', 75], ['jp', 15]]);
});

test('monthSummary on an empty month is all zeros, with no divide-by-zero', () => {
  const s = monthSummary(records, 2026, 0);
  assert.equal(s.total, 0);
  assert.equal(s.studyDays, 0);
  assert.equal(s.avgPerStudyDay, 0);
  assert.deepEqual(s.bySubject, []);
  assert.ok(s.weeks.every(w => w.minutes === 0));
});

test('monthComparison compares the same span of days against the previous month', () => {
  // through the 7th: October has 135, September's only record (40) is on the 30th so it is not counted yet
  assert.deepEqual(monthComparison(records, 2026, 9, 7), { current: 135, previous: 0 });
  // through the 31st: September has only 30 days, so the whole month (40) is compared
  assert.deepEqual(monthComparison(records, 2026, 9, 31), { current: 170, previous: 40 });
});

test('monthComparison clamps the day when the previous month is shorter, and crosses the year boundary', () => {
  const r = [rec('2026-02-28', 'math', 25), rec('2026-03-31', 'math', 5), rec('2025-12-31', 'math', 7), rec('2026-01-31', 'math', 3)];
  assert.deepEqual(monthComparison(r, 2026, 2, 31), { current: 5, previous: 25 });
  assert.deepEqual(monthComparison(r, 2026, 0, 31), { current: 3, previous: 7 });
});

test('yearSummary totals each month, study days and subjects for one year only', () => {
  const s = yearSummary(records, 2026);
  assert.equal(s.months.length, 12);
  assert.equal(s.months[8], 40);        // Sep
  assert.equal(s.months[9], 170);       // Oct
  assert.equal(s.months[10], 99);       // Nov
  assert.equal(s.total, 40 + 170 + 99);
  assert.equal(s.studyDays, 1 + 4 + 1);
  assert.deepEqual(s.bySubject, [['math', 40 + 80 + 99], ['eng', 75], ['jp', 15]]);
});

test('yearSummary with no records is all zeros', () => {
  const s = yearSummary([], 2026);
  assert.equal(s.total, 0);
  assert.equal(s.studyDays, 0);
  assert.deepEqual(s.months, new Array(12).fill(0));
  assert.deepEqual(s.bySubject, []);
});

test('stats functions do not modify the records they are given', () => {
  monthSummary(records, 2026, 9); monthComparison(records, 2026, 9, 31); yearSummary(records, 2026);
  assert.equal(records.length, 8);
});
