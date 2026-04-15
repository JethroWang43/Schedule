// Weekly workout plan data
const workoutPlan = {
  Monday: {
    isRest: true,
    exercises: []
  },
  Tuesday: {
    isRest: false,
    exercises: [
      {
        name: 'Dumbbell Bench Press',
        sets: 4,
        reps: '8-10',
        rest: '90s'
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10-12',
        rest: '75s'
      },
      {
        name: 'Dumbbell Flyes',
        sets: 3,
        reps: '12-15',
        rest: '60s'
      },
      {
        name: 'Dumbbell Rows',
        sets: 4,
        reps: '8-10',
        rest: '90s'
      }
    ]
  },
  Wednesday: {
    isRest: false,
    exercises: [
      {
        name: 'Dumbbell Squats',
        sets: 4,
        reps: '10-12',
        rest: '90s'
      },
      {
        name: 'Dumbbell Lunges',
        sets: 3,
        reps: '12 per leg',
        rest: '75s'
      },
      {
        name: 'Dumbbell Deadlifts',
        sets: 3,
        reps: '8-10',
        rest: '90s'
      },
      {
        name: 'Dumbbell Calf Raises',
        sets: 3,
        reps: '15-20',
        rest: '45s'
      }
    ]
  },
  Thursday: {
    isRest: true,
    exercises: []
  },
  Friday: {
    isRest: false,
    exercises: [
      {
        name: 'Dumbbell Bench Press',
        sets: 3,
        reps: '10-12',
        rest: '75s'
      },
      {
        name: 'Dumbbell Pullovers',
        sets: 3,
        reps: '12-15',
        rest: '60s'
      },
      {
        name: 'Dumbbell Rows (Bent Over)',
        sets: 3,
        reps: '10-12',
        rest: '75s'
      },
      {
        name: 'Dumbbell Shrugs',
        sets: 3,
        reps: '12-15',
        rest: '60s'
      }
    ]
  },
  Saturday: {
    isRest: false,
    exercises: [
      {
        name: 'Dumbbell Bulgarian Split Squats',
        sets: 3,
        reps: '10 per leg',
        rest: '75s'
      },
      {
        name: 'Dumbbell Single Leg Deadlifts',
        sets: 3,
        reps: '8 per leg',
        rest: '75s'
      },
      {
        name: 'Dumbbell Step-ups',
        sets: 3,
        reps: '12 per leg',
        rest: '60s'
      },
      {
        name: 'Dumbbell Farmer Carries',
        sets: 3,
        reps: '40m walk',
        rest: '90s'
      }
    ]
  }
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let currentDayIndex = 0;

// Meal suggestions cache
const mealSuggestionsCache = {
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null
};

// Fallback meal suggestions if AI fails
const fallbackMeals = {
  Monday: '🥗 <strong>Grilled Chicken & Quinoa Bowl</strong><br>Rest day - Light, nutrient-dense meal with lean protein and whole grains for recovery.',
  Tuesday: '🥩 <strong>Salmon & Sweet Potato</strong><br>Chest & Back day - Omega-3s for inflammation and carbs to fuel your bench press workout.',
  Wednesday: '🍗 <strong>Chicken Breast with Brown Rice & Broccoli</strong><br>Leg day - High protein and carbs to support heavy squats and deadlifts.',
  Thursday: '🍲 <strong>Turkey & Vegetable Stir-fry</strong><br>Rest day - Balanced nutrition with vegetables and lean protein for active recovery.',
  Friday: '🥚 <strong>Eggs & Whole Grain Toast with Avocado</strong><br>Upper body - Quality protein and healthy fats for muscle maintenance and strength.',
  Saturday: '🍝 <strong>Lean Beef with Pasta & Greens</strong><br>Leg-focused day - Complex carbs and iron-rich protein for endurance and power.'
};

// Timer variables
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

// Initialize the workout page
document.addEventListener('DOMContentLoaded', () => {
  initializeCurrentDay();
  renderCurrentDay();
  loadTimerState();
});

// Get today's day and set as current
function initializeCurrentDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  
  // If today is Sunday, default to Monday
  if (today === 'Sunday') {
    currentDayIndex = 0; // Monday
  } else {
    currentDayIndex = dayOrder.indexOf(today);
    if (currentDayIndex === -1) currentDayIndex = 0; // Default to Monday if not found
  }
  
  updateDaySelect();
}

// Update the dropdown to show current day
function updateDaySelect() {
  const select = document.getElementById('daySelect');
  if (select) {
    select.value = dayOrder[currentDayIndex];
  }
}

// Render only the current day's workout
function renderCurrentDay() {
  const container = document.getElementById('workoutContainer');
  if (!container) return;

  const day = dayOrder[currentDayIndex];
  const dayData = workoutPlan[day];

  container.innerHTML = '';

  const dayCard = document.createElement('div');
  dayCard.className = `day-card ${dayData.isRest ? 'rest-day' : ''}`;

  let content = `<h3>${day}${dayData.isRest ? ' <span class="rest-badge">REST</span>' : ''}</h3>`;

  if (dayData.isRest) {
    content += '<div class="exercise-item rest">🎉 Rest Day - Recovery Time 🎉</div>';
  } else {
    const exercisesList = dayData.exercises
      .map(exercise => `
        <div class="exercise-item">
          <span class="exercise-name">${exercise.name}</span>
          <div class="exercise-details">
            <strong>Sets:</strong> ${exercise.sets} × ${exercise.reps} reps
          </div>
          <div class="exercise-details">
            <strong>Rest:</strong> ${exercise.rest}
          </div>
        </div>
      `)
      .join('');

    content += `<ul class="exercise-list">${exercisesList}</ul>`;
  }

  dayCard.innerHTML = content;
  container.appendChild(dayCard);
}

// Navigate to next day
function nextDay() {
  currentDayIndex = (currentDayIndex + 1) % dayOrder.length;
  updateDaySelect();
  renderCurrentDay();
  // Reset meal suggestion when changing day
  const suggestionDiv = document.getElementById('mealSuggestion');
  if (suggestionDiv) {
    suggestionDiv.innerHTML = '<span style="color: #999;">Click "Generate" to get an AI meal suggestion</span>';
  }
}

// Navigate to previous day
function previousDay() {
  currentDayIndex = (currentDayIndex - 1 + dayOrder.length) % dayOrder.length;
  updateDaySelect();
  renderCurrentDay();
  // Reset meal suggestion when changing day
  const suggestionDiv = document.getElementById('mealSuggestion');
  if (suggestionDiv) {
    suggestionDiv.innerHTML = '<span style="color: #999;">Click "Generate" to get an AI meal suggestion</span>';
  }
}

// Select a specific day
function selectDay(day) {
  currentDayIndex = dayOrder.indexOf(day);
  renderCurrentDay();
  // Reset meal suggestion when changing day
  const suggestionDiv = document.getElementById('mealSuggestion');
  if (suggestionDiv) {
    suggestionDiv.innerHTML = '<span style="color: #999;">Click "Generate" to get an AI meal suggestion</span>';
  }
}

// Timer functions
function setTimer(seconds) {
  timerSeconds = seconds;
  updateTimerDisplay();
  stopTimer();
}

function startTimer() {
  if (timerRunning) return;
  if (timerSeconds <= 0) {
    alert('Please set a time first using the preset buttons or manually enter a value.');
    return;
  }

  timerRunning = true;
  const startTime = Date.now() - (timerSeconds - timerSeconds) * 1000;

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerSeconds--;

    if (timerSeconds <= 0) {
      timerSeconds = 0;
      stopTimer();
      playNotification();
    }

    updateTimerDisplay();
  }, 1000);

  saveTimerState();
}

function pauseTimer() {
  if (!timerRunning) return;
  stopTimer();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  saveTimerState();
}

function resetTimer() {
  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playNotification() {
  // Try using the Web Audio API to create a beep
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000; // 1000 Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Play again
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.5);
    }, 100);
  } catch (e) {
    console.log('Audio notification unavailable, using alert instead');
    alert('Rest time is over! Time to get back to work! 💪');
  }
}

// Save/Load timer state from localStorage
function saveTimerState() {
  const state = {
    seconds: timerSeconds,
    running: timerRunning,
    timestamp: Date.now()
  };
  localStorage.setItem('workoutTimerState', JSON.stringify(state));
}

function loadTimerState() {
  const saved = localStorage.getItem('workoutTimerState');
  if (!saved) return;

  try {
    const state = JSON.parse(saved);
    const elapsed = Math.floor((Date.now() - state.timestamp) / 1000);
    timerSeconds = Math.max(0, state.seconds - elapsed);
    updateTimerDisplay();
  } catch (e) {
    console.log('Could not load timer state');
  }
}

// ============= MEAL SUGGESTION =============

function generateAIMeal() {
  const day = dayOrder[currentDayIndex];
  const suggestionDiv = document.getElementById('mealSuggestion');
  const generateBtn = document.getElementById('generateBtn');
  
  if (!suggestionDiv) return;

  // Check cache first
  if (mealSuggestionsCache[day]) {
    suggestionDiv.innerHTML = mealSuggestionsCache[day];
    return;
  }

  // Disable button and show loading
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  }
  
  suggestionDiv.innerHTML = '<span style="color: #1976d2; font-style: italic;">🔄 Generating with AI...</span>';
  
  console.log('=== GENERATE MEAL CLICKED ===');
  console.log('Day:', day);
  console.log('Puter available:', typeof puter !== 'undefined');
  
  fetchAIMeal(day, suggestionDiv, generateBtn);
}

async function fetchAIMeal(day, suggestionDiv, generateBtn) {
  if (typeof puter === 'undefined') {
    console.log('❌ Puter not loaded yet');
    showFallback(day, suggestionDiv, generateBtn);
    return;
  }

  if (!puter.ai || typeof puter.ai.chat !== 'function') {
    console.log('❌ Puter.ai.chat not available');
    showFallback(day, suggestionDiv, generateBtn);
    return;
  }

  try {
    const dayData = workoutPlan[day];
    const workoutType = dayData.isRest 
      ? 'rest/recovery day' 
      : `${day} strength training workout (dumbbells and bench)`;
    
    const prompt = `Suggest ONE healthy meal for my ${workoutType}. Keep it 1-2 sentences with meal name and key benefit.`;

    console.log('📤 Calling puter.ai.chat()...');
    const response = await Promise.race([
      puter.ai.chat(prompt, { model: 'claude-sonnet-4-5' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
    ]);

    console.log('📥 Response:', response);

    if (!response) {
      console.log('Empty response');
      showFallback(day, suggestionDiv, generateBtn);
      return;
    }

    let text = '';
    if (typeof response === 'string') {
      text = response;
    } else if (response.message && response.message.content) {
      if (Array.isArray(response.message.content)) {
        text = response.message.content.map(b => b.text || '').join('');
      } else {
        text = response.message.content;
      }
    } else if (response.text) {
      text = response.text;
    } else if (response.content) {
      text = response.content;
    }

    console.log('Extracted text:', text);

    if (text && text.trim()) {
      const html = markdownToHtml(text);
      mealSuggestionsCache[day] = html;
      suggestionDiv.innerHTML = html;
      console.log('✅ Updated with AI response');
    } else {
      console.log('No text in response');
      showFallback(day, suggestionDiv, generateBtn);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    showFallback(day, suggestionDiv, generateBtn);
  }
}

function showFallback(day, suggestionDiv, generateBtn) {
  const fallback = fallbackMeals[day];
  mealSuggestionsCache[day] = fallback;
  suggestionDiv.innerHTML = fallback;
  
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
  }
}

// Convert markdown to HTML
function markdownToHtml(text) {
  if (!text) return '';
  
  // Escape HTML first
  text = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Bold: **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Line breaks
  text = text.replace(/\n/g, '<br>');
  
  return text;
}
