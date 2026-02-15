"use client";

import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
} from "lucide-react";
import { buscarProdutos, criarPreVenda } from "./actions";
import styles from "./vendas.module.css";

// Tipos
type Produto = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
  imagemUrl: string | null;
};

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function PDV({ vendedores }: { vendedores: User[] }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [vendedorSelecionado, setVendedorSelecionado] = useState(
    vendedores[0]?.id || "",
  );
  const [clienteNome, setClienteNome] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  // --- BUSCA ---
  const handleSearch = useDebouncedCallback(async (term: string) => {
    if (term.length < 2) {
      setResultados([]);
      return;
    }

    startTransition(async () => {
      const produtos = await buscarProdutos(term);
      setResultados(produtos);
    });
  }, 300);

  // --- OPERAÇÕES DO CARRINHO ---
  function adicionarItem(produto: Produto) {
    setCarrinho((prev) => {
      const index = prev.findIndex((item) => item.produto.id === produto.id);

      if (index >= 0) {
        const itemAtual = prev[index];
        if (itemAtual.quantidade + 1 > produto.estoque) {
          alert(
            `Limite de estoque atingido! Só temos ${produto.estoque} unidades.`,
          );
          return prev;
        }

        const novoCarrinho = [...prev];
        novoCarrinho[index] = {
          ...itemAtual,
          quantidade: itemAtual.quantidade + 1,
        };

        return novoCarrinho;
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  }

  function alterarQuantidade(index: number, delta: number) {
    setCarrinho((prev) => {
      const itemAtual = prev[index];
      const novaQtd = itemAtual.quantidade + delta;

      if (novaQtd < 1) return prev;

      if (delta > 0 && novaQtd > itemAtual.produto.estoque) {
        alert("Estoque máximo atingido.");
        return prev;
      }

      const novoCarrinho = [...prev];
      novoCarrinho[index] = {
        ...itemAtual,
        quantidade: novaQtd,
      };

      return novoCarrinho;
    });
  }

  function removerItem(index: number) {
    if (confirm("Remover este item do carrinho?")) {
      setCarrinho((prev) => prev.filter((_, i) => i !== index));
    }
  }

  const total = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0,
  );

  // --- FINALIZAR ---
  async function handleFinalizar() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!vendedorSelecionado) return alert("Selecione um vendedor!");

    if (
      !confirm(
        `Confirmar pré-venda de R$ ${total.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}?`,
      )
    )
      return;

    setIsSaving(true);

    const payload = {
      vendedorId: vendedorSelecionado,
      clienteNome: clienteNome,
      itens: carrinho.map((item) => ({
        medicamentoId: item.produto.id,
        quantidade: item.quantidade,
      })),
    };

    const formData = new FormData();
    formData.append("carrinho_json", JSON.stringify(payload));

    const resposta = await criarPreVenda({}, formData);

    setIsSaving(false);

    if (resposta.success) {
      alert(
        `✅ PEDIDO #${resposta.pedidoId} GERADO!\n\nEncaminhe o cliente ao caixa.`,
      );
      setCarrinho([]);
      setClienteNome("");
      setBusca("");
      setResultados([]);
    } else {
      alert(`❌ Erro: ${resposta.message}`);
    }
  }

  return (
    <div className={styles.screen}>
      {/* === ESQUERDA: CATÁLOGO === */}
      <div className={styles.catalogo}>
        <div className={styles.searchBar}>
          {/* Wrapper flex para o input e icone ficarem perfeitos */}
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              autoFocus
              value={busca}
              type="text"
              placeholder="Buscar por nome, categoria ou código (F2)..."
              className={styles.searchInput}
              onChange={(e) => {
                setBusca(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>
        </div>

        <div className={styles.listaProdutos}>
          {isPending ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="animate-pulse">Buscando catálogo...</span>
            </div>
          ) : resultados.length > 0 ? (
            <div className={styles.gridProdutos}>
              {resultados.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => adicionarItem(prod)}
                  disabled={prod.estoque <= 0}
                  className={styles.cardProduto}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.badgeCategoria}>
                      {prod.categoria}
                    </span>
                    <span
                      className={`${styles.badgeEstoque} ${
                        prod.estoque > 0
                          ? styles.estoqueOk
                          : styles.estoqueBaixo
                      }`}
                    >
                      {prod.estoque > 0 ? `${prod.estoque} un` : "ESGOTADO"}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle} title={prod.nome}>
                    {prod.nome}
                  </h3>

                  <div className={styles.cardPriceArea}>
                    <span className={styles.cardPrice}>
                      {prod.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <Package size={64} className="mb-4" />
              <p>Comece a digitar para buscar produtos...</p>
            </div>
          )}
        </div>
      </div>

      {/* === DIREITA: CARRINHO === */}
      <div className={styles.carrinho}>
        <div className={styles.carrinhoHeader}>
          <div className="space-y-4">
            {" "}
            {/* Espaçamento melhorado */}
            <div className={styles.inputGroup}>
              <label className={styles.labelInput}>Vendedor Responsável</label>
              <select
                value={vendedorSelecionado}
                onChange={(e) => setVendedorSelecionado(e.target.value)}
                className={styles.inputField}
              >
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name || v.email}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.labelInput}>Cliente (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Nome ou CPF"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                className={styles.inputField}
              />
            </div>
          </div>
        </div>

        <div className={styles.carrinhoList}>
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <ShoppingCart size={48} className="mb-2" />
              <p className="text-sm font-medium">Carrinho vazio</p>
            </div>
          ) : (
            carrinho.map((item, idx) => (
              <div key={idx} className={styles.itemCarrinho}>
                {/* Info do Item */}
                <div className={styles.itemInfo}>
                  <div className={styles.itemNome}>{item.produto.nome}</div>
                  <div className={styles.itemUnitario}>
                    {item.produto.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                    un.
                  </div>
                </div>

                <div className={styles.itemActions}>
                  {/* Controles de Quantidade */}
                  <div className={styles.controleQtd}>
                    <button
                      onClick={() => alterarQuantidade(idx, -1)}
                      className={styles.btnQtd}
                      title="Diminuir"
                      disabled={item.quantidade <= 1}
                    >
                      <Minus size={14} />
                    </button>

                    <span className={styles.qtdValor}>{item.quantidade}</span>

                    <button
                      onClick={() => alterarQuantidade(idx, 1)}
                      className={styles.btnQtd}
                      disabled={item.quantidade >= item.produto.estoque}
                      title="Aumentar"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Preço Total do Item */}
                  <div className={styles.itemTotal}>
                    {(item.quantidade * item.produto.preco).toLocaleString(
                      "pt-BR",
                      { style: "currency", currency: "BRL" },
                    )}
                  </div>

                  {/* Botão Remover */}
                  <button
                    onClick={() => removerItem(idx)}
                    className={styles.btnRemove}
                    title="Remover Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.carrinhoFooter}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total a Pagar</span>
            <span className={styles.totalValue}>
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>

          <button
            onClick={handleFinalizar}
            disabled={carrinho.length === 0 || isSaving}
            className={styles.btnFinalizar}
          >
            {isSaving ? (
              "Processando..."
            ) : (
              <>
                GERAR PEDIDO <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
