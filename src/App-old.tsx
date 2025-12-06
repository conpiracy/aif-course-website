/**
 * AIF Course - Teleprompter Presentation
 *
 * A focused, paragraph-by-paragraph reading experience
 * matching the Kit Langton Effect style.
 *
 * Layout: [Sidebar Left] [Content Center] [Visualization Right]
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { getAllLessons, type Lesson } from './course-data';
import { VisualizationPanel } from './VisualizationPanel';
import { AnimatedNumber } from './components/ui/animated-number';
import { LessonSidebar } from './components/LessonSidebar';
import { NextLessonCTA } from './components/NextLessonCTA';
import { Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react';

// Render paragraph text with keywords wrapped in code spans
function renderParagraphText(text: string, keywords: string[]) {
  if (!keywords.length) return text;

  // Create regex to match keywords (case insensitive, word boundaries)
  const keywordPattern = keywords
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');

  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add keyword with code styling
    parts.push(
      <code key={`kw-${keyIndex++}`} className="keyword-code">
        {match[0]}
      </code>
    );
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}

export function App() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000); // ms per paragraph
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  const allLessons = getAllLessons();
  const currentLesson = allLessons[lessonIndex]!;

  if (!currentLesson) {
    return <div className="teleprompter">Loading...</div>;
  }

  // Flatten all paragraphs for easy navigation
  const allParagraphs = React.useMemo(() => {
    const paragraphs: { paragraph: any; sectionTitle: string; sectionIndex: number }[] = [];
    currentLesson.sections.forEach((section, sIndex) => {
      section.paragraphs.forEach(p => {
        paragraphs.push({ paragraph: p, sectionTitle: section.title, sectionIndex: sIndex });
      });
    });
    return paragraphs;
  }, [currentLesson]);

  const totalParagraphs = allParagraphs.length;

  // Lenis scroll handler - navigate paragraphs based on scroll
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0);
  const isNavigatingRef = useRef(false);

  const handleScroll = useCallback((lenis: any) => {
    const scrollDelta = lenis.scroll - lastScrollY.current;
    lastScrollY.current = lenis.scroll;

    if (isNavigatingRef.current) return;

    scrollAccumulator.current += scrollDelta;

    const threshold = 100;
    if (Math.abs(scrollAccumulator.current) >= threshold) {
      isNavigatingRef.current = true;

      if (scrollAccumulator.current > 0) {
        setCurrentParagraphIndex(prev => Math.min(totalParagraphs - 1, prev + 1));
      } else {
        setCurrentParagraphIndex(prev => Math.max(0, prev - 1));
      }

      scrollAccumulator.current = 0;

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [totalParagraphs]);

  // Auto-scroll to current paragraph
  useEffect(() => {
    const el = paragraphRefs.current[currentParagraphIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentParagraphIndex]);

  // Play/pause logic - advance by paragraph
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentParagraphIndex(prev => {
          if (prev >= totalParagraphs - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, totalParagraphs]);

  const togglePlay = useCallback(() => {
    if (currentParagraphIndex >= totalParagraphs - 1) {
      setCurrentParagraphIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentParagraphIndex, totalParagraphs]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentParagraphIndex(0);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentParagraphIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setCurrentParagraphIndex(prev => Math.min(totalParagraphs - 1, prev + 1));
          break;
        case 'Equal':
        case 'NumpadAdd':
          e.preventDefault();
          setSpeed(s => Math.max(1000, s - 500));
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          setSpeed(s => Math.min(10000, s + 500));
          break;
        case 'KeyR':
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalParagraphs, togglePlay, reset]);

  const handleLessonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLessonIndex(Number(e.target.value));
    setCurrentParagraphIndex(0);
    setIsPlaying(false);
    paragraphRefs.current = [];
  }, []);

  // New: Direct lesson selection from sidebar
  const handleLessonSelect = useCallback((index: number) => {
    setLessonIndex(index);
    setCurrentParagraphIndex(0);
    setIsPlaying(false);
    paragraphRefs.current = [];
  }, []);

  // Next lesson navigation
  const handleNextLesson = useCallback(() => {
    if (lessonIndex < allLessons.length - 1) {
      setLessonIndex(prev => prev + 1);
      setCurrentParagraphIndex(0);
      setIsPlaying(false);
      paragraphRefs.current = [];
    }
  }, [lessonIndex, allLessons.length]);

  // Get next lesson info
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const isLastLesson = lessonIndex >= allLessons.length - 1;

  const progress = totalParagraphs > 0 ? ((currentParagraphIndex + 1) / totalParagraphs) * 100 : 0;

  const getParagraphState = (pIndex: number) => {
    if (pIndex < currentParagraphIndex) return 'past';
    if (pIndex > currentParagraphIndex) return 'future';
    return 'current';
  };

  // Group paragraphs by section for rendering
  const sections = React.useMemo(() => {
    const result: { title: string; paragraphs: typeof allParagraphs; startIndex: number }[] = [];
    let currentSection = '';
    let startIndex = 0;

    allParagraphs.forEach((item, idx) => {
      if (item.sectionTitle !== currentSection) {
        if (currentSection) {
          // Close previous section
        }
        result.push({
          title: item.sectionTitle,
          paragraphs: [],
          startIndex: idx
        });
        currentSection = item.sectionTitle;
      }
      result[result.length - 1].paragraphs.push(item);
    });

    return result;
  }, [allParagraphs]);

  // Check if we're in the last section (for CTA visibility)
  const isInLastSection = React.useMemo(() => {
    if (sections.length === 0) return false;
    const lastSection = sections[sections.length - 1];
    const lastSectionStart = lastSection.startIndex;
    return currentParagraphIndex >= lastSectionStart;
  }, [sections, currentParagraphIndex]);

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothWheel: true }}>
      <div className="teleprompter">
        {/* Progress bar */}
        <div
          className="teleprompter-progress"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />

      {/* Header */}
      <div className="teleprompter-header">
        <span className="lesson-number">{currentLesson.id}</span>
        <h1 className="lesson-title">{currentLesson.title}</h1>
      </div>

      {/* Lesson selector */}
      <div className="lesson-selector">
        <select
          className="lesson-dropdown"
          value={lessonIndex}
          onChange={handleLessonChange}
        >
          {allLessons.map((lesson, i) => (
            <option key={lesson.id} value={i}>
              {lesson.moduleTitle} → {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {/* Three-section layout: [Sidebar] [Content] [Visualization] */}
      <div className="teleprompter-columns">
        {/* Left: Collapsible lesson sidebar */}
        <LessonSidebar
          currentLessonIndex={lessonIndex}
          onLessonSelect={handleLessonSelect}
        />

        {/* Center: Main content */}
        <div className="teleprompter-content">
          {sections.map((section, sIndex) => {
            const sectionStart = section.startIndex;
            const sectionEnd = sectionStart + section.paragraphs.length - 1;
            const sectionCompleted = currentParagraphIndex > sectionEnd;
            const sectionCurrent = currentParagraphIndex >= sectionStart && currentParagraphIndex <= sectionEnd;

            // Progress dots
            const progressDots = sections.map((_, i) => {
              if (i < sIndex) return '●';
              if (i === sIndex && sectionCompleted) return '●';
              if (i === sIndex && sectionCurrent) return '◐';
              return '○';
            }).join(' ');

            return (
              <React.Fragment key={`section-${sIndex}`}>
                {/* Section header */}
                <div className={`section-header ${sectionCompleted ? 'completed' : ''} ${sectionCurrent ? 'current' : ''}`}>
                  <span className="section-title">{section.title}</span>
                  <span className="section-progress">{progressDots}</span>
                </div>

                {/* Paragraphs */}
                {section.paragraphs.map((item, pIdx) => {
                  const globalIdx = section.startIndex + pIdx;
                  const state = getParagraphState(globalIdx);

                  return (
                    <div
                      key={item.paragraph.id}
                      ref={el => { paragraphRefs.current[globalIdx] = el; }}
                      className={`teleprompter-paragraph ${state}`}
                      data-type={item.paragraph.type}
                      onClick={() => setCurrentParagraphIndex(globalIdx)}
                    >
                      {renderParagraphText(item.paragraph.text, currentLesson.keywords)}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Next lesson CTA - inline at the end of content */}
          <NextLessonCTA
            nextLessonTitle={nextLesson?.title || null}
            nextLessonId={nextLesson?.id || null}
            isInLastSection={isInLastSection}
            onNextLesson={handleNextLesson}
            isLastLesson={isLastLesson}
          />
        </div>

        {/* Right column: Visualization */}
        <VisualizationPanel lesson={currentLesson} />
      </div>

      {/* Controls */}
      <div className="controls">
        <button
          className={`ctrl-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          title="Play/Pause (Space)"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="ctrl-btn" onClick={reset} title="Reset (R)">
          <RotateCcw size={16} />
        </button>
        <button
          className="ctrl-btn"
          onClick={() => setSpeed(s => Math.min(10000, s + 500))}
          title="Slower (-)"
        >
          <Minus size={16} />
        </button>
        <button
          className="ctrl-btn"
          onClick={() => setSpeed(s => Math.max(1000, s - 500))}
          title="Faster (+)"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Status with animated numbers */}
      <div className="status-indicator">
        <span className="speed">
          <AnimatedNumber value={speed / 1000} precision={1} />s
        </span>
        <span className="progress-text">
          <AnimatedNumber value={Math.round(progress)} />%
        </span>
      </div>

      {/* Keyboard hints */}
      <div className="keyboard-hints">
        <span className="keyboard-hint">
          <span className="key">Space</span> Play/Pause
        </span>
        <span className="keyboard-hint">
          <span className="key">↑↓</span> Navigate
        </span>
        <span className="keyboard-hint">
          <span className="key">+−</span> Speed
        </span>
      </div>
      </div>
    </ReactLenis>
  );
}
