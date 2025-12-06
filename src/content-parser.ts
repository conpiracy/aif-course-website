/**
 * Markdown Content Parser
 *
 * Parses markdown files with YAML frontmatter into structured lesson data
 * for the teleprompter presentation.
 *
 * Format:
 * - YAML frontmatter contains metadata (id, title, module, keywords)
 * - H1 headings (# TITLE) define section boundaries
 * - H2 headings (## Title) are inline subheadings within paragraphs
 * - Regular paragraphs become 'concept' type
 * - Blockquotes (>) become 'takeaway' type
 * - Lists (-) become 'list' type
 * - First paragraph in each section is 'intro' type
 */

import yaml from 'js-yaml';
import type { Paragraph, Section, Lesson } from './course-data';

interface LessonFrontmatter {
  id: string;
  title: string;
  module: string;
  moduleId: string;
  keywords: string[];
}

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): { frontmatter: LessonFrontmatter; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error('Invalid markdown: missing frontmatter (expected --- delimiters)');
  }

  const [, yamlContent, body] = frontmatterMatch;

  try {
    const frontmatter = yaml.load(yamlContent!) as LessonFrontmatter;

    if (!frontmatter.id || !frontmatter.title) {
      throw new Error('Invalid frontmatter: missing required fields (id, title)');
    }

    return {
      frontmatter,
      body: body!.trim()
    };
  } catch (err) {
    throw new Error(`Failed to parse frontmatter: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
}

/**
 * Determine paragraph type based on content
 */
function determineParagraphType(text: string, isFirstInSection: boolean): Paragraph['type'] {
  const trimmed = text.trim();

  if (isFirstInSection) return 'intro';
  if (trimmed.startsWith('>')) return 'takeaway';
  if (trimmed.startsWith('-') || /^\d+\./.test(trimmed)) return 'list';
  if (trimmed.toLowerCase().includes('example:')) return 'example';

  return 'concept';
}

/**
 * Clean text content - remove markdown syntax
 */
function cleanText(text: string): string {
  return text
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Remove H2 markers but keep text
    .replace(/^##\s+/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse markdown body into sections and paragraphs
 */
function parseBody(body: string, lessonId: string): Section[] {
  const sections: Section[] = [];

  // Split by H1 headings
  const sectionParts = body.split(/^#\s+/m).filter(Boolean);

  sectionParts.forEach((part, sectionIndex) => {
    const lines = part.split('\n');
    const sectionTitle = lines[0]!.trim();
    const sectionContent = lines.slice(1).join('\n').trim();

    // Split content into paragraphs (double newline or list blocks)
    const paragraphs: Paragraph[] = [];
    const blocks = sectionContent.split(/\n\n+/).filter(b => b.trim());

    blocks.forEach((block, blockIndex) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Handle list blocks - keep them together
      if (trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
        // Parse list items
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

      // Handle H2 subheadings - merge with following content
      if (trimmed.startsWith('## ')) {
        const heading = trimmed.replace(/^##\s+/, '');
        paragraphs.push({
          id: `${lessonId}-s${sectionIndex}-p${paragraphs.length}`,
          text: heading,
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

/**
 * Parse a markdown file content into a Lesson object
 */
export function parseMarkdownLesson(markdownContent: string): Lesson {
  const { frontmatter, body } = parseFrontmatter(markdownContent);
  const sections = parseBody(body, frontmatter.id);

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    sections,
    keywords: frontmatter.keywords || []
  };
}

/**
 * Get lesson and module metadata from frontmatter
 */
export function getLessonMetadata(markdownContent: string): LessonFrontmatter {
  const { frontmatter } = parseFrontmatter(markdownContent);
  return frontmatter;
}
