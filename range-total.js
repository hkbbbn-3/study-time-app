// Pure totals for the home screen's "期間で合計を調べる" card. They only read the records and the balance
// setup they are given (never write to them), so they can be tested with Node: node --test
// In the browser they are exposed as window.RangeTotal; script.js calls them from there.
(function(root){
  function isoToDate(iso){ const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
  function dateToISO(d){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  // Every day in [startIso, endIso] inclusive, tolerating the range being given backwards.
  function daysIn(startIso, endIso){
    let a = startIso, b = endIso;
    if(a > b){ const t=a; a=b; b=t; }
    const days = [], end = isoToDate(b);
    for(const cur=isoToDate(a); cur<=end; cur.setDate(cur.getDate()+1)) days.push(dateToISO(cur));
    return days;
  }

  // The balance setup that applied on a given day (days before the first version use the first one).
  function versionAt(versions, iso){
    let v = versions[0];
    versions.forEach(x=>{ if(x.from<=iso) v = x; });
    return v;
  }

  // Minutes across the range for the given subjects.
  function rangeSubjectTotal(records, startIso, endIso, subjectIds){
    const days = daysIn(startIso, endIso);
    const daySet = new Set(days), subjectSet = new Set(subjectIds);
    let total = 0;
    records.forEach(r=>{ if(daySet.has(r.date) && subjectSet.has(r.subjectId)) total += r.minutes; });
    return { total, dayCount: days.length };
  }

  // Minutes per balance group across the range. Each record is counted in the group it belonged to under the
  // setup in force on its own day (the same rule as the balance card). Groups are matched by id, so a renamed
  // group stays one group and shows its latest name. Only groups used on some day of the range are listed,
  // those of the current setup first. Minutes from subjects in no group go to `other`.
  // `changes` lists the days within the range on which a new setup started. Returns null without a setup.
  function rangeGroupTotals(records, balance, startIso, endIso){
    if(!balance || !Array.isArray(balance.versions) || balance.versions.length===0) return null;
    const vs = balance.versions;
    const days = daysIn(startIso, endIso);
    const first = days[0], last = days[days.length-1];

    const names = {};
    vs.forEach(v=>v.groups.forEach(g=>{ names[g.id] = g.name; }));
    const used = new Set();
    days.forEach(iso=>versionAt(vs, iso).groups.forEach(g=>used.add(g.id)));
    const order = [];
    [vs[vs.length-1], ...vs].forEach(v=>v.groups.forEach(g=>{ if(used.has(g.id) && !order.includes(g.id)) order.push(g.id); }));

    const mins = {};
    order.forEach(id=>{ mins[id] = 0; });
    let other = 0;
    const daySet = new Set(days);
    records.forEach(r=>{
      if(!daySet.has(r.date)) return;
      const g = versionAt(vs, r.date).groups.find(g=>g.subjectIds.includes(r.subjectId));
      if(g) mins[g.id] += r.minutes; else other += r.minutes;
    });
    return {
      groups: order.map(id=>({ id, name:names[id], minutes:mins[id] })),
      other,
      dayCount: days.length,
      changes: vs.filter(v=>v.from>first && v.from<=last).map(v=>v.from),
    };
  }

  const api = { versionAt, rangeSubjectTotal, rangeGroupTotals };
  if(typeof module!=='undefined' && module.exports) module.exports = api;
  else root.RangeTotal = api;
})(this);
