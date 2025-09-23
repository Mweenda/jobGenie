import { describe, it, expect } from 'vitest'
import {
  formatSalary,
  formatNumber,
  formatJobType,
  formatExperienceLevel,
  formatCompanySize,
  truncateText,
  getInitials,
  formatApplicationStatus,
} from '../format'

describe('Format Utilities', () => {
  describe('formatSalary', () => {
    it('formats salary range with min and max', () => {
      expect(formatSalary(50000, 80000)).toBe('$50,000 - $80,000')
    })

    it('formats salary with only min', () => {
      expect(formatSalary(50000, null)).toBe('$50,000+')
    })

    it('formats salary with only max', () => {
      expect(formatSalary(null, 80000)).toBe('Up to $80,000')
    })

    it('handles no salary information', () => {
      expect(formatSalary(null, null)).toBe('Salary not specified')
      expect(formatSalary(undefined, undefined)).toBe('Salary not specified')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(123456789)).toBe('123,456,789')
    })

    it('handles small numbers', () => {
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatJobType', () => {
    it('formats known job types', () => {
      expect(formatJobType('full-time')).toBe('Full-time')
      expect(formatJobType('part-time')).toBe('Part-time')
      expect(formatJobType('contract')).toBe('Contract')
      expect(formatJobType('internship')).toBe('Internship')
      expect(formatJobType('freelance')).toBe('Freelance')
    })

    it('handles unknown job types', () => {
      expect(formatJobType('custom-type')).toBe('custom-type')
    })

    it('handles null/undefined', () => {
      expect(formatJobType(null)).toBe('Not specified')
      expect(formatJobType(null)).toBe('Not specified')
    })
  })

  describe('formatExperienceLevel', () => {
    it('formats known experience levels', () => {
      expect(formatExperienceLevel('entry')).toBe('Entry Level')
      expect(formatExperienceLevel('mid')).toBe('Mid Level')
      expect(formatExperienceLevel('senior')).toBe('Senior Level')
      expect(formatExperienceLevel('executive')).toBe('Executive')
    })

    it('handles unknown levels', () => {
      expect(formatExperienceLevel('custom-level')).toBe('custom-level')
    })

    it('handles null/undefined', () => {
      expect(formatExperienceLevel(null)).toBe('Not specified')
    })
  })

  describe('formatCompanySize', () => {
    it('formats known company sizes', () => {
      expect(formatCompanySize('startup')).toBe('Startup (1-10 employees)')
      expect(formatCompanySize('small')).toBe('Small (11-50 employees)')
      expect(formatCompanySize('medium')).toBe('Medium (51-200 employees)')
      expect(formatCompanySize('large')).toBe('Large (201-1000 employees)')
      expect(formatCompanySize('enterprise')).toBe('Enterprise (1000+ employees)')
    })

    it('handles unknown sizes', () => {
      expect(formatCompanySize('custom-size')).toBe('custom-size')
    })

    it('handles null/undefined', () => {
      expect(formatCompanySize(null)).toBe('Not specified')
    })
  })

  describe('truncateText', () => {
    it('truncates text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('does not truncate text shorter than max length', () => {
      const shortText = 'Short text'
      expect(truncateText(shortText, 20)).toBe('Short text')
    })

    it('handles exact length', () => {
      const exactText = 'Exactly twenty chars'
      expect(truncateText(exactText, 20)).toBe('Exactly twenty chars')
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })

  describe('getInitials', () => {
    it('gets initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane Mary Smith')).toBe('JM')
    })

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('handles empty string', () => {
      expect(getInitials('')).toBe('')
    })

    it('handles lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('limits to 2 characters', () => {
      expect(getInitials('John Mary Jane Doe')).toBe('JM')
    })
  })

  describe('formatApplicationStatus', () => {
    it('formats known statuses', () => {
      expect(formatApplicationStatus('pending')).toEqual({
        text: 'Pending',
        color: 'yellow'
      })
      expect(formatApplicationStatus('reviewed')).toEqual({
        text: 'Under Review',
        color: 'blue'
      })
      expect(formatApplicationStatus('accepted')).toEqual({
        text: 'Accepted',
        color: 'green'
      })
      expect(formatApplicationStatus('rejected')).toEqual({
        text: 'Rejected',
        color: 'red'
      })
    })

    it('handles unknown status', () => {
      expect(formatApplicationStatus('custom-status')).toEqual({
        text: 'custom-status',
        color: 'gray'
      })
    })
  })
})