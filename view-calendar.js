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
        <div class="day-dots">${uniqueSubs.map(sid=>`<span style="background:${safeColor(subjectById(sid).color)}"></span>`).join('')}</div>
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
      <div class="rec-badge" style="--pc:${safeColor(s.color)};background:${safeColor(s.color)}"></div>
      <div class="rec-body">
        <div class="rec-subject">${escapeHtml(s.name)}</div>
        ${r.memo ? `<div class="rec-memo">${escapeHtml(r.memo)}</div>` : ''}
      </div>
      <div class="rec-time">${fmtMin(r.minutes)}</div>
      <div class="rec-actions">
        <button data-action="edit-record" data-id="${escapeHtml(r.id)}" aria-label="記録を編集">${icon('edit',13)}</button>
        <button data-action="delete-record" data-id="${escapeHtml(r.id)}" aria-label="記録を削除">${icon('trash',13)}</button>
      </div>
    </div>
  `;
}

