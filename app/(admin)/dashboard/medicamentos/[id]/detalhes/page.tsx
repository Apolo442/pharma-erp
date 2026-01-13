import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./detalhes.module.css";
import { ArrowLeft, Pencil, Package, DollarSign } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalhesMedicamentoPage({ params }: PageProps) {
  const { id } = await params;

  const medicamento = await prisma.medicamento.findUnique({
    where: { id },
  });

  if (!medicamento) {
    notFound();
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div className={styles.container}>
        {/* Cabeçalho */}
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{medicamento.nome}</h1>
            <span className={styles.idLabel}>ID: {medicamento.id}</span>
          </div>
        </header>

        {/* Informações Rápidas (Preço e Estoque) */}
        <div className={styles.grid}>
          <div className={styles.infoBlock}>
            <span className={styles.label}>
              <DollarSign
                size={14}
                style={{ display: "inline", marginRight: 4 }}
              />
              Preço Unitário
            </span>
            <div className={styles.value}>
              {medicamento.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.label}>
              <Package
                size={14}
                style={{ display: "inline", marginRight: 4 }}
              />
              Estoque Atual
            </span>
            <div className={styles.value} style={{ color: "#334155" }}>
              {medicamento.estoque}{" "}
              <span style={{ fontSize: "1rem" }}>unidades</span>
            </div>
          </div>
        </div>

        {/* Descrição Completa */}
        <div className={styles.descriptionSection}>
          <span className={styles.label}>Descrição / Bula Simplificada</span>
          <div className={styles.descriptionText}>
            {medicamento.descricao ||
              "Nenhuma descrição fornecida para este medicamento."}
          </div>
        </div>

        {/* Ações */}
        <div className={styles.actions}>
          <Link href="/dashboard/medicamentos" className={styles.backButton}>
            <ArrowLeft
              size={18}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            Voltar
          </Link>

          <Link
            href={`/dashboard/medicamentos/${medicamento.id}`}
            className={styles.editButton}
          >
            <Pencil size={18} />
            Editar Dados
          </Link>
        </div>
      </div>
    </div>
  );
}
