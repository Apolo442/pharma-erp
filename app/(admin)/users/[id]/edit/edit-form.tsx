"use client";

import { useActionState } from "react";
import { updateUser } from "@/app/actions/users";
// Importando o CSS da pasta irmã "create" para não duplicar código
import styles from "../../create/create-user.module.css";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export default function EditUserForm({ user }: { user: UserData }) {
  const [state, formAction, isPending] = useActionState(updateUser, {
    message: null,
  });

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={user.id} />

      {state.message && <div className={styles.error}>{state.message}</div>}

      <div className={styles.inputGroup}>
        <label className={styles.label}>Nome</label>
        <input
          name="name"
          defaultValue={user.name || ""}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Email</label>
        <input
          name="email"
          defaultValue={user.email}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Nova Senha (opcional)</label>
        <input
          name="password"
          type="password"
          className={styles.input}
          placeholder="Deixe vazio para manter a atual"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Função</label>
        <select name="role" defaultValue={user.role} className={styles.select}>
          <option value="USER">Farmacêutico</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Salvando..." : "Atualizar Usuário"}
      </button>
    </form>
  );
}
