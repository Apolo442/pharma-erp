import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteMedicamento } from "./actions"; // Importa a action de deletar
import styles from "./medicamentos.module.css";
import { Plus, Trash2, Package, Pencil } from "lucide-react";

export default async function MedicamentosPage() {
  // Busca os dados diretamente do banco (Server Component)
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
                <th style={{ width: "100px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.nome}</div>
                    {item.descricao && (
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
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
                      {/* Botão de Editar */}
                      <Link
                        href={`/dashboard/medicamentos/${item.id}`}
                        className={styles.deleteButton} // Usando mesma classe base para tamanho
                        style={{ color: "var(--theme-primary)" }} // Sobrescrevendo cor para azul/teal
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </Link>

                      {/* Botão de Excluir (Já existente) */}
                      <form action={deleteMedicamento.bind(null, item.id)}>
                        <button
                          type="submit"
                          className={styles.deleteButton}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </form>
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
