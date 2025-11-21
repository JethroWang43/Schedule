// Chat client that posts to n8n webhook (if configured) then falls back to local responder
const chatBox = () => document.getElementById('chatBox');
const inputEl = () => document.getElementById('chatInput');

const N8N_ENDPOINT_KEY = 'n8n_webhook_endpoint_v1';
const DEFAULT_N8N_ENDPOINT = 'http://localhost:5678/webhook/53c136fe-3e77-4709-a143-fe82746dd8b6';

// Local lightweight bot endpoint (simple-bot)
const LOCAL_ENDPOINT_KEY = 'local_chat_endpoint_v1';
const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:3002/api/chat';

function getLocalEndpoint(){ return localStorage.getItem(LOCAL_ENDPOINT_KEY) || DEFAULT_LOCAL_ENDPOINT; }
function setLocalEndpoint(url){ if(!url) localStorage.removeItem(LOCAL_ENDPOINT_KEY); else localStorage.setItem(LOCAL_ENDPOINT_KEY, url); }

// In-memory dialog state for follow-up schedule questions
let awaitingScheduleDay = false;

function getN8nEndpoint(){ return localStorage.getItem(N8N_ENDPOINT_KEY) || DEFAULT_N8N_ENDPOINT; }
function setN8nEndpoint(url){ if(!url) localStorage.removeItem(N8N_ENDPOINT_KEY); else localStorage.setItem(N8N_ENDPOINT_KEY, url); }

function appendMessage(text, who='bot'){
  const box = chatBox();
  const row = document.createElement('div');
  row.className = `message ${who}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

function clearChat(){ document.getElementById('chatBox').innerHTML=''; }

function getRecentTasksContext(limit=6){
  try{
    const raw = localStorage.getItem('sw_tasks_v1');
    if(!raw) return '';
    const tasks = JSON.parse(raw);
    const arr = Array.isArray(tasks) ? tasks : Object.values(tasks||{});
    const lines = arr.slice(0,limit).map(u => {
      const title = u.title || u.name || u.task || u.text || 'Task';
      const d = u.due || u.date || 'no date';
      const status = u.completed ? 'done' : 'open';
      return `- ${title} (due ${d}) [${status}]`;
    });
    if(lines.length===0) return '';
    return lines.join('\n');
  }catch(e){ return ''; }
}

function extractReplyFromResponse(data){
  if(!data) return '';
  if(typeof data === 'string') return data;
  if(data.text) return data.text;
  if(data.reply) return data.reply;
  if(data.result) return data.result;
  if(data.output) return data.output;
  if(data.choices && data.choices[0]){
    const c = data.choices[0];
    if(c.message && c.message.content) return c.message.content;
    if(c.text) return c.text;
  }
  try{ return JSON.stringify(data); }catch(e){ return ''; }
}

function formatScheduleHTML(day, entries){
  if(!Array.isArray(entries) || entries.length===0) return `<div>No schedule available for ${day}.</div>`;
  const rows = entries.map(e => {
    const course = e.course || '-';
    const time = e.time || '-';
    const subject = e.subject || '-';
    const room = e.room || '-';
    let links = '';
    if(e.link) links += `<a href="${e.link}" target="_blank" rel="noopener noreferrer">Link</a>`;
    if(e.links && Array.isArray(e.links)){
      links += e.links.map(l=> ` <a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label || 'Link'}</a>`).join('');
    }
    return `<tr><td>${escapeHtml(course)}</td><td>${escapeHtml(time)}</td><td>${escapeHtml(subject)}</td><td>${escapeHtml(room)}</td><td>${links}</td></tr>`;
  }).join('');
  return `
    <div class="schedule-bubble"><strong>${escapeHtml(day)} schedule</strong>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead><tr style="background:#f3f3f3;"><th style="padding:6px;border:1px solid #e0e0e0;text-align:left">Course</th><th style="padding:6px;border:1px solid #e0e0e0;text-align:left">Time</th><th style="padding:6px;border:1px solid #e0e0e0;text-align:left">Subject</th><th style="padding:6px;border:1px solid #e0e0e0;text-align:left">Room</th><th style="padding:6px;border:1px solid #e0e0e0;text-align:left">Links</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
  });
}

function addTaskToLocalStorage(task){
  try{
    const raw = localStorage.getItem('sw_tasks_v1');
    let arr = [];
    if(raw){
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)) arr = parsed;
      else if(parsed && typeof parsed === 'object') arr = Object.values(parsed);
    }
    arr.unshift(task);
    localStorage.setItem('sw_tasks_v1', JSON.stringify(arr));
    return true;
  }catch(e){ console.warn('Failed to save task locally', e); return false; }
}

function localFallbackReply(text){
  const t = text.toLowerCase();
  // If user asks about tasks or schedule, return stored tasks
  if(t.includes('task') || t.includes('next') || t.includes('schedule') || t.includes('scudle') || t.includes('scdule') || t.includes('sched')){
    const raw = localStorage.getItem('sw_tasks_v1');
    if(raw){
      try{ const tasks = JSON.parse(raw); const arr = Array.isArray(tasks)?tasks:Object.values(tasks||{}); if(arr.length===0) return 'No tasks found.'; return 'Tasks:\n' + arr.slice(0,5).map(x=>('- ' + (x.title||x.name||x.task||x.text||'Task'))).join('\n'); }catch(e){ return 'No tasks available.'; }
    }
    // No saved tasks — explain why you see this
    return 'No saved tasks yet. (If you asked for your calendar schedule, the site may be missing schedule data — ensure the Calendar data file is loaded.)';
  }
  if(t.includes('help')) return 'Ask me about your tasks or say "add task".';
  return "I'm offline right now — try running the n8n workflow or a local proxy for smarter replies.";
}

async function tryN8n(message){
  const url = getN8nEndpoint();
  if(!url) return '';
  try{
    const payload = { message, tasksContext: getRecentTasksContext(6) };
    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res) return '';
    if(res.ok){
      const data = await res.json().catch(()=>null);
      return data || null;
    }else{
      const txt = await res.text().catch(()=>'<no body>');
      console.warn('n8n webhook responded non-OK', res.status, txt);
      return '';
    }
  }catch(err){
    console.warn('Error calling n8n webhook', err);
    return '';
  }
}

async function tryLocalChat(message){
  const url = getLocalEndpoint();
  if(!url) return null;
  try{
    const payload = { message, tasksContext: getRecentTasksContext(6) };
    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res) return null;
    if(res.ok){
      const data = await res.json().catch(()=>null);
      return data || null;
    }
    return null;
  }catch(err){ console.warn('Error calling local chat endpoint', err); return null; }
}

async function sendChat(){
  const text = inputEl().value.trim();
  if(!text) return;
  appendMessage(text, 'user');
  inputEl().value = '';
  const box = chatBox();
  appendMessage('Thinking...', 'bot');

  // Local schedule handling: two-step flow
  try{
    const low = text.toLowerCase();
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    // find explicit day in text
    let foundDay = null;
    for(const d of dayNames){ if(low.includes(d)) { foundDay = d; break; } }
    // common phrase "my schedule" or misspellings
    const asksSchedule = /\b(schedule|scudle|scdule|sched)\b/i.test(text);

    // If we previously asked which day, interpret this reply as the day selection
    if(awaitingScheduleDay){
      awaitingScheduleDay = false; // consume state
      // user might reply with a day name
      if(foundDay){
        const key = foundDay.charAt(0).toUpperCase() + foundDay.slice(1);
        if(window.dummyData && window.dummyData[key]){
          const entries = window.dummyData[key];
          if(Array.isArray(entries) && entries.length>0){
            const lastBot = box.querySelector('.message.bot:last-child .bubble');
            if(lastBot) lastBot.innerHTML = formatScheduleHTML(key, entries);
            return;
          }
        }
        const lastBot = box.querySelector('.message.bot:last-child .bubble');
        if(lastBot) lastBot.textContent = `No schedule available for ${foundDay}.`;
        return;
      }
      // no day recognized
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = 'Sorry, I did not recognize that day. Please reply with one day (Monday to Sunday).';
      awaitingScheduleDay = true; // ask again
      return;
    }

    // If user asked schedule without giving a day, prompt for which day
    if(asksSchedule && !foundDay){
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = 'Which day would you like to see? Please reply with Monday..Sunday.';
      awaitingScheduleDay = true;
      return;
    }

    // If user asked schedule and gave a day in the same message, show it
    if(asksSchedule && foundDay){
      const key = foundDay.charAt(0).toUpperCase() + foundDay.slice(1);
      if(window.dummyData && window.dummyData[key]){
        const entries = window.dummyData[key];
        if(Array.isArray(entries) && entries.length>0){
          const lastBot = box.querySelector('.message.bot:last-child .bubble');
          if(lastBot) lastBot.innerHTML = formatScheduleHTML(key, entries);
          return;
        }
      }
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = `No schedule available for ${foundDay}.`;
      return;
    }
  }catch(e){ console.warn('schedule lookup failed', e); }

  // try n8n webhook first (if configured)
  let data = await tryN8n(text);
  // if n8n not available or returned nothing, try local simple-bot endpoint
  if(!data) data = await tryLocalChat(text);

  // If we got a structured reply object, handle action and text
  if(data){
    const replyText = extractReplyFromResponse(data) || '';
    const lastBot = box.querySelector('.message.bot:last-child .bubble');
    if(data.action && data.action.type === 'add_task' && data.action.task){
      // Persist the task locally
      addTaskToLocalStorage(data.action.task);
      const confirmation = replyText || (`Task added: ${data.action.task.title}`);
      if(lastBot) lastBot.textContent = confirmation;
      return;
    }
    if(data.action && data.action.type === 'show_schedule'){
      // show schedule: prefer structured tasks_text from server, otherwise replyText
      const ttext = (data.action.tasks_text && String(data.action.tasks_text).trim()) || replyText || 'No tasks found.';
      if(lastBot) lastBot.textContent = ttext;
      return;
    }
    if(replyText){ if(lastBot) lastBot.textContent = replyText; return; }
  }

  // fallback to local responder text
  setTimeout(()=>{
    const r = localFallbackReply(text);
    const lastBot = box.querySelector('.message.bot:last-child .bubble');
    if(lastBot) lastBot.textContent = r;
  }, 300);
}

document.addEventListener('DOMContentLoaded', ()=>{
  // n8n endpoint UI wiring
  const ep = document.getElementById('n8nEndpoint');
  const saveBtn = document.getElementById('saveN8nBtn');
  const resetBtn = document.getElementById('resetN8nBtn');
  if(ep) ep.value = getN8nEndpoint();
  if(saveBtn) saveBtn.addEventListener('click', ()=>{ const v = ep.value.trim(); setN8nEndpoint(v || null); alert('n8n endpoint saved: ' + getN8nEndpoint()); });
  if(resetBtn) resetBtn.addEventListener('click', ()=>{ setN8nEndpoint(null); if(ep) ep.value = getN8nEndpoint(); alert('n8n endpoint reset to default: ' + getN8nEndpoint()); });

  document.getElementById('sendBtn').addEventListener('click', sendChat);
  document.getElementById('resetBtn').addEventListener('click', ()=>{ clearChat(); appendMessage('Hello — I am your assistant. Ask me about your schedule or tasks.'); });
  document.getElementById('chatInput').addEventListener('keydown', (e)=>{ if(e.key === 'Enter') sendChat(); });
  appendMessage('Hello — I am your assistant. Ask me about your schedule or tasks.');
});
