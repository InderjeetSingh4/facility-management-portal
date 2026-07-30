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
            tick={{ fontSize: 12, fill: '#888' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#888' }}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#333'
            }}
            itemStyle={{ color: '#10b981', fontWeight: 600 }}
          />
          <Bar 
            dataKey="completions" 
            name="Completed Tasks"
            fill="#10b981" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
