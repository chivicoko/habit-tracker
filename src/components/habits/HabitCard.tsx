'use client'

import { useState } from 'react'
import type { Habit } from '@/types/habit'
import { getHabitSlug } from '@/lib/slug'
import { calculateCurrentStreak } from '@/lib/streaks'
import { toggleHabitCompletion } from '@/lib/habits'
import { getHabits, saveHabits } from '@/lib/storage'

interface Props {
  habit: Habit
  onUpdate: (habit: Habit) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
}

export default function HabitCard({ habit, onUpdate, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const slug = getHabitSlug(habit.name)
  const today = new Date().toISOString().split('T')[0]
  const isCompleted = habit.completions.includes(today)
  const streak = calculateCurrentStreak(habit.completions, today)

  function handleToggle() {
    const updated = toggleHabitCompletion(habit, today)
    const all = getHabits()
    const next = all.map(h => h.id === updated.id ? updated : h)
    saveHabits(next)
    onUpdate(updated)
  }

  function handleDeleteConfirm() {
    const all = getHabits()
    saveHabits(all.filter(h => h.id !== habit.id))
    onDelete(habit.id)
  }

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-xl border p-4 shadow-sm transition ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{habit.description}</p>
          )}
          <div
            data-testid={`habit-streak-${slug}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-600"
          >
            🔥 {streak} day{streak !== 1 ? 's' : ''} streak
          </div>
        </div>

        <button
          data-testid={`habit-complete-${slug}`}
          onClick={handleToggle}
          aria-label={isCompleted ? `Unmark ${habit.name}` : `Complete ${habit.name}`}
          className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-300 text-transparent hover:border-green-400'
          }`}
        >
          ✓
        </button>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          data-testid={`habit-edit-${slug}`}
          onClick={() => onEdit(habit)}
          className="flex-1 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          Edit
        </button>
        <button
          data-testid={`habit-delete-${slug}`}
          onClick={() => setConfirmDelete(true)}
          className="flex-1 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        >
          Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete habit?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete &ldquo;{habit.name}&rdquo;? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
