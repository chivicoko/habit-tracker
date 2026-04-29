'use client'

import type { Habit } from '@/types/habit'
import HabitCard from './HabitCard'

interface Props {
  habits: Habit[]
  onUpdate: (habit: Habit) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
}

export default function HabitList({ habits, onUpdate, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {habits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}