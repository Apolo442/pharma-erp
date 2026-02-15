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

export default async function DashboardPage() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // 1. Buscas simultâneas para performance
  const [resumoVendas, estoqueBaixo, preVendasPendentes, ultimasVendas] =
    await Promise.all([
      prisma.venda.aggregate({
        where: { createdAt: { gte: hoje }, status: "CONCLUIDA" },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.medicamento.count({
        where: { estoque: { lt: 10 }, ativo: true },
      }),
      prisma.venda.count({
        where: { status: "PENDENTE" },
      }),
      prisma.venda.findMany({
        where: { status: "CONCLUIDA" },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { vendedor: { select: { name: true } } },
      }),
    ]);

  const totalVendido = resumoVendas._sum.total ?? 0;
  const qtdVendas = resumoVendas._count.id ?? 0;
  const ticketMedio = qtdVendas > 0 ? totalVendido / qtdVendas : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>

      <div className={styles.grid}>
        {/* Card 1: Faturamento */}
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

        {/* Card 2: Ticket Médio (Aprimorado) */}
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

        {/* Card 3: Fila do Caixa */}
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

        {/* Card 4: Estoque Crítico */}
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

      {/* NOVO: Seção de Últimas Vendas */}
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

      {/*       <div className={styles.alertBox}>
        💡 <strong>Dica:</strong> Para realizar uma venda, vá em{" "}
        <Link
          href="/dashboard/vendas"
          className="underline font-bold text-blue-700"
        >
          Balcão
        </Link>
        .
      </div> */}
    </div>
  );
}
