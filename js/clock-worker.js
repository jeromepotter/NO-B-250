const DEFAULT_MASTER_INTERVAL_MS = 2;
const MIDI_CLOCK_PPQN = 24;

// --- Master Clock State (Internal Engine) ---
let masterTimerId = null;
let masterIntervalMs = DEFAULT_MASTER_INTERVAL_MS;

// --- MIDI Clock State (External Output) ---
let midiClockTimerId = null;
let midiClockRunning = false;
let midiClockIntervalMs = 0;
let nextMidiTickTime = 0;

// --- Master Clock Logic (Unchanged) ---
function startMasterClock(intervalMs) {
  const interval = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : DEFAULT_MASTER_INTERVAL_MS;
  masterIntervalMs = interval;
  if (masterTimerId !== null) return;
  masterTimerId = setInterval(() => {
    postMessage({ type: 'tick' });
  }, masterIntervalMs);
}

function stopMasterClock() {
  if (masterTimerId !== null) {
    clearInterval(masterTimerId);
    masterTimerId = null;
  }
}

// --- New MIDI Clock Logic (Drift-Correcting Variable Loop) ---

function updateMidiClockInterval(bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return;
  // Just update the variable. The loop will see this new value automatically.
  midiClockIntervalMs = 60000 / (bpm * MIDI_CLOCK_PPQN);
}

function midiClockLoop() {
  if (!midiClockRunning) return;

  // 1. Send the Tick
  postMessage({ type: 'midiTick' });

  // 2. Calculate the exact time the NEXT tick should happen
  // By adding the interval to the *previous* target time (instead of "now"),
  // we preserve the rhythmic grid perfectly, even if the tempo changes.
  nextMidiTickTime += midiClockIntervalMs;

  // 3. Calculate how long to wait
  const now = performance.now();
  let delay = nextMidiTickTime - now;

  // 4. Drift Correction / Safety
  // If we are late (negative delay), run immediately (0ms).
  // If we are VERY late (e.g. tab was hidden), reset the clock to avoid a burst of 1000 notes.
  if (delay < -50) {
      nextMidiTickTime = now;
      delay = 0;
  }

  // 5. Schedule next tick
  midiClockTimerId = setTimeout(midiClockLoop, delay);
}

function startMidiClock(bpm) {
  if (midiClockRunning) {
      // If already running, just update the speed
      updateMidiClockInterval(bpm);
      return;
  }
  
  updateMidiClockInterval(bpm);
  midiClockRunning = true;
  
  // Align the grid to start RIGHT NOW
  nextMidiTickTime = performance.now();
  
  // Start the loop
  midiClockLoop();
}

function stopMidiClock() {
  midiClockRunning = false;
  if (midiClockTimerId !== null) {
    clearTimeout(midiClockTimerId);
    midiClockTimerId = null;
  }
}

self.onmessage = (event) => {
  const { type, intervalMs, bpm } = event.data || {};
  switch (type) {
    case 'start':
      startMasterClock(intervalMs);
      break;
    case 'stop':
      stopMasterClock();
      break;
    case 'enableMidiClock':
      startMidiClock(bpm);
      break;
    case 'disableMidiClock':
      stopMidiClock();
      break;
    case 'updateMidiBpm':
      // This is the magic part: We just update the variable.
      // We do NOT stop or restart the clock.
      updateMidiClockInterval(bpm);
      break;
    default:
      break;
  }
};
