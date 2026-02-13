"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createMedicamento, MedicamentoState } from "../actions";
import styles from "./form.module.css";
import { Save } from "lucide-react";

const initialState: MedicamentoState = { message: null, errors: {} };

const CATEGORIAS = [
  "MEDICAMENTO",
  "HIGIENE",
  "COSMETICO",
  "SUPLEMENTO",
  "OUTROS",
];

export default function NovoItemEstoquePage() {
  const [state, formAction, isPending] = useActionState(
    createMedicamento,
    initialState
  );

  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Cadastrar esse item?")) e.preventDefault();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Novo Item de Estoque</h1>

      {state.message && (
        <div className="p-3 mb-4 text-red-600 bg-red-50 rounded border border-red-200">
          {state.message}
        </div>
      )}

      <form action={formAction} className={styles.form} onSubmit={handleSubmit}>
        {/* CATEGORIA */}
        <div className={styles.formGroup}>
          <label htmlFor="categoria" className={styles.label}>
            Categoria
          </label>
          <select
            name="categoria"
            id="categoria"
            className={styles.input}
            required
            defaultValue=""
          >
            <option value="" disabled>
              Selecione...
            </option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {state.errors?.categoria && (
            <span className="text-sm text-red-500">
              {state.errors.categoria[0]}
            </span>
          )}
        </div>

        {/* NOME */}
        <div className={styles.formGroup}>
          <label htmlFor="nome" className={styles.label}>
            Nome do Produto
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            className={styles.input}
            placeholder="Ex: Dipirona 500mg"
            required
          />
          {state.errors?.nome && (
            <span className="text-sm text-red-500">{state.errors.nome[0]}</span>
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div className={styles.formGroup}>
          <label htmlFor="descricao" className={styles.label}>
            Descrição / Fabricante
          </label>
          <textarea
            name="descricao"
            id="descricao"
            className={styles.textarea}
            placeholder="Detalhes, fabricante, lote..."
          />
        </div>

        {/* PREÇO E ESTOQUE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className={styles.formGroup}>
            <label htmlFor="preco" className={styles.label}>
              Preço (R$)
            </label>
            <input
              type="number"
              name="preco"
              id="preco"
              step="0.01"
              className={styles.input}
              placeholder="0.00"
              required
            />
            {state.errors?.preco && (
              <span className="text-sm text-red-500">
                {state.errors.preco[0]}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estoque" className={styles.label}>
              Estoque Inicial
            </label>
            <input
              type="number"
              name="estoque"
              id="estoque"
              className={styles.input}
              placeholder="0"
              required
            />
            {state.errors?.estoque && (
              <span className="text-sm text-red-500">
                {state.errors.estoque[0]}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard/estoque" className={styles.buttonCancel}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={styles.buttonSave}
            disabled={isPending}
          >
            <Save size={18} />
            {isPending ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
