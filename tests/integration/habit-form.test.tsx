

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import Dashboard from '@/components/habits/Dashboard'
import { saveSession, saveHabits } from '@/lib/storage'
import type { Habit } from '@/types/habit'

const testSession = { userId: 'u1', email: 'test@example.com' }

const drinkWaterHabit: Habit = {
  id: 'h1',
  userId: 'u1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockReplace.mockClear()
    saveSession(testSession)
  })

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    await waitFor(() => screen.getByTestId('create-habit-button'))
    await user.click(screen.getByTestId('create-habit-button'))
    await waitFor(() => screen.getByTestId('habit-form'))
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(screen.getByText('Habit name is required')).toBeInTheDocument()
    })
  })

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    await waitFor(() => screen.getByTestId('create-habit-button'))
    await user.click(screen.getByTestId('create-habit-button'))
    await waitFor(() => screen.getByTestId('habit-form'))

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water')
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated')
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument()
    })
  })

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup()
    saveHabits([drinkWaterHabit])
    render(<Dashboard />)

    await waitFor(() => screen.getByTestId('habit-edit-drink-water'))
    await user.click(screen.getByTestId('habit-edit-drink-water'))
    await waitFor(() => screen.getByTestId('habit-form'))

    const nameInput = screen.getByTestId('habit-name-input')
    await user.clear(nameInput)
    await user.type(nameInput, 'Drink More Water')
    await user.click(screen.getByTestId('habit-save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('habit-card-drink-more-water')).toBeInTheDocument()
    })

    // Verify immutable fields preserved in storage
    const stored = JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]')
    const updated = stored.find((h: Habit) => h.name === 'Drink More Water')
    expect(updated.id).toBe(drinkWaterHabit.id)
    expect(updated.userId).toBe(drinkWaterHabit.userId)
    expect(updated.createdAt).toBe(drinkWaterHabit.createdAt)
  })

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup()
    saveHabits([drinkWaterHabit])
    render(<Dashboard />)

    await waitFor(() => screen.getByTestId('habit-delete-drink-water'))

    // Click delete - should show confirm dialog, not delete immediately
    await user.click(screen.getByTestId('habit-delete-drink-water'))
    await waitFor(() => screen.getByTestId('confirm-delete-button'))

    // Habit still there
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument()

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-button'))
    await waitFor(() => {
      expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument()
    })
  })

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup()
    saveHabits([drinkWaterHabit])
    render(<Dashboard />)

    await waitFor(() => screen.getByTestId('habit-complete-drink-water'))

    const streakEl = screen.getByTestId('habit-streak-drink-water')
    expect(streakEl.textContent).toContain('0')

    await user.click(screen.getByTestId('habit-complete-drink-water'))

    await waitFor(() => {
      const updated = screen.getByTestId('habit-streak-drink-water')
      expect(updated.textContent).toContain('1')
    })
  })
})
