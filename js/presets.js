export const PRESETS = {
    "SOUNDS": {
            '-INIT-': {
            tempoMode: "BPM",
            key: "C",
            scale: "Chromatic",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 0 },
                { id: 1, totalAngle: 0 }
            ],
            fxSettings: [
                { id: 0, value: 0 },        // GLIDE
                { id: 1, value: 0 },        // DISTORTION
                { id: 2, value: 1 },        // MASTER FILTER (Open)
                { id: 3, value: 0 },        // OSC3 MIX
                { id: 4, value: 0 },        // DETUNE
                { id: 5, value: 0 },        // TREMOLO
                { id: 6, value: 0 },        // CHORUS
                { id: 7, value: 0.7 },      // MASTER VOLUME
                { id: 8, value: 0.001 },    // ATTACK (Fast)
                { id: 9, value: 1 },        // DECAY
                { id: 10, value: 1 },       // SUSTAIN (Full)
                { id: 11, value: 0.1 },     // RELEASE (Short)
                { id: 12, value: 0 },       // REVERB
                { id: 13, value: 0 },       // RVB TIME
                { id: 14, value: 0 },       // DELAY
                { id: 15, value: 0 },       // DLY TIME
                { id: 16, value: 0.5 },     // RATE 1
                { id: 17, value: 0.5 },     // RATE 2
                { id: 18, value: 0 },       // OCTS 1
                { id: 19, value: 0 },       // OCTS 2
                { id: 20, value: 1 },       // OSC 1 FILTER (Open)
                { id: 21, value: 1 },       // OSC 2 FILTER (Open)
                { id: 22, value: 0 },       // FEEL 1
                { id: 23, value: 0 },       // FEEL 2
                { id: 24, value: 0.5 },     // TRANSPOSE 1
                { id: 25, value: 0.5 },     // TRANSPOSE 2
                { id: 26, value: 0.5 },     // OSC 1 VOL
                { id: 27, value: 0.5 },     // OSC 2 VOL
                { id: 28, value: 0 },       // OSC 1 RES
                { id: 29, value: 0 },       // OSC 2 RES
                // Reset LFO Knobs
                { id: 100, value: 0 }, { id: 101, value: 0 }, { id: 102, value: 0 }, { id: 103, value: 0 },
                { id: 104, value: 0 }, { id: 105, value: 0 }, { id: 106, value: 0 }, { id: 107, value: 0 },
                { id: 108, value: 0 }, { id: 109, value: 0 }, { id: 110, value: 0 }, { id: 111, value: 0 },
                { id: 112, value: 0 }, { id: 113, value: 0 }, { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'KOTO': {
            tempoMode: "BPM",
            key: "E",
            scale: "Minor Pentatonic",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1182.44 },
                { id: 1, totalAngle: 1095.51 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0.05 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0.05 }, { id: 5, value: 0 }, { id: 6, value: 0 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.01 }, { id: 9, value: 0.3 }, { id: 10, value: 0 }, { id: 11, value: 0.4 },
                { id: 12, value: 0.2 }, { id: 13, value: 0.4 }, { id: 14, value: 0.5 }, { id: 15, value: 0.15 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.45 }, { id: 21, value: 0.55 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.6 }, { id: 27, value: 0.6 },
                { id: 28, value: 0.75 }, { id: 29, value: 0.65 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'BELL': {
            tempoMode: "BPM",
            key: "C",
            scale: "Whole Tone",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 2052 },
                { id: 1, totalAngle: 2136 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 0.9 }, { id: 3, value: 0 },
                { id: 4, value: 0.05 }, { id: 5, value: 0.85 }, { id: 6, value: 0 }, { id: 7, value: 0.6 },
                { id: 8, value: 0.05 }, { id: 9, value: 0.25 }, { id: 10, value: 0.4 }, { id: 11, value: 0.35 },
                { id: 12, value: 0.3 }, { id: 13, value: 0.7 }, { id: 14, value: 0.15 }, { id: 15, value: 0.3 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.8 }, { id: 21, value: 0.8 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.15 }, { id: 29, value: 0.15 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'MUTED HORN': {
            tempoMode: "BPM",
            key: "D",
            scale: "Dorian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0.4111 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 996 },
                { id: 1, totalAngle: 1116 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0.0463 }, { id: 2, value: 0.4666 }, { id: 3, value: 0.4112 },
                { id: 4, value: 0.3340 }, { id: 5, value: 0.2648 }, { id: 6, value: 0.6959 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.1312 }, { id: 9, value: 0.3343 }, { id: 10, value: 0 }, { id: 11, value: 0.2472 },
                { id: 12, value: 0.3025 }, { id: 13, value: 0.4756 }, { id: 14, value: 0 }, { id: 15, value: 0.1230 },
                { id: 16, value: 0.8085 }, { id: 17, value: 0.8299 }, { id: 18, value: 0.3731 }, { id: 19, value: 0.0117 },
                { id: 20, value: 0.2573 }, { id: 21, value: 0.3258 }, { id: 22, value: 0.5146 }, { id: 23, value: 0.9596 },
                { id: 24, value: 0.5055 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.8131 }, { id: 29, value: 0.8286 }, { id: 100, value: 0 }, { id: 101, value: 0 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0.5055 }, { id: 105, value: 0 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0.4111 }, { id: 111, value: 0 }, { id: 112, value: 0 }, { id: 113, value: 0 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up/Down",
                arp1: { isOn: true, isArpOn: false, isSweepMode: true, octaves: 1, feelValue: 0.5146, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0.9596, notes: [], transpose: 0 }
            }
        },
        'PADS 2': {
            tempoMode: "BPM",
            key: "A#",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.2577, depth: 0.25, wave: 0, dest: 20, destChain: [20], tempoSync: false, storedFreeValue: 0.2577 },
                { rate: 0.2388, depth: 0.2333, wave: 0, dest: 21, destChain: [21], tempoSync: false, storedFreeValue: 0.2388 },
                { rate: 0.2833, depth: 0.0833, wave: 0, dest: 5, destChain: [5], tempoSync: false, storedFreeValue: 0.2833 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 2004.70 },
                { id: 1, totalAngle: 1720.81 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 0.6 }, { id: 3, value: 0.6055 },
                { id: 4, value: 0.45 }, { id: 5, value: 0.4222 }, { id: 6, value: 0.8666 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.6 }, { id: 9, value: 0.5 }, { id: 10, value: 0.9 }, { id: 11, value: 0.8 },
                { id: 12, value: 0.85 }, { id: 13, value: 0.9 }, { id: 14, value: 0.4 }, { id: 15, value: 0.6 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.2444 }, { id: 21, value: 0.3222 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.1 }, { id: 29, value: 0.1 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0.2333 }, { id: 104, value: 0.0833 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0.25 }, { id: 107, value: 0 }, { id: 108, value: 0.2577 }, { id: 109, value: 0.2388 },
                { id: 110, value: 0.2833 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        '808 KICK': {
            tempoMode: "BPM",
            key: "F#",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 744 },
                { id: 1, totalAngle: 1704 }
            ],
            fxSettings: [
                { id: 0, value: 0.35 }, { id: 1, value: 0.25 }, { id: 2, value: 0.35 }, { id: 3, value: 1 },
                { id: 4, value: 0 }, { id: 5, value: 0 }, { id: 6, value: 0 }, { id: 7, value: 0.8 },
                { id: 8, value: 0 }, { id: 9, value: 0.3077 }, { id: 10, value: 0 }, { id: 11, value: 1 },
                { id: 12, value: 0 }, { id: 13, value: 0 }, { id: 14, value: 0 }, { id: 15, value: 0 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.4666 }, { id: 21, value: 0.55 }, { id: 22, value: 0.2333 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.8333 }, { id: 27, value: 0.9388 },
                { id: 28, value: 0 }, { id: 29, value: 0 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0.2333, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'KEYS 1': {
            tempoMode: "BPM",
            key: "F",
            scale: "Lydian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1788 },
                { id: 1, totalAngle: 2034 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 0.9833 }, { id: 3, value: 0.18 },
                { id: 4, value: 0.7222 }, { id: 5, value: 0 }, { id: 6, value: 0.7055 }, { id: 7, value: 0.8888 },
                { id: 8, value: 0.005 }, { id: 9, value: 0.4666 }, { id: 10, value: 0 }, { id: 11, value: 0.2722 },
                { id: 12, value: 0.3777 }, { id: 13, value: 0.55 }, { id: 14, value: 0.08 }, { id: 15, value: 0.25 },
                { id: 16, value: 0.2506 }, { id: 17, value: 0.2506 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.3366 }, { id: 21, value: 0.3333 }, { id: 22, value: 0.6777 }, { id: 23, value: 0.5722 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.9388 }, { id: 27, value: 0.9388 },
                { id: 28, value: 0.0033 }, { id: 29, value: 0.0611 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: true, isArpOn: false, isSweepMode: false, octaves: 0, feelValue: 0.6777, notes: [], transpose: 0 },
                arp2: { isOn: true, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0.5722, notes: [], transpose: 0 }
            }
        },
        'PAD 1': {
            tempoMode: "BPM",
            key: "C",
            scale: "Major",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.35, depth: 0.1611, wave: 0, dest: 20, destChain: [20], tempoSync: false, storedFreeValue: 0.35 },
                { rate: 0.3222, depth: 0.1666, wave: 0, dest: 21, destChain: [21], tempoSync: false, storedFreeValue: 0.3222 },
                { rate: 0.25, depth: 0.4388, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0.25 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 971.65 },
                { id: 1, totalAngle: 1619.27 }
            ],
            fxSettings: [
                { id: 0, value: 0.1 }, { id: 1, value: 0 }, { id: 2, value: 0.9 }, { id: 3, value: 0.2 },
                { id: 4, value: 0.6166 }, { id: 5, value: 0 }, { id: 6, value: 0.6777 }, { id: 7, value: 0.6 },
                { id: 8, value: 0.6 }, { id: 9, value: 0.5 }, { id: 10, value: 0.8 }, { id: 11, value: 0.7 },
                { id: 12, value: 0.7 }, { id: 13, value: 0.9 }, { id: 14, value: 0 }, { id: 15, value: 0 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.6 }, { id: 21, value: 0.65 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.1 }, { id: 29, value: 0.1 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0.1666 }, { id: 104, value: 0.4388 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0.1611 }, { id: 107, value: 0 }, { id: 108, value: 0.35 }, { id: 109, value: 0.3222 },
                { id: 110, value: 0.25 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'ROUND BASS': {
            tempoMode: "BPM",
            key: "F",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: 0, tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0, tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0, tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0, tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 929.12 },
                { id: 1, totalAngle: 1091.27 }
            ],
            fxSettings: [
                { id: 0, value: 0.1 }, { id: 1, value: 0 }, { id: 2, value: 0.8 }, { id: 3, value: 0.9333 },
                { id: 4, value: 0.2 }, { id: 5, value: 0 }, { id: 6, value: 0.2 }, { id: 7, value: 0.7111 },
                { id: 8, value: 0.01 }, { id: 9, value: 0.3611 }, { id: 10, value: 0.3611 }, { id: 11, value: 0.3 },
                { id: 12, value: 0.1 }, { id: 13, value: 0.2 }, { id: 14, value: 0 }, { id: 15, value: 0 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.1555 }, { id: 21, value: 0.1611 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.3444 }, { id: 29, value: 0.3666 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'HIGHLAND': {
            key: "F#",
            scale: "Minor Pentatonic",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0.5, depth: 0, wave: 0, dest: 0 },
                { rate: 0.5, depth: 0, wave: 0, dest: 0 },
                { rate: 0.5, depth: 0, wave: 0, dest: 0 },
                { rate: 0.5, depth: 0, wave: 0, dest: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1225.79 },
                { id: 1, totalAngle: 1649.30 }
            ],
            fxSettings: [
                { id: 0, value: 0.1166 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0.1363 },
                { id: 4, value: 0.7277 }, { id: 5, value: 0 }, { id: 6, value: 0.3111 }, { id: 7, value: 0.6333 },
                { id: 8, value: 0.8989 }, { id: 9, value: 0.5444 }, { id: 10, value: 1 }, { id: 11, value: 1 },
                { id: 12, value: 1 }, { id: 13, value: 0.1082 }, { id: 14, value: 0.0136 }, { id: 15, value: 0.8568 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.4722 }, { id: 21, value: 0.5333 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.6888 }, { id: 27, value: 0.6277 },
                { id: 28, value: 0.1611 }, { id: 29, value: 0.1777 }, { id: 100, value: 0.9100 }, { id: 101, value: 0.4327 },
                { id: 102, value: 0.2679 }, { id: 103, value: 0.9645 }, { id: 104, value: 0.1725 }, { id: 105, value: 0.6189 },
                { id: 106, value: 0.7398 }, { id: 107, value: 0.5588 }, { id: 108, value: 0.9567 }, { id: 109, value: 0.1089 },
                { id: 110, value: 0.2184 }, { id: 111, value: 0.8604 }, { id: 112, value: 0.6482 }, { id: 113, value: 0.5272 },
                { id: 114, value: 0.1371 }, { id: 115, value: 0.7317 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
    },
        'KEYS 2': {
            tempoMode: "BPM",
            key: "F#",
            scale: "Dorian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 680.65 },
                { id: 1, totalAngle: 1276.71 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0.1 }, { id: 5, value: 0.1055 }, { id: 6, value: 0 }, { id: 7, value: 0.8111 },
                { id: 8, value: 0 }, { id: 9, value: 1 }, { id: 10, value: 0 }, { id: 11, value: 1 },
                { id: 12, value: 0.3 }, { id: 13, value: 0.4 }, { id: 14, value: 0 }, { id: 15, value: 0 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.4 }, { id: 21, value: 0.4 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0 }, { id: 29, value: 0 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'STROLLER': {
            tempoMode: "BPM",
            key: "F#",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1268.65 },
                { id: 1, totalAngle: 1756.71 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0.0709 }, { id: 2, value: 0.8772 }, { id: 3, value: 0.5272 },
                { id: 4, value: 0.5923 }, { id: 5, value: 0.273 }, { id: 6, value: 0.5549 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.3356 }, { id: 9, value: 0.7688 }, { id: 10, value: 0.1776 }, { id: 11, value: 0.2265 },
                { id: 12, value: 0.1725 }, { id: 13, value: 0.1865 }, { id: 14, value: 0.5942 }, { id: 15, value: 0.0173 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.2184 }, { id: 21, value: 0.2179 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.8459 }, { id: 29, value: 0.6228 }, { id: 100, value: 0 }, { id: 101, value: 0 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0 }, { id: 113, value: 0 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'STRINGS': {
            tempoMode: "BPM",
            key: "B",
            scale: "Phrygian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 428.65 },
                { id: 1, totalAngle: 1048.71 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0 }, { id: 5, value: 0 }, { id: 6, value: 0 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.7 }, { id: 9, value: 0 }, { id: 10, value: 1 }, { id: 11, value: 0.95 },
                { id: 12, value: 0.9 }, { id: 13, value: 0.9 }, { id: 14, value: 0.6 }, { id: 15, value: 0.7 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 1 }, { id: 21, value: 1 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0 }, { id: 29, value: 0 }, { id: 100, value: 0 }, { id: 101, value: 0 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0 }, { id: 113, value: 0 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'STRINGS 2': {
            tempoMode: "BPM",
            key: "C",
            scale: "Lydian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1016.65 },
                { id: 1, totalAngle: 1264.71 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0.1555 },
                { id: 4, value: 0.2222 }, { id: 5, value: 0 }, { id: 6, value: 0.1666 }, { id: 7, value: 0.7 },
                { id: 8, value: 1 }, { id: 9, value: 0 }, { id: 10, value: 1 }, { id: 11, value: 0.8 },
                { id: 12, value: 0.9 }, { id: 13, value: 0.9 }, { id: 14, value: 0 }, { id: 15, value: 0 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.7055 }, { id: 21, value: 0.7166 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0 }, { id: 29, value: 0 }, { id: 100, value: 0 }, { id: 101, value: 0 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0 }, { id: 113, value: 0 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'EVOLVING PAD': {
            tempoMode: "BPM",
            key: "A",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.15, depth: 0.4, wave: 0, dest: 20, destChain: [20, 21], tempoSync: false, storedFreeValue: 0.15 },
                { rate: 0.22, depth: 0.35, wave: 1, dest: 6, destChain: [6], tempoSync: false, storedFreeValue: 0.22 },
                { rate: 0.08, depth: 0.5, wave: 0, dest: 108, destChain: [108], tempoSync: false, storedFreeValue: 0.08 },
                { rate: 0.18, depth: 0.3, wave: 0, dest: 109, destChain: [109], tempoSync: false, storedFreeValue: 0.18 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1440 },
                { id: 1, totalAngle: 1800 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0.4 },
                { id: 4, value: 0.25 }, { id: 5, value: 0 }, { id: 6, value: 0.5 }, { id: 7, value: 0.65 },
                { id: 8, value: 0.7 }, { id: 9, value: 0.15 }, { id: 10, value: 0.85 }, { id: 11, value: 0.8 },
                { id: 12, value: 0.75 }, { id: 13, value: 0.85 }, { id: 14, value: 0.3 }, { id: 15, value: 0.6 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.65 }, { id: 21, value: 0.68 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.08 }, { id: 29, value: 0.08 }, { id: 100, value: 0.3 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0.35 }, { id: 104, value: 0.5 }, { id: 105, value: 0.25 },
                { id: 106, value: 0.4 }, { id: 107, value: 0 }, { id: 108, value: 0.15 }, { id: 109, value: 0.22 },
                { id: 110, value: 0.08 }, { id: 111, value: 0.18 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'SPACEY LEAD': {
            tempoMode: "BPM",
            key: "E",
            scale: "Minor",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.2777, depth: 0.1666, wave: 0, dest: 20, destChain: [20], tempoSync: false, storedFreeValue: 0.2777 },
                { rate: 0.18, depth: 0.1833, wave: 1, dest: 21, destChain: [21], tempoSync: false, storedFreeValue: 0.18 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1272 },
                { id: 1, totalAngle: 1752 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0.2611 },
                { id: 4, value: 0.6555 }, { id: 5, value: 0 }, { id: 6, value: 0.5 }, { id: 7, value: 0.6944 },
                { id: 8, value: 0.08 }, { id: 9, value: 0.2 }, { id: 10, value: 0.7 }, { id: 11, value: 0.5 },
                { id: 12, value: 0.4 }, { id: 13, value: 0.65 }, { id: 14, value: 0.7 }, { id: 15, value: 0.55 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.7666 }, { id: 21, value: 0.62 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.3 }, { id: 29, value: 0.3 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0.1833 }, { id: 104, value: 0 }, { id: 105, value: 0.25 },
                { id: 106, value: 0.1666 }, { id: 107, value: 0 }, { id: 108, value: 0.2777 }, { id: 109, value: 0.18 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'CRUSH': {
            tempoMode: "BPM",
            key: "G",
            scale: "Major Pentatonic",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 888 },
                { id: 1, totalAngle: 1332 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0.5944 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0 }, { id: 5, value: 0 }, { id: 6, value: 0 }, { id: 7, value: 0.6 },
                { id: 8, value: 0 }, { id: 9, value: 0.8722 }, { id: 10, value: 0.0222 }, { id: 11, value: 0.5777 },
                { id: 12, value: 0 }, { id: 13, value: 0 }, { id: 14, value: 0.2 }, { id: 15, value: 0.2 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 1 }, { id: 21, value: 1 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0 }, { id: 29, value: 0 }, { id: 100, value: 0 }, { id: 101, value: 0 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0 }, { id: 113, value: 0 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'PROFX': {
            tempoMode: "MS",
            key: "C",
            scale: "Whole Tone",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.4, depth: 0.8, wave: 5, dest: 300, destChain: [300], tempoSync: false, storedFreeValue: 0.4 },
                { rate: 0.3, depth: 0.6, wave: 5, dest: 301, destChain: [301], tempoSync: false, storedFreeValue: 0.3 },
                { rate: 0.1, depth: 0.3, wave: 0, dest: 6, destChain: [6], tempoSync: false, storedFreeValue: 0.1 },
                { rate: 0.6333, depth: 0.4, wave: 2, dest: 1, destChain: [1, 3], tempoSync: false, storedFreeValue: 0.6333 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 1236 },
                { id: 1, totalAngle: 1560 }
            ],
            fxSettings: [
                { id: 0, value: 0.5 }, { id: 1, value: 0.3 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0.8 }, { id: 5, value: 0 }, { id: 6, value: 0.5 }, { id: 7, value: 0.6 },
                { id: 8, value: 0.2 }, { id: 9, value: 0.5 }, { id: 10, value: 0.8 }, { id: 11, value: 0.8 },
                { id: 12, value: 0.7 }, { id: 13, value: 0.9 }, { id: 14, value: 0.8 }, { id: 15, value: 0.3 },
                { id: 16, value: 0.5871 }, { id: 17, value: 0.5871 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.8 }, { id: 21, value: 0.8 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.4 }, { id: 29, value: 0.4 }, { id: 100, value: 0.4 }, { id: 101, value: 0.9166 },
                { id: 102, value: 0 }, { id: 103, value: 0.6 }, { id: 104, value: 0.3 }, { id: 105, value: 0.9166 },
                { id: 106, value: 0.8 }, { id: 107, value: 0 }, { id: 108, value: 0.4 }, { id: 109, value: 0.3 },
                { id: 110, value: 0.1 }, { id: 111, value: 0.6333 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.4166 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'SPOOKY PAD': {
            tempoMode: "BPM",
            key: "E",
            scale: "Lydian",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            lfoState: [
                { rate: 0.8111, depth: 0.6111, wave: 0, dest: 4, destChain: [4], tempoSync: false, storedFreeValue: 0.8111 },
                { rate: 0.2277, depth: 0.25, wave: 0, dest: 5, destChain: [5], tempoSync: false, storedFreeValue: 0.2277 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 888 },
                { id: 1, totalAngle: 1236 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 1 }, { id: 3, value: 0 },
                { id: 4, value: 0.1 }, { id: 5, value: 0.3555 }, { id: 6, value: 0.5 }, { id: 7, value: 0.8555 },
                { id: 8, value: 0.05 }, { id: 9, value: 0.2611 }, { id: 10, value: 0.2166 }, { id: 11, value: 0.8 },
                { id: 12, value: 0.8 }, { id: 13, value: 0.8 }, { id: 14, value: 0.5 }, { id: 15, value: 0.2 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.8 }, { id: 21, value: 0.9 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.7277 }, { id: 27, value: 0.6777 },
                { id: 28, value: 0.9 }, { id: 29, value: 0.85 }, { id: 100, value: 0 }, { id: 101, value: 0.15 },
                { id: 102, value: 0 }, { id: 103, value: 0.25 }, { id: 104, value: 0 }, { id: 105, value: 0.05 },
                { id: 106, value: 0.6111 }, { id: 107, value: 0 }, { id: 108, value: 0.8111 }, { id: 109, value: 0.2277 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Up",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'KALIMBA': {
            tempoMode: "BPM",
            key: "C",
            scale: "Major Pentatonic",
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 },
                { rate: 0, depth: 0, wave: 0, dest: -1, destChain: [], tempoSync: false, storedFreeValue: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 2184 },
                { id: 1, totalAngle: 1896 }
            ],
            fxSettings: [
                { id: 0, value: 0 }, { id: 1, value: 0 }, { id: 2, value: 0.85 }, { id: 3, value: 0.15 },
                { id: 4, value: 0.01 }, { id: 5, value: 0 }, { id: 6, value: 0 }, { id: 7, value: 0.7 },
                { id: 8, value: 0.002 }, { id: 9, value: 0.5 }, { id: 10, value: 0 }, { id: 11, value: 0.7 },
                { id: 12, value: 0.6 }, { id: 13, value: 0.7 }, { id: 14, value: 0.2 }, { id: 15, value: 0.45 },
                { id: 16, value: 0.4344 }, { id: 17, value: 0.4344 }, { id: 18, value: 0 }, { id: 19, value: 0 },
                { id: 20, value: 0.75 }, { id: 21, value: 0.78 }, { id: 22, value: 0 }, { id: 23, value: 0 },
                { id: 24, value: 0.5 }, { id: 25, value: 0.5 }, { id: 26, value: 0.5 }, { id: 27, value: 0.5 },
                { id: 28, value: 0.25 }, { id: 29, value: 0.25 }, { id: 100, value: 0 }, { id: 101, value: 0.0833 },
                { id: 102, value: 0 }, { id: 103, value: 0 }, { id: 104, value: 0 }, { id: 105, value: 0.0833 },
                { id: 106, value: 0 }, { id: 107, value: 0 }, { id: 108, value: 0 }, { id: 109, value: 0 },
                { id: 110, value: 0 }, { id: 111, value: 0 }, { id: 112, value: 0.0833 }, { id: 113, value: 0.0833 },
                { id: 114, value: 0 }, { id: 115, value: 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 },
                arp2: { isOn: false, isArpOn: false, isSweepMode: true, octaves: 0, feelValue: 0, notes: [], transpose: 0 }
            }
        },
        'RANDOM SOUND': { tempoMode: 'BPM' }
    },
    "ARP PATCHES": {
        'PUCE': { // A slow, evolving, atmospheric pad with two complex, polyrhythmic arpeggios.
            tempoMode: 'BPM',
            key: 'C',
            scale: 'Major',
            fxSettings: [
                { id: 0, value: 0 },         // GLIDE
                { id: 1, value: 0 },         // DISTORTION
                { id: 2, value: 1 },         // MASTER FILTER
                { id: 3, value: 0.3222 },    // OSC3 MIX
                { id: 4, value: 0.3 },       // DETUNE
                { id: 5, value: 0 },         // TREMOLO
                { id: 6, value: 0.7 },       // CHORUS
                { id: 7, value: 0.7 },       // MASTER VOLUME
                { id: 8, value: 0.8 },       // ATTACK
                { id: 9, value: 0 },         // DECAY
                { id: 10, value: 0.9 },      // SUSTAIN
                { id: 11, value: 0.9 },      // RELEASE
                { id: 12, value: 0.8 },      // REVERB
                { id: 13, value: 0.9 },      // RVB TIME
                { id: 14, value: 0.2277 },   // DELAY
                { id: 15, value: 0.6037 },   // DLY TIME
                { id: 20, value: 0.3388 },   // OSC 1 FILTER
                { id: 21, value: 0.2870 },   // OSC 2 FILTER
                { id: 26, value: 0.5 },      // OSC 1 VOLUME
                { id: 27, value: 0.5 },      // OSC 2 VOLUME
                { id: 28, value: 0.1833 },   // OSC 1 RES
                { id: 29, value: 0.2814 }    // OSC 2 RES
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: 'As Played',
                arp1: {
                    isArpOn: true,
                    notes: [60, 67, 69, 71, 71, 71, 72, 72, 72, 72, 72, 74, 74, 76, 76, 76, 77, 77, 77, 77, 79, 79]
                },
                arp2: {
                    isArpOn: true,
                    notes: [64, 71, 76, 65, 71, 81, 79]
                },
                fx: { // Settings for the dedicated ARP knobs
                    16: 0.0512,                 // Arp 1 RATE
                    17: 0.0299,                   // Arp 2 RATE
                    18: 0,                   // Arp 1 OCTS
                    19: 0,                   // Arp 2 OCTS
                    22: 0.7,                 // Arp 1 FEEL
                    23: 0.2259,              // Arp 2 FEEL
                    24: 0.5,                 // Arp 1 TRANSPOSE (0)
                    25: 0                    // Arp 2 TRANSPOSE (-12)
                }
            }
        },
        'APEIRON': {
            tempoMode: 'BPM',
            key: "D#",
            scale: "Minor",
            isLfoMode: true,
            lfoState: [
                { "rate": 0.3944, "depth": 0.3611, "wave": 0, "dest": 24 },
                { "rate": 0.3111, "depth": 0.35, "wave": 0, "dest": 25 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1 }
            ],
            knobSettings: [
                { "id": 0, "totalAngle": 1281.70 },
                { "id": 1, "totalAngle": 1750.84 }
            ],
            fxSettings: [
                { "id": 0, "value": 0 },
                { "id": 1, "value": 0.0680 },
                { "id": 2, "value": 0.7809 },
                { "id": 3, "value": 0.5894 },
                { "id": 4, "value": 0.4141 },
                { "id": 5, "value": 0 },
                { "id": 6, "value": 0.5012 },
                { "id": 7, "value": 0.7 },
                { "id": 8, "value": 0.0671 },
                { "id": 9, "value": 0.2686 },
                { "id": 10, "value": 0.4277 },
                { "id": 11, "value": 0.1666 },
                { "id": 12, "value": 0.5833 },
                { "id": 13, "value": 0.5758 },
                { "id": 14, "value": 0.1111 },
                { "id": 15, "value": 0 },
                { "id": 20, "value": 0.4213 },
                { "id": 21, "value": 0.4666 },
                { "id": 26, "value": 0.5 },
                { "id": 27, "value": 0.4277 },
                { "id": 28, "value": 0.2334 },
                { "id": 29, "value": 0.5369 }
            ],
            arpSettings: {
                isArpRateSynced: true,
                currentArpOrder: "Random",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    notes: [ 77, 61, 85, 85 ]
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    notes: [ 51, 51 ]
                },
                fx: { // Settings for the ARP-specific knobs
                    16: 0.3733,
                    17: 0.3733,
                    18: 0.4246,
                    19: 0.6904,
                    22: 0.7333,
                    23: 0.7574,
                    24: 0.5,
                    25: 0.5
                }
            }
        },
        'FURNACE 2': {
            tempoMode: "BPM",
            key: "F#",
            scale: "Minor",
            allowDuplicateNotesMode: false,
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 1116.38 },
                { "id": 1, "totalAngle": 1471.51 }
            ],
            lfoState: [
                { "rate": 0.9328, "depth": 0.1833, "wave": 5, "dest": 300, "tempoSync": true, "storedFreeValue": 0.3833 },
                { "rate": 0.7070, "depth": 0.1444, "wave": 1, "dest": 9, "tempoSync": true, "storedFreeValue": 0.5222 },
                { "rate": 0.2999, "depth": 0.3888, "wave": 5, "dest": 15, "tempoSync": false, "storedFreeValue": 0.2999 },
                { "rate": 1, "depth": 0.6111, "wave": 5, "dest": 301, "tempoSync": true, "storedFreeValue": 0.8888 }
            ],
            fxSettings: [
                { "id": 0, "value": 0 },
                { "id": 1, "value": 0 },
                { "id": 2, "value": 1 },
                { "id": 3, "value": 0 },
                { "id": 4, "value": 0.1 },
                { "id": 5, "value": 0 },
                { "id": 6, "value": 0 },
                { "id": 7, "value": 0.7 },
                { "id": 8, "value": 0 },
                { "id": 9, "value": 0.2166 },
                { "id": 10, "value": 0 },
                { "id": 11, "value": 0.6722 },
                { "id": 12, "value": 0.1888 },
                { "id": 13, "value": 0.6666 },
                { "id": 14, "value": 0.1499 },
                { "id": 15, "value": 0.4166 },
                { "id": 20, "value": 0.2833 },
                { "id": 21, "value": 0.3055 },
                { "id": 26, "value": 0.5833 },
                { "id": 27, "value": 0.6055 },
                { "id": 28, "value": 0.2944 },
                { "id": 29, "value": 0.1944 }
            ],
            arpSettings: {
                isArpRateSynced: true,
                currentArpOrder: "As Played",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: false,
                    notes: [ 56 ]
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: false,
                    notes: [ 45 ]
                },
                fx: {
                    16: 0.4377,
                    17: 0.4377,
                    18: 0,
                    19: 0,
                    22: 0,
                    23: 0,
                    24: 0.5,
                    25: 0.4888
                }
            }
        },
        'BULLS': {
            tempoMode: 'BPM',
            key: "D",
            scale: "Major",
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 1116.38 },
                { "id": 1, "totalAngle": 283.51 }
            ],
            lfoState: [
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1, "tempoSync": false, "storedFreeValue": 0 },
                { "rate": 0.4833, "depth": 0.1166, "wave": 1, "dest": 6, "tempoSync": false, "storedFreeValue": 0.4833 },
                { "rate": 0.4666, "depth": 0.1166, "wave": 0, "dest": 20, "tempoSync": false, "storedFreeValue": 0.4666 },
                { "rate": 0.5111, "depth": 0.2, "wave": 0, "dest": 21, "tempoSync": false, "storedFreeValue": 0.5111 }
            ],
            fxSettings: [
                { "id": 0, "value": 0 },
                { "id": 1, "value": 0 },
                { "id": 2, "value": 1 },
                { "id": 3, "value": 0.2138 },
                { "id": 4, "value": 0.3962 },
                { "id": 5, "value": 0 },
                { "id": 6, "value": 0.2 },
                { "id": 7, "value": 0.5722 },
                { "id": 8, "value": 0.0656 },
                { "id": 9, "value": 0.2833 },
                { "id": 10, "value": 0 },
                { "id": 11, "value": 0.1 },
                { "id": 12, "value": 0.2222 },
                { "id": 13, "value": 0.7325 },
                { "id": 14, "value": 0.6233 },
                { "id": 15, "value": 0.0781 },
                { "id": 20, "value": 0.4665 },
                { "id": 21, "value": 0.3611 },
                { "id": 26, "value": 0.5 },
                { "id": 27, "value": 0.7055 },
                { "id": 28, "value": 0.5999 },
                { "id": 29, "value": 0.2722 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: true,
                    notes: [ 64, 66, 71, 59, 64, 66, 69, 59 ]
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: false,
                    notes: [ 23 ]
                },
                fx: {
                    16: 0.3248,
                    17: 1,
                    18: 0,
                    19: 0,
                    22: 0,
                    23: 0,
                    24: 0.5055,
                    25: 0.5110
                }
            }
        },
        'HMMM': {
            tempoMode: "MS",
            key: "G",
            scale: "Major Pentatonic",
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 2039.20 },
                { "id": 1, "totalAngle": 1536.06 }
            ],
            lfoState: [
                { "rate": 0.2166, "depth": 0.55, "wave": 3, "dest": 16, "tempoSync": false, "storedFreeValue": 0.2166 },
                { "rate": 0.3333, "depth": 0.1611, "wave": 0, "dest": 20, "tempoSync": false, "storedFreeValue": 0.3333 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1, "tempoSync": false, "storedFreeValue": 0 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1, "tempoSync": false, "storedFreeValue": 0 }
            ],
            fxSettings: [
                { "id": 0, "value": 0 },
                { "id": 1, "value": 0 },
                { "id": 2, "value": 1 },
                { "id": 3, "value": 0.4025 },
                { "id": 4, "value": 0.8105 },
                { "id": 5, "value": 0 },
                { "id": 6, "value": 0.7683 },
                { "id": 7, "value": 0.5611 },
                { "id": 8, "value": 0 },
                { "id": 9, "value": 0.0555 },
                { "id": 10, "value": 0 },
                { "id": 11, "value": 0 },
                { "id": 12, "value": 0.0722 },
                { "id": 13, "value": 0.5082 },
                { "id": 14, "value": 0.3362 },
                { "id": 15, "value": 0.1785 },
                { "id": 20, "value": 0.4 },
                { "id": 21, "value": 1 },
                { "id": 26, "value": 0.5 },
                { "id": 27, "value": 0.5 },
                { "id": 28, "value": 0.6888 },
                { "id": 29, "value": 0 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: false,
                    notes: [ 86 ]
                },
                arp2: {
                    isArpOn: false,
                    isOn: false,
                    notes: []
                },
                fx: {
                    16: 0.9488,
                    17: 0.5871,
                    18: 0,
                    19: 0,
                    22: 0,
                    23: 0,
                    24: 0.5,
                    25: 0.5
                }
            }
        },
        'XENOM': { // A chaotic, sci-fi preset with a tense, high arp over a massive, repetitive low-end sequence.
            tempoMode: 'BPM',
            key: 'C#',
            scale: 'Phrygian',
            fxSettings: [
                { id: 0, value: 0.4388 },    // GLIDE
                { id: 1, value: 0 },         // DISTORTION
                { id: 2, value: 1 },         // MASTER FILTER
                { id: 3, value: 0.7388 },    // OSC3 MIX
                { id: 4, value: 0.3377 },    // DETUNE
                { id: 5, value: 0 },         // TREMOLO
                { id: 6, value: 0.9009 },    // CHORUS
                { id: 7, value: 0.4944 },    // MASTER VOLUME
                { id: 8, value: 0.0433 },    // ATTACK
                { id: 9, value: 0.1606 },    // DECAY
                { id: 10, value: 0.2 },      // SUSTAIN
                { id: 11, value: 0.2 },      // RELEASE
                { id: 12, value: 0.1187 },   // REVERB
                { id: 13, value: 0.8094 },   // RVB TIME
                { id: 14, value: 0.2712 },   // DELAY
                { id: 15, value: 0.1185 },   // DLY TIME
                { id: 20, value: 0.5722 },   // OSC 1 FILTER
                { id: 21, value: 0.4944 },   // OSC 2 FILTER
                { id: 26, value: 0.5166 },   // OSC 1 VOLUME
                { id: 27, value: 0.5222 },   // OSC 2 VOLUME
                { id: 28, value: 0.3166 },   // OSC 1 RES
                { id: 29, value: 0.5055 }    // OSC 2 RES
            ],
            arpSettings: {
                isArpRateSynced: true,
                currentArpOrder: 'As Played',
                arp1: {
                    isArpOn: true,
                    notes: [83, 85, 78, 83, 83, 81, 90, 86]
                },
                arp2: {
                    isArpOn: true,
                    notes: [66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 62, 62, 62]
                },
                fx: { // Settings for the dedicated ARP knobs
                    16: 0.3733,              // Arp 1 RATE
                    17: 0.3733,              // Arp 2 RATE (Synced)
                    18: 0.1444,              // Arp 1 OCTS
                    19: 0,                   // Arp 2 OCTS
                    22: 0,                   // Arp 1 FEEL
                    23: 0,                   // Arp 2 FEEL
                    24: 0.6811,              // Arp 1 TRANSPOSE (+4)
                    25: 0.2166               // Arp 2 TRANSPOSE (-7)
                }
            }
        },
        'CELADON': { // A lush, evolving, atmospheric pad sound.
            tempoMode: 'BPM',
            key: 'C',
            scale: 'Major',
            fxSettings: [
                { id: 8, value: 0.8 },    // ATTACK: Very slow, for a gentle swell.
                { id: 11, value: 0.9 },   // RELEASE: Very long, notes fade out slowly.
                { id: 10, value: 0.9 },   // SUSTAIN: High level.
                { id: 4, value: 0.3 },    // DETUNE: Creates a thick, shimmering texture.
                { id: 6, value: 0.7 },    // CHORUS: Makes the sound very wide.
                { id: 12, value: 0.8 },   // REVERB: Lots of reverb for a sense of space.
                { id: 13, value: 0.9 },   // RVB TIME: The reverb tail is very long.
                { id: 20, value: 0.7 },   // OSC 1 FILTER: Softened high end.
                { id: 21, value: 0.75 }   // OSC 2 FILTER: Softened high end, slightly different from OSC 1.
            ],
            arpSettings: {
                isArpRateSynced: false,   // Arp rates are independent.
                arp1: { isArpOn: true, notes: [60, 67] }, // Arp 1 plays C4 and G4.
                arp2: { isArpOn: true, notes: [64, 71], transpose: 12 }, // Arp 2 plays E4 and B4, but transposed up 1 octave.
                fx: {
                    16: 0.0512,              // Arp 1 RATE: Extremely slow.
                    17: 0.0639,             // Arp 2 RATE: Also extremely slow, but different from Arp 1.
                    22: 0.7,              // Arp 1 FEEL: A more complex rhythmic pattern.
                    23: 0.8               // Arp 2 FEEL: A different complex pattern, creating polyrhythm.
                }
            }
        },
        '2 NOTES': {
            tempoMode: 'BPM',
            key: "G#",
            scale: "Minor",
            allowDuplicateNotesMode: true,
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 2004.40 },
                { "id": 1, "totalAngle": 1440 }
            ],
            lfoState: [
                { "rate": 0.5, "depth": 0.3388, "wave": 5, "dest": 15 },
                { "rate": 0.1055, "depth": 0.2333, "wave": 5, "dest": 25 },
                { "rate": 0.5388, "depth": 0.4611, "wave": 3, "dest": 9 },
                { "rate": 0.7055, "depth": 0.3055, "wave": 5, "dest": 24 }
            ],
            fxSettings: [
                { "id": 0, "value": 0 },
                { "id": 1, "value": 0.0611 },
                { "id": 2, "value": 0.7611 },
                { "id": 3, "value": 0.6801 },
                { "id": 4, "value": 0.7017 },
                { "id": 5, "value": 0.6833 },
                { "id": 6, "value": 0.8522 },
                { "id": 7, "value": 0.4444 },
                { "id": 8, "value": 0.0045 },
                { "id": 9, "value": 0 },
                { "id": 10, "value": 0 },
                { "id": 11, "value": 0.85 },
                { "id": 12, "value": 0.55 },
                { "id": 13, "value": 0.7198 },
                { "id": 14, "value": 1 },
                { "id": 15, "value": 0.3111 },
                { "id": 20, "value": 0.3166 },
                { "id": 21, "value": 0.3 },
                { "id": 26, "value": 0.5 },
                { "id": 27, "value": 0.3333 },
                { "id": 28, "value": 0.7722 },
                { "id": 29, "value": 0.5277 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "As Played",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: false,
                    notes: [ 83 ]
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: true,
                    notes: [ 71 ]
                },
                fx: {
                    16: 0.2918,
                    17: 0.9616,
                    18: 0,
                    19: 0,
                    22: 0,
                    23: 0,
                    24: 0.2888,
                    25: 0.5
                }
            }
        },
        'FULS': {
            tempoMode: 'BPM',
            key: 'F#',
            scale: 'Dorian',
            customScale: [],
            allowDuplicateNotesMode: false,
            isLfoMode: false,
            lfoState: [
                { rate: 0, depth: 0, wave: 0, dest: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0 },
                { rate: 0, depth: 0, wave: 0, dest: 0 }
            ],
            knobSettings: [
                { id: 0, totalAngle: 2142.22 },
                { id: 1, totalAngle: 2688.00 }
            ],
            fxSettings: [
                { id: 0, value: 0 },        // GLIDE
                { id: 1, value: 0 },        // DISTORTION
                { id: 2, value: 1 },        // MASTER FILTER
                { id: 3, value: 0 },        // OSC3 MIX
                { id: 4, value: 0.1 },      // DETUNE
                { id: 5, value: 0.6 },      // TREMOLO
                { id: 6, value: 0 },        // CHORUS
                { id: 7, value: 0.7 },      // MASTER VOLUME
                { id: 8, value: 0.08 },     // ATTACK (Increased from 0.02 to 0.08 to fix click)
                { id: 9, value: 0.6 },      // DECAY
                { id: 10, value: 0 },       // SUSTAIN (Set to 0 for pluck behavior)
                { id: 11, value: 0.5 },     // RELEASE
                { id: 12, value: 0.3 },     // REVERB
                { id: 13, value: 0.4 },     // RVB TIME
                { id: 14, value: 0 },       // DELAY
                { id: 15, value: 0 },       // DLY TIME
                { id: 20, value: 0.4 },     // OSC 1 FILTER
                { id: 21, value: 0.4 },     // OSC 2 FILTER
                { id: 26, value: 0.5 },     // OSC 1 VOLUME
                { id: 27, value: 0.5 },     // OSC 2 VOLUME
                { id: 28, value: 0 },       // OSC 1 RES
                { id: 29, value: 0 },       // OSC 2 RES
                // Dedicated ARP Knobs
                { id: 16, value: 0.1714 },     // Rate 1
                { id: 17, value: 0.5588 },    // Rate 2
                { id: 18, value: 0 },       // Octs 1
                { id: 19, value: 0 },       // Octs 2
                { id: 22, value: 0.6 },     // Feel 1
                { id: 23, value: 0 },       // Feel 2
                { id: 24, value: 0.5 },     // Transpose 1
                { id: 25, value: 0.5 }      // Transpose 2
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: 'As Played',
                arp1: {
                    isOn: true,
                    isArpOn: true,
                    isSweepMode: true,
                    octaves: 0,
                    feelValue: 0.6,
                    notes: [
                        { midi: 54, active: true },
                        { midi: 61, active: true },
                        { midi: 64, active: true },
                        { midi: 68, active: true }
                    ],
                    transpose: 0
                },
                arp2: {
                    isOn: false,
                    isArpOn: false,
                    isSweepMode: true,
                    octaves: 0,
                    feelValue: 0,
                    notes: [],
                    transpose: 0
                }
            }
        },
        'FORGE': {
            tempoMode: 'BPM',
            key: "D#",
            scale: "Mixolydian",
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 620.30 },
                { "id": 1, "totalAngle": 1834.18 }
            ],
            lfoState: [
                { "rate": 0.15, "depth": 0.65, "wave": 3, "dest": 109 },
                { "rate": 0.42, "depth": 0.55, "wave": 5, "dest": 16 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1 },
                { "rate": 0.73, "depth": 0.72, "wave": 2, "dest": 24 }
            ],
            fxSettings: [
                { "id": 0, "value": 0.38 },
                { "id": 1, "value": 0.22 },
                { "id": 2, "value": 0.68 },
                { "id": 3, "value": 0.45 },
                { "id": 4, "value": 0.52 },
                { "id": 5, "value": 0 },
                { "id": 6, "value": 0.65 },
                { "id": 7, "value": 0.55 },
                { "id": 8, "value": 0.18 },
                { "id": 9, "value": 0.45 },
                { "id": 10, "value": 0.65 },
                { "id": 11, "value": 0.58 },
                { "id": 12, "value": 0.5644 },
                { "id": 13, "value": 0.78 },
                { "id": 14, "value": 0.58 },
                { "id": 15, "value": 0.33 },
                { "id": 20, "value": 0.48 },
                { "id": 21, "value": 0.5522 },
                { "id": 26, "value": 0.4055 },
                { "id": 27, "value": 0.5 },
                { "id": 28, "value": 0.42 },
                { "id": 29, "value": 0.38 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Random",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    notes: [ 63, 68, 70, 75, 77, 82, 84, 87, 89 ]
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    notes: [ 51, 56, 58, 60, 63, 65, 67, 70 ]
                },
                fx: { // Settings for the ARP-specific knobs
                    16: 0.4193,
                    17: 0.1412,
                    18: 0.55,
                    19: 0,
                    22: 0.44,
                    23: 0.77,
                    24: 0.5,
                    25: 0.29
                }
            }
        },
        'STRIDE': {
            tempoMode: "BPM",
            key: "G",
            scale: "Major Pentatonic",
            isLfoMode: true,
            knobSettings: [
                { "id": 0, "totalAngle": 2414.04 },
                { "id": 1, "totalAngle": 724.11 }
            ],
            lfoState: [
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1, "tempoSync": false, "storedFreeValue": 0 },
                { "rate": 0.3443, "depth": 0.2166, "wave": 0, "dest": 20, "tempoSync": false, "storedFreeValue": 0.3443 },
                { "rate": 0, "depth": 0, "wave": 0, "dest": -1, "tempoSync": false, "storedFreeValue": 0 },
                { "rate": 0.1944, "depth": 0.3721, "wave": 0, "dest": 6, "tempoSync": false, "storedFreeValue": 0.1944 }
            ],
            fxSettings: [
                { "id": 0, "value": 0.269 },
                { "id": 1, "value": 0.8444 },
                { "id": 2, "value": 0.8355 },
                { "id": 3, "value": 0.4257 },
                { "id": 4, "value": 0.0424 },
                { "id": 5, "value": 0.053 },
                { "id": 6, "value": 0.6282 },
                { "id": 7, "value": 0.7 },
                { "id": 8, "value": 0.0011 },
                { "id": 9, "value": 0.4671 },
                { "id": 10, "value": 0.6588 },
                { "id": 11, "value": 0.7458 },
                { "id": 12, "value": 0.3322 },
                { "id": 13, "value": 0.5474 },
                { "id": 14, "value": 0.3043 },
                { "id": 15, "value": 0.7067 },
                { "id": 20, "value": 0.1942 },
                { "id": 21, "value": 0.3915 },
                { "id": 26, "value": 0.5 },
                { "id": 27, "value": 0.5 },
                { "id": 28, "value": 0.4363 },
                { "id": 29, "value": 0.9699 }
            ],
            arpSettings: {
                isArpRateSynced: false,
                currentArpOrder: "Down",
                arp1: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: true,
                    notes: [ 76, 88, 47, 55 ],
                    transpose: 12
                },
                arp2: {
                    isArpOn: true,
                    isOn: true,
                    isSweepMode: true,
                    notes: [ 81, 67, 50 ],
                    transpose: -2
                },
                fx: {
                    16: 1,
                    17: 0.4002,
                    18: 0.2487,
                    19: 0.6951,
                    22: 0.0891,
                    23: 0.1236,
                    24: 0.5,
                    25: 0.5
                }
            }
        },            
        'ZAFFRE': { // A deep, cinematic drone that evolves slowly.
            tempoMode: 'BPM',
            key: 'B',
            scale: 'Phrygian',
            fxSettings: [
                { id: 8, value: 0.7 },    // ATTACK: Very slow swell.
                { id: 11, value: 0.95 },  // RELEASE: Almost infinite.
                { id: 10, value: 1.0 },   // SUSTAIN: Full level.
                { id: 12, value: 0.9 },   // REVERB: Almost fully wet.
                { id: 13, value: 0.9 },   // RVB TIME: Huge reverb tail.
                { id: 14, value: 0.6 },   // DELAY: High mix.
                { id: 15, value: 0.7 }    // DLY TIME: Long, atmospheric delay.
            ],
            arpSettings: {
                isArpRateSynced: true,    // Both arps share the same slow speed.
                arp1: { isArpOn: true, notes: [59, 62], transpose: -12 }, // Low notes, transposed down an octave.
                arp2: { isArpOn: true, notes: [66, 71] }, // Higher, complimentary notes.
                fx: {
                    16: 0.0400,             // Arp 1 RATE: Extremely slow for a drone effect.
                    22: 0.8,              // Arp 1 FEEL: Sparse rhythm.
                    23: 0.9               // Arp 2 FEEL: Very sparse rhythm.
                }
            }
        },
        'AMARANTH': { // A classic, detuned trance supersaw arpeggio.
            tempoMode: 'BPM',
            key: 'C#',
            scale: 'Custom',
            customScale: [0, 3, 7, 10], // Defines a C# Minor 7th chord.
            fxSettings: [
                { id: 4, value: 0.4 },    // DETUNE: The key to the supersaw sound.
                { id: 6, value: 0.6 },    // CHORUS: Makes it even wider.
                { id: 3, value: 0 },      // OSC3 MIX: Turned off to focus on the detuned saws.
                { id: 8, value: 0.1 },    // ATTACK: A little bit of softness.
                { id: 11, value: 0.4 },   // RELEASE: Medium release.
                { id: 12, value: 0.2 }    // REVERB: A bit of space.
            ],
            arpSettings: {
                currentArpOrder: 'Up/Down',
                arp1: { isArpOn: true, notes: [49, 52, 56, 59] }, // Plays a C#m7 chord.
                arp2: { isArpOn: true, notes: [61, 64, 68, 71] }, // Plays the same chord an octave up.
                fx: {
                    16: 0.8157,              // Arp 1 RATE: Fast trance speed.
                    17: 0.8157,              // Arp 2 RATE: Same speed.
                    18: 0.7,              // Arp 1 OCTS: Arpeggio jumps up 2 octaves.
                    19: 0.7               // Arp 2 OCTS: Arpeggio also jumps up 2 octaves.
                }
            }
        },
        'RANDOM ARP': { tempoMode: 'BPM' }
    }
};
