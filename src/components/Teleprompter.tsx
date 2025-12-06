/**
 * Teleprompter Component
 *
 * A focused reading view that shows one paragraph at a time
 * with scroll-snap and mask-image fading effects.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Lesson, Paragraph } from '../course-data';

interface TeleprompterProps {
  lesson: Lesson;
  isPlaying: boolean;
  speed: number; // words per minute
  onComplete?: () => void;
}

interface WordState {
  text: string;
  isKeyword: boolean;
  globalIndex: number;
}

export function Teleprompter({ lesson, isPlaying, speed, onComplete }: TeleprompterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parse all paragraphs into words with global indices
  const { paragraphsWithWords, totalWords } = React.useMemo(() => {
    const keywordSet = new Set(lesson.keywords.map(k => k.toLowerCase()));
    let globalIndex = 0;

    const paragraphsWithWords = lesson.paragraphs.map(paragraph => {
      const words: WordState[] = [];
      const tokens = paragraph.text.split(/(\s+)/);

      for (const token of tokens) {
        if (!token.trim()) continue;

        const cleanWord = token.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const isKeyword = keywordSet.has(cleanWord) ||
          lesson.keywords.some(kw =>
            cleanWord.includes(kw.toLowerCase()) && cleanWord.length <= kw.length + 3
          );

        words.push({
          text: token,
          isKeyword,
          globalIndex: globalIndex++
        });
      }

      return {
        ...paragraph,
        words
      };
    });

    return { paragraphsWithWords, totalWords: globalIndex };
  }, [lesson]);

  // Calculate which paragraph contains the current word
  useEffect(() => {
    if (currentWordIndex < 0) {
      setCurrentParagraphIndex(0);
      return;
    }

    let wordCount = 0;
    for (let i = 0; i < paragraphsWithWords.length; i++) {
      wordCount += paragraphsWithWords[i].words.length;
      if (currentWordIndex < wordCount) {
        setCurrentParagraphIndex(i);
        break;
      }
    }
  }, [currentWordIndex, paragraphsWithWords]);

  // Scroll to current paragraph
  useEffect(() => {
    const currentParagraphEl = paragraphRefs.current[currentParagraphIndex];
    if (currentParagraphEl) {
      currentParagraphEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentParagraphIndex]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const msPerWord = (60 * 1000) / speed;
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= totalWords - 1) {
            onComplete?.();
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, totalWords, onComplete]);

  // Reset when lesson changes
  useEffect(() => {
    setCurrentWordIndex(-1);
    setCurrentParagraphIndex(0);
  }, [lesson.id]);

  // Calculate progress
  const progress = totalWords > 0 ? ((currentWordIndex + 1) / totalWords) * 100 : 0;

  // Get paragraph state
  const getParagraphState = useCallback((paragraphIndex: number) => {
    if (paragraphIndex < currentParagraphIndex) return 'past';
    if (paragraphIndex > currentParagraphIndex) return 'future';
    return 'current';
  }, [currentParagraphIndex]);

  // Get word state
  const getWordState = useCallback((globalIndex: number) => {
    if (globalIndex < currentWordIndex) return 'past';
    if (globalIndex > currentWordIndex) return 'future';
    return 'current';
  }, [currentWordIndex]);

  return (
    <div className="teleprompter" ref={containerRef}>
      {/* Lesson title */}
      <div className="teleprompter-header">
        <span className="lesson-number">{lesson.id}</span>
        <h1 className="lesson-title">{lesson.title}</h1>
      </div>

      {/* Paragraphs */}
      <div className="teleprompter-content">
        {paragraphsWithWords.map((paragraph, pIndex) => {
          const pState = getParagraphState(pIndex);

          return (
            <div
              key={paragraph.id}
              ref={el => paragraphRefs.current[pIndex] = el}
              className={`teleprompter-paragraph ${pState} type-${paragraph.type}`}
              data-type={paragraph.type}
            >
              {paragraph.words.map((word, wIndex) => {
                const wState = getWordState(word.globalIndex);

                return (
                  <span
                    key={`${paragraph.id}-w${wIndex}`}
                    className={`word ${wState} ${word.isKeyword ? 'keyword' : ''}`}
                  >
                    {word.text}{' '}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="teleprompter-progress" style={{ '--progress': `${progress}%` } as React.CSSProperties} />
    </div>
  );
}

// Hook for manual navigation
export function useTeleprompterControls() {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const nextWord = useCallback(() => {
    setCurrentWordIndex(prev => prev + 1);
  }, []);

  const prevWord = useCallback(() => {
    setCurrentWordIndex(prev => Math.max(-1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentWordIndex(-1);
  }, []);

  const jumpTo = useCallback((index: number) => {
    setCurrentWordIndex(index);
  }, []);

  return {
    currentWordIndex,
    nextWord,
    prevWord,
    reset,
    jumpTo
  };
}
