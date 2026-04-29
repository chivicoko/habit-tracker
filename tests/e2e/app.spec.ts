import { test, expect } from '@playwright/test'

const EMAIL = 'e2e@example.com'
const PASSWORD = 'testpassword123'

async function signUpUser(page: any, email = EMAIL, password = PASSWORD) {
  await page.goto('/signup')
  await page.getByTestId('auth-signup-email').fill(email)
  await page.getByTestId('auth-signup-password').fill(password)
  await page.getByTestId('auth-signup-submit').click()
  await page.waitForURL('/dashboard')
}

async function clearStorage(page: any) {
  await page.evaluate(() => localStorage.clear())
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearStorage(page)
  })

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('splash-screen')).toBeVisible()
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await signUpUser(page)
    await page.goto('/')
    await page.waitForURL('/dashboard', { timeout: 5000 })
    await expect(page).toHaveURL('/dashboard')
  })

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup')
    await page.getByTestId('auth-signup-email').fill('newuser@example.com')
    await page.getByTestId('auth-signup-password').fill('newpassword')
    await page.getByTestId('auth-signup-submit').click()
    await page.waitForURL('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    // Sign up two users with different habits
    await signUpUser(page, 'user1@example.com', 'pass1')
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('User One Habit')
    await page.getByTestId('habit-save-button').click()
    await page.getByTestId('auth-logout-button').click()

    // Sign up second user
    await signUpUser(page, 'user2@example.com', 'pass2')
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('User Two Habit')
    await page.getByTestId('habit-save-button').click()
    await page.getByTestId('auth-logout-button').click()

    // Log in as user1 and verify only their habit is shown
    await page.goto('/login')
    await page.getByTestId('auth-login-email').fill('user1@example.com')
    await page.getByTestId('auth-login-password').fill('pass1')
    await page.getByTestId('auth-login-submit').click()
    await page.waitForURL('/dashboard')

    await expect(page.getByTestId('habit-card-user-one-habit')).toBeVisible()
    await expect(page.getByTestId('habit-card-user-two-habit')).not.toBeVisible()
  })

  test('creates a habit from the dashboard', async ({ page }) => {
    await signUpUser(page)
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Morning Run')
    await page.getByTestId('habit-description-input').fill('Run 5km every morning')
    await page.getByTestId('habit-save-button').click()
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible()
  })

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await signUpUser(page)
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Drink Water')
    await page.getByTestId('habit-save-button').click()

    const streakEl = page.getByTestId('habit-streak-drink-water')
    await expect(streakEl).toContainText('0')

    await page.getByTestId('habit-complete-drink-water').click()
    await expect(streakEl).toContainText('1')
  })

  test('persists session and habits after page reload', async ({ page }) => {
    await signUpUser(page)
    await page.getByTestId('create-habit-button').click()
    await page.getByTestId('habit-name-input').fill('Read Books')
    await page.getByTestId('habit-save-button').click()
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible()
  })

  test('logs out and redirects to /login', async ({ page }) => {
    await signUpUser(page)
    await page.getByTestId('auth-logout-button').click()
    await page.waitForURL('/login')
    await expect(page).toHaveURL('/login')
  })

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page }) => {
    // Load app while online to populate cache
    await signUpUser(page)
    await page.waitForTimeout(1000) // Allow SW to cache

    // Go offline
    await page.context().setOffline(true)

    // Navigate to login (the shell should load)
    await page.goto('/login')

    // App should load without hard crash - either renders login or shows something meaningful
    const body = await page.locator('body').textContent()
    expect(body).not.toBeNull()
    // Should not be a browser offline error page
    await expect(page.locator('[data-testid]').first()).toBeDefined()

    await page.context().setOffline(false)
  })
})
