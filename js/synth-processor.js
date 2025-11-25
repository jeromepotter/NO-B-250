class Comb { constructor(size, feedback, damping) { this.buffer = new Float32Array(size); this.pos = 0; this.feedback = feedback; this.damp = damping; this.last = 0; } process(input) { const output = this.buffer[this.pos]; this.last = output * (1 - this.damp) + this.last * this.damp; this.buffer[this.pos] = input + this.last * this.feedback; if (++this.pos >= this.buffer.length) this.pos = 0; return output; } }
           class Allpass { constructor(size) { this.buffer = new Float32Array(size); this.pos = 0; } process(input) { const delayed = this.buffer[this.pos]; const output = -input + delayed; this.buffer[this.pos] = input + delayed * 0.5; if (++this.pos >= this.buffer.length) this.pos = 0; return output; } }
      
const MIN_LFO_RATE_HZ = 0.01;
const MAX_LFO_RATE_HZ = 100;
const LFO_RATE_RANGE_RATIO = MAX_LFO_RATE_HZ / MIN_LFO_RATE_HZ;
const LFO_DEST_NONE = -1;

           class SynthProcessor extends AudioWorkletProcessor {
               constructor() {
                   super();
                   // Core oscillator state
                   this.phase1_1=0; this.phase2_1=0; this.phase3_1=0; this.targetFrequency1=440; this.currentFrequency1=440; this.noteOn1=false;
                   this.phase1_2=0; this.phase2_2=0; this.phase3_2=0; this.targetFrequency2=440; this.currentFrequency2=440; this.noteOn2=false;
                   // Envelope state
                   this.envStage1='off'; this.envValue1=0.0; this.envStage2='off'; this.envValue2=0.0;
                   // FX params (from main thread)
                   this.params=new Array(32).fill(0.0);
                   // Envelope times
                   this.attackTime=0.01; this.decayTime=0.2; this.sustainLevel=0.8; this.releaseTime=0.1;
                   this.releaseRate = Math.exp(-1 / (this.releaseTime * sampleRate));
                   // Misc
                   this.sampleCounter = 0; this.tremoloPhase=0; this.pannerL=1;this.pannerR=1;
                   this.distLpL = 0; this.distLpR = 0;
                   this.smoothedDist = 0;
                   this.distWet = 0;
                   // Filter state
                   this.filter_x1_L=0; this.filter_x2_L=0; this.filter_y1_L=0; this.filter_y2_L=0;
                   this.filter_x1_R=0; this.filter_x2_R=0; this.filter_y1_R=0; this.filter_y2_R=0;
                   this.dcBlocker = { x1L: 0, y1L: 0, x1R: 0, y1R: 0 };
                   this.smoothedCutoff1 = 0.5;
                   this.smoothedCutoff2 = 0.5;
                   this.smoothedRes1 = 0.0;
                   this.smoothedRes2 = 0.0;
                   this.filterCoeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.updateFilterCoefficients(this.filterCoeffs, 1.0, 0.0);
                   this.filterOsc1Coeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.filter_osc1_x1=0; this.filter_osc1_x2=0; this.filter_osc1_y1=0; this.filter_osc1_y2=0; this.updateFilterCoefficients(this.filterOsc1Coeffs, 1.0, 0.0);
                   this.filterOsc2Coeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.filter_osc2_x1=0; this.filter_osc2_x2=0; this.filter_osc2_y1=0; this.filter_osc2_y2=0; this.updateFilterCoefficients(this.filterOsc2Coeffs, 1.0, 0.0);
                   // Delay & Chorus state
                   this.delayBufferL=new Float32Array(sampleRate*2);this.delayBufferR=new Float32Array(sampleRate*2);this.delayWritePos=0;
                   this.smoothDelayTime = 0.01;
                   this.chorusLfoPhase=0; this.chorusDelayBufferL=new Float32Array(Math.floor(sampleRate*0.05)); this.chorusDelayBufferR=new Float32Array(Math.floor(sampleRate*0.05)); this.chorusWritePos=0;
                   // Reverb state
                   const sr=sampleRate;
                   this.combsL=[new Comb(Math.floor(sr*0.0297),0.84,0.2),new Comb(Math.floor(sr*0.0371),0.82,0.25),new Comb(Math.floor(sr*0.0411),0.8,0.3),new Comb(Math.floor(sr*0.0437),0.78,0.35)];
                   this.combsR=[new Comb(Math.floor(sr*0.0301),0.83,0.22),new Comb(Math.floor(sr*0.0369),0.81,0.27),new Comb(Math.floor(sr*0.0415),0.79,0.32),new Comb(Math.floor(sr*0.0441),0.77,0.37)];
                   this.allpassesL=[new Allpass(Math.floor(sr*0.005)),new Allpass(Math.floor(sr*0.0017))];
                   this.allpassesR=[new Allpass(Math.floor(sr*0.0051)),new Allpass(Math.floor(sr*0.0018))];
                   // Recording state
                   this.isRecording = false; this.recordBlockSize = 8192; this.recL = new Float32Array(this.recordBlockSize); this.recR = new Float32Array(this.recordBlockSize); this.recIndex = 0;

                   // --- LFO State ---
                   this.lfoParams = [
                       { rate: 0, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0 },
                       { rate: 0, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0 },
                       { rate: 0, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0 },
                       { rate: 0, depth: 0, wave: 0, dest: LFO_DEST_NONE, destChain: [], phase: 0, lastRandom: 0 },
                   ];
                   this.lfoOutputs = [0,0,0,0];
      
                   this.port.onmessage = ({ data: { type, data } }) => {
                       const { voice, freq, id, value, lfoId, param } = data || {};
                       switch (type) {
                           case 'noteOn':
    if (voice === 0) { 
        this.noteOn1 = true; 
        this.targetFrequency1 = freq; 
        if (this.params[0] < 0.01) this.currentFrequency1 = freq; 
        this.envStage1 = 'attack'; 
    } 
    else { 
        this.noteOn2 = true; 
        this.targetFrequency2 = freq; 
        if (this.params[0] < 0.01) this.currentFrequency2 = freq; 
        this.envStage2 = 'attack'; 
    } 
    break;
                           case 'noteOff': 
    if (voice === 0) { 
        this.envStage1 = 'release'; 
    } else { 
        this.envStage2 = 'release'; 
    } 
    break;
                           case 'setFreq': if (voice === 0) { this.targetFrequency1 = freq; } else { this.targetFrequency2 = freq; } break;
                           case 'setFx':
                               if (id >= 0 && id < this.params.length) { this.params[id] = value; }
                               if(id===2){ this.updateFilterCoefficients(this.filterCoeffs, value, 0.0); }
                               else if(id===8){ this.attackTime=0.001+Math.pow(value,2)*2; } else if(id===9){ this.decayTime=0.001+Math.pow(value,2)*2; }
                               else if(id===10){ this.sustainLevel=value; } else if(id===11){ this.releaseTime=0.001+Math.pow(value,2)*1.25; this.releaseRate=Math.exp(-1/(this.releaseTime*sampleRate)); }
                               else if(id===13){ const f=0.75+value*0.23; this.combsL.forEach(c=>c.feedback=f); this.combsR.forEach(c=>c.feedback=f); }
                               else if (id===20 || id===28){ this.updateFilterCoefficients(this.filterOsc1Coeffs, this.params[20], this.params[28]); } 
                               else if(id===21 || id===29){ this.updateFilterCoefficients(this.filterOsc2Coeffs, this.params[21], this.params[29]); }
                               break;
                            case 'setLfo':
                                if (lfoId >= 0 && lfoId < this.lfoParams.length) {
                                    const lfoTarget = this.lfoParams[lfoId];
                                    if (param === 'destChain') {
                                        if (Array.isArray(value)) {
                                            lfoTarget.destChain = value.filter(v => Number.isFinite(v));
                                            lfoTarget.dest = lfoTarget.destChain.length ? lfoTarget.destChain[0] : LFO_DEST_NONE;
                                        }
                                    } else if (lfoTarget[param] !== undefined) {
                                        lfoTarget[param] = value;
                                        if (param === 'dest') {
                                            lfoTarget.destChain = value === LFO_DEST_NONE ? [] : [value];
                                        }
                                    }
                                }
                                break;
                            case 'requestLfoUpdate':
                                this.port.postMessage({type:'lfoUpdate', data: this.lfoOutputs});
                                break;
                           case 'startRecording': { const bs=(data&&data.blockSize|0)||8192; this.recordBlockSize=Math.max(128,bs); this.recL=new Float32Array(this.recordBlockSize); this.recR=new Float32Array(this.recordBlockSize); this.recIndex=0; this.isRecording=true; break; }
                           case 'stopRecording': { if(this.isRecording){if(this.recIndex>0){const i=new Float32Array(this.recIndex*2); for(let j=0,k=0;j<this.recIndex;j++){i[k++]=this.recL[j];i[k++]=this.recR[j];} this.port.postMessage({type:'audio',data:i},[i.buffer]); this.recIndex=0;} this.isRecording=false; this.port.postMessage({type:'recordingStopped'});} break;}
case 'ping': 
            break; 
                       }
                   };

                   // Initialize default FX params that are not 0
                   this.params[2] = 1.0; this.params[7] = 0.5; this.params[10] = 0.8;
                   this.params[20] = 1.0; this.params[21] = 1.0; this.params[26] = 0.5; this.params[27] = 0.5;
               }
      
               updateFilterCoefficients(c,v, res){ const p=Math.pow(v,3); const Q=0.707 + Math.pow(res, 2) * 24; const w=2*Math.PI*(40+p*(sampleRate/2.2-40))/sampleRate; const s=Math.sin(w); const a=s/(2*Q); const i=1/(1+a); c.b0=(1-Math.cos(w))/2*i; c.b1=(1-Math.cos(w))*i; c.b2=(1-Math.cos(w))/2*i; c.a1=-2*Math.cos(w)*i; c.a2=(1-a)*i; }
               
               // --- CHORUS INTERPOLATION HELPER (Now a reliable class method) ---
               getInterpolatedSample(buffer, delaySamples, writePos) {
                   let readPos = writePos - delaySamples;
                   while (readPos < 0) readPos += buffer.length;
                   
                   const idxA = Math.floor(readPos);
                   const idxB = (idxA + 1) % buffer.length;
                   const frac = readPos - idxA;
                   
                   return buffer[idxA] * (1 - frac) + buffer[idxB] * frac;
               }

               process(i,o,p){
                   const oL=o[0][0]; const oR=o[0][1]; const sr=sampleRate;
// --- LFO Processing (with LFO-to-LFO modulation) ---
let rawLfoOutputs = [0, 0, 0, 0];
const getLfoDestinations = (lfo) => {
    if (lfo && Array.isArray(lfo.destChain) && lfo.destChain.length) {
        return lfo.destChain;
    }
    if (lfo && lfo.dest !== undefined && lfo.dest !== LFO_DEST_NONE) {
        return [lfo.dest];
    }
    return [];
};

for (let l = 0; l < 4; l++) {
    const lfo = this.lfoParams[l];
    if (lfo.depth > 0.001) {
        let val = 0;
        switch (lfo.wave) {
            case 0: val = Math.sin(lfo.phase); break; 
            case 1: val = Math.asin(Math.sin(lfo.phase)) * (2 / Math.PI); break; 
            case 2: val = lfo.phase < Math.PI ? 1 : -1; break; 
            case 3: val = (lfo.phase / Math.PI) - 1; break; 
            case 4: val = 1 - (lfo.phase / Math.PI); break; 
            case 5: val = lfo.lastRandom; break; 
        }
        rawLfoOutputs[l] = val * lfo.depth;
        
        const rateHz = MIN_LFO_RATE_HZ * Math.pow(LFO_RATE_RANGE_RATIO, lfo.rate);
        const phaseInc = (2 * Math.PI * rateHz * oL.length) / sr;
        const oldPhase = lfo.phase;
        lfo.phase = (lfo.phase + phaseInc) % (2 * Math.PI);
        if (lfo.wave === 5 && oldPhase > lfo.phase) {
            lfo.lastRandom = Math.random() * 2 - 1;
        }
    }
}

const LFO_KNOB_IDS = { 101: {lfo: 0, param: 'wave'}, 103: {lfo: 1, param: 'depth'}, 104: {lfo: 2, param: 'depth'}, 105: {lfo: 1, param: 'wave'}, 106: {lfo: 0, param: 'depth'}, 107: {lfo: 3, param: 'dest'}, 108: {lfo: 0, param: 'rate'}, 109: {lfo: 1, param: 'rate'}, 110: {lfo: 2, param: 'rate'}, 111: {lfo: 3, param: 'rate'}, 112: {lfo: 2, param: 'wave'}, 113: {lfo: 3, param: 'wave'}, 100: {lfo: 3, param: 'depth'}, 102: {lfo: 2, param: 'dest'}, 114: {lfo: 0, param: 'dest'}, 115: {lfo: 1, param: 'dest'} };

const appliedLfoTargets = new Set();

for (let l = 0; l < 4; l++) {
    const lfo = this.lfoParams[l];
    const destinations = getLfoDestinations(lfo);
    if (destinations.length && rawLfoOutputs[l] !== 0) {
        for (const dest of destinations) {
            const targetLfoInfo = LFO_KNOB_IDS[dest];
            if (!targetLfoInfo) continue;

            const targetIndex = targetLfoInfo.lfo;
            const param = targetLfoInfo.param;
            const loopKey = `${l}->${targetIndex}:${param}`;
            if (appliedLfoTargets.has(loopKey)) continue;
            const potentialLoop = targetIndex === l || getLfoDestinations(this.lfoParams[targetIndex]).some(d => {
                const info = LFO_KNOB_IDS[d];
                return info && info.lfo === l;
            });
            if (potentialLoop) continue;
            appliedLfoTargets.add(loopKey);

            const targetLfo = this.lfoParams[targetIndex];
            if (param === 'rate') {
                const baseRate = targetLfo.rate;
                const modulatedRate = Math.max(0, Math.min(1, baseRate + rawLfoOutputs[l]));
                const rateHz = MIN_LFO_RATE_HZ * Math.pow(LFO_RATE_RANGE_RATIO, modulatedRate);
                const phaseInc = (2 * Math.PI * rateHz * oL.length) / sr;
                const oldPhase = targetLfo.phase;
                targetLfo.phase = (targetLfo.phase + phaseInc) % (2 * Math.PI);
                if (targetLfo.wave === 5 && oldPhase > targetLfo.phase) {
                    targetLfo.lastRandom = Math.random() * 2 - 1;
                }
                let val = 0;
                switch (targetLfo.wave) {
                    case 0: val = Math.sin(targetLfo.phase); break;
                    case 1: val = Math.asin(Math.sin(targetLfo.phase)) * (2 / Math.PI); break;
                    case 2: val = targetLfo.phase < Math.PI ? 1 : -1; break;
                    case 3: val = (targetLfo.phase / Math.PI) - 1; break;
                    case 4: val = 1 - (targetLfo.phase / Math.PI); break;
                    case 5: val = targetLfo.lastRandom; break;
                }
                rawLfoOutputs[targetIndex] = val * targetLfo.depth;
           } else if (param === 'depth') {
                const modulatedDepth = Math.max(0, Math.min(1, targetLfo.depth + rawLfoOutputs[l]));
                rawLfoOutputs[targetIndex] = rawLfoOutputs[targetIndex] * (modulatedDepth / (targetLfo.depth || 1));
            } else if (param === 'wave') {
                const baseWave = targetLfo.wave;
                const modulatedWaveValue = Math.max(0, Math.min(1, (baseWave / 5) + rawLfoOutputs[l]));
                const newWave = Math.floor(modulatedWaveValue * 6);
                let val = 0;
                switch (newWave) {
                    case 0: val = Math.sin(targetLfo.phase); break;
                    case 1: val = Math.asin(Math.sin(targetLfo.phase)) * (2 / Math.PI); break;
                    case 2: val = targetLfo.phase < Math.PI ? 1 : -1; break;
                    case 3: val = (targetLfo.phase / Math.PI) - 1; break;
                    case 4: val = 1 - (targetLfo.phase / Math.PI); break;
                    case 5: val = targetLfo.lastRandom; break;
                }
                rawLfoOutputs[targetIndex] = val * targetLfo.depth;
            }
        }
    }
}

this.lfoOutputs = rawLfoOutputs;

// --- Modulation Destination Logic ---
let modulatedFx = {};
for (let l = 0; l < 4; l++) {
    const lfo = this.lfoParams[l];
    const destinations = getLfoDestinations(lfo);
    if (destinations.length) {
        for (const dest of destinations) {
            if (!modulatedFx[dest]) modulatedFx[dest] = 0;
            modulatedFx[dest] = Math.max(-1, Math.min(1, modulatedFx[dest] + this.lfoOutputs[l]));
        }
    }
}

// Calculate modulated params ONCE per buffer
let currentParams = [...this.params];
for (const fxId in modulatedFx) {
    const id = parseInt(fxId, 10);
    if(currentParams[id] !== undefined) {
        currentParams[id] = Math.max(0, Math.min(1, currentParams[id] + Math.max(-1, Math.min(1, modulatedFx[id]))));
    }
}

// Calculate envelope times ONCE per buffer
this.attackTime = 0.001 + Math.pow(currentParams[8], 2) * 2;
this.decayTime = 0.001 + Math.pow(currentParams[9], 2) * 2;
this.sustainLevel = currentParams[10];
this.releaseTime = 0.001 + Math.pow(currentParams[11], 2) * 1.25;
this.releaseRate = Math.exp(-1 / (this.releaseTime * sampleRate));

const getWaveSample = (phase, waveType) => {
    switch (waveType) {
        case 0: return (phase / Math.PI) - 1.0; // Saw
        case 1: return phase < Math.PI ? 1.0 : -1.0; // Square
        case 2: return Math.sin(phase); // Sine
        case 3: return (2 / Math.PI) * Math.asin(Math.sin(phase)); // Triangle
        default: return (phase / Math.PI) - 1.0;
    }
};

const waveType1 = Math.min(3, Math.max(0, Math.floor((currentParams[30] || 0) * 4)));
const waveType2 = Math.min(3, Math.max(0, Math.floor((currentParams[31] || 0) * 4)));

for(let i=0;i<oL.length;i++){

    // Envelopes
    switch(this.envStage1){ case 'attack':this.envValue1+=1.0/(this.attackTime*sr);if(this.envValue1>=1.0){this.envValue1=1.0;this.envStage1='decay';}break; case 'decay':this.envValue1-=(1.0-this.sustainLevel)/(this.decayTime*sr);if(this.envValue1<=this.sustainLevel){this.envValue1=this.sustainLevel;this.envStage1='sustain';}break; case 'release':this.envValue1*=this.releaseRate;if(this.envValue1<=0.0001){this.envValue1=0;this.envStage1='off';this.noteOn1=false;}break; }
    switch(this.envStage2){ case 'attack':this.envValue2+=1.0/(this.attackTime*sr);if(this.envValue2>=1.0){this.envValue2=1.0;this.envStage2='decay';}break; case 'decay':this.envValue2-=(1.0-this.sustainLevel)/(this.decayTime*sr);if(this.envValue2<=this.sustainLevel){this.envValue2=this.sustainLevel;this.envStage2='sustain';}break; case 'release':this.envValue2*=this.releaseRate;if(this.envValue2<=0.0001){this.envValue2=0;this.envStage2='off';this.noteOn2=false;}break; }
    
    const g=currentParams[0]; const pt=(g<0.01)?1.0:1.0-Math.exp(-2*Math.PI/(Math.pow(g,3)*sr)); 
    
    this.currentFrequency1+=(this.targetFrequency1-this.currentFrequency1)*pt; 
    this.currentFrequency2+=(this.targetFrequency2-this.currentFrequency2)*pt;
    
    // --- VOICE VARIANCE LOGIC ---
    const dA1 = 1.0 + currentParams[4] * 0.01; 
    const dA2 = 1.0 + currentParams[4] * 0.013; 

    let s1=0, s2=0;

    // --- VOICE 1 (Standard Detune, Uses dA1) ---
    if(this.noteOn1 || this.envStage1 === 'release'){
        const o1_1=getWaveSample(this.phase1_1, waveType1);
        this.phase1_1=(this.phase1_1+2*Math.PI*this.currentFrequency1/sr)%(2*Math.PI);

        const o2_1=getWaveSample(this.phase2_1, waveType1);
        this.phase2_1=(this.phase2_1+2*Math.PI*this.currentFrequency1*dA1/sr)%(2*Math.PI);

        const o3_1=getWaveSample(this.phase3_1, waveType1);
        this.phase3_1=(this.phase3_1+2*Math.PI*(this.currentFrequency1/2)/sr)%(2*Math.PI);

        s1=(o1_1+o2_1)*0.5;
        s1 = (s1 + (o3_1 * currentParams[3])) * 0.8;
    }

    // --- VOICE 2 (Drifty Detune, Uses dA2) ---
    if(this.noteOn2 || this.envStage2 === 'release'){
        const o1_2=getWaveSample(this.phase1_2, waveType2);
        this.phase1_2=(this.phase1_2+2*Math.PI*this.currentFrequency2/sr)%(2*Math.PI);

        const o2_2=getWaveSample(this.phase2_2, waveType2);
        this.phase2_2=(this.phase2_2+2*Math.PI*this.currentFrequency2*dA2/sr)%(2*Math.PI);

        const o3_2=getWaveSample(this.phase3_2, waveType2);
        this.phase3_2=(this.phase3_2+2*Math.PI*(this.currentFrequency2/2)/sr)%(2*Math.PI);

        s2=(o1_2+o2_2)*0.5;
        s2 = (s2 + (o3_2 * currentParams[3])) * 0.8;
    }

    const dither = (Math.random() - 0.5) * 0.00001;
    s1 += dither;
    s2 += dither;
    
    // Analog Drive: Boost (1.5x) and Saturate (tanh) before the filter
    const drive = 1.5; 
    const s1_e = Math.tanh(s1 * this.envValue1 * drive);
    const s2_e = Math.tanh(s2 * this.envValue2 * drive);
    
    this.smoothedCutoff1 += (currentParams[20] - this.smoothedCutoff1) * 0.05;
    this.smoothedRes1 += (currentParams[28] - this.smoothedRes1) * 0.05; // Smooth Res
    
    // Pass BOTH smoothed values
    this.updateFilterCoefficients(this.filterOsc1Coeffs, this.smoothedCutoff1, this.smoothedRes1);

    let s1_f=0; if (this.envStage1 !== 'off'){ const c1=this.filterOsc1Coeffs; s1_f=c1.b0*s1_e+c1.b1*this.filter_osc1_x1+c1.b2*this.filter_osc1_x2-c1.a1*this.filter_osc1_y1-c1.a2*this.filter_osc1_y2; this.filter_osc1_x2=this.filter_osc1_x1;this.filter_osc1_x1=s1_e;this.filter_osc1_y2=this.filter_osc1_y1;this.filter_osc1_y1=s1_f; } else { this.filter_osc1_x1=0;this.filter_osc1_x2=0;this.filter_osc1_y1=0;this.filter_osc1_y2=0; }
    
    // Voice 2: Smooth Cutoff AND Resonance
    this.smoothedCutoff2 += (currentParams[21] - this.smoothedCutoff2) * 0.05;
    this.smoothedRes2 += (currentParams[29] - this.smoothedRes2) * 0.05; // Smooth Res

    // Pass BOTH smoothed values
    this.updateFilterCoefficients(this.filterOsc2Coeffs, this.smoothedCutoff2, this.smoothedRes2);
    let s2_f=0; if (this.envStage2 !== 'off'){ const c2=this.filterOsc2Coeffs; s2_f=c2.b0*s2_e+c2.b1*this.filter_osc2_x1+c2.b2*this.filter_osc2_x2-c2.a1*this.filter_osc2_y1-c2.a2*this.filter_osc2_y2; this.filter_osc2_x2=this.filter_osc2_x1;this.filter_osc2_x1=s2_e;this.filter_osc2_y2=this.filter_osc2_y1;this.filter_osc2_y1=s2_f; } else { this.filter_osc2_x1=0;this.filter_osc2_x2=0;this.filter_osc2_y1=0;this.filter_osc2_y2=0; }
    
    s1_f *= currentParams[26] * 2.0; s2_f *= currentParams[27] * 2.0;
    // "Discrete Circuit" Panning
    let s_L = (s1_f * 0.8 + s2_f * 0.6) * 0.7;
    let s_R = (s1_f * 0.6 + s2_f * 0.8) * 0.7;
    
    this.smoothedDist += (currentParams[1] - this.smoothedDist) * 0.0025;
    const dV=this.smoothedDist;
    const dryL = s_L;
    const dryR = s_R;
    const targetDistWet = Math.max(0, Math.min(1, (dV - 0.001) * 5));
    this.distWet += (targetDistWet - this.distWet) * 0.01;
    let distL = s_L;
    let distR = s_R;
    if (dV > 0.001) {
        const distDrive = dV <= 0.5 ? 0.5 * Math.pow(dV / 0.5, 2) : dV;
        const dr = 1 + distDrive * 19;
        const k = 2 * dr / (1 + dr);
        
        // 1. Analog Saturation
        distL = (1 + k) * distL / (1 + k * Math.abs(distL));
        distR = (1 + k) * distR / (1 + k * Math.abs(distR));

        // 2. Bit-Crushing (High Definition / Subtle Mode)
        const nS = Math.max(2, Math.floor(Math.pow(1 - distDrive, 2.5) * 1024));
        const sS = 2.0 / nS;
        distL = sS * Math.floor(distL / sS + 0.5);
        distR = sS * Math.floor(distR / sS + 0.5);

        // 3. Gain Comp
        const gC = 1 / (1 + dV * 1.5);
        distL *= gC;
        distR *= gC;

        // 4. Adaptive Filter (Anti-Fizz)
        if (dV < 0.5) {
            const filterMix = (dV - 0.01) / (0.5 - 0.01);
            const cutoff = 500 + Math.max(0, filterMix) * ((sr * 0.5) - 500);
            const omega = 2 * Math.PI * cutoff / sr;
            const alpha = omega / (omega + 1);
            this.distLpL += alpha * (distL - this.distLpL);
            this.distLpR += alpha * (distR - this.distLpR);
            distL = this.distLpL;
            distR = this.distLpR;
        } else {
            this.distLpL = distL;
            this.distLpR = distR;
        }

        // 5. DC Blocker (Crucial for safety)
        const R = 0.995; 
        const yL = distL - this.dcBlocker.x1L + R * this.dcBlocker.y1L;
        this.dcBlocker.x1L = distL;
        this.dcBlocker.y1L = yL;
        distL = yL;

        const yR = distR - this.dcBlocker.x1R + R * this.dcBlocker.y1R;
        this.dcBlocker.x1R = distR;
        this.dcBlocker.y1R = yR;
        distR = yR;

    } else {
        // Distortion Off - Passthrough filter state
        this.distLpL = distL;
        this.distLpR = distR;
    }
    const wetMix = Math.min(1, Math.max(0, this.distWet));
    s_L = dryL + (distL - dryL) * wetMix;
    s_R = dryR + (distR - dryR) * wetMix;
    if(currentParams[5] > 0){ 
         const tremRateHz = 2 + (Math.pow(currentParams[5], 3) * 500);
         const tD = currentParams[5] * 0.8; 
        const t = Math.sin(this.tremoloPhase) * tD + (1.0 - tD); 
        s_L *= t; 
        s_R *= t; 
        this.tremoloPhase += (2 * Math.PI * tremRateHz) / sr;
        if(this.tremoloPhase >= 2 * Math.PI) {
            this.tremoloPhase -= 2 * Math.PI;
        }
    }
           const cW = currentParams[6];
    if(cW > 0){ 
        // --- JUNO-106 EMULATION (Mode I) ---
        // Rate: ~0.5 Hz
        this.chorusLfoPhase = (this.chorusLfoPhase + (2 * Math.PI * 0.513) / sr) % (2 * Math.PI);
        const lfo = Math.asin(Math.sin(this.chorusLfoPhase)) * (2 / Math.PI);

        // 3. Calculate Delay Times
        const dL = (0.02 + lfo * 0.005) * sr; 
        const dR = (0.02 - lfo * 0.005 * 0.95) * sr; 

        // 4. Write to Buffer
        this.chorusDelayBufferL[this.chorusWritePos] = s_L;
        this.chorusDelayBufferR[this.chorusWritePos] = s_R;

        // 5. Read & Mix (CROSSFADE REVERT)
        const cSL = this.getInterpolatedSample(this.chorusDelayBufferL, dL, this.chorusWritePos);
        const cSR = this.getInterpolatedSample(this.chorusDelayBufferR, dR, this.chorusWritePos);

        s_L = (s_L * (1 - cW)) + (cSL * cW); 
        s_R = (s_R * (1 - cW)) + (cSR * cW); 
    } 
    this.chorusWritePos = (this.chorusWritePos + 1) % this.chorusDelayBufferL.length;
    
    const dW = currentParams[14];
    const targetDT = 0.01 + currentParams[15] * 1.5;
    this.smoothDelayTime += (targetDT - this.smoothDelayTime) * 0.0005;

    if (dW > 0) {
        const rPL = (this.delayWritePos - Math.floor(this.smoothDelayTime * sr) + this.delayBufferL.length) % this.delayBufferL.length;
        const rPR = (this.delayWritePos - Math.floor(this.smoothDelayTime * sr * 0.5) + this.delayBufferR.length) % this.delayBufferR.length;
        
        const dSL = this.delayBufferL[rPL];
        const dSR = this.delayBufferR[rPR];
        
        this.delayBufferL[this.delayWritePos] = s_L + dSR * 0.6;
        this.delayBufferR[this.delayWritePos] = s_R + dSL * 0.6;
        
        s_L = (s_L * (1 - dW)) + (dSL * dW);
        s_R = (s_R * (1 - dW)) + (dSR * dW);
    } else {
        this.delayBufferL[this.delayWritePos] = 0;
        this.delayBufferR[this.delayWritePos] = 0;
    }
    this.delayWritePos = (this.delayWritePos + 1) % this.delayBufferL.length;

    const rW=currentParams[12]; if(rW>0){ let cO_L=0,cO_R=0; this.combsL.forEach(c=>cO_L+=c.process(s_L*0.1)); this.combsR.forEach(c=>cO_R+=c.process(s_R*0.1)); let aO_L=this.allpassesL[1].process(this.allpassesL[0].process(cO_L)); let aO_R=this.allpassesR[1].process(this.allpassesR[0].process(cO_R)); s_L=(s_L*(1-rW))+(aO_L*rW); s_R=(s_R*(1-rW))+(aO_R*rW); }
    
    this.updateFilterCoefficients(this.filterCoeffs, currentParams[2], 0.0);
    const cM=this.filterCoeffs; const yL=cM.b0*s_L+cM.b1*this.filter_x1_L+cM.b2*this.filter_x2_L-cM.a1*this.filter_y1_L-cM.a2*this.filter_y2_L; this.filter_x2_L=this.filter_x1_L;this.filter_x1_L=s_L;this.filter_y2_L=this.filter_y1_L;this.filter_y1_L=yL;
    const _yR=cM.b0*s_R+cM.b1*this.filter_x1_R+cM.b2*this.filter_x2_R-cM.a1*this.filter_y1_R-cM.a2*this.filter_y2_R; this.filter_x2_R=this.filter_x1_R;this.filter_x1_R=s_R;this.filter_y2_R=this.filter_y1_R;this.filter_y1_R=_yR;
    
   // 1. Apply Master Volume
    let finalL = yL * currentParams[7];
    let finalR = _yR * currentParams[7];

    // 2. Master Soft Clipper (Safety & Color)
    // Uses tanh to round off peaks > 1.0, preventing harsh digital clipping
   finalL = Math.tanh(finalL * 1.2); 
    finalR = Math.tanh(finalR * 1.2);

    // 3. Write to Output
    oL[i] = finalL; 
    oR[i] = finalR;
    if(this.isRecording){ 
        this.recL[this.recIndex] = finalL; 
        this.recR[this.recIndex] = finalR; 
        this.recIndex++; 
        if(this.recIndex >= this.recordBlockSize){ 
            const il=new Float32Array(this.recIndex*2); 
            for(let j=0,k=0;j<this.recIndex;j++){
                il[k++]=this.recL[j];
                il[k++]=this.recR[j];
            } 
            this.port.postMessage({type:'audio',data:il},[il.buffer]); 
            this.recIndex=0; 
        }
    }
}
if(++this.sampleCounter>128){
    this.port.postMessage({type:'envUpdate',data:{v0:this.envValue1,v1:this.envValue2}});
    this.sampleCounter=0;
}
return true;
}
}
registerProcessor('synth-processor', SynthProcessor);








