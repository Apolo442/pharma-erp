"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./produtos.module.css";
import { Search, Plus, Save, Trash2, Package } from "lucide-react";
import { salvarProduto, deletarProduto } from "./actions";
import { useDialog } from "@/app/components/ui/DialogProvider";

type Produto = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
  descricao: string | null;
};

export default function ProdutosClient({
  initialProdutos,
}: {
  initialProdutos: Produto[];
}) {
  const [produtos, setProdutos] = useState(initialProdutos);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { alert, confirm } = useDialog();
  // NOVO: Estado para filtro de estoque crítico
  const [filterCritico, setFilterCritico] = useState(false);

  useEffect(() => {
    setProdutos(initialProdutos);
  }, [initialProdutos]);

  const filtrados = useMemo(() => {
    let lista = produtos;

    // 1. Aplica filtro de estoque crítico
    if (filterCritico) {
      lista = lista.filter((p) => p.estoque < 10);
    }

    // 2. Aplica busca por texto
    if (search) {
      const s = search.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(s) ||
          p.categoria.toLowerCase().includes(s),
      );
    }

    return lista;
  }, [produtos, search, filterCritico]);

  const totalItens = produtos.length;
  const estoqueCritico = produtos.filter((p) => p.estoque < 10).length;

  const activeProduto =
    selectedId === "new"
      ? {
          id: "",
          nome: "",
          preco: 0,
          estoque: 0,
          categoria: "MEDICAMENTO",
          descricao: "",
        }
      : produtos.find((p) => p.id === selectedId);

  async function handleSave(formData: FormData) {
    setIsProcessing(true);
    const res = await salvarProduto(formData);

    if (res.success) {
      await alert("Produto salvo com sucesso!", "Sucesso");

      const dadosForm = Object.fromEntries(formData);
      const novoProduto: Produto = {
        id: (dadosForm.id as string) || "temp-" + Date.now(),
        nome: dadosForm.nome as string,
        preco: Number(dadosForm.preco),
        estoque: Number(dadosForm.estoque),
        categoria: dadosForm.categoria as string,
        descricao: dadosForm.descricao as string,
      };

      setProdutos((prev) => {
        const existe = prev.findIndex((p) => p.id === novoProduto.id);
        if (existe >= 0) {
          const novaLista = [...prev];
          novaLista[existe] = { ...novaLista[existe], ...novoProduto };
          return novaLista;
        }
        return [...prev, novoProduto];
      });

      if (!dadosForm.id) window.location.reload();
    } else {
      await alert(res.message, "Erro ao salvar");
    }
    setIsProcessing(false);
  }

  async function handleDelete() {
    if (!selectedId || selectedId === "new") return;

    // Custom confirm (o 'true' no final deixa o botão vermelho de exclusão)
    const querDeletar = await confirm(
      "Tem certeza? Isso não pode ser desfeito.",
      "Excluir Produto",
      true,
    );
    if (!querDeletar) return;

    setIsProcessing(true);
    const res = await deletarProduto(selectedId);

    if (res.success) {
      await alert("Produto removido com sucesso.", "Removido");
      setProdutos((prev) => prev.filter((p) => p.id !== selectedId));
      setSelectedId(null);
    } else {
      await alert(
        "Este produto provavelmente já possui vendas registradas no sistema. Por segurança, o histórico não pode ser apagado.",
        "Não foi possível excluir",
      );
    }
    setIsProcessing(false);
  }

  function getStockColor(qtd: number) {
    if (qtd === 0) return "#ef4444";
    if (qtd < 20) return "#f59e0b";
    return "#22c55e";
  }

  return (
    <div className={styles.screen}>
      {/* === ESQUERDA: LISTA === */}
      <div className={styles.listaArea}>
        <div className={styles.headerLista}>
          <div className={styles.kpiRow}>
            {/* Botão Total (Limpa filtro) */}
            <div
              className={`${styles.kpiCard} ${
                !filterCritico ? styles.active : ""
              }`}
              onClick={() => setFilterCritico(false)}
            >
              <div className={styles.kpiLabel}>Total Cadastrado</div>
              <div className={styles.kpiValue}>{totalItens}</div>
            </div>

            {/* Botão Crítico (Ativa filtro) */}
            <div
              className={`${styles.kpiCard} ${
                filterCritico ? styles.activeFilter : ""
              }`}
              style={{ borderColor: estoqueCritico > 0 ? "#fca5a5" : "" }}
              onClick={() => setFilterCritico(!filterCritico)}
            >
              <div className={styles.kpiLabel}>Estoque Crítico</div>
              <div
                className={styles.kpiValue}
                style={{ color: estoqueCritico > 0 ? "#ef4444" : "" }}
              >
                {estoqueCritico}
              </div>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Buscar produto..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.scrollArea}>
          {filtrados.length === 0 && (
            <div className="text-center text-gray-400 mt-10 text-sm">
              {filterCritico
                ? "Nenhum produto com estoque crítico."
                : "Nenhum produto encontrado."}
            </div>
          )}

          {filtrados.map((prod) => (
            <div
              key={prod.id}
              className={`${styles.cardProduto} ${
                selectedId === prod.id ? styles.active : ""
              }`}
              onClick={() => setSelectedId(prod.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardNome}>{prod.nome}</span>
                <span className={styles.cardPreco}>
                  {prod.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.categoriaBadge}>{prod.categoria}</span>

                <div className={styles.estoqueArea}>
                  <div className={styles.barraBg}>
                    <div
                      className={styles.barraFill}
                      style={{
                        width: `${Math.min(prod.estoque, 100)}%`,
                        backgroundColor: getStockColor(prod.estoque),
                      }}
                    />
                  </div>
                  <span>{prod.estoque} un</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === DIREITA: FORMULÁRIO === */}
      <div className={styles.formArea}>
        {!selectedId ? (
          <div className={styles.emptyState}>
            <Package size={64} className="mb-4 opacity-10" />
            <p className="text-slate-400 font-medium">
              Selecione um produto para editar
            </p>
            <button
              className={styles.btnNovo}
              onClick={() => setSelectedId("new")}
            >
              <div className="flex items-center gap-2">
                <Plus size={20} /> Cadastrar Novo Produto
              </div>
            </button>
          </div>
        ) : (
          <form
            key={selectedId}
            action={handleSave}
            className="flex flex-col h-full"
          >
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {selectedId === "new" ? "Novo Produto" : "Editar Produto"}
              </h2>
              {selectedId !== "new" && (
                <span className={styles.idBadge}>ID: {activeProduto?.id}</span>
              )}
            </div>

            <div className={styles.formContent}>
              <input type="hidden" name="id" value={activeProduto?.id || ""} />

              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome do Medicamento</label>
                <input
                  required
                  name="nome"
                  defaultValue={activeProduto?.nome}
                  className={styles.input}
                  placeholder="Ex: Dipirona Sódica 500mg"
                />
              </div>

              <div className={styles.gridCols2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Preço de Venda (R$)</label>
                  <input
                    required
                    name="preco"
                    type="number"
                    step="0.01"
                    defaultValue={activeProduto?.preco}
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Estoque Atual</label>
                  <input
                    required
                    name="estoque"
                    type="number"
                    defaultValue={activeProduto?.estoque}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.gridCols2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Categoria</label>
                  <select
                    name="categoria"
                    defaultValue={activeProduto?.categoria || "MEDICAMENTO"}
                    className={styles.input}
                  >
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="GENERICO">Genérico</option>
                    <option value="CONTROLADO">Controlado</option>
                    <option value="PERFUMARIA">Perfumaria</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Descrição / Obs (Opcional)
                </label>
                <textarea
                  name="descricao"
                  rows={3}
                  defaultValue={activeProduto?.descricao || ""}
                  className={styles.input}
                  style={{ resize: "none" }}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              {selectedId !== "new" ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.btnDelete}
                  disabled={isProcessing}
                >
                  <Trash2 size={18} /> Excluir
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className={styles.btnSave}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save size={20} /> Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
