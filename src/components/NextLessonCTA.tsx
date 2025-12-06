import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

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
      className="my-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      {isLastLesson ? (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                Course Complete
                <Sparkles size={16} className="text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground">
                You've finished all available lessons. Great work!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer">
          <Button
            variant="ghost"
            className="w-full h-auto p-0 hover:bg-transparent"
            onClick={onNextLesson}
          >
            <div className="p-6 w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ArrowRight className="text-primary" size={20} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold tracking-widest text-primary/70 mb-1 uppercase">
                    Next Lesson
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {nextLessonId}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {nextLessonTitle}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Button>
        </Card>
      )}
    </motion.div>
  );
}
