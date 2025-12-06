/**
 * AIF Course Website - Bun Server
 *
 * Serves the course website with HTML imports
 */

import index from './index.html';

Bun.serve({
  port: 3000,
  routes: {
    '/': index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log('🎓 AIF Course Website running at http://localhost:3000');