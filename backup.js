// The saved-data shape shared by the JSON backup and localStorage: building a backup, reading the balance setup and
// target dates back out of one, and validating/upgrading the balance setup. Pure functions that never modify what
// they are given, so they can be tested with Node (node --test). In the browser they are window.Backup.
(function(root){
  const BALANCE_MIN_GROUPS = 2, BALANCE_MAX_GROUPS = 4;
  const BALANCE_SINCE_START = '1970-01-01'; // "from the very beginning" marker for the first version

  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  // Check the calendar itself, not Date's rollover (e.g. February 31 -> March 3).
  function isValidISODate(value){
    if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    if(year<1 || month<1 || month>12 || day<1) return false;
    const leap = year%4===0 && (year%100!==0 || year%400===0);
    const monthDays = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    return day<=monthDays[month-1];
  }

  function goalMinutes(value, fallback){
    if((typeof value!=='number' && typeof value!=='string') ||
       (typeof value==='string' && value.trim()==='')) return fallback;
    const minutes = Number(value);
    return Number.isFinite(minutes) && minutes>=0 ? minutes : fallback;
  }

  function isValidGroups(gs){
    return Array.isArray(gs) && gs.length>=BALANCE_MIN_GROUPS && gs.length<=BALANCE_MAX_GROUPS &&
      gs.every(g=>g && typeof g.id==='string' && typeof g.name==='string' && Array.isArray(g.subjectIds) && typeof g.target==='number' && g.target>=0 && g.target<=100);
  }
  function isValidBalance(b){
    return !!b && typeof b==='object' && Array.isArray(b.versions) && b.versions.length>=1 &&
      b.versions.every(v=>v && typeof v.from==='string' && isValidGroups(v.groups));
  }

  // Earlier saves used a single setup ({groups} or the first {a,b,targetA} shape): turn them into one version.
  // Returns null when there is nothing usable. opts: { makeId, today } (new group ids, and the savedOn date).
  function migrateBalance(raw, opts){
    if(!raw || typeof raw!=='object') return null;
    if(isValidBalance(raw)) return raw;
    let groups = null;
    if(Array.isArray(raw.groups)) groups = raw.groups;
    else if(raw.a && raw.b && typeof raw.targetA==='number'){
      groups = [
        { name:raw.a.name, subjectIds:raw.a.subjectIds||[], target:raw.targetA },
        { name:raw.b.name, subjectIds:raw.b.subjectIds||[], target:100-raw.targetA },
      ];
    }
    if(!groups) return null;
    groups = groups.map(g=>({ id:g.id||opts.makeId(), name:g.name, subjectIds:g.subjectIds||[], target:g.target }));
    const b = { enabled: raw.enabled!==false, versions:[{ from:BALANCE_SINCE_START, savedOn:opts.today, groups }] };
    return isValidBalance(b) ? b : null;
  }

  // The JSON backup. subjects/records/goals keep the shape older versions of the app read.
  function buildBackup(data, version){
    return { version, subjects:data.subjects, records:data.records, goals:data.goals,
      balance: data.balance || null, deadlines: data.deadlines || [] };
  }

  function isValidDeadline(d){
    return !!d && typeof d==='object' && typeof d.label==='string' && d.label.trim()!=='' &&
      isValidISODate(d.date);
  }

  // The balance setup and target dates to use after importing `file`. Backups made before these were exported have
  // no such field: then (and when the field is unreadable) the current data is kept rather than cleared, so an old
  // backup never wipes them. *From says which happened: 'file' or 'kept'.
  function restoreExtras(file, current, opts){
    let balance = current.balance, balanceFrom = 'kept';
    if(file && 'balance' in file){
      if(file.balance===null){ balance = null; balanceFrom = 'file'; }
      else {
        const b = migrateBalance(clone(file.balance), opts);
        if(b){ balance = b; balanceFrom = 'file'; }
      }
    }
    let deadlines = current.deadlines, deadlinesFrom = 'kept';
    if(file && Array.isArray(file.deadlines)){
      deadlines = file.deadlines.filter(isValidDeadline).map(d=>({ id: typeof d.id==='string' && d.id ? d.id : opts.makeId(), label:d.label, date:d.date }));
      deadlinesFrom = 'file';
    }
    return { balance, deadlines, balanceFrom, deadlinesFrom };
  }

  // Download name with the local date and time (e.g. study-time-backup_2026-09-28_1130.json) so a new export never
  // collides with an earlier one, and sorting by name sorts by time. kind: 'json' (backup) or 'csv'.
  function exportFileName(date, kind){
    const p = n=>String(n).padStart(2,'0');
    const stamp = `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}_${p(date.getHours())}${p(date.getMinutes())}`;
    return kind==='csv' ? `study-time_${stamp}.csv` : `study-time-backup_${stamp}.json`;
  }

  const api = { BALANCE_MIN_GROUPS, BALANCE_MAX_GROUPS, BALANCE_SINCE_START, isValidISODate, goalMinutes, isValidBalance, migrateBalance, buildBackup, restoreExtras, exportFileName };
  if(typeof module!=='undefined' && module.exports) module.exports = api;
  else root.Backup = api;
})(this);
