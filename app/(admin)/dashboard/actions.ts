"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function obterMetricasDashboard() {
  const hoje = new Date();
  const inicioDia = startOfDay(hoje);
  const fimDia = endOfDay(hoje);

  try {
    // 1. Busca todas as vendas concluídas hoje
    const vendasHoje = await prisma.venda.findMany({
      where: {
        status: "CONCLUIDA",
        updatedAt: { gte: inicioDia, lte: fimDia },
      },
    });

    const faturamentoTotal = vendasHoje.reduce((acc, v) => acc + v.total, 0);
    const totalVendas = vendasHoje.length;
    const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;

    // 2. Busca medicamentos com estoque baixo
    const estoqueBaixoCount = await prisma.medicamento.count({
      where: { estoque: { lt: 10 }, ativo: true },
    });

    // Removida a query de _produtosVendidos que não estava sendo utilizada
    // e causava erro de lint.

    return {
      faturamentoTotal,
      totalVendas,
      ticketMedio,
      estoqueBaixoCount,
    };
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return {
      faturamentoTotal: 0,
      totalVendas: 0,
      ticketMedio: 0,
      estoqueBaixoCount: 0,
    };
  }
}
