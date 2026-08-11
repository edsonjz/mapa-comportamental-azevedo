/**
 * DETERMINISTIC OPTION SHUFFLING UTILITY
 * Uses Fisher-Yates algorithm with Mulberry32 PRNG.
 * Ensures the same seed string (e.g. `${assessmentId}-${questionCode}`)
 * always produces the exact same option order for a candidate.
 */

// Simple hash string to 32-bit unsigned integer
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Mulberry32 PRNG algorithm
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles a copy of an array using a seed string.
 */
export function shuffleArray<T>(items: T[], seedStr: string): T[] {
  const result = [...items];
  if (result.length <= 1) return result;

  const seedNum = hashString(seedStr);
  const random = mulberry32(seedNum);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export interface DisplayOption {
  displayKey: string;     // 'A', 'B', 'C', 'D' shown on screen
  originalKey: string;    // 'A', 'B', 'C', 'D' corresponding to original data schema
  text: string;
}

/**
 * Shuffles SJT 4-option questions deterministically and assigns visual display keys A, B, C, D.
 */
export function getShuffledSjtOptions(
  originalOptions: { key: string; text: string }[],
  seedStr: string
): DisplayOption[] {
  const shuffled = shuffleArray(originalOptions, seedStr);
  const keys = ['A', 'B', 'C', 'D'];

  return shuffled.map((opt, idx) => ({
    displayKey: keys[idx] || opt.key,
    originalKey: opt.key,
    text: opt.text
  }));
}

/**
 * Shuffles Binary 2-option questions (A/B) deterministically.
 */
export function getShuffledBinaryOptions(
  optionA: string,
  optionB: string,
  seedStr: string
): DisplayOption[] {
  const items = [
    { originalKey: 'A', text: optionA },
    { originalKey: 'B', text: optionB }
  ];
  const shuffled = shuffleArray(items, seedStr);
  const keys = ['A', 'B'];

  return shuffled.map((opt, idx) => ({
    displayKey: keys[idx],
    originalKey: opt.originalKey,
    text: opt.text
  }));
}
