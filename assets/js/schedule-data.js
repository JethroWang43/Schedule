const SCHEDULE_VERSION = '2026-04-16-v1';
const SCHEDULE_VERSION_KEY = 'sw_schedule_version';

const DEFAULT_SCHEDULE = {
  Monday: [
    { course: "IT0021", time: "7:00 AM - 8:50 AM", subject: "System Administration and Maintenance", room: "E408" },
    { course: "IT0125", time: "9:00 AM - 10:50 AM", subject: "Information Assurance & Security 1", room: "E408" }
  ],
  Tuesday: [
    { course: "GED0043", time: "9:00 AM - 10:50 AM", subject: "Specialized English Program 3", room: "ONLINE" },
    { course: "GED0049", time: "1:00 PM - 2:50 PM", subject: "Life and Works of Rizal", room: "ONLINE" },
    { course: "GED0061", time: "3:00 PM - 4:50 PM", subject: "Ethics", room: "ONLINE" }
  ],
  Wednesday: [],
  Thursday: [
    { course: "IT0027", time: "7:00 AM - 8:50 AM", subject: "Capstone Project 1", room: "FTIC Presentation Room 2" },
    { course: "IT0125", time: "9:00 AM - 10:50 AM", subject: "Information Assurance & Security 1", room: "E601" },
    { course: "IT0021", time: "1:00 PM - 2:50 PM", subject: "System Administration and Maintenance", room: "E712" }
  ],
  Friday: [
    { course: "IT0027", time: "7:00 AM - 8:50 AM", subject: "Capstone Project 1", room: "ONLINE" },
    { course: "GED0043", time: "9:00 AM - 10:50 AM", subject: "Specialized English Program 3", room: "ONLINE" },
    { course: "GED0049", time: "1:00 PM - 2:50 PM", subject: "Life and Works of Rizal", room: "ONLINE" },
    { course: "GED0061", time: "3:00 PM - 4:50 PM", subject: "Ethics", room: "ONLINE" }
  ],
  Saturday: []
};

const SCHEDULE_STORAGE_KEY = 'sw_schedule_v1';
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function cloneDefaultSchedule() {
  return JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
}

function formatTimeInput(value) {
  if (!value) return '';
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function normalizeScheduleEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const course = String(entry.course || '').trim();
  const time = String(entry.time || '').trim();
  const subject = String(entry.subject || '').trim();
  const room = String(entry.room || '').trim();

  if (!course || !time || !subject || !room) return null;

  const normalized = { course, time, subject, room };

  if (entry.link) {
    const link = String(entry.link).trim();
    if (link) normalized.link = link;
  }

  if (Array.isArray(entry.links) && entry.links.length) {
    normalized.links = entry.links
      .map(link => ({
        label: String(link?.label || 'Link').trim() || 'Link',
        url: String(link?.url || '').trim()
      }))
      .filter(link => link.url);
  }

  return normalized;
}

function normalizeSchedule(rawSchedule) {
  const normalized = cloneDefaultSchedule();

  if (!rawSchedule || typeof rawSchedule !== 'object') {
    return normalized;
  }

  for (const day of WEEK_DAYS) {
    if (!Array.isArray(rawSchedule[day])) continue;
    normalized[day] = rawSchedule[day].map(normalizeScheduleEntry).filter(Boolean);
  }

  return normalized;
}

function loadSchedule() {
  try {
    const storedVersion = localStorage.getItem(SCHEDULE_VERSION_KEY);
    if (storedVersion !== SCHEDULE_VERSION) {
      const defaults = cloneDefaultSchedule();
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(defaults));
      localStorage.setItem(SCHEDULE_VERSION_KEY, SCHEDULE_VERSION);
      return defaults;
    }

    const stored = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return normalizeSchedule(stored ? JSON.parse(stored) : null);
  } catch (error) {
    return cloneDefaultSchedule();
  }
}

function saveSchedule(schedule) {
  const normalized = normalizeSchedule(schedule);
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(normalized));
  localStorage.setItem(SCHEDULE_VERSION_KEY, SCHEDULE_VERSION);
  window.dummyData = normalized;
  return normalized;
}

function getSchedule() {
  window.dummyData = loadSchedule();
  return window.dummyData;
}

window.dummyData = getSchedule();
