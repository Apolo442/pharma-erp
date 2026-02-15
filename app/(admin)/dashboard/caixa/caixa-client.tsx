"use client";

import { useState } from "react";
import styles from "./caixa.module.css";
import {
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  ShoppingBag,
  XCircle,
  CheckCircle,
  User,
  Clock,
} from "lucide-react";
import { finalizarVenda, cancelarVenda } from "./actions";
import { useDialog } from "@/app/components/ui/DialogProvider";

type VendaItem = {
  quantidade: number;
  precoUnitario: number;
  medicamento: { nome: string };
};

type Venda = {
  id: number;
  total: number;
  clienteNome: string | null;
  createdAt: Date;
  vendedor: { name: string | null };
  itens: VendaItem[];
};

export default function CaixaClient({
  vendas,
  caixaId,
}: {
  vendas: Venda[];
  caixaId: string;
}) {
  const [selecionada, setSelecionada] = useState<Venda | null>(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { alert, confirm, prompt } = useDialog();

  async function handleFinalizar() {
    if (!selecionada || !formaPagamento) return;

    const querFinalizar = await confirm(
      "Confirmar recebimento e finalizar venda?",
      "Finalizar Venda",
    );

    if (!querFinalizar) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("vendaId", selecionada.id.toString());
    formData.append("formaPagamento", formaPagamento);
    formData.append("caixaId", caixaId);

    const res = await finalizarVenda(formData);

    setIsProcessing(false);

    if (res?.success) {
      await alert("Venda finalizada com sucesso!", "Sucesso");
      setSelecionada(null);
      setFormaPagamento("");
    } else {
      await alert(res?.message || "Erro desconhecido", "Erro ao finalizar");
    }
  }

  async function handleCancelar() {
    if (!selecionada) return;

    const motivo = await prompt(
      `Digite "CANCELAR" para excluir o pedido #${selecionada.id}.`,
      "",
      "Cancelar Pedido",
    );

    // Se o usuário fechou o modal ou clicou em Cancelar
    if (motivo === null) return;

    if (motivo === "CANCELAR") {
      setIsProcessing(true);
      const res = await cancelarVenda(selecionada.id);
      setIsProcessing(false);

      if (res?.success) {
        await alert("Pedido cancelado com sucesso.", "Cancelado");
        setSelecionada(null);
      } else {
        await alert(res?.message || "Erro desconhecido.", "Erro ao cancelar");
      }
    } else {
      await alert(
        "A palavra de confirmação não confere. O pedido não foi cancelado.",
        "Ação cancelada",
      );
    }
  }

  return (
    <div className={styles.screen}>
      {/* ESQUERDA: LISTA */}
      <div className={styles.listaPedidos}>
        <div className={styles.headerLista}>
          <span>Fila de Atendimento</span>
          <span className={styles.badgeCount}>{vendas.length}</span>
        </div>

        <div className={styles.scrollArea}>
          {vendas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <ShoppingBag size={48} className="mb-2" />
              <p className="text-sm">Sem pedidos pendentes</p>
            </div>
          ) : (
            vendas.map((v) => (
              <div
                key={v.id}
                className={`${styles.cardPedido} ${
                  selecionada?.id === v.id ? styles.active : ""
                }`}
                onClick={() => setSelecionada(v)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.badgeId}>#{v.id}</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className={styles.time}>
                      {new Date(v.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className={styles.cardCliente}>
                  <User size={12} className="inline mr-1 opacity-50" />
                  {v.clienteNome || "Consumidor Final"}
                </div>

                <div className={styles.cardTotal}>
                  {v.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DIREITA: DETALHES */}
      <div className={styles.detalhesArea}>
        {!selecionada ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={80} className="mb-6 opacity-10" />
            <p className="text-lg font-medium text-slate-400">
              Selecione um pedido para iniciar o pagamento
            </p>
          </div>
        ) : (
          <>
            <div className={styles.resumoVenda}>
              <div className={styles.resumoHeader}>
                <h2 className={styles.tituloVenda}>Pedido #{selecionada.id}</h2>
                <div className={styles.infoVenda}>
                  <span>
                    Vendedor:{" "}
                    <strong>{selecionada.vendedor.name || "N/A"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Cliente:{" "}
                    <strong>{selecionada.clienteNome || "Consumidor"}</strong>
                  </span>
                </div>
              </div>

              <div className={styles.tabelaContainer}>
                <table className={styles.tabelaItens}>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Qtd</th>
                      <th>Produto</th>
                      <th className="text-right">Unit.</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionada.itens.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{item.quantidade}x</strong>
                        </td>
                        <td>{item.medicamento.nome}</td>
                        <td className="text-right text-slate-500">
                          {item.precoUnitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="text-right font-bold">
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
              </div>
            </div>

            {/* Painel Inferior */}
            <div className={styles.painelPagamento}>
              <div className={styles.pagamentoRow}>
                <div className={styles.pagamentoEsq}>
                  <span className={styles.labelPagamento}>
                    Método de Pagamento
                  </span>
                  <div className={styles.gridPagamento}>
                    {[
                      { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
                      { id: "PIX", label: "Pix", icon: QrCode },
                      { id: "DEBITO", label: "Débito", icon: CreditCard },
                      { id: "CREDITO", label: "Crédito", icon: Wallet },
                    ].map((pg) => (
                      <button
                        key={pg.id}
                        className={`${styles.btnPagamento} ${
                          formaPagamento === pg.id ? styles.selected : ""
                        }`}
                        onClick={() => setFormaPagamento(pg.id)}
                      >
                        <pg.icon size={24} />
                        <span>{pg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.pagamentoDir}>
                  <span className={styles.labelPagamento}>Total a Receber</span>
                  <div className={styles.totalGigante}>
                    {selecionada.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button
                  onClick={handleCancelar}
                  className={styles.btnCancelar}
                  disabled={isProcessing}
                >
                  <XCircle size={18} /> Cancelar Pedido
                </button>
                <button
                  onClick={handleFinalizar}
                  disabled={!formaPagamento || isProcessing}
                  className={styles.btnFinalizar}
                >
                  {isProcessing ? (
                    "Processando..."
                  ) : (
                    <>
                      <CheckCircle size={24} /> FINALIZAR VENDA
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
