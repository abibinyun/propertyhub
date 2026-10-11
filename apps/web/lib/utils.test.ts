import { describe, it, expect } from 'bun:test';
import { cn, formatPrice, timeAgo } from './utils';

describe('Frontend Utils (TDD)', () => {
  describe('cn (Tailwind class merger)', () => {
    it('should merge class names and resolve conflicting Tailwind utilities', () => {
      expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', false && 'text-blue-500', null, undefined)).toBe('text-red-500');
    });
  });

  describe('formatPrice', () => {
    it('should format billions into M rupiah', () => {
      expect(formatPrice(1_500_000_000)).toBe('Rp 1.5 M');
      expect(formatPrice('2500000000')).toBe('Rp 2.5 M');
    });

    it('should format millions into Jt rupiah', () => {
      expect(formatPrice(750_000_000)).toBe('Rp 750 Jt');
      expect(formatPrice('85000000')).toBe('Rp 85 Jt');
    });

    it('should format below 1 million with locale string', () => {
      expect(formatPrice(500_000)).toBe('Rp 500.000');
    });
  });

  describe('timeAgo', () => {
    it('should return "Baru saja" for less than 60 seconds', () => {
      const now = new Date();
      expect(timeAgo(now)).toBe('Baru saja');
    });

    it('should return minutes ago for under 1 hour', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(timeAgo(tenMinutesAgo)).toBe('10 menit lalu');
    });

    it('should return hours ago for under 1 day', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
      expect(timeAgo(threeHoursAgo)).toBe('3 jam lalu');
    });

    it('should return days ago for under 30 days', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86400 * 1000);
      expect(timeAgo(fiveDaysAgo)).toBe('5 hari lalu');
    });
  });
});
