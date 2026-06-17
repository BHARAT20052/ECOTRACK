import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Leaf } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})

/**
 * Full login/register page with email/password and Google Sign-In.
 */
export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth()

  const currentSchema = mode === 'login' ? loginSchema : registerSchema

  type FormData = { email: string; password: string; displayName?: string }

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(currentSchema) as any,
    defaultValues: { email: '', password: '', displayName: '' },
  })

  const onSubmit: SubmitHandler<any> = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      if (mode === 'login') {
        await loginWithEmail(data.email, data.password)
        toast.success('Successfully logged in!')
      } else {
        await registerWithEmail(data.email, data.password, data.displayName)
        toast.success('Account created successfully!')
      }
      navigate('/dashboard')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthError(message)
      toast.error(message)
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
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
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500 mt-2 text-center">
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
              error={errors.displayName?.message as string}
              placeholder="John Doe"
            />
          )}
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message as string}
            placeholder="john@example.com"
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message as string}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <Button
          variant="secondary"
          className="w-full mt-6"
          onClick={handleGoogleLogin}
          loading={isLoading}
          type="button"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

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
