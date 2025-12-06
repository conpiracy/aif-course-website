/**
 * Collapsible Lesson Sidebar
 *
 * Inspired by devouringdetails.com/prototypes/nextjs-dev-tools
 * - Collapsed: minimal icon strip
 * - Expanded: full lesson navigation grouped by module
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { courseData, type Lesson } from '../course-data';
import { ChevronRight } from 'lucide-react';

interface LessonSidebarProps {
  currentLessonIndex: number;
  onLessonSelect: (index: number) => void;
}

export function LessonSidebar({ currentLessonIndex, onLessonSelect }: LessonSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Flatten lessons with module info for easier indexing
  const allLessons = courseData.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      lesson,
      moduleTitle: module.title,
      moduleIndex,
      globalIndex: courseData
        .slice(0, moduleIndex)
        .reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex
    }))
  );

  const currentLesson = allLessons[currentLessonIndex];

  return (
    <motion.div
      className="lesson-sidebar"
      initial={false}
      animate={{
        width: isExpanded ? 280 : 56
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={toggle}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronRight size={20} />
        </motion.div>
      </button>

      {/* Collapsed State - Icon Strip */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            className="sidebar-collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Module indicators */}
            {courseData.map((module, moduleIndex) => {
              const startIndex = courseData
                .slice(0, moduleIndex)
                .reduce((acc, m) => acc + m.lessons.length, 0);
              const endIndex = startIndex + module.lessons.length - 1;
              const isCurrentModule = currentLessonIndex >= startIndex && currentLessonIndex <= endIndex;

              return (
                <div
                  key={module.id}
                  className={`module-indicator ${isCurrentModule ? 'active' : ''}`}
                  title={module.title}
                >
                  <span className="module-number">{moduleIndex + 1}</span>
                </div>
              );
            })}

            {/* Current lesson indicator */}
            <div className="current-lesson-badge">
              {currentLesson?.lesson.id}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Full Navigation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="sidebar-expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <div className="sidebar-header">
              <span className="sidebar-title">Course Navigation</span>
            </div>

            <div className="sidebar-content">
              {courseData.map((module, moduleIndex) => {
                const startIndex = courseData
                  .slice(0, moduleIndex)
                  .reduce((acc, m) => acc + m.lessons.length, 0);

                return (
                  <div key={module.id} className="module-group">
                    <div className="module-header">
                      <span className="module-badge">{moduleIndex + 1}</span>
                      <span className="module-title">{module.title}</span>
                    </div>

                    <div className="lesson-list">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const globalIndex = startIndex + lessonIndex;
                        const isActive = globalIndex === currentLessonIndex;
                        const isPast = globalIndex < currentLessonIndex;

                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                            onClick={() => {
                              onLessonSelect(globalIndex);
                              setIsExpanded(false);
                            }}
                          >
                            <span className="lesson-id">{lesson.id}</span>
                            <span className="lesson-title">{lesson.title}</span>
                            {isActive && (
                              <motion.div
                                className="active-indicator"
                                layoutId="active-lesson"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
