/**
 * Next Lesson CTA Component
 *
 * Inline component that appears at the end of lesson content
 * with a call-to-action to continue to the next lesson.
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
    return null;
  }

  return (
    <motion.div
      className="next-lesson-cta"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {isLastLesson ? (
        <div className="cta-complete">
          <CheckCircle2 className="cta-icon" size={20} />
          <div className="cta-text">
            <span className="cta-label">Course Complete</span>
            <span className="cta-description">You've finished all available lessons</span>
          </div>
        </div>
      ) : (
        <button className="cta-button" onClick={onNextLesson}>
          <div className="cta-content">
            <span className="cta-label">Continue</span>
            <div className="cta-next-info">
              <span className="next-id">{nextLessonId}</span>
              <span className="next-title-text">{nextLessonTitle}</span>
            </div>
          </div>
          <ArrowRight className="cta-arrow" size={20} />
        </button>
      )}
    </motion.div>
  );
}
