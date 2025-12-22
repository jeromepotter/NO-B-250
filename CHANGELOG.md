# Changelog
### Future Plans
- "Split" Presets, taking advantage of dual voices with independent waveforms

## [12.22] - 2025-12-22

### Added
- **Step Duo Mode:** Each step sequencer can now drive a second voice slot with a dedicated VOL control, letting patterns layer on top of the main oscillator mix while highlighting the corresponding oscillator volume knob for quick balancing.
- **Step Chains:** A CHAIN switch unlocks eight transposition/loop slots per sequencer. Each slot can transpose up to ±12 semitones and loop for up to 16 bars before advancing, enabling evolving phrases that reset cleanly when the chain ends.
- **Step Pitch Controls:** New LEN, OCT, and RANGE knobs per sequencer define total steps (1–16) and octave span, clamping steps into the active scale so grid colors always reflect playable notes.
- **MIDI Learn & Routing UI:** CONNECT MIDI now exposes input/output selectors, a MIDI LEARN button that maps any oscillator, FX, step, or chain control to incoming CCs/notes, and a CLEAR MIDI MAP action for wiping stored assignments.
- **Soundfont Loader:** Unlockable soundfont support (via maxing DISTORTION and AM) now includes SF2 upload, per-file/sample lists with scroll buttons, and active-sample selection for the soundfont-driven oscillator mode.

### Changed
- Step START now quantizes to the master sixteenth-note grid even when re-started, keeping both sequencers and their chains aligned with the BPM clock.

## [12.10] - 2025-12-10

### Added
- **Steps Mode:** Dual 16-step octave sequencers with shared START/STOP controls. Steps respect the active scale/key, keep both voices locked and synced so patterns launch together, and borrow their dual-row feel from classic hardware like the Doepfer Dark Time.

### Changed
- Step sequences now save/load with presets so custom patterns travel with your sounds. Loading presets that contain steps automatically re-enables Steps Mode with the stored steps.
- Step sequencers stack vertically on larger screens for clearer editing while hiding the main oscillator visuals during step programming.
- Break playback waits for the next grid tick so the first hit always aligns with the running clock.

## [12.03] - 2025-12-03

### Added
- Dry/wet FX send control for Break/Drums loops, allowing the sampled breaks to be blended into the global effects chain.

### Changed
- Arpeggiator HOLD now enables automatically when you switch an arp on so patterns keep playing after you release the key.
- Break/Drums controls are labeled for clarity, and Break playback quantization now matches the arpeggiator grid for tighter sync.
- Global quantization was tightened so arpeggios and synced breaks always launch on the next 1/16th note when you hit PLAY, avoiding off-grid starts.

### Removed
- Share URL functionality has been removed.

## [11.28] - 2025-11-29

 ### Fixed
- FEEL knob no longer resets playhead allowing continuous groove

  ### Added
- Break Mode data to json

  
## [11.27] - 2025-11-27
### Added
-Break Mode
-Zita Reverb by Gregory Bowler ( https://github.com/gregoryhbowler/reverb1 )

### Changed
- Background Colors for LFO mode same as their respective modes


## [11.26] - 2025-11-26
### Changed
- Quantization for BPM mode
- 4 notes per row on editable note sequencer

### Added
- FEELS pattern display with a playhead
- Complex Random Arp and Sound

  
## [11.25] - 2025-11-25
### Added
- **Share Feature:** Added a SHARE button to the main header. This generates a compressed, unique URL containing the full synthesizer state (Knobs, FX, Arps, LFOs, Tempo Mode), allowing users to share patches instantly.


  
## [11.24] - 2025-11-24
### Added
- New Presets incuding new "Hero Preset" and new INIT Patch
- A soft clipper with slight signal boost into it

 ### Removed
- Removed Redundant PRESETS button and PRESETS Window is now perpetually displayed

 ### Fixed
 - Audio Signal Path to place Chorus After Distortion and AM.

###Changed
- Distortion now has a low pass filter applied for the first half of the knon to tame the bitcrushing that is applied later
  
 
## [11.23] - 2025-11-23
### Added
-  LFO lock with similar logic to ARP lock
-  Clamped Reverb and Delay on start up randomization to 30% max because was sick of them
-  Applied all 4 waveforms to randomization logic for startup randomization, and random arp preset and random sound preset.
-  Preset display and arrows to quickly select thru non arp non FX presets
-  MIDI clock out option and more robust clock
  
   ### Fixed
- ARP presets now override ARP lock and newly implemented LFO lock

## [11.22] - 2025-11-22
### Added
- Square, Sine, Triangle to Each Oscillator
- New Presets Submenu
- Arp Lock - allowing users to write an arp and select a preset


## [11.21] - 2025-11-21
  ### Changed
- Knob Colors for Reverb and Delay
- N-OB Prefix on File Save
- Freestyle mode no longer is legato and now triggers envelope each note

### Added
- Major upgrade to LFO patching allowing chaining with multiple destinations per LFO
- Box around each LFO Control
- New Preset Sounds


## [11.20] - 2025-11-20
### Added
- System and User presets can load with LFO Sync On
- System and User Presets made in MS mode will load in MS mode

  ### Changed
- MS rate minimum from 50ms to 10ms
- 2-10Hz tremolo into a 2-500Hz Amplitude Modulator

  ### Fixed
- LFO Sync Division Logic

## [11.19] - 2025-11-19
### Added
- SYNC mode for LFOs
- BPM mode with Master Clock to prevent drift
- Double click tempo knob for MS which bypasses Master Clock
- Tempo Rate Multipliers
- User preset filename structure includes "n-ob"

- Updated Manual


## [11.18] - 2025-11-18
### Added
- tap to audio-resume feature on mobile devices. 
- LFO to main Knob Modulation
- Note Repeat Mode Auto Latch When Hold is Active
- Audio continues in background even when tab is hidden


## [11.17] - 2025-11-17

### Changed
- Repositioned reverb and delay in FX chain
- Changed OSC 3 Mix to additive mode
- Updated Chorus to Juno-106 emulation
- Discrete panning for the 2 oscillators
- Random Arp and Random Sound default range
- Updated manual

### Fixed
- A bug where modulating an LFO's depth with another LFO would crash the audio engine
- Removed pops from delay time changes
- Fixed pops in tremolo cycle
- Fixed visual glitch with mobile knob artifacts
- Added voice variance to detune knob

## [11.16] - 2025-11-16
### Added
- New presets

### Fixed
- System preset loading bug that didn't properly load non-LFO presets after LFO presets

## [11.15] - 2025-11-15
### Changed
- Default arp rate adjusted
- Improved math for export MIDI BPM conversion
- Updated manual.html

### Fixed
- Bug on mobile where release envelope wasn't applying for single notes
- Added LFO capabilities for system presets

---
