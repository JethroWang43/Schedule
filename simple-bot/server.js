const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static UI
app.use('/', express.static(path.join(__dirname, 'public')));

// POST /api/chat
// body: { message: string, history?: [{role:'user'|'assistant', content}] }
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {};
  if(!message) return res.status(400).json({ ok: false, error: 'missing message' });

  // Quick command detection: if user asked to add a task, return a structured action
  try{
    const m = String(message || '').trim();
    // patterns: "add this task: Buy milk" or "add task Buy milk" or "add Buy milk"
    const addMatch = m.match(/add (?:this )?task[:\s\-–]*["']?(.*?)["']?$/i);
    let taskTitle = null;
    if(addMatch && addMatch[1]) taskTitle = addMatch[1].trim();
    else{
      const addMatch2 = m.match(/^(?:add|create)(?: (?:a|the)? )?(?:task )?[:\s\-–]*["']?(.*?)["']?$/i);
      if(addMatch2 && addMatch2[1]) taskTitle = addMatch2[1].trim();
    }

    if(taskTitle){
      const task = { id: Date.now(), title: taskTitle, done: false, created: new Date().toISOString() };
      return res.json({ ok: true, text: `Added task: ${taskTitle}`, action: { type: 'add_task', task } });
    }
  }catch(e){ /* ignore parsing errors and continue */ }

    // Check for schedule queries (e.g. "what's my schedule", "show my schedule", "my schedule")
    try{
      const mm = String(message || '').trim().toLowerCase();
      // include some common misspellings (scudle, scdule) and shorter forms
      const schedulePatterns = [ /\bmy schedule\b/, /\bschedule\b/, /\bscudle\b/, /\bscdule\b/, /\bsched\b/, /what(?:'|’)?s on my/, /what do i have (today|tomorrow|this week)/, /show (?:me )?(?:my )?schedule/ ];
      const matches = schedulePatterns.some(p => p.test(mm));
      if(matches){
        // If the client provided tasksContext, include it in the response so the client can render the tasks
        const tasksText = req.body.tasksContext || '';
        // also provide a short human-friendly reply
        const human = tasksText ? `Here is your schedule I can see:\n${tasksText}` : "I don't see any saved tasks yet — open the Calendar and add some tasks and I'll remember them.";
        return res.json({ ok: true, text: human, action: { type: 'show_schedule', tasks_text: tasksText } });
      }
    }catch(e){ /* ignore */ }

  // prefer environment variable OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY;

  // If API key present, call OpenAI chat completions API
  if(apiKey){
    try{
      const messages = [];
      // system prompt
      messages.push({ role: 'system', content: 'You are a helpful assistant for a personal schedule app.' });
      // include recent history if provided
      if(Array.isArray(history)){
        for(const m of history.slice(-6)){
          messages.push({ role: m.role, content: m.content });
        }
      }
      // add user message
      messages.push({ role: 'user', content: message });

      const payload = {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 600
      };

      const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` }
      });

      const choice = resp.data && resp.data.choices && resp.data.choices[0];
      const text = choice && choice.message ? choice.message.content : (choice && choice.text) || '';
      return res.json({ ok: true, text });
    }catch(err){
      console.error('OpenAI proxy error', err?.response?.data || err.message || err);
      // fall through to local fallback
    }
  }

  // Local rule-based fallback
  const t = message.toLowerCase();
  if(t.includes('task') || t.includes('next')){
    const raw = req.body.tasksContext || '';
    if(raw) return res.json({ ok: true, text: `Here are tasks I know:\n${raw}` });
    return res.json({ ok: true, text: "I can't reach an AI service right now — open Calendar and add tasks, then ask 'What are my next tasks?'" });
  }
  if(t.includes('hello') || t.includes('hi')) return res.json({ ok: true, text: 'Hello — I am your local assistant. Ask about your schedule or tasks.' });
  if(t.includes('help')) return res.json({ ok: true, text: 'I can list upcoming tasks if you have any in the Calendar, or forward your question to a configured AI service.' });

  return res.json({ ok: true, text: "I'm offline and can only do simple replies. Try asking about tasks or run a local AI proxy." });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, ()=> console.log(`Simple-bot listening on http://localhost:${PORT}`));
