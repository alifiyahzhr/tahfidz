"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = {
  ulang: "#dc2626",
  cukup: "#d97706",
  baik: "#2563eb",
  lancar: "#047857",
};

const LABELS = {
  ulang: "Ulang",
  cukup: "Cukup",
  baik: "Baik",
  lancar: "Lancar",
};

export function ProgressChart({
  data,
}: {
  data: { className: string; ulang: number; cukup: number; baik: number; lancar: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="className" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
          <Bar key={key} dataKey={key} stackId="proficiency" fill={COLORS[key]} name={LABELS[key]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
