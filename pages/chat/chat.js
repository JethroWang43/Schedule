// Chat client that posts to n8n webhook (if configured) then falls back to local responder
const chatBox = () => document.getElementById('chatBox');
const inputEl = () => document.getElementById('chatInput');

const DEFAULT_N8N_ENDPOINT = ''; // disable n8n by default; use Puter/local instead
const CHAT_TIMEOUT_MS = 30000; // give Claude time to respond (30s)

// Local lightweight bot endpoint (simple-bot)
const LOCAL_ENDPOINT_KEY = 'local_chat_endpoint_v1';
const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:3002/api/chat';

function getLocalEndpoint(){ return localStorage.getItem(LOCAL_ENDPOINT_KEY) || DEFAULT_LOCAL_ENDPOINT; }
function setLocalEndpoint(url){ if(!url) localStorage.removeItem(LOCAL_ENDPOINT_KEY); else localStorage.setItem(LOCAL_ENDPOINT_KEY, url); }

// In-memory dialog state for follow-up schedule questions
let awaitingScheduleDay = false;

// Persist chat HTML exactly as rendered so formatting is preserved
const CHAT_STORAGE_KEY = 'sw_chat_html_v1';

function persistChat(){
  try{
    const box = chatBox();
    if(!box) return;
    localStorage.setItem(CHAT_STORAGE_KEY, box.innerHTML);
  }catch(e){ /* ignore */ }
}

function restoreChat(){
  try{
    const html = localStorage.getItem(CHAT_STORAGE_KEY);
    if(!html) return false;
    const box = chatBox();
    if(!box) return false;
    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
    return true;
  }catch(e){ return false; }
}

function getN8nEndpoint(){ return localStorage.getItem(N8N_ENDPOINT_KEY) || DEFAULT_N8N_ENDPOINT; }
function setN8nEndpoint(url){ if(!url) localStorage.removeItem(N8N_ENDPOINT_KEY); else localStorage.setItem(N8N_ENDPOINT_KEY, url); }

function withTimeout(promise, ms = CHAT_TIMEOUT_MS){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

async function fetchWithTimeout(url, options = {}, ms = CHAT_TIMEOUT_MS){
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Lightweight client for Puter.js (Claude via puter.ai.chat, no API key required)
const PUTER_MODEL = 'claude-sonnet-4-5';

// Build schedule context from the global schedule data
function getScheduleContext(){
  if(!window.dummyData) return '';
  const lines = [];
  for(const [day, classes] of Object.entries(window.dummyData)){
    if(!Array.isArray(classes) || classes.length === 0) continue;
    lines.push(`${day}:`);
    for(const cls of classes){
      const course = cls.course || 'N/A';
      const time = cls.time || 'N/A';
      const subject = cls.subject || 'N/A';
      const room = cls.room || 'N/A';
      lines.push(`  - ${course}: ${subject} (${time}) @ ${room}`);
    }
  }
  return lines.length > 0 ? 'My Schedule:\n' + lines.join('\n') : '';
}

// Get today's day of the week and tomorrow's day
function getCurrentDayInfo(){
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const todayIndex = now.getDay();
  const todayName = days[todayIndex];
  const tomorrowIndex = (todayIndex + 1) % 7;
  const tomorrowName = days[tomorrowIndex];
  return { today: todayName, tomorrow: tomorrowName, todayIndex, tomorrowIndex };
}

async function tryPuterChat(message){
  if(typeof window === 'undefined' || !window.puter || !puter.ai || typeof puter.ai.chat !== 'function') return null;
  try{
    const scheduleContext = getScheduleContext();
    const dayInfo = getCurrentDayInfo();
    const dayContext = `Today is ${dayInfo.today}. Tomorrow is ${dayInfo.tomorrow}.`;
    const contextMsg = scheduleContext 
      ? `${dayContext}\n\n${scheduleContext}\n\nUser question: ${message}\n\nPlease respond in English only and reference my schedule if relevant.`
      : `${dayContext}\n\nUser question: ${message}\n\nPlease respond in English only.`;
    const res = await withTimeout(puter.ai.chat(contextMsg, { model: PUTER_MODEL }));
    if(!res) return null;
    // Prefer the textual content if provided
    const reply = extractReplyFromResponse(res);
    return reply || null;
  }catch(err){
    console.warn('Puter chat failed', err);
    return null;
  }
}

function appendMessage(text, who='bot'){
  const box = chatBox();
  const row = document.createElement('div');
  row.className = `message ${who}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  
  // For bot messages, render as HTML (supports markdown-style formatting)
  if(who === 'bot'){
    bubble.innerHTML = simpleMarkdownToHtml(text);
  } else {
    bubble.textContent = text;
  }
  
  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
  // Save after each appended message
  persistChat();
}

// Simple markdown-to-HTML converter for better readability
function simpleMarkdownToHtml(text){
  if(!text) return '';
  let html = escapeHtml(text);
  
  // Headers: # Title, ## Title, ### Title
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
  });
}

function clearChat(){
  const box = document.getElementById('chatBox');
  if(box) box.innerHTML='';
  try{ localStorage.removeItem(CHAT_STORAGE_KEY); }catch(e){ /* ignore */ }
}

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
  // Claude via Puter.js returns response.message.content as an array of blocks
  if(data.message && Array.isArray(data.message.content)){
    return data.message.content.map(block => block.text || '').join('');
  }
  if(data.message && data.message.content) return data.message.content;
  if(Array.isArray(data)) return data.map(block => block.text || '').join('');
  if(data.content) return data.content;
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
  // Generic offline response with actionable steps
  return "I couldn't reach the AI service. Please ensure you're online and https://js.puter.com/v2/ loads (check DevTools > Network). If blocked, you can set a local endpoint at http://localhost:3002. Meanwhile, I'm giving this basic offline reply.";
}

// Quick local answers for simple arithmetic to reduce backend calls
function tryLocalQuickAnswer(text){
  const expr = text.replace(/[^0-9+\-*/(). ]/g, '').trim();
  if(!expr) return null;
  // Only allow digits and basic operators to avoid unsafe eval
  if(/[^0-9+\-*/(). ]/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-eval
    const val = eval(expr);
    if(typeof val === 'number' && isFinite(val)) return `${expr} = ${val}`;
  } catch(e) { return null; }
  return null;
}

async function tryN8n(message){
  const url = getN8nEndpoint();
  if(!url) return '';
  try{
    const payload = { message, tasksContext: getRecentTasksContext(6) };
    const res = await fetchWithTimeout(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
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
    const res = await fetchWithTimeout(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
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
  // Create an animated thinking bubble
  const row = document.createElement('div');
  row.className = 'message bot';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const thinking = document.createElement('div');
  thinking.className = 'thinking';
  thinking.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  bubble.appendChild(thinking);
  row.appendChild(bubble);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;

  // Quick local answer path
  const quick = tryLocalQuickAnswer(text);
  if(quick){
    const lastBot = box.querySelector('.message.bot:last-child .bubble');
    if(lastBot) lastBot.textContent = quick;
    persistChat();
    return;
  }

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
            persistChat();
            return;
          }
        }
        const lastBot = box.querySelector('.message.bot:last-child .bubble');
        if(lastBot) lastBot.textContent = `No schedule available for ${foundDay}.`;
        persistChat();
        return;
      }
      // no day recognized
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = 'Sorry, I did not recognize that day. Please reply with one day (Monday to Sunday).';
      awaitingScheduleDay = true; // ask again
      persistChat();
      return;
    }

    // If user asked schedule without giving a day, prompt for which day
    if(asksSchedule && !foundDay){
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = 'Which day would you like to see? Please reply with Monday..Sunday.';
      awaitingScheduleDay = true;
      persistChat();
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
          persistChat();
          return;
        }
      }
      const lastBot = box.querySelector('.message.bot:last-child .bubble');
      if(lastBot) lastBot.textContent = `No schedule available for ${foundDay}.`;
      persistChat();
      return;
    }
  }catch(e){ console.warn('schedule lookup failed', e); }

  // try Puter.js GLM (no key) first, then n8n, then local simple-bot
  let data = await tryPuterChat(text);
  if(!data) data = await tryN8n(text);
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
      persistChat();
      return;
    }
    if(data.action && data.action.type === 'show_schedule'){
      // show schedule: prefer structured tasks_text from server, otherwise replyText
      const ttext = (data.action.tasks_text && String(data.action.tasks_text).trim()) || replyText || 'No tasks found.';
      if(lastBot) lastBot.textContent = ttext;
      persistChat();
      return;
    }
    if(replyText){ if(lastBot) lastBot.textContent = replyText; persistChat(); return; }
  }

  // fallback to local responder text
  setTimeout(()=>{
    const r = localFallbackReply(text);
    const lastBot = box.querySelector('.message.bot:last-child .bubble');
    if(lastBot) lastBot.textContent = r;
    persistChat();
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
  document.getElementById('resetBtn').addEventListener('click', ()=>{ 
    clearChat(); 
    appendMessage('Hello — I am your assistant. Ask me about your schedule or tasks.'); 
  });
  document.getElementById('chatInput').addEventListener('keydown', (e)=>{ if(e.key === 'Enter') sendChat(); });

  // Try to restore previous chat; if none, show greeting
  const restored = restoreChat();
  if(!restored){
    appendMessage('Hello — I am your assistant. Ask me about your schedule or tasks.');
  }
});
