"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createMedicamento } from "../actions";
import styles from "./form.module.css";
import { Save } from "lucide-react";

const initialState = { message: null, errors: {} };

export default function NovoMedicamentoPage() {
  const [state, formAction, isPending] = useActionState(
    createMedicamento,
    initialState
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Novo Medicamento</h1>

      {state.message && (
        <div className="p-3 mb-4 text-red-600 bg-red-50 rounded border border-red-200">
          {state.message}
        </div>
      )}

      <form action={formAction} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nome" className={styles.label}>
            Nome do Medicamento
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            className={styles.input}
            placeholder="Ex: Dipirona 500mg"
          />
          {state.errors?.nome && (
            <span className="text-sm text-red-500">{state.errors.nome[0]}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descricao" className={styles.label}>
            Descrição (Opcional)
          </label>
          <textarea
            name="descricao"
            id="descricao"
            className={styles.textarea}
            placeholder="Detalhes..."
          />
        </div>

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
            />
            {state.errors?.estoque && (
              <span className="text-sm text-red-500">
                {state.errors.estoque[0]}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard/medicamentos" className={styles.buttonCancel}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={styles.buttonSave}
            disabled={isPending}
          >
            <Save size={18} />
            {isPending ? "Salvando..." : "Salvar Medicamento"}
          </button>
        </div>
      </form>
    </div>
  );
}
