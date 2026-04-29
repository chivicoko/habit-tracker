'use client'

import { useState, useEffect } from 'react'
import type { Habit } from '@/types/habit'
import { validateHabitName } from '@/lib/validators'
import { getHabits, saveHabits, getSession } from '@/lib/storage'

import { nanoid } from 'nanoid'

interface Props {
  editingHabit?: Habit | null
  onSave: (habit: Habit) => void
  onCancel: () => void
}

export default function HabitForm({ editingHabit, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name)
      setDescription(editingHabit.description)
    } else {
      setName('')
      setDescription('')
    }
    setNameError(null)
  }, [editingHabit])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateHabitName(name)
    if (!result.valid) {
      setNameError(result.error)
      return
    }

    const session = getSession()
    if (!session) return

    const all = getHabits()

    if (editingHabit) {
      const updated: Habit = {
        ...editingHabit,
        name: result.value,
        description: description.trim(),
      }
      saveHabits(all.map(h => h.id === updated.id ? updated : h))
      onSave(updated)
    } else {
      const newHabit: Habit = {
        id: nanoid(),
        userId: session.userId,
        name: result.value,
        description: description.trim(),
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      }
      saveHabits([...all, newHabit])
      onSave(newHabit)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div
        data-testid="habit-form"
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {editingHabit ? 'Edit habit' : 'New habit'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="habit-name"
              data-testid="habit-name-input"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(null) }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Drink Water"
            />
            {nameError && (
              <p className="text-red-600 text-sm mt-1">{nameError}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="habit-description"
              data-testid="habit-description-input"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional description"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="habit-frequency"
              data-testid="habit-frequency-select"
              defaultValue="daily"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="daily">Daily</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="habit-save-button"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold"
            >
              {editingHabit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
