import React, { type ReactNode, type HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children?: ReactNode
  readonly variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const BASE_STYLE = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' as const

const VARIANTS = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const

/**
 * A reusable Badge component to display short labels or statuses.
 * 
 * @param props - Component props including children, variant, and HTML attributes
 * @returns A Badge component as a React functional component
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const badgeClass = `${BASE_STYLE} ${VARIANTS[variant]} ${className}`
  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  )
}
