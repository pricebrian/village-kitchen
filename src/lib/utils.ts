import { type ClassValue, clsx } from 'clsx'

// Simple clsx without tailwind-merge to avoid extra dependency
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = then.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 1) return `in ${diffDays} days`
  if (diffDays === 1) return 'tomorrow'
  if (diffHours > 1) return `in ${diffHours} hours`
  if (diffHours === 1) return 'in 1 hour'
  if (diffMs > 0) return 'soon'
  return 'past'
}

export function isAtLeast24HoursFromNow(date: string | Date) {
  const targetDate = new Date(date)
  const minDate = new Date()
  minDate.setHours(minDate.getHours() + 24)
  return targetDate >= minDate
}

export function groupByDate<T extends { meal_date: string }>(items: T[]) {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const key = item.meal_date
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}
