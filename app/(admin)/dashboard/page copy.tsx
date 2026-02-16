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
import { startOfDay, subDays, startOfYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Adicionamos a prop searchParams
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const range = searchParams?.range || "7d"; // Padrão: 7 dias
  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);

  // Define a data de corte baseado na seleção
  let dataInicial = subDays(inicioHoje, 6); // Padrão 7 dias
  if (range === "30d") dataInicial = subDays(inicioHoje, 29);
  if (range === "1y") dataInicial = startOfYear(inicioHoje);

  // 1. Buscas no Banco
  const [
    resumoVendas,
    estoqueBaixo,
    preVendasPendentes,
    ultimasVendas,
    vendasMetodo,
    vendasGraficoRaw, // Dados brutos para o gráfico
  ] = await Promise.all([
    // Métricas Hoje
    prisma.venda.aggregate({
      where: { createdAt: { gte: inicioHoje }, status: "CONCLUIDA" },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Estoque Crítico
    prisma.medicamento.count({ where: { estoque: { lt: 10 }, ativo: true } }),
    // Fila do Caixa
    prisma.venda.count({ where: { status: "PENDENTE" } }),
    // Últimas Vendas
    prisma.venda.findMany({
      where: { status: "CONCLUIDA" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { vendedor: { select: { name: true } } },
    }),
    // Pizza: Pagamentos (Sempre pega 30 dias para ter volume)
    prisma.venda.groupBy({
      by: ["formaPagamento"],
      where: {
        status: "CONCLUIDA",
        createdAt: { gte: subDays(inicioHoje, 30) },
      },
      _count: { id: true },
    }),
    // Gráfico de Área: Respeita o filtro selecionado
    prisma.venda.findMany({
      where: { status: "CONCLUIDA", createdAt: { gte: dataInicial } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Formatação de Métricas
  const totalVendido = resumoVendas._sum.total ?? 0;
  const qtdVendas = resumoVendas._count.id ?? 0;
  const ticketMedio = qtdVendas > 0 ? totalVendido / qtdVendas : 0;

  // Preparação de Dados para Pizza
  const pagamentosFormatados = vendasMetodo.map((p) => ({
    name: p.formaPagamento || "Não informado",
    value: p._count.id,
  }));

  // Agrupamento Inteligente para o Gráfico de Área
  const faturamentoAgrupado = vendasGraficoRaw.reduce(
    (acc: Record<string, number>, venda) => {
      let chave = "";

      if (range === "1y") {
        // Se for anual, agrupa por Mês (ex: jan, fev)
        chave = format(venda.createdAt, "MMM", { locale: ptBR });
      } else {
        // Se for 7d ou 30d, agrupa por Dia (ex: 15/02)
        chave = format(venda.createdAt, "dd/MM", { locale: ptBR });
      }

      acc[chave] = (acc[chave] || 0) + venda.total;
      return acc;
    },
    {},
  );

  const faturamentoGraficoData = Object.keys(faturamentoAgrupado).map(
    (chave) => ({
      data: chave, // Nome do eixo X (Dia ou Mês)
      total: faturamentoAgrupado[chave],
    }),
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>

      {/* Grid de Cards (Mantido igual) */}
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

      {/* Passamos o range atual para o componente saber qual botão marcar */}
      <DashboardCharts
        faturamentoData={faturamentoGraficoData}
        pagamentos={pagamentosFormatados}
      />

      {/* Lista Recente (Mantido igual) */}
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
