"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const LEVEL_LABEL: Record<number, string> = {
  1: "Ulang",
  2: "Cukup",
  3: "Baik",
  4: "Lancar",
};

const LEVEL_COLOR: Record<number, string> = {
  1: "#dc2626",
  2: "#d97706",
  3: "#2563eb",
  4: "#047857",
};

interface ScatterPoint {
  date: string;
  proficiency: number;
  studentName: string;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-zinc-900">{p.studentName}</p>
      <p className="text-zinc-500">{p.date}</p>
      <p className="text-zinc-700">{LEVEL_LABEL[p.proficiency]}</p>
    </div>
  );
}

export function ClassProgressScatter({ data }: { data: ScatterPoint[] }) {
  const byLevel = [1, 2, 3, 4].map((level) => ({
    level,
    points: data.filter((d) => d.proficiency === level),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" name="Date" tick={{ fontSize: 11 }} />
        <YAxis
          dataKey="proficiency"
          name="Proficiency"
          domain={[0.5, 4.5]}
          ticks={[1, 2, 3, 4]}
          tickFormatter={(v) => LEVEL_LABEL[v as number] ?? ""}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        {byLevel.map(({ level, points }) => (
          <Scatter
            key={level}
            name={LEVEL_LABEL[level]}
            data={points}
            fill={LEVEL_COLOR[level]}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
