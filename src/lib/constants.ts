export const STORAGE_KEYS = {
  USERS: 'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS: 'habit-tracker-habits',
} as const

export const HABIT_NAME_MAX_LENGTH = 60

export const SPLASH_SCREEN_DURATION_MS = 1000

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
] as const