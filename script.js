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
  theme: 'light',
};

let ui = {
  tab: 'home',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  selectedDate: isoToday(),
  form: { date: isoToday(), subjectId: null, hours: 1, minutes: 0, memo: '', editingId: null },
  confirm: null, // { title, desc, actionType, actionId }
  datePicker: null, // { year, month } when open (for the record form's date field)
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
        subjects: state.subjects, records: state.records, goals: state.goals, theme: state.theme
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
    }
  }catch(e){
    // no existing data yet, or storage unavailable — use defaults
  }
  applyTheme();
  ui.form.subjectId = state.subjects[0] ? state.subjects[0].id : null;
}

function applyTheme(){
  document.documentElement.classList.toggle('dark', state.theme==='dark');
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

function openDatePicker(){
  const d = isoToDate(ui.form.date);
  ui.datePicker = { year: d.getFullYear(), month: d.getMonth() };
  render();
}

function renderDatePicker(){
  const dp = ui.datePicker;
  const y = dp.year, m = dp.month;
  const first = new Date(y,m,1);
  const startOffset = (first.getDay()+6)%7; // Monday-start
  const daysInMonth = new Date(y,m+1,0).getDate();
  const todayIso = isoToday();
  const selIso = ui.form.date;

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
            ${SUBJECT_PALETTE.map(c=>`<div class="color-swatch ${c===se.color?'selected':''}" style="background:${c}" data-action="pick-subject-color" data-color="${c}" role="button" tabindex="0" aria-label="この色にする"></div>`).join('')}
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

  // week strip: Monday-start
  const day0 = new Date(now); const dow = (now.getDay()+6)%7; day0.setDate(now.getDate()-dow);
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
    weekHtml += `
      <div class="wcol">
        <div class="wbar-track"><div class="wbar-fill" style="height:${mins>0?h:4}%; opacity:${mins>0?1:0.35}"></div></div>
        <div class="wlabel ${isToday?'today':''}">${WEEKDAY_LABELS[i]}</div>
      </div>`;
  }

  // weekly comparison: this week so-far (Mon -> today) vs the same weekday range last week
  let lastWeekSameRange = 0;
  for(let i=0; i<=dow; i++){
    const d = new Date(day0); d.setDate(day0.getDate()+i-7);
    lastWeekSameRange += totalOn(dateToISO(d));
  }
  const thisWeekSoFar = weekTotal;
  let cmp;
  if(lastWeekSameRange===0 && thisWeekSoFar===0){
    cmp = { cls:'neutral', icon:'minus', label:'―', note:'まだ記録がありません' };
  } else if(lastWeekSameRange===0){
    cmp = { cls:'up', icon:'arrowUp', label:'NEW', note:'先週は記録なしでした。今週からいいペース！' };
  } else {
    const p = Math.round(((thisWeekSoFar-lastWeekSameRange)/lastWeekSameRange)*100);
    cmp = p>=0
      ? { cls:'up', icon:'arrowUp', label:`+${p}%`, note:`先週の同じ${dow+1}日間より伸びています` }
      : { cls:'down', icon:'arrowDown', label:`${p}%`, note:`先週の同じ${dow+1}日間より少なめです` };
  }

  // month progress
  const y=now.getFullYear(), m=now.getMonth();
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
      <div class="ring-wrap">
        <svg width="132" height="132" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="${r}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="10"/>
          <circle cx="55" cy="55" r="${r}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${c}" stroke-dashoffset="${c-dash}" transform="rotate(-90 55 55)"
            style="transition: stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)"/>
        </svg>
        <div class="ring-center">
          <div class="ring-minutes">${pct}%</div>
          <div class="ring-sub">${fmtMin(minutes)}</div>
        </div>
      </div>
      <div class="hero-foot">
        <div><div class="val">${fmtMin(minutes)}</div><div class="lab">今日</div></div>
        <div><div class="val">${fmtMin(weekTotal)}</div><div class="lab">今週</div></div>
        <div><div class="val">${goal>0?fmtMin(goal):'未設定'}</div><div class="lab">今日の目標</div></div>
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
      <div class="card-title icon-row">${icon('trending',15)} 今週の推移</div>
      <div class="weekstrip">${weekHtml}</div>
    </div>

    <div class="card">
      <div class="card-title icon-row">${icon('trending',15)} 週間比較</div>
      <div class="compare-row">
        <div class="compare-side">
          <div class="compare-label">先週（同期間）</div>
          <div class="compare-val">${fmtMin(lastWeekSameRange)}</div>
        </div>
        <div class="compare-badge ${cmp.cls}">${icon(cmp.icon,12)} ${cmp.label}</div>
        <div class="compare-side right">
          <div class="compare-label">今週</div>
          <div class="compare-val">${fmtMin(thisWeekSoFar)}</div>
        </div>
      </div>
      <div class="compare-note">${cmp.note}</div>
    </div>

    <div class="card">
      <div class="progress-row">
        <div class="t">今月の合計</div>
        <div class="n">${fmtMin(monthTotal)} / ${fmtMin(monthGoal)}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${monthPct}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title icon-row">${icon('book',15)} 科目ごとの合計（今月）</div>
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
  `;
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
      <div class="rec-badge" style="background:${s.color}"></div>
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
  const minOptions = [0,30];

  return `
    <div class="card">
      <div class="card-title icon-row">${isEditing ? icon('edit',15)+' 記録を編集' : icon('clock',15)+' 勉強時間を記録'}</div>

      <div class="field">
        <label class="field-label">日付</label>
        <div class="date-field icon-row" data-action="open-date-picker" role="button" tabindex="0">
          <span>${formatDateFull(f.date)}</span>
          ${icon('calendar',16)}
        </div>
      </div>

      <div class="field">
        <label class="field-label">科目</label>
        <div class="select-wrap">
          <select data-field="subjectId">
            ${state.subjects.map(s=>`<option value="${s.id}" ${s.id===f.subjectId?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}
          </select>
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

      <button class="submit-btn icon-row" data-action="submit-record" ${(f.hours===0 && f.minutes===0)?'disabled':''}>
        ${isEditing ? icon('check',15)+' 更新する' : icon('plus',15)+' 記録する'}
      </button>
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
    <div class="card">
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

    <div class="section-label">💾 データのバックアップ</div>
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
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const btn = e.target.closest('[role="button"], [role="switch"]');
  if(!btn) return;
  e.preventDefault();
  btn.click();
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
  if(action==='prev-month'){
    ui.calMonth--; if(ui.calMonth<0){ ui.calMonth=11; ui.calYear--; }
    render(); return;
  }
  if(action==='next-month'){
    ui.calMonth++; if(ui.calMonth>11){ ui.calMonth=0; ui.calYear++; }
    render(); return;
  }
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
      ui.form = { date:rec.date, subjectId:rec.subjectId, hours:Math.floor(rec.minutes/60), minutes:rec.minutes%60, memo:rec.memo||'', editingId:rec.id };
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
  if(action==='open-date-picker'){
    openDatePicker(); return;
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
    ui.form.date = btn.dataset.date;
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
      if(ui.form.subjectId===c.actionId) ui.form.subjectId = state.subjects[0] ? state.subjects[0].id : null;
      persist();
      showToast('科目を削除しました');
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

  if(field==='subjectId'){ ui.form.subjectId = e.target.value; return; }
  if(field==='hours'){ ui.form.hours = Number(e.target.value); syncSubmitState(); return; }
  if(field==='minutes'){ ui.form.minutes = Number(e.target.value); syncSubmitState(); return; }
  if(field==='memo'){ ui.form.memo = e.target.value; return; }
  if(field==='subject-edit-name'){ ui.subjectEditor.name = e.target.value; return; }
}

function syncSubmitState(){
  const btn = document.querySelector('[data-action="submit-record"]');
  if(btn) btn.disabled = (ui.form.hours===0 && ui.form.minutes===0);
}

function submitRecord(){
  const f = ui.form;
  const minutes = f.hours*60 + f.minutes;
  if(minutes<=0 || !f.subjectId) return;

  if(f.editingId){
    const rec = state.records.find(r=>r.id===f.editingId);
    if(rec){ rec.date=f.date; rec.subjectId=f.subjectId; rec.minutes=minutes; rec.memo=f.memo; }
    showToast('記録を更新しました');
  } else {
    state.records.push({ id: uid(), date:f.date, subjectId:f.subjectId, minutes, memo:f.memo });
    showToast('記録しました');
  }
  persist();
  const wasGoalAchieved = goalFor(f.date)>0 && totalOn(f.date) >= goalFor(f.date);
  resetForm(f.date);
  render();
  if(wasGoalAchieved && f.date===isoToday()){
    launchConfetti();
  }
}

function resetForm(keepDate){
  ui.form = { date: keepDate || isoToday(), subjectId: state.subjects[0] ? state.subjects[0].id : null, hours:1, minutes:0, memo:'', editingId:null };
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
        newRecords.push({ id: uid(), date, subjectId, minutes, memo: memoIdx>=0 ? (r[memoIdx]||'') : '' });
      }

      if(newRecords.length===0){
        showToast('この形式は読み込めませんでした');
        resetCsvImportInput();
        return;
      }
      pendingCsvImport = { records: newRecords, newSubjects };
      openConfirm(
        'CSVから記録を追加しますか？',
        `${newRecords.length}件の記録を追加します${newSubjects.length>0?`（新しい科目${newSubjects.length}件を追加）`:''}。この操作は取り消せません。`,
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
})();

})();
