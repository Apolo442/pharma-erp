import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Limpar dados antigos
  await prisma.vendaItem.deleteMany();
  await prisma.venda.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.user.deleteMany();
  console.log("扫 Banco de dados limpo.");

  // 2. Criar Hash de Senha Padrão
  const passwordHash = await bcrypt.hash("123456", 10);

  // 3. Criar Usuários
  const usuariosData = [
    {
      name: "Administrador Master",
      email: "admin@smartpharma.com",
      password: passwordHash,
      role: "ADMIN",
      codigo: "999",
      pin: "9999",
    },
    {
      name: "Mateus (Vendedor)",
      email: "mateus@smartpharma.com",
      password: passwordHash,
      role: "USER",
      codigo: "10",
      pin: "1234",
    },
    {
      name: "Ana (Vendedora)",
      email: "ana@smartpharma.com",
      password: passwordHash,
      role: "USER",
      codigo: "11",
      pin: "4321",
    },
    {
      name: "Carlos (Caixa)",
      email: "carlos@smartpharma.com",
      password: passwordHash,
      role: "USER",
      codigo: "20",
      pin: "2020",
    },
  ];

  const usuarios = [];
  for (const u of usuariosData) {
    const user = await prisma.user.create({ data: u });
    usuarios.push(user);
  }
  console.log(`👤 ${usuarios.length} usuários criados.`);

  // 4. Criar Produtos
  const produtosData = [
    {
      nome: "Dipirona Monohidratada 500mg",
      preco: 5.5,
      estoque: 100,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Paracetamol 750mg",
      preco: 12.9,
      estoque: 80,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Ibuprofeno 600mg",
      preco: 22.5,
      estoque: 45,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Amoxicilina 500mg",
      preco: 35.0,
      estoque: 30,
      categoria: "ANTIBIOTICO",
    },
    {
      nome: "Loratadina 10mg",
      preco: 18.9,
      estoque: 60,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Omeprazol 20mg",
      preco: 25.0,
      estoque: 150,
      categoria: "MEDICAMENTO",
    },
    { nome: "Dorflex", preco: 8.9, estoque: 200, categoria: "MEDICAMENTO" },
    {
      nome: "Whey Protein 900g Baunilha",
      preco: 129.9,
      estoque: 20,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Vitamina C 1g Efervescente",
      preco: 15.9,
      estoque: 50,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Ômega 3 1000mg",
      preco: 45.9,
      estoque: 35,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Creatina Monohidratada 300g",
      preco: 89.9,
      estoque: 25,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Shampoo Anticaspa 200ml",
      preco: 28.9,
      estoque: 40,
      categoria: "HIGIENE",
    },
    {
      nome: "Sabonete Líquido Facial",
      preco: 35.5,
      estoque: 15,
      categoria: "COSMETICO",
    },
    {
      nome: "Protetor Solar FPS 60",
      preco: 69.9,
      estoque: 30,
      categoria: "COSMETICO",
    },
    {
      nome: "Fralda G Pacote Jumbo",
      preco: 59.9,
      estoque: 50,
      categoria: "INFANTIL",
    },
    {
      nome: "Lenços Umedecidos",
      preco: 12.9,
      estoque: 100,
      categoria: "INFANTIL",
    },
    {
      nome: "Escova Dental Macia",
      preco: 14.5,
      estoque: 60,
      categoria: "HIGIENE",
    },
    { nome: "Fio Dental 50m", preco: 9.9, estoque: 80, categoria: "HIGIENE" },
    {
      nome: "Desodorante Aerosol 150ml",
      preco: 16.9,
      estoque: 75,
      categoria: "HIGIENE",
    },
  ];

  const medicamentos = [];
  for (const p of produtosData) {
    const med = await prisma.medicamento.create({
      data: { ...p, descricao: "Produto criado via seed" },
    });
    medicamentos.push(med);
  }
  console.log(`💊 ${medicamentos.length} produtos criados.`);

  // 5. Gerar Histórico de Vendas (30 dias)
  console.log("📊 Gerando histórico de 30 dias...");
  const formasPagamento = ["DINHEIRO", "PIX", "DEBITO", "CREDITO"];

  for (let i = 30; i >= 0; i--) {
    const dataBase = subDays(new Date(), i);
    const diaSemana = dataBase.getDay();
    const eFimDeSemana = diaSemana === 0 || diaSemana === 6;
    const qtdVendas = eFimDeSemana
      ? Math.floor(Math.random() * 4) + 2
      : Math.floor(Math.random() * 10) + 5;

    for (let j = 0; j < qtdVendas; j++) {
      const hora = Math.floor(Math.random() * (19 - 8 + 1)) + 8;
      const dataVenda = setMinutes(
        setHours(dataBase, hora),
        Math.floor(Math.random() * 60),
      );

      const vendedor = usuarios[Math.floor(Math.random() * usuarios.length)];
      const itensSorteados = medicamentos
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      const itensCriar = itensSorteados.map((m) => ({
        medicamentoId: m.id,
        quantidade: Math.floor(Math.random() * 2) + 1,
        precoUnitario: m.preco,
      }));

      const totalVenda = itensCriar.reduce(
        (acc, item) => acc + item.quantidade * item.precoUnitario,
        0,
      );

      await prisma.venda.create({
        data: {
          total: totalVenda,
          status: "CONCLUIDA",
          formaPagamento:
            formasPagamento[Math.floor(Math.random() * formasPagamento.length)],
          vendedorId: vendedor.id,
          clienteNome: "Consumidor Final",
          createdAt: dataVenda,
          updatedAt: dataVenda,
          itens: { create: itensCriar },
        },
      });
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
