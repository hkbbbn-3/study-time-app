// ---------- timer (live stopwatch) ----------
function timerElapsedMs(){
  if(!state.timer) return 0;
  return state.timer.accumulatedMs + (state.timer.running ? Date.now()-state.timer.startedAt : 0);
}
function fmtElapsed(ms){
  const totalSec = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60), s = totalSec%60;
  const pad = n=>String(n).padStart(2,'0');
  return h>0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
// Ticks the visible timer display directly (no render()) so it doesn't repaint anything else on
// screen every second — updates the running timer on the home or record screen.
function tickTimerDisplay(){
  if(!state.timer || !state.timer.running || state.timer.confirming) return;
  for(const id of ['timerDisplay','homeTimerDisplay']){
    const el = document.getElementById(id);
    if(el) el.textContent = fmtElapsed(timerElapsedMs());
  }
}

function renderTimerCard(){
  const t = state.timer;
  if(!t){
    return `
    <div class="card">
      <div class="card-title icon-row">${icon('play',15)} タイマーで記録</div>
      <div class="card-desc">勉強しながら時間を測ります。「開始」を押して、終わったら「終了」を押すだけ。</div>
      <div class="field">
        <label class="field-label">科目（複数選択可）</label>
        <div class="subject-pill-grid">
          ${state.subjects.map(s=>{
            const selected = ui.timerSubjectIds.includes(s.id);
            return `<button type="button" class="subject-pill ${selected?'selected':''}" data-action="toggle-timer-subject" data-id="${escapeHtml(s.id)}" style="--pc:${safeColor(s.color)};${selected?`background:${safeColor(s.color)};border-color:${safeColor(s.color)};`:''}">
              <span class="dot" style="background:${selected?'#fff':safeColor(s.color)}"></span>${escapeHtml(s.name)}
            </button>`;
          }).join('')}
        </div>
      </div>
      <button class="submit-btn icon-row" data-action="start-timer" ${ui.timerSubjectIds.length===0?'disabled':''}>${icon('play',15)} タイマーを開始</button>
      ${ui.timerSubjectIds.length===0 ? `<div class="submit-hint">↑ 科目を選んでください</div>` : ''}
    </div>`;
  }

  if(t.confirming){
    return `
    <div class="card timer-card">
      <div class="card-title icon-row">${icon('check',15)} 記録を確認</div>
      <div class="timer-subjects">${t.subjectIds.map(id=>{ const s=subjectById(id); return `<span class="subject-pill" style="--pc:${safeColor(s.color)};background:${safeColor(s.color)};border-color:${safeColor(s.color)};"><span class="dot" style="background:#fff"></span>${escapeHtml(s.name)}</span>`; }).join('')}</div>
      <div class="timer-display timer-display--done">${fmtMin(t.finalMinutes)}</div>
      <div class="field" style="margin-top:var(--sp-4);">
        <label class="field-label">メモ（任意）</label>
        <textarea data-field="timer-memo" placeholder="やったことを一言メモ...">${escapeHtml(ui.timerMemo)}</textarea>
      </div>
      <button class="submit-btn icon-row" data-action="confirm-timer">${icon('check',15)} 記録する</button>
      <div class="cancel-link" data-action="discard-timer">破棄する</div>
    </div>`;
  }

  return `
    <div class="card timer-card">
      <div class="card-title icon-row">${icon('clock',15)} ${t.running ? '計測中' : '一時停止中'}</div>
      <div class="timer-subjects">${t.subjectIds.map(id=>{ const s=subjectById(id); return `<span class="subject-pill" style="--pc:${safeColor(s.color)};background:${safeColor(s.color)};border-color:${safeColor(s.color)};"><span class="dot" style="background:#fff"></span>${escapeHtml(s.name)}</span>`; }).join('')}</div>
      <div class="timer-display" id="timerDisplay">${fmtElapsed(timerElapsedMs())}</div>
      <div class="timer-actions">
        ${t.running
          ? `<button class="ghost-btn icon-row" data-action="pause-timer">${icon('pause',15)} 一時停止</button>`
          : `<button class="ghost-btn icon-row" data-action="resume-timer">${icon('play',15)} 再開</button>`}
        <button class="submit-btn icon-row" data-action="finish-timer">${icon('check',15)} 終了する</button>
      </div>
      <div class="cancel-link" data-action="discard-timer">破棄して最初から</div>
    </div>`;
}

// ---------- RECORD ----------
// Stored order is the order entries were added, including backdated study days.
function recordShortcutHistory(){
  return (state.records || []).slice().reverse().filter(r=>
    r && Number.isSafeInteger(r.minutes) && r.minutes>0 && state.subjects.some(s=>s.id===r.subjectId));
}
function renderRecord(){
  const f = ui.form;
  const isEditing = !!f.editingId;
  const dayRecs = recordsOn(f.date);
  const hourOptions = Array.from({length:13}, (_,i)=>i);
  if(Number.isSafeInteger(f.hours) && f.hours>12) hourOptions.push(f.hours);
  const minOptions = Array.from({length:60}, (_,i)=>i);
  const manual = ui.recordMode!=='timer';
  const history = isEditing ? [] : recordShortcutHistory();
  const previous = history[0];

  return `
    <div class="record-mode-switch" role="group" aria-label="記録方法">
      <button type="button" data-action="record-mode" data-mode="manual" aria-pressed="${manual}" class="${manual?'active':''}">${icon('edit',17)} 時間入力</button>
      <button type="button" data-action="record-mode" data-mode="timer" aria-pressed="${!manual}" class="${manual?'':'active'}">${icon('clock',17)} タイマー${state.timer?' •':''}</button>
    </div>
    ${manual ? `
    <div class="card" id="recordFormCard">
      <div class="card-title icon-row">${isEditing ? icon('edit',15)+' 記録を編集' : icon('edit',15)+' 時間を入力して記録'}</div>
      ${isEditing ? '' : `<div class="card-desc">勉強した時間を自分で入力します。終わった勉強や、過去の日の記録もOK。</div>`}
      ${previous ? `<button type="button" class="ghost-btn reuse-record" data-action="reuse-last-record">${icon('edit',16)} 前回の内容を使う <small>${escapeHtml(state.subjects.find(s=>s.id===previous.subjectId).name)}・${fmtMin(previous.minutes)}</small></button>` : ''}

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
            return `<button type="button" class="subject-pill ${selected?'selected':''}" data-action="toggle-subject-select" data-id="${escapeHtml(s.id)}" style="--pc:${safeColor(s.color)};${selected?`background:${safeColor(s.color)};border-color:${safeColor(s.color)};`:''}">
              <span class="dot" style="background:${selected?'#fff':safeColor(s.color)}"></span>${escapeHtml(s.name)}
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

    ` : renderTimerCard()}

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

