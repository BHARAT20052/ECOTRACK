import { useMemo, useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Activity, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFootprint } from '@/hooks/useFootprint'
import { Card } from '@/components/ui/Card'
import { formatCo2, vsIndiaAverage, vsWorldAverage } from '@/utils/carbonConverter'
import { getUserProfile } from '@/services/firestore'
import type { UserProfile } from '@/types'

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

/**
 * Main dashboard showing user's carbon footprint summary and charts.
 */
export default function Dashboard() {
  const { user } = useAuth()
  const { summary, loading } = useFootprint(user?.uid || null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null)
    }
  }, [user])

  const categoryData = useMemo(() => {
    if (!summary) return []
    return Object.entries(summary.byCategory)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
  }, [summary])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton"></div>
          <div className="h-80 skeleton"></div>
        </div>
      </div>
    )
  }

  if (!summary) return <div>Failed to load data</div>

  const indiaDiff = vsIndiaAverage(summary.totalCo2)
  const worldDiff = vsWorldAverage(summary.totalCo2)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.displayName || 'Eco Warrior'}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Statistics">
        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Monthly Total</h2>
            <Activity className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-4xl font-mono font-bold mt-2 text-gray-900" aria-live="polite">
            {formatCo2(summary.totalCo2)}
          </p>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">vs India Average</h2>
            {indiaDiff <= 0 ? <TrendingDown className="w-5 h-5 text-primary-500" /> : <TrendingUp className="w-5 h-5 text-red-500" />}
          </div>
          <p className={`text-2xl font-bold mt-2 ${indiaDiff <= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            {indiaDiff <= 0 ? '' : '+'}{indiaDiff.toFixed(1)}%
          </p>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">vs World Average</h2>
            {worldDiff <= 0 ? <TrendingDown className="w-5 h-5 text-primary-500" /> : <TrendingUp className="w-5 h-5 text-red-500" />}
          </div>
          <p className={`text-2xl font-bold mt-2 ${worldDiff <= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            {worldDiff <= 0 ? '' : '+'}{worldDiff.toFixed(1)}%
          </p>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Current Streak</h2>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {profile?.streakCurrent || 0} {profile?.streakCurrent === 1 ? 'Day' : 'Days'} 🔥
          </p>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Trend</h2>
          {summary.weeklyTrend.length > 0 ? (
            <div className="h-[300px]" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="co2" name="CO₂ (kg)" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-500">No trend data yet</div>
          )}
          {/* Accessible alternative */}
          <table className="sr-only">
            <caption>Weekly CO2 Trend</caption>
            <tbody>
              {summary.weeklyTrend.map((d: { date: string; co2: number }) => (
                <tr key={d.date}><td>{d.date}</td><td>{d.co2} kg</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card glass className="p-6">
          <h2 className="text-lg font-semibold mb-4">Emissions by Category</h2>
          {categoryData.length > 0 ? (
            <div className="h-[300px]" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => `${formatCo2(value as number)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No category data yet</div>
          )}
        </Card>
      </div>

      <Card glass className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {/* This would map over actual recent activities, for now using placeholder or empty state if none */}
          <p className="text-gray-500">Check your calculator to log new activities!</p>
        </div>
      </Card>
    </div>
  )
}
