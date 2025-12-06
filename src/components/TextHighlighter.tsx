/**
 * TextHighlighter Component
 *
 * Renders animated text with word-by-word highlighting
 * matching Kit Langton's Effect visualization style
 */

import React from 'react';
import { useTextAnimation } from '../hooks/useTextAnimation';

interface TextHighlighterProps {
  text: string;
  keywords: string[];
  wordsPerMinute?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export function TextHighlighter({
  text,
  keywords,
  wordsPerMinute = 150,
  autoPlay = false,
  showControls = true,
  className = ''
}: TextHighlighterProps) {
  const {
    segments,
    currentIndex,
    isPlaying,
    progress,
    duration,
    play,
    pause,
    reset,
    setSpeed,
    getSegmentClasses
  } = useTextAnimation({ text, keywords, wordsPerMinute, autoPlay });

  return (
    <div className={`text-highlighter ${className}`}>
      {/* Animated text */}
      <div className="paragraph">
        {segments.map((segment, i) => (
          <span
            key={i}
            className={getSegmentClasses(segment)}
          >
            {segment.text}
            {i < segments.length - 1 && ' '}
          </span>
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="playback-controls">
          <button
            onClick={isPlaying ? pause : play}
            className={`control-btn ${isPlaying ? '' : 'primary'}`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button onClick={reset} className="control-btn">
            Reset
          </button>

          <select
            value={wordsPerMinute}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="control-btn"
          >
            <option value={75}>0.5x</option>
            <option value={150}>1x</option>
            <option value={225}>1.5x</option>
            <option value={300}>2x</option>
          </select>

          <span className="speed-display">
            {Math.round(progress)}% | {duration}
          </span>
        </div>
      )}
    </div>
  );
}
