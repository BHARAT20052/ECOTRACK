import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
}

export function Card({ glass, className, children, ...props }: CardProps) {
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
