import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        accent: '#fbbf24',
        dim: '#6B7280',
        background: '#000000',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
