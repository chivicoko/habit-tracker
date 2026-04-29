import { describe, it, expect } from 'vitest'
import { toggleHabitCompletion } from '@/lib/habits'
import type { Habit } from '@/types/habit'

const baseHabit: Habit = {
  id: 'h1',
  userId: 'u1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
}

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2024-06-15')
    expect(result.completions).toContain('2024-06-15')
  })

  it('removes a completion date when the date already exists', () => {
    const habit = { ...baseHabit, completions: ['2024-06-15'] }
    const result = toggleHabitCompletion(habit, '2024-06-15')
    expect(result.completions).not.toContain('2024-06-15')
  })

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: ['2024-06-14'] }
    const original = [...habit.completions]
    toggleHabitCompletion(habit, '2024-06-15')
    expect(habit.completions).toEqual(original)
  })

  it('does not return duplicate completion dates', () => {
    const habit = { ...baseHabit, completions: ['2024-06-15', '2024-06-15'] }
    const result = toggleHabitCompletion(habit, '2024-06-14')
    const unique = new Set(result.completions)
    expect(unique.size).toBe(result.completions.length)
  })
})
