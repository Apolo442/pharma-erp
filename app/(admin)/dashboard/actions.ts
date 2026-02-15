// app/dashboard/actions.ts
import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function obterDadosGraficos() {
  const hoje = new Date();
  const seteDiasAtras = subDays(hoje, 6);

  // 1. Vendas por dia (últimos 7 dias) - Gráfico de Linha/Área
  const vendasSemana = await prisma.venda.groupBy({
    by: ["createdAt"],
    where: {
      status: "CONCLUIDA",
      createdAt: { gte: seteDiasAtras },
    },
    _sum: { total: true },
  });

  // 2. Vendas por Categoria - Gráfico de Pizza
  const vendasPorCategoria = await prisma.vendaItem.findMany({
    where: { venda: { status: "CONCLUIDA" } },
    include: { medicamento: true },
  });

  // 3. Formas de Pagamento - Gráfico de Coluna
  const pagamentos = await prisma.venda.groupBy({
    by: ["formaPagamento"],
    where: { status: "CONCLUIDA" },
    _count: { id: true },
  });

  return { vendasSemana, vendasPorCategoria, pagamentos };
}
