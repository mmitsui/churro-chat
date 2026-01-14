import {
  validateMessage,
  escapeHtml,
  extractUrls,
  isEmojiOnly,
  MAX_MESSAGE_LENGTH
} from '../src/utils/message';

describe('Message Utilities', () => {
  describe('validateMessage', () => {
    it('should accept valid text messages', () => {
      const result = validateMessage('Hello, world!');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Hello, world!');
    });

    it('should accept messages with emojis', () => {
      const result = validateMessage('Hello 👋 World 🌍');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('Hello');
    });

    it('should accept messages with links', () => {
      const result = validateMessage('Check out https://example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toContain('https://example.com');
    });

    it('should reject empty messages', () => {
      expect(validateMessage('').valid).toBe(false);
      expect(validateMessage('   ').valid).toBe(false);
    });

    it('should reject null/undefined messages', () => {
      expect(validateMessage(null as any).valid).toBe(false);
      expect(validateMessage(undefined as any).valid).toBe(false);
    });

    it('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(MAX_MESSAGE_LENGTH + 1);
      const result = validateMessage(longMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(`${MAX_MESSAGE_LENGTH}`);
    });

    it('should accept messages at max length', () => {
      const maxMessage = 'A'.repeat(MAX_MESSAGE_LENGTH);
      const result = validateMessage(maxMessage);
      expect(result.valid).toBe(true);
    });

    it('should block javascript: URLs', () => {
      const result = validateMessage('Click javascript:alert(1)');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('blocked');
    });

    it('should block data: URLs', () => {
      const result = validateMessage('See data:text/html,<script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });

    it('should warn about image links', () => {
      const result = validateMessage('Look at https://example.com/image.png');
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0].toLowerCase()).toContain('image');
    });

    it('should sanitize HTML in messages', () => {
      const result = validateMessage('<script>alert("xss")</script>');
      expect(result.valid).toBe(true);
      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).toContain('&lt;script&gt;');
    });

    it('should trim whitespace', () => {
      const result = validateMessage('  Hello  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Hello');
    });
  });

  describe('escapeHtml', () => {
    it('should escape < and >', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('should escape &', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should not modify safe text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('extractUrls', () => {
    it('should extract HTTP URLs', () => {
      const urls = extractUrls('Visit http://example.com for more');
      expect(urls).toContain('http://example.com');
    });

    it('should extract HTTPS URLs', () => {
      const urls = extractUrls('Visit https://example.com for more');
      expect(urls).toContain('https://example.com');
    });

    it('should extract multiple URLs', () => {
      const urls = extractUrls('See https://a.com and https://b.com');
      expect(urls).toHaveLength(2);
      expect(urls).toContain('https://a.com');
      expect(urls).toContain('https://b.com');
    });

    it('should return empty array for no URLs', () => {
      const urls = extractUrls('No URLs here');
      expect(urls).toHaveLength(0);
    });

    it('should handle URLs with paths and params', () => {
      const urls = extractUrls('Go to https://example.com/path?query=1');
      expect(urls[0]).toContain('example.com/path');
    });
  });

  describe('isEmojiOnly', () => {
    it('should return true for emoji-only messages', () => {
      expect(isEmojiOnly('👋')).toBe(true);
      expect(isEmojiOnly('👋😀🎉')).toBe(true);
      expect(isEmojiOnly('👋 😀 🎉')).toBe(true);
    });

    it('should return false for text messages', () => {
      expect(isEmojiOnly('Hello')).toBe(false);
      expect(isEmojiOnly('Hello 👋')).toBe(false);
    });

    it('should return false for empty messages', () => {
      expect(isEmojiOnly('')).toBe(false);
      expect(isEmojiOnly('   ')).toBe(false);
    });
  });
});
