"use client";

import { useState, useEffect } from "react";
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
  Printer,
} from "lucide-react";
import { finalizarVenda, cancelarVenda } from "./actions";
import { useDialog } from "@/app/components/ui/DialogProvider";
import ReciboVenda from "./ReciboVenda";

type VendaItem = {
  id: string;
  quantidade: number;
  precoUnitario: number;
  medicamento: { nome: string };
};

type Venda = {
  id: number;
  total: number;
  clienteNome: string | null;
  formaPagamento: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  const [vendaConcluida, setVendaConcluida] = useState<Venda | null>(null);

  const { alert, confirm, prompt } = useDialog();

  // Atalho F8 para impressão rápida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8" && vendaConcluida) {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [vendaConcluida]);

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
      // Mesclamos a forma de pagamento selecionada para o objeto de impressão
      setVendaConcluida({ ...selecionada, formaPagamento });
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
    }
  }

  return (
    <div className={styles.screen}>
      {/* LADO ESQUERDO: LISTA DE PEDIDOS */}
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
                onClick={() => {
                  setVendaConcluida(null);
                  setSelecionada(v);
                }}
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

      {/* LADO DIREITO: DETALHES E PAGAMENTO */}
      <div className={styles.detalhesArea}>
        {vendaConcluida ? (
          <div className={styles.sucessoOverlay}>
            <div className={styles.sucessoContent}>
              <div className={styles.checkIconWrapper}>
                <CheckCircle size={80} strokeWidth={1.5} />
              </div>

              <h2 className={styles.sucessoTitle}>Venda Finalizada!</h2>
              <p className={styles.sucessoSubtitle}>
                Pedido <strong>#{vendaConcluida.id}</strong> processado com
                sucesso.
              </p>

              <div className={styles.sucessoActions}>
                <button
                  onClick={() => window.print()}
                  className={styles.btnImprimirGrande}
                >
                  <Printer size={22} /> IMPRIMIR CUPOM (F8)
                </button>

                <button
                  onClick={() => setVendaConcluida(null)}
                  className={styles.btnVoltarFila}
                >
                  VOLTAR PARA A FILA
                </button>
              </div>
            </div>
          </div>
        ) : !selecionada ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={80} className="mb-6 opacity-10" />
            <p className="text-lg font-medium text-slate-400">
              Selecione um pedido na fila ao lado
            </p>
          </div>
        ) : (
          <>
            <div className={styles.resumoVenda}>
              <div className={styles.resumoHeader}>
                <h2 className={styles.tituloVenda}>Pedido #{selecionada.id}</h2>
                <div className={styles.infoVenda}>
                  <span>
                    Vendedor: <strong>{selecionada.vendedor.name}</strong>
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
                        className={`${styles.btnPagamento} ${formaPagamento === pg.id ? styles.selected : ""}`}
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

      {/* ÁREA DE IMPRESSÃO - ISOLADA DE QUALQUER ESTILIZAÇÃO DO DASHBOARD */}
      <div className={styles.printArea}>
        {vendaConcluida && <ReciboVenda venda={vendaConcluida} />}
      </div>
    </div>
  );
}
