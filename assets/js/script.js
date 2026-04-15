// Home page script
function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString(undefined, { hour12: true });
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });

  document.getElementById('date').textContent = `Date: ${date}`;
  document.getElementById('time').textContent = `Time: ${time}`;
  document.getElementById('day').textContent = `Day: ${day}`;

  checkForUpcomingSchedule(now);
}

setInterval(updateDateTime, 1000);
window.onload = updateDateTime;

function showSchedule(day) {
  const scheduleDisplay = document.getElementById("scheduleDisplay");
  scheduleDisplay.innerHTML = "";

  const schedule = getSchedule()[day];
  if (!schedule || schedule.length === 0) {
    scheduleDisplay.textContent = `No schedule available for ${day}`;
    return;
  }

  let isOnline = schedule.every(item => item.room && item.room.toUpperCase() === "ONLINE");
  let description = isOnline ? "All classes are ONLINE" : "All classes are ONSITE";

  const descElem = document.createElement("p");
  descElem.textContent = description;
  descElem.style.fontWeight = "bold";
  descElem.style.marginBottom = "10px";
  scheduleDisplay.appendChild(descElem);

  const table = document.createElement("table");
  const tableHeader = `<tr><th>Course</th><th>Time</th><th>Subject</th></tr>`;
  let tableContent = tableHeader;

  for (let item of schedule) {
    let linksHtml = "";
    if (item.link) {
      linksHtml += ` <a href="${item.link}" target="_blank">Link</a>`;
    }
    if (item.links && Array.isArray(item.links)) {
      linksHtml += item.links.map(l => ` <a href="${l.url}" target="_blank">${l.label}</a>`).join("");
    }
    tableContent += `<tr><td>${item.course || "-"}</td><td>${item.time}${linksHtml}</td><td>${item.subject}</td></tr>`;
  }

  table.innerHTML = tableContent;
  scheduleDisplay.appendChild(table);
}

function checkForUpcomingSchedule(now) {
  const currentDayIndex = now.getDay();
  if (currentDayIndex === 0) {
    document.getElementById('next-schedule').textContent = 'No classes today!';
    return;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  let nextClassTime = null;
  let nextClass = null;
  let timeUntilNextClass = null;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let foundNextClass = false;

  for (let i = currentDayIndex - 1; i < daysOfWeek.length; i++) {
    const dayName = daysOfWeek[i];
    const schedule = getSchedule()[dayName];

    if (!schedule) continue;

    for (let item of schedule) {
      const [start, end] = item.time.split(" - ");
      const startTime = parseTime(start);

      if (i === currentDayIndex - 1 && startTime <= currentTime) {
        continue;
      }

      if (!foundNextClass || startTime < nextClassTime) {
        nextClassTime = startTime;
        nextClass = item;
        timeUntilNextClass = (i === currentDayIndex - 1 ? startTime - currentTime : startTime);
        foundNextClass = true;
      }
    }

    if (foundNextClass) break;
  }

  if (foundNextClass) {
    document.getElementById('next-schedule').textContent = `Room no: ${nextClass.room}`;
    if (timeUntilNextClass !== null) {
      const hoursLeft = Math.floor(timeUntilNextClass / 60);
      const minutesLeft = timeUntilNextClass % 60;
      document.getElementById("alertMessage").textContent =
        `Your next class "${nextClass.subject}" starts in ${hoursLeft} hours and ${minutesLeft} minutes.`;
    }
  } else {
    document.getElementById('next-schedule').textContent = 'No more classes today!';
    document.getElementById("alertMessage").textContent = "Hello, User! No upcoming class.";
  }
}

function parseTime(timeStr) {
  const [time, period] = timeStr.trim().split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes;
}

function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  const span = document.createElement("span");
  span.textContent = taskText;
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete";
  removeBtn.onclick = () => li.remove();

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(removeBtn);

  document.getElementById("taskList").appendChild(li);
  input.value = "";
}

function downloadTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li span").forEach(span => {
    tasks.push(span.textContent);
  });

  const blob = new Blob([tasks.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.txt";
  a.click();

  URL.revokeObjectURL(url);
}

const MINI_TASKS_KEY = 'sw_tasks_v1';

function loadTasksForMini() {
  try {
    return JSON.parse(localStorage.getItem(MINI_TASKS_KEY) || '[]');
  } catch(e) {
    return [];
  }
}

function renderMiniDashboard() {
  const ul = document.getElementById('miniUpcomingList');
  if (!ul) return;
  ul.innerHTML = '';
  const tasks = loadTasksForMini();
  const now = new Date();
  const upcoming = tasks
    .filter(t => !t.completed)
    .map(t => ({...t, dt: new Date(t.date + (t.time ? 'T' + t.time : 'T00:00'))}))
    .sort((a,b) => a.dt - b.dt)
    .slice(0, 5);

  for (let item of upcoming) {
    const li = document.createElement('li');
    li.className = 'mini-dashboard-item';
    const when = item.time ? `${item.date} ${item.time}` : item.date;
    li.innerHTML = `<div><strong>${item.title}</strong> <span class="muted">(${item.category})</span><br><small>${when}</small></div>`;

    const actions = document.createElement('div');
    actions.className = 'mini-actions';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = item.completed ? 'Undo' : 'Done';
    doneBtn.onclick = () => { toggleCompleteMini(item.id); };

    const controlBtn = document.createElement('button');
    controlBtn.textContent = 'Take Control';
    controlBtn.className = 'take-control-mini';
    controlBtn.onclick = () => { takeControlMini(item.id); };

    actions.appendChild(doneBtn);
    actions.appendChild(controlBtn);
    li.appendChild(actions);

    const diffMs = item.dt - now;
    const diffHours = diffMs / (1000*60*60);
    if (diffHours <= 24 && diffHours >= 0) {
      const warn = document.createElement('span');
      warn.className = 'mini-warning';
      warn.textContent = 'Due soon';
      li.appendChild(warn);
    }
    if (diffHours < 0) {
      const overdue = document.createElement('span');
      overdue.className = 'mini-warning overdue';
      overdue.textContent = 'Overdue';
      li.appendChild(overdue);
    }

    ul.appendChild(li);
  }

  const sel = document.getElementById('miniSelectedDate');
  try {
    const sd = localStorage.getItem('sw_selected_date') || 'None';
    if (sel) sel.textContent = sd;
  } catch(e) {
    if (sel) sel.textContent = 'None';
  }
}

function toggleCompleteMini(id) {
  const tasks = loadTasksForMini();
  const task = tasks.find(x => x.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.status = task.completed ? 'done' : 'scheduled';
  localStorage.setItem(MINI_TASKS_KEY, JSON.stringify(tasks));
  renderMiniDashboard();
}

function takeControlMini(id) {
  const tasks = loadTasksForMini();
  const task = tasks.find(x => x.id === id);
  if (!task) return;
  task.status = 'in-progress';
  localStorage.setItem(MINI_TASKS_KEY, JSON.stringify(tasks));
  renderMiniDashboard();
  alert('Taking control of task: ' + task.title);
}

document.addEventListener('DOMContentLoaded', function() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const dropdown = document.getElementById('dayDropdown');
  if (dropdown) {
    for (let i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].value === today) {
        dropdown.selectedIndex = i;
        dropdown.dispatchEvent(new Event('change'));
        break;
      }
    }
  }

  renderMiniDashboard();
  setInterval(renderMiniDashboard, 60 * 1000);

  const motivations = [
    "Keep pushing forward!",
    "You are capable of amazing things.",
    "Every day is a new opportunity.",
    "Stay positive, work hard, make it happen.",
    "Success is the sum of small efforts repeated.",
    "Believe in yourself and all that you are.",
    "Dream big and dare to fail.",
    "Your only limit is your mind.",
    "Great things never come from comfort zones.",
    "Don't watch the clock; do what it does. Keep going."
  ];
  const footer = document.querySelector('footer');
  if (footer) {
    let msg = motivations[Math.floor(Math.random() * motivations.length)];
    let motElem = document.createElement('div');
    motElem.textContent = msg;
    motElem.style.marginBottom = '0.5rem';
    motElem.style.fontWeight = 'bold';
    motElem.style.fontSize = '1.1rem';
    motElem.style.textAlign = 'center';
    footer.insertBefore(motElem, footer.firstChild);
  }
});
