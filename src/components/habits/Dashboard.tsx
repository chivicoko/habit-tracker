'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Habit } from '@/types/habit'
import type { Session } from '@/types/auth'
import { getSession, clearSession, getHabits } from '@/lib/storage'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'
import HabitList from './HabitList'


export default function Dashboard() {
  const router = useRouter()

  // Read session synchronously so render isn't blocked
  const initialSession = typeof window !== 'undefined' ? getSession() : null
  const [session, setSession] = useState<Session | null>(initialSession)
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (!initialSession || typeof window === 'undefined') return []
    return getHabits().filter(h => h.userId === initialSession.userId)
  })
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  // useEffect(() => {
  //   const s = getSession()
  //   if (!s) {
  //     router.replace('/login')
  //     return
  //   }
  //   setSession(s)
  //   setHabits(getHabits().filter(h => h.userId === s.userId))
  // }, [router])

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/login')
    }
  }, []) // only run once on mount

  function handleLogout() {
    clearSession()
    router.push('/login')
  }

  function handleSave(habit: Habit) {
    setHabits(prev => {
      const exists = prev.find(h => h.id === habit.id)
      return exists ? prev.map(h => h.id === habit.id ? habit : h) : [...prev, habit]
    })
    setShowForm(false)
    setEditingHabit(null)
  }

  function handleUpdate(habit: Habit) {
    setHabits(prev => prev.map(h => h.id === habit.id ? habit : h))
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  function handleCancel() {
    setShowForm(false)
    setEditingHabit(null)
  }

  if (!session) return null

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="font-bold text-gray-900">Habit Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{session.email}</span>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Habits</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            data-testid="create-habit-button"
            onClick={() => { setEditingHabit(null); setShowForm(true) }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold text-sm"
          >
            <span aria-hidden>+</span> Add habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div
            data-testid="empty-state"
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No habits yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Start building better habits by adding your first one.
            </p>
            <button
              onClick={() => { setEditingHabit(null); setShowForm(true) }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold"
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <HabitList
            habits={habits}
            onUpdate={handleUpdate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {showForm && (
        <HabitForm
          editingHabit={editingHabit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}