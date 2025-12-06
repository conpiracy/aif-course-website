import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { courseData } from '../course-data';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonSidebarProps {
  currentLessonIndex: number;
  onLessonSelect: (index: number) => void;
}

export function LessonSidebar({ currentLessonIndex, onLessonSelect }: LessonSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

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
      className="relative h-full bg-card border-r border-border flex flex-col z-50"
      initial={false}
      animate={{
        width: isExpanded ? 320 : 64
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-32 h-6 w-6 rounded-full bg-card border border-border shadow-lg z-10"
        onClick={toggle}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronRight size={14} />
        </motion.div>
      </Button>

      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.div
            key="collapsed"
            className="flex flex-col items-center py-6 px-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <BookOpen size={20} className="text-primary" />
            <Separator />

            {courseData.map((module, moduleIndex) => {
              const startIndex = courseData
                .slice(0, moduleIndex)
                .reduce((acc, m) => acc + m.lessons.length, 0);
              const endIndex = startIndex + module.lessons.length - 1;
              const isCurrentModule = currentLessonIndex >= startIndex && currentLessonIndex <= endIndex;

              return (
                <div
                  key={module.id}
                  className={cn(
                    "w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-semibold transition-all",
                    isCurrentModule
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                  )}
                  title={module.title}
                >
                  {moduleIndex + 1}
                </div>
              );
            })}

            <Separator />

            <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {currentLesson?.lesson.id}
            </div>
          </motion.div>
        )}

        {isExpanded && (
          <motion.div
            key="expanded"
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-primary" />
                <span className="text-sm font-semibold tracking-wide">Course Navigation</span>
              </div>
              <p className="text-xs text-muted-foreground">Browse all lessons</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {courseData.map((module, moduleIndex) => {
                const startIndex = courseData
                  .slice(0, moduleIndex)
                  .reduce((acc, m) => acc + m.lessons.length, 0);

                return (
                  <div key={module.id}>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {moduleIndex + 1}
                      </div>
                      <span className="text-xs font-semibold text-foreground tracking-wide">
                        {module.title}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const globalIndex = startIndex + lessonIndex;
                        const isActive = globalIndex === currentLessonIndex;
                        const isPast = globalIndex < currentLessonIndex;

                        return (
                          <Button
                            key={lesson.id}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-2 h-auto py-3 px-3 relative",
                              isActive && "bg-primary/10 text-primary border border-primary/20",
                              !isActive && "hover:bg-secondary"
                            )}
                            onClick={() => {
                              onLessonSelect(globalIndex);
                              setIsExpanded(false);
                            }}
                          >
                            <span className={cn(
                              "text-[10px] font-mono font-semibold px-2 py-0.5 rounded",
                              isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            )}>
                              {lesson.id}
                            </span>
                            <span className="text-xs flex-1 text-left">{lesson.title}</span>
                            {isPast && <CheckCircle2 size={12} className="text-primary opacity-50" />}
                          </Button>
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
