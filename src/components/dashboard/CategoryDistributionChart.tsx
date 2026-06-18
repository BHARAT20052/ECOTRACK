import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

import { Card } from '@/components/ui/Card'
import { formatCo2 } from '@/utils/carbonConverter'
import type { ActivityCategory } from '@/types'

export interface CategoryDistributionChartProps {
  readonly byCategory: Record<ActivityCategory, number>
}

interface ChartItem {
  readonly name: string
  readonly value: number
}

const COLORS: readonly string[] = [
  '#16a34a',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#64748b',
] as const

const PIE_INNER_RADIUS = 60 as const
const PIE_OUTER_RADIUS = 100 as const
const PIE_PADDING_ANGLE = 5 as const

/**
 * Pie chart displaying user carbon emissions per activity category.
 */
export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  byCategory,
}) => {
  const categoryData = useMemo((): ChartItem[] => {
    return Object.entries(byCategory)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
  }, [byCategory])

  return (
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
                innerRadius={PIE_INNER_RADIUS}
                outerRadius={PIE_OUTER_RADIUS}
                paddingAngle={PIE_PADDING_ANGLE}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => typeof value === 'number' ? formatCo2(value) : ''} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No category data yet
        </div>
      )}
    </Card>
  )
}
