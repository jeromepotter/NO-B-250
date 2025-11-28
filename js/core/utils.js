// General-purpose helpers can be centralized here as part of the new core hierarchy.
export const noop = () => {};

export function forwardCall(fn, ...args) {
  return typeof fn === 'function' ? fn(...args) : undefined;
}
