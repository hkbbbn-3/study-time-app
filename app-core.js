const SUBJECT_PALETTE = ['#6C5CE7','#FF8B5E','#22C99B','#FF6FA5','#4FB6FF','#FFC24B','#B983FF','#5DD39E'];
const WEEKDAY_LABELS = ['月','火','水','木','金','土','日'];

// ---------- icons (line-style, inherit currentColor) ----------
const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  sliders: '<path d="M4 20v-6M4 10V4M12 20v-9M12 7V4M20 20v-4M20 12V4"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="20" cy="14" r="2"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>',
  flame: '<path d="M8.6 14.2a2.6 2.6 0 0 0 2.6 2.6c1.5 0 2.7-1.2 2.7-2.7 0-1.4-.6-2-1.1-3-1.1-2.2-.2-4.1 2-6.1.5 2.5 2 5 4 6.6 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.1.3.7.8 1.2.8 2.2z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  trending: '<path d="M2.5 18 10 10.5l4 4 7.5-8"/><path d="M15.5 6.5h6v6"/>',
  book: '<path d="M3.5 5A2.5 2.5 0 0 1 6 2.5h5.5v18H6A2.5 2.5 0 0 1 3.5 18Z"/><path d="M20.5 5A2.5 2.5 0 0 0 18 2.5h-5.5v18H18a2.5 2.5 0 0 0 2.5-2.5Z"/>',
  chevronLeft: '<path d="M14.5 5 8 12l6.5 7"/>',
  chevronRight: '<path d="M9.5 5 16 12l-6.5 7"/>',
  check: '<path d="M19 6.5 9.5 17 5 12.3"/>',
  plus: '<path d="M12 4.5v15M4.5 12h15"/>',
  edit: '<path d="M14.5 4.5 19.5 9.5 8 21H3v-5Z"/>',
  trash: '<path d="M4.5 6.5h15M9.5 6.5V4.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v2M18.5 6.5V19a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6.5Z"/><path d="M10 11v6M14 11v6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  download: '<path d="M12 3.5v11.5M7.5 11l4.5 4.5L16.5 11"/><path d="M4.5 18.5v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1"/>',
  upload: '<path d="M12 15.5V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 18.5v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1"/>',
  file: '<path d="M13.5 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M13.5 2.5V7H18"/><path d="M8.5 13h7M8.5 16.5h7"/>',
  archive: '<path d="M3 8.5v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-11"/><rect x="2" y="3.5" width="20" height="5" rx="1.2"/><path d="M10 12.5h4"/>',
  arrowUp: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
  minus: '<path d="M5 12h14"/>',
  warning: '<path d="M12 3.5 21.5 20h-19Z"/><path d="M12 9.5v5"/><circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none"/>',
  play: '<path d="M7 4.5v15l13-7.5Z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
};
function icon(name, size=18, extraClass=''){
  const inner = ICON_PATHS[name] || '';
  return `<svg class="icon ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
// Matches the app icon: a ring around the same ascending bars.
function logomark(){
  return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.3" fill="none"/>
    <rect x="7.9" y="14.8" width="1.9" height="4" rx=".95" opacity=".85"/>
    <rect x="11" y="12.2" width="1.9" height="6.6" rx=".95"/>
    <rect x="14.1" y="9" width="1.9" height="9.8" rx=".95" opacity=".85"/>
  </svg>`;
}

let state = {
  subjects: [
    {id:'s1', name:'数学', color:SUBJECT_PALETTE[0]},
    {id:'s2', name:'英語', color:SUBJECT_PALETTE[1]},
    {id:'s3', name:'国語', color:SUBJECT_PALETTE[2]},
    {id:'s4', name:'理科', color:SUBJECT_PALETTE[3]},
    {id:'s5', name:'社会', color:SUBJECT_PALETTE[4]},
  ],
  records: [], // {id,date,subjectId,minutes,memo}
  goals: { weekday: 120, weekend: 240 },
  theme: 'light',   // light / dark mode
  design: 'calm',   // visual design: 'calm' | 'cute' | 'neon' | 'violet' | 'sea' (independent of light/dark)
  lastMemo: '', // pre-fills the memo field for the next new record
  balance: null,    // study-balance setup with history: {enabled, versions:[{from,savedOn,groups:[{id,name,subjectIds,target}]}]}, or null when never set up
  // Live stopwatch, or null when nothing is running. Elapsed time is always computed from
  // startedAt/accumulatedMs (never a counter that only ticks while the tab is open), so it survives
  // a reload or the app being backgrounded correctly. confirming=true freezes it at finalMinutes,
  // showing a save-with-memo step before it actually becomes a record.
  timer: null, // {subjectIds,startDate,startedAt,accumulatedMs,running,confirming,finalMinutes}
  deadlines: [], // {id,label,date} — target dates like an exam, shown as a countdown on the home screen
};

const DESIGNS = [
  { id:'calm', name:'Calm Focus', desc:'落ち着いた上品なデザイン。ベージュ×セージグリーン', swatch:['#EFEDE7','#5E7857','#77706A'] },
  { id:'cute', name:'Soft Cute',  desc:'やわらかくてかわいい。淡いピンク×水色',           swatch:['#FBE1E7','#B85673','#D6E6F5'] },
  { id:'neon', name:'Neon Pop',   desc:'夜の街のネオン管。ピンクとシアンの線が光る', swatch:['#0B1128','#FF3EA5','#3FE0FF'] },
  { id:'violet', name:'Neon Violet', desc:'ビビッドな紫×マゼンタ。絵の具が弾けるアートなネオン', swatch:['#3A10B5','#FF2FA8','#9DB2FF'] },
  { id:'sea',  name:'Deep Sea',   desc:'海から深海へ。青×シアンの世界観（ダークモード推奨）', swatch:['#0A3350','#38C6E8','#6C7CF0'] },
];
const DESIGN_IDS = DESIGNS.map(d=>d.id);

let ui = {
  tab: 'home',
  recordMode: 'manual',
  homeDetails: false,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  homeYear: new Date().getFullYear(),
  homeMonth: new Date().getMonth(),
  statsMode: 'month', // 'month' | 'year' for the home 統計 card (the month shown is homeYear/homeMonth)
  statsYear: new Date().getFullYear(), // the year shown when statsMode is 'year'
  selectedDate: isoToday(),
  form: { date: isoToday(), subjectIds: [], hours: 1, minutes: 0, memo: '', editingId: null },
  timerSubjectIds: [], // subjects picked before pressing start (record tab, timer card)
  timerMemo: '', // memo field shown once the timer is stopped and awaiting confirmation
  rangeStart: (function(){ const d=new Date(); d.setDate(d.getDate()-6); return dateToISO(d); })(), // for the home screen's date-range total
  rangeEnd: isoToday(),
  rangeSubjectIds: null, // null means "all subjects"; becomes an explicit array once the user filters
  rangeMode: 'subject', // 'subject' | 'group' — the range card totals by subject or by balance group
  rangeGroupIds: null, // null means "all groups"; becomes an explicit array once the user filters
  balanceEditIdx: null, // index of a history entry being corrected directly from the history list (overrides the apply date)
  balanceApplyFrom: null, // ISO date the Settings edits apply from (null = today); shows the setup in force on that day
  weekDay: null, // ISO date of the tapped bar in the week card (shows that day breakdown by subject)
  weekOffset: 0, // 0 = this week, -1 = last week, ... (home week card and balance card)
  balancePeriod: 'week', // 'week' | 'month' for the home balance card
  confirm: null, // { title, desc, actionType, actionId }
  datePicker: null, // { year, month, target } when open — target is 'record', 'rangeStart', or 'rangeEnd'
  subjectEditor: null, // { id, name, color } when editing a subject
  deadlineEditor: null, // { id, label, date } when adding/editing a target date (id=null for a new one)
};

function isoToday(){ return dateToISO(new Date()); }
function dateToISO(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function isoToDate(iso){ const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
function isWeekend(iso){ const d=isoToDate(iso).getDay(); return d===0||d===6; }
function goalFor(iso){ return isWeekend(iso) ? state.goals.weekend : state.goals.weekday; }
function fmtMin(total){
  total = Math.round(total);
  const h = Math.floor(total/60), m = total%60;
  if(h<=0) return `${m}分`;
  if(m===0) return `${h}時間`;
  return `${h}時間${m}分`;
}
// Same as fmtMin, but splits number and unit into spans so the hero can render big numbers with small units.
function fmtMinHtml(total){
  total = Math.round(total);
  const h = Math.floor(total/60), m = total%60;
  const part = (n,u)=>`<span class="num">${n}</span><span class="unit">${u}</span>`;
  if(h<=0) return part(m,'分');
  if(m===0) return part(h,'時間');
  return part(h,'時間') + part(m,'分');
}
function subjectById(id){ return state.subjects.find(s=>s.id===id) || {name:'(削除済み)', color:'#999'}; }
// Whole calendar days between today and an ISO date (negative once it's passed). Both dates are
// treated as local midnight, so this isn't affected by the time of day "now" happens to be.
function daysUntil(iso){
  const ms = isoToDate(iso) - isoToDate(isoToday());
  return Math.round(ms / 86400000);
}
// Upcoming deadlines (today or later) soonest-first, then past ones most-recently-passed-first —
// so whichever deadlines are actually still relevant surface at the top of the settings list.
function sortedDeadlines(){
  const today = isoToday();
  return [...state.deadlines].sort((a,b)=>{
    const aFuture = a.date>=today, bFuture = b.date>=today;
    if(aFuture!==bFuture) return aFuture ? -1 : 1;
    return aFuture ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
}
function recordsOn(iso){ return state.records.filter(r=>r.date===iso); }
function totalOn(iso){ return recordsOn(iso).reduce((a,r)=>a+r.minutes,0); }

function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36); }

// ---------- storage ----------
// NOTE: this file is meant to be saved and opened as a standalone app (VSCode, double-click,
// Live Server, etc.), so we use the browser's standard localStorage rather than any
// environment-specific API. Data is stored per-origin/per-file in the browser you open it in.
const STORAGE_KEY = 'study-app-data';
// Shape of the saved data. Bump this when the format changes and add a step to migrateSaved().
const SCHEMA_VERSION = 1;
let saveTimer=null;
function flushSave(){
  clearTimeout(saveTimer);
  saveTimer=null;
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      subjects: state.subjects, records: state.records, goals: state.goals, theme: state.theme, design: state.design, balance: state.balance, lastMemo: state.lastMemo, timer: state.timer, deadlines: state.deadlines
    }));
  }catch(e){ console.error('save failed', e); showToast('保存に失敗しました'); }
}
function persist(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(flushSave, 150);
}
// Closing the tab or switching apps within 150ms of a change would lose it, so write any pending save right away.
function flushPendingSave(){ if(saveTimer!==null) flushSave(); }
window.addEventListener('pagehide', flushPendingSave);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') flushPendingSave(); });

// Entry point for format changes: saves without a "version" are version 0 (the shape before versioning);
// version 1 is the current shape, so nothing to convert yet.
function migrateSaved(parsed){
  const v = Number(parsed.version) || 0;
  // if(v < 2){ ...convert to version 2... }
  return parsed;
}

async function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = migrateSaved(JSON.parse(raw));
      if(parsed.subjects && parsed.subjects.length) state.subjects = parsed.subjects;
      if(parsed.records) state.records = parsed.records;
      if(parsed.goals) state.goals = parsed.goals;
      if(parsed.theme) state.theme = parsed.theme;
      if(DESIGN_IDS.includes(parsed.design)) state.design = parsed.design; // older saves have no "design": keep the default
      const migratedBalance = migrateBalance(parsed.balance); // older saves: no balance (feature stays off) or an earlier single-setup shape
      if(migratedBalance) state.balance = migratedBalance;
      if(parsed.lastMemo) state.lastMemo = parsed.lastMemo;
      if(parsed.timer && parsed.timer.subjectIds && parsed.timer.subjectIds.length) state.timer = parsed.timer;
      if(Array.isArray(parsed.deadlines)) state.deadlines = parsed.deadlines;
    }
  }catch(e){
    // no existing data yet, or storage unavailable — use defaults
  }
  applyTheme();
  ui.form.memo = state.lastMemo || '';
}

// Two independent axes: data-design (calm/cute/neon/violet/sea) and the .dark class (light/dark mode).
function applyTheme(){
  const root = document.documentElement;
  root.classList.toggle('dark', state.theme==='dark');
  root.setAttribute('data-design', state.design);
  syncSeaVideo();
  loadDesignFont(state.design);
  // keep the browser/PWA status bar colour in step with the page background
  const meta = document.querySelector('meta[name="theme-color"]');
  const bg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
  if(meta && bg) meta.setAttribute('content', bg);
}

// Swap in the chosen design's typeface (URLs live in index.html so the first paint already has it).
function loadDesignFont(design){
  const href = (window.DESIGN_FONTS || {})[design];
  let link = document.getElementById('design-font');
  if(!href){ if(link) link.remove(); return; }
  if(!link){ link = document.createElement('link'); link.rel='stylesheet'; link.id='design-font'; document.head.appendChild(link); }
  if(link.getAttribute('href')!==href) link.setAttribute('href', href);
}

// ---------- toast ----------
let toastTimer=null;
function showToast(msg, undo){
  let el = document.getElementById('toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.setAttribute('role','status');
  if(undo){
    el.textContent='';
    const mark=document.createElement('span');
    mark.className='toast-check'; mark.textContent='✓'; mark.setAttribute('aria-hidden','true');
    const copy=document.createElement('span'); copy.className='toast-copy';
    const split=msg.lastIndexOf('。');
    const title=document.createElement('span'); title.className='toast-title';
    title.textContent=split<0 ? msg : msg.slice(0,split);
    copy.appendChild(title);
    if(split>=0){
      const detail=document.createElement('span'); detail.className='toast-detail';
      detail.textContent=msg.slice(split+1); copy.appendChild(detail);
    }
    el.appendChild(mark); el.appendChild(copy);
    const button=document.createElement('button');
    button.type='button'; button.textContent='取り消す';
    button.addEventListener('click',undo,{once:true});
    el.appendChild(button);
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> {el.classList.remove('show'); el.textContent='';}, undo ? 10000 : 2200);
}

function showRecordSaveFeedback(records, before){
  if(!records.length) return;
  const saved=records.map(r=>({...r}));
  const date=saved[0].date;
  const subject=state.subjects.find(s=>s.id===saved[0].subjectId);
  const summary=saved.length>1 ? `${saved.length}件の記録を追加` : `${subject ? subject.name : '科目'}${fmtMin(saved[0].minutes)}を${before ? '更新' : '追加'}`;
  const deadline=Date.now()+10000;
  showToast(`${summary}。${date===isoToday() ? '今日' : date}の合計${fmtMin(totalOn(date))}`,()=>{
    if(Date.now()>=deadline) return;
    // Do not undo records that have since been edited, removed or restored.
    if(!saved.every(r=>{
      const current=state.records.find(x=>x.id===r.id);
      return current && JSON.stringify(current)===JSON.stringify(r);
    })) {showToast('記録が変更されたため取り消せません');return;}
    if(before){
      const index=state.records.findIndex(r=>r.id===before.id);
      state.records[index]={...before};
    }else{
      const ids=new Set(saved.map(r=>r.id));
      state.records=state.records.filter(r=>!ids.has(r.id));
    }
    persist(); render(); showToast('保存を取り消しました');
  });
}

// ---------- streak ----------
function computeStreak(){
  let streak=0;
  let cursor = new Date();
  // if today not yet achieved, start checking from yesterday
  let todayIso = isoToday();
  if(totalOn(todayIso) < goalFor(todayIso) || goalFor(todayIso)===0){
    if(!(goalFor(todayIso)===0 && totalOn(todayIso)>0)){
      cursor.setDate(cursor.getDate()-1);
    }
  }
  for(let i=0;i<365;i++){
    const iso = dateToISO(cursor);
    const g = goalFor(iso);
    if(g>0 && totalOn(iso)>=g){ streak++; cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}

// ---------- level / xp ----------
const MIN_PER_LEVEL = 300; // 5 hours per level
function computeLevel(){
  const totalMinutes = state.records.reduce((a,r)=>a+r.minutes,0);
  const level = Math.floor(totalMinutes / MIN_PER_LEVEL) + 1;
  const into = totalMinutes % MIN_PER_LEVEL;
  const pct = Math.round((into/MIN_PER_LEVEL)*100);
  const remain = MIN_PER_LEVEL - into;
  return { level, pct, remain, totalMinutes };
}

