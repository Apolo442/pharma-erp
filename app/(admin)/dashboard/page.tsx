import { prisma } from "@/lib/prisma";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import DashboardCharts from "./DashboardCharts";
import { startOfDay, subDays } from "date-fns";

export default async function DashboardPage() {
  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);
  const seteDiasAtras = subDays(inicioHoje, 6);

  // 1. Buscas simultâneas para performance
  const [
    resumoVendas,
    estoqueBaixo,
    preVendasPendentes,
    ultimasVendas,
    vendasMetodo,
    vendasSemana,
  ] = await Promise.all([
    // Métricas Hoje
    prisma.venda.aggregate({
      where: { createdAt: { gte: inicioHoje }, status: "CONCLUIDA" },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Estoque Crítico
    prisma.medicamento.count({
      where: { estoque: { lt: 10 }, ativo: true },
    }),
    // Fila do Caixa
    prisma.venda.count({
      where: { status: "PENDENTE" },
    }),
    // Últimas Vendas
    prisma.venda.findMany({
      where: { status: "CONCLUIDA" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { vendedor: { select: { name: true } } },
    }),
    // Dados para Gráfico de Pizza: Formas de Pagamento
    prisma.venda.groupBy({
      by: ["formaPagamento"],
      where: { status: "CONCLUIDA", createdAt: { gte: seteDiasAtras } },
      _count: { id: true },
    }),
    // Dados para Gráfico de Área: Faturamento 7 dias
    prisma.venda.findMany({
      where: { status: "CONCLUIDA", createdAt: { gte: seteDiasAtras } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Formatação de Métricas
  const totalVendido = resumoVendas._sum.total ?? 0; // Ex: R$ 1.404,70
  const qtdVendas = resumoVendas._count.id ?? 0;
  const ticketMedio = qtdVendas > 0 ? totalVendido / qtdVendas : 0; // Ex: R$ 156,08

  // Preparação de Dados para os Gráficos
  const pagamentosFormatados = vendasMetodo.map((p) => ({
    name: p.formaPagamento || "Não informado",
    value: p._count.id,
  }));

  // Agrupamento manual de vendas por dia para o gráfico de área
  const faturamentoPorDia = vendasSemana.reduce(
    (acc: Record<string, number>, venda) => {
      const data = venda.createdAt.toLocaleDateString("pt-BR", {
        weekday: "short",
      });
      acc[data] = (acc[data] || 0) + venda.total;
      return acc;
    },
    {},
  );

  const faturamentoSemanalData = Object.keys(faturamentoPorDia).map((dia) => ({
    data: dia,
    total: faturamentoPorDia[dia],
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>

      {/* GRID DE CARDS: MÉTRICAS */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.green}`}>
            <DollarSign size={24} />
          </div>
          <div>
            <p className={styles.cardLabel}>Faturamento Hoje</p>
            <h3 className={styles.cardValue}>
              {totalVendido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h3>
          </div>
        </div>

        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.blue}`}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p className={styles.cardLabel}>Ticket Médio</p>
            <h3 className={styles.cardValue}>
              {ticketMedio.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h3>
          </div>
        </div>

        <Link href="/dashboard/caixa" className={styles.cardLink}>
          <div
            className={styles.card}
            style={{ borderColor: preVendasPendentes > 0 ? "#fdba74" : "" }}
          >
            <div className={`${styles.cardIcon} ${styles.orange}`}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className={styles.cardLabel}>Fila do Caixa</p>
              <h3 className={styles.cardValue} style={{ color: "#c2410c" }}>
                {preVendasPendentes} pendentes
              </h3>
            </div>
          </div>
        </Link>

        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.red}`}>
            <Package size={24} />
          </div>
          <div>
            <p className={styles.cardLabel}>Estoque Crítico</p>
            <h3 className={styles.cardValue}>{estoqueBaixo} itens</h3>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE GRÁFICOS: INSERIDA ENTRE CARDS E LISTA */}
      <DashboardCharts
        faturamentoSemanal={faturamentoSemanalData}
        pagamentos={pagamentosFormatados}
      />

      {/* SEÇÃO DE ÚLTIMAS VENDAS */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <Clock size={18} className="text-slate-400" />
          <h2 className={styles.sectionTitle}>Últimas Vendas Concluídas</h2>
        </div>

        <div className={styles.recentList}>
          {ultimasVendas.length > 0 ? (
            ultimasVendas.map((venda) => (
              <div key={venda.id} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <span className={styles.recentId}>#{venda.id}</span>
                  <span className={styles.recentUser}>
                    {venda.vendedor.name}
                  </span>
                </div>
                <span className={styles.recentTotal}>
                  {venda.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>Nenhuma venda realizada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
