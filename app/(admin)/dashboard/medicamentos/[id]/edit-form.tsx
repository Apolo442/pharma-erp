"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateMedicamento } from "../actions";
import styles from "../novo/form.module.css";
import { Save } from "lucide-react";
import { Medicamento } from "@prisma/client";

// Recebe os dados iniciais do servidor
export default function EditMedicamentoForm({
  medicamento,
}: {
  medicamento: Medicamento;
}) {
  const updateWithId = updateMedicamento.bind(null, medicamento.id);
  const [state, formAction, isPending] = useActionState(updateWithId, {
    message: null,
    errors: {},
  });

  // 👇 Função para confirmar antes de enviar
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const confirmacao = window.confirm(
      "Deseja realmente salvar as alterações neste medicamento?"
    );

    // Se o usuário clicar em "Cancelar", impedimos o envio do form
    if (!confirmacao) {
      event.preventDefault();
    }
  };

  return (
    <form
      action={formAction}
      className={styles.form}
      onSubmit={handleSubmit} /* 👈 Adicione isso aqui */
    >
      {state.message && (
        <div className="p-3 text-red-600 bg-red-50 rounded border border-red-200">
          {state.message}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="nome" className={styles.label}>
          Nome
        </label>
        <input
          type="text"
          name="nome"
          id="nome"
          defaultValue={medicamento.nome}
          className={styles.input}
        />
        {state.errors?.nome && (
          <span className="text-sm text-red-500">{state.errors.nome[0]}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="descricao" className={styles.label}>
          Descrição
        </label>
        <textarea
          name="descricao"
          id="descricao"
          defaultValue={medicamento.descricao || ""}
          className={styles.textarea}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
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
            defaultValue={medicamento.preco}
            className={styles.input}
          />
          {state.errors?.preco && (
            <span className="text-sm text-red-500">
              {state.errors.preco[0]}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="estoque" className={styles.label}>
            Estoque
          </label>
          <input
            type="number"
            name="estoque"
            id="estoque"
            defaultValue={medicamento.estoque}
            className={styles.input}
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
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
