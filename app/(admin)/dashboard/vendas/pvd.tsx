"use client";

import { useState, useTransition, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  PackageOpen,
  Lock,
  LogOut,
} from "lucide-react";
import {
  buscarProdutos,
  criarPreVenda,
  obterCategorias,
  autenticarVendedor,
} from "./actions";
import styles from "./vendas.module.css";
import { useDialog } from "@/app/components/ui/DialogProvider";

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

export default function PDV() {
  // === ESTADOS ===
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [clienteNome, setClienteNome] = useState("");

  // ESTADO LOGIN VENDEDOR
  const [vendedorAtual, setVendedorAtual] = useState<{
    id: string;
    name: string | null;
    codigo: string;
  } | null>(null);

  // Campos do Widget de Login
  const [authCodigo, setAuthCodigo] = useState("");
  const [authPin, setAuthPin] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ESTADOS DE CATEGORIA
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const { alert, confirm } = useDialog();

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    async function init() {
      const cats = await obterCategorias();
      setCategorias(cats);

      // Busca inicial
      const prods = await buscarProdutos("", null);
      setResultados(prods);
    }
    init();
  }, []);

  // --- FUNÇÕES DE LOGIN/LOGOUT ---
  async function handleLoginVendedor() {
    if (!authCodigo || !authPin)
      return alert("Informe Código e PIN.", "Login Necessário");

    setAuthLoading(true);
    const res = await autenticarVendedor(authCodigo, authPin);
    setAuthLoading(false);

    if (res.success && res.user) {
      // Tipos batem, não precisa de ignore
      setVendedorAtual(res.user);
      setAuthCodigo("");
      setAuthPin("");
    } else {
      alert(res.message || "Credenciais inválidas", "Erro de Acesso");
      setAuthPin("");
    }
  }

  // CORREÇÃO AQUI: Agora espera o usuário confirmar
  async function handleLogoutVendedor() {
    const confirmou = await confirm(
      "Deseja realmente sair do terminal de vendas?",
    );

    if (confirmou) {
      setVendedorAtual(null);
    }
  }

  // --- BUSCA POR TEXTO ---
  const handleSearch = useDebouncedCallback(async (term: string) => {
    startTransition(async () => {
      const produtos = await buscarProdutos(term, categoriaAtiva);
      setResultados(produtos);
    });
  }, 300);

  // --- BUSCA POR CATEGORIA ---
  function handleCategoriaClick(categoria: string | null) {
    setCategoriaAtiva(categoria);
    startTransition(async () => {
      const produtos = await buscarProdutos(busca, categoria);
      setResultados(produtos);
    });
  }

  // --- CARRINHO ---
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
      novoCarrinho[index] = { ...itemAtual, quantidade: novaQtd };
      return novoCarrinho;
    });
  }

  async function removerItem(index: number) {
    if (await confirm("Remover este item do carrinho?")) {
      setCarrinho((prev) => prev.filter((_, i) => i !== index));
    }
  }

  const total = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0,
  );

  // --- FINALIZAR VENDA ---
  async function handleFinalizar() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    if (!vendedorAtual) {
      return alert(
        "⚠️ SISTEMA BLOQUEADO.\n\nÉ necessário autenticar um vendedor (Código + PIN) antes de gerar o pedido.",
        "Identificação Obrigatória",
      );
    }

    const confirmouVenda = await confirm(
      `Confirmar pré-venda de ${total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}?`,
    );

    if (!confirmouVenda) return;

    setIsSaving(true);

    const payload = {
      vendedorId: vendedorAtual.id,
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
      await alert(
        `PEDIDO #${resposta.pedidoId} GERADO!\n\nEncaminhe o cliente ao caixa.`,
        "Sucesso",
      );
      setCarrinho([]);
      setClienteNome("");
    } else {
      await alert(`Erro: ${resposta.message}`, "Erro");
    }
  }

  return (
    <div className={styles.screen}>
      {/* === ESQUERDA: CATÁLOGO === */}
      <div className={styles.catalogo}>
        {/* 1. SEARCH BAR */}
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input
              autoFocus
              value={busca}
              type="text"
              placeholder="Buscar produto ou código (F2)..."
              className={styles.searchInput}
              onChange={(e) => {
                setBusca(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {/* 2. BARRA DE CATEGORIAS */}
        <div className={styles.categoriesBar}>
          <button
            className={`${styles.chipCategoria} ${
              categoriaAtiva === null ? styles.active : ""
            }`}
            onClick={() => handleCategoriaClick(null)}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`${styles.chipCategoria} ${
                categoriaAtiva === cat ? styles.active : ""
              }`}
              onClick={() => handleCategoriaClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. LISTA DE PRODUTOS */}
        <div className={styles.listaProdutos}>
          {isPending ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="animate-pulse">Carregando catálogo...</span>
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
                  <h3 className={styles.cardTitle}>{prod.nome}</h3>
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
              <PackageOpen size={48} className="mb-2" />
              <p>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* === DIREITA: CARRINHO E LOGIN === */}
      <div className={styles.carrinho}>
        <div className={styles.carrinhoHeader}>
          {/* === WIDGET DE LOGIN === */}
          <div className={styles.loginWidget}>
            {!vendedorAtual ? (
              // MODO LOGOUT
              <>
                <div className={styles.loginHeader}>
                  <Lock size={16} /> Identificação
                </div>

                <div className={styles.loginRow}>
                  {/* Input Código */}
                  <div className={`${styles.inputWrapper} ${styles.inputCode}`}>
                    <span className={styles.labelTiny}>CÓD</span>
                    <input
                      type="text"
                      placeholder="00"
                      className={styles.loginInput}
                      value={authCodigo}
                      onChange={(e) => setAuthCodigo(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        document.getElementById("input-pin")?.focus()
                      }
                    />
                  </div>

                  {/* Input PIN */}
                  <div className={`${styles.inputWrapper} ${styles.inputPin}`}>
                    <span className={styles.labelTiny}>PIN</span>
                    <input
                      id="input-pin"
                      type="password"
                      placeholder="****"
                      maxLength={4}
                      className={styles.loginInput}
                      value={authPin}
                      onChange={(e) => setAuthPin(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleLoginVendedor()
                      }
                    />
                  </div>

                  {/* Botão Entrar */}
                  <button
                    onClick={handleLoginVendedor}
                    disabled={authLoading}
                    className={styles.btnLogin}
                    title="Autenticar"
                  >
                    {authLoading ? "..." : <ArrowRight size={20} />}
                  </button>
                </div>
              </>
            ) : (
              // MODO LOGADO
              <div className={styles.loggedInCard}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className={styles.userAvatar}>
                    {vendedorAtual.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userLabel}>Vendedor Ativo</span>
                    <span className={styles.userName}>
                      {vendedorAtual.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogoutVendedor}
                  className={styles.btnLogout}
                  title="Sair / Trocar"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Campo Cliente */}
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

        {/* LISTA DE ITENS DO CARRINHO */}
        <div className={styles.carrinhoList}>
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <ShoppingCart size={48} className="mb-2" />
              <p className="text-sm font-medium">
                Caixa Livre / Carrinho Vazio
              </p>
            </div>
          ) : (
            carrinho.map((item, idx) => (
              <div key={idx} className={styles.itemCarrinho}>
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
                  <div className={styles.controleQtd}>
                    <button
                      onClick={() => alterarQuantidade(idx, -1)}
                      className={styles.btnQtd}
                      disabled={item.quantidade <= 1}
                    >
                      <Minus size={14} />
                    </button>

                    <span className={styles.qtdValor}>{item.quantidade}</span>

                    <button
                      onClick={() => alterarQuantidade(idx, 1)}
                      className={styles.btnQtd}
                      disabled={item.quantidade >= item.produto.estoque}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    {(item.quantidade * item.produto.preco).toLocaleString(
                      "pt-BR",
                      { style: "currency", currency: "BRL" },
                    )}
                  </div>

                  <button
                    onClick={() => removerItem(idx)}
                    className={styles.btnRemove}
                  >
                    <Trash2 size={16} />
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
            className={`${styles.btnFinalizar} ${
              !vendedorAtual ? styles.disabledBtn : ""
            }`}
            style={
              !vendedorAtual
                ? {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    filter: "grayscale(1)",
                  }
                : {}
            }
            title={!vendedorAtual ? "Faça login acima para liberar" : ""}
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
