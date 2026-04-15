const SITE_NAV_ITEMS = [
  { label: 'Home', target: 'index.html' },
  { label: 'Edit Schedule', target: 'pages/edit/edit.html' },
  { label: 'Calendar & Dashboard', target: 'pages/calendar/calendar.html' },
  { label: 'AI Chatbot', target: 'pages/chat/chat.html' },
  { label: 'Weekly Workout', target: 'pages/workout/workout.html' }
];

const SITE_HEADER_TITLE = 'FEU TECH SCHUDLE';
const SITE_FOOTER_LINK = 'https://solar.feutech.edu.ph/user/profile';
const SITE_FOOTER_TEXT = 'Go to FEU Tech Solar Profile';
const SITE_DEFAULT_ALERT = 'Hello, User! No upcoming class.';
const SITE_DEFAULT_NEXT = 'No more classes today!';
const SITE_SCHEDULE_KEY = 'sw_schedule_v1';
const SITE_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNavBasePrefix() {
  // Nested pages live under /pages/*/* and need ../../ to reach project root.
  return window.location.pathname.includes('/pages/') ? '../../' : '';
}

function buildNavHref(target) {
  return `${getNavBasePrefix()}${target}`;
}

function isActiveNavItem(item) {
  const path = window.location.pathname.replace(/\\/g, '/');
  return path.endsWith(`/${item.target}`) || path.endsWith(item.target);
}

function renderSiteShell() {
  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = `
      <div class="logo">${SITE_HEADER_TITLE}</div>
      <div class="hamburger" id="hamburger">&#9776;</div>
      <nav id="sideNav" class="side-nav" aria-hidden="true">
        <button id="closeNav" class="close-nav">&times;</button>
        <ul></ul>
      </nav>
    `;
  }

  let statusBar = document.querySelector('.nav-bar');
  if (!statusBar && header && header.parentNode) {
    statusBar = document.createElement('nav');
    statusBar.className = 'nav-bar';
    statusBar.innerHTML = `
      <p id="alertMessage">${SITE_DEFAULT_ALERT}</p>
      <p id="next-schedule">${SITE_DEFAULT_NEXT}</p>
    `;
    header.insertAdjacentElement('afterend', statusBar);
  }

  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }

  footer.innerHTML = `
    <a href="${SITE_FOOTER_LINK}" target="_blank" style="font-size:0.98rem;color:#388e3c;font-weight:500;text-decoration:none;">${SITE_FOOTER_TEXT}</a>
  `;
}

function toMinutes(timeStr) {
  const [time, period] = timeStr.trim().split(' ');
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m;
  if (period === 'PM' && h !== 12) total += 12 * 60;
  if (period === 'AM' && h === 12) total -= 12 * 60;
  return total;
}

function getScheduleForStatus() {
  if (typeof getSchedule === 'function') {
    return getSchedule();
  }

  try {
    const raw = localStorage.getItem(SITE_SCHEDULE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
}

function updateGlobalStatusBar() {
  const alertEl = document.getElementById('alertMessage');
  const nextEl = document.getElementById('next-schedule');
  if (!alertEl || !nextEl) return;

  // Default text if schedule functions are not available on the page.
  alertEl.textContent = SITE_DEFAULT_ALERT;
  nextEl.textContent = SITE_DEFAULT_NEXT;

  const scheduleData = getScheduleForStatus();
  if (!scheduleData) return;

  const now = new Date();
  const dayIndex = now.getDay();
  if (dayIndex === 0) return;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let nextClass = null;
  let minsUntilNext = null;

  for (let i = dayIndex - 1; i < SITE_DAY_NAMES.length; i += 1) {
    const schedule = scheduleData[SITE_DAY_NAMES[i]] || [];
    for (const item of schedule) {
      if (!item || typeof item.time !== 'string') continue;
      const [start] = item.time.split(' - ');
      const startMinutes = toMinutes(start);
      if (i === dayIndex - 1 && startMinutes <= currentMinutes) continue;
      nextClass = item;
      const daysOffset = i - (dayIndex - 1);
      minsUntilNext = daysOffset * 24 * 60 + (startMinutes - currentMinutes);
      break;
    }
    if (nextClass) break;
  }

  if (!nextClass) return;

  nextEl.textContent = nextClass.room ? `Room no: ${nextClass.room}` : SITE_DEFAULT_NEXT;
  const minsLeft = Math.max(0, minsUntilNext ?? 0);
  const hrs = Math.floor(minsLeft / 60);
  const mins = minsLeft % 60;
  alertEl.textContent = `Your next class "${nextClass.subject}" starts in ${hrs} hours and ${mins} minutes.`;
}

function renderSiteNav() {
  const sideNav = document.getElementById('sideNav');
  const navList = sideNav?.querySelector('ul');
  if (!sideNav || !navList) return;

  navList.innerHTML = SITE_NAV_ITEMS.map(item => {
    const href = buildNavHref(item.target);
    const active = isActiveNavItem(item) ? 'active' : '';
    const ariaCurrent = active ? ' aria-current="page"' : '';
    return `<li><a class="site-nav-link ${active}" href="${href}"${ariaCurrent}>${item.label}</a></li>`;
  }).join('');
}

function bindSiteNavControls() {
  const hamburger = document.getElementById('hamburger');
  const sideNav = document.getElementById('sideNav');
  const closeButton = document.getElementById('closeNav');

  if (hamburger && sideNav) {
    hamburger.addEventListener('click', () => {
      sideNav.style.transform = 'translateX(0)';
      sideNav.setAttribute('aria-hidden', 'false');
    });
  }

  if (closeButton && sideNav) {
    closeButton.addEventListener('click', () => {
      sideNav.style.transform = '';
      sideNav.setAttribute('aria-hidden', 'true');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSiteShell();
  renderSiteNav();
  bindSiteNavControls();
  updateGlobalStatusBar();
  setInterval(updateGlobalStatusBar, 60 * 1000);
});