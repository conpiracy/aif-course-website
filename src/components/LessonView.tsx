/**
 * LessonView Component
 *
 * Main content area showing the lesson with animated text highlighting
 * Kit Langton Effect-style design
 */

import React from 'react';
import { TextHighlighter } from './TextHighlighter';
import type { Lesson, Module } from '../course-data';

interface LessonViewProps {
  module: Module;
  lesson: Lesson;
}

export function LessonView({ module, lesson }: LessonViewProps) {
  // Parse content into sections (split by double newlines)
  const sections = lesson.content.split('\n\n').filter(s => s.trim());

  return (
    <div className="main-content">
      {/* Header */}
      <header className="lesson-header">
        <div className="lesson-breadcrumb">
          {module.title} <span>/ {lesson.title}</span>
        </div>
        <h1 className="lesson-title">
          {lesson.title}
        </h1>
        <div className="keyword-tags">
          {lesson.keywords.map((keyword, i) => (
            <span key={i} className="keyword-tag">
              {keyword}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="lesson-content">
        {/* Section header */}
        <div className="section-header">
          <span className="section-title">Lesson Content</span>
          <div className="progress-dots">
            {sections.slice(0, 5).map((_, i) => (
              <div key={i} className={`progress-dot ${i === 0 ? 'filled' : ''}`} />
            ))}
          </div>
        </div>

        {/* Animated content sections */}
        <div>
          {sections.map((section, i) => (
            <React.Fragment key={i}>
              <Section
                content={section}
                keywords={lesson.keywords}
                index={i}
                totalSections={sections.length}
              />
              {i < sections.length - 1 && i % 2 === 1 && (
                <div className="section-divider" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Key takeaways footer */}
        <div className="takeaways">
          <h3 className="takeaways-title">Key Takeaways</h3>
          <div className="takeaway-list">
            {lesson.keywords.slice(0, 4).map((kw, i) => (
              <span key={i} className="takeaway-item">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

interface SectionProps {
  content: string;
  keywords: string[];
  index: number;
  totalSections: number;
}

function Section({ content, keywords, index, totalSections }: SectionProps) {
  // Check if this is a header line (starts with number or special chars)
  const isHeader = /^(\d+\.|[A-Z][a-z]+:|\*\*|##)/.test(content.trim());

  // Check if this is a list
  const isList = content.includes('\n-') || content.includes('\n•');

  if (isHeader && content.length < 100) {
    return (
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#e5e5e5',
        marginTop: '40px',
        marginBottom: '20px'
      }}>
        {content}
      </h2>
    );
  }

  if (isList) {
    const lines = content.split('\n');
    return (
      <div className="section-card">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            return (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#fbbf24' }}>•</span>
                <TextHighlighter
                  text={trimmed.slice(1).trim()}
                  keywords={keywords}
                  wordsPerMinute={200}
                  showControls={false}
                />
              </div>
            );
          }
          if (trimmed) {
            return (
              <TextHighlighter
                key={i}
                text={trimmed}
                keywords={keywords}
                wordsPerMinute={200}
                showControls={false}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className="section-card">
      <TextHighlighter
        text={content}
        keywords={keywords}
        wordsPerMinute={150}
        autoPlay={index === 0}
        showControls={index === 0}
      />
    </div>
  );
}
