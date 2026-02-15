"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import styles from "./dialog.module.css";
import { AlertCircle, HelpCircle, Info } from "lucide-react";

type DialogType = "alert" | "confirm" | "prompt";

// Define a estrutura do estado interno do modal
interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  defaultValue?: string;
  resolve: (value: unknown) => void; // A função que destrava a Promise
  isDanger?: boolean; // Para pintar o botão de vermelho
}

interface DialogContextProps {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (
    message: string,
    title?: string,
    isDanger?: boolean,
  ) => Promise<boolean>;
  prompt: (
    message: string,
    defaultValue?: string,
    title?: string,
  ) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    resolve: () => {},
  });

  const [promptValue, setPromptValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input automaticamente quando for um prompt
  useEffect(() => {
    if (dialog.isOpen && dialog.type === "prompt" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialog.isOpen, dialog.type]);

  // AS FUNÇÕES EXPOSTAS:
  const alert = (message: string, title = "Aviso") => {
    return new Promise<void>((resolve) => {
      setDialog({ isOpen: true, type: "alert", title, message, resolve });
    });
  };

  const confirm = (
    message: string,
    title = "Confirmação",
    isDanger = false,
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        type: "confirm",
        title,
        message,
        isDanger,
        resolve,
      });
    });
  };

  const prompt = (
    message: string,
    defaultValue = "",
    title = "Entrada Necessária",
  ) => {
    setPromptValue(defaultValue);
    return new Promise<string | null>((resolve) => {
      setDialog({
        isOpen: true,
        type: "prompt",
        title,
        message,
        defaultValue,
        resolve,
      });
    });
  };

  // AS FUNÇÕES INTERNAS DE FECHAMENTO:
  const handleClose = (value: unknown) => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    dialog.resolve(value); // Resolve a Promise com a resposta do usuário
  };

  return (
    <DialogContext.Provider value={{ alert, confirm, prompt }}>
      {children}

      {/* RENDERIZAÇÃO DO MODAL */}
      {dialog.isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              {dialog.type === "alert" && (
                <Info size={24} className={styles.icon} />
              )}
              {dialog.type === "confirm" && (
                <HelpCircle
                  size={24}
                  className={dialog.isDanger ? styles.iconDanger : styles.icon}
                />
              )}
              {dialog.type === "prompt" && (
                <AlertCircle size={24} className={styles.icon} />
              )}
              <span className={styles.title}>{dialog.title}</span>
            </div>

            <div className={styles.body}>
              {dialog.message}

              {dialog.type === "prompt" && (
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.input}
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClose(promptValue);
                    if (e.key === "Escape") handleClose(null);
                  }}
                />
              )}
            </div>

            <div className={styles.footer}>
              {dialog.type !== "alert" && (
                <button
                  className={`${styles.btn} ${styles.btnCancel}`}
                  onClick={() =>
                    handleClose(dialog.type === "prompt" ? null : false)
                  }
                >
                  Cancelar
                </button>
              )}

              <button
                className={`${styles.btn} ${dialog.isDanger ? styles.btnDanger : styles.btnConfirm}`}
                onClick={() =>
                  handleClose(dialog.type === "prompt" ? promptValue : true)
                }
              >
                {dialog.type === "alert" ? "OK" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

// Hook customizado para facilitar o uso nas telas
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context)
    throw new Error("useDialog deve ser usado dentro de um DialogProvider");
  return context;
};
