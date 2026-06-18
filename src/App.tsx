import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Calculator = lazy(() => import('@/pages/Calculator'))
const Assistant = lazy(() => import('@/pages/Assistant'))
const Goals = lazy(() => import('@/pages/Goals'))
const Profile = lazy(() => import('@/pages/Profile'))

const TOAST_DURATION = 3000 as const

/**
 * Loading screen shown during lazy route loading or authentication state validation.
 */
function LoadingScreen(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500 font-sans">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Protected layout container rendering sidebar navigation alongside the inner route pages.
 */
function ProtectedLayout(): React.JSX.Element {
  return (
    <div className="flex min-h-screen bg-primary-50">
      <Sidebar />
      <main id="main-content" className="flex-1 p-8 overflow-auto" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

/**
 * Root Application router and layout orchestrator.
 */
export default function App(): React.JSX.Element {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-sans',
          duration: TOAST_DURATION,
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/*"
            element={user ? <ProtectedLayout /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
