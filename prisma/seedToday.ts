import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Injetando vendas para o dia de HOJE...");

  // Pega o primeiro usuário e produto que achar
  const vendedor = await prisma.user.findFirst();
  const produtos = await prisma.medicamento.findMany({ take: 3 });

  if (!vendedor || produtos.length === 0) {
    console.error("❌ Cadastre usuários e produtos antes.");
    return;
  }

  // Cria 5 vendas agora
  for (let i = 0; i < 5; i++) {
    const total = 150.0; // Valor fixo para facilitar visualização

    await prisma.venda.create({
      data: {
        total: total,
        status: "CONCLUIDA",
        formaPagamento: i % 2 === 0 ? "PIX" : "CREDITO", // Alterna Pix e Crédito
        vendedorId: vendedor.id,
        clienteNome: "Cliente Teste Hoje",
        // Importante: Data de AGORA
        createdAt: new Date(),
        updatedAt: new Date(),
        itens: {
          create: {
            medicamentoId: produtos[0].id,
            quantidade: 2,
            precoUnitario: 75.0,
          },
        },
      },
    });
  }

  console.log("✅ 5 Vendas criadas para HOJE! Atualize seu dashboard.");
}

main().finally(async () => {
  await prisma.$disconnect();
});
