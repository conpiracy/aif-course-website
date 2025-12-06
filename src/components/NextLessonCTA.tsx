/**
 * Next Lesson CTA Component
 *
 * Footer component that appears at the end of each lesson
 * with a call-to-action to continue to the next lesson.
 */

import React from 'react';
import { motion } from 'motion/react';

interface NextLessonCTAProps {
  nextLessonTitle: string | null;
  nextLessonId: string | null;
  isInLastSection: boolean;
  onNextLesson: () => void;
  isLastLesson: boolean;
}

export function NextLessonCTA({
  nextLessonTitle,
  nextLessonId,
  isInLastSection,
  onNextLesson,
  isLastLesson
}: NextLessonCTAProps) {
  if (!isInLastSection) {
    return null; // Only show when in the last section
  }

  return (
    <motion.div
      className="next-lesson-cta"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {isLastLesson ? (
        <div className="cta-complete">
          <div className="cta-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="cta-text">
            <span className="cta-label">Course Complete</span>
            <span className="cta-description">You've finished all available lessons</span>
          </div>
        </div>
      ) : (
        <button className="cta-button" onClick={onNextLesson}>
          <div className="cta-content">
            <span className="cta-label">Next Lesson</span>
            <div className="cta-next-info">
              <span className="next-id">{nextLessonId}</span>
              <span className="next-title-text">{nextLessonTitle}</span>
            </div>
          </div>
          <motion.div
            className="cta-arrow"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </button>
      )}
    </motion.div>
  );
}
