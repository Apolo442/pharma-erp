import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Começando o seed...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@farmacia.com" },
    update: {},
    create: {
      email: "admin@farmacia.com",
      name: "Administrador Chefe",
      password: "123",
      role: "ADMIN",
    },
  });
  console.log(`👤 Usuário criado: ${admin.email}`);

  const remedios = [
    {
      nome: "Dipirona 500mg",
      preco: 5.5,
      estoque: 100,
      descricao: "Analgésico e antitérmico",
    },
    {
      nome: "Tylenol Sinus",
      preco: 15.9,
      estoque: 45,
      descricao: "Para gripe e resfriado",
    },
    {
      nome: "Vitamina C",
      preco: 22.0,
      estoque: 20,
      descricao: "Ajuda na imunidade",
    },
  ];

  for (const r of remedios) {
    const remedio = await prisma.medicamento.create({
      data: r,
    });
    console.log(`💊 Medicamento criado: ${remedio.nome}`);
  }

  console.log("✅ Seed finalizado com sucesso!");
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
