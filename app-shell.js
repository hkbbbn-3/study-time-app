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
      <nav class="tabbar" aria-label="メインメニュー">
        <div class="tab-indicator" style="transform:translateX(${tabIndex*100}%)"></div>
        ${tabBtn('home', icon('home',22), 'ホーム')}
        ${tabBtn('calendar', icon('calendar',22), 'カレンダー')}
        ${tabBtn('record', icon('clock',22), '記録', state.timer && state.timer.running)}
        ${tabBtn('settings', icon('sliders',22), '設定')}
      </nav>
    </div>
    ${ui.confirm ? renderConfirmModal() : ''}
    ${ui.subjectEditor ? renderSubjectEditor() : ''}
    ${ui.deadlineEditor ? renderDeadlineEditor() : ''}
    ${ui.datePicker ? renderDatePicker() : ''}
  `;
  document.getElementById('content').innerHTML = renderPage();
  // Clear an internal offset retained from an earlier scrollIntoView/focus.
  // Normal page scrolling belongs to the document, never to this canvas.
  root.scrollTop = 0;
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
  if(ui.deadlineEditor){ ui.deadlineEditor = null; render(); return true; }
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
  if(target==='deadlineEditor') return ui.deadlineEditor.date;
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
  const totalCells = 42; // always 6 rows so the month-nav buttons stay put between months
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

function openDeadlineEditor(id){
  if(id){
    const d = state.deadlines.find(x=>x.id===id);
    if(!d) return;
    ui.deadlineEditor = { id, label:d.label, date:d.date };
  } else {
    ui.deadlineEditor = { id:null, label:'', date:isoToday() };
  }
  render();
}

function renderDeadlineEditor(){
  const de = ui.deadlineEditor;
  return `
    <div class="modal-overlay" data-action="cancel-deadline-edit">
      <div class="modal-box" data-action="stop" role="dialog" aria-modal="true" aria-label="目標日を${de.id?'編集':'追加'}">
        <div class="modal-title">目標日を${de.id?'編集':'追加'}</div>
        <div class="field" style="text-align:left; margin-top:16px;">
          <label class="field-label">名前</label>
          <input class="input" type="text" data-field="deadline-edit-label" placeholder="例：簿記2級試験" value="${escapeHtml(de.label)}">
        </div>
        <div class="field" style="text-align:left;">
          <label class="field-label">日付</label>
          <div class="date-field icon-row" data-action="open-date-picker" data-target="deadlineEditor" role="button" tabindex="0">
            <span>${formatDateFull(de.date)}</span>
            ${icon('calendar',16)}
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" data-action="cancel-deadline-edit">キャンセル</button>
          <button class="modal-btn primary" data-action="save-deadline-edit" ${de.label.trim()===''?'disabled':''}>保存</button>
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

function tabBtn(key,icon,label,showDot){
  return `<button data-action="go-tab" data-tab="${key}" class="${ui.tab===key?'active':''}" ${ui.tab===key?'aria-current="page"':''}>${icon}${showDot?'<span class="tab-dot" aria-hidden="true"></span>':''}<span>${label}</span></button>`;
}

function renderPage(){
  if(ui.tab==='home') return renderHome();
  if(ui.tab==='calendar') return renderCalendar();
  if(ui.tab==='record') return renderRecord();
  if(ui.tab==='settings') return renderSettings();
  return '';
}

