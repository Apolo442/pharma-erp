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

// Força o Next.js a não fazer cache estático dessa página
export const dynamic = "force-dynamic";

// Tipagem para Next.js 15 (onde searchParams é uma Promise)
interface DashboardProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  // 1. AWAIT NOS PARAMS (Obrigatório no Next 15)
  const params = await searchParams;
  const range = params.range || "7d";

  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);

  // 2. Define a data de corte baseada no range
  let dataInicial = subDays(inicioHoje, 6); // Padrão 7 dias

  if (range === "30d") {
    dataInicial = subDays(inicioHoje, 29);
  } else if (range === "1y") {
    dataInicial = startOfYear(inicioHoje);
  }

  // 3. Queries ao Banco
  const [
    resumoVendas,
    estoqueBaixo,
    preVendasPendentes,
    ultimasVendas,
    vendasMetodo, // <--- Dados do Gráfico de Pizza
    vendasGraficoRaw, // <--- Dados do Gráfico de Área
  ] = await Promise.all([
    // [0] Cards do Topo (Faturamento Hoje)
    prisma.venda.aggregate({
      where: { createdAt: { gte: inicioHoje }, status: "CONCLUIDA" },
      _sum: { total: true },
      _count: { id: true },
    }),
    // [1] Estoque Baixo
    prisma.medicamento.count({ where: { estoque: { lt: 10 }, ativo: true } }),
    // [2] Fila do Caixa
    prisma.venda.count({ where: { status: "PENDENTE" } }),
    // [3] Últimas 5 Vendas
    prisma.venda.findMany({
      where: { status: "CONCLUIDA" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { vendedor: { select: { name: true } } },
    }),

    // [4] CORREÇÃO AQUI: Pizza agora respeita o 'dataInicial' do filtro
    prisma.venda.groupBy({
      by: ["formaPagamento"],
      where: {
        status: "CONCLUIDA",
        // ANTES: createdAt: { gte: subDays(inicioHoje, 30) } -> ERRADO (fixo)
        // AGORA: Usa a data dinâmica do filtro
        createdAt: { gte: dataInicial },
      },
      _count: { id: true },
    }),

    // [5] Gráfico de Área (Já estava certo)
    prisma.venda.findMany({
      where: {
        status: "CONCLUIDA",
        createdAt: { gte: dataInicial },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // 4. Formatação de Dados
  const totalVendido = resumoVendas._sum.total ?? 0;
  const qtdVendas = resumoVendas._count.id ?? 0;
  const ticketMedio = qtdVendas > 0 ? totalVendido / qtdVendas : 0;

  // Formata dados para o gráfico de pizza (Recharts)
  const pagamentosFormatados = vendasMetodo.map((p) => ({
    name: p.formaPagamento || "Não informado",
    value: p._count.id,
  }));

  // Agrupamento para o Gráfico de Área
  // Se for "1y", agrupa por mês. Se for dias, agrupa por dia.
  const faturamentoAgrupado = vendasGraficoRaw.reduce(
    (acc: Record<string, number>, venda) => {
      let chave = "";
      if (range === "1y") {
        chave = format(venda.createdAt, "MMM", { locale: ptBR }); // Ex: Jan, Fev
      } else {
        chave = format(venda.createdAt, "dd/MM", { locale: ptBR }); // Ex: 15/02
      }
      // Soma o total de vendas naquele dia/mês
      acc[chave] = (acc[chave] || 0) + venda.total;
      return acc;
    },
    {},
  );

  // Converte o objeto agrupado em array para o Recharts
  const faturamentoGraficoData = Object.keys(faturamentoAgrupado).map(
    (chave) => ({
      data: chave,
      total: faturamentoAgrupado[chave],
    }),
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>

      {/* Cards de Métricas */}
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

      {/* Componente de Gráficos 
         Agora 'pagamentosFormatados' contém os dados filtrados corretamente pelo range
      */}
      <DashboardCharts
        faturamentoData={faturamentoGraficoData}
        pagamentos={pagamentosFormatados}
      />

      {/* Lista de Últimas Vendas */}
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
