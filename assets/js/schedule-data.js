const DEFAULT_SCHEDULE = {
  Monday: [
    { course: "IT0023", time: "11:00 AM - 12:50 PM", subject: "SYSTEM INTEGRATION AND ARCHITECTURE 1", room: "E408" },
    { course: "IT0039", time: "01:00 PM - 02:50 PM", subject: "IT PROJECT MANAGEMENT", room: "FTIC Project Room (CCS)" }
  ],
  Tuesday: [
    { course: "IT0051", time: "07:00 AM - 08:50 AM", subject: "IT ELECTIVE - HUMAN COMPUTER INTERACTION 2", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_ZTgyMjI2ODItNmFkNy00NjFlLWIyOGUtYjdmZjQ5MzE4Yjk4%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%252252e0919b-1da9-480a-a5a0-338b614d9a27%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=3ced33dc-df0d-4079-840e-9b6883064728&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" },
    { course: "IT0039", time: "09:00 AM - 10:50 AM", subject: "IT PROJECT MANAGEMENT", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_YzVmZGI5MWUtZDY4ZC00MDQ4LWFjNDctMzNhZmE0OTk3Zjhh%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%2522bd52fd16-477a-4067-a55f-8facc47df93c%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=e544bccb-581d-46ed-9db5-d3493999c4f8&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" },
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
    { course: "IT0123", time: "11:00 AM - 12:50 PM", subject: "IT SPECIALISATION 7 - DEVELOPMENT NETWORK", room: "ONLINE", link: "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MTUzOTliNzctZjczNi00OTQ4LThhM2QtNDdmNWJhMTQzYTBm%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522b0a025d9-cb88-4408-9b15-ce77d47c3810%2522%252c%2522Oid%2522%253a%252262410d1a-8ed9-4c2d-9727-f1801931cd5f%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=dde24a37-4a48-46df-889d-d1837ea9ecdc&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true" }
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
    const stored = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return normalizeSchedule(stored ? JSON.parse(stored) : null);
  } catch (error) {
    return cloneDefaultSchedule();
  }
}

function saveSchedule(schedule) {
  const normalized = normalizeSchedule(schedule);
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(normalized));
  window.dummyData = normalized;
  return normalized;
}

function getSchedule() {
  window.dummyData = loadSchedule();
  return window.dummyData;
}

window.dummyData = getSchedule();
