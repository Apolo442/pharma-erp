import { getProdutos } from "./actions";
import ProdutosClient from "./produtos-client";

export default async function ProdutosPage() {
  const produtos = await getProdutos();

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 p-6 pb-0">
        Controle de Estoque
      </h1>
      <ProdutosClient initialProdutos={produtos} />
    </div>
  );
}
