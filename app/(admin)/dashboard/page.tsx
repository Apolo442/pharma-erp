import { prisma } from "@/lib/prisma";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import styles from "./dashboard.module.css"; // Importando o CSS Module

export default async function DashboardPage() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // 1. Métricas
  const resumoVendas = await prisma.venda.aggregate({
    where: {
      createdAt: { gte: hoje },
      status: "CONCLUIDA",
    },
    _sum: { total: true },
    _count: { id: true },
  });

  const estoqueBaixo = await prisma.medicamento.count({
    where: { estoque: { lt: 10 } },
  });

  const preVendasPendentes = await prisma.venda.count({
    where: { status: "PENDENTE" },
  });

  const totalVendido = resumoVendas._sum.total ?? 0;
  const qtdVendas = resumoVendas._count.id ?? 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>

      {/* GRID DE CARDS USANDO O CSS MODULE */}
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

        {/* Card 2: Vendas */}
        <div className={styles.card}>
          <div className={`${styles.cardIcon} ${styles.blue}`}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p className={styles.cardLabel}>Vendas Concluídas</p>
            <h3 className={styles.cardValue}>{qtdVendas}</h3>
          </div>
        </div>

        {/* Card 3: Fila do Caixa */}
        <Link
          href="/dashboard/caixa"
          style={{ textDecoration: "none", display: "contents" }}
        >
          <div
            className={styles.card}
            style={{
              cursor: "pointer",
              borderColor: preVendasPendentes > 0 ? "#fdba74" : "",
            }}
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

        {/* Card 4: Estoque */}
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

      <div className={styles.alertBox}>
        💡 <strong>Dica:</strong> Para realizar uma venda, vá em{" "}
        <Link
          href="/dashboard/vendas"
          className="underline font-bold text-blue-700"
        >
          Balcão
        </Link>
        . Para finalizar o pagamento, vá em <strong>Caixa</strong>.
      </div>
    </div>
  );
}
