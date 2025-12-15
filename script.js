window.dummyData = {
  Monday: [
    { course: "IT0023", time: "11:00 AM - 12:50 PM", subject: "SYSTEM INTEGRATION AND ARCHITECTURE 1", room: "E408" },
    { course: "IT0039", time: "01:00 PM - 02:50 PM", subject: "IT PROJECT MANAGEMENT", room: "FTIC Project Room (CCS)" }
  ],
  Tuesday: [
    { course: "IT0051", time: "07:00 AM - 08:50 AM", subject: "IT ELECTIVE - HUMAN COMPUTER INTERACTION 2", room: "ONLINE" },
    { course: "IT0039", time: "09:00 AM - 10:50 AM", subject: "IT PROJECT MANAGEMENT", room: "ONLINE" },
    { course: "IT0041", time: "01:00 PM - 02:50 PM", subject: "E-COMMERCE WITH DIGITAL MARKETING", room: "ONLINE" }
  ],
  Wednesday: [
    { course: "IT0051", time: "07:00 AM - 08:50 AM", subject: "IT ELECTIVE - HUMAN COMPUTER INTERACTION 2", room: "F1207" },
    { course: "IT0123", time: "09:00 AM - 11:50 AM", subject: "IT SPECIALISATION 7 - DEVELOPMENT NETWORK", room: "E414" },
    { course: "IT0041", time: "01:00 PM - 02:50 PM", subject: "E-COMMERCE WITH DIGITAL MARKETING", room: "E407" }
  ],
  Thursday: [
    { course: "IT0047", time: "09:00 AM - 10:50 AM", subject: "IT ELECTIVE - COMPUTER SYSTEMS AND PLATFORM TECHNOLOGIES", room: "F503" },
    { course: "IT0047", time: "11:00 AM - 12:50 PM", subject: "IT ELECTIVE - COMPUTER SYSTEMS AND PLATFORM TECHNOLOGIES", room: "F706" }
  ],
  Friday: [
    { course: "IT0023", time: "09:00 AM - 10:50 AM", subject: "SYSTEM INTEGRATION AND ARCHITECTURE 1", room: "ONLINE" },
    { course: "IT0123", time: "11:00 AM - 12:50 PM", subject: "IT SPECIALISATION 7 - DEVELOPMENT NETWORK", room: "ONLINE" }
  ],
  Saturday: []
};
  
  function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString(undefined, { hour12: true }); // 12-hour format
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
  
    const schedule = dummyData[day];
    if (!schedule || schedule.length === 0) {
      scheduleDisplay.textContent = `No schedule available for ${day}`;
      return;
    }
  
    // Check if all classes for the day are online
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
      tableContent += `<tr>
        <td>${item.course || "-"}</td>
        <td>${item.time}${linksHtml}</td>
        <td>${item.subject}</td>
      </tr>`;
    }

    table.innerHTML = tableContent;
    scheduleDisplay.appendChild(table);
  }
  
  function checkForUpcomingSchedule(now) {
    const currentDayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
    // Only skip Sunday
    if (currentDayIndex === 0) {
      document.getElementById('next-schedule').textContent = 'No classes today!';
      return;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextClassTime = null;
    let nextClass = null;
    let timeUntilNextClass = null;

    // Include Saturday
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let foundNextClass = false;

    // Adjust loop to include Saturday
    for (let i = currentDayIndex - 1; i < daysOfWeek.length; i++) {
      const dayName = daysOfWeek[i];
      const schedule = dummyData[dayName];

      if (!schedule) continue;

      for (let item of schedule) {
        const [start, end] = item.time.split(" - ");
        const startTime = parseTime(start);

        if (i === currentDayIndex - 1 && startTime <= currentTime) {
          // If class already started or passed, skip
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
      document.getElementById('next-schedule').textContent = 
        `Room no: ${nextClass.room}`;

      // Display the countdown if a class is found
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
    a.download = "tasks.txt";  // Name of the file
    a.click();
  
    URL.revokeObjectURL(url);
  }
  
  const buttons = document.querySelectorAll('.dy');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
  
      // Add 'active' class to the clicked button
      button.classList.add('active');
  
      // Get the day from data attribute
      const day = button.getAttribute('data-day');
  
      // Do your showSchedule logic here
      console.log("Showing schedule for", day);
    });
  });

// ----------------- Mini Dashboard for index.html -----------------
const MINI_TASKS_KEY = 'sw_tasks_v1';

function loadTasksForMini() {
  try { return JSON.parse(localStorage.getItem(MINI_TASKS_KEY) || '[]'); } catch(e) { return []; }
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

  const autoControl = false;

  for (let t of upcoming) {
    const li = document.createElement('li');
    li.className = 'mini-dashboard-item';
    const when = t.time ? `${t.date} ${t.time}` : t.date;
    li.innerHTML = `<div><strong>${t.title}</strong> <span class="muted">(${t.category})</span><br><small>${when}</small></div>`;

    const actions = document.createElement('div');
    actions.className = 'mini-actions';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = t.completed ? 'Undo' : 'Done';
    doneBtn.onclick = () => { toggleCompleteMini(t.id); };

    const controlBtn = document.createElement('button');
    controlBtn.textContent = 'Take Control';
    controlBtn.className = 'take-control-mini';
    controlBtn.onclick = () => { takeControlMini(t.id); };

    actions.appendChild(doneBtn);
    actions.appendChild(controlBtn);
    li.appendChild(actions);

    const diffMs = t.dt - now;
    const diffHours = diffMs / (1000*60*60);
    if (diffHours <= 24 && diffHours >= 0) {
      const warn = document.createElement('span');
      warn.className = 'mini-warning';
      warn.textContent = 'Due soon';
      li.appendChild(warn);
      if (autoControl) li.classList.add('needs-control');
    }
    if (diffHours < 0) {
      const overdue = document.createElement('span');
      overdue.className = 'mini-warning overdue';
      overdue.textContent = 'Overdue';
      li.appendChild(overdue);
      if (autoControl) takeControlMini(t.id);
    }

    ul.appendChild(li);
  }

  // show selected date if available
  const sel = document.getElementById('miniSelectedDate');
  try {
    const sd = localStorage.getItem('sw_selected_date') || 'None';
    if (sel) sel.textContent = sd;
  } catch(e) { if (sel) sel.textContent = 'None'; }
}

function toggleCompleteMini(id) {
  const tasks = loadTasksForMini();
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.status = t.completed ? 'done' : 'scheduled';
  localStorage.setItem(MINI_TASKS_KEY, JSON.stringify(tasks));
  renderMiniDashboard();
}

function takeControlMini(id) {
  const tasks = loadTasksForMini();
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.status = 'in-progress';
  localStorage.setItem(MINI_TASKS_KEY, JSON.stringify(tasks));
  renderMiniDashboard();
  alert(`Taking control of task: ${t.title}`);
}

document.addEventListener('DOMContentLoaded', () => {
  renderMiniDashboard();
  // refresh mini dashboard every minute
  setInterval(renderMiniDashboard, 60 * 1000);
});