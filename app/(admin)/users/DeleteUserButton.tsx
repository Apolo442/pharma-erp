"use client";

import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/actions/users"; // Sua server action
import { useDialog } from "@/app/components/ui/DialogProvider";
import styles from "./users.module.css";
import { useState } from "react";

export function DeleteUserButton({ id }: { id: string }) {
  const { confirm, alert } = useDialog();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    // Usa seu Dialog customizado
    const querDeletar = await confirm(
      "Tem certeza que deseja remover este usuário? Se ele tiver vendas, será apenas inativado.",
      "Excluir Usuário",
      true, // isDanger = true (Botão vermelho)
    );

    if (!querDeletar) return;

    setLoading(true);
    // Chama a Server Action passando a string direta, não FormData
    const res = await deleteUser(id);
    setLoading(false);

    if (res.success) {
      await alert(res.message, "Sucesso");
    } else {
      await alert(res.message, "Erro");
    }
  }

  return (
    <button
      type="button" // Importante ser type button para não tentar submeter form
      onClick={handleDelete}
      disabled={loading}
      className={`${styles.iconButton} ${styles.deleteIcon}`}
      title="Excluir"
    >
      <Trash2 size={18} className={loading ? "opacity-50" : ""} />
    </button>
  );
}
