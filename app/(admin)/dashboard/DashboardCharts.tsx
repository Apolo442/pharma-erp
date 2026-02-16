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
import { useRouter, useSearchParams } from "next/navigation"; // Adicionado useSearchParams
import styles from "./dashboard.module.css";

const COLORS = ["#0f766e", "#2dd4bf", "#fbbf24", "#f87171"];

// Tipagem exata do Recharts para evitar 'any'
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
  // Removemos 'currentRange' das props, pois vamos ler direto da URL
}

export default function DashboardCharts({
  faturamentoData,
  pagamentos,
}: DashboardChartsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lê o range direto da URL. Se não tiver, assume "7d"
  const currentRange = searchParams.get("range") || "7d";

  const handleFilter = (range: string) => {
    router.push(`/dashboard?range=${range}`);
  };

  // Função auxiliar para evitar repetição de classes
  const getBtnClass = (btnRange: string) => {
    return `${styles.filterBtn} ${currentRange === btnRange ? styles.active : ""}`;
  };

  return (
    <div className={styles.chartsGrid}>
      {/* Gráfico de Linha/Área: Faturamento */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Faturamento</h3>

          {/* BOTÕES DE FILTRO */}
          <div className={styles.filterGroup}>
            <button
              onClick={() => handleFilter("7d")}
              className={getBtnClass("7d")}
            >
              7 Dias
            </button>
            <button
              onClick={() => handleFilter("30d")}
              className={getBtnClass("30d")}
            >
              30 Dias
            </button>
            <button
              onClick={() => handleFilter("1y")}
              className={getBtnClass("1y")}
            >
              Ano
            </button>
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
            {/* CORREÇÃO ESLINT: Tipagem explícita 'RechartsValue' */}
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
        <h3 className={styles.chartTitle}>Meios de Pagamento (30d)</h3>
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
