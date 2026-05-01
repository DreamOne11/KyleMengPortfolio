import '@testing-library/jest-dom';

// Suppress source map warnings in console
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('source map')) {
    return;
  }
  originalWarn.apply(console, args);
};
