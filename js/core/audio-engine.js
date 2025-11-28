// AudioContext and worklet setup entry point.
// Currently delegated to the legacy initApp flow but exposed for future modularization.
export function initializeAudioEngine(options = {}) {
  return options?.start?.();
}
