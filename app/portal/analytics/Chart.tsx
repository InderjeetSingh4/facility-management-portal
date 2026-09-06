'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsChart({ data }: { data: any[] }) {
  return (
    <div className="mt-4 h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              color: 'var(--foreground)'
            }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
          />
          <Bar 
            dataKey="completions" 
            name="Completed Tasks"
            fill="var(--foreground)"
            fillOpacity={0.8}
            radius={[6, 6, 0, 0]} 
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
