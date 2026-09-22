(function(){

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
};
function icon(name, size=18, extraClass=''){
  const inner = ICON_PATHS[name] || '';
  return `<svg class="icon ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function logomark(){
  return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="13" width="4.2" height="7.5" rx="1.4" fill="#fff" opacity=".85"/>
    <rect x="9.9" y="8" width="4.2" height="12.5" rx="1.4" fill="#fff"/>
    <rect x="16.3" y="3.5" width="4.2" height="17" rx="1.4" fill="#fff" opacity=".85"/>
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
};

const DESIGNS = [
  { id:'calm', name:'Calm Focus', desc:'落ち着いた上品なデザイン。ベージュ×セージグリーン', swatch:['#F3F0E9','#5E7857','#7A726A'] },
  { id:'cute', name:'Soft Cute',  desc:'やわらかくてかわいい。淡いピンク×水色',           swatch:['#FBE1E7','#B85673','#D6E6F5'] },
  { id:'neon', name:'Neon Pop',   desc:'ネオンピンク×ネオンブルー。光るポップな夜のデザイン', swatch:['#160B2E','#FF3EA5','#27D8FF'] },
  { id:'violet', name:'Neon Violet', desc:'ビビッドな紫×マゼンタ。絵の具が弾けるアートなネオン', swatch:['#3A10B5','#FF2FA8','#9DB2FF'] },
  { id:'sea',  name:'Deep Sea',   desc:'海から深海へ。青×シアンの世界観（ダークモード推奨）', swatch:['#0A3350','#38C6E8','#6C7CF0'] },
];
const DESIGN_IDS = DESIGNS.map(d=>d.id);

let ui = {
  tab: 'home',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  homeYear: new Date().getFullYear(),
  homeMonth: new Date().getMonth(),
  selectedDate: isoToday(),
  form: { date: isoToday(), subjectIds: [], hours: 1, minutes: 0, memo: '', editingId: null },
  rangeStart: (function(){ const d=new Date(); d.setDate(d.getDate()-6); return dateToISO(d); })(), // for the home screen's date-range total
  rangeEnd: isoToday(),
  rangeSubjectIds: null, // null means "all subjects"; becomes an explicit array once the user filters
  balanceEditIdx: null, // index of a history entry being corrected directly from the history list (overrides the apply date)
  balanceApplyFrom: null, // ISO date the Settings edits apply from (null = today); shows the setup in force on that day
  weekDay: null, // ISO date of the tapped bar in the week card (shows that day breakdown by subject)
  weekOffset: 0, // 0 = this week, -1 = last week, ... (home week card and balance card)
  balancePeriod: 'week', // 'week' | 'month' for the home balance card
  confirm: null, // { title, desc, actionType, actionId }
  datePicker: null, // { year, month, target } when open — target is 'record', 'rangeStart', or 'rangeEnd'
  subjectEditor: null, // { id, name, color } when editing a subject
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
function recordsOn(iso){ return state.records.filter(r=>r.date===iso); }
function totalOn(iso){ return recordsOn(iso).reduce((a,r)=>a+r.minutes,0); }

function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36); }

// ---------- storage ----------
// NOTE: this file is meant to be saved and opened as a standalone app (VSCode, double-click,
// Live Server, etc.), so we use the browser's standard localStorage rather than any
// environment-specific API. Data is stored per-origin/per-file in the browser you open it in.
const STORAGE_KEY = 'study-app-data';
let saveTimer=null;
function persist(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        subjects: state.subjects, records: state.records, goals: state.goals, theme: state.theme, design: state.design, balance: state.balance, lastMemo: state.lastMemo
      }));
    }catch(e){ console.error('save failed', e); showToast('保存に失敗しました'); }
  }, 150);
}

async function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed.subjects && parsed.subjects.length) state.subjects = parsed.subjects;
      if(parsed.records) state.records = parsed.records;
      if(parsed.goals) state.goals = parsed.goals;
      if(parsed.theme) state.theme = parsed.theme;
      if(DESIGN_IDS.includes(parsed.design)) state.design = parsed.design; // older saves have no "design": keep the default
      const migratedBalance = migrateBalance(parsed.balance); // older saves: no balance (feature stays off) or an earlier single-setup shape
      if(migratedBalance) state.balance = migratedBalance;
      if(parsed.lastMemo) state.lastMemo = parsed.lastMemo;
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
  // keep the browser/PWA status bar colour in step with the page background
  const meta = document.querySelector('meta[name="theme-color"]');
  const bg = getComputedStyle(root).getPropertyValue('--color-bg').trim();
  if(meta && bg) meta.setAttribute('content', bg);
}

// ---------- toast ----------
let toastTimer=null;
function showToast(msg){
  let el = document.getElementById('toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
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

// ---------- render root ----------
const TAB_ORDER = ['home','calendar','record','settings'];

function render(){
  const root = document.getElementById('canvas');
  const tabIndex = TAB_ORDER.indexOf(ui.tab);
  root.innerHTML = `
    <div class="mesh"><span></span><span></span><span></span></div>
    <!-- Deep Sea backdrop (visible only when data-design="sea"). Mounting points for future
         scroll-depth effects: drive --depth (0..1) on <html>, animate .sea-particles, and drop
         fish / jellyfish into .sea-slot elements. -->
    <div class="sea-layers" aria-hidden="true">
      <div class="sea-gradient"></div>
      <div class="sea-light"></div>
      <div class="sea-particles"></div>
    </div>
    <div class="phone">
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark">${logomark()}</div>
          <div>
            <div class="brand-text">Study Time</div>
            <div class="brand-sub">積み上げが、力になる</div>
          </div>
        </div>
        <div class="iconbtn" data-action="toggle-theme" role="button" tabindex="0" aria-label="${state.theme==='dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}">${state.theme==='dark' ? icon('sun',17) : icon('moon',17)}</div>
      </div>
      <div class="content fade-in" id="content"></div>
      <div class="tabbar">
        <div class="tab-indicator" style="transform:translateX(${tabIndex*100}%)"></div>
        ${tabBtn('home', icon('home',19), 'ホーム')}
        ${tabBtn('calendar', icon('calendar',19), 'カレンダー')}
        ${tabBtn('record', icon('clock',19), '記録')}
        ${tabBtn('settings', icon('sliders',19), '設定')}
      </div>
    </div>
    ${ui.confirm ? renderConfirmModal() : ''}
    ${ui.datePicker ? renderDatePicker() : ''}
    ${ui.subjectEditor ? renderSubjectEditor() : ''}
  `;
  document.getElementById('content').innerHTML = renderPage();
  bindEvents();
  focusModal();
}

function closeAnyModal(){
  if(ui.confirm){
    ui.confirm = null;
    pendingImport = null;
    pendingCsvImport = null;
    resetImportInput();
    resetCsvImportInput();
    render(); return true;
  }
  if(ui.datePicker){ ui.datePicker = null; render(); return true; }
  if(ui.subjectEditor){ ui.subjectEditor = null; render(); return true; }
  return false;
}

// Every render() replaces the whole canvas, which drops DOM focus back to <body> —
// so while a modal is open we re-focus into it on every render (not just the first),
// otherwise Tab/Escape handling on #canvas would stop receiving key events entirely.
function focusModal(){
  const box = document.querySelector('.modal-box');
  if(!box) return;
  const target = box.querySelector('.day-cell.selected') || box.querySelector('input, button, [role="button"]');
  if(target) target.focus();
}

// target identifies which date field the picker is editing: 'record', 'rangeStart', 'rangeEnd', 'balanceApply', 'balanceFrom:<n>' or 'balanceTo:<n>'.
function openDatePicker(target, currentIso){
  const d = isoToDate(currentIso);
  ui.datePicker = { year: d.getFullYear(), month: d.getMonth(), target };
  render();
}

function currentDateForTarget(target){
  if(target==='balanceApply') return balanceApplyDate();
  if(target.startsWith('balanceTo:') && state.balance){
    const next = state.balance.versions[Number(target.split(':')[1])+1];
    if(next){ const e = isoToDate(next.from); e.setDate(e.getDate()-1); return dateToISO(e); }
  }
  if(target.startsWith('balanceFrom:') && state.balance){
    const v = state.balance.versions[Number(target.split(':')[1])];
    if(v) return v.from===BALANCE_SINCE_START ? isoToday() : v.from;
  }
  if(target==='rangeStart') return ui.rangeStart;
  if(target==='rangeEnd') return ui.rangeEnd;
  return ui.form.date;
}

function renderDatePicker(){
  const dp = ui.datePicker;
  const y = dp.year, m = dp.month;
  const first = new Date(y,m,1);
  const startOffset = (first.getDay()+6)%7; // Monday-start
  const daysInMonth = new Date(y,m+1,0).getDate();
  const todayIso = isoToday();
  const selIso = currentDateForTarget(dp.target);

  let cells = '';
  const totalCells = Math.ceil((startOffset+daysInMonth)/7)*7;
  for(let i=0;i<totalCells;i++){
    const dayNum = i - startOffset + 1;
    if(dayNum<1 || dayNum>daysInMonth){
      cells += `<div class="day-cell muted"></div>`;
      continue;
    }
    const iso = dateToISO(new Date(y,m,dayNum));
    const isToday = iso===todayIso;
    const isSel = iso===selIso;
    cells += `
      <div class="day-cell ${isToday?'today':''} ${isSel?'selected':''}" data-action="dp-select-day" data-date="${iso}" role="button" tabindex="0" aria-label="${formatDateFull(iso)}">
        <div class="day-num">${dayNum}</div>
      </div>`;
  }

  return `
    <div class="modal-overlay" data-action="cancel-date-picker">
      <div class="modal-box dp-box" data-action="stop" role="dialog" aria-modal="true" aria-label="日付を選択">
        <div class="cal-head">
          <div class="cal-title">${y}年 ${m+1}月</div>
          <div class="cal-nav">
            <div class="iconbtn" data-action="dp-prev-month" role="button" tabindex="0" aria-label="前の月">${icon('chevronLeft',16)}</div>
            <div class="iconbtn" data-action="dp-next-month" role="button" tabindex="0" aria-label="次の月">${icon('chevronRight',16)}</div>
          </div>
        </div>
        <div class="weekday-row">${WEEKDAY_LABELS.map(w=>`<div>${w}</div>`).join('')}</div>
        <div class="cal-grid">${cells}</div>
      </div>
    </div>
  `;
}

function openSubjectEditor(id){
  const s = subjectById(id);
  ui.subjectEditor = { id, name: s.name, color: s.color };
  render();
}

function renderSubjectEditor(){
  const se = ui.subjectEditor;
  return `
    <div class="modal-overlay" data-action="cancel-subject-edit">
      <div class="modal-box" data-action="stop" role="dialog" aria-modal="true" aria-label="科目を編集">
        <div class="modal-title">科目を編集</div>
        <div class="field" style="text-align:left; margin-top:16px;">
          <label class="field-label">科目名</label>
          <input class="input" type="text" data-field="subject-edit-name" value="${escapeHtml(se.name)}">
        </div>
        <div class="field" style="text-align:left;">
          <label class="field-label">色</label>
          <div class="color-swatches">
            ${SUBJECT_PALETTE.map(c=>`<div class="color-swatch ${c===se.color?'selected':''}" style="--pc:${c};background:${c}" data-action="pick-subject-color" data-color="${c}" role="button" tabindex="0" aria-label="この色にする"></div>`).join('')}
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" data-action="cancel-subject-edit">キャンセル</button>
          <button class="modal-btn primary" data-action="save-subject-edit">保存</button>
        </div>
      </div>
    </div>
  `;
}

function renderConfirmModal(){
  const c = ui.confirm;
  return `
    <div class="modal-overlay" data-action="cancel-confirm">
      <div class="modal-box" data-action="stop" role="dialog" aria-modal="true" aria-label="${escapeHtml(c.title)}">
        <div class="modal-icon">${icon('warning',24)}</div>
        <div class="modal-title">${escapeHtml(c.title)}</div>
        <div class="modal-desc">${escapeHtml(c.desc)}</div>
        <div class="modal-actions">
          <button class="modal-btn cancel" data-action="cancel-confirm">キャンセル</button>
          <button class="modal-btn danger" data-action="confirm-delete">${escapeHtml(c.confirmLabel || '削除する')}</button>
        </div>
      </div>
    </div>
  `;
}

function openConfirm(title, desc, actionType, actionId, confirmLabel){
  ui.confirm = { title, desc, actionType, actionId, confirmLabel };
  render();
}

function tabBtn(key,icon,label){
  return `<button data-action="go-tab" data-tab="${key}" class="${ui.tab===key?'active':''}">${icon}<span>${label}</span></button>`;
}

function renderPage(){
  if(ui.tab==='home') return renderHome();
  if(ui.tab==='calendar') return renderCalendar();
  if(ui.tab==='record') return renderRecord();
  if(ui.tab==='settings') return renderSettings();
  return '';
}

// ---------- HOME ----------
// ---------- study balance (2-4 groups of subjects vs. a target split, with a change history) ----------
// state.balance = { enabled, versions:[{ from:'YYYY-MM-DD', savedOn:'YYYY-MM-DD', groups:[{id,name,subjectIds,target}] }] }
// Each version is the setup in force from that date on, so a week or month is always judged by the settings it
// was recorded under. The last version is the current one and the one shown in Settings.
const BALANCE_MIN_GROUPS = 2, BALANCE_MAX_GROUPS = 4;
const BALANCE_SINCE_START = '1970-01-01'; // "from the very beginning" marker for the first version

function isValidGroups(gs){
  return Array.isArray(gs) && gs.length>=BALANCE_MIN_GROUPS && gs.length<=BALANCE_MAX_GROUPS &&
    gs.every(g=>g && typeof g.id==='string' && typeof g.name==='string' && Array.isArray(g.subjectIds) && typeof g.target==='number' && g.target>=0 && g.target<=100);
}
function isValidBalance(b){
  return !!b && typeof b==='object' && Array.isArray(b.versions) && b.versions.length>=1 &&
    b.versions.every(v=>v && typeof v.from==='string' && isValidGroups(v.groups));
}

// Earlier saves used a single setup ({groups} or the first {a,b,targetA} shape): turn them into one version.
function migrateBalance(raw){
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
  groups = groups.map(g=>({ id:g.id||uid(), name:g.name, subjectIds:g.subjectIds||[], target:g.target }));
  const b = { enabled: raw.enabled!==false, versions:[{ from:BALANCE_SINCE_START, savedOn:isoToday(), groups }] };
  return isValidBalance(b) ? b : null;
}

function balanceCurrent(){ const vs = state.balance.versions; return vs[vs.length-1]; }
// The setup that applied on a given day (days before the first version use the first one).
function balanceVersionFor(iso){
  let v = state.balance.versions[0];
  state.balance.versions.forEach(x=>{ if(x.from<=iso) v = x; });
  return v;
}
// The day the Settings edits apply from: today unless one was picked (never in the future).
function balanceApplyDate(){ const d = ui.balanceApplyFrom; return (d && d<=isoToday()) ? d : isoToday(); }
// The setup that was in force on that day; this is what the Settings form shows and edits.
function balanceEditIndex(){
  const i = ui.balanceEditIdx;
  return (state.balance && i!=null && state.balance.versions[i]) ? i : null;
}
function balanceEditing(){
  const i = balanceEditIndex();
  return i!==null ? state.balance.versions[i] : balanceVersionFor(balanceApplyDate());
}
// "9月1日 〜 9月18日" style label for history entry i (the first entry starts "はじめ", the last runs to 現在).
function balancePeriodLabel(i){
  const vs = state.balance.versions;
  let end = '現在';
  if(i<vs.length-1){ const e = isoToDate(vs[i+1].from); e.setDate(e.getDate()-1); end = formatDateJp(dateToISO(e)); }
  return { text: `${i===0 ? 'はじめ' : formatDateJp(vs[i].from)} 〜 ${end}`, end };
}

// Change the setup from the chosen day on (today by default). The past before that day stays as it was.
// - Today: a change on the same day as the last change just edits it (finishing the first setup, fixing a slip);
//   otherwise a new setup starts today.
// - An earlier day: a new setup starts on that day and runs until the next existing setup starts (or until now).
//   If a setup already starts on that day, it is edited in place.
function editBalanceVersion(fn){
  const b = state.balance, today = isoToday(), day = balanceApplyDate();
  const clone = gs=>JSON.parse(JSON.stringify(gs));
  const direct = balanceEditIndex();
  if(direct!==null){ fn(b.versions[direct].groups); persist(); render(); return; } // correcting a history entry: change that entry only
  let target;
  if(day===today){
    const cur = balanceCurrent();
    if(cur.savedOn===today || cur.from===today) target = cur;
    else {
      target = { from:today, savedOn:today, groups:clone(cur.groups) };
      b.versions.push(target);
      showToast('今日から新しい設定にしました（過去の週・月は、そのときの設定で計算します）');
    }
  } else {
    const base = balanceVersionFor(day);
    if(base.from===day) target = base;
    else {
      target = { from:day, savedOn:today, groups:clone(base.groups) };
      b.versions.push(target);
      b.versions.sort((x,y)=> x.from<y.from ? -1 : 1);
      showToast(`${shortDate(day)}から新しい設定にしました（それより前は、前の設定のままです）`);
    }
  }
  fn(target.groups);
  persist(); render();
}

// Splits 100% evenly across n groups (any remainder goes to the first ones, in 1% steps).
function evenTargets(n){
  const base = Math.floor(100/n), extra = 100 - base*n;
  return Array.from({length:n}, (_,i)=> base + (i<extra ? 1 : 0));
}

// Each group's target as a share of the targets' total, so a total that isn't exactly 100 still works.
function normalizedTargets(groups){
  const sum = groups.reduce((a,g)=>a+g.target, 0);
  return groups.map(g=> sum>0 ? g.target/sum : 1/groups.length);
}

// Change the day a later setup starts on. It has to stay after the previous setup's start and before the next one's,
// and can't be in the future (the current setup always starts today or earlier).
function setBalanceVersionStart(idx, iso){
  const vs = state.balance && state.balance.versions;
  if(!vs || idx<1 || idx>=vs.length) return;
  if(iso>isoToday()){ showToast('今日より先の日付にはできません'); return; }
  if(iso<=vs[idx-1].from || (vs[idx+1] && iso>=vs[idx+1].from)){
    showToast('前の設定の開始日より後、次の設定の開始日より前の日付にしてください'); return;
  }
  vs[idx].from = iso;
  persist();
  showToast('開始日を変更しました');
}

// Change the last day of setup idx. Periods sit back to back, so this moves the start of the next setup
// (the day after). The period has to keep at least one day and stay clear of the setup after that.
function setBalanceVersionEnd(idx, iso){
  const vs = state.balance && state.balance.versions;
  if(!vs || idx<0 || idx>=vs.length-1) return;
  const nextStart = isoToDate(iso); nextStart.setDate(nextStart.getDate()+1);
  const newNext = dateToISO(nextStart);
  if(newNext>isoToday()){ showToast('終了日は昨日までにしてください（今日からは現在の設定です）'); return; }
  if(newNext<=vs[idx].from || (vs[idx+2] && newNext>=vs[idx+2].from)){
    showToast('終了日は、この期間の開始日以降、次の期間の終了日より前にしてください'); return;
  }
  vs[idx+1].from = newNext;
  persist();
  showToast('期間を変更しました');
}

function shortDate(iso){ const d = isoToDate(iso); return `${d.getMonth()+1}/${d.getDate()}`; }

// Minutes and target share per group for the week shown on the home screen (ui.weekOffset) or the month shown
// there (ui.homeYear / ui.homeMonth). Records are grouped by the setup in force on their own day, and each
// group's target is its share averaged over the days of the period, so a mid-period change is handled fairly.
function computeBalance(period){
  const b = state.balance;
  if(!b) return null;
  const now = new Date(), todayIso = isoToday();
  let start, end, label;
  if(period==='month'){
    const y = ui.homeYear, m = ui.homeMonth;
    start = dateToISO(new Date(y, m, 1)); end = dateToISO(new Date(y, m+1, 0));
    label = `${y}年${m+1}月${(y===now.getFullYear() && m===now.getMonth()) ? '（今月）' : ''}`;
  } else {
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7) + ui.weekOffset*7);
    const sun = new Date(mon); sun.setDate(mon.getDate()+6);
    start = dateToISO(mon); end = dateToISO(sun);
    label = `${mon.getMonth()+1}/${mon.getDate()}〜${sun.getMonth()+1}/${sun.getDate()}${ui.weekOffset===0 ? '（今週）' : ''}`;
  }
  const lastDay = end<todayIso ? end : todayIso;
  const days = [];
  if(start<=lastDay){ for(const d=isoToDate(start); dateToISO(d)<=lastDay; d.setDate(d.getDate()+1)) days.push(dateToISO(d)); }
  if(days.length===0) days.push(todayIso); // a period that hasn't started yet: use today's setup

  const order = balanceCurrent().groups.map(g=>g.id);
  const names = {}, shareSum = {};
  b.versions.forEach(v=>v.groups.forEach(g=>{ names[g.id] = g.name; }));
  days.forEach(iso=>{
    const v = balanceVersionFor(iso), t = normalizedTargets(v.groups);
    v.groups.forEach((g,i)=>{ shareSum[g.id] = (shareSum[g.id]||0) + t[i]; if(!order.includes(g.id)) order.push(g.id); });
  });
  const ids = order.filter(id=>id in shareSum);
  const index = {}; ids.forEach((id,i)=>{ index[id] = i; });
  const mins = ids.map(()=>0);
  let other = 0;
  state.records.forEach(r=>{
    if(r.date<start || r.date>end) return;
    const g = balanceVersionFor(r.date).groups.find(g=>g.subjectIds.includes(r.subjectId));
    if(g && g.id in index) mins[index[g.id]] += r.minutes; else other += r.minutes;
  });
  const changes = b.versions.filter(v=>v.from>start && v.from<=lastDay).map(v=>v.from);
  return { groups: ids.map(id=>({ id, name:names[id] })), mins, targets: ids.map(id=> shareSum[id]/days.length*100), other, label, changes };
}

// A plain-language next step. The group that is furthest ahead of its target sets the pace; every other
// group is told how much more it needs to catch up to the target split (nobody is asked to do less).
function balanceAdvice(mins, names, targets){
  const total = mins.reduce((a,x)=>a+x, 0);
  if(total===0) return 'この期間の記録はまだありません。記録するとバランスが見えてきます。';
  const t = targets.map(x=>x/100);
  if(mins.every((m,i)=>Math.abs((m/total)*100 - targets[i]) <= 5)) return '目標に近いバランスです。この調子！';
  const pace = Math.max(...mins.map((m,i)=> t[i]>0 ? m/t[i] : 0));
  const parts = [];
  mins.forEach((m,i)=>{
    const add = Math.ceil((t[i]*pace - m)/10)*10;
    if(add>=10) parts.push({ name:names[i], add });
  });
  if(parts.length===0) return '目標に近いバランスです。この調子！';
  parts.sort((x,y)=>y.add-x.add);
  return `目標のバランスに近づけるには、${parts.map(p=>`${escapeHtml(p.name)}にあと${fmtMin(p.add)}`).join('、')}あてるのがおすすめです。`;
}

// Whole-number percentages that always add up to 100 (largest-remainder rounding).
function roundTo100(values){
  const out = values.map(Math.floor);
  let left = 100 - out.reduce((a,x)=>a+x, 0);
  values.map((v,i)=>({ i, frac:v-Math.floor(v) })).sort((x,y)=>y.frac-x.frac).forEach(o=>{ if(left>0){ out[o.i]++; left--; } });
  return out;
}

function renderBalanceHome(){
  if(!state.balance || state.balance.enabled===false){
    return `
    <div class="card card--compact balance-invite">
      <div class="card-title icon-row">${icon('target',15)} 学習バランス</div>
      <div class="balance-note">複数の勉強の時間配分を、目標と比べて見られます。</div>
      <button class="ghost-btn" data-action="go-tab" data-tab="settings">設定でバランスを決める</button>
    </div>`;
  }
  const res = computeBalance(ui.balancePeriod);
  const groups = res.groups;
  const total = res.mins.reduce((a,x)=>a+x, 0);
  const nowD = new Date();
  const atLatest = ui.balancePeriod==='month' ? (ui.homeYear===nowD.getFullYear() && ui.homeMonth===nowD.getMonth()) : ui.weekOffset>=0;
  const pcts = total>0 ? roundTo100(res.mins.map(m=>(m/total)*100)) : res.mins.map(()=>0);
  // The targets shown are the ones actually used for the comparison (scaled to 100 and averaged over the period).
  const tPcts = roundTo100(res.targets);
  let acc = 0;
  const marks = res.targets.slice(0,-1).map(v=>{ acc += v; return acc; });
  const ariaLabel = groups.map((g,i)=>`${escapeHtml(g.name)} ${pcts[i]}%（目標 ${tPcts[i]}%）`).join('、');
  return `
    <div class="card">
      <div class="card-title icon-row">${icon('target',15)} 学習バランス</div>
      <div class="balance-tabs" role="group" aria-label="集計する期間">
        <button type="button" class="${ui.balancePeriod==='week'?'active':''}" data-action="balance-period" data-period="week" aria-pressed="${ui.balancePeriod==='week'}">今週</button>
        <button type="button" class="${ui.balancePeriod==='month'?'active':''}" data-action="balance-period" data-period="month" aria-pressed="${ui.balancePeriod==='month'}">今月</button>
      </div>
      <div class="balance-period-row">
        <div class="balance-period-label">${res.label}</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="${ui.balancePeriod==='month'?'home-prev-month':'home-prev-week'}" role="button" tabindex="0" aria-label="${ui.balancePeriod==='month'?'前の月':'前の週'}">${icon('chevronLeft',16)}</div>
          <div class="iconbtn ${atLatest?'is-disabled':''}" ${atLatest?'aria-disabled="true"':`data-action="${ui.balancePeriod==='month'?'home-next-month':'home-next-week'}"`} role="button" tabindex="${atLatest?-1:0}" aria-label="${ui.balancePeriod==='month'?'次の月':'次の週'}">${icon('chevronRight',16)}</div>
        </div>
      </div>
      <div class="balance-bar" role="img" aria-label="${ariaLabel}">
        <div class="balance-track">${groups.map((g,i)=>`<div class="balance-seg g${i}" style="width:${pcts[i]}%"></div>`).join('')}</div>
        ${marks.map(p=>`<div class="balance-target" style="left:${p}%"></div>`).join('')}
      </div>
      ${groups.map((g,i)=>`
        <div class="balance-legend-row">
          <span class="balance-dot g${i}"></span>
          <span class="balance-name">${escapeHtml(g.name)}</span>
          <span class="balance-val">${total>0 ? `${pcts[i]}%` : '―'}<small>${total>0 ? `（${fmtMin(res.mins[i])}）` : ''}</small></span>
          <span class="balance-goal">目標 ${tPcts[i]}%</span>
        </div>`).join('')}
      <div class="balance-advice">${balanceAdvice(res.mins, groups.map(g=>g.name), res.targets)}</div>
      ${res.changes.length ? `<div class="balance-note">この期間の途中で、目標やグループの設定が変わっています（${res.changes.map(shortDate).join('、')}から）。目標の割合は、日数で平均して比べています。</div>` : ''}
      ${res.other>0 ? `<div class="balance-note">グループ未設定の科目：${fmtMin(res.other)}（この割合には含めていません）</div>` : ''}
    </div>`;
}

function renderHome(){
  const today = isoToday();
  const goal = goalFor(today);
  const minutes = totalOn(today);
  const pct = goal>0 ? Math.min(100, Math.round((minutes/goal)*100)) : 0;
  const achieved = goal>0 && minutes>=goal;
  const streak = computeStreak();

  const r = 46, c = 2*Math.PI*r;
  const dash = c * (pct/100);

  const now = new Date();
  const dateStr = `${now.getMonth()+1}月${now.getDate()}日（${'日月火水木金土'[now.getDay()]}）`;

  // week strip: Monday-start, browsable with home-prev-week / home-next-week (ui.weekOffset 0 = this week)
  const dow = (now.getDay()+6)%7;
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate()-dow);
  const day0 = new Date(thisMonday); day0.setDate(thisMonday.getDate() + ui.weekOffset*7);
  const isCurrentWeek = ui.weekOffset===0;
  const daysShown = isCurrentWeek ? dow+1 : 7; // days that count for the comparison (up to today for the current week)
  const sumDays = (start, n)=>{ let t=0; for(let i=0;i<n;i++){ const d=new Date(start); d.setDate(start.getDate()+i); t+=totalOn(dateToISO(d)); } return t; };
  const heroWeekTotal = sumDays(thisMonday, 7); // the hero card always shows the real current week
  let weekTotal=0;
  let weekHtml='';
  for(let i=0;i<7;i++){
    const d = new Date(day0); d.setDate(day0.getDate()+i);
    const iso = dateToISO(d);
    const mins = totalOn(iso);
    weekTotal += mins;
    const g = goalFor(iso) || 1;
    const h = Math.max(4, Math.min(100, Math.round((mins/g)*100)));
    const isToday = iso===today;
    const isSel = ui.weekDay===iso;
    weekHtml += `
      <button type="button" class="wcol ${isSel?'selected':''}" data-action="week-select-day" data-date="${iso}" aria-pressed="${isSel}" aria-label="${d.getMonth()+1}月${d.getDate()}日（${WEEKDAY_LABELS[i]}） ${mins>0?fmtMin(mins):'記録なし'}">
        <div class="wbar-track"><div class="wbar-fill" style="height:${mins>0?h:4}%; opacity:${mins>0?1:0.35}"></div></div>
        <div class="wlabel ${isToday?'today':''}">${WEEKDAY_LABELS[i]}</div>
      </button>`;
  }
  // breakdown of the tapped day, only while that day belongs to the week being shown
  let dayDetailHtml = '';
  const inShownWeek = ui.weekDay && ui.weekDay>=dateToISO(day0) && ui.weekDay<=dateToISO(new Date(day0.getFullYear(), day0.getMonth(), day0.getDate()+6));
  if(inShownWeek){
    const dd = isoToDate(ui.weekDay);
    const bySubj = {};
    recordsOn(ui.weekDay).forEach(r=>{ bySubj[r.subjectId] = (bySubj[r.subjectId]||0) + r.minutes; });
    const entries = Object.entries(bySubj).sort((a,b)=>b[1]-a[1]);
    const dayTotal = totalOn(ui.weekDay), dayGoal = goalFor(ui.weekDay);
    dayDetailHtml = `
      <div class="day-detail" aria-live="polite">
        <div class="day-detail-head">
          <div class="day-detail-title">${dd.getMonth()+1}月${dd.getDate()}日（${WEEKDAY_LABELS[(dd.getDay()+6)%7]}）</div>
          <div class="day-detail-total">${dayTotal>0 ? fmtMin(dayTotal) : '記録なし'}${dayGoal>0 && dayTotal>0 ? `<small>（目標の ${Math.round(dayTotal/dayGoal*100)}%）</small>` : ''}</div>
        </div>
        ${entries.map(([sid,min])=>{ const sj = subjectById(sid); return `<div class="subj-row"><div class="subj-dot" style="background:${sj.color}"></div><div class="subj-name">${escapeHtml(sj.name)}</div><div class="subj-min">${fmtMin(min)}</div></div>`; }).join('')}
        <button type="button" class="week-back" style="margin:var(--sp-2) 0 0" data-action="goto-record-day" data-date="${ui.weekDay}">この日の記録を追加・編集する</button>
      </div>`;
  }
  const dayEnd = new Date(day0); dayEnd.setDate(day0.getDate()+6);
  const weekTitle = `${day0.getMonth()+1}/${day0.getDate()}〜${dayEnd.getMonth()+1}/${dayEnd.getDate()}${isCurrentWeek?'（今週）':''}`;

  // weekly comparison: the shown week vs the week before it (same weekday range while the week is still running)
  const prevWeekStart = new Date(day0); prevWeekStart.setDate(day0.getDate()-7);
  const lastWeekSameRange = sumDays(prevWeekStart, daysShown);
  const thisWeekSoFar = sumDays(day0, daysShown);
  const prevLabel = isCurrentWeek ? '先週' : '前の週';
  let cmp;
  if(lastWeekSameRange===0 && thisWeekSoFar===0){
    cmp = { cls:'neutral', icon:'minus', label:'―', note:'まだ記録がありません' };
  } else if(lastWeekSameRange===0){
    cmp = { cls:'up', icon:'arrowUp', label:'NEW', note: isCurrentWeek ? '先週は記録なしでした。今週からいいペース！' : '前の週は記録がありませんでした' };
  } else {
    const p = Math.round(((thisWeekSoFar-lastWeekSameRange)/lastWeekSameRange)*100);
    const span = isCurrentWeek ? `先週の同じ${daysShown}日間` : '前の週';
    cmp = p>=0
      ? { cls:'up', icon:'arrowUp', label:`+${p}%`, note:`${span}より伸びています` }
      : { cls:'down', icon:'arrowDown', label:`${p}%`, note:`${span}より少なめです` };
  }

  // month progress (browsable via home-prev-month/home-next-month)
  const y=ui.homeYear, m=ui.homeMonth;
  const isCurrentMonth = y===now.getFullYear() && m===now.getMonth();
  const daysInMonth = new Date(y,m+1,0).getDate();
  let monthTotal=0, monthGoal=0;
  for(let d=1; d<=daysInMonth; d++){
    const iso = dateToISO(new Date(y,m,d));
    monthTotal += totalOn(iso);
    monthGoal += goalFor(iso);
  }
  const monthPct = monthGoal>0 ? Math.min(100, Math.round((monthTotal/monthGoal)*100)) : 0;

  // subject breakdown this month
  const bySubject = {};
  for(let d=1; d<=daysInMonth; d++){
    const iso = dateToISO(new Date(y,m,d));
    recordsOn(iso).forEach(r=>{ bySubject[r.subjectId] = (bySubject[r.subjectId]||0) + r.minutes; });
  }
  const subjEntries = Object.entries(bySubject).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxSubj = subjEntries.length ? subjEntries[0][1] : 1;

  const allTime = computeAllTimeStats();
  const rangeSubjectIds = ui.rangeSubjectIds===null ? state.subjects.map(s=>s.id) : ui.rangeSubjectIds;
  const range = computeRangeTotal(ui.rangeStart, ui.rangeEnd, rangeSubjectIds);

  return `
    <div class="hero ${achieved ? 'hero-achieved' : ''}">
      ${achieved ? `<div class="confetti" id="confetti"></div>` : ''}
      <div class="hero-top">
        <div>
          <div class="hero-date">${dateStr}</div>
          <div class="hero-greet">${achieved ? `<span class="icon-row">${icon('check',15)} 今日の目標達成！</span>` : '今日もコツコツいこう'}</div>
        </div>
        <div class="streak-chip">${icon('flame',13)} ${streak}日</div>
      </div>
      <div class="hero-main">
        <div class="hero-time">
          <div class="hero-label">今日の学習時間</div>
          <div class="hero-display">${fmtMinHtml(minutes)}</div>
          <div class="hero-goal">${achieved ? '目標達成！おつかれさま' : (goal>0 ? `目標まであと ${fmtMin(goal-minutes)}` : '設定タブで目標を決めよう')}</div>
        </div>
        <div class="ring-wrap" role="img" aria-label="今日の目標達成率 ${pct}%">
          <svg viewBox="0 0 110 110" aria-hidden="true">
            <circle class="ring-track" cx="55" cy="55" r="${r}" fill="none" stroke-width="10"/>
            <circle class="ring-fill" cx="55" cy="55" r="${r}" fill="none" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${c}" stroke-dashoffset="${c-dash}" transform="rotate(-90 55 55)"
              style="transition: stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)"/>
          </svg>
          <div class="ring-center">
            <div class="ring-minutes">${pct}%</div>
            <div class="ring-sub">達成率</div>
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div><div class="val">${fmtMin(heroWeekTotal)}</div><div class="lab">今週</div></div>
        <div><div class="val">${goal>0?fmtMin(goal):'未設定'}</div><div class="lab">今日の目標</div></div>
      </div>
    </div>

    <div class="section-label">バランス</div>
    ${renderBalanceHome()}

    <div class="section-label">今週</div>
    <div class="card">
      <div class="cal-head" style="margin-bottom:var(--sp-3);">
        <div class="cal-title">${weekTitle}</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="home-prev-week" role="button" tabindex="0" aria-label="前の週">${icon('chevronLeft',16)}</div>
          <div class="iconbtn ${isCurrentWeek?'is-disabled':''}" ${isCurrentWeek?'aria-disabled="true"':'data-action="home-next-week"'} role="button" tabindex="${isCurrentWeek?-1:0}" aria-label="次の週">${icon('chevronRight',16)}</div>
        </div>
      </div>
      ${isCurrentWeek ? '' : `<button type="button" class="week-back" data-action="home-this-week">今週に戻る</button>`}
      <div class="card-title icon-row">${icon('trending',15)} 1日ごとの推移</div>
      <div class="weekstrip">${weekHtml}</div>
      ${dayDetailHtml || `<div class="week-hint">棒をタップすると、その日の内訳が見られます</div>`}
      <div class="week-compare">
        <div class="card-title icon-row">${icon('trending',15)} 週間比較</div>
        <div class="compare-row">
          <div class="compare-side">
            <div class="compare-label">${isCurrentWeek ? '先週（同期間）' : '前の週'}</div>
            <div class="compare-val">${fmtMin(lastWeekSameRange)}</div>
          </div>
          <div class="compare-badge ${cmp.cls}">${icon(cmp.icon,12)} ${cmp.label}</div>
          <div class="compare-side right">
            <div class="compare-label">${isCurrentWeek ? '今週' : 'この週'}</div>
            <div class="compare-val">${fmtMin(thisWeekSoFar)}</div>
          </div>
        </div>
        <div class="compare-note">${cmp.note}</div>
      </div>
    </div>

    <div class="section-label">今月</div>
    <div class="card">
      <div class="cal-head" style="margin-bottom:var(--sp-3);">
        <div class="cal-title">${y}年${m+1}月${isCurrentMonth?'（今月）':''}</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="home-prev-month" role="button" tabindex="0" aria-label="前の月">${icon('chevronLeft',16)}</div>
          <div class="iconbtn" data-action="home-next-month" role="button" tabindex="0" aria-label="次の月">${icon('chevronRight',16)}</div>
        </div>
      </div>
      <div class="progress-row">
        <div class="t">月の記録</div>
        <div class="n">${fmtMin(monthTotal)}（目標 ${fmtMin(monthGoal)}）</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${monthPct}%"></div></div>
      <div class="month-breakdown">
        <div class="card-title icon-row">${icon('book',15)} 科目ごとの合計（${y}年${m+1}月）</div>
        ${subjEntries.length ? subjEntries.map(([sid,min])=>{
          const s = subjectById(sid);
          const w = Math.round((min/maxSubj)*100);
          return `<div class="subj-row">
            <div class="subj-dot" style="background:${s.color}"></div>
            <div class="subj-name">${escapeHtml(s.name)}</div>
            <div class="subj-min">${fmtMin(min)}</div>
          </div>
          <div class="bar-track" style="height:6px; margin-bottom:2px;"><div class="bar-fill" style="width:${w}%; background:${s.color}"></div></div>`;
        }).join('') : `<div class="empty">まだ記録がありません<br>「記録」タブから始めてみよう</div>`}
      </div>
    </div>

    <div class="section-label">その他の統計</div>
    <div class="card card--compact">
      <div class="card-title icon-row">${icon('trending',15)} これまでの記録</div>
      <div class="alltime-stats">
        <div class="alltime-stat">
          <div class="v">${fmtMin(allTime.totalMinutes)}</div>
          <div class="l">累計時間</div>
        </div>
        <div class="alltime-stat">
          <div class="v">${allTime.dayCount}日</div>
          <div class="l">記録日数</div>
        </div>
        <div class="alltime-stat">
          <div class="v">${allTime.firstDateLabel}</div>
          <div class="l">はじめた日</div>
        </div>
      </div>
    </div>

    <div class="level-card">
      <div class="level-badge">Lv.${computeLevel().level}</div>
      <div class="level-mid">
        <div class="level-top">
          <span class="level-name">きょうも育成中</span>
          <span class="level-remain">次のLvまで ${fmtMin(computeLevel().remain)}</span>
        </div>
        <div class="bar-track"><div class="bar-fill level-fill" style="width:${computeLevel().pct}%"></div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title icon-row">${icon('calendar',15)} 期間で合計を調べる</div>
      <div class="range-row">
        <div class="date-field icon-row" data-action="open-date-picker" data-target="rangeStart" role="button" tabindex="0">
          <span>${formatDateJp(ui.rangeStart)}</span>
          ${icon('calendar',14)}
        </div>
        <span class="range-sep">〜</span>
        <div class="date-field icon-row" data-action="open-date-picker" data-target="rangeEnd" role="button" tabindex="0">
          <span>${formatDateJp(ui.rangeEnd)}</span>
          ${icon('calendar',14)}
        </div>
      </div>
      <div class="field" style="margin:14px 0 0;">
        <label class="field-label">科目${rangeSubjectIds.length===state.subjects.length?'':'（絞り込み中）'}</label>
        <div class="subject-pill-grid">
          ${state.subjects.map(s=>{
            const selected = rangeSubjectIds.includes(s.id);
            return `<button type="button" class="subject-pill ${selected?'selected':''}" data-action="toggle-range-subject" data-id="${s.id}" style="--pc:${s.color};${selected?`background:${s.color};border-color:${s.color};`:''}">
              <span class="dot" style="background:${selected?'#fff':s.color}"></span>${escapeHtml(s.name)}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="range-result">
        ${rangeSubjectIds.length===0
          ? `<div class="empty" style="padding:10px 0;">科目を選んでください</div>`
          : `<div class="v">${fmtMin(range.total)}</div>
             <div class="l">${range.dayCount}日間の合計（1日平均 ${fmtMin(Math.round(range.total/range.dayCount))}）</div>`}
      </div>
    </div>
  `;
}

function computeAllTimeStats(){
  if(state.records.length===0) return { totalMinutes:0, dayCount:0, firstDateLabel:'―' };
  const totalMinutes = state.records.reduce((a,r)=>a+r.minutes,0);
  const dayCount = new Set(state.records.map(r=>r.date)).size;
  const firstDate = state.records.reduce((min,r)=> r.date<min?r.date:min, state.records[0].date);
  const d = isoToDate(firstDate);
  return { totalMinutes, dayCount, firstDateLabel: `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日` };
}

// Sums minutes across [startIso, endIso] inclusive for the given subjects, tolerating
// the range being given backwards.
function computeRangeTotal(startIso, endIso, subjectIds){
  let a = startIso, b = endIso;
  if(a > b){ const t=a; a=b; b=t; }
  const dA = isoToDate(a), dB = isoToDate(b);
  const filterSet = new Set(subjectIds);
  let total = 0, dayCount = 0;
  const cur = new Date(dA);
  while(cur <= dB){
    total += recordsOn(dateToISO(cur)).filter(r=>filterSet.has(r.subjectId)).reduce((sum,r)=>sum+r.minutes,0);
    dayCount++;
    cur.setDate(cur.getDate()+1);
  }
  return { total, dayCount };
}

// ---------- CALENDAR ----------
function renderCalendar(){
  const y = ui.calYear, m = ui.calMonth;
  const first = new Date(y,m,1);
  const startOffset = (first.getDay()+6)%7; // Monday-start
  const daysInMonth = new Date(y,m+1,0).getDate();
  const todayIso = isoToday();

  let cells = '';
  const totalCells = Math.ceil((startOffset+daysInMonth)/7)*7;
  for(let i=0;i<totalCells;i++){
    const dayNum = i - startOffset + 1;
    if(dayNum<1 || dayNum>daysInMonth){
      cells += `<div class="day-cell muted"></div>`;
      continue;
    }
    const iso = dateToISO(new Date(y,m,dayNum));
    const recs = recordsOn(iso);
    const uniqueSubs = [...new Set(recs.map(r=>r.subjectId))].slice(0,3);
    const total = totalOn(iso);
    const g = goalFor(iso);
    const achieved = g>0 && total>=g;
    const isToday = iso===todayIso;
    const isSel = iso===ui.selectedDate;
    cells += `
      <div class="day-cell ${isToday?'today':''} ${isSel?'selected':''}" data-action="select-day" data-date="${iso}" role="button" tabindex="0" aria-label="${formatDateFull(iso)}${achieved?'・目標達成':''}">
        ${achieved?`<div class="day-check">${icon('check',9)}</div>`:''}
        <div class="day-num">${dayNum}</div>
        <div class="day-dots">${uniqueSubs.map(sid=>`<span style="background:${subjectById(sid).color}"></span>`).join('')}</div>
      </div>`;
  }

  const sel = ui.selectedDate;
  const selDate = isoToDate(sel);
  const selLabel = `${selDate.getMonth()+1}月${selDate.getDate()}日（${'日月火水木金土'[selDate.getDay()]}）`;
  const selRecs = recordsOn(sel);

  return `
    <div class="card">
      <div class="cal-head">
        <div class="cal-title">${y}年 ${m+1}月</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="prev-month" role="button" tabindex="0" aria-label="前の月">${icon('chevronLeft',16)}</div>
          <div class="iconbtn" data-action="next-month" role="button" tabindex="0" aria-label="次の月">${icon('chevronRight',16)}</div>
        </div>
      </div>
      <div class="weekday-row">${WEEKDAY_LABELS.map(w=>`<div>${w}</div>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>

    <div class="card day-detail">
      <div class="dd-head">
        <div class="dd-date">${selLabel}</div>
        <div class="dd-total">${fmtMin(totalOn(sel))}</div>
      </div>
      ${selRecs.length ? selRecs.map(r=>recordItemHtml(r)).join('') : `<div class="empty">この日の記録はまだありません</div>`}
      <button class="goto-btn icon-row" data-action="goto-record-day" data-date="${sel}">${icon('plus',14)} この日を記録する</button>
    </div>
  `;
}

function recordItemHtml(r){
  const s = subjectById(r.subjectId);
  return `
    <div class="record-item">
      <div class="rec-badge" style="--pc:${s.color};background:${s.color}"></div>
      <div class="rec-body">
        <div class="rec-subject">${escapeHtml(s.name)}</div>
        ${r.memo ? `<div class="rec-memo">${escapeHtml(r.memo)}</div>` : ''}
      </div>
      <div class="rec-time">${fmtMin(r.minutes)}</div>
      <div class="rec-actions">
        <button data-action="edit-record" data-id="${r.id}" aria-label="記録を編集">${icon('edit',13)}</button>
        <button data-action="delete-record" data-id="${r.id}" aria-label="記録を削除">${icon('trash',13)}</button>
      </div>
    </div>
  `;
}

// ---------- RECORD ----------
function renderRecord(){
  const f = ui.form;
  const isEditing = !!f.editingId;
  const dayRecs = recordsOn(f.date);
  const hourOptions = Array.from({length:13}, (_,i)=>i);
  const minOptions = [0,10,20,30,40,50];

  return `
    <div class="card">
      <div class="card-title icon-row">${isEditing ? icon('edit',15)+' 記録を編集' : icon('clock',15)+' 勉強時間を記録'}</div>

      <div class="field">
        <label class="field-label">日付</label>
        <div class="date-field icon-row" data-action="open-date-picker" data-target="record" role="button" tabindex="0">
          <span>${formatDateFull(f.date)}</span>
          ${icon('calendar',16)}
        </div>
      </div>

      <div class="field">
        <label class="field-label">科目${isEditing?'':'（複数選択可）'}</label>
        <div class="subject-pill-grid">
          ${state.subjects.map(s=>{
            const selected = f.subjectIds.includes(s.id);
            return `<button type="button" class="subject-pill ${selected?'selected':''}" data-action="toggle-subject-select" data-id="${s.id}" style="--pc:${s.color};${selected?`background:${s.color};border-color:${s.color};`:''}">
              <span class="dot" style="background:${selected?'#fff':s.color}"></span>${escapeHtml(s.name)}
            </button>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label class="field-label">時間</label>
          <div class="select-wrap">
            <select data-field="hours">
              ${hourOptions.map(h=>`<option value="${h}" ${h===f.hours?'selected':''}>${h}時間</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label class="field-label">分</label>
          <div class="select-wrap">
            <select data-field="minutes">
              ${minOptions.map(mm=>`<option value="${mm}" ${mm===f.minutes?'selected':''}>${mm}分</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field-label">メモ（任意）</label>
        <textarea data-field="memo" placeholder="やったことを一言メモ...">${escapeHtml(f.memo)}</textarea>
      </div>

      <button class="submit-btn icon-row" data-action="submit-record" ${(f.hours===0 && f.minutes===0) || f.subjectIds.length===0 ?'disabled':''}>
        ${isEditing ? icon('check',15)+' 更新する' : (f.subjectIds.length>1 ? icon('plus',15)+` ${f.subjectIds.length}件を記録する` : icon('plus',15)+' 記録する')}
      </button>
      ${f.subjectIds.length===0 ? `<div class="submit-hint">↑ 科目を選んでください</div>` : ''}
      ${isEditing ? `<div class="cancel-link" data-action="cancel-edit">編集をやめる</div>` : ''}
    </div>

    <div class="section-label">${formatDateJp(f.date)}の記録</div>
    ${dayRecs.length ? dayRecs.map(r=>recordItemHtml(r)).join('') : `<div class="card"><div class="empty">まだ記録がありません</div></div>`}
  `;
}

function formatDateJp(iso){
  const d = isoToDate(iso);
  return `${d.getMonth()+1}月${d.getDate()}日`;
}
function formatDateFull(iso){
  const d = isoToDate(iso);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`;
}

// ---------- SETTINGS ----------
function renderSettings(){
  const g = state.goals;
  const wdH = Math.floor(g.weekday/60), wdM = g.weekday%60;
  const weH = Math.floor(g.weekend/60), weM = g.weekend%60;
  const hourOptions = Array.from({length:13}, (_,i)=>i);
  const minOptions = [0,30];

  return `
    <div class="section-label icon-row" style="justify-content:flex-start; margin-top:var(--sp-2);">${icon('sliders',13)} デザイン</div>
    <div class="card">
      <div class="design-grid" role="radiogroup" aria-label="デザイン">
        ${DESIGNS.map(d=>`
          <button type="button" class="design-option" role="radio" aria-checked="${state.design===d.id}" data-action="set-design" data-design="${d.id}">
            <span class="design-swatch" aria-hidden="true">${d.swatch.map(c=>`<i style="background:${c}"></i>`).join('')}</span>
            <span class="design-meta">
              <div class="design-name">${d.name}</div>
              <div class="design-desc">${d.desc}</div>
            </span>
            <span class="design-check" aria-hidden="true">${icon('check',20)}</span>
          </button>
        `).join('')}
      </div>
      <div class="divider"></div>
      <div class="toggle-row">
        <div class="t icon-row" style="justify-content:flex-start">${icon('moon',16)} ダークモード</div>
        <div class="switch ${state.theme==='dark'?'on':''}" data-action="toggle-theme-switch" role="switch" aria-checked="${state.theme==='dark'}" aria-label="ダークモード" tabindex="0"><div class="knob"></div></div>
      </div>
    </div>

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('target',13)} 目標時間の設定</div>
    <div class="card">
      <label class="field-label">平日（1日）</label>
      <div class="field-row">
        <div class="select-wrap"><select data-field="goal-weekday-h">${hourOptions.map(h=>`<option value="${h}" ${h===wdH?'selected':''}>${h}時間</option>`).join('')}</select></div>
        <div class="select-wrap"><select data-field="goal-weekday-m">${minOptions.map(mm=>`<option value="${mm}" ${mm===wdM?'selected':''}>${mm}分</option>`).join('')}</select></div>
      </div>
      <div class="divider"></div>
      <label class="field-label">土日（1日）</label>
      <div class="field-row">
        <div class="select-wrap"><select data-field="goal-weekend-h">${hourOptions.map(h=>`<option value="${h}" ${h===weH?'selected':''}>${h}時間</option>`).join('')}</select></div>
        <div class="select-wrap"><select data-field="goal-weekend-m">${minOptions.map(mm=>`<option value="${mm}" ${mm===weM?'selected':''}>${mm}分</option>`).join('')}</select></div>
      </div>
      <button class="submit-btn" style="margin-top:14px" data-action="save-goals">目標時間を保存</button>
    </div>

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('book',13)} 科目の設定</div>
    <div class="card">
      ${state.subjects.map((s,idx)=>`
        <div class="subject-chip">
          <div class="dot" style="background:${s.color}"></div>
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="reorder-btns">
            <button data-action="move-subject-up" data-id="${s.id}" aria-label="「${escapeHtml(s.name)}」を上に移動" ${idx===0?'disabled':''}>${icon('arrowUp',12)}</button>
            <button data-action="move-subject-down" data-id="${s.id}" aria-label="「${escapeHtml(s.name)}」を下に移動" ${idx===state.subjects.length-1?'disabled':''}>${icon('arrowDown',12)}</button>
          </div>
          <button data-action="edit-subject" data-id="${s.id}" aria-label="「${escapeHtml(s.name)}」を編集">${icon('edit',13)}</button>
          <button data-action="delete-subject" data-id="${s.id}" aria-label="「${escapeHtml(s.name)}」を削除">${icon('x',13)}</button>
        </div>
      `).join('')}
      <div class="add-subject-row">
        <input class="input" type="text" id="new-subject-input" placeholder="新しい科目名">
        <button data-action="add-subject">追加</button>
      </div>
    </div>

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('target',13)} 学習バランス</div>
    <div class="card">${renderBalanceSettings()}</div>

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('archive',13)} データのバックアップ</div>
    <div class="card">
      <div class="backup-warning">
        ${icon('warning',14)}
        <span>記録はこの端末のブラウザだけに保存されています。機種変更やブラウザのデータ削除で消えてしまうため、時々バックアップを書き出しておくことをおすすめします。</span>
      </div>
      <button class="ghost-btn" data-action="export-json">${icon('archive',15)} バックアップを書き出す</button>
      <button class="ghost-btn" data-action="export-csv">${icon('file',15)} CSVを書き出す</button>
      <button class="ghost-btn" data-action="trigger-import">${icon('upload',15)} バックアップを読み込む</button>
      <button class="ghost-btn" data-action="trigger-csv-import">${icon('upload',15)} CSVを読み込む</button>
      <input type="file" id="import-file" class="file-input" accept="application/json">
      <input type="file" id="import-csv-file" class="file-input" accept=".csv,text/csv">
    </div>
  `;
}

function renderBalanceSettings(){
  const bal = state.balance;
  if(!bal || bal.enabled===false){
    const hasSaved = !!bal; // switched off earlier: the setup and its history are still stored
    return `
      <div class="balance-note" style="margin-top:0">${hasSaved
        ? 'バランス機能はオフです。前回の設定（グループ・科目・目標）は残してあるので、オンにするとそのまま復元されます。'
        : `科目をグループに分けて、時間の配分を目標と比べます（2〜${BALANCE_MAX_GROUPS}グループ）。日商簿記を含む科目は、自動で2つ目のグループに入ります（あとから変更できます）。`}</div>
      <button class="submit-btn" style="margin-top:14px" data-action="balance-enable">${hasSaved ? '前回の設定でバランスを見る' : 'バランスを見る設定を始める'}</button>`;
  }
  const editIdx = balanceEditIndex();
  const applyDay = balanceApplyDate(), isToday = applyDay===isoToday();
  const groups = balanceEditing().groups;
  const sum = groups.reduce((a,g)=>a+g.target, 0);
  const pctOptions = Array.from({length:19}, (_,i)=>(i+1)*5);
  const versions = bal.versions;
  return `
    <div id="balance-editor-top"></div>
    ${editIdx!==null ? `
      <div class="balance-editing-banner" role="status">
        <div class="balance-editing-title">履歴を修正中：${balancePeriodLabel(editIdx).text}</div>
        <div class="balance-note" style="margin-top:var(--sp-1)">この期間の設定だけを、下のフォームで直接直せます（前後の期間は変わりません）。</div>
        <button type="button" class="week-back" style="margin:var(--sp-2) 0 0" data-action="balance-edit-stop">修正を終える</button>
      </div>` : `
      <label class="field-label">この変更をいつから適用する？</label>
      <div class="balance-apply-row">
        <div class="date-field icon-row" data-action="open-date-picker" data-target="balanceApply" role="button" tabindex="0" aria-label="変更を適用する日を選ぶ（いまは${formatDateFull(applyDay)}）">
          <span>${isToday ? '今日（' + formatDateJp(applyDay) + '）から' : formatDateJp(applyDay) + ' から'}</span>${icon('calendar',14)}
        </div>
        ${isToday ? '' : `<button type="button" class="week-back" style="margin:0" data-action="balance-apply-today">今日に戻す</button>`}
      </div>
      <div class="balance-note" style="margin-top:var(--sp-2)">${isToday
        ? '目標やグループを変えると、今日から新しい設定になります。過去の週・月は、そのときの設定のまま計算されます。'
        : `${formatDateJp(applyDay)}より前は、いまの設定のままです。${formatDateJp(applyDay)}から、次の設定が始まる日の前日（なければ現在）までが、下の内容に変わります。下は、その日に使っていた設定です。`}</div>`}
    <div class="divider"></div>
    ${groups.map((g,i)=>`
      <div class="balance-group">
        <div class="balance-group-head">
          <span class="balance-dot g${i}"></span>
          <label class="field-label" for="balance-name-${i}" style="margin:0">グループ${i+1}の名前</label>
          ${groups.length>BALANCE_MIN_GROUPS ? `<button type="button" class="balance-remove" data-action="balance-remove-group" data-index="${i}" aria-label="グループ${i+1}「${escapeHtml(g.name)}」を削除">${icon('x',13)}</button>` : ''}
        </div>
        <div class="field-row">
          <input class="input" type="text" id="balance-name-${i}" maxlength="14" data-field="balance-name" data-index="${i}" value="${escapeHtml(g.name)}">
          <div class="select-wrap balance-target-select"><select data-field="balance-target" data-index="${i}" aria-label="グループ${i+1}の目標の割合">
            ${pctOptions.map(p=>`<option value="${p}" ${p===g.target?'selected':''}>目標 ${p}%</option>`).join('')}
          </select></div>
        </div>
        <label class="field-label" style="margin-top:var(--sp-3)">入れる科目</label>
        <div class="subject-pill-grid">
          ${state.subjects.map(s=>{
            const on = g.subjectIds.includes(s.id);
            return `<button type="button" class="balance-pill g${i} ${on?'on':''}" aria-pressed="${on}" data-action="balance-toggle-subject" data-index="${i}" data-id="${s.id}">
              <span class="dot" style="background:${s.color}"></span>${escapeHtml(s.name)}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="divider"></div>
    `).join('')}
    <div class="balance-sum ${sum===100?'ok':'warn'}" role="status">目標の合計：${sum}%${sum===100 ? '' : '（100%にすると分かりやすくなります。このままでも、割合に直して計算します）'}</div>
    ${groups.length<=BALANCE_MIN_GROUPS ? `<div class="balance-note" style="margin-top:0;margin-bottom:var(--sp-3)">バランスは、グループが最低${BALANCE_MIN_GROUPS}つあって成り立つので、いまは削除できません（グループを追加すると、削除ボタンが出ます）。グループをなくしたいときは、下の「バランス機能をオフにする」を押してください。</div>` : ""}
    <div class="balance-actions">
      <button class="ghost-btn" data-action="balance-equalize">均等にする</button>
      ${groups.length<BALANCE_MAX_GROUPS ? `<button class="ghost-btn" data-action="balance-add-group">グループを追加</button>` : ''}
    </div>
    <div class="divider"></div>
    <label class="field-label">設定の履歴</label>
    <div class="balance-history">
      ${versions.map((v,i)=>({v,i})).reverse().map(({v,i})=>{
        const t = normalizedTargets(v.groups);
        const isFirst = i===0, isLast = i===versions.length-1;
        const { text:period, end:endLabel } = balancePeriodLabel(i);
        return `<div class="balance-history-row ${editIdx===i?'editing':''}">
          <div class="balance-history-main">
            <div class="balance-history-date">${period}${isLast ? '（現在の設定）' : ''}</div>
            <div class="balance-history-sum">${v.groups.map((g,gi)=>`${escapeHtml(g.name)} ${Math.round(t[gi]*100)}%`).join(' ／ ')}</div>
            ${isFirst ? `<div class="balance-history-hint">最初の設定です。開始日より前の日も、この設定で計算します。${isLast ? '' : '終了日は変えられます。'}</div>` : ''}
            <div class="balance-period-fields">
              ${isFirst ? '' : `<div class="date-field icon-row balance-from-field" data-action="open-date-picker" data-target="balanceFrom:${i}" role="button" tabindex="0" aria-label="この設定の開始日を変える（いまは${formatDateFull(v.from)}）">
                <span>開始日：${formatDateJp(v.from)}</span>${icon('calendar',14)}
              </div>`}
              ${isLast ? '' : `<div class="date-field icon-row balance-from-field" data-action="open-date-picker" data-target="balanceTo:${i}" role="button" tabindex="0" aria-label="この設定の終了日を変える（いまは${endLabel}）">
                <span>終了日：${endLabel}</span>${icon('calendar',14)}
              </div>`}
            </div>
            <button type="button" class="week-back" style="margin:var(--sp-2) 0 0" data-action="balance-edit-version" data-index="${i}">${editIdx===i ? '修正中（上のフォームで直せます）' : 'この期間の条件（グループ・科目・目標）を修正する'}</button>
          </div>
          ${versions.length>1 ? `<button type="button" class="balance-remove" data-action="balance-delete-version" data-index="${i}" aria-label="この設定を履歴から削除">${icon('x',13)}</button>` : ''}
        </div>`;
      }).join('')}
    </div>
    <div class="balance-note">「この期間の条件を修正する」を押すと、その期間のグループ・科目・目標を直せます。開始日・終了日を押すと期間も変えられます。期間は前後の設定とつながっているので、終了日を変えると次の設定の開始日も変わります。履歴を削除すると、その期間は前の設定で計算し直されます。同じ日のうちの変更は、新しい履歴を作らず上書きします。</div>
    <button class="ghost-btn" style="margin-top:var(--sp-3)" data-action="balance-disable">バランス機能をオフにする</button>`;
}

function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- events ----------
function bindEvents(){
  const root = document.getElementById('canvas');
  if(!root) return;

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('keydown', onKeydown);
}

function onKeydown(e){
  if(e.key === 'Escape'){
    if(closeAnyModal()) e.preventDefault();
    return;
  }
  if(e.key === 'Tab'){
    const box = document.querySelector('.modal-box');
    if(!box) return;
    const focusables = Array.from(box.querySelectorAll('input, button, [role="button"], [role="switch"]'));
    if(focusables.length === 0) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault(); last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault(); first.focus();
    }
    return;
  }
  // Enter in the record form's memo/time fields submits it. Skipped while an IME is composing
  // (Enter there just confirms the conversion; Safari reports that as keyCode 229), and
  // Shift+Enter is left alone so a newline can still be typed in the memo.
  if(e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && ui.tab==='record'){
    const field = e.target.dataset ? e.target.dataset.field : null;
    if(field==='memo' || field==='hours' || field==='minutes'){
      e.preventDefault();
      submitRecordFromKeyboard();
      return;
    }
  }
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const btn = e.target.closest('[role="button"], [role="switch"]');
  if(!btn) return;
  e.preventDefault();
  btn.click();
}

function submitRecordFromKeyboard(){
  // change events for these fields only fire on blur, so read the live values first
  const h = document.querySelector('[data-field="hours"]');
  const m = document.querySelector('[data-field="minutes"]');
  const memo = document.querySelector('[data-field="memo"]');
  if(h) ui.form.hours = Number(h.value);
  if(m) ui.form.minutes = Number(m.value);
  if(memo) ui.form.memo = memo.value;
  if(ui.form.subjectIds.length===0){ showToast('科目を選んでください'); return; }
  if(ui.form.hours===0 && ui.form.minutes===0){ showToast('時間を選んでください'); return; }
  submitRecord();
}

function onClick(e){
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;

  if(action==='go-tab'){
    ui.tab = btn.dataset.tab;
    if(ui.tab==='calendar'){ /* keep month */ }
    render();
    return;
  }
  if(action==='toggle-theme' || action==='toggle-theme-switch'){
    state.theme = state.theme==='dark' ? 'light' : 'dark';
    applyTheme();
    persist();
    render();
    return;
  }
  if(action==='set-design'){
    const id = btn.dataset.design;
    if(DESIGN_IDS.includes(id) && id!==state.design){
      state.design = id;
      applyTheme();
      persist();
      render();
    }
    return;
  }
  if(action==='prev-month'){
    ui.calMonth--; if(ui.calMonth<0){ ui.calMonth=11; ui.calYear--; }
    render(); return;
  }
  if(action==='next-month'){
    ui.calMonth++; if(ui.calMonth>11){ ui.calMonth=0; ui.calYear++; }
    render(); return;
  }
  if(action==='home-prev-month'){
    ui.homeMonth--; if(ui.homeMonth<0){ ui.homeMonth=11; ui.homeYear--; }
    render(); return;
  }
  if(action==='home-next-month'){
    ui.homeMonth++; if(ui.homeMonth>11){ ui.homeMonth=0; ui.homeYear++; }
    render(); return;
  }
  if(action==='home-prev-week'){ ui.weekOffset--; ui.weekDay = null; render(); return; }
  if(action==='home-next-week'){ if(ui.weekOffset<0) ui.weekOffset++; ui.weekDay = null; render(); return; }
  if(action==='home-this-week'){ ui.weekOffset = 0; ui.weekDay = null; render(); return; }
  if(action==='week-select-day'){ ui.weekDay = ui.weekDay===btn.dataset.date ? null : btn.dataset.date; render(); return; }
  if(action==='select-day'){
    ui.selectedDate = btn.dataset.date;
    render(); return;
  }
  if(action==='goto-record-day'){
    ui.form.date = btn.dataset.date;
    ui.tab='record';
    render(); return;
  }
  if(action==='submit-record'){
    submitRecord(); return;
  }
  if(action==='cancel-edit'){
    resetForm();
    render(); return;
  }
  if(action==='edit-record'){
    const rec = state.records.find(r=>r.id===btn.dataset.id);
    if(rec){
      ui.form = { date:rec.date, subjectIds:[rec.subjectId], hours:Math.floor(rec.minutes/60), minutes:rec.minutes%60, memo:rec.memo||'', editingId:rec.id };
      window.scrollTo(0,0);
      render();
    }
    return;
  }
  if(action==='delete-record'){
    openConfirm('この記録を削除しますか？', 'この操作は取り消せません。', 'record', btn.dataset.id);
    return;
  }
  if(action==='delete-subject'){
    if(state.subjects.length<=1){ showToast('最後の科目は削除できません'); return; }
    const s = subjectById(btn.dataset.id);
    openConfirm(`「${s.name}」を削除しますか？`, 'この科目に関連する記録は削除されません。', 'subject', btn.dataset.id);
    return;
  }
  if(action==='edit-subject'){
    openSubjectEditor(btn.dataset.id); return;
  }
  if(action==='move-subject-up'){
    const idx = state.subjects.findIndex(s=>s.id===btn.dataset.id);
    if(idx>0){
      [state.subjects[idx-1], state.subjects[idx]] = [state.subjects[idx], state.subjects[idx-1]];
      persist();
    }
    render(); return;
  }
  if(action==='move-subject-down'){
    const idx = state.subjects.findIndex(s=>s.id===btn.dataset.id);
    if(idx>=0 && idx<state.subjects.length-1){
      [state.subjects[idx], state.subjects[idx+1]] = [state.subjects[idx+1], state.subjects[idx]];
      persist();
    }
    render(); return;
  }
  if(action==='cancel-subject-edit'){
    closeAnyModal(); return;
  }
  if(action==='pick-subject-color'){
    ui.subjectEditor.color = btn.dataset.color;
    render(); return;
  }
  if(action==='save-subject-edit'){
    const se = ui.subjectEditor;
    const name = se.name.trim();
    if(!name){ showToast('科目名を入力してください'); return; }
    const s = state.subjects.find(s=>s.id===se.id);
    if(s){ s.name = name; s.color = se.color; persist(); showToast('科目を更新しました'); }
    ui.subjectEditor = null;
    render(); return;
  }
  if(action==='toggle-subject-select'){
    const id = btn.dataset.id;
    if(ui.form.editingId){
      // editing an existing record: a single subject only, clicking just replaces it
      ui.form.subjectIds = [id];
    } else if(ui.form.subjectIds.includes(id)){
      if(ui.form.subjectIds.length>1) ui.form.subjectIds = ui.form.subjectIds.filter(x=>x!==id);
    } else {
      ui.form.subjectIds = [...ui.form.subjectIds, id];
    }
    render(); return;
  }
  if(action==='toggle-range-subject'){
    const id = btn.dataset.id;
    const current = ui.rangeSubjectIds===null ? state.subjects.map(s=>s.id) : ui.rangeSubjectIds;
    ui.rangeSubjectIds = current.includes(id) ? current.filter(x=>x!==id) : [...current, id];
    render(); return;
  }
  if(action==='open-date-picker'){
    const target = btn.dataset.target || 'record';
    openDatePicker(target, currentDateForTarget(target)); return;
  }
  if(action==='cancel-date-picker'){
    closeAnyModal(); return;
  }
  if(action==='dp-prev-month'){
    ui.datePicker.month--; if(ui.datePicker.month<0){ ui.datePicker.month=11; ui.datePicker.year--; }
    render(); return;
  }
  if(action==='dp-next-month'){
    ui.datePicker.month++; if(ui.datePicker.month>11){ ui.datePicker.month=0; ui.datePicker.year++; }
    render(); return;
  }
  if(action==='dp-select-day'){
    const target = ui.datePicker.target;
    if(target==='balanceApply'){
      const day = btn.dataset.date;
      if(day>isoToday()) showToast('今日より先の日付にはできません');
      else { ui.balanceApplyFrom = day===isoToday() ? null : day; ui.balanceEditIdx = null; }
      ui.datePicker = null; render(); return;
    }
    if(target.startsWith('balanceTo:')){ setBalanceVersionEnd(Number(target.split(':')[1]), btn.dataset.date); ui.datePicker = null; render(); return; }
    if(target.startsWith('balanceFrom:')){ setBalanceVersionStart(Number(target.split(':')[1]), btn.dataset.date); ui.datePicker = null; render(); return; }
    if(target==='rangeStart') ui.rangeStart = btn.dataset.date;
    else if(target==='rangeEnd') ui.rangeEnd = btn.dataset.date;
    else ui.form.date = btn.dataset.date;
    ui.datePicker = null;
    render(); return;
  }
  if(action==='cancel-confirm'){
    closeAnyModal(); return;
  }
  if(action==='confirm-delete'){
    const c = ui.confirm;
    if(c && c.actionType==='record'){
      state.records = state.records.filter(r=>r.id!==c.actionId);
      persist();
      showToast('記録を削除しました');
    } else if(c && c.actionType==='subject'){
      state.subjects = state.subjects.filter(s=>s.id!==c.actionId);
      ui.form.subjectIds = ui.form.subjectIds.filter(id=>id!==c.actionId);
      persist();
      showToast('科目を削除しました');
    } else if(c && c.actionType==='balance-version' && state.balance && state.balance.versions.length>1){
      state.balance.versions.splice(c.actionId, 1);
      ui.balanceEditIdx = null;
      persist();
      showToast('履歴から削除しました');
    } else if(c && c.actionType==='balance-group' && state.balance && balanceEditing().groups[c.actionId] && balanceEditing().groups.length>BALANCE_MIN_GROUPS){
      editBalanceVersion(gs=>{
        gs.splice(c.actionId, 1);
        evenTargets(gs.length).forEach((t,i)=>{ gs[i].target = t; });
      });
    } else if(c && c.actionType==='import' && pendingImport){
      const result = pendingImport;
      state.subjects = result.subjects;
      state.records = result.records;
      state.goals = result.goals;
      if(result.theme){ state.theme = result.theme; applyTheme(); }
      persist();
      showToast(`${result.records.length}件の記録を読み込みました`);
    } else if(c && c.actionType==='import-csv' && pendingCsvImport){
      const { records, newSubjects } = pendingCsvImport;
      state.subjects = state.subjects.concat(newSubjects);
      state.records = state.records.concat(records);
      persist();
      showToast(`${records.length}件の記録を追加しました`);
    }
    pendingImport = null;
    pendingCsvImport = null;
    resetImportInput();
    resetCsvImportInput();
    ui.confirm = null;
    render(); return;
  }
  if(action==='add-subject'){
    const input = document.getElementById('new-subject-input');
    const name = input.value.trim();
    if(!name){ return; }
    const color = SUBJECT_PALETTE[state.subjects.length % SUBJECT_PALETTE.length];
    state.subjects.push({ id: uid(), name, color });
    persist();
    showToast('科目を追加しました');
    render(); return;
  }
  if(action==='save-goals'){
    saveGoalsFromForm();
    return;
  }
  if(action==='balance-apply-today'){ ui.balanceApplyFrom = null; render(); return; }
  if(action==='balance-edit-version' && state.balance && state.balance.versions[Number(btn.dataset.index)]){
    ui.balanceEditIdx = Number(btn.dataset.index); ui.balanceApplyFrom = null;
    render();
    const top = document.getElementById('balance-editor-top'); if(top) top.scrollIntoView({ block:'start' });
    return;
  }
  if(action==='balance-edit-stop'){ ui.balanceEditIdx = null; render(); return; }
  if(action==='balance-period'){
    ui.balancePeriod = btn.dataset.period==='month' ? 'month' : 'week';
    render(); return;
  }
  if(action==='balance-enable'){
    if(state.balance){ state.balance.enabled = true; persist(); render(); return; } // restore the earlier settings
    // First time: subjects mentioning 簿記 start in group 2, everything else in group 1; both can be changed afterwards.
    const isBookkeeping = s=>/簿記/.test(s.name);
    state.balance = { enabled:true, versions:[{ from:BALANCE_SINCE_START, savedOn:isoToday(), groups:[
      { id:uid(), name:'デジハリ', subjectIds: state.subjects.filter(s=>!isBookkeeping(s)).map(s=>s.id), target:50 },
      { id:uid(), name:'T&L・簿記', subjectIds: state.subjects.filter(isBookkeeping).map(s=>s.id), target:50 },
    ] }] };
    persist(); render(); return;
  }
  if(action==='balance-disable' && state.balance){
    ui.balanceEditIdx = null;
    state.balance.enabled = false; // keep the setup and its history so turning it back on restores them
    persist(); render(); return;
  }
  if(action==='balance-add-group' && state.balance && balanceEditing().groups.length<BALANCE_MAX_GROUPS){
    editBalanceVersion(gs=>{
      gs.push({ id:uid(), name:`グループ${gs.length+1}`, subjectIds:[], target:0 });
      evenTargets(gs.length).forEach((t,i)=>{ gs[i].target = t; });
    });
    return;
  }
  if(action==='balance-remove-group' && state.balance && balanceEditing().groups.length>BALANCE_MIN_GROUPS){
    const g = balanceEditing().groups[Number(btn.dataset.index)];
    if(!g) return;
    openConfirm(`グループ「${g.name}」を削除しますか？`, 'このグループに入れていた科目は「グループ未設定」になります。目標の割合は、残りのグループで均等に振り直されます。', 'balance-group', Number(btn.dataset.index));
    return;
  }
  if(action==='balance-equalize' && state.balance){
    editBalanceVersion(gs=>{ evenTargets(gs.length).forEach((t,i)=>{ gs[i].target = t; }); });
    return;
  }
  if(action==='balance-toggle-subject' && state.balance){
    const idx = Number(btn.dataset.index), id = btn.dataset.id;
    if(!balanceEditing().groups[idx]) return;
    editBalanceVersion(gs=>{
      if(gs[idx].subjectIds.includes(id)) gs[idx].subjectIds = gs[idx].subjectIds.filter(x=>x!==id);
      else {
        gs.forEach(g=>{ g.subjectIds = g.subjectIds.filter(x=>x!==id); }); // a subject belongs to one group only
        gs[idx].subjectIds = [...gs[idx].subjectIds, id];
      }
    });
    return;
  }
  if(action==='balance-delete-version' && state.balance && state.balance.versions.length>1){
    const idx = Number(btn.dataset.index);
    if(!state.balance.versions[idx]) return;
    openConfirm(`「${balancePeriodLabel(idx).text}」の設定を、履歴から削除しますか？`, `その期間は、${idx>0 ? '前' : '次'}の設定で計算し直されます。この操作は取り消せません。`, 'balance-version', idx);
    return;
  }
  if(action==='export-json'){ exportJson(); return; }
  if(action==='export-csv'){ exportCsv(); return; }
  if(action==='trigger-import'){ document.getElementById('import-file').click(); return; }
  if(action==='trigger-csv-import'){ document.getElementById('import-csv-file').click(); return; }
}

function onChange(e){
  if(e.target.id==='import-file'){ handleImport(e.target.files[0]); return; }
  if(e.target.id==='import-csv-file'){ handleCsvImport(e.target.files[0]); return; }

  const field = e.target.dataset.field;
  if(!field) return;

  if(field==='hours'){ ui.form.hours = Number(e.target.value); syncSubmitState(); return; }
  if(field==='minutes'){ ui.form.minutes = Number(e.target.value); syncSubmitState(); return; }
  if(field==='memo'){ ui.form.memo = e.target.value; return; }
  if(field==='subject-edit-name'){ ui.subjectEditor.name = e.target.value; return; }
  if(state.balance && field==='balance-name'){
    // A name is just a label, so a rename applies to every version of that group (it is not a history event).
    const cur = balanceEditing().groups[Number(e.target.dataset.index)];
    if(cur){
      const name = e.target.value.trim() || `グループ${Number(e.target.dataset.index)+1}`;
      state.balance.versions.forEach(v=>v.groups.forEach(g=>{ if(g.id===cur.id) g.name = name; }));
      persist();
    }
    return; // no re-render, so a click on a subject button right after typing still lands
  }
  if(state.balance && field==='balance-target'){
    const idx = Number(e.target.dataset.index), value = Number(e.target.value);
    if(balanceEditing().groups[idx]) editBalanceVersion(gs=>{ gs[idx].target = value; });
    return;
  }
}

function syncSubmitState(){
  const btn = document.querySelector('[data-action="submit-record"]');
  if(btn) btn.disabled = (ui.form.hours===0 && ui.form.minutes===0) || ui.form.subjectIds.length===0;
}

function submitRecord(){
  const f = ui.form;
  const minutes = f.hours*60 + f.minutes;
  if(minutes<=0 || f.subjectIds.length===0) return;

  if(f.editingId){
    const rec = state.records.find(r=>r.id===f.editingId);
    if(rec){ rec.date=f.date; rec.subjectId=f.subjectIds[0]; rec.minutes=minutes; rec.memo=f.memo; }
    showToast('記録を更新しました');
  } else {
    f.subjectIds.forEach(subjectId=>{
      state.records.push({ id: uid(), date:f.date, subjectId, minutes, memo:f.memo });
    });
    showToast(f.subjectIds.length>1 ? `${f.subjectIds.length}件の記録をしました` : '記録しました');
  }
  state.lastMemo = f.memo;
  persist();
  const wasGoalAchieved = goalFor(f.date)>0 && totalOn(f.date) >= goalFor(f.date);
  resetForm(f.date);
  render();
  if(wasGoalAchieved && f.date===isoToday()){
    launchConfetti();
  }
}

function resetForm(keepDate){
  ui.form = { date: keepDate || isoToday(), subjectIds: [], hours:1, minutes:0, memo:state.lastMemo||'', editingId:null };
}

function saveGoalsFromForm(){
  const wh = Number(document.querySelector('[data-field="goal-weekday-h"]').value);
  const wm = Number(document.querySelector('[data-field="goal-weekday-m"]').value);
  const eh = Number(document.querySelector('[data-field="goal-weekend-h"]').value);
  const em = Number(document.querySelector('[data-field="goal-weekend-m"]').value);
  state.goals = { weekday: wh*60+wm, weekend: eh*60+em };
  persist();
  showToast('目標を保存しました');
}

function exportJson(){
  const data = JSON.stringify({subjects:state.subjects, records:state.records, goals:state.goals}, null, 2);
  downloadBlob(data, 'study-time-backup.json', 'application/json');
  showToast('バックアップを書き出しました');
}

function exportCsv(){
  const rows = [['date','subject','minutes','memo']];
  state.records.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{
    rows.push([r.date, subjectById(r.subjectId).name, r.minutes, (r.memo||'').replace(/\n/g,' ')]);
  });
  const csv = rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob('\uFEFF'+csv, 'study-time.csv', 'text/csv');
  showToast('CSVを書き出しました');
}

function downloadBlob(content, filename, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

let pendingImport = null;

function resetImportInput(){
  const el = document.getElementById('import-file');
  if(el) el.value = '';
}

function handleImport(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const parsed = JSON.parse(e.target.result);
      const result = normalizeImportedData(parsed);
      if(!result.ok){
        showToast('この形式は読み込めませんでした');
        console.warn('import failed, raw data:', parsed);
        resetImportInput();
        return;
      }
      pendingImport = result;
      openConfirm(
        'バックアップを読み込みますか？',
        `現在のデータは上書きされます（${result.records.length}件の記録を読み込みます）。この操作は取り消せません。`,
        'import', null, '読み込む'
      );
    }catch(err){
      showToast('ファイルの読み込みに失敗しました');
      resetImportInput();
    }
  };
  reader.readAsText(file);
}

let pendingCsvImport = null;

function resetCsvImportInput(){
  const el = document.getElementById('import-csv-file');
  if(el) el.value = '';
}

// Parses RFC4180-ish CSV text (quoted fields, "" escaping, either \n or \r\n).
function parseCsv(text){
  if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for(let i=0; i<text.length; i++){
    const c = text[i];
    if(inQuotes){
      if(c === '"'){
        if(text[i+1] === '"'){ field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if(c === '"'){
      inQuotes = true;
    } else if(c === ','){
      row.push(field); field = '';
    } else if(c === '\n' || c === '\r'){
      if(c === '\r' && text[i+1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if(field.length>0 || row.length>0){ row.push(field); rows.push(row); }
  return rows;
}

// CSV import is additive (adds records to what's already there) rather than a full
// backup restore, since a CSV only ever has records — not subjects/goals/theme.
function handleCsvImport(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const rows = parseCsv(e.target.result).filter(r => r.length>1 || r[0]!=='');
      if(rows.length < 2){ showToast('この形式は読み込めませんでした'); resetCsvImportInput(); return; }
      const header = rows[0].map(h=>String(h).trim().toLowerCase());
      const dateIdx = header.indexOf('date');
      const subjectIdx = header.indexOf('subject');
      const minutesIdx = header.indexOf('minutes');
      const memoIdx = header.indexOf('memo');
      if(dateIdx<0 || subjectIdx<0 || minutesIdx<0){
        showToast('この形式は読み込めませんでした');
        resetCsvImportInput();
        return;
      }

      const nameToId = {};
      state.subjects.forEach(s=>{ nameToId[s.name] = s.id; });
      const newSubjects = [];
      const newRecords = [];
      let skippedDupeCount = 0;
      const isDuplicate = (date, subjectId, minutes, memo) =>
        state.records.some(r => r.date===date && r.subjectId===subjectId && r.minutes===minutes && (r.memo||'')===memo) ||
        newRecords.some(r => r.date===date && r.subjectId===subjectId && r.minutes===minutes && (r.memo||'')===memo);
      for(let i=1; i<rows.length; i++){
        const r = rows[i];
        const date = normalizeDate(r[dateIdx]);
        const minutes = Number(r[minutesIdx]);
        const subjName = (r[subjectIdx]||'').trim();
        if(!date || !minutes || minutes<=0 || !subjName) continue;
        let subjectId = nameToId[subjName];
        if(!subjectId){
          subjectId = uid();
          nameToId[subjName] = subjectId;
          const color = SUBJECT_PALETTE[(state.subjects.length + newSubjects.length) % SUBJECT_PALETTE.length];
          newSubjects.push({ id: subjectId, name: subjName, color });
        }
        const memo = memoIdx>=0 ? (r[memoIdx]||'') : '';
        if(isDuplicate(date, subjectId, minutes, memo)){ skippedDupeCount++; continue; }
        newRecords.push({ id: uid(), date, subjectId, minutes, memo });
      }

      if(newRecords.length===0){
        showToast(skippedDupeCount>0 ? '追加できる記録がありませんでした（すべて既存の記録と重複していました）' : 'この形式は読み込めませんでした');
        resetCsvImportInput();
        return;
      }
      pendingCsvImport = { records: newRecords, newSubjects, skippedDupeCount };
      openConfirm(
        'CSVから記録を追加しますか？',
        `${newRecords.length}件の記録を追加します${newSubjects.length>0?`（新しい科目${newSubjects.length}件を追加）`:''}${skippedDupeCount>0?`（既存と重複する${skippedDupeCount}件はスキップされます）`:''}。この操作は取り消せません。`,
        'import-csv', null, '追加する'
      );
    }catch(err){
      showToast('ファイルの読み込みに失敗しました');
      resetCsvImportInput();
    }
  };
  reader.readAsText(file);
}

// Best-effort converter: this app's own export always matches the "native" shape below.
// Other apps' exports (e.g. an earlier version of this site) may use different field
// names, so we try a few common shapes. If nothing matches, we bail out cleanly rather
// than guessing and silently corrupting data.
function normalizeImportedData(parsed){
  if(!parsed || typeof parsed !== 'object') return {ok:false};

  // --- native shape: {subjects:[{id,name,color}], records:[{id,date,subjectId,minutes,memo}], goals:{weekday,weekend}} ---
  if(Array.isArray(parsed.subjects) && Array.isArray(parsed.records) &&
     parsed.subjects.every(s=>s && typeof s==='object' && 'id' in s) &&
     parsed.records.every(r=>r && typeof r==='object' && 'subjectId' in r && 'minutes' in r)){
    return {
      ok:true,
      subjects: parsed.subjects,
      records: parsed.records.map(r=>({ id:r.id||uid(), date:r.date, subjectId:r.subjectId, minutes:Number(r.minutes)||0, memo:r.memo||'' })),
      goals: parsed.goals && typeof parsed.goals==='object' ? { weekday:Number(parsed.goals.weekday)||120, weekend:Number(parsed.goals.weekend)||240 } : state.goals,
      theme: typeof parsed.darkMode === 'boolean' ? (parsed.darkMode ? 'dark' : 'light') : undefined,
    };
  }

  // --- legacy "ChatGPT-built" shape: subjects as plain name strings, records reference
  //     the subject by name (not id), goals given in *Hours fields, and dates that are
  //     occasionally corrupted (a stray "HH:MM" value) with a valid `recordedAt` ISO
  //     timestamp to fall back on. ---
  if(Array.isArray(parsed.subjects) && parsed.subjects.every(s=>typeof s==='string') &&
     Array.isArray(parsed.records) && parsed.records.every(r=>r && typeof r==='object' && typeof r.subject==='string')){
    const nameToId = {};
    const subjects = parsed.subjects.map((name,i)=>{
      const id = uid();
      nameToId[name] = id;
      return { id, name, color: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length] };
    });

    const records = [];
    for(const r of parsed.records){
      let date = normalizeDate(r.date);
      if(!date) date = normalizeDate(r.recordedAt);
      if(!date) continue;

      if(!nameToId[r.subject]){
        const id = uid();
        nameToId[r.subject] = id;
        subjects.push({ id, name:r.subject, color: SUBJECT_PALETTE[subjects.length % SUBJECT_PALETTE.length] });
      }
      const minutes = Number(r.minutes) || 0;
      if(minutes<=0) continue;

      records.push({ id: r.id || uid(), date, subjectId: nameToId[r.subject], minutes, memo: r.memo || '' });
    }

    const g = parsed.goals || {};
    const goals = {
      weekday: g.weekdayHours!=null ? Math.round(Number(g.weekdayHours)*60) : state.goals.weekday,
      weekend: g.weekendHours!=null ? Math.round(Number(g.weekendHours)*60) : state.goals.weekend,
    };

    return {
      ok: records.length>0,
      subjects, records, goals,
      theme: typeof parsed.darkMode === 'boolean' ? (parsed.darkMode ? 'dark' : 'light') : undefined,
    };
  }

  // --- generic shape: subjects as plain names, records reference subject by name, minutes may be
  //     split as hours/minutes, or given as a "duration" in minutes or seconds ---
  let rawSubjects = parsed.subjects || parsed.categories || parsed.courses;
  let rawRecords = parsed.records || parsed.logs || parsed.entries || parsed.sessions || parsed.data;
  if(!Array.isArray(rawRecords)) return {ok:false};

  const nameToId = {};
  let subjects = [];
  if(Array.isArray(rawSubjects)){
    rawSubjects.forEach((s,i)=>{
      const name = typeof s === 'string' ? s : (s.name || s.title || `科目${i+1}`);
      const id = uid();
      nameToId[name] = id;
      subjects.push({ id, name, color: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length] });
    });
  }

  const records = [];
  for(const r of rawRecords){
    if(!r || typeof r!=='object') continue;
    const dateRaw = r.date || r.day || r.recordedAt || r.createdAt || r.timestamp;
    const date = normalizeDate(dateRaw);
    if(!date) continue;

    const subjName = r.subject || r.category || r.course || r.title;
    let subjectId = r.subjectId;
    if(!subjectId && subjName){
      if(!nameToId[subjName]){
        const id = uid();
        nameToId[subjName] = id;
        subjects.push({ id, name: subjName, color: SUBJECT_PALETTE[subjects.length % SUBJECT_PALETTE.length] });
      }
      subjectId = nameToId[subjName];
    }
    if(!subjectId && subjects.length){ subjectId = subjects[0].id; }
    if(!subjectId) continue;

    let minutes = 0;
    if(typeof r.minutes === 'number') minutes = r.minutes;
    else if(typeof r.duration === 'number') minutes = r.duration > 1000 ? Math.round(r.duration/60) : r.duration; // guess seconds vs minutes
    else if(typeof r.hours === 'number') minutes = Math.round(r.hours*60) + (Number(r.mins||r.minute||0));
    if(minutes<=0) continue;

    records.push({ id: r.id || uid(), date, subjectId, minutes, memo: r.memo || r.note || '' });
  }

  if(records.length===0) return {ok:false};
  if(subjects.length===0){ subjects = [{id:uid(), name:'勉強', color:SUBJECT_PALETTE[0]}]; }

  const g = parsed.goals || parsed.target || {};
  const goals = {
    weekday: Number(g.weekday || g.weekdayMinutes || g.平日) || state.goals.weekday,
    weekend: Number(g.weekend || g.weekendMinutes || g.土日) || state.goals.weekend,
  };

  return {ok:true, subjects, records, goals};
}

function normalizeDate(raw){
  if(!raw) return null;
  if(typeof raw === 'string'){
    const m = raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if(m) return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
  }
  const d = new Date(raw);
  if(!isNaN(d.getTime())) return dateToISO(d);
  return null;
}

function launchConfetti(){
  setTimeout(()=>{
    const el = document.getElementById('confetti');
    if(!el) return;
    const emojis = ['🎉','✨','⭐','🎊'];
    for(let i=0;i<14;i++){
      const s = document.createElement('span');
      s.textContent = emojis[i%emojis.length];
      s.style.left = Math.random()*100+'%';
      s.style.animationDelay = (Math.random()*0.4)+'s';
      s.style.fontSize = (12+Math.random()*10)+'px';
      el.appendChild(s);
    }
  }, 50);
}

// ---------- diver: a standalone element appended once to <body>, independent of render() ----------
// Floats above the cards so it stays visible regardless of scroll (nastuki specifically wanted it to
// follow scroll direction, not just sit still in one card). On one real laptop (hardware acceleration
// off, so Chrome falls back to software rendering), an earlier version of this flickered the whole
// page at random while scrolling — traced to a 5x/second interval that swapped its background-image
// to animate a 30-frame swimming cycle, landing during scroll. That animation is gone: this is a
// single static frame, never touched after its initial paint. Position/tilt tracking (below) turned
// out NOT to be part of the problem — with the frame-flip interval gone entirely, scrolling was
// confirmed stable.
function initDiver(){
  const el = document.createElement('div');
  el.className = 'diver-companion';
  el.setAttribute('aria-hidden', 'true');
  el.style.backgroundImage = `url('assets/diver/diver_15.png')`;
  document.body.appendChild(el);

  // Keep the diver roughly in view without position:fixed: `top` in style.css is a fixed
  // document-relative position (58vh, never touched again after this point — changing `top` on every
  // scroll event forces a layout recalculation each time, which was one of the things that made the
  // page flicker while scrolling before). Instead, shift it back down by exactly however far the page
  // has scrolled, via a transform (composite-only, no layout), so it still lands at the same spot in
  // the viewport regardless of scroll position.
  function positionDiver(){ el.style.setProperty('--diver-scroll-y', window.scrollY + 'px'); }
  positionDiver();
  window.addEventListener('scroll', positionDiver, { passive:true });

  // Scroll direction: `current` eases toward +1 while scrolling up, -1 while scrolling down, and
  // back to 0 shortly after scrolling stops (a tiny rAF loop, so it doesn't jump). It drives two CSS
  // vars, written onto the diver element ITSELF (not document.documentElement — a custom property
  // changing on the root, which every element inherits, forces the engine to reconsider style for the
  // whole subtree on every write; scoping it to this one element avoids that):
  //  --diver-lift (px): moves the diver up the screen while current>0, down while current<0.
  //  --diver-tilt (deg): the diver's artwork already leans "up" at rest (head trailing up-left, fins
  //    down-right): a small rotation the other way just looks sideways, but rotating it much further
  //    (past horizontal, toward nose-first) reads clearly as diving down — hence the asymmetric range
  //    below (a wide swing down, a smaller one up).
  // The window (not an inner div) is what scrolls.
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let lastY = window.scrollY, current = 0, target = 0, raf = null, stopTimer = null;
  function tick(){
    current += (target - current) * 0.12;
    if(Math.abs(target - current) < 0.01) current = target;
    el.style.setProperty('--diver-lift', (-current * 34).toFixed(1) + 'px');
    el.style.setProperty('--diver-tilt', ((current >= 0 ? current * 30 : current * 72)).toFixed(1) + 'deg');
    raf = (current === target) ? null : requestAnimationFrame(tick);
  }
  function kick(){ if(raf === null) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', () => {
    if(document.documentElement.dataset.design !== 'sea') return;
    const y = window.scrollY;
    if(y !== lastY) target = y > lastY ? -1 : 1;
    lastY = y;
    kick();
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => { target = 0; kick(); }, 400);
  }, { passive:true });
}

// ---------- PWA: service worker registration ----------
// Only works when served over http(s) (e.g. VSCode Live Server, GitHub Pages, etc.) —
// browsers block service workers on file:// URLs, so this silently no-ops there.
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ---------- init ----------
(async function init(){
  await loadData();
  render();
  initDiver();
})();

})();
