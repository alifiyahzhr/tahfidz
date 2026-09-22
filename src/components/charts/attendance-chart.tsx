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
  hadir: "#047857",
  izin_reason: "#d97706",
  izin_no_reason: "#ea580c",
  absent: "#dc2626",
};

const LABELS = {
  hadir: "Hadir",
  izin_reason: "Izin (reason)",
  izin_no_reason: "Izin (no reason)",
  absent: "Absent",
};

export function AttendanceChart({
  data,
}: {
  data: {
    className: string;
    hadir: number;
    izin_reason: number;
    izin_no_reason: number;
    absent: number;
  }[];
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
          <Bar key={key} dataKey={key} stackId="attendance" fill={COLORS[key]} name={LABELS[key]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
