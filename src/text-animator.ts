/**
 * Text Animation Engine using Effect-TS
 *
 * Creates smooth text highlighting animations similar to Kit Langton's
 * visual effect playground, using Effect's scheduling and streaming capabilities.
 */

import { Effect, Stream, Schedule, Chunk, Duration, Ref } from 'effect';

export interface TextSegment {
  text: string;
  isKeyword: boolean;
  index: number;
}

export interface AnimationState {
  currentIndex: number;
  segments: TextSegment[];
  isPlaying: boolean;
  speed: number; // words per minute
}

// Parse text into segments, marking keywords
export function parseTextIntoSegments(
  text: string,
  keywords: string[]
): TextSegment[] {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  // Split by words while preserving whitespace and punctuation
  const words = text.split(/(\s+)/);

  let index = 0;
  const segments: TextSegment[] = [];

  for (const word of words) {
    if (word.trim() === '') {
      // Preserve whitespace
      if (segments.length > 0) {
        segments[segments.length - 1].text += word;
      }
      continue;
    }

    // Check if word (stripped of punctuation) is a keyword
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const isKeyword = keywordSet.has(cleanWord) ||
                      keywords.some(kw => cleanWord.includes(kw.toLowerCase()));

    segments.push({
      text: word,
      isKeyword,
      index: index++
    });
  }

  return segments;
}

// Create an animation stream that emits indices over time
export function createAnimationStream(
  totalSegments: number,
  wordsPerMinute: number = 150
): Stream.Stream<number, never, never> {
  const msPerWord = (60 * 1000) / wordsPerMinute;

  return Stream.iterate(0, n => n + 1).pipe(
    Stream.take(totalSegments),
    Stream.schedule(Schedule.spaced(Duration.millis(msPerWord)))
  );
}

// Create a state machine for the animation
export function createAnimationState(
  segments: TextSegment[],
  speed: number = 150
): Effect.Effect<Ref.Ref<AnimationState>> {
  return Ref.make<AnimationState>({
    currentIndex: -1,
    segments,
    isPlaying: false,
    speed
  });
}

// Advance the animation by one step
export function advanceAnimation(
  stateRef: Ref.Ref<AnimationState>
): Effect.Effect<AnimationState> {
  return Ref.updateAndGet(stateRef, state => ({
    ...state,
    currentIndex: Math.min(state.currentIndex + 1, state.segments.length - 1)
  }));
}

// Reset the animation
export function resetAnimation(
  stateRef: Ref.Ref<AnimationState>
): Effect.Effect<AnimationState> {
  return Ref.updateAndGet(stateRef, state => ({
    ...state,
    currentIndex: -1,
    isPlaying: false
  }));
}

// Set playing state
export function setPlaying(
  stateRef: Ref.Ref<AnimationState>,
  isPlaying: boolean
): Effect.Effect<AnimationState> {
  return Ref.updateAndGet(stateRef, state => ({
    ...state,
    isPlaying
  }));
}

// Set animation speed
export function setSpeed(
  stateRef: Ref.Ref<AnimationState>,
  speed: number
): Effect.Effect<AnimationState> {
  return Ref.updateAndGet(stateRef, state => ({
    ...state,
    speed
  }));
}

// Jump to a specific position
export function jumpToPosition(
  stateRef: Ref.Ref<AnimationState>,
  index: number
): Effect.Effect<AnimationState> {
  return Ref.updateAndGet(stateRef, state => ({
    ...state,
    currentIndex: Math.max(-1, Math.min(index, state.segments.length - 1))
  }));
}

// Run the full animation
export function runAnimation(
  stateRef: Ref.Ref<AnimationState>,
  onUpdate: (state: AnimationState) => void
): Effect.Effect<void> {
  return Effect.gen(function* () {
    const initialState = yield* Ref.get(stateRef);
    const { segments, speed } = initialState;

    yield* setPlaying(stateRef, true);

    const stream = createAnimationStream(segments.length, speed);

    yield* Stream.runForEach(stream, (index) =>
      Effect.gen(function* () {
        const newState = yield* jumpToPosition(stateRef, index);
        onUpdate(newState);
      })
    );

    yield* setPlaying(stateRef, false);
  });
}

// Calculate CSS classes for a segment based on current position
export function getSegmentClasses(
  segment: TextSegment,
  currentIndex: number
): string {
  const classes: string[] = ['text-segment'];

  if (segment.isKeyword) {
    classes.push('inline-code');
  }

  if (segment.index === currentIndex) {
    classes.push('current');
  } else if (segment.index < currentIndex) {
    classes.push('past');
  } else {
    classes.push('future');
  }

  return classes.join(' ');
}

// Format duration for display
export function formatDuration(segments: number, wpm: number): string {
  const totalMs = (segments / wpm) * 60 * 1000;
  const seconds = Math.ceil(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
