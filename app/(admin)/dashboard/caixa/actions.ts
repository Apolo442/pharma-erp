"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação
const PagamentoSchema = z.object({
  vendaId: z.number(),
  formaPagamento: z.enum(["DINHEIRO", "PIX", "DEBITO", "CREDITO"]),
  caixaId: z.string().uuid(),
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
    vendaId: Number(formData.get("vendaId")),
    formaPagamento: formData.get("formaPagamento"),
    caixaId: formData.get("caixaId"),
  };

  // Valida usando o Zod (Corrige o erro de variável não usada)
  const validacao = PagamentoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      success: false,
      message: "Dados inválidos: " + validacao.error.issues[0].message,
    };
  }

  const { vendaId, formaPagamento, caixaId } = validacao.data;

  try {
    await prisma.venda.update({
      where: { id: vendaId },
      data: {
        status: "CONCLUIDA",
        formaPagamento: formaPagamento,
        caixaId: caixaId,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/caixa");
    revalidatePath("/dashboard");

    return { success: true, message: "Venda finalizada com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao finalizar venda." };
  }
}

export async function cancelarVenda(vendaId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id: vendaId },
        include: { itens: true },
      });

      if (!venda) throw new Error("Venda não encontrada");

      for (const item of venda.itens) {
        await tx.medicamento.update({
          where: { id: item.medicamentoId },
          data: { estoque: { increment: item.quantidade } },
        });
      }

      await tx.venda.update({
        where: { id: vendaId },
        data: { status: "CANCELADA" },
      });
    });

    revalidatePath("/dashboard/caixa");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao cancelar." };
  }
}
