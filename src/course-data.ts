/**
 * AIF Course Data
 *
 * Content is loaded from markdown files at BUILD TIME.
 * The markdown files live in src/content/ and are parsed
 * into structured lesson data.
 *
 * This file exports pre-loaded course data that can be
 * used in the browser without any filesystem access.
 */

import { parseMarkdownLesson } from './content-parser';

// Types
export interface Paragraph {
  id: string;
  text: string;
  type: 'intro' | 'concept' | 'example' | 'list' | 'takeaway';
}

export interface Section {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Lesson {
  id: string;
  title: string;
  sections: Section[];
  keywords: string[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Import markdown files as text using Vite's ?raw loader
import lesson11 from './content/module-1/lesson-1.1.md?raw';
import lesson12 from './content/module-1/lesson-1.2.md?raw';
import lesson13 from './content/module-1/lesson-1.3.md?raw';
import lesson14 from './content/module-1/lesson-1.4.md?raw';
import lesson15 from './content/module-1/lesson-1.5.md?raw';
import lesson16 from './content/module-1/lesson-1.6.md?raw';
import lesson21 from './content/module-2/lesson-2.1.md?raw';
import lesson22 from './content/module-2/lesson-2.2.md?raw';
import lesson23 from './content/module-2/lesson-2.3.md?raw';
import lesson24 from './content/module-2/lesson-2.4.md?raw';
import lesson25 from './content/module-2/lesson-2.5.md?raw';

// Build course data from markdown at module load time
export const courseData: Module[] = [
  {
    id: 'module-1',
    title: 'AI Fundamentals',
    lessons: [
      parseMarkdownLesson(lesson11),
      parseMarkdownLesson(lesson12),
      parseMarkdownLesson(lesson13),
      parseMarkdownLesson(lesson14),
      parseMarkdownLesson(lesson15),
      parseMarkdownLesson(lesson16),
    ]
  },
  {
    id: 'module-2',
    title: 'Problem & Solution Discovery',
    lessons: [
      parseMarkdownLesson(lesson21),
      parseMarkdownLesson(lesson22),
      parseMarkdownLesson(lesson23),
      parseMarkdownLesson(lesson24),
      parseMarkdownLesson(lesson25),
    ]
  }
];

/**
 * Get all lessons flat with module title
 */
export function getAllLessons(): (Lesson & { moduleTitle: string })[] {
  return courseData.flatMap(module =>
    module.lessons.map(lesson => ({
      ...lesson,
      moduleTitle: module.title
    }))
  );
}

/**
 * Get all keywords for highlighting
 */
export function getAllKeywords(): string[] {
  const keywords = new Set<string>();
  courseData.forEach(module => {
    module.lessons.forEach(lesson => {
      lesson.keywords.forEach(kw => keywords.add(kw.toLowerCase()));
    });
  });
  return Array.from(keywords);
}
