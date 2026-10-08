// Pure monthly / yearly totals for the home screen's 統計 card. They only read the records they are given
// (never write to them), so they can be tested with Node: node --test
// In the browser they are exposed as window.Stats; script.js calls them from there.
// Dates are 'YYYY-MM-DD' strings, so a month or year is matched by its prefix and no Date maths is needed.
(function(root){
  const pad2 = n => String(n).padStart(2, '0');
  const monthPrefix = (year, month) => `${year}-${pad2(month + 1)}-`; // month is 0-based, like Date

  function daysInMonth(year, month){ return new Date(year, month + 1, 0).getDate(); }

  // [[subjectId, minutes], ...] largest first
  function rankSubjects(totals){
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }

  // Totals for one month. The month is cut into 7-day buckets (1〜7日, 8〜14日, ...) — the last one is shorter.
  function monthSummary(records, year, month){
    const prefix = monthPrefix(year, month), last = daysInMonth(year, month);
    const weeks = [];
    for(let from = 1; from <= last; from += 7){
      const to = Math.min(from + 6, last);
      weeks.push({ label: `${from}〜${to}日`, from, to, minutes: 0 });
    }
    const days = new Set(), bySubject = {};
    let total = 0;
    records.forEach(r => {
      if(!r.date.startsWith(prefix)) return;
      const day = Number(r.date.slice(8, 10));
      total += r.minutes;
      days.add(r.date);
      bySubject[r.subjectId] = (bySubject[r.subjectId] || 0) + r.minutes;
      weeks[Math.floor((day - 1) / 7)].minutes += r.minutes;
    });
    return {
      total,
      studyDays: days.size,
      avgPerStudyDay: days.size ? Math.round(total / days.size) : 0,
      weeks: weeks.map(w => ({ label: w.label, minutes: w.minutes })),
      bySubject: rankSubjects(bySubject),
    };
  }

  // This month through `throughDay` against the previous month through the same day number (clamped when the
  // previous month is shorter), so a month that is still running is not compared with a finished one.
  function monthComparison(records, year, month, throughDay){
    const prevYear = month === 0 ? year - 1 : year, prevMonth = month === 0 ? 11 : month - 1;
    const through = (y, m, day) => {
      const prefix = monthPrefix(y, m), cap = Math.min(day, daysInMonth(y, m));
      let t = 0;
      records.forEach(r => { if(r.date.startsWith(prefix) && Number(r.date.slice(8, 10)) <= cap) t += r.minutes; });
      return t;
    };
    return { current: through(year, month, throughDay), previous: through(prevYear, prevMonth, throughDay) };
  }

  // Totals for one year, with a minutes-per-month list (index 0 = January).
  function yearSummary(records, year){
    const prefix = `${year}-`;
    const months = new Array(12).fill(0), days = new Set(), bySubject = {};
    let total = 0;
    records.forEach(r => {
      if(!r.date.startsWith(prefix)) return;
      total += r.minutes;
      months[Number(r.date.slice(5, 7)) - 1] += r.minutes;
      days.add(r.date);
      bySubject[r.subjectId] = (bySubject[r.subjectId] || 0) + r.minutes;
    });
    return { total, studyDays: days.size, months, bySubject: rankSubjects(bySubject) };
  }

  const api = { monthSummary, monthComparison, yearSummary };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Stats = api;
})(this);
