       // --- App State ---
       let audioContext; let synthNode; let isPowerOn = false;
      let allowDuplicateNotesMode = false;
      let isLfoMode = false;
      let activeMainKnobId = null; // For MOUSE input only
      let lastTouchTime = 0; // Mobile double-trigger fix
       const fxKnobData = {}; 
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
        let KNOB_ID_TO_NAME_MAP = {}; 
            KNOB_ID_TO_NAME_MAP[30] = 'KNOB 1';
            KNOB_ID_TO_NAME_MAP[31] = 'KNOB 2';
        const lfoState = [
    { id: 0, rate: 0.5, depth: 0, wave: 0, dest: 0, phase: 0, lastRandom: 0, output: 0 },
    { id: 1, rate: 0.5, depth: 0, wave: 0, dest: 0, phase: 0, lastRandom: 0, output: 0 },
    { id: 2, rate: 0.5, depth: 0, wave: 0, dest: 0, phase: 0, lastRandom: 0, output: 0 },
    { id: 3, rate: 0.5, depth: 0, wave: 0, dest: 0, phase: 0, lastRandom: 0, output: 0 },
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
      
       // --- Constants ---
       const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
       const SCALES={'Major':[0,2,4,5,7,9,11],'Minor':[0,2,3,5,7,8,10],'Dorian':[0,2,3,5,7,9,10],'Phrygian':[0,1,3,5,7,8,10],'Lydian':[0,2,4,6,7,9,11],'Mixolydian':[0,2,4,5,7,9,10],'Locrian':[0,1,3,5,6,8,10],'Harmonic Minor':[0,2,3,5,7,8,11],'Melodic Minor':[0,2,3,5,7,9,11],'Major Pentatonic':[0,2,4,7,9],'Minor Pentatonic':[0,3,5,7,10],'Blues':[0,3,5,6,7,10],'Whole Tone':[0,2,4,6,8,10],'Chromatic':[0,1,2,3,4,5,6,7,8,9,10,11]};
       const KNOB_KEY_SPEED = 6; const MAX_TOTAL_ANGLE = 360*8;
       const MIN_FX_ANGLE = -135, MAX_FX_ANGLE = 135;
       const COLOR_BLUE = [30, 58, 138], COLOR_YELLOW = [250, 204, 21], COLOR_GREEN = [132, 204, 22], COLOR_RED = [220, 38, 38];
       const ARP_NOTE_BASE_HSL = [{h:6,s:.76,l:0.32},{h:24,s:.72,l:0.42},{h:15,s:.576,l:0.536},{h:33,s:.59,l:0.49},{h:360,s:.364,l:0.6},{h:54,s:0.58,l:0.284},{h:156,s:.38,l:0.6},{h:202,s:.852,l:0.29},{h:223,s:.852,l:0.479},{h:280,s:.203,l:0.48},{h:208,s:0.2,l:0.3},{h:275.4,s:0.1,l:0.25}];
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
      
       // --- State for the two main knobs & Arps ---
     const knobState = [
    { id: 0, isNoteOn: false, isHeld: false, totalAngle: Math.random()*MAX_TOTAL_ANGLE, lastDragAngle: 0, currentOctave: 3, dom: {}, touchId: null, baseColor: [0,0,0],
      isArpOn: false, isSweepMode: true, arpNotes: [], isArpHoldOn: false, arpRateMs: 51, arpOctaveRange: 0, feelKnobValue: 0.0, currentFeelPattern: EUCLIDEAN_PATTERNS[0], euclideanStepCounter: 0,
      arpTranspose: 0, arpRunning: false, lastArpStepTime: 0, currentArpNoteIndex: 0, currentOctaveStep: 0, arpDirection: 1, arpUpDownState: 0, arpRafId: null, lastPlayedMidi: null, arpLastVisualIndex: -1, lastNoteOnTime: 0 },
    { id: 1, isNoteOn: false, isHeld: false, totalAngle: Math.random()*MAX_TOTAL_ANGLE, lastDragAngle: 0, currentOctave: 3, dom: {}, touchId: null, baseColor: [0,0,0],
      isArpOn: false, isSweepMode: true, arpNotes: [], isArpHoldOn: false, arpRateMs: 51, arpOctaveRange: 0, feelKnobValue: 0.0, currentFeelPattern: EUCLIDEAN_PATTERNS[0], euclideanStepCounter: 0,
      arpTranspose: 0, arpRunning: false, lastArpStepTime: 0, currentArpNoteIndex: 0, currentOctaveStep: 0, arpDirection: 1, arpUpDownState: 0, arpRafId: null, lastPlayedMidi: null, arpLastVisualIndex: -1, lastNoteOnTime: 0 }
];
      
       // --- Global Arp State ---
       let isArpRateSynced = false;
       let currentArpOrder = "As Played";
      
       // --- DOM Elements ---
       let synthContainer, powerSwitch, keySelector, scaleSelector, customScaleBuilder, savePresetButton, loadPresetInput, arpSyncSwitch;
       let masterArpControls, arpOrderSelector;
       let allArpControlGrids;
       let modalOverlay, howToButton, closeModalButton;
       
      import { PRESETS } from './presets.js';

       

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
           return `${a}-${b}-${xxx}-n-ob.${extension}`;
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

    let targetRateMs = null;

    if ((arp1.isArpOn && isArpRateSynced) || (arp1.isArpOn && !arp2.isArpOn)) {
        targetRateMs = arp1.arpRateMs;
    } else if (arp2.isArpOn && !arp1.isArpOn) {
        targetRateMs = arp2.arpRateMs;
    }

    if (targetRateMs !== null) {
        const msPerQuarterNote = targetRateMs * 4;
        if (msPerQuarterNote > 0) {
            const calculatedBpm = 60000 / msPerQuarterNote;
            
            // Corrected mapping based on actual Ableton analysis:
            // Default (knob at 0.6463): internal calc ~110, actual 100 BPM
            // Max (knob at 1.0): internal calc ~545, actual 300 BPM
            const calc1 = 110; 
            const actual1 = 100;
            const calc2 = 545;  // At max speed: 50ms per step = 200ms per quarter = 300 BPM
            const actual2 = 300;

            const slope = (actual2 - actual1) / (calc2 - calc1);
            const intercept = actual1 - (slope * calc1);
            
            const correctedBpm = (slope * calculatedBpm) + intercept;
            
            return Math.max(20, Math.min(300, Math.round(correctedBpm)));
        }
    }

    return 120;
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
    liveLfoOutputs = payload; // Store the live values
    if (isLfoMode && typeof updateLfoVisuals === 'function') {
        updateLfoVisuals(payload);
    }
    break;
                   case 'audio': { const pcm = float32ToPCM16(payload); pcmChunks.push(pcm); totalPcmBytes += pcm.byteLength; break; }
                   case 'recordingStopped': {
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
               if (synthNode && d.id <= 29 && d.id !== 1) { synthNode.port.postMessage({type:'setFx', data:{id:d.id, value:d.value}}); }
               if (synthNode && d.id === 7) { synthNode.port.postMessage({type:'setFx', data:{id:d.id, value:d.value}}); }
           });
       }
      
       function powerOn(){ if(isPowerOn) return; isPowerOn=true; powerSwitch.classList.add('on'); synthContainer.classList.remove('is-off'); setupAudio().then(()=>{ if(audioContext.state==='suspended') audioContext.resume(); }); }
       function powerOff(){
           if(!isPowerOn)return;
           if (isRecordingAudio && synthNode) { synthNode.port.postMessage({ type: 'stopRecording', data: {} }); }
           if (isRecordingMidi) { stopMidiRecording(); }
           isPowerOn=false; 
           knobState.forEach(k=>{ stopNote(k.id, true); if (k.isArpOn) { k.isArpOn = false; k.dom.arpSwitch.classList.remove('on'); } k.isSweepMode = true; if (k.dom.arpModeSwitch) { k.dom.arpModeSwitch.classList.add('on'); } });
           isArpRateSynced = false; if(arpSyncSwitch) arpSyncSwitch.classList.remove('on');
           if (isLfoMode) { toggleLfoModeUI(false); }
           updateGlobalArpVisibility(); powerSwitch.classList.remove('on'); synthContainer.classList.add('is-off');
           if(audioContext){audioContext.close().then(()=>{audioContext=null;synthNode=null;});}
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
           let midiNote;
           if (state.isNoteOn && state.arpRunning) {
               midiNote = state.lastPlayedMidi;
           } else {
               midiNote = getMidiNote(knobId);
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
           const knobRadius = state.dom.knob.offsetHeight / 2;
           state.dom.indicator.style.transformOrigin = `center ${knobRadius > 0 ? knobRadius - 16 : 0}px`;
           state.dom.indicator.style.transform = `rotate(${displayAngle}deg)`;
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
           if(state.isArpOn && state.isHeld) {
               if (state.isSweepMode) {
                  if (allowDuplicateNotesMode || !state.arpNotes.some(n => n.midi === baseMidi)) {
                   state.arpNotes.push({ midi: baseMidi, active: true });
                  updateSequenceDisplay(knobId);
                  }
               } else { if (state.arpRunning) { state.arpNotes = [{ midi: baseMidi, active: true }]; } }
           } else if (state.isHeld && synthNode && isPowerOn) {
               // Audio update
               synthNode.port.postMessage({ type: 'setFreq', data: { voice: knobId, freq: getNoteFrequency(baseMidi) } });
               
               // --- FIX START: Handle MIDI update while spinning in Freestyle mode ---
               if (!state.isArpOn && state.lastPlayedMidi !== baseMidi) {
                   // 1. Kill the old note
                   if (state.lastPlayedMidi !== null) {
                       sendMidiMessage([0x80 + knobId, state.lastPlayedMidi, 0]);
                       captureMidiEvent(knobId, 'noteOff', state.lastPlayedMidi, 0);
                   }
                   
                   // 2. Start the new note
                   sendMidiMessage([0x90 + knobId, baseMidi, 100]);
                   captureMidiEvent(knobId, 'noteOn', baseMidi, 100);
                   
                   // 3. Update state so we know what to kill next time
                   state.lastPlayedMidi = baseMidi;
               }
               // --- FIX END ---

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
           
           if (d.indicator) d.indicator.style.transform = `rotate(${d.angle}deg)`;

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
                } else { // rate or depth
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
                   state.currentFeelPattern = EUCLIDEAN_PATTERNS[pIndex]; 
                   state.euclideanStepCounter = 0;
                   if (state.dom.feelDisplay) state.dom.feelDisplay.textContent = pIndex + 1;
               } else if (id === 24 || id === 25) {
                  const trans = Math.floor((d.value * 24) - 12);
                  state.arpTranspose = trans;
                  if(state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = trans;
                  updateStateFromTotalAngle(knobId);
                  updateSequenceDisplay(knobId);
               } else if (id === 16 || id === 17) {
                   state.arpRateMs = 50 + Math.pow(1 - d.value, 3) * 1950;
                   if(state.dom.rateDisplay) state.dom.rateDisplay.textContent = state.arpRateMs.toFixed(1);
                   const otherId = knobId === 0 ? 1 : 0; const otherFxId = knobId === 0 ? 17 : 16;
                   if (isArpRateSynced && knobState[otherId]?.isArpOn) {
                       knobState[otherId].arpRateMs = state.arpRateMs;
                       if (knobState[otherId].dom.rateDisplay) knobState[otherId].dom.rateDisplay.textContent = state.arpRateMs.toFixed(1);
                       const otherData = fxKnobData[otherFxId];
                       if (otherData) {
                           otherData.value = d.value; otherData.angle = d.angle;
                           if (otherData.indicator) otherData.indicator.style.transform = `rotate(${d.angle}deg)`;
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
               for (const t of e.changedTouches) { if (d.touchId === null) { d.touchId = t.identifier; d.startY = t.clientY; break; } }
           };
           const handleFxTouchMove = (e) => {
               for(const t of e.changedTouches){
                   const kEntry=Object.entries(fxKnobData).find(([id, data])=>data.touchId===t.identifier);
                   if(kEntry){ e.preventDefault(); const [id, d] = kEntry; const cY=t.clientY; let sensitivity = 1.5;
                   if (id === '16' || id === '17') { sensitivity = 0.6; }
                   const dY = (d.startY - cY) * sensitivity; d.startY = cY; updateFxKnob(parseInt(id, 10), dY); }
               }
           };
           const handleFxTouchEnd = (e) => { for(const t of e.changedTouches){ const kE = Object.entries(fxKnobData).find(([id, data])=>data.touchId===t.identifier); if(kE){ kE[1].touchId = null; } } };
           document.querySelectorAll('.fx-knob-container').forEach(k => {
               const id = parseInt(k.dataset.fxId, 10);
               fxKnobData[id] = { id:id, knobEl:k, indicator:k.querySelector('.indicator'), angle:MIN_FX_ANGLE, value:0.0, isDragging:false, startY:0, touchId:null };
               if(id===2){fxKnobData[id].value=1.0;} else if(id===7){fxKnobData[id].value=0.5;} else if(id===8){fxKnobData[id].value=0.0045;}
               else if(id===9){fxKnobData[id].value=0.0995;} else if(id===10){fxKnobData[id].value=0.8;} else if(id===11){fxKnobData[id].value=0.2;}
               else if(id===13){fxKnobData[id].value=0.5;} else if(id===15){fxKnobData[id].value=0.25;} else if(id===16||id===17){fxKnobData[id].value=0.6463;}
               else if(id===18||id===19){fxKnobData[id].value=0.0;} else if(id===20||id===21){fxKnobData[id].value=1.0;}
               else if(id===22||id===23){fxKnobData[id].value=0.0;} else if(id===24||id===25){fxKnobData[id].value=0.5;} else if(id===26||id===27){fxKnobData[id].value=0.5;} else if(id===28||id===29){fxKnobData[id].value=0.0;}
               fxKnobData[id].angle = MIN_FX_ANGLE + (fxKnobData[id].value * (MAX_FX_ANGLE - MIN_FX_ANGLE));
               if (fxKnobData[id].indicator) { fxKnobData[id].indicator.style.transform = `rotate(${fxKnobData[id].angle}deg)`; }
               if(id === 7) { updateFxKnob(id, 0); }
               const kId = (id >= 16 && id <= 25 && id % 2 === 0) ? 0 : (id >= 16 && id <= 25 && id % 2 !== 0) ? 1 : -1;
               if (kId !== -1 && knobState[kId]) {
                   if (id===16||id===17){ knobState[kId].arpRateMs = 50 + Math.pow(1 - fxKnobData[id].value, 3) * 1950; }
                   else if (id===18||id===19){ knobState[kId].arpOctaveRange = Math.min(3, Math.floor(fxKnobData[id].value * 4)); }
                   else if (id===22||id===23){ const pIdx = Math.min(NUM_FEEL_PATTERNS-1, Math.floor(fxKnobData[id].value*NUM_FEEL_PATTERNS)); knobState[kId].feelKnobValue=fxKnobData[id].value; knobState[kId].currentFeelPattern=EUCLIDEAN_PATTERNS[pIdx]; }
                   else if (id===24||id===25){ knobState[kId].arpTranspose=Math.floor((fxKnobData[id].value - 0.5) * 25); }
               }
               k.addEventListener('mousedown', (e)=>handleFxMouseDown(e, id));
               k.addEventListener('touchstart', handleFxTouchStart, {passive:false});
           });
           document.addEventListener('mousemove', handleFxMouseMove); document.addEventListener('mouseup', handleFxMouseUp);
           document.addEventListener('touchmove', handleFxTouchMove, {passive:false}); document.addEventListener('touchend', handleFxTouchEnd); document.addEventListener('touchcancel', handleFxTouchEnd);
       }
      
     function handleInteractionStart(e) {
            if (isLfoMode && activePatchingLfo !== null) {
               const knobElement = e.currentTarget;
               const knobId = parseInt(knobElement.dataset.knobId, 10);
               const targetFxId = knobId === 0 ? 30 : 31; // Convert knob index to our new ID

               // Set the LFO destination
               lfoState[activePatchingLfo].dest = targetFxId;
               const targetName = KNOB_ID_TO_NAME_MAP[targetFxId] || "UNKNOWN";
               document.getElementById(`lfo-dest-display-${activePatchingLfo}`).textContent = targetName;
               if (synthNode) {
                   synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: activePatchingLfo, param: 'dest', value: targetFxId } });
               }

               // Stop patching mode and draw the cable
               stopLfoPatching();
               drawLfoCables();
               return; 
           }
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
           state.arpRunning = true; state.lastArpStepTime = performance.now();
           const activeNotes = state.arpNotes.filter(n => n.active);
           if (!state.isSweepMode || activeNotes.length <= 1) { state.currentArpNoteIndex = (currentArpOrder === "Down" && activeNotes.length > 0) ? activeNotes.length - 1 : 0; state.arpUpDownState = 0; }
           state.currentOctaveStep = 0; state.euclideanStepCounter = 0; state.arpDirection = 1; state.lastPlayedMidi = null;
           if (state.arpRafId) cancelAnimationFrame(state.arpRafId);
           updateArpeggiator(knobId, performance.now());
       }
      
       function stopArpeggiator(knobId) {
           const state = knobState[knobId];
           if (!state) return;

           // --- Stop the existing playback loop ---
           state.arpRunning = false;
           if (state.arpRafId) {
               cancelAnimationFrame(state.arpRafId);
               state.arpRafId = null;
           }
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
           state.lastArpStepTime = 0;
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
               state.dom.indicator.style.transform = `rotate(${displayAngle}deg)`;
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
    
           // --- This block now correctly reads the LIVE LFO values ---
let modulatedRateMs = state.arpRateMs;
let modulatedTranspose = state.arpTranspose;
let modulatedOctaveRange = state.arpOctaveRange;
let modulatedFeelPattern = state.currentFeelPattern;

lfoState.forEach((lfo, lfoIndex) => {
    if (lfo.dest === 0 || lfo.depth < 0.001) return;

    // Use the LIVE output from the audio worklet
    const lfoModValue = liveLfoOutputs[lfoIndex] || 0;
    
    const destIsArpRate = lfo.dest === (16 + knobId);
    const destIsArpTranspose = lfo.dest === (24 + knobId);
    const destIsArpOcts = lfo.dest === (18 + knobId);
    const destIsArpFeel = lfo.dest === (22 + knobId);

    if (destIsArpRate) {
        const baseValue = fxKnobData[16 + knobId]?.value ?? 0.5;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        modulatedRateMs = 50 + Math.pow(1 - finalValue, 3) * 1950;
    }
    if (destIsArpTranspose) {
        const baseValue = fxKnobData[24 + knobId]?.value ?? 0.5;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        modulatedTranspose = Math.floor((finalValue * 24) - 12);
        // Update the display to show live modulation
        if (state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = modulatedTranspose;
    }
    if (destIsArpOcts) {
        const baseValue = fxKnobData[18 + knobId]?.value ?? 0;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        modulatedOctaveRange = Math.min(3, Math.floor(finalValue * 4));
        // Update the display
        if (state.dom.octsDisplay) state.dom.octsDisplay.textContent = modulatedOctaveRange;
    }
    if (destIsArpFeel) {
        const baseValue = fxKnobData[22 + knobId]?.value ?? 0;
        const finalValue = Math.max(0, Math.min(1, baseValue + lfoModValue));
        const pIndex = Math.min(NUM_FEEL_PATTERNS - 1, Math.floor(finalValue * NUM_FEEL_PATTERNS));
        modulatedFeelPattern = EUCLIDEAN_PATTERNS[pIndex];
        // Update the display
        if (state.dom.feelDisplay) state.dom.feelDisplay.textContent = pIndex + 1;
    }
});
// --- End of Fix ---
           // --- End of Fix ---
    
           if (timestamp - state.lastArpStepTime >= modulatedRateMs) {
               state.lastArpStepTime = timestamp;
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
                   if (state.arpLastVisualIndex > -1 && blocks[state.arpLastVisualIndex]) {
                       blocks[state.arpLastVisualIndex].classList.remove('playhead');
                   }
                   if (visualIndex > -1 && blocks[visualIndex]) {
                       blocks[visualIndex].classList.add('playhead');
                       state.arpLastVisualIndex = visualIndex;
                   } else {
                       state.arpLastVisualIndex = -1;
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
           state.arpRafId = requestAnimationFrame((ts) => updateArpeggiator(knobId, ts));
       }
      
       function populateScales() {
           let names = Object.keys(SCALES); names.splice(2, 0, 'Custom');
           scaleSelector.innerHTML = '';
           names.forEach(name => { const opt = document.createElement('option'); opt.value = name; opt.textContent = name.toUpperCase(); scaleSelector.appendChild(opt); });
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

            let baseNoteIndexInScale = fullScaleMidi.indexOf(noteObj.midi);
            let transposedMidi = noteObj.midi; // Default to original note if not in scale
            if (baseNoteIndexInScale !== -1) {
                const transposedNoteIndex = baseNoteIndexInScale + state.arpTranspose;
                transposedMidi = fullScaleMidi[Math.max(0, Math.min(fullScaleMidi.length - 1, transposedNoteIndex))];
            }
            
            const { r, g, b } = getArpNoteColor(transposedMidi);
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
                       const randVal = Math.random();
                       const targetAngle = MIN_FX_ANGLE + (randVal * (MAX_FX_ANGLE - MIN_FX_ANGLE));
                       updateFxKnob(id, targetAngle - kData.angle);
                   }
               }
           });
           knobState.forEach(k => updateStateFromTotalAngle(k.id));
       }
      
     function savePreset() {
           const preset = {
               key: keySelector.value,
               scale: scaleSelector.value,
               customScale: scaleSelector.value === 'Custom' ? customScale : [],
               allowDuplicateNotesMode: allowDuplicateNotesMode,
               isLfoMode: isLfoMode,
               lfoState: lfoState.map(lfo => ({
                   rate: lfo.rate,
                   depth: lfo.depth,
                   wave: lfo.wave,
                   dest: lfo.dest
               })),
               knobSettings: knobState.map(k => ({ id: k.id, totalAngle: k.totalAngle })),
               fxSettings: Object.values(fxKnobData).map(k => ({ id: k.id, value: k.value })),
               arpSettings: { isArpRateSynced: isArpRateSynced, currentArpOrder: currentArpOrder, arp1: { isOn: knobState[0].isArpHoldOn, isArpOn: knobState[0].isArpOn, isSweepMode: knobState[0].isSweepMode, octaves: knobState[0].arpOctaveRange, feelValue: knobState[0].feelKnobValue, notes: knobState[0].arpNotes, transpose: knobState[0].arpTranspose }, arp2: { isOn: knobState[1].isArpHoldOn, isArpOn: knobState[1].isArpOn, isSweepMode: knobState[1].isSweepMode, octaves: knobState[1].arpOctaveRange, feelValue: knobState[1].feelKnobValue, notes: knobState[1].arpNotes, transpose: knobState[1].arpTranspose } }
           };
           const color = FILE_NOUNS[Math.floor(Math.random() * FILE_NOUNS.length)];
           const date = new Date(); const fDate = `${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${date.getFullYear()}`;
           const fname = `${fDate}_n-ob_${color}.json`; const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
           const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
       }
       function loadPreset(e) {
           const file=e.target.files[0]; if(!file)return;
           const reader=new FileReader();
           reader.onload=function(e){try{const p=JSON.parse(e.target.result);applyPreset(p);}catch(err){console.error("Error parsing preset:",err);}};
           reader.readAsText(file); e.target.value='';
       }
      
       function updateGlobalArpVisibility() {
           const anyOn = knobState.some(k => k.isArpOn);
           const action = anyOn ? 'remove' : 'add';
           allArpControlGrids?.forEach(g => g.classList[action]('arp-hidden'));
           if (masterArpControls) masterArpControls.classList[action]('arp-hidden');
           knobState.forEach(k => updateArpControlsFading(k.id));
           updateSyncSwitchVisibility();
       }
      
       function updateArpControlsFading(id) {
           const state = knobState[id]; if (!state || !state.dom?.arpControlsContainer) return;
           state.dom.arpControlsContainer.classList[state.isArpOn ? 'remove' : 'add']('arp-disabled');
       }
      
       function updateSyncSwitchVisibility() {
           if (!knobState || !arpSyncSwitch || !arpOrderSelector) return;
           const bothOn = knobState.every(k => k.isArpOn);
           const syncCont = arpSyncSwitch.parentElement;
           if(syncCont){syncCont.classList[bothOn?'remove':'add']('arp-disabled'); if(!bothOn&&isArpRateSynced){isArpRateSynced=false;arpSyncSwitch.classList.remove('on');}}
           const anyOn = knobState.some(k => k.isArpOn);
           const orderCont = arpOrderSelector.parentElement;
           if(orderCont){orderCont.classList[anyOn?'remove':'add']('arp-disabled');}
       }
        function updateLfoVisuals(lfoOutputs) {
            const modulatedValues = {}; // key: fxId, value: total modulation amount

            // Step 1: Accumulate modulation for each destination
            lfoState.forEach((lfo, index) => {
                if (lfo.dest !== 0) { // If not OFF
                    if (!modulatedValues[lfo.dest]) {
                        modulatedValues[lfo.dest] = 0;
                    }
                    modulatedValues[lfo.dest] += lfoOutputs[index];
                }
            });

            // --- NEW: Handle Main Oscillator Modulation ---
            if (modulatedValues[30] !== undefined) {
                const knob = knobState[0];
                const lfoModAmount = modulatedValues[30] * 20; // Adjust '20' to change sensitivity
                knob.totalAngle += lfoModAmount;
                updateStateFromTotalAngle(0);
            }
            if (modulatedValues[31] !== undefined) {
                const knob = knobState[1];
                const lfoModAmount = modulatedValues[31] * 20; // Adjust '20' to change sensitivity
                knob.totalAngle += lfoModAmount;
                updateStateFromTotalAngle(1);
            }
            // --- END OF NEW CODE ---


            // Step 2: Apply the final calculated value to each visual indicator for FX knobs
            for (const knobIdStr in fxKnobData) {
                const knobId = parseInt(knobIdStr, 10);
                const knobData = fxKnobData[knobId];
                let finalValue = knobData.value;

                if (modulatedValues[knobId] !== undefined) {
                    finalValue += modulatedValues[knobId];
                }

                if (knobData.indicator) {
                    finalValue = Math.max(0, Math.min(1, finalValue));
                    const newAngle = MIN_FX_ANGLE + finalValue * (MAX_FX_ANGLE - MIN_FX_ANGLE);
                    knobData.indicator.style.transform = `rotate(${newAngle}deg)`;
                }
            }
        }
      
      function toggleEasterEggMode() {
        allowDuplicateNotesMode = !allowDuplicateNotesMode;
        document.body.classList.toggle('easter-egg-mode', allowDuplicateNotesMode);
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
                    lfoState[lfoInfo.lfo][lfoInfo.param] = 0;
                    if (synthNode) {
                        synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: lfoInfo.lfo, param: lfoInfo.param, value: 0 } });
                    }
                }
            });
            for (let i = 0; i < 4; i++) {
                const waveDisplay = document.getElementById(`lfo-wave-display-${i}`);
                const destDisplay = document.getElementById(`lfo-dest-display-${i}`);
                if (waveDisplay) waveDisplay.textContent = 'SINE';
                if (destDisplay) destDisplay.textContent = 'OFF';
            }
        }
        
        drawLfoCables();

        if (lfoAnimationId === null) {
            const animateLFOs = () => {
                if (synthNode) synthNode.port.postMessage({ type: 'requestLfoUpdate' });
                lfoAnimationId = requestAnimationFrame(animateLFOs);
            };
            animateLFOs();
        }
    } else {
        if (lfoAnimationId !== null) {
            cancelAnimationFrame(lfoAnimationId);
            lfoAnimationId = null;
        }
        Object.values(fxKnobData).forEach(d => {
            if (d.indicator) d.indicator.style.transform = `rotate(${d.angle}deg)`;
        });
        drawLfoCables();
    }
}

function applyPreset(p) {
           if (!p) return;

           if (!isPowerOn) powerOn();

           // --- 1. STOP old arps completely FIRST ---
           stopArpeggiator(0);
           stopArpeggiator(1);

           // --- 2. WIPE all knobs to a clean state ---
           resetAllFxToDefaults();

           // --- 3. APPLY all new settings from the preset ---
           scaleSelector.value = p.scale ?? 'Major';
           scaleSelector.dispatchEvent(new Event('change'));
           keySelector.value = p.key ?? 'C';

           if (p.allowDuplicateNotesMode !== undefined) {
               allowDuplicateNotesMode = p.allowDuplicateNotesMode;
           }
           document.body.classList.toggle('easter-egg-mode', allowDuplicateNotesMode);

           if (p.scale === 'Custom') { customScale = p.customScale || []; document.querySelectorAll('#custom-scale-builder .key').forEach(k => { const n = parseInt(k.dataset.note); k.classList.toggle('selected', customScale.includes(n)); }); }
           
            // --- 4. APPLY LFO STATE (IMPORTANT: Do this before FX settings) ---
            if (p.lfoState && Array.isArray(p.lfoState)) {
               // Reset all LFOs to 0 first to ensure no partial state lingers if the preset has fewer than 4 LFOs
               lfoState.forEach((lfo, index) => {
                    lfo.rate = 0; lfo.depth = 0; lfo.wave = 0; lfo.dest = 0;
                    if (synthNode) {
                        synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: 0 } });
                        synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: 0 } });
                        synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: 0 } });
                        synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'dest', value: 0 } });
                    }
               });

               p.lfoState.forEach((savedLfo, index) => {
                   if (index < lfoState.length) {
                       lfoState[index].rate = savedLfo.rate ?? 0;
                       lfoState[index].depth = savedLfo.depth ?? 0;
                       lfoState[index].wave = savedLfo.wave ?? 0;
                       lfoState[index].dest = savedLfo.dest ?? 0;
                       
                       const rateKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'rate');
                       const depthKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'depth');
                       const waveKnobId = Object.keys(LFO_KNOB_MAP).find(id => LFO_KNOB_MAP[id].lfo === index && LFO_KNOB_MAP[id].param === 'wave');
                       
                       if (rateKnobId) setFxValue(parseInt(rateKnobId), lfoState[index].rate, true);
                       if (depthKnobId) setFxValue(parseInt(depthKnobId), lfoState[index].depth, true);
                       if (waveKnobId) {
                           const waveIndex = lfoState[index].wave;
                           const waveKnobValue = (waveIndex + 0.5) / LFO_WAVEFORMS.length; 
                           setFxValue(parseInt(waveKnobId), waveKnobValue, true);
                           const waveDisplay = document.getElementById(`lfo-wave-display-${index}`);
                           if (waveDisplay) waveDisplay.textContent = LFO_WAVEFORMS[waveIndex];
                       }

                       const destDisplay = document.getElementById(`lfo-dest-display-${index}`);
                       if (destDisplay) {
                           const destName = KNOB_ID_TO_NAME_MAP[lfoState[index].dest] || 'OFF';
                           destDisplay.textContent = destName;
                       }
                       
                       if (synthNode) {
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: lfoState[index].rate } });
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: lfoState[index].depth } });
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: lfoState[index].wave } });
                           synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'dest', value: lfoState[index].dest } });
                       }
                   }
               });
           } else { // Reset LFOs for older presets (THE FIX IS HERE)
               lfoState.forEach((lfo, index) => {
                   lfo.rate = 0; lfo.depth = 0; lfo.wave = 0; lfo.dest = 0;
                   
                   // *** FORCE UPDATE THE AUDIO ENGINE ***
                   if (synthNode) {
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'rate', value: 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'depth', value: 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'wave', value: 0 } });
                       synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: index, param: 'dest', value: 0 } });
                   }
               });
               
               // Reset UI Text
               for (let i = 0; i < 4; i++) {
                    const waveDisplay = document.getElementById(`lfo-wave-display-${i}`);
                    const destDisplay = document.getElementById(`lfo-dest-display-${i}`);
                    if (waveDisplay) waveDisplay.textContent = 'SINE';
                    if (destDisplay) destDisplay.textContent = 'OFF';
               }
           }
           
           toggleLfoModeUI(p.isLfoMode ?? false, true); 

           if (p.knobSettings) { p.knobSettings.forEach(kD => { const s = knobState.find(k => k.id === kD.id); if (s) s.totalAngle = kD.totalAngle ?? 0; }); }
           
           if (p.fxSettings) { p.fxSettings.forEach(fx => { setFxValue(fx.id, fx.value ?? 0); }); }
           
           if (p.arpSettings) {
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
               knobState[1].dom.arpSwitch?.classList.toggle('on', knobState[1].isArpOn);
               document.getElementById('arp-hold-switch-1')?.classList.toggle('on', knobState[1].isArpHoldOn);
               
               if (isArpRateSynced && knobState[0].isArpOn && knobState[1].isArpOn) {
                    const arp1RateValue = fxKnobData[16].value;
                    setFxValue(17, arp1RateValue); 
               }
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
                d.indicator.style.transform = `rotate(${d.angle}deg)`;
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
                } else if (id === 24 || id === 25) {
                    state.arpTranspose = Math.floor((d.value * 24) - 12);
                    if (state.dom.transposeDisplay) state.dom.transposeDisplay.textContent = state.arpTranspose;
                } else if (id === 16 || id === 17) {
                    state.arpRateMs = 50 + Math.pow(1 - d.value, 3) * 1950;
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

function resetAllFxToDefaults() {
           Object.keys(fxKnobData).forEach(idStr => {
               const id = parseInt(idStr, 10);
               let defaultValue = 0.0;
               if (id === 2) defaultValue = 1.0;
               if (id === 7) defaultValue = 0.7;
               if (id === 10) defaultValue = 1.0;
               if (id === 16 || id === 17) defaultValue = 0.69;
               if (id === 20 || id === 21) defaultValue = 1.0;
               if (id === 26 || id === 27) defaultValue = 0.5;
               if (id === 24 || id === 25) defaultValue = 0.5;
               setFxValue(id, defaultValue);
           });
       }

function generateAndApplyRandomPreset() {
    if (!isPowerOn) powerOn();

    // 1. --- Foundation: Pick a random Key and Scale ---
    const randomKey = NOTES[Math.floor(Math.random() * NOTES.length)];
    const availableScales = Object.keys(SCALES).filter(s => s !== 'Blues' && s !== 'Custom');
    const randomScaleName = availableScales[Math.floor(Math.random() * availableScales.length)];
    const scaleIntervals = SCALES[randomScaleName];

    // 2. --- Generate a pool of musically valid MIDI notes ---
    const rootNoteIndex = NOTES.indexOf(randomKey);
    const validNotes = [];
    for (let oct = 3; oct < 7; oct++) { // Generate notes across 4 octaves
        for (const interval of scaleIntervals) {
            validNotes.push(rootNoteIndex + (oct * 12) + interval);
        }
    }

    // 3. --- Arpeggiator Brain ---
    const useTwoArps = Math.random() < 0.5; // 50% chance for a second arp
    
    const arp1Notes = [];
    const numNotes1 = Math.floor(Math.random() * 3) + 3; // Pick 3 to 5 notes
    for (let i = 0; i < numNotes1; i++) {
        arp1Notes.push({ midi: validNotes[Math.floor(Math.random() * validNotes.length)], active: true });
    }

    let arp2Config = { isArpOn: false, notes: [] };
    if (useTwoArps) {
        const arp2Notes = [];
        const numNotes2 = Math.floor(Math.random() * 3) + 2; // Pick 2 to 4 notes
        for (let i = 0; i < numNotes2; i++) {
            arp2Notes.push({ midi: validNotes[Math.floor(Math.random() * validNotes.length)], active: true });
        }
        arp2Config = {
            isArpOn: true,
            notes: arp2Notes,
            transpose: Math.random() < 0.4 ? (Math.random() > 0.5 ? 2 : -2) : 0,
        };
    }

    // 4. --- Sound Character (FX and Envelope) ---
    const fxSettings = [
        { id: 8, value: Math.random() * 0.4 }, { id: 9, value: Math.random() }, { id: 10, value: Math.random() }, { id: 11, value: 0.1 + Math.random() * 0.7 },
        { id: 0, value: Math.random() < 0.2 ? Math.random() * 0.4 : 0 }, { id: 1, value: Math.random() * Math.random() }, { id: 2, value: 0.5 + Math.random() * 0.5 },
        { id: 3, value: Math.random() }, { id: 4, value: Math.random() * 0.6 }, { id: 5, value: Math.random() < 0.3 ? Math.random() : 0 }, { id: 6, value: Math.random() * 0.8 },
        { id: 12, value: Math.random() * 0.8 }, { id: 13, value: Math.random() }, { id: 14, value: Math.random() * 0.7 }, { id: 15, value: Math.random() },
        { id: 20, value: Math.random() * 0.5 + 0.5 }, { id: 21, value: Math.random() * 0.5 + 0.5 }, { id: 28, value: Math.random() }, { id: 29, value: Math.random() }
    ];

    // 5. --- Final Assembly ---
    const randomPreset = {
        key: randomKey,
        scale: randomScaleName,
        fxSettings: fxSettings, // Start with the global FX
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

    // --- MERGE THE ARP FX VALUES INTO THE MAIN FX SETTINGS ---
    if (randomPreset.arpSettings && randomPreset.arpSettings.fx) {
        for (const [fxId, value] of Object.entries(randomPreset.arpSettings.fx)) {
            randomPreset.fxSettings.push({ id: parseInt(fxId), value: value });
        }
    }
    
    // 6. --- Apply the new preset! ---
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
function generateAndApplyRandomSound() {
            if (!isPowerOn) powerOn();
            const randomKey = NOTES[Math.floor(Math.random() * NOTES.length)];
            const availableScales = Object.keys(SCALES).filter(s => s !== 'Blues' && s !== 'Custom');
            const randomScaleName = availableScales[Math.floor(Math.random() * availableScales.length)];
            
            const fxSettings = [
                { id: 8, value: Math.random() * 0.4 }, { id: 9, value: Math.random() }, { id: 10, value: Math.random() }, { id: 11, value: 0.1 + Math.random() * 0.7 },
                { id: 0, value: Math.random() < 0.2 ? Math.random() * 0.4 : 0 }, { id: 1, value: Math.random() * Math.random() }, { id: 2, value: 0.5 + Math.random() * 0.5 },
                { id: 3, value: Math.random() }, { id: 4, value: Math.random() * 0.6 }, { id: 5, value: Math.random() < 0.3 ? Math.random() : 0 }, { id: 6, value: Math.random() * 0.8 },
                { id: 12, value: Math.random() * 0.8 }, { id: 13, value: Math.random() }, { id: 14, value: Math.random() * 0.7 }, { id: 15, value: Math.random() },
                { id: 20, value: Math.random() * 0.5 + 0.5 }, { id: 21, value: Math.random() * 0.5 + 0.5 }, { id: 28, value: Math.random() }, { id: 29, value: Math.random() }
            ];

            const randomPreset = {
                key: randomKey,
                scale: randomScaleName,
                fxSettings: fxSettings,
                arpSettings: { // Explicitly turn arps off
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
            // Ensure it's also removed from main knobs
            knobState.forEach(knob => {
                if (knob.dom.knob) {
                    knob.dom.knob.classList.remove('blinking-lfo-target');
                }
            });
            activePatchingLfo = null;
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

            // Also make the main knobs blink
            knobState.forEach(knob => {
                if (knob.dom.knob) {
                    knob.dom.knob.classList.add('blinking-lfo-target');
                }
            });
        } 
      function drawLfoCables() {
        if (!isLfoMode) {
             for (let i = 0; i < 4; i++) {
                const cable = document.getElementById(`lfo-cable-${i}`);
                if (cable) cable.setAttribute('d', '');
            }
            return;
        };

        const containerRect = synthContainer.getBoundingClientRect();

        lfoState.forEach((lfo, index) => {
            const cable = document.getElementById(`lfo-cable-${index}`);
            if (!cable) return;

            // State 1: LFO is OFF. No cable is drawn.
            if (lfo.dest === 0) {
                cable.setAttribute('d', '');
                return;
            }

            const sourceKnobInfo = Object.values(LFO_KNOB_MAP).find(d => d.lfo === index && d.param === 'dest');
            if (!sourceKnobInfo) return;

            const sourceFxId = Object.keys(LFO_KNOB_MAP).find(key => LFO_KNOB_MAP[key] === sourceKnobInfo);
            const sourceKnobEl = fxKnobData[sourceFxId]?.knobEl;

            if (sourceKnobEl) {
                const sourceRect = sourceKnobEl.getBoundingClientRect();
                const startX = sourceRect.left - containerRect.left + sourceRect.width / 2;
                const startY = sourceRect.top - containerRect.top + sourceRect.height / 2;
                
                let endX, endY;

                // State 2: Cable is "Parked". Draw it off to the side.
                if (lfo.dest === -1) {
                    const direction = (index < 2) ? -1 : 1; // LFO 1/2 go left, 3/4 go right
                    endX = startX + (500 * direction);
                    endY = startY + 100; // Give it a slight droop
                } 
                // State 3: Cable is patched to a destination.
                else { 
                   let destKnobEl;
                    if (lfo.dest >= 30) { // Check if the destination is a main knob
                        const knobIndex = lfo.dest - 30; // Convert ID (30, 31) to index (0, 1)
                        destKnobEl = knobState[knobIndex]?.dom?.knob;
                    } else { // Otherwise, it's a regular FX knob
                        destKnobEl = fxKnobData[lfo.dest]?.knobEl;
                    }
                    // Also handles the ARP-off case where the element is hidden
                    if (!destKnobEl || destKnobEl.offsetParent === null) {
                         const direction = (startX > containerRect.width / 2) ? 1 : -1;
                         endX = startX + (250 * direction);
                         endY = startY + 80;
                    } else {
                        // Normal patching to a visible knob
                        const destRect = destKnobEl.getBoundingClientRect();
                        endX = destRect.left - containerRect.left + destRect.width / 2;
                        endY = destRect.top - containerRect.top + destRect.height / 2;
                    }
                }
                
                // --- Draw the curve ---
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const dx = endX - startX;
                const dy = endY - startY;
                const curvature = 0.3;
                const ctrlX = midX + dy * curvature;
                const ctrlY = midY - dx * curvature;

                const pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
                cable.setAttribute('d', pathData);
            }
        });
    }


       function init(){
           // --- Get all DOM elements ---
           synthContainer = document.getElementById('synth-container');
           powerSwitch = document.getElementById('power-switch');
           keySelector = document.getElementById('keySelector');
           scaleSelector = document.getElementById('scaleSelector');
           modalOverlay = document.getElementById('how-to-modal-overlay');
           howToButton = document.getElementById('how-to-button-header');
           closeModalButton = document.getElementById('close-modal-button');
           customScaleBuilder = document.getElementById('custom-scale-builder');
           recordButton = document.getElementById('record-button');
           recordMidiButton = document.getElementById('record-midi-button');
           loadPresetInput = document.getElementById('load-preset-input');
           
           // --- NEW Preset Menu Elements ---
           const presetsToggleButton = document.getElementById('presets-toggle-button');
           const presetsSubmenuContainer = document.getElementById('presets-submenu-container');
           const submenuSaveButton = document.getElementById('submenu-save-button');
           const submenuLoadButton = document.getElementById('submenu-load-button');
           const systemPresetSelector = document.getElementById('system-preset-selector'); 
           const midiConnectButton = document.getElementById('midi-connect-button');
           midiConnectButton?.addEventListener('click', () => {
               setupMidiOutput();
               midiConnectButton.textContent = 'RESCAN'; // Change button text after first click
           });

           arpSyncSwitch = document.getElementById('arp-sync-switch');
           masterArpControls = document.getElementById('master-arp-controls');
           arpOrderSelector = document.getElementById('arp-order-selector');
           allArpControlGrids = document.querySelectorAll('.arp-controls');
           const lfoModeSwitch = document.getElementById('lfo-mode-switch');

           // --- Setup initial state and event listeners ---
           lfoModeSwitch?.addEventListener('click', () => toggleLfoModeUI());
            new ResizeObserver(drawLfoCables).observe(synthContainer);
      
           populateScales();
           setupFxKnobs();
            
            // Build the Knob Name map after fxKnobData is populated
            document.querySelectorAll('.fx-knob-container').forEach(knobEl => {
                const id = knobEl.dataset.fxId;
                const labelEl = knobEl.nextElementSibling;
                if (id && labelEl) {
                    KNOB_ID_TO_NAME_MAP[id] = labelEl.textContent.trim().replace(/\s/g, ' '); // Clean up text
                }
            });


            synthContainer.addEventListener('click', (e) => {
                if (!isLfoMode || activePatchingLfo === null) return;
                
                const targetKnobEl = e.target.closest('.fx-knob-container');
                if (!targetKnobEl) {
                    // If user clicks outside a knob, cancel patching
                    stopLfoPatching();
                    return;
                }
                
                const targetFxId = parseInt(targetKnobEl.dataset.fxId, 10);
                const sourceKnobInfo = Object.values(LFO_KNOB_MAP).find(d => d.lfo === activePatchingLfo && d.param === 'dest');
                const sourceFxId = parseInt(Object.keys(LFO_KNOB_MAP).find(key => LFO_KNOB_MAP[key] === sourceKnobInfo));
                
                // --- Validation ---
                const ownLfoKnobs = Object.keys(LFO_KNOB_MAP).filter(id => LFO_KNOB_MAP[id].lfo === activePatchingLfo).map(id => parseInt(id));
                
                if (targetFxId === sourceFxId) {
                    // Clicked the source knob again to cancel or reset
                    lfoState[activePatchingLfo].dest = 0; // Set to OFF
                    document.getElementById(`lfo-dest-display-${activePatchingLfo}`).textContent = 'OFF';
                     if (synthNode) synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: activePatchingLfo, param: 'dest', value: 0 } });
                    stopLfoPatching();
                     drawLfoCables();
                    return;
                }

                if (ownLfoKnobs.includes(targetFxId)) {
                    // Invalid target (one of its own knobs)
                    return;
                }

                // --- Valid Target Selected ---
                lfoState[activePatchingLfo].dest = targetFxId;
                const targetName = KNOB_ID_TO_NAME_MAP[targetFxId] || "UNKNOWN";
                document.getElementById(`lfo-dest-display-${activePatchingLfo}`).textContent = targetName;
                 if (synthNode) synthNode.port.postMessage({ type: 'setLfo', data: { lfoId: activePatchingLfo, param: 'dest', value: targetFxId } });

                stopLfoPatching();
                 drawLfoCables();
            });


            const mainHeader = document.querySelector('.main-header h1');
            let headerTapCount = 0;
            let headerTapTimer = null;
            mainHeader?.addEventListener('click', () => {
                headerTapCount++;
                clearTimeout(headerTapTimer);
                if (headerTapCount >= 1) { // Changed to 1 click for convenience
                    toggleEasterEggMode();
                    mainHeader.style.transition = 'color 0.1s';
                    mainHeader.style.color = '#facc15';
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
               s.dom.transposeDisplay = document.getElementById(`transpose-display-${id}`);
               s.dom.rateDisplay = document.getElementById(`rate-display-${id}`);
      
               s.dom.knob?.addEventListener('mousedown', handleInteractionStart); s.dom.knob?.addEventListener('touchstart', handleInteractionStart, {passive: false});
      
               const spinLeftButton = document.getElementById(`spin-left-${id}`);
               const spinRightButton = document.getElementById(`spin-right-${id}`);
               setupSpinButton(spinLeftButton, id, 'left');
               setupSpinButton(spinRightButton, id, 'right');
      
               const holdSwitch = document.getElementById(`arp-hold-switch-${id}`);
               holdSwitch?.addEventListener('click', () => {
                  if (!s.isArpOn) return;
                  s.isArpHoldOn = !s.isArpHoldOn;
                  holdSwitch.classList.toggle('on', s.isArpHoldOn);
                  if (!s.isArpHoldOn && !s.isHeld) {
                     if (s.arpRunning) stopArpeggiator(id);
                     s.arpNotes = [];
                     updateSequenceDisplay(id);
                  }
               });
      
               s.dom.arpSwitch?.addEventListener('click', () => {
                   s.isArpOn = !s.isArpOn; s.dom.arpSwitch.classList.toggle('on', s.isArpOn);
                   updateGlobalArpVisibility();
                   if (!s.isArpOn) { stopArpeggiator(s.id); if(s.isHeld) { s.isNoteOn = true; const freq = calculateNote(s.id, false); if(synthNode) synthNode.port.postMessage({type:'noteOn',data:{voice:s.id,freq:freq}}); } s.arpNotes = []; updateSequenceDisplay(s.id);if(s.dom.arpNoteDisplay)s.dom.arpNoteDisplay.textContent="--"; }
                   else { if(s.isHeld) { if (s.isNoteOn) { if(synthNode) synthNode.port.postMessage({type:'noteOff', data:{voice:s.id}}); s.isNoteOn = false; } playNote(s.id); } }
                   updateStateFromTotalAngle(s.id);
               });
               s.dom.arpModeSwitch?.addEventListener('click', () => { if (!s.isArpOn) return; s.isSweepMode = !s.isSweepMode; s.dom.arpModeSwitch.classList.toggle('on', s.isSweepMode); if (!s.isSweepMode && s.arpRunning) { s.arpNotes = [{ midi: getMidiNote(s.id), active: true }]; s.currentArpNoteIndex = (currentArpOrder === "Down" && s.arpNotes.length > 0) ? s.arpNotes.length - 1 : 0; s.arpUpDownState = 0; } });
           });
      
           powerSwitch?.addEventListener('click',()=>{if(isPowerOn)powerOff();else powerOn();});
          
           howToButton?.addEventListener('click', () => {modalOverlay.classList.remove('opacity-0', 'pointer-events-none');});
           closeModalButton?.addEventListener('click',()=>{modalOverlay.classList.add('opacity-0','pointer-events-none');});
           modalOverlay?.addEventListener('click',(e)=>{if(e.target===modalOverlay)closeModalButton.click();});
           document.addEventListener('mousemove',updateKnobPosition); document.addEventListener('mouseup',handleInteractionEnd);
           document.addEventListener('touchmove',updateKnobPosition,{passive:false}); document.addEventListener('touchend',handleInteractionEnd);
           document.addEventListener('touchcancel', handleInteractionEnd); document.addEventListener('keydown',handleKeyDown); document.addEventListener('keyup',handleKeyUp);
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

            document
  .querySelectorAll('[data-fx-id="114"], [data-fx-id="115"], [data-fx-id="102"], [data-fx-id="107"]')
  .forEach(destKnob => {

    // --- EXISTING CLICK HANDLER ---
    destKnob.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isLfoMode) return;

      const fxId = parseInt(destKnob.dataset.fxId, 10);
      const lfoInfo = LFO_KNOB_MAP[fxId];
      if (!lfoInfo || lfoInfo.param !== 'dest') return;

      if (activePatchingLfo === lfoInfo.lfo) {
        stopLfoPatching();
      } else {
        startLfoPatching(lfoInfo.lfo);
      }
    });

    // --- MOBILE DOUBLE TAP HELPER (define ONCE inside loop so destKnob is in scope) ---
    function addDoubleTap(el, handler) {
      let last = 0;
      el.addEventListener("touchend", (e) => {
        const now = Date.now();
        if (now - last < 300) {
          e.preventDefault();
          handler(e);
        }
        last = now;
      });
    }

    // --- DESKTOP DOUBLE CLICK TO PARK ---
    destKnob.addEventListener('dblclick', () => {
      if (!isLfoMode) return;
      const fxId = parseInt(destKnob.dataset.fxId, 10);
      const lfoInfo = LFO_KNOB_MAP[fxId];
      if (!lfoInfo) return;

      const lfo = lfoState[lfoInfo.lfo];
      if (lfo.dest > 0) {
        lfo.dest = -1; // Park
        document.getElementById(`lfo-dest-display-${lfoInfo.lfo}`).textContent = 'OFF';

        if (synthNode) {
          synthNode.port.postMessage({
            type: 'setLfo',
            data: { lfoId: lfoInfo.lfo, param: 'dest', value: 0 }
          });
        }
        drawLfoCables();
      }
    });

    // --- MOBILE DOUBLE TAP CALLS THE SAME LOGIC ---
    addDoubleTap(destKnob, () => {
      destKnob.dispatchEvent(new Event("dblclick"));
    });

});

           // --- CORRECTED PRESET SUBMENU LOGIC ---
           presetsToggleButton?.addEventListener('click', () => {
                const isVisible = presetsSubmenuContainer.style.display === 'flex';
                presetsSubmenuContainer.style.display = isVisible ? 'none' : 'flex';
                presetsToggleButton.classList.toggle('active', !isVisible);
           });

           submenuSaveButton?.addEventListener('click', () => {
                savePreset();
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton.classList.remove('active');
           });

           submenuLoadButton?.addEventListener('click', () => {
                loadPresetInput.click();
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton.classList.remove('active');
           });
           
           const initialOption = document.createElement('option');
           initialOption.textContent = 'SYSTEM';
           initialOption.disabled = true;
           initialOption.selected = true;
           systemPresetSelector.appendChild(initialOption);

           for (const groupName in PRESETS) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = groupName;
                for (const presetName in PRESETS[groupName]) {
                    const option = document.createElement('option');
                    option.value = presetName;
                    option.dataset.group = groupName;
                    option.textContent = presetName;
                    optgroup.appendChild(option);
                }
                systemPresetSelector.appendChild(optgroup);
           }

           systemPresetSelector.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const presetName = selectedOption.value;
                
                if (presetName === "RANDOM ARP") {
                    generateAndApplyRandomPreset();
                } else if (presetName === "RANDOM SOUND") {
                    generateAndApplyRandomSound();
                } else {
                    const groupName = selectedOption.dataset.group;
                    if (!groupName || !PRESETS[groupName] || !PRESETS[groupName][presetName]) return;

                    const presetData = JSON.parse(JSON.stringify(PRESETS[groupName][presetName]));
                    if (!isPowerOn) powerOn();
                    
                    const fullPreset = {
                        key: presetData.key,
                        scale: presetData.scale,
                        customScale: presetData.customScale || [],
                        isLfoMode: presetData.isLfoMode || false,  // ADD THIS
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
                            }
                        }
                    };
                    
                    if (presetData.arpSettings && presetData.arpSettings.fx) {
                        for (const [fxId, value] of Object.entries(presetData.arpSettings.fx)) {
                            fullPreset.fxSettings.push({ id: parseInt(fxId), value: value });
                        }
                    }
                    
                    applyPreset(fullPreset);
                }

                systemPresetSelector.blur();
                e.target.selectedIndex = 0;
                presetsSubmenuContainer.style.display = 'none';
                presetsToggleButton.classList.remove('active');
            });
           
           loadPresetInput?.addEventListener('change', loadPreset);
           document.querySelectorAll('#custom-scale-builder .key').forEach(k=>{k.addEventListener('click',()=>{const n=parseInt(k.dataset.note); k.classList.toggle('selected'); if(customScale.includes(n)){customScale=customScale.filter(i=>i!==n);} else {customScale.push(n);} customScale.sort((a,b)=>a-b); knobState.forEach(k=>updateStateFromTotalAngle(k.id));});});
           recordButton?.addEventListener('click', async () => {
               if (!isPowerOn) powerOn();
               if (!audioContext || !synthNode) await setupAudio();
               if (!isRecordingAudio) { pcmChunks = []; totalPcmBytes = 0; isRecordingAudio = true; startRecordingUI(); synthNode.port.postMessage({ type: 'startRecording', data: { blockSize: 8192 } }); }
               else { synthNode.port.postMessage({ type: 'stopRecording', data: {} }); }
               recordButton.blur(); 
           });
           recordMidiButton?.addEventListener('click', () => {
               toggleMidiRecording();
               recordMidiButton.blur();
           });           
           knobState.forEach(k => {
               updateStateFromTotalAngle(k.id);
               if(k.dom.octsDisplay) k.dom.octsDisplay.textContent = k.arpOctaveRange;
               if(k.dom.transposeDisplay) k.dom.transposeDisplay.textContent = k.arpTranspose;
               if(k.dom.feelDisplay) { const pIdx=Math.min(NUM_FEEL_PATTERNS-1,Math.floor(k.feelKnobValue*NUM_FEEL_PATTERNS)); k.dom.feelDisplay.textContent = pIdx + 1; }
               if(k.dom.rateDisplay) k.dom.rateDisplay.textContent = k.arpRateMs.toFixed(1);
               if(k.dom.arpNoteDisplay) k.dom.arpNoteDisplay.textContent = "--";
               if(k.dom.knob) new ResizeObserver(()=>updateStateFromTotalAngle(k.id)).observe(k.dom.knob);
           });
      
           arpSyncSwitch?.addEventListener('click', () => {
               isArpRateSynced = !isArpRateSynced; arpSyncSwitch.classList.toggle('on', isArpRateSynced);
               if(isArpRateSynced && knobState[0]?.isArpOn && knobState[1]?.isArpOn) {
                   knobState[1].arpRateMs = knobState[0].arpRateMs;
                   const k1d = fxKnobData[16]; const k2d = fxKnobData[17];
                   if (k1d && k2d) { k2d.value = k1d.value; k2d.angle = k1d.angle; if (k2d.indicator) k2d.indicator.style.transform = `rotate(${k1d.angle}deg)`; }
               } else if (!isArpRateSynced && knobState[1]) { const k2d = fxKnobData[17]; if(k2d) knobState[1].arpRateMs = 50 + Math.pow(1 - d.value, 3) * 1950; }
           });
      
           arpOrderSelector?.addEventListener('change', (e) => {
               currentArpOrder = e.target.value;
               knobState.forEach(s => { s.currentArpNoteIndex = (currentArpOrder === "Down" && s.arpNotes.length > 0) ? s.arpNotes.length - 1 : 0; s.arpUpDownState = 0; });
           });
      
           updateGlobalArpVisibility();
           randomizeSettings();
       }
      document.addEventListener('visibilitychange', () => {
           if (!isPowerOn || !audioContext) return; // Do nothing if the synth is off

           if (document.visibilityState === 'visible') {
               // When the app becomes visible again, check if the audio was suspended
               if (audioContext.state === 'suspended') {
                   audioContext.resume().then(() => {
                       console.log('AudioContext resumed successfully.');
                   });
               }
           }
       });
       init();







