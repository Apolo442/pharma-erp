"use client";
import { useDialog } from "@/app/components/ui/DialogProvider";
import { useState, useMemo } from "react";
import styles from "./historico.module.css";
import { Search, FileText, Undo2 } from "lucide-react";
import { estornarVenda } from "./actions";

type Venda = {
  id: number;
  total: number;
  status: string; // "CONCLUIDA" | "CANCELADA"
  formaPagamento: string | null;
  createdAt: Date;
  clienteNome: string | null;
  vendedor: { name: string | null };
  itens: {
    quantidade: number;
    precoUnitario: number;
    medicamento: { nome: string };
  }[];
};

export default function HistoricoClient({
  vendasIniciais,
}: {
  vendasIniciais: Venda[];
}) {
  const [vendas, setVendas] = useState(vendasIniciais);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { alert, prompt } = useDialog();

  const filtrados = useMemo(() => {
    if (!search) return vendas;
    const s = search.toLowerCase();
    return vendas.filter(
      (v) =>
        v.id.toString().includes(s) ||
        (v.clienteNome && v.clienteNome.toLowerCase().includes(s)),
    );
  }, [vendas, search]);

  const selecionada = vendas.find((v) => v.id === selectedId);

  async function handleEstorno() {
    if (!selecionada) return;

    // Usando o prompt customizado (Aguardando a resposta do usuário)
    const motivo = await prompt(
      `Estornar a venda #${selecionada.id} irá devolver os itens ao estoque. Digite "ESTORNAR" para confirmar:`,
      "",
      "Atenção: Estorno de Venda",
    );

    // Se o usuário clicou em cancelar ou apertou Esc, o motivo vem como null
    if (motivo === null) return;

    if (motivo === "ESTORNAR") {
      setIsProcessing(true);
      const res = await estornarVenda(selecionada.id);

      if (res.success) {
        await alert(
          "Venda estornada com sucesso e estoque reposto.",
          "Sucesso",
        );
        // Atualiza localmente o status para evitar reload
        setVendas((prev) =>
          prev.map((v) =>
            v.id === selecionada.id ? { ...v, status: "CANCELADA" } : v,
          ),
        );
      } else {
        await alert(res.message, "Erro ao estornar");
      }
      setIsProcessing(false);
    } else {
      // Se digitou errado
      await alert(
        "A palavra de confirmação não confere. Estorno cancelado.",
        "Ação cancelada",
      );
    }
  }
  return (
    <div className={styles.screen}>
      {/* ESQUERDA: LISTA */}
      <div className={styles.listaArea}>
        <div className={styles.headerLista}>
          <div className={styles.title}>
            <FileText size={20} className="text-teal-600" />
            Histórico de Vendas
          </div>
          <div className={styles.searchWrapper}>
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por ID ou Cliente..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.scrollArea}>
          {filtrados.map((venda) => (
            <div
              key={venda.id}
              className={`${styles.cardVenda} ${
                selectedId === venda.id ? styles.active : ""
              }`}
              onClick={() => setSelectedId(venda.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.badgeId}>#{venda.id}</span>
                <span className={styles.cardDate}>
                  {new Date(venda.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="text-sm font-medium text-slate-700 truncate">
                {venda.clienteNome || "Consumidor Final"}
              </div>

              <div className={styles.cardInfo}>
                <span className={styles.cardTotal}>
                  {venda.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
                <span
                  className={`${styles.badgeStatus} ${
                    venda.status === "CONCLUIDA"
                      ? styles.statusConcluido
                      : styles.statusCancelado
                  }`}
                >
                  {venda.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIREITA: DETALHES (RECIBO) */}
      <div className={styles.detalhesArea}>
        {!selecionada ? (
          <div className={styles.emptyState}>
            <FileText size={64} className="mb-4 opacity-10" />
            <p className="text-slate-400 font-medium">
              Selecione uma venda para ver o recibo
            </p>
          </div>
        ) : (
          <>
            <div className={styles.reciboContainer}>
              <div className={styles.folhaRecibo}>
                {selecionada.status === "CANCELADA" && (
                  <div className={styles.carimboCancelado}>CANCELADO</div>
                )}

                <div className={styles.reciboHeader}>
                  <div className={styles.reciboLogo}>PHARMA ONE</div>
                  <div className={styles.reciboMeta}>
                    <span>Recibo #{selecionada.id}</span>
                    <span>
                      Data: {new Date(selecionada.createdAt).toLocaleString()}
                    </span>
                    <span>Vendedor: {selecionada.vendedor.name || "N/A"}</span>
                  </div>
                </div>

                <table className={styles.reciboTable}>
                  <thead>
                    <tr>
                      <th>Qtd</th>
                      <th>Item</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionada.itens.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.quantidade}x</td>
                        <td>{item.medicamento.nome}</td>
                        <td className="text-right">
                          {(
                            item.quantidade * item.precoUnitario
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.reciboTotalRow}>
                  <div>
                    <div className={styles.reciboLabel}>Pagamento via</div>
                    <div className="text-sm font-mono uppercase">
                      {selecionada.formaPagamento || "-"}
                    </div>
                  </div>
                  <div>
                    <div
                      className={styles.reciboLabel}
                      style={{ textAlign: "right" }}
                    >
                      TOTAL
                    </div>
                    <div className={styles.reciboValor}>
                      {selecionada.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.detalhesFooter}>
              {selecionada.status === "CONCLUIDA" && (
                <button
                  onClick={handleEstorno}
                  disabled={isProcessing}
                  className={styles.btnEstornar}
                >
                  <Undo2 size={18} /> Estornar Venda
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
