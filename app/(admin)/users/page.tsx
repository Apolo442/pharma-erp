import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteUser } from "@/app/actions/users";
import styles from "./users.module.css";
import { Plus, Trash2, Pencil } from "lucide-react";

export default async function UsersPage() {
  // Busca todos os usuários ordenados por data
  const users = await prisma.user.findMany({
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
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      className={`${styles.iconButton} ${styles.deleteIcon}`}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
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
