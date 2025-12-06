---
title: Kit Langton Effect - Teleprompter CSS Pattern
slug: kit-langton-teleprompter-css
category: patterns
tags:
  - css
  - teleprompter
  - typography
  - animations
  - word-highlighting
  - ui-design
component: styles
symptom: Teleprompter highlighting looked generic with white background + black text, lacking the polished feel of reference
root_cause: Using wrong highlight approach (light bg) instead of inverted dark bg with warm glow
date_solved: 2025-12-06
---

# Kit Langton Effect - Teleprompter CSS Pattern

## The Effect

A dark, monospace teleprompter presentation where:
- Current word has **dark gray background** (#374151) with **white text** and **warm orange glow**
- Read words transition to bright white
- Unread words stay dim gray
- Paragraphs blur/fade based on proximity to current position
- Subtle pulsing animation on current word

## Key Visual Specs

### CSS Custom Properties

```css
:root {
  --bg: #000000;
  --text-very-dim: #4B5563;
  --text-dim: #6B7280;
  --text-read: #ffffff;
  --highlight-bg: #374151;               /* Dark gray - INVERTED */
  --highlight-text: #ffffff;             /* White text - INVERTED */
  --highlight-glow: rgba(255, 140, 66, 0.35);  /* Warm orange glow */
  --section-text: #6B7280;               /* Gray headers, not amber */
  --section-border: rgba(107, 114, 128, 0.2);
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
}
```

### Typography Foundation

```css
html, body {
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.5px;
  -webkit-font-smoothing: antialiased;
}
```

### Word States

```css
/* Current word - dark bg + white text + warm glow */
.word.current {
  background: var(--highlight-bg);
  color: var(--highlight-text);
  padding: 4px 6px;
  margin: 0 2px;
  border-radius: 3px;
  box-shadow: 0 0 10px var(--highlight-glow),
              0 0 20px rgba(255, 140, 66, 0.15);
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Already read - bright white */
.word.past {
  color: var(--text-read);
}

/* Not yet read - dim gray */
.word.future {
  color: var(--text-dim);
}
```

### Paragraph States

```css
.teleprompter-paragraph.future {
  opacity: 0.5;
  filter: blur(2px);
  transform: translateY(15px) scale(0.98);
}

.teleprompter-paragraph.current {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0) scale(1);
}

.teleprompter-paragraph.past {
  opacity: 0.65;
  filter: blur(0);
  transform: translateY(-8px) scale(0.99);
}
```

### Pulse Animation

```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px var(--highlight-glow),
                0 0 20px rgba(255, 140, 66, 0.12);
  }
  50% {
    box-shadow: 0 0 14px var(--highlight-glow),
                0 0 28px rgba(255, 140, 66, 0.18);
  }
}
```

### Content Area Mask (Fade Edges)

```css
.teleprompter-content {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}
```

### Section Headers (Gray, Not Amber)

```css
.section-header {
  border-bottom: 1px solid var(--section-border);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--section-text);  /* Gray #6B7280 */
}

/* Diagonal stripe pattern below section */
.section-header::after {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    rgba(107, 114, 128, 0.08) 3px,
    rgba(107, 114, 128, 0.08) 4px
  );
}
```

## Critical Implementation Details

### 1. INVERTED Highlight (The Key Insight)

Wrong approach (generic):
```css
.word.current {
  background: #ffffff;  /* White bg */
  color: #000000;       /* Black text */
}
```

Correct approach (Kit Langton):
```css
.word.current {
  background: #374151;  /* Dark gray bg */
  color: #ffffff;       /* White text */
  box-shadow: 0 0 10px rgba(255, 140, 66, 0.35);  /* Warm glow */
}
```

### 2. Two-Column 50/50 Layout

```css
.teleprompter-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* Equal split */
  gap: 0;
}
```

### 3. Transition Timings

- Word highlight: 150ms
- Paragraph focus: 250ms
- Glow pulse: 2s cycle
- Scroll behavior: smooth

### 4. Scroll Snap

```css
.teleprompter-content {
  scroll-snap-type: y mandatory;
}

.teleprompter-paragraph {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
```

## Color Palette Summary

| Element | Color | Hex/RGBA |
|---------|-------|----------|
| Background | Black | `#000000` |
| Dim text | Gray | `#6B7280` |
| Very dim text | Darker gray | `#4B5563` |
| Read text | White | `#ffffff` |
| Highlight bg | Dark gray | `#374151` |
| Highlight glow | Warm orange | `rgba(255, 140, 66, 0.35)` |
| Accent | Amber | `#fbbf24` |
| Section text | Gray | `#6B7280` |

## When to Use This Pattern

- Teleprompter/presentation applications
- Code tutorials with word-by-word highlighting
- Reading applications with focus tracking
- Any dark-mode text presentation needing emphasis without harsh contrast

## Files Reference

- `src/styles.css` - Complete CSS implementation
- `reference/` - Screenshot references for visual comparison
