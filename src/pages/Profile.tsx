import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LogOut, User, Mail, Calendar, Activity } from 'lucide-react'
import { formatCo2 } from '@/utils/carbonConverter'
import { getUserProfile } from '@/services/firestore'
import type { UserProfile } from '@/types'

/**
 * User profile page.
 */
export default function Profile() {
  const { user, logout } = useAuth()
  const { summary } = useFootprint(user?.uid || null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile)
    } else {
      setProfile(null)
    }
  }, [user])


  const handleLogout = async () => {
    await logout()
  }

  const creationTime = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account and view your stats.</p>
      </header>

      <Card glass className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border-4 border-white shadow-md">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary-600">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || 'Anonymous User'}</h2>
              <div className="flex items-center text-gray-500 mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {creationTime}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Activity className="w-4 h-4 mr-1" /> All-Time CO₂ Tracked
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {summary ? formatCo2(summary.totalCo2) : '0 kg'} {/* In a real app this would be a lifetime total */}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Activity className="w-4 h-4 mr-1" /> Longest Streak
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {profile?.streakLongest || 0} Days
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
