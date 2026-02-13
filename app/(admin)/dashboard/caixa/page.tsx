import { prisma } from "@/lib/prisma";
// import { getCurrentUser } from "@/lib/session";
import CaixaClient from "./caixa-client";

export default async function CaixaPage() {
  // 1. Busca vendas pendentes
  const vendasPendentes = await prisma.venda.findMany({
    where: { status: "PENDENTE" },
    include: {
      vendedor: { select: { name: true } },
      itens: {
        include: {
          medicamento: { select: { nome: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Busca usuário atual (Caixa)
  // Se não tiver autenticação pronta, vamos pegar o primeiro usuário do banco como "Caixa Logado"
  // para não travar o desenvolvimento.
  const caixaUser = await prisma.user.findFirst();

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 p-6 pb-0">
        Frente de Caixa
      </h1>

      {/* Componente Client-Side para interação */}
      <CaixaClient vendas={vendasPendentes} caixaId={caixaUser?.id || ""} />
    </div>
  );
}
