"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Importa tipos para tipagem forte
import { revalidatePath } from "next/cache";

// Tipo auxiliar para os itens que vêm do JSON
type ItemInput = {
  medicamentoId: string;
  quantidade: number;
};

// 1. Busca Unificada (Texto + Categoria)
export async function buscarProdutos(termo: string, categoria: string | null) {
  // Tipagem correta do WhereInput do Prisma
  const whereClause: Prisma.MedicamentoWhereInput = {
    // estoque: { gt: 0 }, // Descomente se quiser esconder zerados
  };

  if (categoria) {
    whereClause.categoria = categoria;
  }

  if (termo && termo.trim().length > 0) {
    whereClause.AND = [
      {
        OR: [{ nome: { contains: termo } }, { id: { equals: termo } }],
      },
    ];
  }

  try {
    const produtos = await prisma.medicamento.findMany({
      where: whereClause,
      take: 50,
      orderBy: { nome: "asc" },
    });

    return produtos;
  } catch (error) {
    console.error("Erro na busca:", error);
    return [];
  }
}

// 2. Criar Pré-Venda
// prevState deve ser 'unknown' ou um tipo definido, evite 'any'
export async function criarPreVenda(prevState: unknown, formData: FormData) {
  const json = formData.get("carrinho_json") as string;

  if (!json) return { success: false, message: "Carrinho vazio." };

  // Tipando o JSON parseado
  const { vendedorId, clienteNome, itens } = JSON.parse(json) as {
    vendedorId: string;
    clienteNome: string;
    itens: ItemInput[];
  };

  if (!vendedorId || itens.length === 0) {
    return { success: false, message: "Dados inválidos." };
  }

  try {
    const ids = itens.map((i) => i.medicamentoId);

    const produtosNoBanco = await prisma.medicamento.findMany({
      where: { id: { in: ids } },
      select: { id: true, preco: true },
    });

    let totalCalculado = 0;

    const itensParaSalvar = itens.map((itemCarrinho) => {
      const produto = produtosNoBanco.find(
        (p) => p.id === itemCarrinho.medicamentoId,
      );
      const precoReal = produto ? Number(produto.preco) : 0;

      totalCalculado += precoReal * itemCarrinho.quantidade;

      return {
        medicamentoId: itemCarrinho.medicamentoId,
        quantidade: itemCarrinho.quantidade,
        precoUnitario: precoReal,
      };
    });

    const venda = await prisma.venda.create({
      data: {
        status: "PENDENTE",
        vendedorId,
        clienteNome,
        total: totalCalculado,
        itens: {
          create: itensParaSalvar,
        },
      },
    });

    revalidatePath("/dashboard/caixa");
    return { success: true, pedidoId: venda.id };
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return { success: false, message: "Erro ao processar pedido." };
  }
}

// 3. Obter Categorias
export async function obterCategorias() {
  try {
    const categorias = await prisma.medicamento.findMany({
      select: { categoria: true },
      distinct: ["categoria"],
      orderBy: { categoria: "asc" },
    });
    return categorias.map((c) => c.categoria);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

// 4. Autenticação Simplificada (Código + PIN)
export async function autenticarVendedor(codigo: string, pin: string) {
  if (!codigo || !pin)
    return { success: false, message: "Preencha código e PIN." };

  try {
    const user = await prisma.user.findUnique({
      where: { codigo }, // Se o erro persistir aqui, rode npx prisma generate
    });

    if (!user) {
      return { success: false, message: "Código de vendedor não encontrado." };
    }

    if (user.pin !== pin) {
      return { success: false, message: "PIN incorreto." };
    }

    if (!user.ativo) {
      return { success: false, message: "Vendedor inativo." };
    }

    return {
      success: true,
      user: { id: user.id, name: user.name, codigo: user.codigo },
    };
  } catch (error) {
    console.error("Erro auth:", error);
    return { success: false, message: "Erro interno." };
  }
}
