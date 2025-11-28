// Shared state placeholder to centralize app-wide values.
// Future refactors can populate this object from initApp or other modules.
export const sharedState = {};

export function registerState(key, value) {
  sharedState[key] = value;
  return sharedState[key];
}
