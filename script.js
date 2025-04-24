const dummyData = {
    Monday: [
      { course: "IT0079 ", time: "7:00 AM - 8:50 AM", subject: "IT SPECILIALIZATION 5 - MOBILE APPLICATION DEVELOPMENT 1" },
      { course: "CCS0043", time: "10:00 AM - 12:50 AM", subject: "APPLICATIONS DEVELOPMENT AND EMERGING TECHNOLOGIES (LAB)" },
      { course: "GED0031", time: "1:00 AM - 2:50 AM", subject: "PURPOSIVE COMMUNICATION" }
    ],
    Tuesday: [
      { course: 'CCS0043 <a href=https://l1nk.dev/CCS0043" target="_blank">Link</a>', time: "10:00 AM - 12:40 AM", subject: "APPLICATIONS DEVELOPMENT AND EMERGING TECHNOLOGIES (LEC) (CCS0043)" },
      { course: 'GED0081 <a href=https://acesse.one/N1Yeg" target="_blank">Link</a>', time: "1:00 AM - 3:40 AM", subject: "COLLEGE PHYSICS 1 LECTURE " }
    ],
    Wednesday: [
      { course: "CCS0103", time: "9:00 AM - 10:50 AM", subject: "TECHNOPRENEURSHIP (CCS) " },
      { course: "GED0081L", time: "1:00 AM - 3:50 AM", subject: "COLLEGE PHYSICS 1 LABORATORY" }
    ],
    Thursday: [
      { course: "IT0079", time: "7:00 AM - 8:50 AM", subject: "IT SPECILIALIZATION 5 - MOBILE APPLICATION DEVELOPMENT 1" },
      { course: "IT0087L", time: "7:00 AM - 8:50 AM", subject: "IT SPECIALIZATION 6 - BUSINESS PROCESS FOR COMPUTING SYSTEM (LAB)" },
      { course: "GED0031", time: "10:00 AM - 12:50 AM", subject: "PURPOSIVE COMMUNICATION" }
    ],
    Friday: [
      { course: "CCS0103", time: "8:00 AM - 9:00 AM", subject: "TECHNOPRENEURSHIP (CCS)" },
      { course: "IT0087", time: "9:00 AM - 10:00 AM", subject: "IT SPECIALIZATION 6 - BUSINESS PROCESS FOR COMPUTING SYSTEM (LEC)" }
    ]
  };
  
  function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
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
  
    const table = document.createElement("table");
    const tableHeader = `<tr><th>Course</th><th>Time</th><th>Subject</th></tr>`;
    let tableContent = tableHeader;
  
    for (let item of schedule) {
      tableContent += `<tr>
        <td>${item.course || "-"}</td>
        <td>${item.time}</td>
        <td>${item.subject}</td>
      </tr>`;
    }
  
    table.innerHTML = tableContent;
    scheduleDisplay.appendChild(table);
  }
  
  function checkForUpcomingSchedule(now) {
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextClassTime = null;
    let nextClass = null;
    let timeUntilNextClass = null;
    const currentDayIndex = now.getDay();  // Get current day index (1 = Monday, ..., 5 = Friday)
    
    // Convert to weekday name (i.e., 'Monday', 'Tuesday', etc.)
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
    let foundNextClass = false;
  
    // Loop through the days starting from the current day (Monday to Friday)
    for (let i = currentDayIndex - 1; i < 5; i++) {
      const dayName = daysOfWeek[i];  // Get current weekday name
      const schedule = dummyData[dayName];
      
      if (!schedule) continue; // Skip if no schedule for this day
  
      // Loop through the classes for the current day
      for (let item of schedule) {
        const [start, end] = item.time.split(" - ");
        const startTime = parseTime(start);
  
        // If it's the current day, find a class that starts in the future
        if (i === currentDayIndex - 1) {
          if (currentTime < startTime) {
            // Found a class for today
            nextClassTime = startTime;
            nextClass = item;
            foundNextClass = true;
            timeUntilNextClass = nextClassTime - currentTime;
            break;
          }
        } else {
          // If it's a future day, take the first class available
          if (!foundNextClass) {
            nextClassTime = startTime;
            nextClass = item;
            timeUntilNextClass = nextClassTime - currentTime;
            foundNextClass = true;
          }
        }
      }
  
      if (foundNextClass) break;  // Exit the loop as soon as we find the next class
    }
  
    // Display the countdown if a class is found
    if (nextClass && timeUntilNextClass !== null) {
      const hoursLeft = Math.floor(timeUntilNextClass / 60);
      const minutesLeft = timeUntilNextClass % 60;
      const secondsLeft = (timeUntilNextClass * 60) % 60;
  
      document.getElementById("alertMessage").textContent =
        `Your next class "${nextClass.subject}" starts in ${hoursLeft} hours ${minutesLeft} minutes and ${secondsLeft} seconds!`;
    } else {
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
  