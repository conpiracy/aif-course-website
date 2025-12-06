import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { getAllLessons, type Lesson } from './course-data';
import { VisualizationPanel } from './VisualizationPanel';
import { AnimatedNumber } from './components/ui/animated-number';
import { LessonSidebar } from './components/LessonSidebar';
import { NextLessonCTA } from './components/NextLessonCTA';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Slider } from './components/ui/slider';
import { Play, Pause, RotateCcw, Gauge, ArrowUp, ArrowDown, Plus, Minus } from 'lucide-react';

function renderParagraphText(text: string, keywords: string[]) {
  if (!keywords.length) return text;

  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
      return <code key={i} className="keyword">{part}</code>;
    }
    return part;
  });
}

export default function App() {
  const lessons = getAllLessons();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentLesson = lessons[currentLessonIndex];

  const allParagraphs = useRef<Array<{ type: string; data: any; sectionIndex: number }>>([]);
  const sections = useRef<Array<{ name: string; startIndex: number }>>([]);

  useEffect(() => {
    const paragraphs: Array<{ type: string; data: any; sectionIndex: number }> = [];
    const secs: Array<{ name: string; startIndex: number }> = [];

    currentLesson.sections.forEach((section, sIndex) => {
      secs.push({ name: section.name, startIndex: paragraphs.length });
      section.items.forEach(item => {
        paragraphs.push({ type: item.type, data: item, sectionIndex: sIndex });
      });
    });

    allParagraphs.current = paragraphs;
    sections.current = secs;
    paragraphRefs.current = new Array(paragraphs.length);
  }, [currentLesson]);

  const totalParagraphs = allParagraphs.current.length;

  useEffect(() => {
    const el = paragraphRefs.current[currentParagraphIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentParagraphIndex]);

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
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, totalParagraphs]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const reset = useCallback(() => {
    setCurrentParagraphIndex(0);
    setIsPlaying(false);
  }, []);

  const nextParagraph = useCallback(() => {
    setCurrentParagraphIndex(prev => Math.min(totalParagraphs - 1, prev + 1));
  }, [totalParagraphs]);

  const prevParagraph = useCallback(() => {
    setCurrentParagraphIndex(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextParagraph();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        prevParagraph();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setSpeed(s => Math.max(1000, s - 500));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setSpeed(s => Math.min(10000, s + 500));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, reset, nextParagraph, prevParagraph]);

  const progress = totalParagraphs > 0 ? (currentParagraphIndex / (totalParagraphs - 1)) * 100 : 0;

  const handleLessonChange = useCallback((index: number) => {
    setCurrentLessonIndex(index);
    setCurrentParagraphIndex(0);
    setIsPlaying(false);
  }, []);

  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;
  const isLastLesson = currentLessonIndex === lessons.length - 1;

  const handleNextLesson = useCallback(() => {
    if (!isLastLesson) {
      handleLessonChange(currentLessonIndex + 1);
    }
  }, [currentLessonIndex, isLastLesson, handleLessonChange]);

  const isInLastSection = useCallback(() => {
    if (sections.current.length === 0) return false;
    const lastSection = sections.current[sections.current.length - 1];
    const lastSectionStart = lastSection.startIndex;
    return currentParagraphIndex >= lastSectionStart;
  }, [currentParagraphIndex])();

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothWheel: true }}>
      <div className="min-h-screen bg-background text-foreground font-mono">
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${progress}%, transparent ${progress}%)`
          }}
        />

        <div className="flex h-screen">
          <LessonSidebar
            currentLessonIndex={currentLessonIndex}
            onLessonSelect={handleLessonChange}
          />

          <div className="flex-1 flex">
            <div className="flex-1 overflow-y-auto p-12 max-w-3xl mx-auto">
              <Card className="mb-6 bg-card/50 border-border">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded">
                      {currentLesson.id}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <h1 className="text-sm font-medium text-muted-foreground tracking-wide">
                      {currentLesson.title}
                    </h1>
                  </div>
                </div>
              </Card>

              <div className="space-y-0">
                {sections.current.map((section, sIndex) => (
                  <React.Fragment key={sIndex}>
                    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 mb-6">
                      <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary/80">
                        {section.name}
                      </h2>
                    </div>

                    {allParagraphs.current
                      .filter(p => p.sectionIndex === sIndex)
                      .map((item, idx) => {
                        const globalIndex = allParagraphs.current.findIndex(
                          p => p.sectionIndex === sIndex &&
                          allParagraphs.current.filter(x => x.sectionIndex === sIndex).indexOf(p) === idx
                        );
                        const isCurrent = globalIndex === currentParagraphIndex;
                        const isPast = globalIndex < currentParagraphIndex;

                        return (
                          <div
                            key={globalIndex}
                            ref={el => (paragraphRefs.current[globalIndex] = el)}
                            className={`
                              py-8 px-6 rounded-lg transition-all duration-300 mb-2
                              ${isCurrent ? 'bg-card border-l-4 border-primary text-foreground' : ''}
                              ${isPast ? 'text-muted-foreground' : ''}
                              ${!isCurrent && !isPast ? 'text-muted-foreground/40' : ''}
                            `}
                          >
                            {item.type === 'paragraph' && (
                              <p className="text-xl leading-relaxed">
                                {renderParagraphText(item.data.paragraph.text, currentLesson.keywords)}
                              </p>
                            )}
                            {item.type === 'code' && (
                              <pre className="bg-muted/50 border border-border rounded-lg p-6 overflow-x-auto">
                                <code className="text-sm">{item.data.code.text}</code>
                              </pre>
                            )}
                          </div>
                        );
                      })}
                  </React.Fragment>
                ))}

                <NextLessonCTA
                  nextLessonTitle={nextLesson?.title || null}
                  nextLessonId={nextLesson?.id || null}
                  isInLastSection={isInLastSection}
                  onNextLesson={handleNextLesson}
                  isLastLesson={isLastLesson}
                />
              </div>
            </div>

            <VisualizationPanel lesson={currentLesson} />
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Card className="bg-card/95 backdrop-blur-lg border-border">
            <div className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={isPlaying ? "default" : "secondary"}
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button size="icon" variant="ghost" onClick={reset}>
                  <RotateCcw size={16} />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={prevParagraph}>
                  <ArrowUp size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={nextParagraph}>
                  <ArrowDown size={16} />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-3">
                <Gauge size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSpeed(s => Math.min(10000, s + 500))}
                  >
                    <Minus size={14} />
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[10000 - speed]}
                      min={0}
                      max={9000}
                      step={500}
                      onValueChange={([value]) => setSpeed(10000 - value)}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSpeed(s => Math.max(1000, s - 500))}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground font-mono min-w-[3rem]">
                  <AnimatedNumber value={speed} />ms
                </span>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="text-xs text-muted-foreground font-mono">
                {currentParagraphIndex + 1} / {totalParagraphs}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ReactLenis>
  );
}
