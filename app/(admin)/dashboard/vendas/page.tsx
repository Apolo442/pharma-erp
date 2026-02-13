import { prisma } from "@/lib/prisma";
import PDV from "./pvd";

export default async function VendasPage() {
  // Busca os usuários para popular o select de vendedores
  const usuarios = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-4 ml-1">
        Ponto de Venda (Balcão)
      </h1>

      {/* Renderiza o componente interativo passando os dados iniciais */}
      <PDV vendedores={usuarios} />
    </div>
  );
}
