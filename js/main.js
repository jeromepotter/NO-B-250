import { initApp } from './core/app.js';
import { sharedState } from './core/state.js';
import * as utils from './core/utils.js';
import { initializeAudioEngine } from './core/audio-engine.js';
import { attachKnobHandlers } from './core/ui/knobs.js';
import { initializeLfoVisualizer } from './core/ui/lfo-viz.js';

// Thin orchestrator entry point for index.html
// The underlying app logic is encapsulated within core/app.js for now.
initApp({ sharedState, utils, initializeAudioEngine, attachKnobHandlers, initializeLfoVisualizer });
