/**
 * Navigation Component
 *
 * Sidebar navigation for course modules and lessons
 * Kit Langton style
 */

import React from 'react';
import { courseData, type Module, type Lesson } from '../course-data';

interface NavigationProps {
  currentModule: string;
  currentLesson: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

export function Navigation({
  currentModule,
  currentLesson,
  onSelectLesson
}: NavigationProps) {
  return (
    <nav className="sidebar">
      {/* Header */}
      <div className="sidebar-title">
        AIF Course
      </div>

      {/* Module list */}
      <div>
        {courseData.map((module) => (
          <ModuleSection
            key={module.id}
            module={module}
            isCurrentModule={module.id === currentModule}
            currentLesson={currentLesson}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #222', fontSize: '11px', color: '#555' }}>
        Powered by Effect-TS
      </div>
    </nav>
  );
}

interface ModuleSectionProps {
  module: Module;
  isCurrentModule: boolean;
  currentLesson: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

function ModuleSection({
  module,
  isCurrentModule,
  currentLesson,
  onSelectLesson
}: ModuleSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(isCurrentModule);

  return (
    <div className="nav-module">
      {/* Module header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="nav-module-title"
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: isCurrentModule ? '#fbbf24' : '#666'
        }}
      >
        <span>{module.title}</span>
        <ChevronIcon expanded={isExpanded} />
      </button>

      {/* Lesson list */}
      {isExpanded && (
        <div>
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === currentLesson}
              onClick={() => onSelectLesson(module.id, lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  isActive: boolean;
  onClick: () => void;
}

function LessonItem({ lesson, isActive, onClick }: LessonItemProps) {
  return (
    <button
      onClick={onClick}
      className={`nav-lesson ${isActive ? 'active' : ''}`}
    >
      {lesson.title}
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transition: 'transform 0.15s',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'
      }}
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}
