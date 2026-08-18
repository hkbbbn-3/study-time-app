// =========================
// アプリ画面の切り替え
// =========================

const navItems = document.querySelectorAll(".nav-item");

const appScreens = {
  home: document.getElementById("homeScreen"),
  calendar: document.getElementById("calendarScreen"),
  record: document.getElementById("recordScreen"),
  settings: document.getElementById("settingsScreen")
};

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.target;

    // すべての画面を非表示
    Object.values(appScreens).forEach((screen) => {
      screen.classList.remove("active-screen");
    });

    // 選んだ画面だけ表示
    appScreens[target].classList.add("active-screen");

    // ナビゲーションの選択状態を変更
    navItems.forEach((nav) => {
      nav.classList.remove("active");
    });

    item.classList.add("active");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

const calendarDays = document.getElementById("calendarDays");
const monthTitle = document.getElementById("monthTitle");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const todayBtn = document.getElementById("todayBtn");
const themeBtn = document.getElementById("themeBtn");

const subject = document.getElementById("subject");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const memo = document.getElementById("memo");

const addBtn = document.getElementById("addBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const clearBtn = document.getElementById("clearBtn");

const history = document.getElementById("history");
const historyTitle = document.getElementById("historyTitle");
const formTitle = document.getElementById("formTitle");
const formDateText = document.getElementById("formDateText");

const selectedDateText = document.getElementById("selectedDateText");
const todayTotal = document.getElementById("todayTotal");
const weekTotal = document.getElementById("weekTotal");

const dailyGoalText = document.getElementById("dailyGoalText");
const dailyProgress = document.getElementById("dailyProgress");
const dailyPercent = document.getElementById("dailyPercent");
const dailySubjectStats = document.getElementById("dailySubjectStats");

const monthStatsTitle = document.getElementById("monthStatsTitle");
const monthTotal = document.getElementById("monthTotal");
const monthGoal = document.getElementById("monthGoal");
const monthlyChart = document.getElementById("monthlyChart");
const subjectStats = document.getElementById("subjectStats");

const weekdayGoal = document.getElementById("weekdayGoal");
const weekendGoal = document.getElementById("weekendGoal");
const saveGoalsBtn = document.getElementById("saveGoalsBtn");

const newSubject = document.getElementById("newSubject");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const subjectList = document.getElementById("subjectList");

const exportJsonBtn = document.getElementById("exportJsonBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const importInput = document.getElementById("importInput");

let editingIndex = null;

function createId() {
  return `${Date.now()}-${Math.random()}`;
}

function makeDateString(year, month, day) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");

  return `${year}-${monthText}-${dayText}`;
}

function getTodayString() {
  const today = new Date();

  return makeDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function formatTime(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  if (hour === 0 && minute === 0) {
    return "0分";
  }

  if (hour === 0) {
    return `${minute}分`;
  }

  if (minute === 0) {
    return `${hour}時間`;
  }

  return `${hour}時間 ${minute}分`;
}

function formatDate(dateString) {
  const parts = dateString.split("-");

  return `${Number(parts[1])}月${Number(parts[2])}日`;
}

function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text || "";

  return div.innerHTML;
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

const now = new Date();

let selectedDate = getTodayString();
let calendarYear = now.getFullYear();
let calendarMonth = now.getMonth();

let studyRecords = JSON.parse(
  localStorage.getItem("studyRecords")
) || [];

let goals = JSON.parse(
  localStorage.getItem("studyGoals")
) || {
  weekdayHours: 4,
  weekendHours: 0
};

let studySubjects = JSON.parse(
  localStorage.getItem("studySubjects")
) || [
  "簿記",
  "オンライン授業",
  "その他"
];

let isDarkMode = localStorage.getItem("darkMode") === "true";

/* 前のバージョンで作った記録にも対応する */
studyRecords = studyRecords.map((record) => {
  if (!record.id) {
    record.id = createId();
  }

  if (!record.memo) {
    record.memo = "";
  }

  if (!record.date && record.recordedAt) {
    const oldDate = new Date(record.recordedAt);

    record.date = makeDateString(
      oldDate.getFullYear(),
      oldDate.getMonth(),
      oldDate.getDate()
    );

    record.time = oldDate.toLocaleTimeString(
      "ja-JP",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  if (!studySubjects.includes(record.subject)) {
    studySubjects.push(record.subject);
  }

  return record;
});

weekdayGoal.value = goals.weekdayHours;
weekendGoal.value = goals.weekendHours;

function saveRecords() {
  localStorage.setItem(
    "studyRecords",
    JSON.stringify(studyRecords)
  );
}

function saveGoals() {
  localStorage.setItem(
    "studyGoals",
    JSON.stringify(goals)
  );
}

function saveSubjects() {
  localStorage.setItem(
    "studySubjects",
    JSON.stringify(studySubjects)
  );
}

function getGoalMinutes(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();

  const isWeekend = day === 0 || day === 6;

  const goalHours = isWeekend
    ? goals.weekendHours
    : goals.weekdayHours;

  return goalHours * 60;
}

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  /* 月曜日を週の最初にする */
  const day = date.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - daysFromMonday);

  return date;
}

function isSameWeek(recordDate, targetDate) {
  const recordStart = getWeekStart(recordDate);
  const targetStart = getWeekStart(targetDate);

  return (
    recordStart.getFullYear() === targetStart.getFullYear() &&
    recordStart.getMonth() === targetStart.getMonth() &&
    recordStart.getDate() === targetStart.getDate()
  );
}

function getMinutesForDate(dateString) {
  return studyRecords
    .filter((record) => record.date === dateString)
    .reduce((total, record) => total + record.minutes, 0);
}

function resetForm() {
  editingIndex = null;

  formTitle.textContent = "勉強時間を記録";
  addBtn.textContent = "＋ 勉強時間を記録";

  cancelEditBtn.classList.add("hidden");

  hours.value = 0;
  minutes.value = 0;
  memo.value = "";
}

function renderSubjectOptions() {
  const selectedSubject = subject.value;

  subject.innerHTML = "";

  studySubjects.forEach((subjectName) => {
    const option = document.createElement("option");

    option.value = subjectName;
    option.textContent = subjectName;

    subject.appendChild(option);
  });

  if (studySubjects.includes(selectedSubject)) {
    subject.value = selectedSubject;
  }
}

function renderSubjectList() {
  subjectList.innerHTML = "";

  studySubjects.forEach((subjectName) => {
    const item = document.createElement("div");

    item.className = "subject-list-item";

    const text = document.createElement("span");
    text.textContent = subjectName;

    const deleteBtn = document.createElement("button");

    deleteBtn.className = "subject-delete-btn";
    deleteBtn.textContent = "削除";

    deleteBtn.addEventListener("click", () => {
      deleteSubject(subjectName);
    });

    item.appendChild(text);
    item.appendChild(deleteBtn);

    subjectList.appendChild(item);
  });
}

function deleteSubject(subjectName) {
  const isUsed = studyRecords.some(
    (record) => record.subject === subjectName
  );

  if (isUsed) {
    alert("この科目には記録が残っているため削除できません。");
    return;
  }

  if (studySubjects.length === 1) {
    alert("科目は1つ以上残してください。");
    return;
  }

  const result = confirm(
    `「${subjectName}」を科目一覧から削除しますか？`
  );

  if (!result) {
    return;
  }

  studySubjects = studySubjects.filter(
    (name) => name !== subjectName
  );

  saveSubjects();
  renderAll();
}

function renderCalendar() {
  calendarDays.innerHTML = "";

  monthTitle.textContent =
    `${calendarYear}年${calendarMonth + 1}月`;

  const firstDay = new Date(calendarYear, calendarMonth, 1);

  /* 月曜始まりの位置に直す */
  const firstDayPosition = (firstDay.getDay() + 6) % 7;

  const lastDate = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  for (let i = 0; i < firstDayPosition; i++) {
    const emptyDay = document.createElement("div");

    emptyDay.className = "empty-day";

    calendarDays.appendChild(emptyDay);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateString = makeDateString(
      calendarYear,
      calendarMonth,
      day
    );

    const dayButton = document.createElement("button");

    dayButton.className = "calendar-day";
    dayButton.textContent = day;

    if (dateString === getTodayString()) {
      dayButton.classList.add("today");
    }

    if (dateString === selectedDate) {
      dayButton.classList.add("selected");
    }

    const studyMinutes = getMinutesForDate(dateString);
    const goalMinutes = getGoalMinutes(dateString);

    if (studyMinutes > 0) {
      dayButton.classList.add("has-record");
    }

    if (goalMinutes > 0 && studyMinutes >= goalMinutes) {
      dayButton.classList.remove("has-record");
      dayButton.classList.add("goal-achieved");
    }

    dayButton.addEventListener("click", () => {
      selectedDate = dateString;

      resetForm();
      renderAll();
    });

    calendarDays.appendChild(dayButton);
  }
}

function updateDateTexts() {
  const dateText = formatDate(selectedDate);

  selectedDateText.textContent =
    `${dateText}の勉強時間`;

  formDateText.textContent =
    `記録する日：${dateText}`;

  historyTitle.textContent =
    `${dateText}の記録`;
}

function updateDailyGoal(studyMinutes) {
  const goalMinutes = getGoalMinutes(selectedDate);

  dailyGoalText.textContent =
    `目標：${formatTime(goalMinutes)}`;

  if (goalMinutes === 0) {
    dailyProgress.style.width = "0%";
    dailyPercent.textContent =
      "目標は設定されていません";

    return;
  }

  const percent = Math.round(
    (studyMinutes / goalMinutes) * 100
  );

  dailyProgress.style.width =
    `${Math.min(percent, 100)}%`;

  dailyPercent.textContent =
    `達成率 ${percent}%`;
}

function displayDailySubjectStats(subjectTotals) {
  dailySubjectStats.innerHTML = "";

  Object.keys(subjectTotals)
    .sort((a, b) => subjectTotals[b] - subjectTotals[a])
    .forEach((subjectName) => {
      const item = document.createElement("div");

      item.className = "daily-subject-stat";

      item.innerHTML = `
        <span>${escapeHtml(subjectName)}</span>
        <strong>${formatTime(subjectTotals[subjectName])}</strong>
      `;

      dailySubjectStats.appendChild(item);
    });
}

function displayRecords() {
  history.innerHTML = "";

  let selectedDayMinutes = 0;
  let selectedWeekMinutes = 0;

  const selectedDaySubjects = {};

  studyRecords.forEach((record, index) => {
    if (isSameWeek(record.date, selectedDate)) {
      selectedWeekMinutes += record.minutes;
    }

    if (record.date !== selectedDate) {
      return;
    }

    selectedDayMinutes += record.minutes;

    selectedDaySubjects[record.subject] =
      (selectedDaySubjects[record.subject] || 0) +
      record.minutes;

    const item = document.createElement("div");

    item.className = "study-item";

    const memoHtml = record.memo
      ? `<div class="study-memo">${escapeHtml(record.memo)}</div>`
      : "";

    item.innerHTML = `
      <div class="study-info">
        <div class="study-subject">
          ${escapeHtml(record.subject)}
        </div>

        <div class="study-date">
          ${escapeHtml(record.time)} に記録
        </div>

        ${memoHtml}
      </div>

      <div class="study-right">
        <div class="study-time">
          ${formatTime(record.minutes)}
        </div>

        <div class="record-buttons">
          <button class="edit-btn">編集</button>
          <button class="delete-btn">削除</button>
        </div>
      </div>
    `;

    item.querySelector(".edit-btn").addEventListener(
      "click",
      () => {
        startEditing(index);
      }
    );

    item.querySelector(".delete-btn").addEventListener(
      "click",
      () => {
        deleteRecord(index);
      }
    );

    history.appendChild(item);
  });

  todayTotal.textContent =
    formatTime(selectedDayMinutes);

  weekTotal.textContent =
    formatTime(selectedWeekMinutes);

  updateDailyGoal(selectedDayMinutes);
  displayDailySubjectStats(selectedDaySubjects);

  if (history.children.length === 0) {
    history.innerHTML =
      '<p class="empty">まだ記録がありません</p>';
  }
}

function displayMonthStats() {
  let totalMinutes = 0;
  let goalMinutes = 0;

  const subjectTotals = {};
  const dayTotals = {};
  const daySubjectTotals = {};

  const lastDate = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  for (let day = 1; day <= lastDate; day++) {
    const dateString = makeDateString(
      calendarYear,
      calendarMonth,
      day
    );

    goalMinutes += getGoalMinutes(dateString);
    dayTotals[day] = 0;
    daySubjectTotals[day] = {};
  }

  studyRecords.forEach((record) => {
    const recordDate = new Date(`${record.date}T00:00:00`);

    if (
      recordDate.getFullYear() === calendarYear &&
      recordDate.getMonth() === calendarMonth
    ) {
      totalMinutes += record.minutes;

      const day = recordDate.getDate();

      dayTotals[day] += record.minutes;

      daySubjectTotals[day][record.subject] =
        (daySubjectTotals[day][record.subject] || 0) +
        record.minutes;

      subjectTotals[record.subject] =
        (subjectTotals[record.subject] || 0) +
        record.minutes;
    }
  });

  monthStatsTitle.textContent =
    `${calendarYear}年${calendarMonth + 1}月のまとめ`;

  monthTotal.textContent = formatTime(totalMinutes);
  monthGoal.textContent = formatTime(goalMinutes);

  renderChart(dayTotals, lastDate, daySubjectTotals);
  renderSubjectStats(subjectTotals);
}

function renderChart(dayTotals, lastDate, daySubjectTotals) {
  monthlyChart.innerHTML = "";

  const chartHeight = 130;

  const maximumMinutes = Math.max(
    ...Object.values(dayTotals),
    240
  );

  const maximumHours = Math.ceil(maximumMinutes / 60);

  const subjectColors = [
    "#55b7ff",
    "#8b7cf6",
    "#4fc3a1",
    "#f3a65a",
    "#e879b9",
    "#6b9ee8",
    "#9aa6b2",
    "#65c6d8"
  ];

  const subjectColorMap = {};

  studySubjects.forEach((subjectName, index) => {
    subjectColorMap[subjectName] =
      subjectColors[index % subjectColors.length];
  });

  const wrapper = document.createElement("div");
  wrapper.className = "chart-wrapper";

  /* 縦軸 */
  const yAxis = document.createElement("div");
  yAxis.className = "chart-y-axis";

  for (let hour = maximumHours; hour >= 0; hour--) {
    const label = document.createElement("span");

    label.textContent =
      hour === 0 ? "0分" : `${hour}時間`;

    yAxis.appendChild(label);
  }

  /* グラフ本体 */
  const scrollArea = document.createElement("div");
  scrollArea.className = "chart-scroll";

  const plot = document.createElement("div");
  plot.className = "chart-plot";

  /* 横線 */
  for (let hour = 0; hour <= maximumHours; hour++) {
    const gridLine = document.createElement("div");

    gridLine.className = "chart-grid-line";

    gridLine.style.bottom =
      `${(hour / maximumHours) * chartHeight + 22}px`;

    plot.appendChild(gridLine);
  }

  for (let day = 1; day <= lastDate; day++) {
    const column = document.createElement("div");
    column.className = "chart-column";

    const stack = document.createElement("div");
    stack.className = "chart-stack";

    const subjectData =
      daySubjectTotals[day] || {};

    const subjects = Object.keys(subjectData);

    subjects
      .sort((a, b) => subjectData[b] - subjectData[a])
      .forEach((subjectName) => {
        const minutes = subjectData[subjectName];

        const segment = document.createElement("div");

        segment.className = "chart-segment";

        segment.style.height =
          `${(minutes / (maximumHours * 60)) * 100}%`;

        segment.style.background =
          subjectColorMap[subjectName] || "#9aa6b2";

        segment.title =
          `${subjectName}：${formatTime(minutes)}`;

        stack.appendChild(segment);
      });

    const label = document.createElement("span");

    label.className = "chart-label";
    label.textContent = day;

    column.appendChild(stack);
    column.appendChild(label);

    plot.appendChild(column);
  }

  scrollArea.appendChild(plot);

  wrapper.appendChild(yAxis);
  wrapper.appendChild(scrollArea);

  monthlyChart.appendChild(wrapper);

  /* 科目凡例 */
  const legend = document.createElement("div");
  legend.className = "chart-legend";

  studySubjects.forEach((subjectName, index) => {
    const item = document.createElement("div");
    item.className = "chart-legend-item";

    const dot = document.createElement("span");
    dot.className = "chart-legend-dot";

    dot.style.background =
      subjectColorMap[subjectName];

    const text = document.createElement("span");
    text.textContent = subjectName;

    item.appendChild(dot);
    item.appendChild(text);

    legend.appendChild(item);
  });

  monthlyChart.appendChild(legend);
}

function renderSubjectStats(subjectTotals) {
  subjectStats.innerHTML = "";

  const subjects = Object.keys(subjectTotals);

  if (subjects.length === 0) {
    subjectStats.innerHTML =
      '<p class="empty">この月の記録はまだありません</p>';

    return;
  }

  subjects
    .sort((a, b) => subjectTotals[b] - subjectTotals[a])
    .forEach((subjectName) => {
      const item = document.createElement("div");

      item.className = "subject-stat";

      item.innerHTML = `
        <span>${escapeHtml(subjectName)}</span>
        <strong>${formatTime(subjectTotals[subjectName])}</strong>
      `;

      subjectStats.appendChild(item);
    });
}

function renderAll() {
  renderSubjectOptions();
  renderSubjectList();
  renderCalendar();
  updateDateTexts();
  displayRecords();
  displayMonthStats();
  updateHomeScreen();
}

function startEditing(index) {
  const record = studyRecords[index];

  editingIndex = index;
  selectedDate = record.date;

  const recordDate = new Date(
    `${record.date}T00:00:00`
  );

  calendarYear = recordDate.getFullYear();
  calendarMonth = recordDate.getMonth();

  if (!studySubjects.includes(record.subject)) {
    studySubjects.push(record.subject);
  }

  renderSubjectOptions();

  subject.value = record.subject;
  hours.value = Math.floor(record.minutes / 60);
  minutes.value = record.minutes % 60;
  memo.value = record.memo || "";

  formTitle.textContent = "勉強時間を編集";
  addBtn.textContent = "変更を保存";

  cancelEditBtn.classList.remove("hidden");

  renderAll();

  document.querySelector(".input-card").scrollIntoView({
    behavior: "smooth"
  });
}

function deleteRecord(index) {
  const result = confirm("この記録を削除しますか？");

  if (!result) {
    return;
  }

  studyRecords.splice(index, 1);

  saveRecords();
  resetForm();
  renderAll();
}

addBtn.addEventListener("click", () => {
  const hourValue = Number(hours.value) || 0;
  const minuteValue = Number(minutes.value) || 0;

  const totalMinutes =
    hourValue * 60 + minuteValue;

  if (totalMinutes <= 0) {
    alert("勉強時間を入力してください！");
    return;
  }

  if (editingIndex !== null) {
    studyRecords[editingIndex].date = selectedDate;
    studyRecords[editingIndex].subject = subject.value;
    studyRecords[editingIndex].minutes = totalMinutes;
    studyRecords[editingIndex].memo = memo.value.trim();

    saveRecords();
    resetForm();
    renderAll();

    return;
  }

  const recordTime = new Date().toLocaleTimeString(
    "ja-JP",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

  studyRecords.push({
    id: createId(),
    date: selectedDate,
    subject: subject.value,
    minutes: totalMinutes,
    memo: memo.value.trim(),
    time: recordTime
  });

  saveRecords();
  resetForm();
  renderAll();
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
  renderAll();
});

clearBtn.addEventListener("click", () => {
  const recordsForSelectedDate = studyRecords.filter(
    (record) => record.date === selectedDate
  );

  if (recordsForSelectedDate.length === 0) {
    alert("この日の記録はありません。");
    return;
  }

  const result = confirm(
    `${formatDate(selectedDate)}の記録をすべて削除しますか？`
  );

  if (!result) {
    return;
  }

  studyRecords = studyRecords.filter(
    (record) => record.date !== selectedDate
  );

  saveRecords();
  resetForm();
  renderAll();
});

saveGoalsBtn.addEventListener("click", () => {
  const weekdayHours = Number(weekdayGoal.value);
  const weekendHours = Number(weekendGoal.value);

  if (weekdayHours < 0 || weekendHours < 0) {
    alert("目標時間は0以上の数字にしてください。");
    return;
  }

  goals = {
    weekdayHours,
    weekendHours
  };

  saveGoals();
  renderAll();

  alert("目標時間を保存しました！");
});

addSubjectBtn.addEventListener("click", () => {
  const subjectName = newSubject.value.trim();

  if (!subjectName) {
    alert("追加する科目を入力してください。");
    return;
  }

  if (studySubjects.includes(subjectName)) {
    alert("その科目はすでにあります。");
    return;
  }

  studySubjects.push(subjectName);

  saveSubjects();

  newSubject.value = "";

  renderAll();

  subject.value = subjectName;
});

newSubject.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubjectBtn.click();
  }
});

prevMonthBtn.addEventListener("click", () => {
  calendarMonth--;

  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  }

  renderAll();
});

nextMonthBtn.addEventListener("click", () => {
  calendarMonth++;

  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }

  renderAll();
});

todayBtn.addEventListener("click", () => {
  const today = new Date();

  selectedDate = getTodayString();
  calendarYear = today.getFullYear();
  calendarMonth = today.getMonth();

  resetForm();
  renderAll();
});

themeBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;

  localStorage.setItem("darkMode", isDarkMode);

  applyTheme();
});

function applyTheme() {
  document.body.classList.toggle(
    "dark-mode",
    isDarkMode
  );

  themeBtn.textContent = isDarkMode
    ? "☀️ 明るくする"
    : "🌙 ダーク";
}

exportJsonBtn.addEventListener("click", () => {
  const backupData = {
    records: studyRecords,
    goals,
    subjects: studySubjects,
    darkMode: isDarkMode
  };

  downloadFile(
    JSON.stringify(backupData, null, 2),
    "study-time-backup.json",
    "application/json"
  );
});

exportCsvBtn.addEventListener("click", () => {
  const header = [
    "日付",
    "時刻",
    "科目",
    "勉強時間（分）",
    "勉強時間",
    "メモ"
  ];

  const rows = studyRecords
    .slice()
    .sort((a, b) => {
      return `${a.date} ${a.time}`.localeCompare(
        `${b.date} ${b.time}`
      );
    })
    .map((record) => {
      return [
        record.date,
        record.time,
        record.subject,
        record.minutes,
        formatTime(record.minutes),
        record.memo || ""
      ];
    });

  const csv = [header, ...rows]
    .map((row) => {
      return row
        .map((value) => {
          const text = String(value).replace(
            /"/g,
            '""'
          );

          return `"${text}"`;
        })
        .join(",");
    })
    .join("\r\n");

  downloadFile(
    `\uFEFF${csv}`,
    "study-time-records.csv",
    "text/csv;charset=utf-8"
  );
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!Array.isArray(data.records)) {
        throw new Error();
      }

      const result = confirm(
        "今ある記録を、読み込むバックアップで置き換えますか？"
      );

      if (!result) {
        return;
      }

      studyRecords = data.records;
      goals = data.goals || goals;
      studySubjects = data.subjects || studySubjects;
      isDarkMode = Boolean(data.darkMode);

      studyRecords.forEach((record) => {
        if (!record.id) {
          record.id = createId();
        }

        if (!record.memo) {
          record.memo = "";
        }

        if (!studySubjects.includes(record.subject)) {
          studySubjects.push(record.subject);
        }
      });

      weekdayGoal.value = goals.weekdayHours;
      weekendGoal.value = goals.weekendHours;

      saveRecords();
      saveGoals();
      saveSubjects();

      applyTheme();
      renderAll();

      alert("バックアップを読み込みました！");
    } catch {
      alert("読み込めないファイルです。");
    }
  };

  reader.readAsText(file);

  event.target.value = "";
});

saveRecords();
saveGoals();
saveSubjects();

applyTheme();
renderAll();

/* =========================
   ホーム画面の表示
   ========================= */

function updateHomeScreen() {
  const homeTodayTotal =
    document.getElementById("homeTodayTotal");

  const homeWeekTotal =
    document.getElementById("homeWeekTotal");

  const homeGoalTotal =
    document.getElementById("homeGoalTotal");

  const homeProgressFill =
    document.getElementById("homeProgressFill");

  const homeProgressText =
    document.getElementById("homeProgressText");

  if (!homeTodayTotal) {
    return;
  }

  const today = getTodayString();

  const todayMinutes =
    getMinutesForDate(today);

  let weekMinutes = 0;

  studyRecords.forEach((record) => {
    if (isSameWeek(record.date, today)) {
      weekMinutes += record.minutes;
    }
  });

  const goalMinutes =
    getGoalMinutes(today);

  homeTodayTotal.textContent =
    formatTime(todayMinutes);

  homeWeekTotal.textContent =
    formatTime(weekMinutes);

  homeGoalTotal.textContent =
    formatTime(goalMinutes);

  if (goalMinutes > 0) {
    const percent =
      Math.round(
        (todayMinutes / goalMinutes) * 100
      );

    homeProgressFill.style.width =
      `${Math.min(percent, 100)}%`;

    homeProgressText.textContent =
      `目標達成率 ${percent}%`;
  } else {
    homeProgressFill.style.width = "0%";
    homeProgressText.textContent =
      "今日の目標は設定されていません";
  }
}
// =========================
// Service Worker の登録
// =========================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("Service Worker 登録成功");
      })
      .catch((error) => {
        console.error("Service Worker 登録失敗:", error);
      });
  });
}