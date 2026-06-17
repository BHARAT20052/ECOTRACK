import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        {hint && <p id={hintId} className="text-xs text-gray-500">{hint}</p>}
        <input
          ref={ref}
          id={id}
          aria-describedby={clsx(error && errorId, hint && hintId) || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-errormessage={error ? errorId : undefined}
          className={clsx(
            'px-3 py-2 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
