/**
 * Parse message content and convert URLs to clickable links
 */
export function parseMessageContent(content: string): string {
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  
  // Replace URLs with anchor tags
  return content.replace(urlRegex, (url) => {
    // Escape any HTML in the URL itself
    const escapedUrl = escapeHtml(url);
    return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
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
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  
  const timeStr = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isToday) {
    return timeStr;
  }

  const dateStr = date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });

  return `${dateStr} ${timeStr}`;
}

/**
 * Format time remaining until expiry
 */
export function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const remaining = expiresAt - now;

  if (remaining <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}
