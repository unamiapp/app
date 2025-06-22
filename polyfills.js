// Polyfills for server-side rendering
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  global.self = global;
}