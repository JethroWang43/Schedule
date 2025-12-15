// calendar.js — calendar/dashboard logic
const TASKS_KEY = 'sw_tasks_v1';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); } catch(e){ return []; }
}
function saveTasks(tasks){ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
function formatDateISO(d){ const dt = new Date(d); const yyyy = dt.getFullYear(); const mm = String(dt.getMonth()+1).padStart(2,'0'); const dd = String(dt.getDate()).padStart(2,'0'); return `${yyyy}-${mm}-${dd}`; }

let calendarMonth, calendarYear;
let selectedDateStr = null;
let selectedDayElement = null;

function selectDay(dateStr, el) {
  if (selectedDayElement) selectedDayElement.classList.remove('selected');
  if (el) el.classList.add('selected');
  selectedDayElement = el || null;
  selectedDateStr = dateStr;
  const sel = document.getElementById('selectedDate'); if (sel) sel.textContent = dateStr;
  const dateInput = document.getElementById('taskDate'); if (dateInput) dateInput.value = dateStr;
  // persist selection so other pages (index) can read it
  try { localStorage.setItem('sw_selected_date', dateStr); } catch(e) {}
  renderDashboard();
}

function renderCalendar(month, year){
  const grid = document.getElementById('calendarGrid');
  const monthName = document.getElementById('calendarMonth');
  const yearName = document.getElementById('calendarYear');
  grid.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const tasks = loadTasks();
  monthName.textContent = firstDay.toLocaleString(undefined,{month:'long'});
  yearName.textContent = year;
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for(let wd of weekdays){ const h = document.createElement('div'); h.className='calendar-weekday'; h.textContent=wd; grid.appendChild(h); }
  for(let i=0;i<startDay;i++){ const b=document.createElement('div'); b.className='calendar-day blank'; grid.appendChild(b); }
  for(let d=1; d<=daysInMonth; d++){ const dateStr = formatDateISO(new Date(year,month,d)); const dayEl = document.createElement('div'); dayEl.className='calendar-day'; dayEl.dataset.date=dateStr; dayEl.innerHTML=`<div class="num">${d}</div>`;
    const tasksForDay = tasks.filter(t=>t.date===dateStr && !t.completed);
    if(tasksForDay.length){ const badge=document.createElement('div'); badge.className='task-badge'; badge.textContent=tasksForDay.length; dayEl.appendChild(badge); dayEl.classList.add('has-task'); }
    const today = formatDateISO(new Date());
    if (dateStr === today) dayEl.classList.add('today');

    // restore selection if this date is currently selected
    if (selectedDateStr && dateStr === selectedDateStr) {
      dayEl.classList.add('selected');
      selectedDayElement = dayEl;
    }

    dayEl.addEventListener('click', () => { selectDay(dateStr, dayEl); });
    grid.appendChild(dayEl);
  }
}

function renderDashboard(){
  const ul = document.getElementById('upcomingList'); ul.innerHTML='';
  const tasks = loadTasks(); const now = new Date();
  const upcoming = tasks.filter(t=>!t.completed).map(t=>({...t, dt: new Date(t.date + (t.time? 'T'+t.time : 'T00:00'))})).sort((a,b)=>a.dt-b.dt).slice(0,20);
  const autoControl = false;
  for(let t of upcoming){ const li = document.createElement('li'); li.className='dashboard-item'; const when = t.time? `${t.date} ${t.time}` : t.date; li.innerHTML = `<div><strong>${t.title}</strong> <span class="muted">(${t.category})</span><br><small>${when}</small></div>`;
    const actions = document.createElement('div'); actions.className='task-actions'; const doneBtn = document.createElement('button'); doneBtn.textContent = t.completed? 'Undo' : 'Done'; doneBtn.onclick = ()=>toggleComplete(t.id);
    actions.appendChild(doneBtn); li.appendChild(actions);
    const diffMs = t.dt - now; const diffHours = diffMs / (1000*60*60);
    if(diffHours <= 24 && diffHours >= 0){ const warn = document.createElement('span'); warn.className='warning'; warn.textContent='Due soon'; li.appendChild(warn); if(autoControl) li.classList.add('needs-control'); }
    if(diffHours < 0){ const overdue = document.createElement('span'); overdue.className='warning overdue'; overdue.textContent='Overdue'; li.appendChild(overdue); if(autoControl) takeControl(t.id); }
    ul.appendChild(li);
  }
}

function addCalendarTask(e){ e && e.preventDefault(); const title = document.getElementById('taskTitle').value.trim(); const date = document.getElementById('taskDate').value; const time = document.getElementById('taskTime').value; const category = document.getElementById('taskCategory').value.trim() || 'General'; if(!title||!date) return alert('Please provide title and date'); const tasks = loadTasks(); const id = Date.now()+'-'+Math.floor(Math.random()*1000); tasks.push({id,title,date,time,category,completed:false,status:'scheduled',createdAt:new Date().toISOString()}); saveTasks(tasks); document.getElementById('taskForm').reset(); renderCalendar(calendarMonth, calendarYear); renderDashboard(); }

function toggleComplete(id){ const tasks = loadTasks(); const t = tasks.find(x=>x.id===id); if(!t) return; t.completed = !t.completed; t.status = t.completed? 'done':'scheduled'; saveTasks(tasks); renderCalendar(calendarMonth, calendarYear); renderDashboard(); }

// Removed takeControl functionality

function clearAllTasks(){ if(!confirm('Clear all saved tasks?')) return; saveTasks([]); renderCalendar(calendarMonth, calendarYear); renderDashboard(); }

document.addEventListener('DOMContentLoaded', ()=>{
  const now = new Date(); calendarMonth = now.getMonth(); calendarYear = now.getFullYear(); renderCalendar(calendarMonth, calendarYear); renderDashboard();
  document.getElementById('prevMonth').addEventListener('click', ()=>{ calendarMonth -=1; if(calendarMonth<0){ calendarMonth=11; calendarYear-=1;} renderCalendar(calendarMonth, calendarYear); });
  document.getElementById('nextMonth').addEventListener('click', ()=>{ calendarMonth +=1; if(calendarMonth>11){ calendarMonth=0; calendarYear+=1;} renderCalendar(calendarMonth, calendarYear); });
  document.getElementById('taskForm').addEventListener('submit', addCalendarTask);
  document.getElementById('clearTasksBtn').addEventListener('click', clearAllTasks);
  // Removed auto control toggle listener
});
