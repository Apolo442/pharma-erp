import { prisma } from "@/lib/prisma";
import CaixaClient from "./caixa-client";

export default async function CaixaPage() {
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

  const caixaUser = await prisma.user.findFirst();

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 p-6 pb-0">
        Frente de Caixa
      </h1>

      <CaixaClient
        vendas={vendasPendentes}
        caixaId={caixaUser?.id || ""}
        /* caixaNome={caixaUser?.name || "Operador"} */
      />
    </div>
  );
}
