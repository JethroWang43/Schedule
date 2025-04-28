const dummyData = {
  Monday: [
    { course: "IT0079", time: "7:00 AM - 8:50 AM", subject: "IT SPECILIALIZATION 5 - MOBILE APPLICATION DEVELOPMENT 1", room:"F1209"},
    { course: "CCS0043", time: "10:00 AM - 12:50 PM", subject: "APPLICATIONS DEVELOPMENT AND EMERGING TECHNOLOGIES (LAB)", room:"F1203"},
    { course: "GED0031", time: "1:00 PM - 2:50 PM", subject: "PURPOSIVE COMMUNICATION", room:"F611"}
  ],
  Tuesday: [
    { course: "CCS0043", time: "10:00 AM - 12:40 PM", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MGIzM2E4MTAtNDAzYS00YTQ0LWEyMzQtNzM2NTg3NDk1YmUw%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%2522585c148b-8c40-40e7-b10f-9c59dfa6a2dc%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=5f32498a-0a2f-402d-ba55-d6917c4c33f3&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true", subject: "APPLICATIONS DEVELOPMENT AND EMERGING TECHNOLOGIES (LEC)",room:"ONLINE"  },
    { course: "GED0081", time: "1:00 PM - 3:40 PM", link: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NmNhMzYzYWYtNTYyNS00MmYyLWEwOGYtZDE4MGExNzlhODYx%40thread.v2/0?context=%7b%22Tid%22%3a%22b0a025d9-cb88-4408-9b15-ce77d47c3810%22%2c%22Oid%22%3a%226ded454d-9b2c-49ae-ac87-51e18b0924d2%22%7d", subject: "COLLEGE PHYSICS 1 LECTURE",room:"ONLINE" }
  ],
  Wednesday: [
    { course: "CCS0103", time: "9:00 AM - 10:50 AM", subject: "TECHNOPRENEURSHIP (CCS)" ,room:"FITC LOUNGE"},
    { course: "GED0081L", time: "1:00 PM - 3:50 PM", subject: "COLLEGE PHYSICS 1 LABORATORY" ,room:"F1009"}
  ],
  Thursday: [
    { course: "IT0079", time: "7:00 AM - 8:50 AM", subject: "IT SPECILIALIZATION 5 - MOBILE APPLICATION DEVELOPMENT 1",room:"F1209" },
    { course: "IT0087L", time: "10:00 AM - 12:50 PM", subject: "IT SPECIALIZATION 6 - BUSINESS PROCESS FOR COMPUTING SYSTEM (LAB)",room:"F1211" },
    { course: "GED0031", time: "1:00 PM - 2:50 PM", subject: "PURPOSIVE COMMUNICATION",room:"F611" }
  ],
  Friday: [
    { course: "CCS0103", time: "7:00 AM - 8:50 AM", subject: "TECHNOPRENEURSHIP (CCS)",room:"ONLINE" },
    { course: "IT0087", time: "10:00 AM - 12:40 PM", subject: "IT SPECIALIZATION 6 - BUSINESS PROCESS FOR COMPUTING SYSTEM (LEC)",room:"ONLINE" }
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