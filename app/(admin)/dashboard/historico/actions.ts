"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHistoricoVendas() {
  // Busca as últimas 100 vendas concluídas ou canceladas
  // Idealmente teria paginação, mas para hoje 100 tá ótimo
  return await prisma.venda.findMany({
    where: {
      status: { in: ["CONCLUIDA", "CANCELADA"] },
    },
    include: {
      vendedor: { select: { name: true } },
      itens: {
        include: {
          medicamento: { select: { nome: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function estornarVenda(vendaId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Busca a venda e seus itens
      const venda = await tx.venda.findUnique({
        where: { id: vendaId },
        include: { itens: true },
      });

      if (!venda) throw new Error("Venda não encontrada.");
      if (venda.status !== "CONCLUIDA")
        throw new Error("Esta venda não pode ser estornada.");

      // 2. Devolve os itens ao estoque
      for (const item of venda.itens) {
        await tx.medicamento.update({
          where: { id: item.medicamentoId },
          data: { estoque: { increment: item.quantidade } },
        });
      }

      // 3. Marca a venda como CANCELADA (Estornada)
      await tx.venda.update({
        where: { id: vendaId },
        data: { status: "CANCELADA" },
      });
    });

    revalidatePath("/dashboard/historico");
    revalidatePath("/dashboard/produtos"); // Atualiza estoque visualmente lá também
    return { success: true, message: "Venda estornada e estoque reposto." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao estornar venda." };
  }
}
