"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CarrinhoSchema = z.object({
  vendedorId: z.string().uuid(),
  clienteNome: z.string().optional(),
  itens: z
    .array(
      z.object({
        medicamentoId: z.string().uuid(),
        quantidade: z.number().int().positive(),
      }),
    )
    .min(1, "O carrinho está vazio"),
});

export async function buscarProdutos(query: string) {
  if (!query || query.length < 2) return [];

  const produtos = await prisma.medicamento.findMany({
    where: {
      ativo: true,
      estoque: { gt: 0 },
      OR: [
        { nome: { contains: query } },
        { categoria: { contains: query } },
        { id: { contains: query } },
      ],
    },
    take: 10,
    select: {
      id: true,
      nome: true,
      preco: true,
      estoque: true,
      categoria: true,
      imagemUrl: true,
    },
  });

  return produtos;
}

export type PreVendaState = {
  success?: boolean;
  message?: string;
  pedidoId?: number;
};

export async function criarPreVenda(
  prevState: PreVendaState,
  formData: FormData,
): Promise<PreVendaState> {
  const carrinhoRaw = formData.get("carrinho_json");

  if (!carrinhoRaw) return { success: false, message: "Carrinho inválido" };

  // Tratamento de JSON parse seguro
  let dados;
  try {
    dados = JSON.parse(carrinhoRaw.toString());
  } catch {
    return { success: false, message: "Erro ao processar dados do carrinho." };
  }

  const validacao = CarrinhoSchema.safeParse(dados);

  if (!validacao.success) {
    return { success: false, message: "Dados inválidos no carrinho." };
  }

  const { vendedorId, clienteNome, itens } = validacao.data;

  try {
    let totalCalculado = 0;
    const itensParaSalvar = [];

    // Validação de estoque e cálculo de total
    for (const item of itens) {
      const produto = await prisma.medicamento.findUnique({
        where: { id: item.medicamentoId },
      });

      if (!produto)
        throw new Error(`Produto ID ${item.medicamentoId} não encontrado.`);
      if (produto.estoque < item.quantidade)
        throw new Error(`Estoque insuficiente para ${produto.nome}.`);

      totalCalculado += produto.preco * item.quantidade;

      itensParaSalvar.push({
        medicamentoId: produto.id,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
      });
    }

    // Criação da Venda
    const novaVenda = await prisma.venda.create({
      data: {
        status: "PENDENTE", // O prisma generate fará esse erro sumir
        vendedorId: vendedorId,
        clienteNome: clienteNome || "Consumidor Final",
        total: totalCalculado,
        itens: {
          create: itensParaSalvar,
        },
      },
    });

    revalidatePath("/dashboard/vendas");

    return {
      success: true,
      message: "Pré-venda criada com sucesso!",
      pedidoId: novaVenda.id, // Agora ambos são number, erro resolvido
    };
  } catch (error: unknown) {
    // Correção do 'any' no catch
    console.error(error);
    let errorMessage = "Erro ao processar pedido.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}
