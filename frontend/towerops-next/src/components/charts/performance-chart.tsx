'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Item = { name: string; value: number };

export function PerformanceChart({ data }: { data: Item[] }) {
  return (
    <div className="h-72 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">Operational Snapshot</h3>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="value" fill="#00C2FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
