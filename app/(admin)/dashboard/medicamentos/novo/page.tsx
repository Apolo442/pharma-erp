import Link from "next/link";
import { createMedicamento } from "../actions"; // Importa a action criada no passo 1
import styles from "./form.module.css";
import { Save, ArrowLeft } from "lucide-react";

export default function NovoMedicamentoPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Novo Medicamento</h1>

      <form action={createMedicamento} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nome" className={styles.label}>
            Nome do Medicamento
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            required
            placeholder="Ex: Dipirona 500mg"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descricao" className={styles.label}>
            Descrição (Opcional)
          </label>
          <textarea
            name="descricao"
            id="descricao"
            placeholder="Detalhes sobre o medicamento..."
            className={styles.textarea}
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
              required
              placeholder="0,00"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estoque" className={styles.label}>
              Estoque Inicial
            </label>
            <input
              type="number"
              name="estoque"
              id="estoque"
              required
              placeholder="0"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard/medicamentos" className={styles.buttonCancel}>
            Cancelar
          </Link>
          <button type="submit" className={styles.buttonSave}>
            <Save size={18} />
            Salvar Medicamento
          </button>
        </div>
      </form>
    </div>
  );
}
