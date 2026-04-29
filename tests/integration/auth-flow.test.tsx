import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
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

import SignupForm from '@/components/auth/SignupForm'
import LoginForm from '@/components/auth/LoginForm'
import { saveUsers } from '@/lib/storage'

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com')
    await user.type(screen.getByTestId('auth-signup-password'), 'password123')
    await user.click(screen.getByTestId('auth-signup-submit'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    const session = JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null')
    expect(session).not.toBeNull()
    expect(session.email).toBe('test@example.com')
  })

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup()
    saveUsers([{
      id: 'u1',
      email: 'existing@example.com',
      password: 'pass',
      createdAt: new Date().toISOString(),
    }])

    render(<SignupForm />)
    await user.type(screen.getByTestId('auth-signup-email'), 'existing@example.com')
    await user.type(screen.getByTestId('auth-signup-password'), 'pass')
    await user.click(screen.getByTestId('auth-signup-submit'))

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup()
    saveUsers([{
      id: 'u1',
      email: 'user@example.com',
      password: 'secret',
      createdAt: new Date().toISOString(),
    }])

    render(<LoginForm />)
    await user.type(screen.getByTestId('auth-login-email'), 'user@example.com')
    await user.type(screen.getByTestId('auth-login-password'), 'secret')
    await user.click(screen.getByTestId('auth-login-submit'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    const session = JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null')
    expect(session).not.toBeNull()
    expect(session.userId).toBe('u1')
  })

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByTestId('auth-login-email'), 'nobody@example.com')
    await user.type(screen.getByTestId('auth-login-password'), 'wrong')
    await user.click(screen.getByTestId('auth-login-submit'))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })
})
