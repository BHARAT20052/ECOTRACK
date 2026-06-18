import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Leaf } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormData = { email: string; password: string; displayName?: string }

/**
 * Authentication view containing Email/Password forms and Google Sign-In options.
 */
function LoginContent(): React.JSX.Element {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth()

  const currentSchema = mode === 'login' ? loginSchema : registerSchema

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(currentSchema) as Resolver<FormData>,
    defaultValues: { email: '', password: '', displayName: '' },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      if (mode === 'login') {
        await loginWithEmail(data.email, data.password)
        toast.success('Successfully logged in!')
      } else {
        await registerWithEmail(data.email, data.password, data.displayName || '')
        toast.success('Account created successfully!')
      }
      navigate('/dashboard')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)
    try {
      await loginWithGoogle()
      toast.success('Successfully logged in with Google!')
      navigate('/dashboard')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed'
      setAuthError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [loginWithGoogle, navigate])

  const toggleMode = (): void => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setAuthError(null)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <Card className="w-full max-w-md p-8 glass-card">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-3 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm font-sans">
            {mode === 'login'
              ? 'Enter your details to access your account.'
              : 'Start your journey to a smaller carbon footprint.'}
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex flex-col gap-1" role="alert">
            <span className="font-semibold text-red-800">Authentication Error</span>
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              {...register('displayName')}
              error={errors.displayName?.message}
              placeholder="John Doe"
            />
          )}
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="john@example.com"
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <GoogleSignInButton onClick={handleGoogleLogin} loading={isLoading} />

        <p className="mt-8 text-center text-sm text-gray-600">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            type="button"
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </Card>
    </div>
  )
}

/**
 * Default exported Login page wrapped with an ErrorBoundary.
 */
export default function Login(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <LoginContent />
    </ErrorBoundary>
  )
}
