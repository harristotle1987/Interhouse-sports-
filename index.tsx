import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Secondary Safety Check for Process Polyfill
// @ts-ignore
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { env: { NODE_ENV: 'production' } };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);