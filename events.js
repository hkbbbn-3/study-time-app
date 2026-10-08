// ---------- events ----------
function bindEvents(){
  const root = document.getElementById('canvas');
  if(!root) return;

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('input', onInput);
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

  if(action==='reuse-last-record'){
    if(ui.form.editingId) return;
    const previous=recordShortcutHistory()[0];
    if(!previous) return;
    ui.form.subjectIds=[previous.subjectId];
    ui.form.hours=Math.floor(previous.minutes/60);
    ui.form.minutes=previous.minutes%60;
    ui.form.date=isoToday();
    render(); return;
  }
  if(action==='open-record' || action==='record-mode'){
    ui.recordMode = btn.dataset.mode==='timer' ? 'timer' : 'manual';
    ui.tab = 'record';
    render();
    window.scrollTo(0,0);
    return;
  }
  if(action==='toggle-home-details'){
    ui.homeDetails = !ui.homeDetails;
    render();
    const toggle = document.querySelector('[data-action="toggle-home-details"]');
    if(toggle) toggle.focus({preventScroll:true});
    return;
  }
  if(action==='go-tab'){
    ui.tab = btn.dataset.tab;
    ui.editReturnTab = null;
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
  if(action==='stats-mode'){ ui.statsMode = btn.dataset.mode==='year' ? 'year' : 'month'; render(); return; }
  if(action==='stats-prev-year'){ ui.statsYear--; render(); return; }
  if(action==='stats-next-year'){ if(ui.statsYear<new Date().getFullYear()){ ui.statsYear++; render(); } return; }
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
    ui.recordMode = 'manual';
    ui.tab='record';
    render(); window.scrollTo(0,0); return;
  }
  if(action==='submit-record'){
    submitRecord(); return;
  }
  if(action==='cancel-edit'){
    resetForm();
    returnFromEdit();
    render(); return;
  }
  if(action==='edit-record'){
    const rec = state.records.find(r=>r.id===btn.dataset.id);
    if(rec){
      ui.form = { date:rec.date, subjectIds:[rec.subjectId], hours:Math.floor(rec.minutes/60), minutes:rec.minutes%60, memo:rec.memo||'', editingId:rec.id };
      // The edit form lives on the 記録 tab: go there (from the calendar too), and come back afterwards.
      ui.editReturnTab = ui.tab!=='record' ? ui.tab : null;
      ui.recordMode = 'manual';
      ui.tab = 'record';
      render();
      const card = document.getElementById('recordFormCard');
      if(card) card.scrollIntoView({ block:'start' }); else window.scrollTo(0,0);
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
  if(action==='add-deadline'){ openDeadlineEditor(null); return; }
  if(action==='edit-deadline'){ openDeadlineEditor(btn.dataset.id); return; }
  if(action==='cancel-deadline-edit'){
    closeAnyModal(); return;
  }
  if(action==='save-deadline-edit'){
    const de = ui.deadlineEditor;
    const label = de.label.trim();
    if(!label){ showToast('名前を入力してください'); return; }
    if(de.id){
      const d = state.deadlines.find(x=>x.id===de.id);
      if(d){ d.label = label; d.date = de.date; }
      showToast('目標日を更新しました');
    } else {
      state.deadlines.push({ id: uid(), label, date: de.date });
      showToast('目標日を追加しました');
    }
    persist();
    ui.deadlineEditor = null;
    render(); return;
  }
  if(action==='delete-deadline'){
    const d = state.deadlines.find(x=>x.id===btn.dataset.id);
    if(d) openConfirm(`「${d.label}」を削除しますか？`, 'この目標日を削除します。', 'deadline', btn.dataset.id);
    return;
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
  if(action==='toggle-timer-subject'){
    const id = btn.dataset.id;
    ui.timerSubjectIds = ui.timerSubjectIds.includes(id) ? ui.timerSubjectIds.filter(x=>x!==id) : [...ui.timerSubjectIds, id];
    render(); return;
  }
  if(action==='start-timer'){
    if(ui.timerSubjectIds.length===0) return;
    state.timer = { subjectIds:ui.timerSubjectIds, startDate:isoToday(), startedAt:Date.now(), accumulatedMs:0, running:true, confirming:false, finalMinutes:null };
    ui.timerSubjectIds = [];
    persist(); render(); return;
  }
  if(action==='pause-timer'){
    if(!state.timer || !state.timer.running) return;
    state.timer.accumulatedMs += Date.now() - state.timer.startedAt;
    state.timer.running = false;
    persist(); render(); return;
  }
  if(action==='resume-timer'){
    if(!state.timer || state.timer.running) return;
    state.timer.startedAt = Date.now();
    state.timer.running = true;
    persist(); render(); return;
  }
  if(action==='finish-timer'){
    if(!state.timer) return;
    const mins = Math.max(1, Math.round(timerElapsedMs()/60000));
    state.timer.accumulatedMs = timerElapsedMs();
    state.timer.running = false;
    state.timer.confirming = true;
    state.timer.finalMinutes = mins;
    ui.timerMemo = state.lastMemo || '';
    persist(); render(); return;
  }
  if(action==='confirm-timer'){
    const t = state.timer;
    if(!t || !t.confirming) return;
    const saved=[];
    t.subjectIds.forEach(subjectId=>{
      const record={ id: uid(), date:t.startDate, subjectId, minutes:t.finalMinutes, memo:ui.timerMemo };
      state.records.push(record); saved.push(record);
    });
    state.lastMemo = ui.timerMemo;
    state.timer = null;
    persist();
    const goalNowMet = goalFor(t.startDate)>0 && totalOn(t.startDate) >= goalFor(t.startDate);
    render();
    showRecordSaveFeedback(saved,null);
    if(goalNowMet && t.startDate===isoToday()) launchConfetti();
    return;
  }
  if(action==='discard-timer'){
    state.timer = null;
    persist(); render();
    showToast('破棄しました');
    return;
  }
  if(action==='toggle-range-subject'){
    const id = btn.dataset.id;
    const current = ui.rangeSubjectIds===null ? state.subjects.map(s=>s.id) : ui.rangeSubjectIds;
    ui.rangeSubjectIds = current.includes(id) ? current.filter(x=>x!==id) : [...current, id];
    render(); return;
  }
  if(action==='range-mode'){
    ui.rangeMode = btn.dataset.mode==='group' ? 'group' : 'subject';
    render(); return;
  }
  if(action==='toggle-range-group' && rangeGroupsAvailable()){
    const id = btn.dataset.id;
    const current = ui.rangeGroupIds===null ? rangeGroupTotals().groups.map(g=>g.id) : ui.rangeGroupIds;
    ui.rangeGroupIds = current.includes(id) ? current.filter(x=>x!==id) : [...current, id];
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
    else if(target==='deadlineEditor') ui.deadlineEditor.date = btn.dataset.date;
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
    } else if(c && c.actionType==='deadline'){
      state.deadlines = state.deadlines.filter(d=>d.id!==c.actionId);
      persist();
      showToast('目標日を削除しました');
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
      state.balance = result.extras.balance;
      state.deadlines = result.extras.deadlines;
      ui.balanceEditIdx = null; ui.balanceApplyFrom = null; ui.rangeGroupIds = null; // they pointed into the replaced setup
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

function onInput(e){
  if(e.target.dataset.field==='memo'){ ui.form.memo = e.target.value; return; }
  if(e.target.dataset.field==='timer-memo'){ ui.timerMemo = e.target.value; return; }
  if(e.target.dataset.field==='deadline-edit-label' && ui.deadlineEditor){
    ui.deadlineEditor.label = e.target.value;
    const btn = document.querySelector('[data-action="save-deadline-edit"]');
    if(btn) btn.disabled = e.target.value.trim()==='';
  }
}

function onChange(e){
  if(e.target.id==='import-file'){ handleImport(e.target.files[0]); return; }
  if(e.target.id==='import-csv-file'){ handleCsvImport(e.target.files[0]); return; }

  const field = e.target.dataset.field;
  if(!field) return;

  if(field==='hours'){ ui.form.hours = Number(e.target.value); syncSubmitState(); return; }
  if(field==='minutes'){ ui.form.minutes = Number(e.target.value); syncSubmitState(); return; }
  if(field==='memo'){ ui.form.memo = e.target.value; return; }
  if(field==='timer-memo'){ ui.timerMemo = e.target.value; return; }
  if(field==='subject-edit-name'){ ui.subjectEditor.name = e.target.value; return; }
  if(field==='deadline-edit-label'){ onInput(e); return; }
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
  const saved=[];
  let before=null;

  if(f.editingId){
    const rec = state.records.find(r=>r.id===f.editingId);
    if(!rec) return;
    before={...rec};
    rec.date=f.date; rec.subjectId=f.subjectIds[0]; rec.minutes=minutes; rec.memo=f.memo;
    saved.push(rec);
    if(ui.editReturnTab==='calendar') ui.selectedDate = f.date; // show the edited day
    returnFromEdit();
  } else {
    f.subjectIds.forEach(subjectId=>{
      const record={ id: uid(), date:f.date, subjectId, minutes, memo:f.memo };
      state.records.push(record); saved.push(record);
    });
  }
  state.lastMemo = f.memo;
  persist();
  const wasGoalAchieved = goalFor(f.date)>0 && totalOn(f.date) >= goalFor(f.date);
  resetForm(f.date);
  render();
  showRecordSaveFeedback(saved,before);
  if(wasGoalAchieved && f.date===isoToday()){
    launchConfetti();
  }
}

// After editing a record that was opened from another tab (e.g. the calendar), go back to that tab.
function returnFromEdit(){
  if(ui.editReturnTab){ ui.tab = ui.editReturnTab; ui.editReturnTab = null; window.scrollTo(0,0); }
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
  const data = JSON.stringify(Backup.buildBackup(state, SCHEMA_VERSION), null, 2);
  downloadBlob(data, Backup.exportFileName(new Date(), 'json'), 'application/json');
  showToast('バックアップを書き出しました');
}

function exportCsv(){
  // CSV quotes protect delimiters, not spreadsheet formulas. Prefix text only;
  // keep the original state and exact JSON backup unchanged.
  const spreadsheetText = value=>{
    const text = String(value ?? '');
    return /^(?:[\s\u0000-\u001f]*[=+\-@]|[\t\r\n])/.test(text) ? "'"+text : text;
  };
  const rows = [['date','subject','minutes','memo']];
  state.records.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{
    rows.push([r.date, spreadsheetText(subjectById(r.subjectId).name), r.minutes, spreadsheetText((r.memo||'').replace(/\n/g,' '))]);
  });
  const csv = rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob('\uFEFF'+csv, Backup.exportFileName(new Date(), 'csv'), 'text/csv');
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
        showToast(result.error || 'この形式は読み込めませんでした');
        console.warn('import failed, raw data:', parsed);
        resetImportInput();
        return;
      }
      // Backups made before the balance setup and target dates were exported don't have them: those keep the current ones.
      result.extras = result.native
        ? Backup.restoreExtras(parsed, { balance:state.balance, deadlines:state.deadlines }, backupOpts())
        : { balance:state.balance, deadlines:state.deadlines, balanceFrom:'kept', deadlinesFrom:'kept' };
      const extrasNote = [
        result.extras.balanceFrom==='file' ? '学習バランスのグループ設定も、ファイルの内容に置き換わります。' : 'このファイルには学習バランスのグループ設定が入っていないので、今の設定をそのまま残します。',
        result.extras.deadlinesFrom==='file' ? '目標日も、ファイルの内容に置き換わります。' : 'このファイルには目標日が入っていないので、今の目標日をそのまま残します。',
      ].join('');
      pendingImport = result;
      openConfirm(
        'バックアップを読み込みますか？',
        `現在のデータは上書きされます（${result.records.length}件の記録を読み込みます）。${extrasNote}この操作は取り消せません。`,
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
        if(!date){
          pendingCsvImport = null;
          showToast(`CSVの${i+1}行目の日付が不正です。読み込みを中止しました`);
          resetCsvImportInput();
          return;
        }
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

  const invalidDate = field=>({ok:false, error:`${field}の日付が不正です。読み込みを中止しました`});
  // Reject the whole file before confirmation; never silently drop or roll over dates.
  if(Array.isArray(parsed.deadlines) && parsed.deadlines.some(d=>d && d.date!==undefined && !Backup.isValidISODate(d.date))){
    return invalidDate('目標日');
  }
  if(parsed.balance && Array.isArray(parsed.balance.versions) && parsed.balance.versions.some(v=>v &&
     (!Backup.isValidISODate(v.from) || (v.savedOn!==undefined && !Backup.isValidISODate(v.savedOn))))){
    return invalidDate('学習バランスの履歴');
  }
  const dateRecords = parsed.records || parsed.logs || parsed.entries || parsed.sessions || parsed.data;
  if(Array.isArray(dateRecords)){
    for(const r of dateRecords){
      if(!r || typeof r!=='object') continue;
      const raw = r.date || r.day || r.recordedAt || r.createdAt || r.timestamp;
      // A time-only date in old exports can still fall back to recordedAt below,
      // but an explicitly supplied impossible calendar date must not be hidden.
      if(typeof raw==='string' && /^(?:\d{4}[-\/]\d|\d{1,2}\/\d{1,2}\/\d{4})/.test(raw) && !normalizeDate(raw)) return invalidDate('記録');
    }
  }

  // --- native shape: {subjects:[{id,name,color}], records:[{id,date,subjectId,minutes,memo}], goals:{weekday,weekend}} ---
  if(Array.isArray(parsed.subjects) && Array.isArray(parsed.records) &&
     parsed.subjects.every(s=>s && typeof s==='object' && 'id' in s) &&
     parsed.records.every(r=>r && typeof r==='object' && 'subjectId' in r && 'minutes' in r)){
    if(parsed.records.some(r=>!Backup.isValidISODate(r.date))) return invalidDate('記録');
    return {
      ok:true,
      native:true,
      subjects: parsed.subjects,
      records: parsed.records.map(r=>({ id:r.id||uid(), date:r.date, subjectId:r.subjectId, minutes:Number(r.minutes)||0, memo:r.memo||'' })),
      goals: parsed.goals && typeof parsed.goals==='object' ? { weekday:Backup.goalMinutes(parsed.goals.weekday,120), weekend:Backup.goalMinutes(parsed.goals.weekend,240) } : state.goals,
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
      if(!date && (r.date==null || (typeof r.date==='string' && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(r.date)))) date = normalizeDate(r.recordedAt);
      if(!date) return invalidDate('記録');

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
      weekday: Math.round(Backup.goalMinutes(g.weekdayHours,state.goals.weekday/60)*60),
      weekend: Math.round(Backup.goalMinutes(g.weekendHours,state.goals.weekend/60)*60),
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
    if(!date) return invalidDate('記録');

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
    weekday: Backup.goalMinutes(g.weekday ?? g.weekdayMinutes ?? g.平日,state.goals.weekday),
    weekend: Backup.goalMinutes(g.weekend ?? g.weekendMinutes ?? g.土日,state.goals.weekend),
  };

  return {ok:true, subjects, records, goals};
}

function normalizeDate(raw){
  if(!raw) return null;
  if(typeof raw === 'string'){
    const m = raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?=$|T|\s)/);
    if(m){
      const iso = `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
      return Backup.isValidISODate(iso) ? iso : null;
    }
    const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(us){
      const iso = `${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;
      return Backup.isValidISODate(iso) ? iso : null;
    }
    // Never let Date parse arbitrary strings: it silently repairs impossible dates.
    return null;
  }
  const d = new Date(raw);
  if(!isNaN(d.getTime())){
    const iso = dateToISO(d);
    return Backup.isValidISODate(iso) ? iso : null;
  }
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

