/**
 * React hook for text animation using Effect-TS
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Effect, Fiber, Runtime } from 'effect';
import {
  parseTextIntoSegments,
  type TextSegment,
  type AnimationState,
  getSegmentClasses,
  formatDuration
} from '../text-animator';

export interface UseTextAnimationOptions {
  text: string;
  keywords: string[];
  wordsPerMinute?: number;
  autoPlay?: boolean;
}

export interface UseTextAnimationReturn {
  segments: TextSegment[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: string;
  play: () => void;
  pause: () => void;
  reset: () => void;
  jumpTo: (index: number) => void;
  setSpeed: (wpm: number) => void;
  getSegmentClasses: (segment: TextSegment) => string;
}

export function useTextAnimation({
  text,
  keywords,
  wordsPerMinute = 150,
  autoPlay = false
}: UseTextAnimationOptions): UseTextAnimationReturn {
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(wordsPerMinute);

  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runtime = useRef(Runtime.defaultRuntime);

  // Parse text into segments when text or keywords change
  useEffect(() => {
    const parsed = parseTextIntoSegments(text, keywords);
    setSegments(parsed);
    setCurrentIndex(-1);
    setIsPlaying(false);
  }, [text, keywords]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && segments.length > 0 && currentIndex === -1) {
      const timer = setTimeout(() => {
        play();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, segments.length]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && segments.length > 0) {
      const msPerWord = (60 * 1000) / speed;

      animationRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= segments.length - 1) {
            setIsPlaying(false);
            if (animationRef.current) {
              clearInterval(animationRef.current);
            }
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [isPlaying, speed, segments.length]);

  const play = useCallback(() => {
    if (currentIndex >= segments.length - 1) {
      setCurrentIndex(-1);
    }
    setIsPlaying(true);
  }, [currentIndex, segments.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  }, []);

  const jumpTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(-1, Math.min(index, segments.length - 1)));
  }, [segments.length]);

  const setSpeed = useCallback((wpm: number) => {
    setSpeedState(wpm);
  }, []);

  const getClasses = useCallback((segment: TextSegment) => {
    return getSegmentClasses(segment, currentIndex);
  }, [currentIndex]);

  const progress = segments.length > 0
    ? Math.max(0, (currentIndex + 1) / segments.length) * 100
    : 0;

  const duration = formatDuration(segments.length, speed);

  return {
    segments,
    currentIndex,
    isPlaying,
    progress,
    duration,
    play,
    pause,
    reset,
    jumpTo,
    setSpeed,
    getSegmentClasses: getClasses
  };
}
