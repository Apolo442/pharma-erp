"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação
const PagamentoSchema = z.object({
  vendaId: z.coerce.number(), // coerce força converter string "123" para number 123
  formaPagamento: z.enum(["DINHEIRO", "PIX", "DEBITO", "CREDITO"]),
  caixaId: z.string(),
});

export async function buscarVendasPendentes() {
  return await prisma.venda.findMany({
    where: { status: "PENDENTE" },
    include: {
      vendedor: { select: { name: true } },
      itens: {
        include: {
          medicamento: { select: { nome: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function finalizarVenda(formData: FormData) {
  // Prepara o objeto para validação
  const dados = {
    vendaId: formData.get("vendaId"),
    formaPagamento: formData.get("formaPagamento"),
    caixaId: formData.get("caixaId"),
  };

  // Valida usando o Zod
  const validacao = PagamentoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      success: false,
      message: "Dados inválidos: " + validacao.error.issues[0].message,
    };
  }

  const { vendaId, formaPagamento, caixaId } = validacao.data;

  try {
    // Usamos Transaction para garantir consistência:
    // Ou baixa estoque E finaliza venda, ou não faz nada.
    await prisma.$transaction(async (tx) => {
      // 1. Busca a venda e seus itens para saber o que baixar
      const venda = await tx.venda.findUnique({
        where: { id: vendaId },
        include: { itens: true },
      });

      if (!venda) throw new Error("Venda não encontrada.");
      if (venda.status !== "PENDENTE") throw new Error("Venda já processada.");

      // 2. Decrementa o estoque de cada item vendido
      for (const item of venda.itens) {
        await tx.medicamento.update({
          where: { id: item.medicamentoId },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      // 3. Atualiza o status da venda para CONCLUIDA
      await tx.venda.update({
        where: { id: vendaId },
        data: {
          status: "CONCLUIDA",
          formaPagamento: formaPagamento,
          caixaId: caixaId, // Opcional: registrar quem fechou o caixa
          updatedAt: new Date(),
        },
      });
    });

    // === O PULO DO GATO PARA O FRONTEND ATUALIZAR ===
    revalidatePath("/dashboard/caixa"); // Limpa a fila do caixa
    revalidatePath("/dashboard/vendas"); // ATUALIZA O ESTOQUE NO PDV (IMPORTANTE!)
    revalidatePath("/dashboard/produtos"); // Atualiza a lista de estoque geral
    revalidatePath("/dashboard/historico"); // Atualiza o histórico

    return { success: true, message: "Venda finalizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao finalizar:", error);
    return { success: false, message: "Erro ao processar venda." };
  }
}

export async function cancelarVenda(vendaId: number) {
  try {
    // Como a venda ainda é PENDENTE, assumimos que o estoque
    // NÃO foi baixado na pré-venda (lógica simplificada).
    // Então aqui apenas cancelamos o pedido sem mexer no estoque.

    await prisma.venda.update({
      where: { id: vendaId },
      data: { status: "CANCELADA" },
    });

    revalidatePath("/dashboard/caixa");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao cancelar." };
  }
}
