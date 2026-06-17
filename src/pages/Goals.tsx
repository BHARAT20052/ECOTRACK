import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Target, Trophy, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { useGoals } from '@/hooks/useGoals'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { BADGES } from '@/constants/emissionFactors'
import { getUserProfile } from '@/services/firestore'
import type { UserProfile, ActionDetails } from '@/types'

/**
 * Goals and Badges page.
 */
export default function Goals() {
  const { user } = useAuth()
  const { summary, logActivity } = useFootprint(user?.uid || null)
  const { goal, updateGoal, loading: goalLoading } = useGoals(user?.uid || null)
  
  const [goalInput, setGoalInput] = useState('')
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [badgesLoading, setBadgesLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((p: UserProfile | null) => {
        setProfile(p)
        setEarnedBadges(p?.badges || [])
        setBadgesLoading(false)
      })
    }
  }, [user])

  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = Number(goalInput)
    if (isNaN(target) || target <= 0) return toast.error('Enter a valid target')
    
    try {
      await updateGoal(target)
      toast.success('Monthly goal updated!')
      setGoalInput('')
    } catch {
      toast.error('Failed to update goal')
    }
  }

  const handleEcoAction = async (actionId: ActionDetails['actionId'], name: string) => {
    if (!user) return
    try {
      await logActivity('action', { actionId, actionName: name })
      toast.success(`Completed: ${name}`)
    } catch {
      toast.error('Failed to log action')
    }
  }

  const monthlyGoal = goal?.targetCo2 || 0
  const progress = monthlyGoal ? Math.min(100, Math.round(((summary?.totalCo2 || 0) / monthlyGoal) * 100)) : 0
  const isOverLimit = progress >= 100

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Goals & Achievements</h1>
        <p className="text-gray-500 mt-1">Track your progress and earn badges.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold">Monthly Goal</h2>
          </div>

          {!monthlyGoal ? (
            <form onSubmit={handleSetGoal} className="space-y-4">
              <p className="text-sm text-gray-600">Set a target for your total CO₂ emissions this month.</p>
              <div className="flex gap-2">
                <Input
                  label="Monthly Target"
                  type="number"
                  placeholder="Target in kg CO₂"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" loading={goalLoading}>Set</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Current Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.totalCo2.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ {monthlyGoal} kg CO₂</span>
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => updateGoal(0)}>Reset</Button>
              </div>

              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : 'bg-primary-500'}`}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{progress}%</span>
              </div>
              
              {isOverLimit && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                  <Info className="w-5 h-5 shrink-0" />
                  <p>You've exceeded your monthly goal. Try completing some Eco Actions to offset your emissions!</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold">Streak</h2>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">{profile?.streakCurrent || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-gray-900">{profile?.streakLongest || 0}</p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Offsets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card glass className="p-4 flex flex-col items-center text-center">
            <div className="text-4xl mb-3">🌳</div>
            <h3 className="font-semibold mb-1">Plant a Tree</h3>
            <Badge variant="success" className="mb-4">-21.77 kg</Badge>
            <Button className="w-full mt-auto" onClick={() => handleEcoAction('plant_tree', 'Plant a Tree')}>Complete</Button>
          </Card>
          <Card glass className="p-4 flex flex-col items-center text-center">
            <div className="text-4xl mb-3">🚌</div>
            <h3 className="font-semibold mb-1">Public Transport</h3>
            <Badge variant="success" className="mb-4">-2.1 kg</Badge>
            <Button className="w-full mt-auto" onClick={() => handleEcoAction('public_transport', 'Use Public Transport')}>Complete</Button>
          </Card>
          <Card glass className="p-4 flex flex-col items-center text-center">
            <div className="text-4xl mb-3">🥗</div>
            <h3 className="font-semibold mb-1">Vegan Day</h3>
            <Badge variant="success" className="mb-4">-3.0 kg</Badge>
            <Button className="w-full mt-auto" onClick={() => handleEcoAction('vegan_day', 'Vegan Day')}>Complete</Button>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badgesLoading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-32 skeleton"></div>)
          ) : (
            Object.values(BADGES).map((badge) => {
              const isEarned = earnedBadges.includes(badge.id)
              return (
                <Card key={badge.id} className={`p-4 text-center transition-all ${isEarned ? 'border-amber-200 bg-amber-50/30' : 'opacity-60 grayscale'}`}>
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className={`font-semibold text-sm ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>{badge.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                </Card>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
