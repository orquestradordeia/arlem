'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#00f0ff", "#ff00aa", "#8b5cf6", "#ffd700", "#ff6b6b", "#51cf66"];

export function TopProductsChart({ data }: { data: { name: string; qty: number }[] }) {
  if (data.length === 0) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhuma venda ainda</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
        <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
        <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={12} width={140} />
        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
        <Bar dataKey="qty" fill="var(--neon-cyan)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: { name: string; qty: number }[] }) {
  if (data.length === 0) return <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhuma venda ainda</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
