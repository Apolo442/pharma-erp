import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteMedicamento } from "./actions";
import styles from "./medicamentos.module.css";
import { Plus, Package, Pencil, Eye } from "lucide-react";
import { DeleteButton } from "@/app/components/ui/DeleteButton";

export default async function MedicamentosPage() {
  const medicamentos = await prisma.medicamento.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Medicamentos</h1>
        <Link href="/dashboard/medicamentos/novo" className={styles.addButton}>
          <Plus size={20} />
          Novo Medicamento
        </Link>
      </header>

      <div className={styles.tableContainer}>
        {medicamentos.length === 0 ? (
          <div className={styles.emptyState}>
            <Package
              size={48}
              style={{ margin: "0 auto 1rem", opacity: 0.5 }}
            />
            <p>Nenhum medicamento cadastrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th style={{ width: "140px" }}>Ações</th>{" "}
                {/* Aumentei um pouco a largura */}
              </tr>
            </thead>
            <tbody>
              {medicamentos.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.nome}</div>
                    {/* TRUNCAR DESCRIÇÃO GRANDE */}
                    {item.descricao && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#888",
                          maxWidth: "300px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.descricao}
                      </div>
                    )}
                  </td>
                  <td>
                    {item.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>{item.estoque} un</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* --- NOVO BOTÃO: DETALHES --- */}
                      <Link
                        href={`/dashboard/medicamentos/${item.id}/detalhes`}
                        className={styles.deleteButton} // Reusando a classe base de botão
                        style={{ color: "var(--theme-text-muted)" }} // Cor neutra (Cinza)
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </Link>

                      {/* Botão de Editar */}
                      <Link
                        href={`/dashboard/medicamentos/${item.id}`}
                        className={styles.deleteButton}
                        style={{ color: "var(--theme-primary)" }} // Teal
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </Link>

                      {/* Botão de Excluir */}
                      <DeleteButton
                        action={deleteMedicamento}
                        id={item.id}
                        className={styles.deleteButton}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
