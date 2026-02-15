"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import styles from "./dashboard.module.css";

const COLORS = ["#0f766e", "#2dd4bf", "#fbbf24", "#f87171"];

interface FaturamentoData {
  data: string;
  total: number;
}

interface PagamentoData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  faturamentoSemanal: FaturamentoData[];
  pagamentos: PagamentoData[];
}

export default function DashboardCharts({
  faturamentoSemanal,
  pagamentos,
}: DashboardChartsProps) {
  return (
    <div className={styles.chartsGrid}>
      {/* Gráfico de Linha/Área: Faturamento */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Faturamento Semanal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={faturamentoSemanal}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="data"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0f766e"
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza: Meios de Pagamento */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Meios de Pagamento</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pagamentos}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {pagamentos.map((_: PagamentoData, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
