"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProdutoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 letras"),
  preco: z.coerce.number().min(0.01, "Preço inválido"),
  estoque: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  categoria: z.string().default("MEDICAMENTO"),
  descricao: z.string().optional(),
});

export async function getProdutos() {
  return await prisma.medicamento.findMany({
    where: { ativo: true }, // <--- SÓ TRAZ OS ATIVOS
    orderBy: { nome: "asc" },
  });
}

export async function salvarProduto(formData: FormData) {
  const dados = Object.fromEntries(formData.entries());
  const validacao = ProdutoSchema.safeParse(dados);

  if (!validacao.success) {
    return { success: false, message: validacao.error.issues[0].message };
  }

  const { id, ...data } = validacao.data;

  try {
    if (id) {
      await prisma.medicamento.update({
        where: { id },
        data,
      });
    } else {
      await prisma.medicamento.create({
        data: { ...data, ativo: true },
      });
    }

    revalidatePath("/dashboard/produtos");
    revalidatePath("/dashboard/vendas");
    return { success: true, message: "Produto salvo com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao salvar produto." };
  }
}

// Transformamos o DELETE em ARQUIVAR (Soft Delete)
export async function deletarProduto(id: string) {
  try {
    // Tenta deletar de verdade primeiro (caso seja um produto criado por engano e sem vendas)
    // Se falhar (tiver vendas), a gente apenas inativa.

    // Check rápido se tem vendas
    const vendasVinculadas = await prisma.vendaItem.count({
      where: { medicamentoId: id },
    });

    if (vendasVinculadas > 0) {
      // TEM VENDAS: Faz o Soft Delete (Inativa)
      await prisma.medicamento.update({
        where: { id },
        data: { ativo: false },
      });
      revalidatePath("/dashboard/produtos");
      return {
        success: true,
        message: "Produto arquivado (possuía histórico).",
      };
    } else {
      // NÃO TEM VENDAS: Pode deletar limpo
      await prisma.medicamento.delete({ where: { id } });
      revalidatePath("/dashboard/produtos");
      return { success: true, message: "Produto removido permanentemente." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao processar a exclusão." };
  }
}
