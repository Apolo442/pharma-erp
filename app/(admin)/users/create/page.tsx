"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";
import styles from "./create-user.module.css";

const initialState = {
  message: null,
};

export default function CreateUserPage() {
  // useActionState gerencia o retorno da Server Action e o estado de loading (isPending)
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastrar Novo Usuário</h1>

      {state.message && <div className={styles.error}>{state.message}</div>}

      <form action={formAction} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nome</label>
          <input
            name="name"
            type="text"
            required
            className={styles.input}
            placeholder="Nome completo"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            required
            className={styles.input}
            placeholder="email@farmacia.com"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Senha</label>
          <input
            name="password"
            type="password"
            required
            className={styles.input}
            placeholder="******"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Função</label>
          <select name="role" className={styles.select}>
            <option value="USER">Farmacêutico (Padrão)</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <button type="submit" className={styles.button} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Usuário"}
        </button>
      </form>
    </div>
  );
}
