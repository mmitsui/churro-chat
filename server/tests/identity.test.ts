import {
  generateNickname,
  generateColor,
  validateNickname,
  ADJECTIVES,
  NOUNS,
  USER_COLORS
} from '../src/utils/identity';

describe('Identity Utilities', () => {
  describe('generateNickname', () => {
    it('should generate a nickname with adjective + noun + number', () => {
      const nickname = generateNickname();
      expect(typeof nickname).toBe('string');
      expect(nickname.length).toBeGreaterThan(0);
    });

    it('should generate unique nicknames', () => {
      const nicknames = new Set<string>();
      for (let i = 0; i < 100; i++) {
        nicknames.add(generateNickname());
      }
      // At least 90% should be unique (allowing some collision)
      expect(nicknames.size).toBeGreaterThan(90);
    });

    it('should use adjectives and nouns from the lists', () => {
      for (let i = 0; i < 50; i++) {
        const nickname = generateNickname();
        const hasAdjective = ADJECTIVES.some(adj => nickname.startsWith(adj));
        const hasNoun = NOUNS.some(noun => nickname.includes(noun));
        expect(hasAdjective).toBe(true);
        expect(hasNoun).toBe(true);
      }
    });
  });

  describe('generateColor', () => {
    it('should generate a valid hex color', () => {
      const color = generateColor();
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should only use colors from the predefined list', () => {
      for (let i = 0; i < 50; i++) {
        const color = generateColor();
        expect(USER_COLORS).toContain(color);
      }
    });
  });

  describe('validateNickname', () => {
    it('should accept valid nicknames', () => {
      expect(validateNickname('JohnDoe').valid).toBe(true);
      expect(validateNickname('User_123').valid).toBe(true);
      expect(validateNickname('ab').valid).toBe(true);
      expect(validateNickname('A'.repeat(24)).valid).toBe(true);
    });

    it('should reject empty nicknames', () => {
      const result = validateNickname('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject null/undefined nicknames', () => {
      expect(validateNickname(null as any).valid).toBe(false);
      expect(validateNickname(undefined as any).valid).toBe(false);
    });

    it('should reject nicknames that are too short', () => {
      const result = validateNickname('a');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2');
    });

    it('should reject nicknames that are too long', () => {
      const result = validateNickname('A'.repeat(25));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('24 characters');
    });

    it('should reject nicknames with special characters', () => {
      expect(validateNickname('John Doe').valid).toBe(false);
      expect(validateNickname('User@123').valid).toBe(false);
      expect(validateNickname('User-123').valid).toBe(false);
      expect(validateNickname('User.123').valid).toBe(false);
    });

    it('should allow underscores', () => {
      expect(validateNickname('John_Doe').valid).toBe(true);
      expect(validateNickname('_user_').valid).toBe(true);
    });
  });
});
