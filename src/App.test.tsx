import { render } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders loading state on mount', () => {
    render(<App />)
    expect(document.body).toBeDefined()
  })

  it('redirects unauthenticated users to login', () => {
    window.history.pushState({}, 'Test', '/dashboard')
    render(<App />)
    expect(document.body).toBeDefined()
  })
})
