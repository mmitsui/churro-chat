import { describe, it, expect } from 'vitest';
import { 
  parseMessageContent, 
  formatTimestamp, 
  formatTimeRemaining 
} from '../utils/format';

describe('Format Utilities', () => {
  describe('parseMessageContent', () => {
    it('should convert HTTP URLs to links', () => {
      const result = parseMessageContent('Check out http://example.com');
      expect(result).toContain('<a href="http://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should convert HTTPS URLs to links', () => {
      const result = parseMessageContent('Visit https://example.com');
      expect(result).toContain('<a href="https://example.com"');
    });

    it('should handle multiple URLs', () => {
      const result = parseMessageContent('See https://a.com and https://b.com');
      expect(result).toContain('href="https://a.com"');
      expect(result).toContain('href="https://b.com"');
    });

    it('should not modify text without URLs', () => {
      const text = 'Hello, world!';
      const result = parseMessageContent(text);
      expect(result).toBe(text);
    });

    it('should preserve emojis', () => {
      const text = 'Hello 👋 World 🌍';
      const result = parseMessageContent(text);
      expect(result).toBe(text);
    });

    it('should handle URLs with paths and query params', () => {
      const result = parseMessageContent('Go to https://example.com/path?query=1&other=2');
      expect(result).toContain('example.com/path');
    });
  });

  describe('formatTimestamp', () => {
    it('should format time for today', () => {
      const now = Date.now();
      const result = formatTimestamp(now);
      // Should contain time but not date
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format time with date for past days', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const result = formatTimestamp(yesterday);
      // Should contain both date and time
      expect(result.length).toBeGreaterThan(5);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should show hours and minutes for future time', () => {
      const twoHoursFromNow = Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000;
      const result = formatTimeRemaining(twoHoursFromNow);
      expect(result).toContain('2h');
      expect(result).toContain('remaining');
    });

    it('should show only minutes when less than an hour', () => {
      const thirtyMinutesFromNow = Date.now() + 30 * 60 * 1000;
      const result = formatTimeRemaining(thirtyMinutesFromNow);
      expect(result).toContain('30m');
      expect(result).not.toContain('h');
    });

    it('should show "Expired" for past times', () => {
      const pastTime = Date.now() - 1000;
      const result = formatTimeRemaining(pastTime);
      expect(result).toBe('Expired');
    });
  });
});
