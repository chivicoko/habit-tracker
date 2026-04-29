export function calculateCurrentStreak(completions: string[], today?: string): number {
  const todayStr = today ?? new Date().toISOString().split('T')[0]

  const unique = Array.from(new Set(completions)).sort()

  if (!unique.includes(todayStr)) return 0

  let streak = 0
  let current = new Date(todayStr)

  while (true) {
    const dateStr = current.toISOString().split('T')[0]
    if (!unique.includes(dateStr)) break
    streak++
    current.setDate(current.getDate() - 1)
  }

  return streak
}
