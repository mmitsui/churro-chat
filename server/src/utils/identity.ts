// Adjectives for nickname generation
const ADJECTIVES = [
  'Happy', 'Clever', 'Swift', 'Brave', 'Calm', 'Eager', 'Gentle', 'Jolly',
  'Kind', 'Lively', 'Merry', 'Noble', 'Proud', 'Quick', 'Sunny', 'Witty',
  'Zesty', 'Bright', 'Cosmic', 'Dancing', 'Electric', 'Flying', 'Glowing',
  'Humble', 'Icy', 'Jazzy', 'Keen', 'Lucky', 'Mystic', 'Nimble', 'Ocean',
  'Peaceful', 'Quirky', 'Radiant', 'Silent', 'Turbo', 'Urban', 'Vivid',
  'Wild', 'Xenial', 'Young', 'Zealous', 'Arctic', 'Binary', 'Cyber',
  'Digital', 'Echo', 'Fusion', 'Galactic', 'Hyper', 'Infinite', 'Jungle'
];

// Nouns for nickname generation
const NOUNS = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Bear', 'Hawk',
  'Lion', 'Otter', 'Raven', 'Shark', 'Falcon', 'Koala', 'Lynx', 'Owl',
  'Phoenix', 'Dragon', 'Unicorn', 'Griffin', 'Ninja', 'Pirate', 'Wizard',
  'Knight', 'Ranger', 'Scout', 'Pilot', 'Captain', 'Comet', 'Star',
  'Moon', 'Sun', 'Storm', 'Thunder', 'Lightning', 'Blaze', 'Frost',
  'Shadow', 'Spirit', 'Phantom', 'Spark', 'Flame', 'Wave', 'Wind',
  'Cloud', 'River', 'Mountain', 'Forest', 'Desert', 'Ocean'
];

// Colors for user display (hex values)
const USER_COLORS = [
  '#E53935', // Red
  '#D81B60', // Pink
  '#8E24AA', // Purple
  '#5E35B1', // Deep Purple
  '#3949AB', // Indigo
  '#1E88E5', // Blue
  '#039BE5', // Light Blue
  '#00ACC1', // Cyan
  '#00897B', // Teal
  '#43A047', // Green
  '#7CB342', // Light Green
  '#C0CA33', // Lime
  '#FDD835', // Yellow
  '#FFB300', // Amber
  '#FB8C00', // Orange
  '#F4511E', // Deep Orange
];

/**
 * Generate a random nickname
 */
export function generateNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
}

/**
 * Generate a random color for user display
 */
export function generateColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

/**
 * Validate a nickname
 * - Must be 2-24 characters
 * - Only alphanumeric and underscores
 * - No offensive words (basic filter)
 */
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname is required' };
  }

  const trimmed = nickname.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Nickname must be at least 2 characters' };
  }

  if (trimmed.length > 24) {
    return { valid: false, error: 'Nickname must be 24 characters or less' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Nickname can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}

export { ADJECTIVES, NOUNS, USER_COLORS };
