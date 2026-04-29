import type { Habit } from '@/types/habit'

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = habit.completions.includes(date)
    ? habit.completions.filter(d => d !== date)
    : [...habit.completions, date]

  return {
    ...habit,
    completions: Array.from(new Set(completions)),
  }
}
