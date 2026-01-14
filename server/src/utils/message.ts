// Maximum message length
const MAX_MESSAGE_LENGTH = 2000;

// Image file extensions to detect and warn about
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

// Dangerous URL schemes to block
const BLOCKED_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Validate message content
 * - Check length limits
 * - Detect image links (warn but allow)
 * - Block dangerous URL schemes
 */
export function validateMessage(content: string): { 
  valid: boolean; 
  error?: string;
  warnings?: string[];
  sanitized: string;
} {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message content is required', sanitized: '' };
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty', sanitized: '' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { 
      valid: false, 
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`,
      sanitized: ''
    };
  }

  // Check for blocked URL schemes
  const lowerContent = trimmed.toLowerCase();
  for (const scheme of BLOCKED_SCHEMES) {
    if (lowerContent.includes(scheme)) {
      return { 
        valid: false, 
        error: 'Message contains blocked content',
        sanitized: ''
      };
    }
  }

  // Check for image links (warning only)
  const warnings: string[] = [];
  for (const ext of IMAGE_EXTENSIONS) {
    if (lowerContent.includes(ext)) {
      warnings.push('Image links will not be previewed');
      break;
    }
  }

  // Sanitize: escape HTML to prevent XSS
  const sanitized = escapeHtml(trimmed);

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined, sanitized };
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Extract URLs from message content
 */
export function extractUrls(content: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const matches = content.match(urlRegex);
  return matches || [];
}

/**
 * Check if content contains only emoji
 */
export function isEmojiOnly(content: string): boolean {
  // Remove all emoji and whitespace, check if anything remains
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  const withoutEmoji = content.replace(emojiRegex, '').replace(/\s/g, '');
  return withoutEmoji.length === 0 && content.trim().length > 0;
}

export { MAX_MESSAGE_LENGTH, IMAGE_EXTENSIONS, BLOCKED_SCHEMES };
