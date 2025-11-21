window.dummyData = {
  // ...existing code...
  Tuesday: [
    { course: "GED0083", time: "1:00 PM - 3:40 PM", subject: "COLLEGE PHYSICS 2 LECTURE", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_ZGFkZTBmMWEtMmFiMy00NTg1LTk1ZWMtODRhM2E3MmM0NDY2%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%2522b57b872c-4427-46ef-b3d2-1b4e92c52d71%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=f4495a75-1d49-400a-8af4-66956e75b9a0&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" },
    { course: "IT0035", time: "4:00 PM – 6:40 PM", subject: "APPLIED OPERATING SYSTEM", room: "ONLINE", link: "https://l.facebook.com/l.php?u=https%3A%2F%2Fteams.microsoft.com%2Fl%2Fmeetup-join%2F19%253ameeting_MzA4MDFiMWYtNzdkNS00YmNkLTgzZDYtZTA2NDg2MGZmNWEx%2540thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%25226f2ee35d-8307-47c2-a414-c3d01ff39cef%2522%257d&h=AT1Q7_vbFlIGbbmWdAGITYXknVblABgxviwIsxTzCTUVj7vweKtx9nXNGX_ZQoF8UAtHfidPs5CPEiIUMPM0GZdNZZqzdRu2LbWAKZ6fG8xYHJCZTWHWTRon34tRp0w&s=1" }
  ],
  Wednesday: [
    { course: "IT0037", time: "7:00 AM – 8:50 AM", subject: "SYSTEM ANALYSIS AND DESIGN", room: "FTIC Presentation Room 2", links: [
      { url: "https://docs.google.com/forms/d/e/1FAIpQLSeSfeGBiVsKcD89OEyvHlMsPfv3R4UJBLF8dE3RaZJC2aL1zA/viewform", label: "Login" },
      { url: "https://docs.google.com/forms/d/e/1FAIpQLSc8yMpZ7lsLYwb6iFnSrkNRwMtKrQ2sFm5o3Yb5Mp9KnlmzDQ/viewform", label: "Logout" }
    ] },
    { course: "IT0093", time: "9:00 AM - 10:50 AM", subject: "MOBILE APPLICATION DEVELOPMENT 2", room: "F610" },
    { course: "IT0103", time: "1:00 PM - 3:50 PM", subject: "NETWORKING 3", room: "F1204" }
  ],
  Thursday: [
    { course: "IT0049", time: "7:00 AM - 8:50 AM", subject: "WEB SYSTEM TECHNOLOGIES", room: "F611" },
    { course: "IT0093", time: "9:00 AM - 10:50 AM", subject: "MOBILE APPLICATION DEVELOPMENT 2", room: "F1209" },
    { course: "GED0083L", time: "1:00 PM - 3:50 PM", subject: "COLLEGE PHYSICS 2 LABORATORY", room: "F1009" }
  ],
  Friday: [
  { course: "IT0037", time: "1:00 PM - 2:50 PM", subject: "SYSTEM ANALYSIS AND DESIGN", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fmeet%2F4737315926717%3Fp%3DsFYR5bVXD1vqFKcb35%26anon%3Dtrue&type=meet&deeplinkId=87264e9e-dacb-43e0-923a-598f483495f6&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" },
  { course: "IT0035L", time: "4:00 PM - 6:50 PM", subject: "APPLIED OPERATING SYSTEM LAB", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MzA4MDFiMWYtNzdkNS00YmNkLTgzZDYtZTA2NDg2MGZmNWEx%40thread.v2%2F0%3Fcontext%3D%257B%2522Tid%2522%253A%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252C%2522Oid%2522%253A%25226f2ee35d-8307-47c2-a414-c3d01ff39cef%2522%257D%26anon%3Dtrue&type=meetup-join&deeplinkId=076f0384-c34c-48fa-8390-52de2c8b3541&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" }
  ],
  Saturday: [
    { course: "IT0049", time: "11:00 AM - 12:50 PM", subject: "WEB SYSTEM TECHNOLOGIES", room: "F706" },
    { course: "IT0103", time: "1:00 PM - 2:50 PM", subject: "NETWORKING 3", room: "F1211" }
  ]
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

  const autoControl = document.getElementById('miniAutoControl')?.checked;

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
  const miniAuto = document.getElementById('miniAutoControl');
  miniAuto && miniAuto.addEventListener('change', renderMiniDashboard);
  // refresh mini dashboard every minute
  setInterval(renderMiniDashboard, 60 * 1000);
});