const dummyData = {
  // ...existing code...
  Tuesday: [
    { course: "GED0083", time: "1:00 PM - 3:40 PM", subject: "COLLEGE PHYSICS 2 LECTURE", room: "ONLINE" },
    { course: "IT0035", time: "4:00 PM - 6:40 PM", subject: "APPLIED OPERATING SYSTEM", room: "ONLINE" }
  ],
  Wednesday: [
    { course: "IT0037", time: "7:00 AM - 8:50 AM", subject: "SYSTEM ANALYSIS AND DESIGN", room: "FTIC Presentation Room 2" },
    { course: "IT0093", time: "9:00 AM - 10:50 AM", subject: "MOBILE APPLICATION DEVELOPMENT 2", room: "F610" },
    { course: "IT0103", time: "1:00 PM - 3:50 PM", subject: "NETWORKING 3", room: "F1204" }
  ],
  Thursday: [
    { course: "IT0049", time: "7:00 AM - 8:50 AM", subject: "WEB SYSTEM TECHNOLOGIES", room: "F611" },
    { course: "IT0093", time: "9:00 AM - 10:50 AM", subject: "MOBILE APPLICATION DEVELOPMENT 2", room: "F1209" },
    { course: "GED0083L", time: "1:00 PM - 3:50 PM", subject: "COLLEGE PHYSICS 2 LABORATORY", room: "F1009" }
  ],
  Friday: [
    { course: "IT0037", time: "1:00 PM - 2:50 PM", subject: "SYSTEM ANALYSIS AND DESIGN", room: "ONLINE" },
    { course: "IT0035L", time: "4:00 PM - 6:50 PM", subject: "APPLIED OPERATING SYSTEM LAB", room: "ONLINE" }
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
      tableContent += `<tr>
        <td>${item.course || "-"}</td>
        <td>${item.time} ${item.link ? `<a href="${item.link}" target="_blank">Link</a>` : ""}</td>
        <td>${item.subject}</td>
      </tr>`;
    }

    table.innerHTML = tableContent;
    scheduleDisplay.appendChild(table);
  }
  
  function checkForUpcomingSchedule(now) {
    const currentDayIndex = now.getDay(); // 0 = Sunday
    if (currentDayIndex === 0 || currentDayIndex > 5) {
      document.getElementById('next-schedule').textContent = 'No classes today!';
      return;
    }
  
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextClassTime = null;
    let nextClass = null;
    let timeUntilNextClass = null;
  
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
    let foundNextClass = false;
  
    for (let i = currentDayIndex - 1; i < 5; i++) {
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