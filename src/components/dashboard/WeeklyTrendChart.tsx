import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { Card } from '@/components/ui/Card'

export interface WeeklyTrendItem {
  readonly date: string
  readonly co2: number
}

export interface WeeklyTrendChartProps {
  readonly weeklyTrend: readonly WeeklyTrendItem[]
}

const LINE_STROKE_WIDTH = 3 as const
const DOT_RADIUS = 4 as const
const ACTIVE_DOT_RADIUS = 6 as const

/**
 * Line chart component showing weekly CO2 emissions trends.
 */
export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ weeklyTrend }) => {
  return (
    <Card glass className="p-6">
      <h2 className="text-lg font-semibold mb-4">Weekly Trend</h2>
      {weeklyTrend.length > 0 ? (
        <div className="h-[300px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...weeklyTrend]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="co2"
                name="CO₂ (kg)"
                stroke="#16a34a"
                strokeWidth={LINE_STROKE_WIDTH}
                dot={{ r: DOT_RADIUS }}
                activeDot={{ r: ACTIVE_DOT_RADIUS }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No trend data yet
        </div>
      )}
      {/* Accessible alternative for screen readers */}
      <table className="sr-only">
        <caption>Weekly CO2 Trend</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">CO₂ Emissions (kg)</th>
          </tr>
        </thead>
        <tbody>
          {weeklyTrend.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.co2} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
