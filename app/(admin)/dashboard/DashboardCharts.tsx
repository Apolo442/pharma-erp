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
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./dashboard.module.css";

const COLORS = ["#0f766e", "#2dd4bf", "#fbbf24", "#f87171"];

type RechartsValue = number | string | Array<number | string> | undefined;

interface FaturamentoData {
  data: string;
  total: number;
}

interface PagamentoData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  faturamentoData: FaturamentoData[];
  pagamentos: PagamentoData[];
}

const RANGE_LABELS: Record<string, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "1y": "Último Ano",
};

export default function DashboardCharts({
  faturamentoData,
  pagamentos,
}: DashboardChartsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pega o range da URL ou assume 7d
  const currentRange = searchParams.get("range") || "7d";

  const handleFilter = (range: string) => {
    // Atualiza a URL, forçando o Next.js a re-renderizar a Page (Server Component)
    // Isso vai fazer a Page buscar novos dados e passar atualizado para cá
    router.push(`?range=${range}`, { scroll: false });
  };

  const getBtnClass = (btnRange: string) => {
    return `${styles.filterBtn} ${currentRange === btnRange ? styles.active : ""}`;
  };

  return (
    <div className={styles.chartsGrid}>
      {/* Gráfico de Área */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Faturamento</h3>
          <div className={styles.filterGroup}>
            {Object.keys(RANGE_LABELS).map((key) => (
              <button
                key={key}
                onClick={() => handleFilter(key)}
                className={getBtnClass(key)}
              >
                {key === "1y" ? "Ano" : key}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={faturamentoData}>
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
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `R$${value / 1000}k` : `R$${value}`
              }
            />
            <Tooltip
              formatter={(value: RechartsValue) =>
                typeof value === "number"
                  ? value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : value
              }
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0f766e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza */}
      <div className={styles.chartCard}>
        {/* Título Dinâmico agora */}
        <h3 className={styles.chartTitle}>
          Pagamentos ({RANGE_LABELS[currentRange] || "Período"})
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pagamentos} // Esse dado deve vir filtrado do pai
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {pagamentos.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                typeof value === "number"
                  ? value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : value
              }
            />
            <Legend verticalAlign="bottom" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
