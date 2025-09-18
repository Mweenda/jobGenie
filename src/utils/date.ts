import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const date = parseISO(dateString)
    return format(date, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    
    if (isToday(date)) {
      return 'Today'
    }
    
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return dateString
  }
}

/**
 * Format job posting date for display
 */
export const formatJobPostedDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just posted'
    }
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    }
    
    if (diffInHours < 48) {
      return 'Yesterday'
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} days ago`
    }
    
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    }
    
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    console.error('Error formatting job posted date:', error)
    return dateString
  }
}