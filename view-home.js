// ---------- HOME ----------
// ---------- study balance (2-4 groups of subjects vs. a target split, with a change history) ----------
// state.balance = { enabled, versions:[{ from:'YYYY-MM-DD', savedOn:'YYYY-MM-DD', groups:[{id,name,subjectIds,target}] }] }
// Each version is the setup in force from that date on, so a week or month is always judged by the settings it
// was recorded under. The last version is the current one and the one shown in Settings.
// Validation and upgrading of this shape live in backup.js (shared with the JSON backup import).
const { BALANCE_MIN_GROUPS, BALANCE_MAX_GROUPS, BALANCE_SINCE_START } = Backup;
function backupOpts(){ return { makeId:uid, today:isoToday() }; }

// Earlier saves used a single setup ({groups} or the first {a,b,targetA} shape): turn them into one version.
function migrateBalance(raw){ return Backup.migrateBalance(raw, backupOpts()); }

function balanceCurrent(){ const vs = state.balance.versions; return vs[vs.length-1]; }
// The setup that applied on a given day (days before the first version use the first one).
function balanceVersionFor(iso){ return RangeTotal.versionAt(state.balance.versions, iso); }
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

// Upcoming (today or later) target dates, soonest first. Hidden entirely once nothing is upcoming,
// rather than showing an empty section — past deadlines just quietly stop appearing here (they're
// still editable/deletable in Settings).
function renderDeadlineHome(){
  const today = isoToday();
  const upcoming = state.deadlines.filter(d=>d.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  if(upcoming.length===0) return '';
  return `
    <div class="section-label icon-row" style="justify-content:flex-start">${icon('calendar',13)} 目標日</div>
    <div class="card card--primary deadline-home-card">
      ${upcoming.map(d=>{
        const days = daysUntil(d.date);
        return `
        <div class="deadline-row">
          <div class="deadline-info">
            <div class="name">${escapeHtml(d.label)}</div>
            <div class="deadline-date">${formatDateFull(d.date)}</div>
          </div>
          <div class="deadline-countdown ${days<=7?'is-close':''}">${days===0 ? '今日' : `あと${days}日`}</div>
        </div>`;
      }).join('')}
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
        <div class="wdate ${isToday?'today':''} ${d.getDate()===1?'month-start':''}" aria-hidden="true">${d.getDate()===1 ? `${d.getMonth()+1}/1` : d.getDate()}</div>
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
        ${entries.map(([sid,min])=>{ const sj = subjectById(sid); return `<div class="subj-row"><div class="subj-dot" style="background:${safeColor(sj.color)}"></div><div class="subj-name">${escapeHtml(sj.name)}</div><div class="subj-min">${fmtMin(min)}</div></div>`; }).join('')}
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

  const allTime = computeAllTimeStats();

  return `
    <div class="hero ${achieved ? 'hero-achieved' : ''}">
      ${achieved ? `<div class="confetti" id="confetti"></div>` : ''}
      <div class="hero-top">
        <div class="hero-date">${dateStr}</div>
        <div class="hero-greet">${achieved ? `<span class="icon-row">${icon('check',15)} 今日の目標達成！</span>` : '今日もコツコツいこう'}</div>
      </div>
      <div class="hero-main">
        <div class="hero-time">
          <div class="hero-label">今日の学習時間</div>
          <div class="hero-display">${fmtMinHtml(minutes)}</div>
          <div class="hero-goal">${achieved ? `目標 <b>${fmtMin(goal)}</b> をクリア。おつかれさま` : (goal>0 ? `<span class="nw">目標 <b>${fmtMin(goal)}</b> まで、</span><span class="nw">あと ${fmtMin(goal-minutes)}</span>` : '設定タブで目標を決めよう')}</div>
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
        <div><div class="val">${fmtMin(heroWeekTotal)}</div><div class="lab">今週の合計</div></div>
        <div><div class="val">${icon('flame',16)} ${streak}日</div><div class="lab">連続で目標達成</div></div>
      </div>
    </div>

    <div class="home-record-actions" role="group" aria-label="学習を記録する">
      <button type="button" class="submit-btn icon-row" data-action="open-record" data-mode="manual">${icon('plus',18)} 時間を記録</button>
      <button type="button" class="ghost-btn icon-row" data-action="open-record" data-mode="timer">${icon('play',18)} ${state.timer ? 'タイマーへ戻る' : 'タイマー開始'}</button>
    </div>
    ${state.timer ? `<div class="card home-timer" role="region" aria-label="タイマーの状態">
      <div><div class="field-label">${state.timer.confirming ? '保存待ちの記録' : state.timer.running ? '計測中' : '一時停止中'}</div>
      <strong id="homeTimerDisplay">${state.timer.confirming ? fmtMin(state.timer.finalMinutes) : fmtElapsed(timerElapsedMs())}</strong></div>
      <button type="button" class="ghost-btn" data-action="open-record" data-mode="timer">タイマーへ戻る</button>
    </div>` : ''}

    ${renderDeadlineHome()}

    <div class="section-label">今週</div>
    <div class="card card--primary">
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

    <button type="button" class="ghost-btn home-details-toggle icon-row" data-action="toggle-home-details" aria-expanded="${!!ui.homeDetails}" aria-controls="homeDetails">${icon('trending',18)} ${ui.homeDetails ? '詳しい振り返りを閉じる' : '詳しく振り返る'} ${icon(ui.homeDetails ? 'minus' : 'plus',16)}</button>
    <div id="homeDetails" ${ui.homeDetails ? '' : 'hidden'}>
    ${ui.homeDetails ? `
    <div class="section-label">統計</div>
    ${renderStatsCard({ y, m, isCurrentMonth, daysInMonth, monthTotal, monthGoal, monthPct, now })}

    <div class="section-label">バランス</div>
    ${renderBalanceHome()}

    <div class="section-label is-quiet">これまでの記録</div>
    <div class="card card--quiet">
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
    </div>

    <div class="card card--quiet">
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
      ${renderRangeBody()}
    </div>
    ` : ''}
    </div>
  `;
}

// ---------- 統計 card (home, inside 詳しく振り返る): month / year totals from stats.js ----------
// items: [{label, minutes, aria, value?}] drawn as small vertical bars, scaled to the largest one.
// One-line minutes for narrow spots: 45分 / 4.3h
function fmtCompact(min){
  min = Math.round(min);
  return min<60 ? `${min}分` : `${Math.round(min/6)/10}h`;
}
function statBarsHtml(items){
  const max = Math.max(1, ...items.map(i=>i.minutes));
  return `<div class="stat-bars" style="--n:${items.length}" role="list">${items.map(i=>{
    const h = Math.max(4, Math.round((i.minutes/max)*100));
    return `<div class="stat-col" role="listitem" aria-label="${escapeHtml(i.aria)}">
      <div class="wbar-track"><div class="wbar-fill" style="height:${i.minutes>0?h:4}%; opacity:${i.minutes>0?1:0.35}"></div></div>
      <div class="stat-col-label" aria-hidden="true">${escapeHtml(i.label)}</div>
      ${i.value ? `<div class="stat-col-val" aria-hidden="true">${escapeHtml(i.value)}</div>` : ''}
    </div>`;
  }).join('')}</div>`;
}

function statTilesHtml(tiles){
  return `<div class="stat-tiles">${tiles.map(t=>`<div class="alltime-stat"><div class="v ${t.cls||''}">${t.value}</div><div class="l">${t.label}</div></div>`).join('')}</div>`;
}

function statSubjectRows(entries, heading){
  const top = entries.slice(0,5);
  const max = top.length ? top[0][1] : 1;
  return `<div class="month-breakdown">
    <div class="card-title icon-row">${icon('book',15)} ${heading}</div>
    ${top.length ? top.map(([sid,min])=>{
      const s = subjectById(sid);
      const w = Math.round((min/max)*100);
      return `<div class="subj-row">
        <div class="subj-dot" style="background:${safeColor(s.color)}"></div>
        <div class="subj-name">${escapeHtml(s.name)}</div>
        <div class="subj-min">${fmtMin(min)}</div>
      </div>
      <div class="bar-track" style="height:6px; margin-bottom:2px;"><div class="bar-fill" style="width:${w}%; background:${safeColor(s.color)}"></div></div>`;
    }).join('') : `<div class="empty">まだ記録がありません<br>「記録」タブから始めてみよう</div>`}
  </div>`;
}

function renderStatsCard(ctx){
  const isYear = ui.statsMode==='year';
  const nowYear = ctx.now.getFullYear();
  const tabs = `<div class="balance-tabs" role="group" aria-label="統計の期間">
      <button type="button" class="${isYear?'':'active'}" data-action="stats-mode" data-mode="month" aria-pressed="${!isYear}">月</button>
      <button type="button" class="${isYear?'active':''}" data-action="stats-mode" data-mode="year" aria-pressed="${isYear}">年</button>
    </div>`;
  let head, body;
  if(!isYear){
    const { y, m, isCurrentMonth, daysInMonth, monthTotal, monthGoal, monthPct } = ctx;
    const s = Stats.monthSummary(state.records, y, m);
    const cmp = Stats.monthComparison(state.records, y, m, isCurrentMonth ? ctx.now.getDate() : daysInMonth);
    const diff = cmp.current - cmp.previous;
    const delta = cmp.current===0 && cmp.previous===0
      ? { cls:'neutral', value:'―' }
      : { cls: diff>=0 ? 'up' : 'down', value:`${diff>=0?'+':'−'}${fmtCompact(Math.abs(diff))}` };
    head = `
      <div class="cal-head" style="margin-bottom:var(--sp-2);">
        <div class="cal-title">${y}年${m+1}月${isCurrentMonth?'（今月）':''}</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="home-prev-month" role="button" tabindex="0" aria-label="前の月">${icon('chevronLeft',16)}</div>
          <div class="iconbtn" data-action="home-next-month" role="button" tabindex="0" aria-label="次の月">${icon('chevronRight',16)}</div>
        </div>
      </div>`;
    body = `
      <div class="progress-row">
        <div class="t">月の記録</div>
        <div class="n">${fmtMin(monthTotal)}（目標 ${fmtMin(monthGoal)}）</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${monthPct}%"></div></div>
      ${statTilesHtml([
        { value:`${s.studyDays}日`, label:'学習した日数' },
        { value: s.studyDays ? fmtMin(s.avgPerStudyDay) : '―', label:'学習日の平均' },
        { value: delta.value, cls:`stat-delta ${delta.cls}`, label:'先月比' },
      ])}
      ${isCurrentMonth ? `<div class="stat-note">先月比は、先月の同じ日（${ctx.now.getDate()}日）までとの比較です</div>` : ''}
      <div class="card-title icon-row">${icon('trending',15)} 7日ごとの合計</div>
      ${statBarsHtml(s.weeks.map(w=>({ label:w.label.replace('日',''), minutes:w.minutes, value: w.minutes>0 ? fmtCompact(w.minutes) : '', aria:`${w.label} ${w.minutes>0?fmtMin(w.minutes):'記録なし'}` })))}
      ${statSubjectRows(s.bySubject, `科目ごとの合計（${y}年${m+1}月）`)}`;
  }else{
    const y = ui.statsYear;
    const s = Stats.yearSummary(state.records, y);
    const active = s.months.filter(v=>v>0).length;
    const best = s.months.reduce((bi,v,i)=> v>s.months[bi] ? i : bi, 0);
    const atLatest = y>=nowYear;
    head = `
      <div class="cal-head" style="margin-bottom:var(--sp-2);">
        <div class="cal-title">${y}年${y===nowYear?'（今年）':''}</div>
        <div class="cal-nav">
          <div class="iconbtn" data-action="stats-prev-year" role="button" tabindex="0" aria-label="前の年">${icon('chevronLeft',16)}</div>
          <div class="iconbtn ${atLatest?'is-disabled':''}" ${atLatest?'aria-disabled="true"':'data-action="stats-next-year"'} role="button" tabindex="${atLatest?-1:0}" aria-label="次の年">${icon('chevronRight',16)}</div>
        </div>
      </div>`;
    body = `
      ${statTilesHtml([
        { value: fmtCompact(s.total), label:'年間の合計' },
        { value:`${s.studyDays}日`, label:'学習した日数' },
        { value: active ? fmtCompact(s.total/active) : '―', label:'学習した月の平均' },
      ])}
      <div class="card-title icon-row">${icon('trending',15)} 月ごとの合計</div>
      ${statBarsHtml(s.months.map((v,i)=>({ label:String(i+1), minutes:v, aria:`${i+1}月 ${v>0?fmtMin(v):'記録なし'}` })))}
      ${s.total>0 ? `<div class="stat-note">いちばん多い月：${best+1}月（${fmtMin(s.months[best])}）</div>` : ''}
      ${statSubjectRows(s.bySubject, `科目ごとの合計（${y}年）`)}`;
  }
  return `<div class="card">${head}${tabs}${body}</div>`;
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
// the range being given backwards (see range-total.js).
function computeRangeTotal(startIso, endIso, subjectIds){
  return RangeTotal.rangeSubjectTotal(state.records, startIso, endIso, subjectIds);
}

// Group totals are only offered while the balance feature is on.
function rangeGroupsAvailable(){ return !!state.balance && state.balance.enabled!==false; }
function rangeGroupTotals(){ return RangeTotal.rangeGroupTotals(state.records, state.balance, ui.rangeStart, ui.rangeEnd); }

// The range card below the dates: subject pills + total, or group pills + total + a per-group breakdown.
function renderRangeBody(){
  const groupMode = ui.rangeMode==='group' && rangeGroupsAvailable();
  const tabs = rangeGroupsAvailable() ? `
      <div class="balance-tabs range-tabs" role="group" aria-label="集計の単位">
        <button type="button" class="${groupMode?'':'active'}" data-action="range-mode" data-mode="subject" aria-pressed="${!groupMode}">科目</button>
        <button type="button" class="${groupMode?'active':''}" data-action="range-mode" data-mode="group" aria-pressed="${groupMode}">グループ</button>
      </div>` : '';
  if(!groupMode){
    const rangeSubjectIds = ui.rangeSubjectIds===null ? state.subjects.map(s=>s.id) : ui.rangeSubjectIds;
    const range = computeRangeTotal(ui.rangeStart, ui.rangeEnd, rangeSubjectIds);
    return `${tabs}
      <div class="field" style="margin:14px 0 0;">
        <label class="field-label">科目${rangeSubjectIds.length===state.subjects.length?'':'（絞り込み中）'}</label>
        <div class="subject-pill-grid">
          ${state.subjects.map(s=>{
            const selected = rangeSubjectIds.includes(s.id);
            return `<button type="button" class="subject-pill ${selected?'selected':''}" data-action="toggle-range-subject" data-id="${escapeHtml(s.id)}" style="--pc:${safeColor(s.color)};${selected?`background:${safeColor(s.color)};border-color:${safeColor(s.color)};`:''}">
              <span class="dot" style="background:${selected?'#fff':safeColor(s.color)}"></span>${escapeHtml(s.name)}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="range-result">
        ${rangeSubjectIds.length===0
          ? `<div class="empty" style="padding:10px 0;">科目を選んでください</div>`
          : `<div class="v">${fmtMin(range.total)}</div>
             <div class="l">${range.dayCount}日間の合計（1日平均 ${fmtMin(Math.round(range.total/range.dayCount))}）</div>`}
      </div>`;
  }

  const res = rangeGroupTotals();
  // A picked group missing from this range stays in the selection (it returns if the range changes) but isn't shown.
  const selectedIds = ui.rangeGroupIds===null ? res.groups.map(g=>g.id) : ui.rangeGroupIds;
  const shown = res.groups.map((g,i)=>({ ...g, color:i%BALANCE_MAX_GROUPS })).filter(g=>selectedIds.includes(g.id));
  const total = shown.reduce((a,g)=>a+g.minutes, 0);
  const pcts = total>0 ? roundTo100(shown.map(g=>g.minutes/total*100)) : [];
  return `${tabs}
      <div class="field" style="margin:14px 0 0;">
        <label class="field-label">グループ${shown.length===res.groups.length?'':'（絞り込み中）'}</label>
        <div class="subject-pill-grid">
          ${res.groups.map((g,i)=>{
            const on = selectedIds.includes(g.id);
            return `<button type="button" class="balance-pill g${i%BALANCE_MAX_GROUPS} ${on?'on':''}" aria-pressed="${on}" data-action="toggle-range-group" data-id="${escapeHtml(g.id)}">
              <span class="dot balance-dot g${i%BALANCE_MAX_GROUPS}"></span>${escapeHtml(g.name)}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="range-result">
        ${shown.length===0
          ? `<div class="empty" style="padding:10px 0;">グループを選んでください</div>`
          : `<div class="v">${fmtMin(total)}</div>
             <div class="l">${res.dayCount}日間の合計（1日平均 ${fmtMin(Math.round(total/res.dayCount))}）</div>`}
      </div>
      ${shown.map((g,i)=>`
        <div class="balance-legend-row">
          <span class="balance-dot g${g.color}"></span>
          <span class="balance-name">${escapeHtml(g.name)}</span>
          <span class="balance-val">${fmtMin(g.minutes)}<small>${total>0 ? `（${pcts[i]}%）` : ''}</small></span>
        </div>`).join('')}
      ${res.changes.length ? `<div class="balance-note">この期間の途中で、グループの設定が変わっています（${res.changes.map(shortDate).join('、')}から）。それぞれの記録は、その日の設定のグループで数えています。</div>` : ''}
      ${res.other>0 ? `<div class="balance-note">グループ未設定の科目：${fmtMin(res.other)}（合計には含めていません）</div>` : ''}`;
}

