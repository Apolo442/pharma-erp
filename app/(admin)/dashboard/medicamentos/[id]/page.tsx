import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMedicamento } from "../actions";
// Importando o CSS do formulário de criação para reaproveitar
import styles from "../novo/form.module.css";
import { Save, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMedicamentoPage({ params }: PageProps) {
  const { id } = await params;

  const medicamento = await prisma.medicamento.findUnique({
    where: { id },
  });

  if (!medicamento) {
    notFound();
  }

  // Bind do ID para a Server Action saber quem atualizar
  const updateWithId = updateMedicamento.bind(null, id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Medicamento</h1>

      <form action={updateWithId} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nome" className={styles.label}>
            Nome
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            required
            defaultValue={medicamento.nome}
            className={styles.input}
          />
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
              defaultValue={medicamento.preco}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estoque" className={styles.label}>
              Estoque
            </label>
            <input
              type="number"
              name="estoque"
              id="estoque"
              required
              defaultValue={medicamento.estoque}
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
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
