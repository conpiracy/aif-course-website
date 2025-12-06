/**
 * Main entry point for the AIF Course Presentation
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// React Grab is loaded via script tags in index.html

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
