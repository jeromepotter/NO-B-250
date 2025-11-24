const DEFAULT_MASTER_INTERVAL_MS = 2;
const MIDI_CLOCK_PPQN = 24;

let masterTimerId = null;
let midiClockTimerId = null;
let masterIntervalMs = DEFAULT_MASTER_INTERVAL_MS;
let midiClockIntervalMs = null;

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

function updateMidiClockInterval(bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return null;
  midiClockIntervalMs = 60000 / (bpm * MIDI_CLOCK_PPQN);
  return midiClockIntervalMs;
}

function startMidiClock(bpm) {
  const interval = updateMidiClockInterval(bpm);
  if (!interval) return;
  if (midiClockTimerId !== null) {
    clearInterval(midiClockTimerId);
  }
  midiClockTimerId = setInterval(() => {
    postMessage({ type: 'midiTick' });
  }, interval);
}

function stopMidiClock() {
  if (midiClockTimerId !== null) {
    clearInterval(midiClockTimerId);
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
      if (midiClockTimerId !== null) {
        startMidiClock(bpm);
      }
      break;
    default:
      break;
  }
};
