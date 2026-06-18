import React, { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly glass?: boolean
  readonly children?: ReactNode
}

/**
 * A standard, configurable Card container component.
 * Supports a glassmorphism theme and custom styling.
 */
export const Card: React.FC<CardProps> = ({ glass = false, className, children, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-2xl border p-6',
        glass
          ? 'bg-white/80 backdrop-blur-sm border-white/60 shadow-lg'
          : 'bg-white border-gray-100 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
