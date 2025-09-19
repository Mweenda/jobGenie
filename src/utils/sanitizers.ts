// src/utils/sanitizers.ts

/**
 * Sanitizes HTML content by removing potentially dangerous tags and scripts
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove dangerous tags but keep their content
  const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option']
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  // Decode common HTML entities
  sanitized = decodeHtmlEntities(sanitized)
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Decodes HTML entities to their corresponding characters
 * @param text - The text containing HTML entities
 * @returns Text with decoded entities
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': '\'',
    '&rsquo;': '\'',
    '&ldquo;': '"',
    '&rdquo;': '"'
  }

  let decoded = text
  
  // Replace named entities
  Object.entries(entityMap).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  })
  
  // Replace numeric entities (decimal)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10))
    } catch {
      return match
    }
  })
  
  // Replace numeric entities (hexadecimal)
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16))
    } catch {
      return match
    }
  })
  
  return decoded
}

/**
 * Validates and sanitizes user input for database storage
 * @param input - The user input to validate
 * @param maxLength - Maximum allowed length
 * @returns Sanitized and validated input
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove any HTML tags completely
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  sanitized = decodeHtmlEntities(sanitized)
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength)
  
  return sanitized
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim().toLowerCase())
}

/**
 * Sanitizes and validates URL
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }
  
  const trimmed = url.trim()
  
  // Only allow http and https protocols
  if (!trimmed.match(/^https?:\/\//i)) {
    return ''
  }
  
  try {
    const urlObj = new URL(trimmed)
    return urlObj.toString()
  } catch {
    return ''
  }
}

/**
 * Removes sensitive information from error messages
 * @param error - Error message or object
 * @returns Sanitized error message safe for client
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred'
  }
  
  let message = ''
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else {
    message = 'An error occurred'
  }
  
  // Remove potential sensitive information
  const sensitivePatterns = [
    /api[_-]?key[s]?[\s:=]+[^\s]+/gi,
    /token[s]?[\s:=]+[^\s]+/gi,
    /password[s]?[\s:=]+[^\s]+/gi,
    /secret[s]?[\s:=]+[^\s]+/gi,
    /auth[_-]?header[s]?[\s:=]+[^\s]+/gi,
    /bearer[\s]+[^\s]+/gi
  ]
  
  sensitivePatterns.forEach(pattern => {
    message = message.replace(pattern, '[REDACTED]')
  })
  
  return sanitizeHtml(message)
}
