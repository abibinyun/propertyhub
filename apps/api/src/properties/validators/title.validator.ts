import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'propertyTitle', async: false })
export class PropertyTitleValidator implements ValidatorConstraintInterface {
  private readonly SPAM_KEYWORDS = [
    'murah banget', 'super murah', 'paling murah', 'termurah se-',
    'dijamin', 'pasti untung', 'cuan', 'profit tinggi',
    'bonus', 'gratis', 'free', 'promo', 'diskon',
    'wa sekarang', 'hubungi segera', 'jangan lewatkan',
    'limited', 'terbatas', 'hanya hari ini',
    'investasi terbaik', 'roi tinggi', 'passive income',
  ];

  private readonly FORBIDDEN_PATTERNS = [
    /(.)\1{3,}/i, // Repeated chars (aaaa, 1111)
    /[!]{2,}/,    // Multiple exclamation marks
    /[?]{2,}/,    // Multiple question marks
    /\d{10,}/,    // Phone numbers (10+ digits)
    /0\d{2,3}[-\s]?\d{3,4}[-\s]?\d{3,4}/i, // Phone patterns
    /wa\.me|whatsapp/i, // WhatsApp links
    /http|www\./i, // URLs
  ];

  validate(title: string, args: ValidationArguments) {
    if (!title || typeof title !== 'string') {
      return false;
    }

    const trimmed = title.trim();

    // Length check
    if (trimmed.length < 10 || trimmed.length > 100) {
      return false;
    }

    // Spam keyword check
    const lowerTitle = trimmed.toLowerCase();
    for (const spam of this.SPAM_KEYWORDS) {
      if (lowerTitle.includes(spam)) {
        return false;
      }
    }

    // Forbidden pattern check
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }

    // Keyword stuffing check (same word repeated 3+ times)
    const words = trimmed.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 3) { // Only check meaningful words
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
        if (wordCount.get(word)! >= 3) {
          return false;
        }
      }
    }

    // All caps check (more than 50% uppercase)
    const upperCount = (trimmed.match(/[A-Z]/g) || []).length;
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.5) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const title = args.value as string;
    
    if (!title || title.trim().length < 10) {
      return 'Title must be at least 10 characters';
    }
    
    if (title.trim().length > 100) {
      return 'Title must not exceed 100 characters';
    }

    // Check which rule failed
    const lowerTitle = title.toLowerCase();
    for (const spam of this.SPAM_KEYWORDS) {
      if (lowerTitle.includes(spam)) {
        return `Title contains spam keyword: "${spam}"`;
      }
    }

    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(title)) {
        return 'Title contains forbidden pattern (phone numbers, URLs, or excessive punctuation)';
      }
    }

    const words = title.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();
    for (const word of words) {
      if (word.length > 3) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
        if (wordCount.get(word)! >= 3) {
          return `Keyword stuffing detected: "${word}" repeated too many times`;
        }
      }
    }

    const upperCount = (title.match(/[A-Z]/g) || []).length;
    const letterCount = (title.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.5) {
      return 'Title has too many uppercase letters';
    }

    return 'Title contains invalid content';
  }
}
