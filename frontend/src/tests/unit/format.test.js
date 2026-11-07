import { formatViews, formatDuration, timeAgo } from '@/lib/format';

describe('format utilities', () => {
  it('formats view counts properly', () => {
    expect(formatViews(0)).toBe('0');
    expect(formatViews(500)).toBe('500');
    expect(formatViews(1500)).toBe('1.5K');
    expect(formatViews(1000000)).toBe('1M');
    expect(formatViews(2500000)).toBe('2.5M');
    expect(formatViews(1000000000)).toBe('1B');
  });

  it('formats duration properly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(45)).toBe('0:45');
    expect(formatDuration(75)).toBe('1:15');
    expect(formatDuration(3665)).toBe('1:01:05');
  });

  it('formats time ago properly', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo(new Date().toISOString())).toBe('Just now');
    const past = new Date(Date.now() - 3600 * 2000).toISOString();
    expect(timeAgo(past)).toContain('hour');
  });
});
