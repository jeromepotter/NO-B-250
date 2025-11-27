       // --- App State ---
      let audioContext; let synthNode; let isPowerOn = false; let audioSetupPromise = null;
      let allowDuplicateNotesMode = false;
      let isLfoMode = false;
      let isLfoLockEnabled = false;
      let visualUpdatePending = false;
      let activeMainKnobId = null; // For MOUSE input only
      let lastTouchTime = 0; // Mobile double-trigger fix
       const fxKnobData = {};
       const VOICE_WAVEFORMS = ['SAW', 'SQR', 'SINE', 'TRI'];
       const spinIntervals = {};
       const activeKeyControls = {};
       let customScale = [];
      
       // --- Recording State ---
       let isRecordingAudio = false; let recordStartTs = 0; let recordTimerId = null; let recordButton = null;
       let pcmChunks = []; let totalPcmBytes = 0;

       // --- MIDI Recording State ---
       let isRecordingMidi = false;
       let midiEventsTrack1 = [];
       let midiEventsTrack2 = [];
       let midiRecordingStartTime = 0;
       let recordMidiButton = null;
 let midiAccess = null;
       let selectedMidiOutput = null;

       // --- LFO State ---
        const LFO_WAVEFORMS = ['SINE', 'TRI', 'SQUARE', 'SAW UP', 'SAW DN', 'RANDOM'];
        let lfoAnimationId = null;
        let activePatchingLfo = null; // NEW: null or the index (0-3) of the LFO being patched
        let KNOB_ID_TO_NAME_MAP = {}; // NEW: Populated at init
        const MAIN_LFO_DEST_IDS = { 0: 300, 1: 301 };
        const LFO_DEST_TO_MAIN_KNOB = { 300: 0, 301: 1 };
        const LFO_DEST_NONE = -1;
        const LFO_CABLE_COLORS = ['#fa9c2d', '#35a5fb', '#d85b7e', '#98ce57'];
        const LFO_CABLE_TARGET_COLORS = ['#ae332c', '#ffffff', '#843b9a', '#a44a00'];
        const lfoState = [
    { id: 0, rate: 0.5, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0, output: 0 },
    { id: 1, rate: 0.5, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0, output: 0 },
    { id: 2, rate: 0.5, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0, output: 0 },
    { id: 3, rate: 0.5, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0, output: 0 },
];
let liveLfoOutputs = [0, 0, 0, 0];
        const LFO_KNOB_MAP = {
            // Rates
            108: { lfo: 0, param: 'rate' }, 109: { lfo: 1, param: 'rate' }, 110: { lfo: 2, param: 'rate' }, 111: { lfo: 3, param: 'rate' },
            // Depths
            106: { lfo: 0, param: 'depth' }, 103: { lfo: 1, param: 'depth' }, 104: { lfo: 2, param: 'depth' }, 100: { lfo: 3, param: 'depth' },
            // Waves
            101: { lfo: 0, param: 'wave' }, 105: { lfo: 1, param: 'wave' }, 112: { lfo: 2, param: 'wave' }, 113: { lfo: 3, param: 'wave' },
            // Dests
            114: { lfo: 0, param: 'dest' }, 115: { lfo: 1, param: 'dest' }, 102: { lfo: 2, param: 'dest' }, 107: { lfo: 3, param: 'dest' },
        };
        const LFO_FX_IDS = Object.keys(LFO_KNOB_MAP).map(id => parseInt(id, 10));

        const LFO_RATE_KNOB_IDS = [108, 109, 110, 111];
        const MIN_LFO_RATE_HZ = 0.01;
        const MAX_LFO_RATE_HZ = 100;
        const LFO_RATE_RANGE_RATIO = MAX_LFO_RATE_HZ / MIN_LFO_RATE_HZ;
        const SIXTEENTH_NOTES_PER_QUARTER = 4;
  const LFO_RATE_DIVISION_STEPS = [
    { label: '32', multiplier: 512 },      // 32 bars (ultra slow)
    { label: '16', multiplier: 256 },      // 16 bars
    { label: '8', multiplier: 128 },       // 8 bars
    { label: '4', multiplier: 64 },        // 4 bars
    { label: '2', multiplier: 32 },        // 2 bars
    { label: '1', multiplier: 16 },        // 1 bar
    { label: '1/2', multiplier: 8 },       // Half note
    { label: '1/2T', multiplier: 16/3 },   // Half note triplet (≈5.33)
    { label: '1/4', multiplier: 4 },       // Quarter note
    { label: '1/4T', multiplier: 8/3 },    // Quarter triplet (≈2.67)
    { label: '1/8', multiplier: 2 },       // 8th note
    { label: '1/8T', multiplier: 4/3 },    // 8th triplet (≈1.33)
    { label: '1/16', multiplier: 1 },      // 16th note (arp speed)
    { label: '1/16T', multiplier: 2/3 },   // 16th triplet (≈0.67)
    { label: '1/32', multiplier: 0.5 },    // 32nd note
    { label: '1/64', multiplier: 0.25 },   // 64th note
];
        const LFO_RATE_DIVISION_LABELS = LFO_RATE_DIVISION_STEPS.map(step => step.label);
        const LFO_RATE_DIVISION_MULTIPLIERS = LFO_RATE_DIVISION_STEPS.map(step => step.multiplier);
        const lfoTempoLinkState = LFO_RATE_KNOB_IDS.map(() => ({ enabled: false, storedFreeValue: 0.5 }));
        let lfoTempoSyncSwitches = [];
        let lfoRateDisplays = [];

        function getLfoDestChain(lfo) {
            if (lfo && Array.isArray(lfo.destChain) && lfo.destChain.length) return lfo.destChain;
            if (lfo && lfo.dest !== undefined && lfo.dest !== LFO_DEST_NONE) return [lfo.dest];
            return [];
        }

        function formatLfoDestDisplay(chain) {
            if (!chain || !chain.length) return 'NONE';
            return chain.map(dest => KNOB_ID_TO_NAME_MAP[dest] || `ID ${dest}`).join(' + ');
        }

       function updateLfoDestDisplay(lfoIndex) {
            const destDisplay = document.getElementById(`lfo-dest-display-${lfoIndex}`);
            if (!destDisplay) return;
            destDisplay.textContent = formatLfoDestDisplay(getLfoDestChain(lfoState[lfoIndex]));
        }

        function updateVoiceWaveDisplay(voiceIndex, value) {
            const clamped = Math.max(0, Math.min(1, value ?? 0));
            const waveIndex = Math.min(VOICE_WAVEFORMS.length - 1, Math.floor(clamped * VOICE_WAVEFORMS.length));
            const displayEl = document.getElementById(`voice-${voiceIndex}-wave-display`);
            if (displayEl) {
                displayEl.textContent = VOICE_WAVEFORMS[waveIndex];
            }
        }

        function hexToRgb(hex) {
            const normalized = hex.replace('#', '');
            if (normalized.length !== 6) return null;
            const bigint = parseInt(normalized, 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255,
            };
        }

        function blendHexColors(hexA, hexB, t) {
            const rgbA = hexToRgb(hexA);
            const rgbB = hexToRgb(hexB);
            if (!rgbA || !rgbB) return hexA;
            const clamp = (val) => Math.max(0, Math.min(1, val));
            const ratio = clamp(t);
            const mix = (a, b) => Math.round(a + (b - a) * ratio);
            const toHex = (value) => value.toString(16).padStart(2, '0');
            return `#${toHex(mix(rgbA.r, rgbB.r))}${toHex(mix(rgbA.g, rgbB.g))}${toHex(mix(rgbA.b, rgbB.b))}`;
        }

        function getLfoSegmentColor(baseColor, lfoIndex, segmentIndex) {
            const targetColor = LFO_CABLE_TARGET_COLORS[lfoIndex] || baseColor;
            const position = ((segmentIndex) % 10) + 1; // 1-10 cycle

            // First five patches intensify toward the target color
            if (position <= 5) {
                const t = (position - 1) / 4; // 1st stays base, 5th hits target
                return blendHexColors(baseColor, targetColor, t);
            }

            // Next five patches fade back toward the base hue
            const tBack = (position - 6) / 4; // 6th starts at target, 10th returns to base
            return blendHexColors(targetColor, baseColor, tBack);
        }

        function lfoTargetsInclude(lfo, targetId) {
            return getLfoDestChain(lfo).includes(targetId);
        }

        function setLfoDestChain(lfoIndex, rawDestinations) {
            const normalizedChain = (Array.isArray(rawDestinations) ? rawDestinations : (rawDestinations === undefined ? [] : [rawDestinations]))
                .map(normalizePresetLfoDest)
                .filter(d => Number.isFinite(d) && d !== LFO_DEST_NONE);
            const uniqueChain = [];
            normalizedChain.forEach(dest => {
                if (!uniqueChain.includes(dest)) uniqueChain.push(dest);
            });
            const primaryDest = uniqueChain[0] ?? LFO_DEST_NONE;
            if (lfoState[lfoIndex]) {
                lfoState[lfoIndex].destChain = uniqueChain;
                lfoState[lfoIndex].dest = primaryDest;
            }
            if (synthNode) {
                synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfoIndex, param: 'destChain', value: uniqueChain } });
            }
            updateLfoDestDisplay(lfoIndex);
            drawLfoCables();
            return primaryDest;
        }
      
       // --- Constants ---
       const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
       const SCALES={'Major':[0,2,4,5,7,9,11],'Minor':[0,2,3,5,7,8,10],'Dorian':[0,2,3,5,7,9,10],'Phrygian':[0,1,3,5,7,8,10],'Lydian':[0,2,4,6,7,9,11],'Mixolydian':[0,2,4,5,7,9,10],'Locrian':[0,1,3,5,6,8,10],'Harmonic Minor':[0,2,3,5,7,8,11],'Melodic Minor':[0,2,3,5,7,9,11],'Major Pentatonic':[0,2,4,7,9],'Minor Pentatonic':[0,3,5,7,10],'Blues':[0,3,5,6,7,10],'Whole Tone':[0,2,4,6,8,10],'Chromatic':[0,1,2,3,4,5,6,7,8,9,10,11]};
       const KNOB_KEY_SPEED = 6; const MAX_TOTAL_ANGLE = 360*8;
       const MIN_FX_ANGLE = -135, MAX_FX_ANGLE = 135;
       const COLOR_BLUE = [30, 58, 138], COLOR_YELLOW = [250, 204, 21], COLOR_GREEN = [132, 204, 22], COLOR_RED = [220, 38, 38];
       const ARP_NOTE_BASE_HSL = [{h:6,s:.76,l:0.32},{h:24,s:.72,l:0.42},{h:15,s:.576,l:0.536},{h:33,s:.59,l:0.49},{h:360,s:.364,l:0.6},{h:54,s:0.58,l:0.284},{h:156,s:.38,l:0.6},{h:202,s:.852,l:0.29},{h:223,s:.852,l:0.479},{h:280,s:.203,l:0.48},{h:208,s:0.6,l:0.65},{h:275.4,s:0.6,l:0.65}];       
       const ARP_OCTAVE_LIGHTNESS_FACTOR = 0.04;
       const EUCLIDEAN_PATTERNS = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],[1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0],[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],[1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1]];
       const NUM_FEEL_PATTERNS = EUCLIDEAN_PATTERNS.length;
       const KEY_TO_FX_ID_MAP = {
           '1': 20, '2': 28, '3': 26, '-': 16, '[': 24, 'o': 18, 'k': 22, // Left Side
           '4': 21, '5': 29, '6': 27, '=': 17, ']': 25, 'p': 19, 'l': 23, // Right Side
           'q': 8,  'w': 9,  'e': 10, 'r': 11, // ADSR
           'a': 6,  's': 3,  'd': 4,  'f': 0,  // Timbre/Mod
           'z': 1,  'x': 5,  'c': 14, 'v': 15, // FX 1
           't': 12, 'y': 13, 'u': 2,  'i': 7   // FX 2
       };
        const SHIFTED_KEY_MAP = {
            '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
            '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
            '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
            ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
        };

        const MIN_ARP_RATE_BPM = 5;
        const MAX_ARP_RATE_BPM = 300;
        const DEFAULT_ARP_RATE_BPM = 100;
        const ARP_RATE_RANGE_BPM = MAX_ARP_RATE_BPM - MIN_ARP_RATE_BPM;
        const MIN_ARP_RATE_MS = 10;
        const MAX_ARP_RATE_MS = 2000;
        const ARP_RATE_RANGE_MS = MAX_ARP_RATE_MS - MIN_ARP_RATE_MS;
        const DEFAULT_ARP_RATE_MS = 60000 / (DEFAULT_ARP_RATE_BPM * SIXTEENTH_NOTES_PER_QUARTER);
        const TEMPO_MODE_BPM = 'BPM';
        const TEMPO_MODE_MS = 'MS';
        const MIDPOINT_ARP_RATE_BPM = 120;
        const MIDPOINT_ARP_RATE_VALUE = 0.5;
        const ARP_RATE_CURVE_EXP = Math.log((MIDPOINT_ARP_RATE_BPM - MIN_ARP_RATE_BPM) / ARP_RATE_RANGE_BPM) / Math.log(MIDPOINT_ARP_RATE_VALUE);
        const ARP_RATE_CURVE_INV_EXP = 1 / ARP_RATE_CURVE_EXP;
        const MIN_MIDI_EXPORT_BPM = 40;
        const MASTER_CLOCK_INTERVAL_MS = 2;
        const MASTER_CLOCK_TOLERANCE_MS = 1;
        const TEMPO_KNOB_DOUBLE_TAP_MS = 350;

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function applyIndicatorTransform(indicator, angle) {
            if (!indicator) return;
            const baseTransform = indicator.dataset.baseTransform || '';
            const rotation = `rotate(${angle}deg)`;
            indicator.style.transform = baseTransform ? `${baseTransform} ${rotation}` : rotation;
        }

        function getNowMs() {
            return performance.now();
        }

        function normalizeArpRateBpm(rateBpm) {
            return Math.round(clamp(rateBpm, MIN_ARP_RATE_BPM, MAX_ARP_RATE_BPM));
        }

        function formatTempoLabel(bpm) {
            return `${bpm} BPM`;
        }

        function formatRateMsLabel(rateMs) {
            return `${rateMs.toFixed(1)} MS`;
        }

        function normalizeArpRateMs(rateMs) {
            return clamp(rateMs, MIN_ARP_RATE_MS, MAX_ARP_RATE_MS);
        }

        function valueToArpRateMs(value) {
            const normalized = clamp(1 - value, 0, 1);
            return MIN_ARP_RATE_MS + Math.pow(normalized, 3) * ARP_RATE_RANGE_MS;
        }

        function arpRateMsToValue(rateMs) {
            const clamped = normalizeArpRateMs(rateMs);
            const normalized = (clamped - MIN_ARP_RATE_MS) / ARP_RATE_RANGE_MS;
            return 1 - Math.cbrt(clamp(normalized, 0, 1));
        }

        let masterClockWorker = null;
        let masterClockRunning = false;
        let masterClockStartTime = null;
        let midiClockEnabled = false;
        let midiClockRunning = false;
        let midiClockBpm = DEFAULT_ARP_RATE_BPM;
        let tempoMode = TEMPO_MODE_BPM;

        function initMasterClockWorker() {
            if (masterClockWorker) return;
            masterClockWorker = new Worker(new URL('./clock-worker.js', import.meta.url), { type: 'module' });
            masterClockWorker.onmessage = (event) => {
                const { type } = event.data || {};
                if (type === 'tick') {
                    const timestamp = getNowMs();
                    knobState.forEach((state, idx) => {
                        if (state?.arpRunning) {
                            updateArpeggiator(idx, timestamp);
                        }
                    });
                } else if (type === 'midiTick' && midiClockEnabled && midiClockRunning) {
                    sendMidiMessage([0xF8]);
                }
            };
        }

        function ensureMasterClock() {
            initMasterClockWorker();
            if (tempoMode === TEMPO_MODE_BPM && masterClockStartTime === null) {
                masterClockStartTime = getNowMs();
            }
            if (masterClockRunning || !masterClockWorker) return;
            masterClockWorker.postMessage({ type: 'start', intervalMs: MASTER_CLOCK_INTERVAL_MS });
            masterClockRunning = true;
        }

        function stopMasterClockIfIdle() {
            if (!masterClockRunning || !masterClockWorker) return;
            if (knobState.some(state => state?.arpRunning)) return;
            masterClockWorker.postMessage({ type: 'stop' });
            masterClockRunning = false;
            masterClockStartTime = null;
            updateMidiClockState();
        }

        function quantizeToNextSixteenth(now, intervalMs) {
            if (intervalMs <= 0) return now;
            if (masterClockStartTime === null) masterClockStartTime = now;
            const elapsed = now - masterClockStartTime;
            const ticksSinceOrigin = Math.ceil(elapsed / intervalMs);
            let nextTime = masterClockStartTime + ticksSinceOrigin * intervalMs;
            if (nextTime <= now) nextTime += intervalMs;
            return nextTime;
        }

        function getMidiClockBpm() {
            midiClockBpm = calculateMidiBpm();
            return midiClockBpm;
        }

        function startMidiClockTransport() {
            if (!midiClockEnabled || midiClockRunning) return;
            initMasterClockWorker();
            const bpm = getMidiClockBpm();
            if (masterClockWorker) {
                masterClockWorker.postMessage({ type: 'enableMidiClock', bpm });
            }
            midiClockRunning = true;
            sendMidiMessage([0xFA]);
        }

        function stopMidiClockTransport() {
            if (!midiClockRunning) return;
            if (masterClockWorker) {
                masterClockWorker.postMessage({ type: 'disableMidiClock' });
            }
            midiClockRunning = false;
            sendMidiMessage([0xFC]);
        }

        function updateMidiClockBpm() {
            if (!midiClockRunning || !masterClockWorker) return;
            const bpm = getMidiClockBpm();
            masterClockWorker.postMessage({ type: 'updateMidiBpm', bpm });
        }

        function updateMidiClockState() {
            const shouldRun = midiClockEnabled && knobState.some(state => state?.arpRunning);
            if (shouldRun && !midiClockRunning) {
                startMidiClockTransport();
            } else if (!shouldRun && midiClockRunning) {
                stopMidiClockTransport();
            } else if (shouldRun && midiClockRunning) {
                updateMidiClockBpm();
            }
        }

        function startArpClockForState(knobId) {
            const state = knobState[knobId];
            if (!state || !state.arpRunning) return;
            if (tempoMode === TEMPO_MODE_BPM) {
                const interval = bpmToSixteenthMs(state.arpRateBpm);
                const now = getNowMs();

                // FIX: If this is the FIRST arp (clock is null), start IMMEDIATELY.
                // If an arp is already playing, THEN snap to the next Quarter Note (interval * 4).
                if (masterClockStartTime === null) {
                    masterClockStartTime = now;
                    state.nextArpStepTime = now;
                } else {
                    state.nextArpStepTime = quantizeToNextSixteenth(now, interval * 4);
                }
            } else {
                const now = getNowMs();
                const interval = state.arpRateMs ?? DEFAULT_ARP_RATE_MS;
                state.lastArpStepTime = now - interval;
            }
            ensureMasterClock();
            updateMidiClockState();
        }

        function restartArpClocksForMode() {
            knobState.forEach((state, idx) => {
                if (!state) return;
                if (state.arpRafId) {
                    clearInterval(state.arpRafId);
                    state.arpRafId = null;
                }
                state.nextArpStepTime = 0;
                if (state.arpRunning) {
                    startArpClockForState(idx);
                }
            });
            if (knobState.some(state => state?.arpRunning)) {
                ensureMasterClock();
            } else {
                stopMasterClockIfIdle();
            }
        }

        function setTempoMode(newMode) {
            if (newMode !== TEMPO_MODE_BPM && newMode !== TEMPO_MODE_MS) return;
            if (tempoMode === newMode) return;
            tempoMode = newMode;

            if (tempoMode === TEMPO_MODE_BPM) {
                masterClockStartTime = null;
            }

            const now = getNowMs();
            knobState.forEach((state, idx) => {
                if (!state) return;
                if (tempoMode === TEMPO_MODE_BPM) {
                    if (state.arpRafId) {
                        clearInterval(state.arpRafId);
                        state.arpRafId = null;
                    }
                    state.lastArpStepTime = 0;
                    state.arpRateBpm = normalizeArpRateBpm(state.arpRateBpm ?? DEFAULT_ARP_RATE_BPM);
                    state.arpRateMs = bpmToSixteenthMs(state.arpRateBpm);
                    updateTempoKnobIndicator(idx, arpRateBpmToValue(state.arpRateBpm));
                } else {
                    state.nextArpStepTime = 0;
                    state.lastArpStepTime = now;
                    state.arpRateMs = normalizeArpRateMs(state.arpRateMs ?? DEFAULT_ARP_RATE_MS);
                    state.arpRateBpm = normalizeArpRateBpm(60000 / (state.arpRateMs * SIXTEENTH_NOTES_PER_QUARTER));
                    updateTempoKnobIndicator(idx, arpRateMsToValue(state.arpRateMs));
                }
            });

            restartArpClocksForMode();
            updateTempoDisplays();
            applyModulatedArpUiPreviews();
            handleTempoLinkedControls();
            updateMidiClockState();
            if (document.body) {
                document.body.setAttribute('data-tempo-mode', tempoMode);
            }
        }

        function toggleTempoMode() {
            const nextMode = tempoMode === TEMPO_MODE_BPM ? TEMPO_MODE_MS : TEMPO_MODE_BPM;
            setTempoMode(nextMode);
        }

        function handleTempoKnobDoubleClick(event) {
            event.preventDefault();
            event.stopPropagation();
            toggleTempoMode();
        }

        function valueToArpRateBpm(value) {
            const normalized = clamp(value, 0, 1);
            const curved = Math.pow(normalized, ARP_RATE_CURVE_EXP);
            return MIN_ARP_RATE_BPM + curved * ARP_RATE_RANGE_BPM;
        }

        function arpRateBpmToValue(rateBpm) {
            const clampedRate = clamp(rateBpm, MIN_ARP_RATE_BPM, MAX_ARP_RATE_BPM);
            const normalized = (clampedRate - MIN_ARP_RATE_BPM) / ARP_RATE_RANGE_BPM;
            return clamp(Math.pow(Math.max(0, normalized), ARP_RATE_CURVE_INV_EXP), 0, 1);
        }

        function bpmToSixteenthMs(rateBpm) {
            const clampedRate = clamp(rateBpm, MIN_ARP_RATE_BPM, MAX_ARP_RATE_BPM);
            return 60000 / (clampedRate * SIXTEENTH_NOTES_PER_QUARTER);
        }

        function updateTempoKnobIndicator(knobId, normalizedValue) {
            const fxId = knobId === 0 ? 16 : 17;
            const knobData = fxKnobData[fxId];
            if (!knobData) return;
            const clampedValue = clamp(normalizedValue, 0, 1);
            knobData.value = clampedValue;
            knobData.angle = MIN_FX_ANGLE + clampedValue * (MAX_FX_ANGLE - MIN_FX_ANGLE);
            applyIndicatorTransform(knobData.indicator, knobData.angle);
        }

        function updateTempoDisplays() {
            knobState.forEach(state => {
                if (!state?.dom?.rateDisplay) return;
                const text = tempoMode === TEMPO_MODE_BPM
                    ? formatTempoLabel(state.arpRateBpm)
                    : formatRateMsLabel(state.arpRateMs);
                state.dom.rateDisplay.textContent = text;
            });
        }

        function tempoNormalizedToIntervalMs(normalizedValue) {
            const clampedValue = clamp(normalizedValue, 0, 1);
            if (tempoMode === TEMPO_MODE_BPM) {
                const bpm = valueToArpRateBpm(clampedValue);
                return bpmToSixteenthMs(bpm);
            }
            return valueToArpRateMs(clampedValue);
        }

        function intervalMsToLfoRateParam(intervalMs) {
            if (!Number.isFinite(intervalMs) || intervalMs <= 0) return 0;
            const rateHz = 1000 / intervalMs;
            const ratio = Math.max(rateHz / MIN_LFO_RATE_HZ, 1e-6);
            const normalized = Math.log(ratio) / Math.log(LFO_RATE_RANGE_RATIO);
            return clamp(normalized, 0, 1);
        }

        function tempoNormalizedToLfoRateParam(normalizedValue) {
            const intervalMs = tempoNormalizedToIntervalMs(normalizedValue);
            return intervalMsToLfoRateParam(intervalMs);
        }

        function setLfoKnobNormalizedValue(rateKnobId, normalizedValue) {
            const knobData = fxKnobData[rateKnobId];
            if (!knobData) return;
            const clampedValue = clamp(normalizedValue, 0, 1);
            knobData.value = clampedValue;
            knobData.angle = MIN_FX_ANGLE + clampedValue * (MAX_FX_ANGLE - MIN_FX_ANGLE);
            applyIndicatorTransform(knobData.indicator, knobData.angle);
        }

        function formatLfoRateHzLabel(normalizedValue) {
            const clampedValue = clamp(normalizedValue, 0, 1);
            const hz = MIN_LFO_RATE_HZ * Math.pow(LFO_RATE_RANGE_RATIO, clampedValue);
            if (hz >= 100) return `${hz.toFixed(0)} HZ`;
            if (hz >= 10) return `${hz.toFixed(1)} HZ`;
            return `${hz.toFixed(2)} HZ`;
        }

        function getLfoDivisionIndex(normalizedValue) {
            const clampedValue = clamp(normalizedValue, 0, 1);
            return Math.round(clampedValue * (LFO_RATE_DIVISION_LABELS.length - 1));
        }

        function getLfoDivisionMultiplier(normalizedValue) {
            const idx = getLfoDivisionIndex(normalizedValue);
            return LFO_RATE_DIVISION_MULTIPLIERS[idx] ?? 1;
        }

        function getLfoDivisionLabel(normalizedValue) {
            const idx = getLfoDivisionIndex(normalizedValue);
            return LFO_RATE_DIVISION_LABELS[idx] || 'SYNC';
        }

        function updateLfoRateDisplay(index, normalizedValue, forceSyncedState) {
            const display = lfoRateDisplays[index];
            if (!display) return;
            const isLinked = forceSyncedState ?? lfoTempoLinkState[index].enabled;
            if (isLinked) {
                display.textContent = getLfoDivisionLabel(normalizedValue);
            } else {
                display.textContent = formatLfoRateHzLabel(normalizedValue);
            }
        }

        function getTempoSourceState() {
            const left = knobState[0];
            const right = knobState[1];
            const leftOn = !!left?.isArpOn;
            const rightOn = !!right?.isArpOn;
            if (!leftOn && !rightOn) return null;
            if (leftOn && rightOn && !isArpRateSynced) return null;
            if (leftOn) return left;
            if (rightOn) return right;
            return null;
        }

        function getTempoSourceIntervalMs() {
            const sourceState = getTempoSourceState();
            if (!sourceState) return null;
            if (tempoMode === TEMPO_MODE_BPM) {
                return bpmToSixteenthMs(sourceState.arpRateBpm);
            }
            return sourceState.arpRateMs;
        }

        function applyTempoLinkedLfoRate(index, normalizedOverride, sharedIntervalMs) {
            const link = lfoTempoLinkState[index];
            if (!link?.enabled) return;
            const rateKnobId = LFO_RATE_KNOB_IDS[index];
            const knobData = fxKnobData[rateKnobId];
            const knobValue = clamp(normalizedOverride ?? knobData?.value ?? 0.5, 0, 1);
            const tempoIntervalMs = sharedIntervalMs ?? getTempoSourceIntervalMs();
            if (!Number.isFinite(tempoIntervalMs) || tempoIntervalMs <= 0) {
                updateLfoRateDisplay(index, knobValue, true);
                return;
            }
            const multiplier = getLfoDivisionMultiplier(knobValue);
            const lfoIntervalMs = tempoIntervalMs * multiplier;
            const lfoRateParam = intervalMsToLfoRateParam(lfoIntervalMs);
            
            lfoState[index].rate = lfoRateParam;
            if (synthNode) {
                synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: lfoRateParam } });
            }
            updateLfoRateDisplay(index, knobValue, true);
        }

        function updateSyncedLfoRateParams() {
            if (!lfoTempoLinkState.some(link => link.enabled)) return;
            const tempoIntervalMs = getTempoSourceIntervalMs();
            if (!Number.isFinite(tempoIntervalMs) || tempoIntervalMs <= 0) return;
            lfoTempoLinkState.forEach((link, idx) => {
                if (!link.enabled) return;
                applyTempoLinkedLfoRate(idx, undefined, tempoIntervalMs);
            });
        }

        function handleTempoLinkedControls() {
            if (!lfoTempoLinkState.some(link => link.enabled)) return;
            updateSyncedLfoRateParams();
        }

        function handleSyncedLfoRateChange(lfoIndex, normalizedValue) {
            if (!lfoTempoLinkState[lfoIndex]?.enabled) return;
            const tempoIntervalMs = getTempoSourceIntervalMs();
            if (!Number.isFinite(tempoIntervalMs) || tempoIntervalMs <= 0) return;
            const clampedValue = clamp(normalizedValue, 0, 1);
            applyTempoLinkedLfoRate(lfoIndex, clampedValue, tempoIntervalMs);
        }

        function canUseLfoTempoSync() {
            return !!getTempoSourceState();
        }

        function setLfoTempoSync(index, shouldEnable, storedFreeValueOverride) {
            const link = lfoTempoLinkState[index];
            const switchEl = lfoTempoSyncSwitches[index];
            if (!link || !switchEl) return;

            if (shouldEnable) {
                if (!canUseLfoTempoSync() || link.enabled) return;
                const rateKnobId = LFO_RATE_KNOB_IDS[index];
                const knobData = fxKnobData[rateKnobId];
                const overrideFreeValue = storedFreeValueOverride ?? knobData?.value;
                if (overrideFreeValue !== undefined) {
                    link.storedFreeValue = clamp(overrideFreeValue, 0, 1);
                }
                link.enabled = true;
                switchEl.classList.add('on');
                updateSyncedLfoRateParams();
            } else {
                if (!link.enabled) return;
                link.enabled = false;
                switchEl.classList.remove('on');
                const rateKnobId = LFO_RATE_KNOB_IDS[index];
                const fallbackValue = link.storedFreeValue ?? 0.5;
                setLfoKnobNormalizedValue(rateKnobId, fallbackValue);
                lfoState[index].rate = fallbackValue;
                if (synthNode) {
                    synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: fallbackValue } });
                }
                updateLfoRateDisplay(index, fallbackValue, false);
            }

            updateLfoTempoSwitchStates();
        }

       function updateLfoTempoSwitchStates() {
    const allow = canUseLfoTempoSync();
    lfoTempoSyncSwitches.forEach((switchEl, idx) => {
        if (!switchEl) return;
        const wrapper = switchEl.closest('.lfo-tempo-switch-wrapper');
        
        // Force the switch to match the actual state
        if (lfoTempoLinkState[idx].enabled) {
            switchEl.classList.add('on');
        } else {
            switchEl.classList.remove('on');
        }
        
        if (allow) {
            switchEl.classList.remove('switch-disabled');
            wrapper?.classList.remove('switch-disabled');
        } else {
            switchEl.classList.add('switch-disabled');
            wrapper?.classList.add('switch-disabled');
            if (lfoTempoLinkState[idx].enabled) {
                setLfoTempoSync(idx, false);
            }
        }
    });
}
        function resetLfoTempoSyncState() {
            lfoTempoLinkState.forEach((link, idx) => {
                if (link.enabled) {
                    setLfoTempoSync(idx, false);
                }
                const rateKnobId = LFO_RATE_KNOB_IDS[idx];
                const knobData = fxKnobData[rateKnobId];
                if (knobData) {
                    link.storedFreeValue = knobData.value;
                    updateLfoRateDisplay(idx, knobData.value, false);
                }
            });
            updateLfoTempoSwitchStates();
        }

        function preserveMsArpPhase(state, previousRateMs, nextRateMs) {
            if (!state || !state.arpRunning || tempoMode !== TEMPO_MODE_MS) return;
            const now = getNowMs();
            const prev = Number.isFinite(previousRateMs) && previousRateMs > 0 ? previousRateMs : null;
            const next = Number.isFinite(nextRateMs) && nextRateMs > 0 ? nextRateMs : null;
            if (!next) {
                state.lastArpStepTime = now;
                return;
            }
            if (!prev || !Number.isFinite(state.lastArpStepTime)) {
                state.lastArpStepTime = now - next;
                return;
            }
            const elapsed = now - state.lastArpStepTime;
            const ratio = clamp(elapsed / prev, 0, 1);
            state.lastArpStepTime = now - (ratio * next);
        }

        function preserveBpmArpPhase(state, previousIntervalMs, nextIntervalMs) {
            if (!state || !state.arpRunning || tempoMode !== TEMPO_MODE_BPM) return;
            const now = getNowMs();
            const prev = Number.isFinite(previousIntervalMs) && previousIntervalMs > 0 ? previousIntervalMs : null;
            const next = Number.isFinite(nextIntervalMs) && nextIntervalMs > 0 ? nextIntervalMs : null;
            if (!next) {
                state.nextArpStepTime = quantizeToNextSixteenth(now, bpmToSixteenthMs(state.arpRateBpm));
                return;
            }
            if (!prev || !Number.isFinite(state.nextArpStepTime)) {
                state.nextArpStepTime = now + next;
                return;
            }
            const remaining = state.nextArpStepTime - now;
            const ratio = clamp(remaining / prev, 0, 1);
            const adjusted = Math.max(ratio * next, MASTER_CLOCK_INTERVAL_MS);
            state.nextArpStepTime = now + adjusted;
        }

        function setArpRateFromBpm(knobId, rateBpm) {
            const state = knobState[knobId];
            if (!state) return;

            const clampedRate = normalizeArpRateBpm(rateBpm);
            const previousRateMs = state.arpRateMs;
            state.arpRateBpm = clampedRate;
            state.arpRateMs = bpmToSixteenthMs(clampedRate);
            if (state.dom?.rateDisplay) {
                const label = tempoMode === TEMPO_MODE_BPM
                    ? formatTempoLabel(clampedRate)
                    : formatRateMsLabel(state.arpRateMs);
                state.dom.rateDisplay.textContent = label;
            }
            if (state.arpRunning) {
                if (tempoMode === TEMPO_MODE_BPM) {
                    preserveBpmArpPhase(state, previousRateMs, state.arpRateMs);
                } else {
                    preserveMsArpPhase(state, previousRateMs, state.arpRateMs);
                }
            }

            const knobValue = tempoMode === TEMPO_MODE_BPM
                ? arpRateBpmToValue(clampedRate)
                : arpRateMsToValue(state.arpRateMs);
            updateTempoKnobIndicator(knobId, knobValue);
            handleTempoLinkedControls();
            updateMidiClockState();
        }

        function setArpRateFromMs(knobId, rateMs) {
            const state = knobState[knobId];
            if (!state) return;

            const clampedRate = normalizeArpRateMs(rateMs);
            const previousRateMs = state.arpRateMs;
            state.arpRateMs = clampedRate;
            const bpmEquivalent = normalizeArpRateBpm(60000 / (clampedRate * SIXTEENTH_NOTES_PER_QUARTER));
            state.arpRateBpm = bpmEquivalent;

            if (state.dom?.rateDisplay) {
                const label = tempoMode === TEMPO_MODE_MS
                    ? formatRateMsLabel(clampedRate)
                    : formatTempoLabel(state.arpRateBpm);
                state.dom.rateDisplay.textContent = label;
            }

            if (state.arpRunning) {
                if (tempoMode === TEMPO_MODE_MS) {
                    preserveMsArpPhase(state, previousRateMs, clampedRate);
                } else {
                    preserveBpmArpPhase(state, previousRateMs, state.arpRateMs);
                }
            }

            const knobValue = tempoMode === TEMPO_MODE_MS
                ? arpRateMsToValue(clampedRate)
                : arpRateBpmToValue(state.arpRateBpm);
            updateTempoKnobIndicator(knobId, knobValue);
            handleTempoLinkedControls();
            updateMidiClockState();
        }

        function handleArpRateButton(knobId, multiplier) {
            if (!Number.isFinite(multiplier) || multiplier === 0) return;
            const targets = isArpRateSynced ? [0, 1] : [knobId];
            targets.forEach(targetId => {
                const state = knobState[targetId];
                if (!state) return;
                if (tempoMode === TEMPO_MODE_BPM) {
                    const newRate = state.arpRateBpm * multiplier;
                    setArpRateFromBpm(targetId, newRate);
                } else {
                    const newRateMs = state.arpRateMs / multiplier;
                    setArpRateFromMs(targetId, newRateMs);
                }
            });
        }

        function updateRateButtonLockState() {
            const targets = [masterArpControls, synthContainer, document?.body];
            targets.forEach(el => el?.classList.remove('rate-buttons-disabled'));
            rateDisplayRows.forEach(row => row.classList.remove('rate-buttons-disabled'));
        }
      
       // --- State for the two main knobs & Arps ---
     const knobState = [
    { id: 0, isNoteOn: false, isHeld: false, totalAngle: Math.random()*MAX_TOTAL_ANGLE, lastDragAngle: 0, currentOctave: 3, dom: {}, touchId: null, baseColor: [0,0,0],
      isArpOn: false, isSweepMode: true, arpNotes: [], isArpHoldOn: false, arpRateBpm: DEFAULT_ARP_RATE_BPM, arpRateMs: DEFAULT_ARP_RATE_MS, arpOctaveRange: 0, feelKnobValue: 0.0, currentFeelPattern: EUCLIDEAN_PATTERNS[0], euclideanStepCounter: 0,
      arpTranspose: 0, arpRunning: false, nextArpStepTime: 0, lastArpStepTime: 0, arpRafId: null, currentArpNoteIndex: 0, currentOctaveStep: 0, arpDirection: 1, arpUpDownState: 0, lastPlayedMidi: null, arpLastVisualIndex: -1, lastNoteOnTime: 0, lastVisualMidi: null },
    { id: 1, isNoteOn: false, isHeld: false, totalAngle: Math.random()*MAX_TOTAL_ANGLE, lastDragAngle: 0, currentOctave: 3, dom: {}, touchId: null, baseColor: [0,0,0],
      isArpOn: false, isSweepMode: true, arpNotes: [], isArpHoldOn: false, arpRateBpm: DEFAULT_ARP_RATE_BPM, arpRateMs: DEFAULT_ARP_RATE_MS, arpOctaveRange: 0, feelKnobValue: 0.0, currentFeelPattern: EUCLIDEAN_PATTERNS[0], euclideanStepCounter: 0,
      arpTranspose: 0, arpRunning: false, nextArpStepTime: 0, lastArpStepTime: 0, arpRafId: null, currentArpNoteIndex: 0, currentOctaveStep: 0, arpDirection: 1, arpUpDownState: 0, lastPlayedMidi: null, arpLastVisualIndex: -1, lastNoteOnTime: 0, lastVisualMidi: null }
];
      
       // --- Global Arp State ---
       let isArpRateSynced = false;
       let isArpLockEnabled = false;
       let currentArpOrder = "As Played";
      
       // --- DOM Elements ---
      let synthContainer, powerSwitch, keySelector, scaleSelector, customScaleBuilder, savePresetButton, loadPresetInput, arpSyncSwitch;
      let presetNameDisplay, presetDisplayContainer, presetPrevButton, presetNextButton;
      let masterArpControls, arpOrderSelector, arpLockSwitch, lfoLockSwitch;
      let allArpControlGrids;
      let rateDisplayRows = [];
      let modalOverlay, howToButton, closeModalButton, shareButton;

      let currentPresetMetadata = null;

      import { PRESETS } from './presets.js';


      const PRESET_NAV_EXCLUDED_CATEGORIES = new Set(['ARPS', 'RANDOM', 'FX', 'INIT']);
      let presetNavigationList = [];
      let currentPresetNavIndex = null;

       

       function hslToRgb(h, s, l) {
           let r, g, b;
           if (s === 0) { r = g = b = l; }
           else { const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
               const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; h /= 360;
               r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3); }
           return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
       }
      
       // --- WAV helpers ---
       const FILE_NOUNS=["street","light","area","field","cloud","river","forest","stone","glass","paper","pixel","laser","echo","wave","dawn","dusk","night","sun","moon","star","comet","orbit","nova","aurora","ridge","valley","canyon","desert","oasis","island","harbor","shore","coast","dune","meadow","prairie","plain","hill","mountain","summit","cliff","cave","tunnel","bridge","path","trail","road","alley","lane","plaza","square","tower","temple","vault","cellar","attic","loft","studio","cabin","bunker","hangar","depot","station","port","dock","yard","market","arcade","gate","portal","arch","courtyard","garden","grove","orchard","hedge","lawn","terrace","balcony","gallery","museum","library","factory","engine","boiler","furnace","mill","forge","workshop","lab","module","circuit","socket","relay","switch","sensor","motor","servo","valve","gear","spring","bearing","magnet","coil","antenna","radar","beacon","signal","channel","grid","matrix","vector","scalar","apex","nadir","zenith","horizon","meridian","delta","gamma","omega","alpha","sigma","vertex","stripe","pattern","phase","pulse","current","voltage","charge","flux","plasma","neon","vapor","ember","ash","smoke","steam","mist","haze","fog","rain","thunder","spark","arc","glow","flare","beam","ray","shadow","mirror","crystal","prism","facet","tile","brick","steel","iron","copper","silver","gold","chrome","titanium","carbon","graphite","fiber","weave","fabric","canvas","ink","paint","charcoal","grain","ripple","foam","surf","tide","wharf","canopy","pillar","column","spire","span","truss","frame","panel","plate","fin","wing","keel","hull","chassis","bay","slot","rack","array","stack","cache","buffer","packet","cluster","node","router","bus","queue","gate","clock","cycle","kernel","shell","daemon","sprite","shader","fragment","sample","key","scale","octave","tempo","rhythm","chord","tone","drift","drone","hum","whirl","whisper","rattle","clatter","stride","fold","crease","hinge","joint","anchor","bracket"];
      function generateRecordingFilename(extension = 'wav') {
           const pick = () => FILE_NOUNS[Math.floor(Math.random() * FILE_NOUNS.length)];
           let a = pick(), b = pick(); for (let i = 0; i < 5 && a === b; i++) b = pick();
           const xxx = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
           return `N-OB-${a}-${b}-${xxx}-.${extension}`;
       }
const SAFE_UNIVERSAL_TARGETS = [
    20, 21, // Filters
    4,      // Detune
    6,      // Chorus
    1, 5,   // Distortion & AM
    12, 14  // Reverb & Delay Mix
];

// 2. Arp-Only Targets (Hidden in Sound Mode)
const SAFE_ARP_TARGETS = [
    24, 25, // Arp Transpose
    22, 23, // Arp Feel
    18, 19  // Arp Octaves
];

const LFO_PARAM_TARGETS = [
    108, 106, // LFO 0 Rate, Depth
    109, 103, // LFO 1 Rate, Depth
    110, 104, // LFO 2 Rate, Depth
    111, 100  // LFO 3 Rate, Depth
];

// 2. The Smart LFO Generator
function generateComplexRandomLfoState(includeArpTargets = true) {
    const numActiveLfos = 2 + Math.floor(Math.random() * 2); 
    
    // Build the pool of valid audio targets based on the mode
    let validAudioTargets = [...SAFE_UNIVERSAL_TARGETS];
    if (includeArpTargets) {
        validAudioTargets = validAudioTargets.concat(SAFE_ARP_TARGETS);
    }

    return Array.from({ length: 4 }, (_, currentLfoIndex) => {
        if (currentLfoIndex >= numActiveLfos) {
            return { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false };
        }

        // Step A: Choose Primary Destination
        let primaryDest;
        const roll = Math.random();
        
        // 25% Chance for Cross-Modulation
        if (roll < 0.25) {
            const validLfoTargets = LFO_PARAM_TARGETS.filter(id => {
                const targetOwnerIndex = LFO_KNOB_MAP[id]?.lfo;
                return targetOwnerIndex !== currentLfoIndex;
            });
            primaryDest = validLfoTargets[Math.floor(Math.random() * validLfoTargets.length)];
        } else {
            // Pick from our filtered list
            primaryDest = validAudioTargets[Math.floor(Math.random() * validAudioTargets.length)];
        }

        // Step B: Smart Depth
        let depth = Math.random();
        if (primaryDest === 4) depth *= 0.3; // Tame Detune
        if (LFO_PARAM_TARGETS.includes(primaryDest)) depth = 0.3 + (Math.random() * 0.5);
        if (SAFE_ARP_TARGETS.includes(primaryDest)) depth = 0.3 + (Math.random() * 0.7); // Arp knobs need high depth

        // Step C: Chaining (30% Chance)
        const destChain = [primaryDest];
        if (Math.random() < 0.3 && !LFO_PARAM_TARGETS.includes(primaryDest)) {
            let secondary = validAudioTargets[Math.floor(Math.random() * validAudioTargets.length)];
            if (secondary !== primaryDest) destChain.push(secondary);
        }

        // Step D: Rate
        const useSync = Math.random() > 0.4;
        let rate;
        if (useSync) {
            const syncValues = [0.5, 0.6, 0.75, 0.85]; 
            rate = syncValues[Math.floor(Math.random() * syncValues.length)];
        } else {
            rate = Math.random() * 0.4; 
        }

        return {
            rate: parseFloat(rate.toFixed(4)),
            depth: parseFloat(depth.toFixed(4)),
            wave: Math.floor(Math.random() * 6),
            dest: primaryDest,
            destChain: destChain,
            tempoSync: useSync,
            storedFreeValue: Math.random()
        };
    });
}

      function buildPresetData() {
           const metadata = currentPresetMetadata || {
               name: (presetNameDisplay?.textContent || '').trim(),
               sourceType: 'factory',
               category: null,
           };

           // 1. Create a helper to round numbers to 4 decimal places
           const trim = (num) => {
               if (typeof num !== 'number') return num;
               // Round to 4 decimals to save massive amounts of URL space
               return parseFloat(num.toFixed(4));
           };

           return {
               tempoMode: tempoMode,
               key: keySelector.value,
               scale: scaleSelector.value,
               customScale: scaleSelector.value === 'Custom' ? customScale : [],
               allowDuplicateNotesMode: allowDuplicateNotesMode,
               isLfoMode: isLfoMode,
               // 2. Apply 'trim' to all float values below
               lfoState: lfoState.map(lfo => ({
                   rate: trim(lfo.rate),
                   depth: trim(lfo.depth),
                   wave: lfo.wave,
                   dest: lfo.dest,
                   destChain: getLfoDestChain(lfo),
                   tempoSync: lfoTempoLinkState[lfo.id]?.enabled || false,
                   storedFreeValue: trim(lfoTempoLinkState[lfo.id]?.storedFreeValue ?? 0.5)
                })),
               knobSettings: knobState.map(k => ({ id: k.id, totalAngle: trim(k.totalAngle) })),
              // FILTERED FX SETTINGS: 
               // Only save if value > 0 OR if it's a special knob where 0 is meaningful (non-default).
               // IDs to keep even at 0: 
               // 2 (Master Filter), 7 (Master Vol), 10 (Sustain), 
               // 16/17 (Rates), 20/21 (Osc Filters), 24/25 (Transpose), 26/27 (Osc Vol)
               fxSettings: Object.values(fxKnobData)
                   .map(k => ({ id: k.id, value: trim(k.value) }))
                   .filter(s => s.value > 0 || [2, 7, 10, 16, 17, 20, 21, 24, 25, 26, 27].includes(s.id)),
               arpSettings: { 
                   isArpRateSynced: isArpRateSynced, 
                   currentArpOrder: currentArpOrder, 
                   arp1: { 
                       isOn: knobState[0].isArpHoldOn, 
                       isArpOn: knobState[0].isArpOn, 
                       isSweepMode: knobState[0].isSweepMode, 
                       octaves: knobState[0].arpOctaveRange, 
                       feelValue: trim(knobState[0].feelKnobValue), 
                       notes: knobState[0].arpNotes, 
                       transpose: knobState[0].arpTranspose 
                   }, 
                   arp2: { 
                       isOn: knobState[1].isArpHoldOn, 
                       isArpOn: knobState[1].isArpOn, 
                       isSweepMode: knobState[1].isSweepMode, 
                       octaves: knobState[1].arpOctaveRange, 
                       feelValue: trim(knobState[1].feelKnobValue), 
                       notes: knobState[1].arpNotes, 
                       transpose: knobState[1].arpTranspose 
                   } 
               },
               metadata: {
                   name: (metadata.name || '').trim(),
                   sourceType: metadata.sourceType || 'factory',
                   category: metadata.category ?? null,
               },
           };
      }

      // --- Compact preset encoding helpers ---
      // LZ-based encoder adapted from LZ-String (MIT License)
      const lzBaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      function lzGetCharFromInt(a) { return lzBaseChars.charAt(a); }
      function lzKeyStrUriSafe() { return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$'; }
      function lzGetBaseValue(alphabet, character) {
           const baseReverseDic = {};
           if (!baseReverseDic[alphabet]) {
               baseReverseDic[alphabet] = {};
               for (let i = 0; i < alphabet.length; i++) {
                   baseReverseDic[alphabet][alphabet.charAt(i)] = i;
               }
           }
           return baseReverseDic[alphabet][character];
      }
      const LZString = {
           compressToEncodedURIComponent: function(input) {
               if (input == null) return '';
               return LZString._compress(input, 6, (a) => lzKeyStrUriSafe().charAt(a));
           },
           decompressFromEncodedURIComponent: function(input) {
               if (input == null) return '';
               input = input.replace(/\s/g, '+');
               return LZString._decompress(input.length, 32, (index) => lzGetBaseValue(lzKeyStrUriSafe(), input.charAt(index)));
           },
           _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
               if (uncompressed == null) return '';
               let i, value;
               const context_dictionary = {};
               const context_dictionaryToCreate = {};
               let context_c = '';
               let context_wc = '';
               let context_w = '';
               let context_enlargeIn = 2;
               let context_dictSize = 3;
               let context_numBits = 2;
               const context_data = [];
               let context_data_val = 0;
               let context_data_position = 0;

               for (let ii = 0; ii < uncompressed.length; ii += 1) {
                   context_c = uncompressed.charAt(ii);
                   if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                       context_dictionary[context_c] = context_dictSize++;
                       context_dictionaryToCreate[context_c] = true;
                   }
                   context_wc = context_w + context_c;
                   if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                       context_w = context_wc;
                   } else {
                       if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                           if (context_w.charCodeAt(0) < 256) {
                               for (i = 0; i < context_numBits; i++) {
                                   context_data_val = (context_data_val << 1);
                                   if (context_data_position === bitsPerChar - 1) {
                                       context_data_position = 0;
                                       context_data.push(getCharFromInt(context_data_val));
                                       context_data_val = 0;
                                   } else {
                                       context_data_position++;
                                   }
                               }
                               value = context_w.charCodeAt(0);
                               for (i = 0; i < 8; i++) {
                                   context_data_val = (context_data_val << 1) | (value & 1);
                                   if (context_data_position === bitsPerChar - 1) {
                                       context_data_position = 0;
                                       context_data.push(getCharFromInt(context_data_val));
                                       context_data_val = 0;
                                   } else {
                                       context_data_position++;
                                   }
                                   value = value >> 1;
                               }
                           } else {
                               value = 1;
                               for (i = 0; i < context_numBits; i++) {
                                   context_data_val = (context_data_val << 1) | value;
                                   if (context_data_position === bitsPerChar - 1) {
                                       context_data_position = 0;
                                       context_data.push(getCharFromInt(context_data_val));
                                       context_data_val = 0;
                                   } else {
                                       context_data_position++;
                                   }
                                   value = 0;
                               }
                               value = context_w.charCodeAt(0);
                               for (i = 0; i < 16; i++) {
                                   context_data_val = (context_data_val << 1) | (value & 1);
                                   if (context_data_position === bitsPerChar - 1) {
                                       context_data_position = 0;
                                       context_data.push(getCharFromInt(context_data_val));
                                       context_data_val = 0;
                                   } else {
                                       context_data_position++;
                                   }
                                   value = value >> 1;
                               }
                           }
                           context_enlargeIn--;
                           if (context_enlargeIn === 0) {
                               context_enlargeIn = Math.pow(2, context_numBits);
                               context_numBits++;
                           }
                           delete context_dictionaryToCreate[context_w];
                       } else {
                           value = context_dictionary[context_w];
                           for (i = 0; i < context_numBits; i++) {
                               context_data_val = (context_data_val << 1) | (value & 1);
                               if (context_data_position === bitsPerChar - 1) {
                                   context_data_position = 0;
                                   context_data.push(getCharFromInt(context_data_val));
                                   context_data_val = 0;
                               } else {
                                   context_data_position++;
                               }
                               value = value >> 1;
                           }

                       }
                       context_enlargeIn--;
                       if (context_enlargeIn === 0) {
                           context_enlargeIn = Math.pow(2, context_numBits);
                           context_numBits++;
                       }
                       context_dictionary[context_wc] = context_dictSize++;
                       context_w = String(context_c);
                   }
               }

               if (context_w !== '') {
                   if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                       if (context_w.charCodeAt(0) < 256) {
                           for (i = 0; i < context_numBits; i++) {
                               context_data_val = (context_data_val << 1);
                               if (context_data_position === bitsPerChar - 1) {
                                   context_data_position = 0;
                                   context_data.push(getCharFromInt(context_data_val));
                                   context_data_val = 0;
                               } else {
                                   context_data_position++;
                               }
                           }
                           value = context_w.charCodeAt(0);
                           for (i = 0; i < 8; i++) {
                               context_data_val = (context_data_val << 1) | (value & 1);
                               if (context_data_position === bitsPerChar - 1) {
                                   context_data_position = 0;
                                   context_data.push(getCharFromInt(context_data_val));
                                   context_data_val = 0;
                               } else {
                                   context_data_position++;
                               }
                               value = value >> 1;
                           }
                       } else {
                           value = 1;
                           for (i = 0; i < context_numBits; i++) {
                               context_data_val = (context_data_val << 1) | value;
                               if (context_data_position === bitsPerChar - 1) {
                                   context_data_position = 0;
                                   context_data.push(getCharFromInt(context_data_val));
                                   context_data_val = 0;
                               } else {
                                   context_data_position++;
                               }
                               value = 0;
                           }
                           value = context_w.charCodeAt(0);
                           for (i = 0; i < 16; i++) {
                               context_data_val = (context_data_val << 1) | (value & 1);
                               if (context_data_position === bitsPerChar - 1) {
                                   context_data_position = 0;
                                   context_data.push(getCharFromInt(context_data_val));
                                   context_data_val = 0;
                               } else {
                                   context_data_position++;
                               }
                               value = value >> 1;
                           }
                       }
                       context_enlargeIn--;
                       if (context_enlargeIn === 0) {
                           context_enlargeIn = Math.pow(2, context_numBits);
                           context_numBits++;
                       }
                       delete context_dictionaryToCreate[context_w];
                   } else {
                       value = context_dictionary[context_w];
                       for (i = 0; i < context_numBits; i++) {
                           context_data_val = (context_data_val << 1) | (value & 1);
                           if (context_data_position === bitsPerChar - 1) {
                               context_data_position = 0;
                               context_data.push(getCharFromInt(context_data_val));
                               context_data_val = 0;
                           } else {
                               context_data_position++;
                           }
                           value = value >> 1;
                       }

                   }
                   context_enlargeIn--;
                   if (context_enlargeIn === 0) {
                       context_enlargeIn = Math.pow(2, context_numBits);
                       context_numBits++;
                   }
               }

               value = 2;
               for (i = 0; i < context_numBits; i++) {
                   context_data_val = (context_data_val << 1) | (value & 1);
                   if (context_data_position === bitsPerChar - 1) {
                       context_data_position = 0;
                       context_data.push(getCharFromInt(context_data_val));
                       context_data_val = 0;
                   } else {
                       context_data_position++;
                   }
                   value = value >> 1;
               }

               while (true) {
                   context_data_val = (context_data_val << 1);
                   if (context_data_position === bitsPerChar - 1) {
                       context_data.push(getCharFromInt(context_data_val));
                       break;
                   } else context_data_position++;
               }
               return context_data.join('');
           },
           _decompress: function(length, resetValue, getNextValue) {
               const dictionary = [];
               let next;
               let enlargeIn = 4;
               let dictSize = 4;
               let numBits = 3;
               let entry = '';
               const result = [];
               let i;
               let w;
               let bits, resb, maxpower, power;

               const data = { value: getNextValue(0), position: resetValue, index: 1 };

               for (i = 0; i < 3; i += 1) {
                   dictionary[i] = i;
               }

               bits = 0;
               maxpower = Math.pow(2, 2);
               power = 1;
               while (power !== maxpower) {
                   resb = data.value & data.position;
                   data.position >>= 1;
                   if (data.position === 0) {
                       data.position = resetValue;
                       data.value = getNextValue(data.index++);
                   }
                   bits |= (resb > 0 ? 1 : 0) * power;
                   power <<= 1;
               }

               switch (bits) {
                   case 0:
                       bits = 0; maxpower = Math.pow(2, 8); power = 1;
                       while (power !== maxpower) {
                           resb = data.value & data.position;
                           data.position >>= 1;
                           if (data.position === 0) {
                               data.position = resetValue;
                               data.value = getNextValue(data.index++);
                           }
                           bits |= (resb > 0 ? 1 : 0) * power;
                           power <<= 1;
                       }
                       next = String.fromCharCode(bits);
                       break;
                   case 1:
                       bits = 0; maxpower = Math.pow(2, 16); power = 1;
                       while (power !== maxpower) {
                           resb = data.value & data.position;
                           data.position >>= 1;
                           if (data.position === 0) {
                               data.position = resetValue;
                               data.value = getNextValue(data.index++);
                           }
                           bits |= (resb > 0 ? 1 : 0) * power;
                           power <<= 1;
                       }
                       next = String.fromCharCode(bits);
                       break;
                   case 2:
                       return '';
                   default:
                       return '';
               }

               dictionary[3] = next;
               w = next;
               result.push(next);

               while (true) {
                   if (data.index > length) {
                       return '';
                   }

                   bits = 0;
                   maxpower = Math.pow(2, numBits);
                   power = 1;
                   while (power !== maxpower) {
                       resb = data.value & data.position;
                       data.position >>= 1;
                       if (data.position === 0) {
                           data.position = resetValue;
                           data.value = getNextValue(data.index++);
                       }
                       bits |= (resb > 0 ? 1 : 0) * power;
                       power <<= 1;
                   }

                   switch (next = bits) {
                       case 0:
                           bits = 0; maxpower = Math.pow(2, 8); power = 1;
                           while (power !== maxpower) {
                               resb = data.value & data.position;
                               data.position >>= 1;
                               if (data.position === 0) {
                                   data.position = resetValue;
                                   data.value = getNextValue(data.index++);
                               }
                               bits |= (resb > 0 ? 1 : 0) * power;
                               power <<= 1;
                           }

                           dictionary[dictSize++] = String.fromCharCode(bits);
                           next = dictSize - 1;
                           enlargeIn--;
                           break;
                       case 1:
                           bits = 0; maxpower = Math.pow(2, 16); power = 1;
                           while (power !== maxpower) {
                               resb = data.value & data.position;
                               data.position >>= 1;
                               if (data.position === 0) {
                                   data.position = resetValue;
                                   data.value = getNextValue(data.index++);
                               }
                               bits |= (resb > 0 ? 1 : 0) * power;
                               power <<= 1;
                           }
                           dictionary[dictSize++] = String.fromCharCode(bits);
                           next = dictSize - 1;
                           enlargeIn--;
                           break;
                       case 2:
                           return result.join('');
                       default:
                           break;
                   }

                   if (enlargeIn === 0) {
                       enlargeIn = Math.pow(2, numBits);
                       numBits++;
                   }

                   if (dictionary[next]) {
                       entry = dictionary[next];
                   } else {
                       if (next === dictSize) {
                           entry = w + w.charAt(0);
                       } else {
                           return '';
                       }
                   }

                   result.push(entry);

                   dictionary[dictSize++] = w + entry.charAt(0);
                   enlargeIn--;
                   w = entry;

                   if (enlargeIn === 0) {
                       enlargeIn = Math.pow(2, numBits);
                       numBits++;
                   }
               }
           },
      };

      function encodePresetForUrl(presetObj) {
           const json = JSON.stringify(presetObj);
           return LZString.compressToEncodedURIComponent(json) || '';
      }

      function decodePresetFromUrl(encodedPreset) {
           if (!encodedPreset) return null;
           // Messaging apps sometimes wrap long URLs and insert whitespace/newlines into query params.
           // Strip them out so the compressed payload survives copy/paste before decoding.
           const sanitizedPreset = String(encodedPreset).trim().replace(/\s+/g, '');
           const fromBase64Url = (base64Url) => base64Url
               .replace(/-/g, '+')
               .replace(/_/g, '/')
               .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');

           if (sanitizedPreset !== encodedPreset && /\s/.test(encodedPreset)) {
               console.debug('decodePresetFromUrl: removed whitespace from preset param before decoding');
               try {
                   // Quick guard: ensure base64 decoding still works after sanitization for legacy links.
                   atob(fromBase64Url(sanitizedPreset));
                   console.debug('decodePresetFromUrl: legacy base64 payload remains decodable after sanitization');
               } catch (legacyErr) {
                   console.debug('decodePresetFromUrl: sanitized preset is not valid legacy base64', legacyErr);
               }
           }
           const decompressed = LZString.decompressFromEncodedURIComponent(sanitizedPreset);
           if (decompressed) return JSON.parse(decompressed);

           // Backward compatibility: fall back to legacy base64 URLs
           try {
               if (sanitizedPreset !== encodedPreset) {
                   console.debug('decodePresetFromUrl: attempting legacy base64 decode after whitespace stripping');
               }
               const decoded = decodeURIComponent(escape(atob(fromBase64Url(sanitizedPreset))));
               return JSON.parse(decoded);
           } catch (err) {
               console.error('Failed to decode preset from URL', err);
               return null;
           }
      }

      function generateShareableUrl() {
           try {
               const preset = buildPresetData();
               const metadata = preset.metadata || {};

               // Remove metadata from the compressed payload to keep the URL shorter for SMS/MMS.
               // Messaging apps can split very long URLs into multiple messages, which breaks link previews.
               const { metadata: _omit, ...presetWithoutMeta } = preset;
               const urlSafePreset = encodePresetForUrl(presetWithoutMeta);

               // FIX: Use origin + pathname to build a clean base URL every time.
               // This prevents issues where re-sharing might inherit malformed data
               // or accumulate debris from the current window.location.href
               const baseUrl = window.location.origin + window.location.pathname;
               const url = new URL(baseUrl);

               url.searchParams.set('preset', urlSafePreset);
               const displayName = (metadata.name || '').trim();
               if (displayName) url.searchParams.set('name', displayName);
               const sourceType = (metadata.sourceType || '').trim();
               if (sourceType) url.searchParams.set('source', sourceType);
               if (metadata.category !== undefined && metadata.category !== null) {
                   url.searchParams.set('cat', String(metadata.category));
               }

               return url.toString();
           } catch (err) {
               console.error('Failed to generate shareable URL', err);
               return window.location.href;
           }
      }

     async function loadPresetFromUrl() {
           const params = new URLSearchParams(window.location.search);
           const encodedPreset = params.get('preset');
           const presetUrl = params.get('presetUrl');
           let parsedPreset = null;

           if (encodedPreset) {
               try {
                   parsedPreset = decodePresetFromUrl(encodedPreset);
               } catch (err) {
                   console.error('Failed to load preset from encoded URL data', err);
               }
           }

           if (!parsedPreset && presetUrl) {
               try {
                   const response = await fetch(presetUrl);
                   if (!response.ok) throw new Error(`HTTP ${response.status}`);
                   parsedPreset = await response.json();
               } catch (err) {
                   console.error('Failed to fetch preset from URL', err);
               }
           }

           if (!parsedPreset) return false;

           const presetMetadata = parsedPreset.metadata || {};
           const fallbackDisplayName = params.get('name');
           const fallbackSourceType = params.get('source');
           const fallbackCategory = params.has('cat') ? params.get('cat') : null;

           const presetDisplayName = (fallbackDisplayName || presetMetadata.name || '').trim() || 'LINK';
           const presetSourceType = (fallbackSourceType || presetMetadata.sourceType || '').trim() || 'user';
           const presetCategory = fallbackCategory !== null ? fallbackCategory : (presetMetadata.category ?? null);

           // Re-attach metadata so subsequent shares preserve the display name without bloating the URL.
           parsedPreset.metadata = {
               name: presetDisplayName,
               sourceType: presetSourceType,
               category: presetCategory,
           };

           // --- NEW: Intercept with Warning Modal ---
           const warningModal = document.getElementById('share-warning-modal-overlay');
           const confirmBtn = document.getElementById('confirm-share-load-button');

           if (warningModal && confirmBtn) {
               // Show the warning
               warningModal.classList.remove('opacity-0', 'pointer-events-none');

               // Wait for user confirmation
               return new Promise((resolve) => {
                   confirmBtn.onclick = async () => {
                       // Hide modal
                       warningModal.classList.add('opacity-0', 'pointer-events-none');
                       
                       // Initialize Audio Context on user gesture
                       await powerOn();

                       // Apply the preset
                       applyPreset(parsedPreset, false, { skipPowerOn: true });
                       updatePresetDisplay(presetDisplayName, presetSourceType, presetCategory);

                       // Resolve true so init() knows we handled a preset
                       resolve(true);
                   };
               });
           }

           // Fallback if modal is missing
           await powerOn();
           applyPreset(parsedPreset, false, { skipPowerOn: true });
           updatePresetDisplay(presetDisplayName, presetSourceType, presetCategory);
           return true;
      }
       function float32ToPCM16(f) {
           const out = new Int16Array(f.length);
           for (let i = 0; i < f.length; i++) { let s = f[i]; if (s > 1) s = 1; else if (s < -1) s = -1; out[i] = s < 0 ? (s * 0x8000) : (s * 0x7FFF); }
           return out;
       }
       function makeWavHeader({ sampleRate, numChannels, bitsPerSample, dataBytes }) {
           const blockAlign = numChannels * (bitsPerSample >> 3); const byteRate = sampleRate * blockAlign; const buffer = new ArrayBuffer(44); const dv = new DataView(buffer);
           dv.setUint32(0, 0x46464952, true); dv.setUint32(4, 36 + dataBytes, true); dv.setUint32(8, 0x45564157, true); dv.setUint32(12, 0x20746d66, true);
           dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, numChannels, true); dv.setUint32(24, sampleRate, true);
           dv.setUint32(28, byteRate, true); dv.setUint16(32, blockAlign, true); dv.setUint16(34, bitsPerSample, true);
           dv.setUint32(36, 0x61746164, true); dv.setUint32(40, dataBytes, true);
           return buffer;
       }
       function formatMMSS(ms) {
           const total = Math.floor(ms / 1000);
           return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
       }
       function startRecordingUI() {
           if (!recordButton) return;
           recordButton.blur(); recordButton.classList.add('text-red-500'); recordButton.textContent = 'STOP 00:00';
           recordStartTs = performance.now();
           recordTimerId = setInterval(() => { recordButton.textContent = `STOP ${formatMMSS(performance.now() - recordStartTs)}`; }, 250);
       }
       function stopRecordingUI() {
           if (recordTimerId) clearInterval(recordTimerId); recordTimerId = null;
           if (!recordButton) return;
           recordButton.classList.remove('text-red-500'); recordButton.textContent = 'RECORD AUDIO';
       }

       // --- MIDI Recording Implementation ---
       function captureMidiEvent(trackNum, type, note, velocity) {
            if (!isRecordingMidi || note === null || note === -Infinity) return;
            const event = {
                timestamp: performance.now() - midiRecordingStartTime,
                type: type, // 'noteOn' or 'noteOff'
                note: note,
                velocity: velocity
            };
            if (trackNum === 0) {
                midiEventsTrack1.push(event);
            } else if (trackNum === 1) {
                midiEventsTrack2.push(event);
            }
       }
async function setupMidiOutput() {
           const midiOutputSelector = document.getElementById('midi-output-selector');
           if (!midiOutputSelector) return;

           try {
               midiAccess = await navigator.requestMIDIAccess({ sysex: true });
               
               // Clear previous options
               midiOutputSelector.innerHTML = '';
               
               if (midiAccess.outputs.size > 0) {
                   midiAccess.outputs.forEach(output => {
                       const option = document.createElement('option');
                       option.value = output.id;
                       option.textContent = output.name;
                       midiOutputSelector.appendChild(option);
                   });
                   midiOutputSelector.disabled = false;
                   
                   // Automatically select the first output
                   selectedMidiOutput = midiAccess.outputs.values().next().value;

                   // Listen for changes
                   midiOutputSelector.addEventListener('change', () => {
                       selectedMidiOutput = midiAccess.outputs.get(midiOutputSelector.value);
                       console.log(`MIDI Output set to: ${selectedMidiOutput.name}`);
                   });

               } else {
                   const option = document.createElement('option');
                   option.textContent = 'No MIDI Outputs Found';
                   midiOutputSelector.appendChild(option);
                   midiOutputSelector.disabled = true;
               }

           } catch (err) {
               console.error('MIDI Access Denied or Failed:', err);
               midiOutputSelector.innerHTML = '<option>MIDI Access Denied</option>';
               midiOutputSelector.disabled = true;
           }
       }

       function toggleMidiRecording() {
            if (isRecordingMidi) {
                stopMidiRecording();
            } else {
                startMidiRecording();
            }
       }

       function startMidiRecording() {
            if (!isPowerOn) powerOn();
            isRecordingMidi = true;
            midiEventsTrack1 = [];
            midiEventsTrack2 = [];
            midiRecordingStartTime = performance.now();
            if (recordMidiButton) {
                recordMidiButton.textContent = "STOP MIDI";
                recordMidiButton.classList.add('text-red-500');
            }
       }

       function stopMidiRecording() {
            isRecordingMidi = false;
            if (recordMidiButton) {
                recordMidiButton.textContent = "RECORD MIDI";
                recordMidiButton.classList.remove('text-red-500');
            }
            generateAndDownloadMidi();
       }
   function calculateMidiBpm() {
    const arp1 = knobState[0];
    const arp2 = knobState[1];

    let targetRateBpm = null;

    if ((arp1.isArpOn && isArpRateSynced) || (arp1.isArpOn && !arp2.isArpOn)) {
        targetRateBpm = arp1.arpRateBpm;
    } else if (arp2.isArpOn && !arp1.isArpOn) {
        targetRateBpm = arp2.arpRateBpm;
    }

    if (targetRateBpm !== null) {
        return Math.round(clamp(targetRateBpm, MIN_MIDI_EXPORT_BPM, MAX_ARP_RATE_BPM));
    }

    return Math.round(DEFAULT_ARP_RATE_BPM);
}
       function generateAndDownloadMidi() {
            const TICKS_PER_QUARTER_NOTE = 480;
            const BPM = calculateMidiBpm();
            const MS_PER_TICK = 60000 / (BPM * TICKS_PER_QUARTER_NOTE);

            const writeVlq = (arr, value) => {
                let buffer = [];
                buffer.push(value & 0x7F);
                value >>= 7;
                while (value > 0) {
                    buffer.push((value & 0x7F) | 0x80);
                    value >>= 7;
                }
                arr.push(...buffer.reverse());
            };

            const buildTrack = (events) => {
                const trackBytes = [];
                let lastTimestamp = 0;
                events.sort((a, b) => a.timestamp - b.timestamp);


                let accumulatedTicks = 0;
for (const event of events) {
    const eventTicks = Math.round(event.timestamp / MS_PER_TICK);
    const deltaTicks = eventTicks - accumulatedTicks;
    accumulatedTicks = eventTicks;
                    
                    writeVlq(trackBytes, deltaTicks);

                    const eventType = event.type === 'noteOn' ? 0x90 : 0x80;
                    trackBytes.push(eventType);
                    trackBytes.push(event.note);
                    trackBytes.push(event.velocity);
                }

                writeVlq(trackBytes, 0); // Delta time 0
                trackBytes.push(0xFF, 0x2F, 0x00); // End of Track meta event

                return trackBytes;
            };

            const microSecondsPerQuarterNote = Math.round(60000000 / BPM);

            let track1Bytes = buildTrack(midiEventsTrack1);
            const track2Bytes = buildTrack(midiEventsTrack2);

            const tempoEvent = [
                0x00, 0xFF, 0x51, 0x03,
                (microSecondsPerQuarterNote >> 16) & 0xFF,
                (microSecondsPerQuarterNote >> 8) & 0xFF,
                microSecondsPerQuarterNote & 0xFF
            ];
            
            track1Bytes.unshift(...tempoEvent);

            const headerSize = 14;
            const track1HeaderSize = 8;
            const track2HeaderSize = 8;
            const totalSize = headerSize + track1HeaderSize + track1Bytes.length + track2HeaderSize + track2Bytes.length;
            const buffer = new ArrayBuffer(totalSize);
            const dv = new DataView(buffer);
            let offset = 0;

            // MThd Header
            dv.setUint32(offset, 0x4D546864); offset += 4;
            dv.setUint32(offset, 6); offset += 4;
            dv.setUint16(offset, 1); offset += 2;
            dv.setUint16(offset, 2); offset += 2;
            dv.setUint16(offset, TICKS_PER_QUARTER_NOTE); offset += 2;

            // MTrk 1 (now with tempo info)
            dv.setUint32(offset, 0x4D54726B); offset += 4;
            dv.setUint32(offset, track1Bytes.length); offset += 4;
            track1Bytes.forEach(byte => { dv.setUint8(offset, byte); offset++; });

            // MTrk 2
            dv.setUint32(offset, 0x4D54726B); offset += 4;
            dv.setUint32(offset, track2Bytes.length); offset += 4;
            track2Bytes.forEach(byte => { dv.setUint8(offset, byte); offset++; });

            const blob = new Blob([buffer], { type: 'audio/midi' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = generateRecordingFilename('mid');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
       }
       // --- End MIDI Recording ---
      
       async function setupAudio() {
           if (audioSetupPromise) return audioSetupPromise;

           audioSetupPromise = (async () => {
               if (audioContext) return;

               audioContext = new (window.AudioContext || window.webkitAudioContext)();
               await audioContext.audioWorklet.addModule('./js/synth-processor.js');
               synthNode = new AudioWorkletNode(audioContext,'synth-processor', { numberOfOutputs: 1, outputChannelCount: [2] });
               synthNode.port.onmessage = ({ data }) => {
    const { type, data: payload } = data || {};
    switch (type) {
        case 'envUpdate':
            if (typeof updateKnobVolumeIndicator === 'function') { 
                updateKnobVolumeIndicator(0, payload.v0); 
                updateKnobVolumeIndicator(1, payload.v1); 
            } 
            break;
        case 'lfoUpdate':
            liveLfoOutputs = payload; // Store data immediately
            
            // --- FIX: Throttle Visual Updates for Mobile Performance ---
            if (!visualUpdatePending) {
                visualUpdatePending = true;
                requestAnimationFrame(() => {
                    if (typeof updateLfoVisuals === 'function') {
                        updateLfoVisuals(liveLfoOutputs);
                    }
                    visualUpdatePending = false;
                });
            }
            // -----------------------------------------------------------
            break;
        case 'audio': { const pcm = float32ToPCM16(payload); pcmChunks.push(pcm); totalPcmBytes += pcm.byteLength; break; }
        case 'recordingStopped': {
            // ... existing recording stopped logic ...
            const header = makeWavHeader({ sampleRate: audioContext.sampleRate, numChannels: 2, bitsPerSample: 16, dataBytes: totalPcmBytes });
            const wavBlob = new Blob([header, ...pcmChunks], { type: 'audio/wav' });
            const name = generateRecordingFilename('wav'); const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a'); a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            pcmChunks = []; totalPcmBytes = 0; stopRecordingUI(); isRecordingAudio = false;
            break;
        }
    }
};
               synthNode.connect(audioContext.destination);
               Object.values(fxKnobData).forEach(d => {
                   if (synthNode && ((d.id <= 29 && d.id !== 1) || d.id === 30 || d.id === 31)) { synthNode.port.postMessage({type:'setFx', data:{id:d.id, value:d.value}}); }
                   if (synthNode && d.id === 7) { synthNode.port.postMessage({type:'setFx', data:{id:d.id, value:d.value}}); }
               });
           })();

           return audioSetupPromise;
       }

       function powerOn(){
           if (isPowerOn) return audioSetupPromise || Promise.resolve();
           isPowerOn=true; powerSwitch.classList.add('on'); synthContainer.classList.remove('is-off');
           const setupPromise = setupAudio().then(()=>{ if(audioContext && (audioContext.state==='suspended' || audioContext.state==='interrupted')) return audioContext.resume(); });
           audioSetupPromise = setupPromise;
           return setupPromise;
       }
       function powerOff(){
           if(!isPowerOn)return;
           if (isRecordingAudio && synthNode) { synthNode.port.postMessage({ type: 'stopRecording', data: {} }); }
           if (isRecordingMidi) { stopMidiRecording(); }
           isPowerOn=false; 
           knobState.forEach(k=>{ stopNote(k.id, true); if (k.isArpOn) { k.isArpOn = false; k.dom.arpSwitch.classList.remove('on'); } k.isSweepMode = true; if (k.dom.arpModeSwitch) { k.dom.arpModeSwitch.classList.add('on'); } });
           isArpRateSynced = false; if(arpSyncSwitch) arpSyncSwitch.classList.remove('on');
           if (isLfoMode) { toggleLfoModeUI(false); }
           updateGlobalArpVisibility(); powerSwitch.classList.remove('on'); synthContainer.classList.add('is-off');
           if(audioContext){audioContext.close().then(()=>{audioContext=null;synthNode=null;audioSetupPromise=null;});}
       }
      
       function getNoteFrequency(m){return 440*Math.pow(2,(m-69)/12);}
       function midiToNoteName(midi){ if(midi === null || midi === -Infinity) return "--"; const note=NOTES[midi%12]; const octave=Math.floor(midi/12)-1; return note+octave; }
       function getMidiNote(knobId) {
           const state = knobState[knobId];
           let currentScale;
           const scaleName = scaleSelector.value;
           if(scaleName === 'Custom') { currentScale = customScale.length > 0 ? customScale : [0]; }
           else { currentScale = SCALES[scaleName] || [0]; }
           const r=NOTES.indexOf(keySelector.value); const a=state.totalAngle%360;const v=a/360;const n=currentScale.length;
           let i = Math.floor(v * n); i = Math.min(i, n - 1);
           const b = 12 * (state.currentOctave + 1) + r;
           return b + currentScale[i];
       }
        function getMidiNoteFromAngle(knobId, angle) {
            const state = knobState[knobId]; if (!state) return null;
            const scaleName = scaleSelector.value;
            const currentScale = (scaleName === 'Custom' && customScale.length > 0) ? customScale : (SCALES[scaleName] || [0]);
            const normalizedAngle = angle % 360;
            const v = normalizedAngle / 360;
            const i = Math.min(currentScale.length - 1, Math.floor(v * currentScale.length));
            const octave = Math.floor(angle / 360);
            const root = NOTES.indexOf(keySelector.value);
            return (12 * (octave + 1)) + root + currentScale[i];
        }
function getFullScaleMidi() {
           const scaleName = scaleSelector.value;
           const intervals = (scaleName === 'Custom' && customScale.length > 0) ? customScale : SCALES[scaleName] || [0];
           const rootNote = NOTES.indexOf(keySelector.value);
           const fullScaleMidi = [];
           for (let oct = -2; oct < 10; oct++) {
               for (const interval of intervals) {
                   fullScaleMidi.push(rootNote + (oct * 12) + interval);
               }
           }
           return fullScaleMidi;
       }
function sendMidiMessage(message) {
           if (selectedMidiOutput) {
               selectedMidiOutput.send(message);
           }
       }
      
       function getKnobColor(angle) {
           const pos = angle / 360; let c1, c2, p;
           if (pos < 0.5) { c1 = COLOR_BLUE; c2 = COLOR_YELLOW; p = pos * 2; }
           else { c1 = COLOR_YELLOW; c2 = COLOR_GREEN; p = (pos - 0.5) * 2; }
           return [Math.round(c1[0]*(1-p)+c2[0]*p), Math.round(c1[1]*(1-p)+c2[1]*p), Math.round(c1[2]*(1-p)+c2[2]*p)];
       }
      
       function getArpNoteColor(finalMidiNote) {
           if (finalMidiNote === null || !isFinite(finalMidiNote)) { return { r: COLOR_BLUE[0], g: COLOR_BLUE[1], b: COLOR_BLUE[2] }; }
           const noteIndex = Math.floor(finalMidiNote) % 12;
           const octave = Math.floor(finalMidiNote / 12) - 1;
           const baseHsl = ARP_NOTE_BASE_HSL[noteIndex] || {h:210,s:1,l:0.5};
           const maxOctave = Math.floor(MAX_TOTAL_ANGLE / 360) - 1;
           const octaveRatio = Math.max(0, Math.min(1, octave / maxOctave));
           const minLightness = baseHsl.l * 0.7;
           const maxLightness = Math.min(0.95, baseHsl.l + (maxOctave * ARP_OCTAVE_LIGHTNESS_FACTOR));
           const adjustedLightness = minLightness + (maxLightness - minLightness) * octaveRatio;
           return hslToRgb(baseHsl.h, baseHsl.s, adjustedLightness);
       }
      
       function calculateNote(knobId, updateDisplay = true){
           const midiNote = getMidiNote(knobId);
           if (updateDisplay && knobState[knobId]?.dom?.noteDisplay) {
               updateStateFromTotalAngle(knobId);
           }
           return getNoteFrequency(midiNote);
       }
      
       function updateKnobColor(knobId) {
           const state = knobState[knobId]; if (!state || !state.dom.knob) return;
           let midiNote = getMidiNote(knobId);
           if (state.arpRunning && state.lastPlayedMidi !== null) {
               midiNote = state.lastPlayedMidi;
           }
           const finalRgb = getArpNoteColor(midiNote);
           state.dom.knob.style.backgroundColor = `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
       }
      function updateStateFromTotalAngle(knobId) {
           const state = knobState[knobId]; if (!state) return;
           state.totalAngle = Math.max(0, Math.min(MAX_TOTAL_ANGLE, state.totalAngle));
           state.currentOctave = Math.floor(state.totalAngle / 360);
           if (!state.dom || !state.dom.knob || !state.dom.indicator) return;
           
           const displayAngle = state.totalAngle % 360;
           state.baseColor = getKnobColor(displayAngle);
           
           // --- FIX: Fallback radius calculation for initial load (Shared URL fix) ---
           let knobRadius = state.dom.knob.offsetHeight / 2;
           
           // If the DOM isn't fully painted yet (offsetHeight is 0), the rotation pivot will be wrong.
           // We manually enforce the correct radius based on the Tailwind classes:
           // w-40 (160px width) -> radius 80
           // w-48 (192px width) -> radius 96
           if (knobRadius === 0) {
               knobRadius = window.innerWidth >= 640 ? 96 : 80;
           }
           
           // 12px matches the 'top-3' (0.75rem) CSS positioning of the indicator
           state.dom.indicator.style.transformOrigin = `center ${knobRadius - 12}px`;
           
           applyIndicatorTransform(state.dom.indicator, displayAngle);
           
           const baseMidi = getMidiNote(knobId);
           let displayMidi = baseMidi;
           if (state.isArpOn) {
               const fullScaleMidi = getFullScaleMidi();
               const baseNoteIndexInScale = fullScaleMidi.indexOf(baseMidi);
               if (baseNoteIndexInScale !== -1) {
                   const transposedNoteIndex = baseNoteIndexInScale + state.arpTranspose;
                   const clampedIndex = Math.max(0, Math.min(fullScaleMidi.length - 1, transposedNoteIndex));
                   displayMidi = fullScaleMidi[clampedIndex];
               }
           }
           state.dom.noteDisplay.textContent = midiToNoteName(displayMidi);
           if (state.isArpOn && !state.arpRunning) {
               const finalRgb = getArpNoteColor(displayMidi);
               if(state.dom.knob) state.dom.knob.style.backgroundColor = `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
           } else if (!state.isNoteOn) {
               updateKnobColor(knobId);
           }
           const isNoteRepeatHoldActive = state.isArpOn && state.isArpHoldOn && !state.isSweepMode;
           if (state.isArpOn && (state.isHeld || isNoteRepeatHoldActive)) {
               if (state.isSweepMode) {
                  if (allowDuplicateNotesMode || !state.arpNotes.some(n => n.midi === baseMidi)) {
                   state.arpNotes.push({ midi: baseMidi, active: true });
                  updateSequenceDisplay(knobId);
                  }
               } else {
                  const noteChanged = state.arpNotes.length !== 1 || state.arpNotes[0].midi !== baseMidi || !state.arpNotes[0].active;
                  state.arpNotes = [{ midi: baseMidi, active: true }];
                  if (noteChanged) {
                      state.currentArpNoteIndex = 0;
                      state.arpUpDownState = 0;
                      updateSequenceDisplay(knobId);
                  }
               }
          } else if (state.isHeld && synthNode && isPowerOn) {
            const baseMidi = getMidiNote(knobId);
            
            // --- Re-trigger envelope logic ---
            if (!state.isArpOn && state.lastPlayedMidi !== baseMidi) {
                synthNode.port.postMessage({ type: 'noteOff', data: { voice: knobId } });
                const freq = getNoteFrequency(baseMidi);
                synthNode.port.postMessage({ type: 'noteOn', data: { voice: knobId, freq: freq } });
                
                if (state.lastPlayedMidi !== null) {
                    sendMidiMessage([0x80 + knobId, state.lastPlayedMidi, 0]);
                    captureMidiEvent(knobId, 'noteOff', state.lastPlayedMidi, 0);
                }
                sendMidiMessage([0x90 + knobId, baseMidi, 100]);
                captureMidiEvent(knobId, 'noteOn', baseMidi, 100);
                
                state.lastPlayedMidi = baseMidi;
            }
            
            updateKnobColor(knobId);
        }
     }
      
       const updateFxKnob = (id, deltaY) => {
           const d = fxKnobData[id]; if (!d) return;
           if (id >= 16 && id <= 25 && d.knobEl.closest('.arp-disabled')) return;
           if (activePatchingLfo !== null) return; // Prevent adjustment during patching
           
           let newAngle = Math.max(MIN_FX_ANGLE, Math.min(MAX_FX_ANGLE, d.angle + deltaY));
           d.angle = newAngle; 
           d.value = (d.angle - MIN_FX_ANGLE) / (MAX_FX_ANGLE - MIN_FX_ANGLE);
           
           applyIndicatorTransform(d.indicator, d.angle);

           if (id === 30 || id === 31) {
               updateVoiceWaveDisplay(id === 30 ? 0 : 1, d.value);
           }

           if (isLfoMode && LFO_KNOB_MAP[id] && LFO_KNOB_MAP[id].param !== 'dest') {
                const { lfo, param } = LFO_KNOB_MAP[id];
                const lfoParam = lfoState[lfo];
                if (param === 'wave') {
                    const index = Math.min(LFO_WAVEFORMS.length - 1, Math.floor(d.value * LFO_WAVEFORMS.length));
                    if (lfoParam[param] !== index) {
                        lfoParam[param] = index;
                        document.getElementById(`lfo-${param}-display-${lfo}`).textContent = LFO_WAVEFORMS[index];
                        if (synthNode) synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfo, param: param, value: index } });
                    }
                } else if (param === 'rate') {
                    if (lfoTempoLinkState[lfo]?.enabled) {
                        handleSyncedLfoRateChange(lfo, d.value);
                    } else {
                        lfoParam[param] = d.value;
                        if (lfoTempoLinkState[lfo]) {
                            lfoTempoLinkState[lfo].storedFreeValue = d.value;
                        }
                        updateLfoRateDisplay(lfo, d.value, false);
                        if (synthNode) {
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfo, param: param, value: d.value } });
                        }
                    }
                } else { // depth
                    lfoParam[param] = d.value;
                    if (synthNode) synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfo, param: param, value: d.value } });
                }
                return;
           }

           if (id === 7) {
               const val = d.value; let r,g,b;
               if (val < 0.5) { const p = val * 2; r = Math.round(COLOR_GREEN[0]*(1-p)+COLOR_YELLOW[0]*p); g = Math.round(COLOR_GREEN[1]*(1-p)+COLOR_YELLOW[1]*p); b = Math.round(COLOR_GREEN[2]*(1-p)+COLOR_YELLOW[2]*p); }
               else { const p = (val - 0.5) * 2; r = Math.round(COLOR_YELLOW[0]*(1-p)+COLOR_RED[0]*p); g = Math.round(COLOR_YELLOW[1]*(1-p)+COLOR_RED[1]*p); b = Math.round(COLOR_YELLOW[2]*(1-p)+COLOR_RED[2]*p); }
               d.knobEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
           }
           const knobId = (id >= 16 && id <= 25 && id % 2 === 0) ? 0 : (id >= 16 && id <= 25 && id % 2 !== 0) ? 1 : -1;
           if (knobId !== -1) {
               const state = knobState[knobId]; if (!state) return;
               if (id === 18 || id === 19) {
                   const step = Math.min(3, Math.floor(d.value * 4)); state.arpOctaveRange = step; if (state.dom.octsDisplay) state.dom.octsDisplay.textContent = step;
              } else if (id === 22 || id === 23) {
                   const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(d.value * NUM_FEEL_PATTERNS));
                   state.feelKnobValue = d.value; 
                   
                   // 1. The "Smart Reset" Logic
                   if (state.currentFeelPattern !== EUCLIDEAN_PATTERNS[pIndex]) {
                       state.currentFeelPattern = EUCLIDEAN_PATTERNS[pIndex];
                       state.euclideanStepCounter = 0;
                   }

                   if (state.dom.feelDisplay) state.dom.feelDisplay.textContent = pIndex + 1;
                   updateFeelPatternPreview(knobId);

               } else if (id === 24 || id === 25) {
                  const trans = Math.floor((d.value * 24) - 12);
                  state.arpTranspose = trans;
                  if(state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = trans;
                  updateStateFromTotalAngle(knobId);
                  updateSequenceDisplay(knobId);
               } else if (id === 16 || id === 17) {
                   const otherId = knobId === 0 ? 1 : 0;
                   if (tempoMode === TEMPO_MODE_BPM) {
                       const computedBpm = valueToArpRateBpm(d.value);
                       setArpRateFromBpm(knobId, computedBpm);
                       if (isArpRateSynced && knobState[otherId]?.isArpOn) {
                           setArpRateFromBpm(otherId, computedBpm);
                       }
                   } else {
                       const computedMs = valueToArpRateMs(d.value);
                       setArpRateFromMs(knobId, computedMs);
                       if (isArpRateSynced && knobState[otherId]?.isArpOn) {
                           setArpRateFromMs(otherId, computedMs);
                       }
                   }
               } else if (id === 20 || id === 21) {
                   if (synthNode) synthNode.port.postMessage({ type: 'setFx', data: { id: d.id, value: d.value } });
               }
           } else if (synthNode) {
               synthNode.port.postMessage({ type: 'setFx', data: { id: d.id, value: d.value } });
           }
       };
      
       function setupFxKnobs() {
           let activeMouseFxKnobId = null;
           const handleFxMouseDown = (e, id) => {
               if (activePatchingLfo !== null) return; // Prevent adjustment during patching
               const k = e.currentTarget; if (!isPowerOn) return;
               if (id >= 16 && id <= 25 && k.closest('.arp-disabled')) return;
               activeMouseFxKnobId = id; const d = fxKnobData[id]; if (!d) return;
               d.isDragging = true; d.startY = e.clientY; d.knobEl.style.cursor = 'grabbing'; document.body.style.cursor = 'ns-resize';
           };
           const handleFxMouseMove = (e) => {
               if (activeMouseFxKnobId === null) return;
               const d = fxKnobData[activeMouseFxKnobId]; if (!d || !d.isDragging) return;
               e.preventDefault(); const cY = e.clientY; let sensitivity = 1.5;
               if (activeMouseFxKnobId === 16 || activeMouseFxKnobId === 17) { sensitivity = 0.6; }
               const dY = (d.startY - cY) * sensitivity; d.startY = cY; updateFxKnob(activeMouseFxKnobId, dY);
           };
           const handleFxMouseUp = () => {
               if (activeMouseFxKnobId === null) return;
               const d = fxKnobData[activeMouseFxKnobId];
               if (d) { d.isDragging = false; d.knobEl.style.cursor = 'ns-resize'; }
               document.body.style.cursor = 'default'; activeMouseFxKnobId = null;
           };
           const handleFxTouchStart = (e) => {
               if (activePatchingLfo !== null) return;
               const k = e.currentTarget; const id = parseInt(k.dataset.fxId, 10);
               if (!isPowerOn || (id >= 16 && id <= 25 && k.closest('.arp-disabled'))) return;
               const d = fxKnobData[id]; if (!d) return;
               for (const t of e.changedTouches) {
                   if (d.touchId === null) {
                       d.touchId = t.identifier;
                       d.startY = t.clientY;
                       d.touchStartX = t.clientX;
                       d.touchStartY = t.clientY;
                       d.touchMoved = false;
                       break;
                   }
               }
           };
           const handleFxTouchMove = (e) => {
               for (const t of e.changedTouches) {
                   const kEntry = Object.entries(fxKnobData).find(([id, data]) => data.touchId === t.identifier);
                   if (!kEntry) continue;
                   e.preventDefault();
                   const [id, d] = kEntry;
                   const cY = t.clientY;
                   let sensitivity = 1.5;
                   if (id === '16' || id === '17') { sensitivity = 0.6; }
                   const deltaX = d.touchStartX === null ? 0 : Math.abs(t.clientX - d.touchStartX);
                   const deltaYAbs = d.touchStartY === null ? 0 : Math.abs(t.clientY - d.touchStartY);
                   if (!d.touchMoved && (deltaX > 6 || deltaYAbs > 6)) {
                       d.touchMoved = true;
                   }
                   const dY = (d.startY - cY) * sensitivity;
                   d.startY = cY;
                   updateFxKnob(parseInt(id, 10), dY);
               }
           };
           const handleFxTouchEnd = (e) => {
               for (const t of e.changedTouches) {
                   const entry = Object.entries(fxKnobData).find(([id, data]) => data.touchId === t.identifier);
                   if (!entry) continue;
                   const [id, d] = entry;
                   d.touchId = null;
                   const knobId = parseInt(id, 10);
                   if (knobId === 16 || knobId === 17) {
                       if (!d.touchMoved) {
                           const now = performance.now();
                           if (now - (d.lastTapTime || 0) < TEMPO_KNOB_DOUBLE_TAP_MS) {
                               d.lastTapTime = 0;
                               e.preventDefault();
                               toggleTempoMode();
                           } else {
                               d.lastTapTime = now;
                           }
                       } else {
                           d.lastTapTime = 0;
                       }
                   }
                   d.touchMoved = false;
                   d.touchStartX = null;
                   d.touchStartY = null;
               }
           };
           document.querySelectorAll('.fx-knob-container').forEach(k => {
               const id = parseInt(k.dataset.fxId, 10);
               fxKnobData[id] = { id:id, knobEl:k, indicator:k.querySelector('.indicator'), angle:MIN_FX_ANGLE, value:0.0, isDragging:false, startY:0, touchId:null, touchStartX:null, touchStartY:null, touchMoved:false, lastTapTime:0 };
               if(id===2){fxKnobData[id].value=1.0;} else if(id===7){fxKnobData[id].value=0.5;} else if(id===8){fxKnobData[id].value=0.0045;}
               else if(id===9){fxKnobData[id].value=0.0995;} else if(id===10){fxKnobData[id].value=0.8;} else if(id===11){fxKnobData[id].value=0.2;}
               else if(id===13){fxKnobData[id].value=0.5;} else if(id===15){fxKnobData[id].value=0.25;} else if(id===16||id===17){fxKnobData[id].value=arpRateBpmToValue(DEFAULT_ARP_RATE_BPM);}
               else if(id===18||id===19){fxKnobData[id].value=0.0;} else if(id===20||id===21){fxKnobData[id].value=1.0;}
               else if(id===22||id===23){fxKnobData[id].value=0.0;} else if(id===24||id===25){fxKnobData[id].value=0.5;} else if(id===26||id===27){fxKnobData[id].value=0.5;} else if(id===28||id===29){fxKnobData[id].value=0.0;} else if(id===30||id===31){fxKnobData[id].value=0.0;}
               fxKnobData[id].angle = MIN_FX_ANGLE + (fxKnobData[id].value * (MAX_FX_ANGLE - MIN_FX_ANGLE));
               if (fxKnobData[id].indicator) { applyIndicatorTransform(fxKnobData[id].indicator, fxKnobData[id].angle); }
               if(id===30||id===31){ updateVoiceWaveDisplay(id === 30 ? 0 : 1, fxKnobData[id].value); }
               if(id === 7) { updateFxKnob(id, 0); }
               const kId = (id >= 16 && id <= 25 && id % 2 === 0) ? 0 : (id >= 16 && id <= 25 && id % 2 !== 0) ? 1 : -1;
               if (kId !== -1 && knobState[kId]) {
                   if (id===16||id===17){
                       if (tempoMode === TEMPO_MODE_BPM) {
                           setArpRateFromBpm(kId, valueToArpRateBpm(fxKnobData[id].value));
                       } else {
                           setArpRateFromMs(kId, valueToArpRateMs(fxKnobData[id].value));
                       }
                   }
                   else if (id===18||id===19){ knobState[kId].arpOctaveRange = Math.min(3, Math.floor(fxKnobData[id].value * 4)); }
                   else if (id===22||id===23){ const pIdx = Math.min(NUM_FEEL_PATTERNS-1, Math.floor(fxKnobData[id].value*NUM_FEEL_PATTERNS)); knobState[kId].feelKnobValue=fxKnobData[id].value; knobState[kId].currentFeelPattern=EUCLIDEAN_PATTERNS[pIdx]; }
                   else if (id===24||id===25){ knobState[kId].arpTranspose=Math.floor((fxKnobData[id].value - 0.5) * 25); }
               }
               k.addEventListener('mousedown', (e)=>handleFxMouseDown(e, id));
               k.addEventListener('touchstart', handleFxTouchStart, {passive:false});
               if (id === 16 || id === 17) {
                   k.addEventListener('dblclick', handleTempoKnobDoubleClick);
               }
           });
           document.addEventListener('mousemove', handleFxMouseMove); document.addEventListener('mouseup', handleFxMouseUp);
           document.addEventListener('touchmove', handleFxTouchMove, {passive:false}); document.addEventListener('touchend', handleFxTouchEnd); document.addEventListener('touchcancel', handleFxTouchEnd);
       }
      
     function handleInteractionStart(e) {
    if (activePatchingLfo !== null) return;
    // Prevent mouse events immediately after touch events (mobile double-trigger fix)
    if (e.type === 'touchstart') {
        e.preventDefault();
        lastTouchTime = performance.now();
    }
    if (e.type === 'mousedown') {
        // Ignore mouse events within 500ms of a touch event
        if (performance.now() - lastTouchTime < 500) {
            return;
        }
    }
    
    if (e.type==='mousedown'){
        const k=e.currentTarget; 
        const id=parseInt(k.dataset.knobId,10); 
        activeMainKnobId=id; 
        const s=knobState[id]; 
        k.style.cursor='grabbing'; 
        document.body.style.cursor='grabbing'; 
        playNote(id); 
        const r=k.getBoundingClientRect(); 
        const cX=r.left+r.width/2; 
        const cY=r.top+r.height/2; 
        s.lastDragAngle=(Math.atan2(e.clientY-cY,e.clientX-cX)*180/Math.PI); 
    }
    else if (e.type==='touchstart'){ 
        for(const t of e.changedTouches){
            const k=e.currentTarget; 
            const id=parseInt(k.dataset.knobId,10); 
            const s=knobState[id]; 
            if(s&&s.touchId===null){
                s.touchId=t.identifier; 
                playNote(id); 
                const r=k.getBoundingClientRect(); 
                const cX=r.left+r.width/2; 
                const cY=r.top+r.height/2; 
                s.lastDragAngle=(Math.atan2(t.clientY-cY,t.clientX-cX)*180/Math.PI); 
                break;
            }
        }
    }
}

       function handleInteractionEnd(e) {
           if(e.type==='mouseup'){if(activeMainKnobId===null)return; const s=knobState[activeMainKnobId]; if(s&&s.dom.knob)s.dom.knob.style.cursor='grab'; document.body.style.cursor='default'; stopNote(activeMainKnobId); activeMainKnobId=null;}
           else if(e.type==='touchend'||e.type==='touchcancel'){for(const t of e.changedTouches){const s=knobState.find(k=>k.touchId===t.identifier); if(s){stopNote(s.id);s.touchId=null;}}}
       }
       function updateKnobPosition(e) {
           if(e.type==='mousemove'){if(activeMainKnobId===null)return; const s=knobState[activeMainKnobId]; if(!s||!s.dom.knob)return; e.preventDefault(); const r=s.dom.knob.getBoundingClientRect(); const cX=r.left+r.width/2; const cY=r.top+r.height/2; const curr=(Math.atan2(e.clientY-cY,e.clientX-cX)*180/Math.PI); let d=curr-s.lastDragAngle;if(d>180)d-=360;if(d<-180)d+=360; s.totalAngle+=d; s.lastDragAngle=curr; updateStateFromTotalAngle(activeMainKnobId);}
           else if(e.type==='touchmove'){for(const t of e.changedTouches){const s=knobState.find(k=>k.touchId===t.identifier); if(s&&s.dom.knob){e.preventDefault(); const r=s.dom.knob.getBoundingClientRect(); const cX=r.left+r.width/2; const cY=r.top+r.height/2; const curr=(Math.atan2(t.clientY-cY,t.clientX-cX)*180/Math.PI); let d=curr-s.lastDragAngle;if(d>180)d-=360;if(d<-180)d+=360; s.totalAngle+=d; s.lastDragAngle=curr; updateStateFromTotalAngle(s.id);}}}
       }
      
       function handleKeyDown(e) {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (activeMainKnobId !== null || knobState.some(k => k.touchId !== null) || !modalOverlay.classList.contains('opacity-0')) return;

            if (e.key === 'Shift') {
                for (const key in activeKeyControls) {
                    const control = activeKeyControls[key];
                    if (control.direction === 1) {
                        clearInterval(control.intervalId);
                        control.direction = -1;
                        control.intervalId = setInterval(() => {
                            updateFxKnob(control.fxId, KNOB_KEY_SPEED * control.direction * 0.7);
                        }, 10);
                    }
                }
                return;
            }
            
            let keyForLookup = e.key.toLowerCase();
            if (SHIFTED_KEY_MAP[e.key]) {
                keyForLookup = SHIFTED_KEY_MAP[e.key];
            }
            const key = keyForLookup;

            if ([' ', 'b', ',', '.', ';', "'", 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
            if (e.repeat || activeKeyControls[key] || spinIntervals[key]) return;

            if (key === ' ') { playNote(0); return; }
            if (key === 'b') { playNote(1); return; }

            const spinMap = {
                'arrowdown': { k: 0, s: -KNOB_KEY_SPEED }, 'arrowup': { k: 0, s: KNOB_KEY_SPEED },
                'arrowleft': { k: 0, s: -KNOB_KEY_SPEED * 2 }, 'arrowright': { k: 0, s: KNOB_KEY_SPEED * 2 },
                ';': { k: 1, s: -KNOB_KEY_SPEED }, "'": { k: 1, s: KNOB_KEY_SPEED },
                ',': { k: 1, s: -KNOB_KEY_SPEED * 2 }, '.': { k: 1, s: KNOB_KEY_SPEED * 2 }
            };

            if (key in spinMap) {
                const { k, s } = spinMap[key];
                spinIntervals[key] = setInterval(() => {
                    knobState[k].totalAngle += s;
                    updateStateFromTotalAngle(k);
                }, 10);
                return;
            }

            if (key in KEY_TO_FX_ID_MAP) {
                e.preventDefault();
                const fxId = KEY_TO_FX_ID_MAP[key];
                const data = fxKnobData[fxId];
                if (!data || (fxId >= 16 && fxId <= 25 && data.knobEl.closest('.arp-disabled'))) return;
                
                const direction = e.shiftKey ? -1 : 1;
                const intervalId = setInterval(() => {
                    updateFxKnob(fxId, KNOB_KEY_SPEED * direction * 0.7);
                }, 10);
                activeKeyControls[key] = { intervalId, fxId, direction };
            }
       }
       function handleKeyUp(e){
            if (e.key === 'Shift') {
                for (const key in activeKeyControls) {
                    const control = activeKeyControls[key];
                    if (control.direction === -1) {
                        clearInterval(control.intervalId);
                        control.direction = 1;
                        control.intervalId = setInterval(() => {
                            updateFxKnob(control.fxId, KNOB_KEY_SPEED * control.direction * 0.7);
                        }, 10);
                    }
                }
                return;
            }
           
            let keyForLookup = e.key.toLowerCase();
            if (SHIFTED_KEY_MAP[e.key]) {
                keyForLookup = SHIFTED_KEY_MAP[e.key];
            }
            const key = keyForLookup;
           
            if (key === ' ') { stopNote(0); }
            if (key === 'b') { stopNote(1); }
            
            if (key in spinIntervals) {
                clearInterval(spinIntervals[key]);
                delete spinIntervals[key];
            }
            
            if (key in activeKeyControls) {
                clearInterval(activeKeyControls[key].intervalId);
                delete activeKeyControls[key];
            }
       }
      
     function playNote(knobId){
    const state = knobState[knobId]; if(!isPowerOn || !state) return;
    
    // Prevent rapid re-triggers (mobile tap bug)
    const now = performance.now();
    if (state.lastNoteOnTime && (now - state.lastNoteOnTime) < 50) {
        return; // Ignore if less than 50ms since last noteOn
    }
    state.lastNoteOnTime = now;
        
    state.dom.knob?.classList.add('knob-active');
    state.isHeld = true;
    if(state.isArpOn) {
        const newMidi = getMidiNote(knobId);
        if(state.isSweepMode){
            if(state.arpRunning && state.isArpHoldOn){ 
                if (allowDuplicateNotesMode || !state.arpNotes.some(n => n.midi === newMidi)) {
                    state.arpNotes.push({ midi: newMidi, active: true });
                    updateSequenceDisplay(knobId);
                }
            } else { state.arpNotes = [{ midi: newMidi, active: true }]; updateSequenceDisplay(knobId); startArpeggiator(knobId); }
        } else { state.arpNotes = [{ midi: newMidi, active: true }]; updateSequenceDisplay(knobId); if (!state.arpRunning) startArpeggiator(knobId); }
    } else {
        state.isNoteOn=true; 
        const midiNote = getMidiNote(knobId);
        const freq = getNoteFrequency(midiNote);
        state.lastPlayedMidi = midiNote;
        if(synthNode) synthNode.port.postMessage({type:'noteOn',data:{voice:knobId,freq:freq}});
        captureMidiEvent(knobId, 'noteOn', midiNote, 100); 
        sendMidiMessage([0x90 + knobId, midiNote, 100]);
        updateKnobColor(knobId);
    }
}
      
      function stopNote(knobId, force=false){
    const state=knobState[knobId]; if(!isPowerOn || !state) return;
    
    state.dom.knob?.classList.remove('knob-active');
    state.isHeld=false;
    
    if(state.isArpOn) { 
        if (!state.isArpHoldOn || force) { 
            stopArpeggiator(knobId); 
            if (!state.isArpHoldOn || !state.isSweepMode || force) { 
                state.arpNotes = []; 
                updateSequenceDisplay(knobId); 
            } 
        } 
    } else { 
        if (state.isNoteOn || force) { 
            if (synthNode) {
                synthNode.port.postMessage({ type: 'noteOff', data: { voice: knobId } });
            }
            
            state.isNoteOn = false;
            
            const noteToStop = state.lastPlayedMidi !== null ? state.lastPlayedMidi : getMidiNote(knobId);
            captureMidiEvent(knobId, 'noteOff', noteToStop, 0);
            sendMidiMessage([0x80 + knobId, noteToStop, 0]); 
            state.lastPlayedMidi = null;
            updateKnobColor(knobId); 
        }
    }
}

      
       function startArpeggiator(knobId) {
          const state = knobState[knobId]; if(!state || !state.isArpOn || state.arpRunning || !synthNode) return;
          state.arpRunning = true;
          const activeNotes = state.arpNotes.filter(n => n.active);
          if (!state.isSweepMode || activeNotes.length <= 1) { state.currentArpNoteIndex = (currentArpOrder === "Down" && activeNotes.length > 0) ? activeNotes.length - 1 : 0; state.arpUpDownState = 0; }
          state.currentOctaveStep = 0; state.euclideanStepCounter = 0; state.arpDirection = 1; state.lastPlayedMidi = null;
          state.nextArpStepTime = 0;
          if (state.arpRafId) {
              clearInterval(state.arpRafId);
              state.arpRafId = null;
          }
          startArpClockForState(knobId);
      }
      
       function stopArpeggiator(knobId) {
           const state = knobState[knobId];
           if (!state) return;

           // --- Stop the existing playback loop ---
          state.arpRunning = false;
          state.nextArpStepTime = 0;
          state.lastArpStepTime = 0;
          if (state.arpRafId) {
              clearInterval(state.arpRafId);
              state.arpRafId = null;
          }
          stopMasterClockIfIdle();
          updateMidiClockState();
          if (state.isNoteOn && state.lastPlayedMidi !== null) {
           // Stop the internal synth sound
           if (synthNode) {
               synthNode.port.postMessage({ type: 'noteOff', data: { voice: knobId } });
           }
           // Capture the event for MIDI recording
           captureMidiEvent(knobId, 'noteOff', state.lastPlayedMidi, 0);
           
           // *** THE FIX: Send the MIDI Note Off message to the external synth ***
           sendMidiMessage([0x80 + knobId, state.lastPlayedMidi, 0]); 
           
           state.isNoteOn = false;
       }

           // --- THE REAL FIX: Reset all internal arp state variables to their initial values ---
           state.currentArpNoteIndex = 0;
           state.currentOctaveStep = 0;
           state.arpUpDownState = 0;
           state.euclideanStepCounter = 0;
           state.lastPlayedMidi = null;
           state.nextArpStepTime = 0;
           state.arpLastVisualIndex = -1;
           // --- End of Fix ---

           // Clear the visual indicators
           const displayContainer = document.getElementById(`arp-sequence-display-${knobId}`);
           if (displayContainer) {
               const currentPlayhead = displayContainer.querySelector('.playhead');
               if (currentPlayhead) currentPlayhead.classList.remove('playhead');
           }
           if (state.dom.arpNoteDisplay) {
               state.dom.arpNoteDisplay.textContent = "--";
           }
           updateKnobColor(knobId);
           const displayAngle = state.totalAngle % 360;
           if (state.dom.indicator) {
               applyIndicatorTransform(state.dom.indicator, displayAngle);
           }
       }
      
         function updateArpeggiator(knobId, timestamp) {
           const state = knobState[knobId];
           if (!state || !state.arpRunning || !synthNode) return;
    
           if ((!state.isHeld && !state.isArpHoldOn) || state.arpNotes.length === 0) {
               stopArpeggiator(knobId);
               if (state.isSweepMode && (!state.isHeld && !state.isArpHoldOn)) {
                   state.arpNotes = [];
                   updateSequenceDisplay(knobId);
               }
               return;
           }
                // --- CHECK FOR MAIN KNOB LFO MODULATION (for background tab support) ---
    const mainKnobDestId = knobId === 0 ? 300 : 301;
    const hasMainKnobLfo = lfoState.some(lfo => lfoTargetsInclude(lfo, mainKnobDestId));
    
    if (hasMainKnobLfo && state.isArpOn && state.isArpHoldOn && !state.isSweepMode) {
        // Calculate the modulated angle directly from LFO outputs
        let mainKnobModulation = 0;
        lfoState.forEach((lfo, idx) => {
            if (lfoTargetsInclude(lfo, mainKnobDestId)) {
                mainKnobModulation += liveLfoOutputs[idx] || 0;
            }
        });
        
        const modulatedAngle = Math.max(0, Math.min(MAX_TOTAL_ANGLE, state.totalAngle + (mainKnobModulation * MAX_TOTAL_ANGLE)));
        const modMidi = getMidiNoteFromAngle(knobId, modulatedAngle);
        
        // Update the arpNotes array directly (bypasses the need for visual updates)
        const noteChanged = state.arpNotes.length !== 1 || state.arpNotes[0].midi !== modMidi || !state.arpNotes[0].active;
        if (noteChanged) {
            state.arpNotes = [{ midi: modMidi, active: true }];
            state.currentArpNoteIndex = 0;
            state.arpUpDownState = 0;
        }
    }
    
           // --- This block now correctly reads the LIVE LFO values ---
let modulatedRateBpm = state.arpRateBpm;
let modulatedRateMs = state.arpRateMs;
let modulatedTranspose = state.arpTranspose;
let modulatedOctaveRange = state.arpOctaveRange;
let modulatedFeelPattern = state.currentFeelPattern;

lfoState.forEach((lfo, lfoIndex) => {
    const destChain = getLfoDestChain(lfo);
    if (!destChain.length || lfo.depth < 0.001) return;

    // Use the LIVE output from the audio worklet
    const lfoModValue = liveLfoOutputs[lfoIndex] || 0;

    const destIsArpRate = destChain.includes(16 + knobId);
    const destIsArpTranspose = destChain.includes(24 + knobId);
    const destIsArpOcts = destChain.includes(18 + knobId);
    const destIsArpFeel = destChain.includes(22 + knobId);

    if (destIsArpRate) {
        const baseValue = fxKnobData[16 + knobId]?.value ?? 0.5;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        if (tempoMode === TEMPO_MODE_BPM) {
            modulatedRateBpm = valueToArpRateBpm(finalValue);
        } else {
            modulatedRateMs = valueToArpRateMs(finalValue);
        }
    }
    if (destIsArpTranspose) {
        const baseValue = fxKnobData[24 + knobId]?.value ?? 0.5;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        modulatedTranspose = Math.floor((finalValue * 24) - 12);
        if (state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = modulatedTranspose;
    }
    if (destIsArpOcts) {
        const baseValue = fxKnobData[18 + knobId]?.value ?? 0;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        modulatedOctaveRange = Math.min(3, Math.floor(finalValue * 4));
        if (state.dom.octsDisplay) state.dom.octsDisplay.textContent = modulatedOctaveRange;
    }
    if (destIsArpFeel) {
        const baseValue = fxKnobData[22 + knobId]?.value ?? 0;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(finalValue * NUM_FEEL_PATTERNS));
        modulatedFeelPattern = EUCLIDEAN_PATTERNS[pIndex];
        if (state.dom.feelDisplay) state.dom.feelDisplay.textContent = pIndex + 1;
    }
});
           const isBpmMode = tempoMode === TEMPO_MODE_BPM;
           if (isBpmMode) {
               modulatedRateBpm = normalizeArpRateBpm(modulatedRateBpm);
           } else {
               modulatedRateMs = normalizeArpRateMs(modulatedRateMs);
           }

           if (state.dom.rateDisplay) {
               state.dom.rateDisplay.textContent = isBpmMode
                   ? formatTempoLabel(modulatedRateBpm)
                   : formatRateMsLabel(modulatedRateMs);
           }

           if (isBpmMode) {
               const modulatedIntervalMs = bpmToSixteenthMs(modulatedRateBpm);

               if (!Number.isFinite(state.nextArpStepTime) || state.nextArpStepTime <= 0) {
                   state.nextArpStepTime = quantizeToNextSixteenth(timestamp, modulatedIntervalMs);
                   return;
               }

               if (timestamp + MASTER_CLOCK_TOLERANCE_MS < state.nextArpStepTime) {
                   return;
               }

               state.nextArpStepTime += modulatedIntervalMs;
               while (state.nextArpStepTime <= timestamp) {
                   state.nextArpStepTime += modulatedIntervalMs;
               }
           } else {
               if (timestamp - state.lastArpStepTime < modulatedRateMs) {
                   return;
               }
               state.lastArpStepTime = timestamp;
           }

                let notesForSeq = state.arpNotes.map((noteObj, index) => ({ ...noteObj, originalIndex: index }));
                let advance = true;
                let noteIdx = state.currentArpNoteIndex;

                const activeNotesForSorting = notesForSeq.filter(n => n.active);
    
               switch (currentArpOrder) {
                   case "Up": 
                       notesForSeq.sort((a, b) => a.midi - b.midi);
                       noteIdx = state.currentArpNoteIndex % notesForSeq.length;
                       break;
                   case "Down": 
                       notesForSeq.sort((a, b) => a.midi - b.midi);
                       noteIdx = (notesForSeq.length - 1) - (state.currentArpNoteIndex % notesForSeq.length);
                       break;
                   case "Up/Down":
                       notesForSeq.sort((a, b) => a.midi - b.midi);
                       if (notesForSeq.length > 1) { 
                           noteIdx = state.currentArpNoteIndex;
                           advance = false;
                       } else { 
                           noteIdx = 0; 
                           state.currentArpNoteIndex = 0; 
                           state.arpUpDownState = 0; 
                       }
                       break;
                   case "Random": 
                       noteIdx = Math.floor(Math.random() * notesForSeq.length); 
                       advance = false; 
                       break;
                   default: // As Played
                       noteIdx = state.currentArpNoteIndex % notesForSeq.length; 
                       break;
               }
               noteIdx = Math.max(0, Math.min(notesForSeq.length - 1, noteIdx));
               
               const baseNoteObject = notesForSeq[noteIdx];
               
               const shouldPlay = modulatedFeelPattern[state.euclideanStepCounter % modulatedFeelPattern.length] === 1 && baseNoteObject && baseNoteObject.active;

               if (state.isNoteOn) {
                   synthNode.port.postMessage({ type: 'noteOff', data: { voice: knobId } });
                   captureMidiEvent(knobId, 'noteOff', state.lastPlayedMidi, 0);
                    sendMidiMessage([0x80 + knobId, state.lastPlayedMidi, 0]);
                   state.isNoteOn = false;
                   if (!shouldPlay) updateKnobColor(knobId);
               }
    
              const baseMidi = baseNoteObject ? baseNoteObject.midi : null;
               const visualIndex = baseNoteObject ? baseNoteObject.originalIndex : -1;
    
               const displayContainer = document.getElementById(`arp-sequence-display-${knobId}`);
               if (displayContainer) { 
                   const blocks = displayContainer.querySelectorAll('.sequence-note-block');
                   
                   // 1. CLEANUP: Remove 'playhead' class from the previous note
                   if (state.arpLastVisualIndex > -1 && blocks[state.arpLastVisualIndex]) {
                       blocks[state.arpLastVisualIndex].classList.remove('playhead');
                   }

                   // 2. APPLY: Check FEEL pattern and User Active state
                   if (visualIndex > -1 && blocks[visualIndex]) {
                       const isFeelSkipped = modulatedFeelPattern[state.euclideanStepCounter % modulatedFeelPattern.length] === 0;
                       const isNoteActive = baseNoteObject.active; // Check if user muted it

                       // Only blink if the Rhythm says YES AND the User says YES
                       if (!isFeelSkipped && isNoteActive) {
                           const block = blocks[visualIndex];

                           // --- THE JAVASCRIPT TRICK (Restart Animation) ---
                           block.classList.remove('playhead');
                           void block.offsetWidth; // Trigger Reflow
                           block.classList.add('playhead');
                           // ------------------------------------------------

                           state.arpLastVisualIndex = visualIndex;
                       } else {
                           state.arpLastVisualIndex = -1; 
                       }
                   }
               }
    
              const fullScaleMidi = getFullScaleMidi();
               let baseNoteIndexInScale = fullScaleMidi.indexOf(baseMidi);
               if (baseNoteIndexInScale === -1) baseNoteIndexInScale = 0;
               
               const transposedNoteIndex = baseNoteIndexInScale + modulatedTranspose;
               const transposedMidi = fullScaleMidi[Math.max(0, Math.min(fullScaleMidi.length - 1, transposedNoteIndex))];
               let octOffset = 0;
               if (modulatedOctaveRange > 0) {
                   const totalSteps = modulatedOctaveRange * 2;
                   const step = state.currentOctaveStep % totalSteps;
                   octOffset = (step <= modulatedOctaveRange) ? step : (totalSteps - step);
               }
             let finalMidiNote = transposedMidi;
               if (octOffset > 0) {
                   const scaleName = scaleSelector.value;
                   const intervals = (scaleName === 'Custom' && customScale.length > 0) ? customScale : SCALES[scaleName] || [0];
                  
                   const transposedNoteIndexInScale = fullScaleMidi.indexOf(transposedMidi);
                   if (transposedNoteIndexInScale !== -1) {
                       const finalNoteIndex = transposedNoteIndexInScale + (octOffset * intervals.length);
                       finalMidiNote = fullScaleMidi[Math.max(0, Math.min(fullScaleMidi.length - 1, finalNoteIndex))];
                   }
               }
    
               if (shouldPlay) {
                   if (finalMidiNote !== null && isFinite(finalMidiNote)) {
                       state.isNoteOn = true;
                       synthNode.port.postMessage({ type: 'noteOn', data: { voice: knobId, freq: getNoteFrequency(finalMidiNote) } });
                       captureMidiEvent(knobId, 'noteOn', finalMidiNote, 100);
                       sendMidiMessage([0x90 + knobId, finalMidiNote, 100]);
                       state.lastPlayedMidi = finalMidiNote;
                       updateKnobColor(knobId);
                       if (state.dom.arpNoteDisplay) state.dom.arpNoteDisplay.textContent = midiToNoteName(finalMidiNote);
                   } else {
                       updateKnobColor(knobId);
                       if (state.dom.arpNoteDisplay) state.dom.arpNoteDisplay.textContent = "--";
                   }
               } else {
                   if (state.dom.arpNoteDisplay) state.dom.arpNoteDisplay.textContent = "--";
               }
                if (state.dom.feelPatternPreview) {
                   const patternLen = modulatedFeelPattern.length;
                   const currentStepIdx = state.euclideanStepCounter % patternLen;
                   const dots = state.dom.feelPatternPreview.children;
                   
                   for (let i = 0; i < dots.length; i++) {
                        if (i === currentStepIdx) {
                            dots[i].classList.add('playhead');
                        } else {
                            dots[i].classList.remove('playhead');
                        }
                   }
               }
    
               state.euclideanStepCounter++;
               const totalOctSteps = (modulatedOctaveRange > 0) ? (modulatedOctaveRange * 2) : 1;
               if (++state.currentOctaveStep >= totalOctSteps) {
                   state.currentOctaveStep = 0;
                   if (currentArpOrder === "Up/Down") {
                       const len = notesForSeq.length;
                       if (len > 1) {
                           if (state.arpUpDownState === 0) {
                               state.currentArpNoteIndex++;
                               if (state.currentArpNoteIndex >= len - 1) { state.currentArpNoteIndex = len - 1; state.arpUpDownState = 1; }
                           } else {
                               state.currentArpNoteIndex--;
                               if (state.currentArpNoteIndex <= 0) { state.currentArpNoteIndex = 0; state.arpUpDownState = 0; }
                           }
                       }
                   } else if (advance) {
                       state.currentArpNoteIndex++;
                   }
               }
      }
      
       function populateScales() {
           let names = Object.keys(SCALES); names.splice(2, 0, 'Custom');
           scaleSelector.innerHTML = '';
           names.forEach(name => { const opt = document.createElement('option'); opt.value = name; opt.textContent = name.toUpperCase(); scaleSelector.appendChild(opt); });
       }
      
      function getDisplayNoteColor(noteObj, state, fullScaleMidi) {
          if (!noteObj || !state) return { r: 255, g: 255, b: 255 };
          const scale = fullScaleMidi || getFullScaleMidi();
          const baseIndex = scale.indexOf(noteObj.midi);
          let transposedMidi = noteObj.midi;

          if (baseIndex !== -1) {
              const transposedIndex = baseIndex + state.arpTranspose;
              transposedMidi = scale[Math.max(0, Math.min(scale.length - 1, transposedIndex))];
          }

          return getArpNoteColor(transposedMidi);
      }

      function updateSequenceDisplay(knobId) {
         const state = knobState[knobId];
         const displayContainer = document.getElementById(`arp-sequence-display-${knobId}`);
         if (!displayContainer) return;
         displayContainer.innerHTML = '';

         const fullScaleMidi = getFullScaleMidi();

         state.arpNotes.forEach((noteObj, index) => {
            const noteBlock = document.createElement('span');
            noteBlock.className = 'sequence-note-block';
            noteBlock.style.cursor = 'pointer';

            const { r, g, b } = getDisplayNoteColor(noteObj, state, fullScaleMidi);
            noteBlock.style.backgroundColor = `rgb(${r},${g},${b})`;
            noteBlock.classList.toggle('muted', !noteObj.active);
            
            let lastTap = 0;
            noteBlock.addEventListener('touchend', (e) => {
                e.preventDefault();
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    // Double tap
                    state.arpNotes.splice(index, 1);
                    updateSequenceDisplay(knobId);
                } else {
                    // Single tap
                    noteObj.active = !noteObj.active;
                    noteBlock.classList.toggle('muted', !noteObj.active);
                }
                lastTap = currentTime;
            });

            noteBlock.addEventListener('dblclick', () => {
                state.arpNotes.splice(index, 1);
                updateSequenceDisplay(knobId);
            });

            noteBlock.addEventListener('click', (e) => {
                // This is a fallback for single-click on desktop
                if (e.detail === 1) { // Ensure it's a single click
                    noteObj.active = !noteObj.active;
                    noteBlock.classList.toggle('muted', !noteObj.active);
                }
            });
            displayContainer.appendChild(noteBlock);
         });
      }

      function updateFeelPatternPreview(knobId) {
          const state = knobState[knobId];
          const container = state?.dom?.feelPatternPreview || document.getElementById(`feel-pattern-preview-${knobId}`);
          if (!state || !container) return;

          if (!state.isArpOn) {
              container.innerHTML = '';
              container.classList.add('hidden');
              container.setAttribute('aria-hidden', 'true');
              return;
          }

          const feelValue = typeof state.feelKnobValue === 'number' ? state.feelKnobValue : 0;
          const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(feelValue * NUM_FEEL_PATTERNS));

          const pattern = EUCLIDEAN_PATTERNS[pIndex] || [];
          container.innerHTML = '';

          const noteDisplayEl = state.dom?.noteDisplay || document.getElementById(`note-display-${knobId + 1}`);
          const computedColor = noteDisplayEl ? window.getComputedStyle(noteDisplayEl).color : '';
          if (computedColor) {
              container.style.setProperty('--feel-preview-color', computedColor);
          } else {
              const fallbackColor = getArpNoteColor(getMidiNote(knobId));
              container.style.setProperty('--feel-preview-color', `rgb(${fallbackColor.r}, ${fallbackColor.g}, ${fallbackColor.b})`);
          }

          pattern.forEach((step, idx) => {
              const dot = document.createElement('span');
              dot.className = 'feel-pattern-step';
              if (step === 1) {
                  dot.classList.add('on');
              }
              dot.setAttribute('aria-label', `Pattern step ${idx + 1}: ${step === 1 ? 'note' : 'rest'}`);
              container.appendChild(dot);
          });

          container.classList.remove('hidden');
          container.setAttribute('aria-hidden', 'false');
      }
      
       function getRandomWaveValue() {
           const waveCount = VOICE_WAVEFORMS.length || 1;
           const waveIndex = Math.floor(Math.random() * waveCount);
           return (waveIndex + 0.5) / waveCount;
       }

       function randomizeSettings() {
           keySelector.selectedIndex = Math.floor(Math.random() * keySelector.options.length);
           const scales = Array.from(scaleSelector.options).filter(o=>o.value!=='Custom');
           scaleSelector.value=scales[Math.floor(Math.random()*scales.length)].value;
           scaleSelector.dispatchEvent(new Event('change'));
           const excluded = [0,1,2,5,7,8,9,10,11,20,21,26,27,28,29];
           Object.keys(fxKnobData).forEach(idStr => {
               const id = parseInt(idStr, 10);
               if (!excluded.includes(id)) {
                   const kData = fxKnobData[id];
                   if (kData) {
                       let randVal;
                       if (id === 30 || id === 31) {
                           randVal = getRandomWaveValue();
                       } else {
                           const maxValue = (id >= 12 && id <= 15) ? 0.3 : 1;
                           randVal = Math.random() * maxValue;
                       }
                       const targetAngle = MIN_FX_ANGLE + (randVal * (MAX_FX_ANGLE - MIN_FX_ANGLE));
                       updateFxKnob(id, targetAngle - kData.angle);
                   }
               }
           });
           knobState.forEach(k => updateStateFromTotalAngle(k.id));
       }

       function updatePresetDisplay(name = '', sourceType = 'factory', category = null) {
           if (!presetNameDisplay) {
               presetNameDisplay = document.getElementById('preset-display');
           }
           if (!presetDisplayContainer) {
               presetDisplayContainer = document.getElementById('preset-display-container');
           }
           if (!presetNameDisplay) return;

           let displayText = (name || '').trim();
           if (sourceType === 'user' && displayText.toLowerCase().endsWith('.json')) {
               displayText = displayText.slice(0, -5);
           }

           if (!displayText) {
               presetNameDisplay.textContent = 'PRESET';
               presetNameDisplay.title = '';
               currentPresetMetadata = null;
               if (presetDisplayContainer) presetDisplayContainer.style.display = 'flex';
               syncPresetNavigationState(null, null, sourceType);
               return;
           }

           presetNameDisplay.textContent = displayText;
           presetNameDisplay.title = displayText;
           currentPresetMetadata = { name: displayText, sourceType, category };
           if (presetDisplayContainer) presetDisplayContainer.style.display = 'flex';
           syncPresetNavigationState(category, name, sourceType);
       }

       function updatePresetNavButtonsState() {
           const hasPresets = presetNavigationList.length > 0;
           if (presetPrevButton) presetPrevButton.disabled = !hasPresets;
           if (presetNextButton) presetNextButton.disabled = !hasPresets;
       }

       function buildPresetNavigationList() {
           presetNavigationList = Object.entries(PRESETS || {})
               .filter(([category]) => !PRESET_NAV_EXCLUDED_CATEGORIES.has(category))
               .flatMap(([category, presets]) => Object.keys(presets || {}).map((presetName) => ({
                   category,
                   name: presetName,
               })));

           updatePresetNavButtonsState();
       }

       function syncPresetNavigationState(category, presetName, sourceType = 'factory') {
           if (sourceType === 'factory' && category && !PRESET_NAV_EXCLUDED_CATEGORIES.has(category)) {
               const matchIndex = presetNavigationList.findIndex(
                   (entry) => entry.category === category && entry.name === presetName
               );
               currentPresetNavIndex = matchIndex >= 0 ? matchIndex : null;
           } else {
               currentPresetNavIndex = null;
           }

           updatePresetNavButtonsState();
       }

       function applyFactoryPreset(category, presetName, options = {}) {
           if (!category || !presetName) return false;
           const categoryPresets = PRESETS[category];
           if (!categoryPresets || !categoryPresets[presetName]) return false;

           const { skipPowerOn = false } = options;

           const presetData = JSON.parse(JSON.stringify(categoryPresets[presetName]));
           if (!isPowerOn && !skipPowerOn) powerOn();

           const fullPreset = {
               tempoMode: presetData.tempoMode ?? TEMPO_MODE_BPM,
               key: presetData.key,
               scale: presetData.scale,
               customScale: presetData.customScale || [],
               isLfoMode: presetData.isLfoMode || false,
               lfoState: presetData.lfoState || [],
               knobSettings: presetData.knobSettings || [],
               fxSettings: [...(presetData.fxSettings || [])],
               arpSettings: {
                   isArpRateSynced: presetData.arpSettings?.isArpRateSynced ?? false,
                   currentArpOrder: presetData.arpSettings?.currentArpOrder ?? 'As Played',
                   arp1: {
                       isArpOn: presetData.arpSettings?.arp1?.isArpOn ?? false,
                       isOn: presetData.arpSettings?.arp1?.isArpOn ?? false,
                       isSweepMode: presetData.arpSettings?.arp1?.isSweepMode ?? true,
                       notes: presetData.arpSettings?.arp1?.notes ?? [],
                       transpose: presetData.arpSettings?.arp1?.transpose ?? 0,
                   },
                   arp2: {
                       isArpOn: presetData.arpSettings?.arp2?.isArpOn ?? false,
                       isOn: presetData.arpSettings?.arp2?.isArpOn ?? false,
                       isSweepMode: presetData.arpSettings?.arp2?.isSweepMode ?? true,
                       notes: presetData.arpSettings?.arp2?.notes ?? [],
                       transpose: presetData.arpSettings?.arp2?.transpose ?? 0,
                   },
               },
           };

           if (presetData.arpSettings && presetData.arpSettings.fx) {
               for (const [fxId, value] of Object.entries(presetData.arpSettings.fx)) {
                   fullPreset.fxSettings.push({ id: parseInt(fxId, 10), value });
               }
           }

           const isArpCategoryPreset = category === 'ARPS';
           applyPreset(fullPreset, isArpCategoryPreset, options);
           return true;
       }

       function applyPresetFromNavigation(targetIndex) {
           const targetPreset = presetNavigationList[targetIndex];
           if (!targetPreset) return;

           if (applyFactoryPreset(targetPreset.category, targetPreset.name)) {
               updatePresetDisplay(targetPreset.name, 'factory', targetPreset.category);
           }
       }

      function handlePresetNavigation(direction, triggerEvent) {
          if (!presetNavigationList.length || !Number.isFinite(direction) || direction === 0) return;
          const dir = direction > 0 ? 1 : -1;

          let nextIndex = currentPresetNavIndex;
          if (nextIndex === null) {
              nextIndex = dir > 0 ? 0 : presetNavigationList.length - 1;
          } else {
              nextIndex = (nextIndex + dir + presetNavigationList.length) % presetNavigationList.length;
          }

          applyPresetFromNavigation(nextIndex);

          const target = triggerEvent?.currentTarget || triggerEvent?.target;
          if (target instanceof HTMLElement) target.blur();
      }

     function savePreset() {
           const preset = buildPresetData();
           const color = FILE_NOUNS[Math.floor(Math.random() * FILE_NOUNS.length)];
           const date = new Date(); const fDate = `${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${date.getFullYear()}`;
           const fname = `N-OB-${fDate}_${color}.json`; const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
           const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
       }
       function loadPreset(e) {
           const file=e.target.files[0]; if(!file)return;
           const reader=new FileReader();
           reader.onload=function(loadEvent){try{const p=JSON.parse(loadEvent.target.result);applyPreset(p);updatePresetDisplay(file.name,'user');}catch(err){console.error("Error parsing preset:",err);}};
           reader.readAsText(file); e.target.value='';
       }
      
       function updateGlobalArpVisibility() {
           const anyOn = knobState.some(k => k.isArpOn);
           const action = anyOn ? 'remove' : 'add';
           allArpControlGrids?.forEach(g => g.classList[action]('arp-hidden'));
           if (masterArpControls) masterArpControls.classList[action]('arp-hidden');
           knobState.forEach(k => updateArpControlsFading(k.id));
           updateSyncSwitchVisibility();
           updateLfoTempoSwitchStates();
       }
      
       function updateArpControlsFading(id) {
           const state = knobState[id]; if (!state || !state.dom?.arpControlsContainer) return;
           state.dom.arpControlsContainer.classList[state.isArpOn ? 'remove' : 'add']('arp-disabled');
       }
      
       function updateSyncSwitchVisibility() {
           if (!knobState || !arpSyncSwitch || !arpOrderSelector) return;
           const bothOn = knobState.every(k => k.isArpOn);
           const syncCont = document.getElementById('rate-sync-container') || arpSyncSwitch.parentElement;
           if(syncCont){
               syncCont.classList[bothOn?'remove':'add']('arp-disabled');
               if(!bothOn&&isArpRateSynced){
                   isArpRateSynced=false;
                   arpSyncSwitch.classList.remove('on');
                   updateRateButtonLockState();
                   updateLfoTempoSwitchStates();
               }
           }
            const anyOn = knobState.some(k => k.isArpOn);
            const orderCont = arpOrderSelector.parentElement;
            if(orderCont){orderCont.classList[anyOn?'remove':'add']('arp-disabled');}

            updateRateButtonLockState();
            updateLfoTempoSwitchStates();
       }
        function updateLfoVisuals(lfoOutputs) {
    const modulatedValues = {}; // key: destination id, value: total modulation amount

    lfoState.forEach((lfo, index) => {
        const destChain = getLfoDestChain(lfo);
        if (destChain.length) { // Ignore OFF and parked cables
            destChain.forEach(dest => {
                modulatedValues[dest] = (modulatedValues[dest] || 0) + lfoOutputs[index];
            });
        }
    });

    for (const knobIdStr in fxKnobData) {
        const knobId = parseInt(knobIdStr, 10);
        const knobData = fxKnobData[knobId];
        let finalValue = knobData.value;

        if (modulatedValues[knobId] !== undefined) {
            finalValue += modulatedValues[knobId];
        }

        const clampedValue = Math.max(0, Math.min(1, finalValue));

        if (knobData.indicator) {
            const newAngle = MIN_FX_ANGLE + clampedValue * (MAX_FX_ANGLE - MIN_FX_ANGLE);
            applyIndicatorTransform(knobData.indicator, newAngle);
        }

        if (knobId === 30 || knobId === 31) {
            updateVoiceWaveDisplay(knobId === 30 ? 0 : 1, clampedValue);
        }

        const lfoRateIndex = LFO_RATE_KNOB_IDS.indexOf(knobId);
        if (lfoRateIndex !== -1) {
            updateLfoRateDisplay(lfoRateIndex, clampedValue, lfoTempoLinkState[lfoRateIndex]?.enabled);
        }
    }

    applyModulatedArpUiPreviews(modulatedValues);

   Object.entries(LFO_DEST_TO_MAIN_KNOB).forEach(([destId, knobId]) => {
        const state = knobState[knobId];
        if (!state || !state.dom?.indicator) return;

        const baseAngle = state.totalAngle;
        const lfoMod = modulatedValues[destId];
        const hasActiveModulation = lfoState.some(lfo => lfoTargetsInclude(lfo, Number(destId)));
        const modulatedAngle = Math.max(0, Math.min(MAX_TOTAL_ANGLE, baseAngle + (lfoMod || 0) * MAX_TOTAL_ANGLE));
        const displayAngle = modulatedAngle % 360;
           
        // --- FIX: Enforce correct pivot point in LFO loop (was commented out) ---
        let knobRadius = state.dom.knob.offsetHeight / 2;
        
        // Use the same fallback logic as updateStateFromTotalAngle
        if (knobRadius === 0) {
            knobRadius = window.innerWidth >= 640 ? 96 : 80;
        }
        
        // 12px matches the 'top-3' (0.75rem) CSS positioning
        state.dom.indicator.style.transformOrigin = `center ${knobRadius - 12}px`;
        // ---------------------------------------------
       
        applyIndicatorTransform(state.dom.indicator, displayAngle);

        const modMidi = getMidiNoteFromAngle(knobId, modulatedAngle);
        let displayMidi = modMidi;
        if (state.isArpOn) {
            const fullScaleMidi = getFullScaleMidi();
            const baseNoteIndexInScale = fullScaleMidi.indexOf(modMidi);
            if (baseNoteIndexInScale !== -1) {
                const transposedNoteIndex = baseNoteIndexInScale + state.arpTranspose;
                const clampedIndex = Math.max(0, Math.min(fullScaleMidi.length - 1, transposedNoteIndex));
                displayMidi = fullScaleMidi[clampedIndex];
            }
        }

        const isNoteRepeatHoldActive = state.isArpOn && state.isArpHoldOn && !state.isSweepMode;
        const prefersModulatedDisplay = isLfoMode || hasActiveModulation;
        const shouldUsePlaybackMidi = state.lastPlayedMidi !== null && state.arpRunning && (!prefersModulatedDisplay || isNoteRepeatHoldActive);
        const midiForUi = shouldUsePlaybackMidi ? state.lastPlayedMidi : displayMidi; // LFO views favor modulated angle unless Note Repeat + Hold needs playback

        // OPTIMIZATION: Only write to DOM if the text actually changed
        const newNoteText = midiToNoteName(midiForUi);
        if (state.dom.noteDisplay && state.dom.noteDisplay.textContent !== newNoteText) {
            state.dom.noteDisplay.textContent = newNoteText;
        }

        // OPTIMIZATION: Only update color if the note changed
        // (You might need to store 'lastColorMidi' on the state object to track this efficiently)
        if (state.dom.knob && state.lastVisualMidi !== midiForUi) {
            const finalRgb = getArpNoteColor(midiForUi);
            state.dom.knob.style.backgroundColor = `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
            state.lastVisualMidi = midiForUi; // Store this in your knobState init
        }
           
        if (state.isArpOn && (state.isHeld || isNoteRepeatHoldActive)) {
            if (state.isSweepMode) {
                const lastNote = state.arpNotes[state.arpNotes.length - 1]?.midi;
                const alreadyPresent = state.arpNotes.some(n => n.midi === modMidi);
                if ((allowDuplicateNotesMode && lastNote !== modMidi) || (!allowDuplicateNotesMode && !alreadyPresent)) {
                    state.arpNotes.push({ midi: modMidi, active: true });
                    updateSequenceDisplay(knobId);
                }
            } else {
                const noteChanged = state.arpNotes.length !== 1 || state.arpNotes[0].midi !== modMidi || !state.arpNotes[0].active;
                state.arpNotes = [{ midi: modMidi, active: true }];
                if (noteChanged) {
                    state.currentArpNoteIndex = 0;
                    state.arpUpDownState = 0;
                    updateSequenceDisplay(knobId);
                }
            }
        } else if (state.isHeld && synthNode && isPowerOn && !state.isArpOn) {
            synthNode.port.postMessage({ type: 'setFreq', data: { voice: knobId, freq: getNoteFrequency(modMidi) } });
        }
    });

    // --- NEW: UPDATE COLORS FOR PLAYING ARPS (even without main knob LFO modulation) ---
    knobState.forEach((state, knobId) => {
        if (!state || !state.dom?.knob) return;
        
        // If arp is running and actively playing a note, update the color
        if (state.arpRunning && state.lastPlayedMidi !== null) {
            const finalRgb = getArpNoteColor(state.lastPlayedMidi);
            state.dom.knob.style.backgroundColor = `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
        }
    });
}

        function applyModulatedArpUiPreviews(modulatedValues = {}) {
            knobState.forEach((state, idx) => {
                if (!state?.dom) return;

                const rateFxId = 16 + idx;
                const rateBase = fxKnobData[rateFxId]?.value ?? 0.5;
                const rateDelta = modulatedValues[rateFxId] || 0;
                const rateValue = clamp(rateBase + rateDelta, 0, 1);
                if (state.dom.rateDisplay) {
                    if (tempoMode === TEMPO_MODE_BPM) {
                        const bpm = normalizeArpRateBpm(valueToArpRateBpm(rateValue));
                        state.dom.rateDisplay.textContent = formatTempoLabel(bpm);
                    } else {
                        state.dom.rateDisplay.textContent = formatRateMsLabel(valueToArpRateMs(rateValue));
                    }
                }

                const transposeFxId = 24 + idx;
                const transposeBase = fxKnobData[transposeFxId]?.value ?? 0.5;
                const transposeValue = clamp(transposeBase + (modulatedValues[transposeFxId] || 0), 0, 1);
                if (state.dom.transposeDisplay) {
                    const trans = Math.floor((transposeValue * 24) - 12);
                    state.dom.transposeDisplay.textContent = trans;
                }

                const octFxId = 18 + idx;
                const octBase = fxKnobData[octFxId]?.value ?? 0;
                const octValue = clamp(octBase + (modulatedValues[octFxId] || 0), 0, 1);
                if (state.dom.octsDisplay) {
                    const octs = Math.min(3, Math.floor(octValue * 4));
                    state.dom.octsDisplay.textContent = octs;
                }

        const feelFxId = 22 + idx;
                const feelBase = fxKnobData[feelFxId]?.value ?? 0;
                const feelValue = clamp(feelBase + (modulatedValues[feelFxId] || 0), 0, 1);
                const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(feelValue * NUM_FEEL_PATTERNS));
                const newPattern = EUCLIDEAN_PATTERNS[pIndex];

                state.feelKnobValue = feelValue;
                if (state.currentFeelPattern !== newPattern) {
                    state.currentFeelPattern = newPattern;
                    state.euclideanStepCounter = 0;
                }

                if (state.dom.feelDisplay) {
                    state.dom.feelDisplay.textContent = pIndex + 1;
                }
                updateFeelPatternPreview(idx);
            });
        }

        function ensureLfoAnimationRunning() {
            if (lfoAnimationId !== null) return;
            const animateLFOs = () => {
                if (synthNode) synthNode.port.postMessage({ type: 'requestLfoUpdate' });
            };
            animateLFOs();
            lfoAnimationId = setInterval(animateLFOs, 16);
        }

        function shouldKeepLfoAnimationRunning() {
            return isLfoMode || lfoState.some(lfo => getLfoDestChain(lfo).length);
        }
      
      function toggleEasterEggMode() {
        allowDuplicateNotesMode = !allowDuplicateNotesMode;
        document.body.classList.toggle('easter-egg-mode', allowDuplicateNotesMode);
        knobState.forEach(k => updateFeelPatternPreview(k.id));
      }
 function toggleLfoModeUI(forceState, isPresetLoad = false) {
    const wasInPatchingMode = activePatchingLfo !== null;
    if (wasInPatchingMode) stopLfoPatching();

    const newState = forceState !== undefined ? forceState : !isLfoMode;
    if (newState === isLfoMode && !isPresetLoad) return; // No change needed unless it's a preset load forcing a redraw
    isLfoMode = newState;

    document.body.classList.toggle('lfo-mode', isLfoMode);
    document.getElementById('lfo-mode-switch')?.classList.toggle('on', isLfoMode);

    const lfoGrid = document.getElementById('lfo-grid-container');
    const fxGrid = document.getElementById('fx-grid-container');
    if (!lfoGrid || !fxGrid) return;

    lfoGrid.style.display = isLfoMode ? 'block' : 'none';
    fxGrid.style.display = 'block'; // Always ensure the FX grid is visible

    if (isLfoMode) {
        // *** THE FIX IS HERE: Only reset if it's NOT a preset load ***
        if (!isPresetLoad) {
            // RESET ALL LFO KNOBS TO DEFAULTS WHEN MANUALLY ENTERING LFO MODE
            const lfoKnobIds = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115];
            lfoKnobIds.forEach(id => {
                setFxValue(id, 0, true);
                const lfoInfo = LFO_KNOB_MAP[id];
                if (lfoInfo) {
                    const resetValue = lfoInfo.param === 'dest' ? LFO_DEST_NONE : 0;
                    if (lfoInfo.param === 'dest') {
                        setLfoDestChain(lfoInfo.lfo, []);
                    } else {
                        lfoState[lfoInfo.lfo][lfoInfo.param] = resetValue;
                        if (synthNode) {
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfoInfo.lfo, param: lfoInfo.param, value: resetValue } });
                        }
                    }
                }
            });
            for (let i = 0; i < 4; i++) {
                const waveDisplay = document.getElementById(`lfo-wave-display-${i}`);
                if (waveDisplay) waveDisplay.textContent = 'SINE';
                updateLfoDestDisplay(i);
            }
        }
        
        drawLfoCables();

        ensureLfoAnimationRunning();
        updateLfoTempoSwitchStates();

    } else {
            lfoState.forEach((lfo, idx) => {
        if (getLfoDestChain(lfo).length) {
            setLfoDestChain(idx, []);
        }
    });
            lfoTempoLinkState.forEach((link, idx) => {
            if (link.enabled) {
                setLfoTempoSync(idx, false);
            }
        });
        if (!shouldKeepLfoAnimationRunning() && lfoAnimationId !== null) {
            clearInterval(lfoAnimationId);
            lfoAnimationId = null;
        }
        Object.values(fxKnobData).forEach(d => {
            applyIndicatorTransform(d.indicator, d.angle);
        });
        drawLfoCables();
    }
}

    function normalizePresetLfoDest(rawDest) {
        if (rawDest === null || rawDest === undefined) return LFO_DEST_NONE;

        if (typeof rawDest === 'number' && !Number.isNaN(rawDest)) {
            if (rawDest === 200 || rawDest === 300) return MAIN_LFO_DEST_IDS[0];
            if (rawDest === 201 || rawDest === 301) return MAIN_LFO_DEST_IDS[1];
            if (rawDest === LFO_DEST_NONE) return LFO_DEST_NONE;
            return rawDest;
        }

        if (typeof rawDest === 'string') {
            const trimmed = rawDest.trim();
            if (!trimmed) return LFO_DEST_NONE;

            const compact = trimmed.replace(/\s+/g, '').toUpperCase();
            if (compact === 'NONE' || compact === 'OFF') return LFO_DEST_NONE;
            if (['MAIN1', 'OSC1', 'OSCILLATOR1', 'VOICE1'].includes(compact)) return MAIN_LFO_DEST_IDS[0];
            if (['MAIN2', 'OSC2', 'OSCILLATOR2', 'VOICE2'].includes(compact)) return MAIN_LFO_DEST_IDS[1];
            if (compact === 'GLIDE') return 0;

            for (const [id, name] of Object.entries(KNOB_ID_TO_NAME_MAP)) {
                if (!name) continue;
                const normalizedName = name.trim().replace(/\s+/g, '').toUpperCase();
                if (normalizedName === compact) {
                    return parseInt(id, 10);
                }
            }
        }

        return LFO_DEST_NONE;
    }

function applyPreset(p, isArpCategoryPreset = false, options = {}) {
           if (!p) return;

           const { skipPowerOn = false } = options;

           const ignoreLocks = !!isArpCategoryPreset;
           const arpLockActive = ignoreLocks ? false : isArpLockEnabled;
           const lfoLockActive = ignoreLocks ? false : isLfoLockEnabled;

           if (!skipPowerOn && !isPowerOn) powerOn();

           // --- 1. STOP old arps completely FIRST ---
           stopArpeggiator(0);
           stopArpeggiator(1);

           // --- 2. WIPE all knobs to a clean state ---
           resetAllFxToDefaults({ skipArpKnobs: arpLockActive, skipLfoKnobs: lfoLockActive });

           // --- 3. RESTORE tempo mode before applying rate-dependent settings ---
           const presetTempoMode = p.tempoMode ?? TEMPO_MODE_BPM;
           if (!arpLockActive) {
               setTempoMode(presetTempoMode);
           }

           // --- 4. APPLY all new settings from the preset ---
           if (!arpLockActive) {
               scaleSelector.value = p.scale ?? 'Major';
               scaleSelector.dispatchEvent(new Event('change'));
               keySelector.value = p.key ?? 'C';
           }

           if (p.allowDuplicateNotesMode !== undefined) {
               allowDuplicateNotesMode = p.allowDuplicateNotesMode;
           }
           document.body.classList.toggle('easter-egg-mode', allowDuplicateNotesMode);
           knobState.forEach(k => updateFeelPatternPreview(k.id));

           if (!arpLockActive && p.scale === 'Custom') {
               customScale = p.customScale || [];
               document.querySelectorAll('#custom-scale-builder .key').forEach(k => { const n = parseInt(k.dataset.note); k.classList.toggle('selected', customScale.includes(n)); });
           }
           
           // --- 4. APPLY LFO STATE (IMPORTANT: Do this before FX settings) ---
           const presetTempoSyncTargets = [];
            if (!lfoLockActive) {
                if (p.lfoState && Array.isArray(p.lfoState)) {
                   // Reset all LFOs to defaults first to ensure no partial state lingers if the preset has fewer than 4 LFOs
                   lfoState.forEach((lfo, index) => {
                        lfo.rate = 0; lfo.depth = 0; lfo.wave = 0;
                        setLfoDestChain(index, []);
                        if (synthNode) {
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: 0 } });
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: 0 } });
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: 0 } });
                        }
                   });

                   p.lfoState.forEach((savedLfo, index) => {
                       if (index < lfoState.length) {
                           lfoState[index].rate = savedLfo.rate ?? 0;
                           lfoState[index].depth = savedLfo.depth ?? 0;
                           lfoState[index].wave = savedLfo.wave ?? 0;
                           const savedDestChain = Array.isArray(savedLfo.destChain) && savedLfo.destChain.length ? savedLfo.destChain : [savedLfo.dest];
                           setLfoDestChain(index, savedDestChain);

                           const storedFreeValue = clamp(savedLfo.storedFreeValue ?? lfoTempoLinkState[index].storedFreeValue ?? 0.5, 0, 1);
                           lfoTempoLinkState[index].storedFreeValue = storedFreeValue;
                           if (savedLfo.tempoSync) {
                               presetTempoSyncTargets.push({ index, storedFreeValue });
                           }

                           const rateKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'rate');
                           const depthKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'depth');
                           const waveKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'wave');

                           if (rateKnobId) {
                               const rateKnobValue = savedLfo.tempoSync ? storedFreeValue : lfoState[index].rate;
                               setFxValue(parseInt(rateKnobId), rateKnobValue, true);
                           }
                           if (depthKnobId) setFxValue(parseInt(depthKnobId), lfoState[index].depth, true);
                           if (waveKnobId) {
                               const waveIndex = lfoState[index].wave;
                               const waveKnobValue = (waveIndex + 0.5) / LFO_WAVEFORMS.length;
                               setFxValue(parseInt(waveKnobId), waveKnobValue, true);
                               const waveDisplay = document.getElementById(`lfo-wave-display-${index}`);
                               if (waveDisplay) waveDisplay.textContent = LFO_WAVEFORMS[waveIndex];
                           }

                           updateLfoDestDisplay(index);

                           if (synthNode) {
                               synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: lfoState[index].rate } });
                               synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: lfoState[index].depth } });
                               synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: lfoState[index].wave } });
                               synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'destChain', value: getLfoDestChain(lfoState[index]) } });
                           }
                       }
                   });

                   if (lfoState.some(lfo => getLfoDestChain(lfo).some(dest => LFO_DEST_TO_MAIN_KNOB[dest]))) {
                       ensureLfoAnimationRunning();
                   }
               } else { // Reset LFOs for older presets (THE FIX IS HERE)
                   lfoState.forEach((lfo, index) => {
                       lfo.rate = 0; lfo.depth = 0; lfo.wave = 0;
                       setLfoDestChain(index, []);

                       // *** FORCE UPDATE THE AUDIO ENGINE ***
                       if (synthNode) {
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: 0 } });
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: 0 } });
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: 0 } });
                            synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'destChain', value: [] } });
                        }
                    });

                   // Reset UI Text
                   for (let i = 0; i < 4; i++) {
                        const waveDisplay = document.getElementById(`lfo-wave-display-${i}`);
                        if (waveDisplay) waveDisplay.textContent = 'SINE';
                        updateLfoDestDisplay(i);
                   }
               }
           } else {
               // Reassert the existing LFO configuration when locked so newer presets without LFO data
               // keep the previous modulation routing and depth.
               lfoState.forEach((lockedLfo, index) => {
                   const rateKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'rate');
                   const depthKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'depth');
                   const waveKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'wave');

                   // Destinations must always be reasserted to keep the modulation patch live.
                   setLfoDestChain(index, getLfoDestChain(lockedLfo));

                   if (rateKnobId) {
                       const rateValue = lfoTempoLinkState[index]?.enabled ? lfoTempoLinkState[index].storedFreeValue : (lockedLfo.rate ?? 0);
                       setFxValue(parseInt(rateKnobId, 10), rateValue, true);
                   }
                   if (depthKnobId) setFxValue(parseInt(depthKnobId, 10), lockedLfo.depth ?? 0, true);
                   if (waveKnobId) {
                       const waveIndex = lockedLfo.wave ?? 0;
                       const waveValue = (waveIndex + 0.5) / LFO_WAVEFORMS.length;
                       setFxValue(parseInt(waveKnobId, 10), waveValue, true);
                       const waveDisplay = document.getElementById(`lfo-wave-display-${index}`);
                       if (waveDisplay) waveDisplay.textContent = LFO_WAVEFORMS[waveIndex];
                   }

                   if (synthNode) {
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: lockedLfo.rate ?? 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: lockedLfo.depth ?? 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: lockedLfo.wave ?? 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'destChain', value: getLfoDestChain(lockedLfo) } });
                   }
               });

               if (lfoState.some(lfo => getLfoDestChain(lfo).length)) {
                   ensureLfoAnimationRunning();
               }
           }

           const targetLfoMode = lfoLockActive ? true : (p.isLfoMode ?? false);
           toggleLfoModeUI(targetLfoMode, true);

           if (p.knobSettings) { p.knobSettings.forEach(kD => { const s = knobState.find(k => k.id === kD.id); if (s) s.totalAngle = kD.totalAngle ?? 0; }); }
           
           if (p.fxSettings) {
               p.fxSettings.forEach(fx => {
                   if (arpLockActive && [16, 17, 18, 19, 22, 23, 24, 25].includes(fx.id)) return;
                   if (lfoLockActive && LFO_FX_IDS.includes(fx.id)) return;
                   setFxValue(fx.id, fx.value ?? 0);
               });
           }

           if (p.arpSettings && !arpLockActive) {
               isArpRateSynced = p.arpSettings.isArpRateSynced ?? false;
               currentArpOrder = p.arpSettings.currentArpOrder ?? "Up";
               arpSyncSwitch.classList.toggle('on', isArpRateSynced);
               arpOrderSelector.value = currentArpOrder;

               const arp1 = p.arpSettings.arp1 || {};
               knobState[0].isArpOn = arp1.isArpOn ?? false;
               knobState[0].isArpHoldOn = arp1.isOn ?? false;
               knobState[0].isSweepMode = arp1.isSweepMode ?? true;
               knobState[0].dom.arpModeSwitch?.classList.toggle('on', knobState[0].isSweepMode);
                knobState[0].arpNotes = (arp1.notes || []).map(n => typeof n === 'number' ? { midi: n, active: true } : n);
               updateSequenceDisplay(0);
               knobState[0].arpTranspose = arp1.transpose ?? 0;
               if (knobState[0].isArpOn && !knobState[0].isArpHoldOn && knobState[0].arpNotes.length > 0) {
                   knobState[0].isArpHoldOn = true;
               }
               knobState[0].dom.arpSwitch?.classList.toggle('on', knobState[0].isArpOn);
               document.getElementById('arp-hold-switch-0')?.classList.toggle('on', knobState[0].isArpHoldOn);

               const arp2 = p.arpSettings.arp2 || {};
               knobState[1].isArpOn = arp2.isArpOn ?? false;
               knobState[1].isArpHoldOn = arp2.isOn ?? false;
               knobState[1].isSweepMode = arp2.isSweepMode ?? true;
               knobState[1].dom.arpModeSwitch?.classList.toggle('on', knobState[1].isSweepMode);
                knobState[1].arpNotes = (arp2.notes || []).map(n => typeof n === 'number' ? { midi: n, active: true } : n);
               updateSequenceDisplay(1);
               knobState[1].arpTranspose = arp2.transpose ?? 0;
               if (knobState[1].isArpOn && !knobState[1].isArpHoldOn && knobState[1].arpNotes.length > 0) {
                   knobState[1].isArpHoldOn = true;
               }
               knobState[1].dom.arpSwitch?.classList.toggle('on', knobState[1].isArpOn);
               document.getElementById('arp-hold-switch-1')?.classList.toggle('on', knobState[1].isArpHoldOn);
               
               if (isArpRateSynced && knobState[0].isArpOn && knobState[1].isArpOn) {
                    const arp1RateValue = fxKnobData[16].value;
                    setFxValue(17, arp1RateValue);
               }
           }

           if (presetTempoSyncTargets.length > 0) {
               presetTempoSyncTargets.forEach(({ index, storedFreeValue }) => {
                   setLfoTempoSync(index, true, storedFreeValue);
               });
           }

           updateGlobalArpVisibility();
           knobState.forEach(k => { updateStateFromTotalAngle(k.id); });
           knobState.forEach(k => {
               if (isPowerOn && k.isArpOn && k.isArpHoldOn && k.arpNotes.length > 0) {
                   startArpeggiator(k.id);
               }
           });
       }

function setFxValue(id, value, forceVisualUpdate = false) {
            const d = fxKnobData[id];
            if (!d) return;

            d.value = Math.max(0, Math.min(1, value));
            d.angle = MIN_FX_ANGLE + (d.value * (MAX_FX_ANGLE - MIN_FX_ANGLE));
            if (d.indicator && (!isLfoMode || forceVisualUpdate)) {
                applyIndicatorTransform(d.indicator, d.angle);
            }

            if (id === 30 || id === 31) {
                updateVoiceWaveDisplay(id === 30 ? 0 : 1, d.value);
            }

            const rateIndex = LFO_RATE_KNOB_IDS.indexOf(id);
            if (rateIndex !== -1) {
                if (!lfoTempoLinkState[rateIndex].enabled) {
                    lfoTempoLinkState[rateIndex].storedFreeValue = d.value;
                }
                updateLfoRateDisplay(rateIndex, d.value, false);
            }

            if (id === 7) {
                const val = d.value; let r,g,b;
                if (val < 0.5) { const p = val * 2; r = Math.round(COLOR_GREEN[0]*(1-p)+COLOR_YELLOW[0]*p); g = Math.round(COLOR_GREEN[1]*(1-p)+COLOR_YELLOW[1]*p); b = Math.round(COLOR_GREEN[2]*(1-p)+COLOR_YELLOW[2]*p); }
                else { const p = (val - 0.5) * 2; r = Math.round(COLOR_YELLOW[0]*(1-p)+COLOR_RED[0]*p); g = Math.round(COLOR_YELLOW[1]*(1-p)+COLOR_RED[1]*p); b = Math.round(COLOR_YELLOW[2]*(1-p)+COLOR_RED[2]*p); }
                d.knobEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }

            const knobId = (id >= 16 && id <= 25 && id % 2 === 0) ? 0 : (id >= 16 && id <= 25 && id % 2 !== 0) ? 1 : -1;
            if (knobId !== -1) {
                const state = knobState[knobId];
                if (!state) return;
                if (id === 18 || id === 19) {
                    state.arpOctaveRange = Math.min(3, Math.floor(d.value * 4));
                    if (state.dom.octsDisplay) state.dom.octsDisplay.textContent = state.arpOctaveRange;
                } else if (id === 22 || id === 23) {
                    const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(d.value * NUM_FEEL_PATTERNS));
                    state.feelKnobValue = d.value;
                    state.currentFeelPattern = EUCLIDEAN_PATTERNS[pIndex];
                    if (state.dom.feelDisplay) state.dom.feelDisplay.textContent = pIndex + 1;
                    updateFeelPatternPreview(knobId);
                } else if (id === 24 || id === 25) {
                    state.arpTranspose = Math.floor((d.value * 24) - 12);
                    if (state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = state.arpTranspose;
                } else if (id === 16 || id === 17) {
                    if (tempoMode === TEMPO_MODE_BPM) {
                        setArpRateFromBpm(knobId, valueToArpRateBpm(d.value));
                    } else {
                        setArpRateFromMs(knobId, valueToArpRateMs(d.value));
                    }
                }
            }
            if (synthNode) {
                 if (isLfoMode && LFO_KNOB_MAP[id] && LFO_KNOB_MAP[id].param !== 'dest') {
                    // This case is handled in updateFxKnob, do nothing here.
                 } else {
                     synthNode.port.postMessage({ type: 'setFx', data: { id: d.id, value: d.value } });
                 }
            }
        }

function resetAllFxToDefaults({ skipArpKnobs = false, skipLfoKnobs = false } = {}) {
           if (!skipLfoKnobs) {
               resetLfoTempoSyncState();
           }
           Object.keys(fxKnobData).forEach(idStr => {
               const id = parseInt(idStr, 10);
               if (skipArpKnobs && [16, 17, 18, 19, 22, 23, 24, 25].includes(id)) return;
               if (skipLfoKnobs && LFO_FX_IDS.includes(id)) return;
               let defaultValue = 0.0;
               if (id === 2) defaultValue = 1.0;
               if (id === 7) defaultValue = 0.7;
               if (id === 10) defaultValue = 1.0;
               if (id === 16 || id === 17) defaultValue = arpRateBpmToValue(DEFAULT_ARP_RATE_BPM);
               if (id === 20 || id === 21) defaultValue = 1.0;
               if (id === 26 || id === 27) defaultValue = 0.5;
               if (id === 24 || id === 25) defaultValue = 0.5;
               if (id === 30 || id === 31) defaultValue = 0.0;
               setFxValue(id, defaultValue);
           });
       }

function generateAndApplyRandomPreset(complexity = 'SIMPLE') {
    if (!isPowerOn) powerOn();
    
    // 1. Update Display Title
    const title = complexity === 'COMPLEX' ? 'COMPLEX RANDOM ARP' : 'RANDOM ARP';
    updatePresetDisplay(title, 'random');

    // 2. --- Foundation: Pick a random Key and Scale ---
    const randomKey = NOTES[Math.floor(Math.random() * NOTES.length)];
    const availableScales = Object.keys(SCALES).filter(s => s !== 'Blues' && s !== 'Custom');
    const randomScaleName = availableScales[Math.floor(Math.random() * availableScales.length)];
    const scaleIntervals = SCALES[randomScaleName];

    // 3. --- Generate a pool of musically valid MIDI notes ---
    const rootNoteIndex = NOTES.indexOf(randomKey);
    const validNotes = [];
    for (let oct = 3; oct < 7; oct++) {
        for (const interval of scaleIntervals) {
            validNotes.push(rootNoteIndex + (oct * 12) + interval);
        }
    }

    // 4. --- Arpeggiator Brain (UPDATED) ---
    // If Complex: ALWAYS use 2 Arps.
    // If Simple: 50% chance of 2 Arps.
    const useTwoArps = complexity === 'COMPLEX' || Math.random() < 0.5;
    
    const arp1Notes = [];
    const numNotes1 = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numNotes1; i++) {
        arp1Notes.push({ midi: validNotes[Math.floor(Math.random() * validNotes.length)], active: true });
    }

    let arp2Config = { isArpOn: false, notes: [] };
    if (useTwoArps) {
        const arp2Notes = [];
        const numNotes2 = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numNotes2; i++) {
            arp2Notes.push({ midi: validNotes[Math.floor(Math.random() * validNotes.length)], active: true });
        }
        arp2Config = {
            isArpOn: true,
            notes: arp2Notes,
            transpose: Math.random() < 0.4 ? (Math.random() > 0.5 ? 2 : -2) : 0,
        };
    }

    // 5. --- Sound Character (FX and Envelope) ---
    const fxSettings = [
        { id: 8, value: Math.random() * 0.4 }, { id: 9, value: Math.random() }, { id: 10, value: Math.random() }, { id: 11, value: 0.1 + Math.random() * 0.7 },
        { id: 0, value: Math.random() < 0.2 ? Math.random() * 0.4 : 0 }, { id: 1, value: Math.random() * Math.random() }, { id: 2, value: 0.5 + Math.random() * 0.5 },
        { id: 3, value: Math.random() }, { id: 4, value: Math.random() * 0.6 }, { id: 5, value: Math.random() < 0.3 ? Math.random() : 0 }, { id: 6, value: Math.random() * 0.8 },
        { id: 12, value: Math.random() * 0.8 }, { id: 13, value: Math.random() }, { id: 14, value: Math.random() * 0.7 }, { id: 15, value: Math.random() },
        { id: 20, value: Math.random() * 0.5 + 0.5 }, { id: 21, value: Math.random() * 0.5 + 0.5 }, { id: 28, value: Math.random() }, { id: 29, value: Math.random() },
        { id: 30, value: getRandomWaveValue() }, { id: 31, value: getRandomWaveValue() }
    ];

    // 6. --- LFO Logic ---
    let lfoState = [];
    if (complexity === 'COMPLEX') {
        lfoState = generateComplexRandomLfoState(true);
    } else {
        lfoState = Array(4).fill({ rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false });
    }

    // 7. --- Final Assembly ---
    const randomPreset = {
        key: randomKey,
        scale: randomScaleName,
        isLfoMode: complexity === 'COMPLEX',
        fxSettings: fxSettings,
        lfoState: lfoState,
        arpSettings: {
            isArpRateSynced: Math.random() < 0.5,
            currentArpOrder: ["Up", "Down", "Up/Down", "Random"][Math.floor(Math.random() * 4)],
            arp1: { isArpOn: true, isOn: true, notes: arp1Notes, transpose: Math.random() < 0.2 ? 12 : 0 },
            arp2: { ...arp2Config, isOn: arp2Config.isArpOn },
            fx: {
                16: Math.random(), 17: Math.random(), 18: Math.random() * 0.8, 19: Math.random() * 0.8,
                22: Math.random(), 23: Math.random()
            }
        }
    };

    if (randomPreset.arpSettings && randomPreset.arpSettings.fx) {
        for (const [fxId, value] of Object.entries(randomPreset.arpSettings.fx)) {
            randomPreset.fxSettings.push({ id: parseInt(fxId), value: value });
        }
    }
    
    applyPreset(randomPreset);
}
function snapArpNotesToScale() {
           // 1. Get a complete list of all valid MIDI notes in the NEW scale.
           const newScaleNotes = getFullScaleMidi();

           // 2. Loop through both arpeggiators (Arp 1 and Arp 2).
           knobState.forEach(state => {
               if (state.arpNotes.length === 0) return; // Skip if the arp is empty.

               // 3. Create a new array to hold the corrected notes.
               const snappedNotes = state.arpNotes.map(noteObj => {
                   
                   // 4. Find the closest note in the new scale.
                   let closestNote = newScaleNotes[0];
                   let minDifference = Math.abs(noteObj.midi - closestNote);

                   for (const scaleNote of newScaleNotes) {
                       const difference = Math.abs(noteObj.midi - scaleNote);

                       // If this note is closer, it becomes the new best match.
                       if (difference < minDifference) {
                           minDifference = difference;
                           closestNote = scaleNote;
                       } 
                       // --- THE EDGE CASE: It's equally close (a tie) ---
                       else if (difference === minDifference) {
                           // Randomly decide whether to keep the old closest or use the new one.
                           if (Math.random() < 0.5) {
                               closestNote = scaleNote;
                           }
                       }
                   }
                   return { midi: closestNote, active: noteObj.active };
               });

               // 5. Replace the old sequence with the new, snapped sequence.
               state.arpNotes = snappedNotes;

               // 6. Update the visual display to show the new notes.
               updateSequenceDisplay(state.id);
           });
       }
function generateAndApplyRandomSound(complexity = 'SIMPLE') {
    if (!isPowerOn) powerOn();
    
    const title = complexity === 'COMPLEX' ? 'COMPLEX RANDOM SOUND' : 'RANDOM SOUND';
    updatePresetDisplay(title, 'random');

    const randomKey = NOTES[Math.floor(Math.random() * NOTES.length)];
    const availableScales = Object.keys(SCALES).filter(s => s !== 'Blues' && s !== 'Custom');
    const randomScaleName = availableScales[Math.floor(Math.random() * availableScales.length)];
    
    const fxSettings = [
        { id: 8, value: Math.random() * 0.4 }, { id: 9, value: Math.random() }, { id: 10, value: Math.random() }, { id: 11, value: 0.1 + Math.random() * 0.7 },
        { id: 0, value: Math.random() < 0.2 ? Math.random() * 0.4 : 0 }, { id: 1, value: Math.random() * Math.random() }, { id: 2, value: 0.5 + Math.random() * 0.5 },
        { id: 3, value: Math.random() }, { id: 4, value: Math.random() * 0.6 }, { id: 5, value: Math.random() < 0.3 ? Math.random() : 0 }, { id: 6, value: Math.random() * 0.8 },
        { id: 12, value: Math.random() * 0.8 }, { id: 13, value: Math.random() }, { id: 14, value: Math.random() * 0.7 }, { id: 15, value: Math.random() },
        { id: 20, value: Math.random() * 0.5 + 0.5 }, { id: 21, value: Math.random() * 0.5 + 0.5 }, { id: 28, value: Math.random() }, { id: 29, value: Math.random() },
        { id: 30, value: getRandomWaveValue() }, { id: 31, value: getRandomWaveValue() }
    ];

    let lfoState = [];
    if (complexity === 'COMPLEX') {
        lfoState = generateComplexRandomLfoState(false);
    } else {
        lfoState = Array(4).fill({ rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false });
    }

    const randomPreset = {
        key: randomKey,
        scale: randomScaleName,
        // *** THE FIX IS HERE TOO ***
        isLfoMode: complexity === 'COMPLEX',
        fxSettings: fxSettings,
        lfoState: lfoState,
        arpSettings: { 
            arp1: { isArpOn: false, isOn: false },
            arp2: { isArpOn: false, isOn: false }
        }
    };
    
    applyPreset(randomPreset);
}
      
        function stopLfoPatching() {
            if (activePatchingLfo === null) return;
            // Remove blinking from all knobs
            document.querySelectorAll('.blinking-lfo-source, .blinking-lfo-target').forEach(el => {
                el.classList.remove('blinking-lfo-source', 'blinking-lfo-target');
            });
            activePatchingLfo = null;
        }

        function getLfoTargetElement(destId) {
            if (fxKnobData[destId]?.knobEl) return fxKnobData[destId].knobEl;
            const mainId = LFO_DEST_TO_MAIN_KNOB[destId];
            if (mainId !== undefined) {
                return knobState[mainId]?.dom?.knob || null;
            }
            const fallback = document.querySelector(`[data-fx-id="${destId}"]`);
            if (fallback) return fallback;
            return null;
        }

        function startLfoPatching(lfoIndex) {
            // If we're already patching, stop it first
            if (activePatchingLfo !== null) {
                stopLfoPatching();
            }

            activePatchingLfo = lfoIndex;
            const sourceKnobInfo = Object.values(LFO_KNOB_MAP).find(d => d.lfo === lfoIndex && d.param === 'dest');
            if (!sourceKnobInfo) return;

            const sourceFxId = Object.keys(LFO_KNOB_MAP).find(key => LFO_KNOB_MAP[key] === sourceKnobInfo);
            const sourceKnobEl = fxKnobData[sourceFxId].knobEl;
            sourceKnobEl.classList.add('blinking-lfo-source');

            // --- Define invalid targets for THIS LFO ---
            const ownLfoKnobs = Object.keys(LFO_KNOB_MAP)
                .filter(id => LFO_KNOB_MAP[id].lfo === lfoIndex)
                .map(id => parseInt(id, 10));

            // Make potential targets blink
            for (const id in fxKnobData) {
                const numId = parseInt(id, 10);
                // A target is valid if it's NOT one of the current LFO's own knobs
                if (!ownLfoKnobs.includes(numId)) {
                    fxKnobData[id].knobEl.classList.add('blinking-lfo-target');
                }
            }
            knobState.forEach(k => {
                if (k?.dom?.knob) {
                    k.dom.knob.classList.add('blinking-lfo-target');
                }
            });
        }
        function drawLfoCables() {
    const patchBay = document.getElementById('lfo-patch-bay');
    if (!patchBay) return;

    const ensureCableGroup = (index) => {
        let group = document.getElementById(`lfo-cable-group-${index}`);
        if (!group) {
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = `lfo-cable-group-${index}`;
            group.classList.add('lfo-cable-group');
            group.dataset.baseColor = LFO_CABLE_COLORS[index] || LFO_CABLE_COLORS[0];
            patchBay.appendChild(group);
        }
        return group;
    };

    const hasChains = lfoState.some(lfo => getLfoDestChain(lfo).length);
    const shouldHide = !isLfoMode && !hasChains;

    if (shouldHide) {
        patchBay.style.display = 'none';
        for (let i = 0; i < 4; i++) {
            const group = ensureCableGroup(i);
            group.innerHTML = '';
        }
        return;
    }

    patchBay.style.display = 'block';

    const containerRect = synthContainer.getBoundingClientRect();
    patchBay.setAttribute('width', containerRect.width);
    patchBay.setAttribute('height', containerRect.height);
    patchBay.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

    lfoState.forEach((lfo, index) => {
        const group = ensureCableGroup(index);
        group.innerHTML = '';
        group.style.pointerEvents = 'none';

        const baseColor = group.dataset.baseColor || LFO_CABLE_COLORS[index] || LFO_CABLE_COLORS[0];
        const sourceKnobInfo = Object.values(LFO_KNOB_MAP).find(d => d.lfo === index && d.param === 'dest');
        if (!sourceKnobInfo) return;

        const sourceFxId = Object.keys(LFO_KNOB_MAP).find(key => LFO_KNOB_MAP[key] === sourceKnobInfo);
        const sourceKnobEl = fxKnobData[sourceFxId]?.knobEl || document.querySelector(`[data-fx-id="${sourceFxId}"]`);

        const destChain = getLfoDestChain(lfo);
        const chainTargets = destChain.length ? destChain : [LFO_DEST_NONE];

        const getPointFromElement = (el) => {
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2,
            };
        };

        const curveBetweenPoints = (start, end) => {
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const curvature = 0.3;
            const ctrlX = midX + dy * curvature;
            const ctrlY = midY - dx * curvature;
            return `M ${start.x} ${start.y} Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;
        };

        if (sourceKnobEl) {
            const startPoint = getPointFromElement(sourceKnobEl);
            let previousPoint = startPoint;

            chainTargets.forEach((destId, segmentIndex) => {
                const destKnobEl = destId === LFO_DEST_NONE ? null : getLfoTargetElement(destId);
                let nextPoint;

                if (!destKnobEl || destKnobEl.offsetParent === null) {
                    const direction = (previousPoint.x > containerRect.width / 2) ? 1 : -1;
                    nextPoint = {
                        x: previousPoint.x + (250 * direction),
                        y: previousPoint.y + 80,
                    };
                } else {
                    nextPoint = getPointFromElement(destKnobEl);
                }

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.classList.add('lfo-cable');
                path.setAttribute('stroke', getLfoSegmentColor(baseColor, index, segmentIndex));
                path.setAttribute('d', curveBetweenPoints(previousPoint, nextPoint));
                group.appendChild(path);

                previousPoint = nextPoint;
            });
        }
    });
}


       async function init(){
           synthContainer = document.getElementById('synth-container');
           rateDisplayRows = Array.from(document.querySelectorAll('.rate-display-row'));
           powerSwitch = document.getElementById('power-switch');
           keySelector = document.getElementById('keySelector');
           scaleSelector = document.getElementById('scaleSelector');
           
           // --- 1. Audio Resume (Touch & Click) ---
           const resumeAudio = () => {
                if (isPowerOn && audioContext && (audioContext.state === 'suspended' || audioContext.state === 'interrupted')) {
                    audioContext.resume();
                }
           };
           document.addEventListener('touchstart', resumeAudio, { passive: true });
           document.addEventListener('click', resumeAudio);

           // --- 2. Get Elements ---
           modalOverlay = document.getElementById('how-to-modal-overlay');
           howToButton = document.getElementById('how-to-button-header');
           closeModalButton = document.getElementById('close-modal-button');
           shareButton = document.getElementById('share-button');
           customScaleBuilder = document.getElementById('custom-scale-builder');
           recordButton = document.getElementById('record-button');
           recordMidiButton = document.getElementById('record-midi-button');
           loadPresetInput = document.getElementById('load-preset-input');
           presetNameDisplay = document.getElementById('preset-display');
           presetDisplayContainer = document.getElementById('preset-display-container');
           presetPrevButton = document.getElementById('preset-prev-button');
           presetNextButton = document.getElementById('preset-next-button');
          buildPresetNavigationList();
          updatePresetDisplay();

          let presetLoadedFromUrl = false;
           
           // --- 3. TOUCH HELPER FUNCTION ---
           const addTouchListener = (element, callback) => {
               if (!element) return;
               const handler = (e) => {
                   if (e.cancelable && e.type === 'touchend') e.preventDefault();
                   callback(e);
               };
               element.addEventListener('touchend', handler);
               element.addEventListener('click', handler);
           };

          addTouchListener(presetPrevButton, (event) => handlePresetNavigation(-1, event));
          addTouchListener(presetNextButton, (event) => handlePresetNavigation(1, event));
           addTouchListener(presetNameDisplay, (event) => handlePresetToggle(event));
           presetNameDisplay?.addEventListener('keydown', (event) => {
               if (event.key === 'Enter' || event.key === ' ') {
                   event.preventDefault();
                   handlePresetToggle(event);
               }
           });

           // --- 4. FIX: POWER SWITCH ---
           addTouchListener(powerSwitch, () => {
               if (isPowerOn) powerOff();
               else powerOn();
           });

           // --- 5. FIX: HEADER & MODAL BUTTONS ---
          const closeHowToModal = () => {
               modalOverlay?.classList.add('opacity-0', 'pointer-events-none');
          };

          addTouchListener(howToButton, () => {
               const isHidden = modalOverlay.classList.contains('pointer-events-none');
               if (isHidden) {
                    modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
               } else {
                    closeHowToModal();
               }
          });

          addTouchListener(closeModalButton, (event) => {
               event.stopPropagation();
               closeHowToModal();
          });

        modalOverlay.addEventListener('click', (event) => {
               if (event.target === modalOverlay) {
                    closeHowToModal();
               }
          });

          addTouchListener(shareButton, async () => {
               if (!shareButton) return;
               const originalLabel = shareButton.textContent;
               
               const shareUrl = generateShareableUrl();
               const shareData = {
                   title: 'NO-B 250 Patch',
                   url: shareUrl
               };

               // Simple check to prioritize native sharing ONLY on mobile devices
               const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

               // 1. Try Native Share (Mobile Only)
               if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                   try {
                       await navigator.share(shareData);
                   } catch (err) {
                       // Ignore 'AbortError' (user cancelled the share sheet)
                       if (err.name !== 'AbortError') {
                           console.error('Share failed', err);
                       }
                   }
               } 
               // 2. Desktop Fallback (Copy to Clipboard)
               else {
                   try {
                       await navigator.clipboard.writeText(shareUrl);
                       shareButton.textContent = 'URL COPIED';
                   } catch (err) {
                       console.error('Clipboard failed', err);
                       shareButton.textContent = 'COPY FAILED';
                   }
                   
                   // Reset button text after delay
                   setTimeout(() => {
                       if (shareButton) shareButton.textContent = originalLabel;
                   }, 1200);
               }
               shareButton.blur();
           });

           addTouchListener(recordMidiButton, () => {
               toggleMidiRecording();
               recordMidiButton.blur();
           });

           // --- 7. FIX: DROPDOWN MENUS (Scale, Key, Arp Order) ---
           // ROBUST VERSION: Blocks Touch, Mouse, AND Pointer events from bubbling
           arpOrderSelector = document.getElementById('arp-order-selector'); 

           const protectDropdown = (el) => {
               if (!el) return;
               const stopEvent = (e) => e.stopPropagation();
               
               // Stop touch events (passive: true improves scroll performance)
               el.addEventListener('touchstart', stopEvent, { passive: true });
               el.addEventListener('touchend', stopEvent, { passive: true });
               
               // Stop Mouse/Pointer events (robust for hybrid devices/desktop)
               el.addEventListener('pointerdown', stopEvent, { passive: false });
               el.addEventListener('mousedown', stopEvent, { passive: false });
               el.addEventListener('click', stopEvent, { passive: false });
           };

           protectDropdown(keySelector);
           protectDropdown(scaleSelector);
           protectDropdown(arpOrderSelector);
           
           keySelector?.addEventListener('change', () => {
               snapArpNotesToScale(); 
               knobState.forEach(k => updateStateFromTotalAngle(k.id));
               keySelector.blur();
           });
           
           scaleSelector?.addEventListener('change', e => { 
               const isCustom = e.target.value === 'Custom'; 
               customScaleBuilder.style.display = isCustom ? 'flex' : 'none'; 
               keySelector.disabled = isCustom; 
               if (isCustom) keySelector.value = 'C'; 
               snapArpNotesToScale();
               scaleSelector.blur(); 
               knobState.forEach(k => updateStateFromTotalAngle(k.id));
           });

           arpOrderSelector?.addEventListener('change', (e) => {
               currentArpOrder = e.target.value;
               knobState.forEach(s => { s.currentArpNoteIndex = (currentArpOrder === "Down" && s.arpNotes.length > 0) ? s.arpNotes.length - 1 : 0; s.arpUpDownState = 0; });
           });

           // --- 8. FIX: CUSTOM SCALE BUILDER KEYS ---
           document.querySelectorAll('#custom-scale-builder .key').forEach(k => {
               addTouchListener(k, () => {
                   const n = parseInt(k.dataset.note); 
                   k.classList.toggle('selected'); 
                   if (customScale.includes(n)) {
                       customScale = customScale.filter(i => i !== n);
                   } else {
                       customScale.push(n);
                   } 
                   customScale.sort((a,b) => a-b); 
                   knobState.forEach(k => updateStateFromTotalAngle(k.id));
               });
           });

           // --- 9. PRESET MENU LOGIC ---
           const presetsToggleButton = document.getElementById('presets-toggle-button');
           const presetMenuAnchor = presetsToggleButton || presetDisplayContainer;
           const presetsSubmenuContainer = document.getElementById('presets-submenu-container');
           const submenuSaveButton = document.getElementById('submenu-save-button');
           const submenuLoadButton = document.getElementById('submenu-load-button');
           const presetListSelector = document.getElementById('preset-list-selector');
           const presetCategoryButtons = document.querySelectorAll('.preset-category-button');
           let activePresetCategory = null;
           let activePresetButton = null;
           let isPresetDropdownOpen = false;
           let removePresetDismissListener = null;
           let removePresetsSubmenuDismissListener = null;

           const positionPresetsSubmenu = () => {
                if (!presetsSubmenuContainer || !presetMenuAnchor || !synthContainer) return;
                if (presetsSubmenuContainer.style.display !== 'flex') return;

                const anchorRect = presetMenuAnchor.getBoundingClientRect();
                const containerRect = synthContainer.getBoundingClientRect();

                const left = Math.max(0, anchorRect.left - containerRect.left);
                const top = anchorRect.top - containerRect.top;

                presetsSubmenuContainer.style.left = `${left}px`;
                presetsSubmenuContainer.style.top = `${top}px`;
           };

           const clearPresetCategoryHighlight = () => {
                presetCategoryButtons.forEach((button) => {
                    button.classList.remove('active');
                    button.blur();
                });
           };

           const cleanupPresetDismissListener = () => {
                if (typeof removePresetDismissListener === 'function') {
                    removePresetDismissListener();
                    removePresetDismissListener = null;
                }
           };

           const cleanupPresetsSubmenuDismissListener = () => {
                if (typeof removePresetsSubmenuDismissListener === 'function') {
                    removePresetsSubmenuDismissListener();
                    removePresetsSubmenuDismissListener = null;
                }
           };

           const collapsePresetList = () => {
                if (!presetListSelector) return;
                presetListSelector.size = 1;
                presetListSelector.selectedIndex = presetListSelector.options.length ? 0 : -1;
                presetListSelector.style.display = 'none';
                presetListSelector.style.left = '-9999px';
                presetListSelector.style.top = '-9999px';
           };

           const closePresetDropdown = (shouldClearHighlight = true) => {
                collapsePresetList();
                if (shouldClearHighlight) {
                    clearPresetCategoryHighlight();
                    activePresetCategory = null;
                }
                isPresetDropdownOpen = false;
                cleanupPresetDismissListener();
           };

           const attachPresetDismissListener = () => {
                cleanupPresetDismissListener();

                const handler = (event) => {
                    if (!isPresetDropdownOpen) return;
                    if (event.target.closest('#presets-submenu-container') || event.target.closest('#preset-list-selector')) return;
                    closePresetDropdown();
                };

                window.addEventListener('pointerdown', handler, true);
                removePresetDismissListener = () => window.removeEventListener('pointerdown', handler, true);
           };

           const positionPresetList = (anchorEl) => {
                if (!presetListSelector || !anchorEl || !presetsSubmenuContainer) return;
                const anchorRect = anchorEl.getBoundingClientRect();
                const containerRect = presetsSubmenuContainer.getBoundingClientRect();
                const left = anchorRect.left - containerRect.left;
                const top = anchorRect.bottom - containerRect.top;

                presetListSelector.style.left = `${left}px`;
                presetListSelector.style.top = `${top}px`;
                presetListSelector.style.width = `${Math.max(anchorRect.width, 1)}px`;
                presetListSelector.style.height = '1px';
           };

           const showPresetList = () => {
                if (!presetListSelector) return;
                if (activePresetButton) {
                    positionPresetList(activePresetButton);
                }
                presetListSelector.style.display = 'block';
           };

           const openPresetDropdown = () => {
                if (!presetListSelector || !presetListSelector.options.length) return;

                collapsePresetList();
                showPresetList();
                isPresetDropdownOpen = true;
                attachPresetDismissListener();

                const showNativePicker = presetListSelector.showPicker;
                if (typeof showNativePicker === 'function') {
                    try {
                        showNativePicker.call(presetListSelector);
                        return;
                    } catch (_) {
                        // Fall through to a standard click below
                    }
                }

                presetListSelector.focus();
                presetListSelector.click();
           };
           
           const handlePresetToggle = (e) => {
               if(e.cancelable) e.preventDefault();
               const isVisible = presetsSubmenuContainer.style.display === 'flex';
               const willShow = !isVisible;

               presetsSubmenuContainer.style.display = willShow ? 'flex' : 'none';
               presetsToggleButton?.classList.toggle('active', willShow);

               if (willShow) {
                    positionPresetsSubmenu();
                    const handler = (event) => {
                        const isMenuVisible = presetsSubmenuContainer.style.display === 'flex';
                        if (!isMenuVisible) return;
                        if (event.target.closest('#presets-submenu-container') || event.target.closest('#preset-list-selector') || event.target.closest('#presets-toggle-button') || event.target.closest('#preset-display-container')) return;
                        presetsSubmenuContainer.style.display = 'none';
                        presetsToggleButton?.classList.remove('active');
                        closePresetDropdown();
                        cleanupPresetsSubmenuDismissListener();
                    };
                    window.addEventListener('pointerdown', handler, true);
                    removePresetsSubmenuDismissListener = () => window.removeEventListener('pointerdown', handler, true);
               }

               if (!willShow) {
                    closePresetDropdown();
                    cleanupPresetsSubmenuDismissListener();
               }
           };
           presetsToggleButton?.addEventListener('touchend', handlePresetToggle);
           presetsToggleButton?.addEventListener('click', handlePresetToggle);
           window.addEventListener('resize', positionPresetsSubmenu);
           window.addEventListener('orientationchange', positionPresetsSubmenu);

            addTouchListener(submenuSaveButton, () => {
                savePreset();
                closePresetDropdown();
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton?.classList.remove('active');
                cleanupPresetsSubmenuDismissListener();
           });

            addTouchListener(submenuLoadButton, () => {
                loadPresetInput.click();
                closePresetDropdown();
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton?.classList.remove('active');
                cleanupPresetsSubmenuDismissListener();
           });

           const midiConnectButton = document.getElementById('midi-connect-button');
           midiConnectButton?.addEventListener('click', () => {
               setupMidiOutput();
               midiConnectButton.textContent = 'RESCAN';
           });

           const midiClockToggle = document.getElementById('midi-clock-toggle');
           midiClockToggle?.addEventListener('change', () => {
               midiClockEnabled = midiClockToggle.checked;
               updateMidiClockState();
           });

           // --- 10. ARP & SYNTH CONTROLS ---
           arpSyncSwitch = document.getElementById('arp-sync-switch');
           masterArpControls = document.getElementById('master-arp-controls');
           arpLockSwitch = document.getElementById('arp-lock-switch');
           allArpControlGrids = document.querySelectorAll('.arp-controls');
           lfoLockSwitch = document.getElementById('lfo-lock-switch');
            const lfoModeSwitch = document.getElementById('lfo-mode-switch');

            lfoModeSwitch?.addEventListener('click', () => toggleLfoModeUI());
           if (lfoLockSwitch) {
               addTouchListener(lfoLockSwitch, () => {
                   isLfoLockEnabled = !isLfoLockEnabled;
                   lfoLockSwitch.classList.toggle('on', isLfoLockEnabled);
               });
               lfoLockSwitch.classList.toggle('on', isLfoLockEnabled);
           }
            new ResizeObserver(drawLfoCables).observe(synthContainer);
      
           populateScales();
           setupFxKnobs();

           lfoRateDisplays = Array.from({ length: 4 }, (_, idx) => document.getElementById(`lfo-rate-display-${idx}`));
           lfoTempoSyncSwitches = Array(LFO_RATE_KNOB_IDS.length).fill(null);

           document.querySelectorAll('.lfo-tempo-sync-switch').forEach(sw => {
               const idx = parseInt(sw.dataset.lfoTempoIndex, 10);
               if (Number.isNaN(idx)) return;
               lfoTempoSyncSwitches[idx] = sw;
               addTouchListener(sw, () => {
                    if (sw.classList.contains('switch-disabled')) return;
                    setLfoTempoSync(idx, !lfoTempoLinkState[idx].enabled);
               });
           });

           LFO_RATE_KNOB_IDS.forEach((id, idx) => {
               const knobData = fxKnobData[id];
               if (knobData) {
                   lfoTempoLinkState[idx].storedFreeValue = knobData.value;
                   updateLfoRateDisplay(idx, knobData.value, false);
               }
           });
           updateLfoTempoSwitchStates();

          presetLoadedFromUrl = await loadPresetFromUrl();
            
            document.querySelectorAll('.fx-knob-container').forEach(knobEl => {
                const id = knobEl.dataset.fxId;
                const labelEl = knobEl.nextElementSibling;
                if (id && labelEl) {
                    KNOB_ID_TO_NAME_MAP[id] = labelEl.textContent.trim().replace(/\s/g, ' ');
                }
            });
            KNOB_ID_TO_NAME_MAP[MAIN_LFO_DEST_IDS[0]] = 'MAIN 1';
            KNOB_ID_TO_NAME_MAP[MAIN_LFO_DEST_IDS[1]] = 'MAIN 2';
            KNOB_ID_TO_NAME_MAP[16] = 'TEMPO 1';
            KNOB_ID_TO_NAME_MAP[17] = 'TEMPO 2';
            KNOB_ID_TO_NAME_MAP[22] = 'FEEL';
            KNOB_ID_TO_NAME_MAP[23] = 'FEEL';

            // --- GLOBAL PATCHING HANDLER ---
            let isScrollingGlobal = false;
            synthContainer.addEventListener('touchmove', () => { isScrollingGlobal = true; }, { passive: true });
            synthContainer.addEventListener('touchstart', () => { isScrollingGlobal = false; }, { passive: true });

            const handleGlobalPatchClick = (e) => {
                if (!isLfoMode) return;
                if (e.type === 'touchend' && isScrollingGlobal) return;

                // Allow the LFO mode switch to remain tappable on mobile by skipping patch handling entirely
                if (e.target.closest('#lfo-switch-container')) return;

                 // Skip patch handling for preset/system controls so their default interactions work
                 if (e.target.closest('#presets-submenu-container, #preset-list-selector, #preset-category-buttons')) return;

                const targetKnobEl = e.target.closest('.fx-knob-container, .main-knob');

                if (!targetKnobEl) {
                    if (activePatchingLfo !== null) stopLfoPatching();
                    return;
                }

                if (e.type === 'touchend' && e.cancelable) e.preventDefault();

                const targetFxId = targetKnobEl.classList.contains('main-knob') ? MAIN_LFO_DEST_IDS[parseInt(targetKnobEl.dataset.knobId, 10)] : parseInt(targetKnobEl.dataset.fxId, 10);
                if (targetFxId === undefined || Number.isNaN(targetFxId)) {
                    if (activePatchingLfo !== null) stopLfoPatching();
                    return;
                }
                const targetKnobData = fxKnobData[targetFxId];
                const wasDragging = targetKnobData?.isDragging || targetKnobData?.touchMoved;
                const clickCount = e.detail || 1;

                if (activePatchingLfo === null) {
                    const owningLfoIndex = wasDragging ? -1 : lfoState.findIndex(lfo => lfoTargetsInclude(lfo, targetFxId));
                    if (owningLfoIndex !== -1) {
                        const chain = getLfoDestChain(lfoState[owningLfoIndex]);
                        const clickedIdx = chain.indexOf(targetFxId);

                        if (clickCount >= 2 && chain.length) {
                            if (clickedIdx === 0) {
                                setLfoDestChain(owningLfoIndex, []);
                            } else if (clickedIdx > 0) {
                                setLfoDestChain(owningLfoIndex, [chain[0]]);
                            }
                            drawLfoCables();
                            stopLfoPatching();
                        } else {
                            startLfoPatching(owningLfoIndex);
                        }
                    }
                    return;
                }

                const sourceKnobInfo = Object.values(LFO_KNOB_MAP).find(d => d.lfo === activePatchingLfo && d.param === 'dest');
                const sourceFxId = parseInt(Object.keys(LFO_KNOB_MAP).find(key => LFO_KNOB_MAP[key] === sourceKnobInfo));
                const ownLfoKnobs = Object.keys(LFO_KNOB_MAP).filter(id => LFO_KNOB_MAP[id].lfo === activePatchingLfo).map(id => parseInt(id));
                const currentChain = getLfoDestChain(lfoState[activePatchingLfo]);
                let nextChain = [...currentChain];

                if (targetFxId === sourceFxId) {
                    setLfoDestChain(activePatchingLfo, []);
                    stopLfoPatching();
                    drawLfoCables();
                    return;
                }

                if (ownLfoKnobs.includes(targetFxId)) return;

                if (nextChain.includes(targetFxId)) {
                    nextChain = nextChain.filter(dest => dest !== targetFxId);
                } else {
                    nextChain.push(targetFxId);
                }

                setLfoDestChain(activePatchingLfo, nextChain);
                stopLfoPatching();
                drawLfoCables();
            };
            
            synthContainer.addEventListener('touchend', handleGlobalPatchClick);
            synthContainer.addEventListener('click', handleGlobalPatchClick);

            const mainHeader = document.querySelector('.main-header h1');
            let headerTapCount = 0;
            let headerTapTimer = null;
            mainHeader?.addEventListener('click', () => {
                headerTapCount++;
                clearTimeout(headerTapTimer);
                if (headerTapCount >= 1) { 
                    toggleEasterEggMode();
                    mainHeader.style.transition = 'color 0.1s';
                    mainHeader.style.color = 'var(--color-accent-yellow)';
                    setTimeout(() => { mainHeader.style.color = ''; }, 200);
                    headerTapCount = 0;
                } else {
                    headerTapTimer = setTimeout(() => {
                        headerTapCount = 0;
                    }, 750);
                }
            });
      
           const setupSpinButton = (button, knobId, direction) => {
               if (!button) return;
               const key = `spin-${direction}-${knobId}`;
               const speed = KNOB_KEY_SPEED * 1.1;
               const delta = direction === 'left' ? -speed : speed;
               const start = (e) => {
                   e.preventDefault();
                   if (spinIntervals[key]) return;
                   spinIntervals[key] = setInterval(() => {
                       knobState[knobId].totalAngle += delta;
                       updateStateFromTotalAngle(knobId);
                   }, 10);
               };
               const stop = (e) => {
                   e.preventDefault();
                   if (spinIntervals[key]) {
                       clearInterval(spinIntervals[key]);
                       delete spinIntervals[key];
                   }
               };
               button.addEventListener('mousedown', start);
               button.addEventListener('touchstart', start, { passive: false });
               button.addEventListener('mouseup', stop);
               button.addEventListener('mouseleave', stop);
               button.addEventListener('touchend', stop);
               button.addEventListener('touchcancel', stop);
           };
      
           knobState.forEach((s, id) => {
               s.dom.knob=document.getElementById(`knob-${id+1}`); s.dom.indicator=document.getElementById(`knob-indicator-${id+1}`);
               s.dom.noteDisplay=document.getElementById(`note-display-${id+1}`);
               s.dom.arpSwitch = document.getElementById(`arp-switch-${id}`); s.dom.arpControlsContainer = s.dom.arpSwitch?.parentElement?.nextElementSibling;
               s.dom.arpModeSwitch = document.getElementById(`arp-mode-switch-${id}`); s.dom.octsDisplay = document.getElementById(`octs-display-${id}`);
               s.dom.feelDisplay = document.getElementById(`feel-display-${id}`); s.dom.arpNoteDisplay = document.getElementById(`arp-note-display-${id}`);
               s.dom.feelPatternPreview = document.getElementById(`feel-pattern-preview-${id}`);
               s.dom.transposeDisplay = document.getElementById(`transpose-display-${id}`);
               s.dom.rateDisplay = document.getElementById(`rate-display-${id}`);
      
               s.dom.knob?.addEventListener('mousedown', handleInteractionStart); s.dom.knob?.addEventListener('touchstart', handleInteractionStart, {passive: false});
      
               const spinLeftButton = document.getElementById(`spin-left-${id}`);
               const spinRightButton = document.getElementById(`spin-right-${id}`);
               setupSpinButton(spinLeftButton, id, 'left');
               setupSpinButton(spinRightButton, id, 'right');
      
               const holdSwitch = document.getElementById(`arp-hold-switch-${id}`);
               addTouchListener(holdSwitch, () => {
                  if (!s.isArpOn) return;
                  s.isArpHoldOn = !s.isArpHoldOn;
                  holdSwitch.classList.toggle('on', s.isArpHoldOn);
                  if (!s.isArpHoldOn && !s.isHeld) {
                     if (s.arpRunning) stopArpeggiator(id);
                     s.arpNotes = [];
                     updateSequenceDisplay(id);
                  }
               });
      
               addTouchListener(s.dom.arpSwitch, () => {
                   const wasOn = s.isArpOn;
                   s.isArpOn = !s.isArpOn; s.dom.arpSwitch.classList.toggle('on', s.isArpOn);

                   if (s.isArpOn && !wasOn && !isArpRateSynced) {
                       const otherId = s.id === 0 ? 1 : 0;
                       const otherState = knobState[otherId];
                       if (otherState?.isArpOn) {
                           isArpRateSynced = true;
                           arpSyncSwitch?.classList.add('on');
                           if (tempoMode === TEMPO_MODE_BPM) {
                               setArpRateFromBpm(s.id, otherState.arpRateBpm);
                           } else {
                               setArpRateFromMs(s.id, otherState.arpRateMs);
                           }
                           updateRateButtonLockState();
                           updateLfoTempoSwitchStates();
                       }
                   }

                   updateGlobalArpVisibility();
                   updateFeelPatternPreview(s.id);
                   if (!s.isArpOn) { stopArpeggiator(s.id); if(s.isHeld) { s.isNoteOn = true; const freq = calculateNote(s.id, false); if(synthNode) synthNode.port.postMessage({type:'noteOn',data:{voice:s.id,freq:freq}}); } s.arpNotes = []; updateSequenceDisplay(s.id);if(s.dom.arpNoteDisplay)s.dom.arpNoteDisplay.textContent="--"; }
                   else { if(s.isHeld) { if (s.isNoteOn) { if(synthNode) synthNode.port.postMessage({type:'noteOff', data:{voice:s.id}}); s.isNoteOn = false; } playNote(s.id); } }
                   updateStateFromTotalAngle(s.id);
               });

               addTouchListener(s.dom.arpModeSwitch, () => { 
                   if (!s.isArpOn) return; 
                   s.isSweepMode = !s.isSweepMode; 
                   s.dom.arpModeSwitch.classList.toggle('on', s.isSweepMode); 
                   if (!s.isSweepMode && s.arpRunning) { 
                       s.arpNotes = [{ midi: getMidiNote(s.id), active: true }]; 
                       s.currentArpNoteIndex = (currentArpOrder === "Down" && s.arpNotes.length > 0) ? s.arpNotes.length - 1 : 0; 
                       s.arpUpDownState = 0; 
                   } 
               });
           });

           knobState.forEach(k => updateFeelPatternPreview(k.id));

           document.addEventListener('mousemove',updateKnobPosition); document.addEventListener('mouseup',handleInteractionEnd);
           document.addEventListener('touchmove',updateKnobPosition,{passive:false}); document.addEventListener('touchend',handleInteractionEnd);
           document.addEventListener('touchcancel', handleInteractionEnd); document.addEventListener('keydown',handleKeyDown); document.addEventListener('keyup',handleKeyUp);
           
           // --- LFO DESTINATION KNOB HANDLERS ---
           document.querySelectorAll('[data-fx-id="114"], [data-fx-id="115"], [data-fx-id="102"], [data-fx-id="107"]').forEach(destKnob => {
                let lastTap = 0;

                const handleDestInteraction = (e) => {
                    if (e.type === 'touchend') {
                         if (e.cancelable) e.preventDefault(); 
                         e.stopPropagation();
                    } else {
                        e.stopPropagation();
                    }

                    if (!isLfoMode) return;

                    const fxId = parseInt(destKnob.dataset.fxId, 10);
                    const lfoInfo = LFO_KNOB_MAP[fxId];
                    if (!lfoInfo || lfoInfo.param !== 'dest') return;

                    const now = Date.now();
                    const isDoubleTap = (now - lastTap < 300) && (now - lastTap > 0);
                    lastTap = now;

                    if (isDoubleTap) {
                         const lfo = lfoState[lfoInfo.lfo];
                         if (getLfoDestChain(lfo).length) {
                             setLfoDestChain(lfoInfo.lfo, []);
                             drawLfoCables();
                             if (!shouldKeepLfoAnimationRunning() && lfoAnimationId !== null) {
                                 clearInterval(lfoAnimationId);
                                 lfoAnimationId = null;
                             }
                         }
                    } else {
                        if (activePatchingLfo === lfoInfo.lfo) {
                            stopLfoPatching();
                        } else {
                            startLfoPatching(lfoInfo.lfo);
                        }
                    }
                };

                destKnob.addEventListener('click', handleDestInteraction);
                destKnob.addEventListener('touchend', handleDestInteraction);
            });

           const populatePresetList = (category) => {
                if (!presetListSelector) return;
                presetListSelector.innerHTML = '';

                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.dataset.group = category;
                placeholder.textContent = `${category} PRESETS`;
                placeholder.disabled = true;
                placeholder.selected = true;
                presetListSelector.appendChild(placeholder);

                const presetsForCategory = PRESETS[category] || {};
                Object.keys(presetsForCategory).forEach((presetName) => {
                    const option = document.createElement('option');
                    option.value = presetName;
                    option.dataset.group = category;
                    option.textContent = presetName;
                    presetListSelector.appendChild(option);
                });

                presetListSelector.disabled = !Object.keys(presetsForCategory).length;
           };

           const setActivePresetCategory = (category) => {
                if (!category) return;
                clearPresetCategoryHighlight();
                activePresetCategory = category;
                activePresetButton = null;
                presetCategoryButtons.forEach((button) => {
                    const isActive = button.dataset.category === category;
                    button.classList.toggle('active', isActive);
                    if (isActive) {
                        activePresetButton = button;
                    }
                });
                populatePresetList(category);
                if (presetsSubmenuContainer.style.display === 'flex') {
                    openPresetDropdown();
                }
           };

           protectDropdown(presetListSelector);

           const handlePresetBlur = () => {
                if (!isPresetDropdownOpen) return;
                closePresetDropdown();
           };

           presetListSelector?.addEventListener('blur', handlePresetBlur);
           presetListSelector?.addEventListener('focusout', handlePresetBlur);

           presetCategoryButtons.forEach((button) => {
                const category = button.dataset.category;
                addTouchListener(button, () => {
                    setActivePresetCategory(category);
                });
           });

           collapsePresetList();

           presetListSelector?.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const presetName = selectedOption?.value;

                if (!presetName) return;

             if (presetName === "RANDOM ARP") {
               generateAndApplyRandomPreset('SIMPLE');
           } 
           else if (presetName === "COMPLEX RANDOM ARP") {
               generateAndApplyRandomPreset('COMPLEX');
           }
           else if (presetName === "RANDOM SOUND") {
               generateAndApplyRandomSound('SIMPLE');
           } 
           else if (presetName === "COMPLEX RANDOM SOUND") {
               generateAndApplyRandomSound('COMPLEX');
           }
           else {
               // Existing factory preset logic
               const groupName = selectedOption.dataset.group || activePresetCategory;
               if (!applyFactoryPreset(groupName, presetName)) return;
               updatePresetDisplay(presetName, 'factory', groupName);
           }

                closePresetDropdown();
                presetListSelector.blur();
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton?.classList.remove('active');
            });

           presetListSelector?.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                closePresetDropdown();
           });

           loadPresetInput?.addEventListener('change', loadPreset);
           
           addTouchListener(arpSyncSwitch, () => {
               isArpRateSynced = !isArpRateSynced;
               arpSyncSwitch.classList.toggle('on', isArpRateSynced);
                if(isArpRateSynced && knobState[0]?.isArpOn && knobState[1]?.isArpOn) {
                    if (tempoMode === TEMPO_MODE_BPM) {
                        setArpRateFromBpm(1, knobState[0].arpRateBpm);
                    } else {
                        setArpRateFromMs(1, knobState[0].arpRateMs);
                    }
               } else if (!isArpRateSynced && knobState[1]) {
                   const k2d = fxKnobData[17];
                   if(k2d) {
                       if (tempoMode === TEMPO_MODE_BPM) {
                           setArpRateFromBpm(1, valueToArpRateBpm(k2d.value));
                       } else {
                           setArpRateFromMs(1, valueToArpRateMs(k2d.value));
                       }
                   }
               }
               updateRateButtonLockState();
               updateLfoTempoSwitchStates();
           });

           addTouchListener(arpLockSwitch, () => {
               isArpLockEnabled = !isArpLockEnabled;
               arpLockSwitch.classList.toggle('on', isArpLockEnabled);
           });

           // --- FIX: RATE BUTTONS (1/2, 2x) ---
           document.querySelectorAll('.arp-rate-button').forEach(button => {
               const knobId = parseInt(button.dataset.rateTarget, 10);
               const multiplier = parseFloat(button.dataset.rateMultiplier);
               if (Number.isNaN(knobId) || Number.isNaN(multiplier)) return;
               addTouchListener(button, () => handleArpRateButton(knobId, multiplier));
           });

          updateGlobalArpVisibility();
         const initialPresetCategory = 'KEYS';
         const initialPresetName = 'DREAMY MALLET';
          if (!presetLoadedFromUrl) {
              if (applyFactoryPreset(initialPresetCategory, initialPresetName, { skipPowerOn: true })) {
                  updatePresetDisplay(initialPresetName, 'factory', initialPresetCategory);
              } else {
                  updatePresetDisplay();
                  knobState.forEach(k => updateStateFromTotalAngle(k.id));
              }
          }
          updateRateButtonLockState();
      }
       init();












































