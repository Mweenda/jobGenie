/**
 * Format salary range for display
 */
export const formatSalary = (min?: number | null, max?: number | null): string => {
  if (!min && !max) {
    return 'Salary not specified'
  }
  
  if (min && max) {
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }
  
  if (min) {
    return `$${formatNumber(min)}+`
  }
  
  if (max) {
    return `Up to $${formatNumber(max)}`
  }
  
  return 'Salary not specified'
}

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

/**
 * Format job type for display
 */
export const formatJobType = (jobType: string | null): string => {
  if (!jobType) return 'Not specified'
  
  const typeMap: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
    'freelance': 'Freelance'
  }
  
  return typeMap[jobType] || jobType
}

/**
 * Format experience level for display
 */
export const formatExperienceLevel = (level: string | null): string => {
  if (!level) return 'Not specified'
  
  const levelMap: Record<string, string> = {
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior Level',
    'executive': 'Executive'
  }
  
  return levelMap[level] || level
}

/**
 * Format company size for display
 */
export const formatCompanySize = (size: string | null): string => {
  if (!size) return 'Not specified'
  
  const sizeMap: Record<string, string> = {
    'startup': 'Startup (1-10 employees)',
    'small': 'Small (11-50 employees)',
    'medium': 'Medium (51-200 employees)',
    'large': 'Large (201-1000 employees)',
    'enterprise': 'Enterprise (1000+ employees)'
  }
  
  return sizeMap[size] || size
}

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Format application status for display
 */
export const formatApplicationStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    'pending': { text: 'Pending', color: 'yellow' },
    'reviewed': { text: 'Under Review', color: 'blue' },
    'accepted': { text: 'Accepted', color: 'green' },
    'rejected': { text: 'Rejected', color: 'red' }
  }
  
  return statusMap[status] || { text: status, color: 'gray' }
}