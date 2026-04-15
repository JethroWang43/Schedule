// Schedule Editor Page - edit.js

let currentScheduleEditorTab = 'scheduleFormTab';
let currentSavedScheduleDay = 'Monday';

function toInputTime(time12h) {
  if (!time12h || typeof time12h !== 'string') return '';
  const [time, period] = time12h.trim().split(' ');
  if (!time || !period) return '';
  const [hoursText, minutesText] = time.split(':');
  let hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function setScheduleTab(editor, targetId) {
  currentScheduleEditorTab = targetId;

  editor.querySelectorAll('.schedule-tab').forEach(button => {
    const active = button.getAttribute('data-target') === targetId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  editor.querySelectorAll('.schedule-tab-panel').forEach(panel => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });
}

function openScheduleEditModal(day, index, item) {
  const modal = document.getElementById('scheduleEditModal');
  if (!modal || !item) return;

  const [startTime12h = '', endTime12h = ''] = String(item.time || '').split(' - ');

  document.getElementById('scheduleModalDayInput').value = day;
  document.getElementById('scheduleModalCourseInput').value = item.course || '';
  document.getElementById('scheduleModalSubjectInput').value = item.subject || '';
  document.getElementById('scheduleModalRoomInput').value = item.room || '';
  document.getElementById('scheduleModalStartTimeInput').value = toInputTime(startTime12h);
  document.getElementById('scheduleModalEndTimeInput').value = toInputTime(endTime12h);
  document.getElementById('scheduleModalLinkInput').value = item.link || '';
  document.getElementById('scheduleModalEditDayInput').value = day;
  document.getElementById('scheduleModalEditIndexInput').value = String(index);

  modal.hidden = false;
  modal.classList.add('open');
}

function closeScheduleEditModal() {
  const modal = document.getElementById('scheduleEditModal');
  const form = document.getElementById('scheduleModalForm');
  if (!modal) return;

  if (form) form.reset();
  modal.classList.remove('open');
  modal.hidden = true;
}

function renderScheduleEditor(activeTab = currentScheduleEditorTab) {
  const editor = document.getElementById('scheduleEditor');
  if (!editor) return;

  const schedule = getSchedule();
  currentScheduleEditorTab = activeTab;

  if (!WEEK_DAYS.includes(currentSavedScheduleDay)) {
    currentSavedScheduleDay = WEEK_DAYS[0];
  }

  editor.innerHTML = `
    <div class="schedule-tabs" role="tablist" aria-label="Schedule editor tabs">
      <button type="button" class="schedule-tab ${activeTab === 'scheduleFormTab' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'scheduleFormTab' ? 'true' : 'false'}" aria-controls="scheduleFormTab" id="scheduleFormTabBtn" data-target="scheduleFormTab">Add Class</button>
      <button type="button" class="schedule-tab ${activeTab === 'scheduleSavedTab' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'scheduleSavedTab' ? 'true' : 'false'}" aria-controls="scheduleSavedTab" id="scheduleSavedTabBtn" data-target="scheduleSavedTab">Saved Classes</button>
    </div>

    <section id="scheduleFormTab" class="schedule-tab-panel ${activeTab === 'scheduleFormTab' ? 'active' : ''}" role="tabpanel" aria-labelledby="scheduleFormTabBtn" ${activeTab === 'scheduleFormTab' ? '' : 'hidden'}>
      <div class="schedule-editor-card">
        <div class="schedule-editor-header">
          <h3>My Schedule</h3>
          <button type="button" id="restoreDefaultScheduleBtn" class="schedule-secondary-btn">Restore Default</button>
        </div>
        <form id="scheduleEditorForm" class="schedule-editor-form">
          <label>
            Day
            <select id="scheduleDayInput" required>
              ${WEEK_DAYS.map(day => `<option value="${day}">${day}</option>`).join('')}
            </select>
          </label>
          <label>
            Course Code
            <input type="text" id="scheduleCourseInput" placeholder="IT0000" required />
          </label>
          <label>
            Subject
            <input type="text" id="scheduleSubjectInput" placeholder="Subject name" required />
          </label>
          <label>
            Room
            <input type="text" id="scheduleRoomInput" placeholder="Room or ONLINE" required />
          </label>
          <div class="schedule-editor-time-row">
            <label>
              Start Time
              <input type="time" id="scheduleStartTimeInput" required />
            </label>
            <label>
              End Time
              <input type="time" id="scheduleEndTimeInput" required />
            </label>
          </div>
          <label>
            Meeting Link (optional)
            <input type="url" id="scheduleLinkInput" placeholder="https://..." />
          </label>
          <button type="submit" class="schedule-primary-btn">Add Class</button>
        </form>
      </div>
    </section>

    <section id="scheduleSavedTab" class="schedule-tab-panel ${activeTab === 'scheduleSavedTab' ? 'active' : ''}" role="tabpanel" aria-labelledby="scheduleSavedTabBtn" ${activeTab === 'scheduleSavedTab' ? '' : 'hidden'}>
      <div class="schedule-list-card">
        <div class="schedule-list-header">
          <h3>Saved Classes</h3>
          <label class="schedule-filter-label" for="scheduleSavedDaySelect">
            <span class="visually-hidden">Day</span>
            <select id="scheduleSavedDaySelect" class="schedule-saved-day-select">
              ${WEEK_DAYS.map(day => `<option value="${day}" ${day === currentSavedScheduleDay ? 'selected' : ''}>${day}</option>`).join('')}
            </select>
          </label>
        </div>

        ${(() => {
          const entries = schedule[currentSavedScheduleDay] || [];
          const items = entries.length
            ? entries.map((item, index) => `
                <li>
                  <div class="schedule-item-text">
                    <strong>${item.course}</strong>
                    <span>${item.time}</span>
                    <span>${item.subject}</span>
                    <small>${item.room}</small>
                  </div>
                  <div class="schedule-item-actions">
                    <button type="button" class="schedule-edit-btn" data-day="${currentSavedScheduleDay}" data-index="${index}">Edit</button>
                    <button type="button" class="schedule-delete-btn" data-day="${currentSavedScheduleDay}" data-index="${index}">Delete</button>
                  </div>
                </li>
              `).join('')
            : '<li class="schedule-empty">No saved classes for this day yet.</li>';

          return `
            <section class="schedule-day-group">
              <h4>${currentSavedScheduleDay}</h4>
              <ul>${items}</ul>
            </section>
          `;
        })()}
      </div>
    </section>

    <div id="scheduleEditModal" class="schedule-modal" hidden>
      <div class="schedule-modal-backdrop" data-close="1"></div>
      <div class="schedule-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="scheduleModalTitle">
        <div class="schedule-modal-header">
          <h3 id="scheduleModalTitle">Edit Class</h3>
          <button type="button" class="schedule-modal-close" id="scheduleModalCloseBtn" aria-label="Close">&times;</button>
        </div>
        <form id="scheduleModalForm" class="schedule-editor-form schedule-modal-form">
          <label>
            Day
            <select id="scheduleModalDayInput" required>
              ${WEEK_DAYS.map(day => `<option value="${day}">${day}</option>`).join('')}
            </select>
          </label>
          <label>
            Course Code
            <input type="text" id="scheduleModalCourseInput" placeholder="IT0000" required />
          </label>
          <label>
            Subject
            <input type="text" id="scheduleModalSubjectInput" placeholder="Subject name" required />
          </label>
          <label>
            Room
            <input type="text" id="scheduleModalRoomInput" placeholder="Room or ONLINE" required />
          </label>
          <div class="schedule-editor-time-row">
            <label>
              Start Time
              <input type="time" id="scheduleModalStartTimeInput" required />
            </label>
            <label>
              End Time
              <input type="time" id="scheduleModalEndTimeInput" required />
            </label>
          </div>
          <label>
            Meeting Link (optional)
            <input type="url" id="scheduleModalLinkInput" placeholder="https://..." />
          </label>
          <input type="hidden" id="scheduleModalEditDayInput" />
          <input type="hidden" id="scheduleModalEditIndexInput" />
          <div class="schedule-editor-actions">
            <button type="submit" class="schedule-primary-btn">Update Class</button>
            <button type="button" class="schedule-secondary-btn" id="scheduleModalCancelBtn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('scheduleEditorForm');
  const restoreButton = document.getElementById('restoreDefaultScheduleBtn');
  const modalForm = document.getElementById('scheduleModalForm');
  const modalCloseButton = document.getElementById('scheduleModalCloseBtn');
  const modalCancelButton = document.getElementById('scheduleModalCancelBtn');
  const modal = document.getElementById('scheduleEditModal');

  if (form) {
    form.addEventListener('submit', handleScheduleEditorSubmit);
  }

  if (modalForm) {
    modalForm.addEventListener('submit', handleScheduleModalSubmit);
  }

  if (restoreButton) {
    restoreButton.addEventListener('click', restoreDefaultSchedule);
  }

  const savedDaySelect = document.getElementById('scheduleSavedDaySelect');
  if (savedDaySelect) {
    savedDaySelect.addEventListener('change', () => {
      currentSavedScheduleDay = savedDaySelect.value;
      renderScheduleEditor('scheduleSavedTab');
    });
  }

  editor.querySelectorAll('.schedule-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setScheduleTab(editor, tab.getAttribute('data-target'));
    });
  });

  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeScheduleEditModal);
  }

  if (modalCancelButton) {
    modalCancelButton.addEventListener('click', closeScheduleEditModal);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.getAttribute('data-close') === '1') {
        closeScheduleEditModal();
      }
    });
  }

  editor.querySelectorAll('.schedule-edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      const day = button.getAttribute('data-day');
      const index = Number(button.getAttribute('data-index'));
      const scheduleData = getSchedule();
      const item = scheduleData[day]?.[index];
      if (!item || Number.isNaN(index)) return;

      openScheduleEditModal(day, index, item);
    });
  });

  editor.querySelectorAll('.schedule-delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const day = button.getAttribute('data-day');
      const index = Number(button.getAttribute('data-index'));
      const scheduleData = getSchedule();
      if (!scheduleData[day] || Number.isNaN(index)) return;

      scheduleData[day].splice(index, 1);
      saveSchedule(scheduleData);
      currentSavedScheduleDay = day;
      renderScheduleEditor();
    });
  });
}

function handleScheduleEditorSubmit(event) {
  event.preventDefault();

  const day = document.getElementById('scheduleDayInput').value;
  const course = document.getElementById('scheduleCourseInput').value.trim();
  const subject = document.getElementById('scheduleSubjectInput').value.trim();
  const room = document.getElementById('scheduleRoomInput').value.trim();
  const startTime = document.getElementById('scheduleStartTimeInput').value;
  const endTime = document.getElementById('scheduleEndTimeInput').value;
  const link = document.getElementById('scheduleLinkInput').value.trim();

  if (!course || !subject || !room || !startTime || !endTime) {
    alert('Please complete the day, course, subject, room, start time, and end time.');
    return;
  }

  const schedule = getSchedule();
  const entry = {
    course,
    time: `${formatTimeInput(startTime)} - ${formatTimeInput(endTime)}`,
    subject,
    room
  };

  if (link) {
    entry.link = link;
  }

  schedule[day].push(entry);
  saveSchedule(schedule);
  renderScheduleEditor();
  event.target.reset();
  document.getElementById('scheduleDayInput').value = day;
}

function handleScheduleModalSubmit(event) {
  event.preventDefault();

  const day = document.getElementById('scheduleModalDayInput').value;
  const course = document.getElementById('scheduleModalCourseInput').value.trim();
  const subject = document.getElementById('scheduleModalSubjectInput').value.trim();
  const room = document.getElementById('scheduleModalRoomInput').value.trim();
  const startTime = document.getElementById('scheduleModalStartTimeInput').value;
  const endTime = document.getElementById('scheduleModalEndTimeInput').value;
  const link = document.getElementById('scheduleModalLinkInput').value.trim();
  const editDay = document.getElementById('scheduleModalEditDayInput').value;
  const editIndex = Number(document.getElementById('scheduleModalEditIndexInput').value);

  if (!course || !subject || !room || !startTime || !endTime) {
    alert('Please complete the day, course, subject, room, start time, and end time.');
    return;
  }

  const schedule = getSchedule();
  const entry = {
    course,
    time: `${formatTimeInput(startTime)} - ${formatTimeInput(endTime)}`,
    subject,
    room
  };

  if (link) {
    entry.link = link;
  }

  if (!editDay || Number.isNaN(editIndex) || !schedule[editDay]?.[editIndex]) {
    return;
  }

  schedule[editDay].splice(editIndex, 1);
  if (day === editDay) {
    schedule[day].splice(editIndex, 0, entry);
  } else {
    schedule[day].push(entry);
  }

  saveSchedule(schedule);
  closeScheduleEditModal();
  currentSavedScheduleDay = day;
  renderScheduleEditor('scheduleSavedTab');
}

function restoreDefaultSchedule() {
  if (!confirm('Restore the default schedule and remove your saved changes?')) return;

  // Force clear all old data
  localStorage.removeItem('sw_schedule_v1');
  localStorage.removeItem('sw_schedule_version');
  
  // Save fresh default schedule
  saveSchedule(cloneDefaultSchedule());
  
  // Reload from fresh
  window.dummyData = getSchedule();
  currentSavedScheduleDay = 'Monday';
  renderScheduleEditor('scheduleSavedTab');
  
  alert('Schedule restored to default!');
}

document.addEventListener('DOMContentLoaded', () => {
  renderScheduleEditor();
});
