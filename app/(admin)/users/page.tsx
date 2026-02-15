import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./users.module.css";
import { Plus, Trash2, Pencil } from "lucide-react";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function UsersPage() {
  // Busca todos os usuários ordenados por data
  const users = await prisma.user.findMany({
    where: { ativo: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestão de Usuários</h1>
        <Link href="/users/create" className={styles.addButton}>
          <Plus size={20} />
          Novo Usuário
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      user.role === "ADMIN"
                        ? styles.adminBadge
                        : styles.userBadge
                    }`}
                  >
                    {user.role === "ADMIN" ? "Administrador" : "Farmacêutico"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className={styles.actions}>
                  {/* Botão de Editar */}
                  <Link
                    href={`/users/${user.id}/edit`}
                    className={`${styles.iconButton} ${styles.editIcon}`}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </Link>

                  {/* Botão de Excluir */}
                  <DeleteUserButton id={user.id} />
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
