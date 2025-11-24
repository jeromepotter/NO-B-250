# NO-B 250 

A browser-based dual-oscillator synthesizer with vintage-inspired sound and modern modulation capabilities.

## Features

### Core Synthesis
- **2 Independent Voices** - Multi-waveform oscillators (Saw, Square, Sine, Triangle) with sub-oscillator
- **Analog-Modeled Filters** - Per-voice resonant lowpass filters with authentic warmth
- **ADSR Envelopes** - Independent envelope per voice
- **Vintage Character** - Drive saturation, independent voice detuning, and discrete circuit panning

### Effects
- **Juno-106 Inspired Chorus** - Authentic BBD chorus emulation (Mode I)
- **Stereo Delay** - Ping-pong delay with cross-feedback
- **Reverb** - Freeverb-style algorithm with comb and allpass filters
- **Distortion** - Analog-style waveshaping with bit reduction
- **AM/ Ring Mod** - Wide-range amplitude modulation (2Hz - 500Hz)


### Modulation & Sequencing
- **4 LFOs** - Sine, triangle, saw, square, random with Tempo Sync
- **LFO Cross-Modulation** - LFOs can modulate each other before destinations
- **Visual Patch Bay** - Cable-style routing interface for modulation
- **Dual Tempo Engines** - Switch between BPM Mode (grid-locked) and MS Mode (milliseconds/free-running)
- **Interactive Sequencer** - Visualize, mute, and delete notes from a sequence
- **Dual Arpeggiators** - Per-voice with rate, transpose, octave range, and feel controls

### Playability
- **Musical Scales** - Major, minor, pentatonic, and more
- **Custom Scale Builder** - Piano-style interface for creating your own scales
- **Transposition** - Scale-aware pitch shifting for arpeggios
- **Keyboard Controls** - Comprehensive QWERTY mapping for desktop
- **Mobile Optimized** - Touch-friendly interface with spin controls
- **ARP and LFO Lock - Change your preset sounds while keeping a sequence and/or modulation

### Recording & MIDI
- **Audio Recording** - Export your performances as WAV files
- **MIDI Recording** - Capture note data
- **MIDI Output** - Control external hardware/software with optional Midi Clock
- **Preset System** - Save and load your sounds or load system presets including "arp" patches

## Technical Details

- Built with Web Audio API and AudioWorkletProcessor
- Zero-latency synthesis engine
- Custom DSP implementations (no external synth libraries)

## Usage

Visit [https://no-b-250.netlify.app](https://no-b-250.netlify.app) and flip the power switch. No installation required.

For full user guide, see the [manual](https://no-b-250.netlify.app/manual).

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.


**Note on Mobile:** Audio playback requires "Silent Mode" to be disabled.

---

