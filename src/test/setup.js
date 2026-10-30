import '@testing-library/jest-dom/vitest';
import { JSDOM } from 'jsdom';
// Node 25 exposes its own incomplete localStorage; use the browser implementation.
const storage = new JSDOM('', { url: 'http://localhost/' }).window.localStorage;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Незамоканный запрос должен ломать тест, а не обращаться к настоящей базе.
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected fetch: add an explicit mock'));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});
