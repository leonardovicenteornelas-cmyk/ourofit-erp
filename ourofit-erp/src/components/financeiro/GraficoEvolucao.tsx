"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, MESES_ABREVIADOS } from "@/lib/utils";

interface DataPoint {
  mes: number;
  receita: number;
  despesa: number;
  resultado: number;
}

interface GraficoEvolucaoProps {
  data: DataPoint[];
}

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[hsl(222,47%,12%)] p-3 shadow-xl text-xs">
        <p className="font-semibold text-white/70 mb-2">{MESES_ABREVIADOS[(label as number) - 1]}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}
            </span>
            <span className="text-white font-semibold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GraficoEvolucao({ data }: GraficoEvolucaoProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5">
      <h3 className="text-sm font-semibold text-white/70 mb-4">
        Evolução Mensal — Receitas, Despesas e Resultado
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradResultado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="mes"
            tickFormatter={(v) => MESES_ABREVIADOS[v - 1]}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-white/50">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="receita"
            name="Receita"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#gradReceita)"
            dot={false}
            activeDot={{ r: 4, fill: "#34d399" }}
          />
          <Area
            type="monotone"
            dataKey="despesa"
            name="Despesa"
            stroke="#f87171"
            strokeWidth={2}
            fill="url(#gradDespesa)"
            dot={false}
            activeDot={{ r: 4, fill: "#f87171" }}
          />
          <Area
            type="monotone"
            dataKey="resultado"
            name="Resultado"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#gradResultado)"
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
