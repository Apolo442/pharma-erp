import { getHistoricoVendas } from "./actions";
import HistoricoClient from "./historico-client";

export default async function HistoricoPage() {
  const vendas = await getHistoricoVendas();

  return (
    <div className="bg-gray-100 min-h-screen">
      <HistoricoClient vendasIniciais={vendas} />
    </div>
  );
}
