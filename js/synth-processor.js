// --- ZitaReverb Engine (Optimized) ---
class ZitaReverbEngine {
    constructor(sr) {
        this.sampleRate = sr;
        this.params = { preDel: 20.0, lfFc: 200.0, lowRt60: 1.0, midRt60: 1.0, hfDamp: 6000.0 };
        this.initConstants();
        this.initState();
    }

    initConstants() {
        const SR = this.sampleRate;
        this.fConst0 = Math.min(192000.0, Math.max(1.0, SR));
        this.fConst1 = 6.283185307179586 / this.fConst0;
        this.fConst2 = Math.floor(0.125 * this.fConst0 + 0.5);
        this.fConst3 = (0.0 - (6.907755278982137 * this.fConst2)) / this.fConst0;
        this.fConst4 = 3.141592653589793 / this.fConst0;
        this.fConst5 = Math.floor(0.0134579996 * this.fConst0 + 0.5);
        this.iConst6 = Math.min(8192, Math.max(0, this.fConst2 - this.fConst5));
        this.fConst7 = 0.001 * this.fConst0;
        this.iConst8 = Math.min(1024, Math.max(0, this.fConst5 - 1));

        this.delayConsts = [
            { main: Math.floor(0.219990999 * this.fConst0 + 0.5), apf: Math.floor(0.0191229992 * this.fConst0 + 0.5) },
            { main: Math.floor(0.192303002 * this.fConst0 + 0.5), apf: Math.floor(0.0292910002 * this.fConst0 + 0.5) },
            { main: Math.floor(0.174713001 * this.fConst0 + 0.5), apf: Math.floor(0.0229039993 * this.fConst0 + 0.5) },
            { main: Math.floor(0.256891012 * this.fConst0 + 0.5), apf: Math.floor(0.0273330007 * this.fConst0 + 0.5) },
            { main: Math.floor(0.127837002 * this.fConst0 + 0.5), apf: Math.floor(0.0316039994 * this.fConst0 + 0.5) },
            { main: Math.floor(0.210389003 * this.fConst0 + 0.5), apf: Math.floor(0.0244210009 * this.fConst0 + 0.5) },
            { main: Math.floor(0.153128996 * this.fConst0 + 0.5), apf: Math.floor(0.0203460008 * this.fConst0 + 0.5) },
            { main: this.fConst2, apf: this.fConst5 }
        ];

        this.decayConsts = this.delayConsts.map(dc => ({
            main: (0.0 - (6.907755278982137 * dc.main)) / this.fConst0,
            apf: dc.apf
        }));
    }

    initState() {
        const maxDelay = 32768;
        this.inputL = new Float32Array(maxDelay);
        this.inputR = new Float32Array(maxDelay);
        this.delays = [];
        for (let i = 0; i < 8; i++) {
            this.delays.push({ main: new Float32Array(maxDelay), apf: new Float32Array(4096) });
        }
        this.filterStates = [];
        for (let i = 0; i < 8; i++) {
            this.filterStates.push({ damping: [0, 0], lowpass: [0, 0], combOut: [0, 0], rec: [0, 0, 0] });
        }
        
        // FIX: Pre-allocate this array once to prevent garbage collection stutter
        this.combOuts = new Float32Array(8); 
        
        this.lfCoeff = { scale: 0, feedback: 0 }; 
        this.coeffs = [];
        this.IOTA = 0;
        this.preDelaySamples = 0;
        this.updateCoefficients(); // Initial update
    }

    power2(x) { return x * x; }

    updateCoefficients() {
        const params = this.params;
        const fSlow0 = Math.cos(this.fConst1 * params.hfDamp);
        this.coeffs = [];
        for (let i = 0; i < 8; i++) {
            const decayConst = this.decayConsts[i].main;
            const fSlow2 = Math.exp(decayConst / params.midRt60);
            const fSlow3 = this.power2(fSlow2);
            const fSlow4 = 1.0 - (fSlow0 * fSlow3);
            const fSlow5 = 1.0 - fSlow3;
            const fSlow6 = fSlow4 / fSlow5;
            const fSlow7 = Math.sqrt(Math.max(0.0, (this.power2(fSlow4) / this.power2(fSlow5)) - 1.0));
            const fSlow8 = fSlow6 - fSlow7;
            const fSlow9 = fSlow2 * (fSlow7 + (1.0 - fSlow6));
            const fSlow11 = (Math.exp(decayConst / params.lowRt60) / fSlow2) - 1.0;
            this.coeffs.push({ b0: fSlow8, a1: fSlow9, lowMult: fSlow11 });
        }
        const fSlow12 = 1.0 / Math.tan(this.fConst4 * params.lfFc);
        const fSlow13 = fSlow12 + 1.0;
        this.lfCoeff = { scale: 1.0 / fSlow13, feedback: (1.0 - fSlow12) / fSlow13 };
        this.preDelaySamples = Math.min(8192, Math.max(0, Math.floor(this.fConst7 * params.preDel)));
    }

    // Input: Stereo source arrays (block size). Output: Writes WET signal to outputL/outputR arrays.
    processBlock(inputL, inputR, outputL, outputR, blockSize) {
        // We only update coefficients if parameters changed, but for simplicity we can do it here 
        // or rely on the setter to trigger it. Doing it here ensures frame-perfect automation.
        this.updateCoefficients(); 

        for (let i = 0; i < blockSize; i++) {
            const idx = this.IOTA & 16383;
            this.inputL[idx] = inputL[i];
            this.inputR[idx] = inputR[i];

            const delayedL = this.inputL[(this.IOTA - this.preDelaySamples) & 16383];
            const delayedR = this.inputR[(this.IOTA - this.preDelaySamples) & 16383];
            const fTemp0 = 0.3 * delayedL;
            const fTemp2 = 0.3 * delayedR;
            
            // FIX: Use pre-allocated member variable instead of new Array(8)
            const combOuts = this.combOuts;

            // Unrolled loop for the 8 filters matching the Faust structure
            // Filter 0
            {
                const f = this.filterStates[0]; const coeff = this.coeffs[0];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - this.iConst6) & 16383;
                this.delays[0].main[idx] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = this.delays[0].main[delayIdx] - (0.6 * f.combOut[1]) - fTemp0;
                const apfIdx = (this.IOTA - this.iConst8) & 2047;
                this.delays[0].apf[(this.IOTA & 2047)] = apfInput;
                f.combOut[0] = this.delays[0].apf[apfIdx];
                combOuts[0] = 0.6 * apfInput;
            }
            // Filter 1
            {
                const f = this.filterStates[1]; const coeff = this.coeffs[1];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(16384, Math.max(0, this.delayConsts[1].main - this.delayConsts[1].apf))) & 32767;
                this.delays[1].main[(this.IOTA & 32767)] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = (0.6 * f.combOut[1]) + this.delays[1].main[delayIdx] - fTemp2;
                const apfIdx = (this.IOTA - Math.min(1024, Math.max(0, this.delayConsts[1].apf - 1))) & 2047;
                this.delays[1].apf[(this.IOTA & 2047)] = apfInput;
                f.combOut[0] = this.delays[1].apf[apfIdx];
                combOuts[1] = -0.6 * apfInput;
            }
            // Filter 2
            {
                const f = this.filterStates[2]; const coeff = this.coeffs[2];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(8192, Math.max(0, this.delayConsts[2].main - this.delayConsts[2].apf))) & 16383;
                this.delays[2].main[idx] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = (0.6 * f.combOut[1]) + this.delays[2].main[delayIdx] + fTemp2;
                const apfIdx = (this.IOTA - Math.min(2048, Math.max(0, this.delayConsts[2].apf - 1))) & 4095;
                this.delays[2].apf[(this.IOTA & 4095)] = apfInput;
                f.combOut[0] = this.delays[2].apf[apfIdx];
                combOuts[2] = -0.6 * apfInput;
            }
            // Filter 3
            {
                const f = this.filterStates[3]; const coeff = this.coeffs[3];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(8192, Math.max(0, this.delayConsts[3].main - this.delayConsts[3].apf))) & 16383;
                this.delays[3].main[idx] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = this.delays[3].main[delayIdx] + fTemp0 - (0.6 * f.combOut[1]);
                const apfIdx = (this.IOTA - Math.min(2048, Math.max(0, this.delayConsts[3].apf - 1))) & 4095;
                this.delays[3].apf[(this.IOTA & 4095)] = apfInput;
                f.combOut[0] = this.delays[3].apf[apfIdx];
                combOuts[3] = 0.6 * apfInput;
            }
            // Filter 4
            {
                const f = this.filterStates[4]; const coeff = this.coeffs[4];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(16384, Math.max(0, this.delayConsts[4].main - this.delayConsts[4].apf))) & 32767;
                this.delays[4].main[(this.IOTA & 32767)] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = (0.6 * f.combOut[1]) + this.delays[4].main[delayIdx] - fTemp2;
                const apfIdx = (this.IOTA - Math.min(2048, Math.max(0, this.delayConsts[4].apf - 1))) & 4095;
                this.delays[4].apf[(this.IOTA & 4095)] = apfInput;
                f.combOut[0] = this.delays[4].apf[apfIdx];
                combOuts[4] = -0.6 * apfInput;
            }
            // Filter 5
            {
                const f = this.filterStates[5]; const coeff = this.coeffs[5];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(8192, Math.max(0, this.delayConsts[5].main - this.delayConsts[5].apf))) & 16383;
                this.delays[5].main[idx] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = this.delays[5].main[delayIdx] - (0.6 * f.combOut[1]) - fTemp0;
                const apfIdx = (this.IOTA - Math.min(2048, Math.max(0, this.delayConsts[5].apf - 1))) & 4095;
                this.delays[5].apf[(this.IOTA & 4095)] = apfInput;
                f.combOut[0] = this.delays[5].apf[apfIdx];
                combOuts[5] = 0.6 * apfInput;
            }
            // Filter 6
            {
                const f = this.filterStates[6]; const coeff = this.coeffs[6];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(16384, Math.max(0, this.delayConsts[6].main - this.delayConsts[6].apf))) & 32767;
                this.delays[6].main[(this.IOTA & 32767)] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = (0.6 * f.combOut[1]) + this.delays[6].main[delayIdx] + fTemp2;
                const apfIdx = (this.IOTA - Math.min(2048, Math.max(0, this.delayConsts[6].apf - 1))) & 4095;
                this.delays[6].apf[(this.IOTA & 4095)] = apfInput;
                f.combOut[0] = this.delays[6].apf[apfIdx];
                combOuts[6] = -0.6 * apfInput;
            }
            // Filter 7
            {
                const f = this.filterStates[7]; const coeff = this.coeffs[7];
                f.lowpass[0] = (this.lfCoeff.scale * (f.rec[1] + f.rec[2])) + (this.lfCoeff.feedback * f.lowpass[1]);
                f.damping[0] = (coeff.b0 * f.damping[1]) + (coeff.a1 * (f.rec[1] + (coeff.lowMult * f.lowpass[0])));
                const delayIdx = (this.IOTA - Math.min(8192, Math.max(0, this.delayConsts[7].main - this.delayConsts[7].apf))) & 16383;
                this.delays[7].main[idx] = (0.353553385 * f.damping[0]) + 1e-20;
                const apfInput = this.delays[7].main[delayIdx] + fTemp0 - (0.6 * f.combOut[1]);
                const apfIdx = (this.IOTA - Math.min(1024, Math.max(0, this.delayConsts[7].apf - 1))) & 2047;
                this.delays[7].apf[(this.IOTA & 2047)] = apfInput;
                f.combOut[0] = this.delays[7].apf[apfIdx];
                combOuts[7] = 0.6 * apfInput;
            }

            // Feedback matrix
            const fTemp10 = this.filterStates[7].combOut[1] + combOuts[7];
            const fTemp11 = combOuts[6] + (this.filterStates[6].combOut[1] + fTemp10);
            const fTemp12 = combOuts[4] + (this.filterStates[4].combOut[1] + (combOuts[5] + (this.filterStates[5].combOut[1] + fTemp11)));

            const fRec0 = combOuts[0] + (combOuts[1] + (this.filterStates[1].combOut[1] + (this.filterStates[0].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp12)))))));
            
            const fTemp13 = combOuts[5] + (this.filterStates[5].combOut[1] + fTemp10);
            const fTemp14 = this.filterStates[6].combOut[1] + combOuts[6];
            const fTemp15 = combOuts[4] + (this.filterStates[4].combOut[1] + fTemp14);
            const fRec1 = (combOuts[0] + (this.filterStates[0].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp13)))) - (combOuts[1] + (this.filterStates[1].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + fTemp15))));
            
            const fTemp16 = combOuts[4] + (this.filterStates[4].combOut[1] + (this.filterStates[5].combOut[1] + combOuts[5]));
            const fRec2 = (combOuts[2] + (this.filterStates[2].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp11)))) - (combOuts[0] + (combOuts[1] + (this.filterStates[1].combOut[1] + (this.filterStates[0].combOut[1] + fTemp16))));
            
            const fTemp17 = combOuts[4] + (this.filterStates[4].combOut[1] + fTemp10);
            const fTemp18 = combOuts[5] + (this.filterStates[5].combOut[1] + fTemp14);
            const fRec3 = (combOuts[1] + (this.filterStates[1].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp17)))) - (combOuts[0] + (this.filterStates[0].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + fTemp18))));
            
            const fRec4 = fTemp12 - (combOuts[0] + (combOuts[1] + (this.filterStates[1].combOut[1] + (this.filterStates[0].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + (this.filterStates[3].combOut[1] + combOuts[3])))))));
            const fRec5 = (combOuts[1] + (this.filterStates[1].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + fTemp13)))) - (combOuts[0] + (this.filterStates[0].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp15))));
            const fRec6 = (combOuts[0] + (combOuts[1] + (this.filterStates[1].combOut[1] + (this.filterStates[0].combOut[1] + fTemp11)))) - (combOuts[2] + (this.filterStates[2].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp16))));
            const fRec7 = (combOuts[0] + (this.filterStates[0].combOut[1] + (combOuts[2] + (this.filterStates[2].combOut[1] + fTemp17)))) - (combOuts[1] + (this.filterStates[1].combOut[1] + (combOuts[3] + (this.filterStates[3].combOut[1] + fTemp18))));

            outputL[i] = 0.37 * (fRec1 + fRec2);
            outputR[i] = 0.37 * (fRec1 - fRec2);

            // Update state
            for (let j = 0; j < 8; j++) {
                const f = this.filterStates[j];
                f.lowpass[1] = f.lowpass[0];
                f.damping[1] = f.damping[0];
                f.combOut[1] = f.combOut[0];
            }
            this.filterStates[0].rec[2]=this.filterStates[0].rec[1]; this.filterStates[0].rec[1]=this.filterStates[0].rec[0]; this.filterStates[0].rec[0]=fRec0;
            this.filterStates[1].rec[2]=this.filterStates[1].rec[1]; this.filterStates[1].rec[1]=this.filterStates[1].rec[0]; this.filterStates[1].rec[0]=fRec1;
            this.filterStates[2].rec[2]=this.filterStates[2].rec[1]; this.filterStates[2].rec[1]=this.filterStates[2].rec[0]; this.filterStates[2].rec[0]=fRec2;
            this.filterStates[3].rec[2]=this.filterStates[3].rec[1]; this.filterStates[3].rec[1]=this.filterStates[3].rec[0]; this.filterStates[3].rec[0]=fRec3;
            this.filterStates[4].rec[2]=this.filterStates[4].rec[1]; this.filterStates[4].rec[1]=this.filterStates[4].rec[0]; this.filterStates[4].rec[0]=fRec4;
            this.filterStates[5].rec[2]=this.filterStates[5].rec[1]; this.filterStates[5].rec[1]=this.filterStates[5].rec[0]; this.filterStates[5].rec[0]=fRec5;
            this.filterStates[6].rec[2]=this.filterStates[6].rec[1]; this.filterStates[6].rec[1]=this.filterStates[6].rec[0]; this.filterStates[6].rec[0]=fRec6;
            this.filterStates[7].rec[2]=this.filterStates[7].rec[1]; this.filterStates[7].rec[1]=this.filterStates[7].rec[0]; this.filterStates[7].rec[0]=fRec7;

            this.IOTA++;
        }
    }
}

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
                   this.params=new Array(36).fill(0.0);
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
                   this.smoothedCutoff1 = 0.5;
                   this.smoothedCutoff2 = 0.5;
                   this.smoothedRes1 = 0.0;
                   this.smoothedRes2 = 0.0;
                   this.filterCoeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.updateFilterCoefficients(this.filterCoeffs, 1.0, 0.0);
                   this.filterOsc1Coeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.filter_osc1_x1=0; this.filter_osc1_x2=0; this.filter_osc1_y1=0; this.filter_osc1_y2=0; this.updateDjFilterCoefficients(this.filterOsc1Coeffs, 0.5, 0.0);
                   this.filterOsc2Coeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.filter_osc2_x1=0; this.filter_osc2_x2=0; this.filter_osc2_y1=0; this.filter_osc2_y2=0; this.updateDjFilterCoefficients(this.filterOsc2Coeffs, 0.5, 0.0);
                   this.breakFilterCoeffs={b0:1,b1:0,b2:0,a1:0,a2:0}; this.break_filter_x1=0; this.break_filter_x2=0; this.break_filter_y1=0; this.break_filter_y2=0; this.smoothedBreakCutoff=0.5; this.smoothedBreakRes=0.0; this.updateDjFilterCoefficients(this.breakFilterCoeffs, 0.5, 0.0);
                   // Delay & Chorus state
                   this.delayBufferL=new Float32Array(sampleRate*2);this.delayBufferR=new Float32Array(sampleRate*2);this.delayWritePos=0;
                   this.smoothDelayTime = 0.01;
                   this.chorusLfoPhase=0; this.chorusDelayBufferL=new Float32Array(Math.floor(sampleRate*0.05)); this.chorusDelayBufferR=new Float32Array(Math.floor(sampleRate*0.05)); this.chorusWritePos=0;
                   
                   // Reverb state (REPLACED WITH ZITA)
                   this.zita = new ZitaReverbEngine(sampleRate);
                   this.zitaPreL = new Float32Array(128); // Pre-reverb, post-delay buffer
                   this.zitaPreR = new Float32Array(128);
                   this.zitaWetL = new Float32Array(128);
                   this.zitaWetR = new Float32Array(128);

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

                   // --- Sampler State ---
                   this.sampleBuffer = null;
                   this.sampleSourceRate = sampleRate;
                   this.sampleLength = 0;
                   this.sliceLength = 0;
                   this.samplerPlayback = { active: false, position: 0, end: 0, rate: 1, loop: false };
                   this.slipWindowSeconds = 0;
                   this.slipWindowSamples = 0;
                   this.slipRenderPhase = 0;
                   this.slipAnchorStart = 0;
                   this.slipActive = false;
                   this.breakFxSend = 0;
                   this.slipAnchorMode = true;

                   // --- Soundfont State ---
                   this.soundfontSamples = [];
                   this.soundfontActiveIndex = -1;
                   this.soundfontVoices = [
                       { position: 0 },
                       { position: 0 },
                   ];
                   this.breakBypassL = new Float32Array(128);
                   this.breakBypassR = new Float32Array(128);

                 this.recomputeSlipWindow = () => {
   if (this.slipWindowSeconds > 0 && this.samplerPlayback.rate > 0) {
       const newWindowSamples = this.slipWindowSeconds * this.samplerPlayback.rate * sampleRate;

       // 1. Determine if we need to set a new anchor
       // (If in Catch Mode, OR if this is the first activation)
       if (!this.slipAnchorMode || !this.slipActive) {
           // Latch to the *current* playhead position instead of rewinding to a previous bucket
           const currentPos = Math.max(0, this.samplerPlayback.position);
           this.slipAnchorStart = this.sampleLength > 0
               ? (currentPos % this.sampleLength)
               : currentPos;

           // --- FIX: Tell the UI exactly where we latched ---
           if (this.sampleLength > 0) {
               this.port.postMessage({
                   type: 'reportBreakAnchor',
                   data: this.slipAnchorStart / this.sampleLength
               });
           }
       }

       this.slipWindowSamples = newWindowSamples;
       
       if (!this.slipActive) {
            this.slipRenderPhase = 0; 
       }
       
       this.slipActive = this.slipWindowSamples > 0;
   } else {
       this.slipWindowSamples = 0;
       this.slipRenderPhase = 0;
       this.slipAnchorStart = 0;
       this.slipActive = false;
   }
};
      
                   this.port.onmessage = ({ data: { type, data } }) => {
                       const { voice, freq, id, value, lfoId, param } = data || {};
                       switch (type) {
                           case 'noteOn':
    if (voice === 0) {
        this.noteOn1 = true;
        this.targetFrequency1 = freq;
        if (this.params[0] < 0.01) this.currentFrequency1 = freq;
        if (this.soundfontVoices[0]) this.soundfontVoices[0].position = 0;
        this.envStage1 = 'attack';
    }
    else {
        this.noteOn2 = true;
        this.targetFrequency2 = freq;
        if (this.params[0] < 0.01) this.currentFrequency2 = freq;
        if (this.soundfontVoices[1]) this.soundfontVoices[1].position = 0;
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
                        case 'setBreakSlipMode':
    this.slipAnchorMode = !!(data && data.enabled);
    break;

                           case 'setFreq': if (voice === 0) { this.targetFrequency1 = freq; } else { this.targetFrequency2 = freq; } break;
                           case 'setFx':
                               if (id >= 0 && id < this.params.length) { this.params[id] = value; }
                               if(id===2){ this.updateFilterCoefficients(this.filterCoeffs, value, 0.0); }
                               else if(id===8){ this.attackTime=0.001+Math.pow(value,2)*2; } else if(id===9){ this.decayTime=0.001+Math.pow(value,2)*2; }
                               else if(id===10){ this.sustainLevel=value; } else if(id===11){ this.releaseTime=0.001+Math.pow(value,2)*1.25; this.releaseRate=Math.exp(-1/(this.releaseTime*sampleRate)); }
                               // Reverb Params Mapping
                               else if(id===13){
                                // Map 0-1 knob to LARGER RT60 ranges
                                // lowRt60: 0.5s -> 5.5s (Huge bass decay)
                                 // midRt60: 0.4s -> 4.5s (Long atmospheric tail)
                                   this.zita.params.lowRt60 = 0.5 + value * 5.0;
                                   this.zita.params.midRt60 = 0.4 + value * 4.1;
    
                                  // Open up the filter as the room gets bigger (same as before)
                                  this.zita.params.hfDamp = 3000 + value * 5000;
                                    }
                               else if (id===20 || id===28){ this.updateDjFilterCoefficients(this.filterOsc1Coeffs, this.params[20], this.params[28]); }
                               else if(id===21 || id===29){ this.updateDjFilterCoefficients(this.filterOsc2Coeffs, this.params[21], this.params[29]); }
                               else if(id===32 || id===33){ this.updateDjFilterCoefficients(this.breakFilterCoeffs, this.params[32], this.params[33]); }
                               break;
                       case 'setSampleBuffer':
    if (data?.samples) {
        // 1. Determine Phase: Prefer the "Grid Phase" sent from Main Thread
        let nextPositionPhase = 0;
        
        if (typeof data.phase === 'number') {
            // Hard Sync: Use the exact bar position calculated by the UI
            nextPositionPhase = data.phase;
        } 
        else if (this.sampleLength > 0 && this.samplerPlayback.position > 0) {
            // Soft Sync (Fallback): Preserve relative progress of previous loop
            nextPositionPhase = this.samplerPlayback.position / this.sampleLength;
        }

        // 2. Swap the Buffer
        this.sampleBuffer = data.samples;
        this.sampleSourceRate = data.sampleRate || sampleRate;
        this.sampleLength = this.sampleBuffer.length;
        this.sliceLength = this.sampleLength / 16;

        // 3. Apply Phase immediately
        if (this.samplerPlayback.active && this.sampleLength > 0) {
            this.samplerPlayback.position = nextPositionPhase * this.sampleLength;
            
            // Also snap the slip phase to prevent glitching artifacts
            if (this.slipRenderPhase > 0) {
                 this.slipRenderPhase = nextPositionPhase * this.sampleLength;
            }
        }
    }
    break;
                          case 'setSoundfont': {
                              const incoming = Array.isArray(data?.samples) ? data.samples : [];
                              const converted = incoming.map(s => ({
                                  name: s.name || 'Sample',
                                  sampleRate: s.sampleRate || sampleRate,
                                  originalPitch: s.originalPitch || 60,
                                  pitchCorrection: s.pitchCorrection || 0,
                                  loopStart: s.loopStart || 0,
                                  loopEnd: s.loopEnd || 0,
                                  data: s.data ? new Float32Array(s.data) : new Float32Array(0),
                              }));
                              this.soundfontSamples = converted;
                              const requestedIndex = Number.isInteger(data?.activeIndex) ? data.activeIndex : 0;
                              this.soundfontActiveIndex = converted.length ? Math.max(0, Math.min(requestedIndex, converted.length - 1)) : -1;
                              this.resetSoundfontVoices();
                              break;
                          }
                          case 'setSoundfontActiveIndex': {
                              const nextIndex = Number.isInteger(data?.index) ? data.index : -1;
                              if (nextIndex >= 0 && nextIndex < this.soundfontSamples.length) {
                                  this.soundfontActiveIndex = nextIndex;
                                  this.resetSoundfontVoices();
                              }
                              break;
                          }
                          case 'setBreakPosition':
                              if (this.samplerPlayback && this.samplerPlayback.active && this.sampleBuffer) {
                                  const target = Math.max(0, Math.min(this.sampleLength, data?.position || 0));
                                  this.samplerPlayback.position = target;
                                   this.slipRenderPhase = target;
                               }
                               break;
                           case 'startBreakLoop':
                               if (this.sampleBuffer && this.sampleLength > 0) {
                                   const playbackRate = Math.max(0.01, data?.playbackRate || 1);
                                   const rate = playbackRate * (this.sampleSourceRate / sampleRate);
                                   this.samplerPlayback = { active: true, position: 0, end: this.sampleLength, rate, loop: true };
                                   this.recomputeSlipWindow();
                               }
                               break;
                           case 'stopBreakLoop':
                               this.samplerPlayback = { active: false, position: 0, end: 0, rate: 1, loop: false };
                               this.slipRenderPhase = 0;
                               break;
                           case 'setBreakPlaybackRate':
                               if (this.samplerPlayback && this.samplerPlayback.active) {
                                   const playbackRate = Math.max(0.01, data?.playbackRate || 1);
                                   this.samplerPlayback.rate = playbackRate * (this.sampleSourceRate / sampleRate);
                                   this.recomputeSlipWindow();
                               }
                               break;
                           case 'setBreakSlipWindow':
                               this.slipWindowSeconds = Math.max(0, data?.windowSeconds || 0);
                               this.recomputeSlipWindow();
                               break;
                           case 'setBreakFxSend':
                               if (data && data.amount !== undefined) {
                                   this.breakFxSend = Math.max(0, Math.min(1, data.amount));
                               } else {
                                   this.breakFxSend = data && data.enabled ? 1 : 0;
                               }
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
                   this.params[20] = 0.5; this.params[21] = 0.5; this.params[26] = 0.5; this.params[27] = 0.5;
                   this.params[32] = 0.5; this.params[33] = 0.0; this.params[34] = 0.7;
               }
      updateFilterCoefficients(c,v, res){ const p=Math.pow(v,3); const Q=0.707 + Math.pow(res, 2) * 24; const w=2*Math.PI*(40+p*(sampleRate/2.2-40))/sampleRate; const s=Math.sin(w); const a=s/(2*Q); const i=1/(1+a); c.b0=(1-Math.cos(w))/2*i; c.b1=(1-Math.cos(w))*i; c.b2=(1-Math.cos(w))/2*i; c.a1=-2*Math.cos(w)*i; c.a2=(1-a)*i; }
               updateDjFilterCoefficients(c, v, res) {
    const centerOffset = v - 0.5;
    const amount = Math.min(1, Math.max(0, Math.abs(centerOffset) * 2));
    if (amount < 0.001) {
        c.b0 = 1; c.b1 = 0; c.b2 = 0; c.a1 = 0; c.a2 = 0;
        return;
    }

    // FIX: "Safe Zone Fade"
    // Multiply 'amount' by 10 so the fade happens very quickly.
    // Result: Resonance is untouched (1.0) for 90% of the knob's range.
    // It only fades out when you are within +/- 5% of the center.
    const fade = Math.min(1, amount * 10);
    const scaledRes = res * fade;
    
    const Q = 0.707 + Math.pow(scaledRes, 2) * 24;
                   const freqNorm = centerOffset < 0
                       ? Math.pow(1 - amount, 3)
                       : Math.pow(amount, 3);
                   const w = 2 * Math.PI * (40 + freqNorm * (sampleRate / 2.2 - 40)) / sampleRate;
                   const s = Math.sin(w);
                   const cosw = Math.cos(w);
                   const a = s / (2 * Q);
                   const i = 1 / (1 + a);

                   if (centerOffset < 0) {
                       c.b0 = (1 - cosw) / 2 * i;
                       c.b1 = (1 - cosw) * i;
                       c.b2 = (1 - cosw) / 2 * i;
                   } else {
                       c.b0 = (1 + cosw) / 2 * i;
                       c.b1 = -(1 + cosw) * i;
                       c.b2 = (1 + cosw) / 2 * i;
                   }
                   c.a1 = -2 * cosw * i;
                   c.a2 = (1 - a) * i;
               }
               
               // --- CHORUS INTERPOLATION HELPER ---
               getInterpolatedSample(buffer, delaySamples, writePos) {
                   let readPos = writePos - delaySamples;
                   while (readPos < 0) readPos += buffer.length;
                   
                   const idxA = Math.floor(readPos);
                   const idxB = (idxA + 1) % buffer.length;
                   const frac = readPos - idxA;

                   return buffer[idxA] * (1 - frac) + buffer[idxB] * frac;
               }

               getSamplerSample(position) {
                   if (!this.sampleBuffer || this.sampleLength === 0) return 0;
                   const clamped = Math.max(0, Math.min(this.sampleLength - 1.001, position));
                   const idxA = Math.floor(clamped);
                   const idxB = Math.min(this.sampleLength - 1, idxA + 1);
               const frac = clamped - idxA;
               return (this.sampleBuffer[idxA] * (1 - frac)) + (this.sampleBuffer[idxB] * frac);
           }

               getActiveSoundfontSample() {
                   if (this.soundfontActiveIndex < 0 || this.soundfontActiveIndex >= this.soundfontSamples.length) return null;
                   return this.soundfontSamples[this.soundfontActiveIndex];
               }

               resetSoundfontVoices() {
                   this.soundfontVoices.forEach(v => { v.position = 0; });
               }

               getSoundfontVoiceSample(voiceIndex, frequency) {
                   const sample = this.getActiveSoundfontSample();
                   if (!sample || !sample.data || !sample.data.length) return 0;

                   const basePitch = sample.originalPitch || 60;
                   const baseFreq = 440 * Math.pow(2, (basePitch - 69) / 12);
                   const rateBase = sample.sampleRate ? (sample.sampleRate / sampleRate) : 1;
                   const rate = baseFreq > 0 ? (frequency / baseFreq) * rateBase : rateBase;

                   const voiceState = this.soundfontVoices[voiceIndex];
                   const loopStart = sample.loopStart || 0;
                   const loopEnd = sample.loopEnd && sample.loopEnd > loopStart ? sample.loopEnd : sample.data.length;

                   let pos = voiceState.position;
                   if (pos >= loopEnd && loopEnd > loopStart) {
                       pos = loopStart + ((pos - loopStart) % (loopEnd - loopStart));
                   }
                   const idxA = Math.floor(pos);
                   const idxB = Math.min(sample.data.length - 1, idxA + 1);
                   const frac = pos - idxA;
                   const value = (sample.data[idxA] * (1 - frac)) + (sample.data[idxB] * frac);

                   if (voiceState.position < 100) {
                       return value * (voiceState.position / 100);
                   }

                   voiceState.position = pos + rate;
                   return value;
               }

               process(i,o,p){
                   const oL=o[0][0]; const oR=o[0][1]; const sr=sampleRate;
                   const blockSize = oL.length;

                   // Ensure temp buffers are correct size (128 usually)
                   if (this.zitaPreL.length !== blockSize) {
                        this.zitaPreL = new Float32Array(blockSize);
                        this.zitaPreR = new Float32Array(blockSize);
                        this.zitaWetL = new Float32Array(blockSize);
                        this.zitaWetR = new Float32Array(blockSize);
                   }

                   if (this.breakBypassL.length !== blockSize) {
                        this.breakBypassL = new Float32Array(blockSize);
                        this.breakBypassR = new Float32Array(blockSize);
                   } else {
                        this.breakBypassL.fill(0);
                        this.breakBypassR.fill(0);
                   }

// --- LFO Processing (with LFO-to-LFO modulation) ---
let rawLfoOutputs = [0, 0, 0, 0];
const baseBreakFxSend = this.breakFxSend;
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
        const phaseInc = (2 * Math.PI * rateHz * blockSize) / sr;
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
                const phaseInc = (2 * Math.PI * rateHz * blockSize) / sr;
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

const breakFxSend = Math.max(0, Math.min(1, baseBreakFxSend + (modulatedFx[37] || 0)));

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
        case 2: return Math.sin(phase) * 1.5; // Sine
        case 3: return ((2 / Math.PI) * Math.asin(Math.sin(phase))) * 1.5; // Triangle
        
        default: return (phase / Math.PI) - 1.0;
    }
};

const waveType1 = Math.min(3, Math.max(0, Math.floor((currentParams[30] || 0) * 4)));
const waveType2 = Math.min(3, Math.max(0, Math.floor((currentParams[31] || 0) * 4)));

// Update filter once per block to avoid zipper noise on master
this.updateFilterCoefficients(this.filterCoeffs, currentParams[2], 0.0);
const cM=this.filterCoeffs;

// --- BLOCK PROCESSING LOOP 1: Synthesis & Pre-Reverb FX ---
for(let i=0;i<blockSize;i++){

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
    const hasSoundfont = !!this.getActiveSoundfontSample();

    if (hasSoundfont) {
        if (this.noteOn1 || this.envStage1 === 'release') {
            s1 = this.getSoundfontVoiceSample(0, this.currentFrequency1 || this.targetFrequency1);
        }
        if (this.noteOn2 || this.envStage2 === 'release') {
            s2 = this.getSoundfontVoiceSample(1, this.currentFrequency2 || this.targetFrequency2);
        }
    } else {
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
    }

    let sampleVal = 0;
    if (this.samplerPlayback.active && this.sampleBuffer) {
        const effectivePos = Math.max(0, this.samplerPlayback.position);

        if (effectivePos >= this.sampleLength || effectivePos >= this.samplerPlayback.end) {
            if (this.samplerPlayback.loop) {
                this.samplerPlayback.position = this.samplerPlayback.position % this.sampleLength;
                if (!this.slipActive) {
                    this.slipAnchorStart = Math.max(0, this.samplerPlayback.position - this.slipWindowSamples);
                    this.slipRenderPhase = 0;
                }
            } else {
                this.samplerPlayback.active = false;
            }
        }

        if (this.samplerPlayback.active) {
            let renderPos = this.samplerPlayback.position;
            if (this.slipActive && this.slipWindowSamples > 0) {
                const windowSize = Math.max(1, this.slipWindowSamples);
                const anchor = Math.max(0, this.slipAnchorStart % this.sampleLength);
                renderPos = (anchor + (this.slipRenderPhase % windowSize)) % this.sampleLength;
                this.slipRenderPhase += this.samplerPlayback.rate;
            } else {
                this.slipRenderPhase = 0;
            }

            sampleVal = this.getSamplerSample(renderPos);
            this.samplerPlayback.position += this.samplerPlayback.rate;
        }
    }

    this.smoothedBreakCutoff += (currentParams[32] - this.smoothedBreakCutoff) * 0.05;
    this.smoothedBreakRes += (currentParams[33] - this.smoothedBreakRes) * 0.05;
    this.updateDjFilterCoefficients(this.breakFilterCoeffs, this.smoothedBreakCutoff, this.smoothedBreakRes);

    let sampleFiltered = sampleVal;
    if (this.samplerPlayback.active) {
        const cB = this.breakFilterCoeffs;
        sampleFiltered = cB.b0*sampleVal + cB.b1*this.break_filter_x1 + cB.b2*this.break_filter_x2 - cB.a1*this.break_filter_y1 - cB.a2*this.break_filter_y2;
        this.break_filter_x2 = this.break_filter_x1; this.break_filter_x1 = sampleVal; this.break_filter_y2 = this.break_filter_y1; this.break_filter_y1 = sampleFiltered;
    } else {
        this.break_filter_x1 = this.break_filter_x2 = 0; this.break_filter_y1 = this.break_filter_y2 = 0;
    }

    const sampleGain = Math.max(0, Math.min(1.5, currentParams[34] ?? 0));
    const sampleMixL = sampleFiltered * sampleGain;
    const sampleMixR = sampleFiltered * sampleGain;

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
    this.updateDjFilterCoefficients(this.filterOsc1Coeffs, this.smoothedCutoff1, this.smoothedRes1);

    let s1_f=0; if (this.envStage1 !== 'off'){ const c1=this.filterOsc1Coeffs; s1_f=c1.b0*s1_e+c1.b1*this.filter_osc1_x1+c1.b2*this.filter_osc1_x2-c1.a1*this.filter_osc1_y1-c1.a2*this.filter_osc1_y2; this.filter_osc1_x2=this.filter_osc1_x1;this.filter_osc1_x1=s1_e;this.filter_osc1_y2=this.filter_osc1_y1;this.filter_osc1_y1=s1_f; } else { this.filter_osc1_x1=0;this.filter_osc1_x2=0;this.filter_osc1_y1=0;this.filter_osc1_y2=0; }
    
    // Voice 2: Smooth Cutoff AND Resonance
    this.smoothedCutoff2 += (currentParams[21] - this.smoothedCutoff2) * 0.05;
    this.smoothedRes2 += (currentParams[29] - this.smoothedRes2) * 0.05; // Smooth Res

    // Pass BOTH smoothed values
    this.updateDjFilterCoefficients(this.filterOsc2Coeffs, this.smoothedCutoff2, this.smoothedRes2);
    let s2_f=0; if (this.envStage2 !== 'off'){ const c2=this.filterOsc2Coeffs; s2_f=c2.b0*s2_e+c2.b1*this.filter_osc2_x1+c2.b2*this.filter_osc2_x2-c2.a1*this.filter_osc2_y1-c2.a2*this.filter_osc2_y2; this.filter_osc2_x2=this.filter_osc2_x1;this.filter_osc2_x1=s2_e;this.filter_osc2_y2=this.filter_osc2_y1;this.filter_osc2_y1=s2_f; } else { this.filter_osc2_x1=0;this.filter_osc2_x2=0;this.filter_osc2_y1=0;this.filter_osc2_y2=0; }
    
    s1_f *= currentParams[26] * 2.0; s2_f *= currentParams[27] * 2.0;
    // "Discrete Circuit" Panning
    let s_L = (s1_f * 0.8 + s2_f * 0.6) * 0.7;
    let s_R = (s1_f * 0.6 + s2_f * 0.8) * 0.7;

    if (sampleMixL !== 0 || sampleMixR !== 0) {
        const wetAmount = Math.max(0, Math.min(1, breakFxSend));
        const dryAmount = 1 - wetAmount;
        if (wetAmount > 0) {
            s_L += sampleMixL * wetAmount;
            s_R += sampleMixR * wetAmount;
        }
        if (dryAmount > 0) {
            this.breakBypassL[i] += sampleMixL * dryAmount;
            this.breakBypassR[i] += sampleMixR * dryAmount;
        }
    }
    
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
        const nS = Math.max(2, Math.floor(Math.pow(1 - distDrive, 2.5) * 128));
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

    // --- REVERB IS NOW PROCESSED LATER ---
    // Store Pre-Reverb Signal in buffers for block processing
    this.zitaPreL[i] = s_L;
    this.zitaPreR[i] = s_R;
}

// --- BLOCK PROCESSING STEP 2: ZITA REVERB ---
const rW=currentParams[12]; 
if(rW > 0){ 
    // Process the block through Zita
    // This writes the WET signal into this.zitaWetL/R
    this.zita.processBlock(this.zitaPreL, this.zitaPreR, this.zitaWetL, this.zitaWetR, blockSize);
}

// --- BLOCK PROCESSING STEP 3: Mix, Filter, & Master Volume ---
for(let i=0; i<blockSize; i++) {
    // 1. Retrieve signals
    let s_L = this.zitaPreL[i];
    let s_R = this.zitaPreR[i];

    // 2. Mix Reverb
    if(rW > 0) {
        const wetL = this.zitaWetL[i];
        const wetR = this.zitaWetR[i];
        s_L = (s_L * (1 - rW)) + (wetL * rW);
        s_R = (s_R * (1 - rW)) + (wetR * rW);
    }

    // 3. Master Filter
    // (Coefficient cM was updated before the loops)
    const yL=cM.b0*s_L+cM.b1*this.filter_x1_L+cM.b2*this.filter_x2_L-cM.a1*this.filter_y1_L-cM.a2*this.filter_y2_L; 
    this.filter_x2_L=this.filter_x1_L;this.filter_x1_L=s_L;this.filter_y2_L=this.filter_y1_L;this.filter_y1_L=yL;
    
    const _yR=cM.b0*s_R+cM.b1*this.filter_x1_R+cM.b2*this.filter_x2_R-cM.a1*this.filter_y1_R-cM.a2*this.filter_y2_R; 
    this.filter_x2_R=this.filter_x1_R;this.filter_x1_R=s_R;this.filter_y2_R=this.filter_y1_R;this.filter_y1_R=_yR;
    
   // 4. Apply Master Volume
    const bypassL = this.breakBypassL[i];
    const bypassR = this.breakBypassR[i];
    let finalL = (yL + bypassL) * currentParams[7];
    let finalR = (_yR + bypassR) * currentParams[7];

    // 5. Master Soft Clipper
   finalL = Math.tanh(finalL * 1.2); 
    finalR = Math.tanh(finalR * 1.2);

    // 6. Write to Output
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









