/**
 * Visualization Panel Component
 *
 * Displays lesson-specific visualizations with high-quality SVG animations
 * Kit Langton style: Minimal, precise, with subtle motion
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Lesson } from './course-data';

interface VisualizationPanelProps {
  lesson: Lesson;
}

interface VisualizationConfig {
  type: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
}

// Animated SVG components
const TokenPredictionIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Tokens flowing left to right */}
    <motion.circle
      cx="15"
      cy="40"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    />
    <motion.circle
      cx="35"
      cy="40"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, repeatType: 'reverse' }}
    />
    <motion.circle
      cx="55"
      cy="40"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, repeatType: 'reverse' }}
    />
    {/* Next token prediction with glow */}
    <motion.circle
      cx="75"
      cy="40"
      r="6"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.1)"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Connection lines */}
    <motion.line
      x1="21"
      y1="40"
      x2="29"
      y2="40"
      stroke="currentColor"
      strokeWidth="1.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
    <motion.line
      x1="41"
      y1="40"
      x2="49"
      y2="40"
      stroke="currentColor"
      strokeWidth="1.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    />
    <motion.line
      x1="61"
      y1="40"
      x2="69"
      y2="40"
      stroke="#fbbf24"
      strokeWidth="1.5"
      strokeDasharray="3 2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.7, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
    />
  </svg>
);

const ContextWindowIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Window frame */}
    <motion.rect
      x="10"
      y="15"
      width="60"
      height="50"
      stroke="currentColor"
      strokeWidth="2"
      rx="4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    />
    {/* Tokens filling up */}
    {[0, 1, 2, 3].map((i) => (
      <motion.rect
        key={i}
        x="16"
        y={22 + i * 10}
        width={50 - i * 8}
        height="6"
        fill="currentColor"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.6 - i * 0.1 }}
        transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
        style={{ originX: 0 }}
      />
    ))}
    {/* Overflow indicator */}
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
    >
      <rect x="16" y="54" width="18" height="6" fill="#fbbf24" opacity="0.5" />
      <text x="68" y="58" fill="#fbbf24" fontSize="8" fontFamily="monospace">!</text>
    </motion.g>
  </svg>
);

const ContextEngineeringIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Control layer */}
    <motion.rect
      x="8"
      y="12"
      width="28"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      rx="2"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 12, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    />
    <motion.text
      x="15"
      y="24"
      fill="currentColor"
      fontSize="7"
      fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ delay: 0.8 }}
    >
      CTRL
    </motion.text>

    {/* Info layer */}
    <motion.rect
      x="8"
      y="50"
      width="28"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      rx="2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 50, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100, delay: 0.2 }}
    />
    <motion.text
      x="15"
      y="62"
      fill="currentColor"
      fontSize="7"
      fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ delay: 1 }}
    >
      INFO
    </motion.text>

    {/* Output block */}
    <motion.rect
      x="48"
      y="30"
      width="24"
      height="20"
      stroke="#fbbf24"
      strokeWidth="2"
      rx="2"
      fill="rgba(251, 191, 36, 0.05)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
    />

    {/* Connection lines */}
    <motion.path
      d="M 36 21 Q 42 21, 42 40 Q 42 40, 48 40"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    />
    <motion.path
      d="M 36 59 Q 42 59, 42 40 Q 42 40, 48 40"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
    />
  </svg>
);

const SkillsIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Central hub */}
    <motion.circle
      cx="40"
      cy="40"
      r="12"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.1)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    />

    {/* Orbiting skill nodes */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * 60 * Math.PI) / 180;
      const radius = 25;
      const cx = 40 + Math.cos(angle) * radius;
      const cy = 40 + Math.sin(angle) * radius;

      return (
        <React.Fragment key={i}>
          <motion.line
            x1="40"
            y1="40"
            x2={cx}
            y2={cy}
            stroke="currentColor"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.1, type: 'spring' }}
          />
        </React.Fragment>
      );
    })}

    {/* Pulsing center */}
    <motion.circle
      cx="40"
      cy="40"
      r="4"
      fill="#fbbf24"
      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
);

const ProblemSolutionIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Problem circle */}
    <motion.circle
      cx="20"
      cy="40"
      r="12"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    />
    <motion.text
      x="17"
      y="43"
      fill="currentColor"
      fontSize="10"
      fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ delay: 0.6 }}
    >
      P
    </motion.text>

    {/* Solution circle */}
    <motion.circle
      cx="60"
      cy="40"
      r="12"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.05)"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
    />
    <motion.text
      x="57"
      y="43"
      fill="#fbbf24"
      fontSize="10"
      fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      S
    </motion.text>

    {/* Bridge arc */}
    <motion.path
      d="M 32 40 Q 40 20, 48 40"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    />

    {/* Animated bridge point */}
    <motion.circle
      cx="40"
      cy="28"
      r="3"
      fill="#fbbf24"
      animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
);

const MarketValidationIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Axes */}
    <motion.line
      x1="15"
      y1="60"
      x2="70"
      y2="60"
      stroke="currentColor"
      strokeWidth="1.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5 }}
    />
    <motion.line
      x1="15"
      y1="15"
      x2="15"
      y2="60"
      stroke="currentColor"
      strokeWidth="1.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />

    {/* Growth line */}
    <motion.path
      d="M 20 55 L 30 45 L 42 50 L 52 32 L 65 20"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
    />

    {/* Data points */}
    {[[20, 55], [30, 45], [42, 50], [52, 32], [65, 20]].map(([x, y], i) => (
      <motion.circle
        key={i}
        cx={x}
        cy={y}
        r="3"
        fill={i === 4 ? '#fbbf24' : 'currentColor'}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.7 + i * 0.15, type: 'spring' }}
      />
    ))}

    {/* Top point glow */}
    <motion.circle
      cx="65"
      cy="20"
      r="6"
      fill="rgba(251, 191, 36, 0.2)"
      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

const ValueGapIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Current state bar */}
    <motion.rect
      x="15"
      y="45"
      width="18"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.5 }}
      style={{ originY: 1 }}
    />

    {/* Desired state bar */}
    <motion.rect
      x="50"
      y="20"
      width="18"
      height="45"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.05)"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ originY: 1 }}
    />

    {/* Gap arrow */}
    <motion.path
      d="M 33 50 L 50 35"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    />
    <motion.polygon
      points="50,35 45,38 47,33"
      fill="currentColor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ delay: 1 }}
    />

    {/* GAP label */}
    <motion.text
      x="35"
      y="72"
      fill="currentColor"
      fontSize="8"
      fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ delay: 1.2 }}
    >
      GAP
    </motion.text>
  </svg>
);

const ToolsEcosystemIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Central orbit */}
    <motion.circle
      cx="40"
      cy="40"
      r="25"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, rotate: 0 }}
      animate={{ pathLength: 1, rotate: 360 }}
      transition={{
        pathLength: { duration: 1.5 },
        rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
      }}
      style={{ transformOrigin: '40px 40px' }}
    />

    {/* Tool nodes */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 40 + Math.cos(rad) * 25;
      const cy = 40 + Math.sin(rad) * 25;
      const colors = ['#fbbf24', 'currentColor', 'currentColor', '#fbbf24', 'currentColor', 'currentColor'];

      return (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="5"
          stroke={colors[i]}
          strokeWidth="1.5"
          fill={i % 3 === 0 ? `rgba(251, 191, 36, 0.1)` : 'none'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.1, type: 'spring' }}
        />
      );
    })}

    {/* Center hub */}
    <motion.circle
      cx="40"
      cy="40"
      r="8"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.15)"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

const ExperienceMiningIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Star shape */}
    <motion.path
      d="M 40 15 L 46 30 L 62 32 L 50 43 L 53 59 L 40 51 L 27 59 L 30 43 L 18 32 L 34 30 Z"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.05)"
      initial={{ pathLength: 0, scale: 0.5, opacity: 0 }}
      animate={{ pathLength: 1, scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ transformOrigin: '40px 40px' }}
    />

    {/* Center glow */}
    <motion.circle
      cx="40"
      cy="40"
      r="6"
      fill="#fbbf24"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.8, 1, 0.8],
        filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
);

const FoundationIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    {/* Pyramid blocks */}
    <motion.rect
      x="15"
      y="50"
      width="50"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 50, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    />
    <motion.rect
      x="23"
      y="36"
      width="34"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 36, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15, type: 'spring' }}
    />
    <motion.rect
      x="31"
      y="22"
      width="18"
      height="14"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="rgba(251, 191, 36, 0.1)"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 22, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
    />

    {/* Top glow */}
    <motion.circle
      cx="40"
      cy="29"
      r="3"
      fill="#fbbf24"
      animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
    />
  </svg>
);

export function VisualizationPanel({ lesson }: VisualizationPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Reset animations when lesson changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [lesson.id]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.code === 'KeyF' && !(e.target instanceof HTMLSelectElement)) {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const getVisualizationConfig = (): VisualizationConfig => {
    const keywords = lesson.keywords.map(k => k.toLowerCase());

    if (keywords.includes('token') && keywords.includes('prediction')) {
      return {
        type: 'TOKEN PREDICTION',
        description: 'Sequential generation · Autocomplete mechanism',
        keywords: lesson.keywords.slice(0, 4),
        icon: <TokenPredictionIcon />
      };
    }

    if (keywords.includes('context window') || (keywords.includes('tokens') && keywords.includes('memory'))) {
      return {
        type: 'CONTEXT WINDOW',
        description: 'Fixed capacity · Token economy · Memory constraints',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ContextWindowIcon />
      };
    }

    if (keywords.includes('control context') || keywords.includes('information context')) {
      return {
        type: 'CONTEXT ENGINEERING',
        description: 'Control layer · Information layer · Output steering',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ContextEngineeringIcon />
      };
    }

    if (keywords.includes('skill') || keywords.includes('reusable')) {
      return {
        type: 'CLAUDE SKILLS',
        description: 'Reusable workflows · Consistent behavior · Reference loading',
        keywords: lesson.keywords.slice(0, 4),
        icon: <SkillsIcon />
      };
    }

    if (keywords.includes('desires') || keywords.includes('problem') || keywords.includes('bridge')) {
      return {
        type: 'PROBLEM-SOLUTION MAP',
        description: 'Core desires · Value bridges · Outcome alignment',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ProblemSolutionIcon />
      };
    }

    if (keywords.includes('validation') || keywords.includes('market')) {
      return {
        type: 'MARKET VALIDATION',
        description: 'Desire depth · Market size · Competition analysis',
        keywords: lesson.keywords.slice(0, 4),
        icon: <MarketValidationIcon />
      };
    }

    if (keywords.includes('value gap') || keywords.includes('roi')) {
      return {
        type: 'VALUE GAP ANALYSIS',
        description: 'Current state · Desired state · ROI calculation',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ValueGapIcon />
      };
    }

    if (keywords.includes('tools') || keywords.includes('cursor') || keywords.includes('claude')) {
      return {
        type: 'AI TOOLS ECOSYSTEM',
        description: 'Text · Image · Video · Audio · Code generation',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ToolsEcosystemIcon />
      };
    }

    if (keywords.includes('experience') || keywords.includes('achievements')) {
      return {
        type: 'EXPERIENCE MINING',
        description: 'Achievement mapping · Pain points · Proof validation',
        keywords: lesson.keywords.slice(0, 4),
        icon: <ExperienceMiningIcon />
      };
    }

    return {
      type: 'FOUNDATION',
      description: 'Core concepts · Business fundamentals · Outcomes',
      keywords: lesson.keywords.slice(0, 4),
      icon: <FoundationIcon />
    };
  };

  const config = getVisualizationConfig();

  return (
    <motion.div
      className={`visualization-panel ${isFullscreen ? 'fullscreen' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fullscreen toggle */}
      <button
        className="fullscreen-btn"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        )}
      </button>

      <div className="visualization-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lesson.id}-${key}`}
            className={`visualization-placeholder ${isFullscreen ? 'fullscreen' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated icon */}
            <div className="visualization-icon">
              {config.icon}
            </div>

            {/* Type label */}
            <motion.div
              className="visualization-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {config.type}
            </motion.div>

            {/* Description */}
            <motion.div
              className="visualization-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {config.description}
            </motion.div>

            {/* Keywords */}
            <motion.div
              className="visualization-keywords"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {config.keywords.map((keyword, i) => (
                <motion.span
                  key={i}
                  className="visualization-keyword"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  {keyword}
                </motion.span>
              ))}
            </motion.div>

            {/* Meta info */}
            <motion.div
              className="visualization-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Lesson {lesson.id}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
