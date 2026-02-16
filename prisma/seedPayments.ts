import { PrismaClient } from "@prisma/client";
import { subDays, setHours, setMinutes, isWeekend, getDate } from "date-fns";

const prisma = new PrismaClient();

// Configurações do Seed
const TOTAL_VENDAS = 450;
const DIAS_HISTORICO = 365; // 1 ano de dados

async function main() {
  console.log(
    `🌱 Iniciando Super Seed de Vendas (${TOTAL_VENDAS} vendas em ${DIAS_HISTORICO} dias)...`,
  );

  // 1. Recuperar dados existentes (Não vamos apagar tudo, apenas adicionar vendas)
  const usuarios = await prisma.user.findMany();
  const medicamentos = await prisma.medicamento.findMany();

  if (usuarios.length === 0 || medicamentos.length === 0) {
    console.error(
      "❌ ERRO: Rode o seed.ts padrão primeiro para criar usuários e produtos.",
    );
    process.exit(1);
  }

  console.log(
    `📦 Carregados: ${usuarios.length} usuários e ${medicamentos.length} produtos.`,
  );

  const formasPagamento = [
    "DINHEIRO",
    "PIX",
    "DEBITO",
    "CREDITO",
    "CREDITO",
    "PIX",
  ]; // Peso maior para PIX e Crédito

  let vendasCriadas = 0;

  // Vamos iterar dia a dia para garantir distribuição, mas com aleatoriedade
  // Média de vendas por dia para atingir a meta
  const mediaVendasDia = TOTAL_VENDAS / DIAS_HISTORICO;

  for (let i = DIAS_HISTORICO; i >= 0; i--) {
    const dataBase = subDays(new Date(), i);
    const diaDoMes = getDate(dataBase);
    const ehFimDeSemana = isWeekend(dataBase);

    // LÓGICA DE VOLUME "REALISTA":
    // 1. Pagamento de Salário: Dias 1-10 tem +30% de movimento
    // 2. Fim de semana: Tem movimento levemente menor (-20%)
    let chanceVenda = mediaVendasDia; // Base (ex: 1.2 vendas/dia)

    if (diaDoMes <= 10) chanceVenda *= 1.5; // Boom de início de mês
    if (ehFimDeSemana) chanceVenda *= 0.8; // Queda fds

    // Aleatoriedade final (pode ter dia com 0 vendas e dia com 5)
    const numVendasHoje = Math.round(Math.random() * (chanceVenda * 2));

    for (let j = 0; j < numVendasHoje; j++) {
      if (vendasCriadas >= TOTAL_VENDAS) break;

      // LÓGICA DE HORÁRIO (Pico 12h e 18h)
      let hora;
      const r = Math.random();
      if (r < 0.2)
        hora = 9 + Math.floor(Math.random() * 2); // Manhã (20%)
      else if (r < 0.5)
        hora = 12 + Math.floor(Math.random() * 2); // Almoço (30%)
      else if (r < 0.9)
        hora = 17 + Math.floor(Math.random() * 3); // Happy Hour (40%)
      else hora = 20 + Math.floor(Math.random() * 2); // Noite (10%)

      const dataVenda = setMinutes(
        setHours(dataBase, hora),
        Math.floor(Math.random() * 60),
      );

      // Escolher Vendedor Aleatório
      const vendedor = usuarios[Math.floor(Math.random() * usuarios.length)];

      // Montar Carrinho (1 a 5 itens)
      const qtdItens = Math.floor(Math.random() * 5) + 1;
      // Embaralha produtos e pega os primeiros X
      const itensSorteados = [...medicamentos]
        .sort(() => 0.5 - Math.random())
        .slice(0, qtdItens);

      let totalVenda = 0;
      const itensParaCriar = itensSorteados.map((prod) => {
        const qtd = Math.floor(Math.random() * 3) + 1; // 1 a 3 unidades
        const subtotal = qtd * Number(prod.preco);
        totalVenda += subtotal;

        return {
          medicamentoId: prod.id,
          quantidade: qtd,
          precoUnitario: prod.preco, // Salva preço histórico
        };
      });

      // Criar a Venda no Banco
      await prisma.venda.create({
        data: {
          total: totalVenda,
          status: "CONCLUIDA",
          formaPagamento:
            formasPagamento[Math.floor(Math.random() * formasPagamento.length)],
          vendedorId: vendedor.id,
          clienteNome:
            Math.random() > 0.7 ? "Cliente Cadastrado" : "Consumidor Final", // 30% identificados
          createdAt: dataVenda,
          updatedAt: dataVenda,
          itens: {
            create: itensParaCriar,
          },
        },
      });

      vendasCriadas++;
    }
  }

  console.log(
    `✅ Sucesso! ${vendasCriadas} vendas geradas distribuídas em ${DIAS_HISTORICO} dias.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
