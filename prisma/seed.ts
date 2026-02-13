// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando Seed...");

  // 1. Criar ou Atualizar Usuários
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartpharma.com" },
    update: {},
    create: {
      email: "admin@smartpharma.com",
      name: "Administrador",
      password: "123",
      role: "ADMIN",
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: "maria@smartpharma.com" },
    update: {},
    create: {
      email: "maria@smartpharma.com",
      name: "Maria Vendedora",
      password: "123",
      role: "USER",
    },
  });

  const caixa = await prisma.user.upsert({
    where: { email: "joao@smartpharma.com" },
    update: {},
    create: {
      email: "joao@smartpharma.com",
      name: "João do Caixa",
      password: "123",
      role: "USER",
    },
  });

  console.log("✅ Usuários criados:", {
    admin: admin.name,
    vendedor: vendedor.name,
    caixa: caixa.name,
  });

  // 2. Criar um Produto de Teste se não houver nenhum
  const count = await prisma.medicamento.count();
  if (count === 0) {
    await prisma.medicamento.create({
      data: {
        nome: "Dipirona 500mg",
        preco: 12.5,
        estoque: 100,
        categoria: "MEDICAMENTO",
        descricao: "Analgésico e antitérmico",
      },
    });
    console.log("✅ Produto de teste criado.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
