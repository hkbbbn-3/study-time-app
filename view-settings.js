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

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('calendar',13)} 目標日</div>
    <div class="card">
      ${sortedDeadlines().map(d=>{
        const days = daysUntil(d.date);
        const status = days>0 ? `あと${days}日` : days===0 ? '今日' : '終了';
        return `
        <div class="subject-chip deadline-chip ${days<0?'is-past':''}">
          <div class="deadline-info">
            <div class="name">${escapeHtml(d.label)}</div>
            <div class="deadline-date">${formatDateFull(d.date)}・${status}</div>
          </div>
          <button data-action="edit-deadline" data-id="${escapeHtml(d.id)}" aria-label="「${escapeHtml(d.label)}」を編集">${icon('edit',13)}</button>
          <button data-action="delete-deadline" data-id="${escapeHtml(d.id)}" aria-label="「${escapeHtml(d.label)}」を削除">${icon('x',13)}</button>
        </div>`;
      }).join('')}
      ${state.deadlines.length===0 ? `<div class="empty" style="padding:6px 0 14px;">試験日などの目標を設定すると、ホームにカウントダウンが出ます</div>` : ''}
      <button class="ghost-btn icon-row" style="margin-top:${state.deadlines.length?'2px':'0'}" data-action="add-deadline">${icon('plus',15)} 目標日を追加</button>
    </div>

    <div class="section-label icon-row" style="justify-content:flex-start">${icon('book',13)} 科目の設定</div>
    <div class="card">
      ${state.subjects.map((s,idx)=>`
        <div class="subject-chip">
          <div class="dot" style="background:${safeColor(s.color)}"></div>
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="reorder-btns">
            <button data-action="move-subject-up" data-id="${escapeHtml(s.id)}" aria-label="「${escapeHtml(s.name)}」を上に移動" ${idx===0?'disabled':''}>${icon('arrowUp',12)}</button>
            <button data-action="move-subject-down" data-id="${escapeHtml(s.id)}" aria-label="「${escapeHtml(s.name)}」を下に移動" ${idx===state.subjects.length-1?'disabled':''}>${icon('arrowDown',12)}</button>
          </div>
          <button data-action="edit-subject" data-id="${escapeHtml(s.id)}" aria-label="「${escapeHtml(s.name)}」を編集">${icon('edit',13)}</button>
          <button data-action="delete-subject" data-id="${escapeHtml(s.id)}" aria-label="「${escapeHtml(s.name)}」を削除">${icon('x',13)}</button>
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
            return `<button type="button" class="balance-pill g${i} ${on?'on':''}" aria-pressed="${on}" data-action="balance-toggle-subject" data-index="${i}" data-id="${escapeHtml(s.id)}">
              <span class="dot" style="background:${safeColor(s.color)}"></span>${escapeHtml(s.name)}
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

// Imported and already saved colors must remain a color, never CSS or markup.
// Keep stored data untouched; unsupported colors display with a neutral fallback.
function safeColor(value){
  return typeof value==='string' && /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value) ? value : '#999';
}

