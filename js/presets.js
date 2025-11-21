// Auto-extracted from original index.html
export const PRESETS = {
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
        { "rate": 0.3944, "depth": 0.3611, "wave": 0, "destChain": [24] },
        { "rate": 0.3111, "depth": 0.35, "wave": 0, "destChain": [25] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] }
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
        { "rate": 0.9328, "depth": 0.1833, "wave": 5, "destChain": [300], "tempoSync": true, "storedFreeValue": 0.3833 },
        { "rate": 0.7070, "depth": 0.1444, "wave": 1, "destChain": [9], "tempoSync": true, "storedFreeValue": 0.5222 },
        { "rate": 0.2999, "depth": 0.3888, "wave": 5, "destChain": [15], "tempoSync": false, "storedFreeValue": 0.2999 },
        { "rate": 1, "depth": 0.6111, "wave": 5, "destChain": [301], "tempoSync": true, "storedFreeValue": 0.8888 }
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
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [], "tempoSync": false, "storedFreeValue": 0 },
        { "rate": 0.4833, "depth": 0.1166, "wave": 1, "destChain": [6], "tempoSync": false, "storedFreeValue": 0.4833 },
        { "rate": 0.4666, "depth": 0.1166, "wave": 0, "destChain": [20], "tempoSync": false, "storedFreeValue": 0.4666 },
        { "rate": 0.5111, "depth": 0.2, "wave": 0, "destChain": [21], "tempoSync": false, "storedFreeValue": 0.5111 }
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
        { "rate": 0.2166, "depth": 0.55, "wave": 3, "destChain": [16], "tempoSync": false, "storedFreeValue": 0.2166 },
        { "rate": 0.3333, "depth": 0.1611, "wave": 0, "destChain": [20], "tempoSync": false, "storedFreeValue": 0.3333 },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [], "tempoSync": false, "storedFreeValue": 0 },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [], "tempoSync": false, "storedFreeValue": 0 }
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
        { "rate": 0.5, "depth": 0.3388, "wave": 5, "destChain": [15] },
        { "rate": 0.1055, "depth": 0.2333, "wave": 5, "destChain": [25] },
        { "rate": 0.5388, "depth": 0.4611, "wave": 3, "destChain": [9] },
        { "rate": 0.7055, "depth": 0.3055, "wave": 5, "destChain": [24] }
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
        { "rate": 0.15, "depth": 0.65, "wave": 3, "destChain": [109] },
        { "rate": 0.42, "depth": 0.55, "wave": 5, "destChain": [16] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] },
        { "rate": 0.73, "depth": 0.72, "wave": 2, "destChain": [24] }
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
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [], "tempoSync": false, "storedFreeValue": 0 },
        { "rate": 0.3443, "depth": 0.2166, "wave": 0, "destChain": [20], "tempoSync": false, "storedFreeValue": 0.3443 },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [], "tempoSync": false, "storedFreeValue": 0 },
        { "rate": 0.1944, "depth": 0.3721, "wave": 0, "destChain": [6], "tempoSync": false, "storedFreeValue": 0.1944 }
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
'STROLLER': { // A complex, syncopated dual-arp sequence.
    tempoMode: 'BPM',
                key: 'F#',
                scale: 'Minor',
                fxSettings: [
                    { id: 1, value: 0.0709 },   // DISTORTION
                    { id: 2, value: 0.8772 },   // MASTER FILTER
                    { id: 3, value: 0.5272 },   // OSC3 MIX
                    { id: 4, value: 0.5923 },   // DETUNE
                    { id: 5, value: 0.2730 },   // TREMOLO
                    { id: 6, value: 0.5549 },   // CHORUS
                    { id: 8, value: 0.3356 },   // ATTACK
                    { id: 9, value: 0.7688 },   // DECAY
                    { id: 10, value: 0.1776 },  // SUSTAIN
                    { id: 11, value: 0.2265 },  // RELEASE
                    { id: 12, value: 0.1725 },  // REVERB
                    { id: 13, value: 0.1865 },  // RVB TIME
                    { id: 14, value: 0.5942 },  // DELAY
                    { id: 15, value: 0.0173 },  // DLY TIME
                    { id: 20, value: 0.5240 },  // OSC 1 FILTER
                    { id: 21, value: 0.2179 },  // OSC 2 FILTER
                    { id: 28, value: 0.8459 },  // OSC 1 RES
                    { id: 29, value: 0.6228 }   // OSC 2 RES
                ],
                arpSettings: {
                    isArpRateSynced: true,
                    currentArpOrder: 'Random',
                    arp1: {
                        isArpOn: true,
                        isSweepMode: true,
                        notes: [45, 83, 64, 66, 42],
                        transpose: 12 // This will be handled by the '24' knob value
                    },
                    arp2: {
                        isArpOn: true,
                        isSweepMode: true,
                        notes: [42, 73, 81, 86],
                        transpose: -2 // This will be handled by the '25' knob value
                    },
                    fx: { // Settings for the dedicated ARP knobs
                        16: 0.8192,          // Arp 1 RATE
                        17: 0.8192,          // Arp 2 RATE
                        18: 0.7635,          // Arp 1 OCTS
                        19: 0.5953,          // Arp 2 OCTS
                        22: 0.2349,          // Arp 1 FEEL
                        23: 0.8481,          // Arp 2 FEEL
                        24: 1.0,             // Arp 1 TRANSPOSE (Value of 1.0 = +12)
                        25: 0.4166           // Arp 2 TRANSPOSE (Value of 0.4166 = -2)
                    }
                }
            },
                'RANDOM ARP': { tempoMode: 'BPM' }
            },
            "SOUNDS": {
                'WENGE': { key: 'A', scale: 'Minor', tempoMode: 'BPM', fxSettings: [{ id: 8, value: 0.01 },{ id: 9, value: 0.2 },{ id: 10, value: 0.5 },{ id: 11, value: 0.2 },{ id: 20, value: 0.25 },{ id: 28, value: 0.1 },{ id: 0, value: 0.15 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'CELADON': { key: 'C', scale: 'Major', tempoMode: 'BPM', fxSettings: [{ id: 8, value: 0.8 },{ id: 11, value: 0.9 },{ id: 10, value: 0.9 },{ id: 4, value: 0.3 },{ id: 6, value: 0.7 },{ id: 12, value: 0.8 },{ id: 13, value: 0.9 },{ id: 20, value: 0.7 },{ id: 21, value: 0.75 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'GAMBOGE': { key: 'G', scale: 'Minor Pentatonic', tempoMode: 'BPM', fxSettings: [{ id: 8, value: 0.01 },{ id: 9, value: 0.3 },{ id: 10, value: 0.1 },{ id: 11, value: 0.3 },{ id: 14, value: 0.5 },{ id: 15, value: 0.4 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'COQUELICOT': { key: 'D', scale: 'Minor', tempoMode: 'BPM', fxSettings: [{ id: 1, value: 0.6 },{ id: 28, value: 0.85 },{ id: 20, value: 0.6 },{ id: 0, value: 0.25 },{ id: 8, value: 0.05 },{ id: 11, value: 0.3 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'VIRIDIAN': { key: 'E', scale: 'Major', tempoMode: 'BPM', fxSettings: [{ id: 3, value: 0.9 },{ id: 8, value: 0 },{ id: 9, value: 0.15 },{ id: 10, value: 0 },{ id: 11, value: 0.1 },{ id: 6, value: 0 },{ id: 12, value: 0 },{ id: 14, value: 0 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
'WHIRLY': {
    tempoMode: 'BPM',
    key: "F#",
    scale: "Dorian",
    isLfoMode: false,
    knobSettings: [
        { "id": 0, "totalAngle": 680.65 },
        { "id": 1, "totalAngle": 1276.71 }
    ],
    lfoState: [
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] },
        { "rate": 0, "depth": 0, "wave": 0, "destChain": [] }
    ],
    fxSettings: [
        { "id": 0, "value": 0 },
        { "id": 1, "value": 0 },
        { "id": 2, "value": 1 },
        { "id": 3, "value": 0 },
        { "id": 4, "value": 0.1 },
        { "id": 5, "value": 0.6 },
        { "id": 6, "value": 0 },
        { "id": 7, "value": 0.7 },
        { "id": 8, "value": 0 },
        { "id": 9, "value": 1 },
        { "id": 10, "value": 0 },
        { "id": 11, "value": 1 },
        { "id": 12, "value": 0.3 },
        { "id": 13, "value": 0.4 },
        { "id": 14, "value": 0 },
        { "id": 15, "value": 0 },
        { "id": 20, "value": 0.4 },
        { "id": 21, "value": 0.4 },
        { "id": 26, "value": 0.5 },
        { "id": 27, "value": 0.5 },
        { "id": 28, "value": 0 },
        { "id": 29, "value": 0 }
    ],
    arpSettings: {
        isArpRateSynced: false,
        currentArpOrder: "As Played",
        arp1: {
            isArpOn: false,
            isOn: false,
            notes: []
        },
        arp2: {
            isArpOn: false,
            isOn: false,
            notes: []
        },
        fx: {
            16: 0.4344,
            17: 0.4344,
            18: 0,
            19: 0,
            22: 0,
            23: 0,
            24: 0.5,
            25: 0.5
        }
    }
},
                'ZAFFRE': { key: 'B', scale: 'Phrygian', tempoMode: 'BPM', fxSettings: [{ id: 8, value: 0.7 },{ id: 11, value: 0.95 },{ id: 10, value: 1.0 },{ id: 12, value: 0.9 },{ id: 13, value: 0.9 },{ id: 14, value: 0.6 },{ id: 15, value: 0.7 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'AMARANTH': { key: 'C#', scale: 'Custom', tempoMode: 'BPM', customScale: [0, 3, 7, 10], fxSettings: [{ id: 4, value: 0.4 },{ id: 6, value: 0.6 },{ id: 3, value: 0 },{ id: 8, value: 0.1 },{ id: 11, value: 0.4 },{ id: 12, value: 0.2 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'GLAUCOUS': { key: 'A', scale: 'Minor Pentatonic', tempoMode: 'BPM', fxSettings: [{ id: 8, value: 0 },{ id: 9, value: 0.1 },{ id: 10, value: 0 },{ id: 11, value: 0.1 },{ id: 14, value: 0.65 },{ id: 15, value: 0.3 },{ id: 12, value: 0.2 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'EBURNEAN': { key: 'C', scale: 'Lydian', tempoMode: 'BPM', fxSettings: [{ id: 12, value: 0.9 },{ id: 13, value: 0.9 },{ id: 8, value: 0.2 },{ id: 11, value: 0.8 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'STROLLER': { key: 'F#', scale: 'Minor', tempoMode: 'BPM', fxSettings: [{ id: 1, value: 0.0709 },{ id: 2, value: 0.8772 },{ id: 3, value: 0.5272 },{ id: 4, value: 0.5923 },{ id: 5, value: 0.2730 },{ id: 6, value: 0.5549 },{ id: 8, value: 0.3356 },{ id: 9, value: 0.7688 },{ id: 10, value: 0.1776 },{ id: 11, value: 0.2265 },{ id: 12, value: 0.1725 },{ id: 13, value: 0.1865 },{ id: 14, value: 0.5942 },{ id: 15, value: 0.0173 },{ id: 20, value: 0.5240 },{ id: 21, value: 0.2179 },{ id: 28, value: 0.8459 },{ id: 29, value: 0.6228 }], arpSettings: { arp1: { isArpOn: false }, arp2: { isArpOn: false } } },
                'RANDOM SOUND': { tempoMode: 'BPM' }
            }
        };








