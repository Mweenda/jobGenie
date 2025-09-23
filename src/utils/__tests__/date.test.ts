import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatRelativeTime, formatJobPostedDate } from '../date'

describe('Date Utilities', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('formats date with default format', () => {
      const dateString = '2024-01-15T10:00:00Z'
      expect(formatDate(dateString)).toBe('Jan 15, 2024')
    })

    it('formats date with custom format', () => {
      const dateString = '2024-01-15T10:00:00Z'
      expect(formatDate(dateString, 'yyyy-MM-dd')).toBe('2024-01-15')
    })

    it('handles invalid date strings', () => {
      const invalidDate = 'invalid-date'
      expect(formatDate(invalidDate)).toBe('invalid-date')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats today as "Today"', () => {
      const today = '2024-01-15T10:00:00Z'
      expect(formatRelativeTime(today)).toBe('Today')
    })

    it('formats yesterday as "Yesterday"', () => {
      const yesterday = '2024-01-14T10:00:00Z'
      expect(formatRelativeTime(yesterday)).toBe('Yesterday')
    })

    it('formats older dates with relative time', () => {
      const twoDaysAgo = '2024-01-13T10:00:00Z'
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago')
    })

    it('handles invalid date strings', () => {
      const invalidDate = 'invalid-date'
      expect(formatRelativeTime(invalidDate)).toBe('invalid-date')
    })
  })

  describe('formatJobPostedDate', () => {
    it('formats very recent posts as "Just posted"', () => {
      const thirtyMinutesAgo = '2024-01-15T11:30:00Z'
      expect(formatJobPostedDate(thirtyMinutesAgo)).toBe('Just posted')
    })

    it('formats posts from hours ago', () => {
      const twoHoursAgo = '2024-01-15T10:00:00Z'
      expect(formatJobPostedDate(twoHoursAgo)).toBe('2 hours ago')
    })

    it('formats posts from yesterday', () => {
      const yesterday = '2024-01-14T12:00:00Z'
      expect(formatJobPostedDate(yesterday)).toBe('Yesterday')
    })

    it('formats posts from days ago', () => {
      const threeDaysAgo = '2024-01-12T12:00:00Z'
      expect(formatJobPostedDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('formats posts from weeks ago', () => {
      const tenDaysAgo = '2024-01-05T12:00:00Z'
      expect(formatJobPostedDate(tenDaysAgo)).toBe('1 week ago')
    })

    it('formats posts from multiple weeks ago', () => {
      const fifteenDaysAgo = '2023-12-31T12:00:00Z'
      expect(formatJobPostedDate(fifteenDaysAgo)).toBe('2 weeks ago')
    })

    it('formats very old posts with full date', () => {
      const twoMonthsAgo = '2023-11-15T12:00:00Z'
      expect(formatJobPostedDate(twoMonthsAgo)).toBe('Nov 15, 2023')
    })

    it('handles invalid date strings', () => {
      const invalidDate = 'invalid-date'
      expect(formatJobPostedDate(invalidDate)).toBe('invalid-date')
    })
  })
})