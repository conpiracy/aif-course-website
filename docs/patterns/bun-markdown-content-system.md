---
title: Bun Markdown Content System with Build-time Imports
slug: bun-markdown-content-system
category: patterns
tags:
  - bun
  - markdown
  - yaml-frontmatter
  - build-time-imports
  - typescript
  - content-management
component: content-parser
symptom: Content hardcoded in TypeScript with arbitrary section distribution using Math.ceil(), making it unmaintainable
root_cause: Lack of separation between content and code; content was embedded directly in TypeScript with algorithmic distribution logic
date_solved: 2025-12-06
---

# Bun Markdown Content System with Build-time Imports

## Problem

Content for a teleprompter website was hardcoded in TypeScript with arbitrary section distribution using `Math.ceil()`, making it:
- Difficult to modify content without touching code
- Fragile layout behavior
- Unmaintainable as content grew

## Solution

Create a markdown-based content system with:
1. Markdown files with YAML frontmatter in `src/content/module-X/`
2. Build-time imports using `import ... with { type: 'text' }`
3. A content parser that handles frontmatter, H1 sections, lists, blockquotes
4. Structured types (Lesson, Section, Paragraph)

## Implementation

### 1. Directory Structure

```
src/
├── content/
│   ├── module-1/
│   │   ├── lesson-1.1.md
│   │   ├── lesson-1.2.md
│   │   └── ...
│   └── module-2/
│       ├── lesson-2.1.md
│       └── ...
├── content-parser.ts
└── course-data.ts
```

### 2. Markdown File Format

```markdown
---
id: "1.1"
title: "What is AIF"
module: "AI Fundamentals"
moduleId: "module-1"
keywords:
  - AI
  - business
  - outcomes
---

# SECTION TITLE

First paragraph becomes 'intro' type.

Regular paragraphs become 'concept' type.

> Blockquotes become 'takeaway' type.

- Bullet lists
- Become 'list' type
- Items joined with bullet separator

## Subheading Within Section

Subheadings don't create new sections, they're inline headers.
```

### 3. Build-time Import Pattern

```typescript
// course-data.ts
import lesson11 from './content/module-1/lesson-1.1.md' with { type: 'text' };
import lesson12 from './content/module-1/lesson-1.2.md' with { type: 'text' };
// ... more imports

export const courseData: Module[] = [
  {
    id: 'module-1',
    title: 'AI Fundamentals',
    lessons: [
      parseMarkdownLesson(lesson11),
      parseMarkdownLesson(lesson12),
      // ...
    ]
  }
];
```

**Key Point**: Use `import ... with { type: 'text' }` - Bun's bundler embeds the file content as a string at build time. No filesystem access needed in browser.

### 4. Frontmatter Parser

```typescript
function parseFrontmatter(content: string): {
  frontmatter: LessonFrontmatter;
  body: string
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error('Invalid markdown: missing frontmatter');
  }

  const [, yamlContent, body] = frontmatterMatch;
  const frontmatter: Partial<LessonFrontmatter> = {};

  // Manual YAML parsing for simple key: value and arrays
  const lines = yamlContent!.split('\n');
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle array items
    if (trimmed.startsWith('- ') && inArray) {
      arrayValues.push(trimmed.slice(2).trim());
      continue;
    }

    // End of array
    if (inArray && !trimmed.startsWith('- ') && trimmed !== '') {
      (frontmatter as any)[currentKey] = arrayValues;
      arrayValues = [];
      inArray = false;
    }

    // Parse key: value
    const keyValueMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (keyValueMatch) {
      const [, key, value] = keyValueMatch;

      if (value === '') {
        // Start of array
        currentKey = key!;
        inArray = true;
        arrayValues = [];
      } else {
        // Simple value (strip quotes)
        (frontmatter as any)[key!] = value!.replace(/^["']|["']$/g, '');
      }
    }
  }

  // Handle final array
  if (inArray) {
    (frontmatter as any)[currentKey] = arrayValues;
  }

  return { frontmatter, body: body!.trim() };
}
```

### 5. Section/Paragraph Parser

```typescript
interface Paragraph {
  id: string;
  text: string;
  type: 'intro' | 'concept' | 'example' | 'list' | 'takeaway';
}

interface Section {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

function parseBody(body: string, lessonId: string): Section[] {
  const sections: Section[] = [];

  // Split by H1 headings
  const sectionParts = body.split(/^#\s+/m).filter(Boolean);

  sectionParts.forEach((part, sectionIndex) => {
    const lines = part.split('\n');
    const sectionTitle = lines[0]!.trim();
    const sectionContent = lines.slice(1).join('\n').trim();

    const paragraphs: Paragraph[] = [];
    const blocks = sectionContent.split(/\n\n+/).filter(b => b.trim());

    blocks.forEach((block, blockIndex) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Handle lists
      if (trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        const listItems = trimmed.split('\n')
          .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);

        paragraphs.push({
          id: `${lessonId}-s${sectionIndex}-p${paragraphs.length}`,
          text: listItems.join(' • '),
          type: 'list'
        });
        return;
      }

      // Handle H2 subheadings
      if (trimmed.startsWith('## ')) {
        paragraphs.push({
          id: `${lessonId}-s${sectionIndex}-p${paragraphs.length}`,
          text: trimmed.replace(/^##\s+/, ''),
          type: blockIndex === 0 ? 'intro' : 'concept'
        });
        return;
      }

      // Regular paragraph
      const isFirst = paragraphs.length === 0;
      const type = determineParagraphType(trimmed, isFirst);

      paragraphs.push({
        id: `${lessonId}-s${sectionIndex}-p${paragraphs.length}`,
        text: cleanText(trimmed),
        type
      });
    });

    if (paragraphs.length > 0) {
      sections.push({
        id: `${lessonId}-s${sectionIndex}`,
        title: sectionTitle.toUpperCase(),
        paragraphs
      });
    }
  });

  return sections;
}

function determineParagraphType(text: string, isFirstInSection: boolean): Paragraph['type'] {
  if (isFirstInSection) return 'intro';
  if (text.trim().startsWith('>')) return 'takeaway';
  if (text.trim().startsWith('-') || /^\d+\./.test(text.trim())) return 'list';
  if (text.toLowerCase().includes('example:')) return 'example';
  return 'concept';
}

function cleanText(text: string): string {
  return text
    .replace(/^>\s*/gm, '')        // Remove blockquote markers
    .replace(/^##\s+/gm, '')       // Remove H2 markers
    .replace(/\n{3,}/g, '\n\n')    // Normalize newlines
    .trim();
}
```

## Why This Pattern Works

1. **Separation of Concerns**: Content authors edit markdown, developers maintain code
2. **Zero Runtime Cost**: All parsing happens at build time
3. **Type Safety**: Structured interfaces for Lesson, Section, Paragraph
4. **HMR Support**: Bun's `--hot` flag detects markdown changes
5. **No Dependencies**: Manual YAML parsing avoids external libraries

## When to Use

- Course/lesson content systems
- Documentation sites with structured content
- Any Bun project needing markdown content at build time
- Teleprompter or presentation applications

## Files Reference

- `src/course-data.ts` - Import and export course data
- `src/content-parser.ts` - Parsing functions
- `src/content/module-*/lesson-*.md` - Content files
