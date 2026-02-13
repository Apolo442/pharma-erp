"use server";

import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/logger";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de Validação
const MedicamentoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 letras."),
  descricao: z.string().optional(),
  categoria: z.string().min(1, "Selecione uma categoria."),
  preco: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  estoque: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
});

// Tipo exportado para o frontend (useActionState)
export type MedicamentoState = {
  message: string | null;
  errors?: {
    nome?: string[];
    categoria?: string[];
    descricao?: string[];
    preco?: string[];
    estoque?: string[];
  };
};

// --- CREATE ---
export async function createMedicamento(
  prevState: MedicamentoState,
  formData: FormData
): Promise<MedicamentoState> {
  const validatedFields = MedicamentoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    categoria: formData.get("categoria"),
    preco: formData.get("preco"),
    estoque: formData.get("estoque"),
  });

  if (!validatedFields.success) {
    return {
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const novoItem = await prisma.medicamento.create({
      data: validatedFields.data,
    });

    await registrarLog(
      "CREATE",
      "MEDICAMENTO",
      `Criou item: ${novoItem.nome} (${novoItem.categoria}) | Estoque: ${novoItem.estoque}`,
      novoItem.id
    );
  } catch (error) {
    console.error("Erro ao criar:", error);
    return {
      message: "Erro ao criar item. Verifique se o banco está conectado.",
    };
  }

  revalidatePath("/dashboard/estoque");
  redirect("/dashboard/estoque");
}

// --- UPDATE ---
export async function updateMedicamento(
  id: string,
  prevState: MedicamentoState,
  formData: FormData
): Promise<MedicamentoState> {
  const validatedFields = MedicamentoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    categoria: formData.get("categoria"),
    preco: formData.get("preco"),
    estoque: formData.get("estoque"),
  });

  if (!validatedFields.success) {
    return {
      message: "Erro de validação.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const newData = validatedFields.data;

  try {
    const oldData = await prisma.medicamento.findUnique({ where: { id } });
    if (!oldData) return { message: "Item não encontrado." };

    const changes: string[] = [];
    if (oldData.nome !== newData.nome)
      changes.push(`Nome: ${oldData.nome} -> ${newData.nome}`);
    if (oldData.categoria !== newData.categoria)
      changes.push(`Categoria: ${oldData.categoria} -> ${newData.categoria}`);
    if (oldData.preco !== newData.preco)
      changes.push(`Preço: ${oldData.preco} -> ${newData.preco}`);
    if (oldData.estoque !== newData.estoque)
      changes.push(`Estoque: ${oldData.estoque} -> ${newData.estoque}`);

    // Compara descrições tratando null como string vazia
    const oldDesc = oldData.descricao || "";
    const newDesc = newData.descricao || "";
    if (oldDesc !== newDesc) changes.push("Descrição alterada");

    if (changes.length > 0) {
      await prisma.medicamento.update({
        where: { id },
        data: newData,
      });

      await registrarLog(
        "UPDATE",
        "MEDICAMENTO",
        `Alterações: ${changes.join(" | ")}`,
        id
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return { message: "Erro ao atualizar item." };
  }

  revalidatePath("/dashboard/estoque");
  redirect("/dashboard/estoque");
}

// --- DELETE ---
export async function deleteMedicamento(id: string) {
  try {
    await prisma.medicamento.delete({ where: { id } });
    await registrarLog("DELETE", "MEDICAMENTO", `Removeu item ID: ${id}`);
    revalidatePath("/dashboard/estoque");
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
}
