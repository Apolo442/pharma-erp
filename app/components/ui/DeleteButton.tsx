"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  action: (id: string) => Promise<void>; // A Server Action
  id: string; // O ID do item
  className?: string;
}

export function DeleteButton({ action, id, className }: DeleteButtonProps) {
  return (
    <form
      action={action.bind(null, id)}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          "TEM CERTEZA? Esta ação removerá o item permanentemente do banco de dados."
        );
        if (!confirmed) {
          e.preventDefault(); // Cancela o envio se o user clicar em "Cancelar"
        }
      }}
    >
      <button
        type="submit"
        className={className}
        title="Excluir Permanentemente"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}
