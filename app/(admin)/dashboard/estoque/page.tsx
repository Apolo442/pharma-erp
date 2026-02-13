import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteMedicamento } from "./actions";
import styles from "./medicamentos.module.css";
import { Plus, Package, Pencil, Eye } from "lucide-react";
import SearchBar from "./search";
import { DeleteButton } from "@/app/components/ui/DeleteButton";

export default async function EstoquePage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";

  // Busca Filtrada (Compatível com SQLite)
  const produtos = await prisma.medicamento.findMany({
    where: {
      OR: [{ nome: { contains: query } }, { categoria: { contains: query } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="flex flex-col gap-4 mb-4 w-full md:w-auto">
          <h1 className={styles.title}>Gerenciar Estoque</h1>
          <SearchBar />
        </div>

        <Link href="/dashboard/estoque/novo" className={styles.addButton}>
          <Plus size={20} />
          Novo Item
        </Link>
      </header>

      <div className={styles.tableContainer}>
        {produtos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            {/* CORREÇÃO AQUI: Trocamos " por &quot; */}
            <p>Nenhum produto encontrado para &quot;{query}&quot;.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th style={{ width: "140px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--theme-text-main)",
                      }}
                    >
                      {item.nome}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        backgroundColor: "var(--color-white-C)",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      {item.categoria}
                    </span>
                  </td>
                  <td>
                    {item.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td
                    style={{
                      color:
                        item.estoque < 10 ? "var(--color-danger)" : "inherit",
                      fontWeight: item.estoque < 10 ? "bold" : "normal",
                    }}
                  >
                    {item.estoque} un
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        href={`/dashboard/estoque/${item.id}/detalhes`}
                        className={styles.iconButton}
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        href={`/dashboard/estoque/${item.id}`}
                        className={styles.iconButton}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </Link>

                      <DeleteButton
                        action={deleteMedicamento}
                        id={item.id}
                        className={styles.iconButton}
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
