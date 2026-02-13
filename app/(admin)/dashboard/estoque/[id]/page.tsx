import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditMedicamentoForm from "./edit-form"; // Importe o novo componente
import styles from "../novo/form.module.css";

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Medicamento</h1>
      {/* Passamos o medicamento para o Client Component */}
      <EditMedicamentoForm medicamento={medicamento} />
    </div>
  );
}
