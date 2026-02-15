import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Limpar dados antigos (Ordem importa por causa das chaves estrangeiras)
  // Opcional: Se quiser manter os dados antigos, comente estas linhas
  await prisma.vendaItem.deleteMany();
  await prisma.venda.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Banco de dados limpo.");

  // 2. Criar Hash de Senha Padrão (123456)
  const passwordHash = await bcrypt.hash("123456", 10);

  // 3. Criar Usuários
  const usuarios = [
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

  for (const u of usuarios) {
    await prisma.user.create({ data: u });
  }

  console.log(`👤 ${usuarios.length} usuários criados.`);

  // 4. Criar Produtos (Medicamentos e Outros)
  const produtos = [
    // === MEDICAMENTOS ===
    {
      nome: "Dipirona Monohidratada 500mg",
      descricao: "Analgésico e antitérmico, cartela c/ 10 comprimidos",
      preco: 5.5,
      estoque: 100,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Paracetamol 750mg",
      descricao: "Alívio de dores e febre, caixa c/ 20 comprimidos",
      preco: 12.9,
      estoque: 80,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Ibuprofeno 600mg",
      descricao: "Anti-inflamatório, cápsula gelatinosa",
      preco: 22.5,
      estoque: 45,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Amoxicilina 500mg",
      descricao:
        "Antibiótico genérico, caixa c/ 21 cápsulas (Retenção de Receita)",
      preco: 35.0,
      estoque: 30,
      categoria: "ANTIBIOTICO",
    },
    {
      nome: "Loratadina 10mg",
      descricao: "Antialérgico, xarope 100ml",
      preco: 18.9,
      estoque: 60,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Omeprazol 20mg",
      descricao: "Para gastrite e úlcera, frasco c/ 28 cápsulas",
      preco: 25.0,
      estoque: 150,
      categoria: "MEDICAMENTO",
    },
    {
      nome: "Dorflex",
      descricao: "Relaxante muscular e analgésico, cartela c/ 10",
      preco: 8.9,
      estoque: 200,
      categoria: "MEDICAMENTO",
    },

    // === SUPLEMENTOS ===
    {
      nome: "Whey Protein 900g Baunilha",
      descricao: "Suplemento proteico para atletas",
      preco: 129.9,
      estoque: 20,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Vitamina C 1g Efervescente",
      descricao: "Tubo com 10 comprimidos sabor Laranja",
      preco: 15.9,
      estoque: 50,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Ômega 3 1000mg",
      descricao: "Óleo de peixe, pote com 60 cápsulas",
      preco: 45.9,
      estoque: 35,
      categoria: "SUPLEMENTO",
    },
    {
      nome: "Creatina Monohidratada 300g",
      descricao: "100% Pura",
      preco: 89.9,
      estoque: 25,
      categoria: "SUPLEMENTO",
    },

    // === HIGIENE E BELEZA ===
    {
      nome: "Shampoo Anticaspa 200ml",
      descricao: "Controle de oleosidade e caspa",
      preco: 28.9,
      estoque: 40,
      categoria: "HIGIENE",
    },
    {
      nome: "Sabonete Líquido Facial",
      descricao: "Para pele oleosa e acneica",
      preco: 35.5,
      estoque: 15,
      categoria: "COSMETICO",
    },
    {
      nome: "Protetor Solar FPS 60",
      descricao: "Toque seco, 50g",
      preco: 69.9,
      estoque: 30,
      categoria: "COSMETICO",
    },
    {
      nome: "Fralda G Pacote Jumbo",
      descricao: "Pacote com 40 unidades",
      preco: 59.9,
      estoque: 50,
      categoria: "INFANTIL",
    },
    {
      nome: "Lenços Umedecidos",
      descricao: "Pacote com 48 unidades, sem álcool",
      preco: 12.9,
      estoque: 100,
      categoria: "INFANTIL",
    },
    {
      nome: "Escova Dental Macia",
      descricao: "Cerdas finas, cabeça compacta",
      preco: 14.5,
      estoque: 60,
      categoria: "HIGIENE",
    },
    {
      nome: "Fio Dental 50m",
      descricao: "Sabor menta",
      preco: 9.9,
      estoque: 80,
      categoria: "HIGIENE",
    },
    {
      nome: "Desodorante Aerosol 150ml",
      descricao: "Proteção 48h invisível",
      preco: 16.9,
      estoque: 75,
      categoria: "HIGIENE",
    },
  ];

  for (const produto of produtos) {
    await prisma.medicamento.create({
      data: produto,
    });
  }

  console.log(`💊 ${produtos.length} produtos criados.`);
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
