import { nanoid } from 'nanoid'
import type { User, Session } from '@/types/auth'
import { getUsers, saveUsers, saveSession } from '@/lib/storage'

export type AuthResult =
  | { success: true; session: Session }
  | { success: false; error: string }

export function signUp(email: string, password: string): AuthResult {
  const users = getUsers()

  if (!email || email.trim() === '') {
    return { success: false, error: 'Email is required' }
  }

  if (!password || password.trim() === '') {
    return { success: false, error: 'Password is required' }
  }

  if (users.find(u => u.email === email)) {
    return { success: false, error: 'User already exists' }
  }

  const newUser: User = {
    id: nanoid(),
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  saveUsers([...users, newUser])
  const session: Session = { userId: newUser.id, email: newUser.email }
  saveSession(session)

  return { success: true, session }
}

export function logIn(email: string, password: string): AuthResult {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const session: Session = { userId: user.id, email: user.email }
  saveSession(session)

  return { success: true, session }
}