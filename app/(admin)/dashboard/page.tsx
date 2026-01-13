import { prisma } from "@/lib/prisma";
import { Medicamento } from "@prisma/client";
import styles from "./dashboard.module.css";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default async function Dashboard() {
  // Definindo o início do dia para filtrar vendas de hoje
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [estoqueData, totalProdutos, recentes, vendasHoje] = await Promise.all([
    // 1. Soma do estoque (campo 'estoque')
    prisma.medicamento.aggregate({
      _sum: { estoque: true },
    }),

    // 2. Contagem total de produtos (Schema não tem 'tipo', então contei produtos cadastrados)
    prisma.medicamento.count(),

    // 3. Últimos 5 medicamentos adicionados
    prisma.medicamento.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // 4. Soma das Vendas de hoje (Tabela Venda existe no seu schema!)
    prisma.venda.aggregate({
      _sum: { total: true },
      where: {
        data: {
          gte: startOfToday,
        },
      },
    }),
  ]);

  const totalEstoque = estoqueData._sum.estoque || 0;
  const faturamentoHoje = vendasHoje._sum.total || 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral da Farmácia</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardTitle}>Produtos Cadastrados</span>
          <span className={styles.cardValue}>{totalProdutos}</span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardTitle}>Estoque Total</span>
          <span className={styles.cardValue}>{totalEstoque}</span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardTitle}>Faturamento Hoje</span>
          <span className={styles.cardValue}>
            {formatCurrency(faturamentoHoje)}
          </span>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Recém Adicionados</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {recentes.map((med: Medicamento) => (
              <tr key={med.id}>
                <td>{med.nome}</td>
                <td>{formatCurrency(med.preco)}</td>
                <td>{med.estoque} un</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
