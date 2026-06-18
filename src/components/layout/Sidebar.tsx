import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calculator, MessageCircle, Target, User, Leaf, type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface NavItem {
  readonly to: string
  readonly label: string
  readonly icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/assistant', label: 'EcoBot', icon: MessageCircle },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
] as const

/**
 * Sidebar component that displays the main navigation menu for authenticated users.
 */
export const Sidebar: React.FC = () => {
  return (
    <nav
      aria-label="Main navigation"
      className="w-64 min-h-screen bg-primary-900 text-white flex flex-col p-4 gap-2"
    >
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <Leaf className="text-primary-300" aria-hidden="true" />
        <span className="text-xl font-bold text-primary-100">EcoTrack</span>
      </div>
      <ul role="list" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
